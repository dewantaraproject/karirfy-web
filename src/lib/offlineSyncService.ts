import type { AttemptRecord, PendingOfflineAttempt, ProfileRecord } from "../types";
import { offlineTransaction } from "./offlineStorage";
import { QUIZ_DRAFT_KEY } from "./quizDraft";
import { supabase } from "./supabase";

const PROFILE_KEY = "study_profile";
type OfflineProfile = Pick<ProfileRecord,
  "id" | "careerGoal" | "target_accuracy" | "tier" | "is_premium" | "premium_expiry_date">;

interface OfflineSession {
  userId: string | null;
  controller: AbortController;
  ready: Promise<void>;
  inFlight?: Promise<AttemptRecord[]>;
  queuedDuringFlush?: boolean;
}

let currentSession: OfflineSession = {
  userId: null, controller: new AbortController(), ready: Promise.resolve(),
};

export function newOfflineAttemptId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function setOfflineAttemptOwner(userId: string | null, clear = false): Promise<void> {
  const previous = currentSession;
  if (!clear && previous.userId === userId) return previous.ready;
  previous.controller.abort();
  const ready = previous.ready.then(async () => {
    if (clear || previous.userId) {
      await offlineTransaction(["pending_attempts", "meta"], "readwrite", (store) => Promise.all([
        store("pending_attempts").clear(), store("meta").delete(PROFILE_KEY), store("meta").delete(QUIZ_DRAFT_KEY),
      ]));
    }
  }).catch((error) => console.warn("[Karirfy] Gagal membersihkan penyimpanan sesi offline:", error));
  currentSession = { userId, controller: new AbortController(), ready };
  return ready;
}

function sessionFor(userId: string): OfflineSession | undefined {
  return currentSession.userId === userId ? currentSession : undefined;
}

export async function saveOfflineProfile(profile: ProfileRecord): Promise<void> {
  const session = sessionFor(profile.id);
  if (!session) return;
  await session.ready;
  const { id, careerGoal, target_accuracy, tier, is_premium, premium_expiry_date } = profile;
  const cached: OfflineProfile = { id, careerGoal, target_accuracy, tier, is_premium, premium_expiry_date };
  await offlineTransaction(["meta"], "readwrite", (store) => {
    if (!session.controller.signal.aborted) return store("meta").put(cached, PROFILE_KEY);
  });
}

export async function getOfflineProfile(userId: string): Promise<OfflineProfile | undefined> {
  const session = sessionFor(userId);
  if (!session) return undefined;
  await session.ready;
  const profile = await offlineTransaction(["meta"], "readonly", (store) => store("meta").get<OfflineProfile>(PROFILE_KEY));
  if (!session.controller.signal.aborted && profile?.id === userId) return profile;
}

export async function enqueueOfflineAttempt(entry: PendingOfflineAttempt): Promise<boolean> {
  const session = sessionFor(entry.userId);
  if (!session || entry.attempt.user_id !== entry.userId || entry.attempt.id !== entry.localAttemptId) return false;
  await session.ready;
  return offlineTransaction(["pending_attempts"], "readwrite", async (store) => {
    if (session.controller.signal.aborted) return false;
    await store("pending_attempts").put(entry, entry.localAttemptId);
    if (session.inFlight) session.queuedDuringFlush = true;
    return !session.controller.signal.aborted;
  });
}

export async function getPendingOfflineAttempts(userId: string): Promise<PendingOfflineAttempt[]> {
  const session = sessionFor(userId);
  if (!session) return [];
  await session.ready;
  const rows = await offlineTransaction(["pending_attempts"], "readonly", (store) =>
    store("pending_attempts").getAll<PendingOfflineAttempt>());
  return session.controller.signal.aborted ? [] : rows.filter((row) => row.userId === userId);
}

export async function uploadOfflineAttempt(entry: PendingOfflineAttempt): Promise<boolean> {
  const session = sessionFor(entry.userId);
  if (!session || (typeof navigator !== "undefined" && navigator.onLine === false)) return false;
  const transaction = new AbortController();
  const signal = session.controller.signal;
  const abort = () => transaction.abort();
  signal.addEventListener("abort", abort, { once: true });
  const timer = setTimeout(abort, 8000);
  try {
    const { error } = await supabase.from("user_attempts")
      .upsert(entry.attempt, { onConflict: "id", ignoreDuplicates: true })
      .abortSignal(transaction.signal);
    if (error || transaction.signal.aborted) return false;
    if (entry.answers.length === 0) return true;

    const saved = await supabase.from("user_attempt_answers").select("question_id")
      .eq("attempt_id", entry.localAttemptId).abortSignal(transaction.signal);
    if (saved.error || transaction.signal.aborted) return false;
    const known = new Set((saved.data ?? []).map(({ question_id }) => String(question_id)));
    const remaining = entry.answers.filter(({ question_id }) => {
      if (known.has(question_id)) return false;
      known.add(question_id);
      return true;
    }).map((answer) => ({ ...answer, attempt_id: entry.localAttemptId }));
    if (remaining.length === 0) return true;

    const insert = (answers: typeof remaining) => supabase.from("user_attempt_answers")
      .insert(answers).abortSignal(transaction.signal);
    const inserted = await insert(remaining);
    if (inserted.error?.code === "23503" || inserted.error?.code === "22P02") {
      // Built-in sample questions may have no row in the online bank.
      const existing = await supabase.from("questions").select("id")
        .in("id", remaining.map(({ question_id }) => question_id)).abortSignal(transaction.signal);
      if (existing.error || transaction.signal.aborted) return false;
      const ids = new Set((existing.data ?? []).map(({ id }) => String(id)));
      const valid = remaining.filter(({ question_id }) => ids.has(question_id));
      return valid.length === 0 || !(await insert(valid)).error;
    }
    return !inserted.error && !transaction.signal.aborted;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
    signal.removeEventListener("abort", abort);
  }
}

export function flushPendingOfflineAttempts(userId: string): Promise<AttemptRecord[]> {
  const session = sessionFor(userId);
  if (!session || (typeof navigator !== "undefined" && navigator.onLine === false)) return Promise.resolve([]);
  if (session.inFlight) return session.inFlight;
  const flush = async () => {
    const synced: AttemptRecord[] = [];
    if (session.controller.signal.aborted) return synced;
    do {
      session.queuedDuringFlush = false;
      for (const entry of await getPendingOfflineAttempts(userId)) {
        if (session.controller.signal.aborted) break;
        if (!await uploadOfflineAttempt(entry) || session.controller.signal.aborted) continue;
        await offlineTransaction(["pending_attempts"], "readwrite", (store) => {
          if (!session.controller.signal.aborted) return store("pending_attempts").delete(entry.localAttemptId);
        });
        synced.push(entry.attempt);
      }
    } while (session.queuedDuringFlush && !session.controller.signal.aborted);
    return synced;
  };
  const crossTabLock = typeof navigator === "undefined" ? undefined : navigator.locks;
  const pending = crossTabLock ? crossTabLock.request("karirfy_attempt_sync", async () => await flush()) : flush();
  const flight = Promise.resolve(pending).catch(() => []).finally(() => { session.inFlight = undefined; });
  session.inFlight = flight;
  return flight;
}
