import type {
  CategoryBreakdownItem,
  CpnsQuotaTrack,
  OfficialScoreSummary,
  OfficialSubtestScore,
  QuestionItem,
  QuizResultPayload,
} from "../types";

export function areAnswersEqual(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  if (!a || !b) return false;
  return String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
}

const TWK_TYPES = new Set([
  "national foundation",
  "government & public administration",
  "indonesian history",
  "bahasa indonesia",
  "twk",
]);

const TIU_TYPES = new Set([
  "verbal reasoning",
  "quantitative reasoning",
  "logical reasoning",
  "abstract reasoning",
  "numerical matrix",
  "aljabar",
  "analisis visual",
  "tiu",
]);

const TKP_TYPES = new Set([
  "work personality",
  "behavioral competencies",
  "situational judgement",
  "tkp",
]);

function evaluateBinaryPointsGroup(
  label: string,
  indices: number[],
  questions: QuestionItem[],
  userAnswers: (string | null)[],
  pointsPerCorrect: number,
  passingRatio: number,
): OfficialSubtestScore {
  let pts = 0;
  indices.forEach((idx) => {
    const q = questions[idx];
    const ans = userAnswers[idx];
    if (ans && areAnswersEqual(ans, q.correct)) {
      pts += pointsPerCorrect;
    }
  });
  const maxPoints = indices.length * pointsPerCorrect;
  const passingPoints = Math.round(maxPoints * passingRatio);
  return {
    label,
    points: pts,
    maxPoints,
    passingPoints,
    passed: pts >= passingPoints,
    delta: pts - passingPoints,
    questionCount: indices.length,
  };
}

function evaluateWeightedPointsGroup(
  label: string,
  indices: number[],
  questions: QuestionItem[],
  userAnswers: (string | null)[],
  passingRatio: number,
): OfficialSubtestScore {
  let pts = 0;
  let maxPoints = 0;
  indices.forEach((idx) => {
    const q = questions[idx];
    const ans = userAnswers[idx];
    const hasScores = Boolean(q.scores && Object.keys(q.scores).length > 0);
    const qMax = hasScores
      ? Math.max(5, ...Object.values(q.scores!).map(Number))
      : 5;
    maxPoints += qMax;
    if (!ans) return;
    if (hasScores) {
      pts += Number(q.scores?.[ans.toLowerCase()] ?? 0);
    } else if (areAnswersEqual(ans, q.correct)) {
      pts += qMax;
    }
  });
  const passingPoints = Math.round(maxPoints * passingRatio);
  return {
    label,
    points: pts,
    maxPoints,
    passingPoints,
    passed: pts >= passingPoints,
    delta: pts - passingPoints,
    questionCount: indices.length,
  };
}

export function computeOfficialScoreSummary(
  quizName: string,
  questions: QuestionItem[],
  userAnswers: (string | null)[],
  options?: { cpnsQuotaTrack?: CpnsQuotaTrack },
): OfficialScoreSummary | undefined {
  if (questions.length === 0) return undefined;
  const nameLower = quizName.toLowerCase();

  // 1. SKD CPNS Resmi / Simulasi SKD (KepmenPANRB 674/2026 & PermenPANRB 18/2026)
  if (
    nameLower.includes("skd") ||
    nameLower.includes("seleksi kompetensi dasar")
  ) {
    const quotaTrack: CpnsQuotaTrack = options?.cpnsQuotaTrack ?? "umum";
    const twkIdx: number[] = [];
    const tiuIdx: number[] = [];
    const tkpIdx: number[] = [];
    questions.forEach((q, idx) => {
      const t = (q.type || "").trim().toLowerCase();
      if (TWK_TYPES.has(t)) twkIdx.push(idx);
      else if (TIU_TYPES.has(t)) tiuIdx.push(idx);
      else if (TKP_TYPES.has(t) || (q.scores && Object.keys(q.scores).length > 0)) {
        tkpIdx.push(idx);
      }
    });

    const tiuRatio = quotaTrack === "cumlaude_diaspora"
      ? 85 / 175
      : quotaTrack === "disabilitas_papua"
        ? 60 / 175
        : 80 / 175;
    const twkRatio = quotaTrack === "umum" ? 65 / 150 : 0;
    const tkpRatio = quotaTrack === "umum" ? 166 / 225 : 0;

    const subtests: OfficialSubtestScore[] = [];
    if (twkIdx.length > 0) {
      subtests.push(
        evaluateBinaryPointsGroup("TWK", twkIdx, questions, userAnswers, 5, twkRatio),
      );
    }
    if (tiuIdx.length > 0) {
      subtests.push(
        evaluateBinaryPointsGroup("TIU", tiuIdx, questions, userAnswers, 5, tiuRatio),
      );
    }
    if (tkpIdx.length > 0) {
      subtests.push(
        evaluateWeightedPointsGroup("TKP", tkpIdx, questions, userAnswers, tkpRatio),
      );
    }

    if (subtests.length >= 2) {
      const totalPoints = subtests.reduce((s, x) => s + x.points, 0);
      const maxPoints = subtests.reduce((s, x) => s + x.maxPoints, 0);
      const twkSub = subtests.find((s) => s.label === "TWK");
      const tiuSub = subtests.find((s) => s.label === "TIU");
      const tkpSub = subtests.find((s) => s.label === "TKP");

      const umumPassed = Boolean(
        (!twkSub || twkSub.points >= Math.round(twkSub.maxPoints * (65 / 150))) &&
        (!tiuSub || tiuSub.points >= Math.round(tiuSub.maxPoints * (80 / 175))) &&
        (!tkpSub || tkpSub.points >= Math.round(tkpSub.maxPoints * (166 / 225))),
      );
      const umumMin = Math.round(maxPoints * (311 / 550));
      const cumLaudeMin = Math.round(maxPoints * (311 / 550));
      const tiuCumLaudeMin = tiuSub ? Math.round(tiuSub.maxPoints * (85 / 175)) : 0;
      const cumLaudePassed = totalPoints >= cumLaudeMin && (!tiuSub || tiuSub.points >= tiuCumLaudeMin);

      const disabilitasMin = Math.round(maxPoints * (286 / 550));
      const tiuDisabilitasMin = tiuSub ? Math.round(tiuSub.maxPoints * (60 / 175)) : 0;
      const disabilitasPassed = totalPoints >= disabilitasMin && (!tiuSub || tiuSub.points >= tiuDisabilitasMin);

      const passed = quotaTrack === "cumlaude_diaspora"
        ? cumLaudePassed
        : quotaTrack === "disabilitas_papua"
          ? disabilitasPassed
          : umumPassed;

      const examLabel = quotaTrack === "cumlaude_diaspora"
        ? "Passing Grade SKD (Cum Laude / Diaspora)"
        : quotaTrack === "disabilitas_papua"
          ? "Passing Grade SKD (Disabilitas / Papua)"
          : "Standar Passing Grade SKD CAT BKN";

      const isFullScale = questions.length >= 100;
      const thresholdText = quotaTrack === "cumlaude_diaspora"
        ? (isFullScale
          ? "Ambang Cum Laude & Diaspora 2026: Kumulatif >= 311/550 · TIU >= 85/175."
          : "Ambang proporsional Cum Laude/Diaspora setara Kumulatif >= 311/550 · TIU >= 85/175.")
        : quotaTrack === "disabilitas_papua"
          ? (isFullScale
            ? "Ambang Disabilitas & Papua 2026: Kumulatif >= 286/550 · TIU >= 60/175."
            : "Ambang proporsional Disabilitas/Papua setara Kumulatif >= 286/550 · TIU >= 60/175.")
          : (isFullScale
            ? "Ambang batas resmi: TWK >= 65/150 · TIU >= 80/175 · TKP >= 166/225."
            : "Ambang batas proporsional setara TWK 65/150 · TIU 80/175 · TKP 166/225.");

      return {
        examLabel,
        totalPoints,
        maxPoints,
        passed,
        scaleNote: `${thresholdText} Prioritas seri 3x formasi: TKP -> TIU -> TWK.`,
        subtests,
        tierBenchmarks: [
          { label: "Umum", minPoints: umumMin, reached: umumPassed },
          { label: "Cum Laude/Diaspora", minPoints: cumLaudeMin, reached: cumLaudePassed },
          { label: "Disabilitas/Papua", minPoints: disabilitasMin, reached: disabilitasPassed },
        ],
      };
    }
  }

  // 2. Simulasi Resmi TBS LPDP
  const isTbsFull =
    nameLower.includes("tbs") ||
    nameLower.includes("lpdp") ||
    questions.some((q) => (q.type || "").toLowerCase().startsWith("tbs "));
  if (isTbsFull && questions.length >= 3) {
    const verbalIdx: number[] = [];
    const quantIdx: number[] = [];
    const probIdx: number[] = [];
    questions.forEach((q, idx) => {
      const t = (q.type || "").trim().toLowerCase();
      if (t.includes("verbal")) verbalIdx.push(idx);
      else if (t.includes("kuantitatif") || t.includes("quantitative")) quantIdx.push(idx);
      else probIdx.push(idx);
    });

    const subtests: OfficialSubtestScore[] = [];
    if (verbalIdx.length > 0) {
      subtests.push(
        evaluateBinaryPointsGroup("Penalaran Verbal", verbalIdx, questions, userAnswers, 5, 0.55),
      );
    }
    if (quantIdx.length > 0) {
      subtests.push(
        evaluateBinaryPointsGroup("Penalaran Kuantitatif", quantIdx, questions, userAnswers, 5, 0.55),
      );
    }
    if (probIdx.length > 0) {
      subtests.push(
        evaluateBinaryPointsGroup("Pemecahan Masalah", probIdx, questions, userAnswers, 5, 0.55),
      );
    }

    const totalPoints = subtests.reduce((s, x) => s + x.points, 0);
    const maxPoints = subtests.reduce((s, x) => s + x.maxPoints, 0);
    const regulerMin = Math.round(maxPoints * (165 / 300));
    const targetedMin = Math.round(maxPoints * (145 / 300));
    const afirmasiMin = Math.round(maxPoints * (120 / 300));

    return {
      examLabel: "Proyeksi Skor TBS LPDP (Skala 0–300)",
      totalPoints,
      maxPoints,
      passed: totalPoints >= regulerMin,
      scaleNote:
        "Estimasi referensi (5 poin/benar): Afirmasi ≥ 120 · Targeted ≥ 145 · Reguler ≥ 165 dari 300.",
      subtests,
      tierBenchmarks: [
        { label: "Afirmasi", minPoints: afirmasiMin, reached: totalPoints >= afirmasiMin },
        { label: "Targeted", minPoints: targetedMin, reached: totalPoints >= targetedMin },
        { label: "Reguler", minPoints: regulerMin, reached: totalPoints >= regulerMin },
      ],
    };
  }

  // 3. BUMN & PCPM Bank Indonesia multi-subtest batteries
  if (
    nameLower.includes("bumn") ||
    nameLower.includes("pcpm") ||
    nameLower.includes("bank indonesia")
  ) {
    const isPcpm = nameLower.includes("pcpm") || nameLower.includes("bank indonesia");
    const groups = new Map<string, number[]>();
    questions.forEach((q, idx) => {
      const t = (q.type || "").trim().toLowerCase();
      let label = "Kompetensi Inti";
      if (isPcpm) {
        if (TIU_TYPES.has(t)) label = "Tes Potensi Dasar";
        else label = "Kebanksentralan & Ekonomi";
      } else {
        if (t === "attention to detail") label = "Ketelitian";
        else if (TKP_TYPES.has(t) || (q.scores && Object.keys(q.scores).length > 0)) {
          label = "AKHLAK Core Values";
        } else if (TWK_TYPES.has(t)) label = "Wawasan Kebangsaan";
        else label = "TKD Kognitif";
      }
      const list = groups.get(label) || [];
      list.push(idx);
      groups.set(label, list);
    });

    if (groups.size >= 2) {
      const subtests: OfficialSubtestScore[] = [];
      const passRatio = isPcpm ? 0.72 : 0.7;
      groups.forEach((idxs, label) => {
        const isWeighted = idxs.some((i) => Boolean(questions[i].scores && Object.keys(questions[i].scores!).length > 0));
        if (isWeighted) {
          subtests.push(
            evaluateWeightedPointsGroup(label, idxs, questions, userAnswers, passRatio),
          );
        } else {
          subtests.push(
            evaluateBinaryPointsGroup(label, idxs, questions, userAnswers, 5, passRatio),
          );
        }
      });
      const totalPoints = subtests.reduce((s, x) => s + x.points, 0);
      const maxPoints = subtests.reduce((s, x) => s + x.maxPoints, 0);
      return {
        examLabel: isPcpm
          ? "Evaluasi Ambang Batas PCPM BI"
          : "Evaluasi Ambang Batas TKD & AKHLAK BUMN",
        totalPoints,
        maxPoints,
        passed: subtests.every((s) => s.passed),
        scaleNote: isPcpm
          ? "Target minimum kelulusan setiap komponen PCPM BI: ≥ 72%."
          : "Target minimum kelulusan setiap sub-tes BUMN: ≥ 70%.",
        subtests,
      };
    }
  }

  return undefined;
}

export function evaluateQuizSession(
  questions: QuestionItem[],
  userAnswers: (string | null)[],
  flaggedIndices: number[],
  timeTaken: number,
  totalTime: number,
  source: "exercise" | "assessment",
  quizName: string,
  questionDurationsSec?: number[],
  options?: { cpnsQuotaTrack?: CpnsQuotaTrack; cpnsSensoryNetra?: boolean },
): QuizResultPayload {
  const isSJT = questions.some(
    (q) => q.scores && Object.keys(q.scores).length > 0,
  );

  let correctAnswers = 0;
  let incorrectAnswers = 0;
  let unanswered = 0;
  let rawPoints = 0;
  let maxPoints = 0;

  const breakdownMap: Record<
    string,
    {
      correct: number;
      total: number;
      score: number;
      maxScore: number;
      durationSum: number;
    }
  > = {};

  questions.forEach((q, idx) => {
    const ans = userAnswers[idx] ?? null;
    const catKey = q.type || q.category || "Umum";
    if (!breakdownMap[catKey]) {
      breakdownMap[catKey] = {
        correct: 0,
        total: 0,
        score: 0,
        maxScore: 0,
        durationSum: 0,
      };
    }
    breakdownMap[catKey].total += 1;
    if (questionDurationsSec && idx < questionDurationsSec.length) {
      breakdownMap[catKey].durationSum += Math.max(
        0,
        Number(questionDurationsSec[idx]) || 0,
      );
    }

    if (q.scores && Object.keys(q.scores).length > 0) {
      const qMax = Math.max(0, ...Object.values(q.scores).map(Number));
      maxPoints += qMax;
      breakdownMap[catKey].maxScore += qMax;

      if (!ans) {
        unanswered += 1;
      } else {
        const pts = Number(q.scores[ans.toLowerCase()] ?? 0);
        rawPoints += pts;
        breakdownMap[catKey].score += pts;
        if (pts >= 4 || (qMax > 0 && pts >= qMax)) {
          correctAnswers += 1;
          breakdownMap[catKey].correct += 1;
        } else {
          incorrectAnswers += 1;
        }
      }
    } else {
      maxPoints += 1;
      breakdownMap[catKey].maxScore += 1;
      if (!ans) {
        unanswered += 1;
      } else if (areAnswersEqual(ans, q.correct)) {
        correctAnswers += 1;
        rawPoints += 1;
        breakdownMap[catKey].correct += 1;
        breakdownMap[catKey].score += 1;
      } else {
        incorrectAnswers += 1;
      }
    }
  });

  const totalCount = questions.length;
  const percentage =
    totalCount === 0 || maxPoints === 0
      ? 0
      : Math.round((rawPoints / maxPoints) * 100);

  const safeElapsed = Math.max(0, Math.round(timeTaken));
  const hasExplicitDurations = Boolean(
    questionDurationsSec &&
      questionDurationsSec.some((d) => Number(d) > 0),
  );
  const globalAvgSec =
    totalCount > 0 ? Math.round(safeElapsed / totalCount) : 0;

  const categoryBreakdown: CategoryBreakdownItem[] = Object.entries(
    breakdownMap,
  ).map(([type, stat]) => ({
    type,
    correct: stat.correct,
    total: stat.total,
    score: stat.score,
    maxScore: stat.maxScore,
    percentage:
      stat.maxScore > 0 ? Math.round((stat.score / stat.maxScore) * 100) : 0,
    avgSeconds:
      stat.total > 0
        ? hasExplicitDurations
          ? Math.round(stat.durationSum / stat.total)
          : globalAvgSec
        : 0,
  }));

  const sortedForFocus = [...categoryBreakdown].sort((a, b) => {
    if (a.percentage !== b.percentage) return a.percentage - b.percentage;
    return (b.avgSeconds ?? 0) - (a.avgSeconds ?? 0);
  });
  const focusTopic = sortedForFocus[0]?.type;

  const safeTotalLimit = Math.max(0, Math.round(totalTime));
  const targetSecondsPerQuestion =
    totalCount > 0 && safeTotalLimit > 0
      ? Math.round(safeTotalLimit / totalCount)
      : 60;

  const officialSummary = computeOfficialScoreSummary(
    quizName,
    questions,
    userAnswers,
    options,
  );

  return {
    score: percentage,
    rawPoints,
    maxPoints,
    isSJT,
    questions,
    userAnswers,
    flaggedIndices,
    timeTaken: safeElapsed,
    totalTime: safeTotalLimit,
    correctAnswers,
    incorrectAnswers,
    unanswered,
    source,
    quizName,
    categoryBreakdown,
    questionDurationsSec,
    targetSecondsPerQuestion,
    focusTopic,
    officialSummary,
    ...(options?.cpnsQuotaTrack ? { cpnsQuotaTrack: options.cpnsQuotaTrack } : {}),
    ...(options?.cpnsSensoryNetra ? { cpnsSensoryNetra: true } : {}),
  };
}
