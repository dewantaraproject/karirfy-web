import type { QuestionItem, QuizSessionConfig } from "../types";
import { offlineTransaction } from "./offlineStorage";

export const QUIZ_DRAFT_KEY = "quiz_draft";

export interface QuizDraft {
  config: QuizSessionConfig;
  questions: QuestionItem[];
  answers: (string | null)[];
  flags: number[];
  position: number;
  startedAt: number;
  durations: number[];
  fromOfflinePack: boolean;
  submittedAnswers?: Record<string, string>;
}

export async function readQuizDraft(owner: string): Promise<QuizDraft | undefined> {
  const entry = await offlineTransaction(["meta"], "readonly", (store) =>
    store("meta").get<{ owner: string; draft: QuizDraft }>(QUIZ_DRAFT_KEY));
  if (entry?.owner === owner) return entry.draft;
}

export async function writeQuizDraft(owner: string, draft: QuizDraft, isCurrent: () => boolean): Promise<void> {
  await offlineTransaction(["meta"], "readwrite", async (store) => {
    if (isCurrent()) await store("meta").put({ owner, draft }, QUIZ_DRAFT_KEY);
  });
}

export async function deleteQuizDraft(owner: string): Promise<void> {
  await offlineTransaction(["meta"], "readwrite", async (store) => {
    const meta = store("meta");
    const entry = await meta.get<{ owner: string }>(QUIZ_DRAFT_KEY);
    if (entry?.owner === owner) await meta.delete(QUIZ_DRAFT_KEY);
  });
}
