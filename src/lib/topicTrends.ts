import { EXERCISE_DOMAINS } from "../data/curriculum";
import type { AttemptRecord, QuizResultPayload } from "../types";
import { KIPRAH_STORAGE_KEYS } from "./sessionCleanup";

interface TopicSample { type: string; correct: number; total: number; secondsPerQuestion?: number }
export interface TopicSession { id: string; date: string; topics: TopicSample[] }

const keyForTopic = (name: string) => name.trim().toLowerCase();
const topicsByName = new Map(EXERCISE_DOMAINS.flatMap(({ topics }) => topics.flatMap(({ title, type }) =>
  [[keyForTopic(title), type] as const, [keyForTopic(type), type] as const])));

export function captureTopicSession(attempt: AttemptRecord, result: QuizResultPayload): TopicSession {
  const hasTopicTiming = result.categoryBreakdown.length === 1 || result.questionDurationsSec?.some((time) => time > 0);
  return {
    id: attempt.id,
    date: attempt.created_at,
    topics: result.categoryBreakdown.map(({ type, correct, total, avgSeconds }) => ({
      type, correct, total, secondsPerQuestion: hasTopicTiming ? avgSeconds : undefined,
    })),
  };
}

export function loadTopicSessions(): TopicSession[] {
  try {
    const sessions = JSON.parse(localStorage.getItem(KIPRAH_STORAGE_KEYS.topicSessions) ?? "[]");
    return Array.isArray(sessions) ? sessions.filter((entry: TopicSession | null) =>
      entry && typeof entry.id === "string" && typeof entry.date === "string" && Array.isArray(entry.topics)) : [];
  } catch {
    return [];
  }
}

export function saveTopicSessions(sessions: TopicSession[]): void {
  try {
    localStorage.setItem(KIPRAH_STORAGE_KEYS.topicSessions, JSON.stringify(sessions));
  } catch {
    // Trends remain available during the current session.
  }
}

function summarize(samples: TopicSample[]) {
  let correct = 0;
  let total = 0;
  let timedQuestions = 0;
  let duration = 0;
  for (const sample of samples) {
    correct += sample.correct;
    total += sample.total;
    if (sample.secondsPerQuestion != null && sample.secondsPerQuestion > 0 && Number.isFinite(sample.secondsPerQuestion)) {
      timedQuestions += sample.total;
      duration += sample.secondsPerQuestion * sample.total;
    }
  }
  return { accuracy: Math.round(correct / total * 100), seconds: timedQuestions ? Math.round(duration / timedQuestions) : null };
}

export function buildTopicTrends(attempts: AttemptRecord[], sessions: TopicSession[]) {
  const recorded = new Map(sessions.map((session) => [session.id, session]));
  for (const attempt of attempts) {
    if (recorded.has(attempt.id) || attempt.attempt_type !== "exercise") continue;
    const name = attempt.subject_category?.replace(/\s*·\s*Kustom$/i, "") ?? "";
    const type = topicsByName.get(keyForTopic(name));
    const total = Number(attempt.total_questions);
    const correct = Number(attempt.correct_answers_count);
    if (!type || total <= 0 || attempt.correct_answers_count == null || !Number.isFinite(correct)) continue;
    recorded.set(attempt.id, { id: attempt.id, date: attempt.created_at, topics: [{
      type, total, correct, secondsPerQuestion: (Number(attempt.time_taken_seconds) || 0) / total,
    }] });
  }

  const grouped = new Map<string, { type: string; samples: TopicSample[] }>();
  const recentFirst = [...recorded.values()].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
  for (const { topics } of recentFirst) {
    for (const sample of topics) {
      if (typeof sample?.type !== "string" || !Number.isFinite(sample.total) || sample.total <= 0
          || !Number.isFinite(sample.correct) || sample.correct < 0 || sample.correct > sample.total) continue;
      const key = keyForTopic(sample.type);
      const group = grouped.get(key) ?? { type: topicsByName.get(key) ?? sample.type, samples: [] };
      group.samples.push(sample);
      grouped.set(key, group);
    }
  }

  return [...grouped.entries()].map(([key, { type, samples }]) => {
    const comparedSessions = Math.max(1, Math.min(5, Math.floor(samples.length / 2)));
    const recent = summarize(samples.slice(0, comparedSessions));
    const previous = samples.length > 1 ? summarize(samples.slice(comparedSessions, comparedSessions * 2)) : null;
    return { key, type, sessions: samples.length, recent, previous, comparedSessions };
  }).sort((a, b) => a.recent.accuracy - b.recent.accuracy || b.sessions - a.sessions || a.type.localeCompare(b.type));
}
