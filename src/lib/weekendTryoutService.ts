import type {
  QuestionItem, QuizResultPayload, QuizSessionConfig, WeekendPercentile, WeekendSubmissionStatus,
  WeekendTrack, WeekendTryoutEvent,
} from "../types";
import { normalizeNumericalMatrix, normalizeSupabaseQuestionRow } from "./questionRows";
import { shuffleQuestionOptions } from "./questionOptions";
import { createQuestionRandom, hashQuestionSeed } from "../data/questionBank/questionRandom";
import { evaluateQuizSession } from "./quizGrading";
import { supabase, withTimeout } from "./supabase";

export const WEEKEND_TRACKS = ["CPNS", "BUMN", "Bank Indonesia", "Beasiswa LPDP"] as const;

const DAY_MS = 86_400_000;
const WIB_OFFSET = 7 * 3_600_000;

export function getWeekendWindow(now = new Date()) {
  // Jakarta uses UTC+7 year-round. UTC calendar methods keep this independent of device time zone.
  const jakarta = now.getTime() + WIB_OFFSET;
  const dayOfWeek = (new Date(jakarta).getUTCDay() + 6) % 7;
  const monday = Math.floor(jakarta / DAY_MS) * DAY_MS - dayOfWeek * DAY_MS;
  const status = dayOfWeek >= 5 ? "active" : dayOfWeek === 0 ? "published" : "countdown";
  const eventMonday = status === "active" ? monday : monday - 7 * DAY_MS;
  const year = new Date(eventMonday + 3 * DAY_MS).getUTCFullYear();
  const week = 1 + Math.floor((eventMonday + 3 * DAY_MS - Date.UTC(year, 0, 1)) / (7 * DAY_MS));
  return {
    status,
    weekKey: `${year}-W${String(week).padStart(2, "0")}`,
    nextStartAt: new Date(monday + (status === "active" ? 12 : 5) * DAY_MS - WIB_OFFSET).toISOString(),
  } as const;
}

export function formatWeekendPercentile(summary: WeekendPercentile, track: WeekendTrack): string {
  if (!summary.results_published) return "Hasil diumumkan Senin pukul 00.00 WIB.";
  if ((summary.participant_count ?? 0) < 5) return "Persentil memerlukan minimal 5 peserta di jalur ini.";
  if (summary.my_percentile_top_pct == null || summary.my_rank == null) return "Persentil belum tersedia.";
  const rank = summary.my_rank.toLocaleString("id-ID");
  const count = summary.participant_count!.toLocaleString("id-ID");
  const top = summary.my_percentile_top_pct.toLocaleString("id-ID");
  return `Skormu masuk Top ${top}% di jalur ${track} · Peringkat #${rank} dari ${count} peserta.`;
}

export async function getWeekendTryout(track: WeekendTrack, weekKey?: string): Promise<{
  available: boolean;
  event: WeekendTryoutEvent | null;
}> {
  try {
    const { data, error } = await withTimeout(supabase.rpc("get_or_create_weekend_tryout", {
      p_track: track, p_week_key: weekKey,
    }).maybeSingle(), 5000);
    if (!error) return { available: true, event: data as WeekendTryoutEvent | null };
  } catch {
    // The feature can be unavailable before the migration or while offline.
  }
  return { available: false, event: null };
}

export async function getWeekendPercentile(eventId: string): Promise<WeekendPercentile | null> {
  try {
    const { data, error } = await withTimeout(supabase.rpc("get_weekend_tryout_percentile", {
      p_event_id: eventId,
    }).maybeSingle(), 5000);
    return error ? null : data as WeekendPercentile | null;
  } catch {
    return null;
  }
}
type RankedQuestion = {
  id: string;
  type: string;
  prompt: string;
  options: Record<string, string>;
  correct?: string;
  scores?: Record<string, number>;
  discussion?: string;
  image_url?: string;
};

function rankedQuestion(row: RankedQuestion, eventId: string): QuestionItem {
  const question = normalizeNumericalMatrix({
    ...normalizeSupabaseQuestionRow({ ...row, question: row.prompt, correct: undefined }),
    correct: row.correct ?? "",
    scores: row.scores,
  });
  // The same event and question must show the same option order when review opens.
  return shuffleQuestionOptions(question, createQuestionRandom(hashQuestionSeed(`${eventId}:${row.id}`)));
}

export async function loadWeekendQuiz(event: WeekendTryoutEvent): Promise<QuizSessionConfig | null> {
  try {
    const { data, error } = await withTimeout(supabase.rpc("start_ranked_weekend_tryout", { p_event_id: event.id }), 6000);
    if (error || !data?.questions?.length || !data.deadline) return null;
    const questions = (data.questions as RankedQuestion[]).map((row) => rankedQuestion(row, event.id));
    return {
      category: event.track, title: event.title, source: "assessment",
      totalQuestions: questions.length, timeLimit: event.time_limit_minutes,
      customQuestions: questions, weekendEventId: event.id, weekendTrack: event.track,
      weekendDeadline: data.deadline, initialAnswers: data.answers,
    };
  } catch {
    return null;
  }
}

export function rankedSelections(questions: QuestionItem[], answers: (string | null)[]) {
  const selected: Record<string, string> = {};
  questions.forEach(({ id }, index) => { if (answers[index]) selected[id] = answers[index]; });
  return selected;
}

let lastAnswerRevision = 0;
export async function saveWeekendAnswers(
  eventId: string,
  answers: Record<string, string>,
  finish = false,
  signal?: AbortSignal,
): Promise<Exclude<WeekendSubmissionStatus, "saving">> {
  try {
    lastAnswerRevision = Math.max(lastAnswerRevision + 1, Date.now());
    const query = supabase.rpc("save_ranked_weekend_tryout", {
      p_event_id: eventId, p_answers: answers, p_finish: finish, p_revision: lastAnswerRevision,
    });
    const { data, error } = await withTimeout(signal ? query.abortSignal(signal) : query, 7000);
    if (!error) return data === true ? "submitted" : "unavailable";
    if (["42P01", "PGRST202", "PGRST205", "42501", "23514"].includes(error.code)) return "unavailable";
  } catch {
    // The local answer draft remains available for retry.
  }
  return "retry";
}

export async function getWeekendReview(eventId: string): Promise<QuizResultPayload | null> {
  try {
    const { data, error } = await withTimeout(supabase.rpc("get_ranked_weekend_review", { p_event_id: eventId }), 6000);
    if (error || !data?.questions?.length) return null;
    const questions = (data.questions as RankedQuestion[]).map((row) => rankedQuestion(row, eventId));
    const answers = questions.map(({ id }) => data.answers[id] ?? null);
    const result = evaluateQuizSession(questions, answers, [], data.elapsed, data.minutes * 60, "assessment", data.title);
    const official = result.officialSummary;
    return {
      ...result, score: Number(data.score), weekendEventId: eventId, weekendTrack: data.track,
      officialSummary: official && data.officialPoints != null
        ? { ...official, totalPoints: Number(data.officialPoints), passed: data.passed ?? official.passed }
        : undefined,
    };
  } catch {
    return null;
  }
}
