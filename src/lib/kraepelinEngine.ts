import { createQuestionRandom, hashQuestionSeed } from "../data/questionBank/questionRandom";

export type KraepelinPresetKey = "sprint" | "standard" | "endurance";

export interface KraepelinPreset {
  key: KraepelinPresetKey;
  title: string;
  subtitle: string;
  columns: number;
  secondsPerColumn: number;
  digitsPerColumn: number;
}

export const KRAEPELIN_PRESETS: Record<KraepelinPresetKey, KraepelinPreset> = {
  sprint: {
    key: "sprint",
    title: "Sprint Pemanasan",
    subtitle: "12 lajur x 15 detik · Ritme cepat 3 menit",
    columns: 12,
    secondsPerColumn: 15,
    digitsPerColumn: 42,
  },
  standard: {
    key: "standard",
    title: "Standar BUMN & Perbankan",
    subtitle: "12 lajur x 30 detik · Konsistensi fokus 6 menit",
    columns: 12,
    secondsPerColumn: 30,
    digitsPerColumn: 45,
  },
  endurance: {
    key: "endurance",
    title: "Ketahanan Penuh Pauli",
    subtitle: "16 lajur x 45 detik · Uji stamina 12 menit",
    columns: 16,
    secondsPerColumn: 45,
    digitsPerColumn: 50,
  },
};

export interface KraepelinColumn {
  index: number;
  digits: number[];
  expectedSums: number[];
}

export interface KraepelinColumnStat {
  columnIndex: number;
  answered: number;
  correct: number;
  accuracyPct: number;
}

export interface KraepelinEvaluation {
  totalAnswered: number;
  totalCorrect: number;
  accuracyPct: number;
  avgPerColumn: number;
  panker: { score: number; label: string; rawText: string };
  tianker: { score: number; label: string; rawText: string };
  janker: { score: number; label: string; rawText: string };
  hanker: { score: number; label: string; rawText: string; slopePct: number };
  compositeScore: number;
  columnStats: KraepelinColumnStat[];
}

export function generateKraepelinColumns(
  seed: string,
  columnCount: number,
  digitsPerColumn = 45,
): KraepelinColumn[] {
  const rng = createQuestionRandom(hashQuestionSeed(seed));
  const cols: KraepelinColumn[] = [];
  for (let c = 0; c < columnCount; c += 1) {
    const digits: number[] = [];
    for (let d = 0; d < digitsPerColumn; d += 1) {
      digits.push(1 + Math.floor(rng() * 9));
    }
    const expectedSums: number[] = [];
    for (let d = 0; d < digits.length - 1; d += 1) {
      expectedSums.push((digits[d] + digits[d + 1]) % 10);
    }
    cols.push({ index: c, digits, expectedSums });
  }
  return cols;
}

export function evaluateKraepelinSession(
  columns: KraepelinColumn[],
  userAnswersPerColumn: number[][],
  secondsPerColumn: number,
): KraepelinEvaluation {
  const columnStats: KraepelinColumnStat[] = columns.map((col, idx) => {
    const answers = userAnswersPerColumn[idx] ?? [];
    const usable = Math.min(answers.length, col.expectedSums.length);
    let correct = 0;
    for (let i = 0; i < usable; i += 1) {
      if (answers[i] === col.expectedSums[i]) correct += 1;
    }
    const accuracyPct = usable > 0 ? Math.round((correct * 100) / usable) : 0;
    return {
      columnIndex: idx,
      answered: usable,
      correct,
      accuracyPct,
    };
  });

  const n = Math.max(1, columnStats.length);
  const totalAnswered = columnStats.reduce((s, c) => s + c.answered, 0);
  const totalCorrect = columnStats.reduce((s, c) => s + c.correct, 0);
  const accuracyPct = totalAnswered > 0 ? Math.round((totalCorrect * 100) / totalAnswered) : 0;
  const avgPerColumn = Number((totalAnswered / n).toFixed(1));

  // Panker (Kecepatan): expected target ~0.8 items/sec benchmark scaled to column duration
  const targetPerCol = Math.max(8, Math.round(secondsPerColumn * 0.75));
  const pankerScore = Math.min(100, Math.round((avgPerColumn / targetPerCol) * 100));
  const pankerLabel = pankerScore >= 80 ? "Cepat" : pankerScore >= 55 ? "Stabil" : "Perlu Percepatan";

  // Tianker (Ketelitian): accuracy percentage
  const tiankerScore = accuracyPct;
  const errorCount = Math.max(0, totalAnswered - totalCorrect);
  const tiankerLabel = accuracyPct >= 92 ? "Sangat Teliti" : accuracyPct >= 80 ? "Teliti" : "Rentan Tergesa";

  // Janker (Keajegan / Stabilitas antar-lajur): inverse coefficient of variation
  const mean = totalAnswered / n;
  const variance = columnStats.reduce((s, c) => s + Math.pow(c.answered - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);
  const cv = mean > 0 ? stdDev / mean : 1;
  const jankerScore = totalAnswered > 0 ? Math.max(0, Math.min(100, Math.round((1 - Math.min(1, cv * 1.4)) * 100))) : 0;
  const jankerLabel = jankerScore >= 80 ? "Konsisten" : jankerScore >= 60 ? "Cukup Stabil" : "Fluktuatif";

  // Hanker (Ketahanan Stamina): second half vs first half throughput change
  const half = Math.max(1, Math.floor(n / 2));
  const firstHalfAvg = columnStats.slice(0, half).reduce((s, c) => s + c.answered, 0) / half;
  const secondHalfCount = Math.max(1, n - half);
  const secondHalfAvg = columnStats.slice(half).reduce((s, c) => s + c.answered, 0) / secondHalfCount;
  const slopePct = firstHalfAvg > 0
    ? Math.round(((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100)
    : 0;
  const hankerScore = totalAnswered > 0
    ? Math.max(0, Math.min(100, Math.round(80 + slopePct * 0.8)))
    : 0;
  const hankerLabel = slopePct >= 4 ? "Menanjak" : slopePct >= -8 ? "Stabil Kuat" : "Menurun di Akhir";

  const compositeScore = Math.round(
    pankerScore * 0.25 + tiankerScore * 0.35 + jankerScore * 0.2 + hankerScore * 0.2,
  );

  return {
    totalAnswered,
    totalCorrect,
    accuracyPct,
    avgPerColumn,
    panker: {
      score: pankerScore,
      label: pankerLabel,
      rawText: `${avgPerColumn} hitungan/lajur`,
    },
    tianker: {
      score: tiankerScore,
      label: tiankerLabel,
      rawText: `${accuracyPct}% akurat (${errorCount} keliru)`,
    },
    janker: {
      score: jankerScore,
      label: jankerLabel,
      rawText: `Simpangan ${stdDev.toFixed(1)}`,
    },
    hanker: {
      score: hankerScore,
      label: hankerLabel,
      rawText: `${slopePct >= 0 ? "+" : ""}${slopePct}% paruh akhir`,
      slopePct,
    },
    compositeScore,
    columnStats,
  };
}
