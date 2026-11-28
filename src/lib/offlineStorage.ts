const DB_NAME = "karirfy_offline_db";
const storeNames = ["questions", "meta", "pending_attempts"] as const;
type StoreName = typeof storeNames[number];

type Store = {
  get<T>(key: string): Promise<T | undefined>;
  getAll<T>(): Promise<T[]>;
  getByType<T>(type: string): Promise<T[]>;
  put(value: unknown, key: string): Promise<unknown>;
  delete(key: string): Promise<unknown>;
  clear(): Promise<unknown>;
};

let database: Promise<IDBDatabase> | undefined;
const memory = new Map(storeNames.map((name) => [name, new Map<string, unknown>()]));

function openDatabase(factory: IDBFactory): Promise<IDBDatabase> {
  database ??= new Promise<IDBDatabase>((resolve, reject) => {
    const request = factory.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      db.createObjectStore("questions").createIndex("type", "type");
      db.createObjectStore("meta");
      db.createObjectStore("pending_attempts");
    };
    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => {
        db.close();
        database = undefined;
      };
      resolve(db);
    };
    request.onerror = () => reject(request.error);
  }).catch((error) => {
    database = undefined;
    throw error;
  });
  return database;
}

function result<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function offlineTransaction<T>(
  names: StoreName[],
  mode: IDBTransactionMode,
  run: (store: (name: StoreName) => Store) => T | Promise<T>,
): Promise<T> {
  const factory = typeof window !== "undefined" ? window.indexedDB : undefined;
  if (!factory) {
    return run((name) => {
      const store = memory.get(name)!;
      return {
        get: async <V>(key: string) => store.get(key) as V | undefined,
        getAll: async <V>() => [...store.values()] as V[],
        getByType: async <V>(type: string) => [...store.values()].filter(
          (value) => (value as { type?: string }).type === type,
        ) as V[],
        put: async (value, key) => store.set(key, value),
        delete: async (key) => store.delete(key),
        clear: async () => store.clear(),
      };
    });
  }

  const db = await openDatabase(factory);
  const transaction = db.transaction(names, mode);
  const completed = new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error ?? new Error("Penyimpanan offline dibatalkan."));
  });
  const getStore = (name: StoreName): Store => {
    const store = transaction.objectStore(name);
    return {
      get: (key) => result(store.get(key)),
      getAll: () => result(store.getAll()),
      getByType: (type) => result(store.index("type").getAll(type)),
      put: (value, key) => result(store.put(value, key)),
      delete: (key) => result(store.delete(key)),
      clear: () => result(store.clear()),
    };
  };
  let output: Promise<T>;
  try {
    output = Promise.resolve(run(getStore));
  } catch (error) {
    output = Promise.reject(error);
  }
  const checked = output.catch((error) => {
    try { transaction.abort(); } catch { /* Already closed. */ }
    throw error;
  });
  const [value] = await Promise.all([checked, completed]);
  return value;
}
