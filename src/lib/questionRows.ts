import type { QuestionItem, QuestionOption } from "../types";
import { applyReviewedQuestion } from "../data/questionBank/questionCorrections";

export function normalizeNumericalMatrix<T extends Pick<QuestionItem, "type" | "question"> & {
  matrixData?: QuestionItem["matrixData"];
}>(item: T): T & { matrixData?: QuestionItem["matrixData"] } {
  if (item.matrixData || item.type.trim().toLowerCase() !== "numerical matrix") return item;
  const lines = item.question.trimEnd().split(/\r?\n/);
  const matches = lines.map((line) => {
    const row = line.match(/^\s*\[\s*(-?\d+|\?)\s*\|\s*(-?\d+|\?)\s*\|\s*(-?\d+|\?)\s*\]\s*$/);
    return row?.slice(1).map((cell) => cell === "?" ? cell : Number(cell));
  });
  const start = matches.findIndex((row) => row !== undefined);
  const count = matches.filter(Boolean).length;
  if (start < 0 || (count !== 3 && count !== 4)) return item;
  const rows = matches.slice(start, start + count);
  if (!rows.every((row) => row !== undefined) ||
      rows.flat().filter((cell) => cell === "?").length !== 1) return item;
  return {
    ...item,
    question: [...lines.slice(0, start), ...lines.slice(start + count)].join("\n").trim() || "Tentukan angka yang hilang.",
    matrixData: rows,
  };
}

export function normalizeSupabaseQuestionRow(raw: any): QuestionItem {
  const optionLetters = ["a", "b", "c", "d", "e", "f", "g"];
  let optionsData = raw?.options;

  if (typeof optionsData === "string") {
    try {
      optionsData = JSON.parse(optionsData);
    } catch {
      optionsData = [];
    }
  }

  const rawCorrect = raw?.correct_answer ?? raw?.correct ?? null;
  let finalCorrect = rawCorrect ? String(rawCorrect).replace(/"/g, "").toLowerCase() : "";
  let finalOptions: QuestionOption[] = [];
  let scoresMap: Record<string, number> | undefined;

  if (Array.isArray(optionsData) && optionsData.length > 0) {
    const first = optionsData[0];
    if (first && typeof first === "object" && "id" in first) {
      finalOptions = optionsData.map((opt: any) => ({
        id: String(opt.id).toLowerCase(),
        text: String(opt.text ?? ""),
      }));
    } else {
      finalOptions = optionsData.map((txt: any, index: number) => ({
        id: optionLetters[index] || String(index),
        text: String(txt ?? ""),
      }));
    }
  } else if (optionsData && typeof optionsData === "object") {
    const firstVal = Object.values(optionsData)[0];
    if (firstVal && typeof firstVal === "object" && "text" in firstVal) {
      scoresMap = {};
      let maxScore = -Infinity;
      let bestKey = "";

      finalOptions = Object.entries(optionsData).map(([key, value]) => {
        const optVal = value as { text: string; score?: number };
        const lowerKey = String(key).toLowerCase();
        const scoreNum = Number(optVal.score) || 0;
        scoresMap![lowerKey] = scoreNum;

        if (scoreNum > maxScore) {
          maxScore = scoreNum;
          bestKey = lowerKey;
        }
        if (raw?.question_format === "binary" && scoreNum === 1 && !finalCorrect) {
          finalCorrect = lowerKey;
        }

        return {
          id: lowerKey,
          text: String(optVal.text ?? ""),
        };
      });

      if (!finalCorrect && bestKey) {
        finalCorrect = bestKey;
      }
    } else {
      finalOptions = Object.entries(optionsData).map(([key, value]) => ({
        id: String(key).toLowerCase(),
        text: String(value ?? ""),
      }));
    }
  }

  const item = normalizeNumericalMatrix({
    id: String(raw?.id ?? `q_${Math.random().toString(36).slice(2)}`),
    question: String(raw?.question ?? raw?.questions ?? raw?.text ?? ""),
    imageUrl: raw?.imageUrl ?? raw?.image_url ?? undefined,
    options: finalOptions,
    correct: finalCorrect || (finalOptions[0]?.id ?? "a"),
    discussion: raw?.discussion ?? raw?.explanation ?? undefined,
    explanationUrl: raw?.explanationUrl ?? raw?.explanation_url ?? undefined,
    type: String(raw?.type ?? "Umum"),
    category: raw?.category ? String(raw.category) : undefined,
    question_format: raw?.question_format ? String(raw.question_format) : undefined,
    scores: scoresMap,
    matrixData: Array.isArray(raw?.matrixData) ? raw.matrixData : undefined,
    digitSymbolData: raw?.digitSymbolData ?? undefined,
  });
  return rawCorrect ? applyReviewedQuestion(item) : item;
}

export const QUESTION_SELECT =
  "id, category, type, question:questions, options, correct:correct_answer_legacy, question_format, discussion, imageUrl:image_url, explanationUrl:explanation_url";
