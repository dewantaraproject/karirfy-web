import { createQuestionRandom, shuffleQuestionValues } from "./questionRandom";
const random = createQuestionRandom(48271);

// src/data/questionBank/Numerik.ts

interface MatrixQuestion {
  id?: string;
  type: string;
  question: string;
  matrixData: (number | string)[][];
  options: Record<string, number>;
  correct: string;
  explanation: string;
  discussion: string;
}

const questionGenerators = {
  generateMatrixPattern: (): MatrixQuestion => {
    const baseOperations = [
      {
        op: (a: number, b: number) => a * b,
        name: "Perkalian",
        explanation: "Hasil adalah perkalian dua elemen sebelumnya.",
      },
      {
        op: (a: number, b: number) => a * 2 + b,
        name: "Kombinasi",
        explanation: "Pola: (Elemen 1 × 2) + Elemen 2.",
      },
      {
        op: (a: number, b: number) => (a + b) * 2,
        name: "Kombinasi",
        explanation: "Pola: (Elemen 1 + Elemen 2) × 2.",
      },
    ];

    let pattern = baseOperations[0];
    const orientation = random() > 0.5 ? "row" : "column";
    let matrix: (number | string)[][] = [];
    let answer = 0;
    let validQuestion = false;

    while (!validQuestion) {
      pattern =
        baseOperations[Math.floor(random() * baseOperations.length)];
      matrix = [[], [], []];
      validQuestion = true;

      const primary = Array.from(
        { length: 3 },
        () => Math.floor(random() * 8) + 1
      );
      const secondary = Array.from(
        { length: 3 },
        () => Math.floor(random() * 8) + 1
      );
      const tertiary: number[] = [];

      for (let i = 0; i < 3; i++) {
        const result = pattern.op(primary[i], secondary[i]);
        if (result < 1 || result > 150 || !Number.isInteger(result)) {
          validQuestion = false;
          break;
        }
        tertiary.push(result);
      }

      if (validQuestion) {
        // Other supported operations must disagree with at least two of the three triples.
        // One triple will be hidden, so one distinguishing example must stay visible.
        if (baseOperations.some(({ op }) => op !== pattern.op &&
          primary.filter((value, index) => op(value, secondary[index]) === tertiary[index]).length > 1)) {
          validQuestion = false;
          continue;
        }
        if (orientation === "column") {
          matrix = [primary, secondary, tertiary];
        } else {
          for (let i = 0; i < 3; i++) {
            matrix[i] = [primary[i], secondary[i], tertiary[i]];
          }
        }
      }
    }

    const randomIndex = Math.floor(random() * 3);
    const missingRow = orientation === "column" ? 2 : randomIndex;
    const missingCol = orientation === "row" ? 2 : randomIndex;
    answer = matrix[missingRow][missingCol] as number;
    matrix[missingRow][missingCol] = "?";

    const optionsArray = new Set<number>([answer]);
    while (optionsArray.size < 5) {
      const wrongAnswer = Math.max(
        1,
        answer + (Math.floor(random() * 20) - 10)
      );
      if (wrongAnswer !== answer) optionsArray.add(wrongAnswer);
    }

    const shuffledOptions = shuffleQuestionValues([...optionsArray], random);
    const options: Record<string, number> = {};
    let correctLetter = "";
    shuffledOptions.forEach((opt, idx) => {
      const letter = String.fromCharCode(65 + idx);
      options[letter] = opt;
      if (opt === answer) {
        correctLetter = letter;
      }
    });

    const orientationLabel = orientation === "row" ? "baris" : "kolom";
    const explanation = `Pola diterapkan secara ${orientationLabel}. ${pattern.explanation}`;

    return {
      type: "Numerical Matrix",
      question: `Pola yang sama berlaku pada setiap ${orientationLabel}. Berapa angka yang hilang?`,
      matrixData: matrix,
      options,
      correct: correctLetter,
      explanation,
      discussion: explanation,
    };
  },
};

const generatedNumericalMatrix: MatrixQuestion[] = [];
const NUMERIC_QUESTION_COUNT = 20;

for (let i = 0; i < NUMERIC_QUESTION_COUNT; i++) {
  const question = questionGenerators.generateMatrixPattern();
  generatedNumericalMatrix.push({
    ...question,
    id: `num-v2-${i}`,
  });
}

export default generatedNumericalMatrix;
