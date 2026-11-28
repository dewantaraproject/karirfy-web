import { resolveTrackKey, toLocalISO } from "./curriculumRoadmap";
import { studyTopicName } from "./studyPreparation";
import { areAnswersEqual } from "./quizGrading";
import type { TopicSession } from "./topicTrends";

function studyMinutes(seconds: number, sessions: number): number {
  return seconds > 0 ? Math.max(1, Math.round(seconds / 60)) : sessions * 8;
}
import type { AttemptRecord, CpnsQuotaTrack, QuizResultPayload, SavedQuestionEntry } from "../types";
import { buildTopicTrends } from "./topicTrends";

export type TopicTrendEntry = ReturnType<typeof buildTopicTrends>[number];

export interface StreakHabitsSummary {
  currentStreak: number;
  longestStreak: number;
  totalMinutes: number;
  totalQuestions: number;
  sessionsCount: number;
  bestWindow: { label: string; avgScore: number; sessions: number } | null;
}

export interface TrajectoryPoint {
  id: string;
  label: string;
  title: string;
  dateLabel: string;
  score: number;
  correct: number;
  total: number;
  secPerQuestion: number | null;
  attemptType: string;
}

export interface ActivityBucket {
  key: string;
  label: string;
  fullLabel: string;
  questions: number;
  minutes: number;
  sessions: number;
  avgAccuracy: number | null;
}

export interface RadarAxis {
  id: string;
  label: string;
  accuracy: number | null;
  sessions: number;
  recommendedTopic: string;
}

export interface CompetencyRadarSummary {
  axes: RadarAxis[];
  testedCount: number;
  strongest: RadarAxis | null;
  weakest: RadarAxis | null;
}

export type PacingQuadrantKind = "ready" | "slow_accurate" | "fast_error" | "priority";

export interface PacingPoint {
  key: string;
  type: string;
  label: string;
  accuracy: number;
  seconds: number;
  sessions: number;
  quadrant: PacingQuadrantKind;
}

export interface PassingSubtestProjection {
  label: string;
  currentAccuracy: number | null;
  thresholdPct: number;
  status: "ready" | "close" | "below" | "untested";
  drillTopic: string;
}

export interface TrackPassingReadiness {
  trackLabel: string;
  note: string;
  projectedTotalScore: number | null;
  scaleMax: number | null;
  targetPassingScore: number | null;
  subtests: PassingSubtestProjection[];
}

export interface ForensicTimeSink {
  totalTimedSeconds: number;
  wrongSeconds: number;
  wrongCount: number;
  wrongTimeSharePct: number;
  slowestQuestionNumber: number | null;
  slowestSeconds: number;
  slowestTopic: string | null;
}

export interface CalibratedReadinessSummary {
  calibratedScore: number | null;
  band: "siap" | "mendekati" | "fondasi" | "belum";
  bandLabel: string;
  targetSecPerQuestion: number;
  avgSecPerQuestion: number | null;
  hardestMastered: string | null;
  heaviestGap: { type: string; label: string; accuracy: number; weight: number } | null;
  note: string;
}

export interface TimeBenchmarkEntry {
  key: string;
  type: string;
  label: string;
  actualSec: number;
  targetSec: number;
  deltaSec: number;
  status: "hemat" | "pas" | "boros";
  accuracy: number;
}

export const TRACK_TARGET_SECONDS: Record<string, number> = {
  CPNS: 54,
  BUMN: 53,
  "Bank Indonesia": 50,
  PPPK: 55,
  Kedinasan: 54,
  "Beasiswa LPDP": 90,
};

export const TOPIC_DIFFICULTY_WEIGHT: Record<string, number> = {
  "tbs pemecahan masalah": 1.24,
  "tbs penalaran kuantitatif": 1.2,
  "quantitative reasoning": 1.18,
  "numerical matrix": 1.18,
  "monetary policy": 1.16,
  "macroprudential policy": 1.15,
  "abstract reasoning": 1.15,
  "logical reasoning": 1.12,
  "analisis visual": 1.12,
  aljabar: 1.1,
  "bi essential": 1.09,
  "payment systems": 1.09,
  "tbs penalaran verbal": 1.08,
  "reading comprehension": 1.08,
  "case reasoning": 1.08,
  "situational judgement": 1.06,
  "national foundation": 1.04,
  "government & public administration": 1.04,
  "bahasa indonesia": 1.04,
};

const shortDateFormatter = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" });

function shiftISO(iso: string, deltaDays: number): string {
  const dt = new Date(`${iso}T12:00:00`);
  dt.setDate(dt.getDate() + deltaDays);
  return toLocalISO(dt);
}

export function computeStudyStreakAndHabits(
  attempts: AttemptRecord[],
  todayISO: string,
): StreakHabitsSummary {
  const activeDays = new Set<string>();
  let totalMinutes = 0;
  let totalQuestions = 0;

  const windows: Array<{ id: string; label: string; scores: number[] }> = [
    { id: "morning", label: "Pagi (05.00 - 10.59)", scores: [] },
    { id: "noon", label: "Siang (11.00 - 14.59)", scores: [] },
    { id: "afternoon", label: "Sore (15.00 - 18.59)", scores: [] },
    { id: "night", label: "Malam (19.00 - 04.59)", scores: [] },
  ];

  for (const a of attempts) {
    const dt = new Date(a.created_at);
    if (Number.isNaN(dt.getTime())) continue;
    activeDays.add(toLocalISO(dt));
    const total = Math.max(0, Number(a.total_questions) || 0);
    const secs = Math.max(0, Number(a.time_taken_seconds) || 0);
    totalQuestions += total;
    totalMinutes += studyMinutes(secs, 1);

    const hr = dt.getHours();
    const score = Math.round(Number(a.score) || 0);
    if (hr >= 5 && hr < 11) windows[0].scores.push(score);
    else if (hr >= 11 && hr < 15) windows[1].scores.push(score);
    else if (hr >= 15 && hr < 19) windows[2].scores.push(score);
    else windows[3].scores.push(score);
  }

  let currentStreak = 0;
  let cursor = activeDays.has(todayISO)
    ? todayISO
    : activeDays.has(shiftISO(todayISO, -1))
      ? shiftISO(todayISO, -1)
      : "";
  while (cursor && activeDays.has(cursor)) {
    currentStreak += 1;
    cursor = shiftISO(cursor, -1);
  }

  const sortedDays = [...activeDays].sort();
  let longestStreak = 0;
  let running = 0;
  for (let i = 0; i < sortedDays.length; i += 1) {
    if (i === 0 || shiftISO(sortedDays[i - 1], 1) === sortedDays[i]) {
      running += 1;
    } else {
      running = 1;
    }
    if (running > longestStreak) longestStreak = running;
  }

  let bestWindow: StreakHabitsSummary["bestWindow"] = null;
  if (attempts.length >= 3) {
    const populated = windows
      .filter((w) => w.scores.length > 0)
      .map((w) => ({
        label: w.label,
        sessions: w.scores.length,
        avgScore: Math.round(w.scores.reduce((s, v) => s + v, 0) / w.scores.length),
      }))
      .sort((a, b) => (b.sessions >= 2 ? 1 : 0) - (a.sessions >= 2 ? 1 : 0) || b.avgScore - a.avgScore || b.sessions - a.sessions);
    if (populated[0]) bestWindow = populated[0];
  }

  return {
    currentStreak,
    longestStreak,
    totalMinutes,
    totalQuestions,
    sessionsCount: attempts.length,
    bestWindow,
  };
}

export function buildScoreTrajectory(
  attempts: AttemptRecord[],
  filter: "all" | "assessment" | "exercise",
  limit = 12,
): TrajectoryPoint[] {
  const filtered = attempts
    .filter((a) => {
      if (filter === "all") return true;
      return a.attempt_type === filter;
    })
    .filter((a) => !Number.isNaN(new Date(a.created_at).getTime()))
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .slice(-limit);

  return filtered.map((a, idx) => {
    const dt = new Date(a.created_at);
    const total = Math.max(0, Number(a.total_questions) || 0);
    const secs = Number(a.time_taken_seconds);
    return {
      id: a.id,
      label: `S${idx + 1}`,
      title: a.subject_category || "Sesi Latihan",
      dateLabel: shortDateFormatter.format(dt),
      score: Math.min(100, Math.max(0, Math.round(Number(a.score) || 0))),
      correct: Math.max(0, Number(a.correct_answers_count) || 0),
      total,
      secPerQuestion: total > 0 && Number.isFinite(secs) && secs > 0 ? Math.round(secs / total) : null,
      attemptType: a.attempt_type,
    };
  });
}

function summarizeAttemptBucket(items: AttemptRecord[]): Omit<ActivityBucket, "key" | "label" | "fullLabel"> {
  let questions = 0;
  let minutes = 0;
  let gradedQuestions = 0;
  let gradedCorrect = 0;
  for (const a of items) {
    const total = Math.max(0, Number(a.total_questions) || 0);
    const secs = Math.max(0, Number(a.time_taken_seconds) || 0);
    questions += total;
    minutes += studyMinutes(secs, 1);
    if (total > 0 && a.correct_answers_count != null && Number.isFinite(Number(a.correct_answers_count))) {
      gradedQuestions += total;
      gradedCorrect += Math.max(0, Math.min(total, Number(a.correct_answers_count)));
    }
  }
  return {
    questions,
    minutes,
    sessions: items.length,
    avgAccuracy: gradedQuestions > 0 ? Math.round((gradedCorrect / gradedQuestions) * 100) : null,
  };
}

export function buildActivityBuckets(
  attempts: AttemptRecord[],
  period: "daily" | "weekly" | "monthly",
  todayISO: string,
): ActivityBucket[] {
  const today = new Date(`${todayISO}T12:00:00`);
  if (period === "daily") {
    const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const buckets: ActivityBucket[] = [];
    for (let i = 6; i >= 0; i -= 1) {
      const dt = new Date(today);
      dt.setDate(today.getDate() - i);
      const iso = toLocalISO(dt);
      const items = attempts.filter((a) => {
        const ad = new Date(a.created_at);
        return !Number.isNaN(ad.getTime()) && toLocalISO(ad) === iso;
      });
      buckets.push({
        key: iso,
        label: dayNames[dt.getDay()].slice(0, 1),
        fullLabel: `${dayNames[dt.getDay()]}, ${shortDateFormatter.format(dt)}`,
        ...summarizeAttemptBucket(items),
      });
    }
    return buckets;
  }

  if (period === "weekly") {
    const buckets: ActivityBucket[] = [];
    for (let w = 3; w >= 0; w -= 1) {
      const start = new Date(today);
      start.setDate(today.getDate() - (w + 1) * 7 + 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(today);
      end.setDate(today.getDate() - w * 7);
      end.setHours(23, 59, 59, 999);
      const items = attempts.filter((a) => {
        const t = new Date(a.created_at).getTime();
        return Number.isFinite(t) && t >= start.getTime() && t <= end.getTime();
      });
      buckets.push({
        key: `w-${w}`,
        label: `Mg${4 - w}`,
        fullLabel: `${shortDateFormatter.format(start)} - ${shortDateFormatter.format(end)}`,
        ...summarizeAttemptBucket(items),
      });
    }
    return buckets;
  }

  const monthShort = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const buckets: ActivityBucket[] = [];
  for (let m = 5; m >= 0; m -= 1) {
    const dt = new Date(today.getFullYear(), today.getMonth() - m, 1);
    const yr = dt.getFullYear();
    const mo = dt.getMonth();
    const items = attempts.filter((a) => {
      const ad = new Date(a.created_at);
      return !Number.isNaN(ad.getTime()) && ad.getFullYear() === yr && ad.getMonth() === mo;
    });
    buckets.push({
      key: `${yr}-${mo}`,
      label: monthShort[mo],
      fullLabel: `${monthShort[mo]} ${yr}`,
      ...summarizeAttemptBucket(items),
    });
  }
  return buckets;
}

const RADAR_AXIS_DEFS: Array<{ id: string; label: string; defaultTopic: string; topics: Set<string> }> = [
  {
    id: "verbal",
    label: "Verbal",
    defaultTopic: "Verbal Reasoning",
    topics: new Set(["verbal reasoning", "tbs penalaran verbal"]),
  },
  {
    id: "quant",
    label: "Kuantitatif",
    defaultTopic: "Quantitative Reasoning",
    topics: new Set(["quantitative reasoning", "tbs penalaran kuantitatif", "aljabar", "numerical matrix"]),
  },
  {
    id: "logic",
    label: "Logika",
    defaultTopic: "Logical Reasoning",
    topics: new Set(["logical reasoning", "abstract reasoning", "analisis visual", "tbs pemecahan masalah", "problem solving", "case reasoning"]),
  },
  {
    id: "civic",
    label: "Wawasan",
    defaultTopic: "National Foundation",
    topics: new Set(["national foundation", "government & public administration", "indonesian history", "bahasa indonesia", "world geography & events", "science & technology basics"]),
  },
  {
    id: "psycho",
    label: "Psikometri",
    defaultTopic: "Situational Judgement",
    topics: new Set(["work personality", "situational judgement", "behavioral competencies", "attention to detail"]),
  },
  {
    id: "lang_econ",
    label: "Inggris & Ekonomi",
    defaultTopic: "Reading Comprehension",
    topics: new Set([
      "grammar & structure", "vocabulary & usage", "reading comprehension", "writing & expression", "business english",
      "bi essential", "bi institutional framework", "monetary policy", "macroprudential policy", "payment systems",
      "bi strategic role", "fundamental economics", "accounting principles", "corporate governance", "business law", "contemporary issues",
    ]),
  },
];

export function buildCompetencyRadar(trends: TopicTrendEntry[]): CompetencyRadarSummary {
  const axes: RadarAxis[] = RADAR_AXIS_DEFS.map((def) => {
    const matched = trends.filter((t) => def.topics.has(t.key));
    if (!matched.length) {
      return { id: def.id, label: def.label, accuracy: null, sessions: 0, recommendedTopic: def.defaultTopic };
    }
    const totalSessions = matched.reduce((s, m) => s + m.sessions, 0);
    const weighted = matched.reduce((s, m) => s + m.recent.accuracy * m.sessions, 0);
    const weakestMatch = [...matched].sort((a, b) => a.recent.accuracy - b.recent.accuracy)[0];
    return {
      id: def.id,
      label: def.label,
      accuracy: Math.round(weighted / Math.max(1, totalSessions)),
      sessions: totalSessions,
      recommendedTopic: weakestMatch?.type || def.defaultTopic,
    };
  });

  const tested = axes.filter((a): a is RadarAxis & { accuracy: number } => a.accuracy !== null);
  const sorted = [...tested].sort((a, b) => b.accuracy - a.accuracy);
  return {
    axes,
    testedCount: tested.length,
    strongest: sorted[0] ?? null,
    weakest: sorted.length > 1 ? sorted[sorted.length - 1] : (sorted[0] ?? null),
  };
}

export function buildPacingQuadrants(
  trends: TopicTrendEntry[],
  targetAccuracy: number,
  targetSec = 60,
): PacingPoint[] {
  const points: PacingPoint[] = [];
  for (const t of trends) {
    if (t.recent.seconds == null || !Number.isFinite(t.recent.seconds)) continue;
    const accOk = t.recent.accuracy >= targetAccuracy;
    const speedOk = t.recent.seconds <= targetSec;
    const quadrant: PacingQuadrantKind = accOk && speedOk
      ? "ready"
      : accOk && !speedOk
        ? "slow_accurate"
        : !accOk && speedOk
          ? "fast_error"
          : "priority";
    points.push({
      key: t.key,
      type: t.type,
      label: studyTopicName(t.type),
      accuracy: t.recent.accuracy,
      seconds: t.recent.seconds,
      sessions: t.sessions,
      quadrant,
    });
  }
  return points;
}

function avgGroupAccuracy(trends: TopicTrendEntry[], keys: string[]): number | null {
  const keySet = new Set(keys.map((k) => k.toLowerCase()));
  const matched = trends.filter((t) => keySet.has(t.key));
  if (!matched.length) return null;
  const totalSessions = matched.reduce((s, m) => s + m.sessions, 0);
  const weighted = matched.reduce((s, m) => s + m.recent.accuracy * m.sessions, 0);
  return Math.round(weighted / Math.max(1, totalSessions));
}

function subtestStatus(acc: number | null, thresholdPct: number): PassingSubtestProjection["status"] {
  if (acc === null) return "untested";
  if (acc >= thresholdPct) return "ready";
  if (acc >= thresholdPct - 10) return "close";
  return "below";
}

export function buildTrackPassingReadiness(
  careerGoal: string,
  trends: TopicTrendEntry[],
  cpnsQuotaTrack: CpnsQuotaTrack = "umum",
): TrackPassingReadiness {
  const track = resolveTrackKey(careerGoal);

  if (track === "Beasiswa LPDP") {
    const defs = [
      { label: "Penalaran Verbal", keys: ["tbs penalaran verbal", "verbal reasoning"], thresholdPct: 55, drillTopic: "TBS Penalaran Verbal" },
      { label: "Penalaran Kuantitatif", keys: ["tbs penalaran kuantitatif", "quantitative reasoning"], thresholdPct: 55, drillTopic: "TBS Penalaran Kuantitatif" },
      { label: "Pemecahan Masalah", keys: ["tbs pemecahan masalah", "case reasoning"], thresholdPct: 55, drillTopic: "TBS Pemecahan Masalah" },
    ];
    const subtests = defs.map((d) => {
      const currentAccuracy = avgGroupAccuracy(trends, d.keys);
      return {
        label: d.label,
        currentAccuracy,
        thresholdPct: d.thresholdPct,
        status: subtestStatus(currentAccuracy, d.thresholdPct),
        drillTopic: d.drillTopic,
      };
    });
    const tested = subtests.filter((s) => s.currentAccuracy !== null);
    const projectedTotalScore = tested.length
      ? Math.round((tested.reduce((sum, s) => sum + (s.currentAccuracy ?? 0), 0) / tested.length) * 3)
      : null;
    return {
      trackLabel: "Proyeksi TBS LPDP (Skala 0-300)",
      note: "Estimasi berdasarkan akurasi latihanmu dibanding ambang referensi Reguler 165/300.",
      projectedTotalScore,
      scaleMax: 300,
      targetPassingScore: 165,
      subtests,
    };
  }

  if (track === "BUMN") {
    const defs = [
      { label: "TKD Kognitif", keys: ["verbal reasoning", "quantitative reasoning", "logical reasoning"], thresholdPct: 70, drillTopic: "Quantitative Reasoning" },
      { label: "AKHLAK Core Values", keys: ["work personality", "behavioral competencies", "situational judgement"], thresholdPct: 70, drillTopic: "Work Personality" },
      { label: "Ketelitian & Inggris", keys: ["attention to detail", "reading comprehension", "national foundation"], thresholdPct: 70, drillTopic: "Attention to Detail" },
    ];
    return {
      trackLabel: "Proyeksi Passing Grade BUMN",
      note: "Estimasi kesiapan komponen TKD, AKHLAK, dan Ketelitian terhadap target 70%.",
      projectedTotalScore: null,
      scaleMax: null,
      targetPassingScore: null,
      subtests: defs.map((d) => {
        const currentAccuracy = avgGroupAccuracy(trends, d.keys);
        return {
          label: d.label,
          currentAccuracy,
          thresholdPct: d.thresholdPct,
          status: subtestStatus(currentAccuracy, d.thresholdPct),
          drillTopic: d.drillTopic,
        };
      }),
    };
  }

  if (track === "Bank Indonesia") {
    const defs = [
      { label: "Tes Potensi Dasar", keys: ["verbal reasoning", "quantitative reasoning", "logical reasoning", "abstract reasoning"], thresholdPct: 72, drillTopic: "Quantitative Reasoning" },
      { label: "Kebanksentralan & Ekonomi", keys: ["bi essential", "bi institutional framework", "monetary policy", "macroprudential policy", "payment systems", "fundamental economics"], thresholdPct: 72, drillTopic: "BI Essential" },
      { label: "Bahasa Inggris Bisnis", keys: ["business english", "reading comprehension", "grammar & structure"], thresholdPct: 72, drillTopic: "Business English" },
    ];
    return {
      trackLabel: "Proyeksi Ambang Batas PCPM BI",
      note: "Estimasi kesiapan TPD, Kebanksentralan, dan Bahasa Inggris terhadap target 72%.",
      projectedTotalScore: null,
      scaleMax: null,
      targetPassingScore: null,
      subtests: defs.map((d) => {
        const currentAccuracy = avgGroupAccuracy(trends, d.keys);
        return {
          label: d.label,
          currentAccuracy,
          thresholdPct: d.thresholdPct,
          status: subtestStatus(currentAccuracy, d.thresholdPct),
          drillTopic: d.drillTopic,
        };
      }),
    };
  }

  if (track === "PPPK") {
    const defs = [
      { label: "Manajerial & Sosio Kultural", keys: ["work personality", "behavioral competencies"], thresholdPct: 70, drillTopic: "Work Personality" },
      { label: "Penilaian Situasi (SJT)", keys: ["situational judgement", "problem solving"], thresholdPct: 70, drillTopic: "Situational Judgement" },
      { label: "Tata Kelola Publik", keys: ["government & public administration", "national foundation"], thresholdPct: 70, drillTopic: "Government & Public Administration" },
    ];
    return {
      trackLabel: "Proyeksi Kompetensi PPPK",
      note: "Estimasi kesiapan komponen teknis, manajerial, dan SJT terhadap target 70%.",
      projectedTotalScore: null,
      scaleMax: null,
      targetPassingScore: null,
      subtests: defs.map((d) => {
        const currentAccuracy = avgGroupAccuracy(trends, d.keys);
        return {
          label: d.label,
          currentAccuracy,
          thresholdPct: d.thresholdPct,
          status: subtestStatus(currentAccuracy, d.thresholdPct),
          drillTopic: d.drillTopic,
        };
      }),
    };
  }

  // CPNS & Kedinasan (SKD CAT BKN - KepmenPANRB 674/2026)
  const twkAcc = avgGroupAccuracy(trends, ["national foundation", "government & public administration", "indonesian history", "bahasa indonesia"]);
  const tiuAcc = avgGroupAccuracy(trends, ["verbal reasoning", "quantitative reasoning", "logical reasoning", "abstract reasoning", "numerical matrix", "aljabar", "analisis visual"]);
  const tkpAcc = avgGroupAccuracy(trends, ["work personality", "behavioral competencies", "situational judgement"]);

  const projectedTotalScore =
    twkAcc !== null && tiuAcc !== null && tkpAcc !== null
      ? Math.round((twkAcc / 100) * 150 + (tiuAcc / 100) * 175 + (tkpAcc / 100) * 225)
      : null;

  const isCumLaude = track === "CPNS" && cpnsQuotaTrack === "cumlaude_diaspora";
  const isDisabilitas = track === "CPNS" && cpnsQuotaTrack === "disabilitas_papua";
  const tiuThreshold = isCumLaude ? 49 : isDisabilitas ? 34 : 46;
  const targetPassingScore = isDisabilitas ? 286 : 311;
  const note = isCumLaude
    ? "KepmenPANRB 674/2026 Cum Laude & Diaspora: Kumulatif >= 311/550 dan TIU >= 85/175 (49%)."
    : isDisabilitas
      ? "KepmenPANRB 674/2026 Disabilitas & Papua: Kumulatif >= 286/550 dan TIU >= 60/175 (34%)."
      : "Ambang SKD BKN: TWK >= 65/150 (43%), TIU >= 80/175 (46%), TKP >= 166/225 (74%).";

  return {
    trackLabel: `Proyeksi Passing Grade SKD ${track}`,
    note,
    projectedTotalScore,
    scaleMax: 550,
    targetPassingScore,
    subtests: [
      { label: "TWK", currentAccuracy: twkAcc, thresholdPct: 43, status: subtestStatus(twkAcc, 43), drillTopic: "National Foundation" },
      { label: "TIU", currentAccuracy: tiuAcc, thresholdPct: tiuThreshold, status: subtestStatus(tiuAcc, tiuThreshold), drillTopic: "Quantitative Reasoning" },
      { label: "TKP", currentAccuracy: tkpAcc, thresholdPct: 74, status: subtestStatus(tkpAcc, 74), drillTopic: "Situational Judgement" },
    ],
  };
}

export function computeForensicTimeSink(result: QuizResultPayload): ForensicTimeSink | null {
  const durations = result.questionDurationsSec;
  if (!Array.isArray(durations) || durations.length !== result.questions.length) return null;
  const totalTimedSeconds = durations.reduce((sum, sec) => sum + Math.max(0, Number(sec) || 0), 0);
  if (totalTimedSeconds <= 0) return null;

  let wrongSeconds = 0;
  let wrongCount = 0;
  let slowestQuestionNumber: number | null = null;
  let slowestSeconds = 0;
  let slowestTopic: string | null = null;

  result.questions.forEach((q, idx) => {
    const sec = Math.max(0, Math.round(Number(durations[idx]) || 0));
    const ans = result.userAnswers[idx];
    const hasScores = Boolean(q.scores && Object.keys(q.scores).length > 0);
    const isCorrect = ans
      ? hasScores
        ? (q.scores?.[ans.toLowerCase()] || 0) >= 4
        : areAnswersEqual(ans, q.correct)
      : false;
    if (!isCorrect) {
      wrongCount += 1;
      wrongSeconds += sec;
      if (sec > slowestSeconds) {
        slowestSeconds = sec;
        slowestQuestionNumber = idx + 1;
        slowestTopic = q.type || null;
      }
    }
  });

  return {
    totalTimedSeconds,
    wrongSeconds,
    wrongCount,
    wrongTimeSharePct: Math.round((wrongSeconds / totalTimedSeconds) * 100),
    slowestQuestionNumber,
    slowestSeconds,
    slowestTopic,
  };
}

export function summarizeMistakeBank(entries: SavedQuestionEntry[]) {
  const mistakes = entries.filter((e) => e.isMistake);
  return {
    total: mistakes.length,
    wrong: mistakes.filter((e) => e.failureReason === "wrong" || !e.failureReason).length,
    skipped: mistakes.filter((e) => e.failureReason === "skipped").length,
    suboptimalSjt: mistakes.filter((e) => e.failureReason === "suboptimal_sjt").length,
    bookmarks: entries.filter((e) => e.isBookmarked).length,
  };
}

export function buildTopicTrendBundle(attempts: AttemptRecord[], topicSessions: TopicSession[]) {
  return buildTopicTrends(attempts, topicSessions);
}

export function computeDifficultyCalibratedReadiness(
  trends: TopicTrendEntry[],
  careerGoal: string,
  targetAccuracy: number,
): CalibratedReadinessSummary {
  const track = resolveTrackKey(careerGoal);
  const targetSecPerQuestion = TRACK_TARGET_SECONDS[track] ?? 54;
  if (!trends.length) {
    return {
      calibratedScore: null,
      band: "belum",
      bandLabel: "Belum Diuji",
      targetSecPerQuestion,
      avgSecPerQuestion: null,
      hardestMastered: null,
      heaviestGap: null,
      note: "Estimasi kesiapan berbobot kesulitan soal & tempo latihan dibanding target jalur.",
    };
  }

  let totalWeight = 0;
  let weightedAccSum = 0;
  let timedSessions = 0;
  let weightedSecSum = 0;
  let hardestMasteredEntry: { label: string; weight: number } | null = null;
  let gapCandidate: { type: string; label: string; accuracy: number; weight: number; priority: number } | null = null;

  for (const t of trends) {
    const w = TOPIC_DIFFICULTY_WEIGHT[t.key] ?? 1.0;
    const sess = Math.max(1, t.sessions);
    totalWeight += w * sess;
    weightedAccSum += t.recent.accuracy * w * sess;
    if (t.recent.seconds != null && Number.isFinite(t.recent.seconds)) {
      timedSessions += sess;
      weightedSecSum += t.recent.seconds * sess;
    }
    const label = studyTopicName(t.type);
    if (t.recent.accuracy >= targetAccuracy) {
      if (!hardestMasteredEntry || w > hardestMasteredEntry.weight) {
        hardestMasteredEntry = { label, weight: w };
      }
    } else {
      const priority = (targetAccuracy - t.recent.accuracy) * w;
      if (!gapCandidate || priority > gapCandidate.priority) {
        gapCandidate = { type: t.type, label, accuracy: t.recent.accuracy, weight: w, priority };
      }
    }
  }

  const baseWeightedScore = weightedAccSum / Math.max(1, totalWeight);
  const avgSecPerQuestion = timedSessions > 0 ? Math.round(weightedSecSum / timedSessions) : null;
  let pacingAdjustment = 0;
  if (avgSecPerQuestion !== null) {
    if (avgSecPerQuestion <= targetSecPerQuestion) {
      pacingAdjustment = Math.min(4, Math.round(((targetSecPerQuestion - avgSecPerQuestion) / targetSecPerQuestion) * 10));
    } else {
      pacingAdjustment = -Math.min(8, Math.round(((avgSecPerQuestion - targetSecPerQuestion) / targetSecPerQuestion) * 14));
    }
  }

  const calibratedScore = Math.max(0, Math.min(100, Math.round(baseWeightedScore + pacingAdjustment)));
  const band: CalibratedReadinessSummary["band"] =
    calibratedScore >= targetAccuracy
      ? "siap"
      : calibratedScore >= targetAccuracy - 12
        ? "mendekati"
        : "fondasi";
  const bandLabel = band === "siap" ? "Kompetitif" : band === "mendekati" ? "Mendekati Siap" : "Bangun Fondasi";

  return {
    calibratedScore,
    band,
    bandLabel,
    targetSecPerQuestion,
    avgSecPerQuestion,
    hardestMastered: hardestMasteredEntry?.label ?? null,
    heaviestGap: gapCandidate
      ? { type: gapCandidate.type, label: gapCandidate.label, accuracy: gapCandidate.accuracy, weight: gapCandidate.weight }
      : null,
    note: `Kalibrasi berbobot kesulitan topik terhadap target tempo ${track} (${targetSecPerQuestion} dtk/soal), berbasis data latihan.`,
  };
}

export function buildTimeAllocationBenchmark(
  trends: TopicTrendEntry[],
  careerGoal: string,
  limit = 6,
): TimeBenchmarkEntry[] {
  const track = resolveTrackKey(careerGoal);
  const targetSec = TRACK_TARGET_SECONDS[track] ?? 54;
  return trends
    .filter((t) => t.recent.seconds != null && Number.isFinite(t.recent.seconds))
    .map((t) => {
      const actualSec = Math.round(t.recent.seconds as number);
      const deltaSec = actualSec - targetSec;
      const status: TimeBenchmarkEntry["status"] =
        deltaSec <= -4 ? "hemat" : deltaSec <= 5 ? "pas" : "boros";
      return {
        key: t.key,
        type: t.type,
        label: studyTopicName(t.type),
        actualSec,
        targetSec,
        deltaSec,
        status,
        accuracy: t.recent.accuracy,
      };
    })
    .sort((a, b) => b.deltaSec - a.deltaSec || a.accuracy - b.accuracy)
    .slice(0, limit);
}

export type SessionStaminaStatus = "stabil" | "meningkat" | "turun_stamina" | "terburu_buru";

export interface SessionStaminaInsight {
  status: SessionStaminaStatus;
  label: string;
  firstHalfAccuracy: number;
  secondHalfAccuracy: number;
  accuracyDeltaPct: number;
  firstHalfAvgSec: number | null;
  secondHalfAvgSec: number | null;
  paceDeltaSec: number | null;
  firstHalfCount: number;
  secondHalfCount: number;
  advice: string;
}

export function computeSessionStamina(result: QuizResultPayload): SessionStaminaInsight | null {
  const total = result.questions.length;
  if (total < 6) return null;

  const mid = Math.floor(total / 2);
  let firstCorrect = 0;
  let secondCorrect = 0;

  result.questions.forEach((q, idx) => {
    const ans = result.userAnswers[idx];
    const hasScores = Boolean(q.scores && Object.keys(q.scores).length > 0);
    const isCorrect = ans
      ? hasScores
        ? (q.scores?.[ans.toLowerCase()] || 0) >= 4
        : areAnswersEqual(ans, q.correct)
      : false;
    if (idx < mid) {
      if (isCorrect) firstCorrect += 1;
    } else if (isCorrect) {
      secondCorrect += 1;
    }
  });

  const firstHalfCount = mid;
  const secondHalfCount = total - mid;
  const firstHalfAccuracy = Math.round((firstCorrect / Math.max(1, firstHalfCount)) * 100);
  const secondHalfAccuracy = Math.round((secondCorrect / Math.max(1, secondHalfCount)) * 100);
  const accuracyDeltaPct = secondHalfAccuracy - firstHalfAccuracy;

  const durations = result.questionDurationsSec;
  const hasDurations =
    Array.isArray(durations) &&
    durations.length === total &&
    durations.some((sec) => Number(sec) > 0);

  let firstHalfAvgSec: number | null = null;
  let secondHalfAvgSec: number | null = null;
  let paceDeltaSec: number | null = null;

  if (hasDurations && durations) {
    const firstSum = durations.slice(0, mid).reduce((sum, sec) => sum + Math.max(0, Number(sec) || 0), 0);
    const secondSum = durations.slice(mid).reduce((sum, sec) => sum + Math.max(0, Number(sec) || 0), 0);
    firstHalfAvgSec = Math.round(firstSum / Math.max(1, firstHalfCount));
    secondHalfAvgSec = Math.round(secondSum / Math.max(1, secondHalfCount));
    paceDeltaSec = secondHalfAvgSec - firstHalfAvgSec;
  }

  let status: SessionStaminaStatus = "stabil";
  let label = "Stamina & Fokus Stabil";
  let advice = "Ritme fokusmu terjaga konsisten dari paruh awal hingga soal terakhir.";

  if (accuracyDeltaPct <= -15 && paceDeltaSec !== null && paceDeltaSec <= -8) {
    status = "terburu_buru";
    label = "Terburu-buru di Paruh Akhir";
    advice = "Tempo akhir lebih cepat tetapi akurasi turun tajam. Sisakan jeda 5 detik untuk cek ulang pilihan pada 50% soal terakhir.";
  } else if (accuracyDeltaPct <= -12) {
    status = "turun_stamina";
    label = "Fokus Menurun di Akhir";
    advice = "Ketelitian melemah pada paruh akhir. Biasakan menandai soal panjang untuk dilewati dulu agar energi otak tidak habis di tengah.";
  } else if (accuracyDeltaPct >= 10) {
    status = "meningkat";
    label = "Pemanasan Kuat · Makin Tajam";
    advice = "Akurasi meningkat di paruh akhir. Gunakan 2 soal pertama untuk membaca pola sebelum menaikkan kecepatan.";
  }

  return {
    status,
    label,
    firstHalfAccuracy,
    secondHalfAccuracy,
    accuracyDeltaPct,
    firstHalfAvgSec,
    secondHalfAvgSec,
    paceDeltaSec,
    firstHalfCount,
    secondHalfCount,
    advice,
  };
}
