import type { AttemptRecord } from "../types";

export const STARTER_DAILY_EXERCISE_LIMIT = 3;
export const STARTER_DAILY_ASSESSMENT_LIMIT = 1;
export const GUEST_DAILY_EXERCISE_LIMIT = 1;
export const GUEST_DAILY_ASSESSMENT_LIMIT = 0;

export const LAUNCH_OPEN_WEEK_START_ISO = "2026-11-28T00:00:00+07:00";
export const LAUNCH_OPEN_WEEK_END_ISO = "2026-12-05T23:59:59+07:00";

const WIB_OFFSET_MS = 7 * 3_600_000;
const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;

export type QuotaLockReason =
  | "guest_assessment"
  | "guest_exercise_limit"
  | "starter_exercise_limit"
  | "starter_assessment_limit"
  | "weekend_review"
  | "offline_pack";

export interface LaunchOpenWeekStatus {
  active: boolean;
  daysLeft: number;
  hoursLeft: number;
  endDateLabel: string;
}

export interface DailyQuotaStatus {
  isPro: boolean;
  isGuest: boolean;
  isLaunchPromo?: boolean;
  wibDateKey: string;
  exerciseUsed: number;
  exerciseLimit: number | null;
  exerciseRemaining: number | null;
  assessmentUsed: number;
  assessmentLimit: number | null;
  assessmentRemaining: number | null;
  resetLabel: string;
}

export function getLaunchOpenWeekStatus(now: Date = new Date()): LaunchOpenWeekStatus {
  const nowMs = now.getTime();
  const startMs = new Date(LAUNCH_OPEN_WEEK_START_ISO).getTime();
  const endMs = new Date(LAUNCH_OPEN_WEEK_END_ISO).getTime();
  if (!Number.isFinite(nowMs) || nowMs < startMs || nowMs > endMs) {
    return {
      active: false,
      daysLeft: 0,
      hoursLeft: 0,
      endDateLabel: "5 Des 2026",
    };
  }
  const remainingMs = Math.max(0, endMs - nowMs);
  const daysLeft = Math.max(1, Math.ceil(remainingMs / DAY_MS));
  const hoursLeft = Math.max(1, Math.ceil(remainingMs / HOUR_MS));
  return {
    active: true,
    daysLeft,
    hoursLeft,
    endDateLabel: "5 Des 2026",
  };
}

export function getWibDateKey(dateOrIso: Date | string = new Date()): string {
  const date = typeof dateOrIso === "string" ? new Date(dateOrIso) : dateOrIso;
  const ms = Number.isNaN(date.getTime()) ? Date.now() : date.getTime();
  return new Date(ms + WIB_OFFSET_MS).toISOString().slice(0, 10);
}

export function resolveEffectiveTier(
  rawTier?: string | null,
  isPremium?: boolean,
  premiumExpiryDate?: string | null,
): string {
  if (premiumExpiryDate) {
    const exp = new Date(premiumExpiryDate);
    if (!Number.isNaN(exp.getTime()) && exp.getTime() < Date.now()) {
      return "Starter";
    }
  }

  const normalized = (rawTier || "").trim();
  if (normalized) return normalized;
  return isPremium ? "Pro" : "Starter";
}

export function isProActive(
  rawTier?: string | null,
  isPremium?: boolean,
  premiumExpiryDate?: string | null,
): boolean {
  return ["pro", "raja"].includes(
    resolveEffectiveTier(rawTier, isPremium, premiumExpiryDate).toLowerCase(),
  );
}

export function hasEffectiveProAccess(
  rawTier?: string | null,
  isPremium?: boolean,
  premiumExpiryDate?: string | null,
  isGuest = false,
  now: Date = new Date(),
): boolean {
  if (isProActive(rawTier, isPremium, premiumExpiryDate)) return true;
  return !isGuest && getLaunchOpenWeekStatus(now).active;
}

function hasLegacyPaidTier(
  rawTier?: string | null,
  isPremium?: boolean,
  premiumExpiryDate?: string | null,
): boolean {
  const lower = resolveEffectiveTier(rawTier, isPremium, premiumExpiryDate).toLowerCase();
  if (["pro", "raja", "starter pass", "pass", "ksatria"].includes(lower)) return true;
  return lower.includes("fokus") || lower.includes("panglima");
}

export function isQuotaExemptAttempt(
  attempt: Pick<AttemptRecord, "attempt_type" | "subject_category">,
): boolean {
  const cat = (attempt.subject_category || "").trim().toLowerCase();
  if (!cat) return false;
  return (
    cat.startsWith("tantangan harian") ||
    cat.startsWith("diagnostik ") ||
    cat.startsWith("evaluasi") ||
    cat.startsWith("drill") ||
    cat.startsWith("ketahanan fokus kraepelin · sprint pemanasan")
  );
}

export function computeDailyQuotaStatus(params: {
  rawTier?: string | null;
  isPremium?: boolean;
  premiumExpiryDate?: string | null;
  isGuest?: boolean;
  attempts: AttemptRecord[];
  now?: Date;
}): DailyQuotaStatus {
  const now = params.now ?? new Date();
  const wibDateKey = getWibDateKey(now);
  const isGuest = Boolean(params.isGuest);
  const paidUnlimited =
    !isGuest &&
    (isProActive(params.rawTier, params.isPremium, params.premiumExpiryDate) ||
      hasLegacyPaidTier(params.rawTier, params.isPremium, params.premiumExpiryDate));
  const promoActive = !isGuest && !paidUnlimited && getLaunchOpenWeekStatus(now).active;
  const unlimited = paidUnlimited || promoActive;

  let exerciseUsed = 0;
  let assessmentUsed = 0;

  for (const attempt of params.attempts) {
    if (isQuotaExemptAttempt(attempt)) continue;
    if (getWibDateKey(attempt.created_at) !== wibDateKey) continue;
    if (attempt.attempt_type === "assessment") {
      assessmentUsed += 1;
    } else {
      exerciseUsed += 1;
    }
  }

  if (unlimited) {
    return {
      isPro: true,
      isGuest: false,
      isLaunchPromo: promoActive,
      wibDateKey,
      exerciseUsed,
      exerciseLimit: null,
      exerciseRemaining: null,
      assessmentUsed,
      assessmentLimit: null,
      assessmentRemaining: null,
      resetLabel: promoActive
        ? "Pekan Peluncuran Gratis · s/d 5 Des"
        : "Tanpa batas harian",
    };
  }

  const exerciseLimit = isGuest ? GUEST_DAILY_EXERCISE_LIMIT : STARTER_DAILY_EXERCISE_LIMIT;
  const assessmentLimit = isGuest ? GUEST_DAILY_ASSESSMENT_LIMIT : STARTER_DAILY_ASSESSMENT_LIMIT;

  return {
    isPro: false,
    isGuest,
    isLaunchPromo: false,
    wibDateKey,
    exerciseUsed,
    exerciseLimit,
    exerciseRemaining: Math.max(0, exerciseLimit - exerciseUsed),
    assessmentUsed,
    assessmentLimit,
    assessmentRemaining: Math.max(0, assessmentLimit - assessmentUsed),
    resetLabel: "Reset pukul 00.00 WIB",
  };
}

export function canStartMeteredSession(
  quota: DailyQuotaStatus,
  source: "exercise" | "assessment",
  options?: {
    isDailySprint?: boolean;
    isMistakeDrill?: boolean;
    isDiagnostic?: boolean;
    isWeekendTryout?: boolean;
  },
): { allowed: boolean; reason?: QuotaLockReason } {
  if (quota.isPro) return { allowed: true };
  if (
    options?.isDailySprint ||
    options?.isMistakeDrill ||
    options?.isDiagnostic ||
    options?.isWeekendTryout
  ) {
    return { allowed: true };
  }

  if (source === "assessment") {
    if (quota.isGuest) {
      return { allowed: false, reason: "guest_assessment" };
    }
    if (quota.assessmentRemaining !== null && quota.assessmentRemaining <= 0) {
      return { allowed: false, reason: "starter_assessment_limit" };
    }
    return { allowed: true };
  }

  if (quota.exerciseRemaining !== null && quota.exerciseRemaining <= 0) {
    return {
      allowed: false,
      reason: quota.isGuest ? "guest_exercise_limit" : "starter_exercise_limit",
    };
  }
  return { allowed: true };
}

export function checkModuleAccess(
  rawTier: string | null | undefined,
  isPremium: boolean,
  premiumExpiryDate: string | null | undefined,
  _source: "exercise" | "assessment",
  _categoryName: string,
): boolean {
  const effectiveTier = resolveEffectiveTier(rawTier, isPremium, premiumExpiryDate).toLowerCase();
  if (!effectiveTier) return false;
  return true;
}

export function formatTierBadge(
  rawTier?: string | null,
  isPremium?: boolean,
  premiumExpiryDate?: string | null,
  isGuest = false,
  now: Date = new Date(),
): string {
  if (isGuest) return "Mode Tamu · 1 Latihan/Hari";
  const effective = resolveEffectiveTier(rawTier, isPremium, premiumExpiryDate);
  const lower = effective.toLowerCase();
  if (lower === "pro" || lower === "raja") return "Pro · Akses Penuh";
  if ((lower === "starter" || lower === "pejuang") && getLaunchOpenWeekStatus(now).active) {
    return "Launch Pass · Pro Gratis 7 Hari";
  }
  if (lower === "starter" || lower === "pejuang") return "Starter Gratis · 3+1/Hari";
  return `${effective} Aktif`;
}
