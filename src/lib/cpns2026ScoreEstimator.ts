import type { CpnsQuotaTrack } from "../types";

export type CpnsAgencyType = "pusat" | "daerah";
export type SkbCatQuestionCount = 80 | 100;

export interface Skd2026EligibilityInput {
  twk: number;
  tiu: number;
  tkp: number;
  quotaTrack: CpnsQuotaTrack;
}

export interface Skd2026EligibilityResult {
  twk: number;
  tiu: number;
  tkp: number;
  totalSkd: number;
  skdScale100: number;
  weightedSkd40: number;
  passedPg: boolean;
  reuse2024Eligible: boolean;
  reason: string;
}

export interface Cpns2026FinalScoreInput {
  twk: number;
  tiu: number;
  tkp: number;
  quotaTrack: CpnsQuotaTrack;
  agencyType: CpnsAgencyType;
  skbCatQuestionCount: SkbCatQuestionCount;
  skbCatCorrect: number;
  additionalSkbWeightPct?: number;
  additionalSkbScore100?: number;
  interviewWeightPct?: number;
  kdkmpKnmpEnabled?: boolean;
  tpkScore?: number;
}

export interface Cpns2026FinalScoreResult {
  skd: Skd2026EligibilityResult;
  agencyType: CpnsAgencyType;
  skbCatQuestionCount: SkbCatQuestionCount;
  skbCatDurationMinutes: number;
  skbCatPoints: number;
  skbCatMaxPoints: number;
  skbCatScale100: number;
  catWeightPct: number;
  additionalWeightPct: number;
  interviewWeightPct: number;
  kdkmpBonusApplied: boolean;
  kdkmpBonusPct: number;
  combinedSkb100: number;
  weightedSkb60: number;
  finalScore100: number;
  warnings: string[];
  tieBreakerOrder: string[];
}

export const CPNS_2026_TIE_BREAKER_ORDER = [
  "Nilai Kumulatif SKD",
  "TKP",
  "TIU",
  "TWK",
  "IPK / Rata-rata Ijazah",
  "Usia Tertinggi",
];

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

export function evaluateSkd2026Eligibility(
  input: Skd2026EligibilityInput,
): Skd2026EligibilityResult {
  const twk = Math.round(clamp(input.twk, 0, 150));
  const tiu = Math.round(clamp(input.tiu, 0, 175));
  const tkp = Math.round(clamp(input.tkp, 0, 225));
  const totalSkd = twk + tiu + tkp;
  const skdScale100 = round3((totalSkd / 550) * 100);
  const weightedSkd40 = round3(skdScale100 * 0.4);

  let passedPg = false;
  let reason = "";

  if (input.quotaTrack === "cumlaude_diaspora") {
    passedPg = totalSkd >= 311 && tiu >= 85;
    reason = passedPg
      ? "Memenuhi ambang Cum Laude/Diaspora (Total >= 311 dan TIU >= 85). Memenuhi syarat nilai SKD 2024 bila NIK, jenjang pendidikan, dan administrasi 2026 sesuai."
      : "Belum memenuhi ambang Cum Laude/Diaspora (Total >= 311 dan TIU >= 85).";
  } else if (input.quotaTrack === "disabilitas_papua") {
    passedPg = totalSkd >= 286 && tiu >= 60;
    reason = passedPg
      ? "Memenuhi ambang Disabilitas/Papua (Total >= 286 dan TIU >= 60). Memenuhi syarat nilai SKD 2024 bila NIK, jenjang pendidikan, dan administrasi 2026 sesuai."
      : "Belum memenuhi ambang Disabilitas/Papua (Total >= 286 dan TIU >= 60).";
  } else {
    passedPg = twk >= 65 && tiu >= 80 && tkp >= 166;
    reason = passedPg
      ? "Memenuhi ambang Umum (TWK >= 65, TIU >= 80, TKP >= 166). Layak memakai nilai SKD 2024 jika NIK & jenjang sama dan lulus administrasi 2026."
      : "Belum memenuhi ambang Umum (TWK >= 65, TIU >= 80, TKP >= 166). Disarankan mengikuti ujian SKD 2026.";
  }

  return {
    twk,
    tiu,
    tkp,
    totalSkd,
    skdScale100,
    weightedSkd40,
    passedPg,
    reuse2024Eligible: passedPg,
    reason,
  };
}

export function calculateCpns2026FinalScore(
  input: Cpns2026FinalScoreInput,
): Cpns2026FinalScoreResult {
  const skd = evaluateSkd2026Eligibility({
    twk: input.twk,
    tiu: input.tiu,
    tkp: input.tkp,
    quotaTrack: input.quotaTrack,
  });

  const warnings: string[] = [];
  const skbCatQuestionCount: SkbCatQuestionCount = input.skbCatQuestionCount === 80 ? 80 : 100;
  const skbCatMaxPoints = skbCatQuestionCount * 5;
  const skbCatCorrect = Math.round(clamp(input.skbCatCorrect, 0, skbCatQuestionCount));
  const skbCatPoints = skbCatCorrect * 5;
  const skbCatScale100 = round3((skbCatPoints / skbCatMaxPoints) * 100);

  const rawAdditionalWeight = Math.max(0, Number(input.additionalSkbWeightPct) || 0);
  const rawInterviewWeight = Math.max(0, Number(input.interviewWeightPct) || 0);
  const rawAdditionalScore = clamp(Number(input.additionalSkbScore100) || 0, 0, 100);

  let additionalWeightPct = 0;
  let interviewWeightPct = 0;

  if (input.agencyType === "daerah") {
    if (rawAdditionalWeight > 40) {
      warnings.push("Instansi Daerah membatasi total SKB tambahan maksimal 40% (CAT BKN minimal 60%).");
    }
    if (rawInterviewWeight > 0) {
      warnings.push("PermenPANRB 18/2026 Pasal 32 melarang tes wawancara pada SKB Instansi Daerah (bobot dihitung 0%).");
    }
    additionalWeightPct = Math.round(clamp(rawAdditionalWeight, 0, 40));
    interviewWeightPct = 0;
  } else {
    if (rawAdditionalWeight > 50) {
      warnings.push("Instansi Pusat membatasi total SKB tambahan maksimal 50% (CAT BKN minimal 50%).");
    }
    additionalWeightPct = Math.round(clamp(rawAdditionalWeight, 0, 50));
    const maxInterview = Math.min(10, additionalWeightPct);
    if (rawInterviewWeight > 10) {
      warnings.push("Bobot wawancara pada Instansi Pusat dibatasi maksimal 10% dari nilai SKB (Pasal 31).");
    }
    interviewWeightPct = Math.round(clamp(rawInterviewWeight, 0, maxInterview));
  }

  const catWeightPct = 100 - additionalWeightPct;
  const baseSkb100 =
    skbCatScale100 * (catWeightPct / 100) +
    rawAdditionalScore * (additionalWeightPct / 100);

  const kdkmpEnabled = Boolean(input.kdkmpKnmpEnabled);
  const tpkScore = Math.max(0, Number(input.tpkScore) || 0);
  const kdkmpBonusApplied = kdkmpEnabled && tpkScore >= 120;
  const kdkmpBonusPct = kdkmpBonusApplied ? 10 : 0;

  if (kdkmpEnabled && tpkScore < 120) {
    warnings.push("Tambahan nilai +10% SDM KDKMP/KNMP mensyaratkan skor Tes Potensi Kognitif (TPK) >= 120.");
  }

  const combinedSkb100 = round3(Math.min(100, baseSkb100 + kdkmpBonusPct));
  const weightedSkb60 = round3(combinedSkb100 * 0.6);
  const finalScore100 = round3(skd.weightedSkd40 + weightedSkb60);

  return {
    skd,
    agencyType: input.agencyType,
    skbCatQuestionCount,
    skbCatDurationMinutes: 90,
    skbCatPoints,
    skbCatMaxPoints,
    skbCatScale100,
    catWeightPct,
    additionalWeightPct,
    interviewWeightPct,
    kdkmpBonusApplied,
    kdkmpBonusPct,
    combinedSkb100,
    weightedSkb60,
    finalScore100,
    warnings,
    tieBreakerOrder: CPNS_2026_TIE_BREAKER_ORDER,
  };
}
