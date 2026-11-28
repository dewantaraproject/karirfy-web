import type { CategoryBreakdownItem, QuestionItem, QuizSessionConfig, SkillId, StudySession, StudyTrack, WeekendTrack } from "../types";
import { resolveTrackKey, toLocalISO } from "./curriculumRoadmap";
import { KIPRAH_STORAGE_KEYS } from "./sessionCleanup";
import type { AgendaItem } from "./selectionCalendar";

export const STUDY_TRACKS: StudyTrack[] = ["CPNS", "BUMN", "Bank Indonesia", "PPPK", "Kedinasan", "Beasiswa LPDP"];
const WEEKEND_FALLBACK_TRACKS: WeekendTrack[] = ["CPNS", "BUMN", "Bank Indonesia", "Beasiswa LPDP"];
const DIAGNOSTIC_COUNT = 5;

export const STUDY_TOPICS = {
  CPNS: ["National Foundation", "Quantitative Reasoning", "Situational Judgement"],
  BUMN: ["Verbal Reasoning", "Logical Reasoning", "Work Personality"],
  "Bank Indonesia": ["Quantitative Reasoning", "BI Essential", "Monetary Policy"],
  PPPK: ["Work Personality", "Situational Judgement", "Government & Public Administration"],
  Kedinasan: ["National Foundation", "Quantitative Reasoning", "Abstract Reasoning"],
  "Beasiswa LPDP": ["TBS Penalaran Verbal", "TBS Penalaran Kuantitatif", "TBS Pemecahan Masalah"],
} satisfies Record<StudyTrack, string[]>;

const TOPIC_NAMES: Record<string, string> = {
  "TBS Penalaran Verbal": "TBS Penalaran Verbal",
  "TBS Penalaran Kuantitatif": "TBS Penalaran Kuantitatif",
  "TBS Pemecahan Masalah": "TBS Pemecahan Masalah",
  "National Foundation": "Wawasan Kebangsaan",
  "Government & Public Administration": "Tata Kelola Publik",
  "Indonesian History": "Sejarah Indonesia",
  "Bahasa Indonesia": "TWK Bahasa Indonesia",
  "Verbal Reasoning": "Penalaran Verbal",
  "Quantitative Reasoning": "Penalaran Kuantitatif",
  "Logical Reasoning": "Penalaran Logis",
  "Abstract Reasoning": "Penalaran Abstrak",
  "Numerical Matrix": "Numerical Matrix",
  "Aljabar": "Aljabar Visual",
  "Analisis Visual": "Analisis Visual",
  "Situational Judgement": "Penilaian Situasi (SJT)",
  "Work Personality": "Kepribadian Kerja",
  "Attention to Detail": "Ketelitian",
  "Behavioral Competencies": "Kompetensi Perilaku",
  "Grammar & Structure": "Grammar & Structure",
  "Vocabulary & Usage": "Kosakata Inggris",
  "Reading Comprehension": "Reading Comprehension",
  "Writing & Expression": "Ekspresi Tertulis",
  "Business English": "Business English",
  "BI Essential": "Dasar Kebanksentralan",
  "BI Institutional Framework": "Kelembagaan BI",
  "Monetary Policy": "Kebijakan Moneter",
  "Macroprudential Policy": "Makroprudensial",
  "Payment Systems": "Sistem Pembayaran",
  "BI Strategic Role": "Peran Strategis BI",
  "Fundamental Economics": "Ekonomi Dasar",
  "Accounting Principles": "Prinsip Akuntansi",
  "Corporate Governance": "Tata Kelola Korporasi",
  "Business Law": "Hukum Bisnis",
  "Contemporary Issues": "Isu Ekonomi Terkini",
  "World Geography & Events": "Geografi & Geopolitik",
  "Science & Technology Basics": "Sains & Teknologi",
  "Problem Solving": "Pemecahan Masalah",
  "Case Reasoning": "Analisis Kasus",
};

export function studyTopicName(topic: string) {
  return TOPIC_NAMES[topic] ?? topic;
}

export function getStudyTrack(careerGoal: string): StudyTrack {
  return STUDY_TRACKS.find((track) => track === resolveTrackKey(careerGoal)) ?? "CPNS";
}

export function getWeekendTrackFallback(careerGoal: string): WeekendTrack {
  const track = getStudyTrack(careerGoal);
  if (WEEKEND_FALLBACK_TRACKS.includes(track as WeekendTrack)) return track as WeekendTrack;
  return "CPNS";
}

export interface FocusPlan {
  date: string;
  origin: "diagnostic" | "tryout";
  baseline: CategoryBreakdownItem[];
  secondsPerQuestion: number;
  completed: Partial<Record<number, CategoryBreakdownItem[]>>;
  benchmarkIds?: Record<string, string[]>;
}

export type FocusPlans = Partial<Record<StudyTrack, FocusPlan>>;

export const SHARED_SKILLS = {
  verbal: {
    name: "Tarik kesimpulan dari bacaan",
    topics: {
      CPNS: "Verbal Reasoning",
      BUMN: "Verbal Reasoning",
      "Bank Indonesia": "Verbal Reasoning",
      PPPK: "Verbal Reasoning",
      Kedinasan: "Verbal Reasoning",
      "Beasiswa LPDP": "TBS Penalaran Verbal",
    },
  },
  numeracy: {
    name: "Ubah angka jadi keputusan",
    topics: {
      CPNS: "Quantitative Reasoning",
      BUMN: "Quantitative Reasoning",
      "Bank Indonesia": "Quantitative Reasoning",
      PPPK: "Problem Solving",
      Kedinasan: "Quantitative Reasoning",
      "Beasiswa LPDP": "TBS Penalaran Kuantitatif",
    },
  },
  patterns: {
    name: "Temukan pola dan aturan",
    topics: {
      CPNS: "Abstract Reasoning",
      BUMN: "Logical Reasoning",
      "Bank Indonesia": "Abstract Reasoning",
      PPPK: "Situational Judgement",
      Kedinasan: "Abstract Reasoning",
      "Beasiswa LPDP": "TBS Pemecahan Masalah",
    },
  },
} satisfies Record<SkillId, { name: string; topics: Record<StudyTrack, string> }>;

export const SKILL_IDS = Object.keys(SHARED_SKILLS) as SkillId[];

export interface SkillPractice {
  track: StudyTrack;
  date: string;
  percentage: number;
  total: number;
}

export type SkillPractices = Partial<Record<SkillId, SkillPractice>>;

export interface RadarTarget {
  name: string;
  date: string;
  checklist: number[];
}

export interface StagePractice {
  answer: string;
  rubric: number[];
}

export const APPLICATION_STAGES = [
  "Persiapan",
  "Administrasi",
  "Tes Tulis",
  "Wawancara",
  "Pengumuman",
  "Diterima",
  "Evaluasi",
] as const;

export type ApplicationStage = (typeof APPLICATION_STAGES)[number];

export interface JobApplicationEntry {
  id: string;
  institution: string;
  roleTitle: string;
  track: StudyTrack;
  stage: ApplicationStage;
  nextDate: string;
  cvVersionId?: string;
  notes: string;
  updatedAt: string;
}

export interface PreparationState {
  plans: FocusPlans;
  skills: SkillPractices;
  targets: Partial<Record<StudyTrack, RadarTarget>>;
  stage: Partial<Record<StudyTrack, Record<number, StagePractice>>>;
  agenda?: AgendaItem[];
  applications?: JobApplicationEntry[];
}

export function createApplicationId(existing: JobApplicationEntry[] = []): string {
  const used = new Set(existing.map((item) => item.id));
  let seq = existing.length + 1;
  const stamp = Date.now().toString(36);
  let id = `app-${stamp}-${seq}`;
  while (used.has(id)) {
    seq += 1;
    id = `app-${stamp}-${seq}`;
  }
  return id;
}

export function upsertJobApplication(
  list: JobApplicationEntry[] | undefined,
  entry: JobApplicationEntry,
): JobApplicationEntry[] {
  const current = list ?? [];
  const exists = current.some((item) => item.id === entry.id);
  if (exists) {
    return current.map((item) => (item.id === entry.id ? entry : item));
  }
  return [entry, ...current];
}

export function removeJobApplication(
  list: JobApplicationEntry[] | undefined,
  id: string,
): JobApplicationEntry[] {
  return (list ?? []).filter((item) => item.id !== id);
}

export const EMPTY_PREPARATION: PreparationState = { plans: {}, skills: {}, targets: {}, stage: {} };

export function getNextRadarTarget(targets: PreparationState["targets"], today: string) {
  return STUDY_TRACKS.flatMap((track) => {
    const target = targets[track];
    return target?.date && target.date >= today ? [{ track, date: target.date }] : [];
  }).sort((a, b) => a.date.localeCompare(b.date))[0];
}

export function loadPreparation(): PreparationState {
  try {
    return { ...EMPTY_PREPARATION, ...JSON.parse(localStorage.getItem(KIPRAH_STORAGE_KEYS.preparation) ?? "{}") };
  } catch {
    return EMPTY_PREPARATION;
  }
}

export function savePreparation(preparation: PreparationState): void {
  try {
    localStorage.setItem(KIPRAH_STORAGE_KEYS.preparation, JSON.stringify(preparation));
  } catch {
    // The current session can still use its in-memory progress.
  }
}

export function getSkillConfig(skill: SkillId, track: StudyTrack): QuizSessionConfig {
  const topic = SHARED_SKILLS[skill].topics[track];
  return {
    source: "exercise", category: topic, title: studyTopicName(topic),
    totalQuestions: 5, timeLimit: 0, studySession: { kind: "skill", track, skill },
  };
}

function getBenchmarkConfig(track: StudyTrack, title: string): QuizSessionConfig {
  const topics = STUDY_TOPICS[track];
  return {
    source: "assessment", category: track, title,
    totalQuestions: topics.length * DIAGNOSTIC_COUNT, timeLimit: 15,
    assessmentCategories: topics,
    categoryQuotas: Object.fromEntries(topics.map((topic) => [topic, DIAGNOSTIC_COUNT])),
  };
}

export function getDiagnosticConfig(track: StudyTrack): QuizSessionConfig {
  return {
    ...getBenchmarkConfig(track, `Diagnostik ${track}`),
    studySession: { track, kind: "diagnostic" },
  };
}

function dateAfter(date: string, days: number): string {
  const day = new Date(`${date}T12:00:00`);
  day.setDate(day.getDate() + days);
  return toLocalISO(day);
}

export interface FocusDay {
  date: string;
  planDate: string;
  number: number;
  label: string;
  topic?: string;
  timed: boolean;
  done: boolean;
  benchmarkIds?: Record<string, string[]>;
}

export function buildFocusDays(plan: FocusPlan): FocusDay[] {
  const [first, second] = plan.baseline;
  const steps = [
    { label: "Pahami pola soal", topic: first.type, timed: false },
    { label: "Perkuat topik kedua", topic: second.type, timed: false },
    { label: "Uji ritme pengerjaan", topic: first.type, timed: true },
    { label: "Kerjakan dengan batas waktu", topic: second.type, timed: true },
    { label: "Latih topik prioritas", topic: first.type, timed: false },
    { label: "Latih topik kedua", topic: second.type, timed: true },
    { label: "Ukur ulang dengan soal baru", timed: true },
  ];
  return steps.map((step, index) => ({
    ...step, date: dateAfter(plan.date, index + 1), planDate: plan.date,
    number: index + 1, done: Boolean(plan.completed[index + 1]), benchmarkIds: plan.benchmarkIds,
  }));
}

export function getOpenFocusDay(days: FocusDay[], today: string): FocusDay | undefined {
  const next = days.find((day) => !day.done);
  return next && next.date <= today ? next : undefined;
}

export function getFocusConfig(track: StudyTrack, day: FocusDay): QuizSessionConfig {
  const studySession = { track, kind: "focus" as const, planDate: day.planDate, day: day.number };
  return day.topic ? {
    source: "exercise", category: day.topic, title: `Fokus Hari ${day.number} · ${studyTopicName(day.topic)} · ${track}`,
    totalQuestions: 8, timeLimit: day.timed ? 8 : 0, studySession,
    excludeQuestionIds: Object.values(day.benchmarkIds ?? {}).flat(),
  } : {
    ...getBenchmarkConfig(track, `Ukur Ulang ${track}`), requireFreshQuestions: true,
    benchmarkIds: day.benchmarkIds, studySession,
  };
}

export function applyStudyResult(
  plans: FocusPlans, session: StudySession, breakdown: CategoryBreakdownItem[], secondsPerQuestion: number, today: string,
  questions: QuestionItem[] = [],
): FocusPlans {
  const { track } = session;
  const current = plans[track];
  if (session.kind === "skill") return plans;
  if (session.kind === "focus") {
    if (!current || current.date !== session.planDate) return plans;
    const next = getOpenFocusDay(buildFocusDays(current), today);
    if (!next || next.number !== session.day) return plans;
    const topics = next.topic ? [next.topic] : STUDY_TOPICS[track];
    const completed = breakdown.filter((item) => topics.includes(item.type) && item.total >= (next.topic ? 1 : DIAGNOSTIC_COUNT));
    if (completed.length !== topics.length) return plans;
    return { ...plans, [track]: { ...current, completed: { ...current.completed, [session.day]: completed } } };
  }

  if (session.kind === "tryout" && current && !current.completed[7]) return plans;
  const baseline = breakdown
    .filter((item) => STUDY_TOPICS[track].includes(item.type) && item.total >= DIAGNOSTIC_COUNT)
    .sort((a, b) => a.percentage - b.percentage || (b.avgSeconds ?? 0) - (a.avgSeconds ?? 0));
  if (baseline.length !== STUDY_TOPICS[track].length) return plans;
  const benchmarkIds = Object.fromEntries(STUDY_TOPICS[track].map((topic) => [
    topic, questions.filter((q) => q.type === topic && q.benchmarkPartnerId).map((q) => q.benchmarkPartnerId!),
  ]));
  const paired = Object.values(benchmarkIds).every((ids) => ids.length === DIAGNOSTIC_COUNT);
  return { ...plans, [track]: {
    date: today, origin: session.kind, baseline, secondsPerQuestion, completed: {},
    benchmarkIds: paired ? benchmarkIds : undefined,
  } };
}
