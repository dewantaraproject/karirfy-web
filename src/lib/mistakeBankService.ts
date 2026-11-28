import { areAnswersEqual } from "./quizGrading";
import { toLocalISO } from "./curriculumRoadmap";
import { KIPRAH_STORAGE_KEYS } from "./sessionCleanup";
import type {
  MistakeFailureReason,
  QuestionItem,
  QuizResultPayload,
  SavedQuestionEntry,
} from "../types";

const SRS_INTERVALS = [1, 3, 7, 0] as const;
const NEXT_STAGE = [1, 2, 3] as const;

export function getSrsIntervalDays(stage: NonNullable<SavedQuestionEntry["srsStage"]>): number {
  return SRS_INTERVALS[stage];
}

function isReviewDue(entry: SavedQuestionEntry, todayISO: string): boolean {
  return entry.srsStage === undefined || !entry.nextReviewAt || entry.nextReviewAt <= todayISO;
}

export function getDueMistakes(entries: SavedQuestionEntry[], todayISO = toLocalISO(new Date())) {
  return entries.filter((entry) => entry.isMistake && isReviewDue(entry, todayISO));
}

export function getUpcomingMistakes(entries: SavedQuestionEntry[], todayISO = toLocalISO(new Date())) {
  return entries.filter((entry) => entry.isMistake && !isReviewDue(entry, todayISO));
}

export function getSavedQuestionId(q: Pick<QuestionItem, "id" | "question">): string {
  const raw = String(q.id ?? "").trim();
  if (raw) return raw;
  return `q-${q.question.slice(0, 64)}`;
}

export function loadSavedQuestions(): Record<string, SavedQuestionEntry> {
  if (typeof window === "undefined" || !window.localStorage) return {};
  try {
    const raw = localStorage.getItem(KIPRAH_STORAGE_KEYS.savedQuestions);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    return parsed as Record<string, SavedQuestionEntry>;
  } catch {
    return {};
  }
}

export function saveSavedQuestions(
  map: Record<string, SavedQuestionEntry>,
): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    localStorage.setItem(KIPRAH_STORAGE_KEYS.savedQuestions, JSON.stringify(map));
  } catch {
    // ignore storage quota errors
  }
}

export function evaluateQuestionMastery(
  q: QuestionItem,
  userAnswer: string | null | undefined,
): { mastered: boolean; reason?: MistakeFailureReason } {
  if (!userAnswer) {
    return { mastered: false, reason: "skipped" };
  }

  if (q.scores && Object.keys(q.scores).length > 0) {
    const qMax = Math.max(0, ...Object.values(q.scores).map(Number));
    const pts = Number(q.scores[String(userAnswer).toLowerCase()] ?? 0);
    if (qMax > 0 && pts >= qMax) {
      return { mastered: true };
    }
    return { mastered: false, reason: "suboptimal_sjt" };
  }

  if (areAnswersEqual(userAnswer, q.correct)) {
    return { mastered: true };
  }
  return { mastered: false, reason: "wrong" };
}

export const MAX_QUESTION_NOTE_LENGTH = 280;

export function normalizeQuestionNote(raw: string): string {
  return raw.replace(/\u2014/g, "-").trim().slice(0, MAX_QUESTION_NOTE_LENGTH);
}

export function toggleBookmarkInMap(
  currentMap: Record<string, SavedQuestionEntry>,
  question: QuestionItem,
  lastUserAnswer: string | null = null,
): Record<string, SavedQuestionEntry> {
  const id = getSavedQuestionId(question);
  const existing = currentMap[id];
  const nowISO = new Date().toISOString();
  const next = { ...currentMap };

  if (existing) {
    const nextBookmarked = !existing.isBookmarked;
    if (!nextBookmarked && !existing.isMistake && !existing.userNote) {
      delete next[id];
    } else {
      next[id] = {
        ...existing,
        question,
        isBookmarked: nextBookmarked,
        lastUserAnswer:
          lastUserAnswer !== null ? lastUserAnswer : existing.lastUserAnswer,
        updatedAt: nowISO,
      };
    }
  } else {
    next[id] = {
      id,
      question,
      isMistake: false,
      isBookmarked: true,
      lastUserAnswer,
      wrongCount: 0,
      updatedAt: nowISO,
    };
  }

  return next;
}

export function updateQuestionNoteInMap(
  currentMap: Record<string, SavedQuestionEntry>,
  question: QuestionItem,
  rawNote: string,
  lastUserAnswer: string | null = null,
): Record<string, SavedQuestionEntry> {
  const id = getSavedQuestionId(question);
  const existing = currentMap[id];
  const cleaned = normalizeQuestionNote(rawNote);
  const userNote = cleaned || undefined;
  const nowISO = new Date().toISOString();

  if (!existing && !userNote) return currentMap;

  const next = { ...currentMap };
  if (existing) {
    if (!existing.isMistake && !existing.isBookmarked && !userNote) {
      delete next[id];
      return next;
    }
    const nextBookmarked = userNote && !existing.isMistake ? true : existing.isBookmarked;
    next[id] = {
      ...existing,
      question,
      isBookmarked: nextBookmarked,
      userNote,
      lastUserAnswer: lastUserAnswer !== null ? lastUserAnswer : existing.lastUserAnswer,
      updatedAt: nowISO,
    };
    return next;
  }

  next[id] = {
    id,
    question,
    isMistake: false,
    isBookmarked: true,
    lastUserAnswer,
    wrongCount: 0,
    userNote,
    updatedAt: nowISO,
  };
  return next;
}

export function removeMistakeInMap(
  currentMap: Record<string, SavedQuestionEntry>,
  questionId: string,
): Record<string, SavedQuestionEntry> {
  const existing = currentMap[questionId];
  if (!existing) return currentMap;
  const next = { ...currentMap };
  if (existing.isBookmarked || existing.userNote) {
    next[questionId] = {
      ...existing,
      isMistake: false,
      isBookmarked: existing.isBookmarked || Boolean(existing.userNote),
      srsStage: undefined,
      nextReviewAt: undefined,
      lastReviewedAt: undefined,
      updatedAt: new Date().toISOString(),
    };
  } else {
    delete next[questionId];
  }
  return next;
}

export function reconcileQuizResultWithMistakeBank(
  currentMap: Record<string, SavedQuestionEntry>,
  result: QuizResultPayload,
  isMistakeDrill: boolean = false,
  todayISO = toLocalISO(new Date()),
): {
  nextMap: Record<string, SavedQuestionEntry>;
  graduatedCount: number;
  newlyAddedCount: number;
} {
  const next = { ...currentMap };
  const nowISO = new Date().toISOString();
  let graduatedCount = 0;
  let newlyAddedCount = 0;

  result.questions.forEach((q, idx) => {
    const id = getSavedQuestionId(q);
    const userAnswer = result.userAnswers[idx] ?? null;
    const { mastered, reason } = evaluateQuestionMastery(q, userAnswer);
    const existing = next[id];

    if (!mastered) {
      if (!existing || !existing.isMistake) {
        newlyAddedCount += 1;
      }
      next[id] = {
        id,
        question: q,
        isMistake: true,
        isBookmarked: existing?.isBookmarked ?? false,
        lastUserAnswer: userAnswer,
        failureReason: reason,
        wrongCount: (existing?.wrongCount ?? 0) + 1,
        userNote: existing?.userNote,
        updatedAt: nowISO,
        srsStage: 0,
        nextReviewAt: todayISO,
        lastReviewedAt: todayISO,
      };
    } else if (isMistakeDrill && existing?.isMistake && isReviewDue(existing, todayISO)) {
      const stage = existing.nextReviewAt ? existing.srsStage ?? 0 : 0;
      if (stage !== 3) {
        const date = new Date(`${todayISO}T12:00:00`);
        date.setDate(date.getDate() + getSrsIntervalDays(stage));
        next[id] = {
          ...existing,
          question: q,
          lastUserAnswer: userAnswer,
          updatedAt: nowISO,
          srsStage: NEXT_STAGE[stage],
          nextReviewAt: toLocalISO(date),
          lastReviewedAt: todayISO,
        };
        return;
      }
      graduatedCount += 1;
      if (existing.isBookmarked || existing.userNote) {
        next[id] = {
          ...existing,
          question: q,
          isMistake: false,
          isBookmarked: existing.isBookmarked || Boolean(existing.userNote),
          lastUserAnswer: userAnswer,
          updatedAt: nowISO,
          nextReviewAt: undefined,
          lastReviewedAt: todayISO,
        };
      } else {
        delete next[id];
      }
    }
  });

  return { nextMap: next, graduatedCount, newlyAddedCount };
}
