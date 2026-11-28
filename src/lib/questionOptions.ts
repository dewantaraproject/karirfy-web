import { shuffleQuestionValues } from "../data/questionBank/questionRandom";
import type { QuestionItem } from "../types";

const explicitOption = /\b(?:opsi|pilihan(?: jawaban)?|jawaban|option|choice|answer)\s+[A-G]\b/i;
const linkedChoices = /^(?:\s*\(?|both\s+)[A-G]\s*(?:dan|atau|and|or|&)\s*[A-G]\b/i;
const summaryChoice = /^(?:semua (?:jawaban|pilihan|opsi)|seluruh (?:jawaban|pilihan|opsi)|tidak ada (?:jawaban|pilihan|opsi)|(?:all|none) of the above)\b/i;

export const optionLabel = (index: number) => String.fromCharCode(65 + index);

export function shuffleQuestionOptions(question: QuestionItem, random = Math.random): QuestionItem {
  const { options } = question;
  if (options.length < 2 || explicitOption.test(question.question) ||
      options.some(({ text }) => explicitOption.test(text) || linkedChoices.test(text))) return question;

  const movable = shuffleQuestionValues(options.filter(({ text }) => !summaryChoice.test(text.trim())), random);
  let next = 0;
  const shuffled = options.map((option) => summaryChoice.test(option.text.trim()) ? option : movable[next++]);
  return { ...question, options: shuffled, sourceOptionOrder: question.sourceOptionOrder ?? options.map(({ id }) => id) };
}

const discussionReference = /(\b(?:opsi|pilihan(?: jawaban)?|jawaban(?: yang (?:benar|tepat))?(?: adalah)?|kunci(?: jawaban)?|option|choice|answer)(?:\s*:\s*|\s+))([A-G](?:(?:\s*[,/]\s*(?:(?:dan|atau|and|or)\s+)?|\s+(?:dan|atau|and|or)\s+)[A-G])*)\b/gi;
const bareLabel = /\b[A-G]\b/g;

export function getDiscussionForOptions(question: QuestionItem) {
  const text = typeof question.discussion === "string" ? question.discussion.trim() : "";
  const sourceLabels: [string, string][] = [];
  const display = new Map(question.options.map(({ id }, index) => [id, optionLabel(index)]));
  question.sourceOptionOrder?.forEach((id, index) => {
    const source = optionLabel(index);
    const label = display.get(id);
    if (label && label !== source) sourceLabels.push([source, label]);
  });
  if (sourceLabels.length === 0 || (!text && !question.explanationUrl)) return { text, sourceLabels: [] };

  const references = new Map(sourceLabels);
  const unrecognized = text.replace(discussionReference, (match, _prefix, labels: string) =>
    /^[A-G]/.test(labels) ? "" : match).match(bareLabel);
  if (question.explanationUrl || unrecognized?.some((label) => references.has(label))) return { text, sourceLabels };

  return {
    text: text.replace(discussionReference, (_, prefix: string, labels: string) =>
      prefix + labels.replace(bareLabel, (label) => references.get(label) ?? label)),
    sourceLabels: [],
  };
}
