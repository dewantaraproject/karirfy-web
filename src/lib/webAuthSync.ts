export interface KarirfyWebQrPayload {
  app: "karirfy";
  version: "1.0";
  action: "login";
  sessionId: string;
  channel: string;
  origin: string;
  encKey: string;
  createdAt: number;
}

export interface EncryptedQrSessionEnvelope {
  ciphertext: string;
  iv: string;
  senderName?: string;
  senderDevice?: string;
  tier?: string;
  careerGoal?: string;
  sentAt: number;
}

export interface GrantedSessionTokens {
  access_token: string;
  refresh_token: string;
}

export const QR_SESSION_TTL_SECONDS = 120;

export function buildQrChannelName(sessionId: string): string {
  return `karirfy-qr-${sessionId}`;
}

export function generateQrSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (value.length % 4)) % 4);
  const binary = atob(padded);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
}

export function generateQrEncryptionKey(): string {
  const raw = new Uint8Array(32);
  crypto.getRandomValues(raw);
  return toBase64Url(raw);
}

async function importAesKey(base64UrlKey: string, usages: KeyUsage[]): Promise<CryptoKey> {
  const keyBytes = fromBase64Url(base64UrlKey);
  if (keyBytes.length !== 32) {
    throw new Error("Kunci enkripsi sesi QR tidak valid.");
  }
  return crypto.subtle.importKey("raw", keyBytes.buffer as ArrayBuffer, { name: "AES-GCM" }, false, usages);
}

export async function encryptSessionTokensForQr(
  tokens: GrantedSessionTokens,
  encKey: string,
): Promise<{ ciphertext: string; iv: string }> {
  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);
  const key = await importAesKey(encKey, ["encrypt"]);
  const plaintext = new TextEncoder().encode(JSON.stringify(tokens));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);
  return {
    ciphertext: toBase64Url(new Uint8Array(encrypted)),
    iv: toBase64Url(iv),
  };
}

export async function decryptSessionTokensFromQr(
  ciphertext: string,
  iv: string,
  encKey: string,
): Promise<GrantedSessionTokens> {
  const key = await importAesKey(encKey, ["decrypt"]);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64Url(iv) as BufferSource },
    key,
    fromBase64Url(ciphertext) as BufferSource,
  );
  const parsed = JSON.parse(new TextDecoder().decode(decrypted)) as Partial<GrantedSessionTokens>;
  if (!parsed?.access_token || !parsed?.refresh_token) {
    throw new Error("Payload token sesi tidak lengkap.");
  }
  return {
    access_token: String(parsed.access_token),
    refresh_token: String(parsed.refresh_token),
  };
}

export function createWebLoginQrPayload(origin: string): KarirfyWebQrPayload {
  const sessionId = generateQrSessionId();
  return {
    app: "karirfy",
    version: "1.0",
    action: "login",
    sessionId,
    channel: buildQrChannelName(sessionId),
    origin,
    encKey: generateQrEncryptionKey(),
    createdAt: Date.now(),
  };
}

export function parseWebDashboardQr(raw: string): KarirfyWebQrPayload | null {
  try {
    const trimmed = raw.trim();
    const parsed = JSON.parse(trimmed) as Partial<KarirfyWebQrPayload>;
    if (
      parsed.app !== "karirfy" ||
      parsed.version !== "1.0" ||
      parsed.action !== "login" ||
      typeof parsed.sessionId !== "string" ||
      !parsed.sessionId ||
      typeof parsed.channel !== "string" ||
      !parsed.channel.startsWith("karirfy-qr-") ||
      typeof parsed.origin !== "string" ||
      typeof parsed.encKey !== "string" ||
      !parsed.encKey ||
      typeof parsed.createdAt !== "number"
    ) {
      return null;
    }
    return parsed as KarirfyWebQrPayload;
  } catch {
    return null;
  }
}

export function isWebDashboardQrExpired(payload: KarirfyWebQrPayload, now = Date.now()): boolean {
  return now - payload.createdAt > QR_SESSION_TTL_SECONDS * 1000;
}
