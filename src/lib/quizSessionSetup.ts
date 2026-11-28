import type { CpnsQuotaTrack, QuestionItem, QuizSessionConfig } from "../types";

export const MAX_CUSTOM_QUESTIONS = 120;
export const MAX_CUSTOM_MINUTES = 180;

export type QuizPreference =
  | { mode: "simulation"; cpnsQuotaTrack?: CpnsQuotaTrack; cpnsSensoryNetra?: boolean }
  | { mode: "custom"; questions: number; minutes: number; cpnsQuotaTrack?: CpnsQuotaTrack; cpnsSensoryNetra?: boolean };
export type QuizPreferences = Partial<Record<QuizSessionConfig["source"], QuizPreference>>;

function parseCpnsTrack(value: unknown): CpnsQuotaTrack | undefined {
  if (value === "cumlaude_diaspora" || value === "disabilitas_papua" || value === "umum") {
    return value === "umum" ? undefined : value;
  }
  return undefined;
}

export function parseQuizPreferences(raw: string | null): QuizPreferences {
  const preferences: QuizPreferences = {};
  try {
    const saved = JSON.parse(raw ?? "{}");
    for (const source of ["exercise", "assessment"] as const) {
      const value = saved?.[source];
      const cpnsQuotaTrack = source === "assessment" ? parseCpnsTrack(value?.cpnsQuotaTrack) : undefined;
      const cpnsSensoryNetra = source === "assessment" && value?.cpnsSensoryNetra === true ? true : undefined;
      if (value?.mode === "simulation") {
        preferences[source] = {
          mode: "simulation",
          ...(cpnsQuotaTrack ? { cpnsQuotaTrack } : {}),
          ...(cpnsSensoryNetra ? { cpnsSensoryNetra } : {}),
        };
      }
      if (value?.mode === "custom" && Number.isInteger(value.questions) && value.questions >= 1
          && value.questions <= MAX_CUSTOM_QUESTIONS && Number.isInteger(value.minutes)
          && value.minutes >= 0 && value.minutes <= MAX_CUSTOM_MINUTES) {
        preferences[source] = {
          mode: "custom",
          questions: value.questions,
          minutes: value.minutes,
          ...(cpnsQuotaTrack ? { cpnsQuotaTrack } : {}),
          ...(cpnsSensoryNetra ? { cpnsSensoryNetra } : {}),
        };
      }
    }
  } catch {
    // Fall back to per-package defaults.
  }
  return preferences;
}

export function applyQuizPreferences(preset: QuizSessionConfig, preferences: QuizPreferences): QuizSessionConfig {
  const preference = preferences[preset.source];
  const mode = preference?.mode ?? (preset.source === "exercise" ? "custom" : "simulation");
  const configured = configureQuizSession(preset, mode,
    preference?.mode === "custom" ? preference.questions : preset.totalQuestions,
    preference?.mode === "custom" ? preference.minutes : preset.timeLimit);
  if (preset.source !== "assessment" || !preference) return configured;

  const catLower = preset.category.toLowerCase();
  const isSkd = catLower.includes("skd") || catLower.includes("seleksi kompetensi dasar");
  if (!isSkd) return configured;

  const next: QuizSessionConfig = { ...configured };
  if (preference.cpnsQuotaTrack) next.cpnsQuotaTrack = preference.cpnsQuotaTrack;
  if (preference.cpnsSensoryNetra) {
    next.cpnsSensoryNetra = true;
    if (mode === "simulation" && preset.totalQuestions === 110 && preset.timeLimit === 100) {
      next.timeLimit = 130;
    }
  }
  return next;
}

export function configureQuizSession(
  preset: QuizSessionConfig,
  mode: NonNullable<QuizSessionConfig["sessionMode"]>,
  totalQuestions: number,
  timeLimit: number,
): QuizSessionConfig {
  if (mode === "simulation") return { ...preset, sessionMode: mode };
  const count = Math.max(1, Math.min(Math.round(totalQuestions) || 1, MAX_CUSTOM_QUESTIONS));
  const minutes = Math.max(0, Math.min(Math.round(timeLimit) || 0, MAX_CUSTOM_MINUTES));
  const topics = preset.assessmentCategories ?? [];
  let categoryQuotas: Record<string, number> | undefined;
  if (topics.length) {
    const weight = topics.reduce((sum, topic) => sum + (preset.categoryQuotas?.[topic] ?? 1), 0);
    const quotas = topics.map((topic) => {
      const ideal = count * (preset.categoryQuotas?.[topic] ?? 1) / weight;
      return { topic, quota: Math.floor(ideal), remainder: ideal % 1 };
    });
    let unassigned = count - quotas.reduce((sum, entry) => sum + entry.quota, 0);
    for (const entry of [...quotas].sort((a, b) => b.remainder - a.remainder)) {
      if (unassigned-- <= 0) break;
      entry.quota++;
    }
    categoryQuotas = Object.fromEntries(quotas.map(({ topic, quota }) => [topic, quota]));
  }
  return { ...preset, totalQuestions: count, timeLimit: minutes, categoryQuotas, sessionMode: mode };
}

export function matchesQuestionQuotas(
  questions: Pick<QuestionItem, "type">[], quotas: Record<string, number>,
): boolean {
  const counts = new Map<string, number>();
  questions.forEach(({ type }) => counts.set(type, (counts.get(type) ?? 0) + 1));
  return questions.length === Object.values(quotas).reduce((a, b) => a + b, 0)
    && Object.entries(quotas).every(([type, count]) => (counts.get(type) ?? 0) === count);
}

export function getRemainingSeconds(deadline: number | null, now = Date.now()): number | null {
  return deadline === null ? null : Math.max(0, Math.ceil((deadline - now) / 1000));
}

const TBS_SECTIONS = [
  { label: "Penalaran Verbal", first: 0, last: 22, endsAtMinute: 30 },
  { label: "Penalaran Kuantitatif", first: 23, last: 47, endsAtMinute: 70 },
  { label: "Pemecahan Masalah", first: 48, last: 59, endsAtMinute: 90 },
];

export function getSimulationSection(config: QuizSessionConfig, startedAt: number, now: number) {
  if (config.sessionMode !== "simulation" || config.category !== "Simulasi Resmi TBS LPDP") return undefined;
  const elapsed = Math.max(0, now - startedAt);
  const section = TBS_SECTIONS.find(({ endsAtMinute }) => elapsed < endsAtMinute * 60_000) ?? TBS_SECTIONS[2];
  return { ...section, deadline: startedAt + section.endsAtMinute * 60_000 };
}
