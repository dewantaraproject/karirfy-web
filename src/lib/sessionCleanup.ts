import { setOfflineAttemptOwner } from "./offlineSyncService";
import { clearCvExportCache } from "./cvFiles";
import { setStudyVaultOwner } from "./studyVaultSyncService";

export const KIPRAH_STORAGE_KEYS = {
  theme: "kiprah_theme",
  quizFontSize: "karirfy_quiz_font_size",
  reviewPrompt: "karirfy_review_prompt_v1",
  guestMode: "kiprah_guest_mode",
  onboarded: "kiprah_onboarded_v1",
  examPlan: "kiprah_exam_plan",
  guestProfile: "kiprah_guest_profile",
  guestAttempts: "kiprah_guest_attempts",
  readArtifacts: "kiprah_read_artifacts",
  savedQuestions: "kiprah_saved_questions_v1",
  seenQuestions: "karirfy_seen_questions_v1",
  preparation: "karirfy_study_preparation_v1",
  quizPreferences: "karirfy_quiz_preferences_v1",
  topicSessions: "karirfy_topic_sessions_v1",
  cvDraft: "karirfy_cv_draft_v1",
  cvCollection: "karirfy_cv_collection_v1",
  starStudio: "karirfy_star_studio_v1",
  dailyTodosPrefix: "kiprah_daily_todos_",
  linkedWebSessions: "karirfy_linked_web_sessions_v1",
} as const;

export function onboardedKeyForUser(userId?: string | null): string {
  const clean = userId && userId !== "guest" ? userId : "guest";
  return `karirfy_onboarded_${clean}`;
}

export function clearAllLocalUserSessionData(options?: {
  preserveTheme?: boolean;
  preserveGuestMode?: boolean;
  preserveAuthSession?: boolean;
}): void {
  if (typeof window === "undefined" || !window.localStorage) return;

  const preservedKeys = new Set<string>();
  if (options?.preserveTheme !== false) {
    preservedKeys.add(KIPRAH_STORAGE_KEYS.theme);
    preservedKeys.add(KIPRAH_STORAGE_KEYS.quizFontSize);
  }
  if (options?.preserveGuestMode) {
    preservedKeys.add(KIPRAH_STORAGE_KEYS.guestMode);
  }

  const toRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (preservedKeys.has(key)) continue;
    if (
      options?.preserveAuthSession &&
      (key.startsWith("sb-") || key.startsWith("karirfy_onboarded_"))
    ) {
      continue;
    }

    if (
      key.startsWith("karirfy_") ||
      key.startsWith("kiprah_") ||
      key.startsWith("dewantara_") ||
      key.startsWith("sb-")
    ) {
      toRemove.push(key);
    }
  }

  for (const k of toRemove) {
    try {
      localStorage.removeItem(k);
    } catch {
      // ignore storage errors
    }
  }

  try {
    sessionStorage.clear();
  } catch {
    // ignore storage errors
  }
}

export async function performSessionTeardown(options?: {
  preserveTheme?: boolean;
}): Promise<void> {
  clearAllLocalUserSessionData({ preserveTheme: options?.preserveTheme ?? true });
  await Promise.all([
    setOfflineAttemptOwner(null, true),
    Promise.resolve(setStudyVaultOwner(null)),
    clearCvExportCache(),
  ]);
}
