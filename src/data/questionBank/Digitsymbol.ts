import { createQuestionRandom, shuffleQuestionValues } from "./questionRandom";

const random = createQuestionRandom(76183);
const symbols = ["★", "●", "▲", "■", "◆", "◇", "▼", "◉", "✚", "✦", "⚡", "☀"];

const digitSymbolQuestions = Array.from({ length: 35 }, (_, index) => {
  const pool = [...(random() > .5 ? "ABCDEFGHIJKL" : "1234567890")];
  const size = 5 + Math.floor(random() * 4);
  const selected = shuffleQuestionValues(symbols, random).slice(0, size);
  const keys = shuffleQuestionValues(pool, random).slice(0, size);
  const symbolMap = Object.fromEntries(selected.map((symbol, i) => [symbol, keys[i]]));
  const testSequence = Array.from({ length: 3 + Math.floor(random() * 4) }, () =>
    selected[Math.floor(random() * size)]);
  const decoded = testSequence.map((symbol) => symbolMap[symbol]);
  const answer = decoded.join("");
  const distractors = decoded.flatMap((value, position) => keys.filter((key) => key !== value)
    .map((key) => `${answer.slice(0, position)}${key}${answer.slice(position + 1)}`));
  const choices = shuffleQuestionValues([answer, ...shuffleQuestionValues(distractors, random).slice(0, 4)], random);
  const options = Object.fromEntries(choices.map((choice, i) => [String.fromCharCode(65 + i), choice]));
  const explanation = `Cocokkan dari kiri ke kanan: ${testSequence.map((symbol) => `${symbol} = ${symbolMap[symbol]}`).join(", ")}. Gabungkan hasilnya menjadi ${answer}.`;

  return {
    id: `digsym-v2-${index}`,
    type: "Digit Symbol",
    question: "Cocokkan setiap simbol dengan kuncinya. Pilih kode yang sesuai dengan urutan dari kiri ke kanan.",
    digitSymbolData: { symbolMap, testSequence },
    options,
    correct: Object.keys(options).find((key) => options[key] === answer)!,
    explanation,
    discussion: explanation,
  };
});

export default digitSymbolQuestions;
