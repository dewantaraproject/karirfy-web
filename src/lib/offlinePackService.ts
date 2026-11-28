import type { OfflinePackMeta, QuestionItem } from "../types";
import { offlineTransaction } from "./offlineStorage";
import { normalizeSupabaseQuestionRow, QUESTION_SELECT } from "./questionRows";
import { supabase, withTimeout } from "./supabase";

const PACK_KEY = "question_pack";
const PAGE_SIZE = 500;

export async function downloadOfflineQuestionPack(
  onProgress?: (loaded: number, total?: number) => void,
  signal?: AbortSignal,
): Promise<OfflinePackMeta> {
  const questions: QuestionItem[] = [];
  let total: number | undefined;
  for (let from = 0; ; from += PAGE_SIZE) {
    if (signal?.aborted) throw new Error("Unduhan dibatalkan.");
    const query = supabase.from("questions")
      .select(QUESTION_SELECT, from === 0 ? { count: "exact" } : undefined)
      .order("id")
      .range(from, from + PAGE_SIZE - 1);
    const { data, error, count } = await withTimeout(signal ? query.abortSignal(signal) : query);
    if (error || !data) throw new Error("Paket soal gagal diunduh. Coba lagi saat terhubung.");
    if (typeof count === "number") total = count;
    questions.push(...data.map(normalizeSupabaseQuestionRow));
    onProgress?.(questions.length, total);
    if (data.length < PAGE_SIZE || (total !== undefined && questions.length >= total)) break;
  }
  if (questions.length === 0) throw new Error("Paket soal belum tersedia.");
  const meta: OfflinePackMeta = {
    downloadedAt: new Date().toISOString(),
    questionCount: questions.length,
    topicCount: new Set(questions.map((question) => question.type)).size,
    approxBytes: new Blob([JSON.stringify(questions)]).size,
  };
  await offlineTransaction(["questions", "meta"], "readwrite", async (store) => {
    if (signal?.aborted) throw new Error("Unduhan dibatalkan.");
    const bank = store("questions");
    await Promise.all([
      bank.clear(),
      ...questions.map((question) => bank.put(question, question.id)),
      store("meta").put(meta, PACK_KEY),
    ]);
  });
  return meta;
}

export function getOfflinePackMeta(): Promise<OfflinePackMeta | undefined> {
  return offlineTransaction(["meta"], "readonly", (store) => store("meta").get(PACK_KEY));
}

export function getOfflineQuestionsByTypes(types: string[]): Promise<QuestionItem[]> {
  return offlineTransaction(["questions"], "readonly", async (store) => {
    const matches = await Promise.all([...new Set(types)].map(
      (type) => store("questions").getByType<QuestionItem>(type),
    ));
    return matches.flat();
  });
}

export function clearOfflineQuestionPack(): Promise<unknown> {
  return offlineTransaction(["questions", "meta"], "readwrite", (store) => Promise.all([
    store("questions").clear(),
    store("meta").delete(PACK_KEY),
  ]));
}
