import { createClient, type Session, type User } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://bgcwktmkrhvwygwmruce.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnY3drdG1rcmh2d3lnd21ydWNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUyODAzNDQsImV4cCI6MjExMDg1NjM0NH0.QnOtw0YqvAsfHa_vgcW4c1LwuWhcPpkwbuLst6wOeKw";

export const KARIRFY_WEB_URL = "https://karirfy-web.dewantaraproject-id.workers.dev";
export const KARIRFY_APP_STORE_URL =
  "https://apps.apple.com/id/app/karirfy-persiapan-karier/id6837918250";

export const KARIRFY_PRIVACY_URL = `${KARIRFY_WEB_URL}/privacy`;
export const KARIRFY_TERMS_URL = `${KARIRFY_WEB_URL}/terms`;
export const KARIRFY_SUPPORT_URL = `${KARIRFY_WEB_URL}/support`;

export const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
  DEFAULT_SUPABASE_URL;
const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && !supabaseUrl.includes("placeholder"),
);

export const authStorageKey = `sb-${new URL(supabaseUrl).hostname.split(".")[0]}-auth-token`;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: authStorageKey,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export function readOfflineAuthUser(owner?: string): User | null {
  if (!owner || typeof navigator === "undefined" || navigator.onLine !== false) return null;
  try {
    const session = JSON.parse(localStorage.getItem(authStorageKey) ?? "null") as Session | null;
    return session?.refresh_token && session.user?.id === owner ? session.user : null;
  } catch {
    return null;
  }
}

export function withTimeout<T>(
  promise: Promise<T> | PromiseLike<T>,
  ms = 12000,
  timeoutMessage = "Permintaan jaringan melebihi batas waktu. Periksa koneksi internet Anda.",
): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(timeoutMessage)), ms);
  });

  return Promise.race([
    Promise.resolve(promise).finally(() => clearTimeout(timer)),
    timeoutPromise,
  ]);
}

export async function withRetryTimeout<T>(
  operation: () => Promise<T>,
  ms = 12000,
  maxRetries = 1,
  timeoutMessage = "Permintaan jaringan melebihi batas waktu.",
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await withTimeout(operation(), ms, timeoutMessage);
    } catch (err: unknown) {
      attempt += 1;
      const msg = err instanceof Error ? err.message.toLowerCase() : "";
      const isRetryable =
        msg.includes("batas waktu") ||
        msg.includes("timed out") ||
        msg.includes("network") ||
        msg.includes("failed to fetch") ||
        msg.includes("abort");

      if (attempt <= maxRetries && isRetryable) {
        await new Promise((r) => setTimeout(r, 300));
        continue;
      }
      throw err;
    }
  }
}

export function getAuthRedirectUrl(): string {
  if (typeof window === "undefined") return `${KARIRFY_WEB_URL}/login`;
  return `${window.location.origin.replace(/\/+$/, "")}/login`;
}

export async function signInWithEmailPassword(email: string, password: string) {
  const { data, error } = await withRetryTimeout(
    () =>
      supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      }),
    14000,
    1,
    "Masuk gagal karena koneksi lambat. Coba lagi.",
  );
  if (error) throw error;
  return data;
}

export async function signUpWithEmailPassword(
  email: string,
  password: string,
  fullName: string,
) {
  const { data, error } = await withRetryTimeout(
    () =>
      supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: getAuthRedirectUrl(),
          data: {
            name: fullName.trim() || "Pembelajar",
          },
        },
      }),
    14000,
    1,
    "Pendaftaran melebihi batas waktu. Coba lagi.",
  );
  if (error) throw error;
  return data;
}

export async function verifyEmailSignupOtp(email: string, token: string) {
  const { data, error } = await withTimeout(
    supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: token.replace(/\s+/g, ""),
      type: "signup",
    }),
    15000,
  );
  if (error) throw error;
  return data;
}

export async function resendEmailSignupOtp(email: string) {
  const { data, error } = await withTimeout(
    supabase.auth.resend({
      type: "signup",
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: getAuthRedirectUrl(),
      },
    }),
    15000,
  );
  if (error) throw error;
  return data;
}

export async function sendPasswordReset(email: string) {
  const { data, error } = await withTimeout(
    supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: getAuthRedirectUrl(),
    }),
    15000,
  );
  if (error) throw error;
  return data;
}

export async function signInWithAppleWeb() {
  const { data, error } = await withTimeout(
    supabase.auth.signInWithOAuth({
      provider: "apple",
      options: { redirectTo: getAuthRedirectUrl() },
    }),
    15000,
  );
  if (error) throw error;
  return data;
}

export async function signInWithGoogleWeb() {
  const { data, error } = await withTimeout(
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: getAuthRedirectUrl() },
    }),
    15000,
  );
  if (error) throw error;
  return data;
}

export async function signOutSupabase() {
  await withTimeout(supabase.auth.signOut({ scope: "local" }), 8000);
}

export async function getSafeSession(): Promise<{
  session: Session | null;
  user: User | null;
}> {
  try {
    const { data } = await withTimeout(supabase.auth.getSession(), 3500);
    return {
      session: data.session ?? null,
      user: data.session?.user ?? null,
    };
  } catch {
    return { session: null, user: null };
  }
}

export async function deleteRemoteAccount(expectedUserId: string): Promise<void> {
  const { data, error } = await withTimeout(supabase.auth.getUser(), 15000);
  if (error || !expectedUserId || data.user?.id !== expectedUserId) {
    throw new Error(
      "Identitas akun berubah. Silakan masuk ulang sebelum menghapus akun.",
    );
  }

  let deleted = false;
  try {
    const fnRes = await withTimeout(
      supabase.functions.invoke("delete-account", {
        body: { expectedUserId },
      }),
      30000,
    );
    if (!fnRes.error && fnRes.data?.deleted === true) {
      deleted = true;
    }
  } catch {
    // fallback to RPC
  }

  if (!deleted) {
    const rpcRes = await withTimeout(
      supabase.rpc("delete_user_account"),
      25000,
    );
    if (rpcRes.error) {
      throw new Error(
        rpcRes.error.message ||
          "Penghapusan akun di server gagal. Coba lagi nanti.",
      );
    }
  }

  await withTimeout(supabase.auth.signOut({ scope: "local" }), 6000).catch(() => {});
}
