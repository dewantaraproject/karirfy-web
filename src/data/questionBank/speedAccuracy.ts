import { createQuestionRandom, shuffleQuestionValues } from "./questionRandom";
import type { QuestionItem, QuestionOption } from "../../types";

const random = createQuestionRandom(91427);
const PREFIXES = ["BRI", "BNI", "BMRI", "PLN", "PTBA", "TLKM", "KAI", "BTN", "PGAS", "ANTM", "JSMR", "BUMN", "PERURI", "ASDP"];
const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P", "R", "S", "T", "W", "X", "Z"];
const DIGITS = ["2", "3", "4", "5", "6", "7", "8", "9"];
const MISSING_CHAR_POOL = ["K", "7", "#", "M", "9", "@", "P", "4", "&", "W", "6", "%", "R", "3", "$", "T", "8", "N"];
const PAIR_LETTERS = ["K", "M", "P", "R", "T", "W", "B", "N", "H", "F", "D", "L"];
const PAIR_TAILS = ["7", "9", "4", "8", "5", "2", "3", "6", "@", "#", "$", "%"];

function toOptions(texts: string[]): { options: QuestionOption[]; correctIndex: number } {
  return {
    options: texts.map((text, idx) => ({ id: String.fromCharCode(97 + idx), text })),
    correctIndex: 0,
  };
}

function buildCodeVerificationQuestion(index: number): QuestionItem {
  const prefix = PREFIXES[index % PREFIXES.length];
  const digits = Array.from({ length: 4 }, () => DIGITS[Math.floor(random() * DIGITS.length)]).join("");
  const mid = Array.from({ length: 3 }, () => LETTERS[Math.floor(random() * LETTERS.length)]).join("");
  const tail = `${DIGITS[Math.floor(random() * DIGITS.length)]}${LETTERS[Math.floor(random() * LETTERS.length)]}`;
  const reference = `${prefix}-${digits}-${mid}-${tail}`;

  const rawBody = `${digits}${mid}${tail}`;
  const distractors = new Set<string>();
  let guard = 0;
  while (distractors.size < 4 && guard < 120) {
    guard += 1;
    const mode = guard % 3;
    let mutatedDigits = digits;
    let mutatedMid = mid;
    let mutatedTail = tail;

    if (mode === 0) {
      const pos = Math.floor(random() * 3);
      const arr = digits.split("");
      if (arr[pos] !== arr[pos + 1]) {
        [arr[pos], arr[pos + 1]] = [arr[pos + 1], arr[pos]];
      } else {
        arr[pos] = DIGITS[(DIGITS.indexOf(arr[pos]) + 2) % DIGITS.length];
      }
      mutatedDigits = arr.join("");
    } else if (mode === 1) {
      const pos = Math.floor(random() * mid.length);
      const arr = mid.split("");
      arr[pos] = LETTERS[(LETTERS.indexOf(arr[pos]) + 3 + (guard % 5)) % LETTERS.length];
      mutatedMid = arr.join("");
    } else {
      const arr = mutatedTail.split("");
      if (guard % 2 === 0) {
        arr[0] = DIGITS[(DIGITS.indexOf(arr[0]) + 1 + (guard % 4)) % DIGITS.length];
      } else {
        arr[1] = LETTERS[(LETTERS.indexOf(arr[1]) + 2 + (guard % 4)) % LETTERS.length];
      }
      mutatedTail = arr.join("");
    }

    const candidate = `${prefix}-${mutatedDigits}-${mutatedMid}-${mutatedTail}`;
    if (candidate !== reference && rawBody !== `${mutatedDigits}${mutatedMid}${mutatedTail}`) {
      distractors.add(candidate);
    }
  }

  const orderedTexts = shuffleQuestionValues([reference, ...Array.from(distractors).slice(0, 4)], random);
  const { options } = toOptions(orderedTexts);
  const correctOpt = options.find((opt) => opt.text === reference)!;
  const discussion = `Bandingkan segmen demi segmen terhadap kode referensi ${reference}: hanya opsi ${correctOpt.id.toUpperCase()} (${reference}) yang memiliki angka tengah (${digits}), kode huruf (${mid}), dan akhiran (${tail}) yang identik.`;

  return {
    id: `spd-acc-${String(index + 1).padStart(2, "0")}`,
    type: "Attention to Detail",
    category: "Professional_Suitability",
    question_format: "multiple_choice",
    question: `Periksa kode referensi berikut dengan teliti: ${reference}. Manakah kode yang 100% identik tanpa perubahan huruf, angka, atau urutan?`,
    options,
    correct: correctOpt.id,
    discussion,
  };
}

function buildMissingCharQuestion(index: number): QuestionItem {
  const reference7 = shuffleQuestionValues(MISSING_CHAR_POOL, random).slice(0, 7);
  const missingIdx = index % reference7.length;
  const missingChar = reference7[missingIdx];
  const present6 = reference7.filter((_, idx) => idx !== missingIdx);
  const scrambled6 = shuffleQuestionValues(present6, random);
  const distractors = shuffleQuestionValues(present6, random).slice(0, 4);
  const orderedTexts = shuffleQuestionValues([missingChar, ...distractors], random);
  const { options } = toOptions(orderedTexts);
  const correctOpt = options.find((opt) => opt.text === missingChar)!;
  const discussion = `Dari 7 karakter referensi (${reference7.join(" ")}), enam karakter muncul pada susunan acak (${scrambled6.join(" ")}), sedangkan karakter '${missingChar}' tidak muncul sama sekali.`;

  return {
    id: `spd-acc-${String(index + 1).padStart(2, "0")}`,
    type: "Attention to Detail",
    category: "Professional_Suitability",
    question_format: "multiple_choice",
    question: `Kunci referensi berisi 7 karakter: ${reference7.join(" ")}. Pada susunan acak berikut, satu karakter hilang: ${scrambled6.join(" ")}. Karakter manakah yang hilang?`,
    options,
    correct: correctOpt.id,
    discussion,
  };
}

function buildPairCountQuestion(index: number): QuestionItem {
  const targetLetter = PAIR_LETTERS[index % PAIR_LETTERS.length];
  const targetTail = PAIR_TAILS[(index * 3 + Math.floor(random() * 4)) % PAIR_TAILS.length];
  const targetPair = `${targetLetter}${targetTail}`;
  const targetCount = 3 + (index % 4); // 3 to 6 occurrences

  const decoyLetters = PAIR_LETTERS.filter((l) => l !== targetLetter);
  const decoyTails = PAIR_TAILS.filter((t) => t !== targetTail);
  const tokens: string[] = [];

  for (let i = 0; i < targetCount; i += 1) {
    tokens.push(targetPair);
  }
  while (tokens.length < 13) {
    const mode = tokens.length % 3;
    if (mode === 0) {
      // Near miss: same letter, different tail
      tokens.push(`${targetLetter}${decoyTails[Math.floor(random() * decoyTails.length)]}`);
    } else if (mode === 1) {
      // Near miss: different letter, same tail
      tokens.push(`${decoyLetters[Math.floor(random() * decoyLetters.length)]}${targetTail}`);
    } else {
      tokens.push(
        `${decoyLetters[Math.floor(random() * decoyLetters.length)]}${decoyTails[Math.floor(random() * decoyTails.length)]}`,
      );
    }
  }

  const stream = shuffleQuestionValues(tokens, random).join("");
  // Every token is [letter][digit|symbol], so boundary overlaps never form [letter][digit|symbol].
  let verifiedCount = 0;
  for (let i = 0; i <= stream.length - 2; i += 1) {
    if (stream.slice(i, i + 2) === targetPair) verifiedCount += 1;
  }

  const candidateCounts = new Set<number>([verifiedCount]);
  for (const delta of [-2, -1, 1, 2, 3]) {
    if (candidateCounts.size >= 5) break;
    const val = verifiedCount + delta;
    if (val >= 1) candidateCounts.add(val);
  }
  let extra = verifiedCount + 4;
  while (candidateCounts.size < 5) {
    candidateCounts.add(extra);
    extra += 1;
  }

  const orderedTexts = shuffleQuestionValues(
    Array.from(candidateCounts).map((n) => `${n} kali`),
    random,
  );
  const { options } = toOptions(orderedTexts);
  const correctOpt = options.find((opt) => opt.text === `${verifiedCount} kali`)!;
  const discussion = `Pindai deret dua karakter per blok dari kiri ke kanan: pasangan '${targetPair}' muncul tepat ${verifiedCount} kali.`;

  return {
    id: `spd-acc-${String(index + 1).padStart(2, "0")}`,
    type: "Attention to Detail",
    category: "Professional_Suitability",
    question_format: "multiple_choice",
    question: `Hitung berapa kali pasangan tepat '${targetPair}' muncul dalam deret kode berikut: ${stream}`,
    options,
    correct: correctOpt.id,
    discussion,
  };
}

export const speedAccuracyQuestions: QuestionItem[] = Array.from({ length: 40 }, (_, index) => {
  if (index < 14) return buildCodeVerificationQuestion(index);
  if (index < 28) return buildMissingCharQuestion(index);
  return buildPairCountQuestion(index);
});
