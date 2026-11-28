import { ASSESSMENT_CATEGORIES, EXERCISE_DOMAINS } from "../data/curriculum";
import { DEFAULT_ARTIFACTS } from "../data/artifactsCatalog";
import { KIPRAH_STORAGE_KEYS } from "./sessionCleanup";
import type {
  ArtifactItem,
  AttemptRecord,
  CareerRoadmapBlueprint,
  DailyProgressState,
  EvaluatedCurriculumRoadmap,
  EvaluatedRoadmapModule,
  EvaluatedRoadmapPhase,
  RoadmapModuleBlueprint,
  RoadmapModuleStatus,
  SmartDailyMission,
} from "../types";

export const DEFAULT_DAILY_PROGRESS_STATE: DailyProgressState = {
  artifactReadToday: false,
  mistakeEvaluatedToday: false,
  manualDoneIds: [],
};

export function toLocalISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function loadDailyProgressState(todayISO: string): DailyProgressState {
  if (typeof window === "undefined" || !window.localStorage) {
    return { ...DEFAULT_DAILY_PROGRESS_STATE };
  }
  const key = `${KIPRAH_STORAGE_KEYS.dailyTodosPrefix}${todayISO}`;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { ...DEFAULT_DAILY_PROGRESS_STATE };
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return { ...DEFAULT_DAILY_PROGRESS_STATE };
    }
    return {
      artifactReadToday: Boolean(parsed?.artifactReadToday),
      mistakeEvaluatedToday: Boolean(parsed?.mistakeEvaluatedToday),
      manualDoneIds: Array.isArray(parsed?.manualDoneIds)
        ? parsed.manualDoneIds.map(String)
        : [],
    };
  } catch {
    return { ...DEFAULT_DAILY_PROGRESS_STATE };
  }
}

export function saveDailyProgressState(
  todayISO: string,
  state: DailyProgressState,
): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  const key = `${KIPRAH_STORAGE_KEYS.dailyTodosPrefix}${todayISO}`;
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch {
    // ignore storage quota errors
  }
}

function findExerciseTopic(type: string) {
  for (const dom of EXERCISE_DOMAINS) {
    const match = dom.topics.find(
      (t) => t.type.toLowerCase() === type.toLowerCase(),
    );
    if (match) return match;
  }
  return null;
}

function findAssessmentBattery(type: string) {
  for (const cat of ASSESSMENT_CATEGORIES) {
    const match = cat.batteries.find(
      (b) => b.type.toLowerCase() === type.toLowerCase(),
    );
    if (match) return match;
  }
  return null;
}

function artMod(
  id: string,
  artifactId: number,
  subtitle?: string,
): RoadmapModuleBlueprint {
  const art = DEFAULT_ARTIFACTS.find((a) => Number(a.id) === artifactId);
  return {
    id,
    kind: "artifact",
    title: art?.title || "Bacaan Konseptual",
    subtitle:
      subtitle ||
      art?.summary ||
      "Bacaan esai strategi dan konsep inti seleksi.",
    targetCategory: `artifact:${artifactId}`,
    artifactId,
    defaultMinutes: art?.readTime || 5,
  };
}

function exMod(
  id: string,
  type: string,
  subtitle?: string,
): RoadmapModuleBlueprint {
  const topic = findExerciseTopic(type);
  return {
    id,
    kind: "exercise",
    title: topic?.title || type,
    subtitle: subtitle || topic?.desc || "Latihan fokus terukur per subtes.",
    targetCategory: topic?.type || type,
    matchAliases: topic?.title && topic.title !== topic.type ? [topic.title] : undefined,
    defaultQuestions: topic?.defaultQuestions || 15,
    defaultMinutes: topic?.defaultMinutes || 12,
  };
}

function assMod(
  id: string,
  type: string,
  subtitle?: string,
  matchAliases?: string[],
): RoadmapModuleBlueprint {
  const battery = findAssessmentBattery(type);
  return {
    id,
    kind: "assessment",
    title: battery?.title || type,
    subtitle:
      subtitle ||
      battery?.desc ||
      "Simulasi penuh berstandar waktu CAT sesungguhnya.",
    targetCategory: battery?.type || type,
    matchAliases: [
      ...(battery?.title && battery.title !== battery.type ? [battery.title] : []),
      ...(matchAliases || []),
    ],
    defaultQuestions: battery?.defaultQuestions || 45,
    defaultMinutes: battery?.defaultMinutes || 40,
    assessmentCategories: battery?.exerciseCategories,
    categoryQuotas: battery?.categoryQuotas,
    minAccuracy: battery?.passingScore,
  };
}

export const CAREER_ROADMAP_BLUEPRINTS: Record<string, CareerRoadmapBlueprint> = {
  CPNS: {
    trackKey: "CPNS",
    trackTitle: "Kurikulum CPNS",
    trackSubtitle: "Jalur terstruktur TWK, TIU, TKP hingga simulasi SKD CAT BKN.",
    phases: [
      {
        phaseNumber: 1,
        title: "Fondasi & Konsep SKD",
        subtitle: "Pahami pola soal CAT, pilar kebangsaan, dan nalar verbal dasar.",
        modules: [
          artMod("cpns-1-art", 5),
          exMod("cpns-1-nat", "National Foundation"),
          exMod("cpns-1-verb", "Verbal Reasoning"),
        ],
      },
      {
        phaseNumber: 2,
        title: "Penguasaan Subtes Inti",
        subtitle: "Bangun kecepatan tata kelola publik, Bahasa Indonesia, numerik, dan TKP dasar.",
        modules: [
          exMod("cpns-2-gov", "Government & Public Administration"),
          exMod("cpns-2-bi", "Bahasa Indonesia"),
          exMod("cpns-2-quant", "Quantitative Reasoning"),
          exMod("cpns-2-work", "Work Personality"),
        ],
      },
      {
        phaseNumber: 3,
        title: "Penalaran & Ketahanan Lanjut",
        subtitle: "Asah strategi silogisme analitis serta dilema pelayanan publik.",
        modules: [
          artMod("cpns-3-art", 2),
          exMod("cpns-3-logic", "Logical Reasoning"),
          exMod("cpns-3-sjt", "Situational Judgement"),
        ],
      },
      {
        phaseNumber: 4,
        title: "Simulasi Evaluasi CAT BKN",
        subtitle: "Uji ketahanan skor dan manajemen waktu standar ujian penuh.",
        modules: [
          assMod("cpns-4-twk", "Tes Wawasan Kebangsaan (TWK)"),
          assMod("cpns-4-skd", "Seleksi Kompetensi Dasar (SKD)"),
          assMod("cpns-4-skd-resmi", "SKD CPNS Resmi (110 Soal)"),
        ],
      },
    ],
  },
  BUMN: {
    trackKey: "BUMN",
    trackTitle: "Kurikulum Rekrutmen BUMN",
    trackSubtitle: "Peta belajar TKD, AKHLAK Core Values, ketelitian, dan Bahasa Inggris.",
    phases: [
      {
        phaseNumber: 1,
        title: "Fondasi TKD & Core Values",
        subtitle: "Kuasai pola pikir CAT, nalar verbal, dan orientasi nilai AKHLAK.",
        modules: [
          artMod("bumn-1-art", 5),
          exMod("bumn-1-verb", "Verbal Reasoning"),
          exMod("bumn-1-work", "Work Personality"),
        ],
      },
      {
        phaseNumber: 2,
        title: "Penguasaan Subtes Inti BUMN",
        subtitle: "Mantapkan ketepatan berhitung, logika analitis, dan wawasan kebangsaan.",
        modules: [
          exMod("bumn-2-quant", "Quantitative Reasoning"),
          exMod("bumn-2-logic", "Logical Reasoning"),
          exMod("bumn-2-nat", "National Foundation"),
        ],
      },
      {
        phaseNumber: 3,
        title: "Ketelitian & Bahasa Inggris",
        subtitle: "Tingkatkan kecepatan verifikasi simbol dan pemahaman wacana Inggris.",
        modules: [
          artMod("bumn-3-art", 3),
          exMod("bumn-3-att", "Attention to Detail"),
          exMod("bumn-3-read", "Reading Comprehension"),
        ],
      },
      {
        phaseNumber: 4,
        title: "Simulasi Seleksi Terpadu BUMN",
        subtitle: "Uji komprehensif setara asesmen resmi BUMN dan jalur Management Trainee.",
        modules: [
          assMod("bumn-4-comp", "BUMN Comprehensive Selection"),
          assMod("bumn-4-exec", "BUMN Executive Program"),
        ],
      },
    ],
  },
  "Bank Indonesia": {
    trackKey: "Bank Indonesia",
    trackTitle: "Kurikulum PCPM Bank Indonesia",
    trackSubtitle: "Rute persiapan kebanksentralan, moneter, makroprudensial, dan TPD.",
    phases: [
      {
        phaseNumber: 1,
        title: "Fondasi Kebanksentralan",
        subtitle: "Pahami mandat Bank Indonesia dan prinsip ekonomi makro-mikro.",
        modules: [
          artMod("bi-1-art", 3),
          exMod("bi-1-ess", "BI Essential"),
          exMod("bi-1-econ", "Fundamental Economics"),
        ],
      },
      {
        phaseNumber: 2,
        title: "Kebijakan Moneter & Kognitif",
        subtitle: "Dalami transmisi suku bunga, inflasi, numerik, dan penalaran logika.",
        modules: [
          exMod("bi-2-mon", "Monetary Policy"),
          exMod("bi-2-quant", "Quantitative Reasoning"),
          exMod("bi-2-logic", "Logical Reasoning"),
        ],
      },
      {
        phaseNumber: 3,
        title: "Makroprudensial & Bahasa Bisnis",
        subtitle: "Perkuat stabilitas sistem keuangan serta komunikasi bahasa Inggris bisnis.",
        modules: [
          artMod("bi-3-art", 2),
          exMod("bi-3-macro", "Macroprudential Policy"),
          exMod("bi-3-eng", "Business English"),
        ],
      },
      {
        phaseNumber: 4,
        title: "Simulasi Seleksi PCPM BI",
        subtitle: "Evaluasi total Tes Potensi Dasar dan kompetensi kebanksentralan.",
        modules: [
          assMod("bi-4-tpd", "PCPM - Tes Potensi Dasar"),
          assMod(
            "bi-4-kebank",
            "PCPM - Kebanksentralan",
            undefined,
            ["BI PCPM Fundamental Assessment"],
          ),
          assMod("bi-4-master", "Master Comprehensive Assessment"),
        ],
      },
    ],
  },
  PPPK: {
    trackKey: "PPPK",
    trackTitle: "Kurikulum Seleksi PPPK",
    trackSubtitle: "Fokus kompetensi manajerial, sosial kultural, SJT, dan pelayanan publik.",
    phases: [
      {
        phaseNumber: 1,
        title: "Fondasi Pelayanan & Kebangsaan",
        subtitle: "Bangun pola pikir pelayan publik berintegritas dan dasar konstitusi.",
        modules: [
          artMod("pppk-1-art", 4),
          exMod("pppk-1-work", "Work Personality"),
          exMod("pppk-1-nat", "National Foundation"),
        ],
      },
      {
        phaseNumber: 2,
        title: "Kompetensi Manajerial & SJT",
        subtitle: "Latih ketepatan skor SJT, perilaku kerja, dan administrasi pemerintahan.",
        modules: [
          exMod("pppk-2-sjt", "Situational Judgement"),
          exMod("pppk-2-behav", "Behavioral Competencies"),
          exMod("pppk-2-gov", "Government & Public Administration"),
        ],
      },
      {
        phaseNumber: 3,
        title: "Pemecahan Masalah & Verbal",
        subtitle: "Asah pengambilan keputusan taktis dan pemahaman instruksi kompleks.",
        modules: [
          artMod("pppk-3-art", 2),
          exMod("pppk-3-prob", "Problem Solving"),
          exMod("pppk-3-verb", "Verbal Reasoning"),
        ],
      },
      {
        phaseNumber: 4,
        title: "Simulasi Kompetensi PPPK",
        subtitle: "Uji kesiapan menyeluruh tata kelola publik dan standar CAT nasional.",
        modules: [
          assMod("pppk-4-cert", "Professional Certification Test"),
          assMod("pppk-4-skd", "Seleksi Kompetensi Dasar (SKD)"),
        ],
      },
    ],
  },
  Kedinasan: {
    trackKey: "Kedinasan",
    trackTitle: "Kurikulum Sekolah Kedinasan",
    trackSubtitle: "Persiapan terpadu TWK, TIU figural-numerik, sejarah, hingga CAT SKD.",
    phases: [
      {
        phaseNumber: 1,
        title: "Fondasi SKD Kedinasan",
        subtitle: "Mulai dari metode regulasi beban mental, Pancasila, dan verbal.",
        modules: [
          artMod("kdn-1-art", 5),
          exMod("kdn-1-nat", "National Foundation"),
          exMod("kdn-1-verb", "Verbal Reasoning"),
        ],
      },
      {
        phaseNumber: 2,
        title: "Penguasaan Numerik & Sejarah",
        subtitle: "Tajamkan aritmatika, silogisme, serta sejarah ketatanegaraan Indonesia.",
        modules: [
          exMod("kdn-2-quant", "Quantitative Reasoning"),
          exMod("kdn-2-logic", "Logical Reasoning"),
          exMod("kdn-2-hist", "Indonesian History"),
        ],
      },
      {
        phaseNumber: 3,
        title: "Spasial & Matriks Lanjut",
        subtitle: "Taklukkan soal pola gambar figural dan matriks numerik tingkat lanjut.",
        modules: [
          artMod("kdn-3-art", 2),
          exMod("kdn-3-abs", "Abstract Reasoning"),
          exMod("kdn-3-mat", "Numerical Matrix"),
        ],
      },
      {
        phaseNumber: 4,
        title: "Simulasi CAT Sekolah Kedinasan",
        subtitle: "Simulasi TIU penuh dan paket SKD lengkap berbatas waktu ketat.",
        modules: [
          assMod("kdn-4-tiu", "Tes Intelegensia Umum (TIU)"),
          assMod("kdn-4-skd", "Seleksi Kompetensi Dasar (SKD)"),
        ],
      },
    ],
  },
  "Beasiswa LPDP": {
    trackKey: "Beasiswa LPDP",
    trackTitle: "Kurikulum Beasiswa LPDP",
    trackSubtitle: "Strategi resmi Tes Bakat Skolastik (TBS) LPDP dan penguasaan wacana akademik.",
    phases: [
      {
        phaseNumber: 1,
        title: "Fondasi TBS Verbal & Inggris",
        subtitle: "Perkuat nalar analitis, critical reasoning, dan struktur bahasa Inggris.",
        modules: [
          artMod("lpdp-1-art", 5),
          exMod("lpdp-1-tbs-v", "TBS Penalaran Verbal"),
          exMod("lpdp-1-gram", "Grammar & Structure"),
        ],
      },
      {
        phaseNumber: 2,
        title: "Penalaran Kuantitatif & Wacana",
        subtitle: "Kuasai Data Sufficiency, perbandingan P vs Q, dan wacana akademik.",
        modules: [
          exMod("lpdp-2-tbs-q", "TBS Penalaran Kuantitatif"),
          exMod("lpdp-2-read", "Reading Comprehension"),
          exMod("lpdp-2-logic", "Logical Reasoning"),
        ],
      },
      {
        phaseNumber: 3,
        title: "Pemecahan Masalah & Sintesis Data",
        subtitle: "Latih interpretasi grafik, tabel riset, dan studi kasus kebijakan.",
        modules: [
          artMod("lpdp-3-art", 2),
          exMod("lpdp-3-tbs-p", "TBS Pemecahan Masalah"),
          exMod("lpdp-3-case", "Case Reasoning"),
        ],
      },
      {
        phaseNumber: 4,
        title: "Simulasi Resmi TBS LPDP",
        subtitle: "Simulasi penuh 60 soal / 90 menit dengan proyeksi skala 0–300.",
        modules: [
          assMod("lpdp-4-tbs-q", "TBS LPDP - Penalaran Kuantitatif"),
          assMod("lpdp-4-tbs-full", "Simulasi Resmi TBS LPDP"),
        ],
      },
    ],
  },
};

export function resolveTrackKey(careerGoal?: string): string {
  const goal = (careerGoal || "CPNS").toLowerCase();
  if (goal.includes("bi") || goal.includes("bank indonesia") || goal.includes("pcpm")) {
    return "Bank Indonesia";
  }
  if (goal.includes("bumn")) {
    return "BUMN";
  }
  if (goal.includes("pppk")) {
    return "PPPK";
  }
  if (goal.includes("kedinasan") || goal.includes("stan") || goal.includes("stis")) {
    return "Kedinasan";
  }
  if (goal.includes("lpdp") || goal.includes("beasiswa")) {
    return "Beasiswa LPDP";
  }
  return "CPNS";
}

export function getRoadmapBlueprintForGoal(
  careerGoal?: string,
): CareerRoadmapBlueprint {
  const key = resolveTrackKey(careerGoal);
  return CAREER_ROADMAP_BLUEPRINTS[key] || CAREER_ROADMAP_BLUEPRINTS.CPNS;
}

function getModuleMatchTokens(mod: RoadmapModuleBlueprint): string[] {
  const tokens = [mod.targetCategory, mod.title, ...(mod.matchAliases || [])]
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return Array.from(new Set(tokens));
}

export function evaluateCurriculumRoadmap(params: {
  careerGoal?: string;
  targetAccuracy?: number;
  attempts: AttemptRecord[];
  readArtifactIds: string[];
  diagnosticWeakTopics?: string[];
}): EvaluatedCurriculumRoadmap {
  const blueprint = getRoadmapBlueprintForGoal(params.careerGoal);
  const baseTarget = Math.min(95, Math.max(60, Math.round(params.targetAccuracy || 80)));
  const readSet = new Set(params.readArtifactIds.map(String));
  const weakSet = new Set((params.diagnosticWeakTopics ?? []).map((t) => t.trim().toLowerCase()));

  const tempPhases = blueprint.phases.map((phase) => {
    const evaluatedModules: EvaluatedRoadmapModule[] = phase.modules.map((mod) => {
      if (mod.kind === "artifact") {
        const isRead =
          mod.artifactId !== undefined && readSet.has(String(mod.artifactId));
        return {
          ...mod,
          phaseNumber: phase.phaseNumber,
          status: isRead ? "mastered" : "pending",
          attemptsCount: isRead ? 1 : 0,
          bestScore: isRead ? 100 : null,
          latestScore: isRead ? 100 : null,
          requiredAccuracy: 100,
          isNextRecommended: false,
          isDiagnosticPriority: false,
        };
      }

      const requiredAccuracy =
        mod.minAccuracy ??
        (mod.kind === "assessment"
          ? Math.max(60, Math.min(90, baseTarget - 5))
          : baseTarget);

      const tokens = getModuleMatchTokens(mod);
      const isDiagnosticPriority = tokens.some((token) => weakSet.has(token));
      const matchingAttempts = params.attempts.filter((a) =>
        tokens.includes((a.subject_category || "").trim().toLowerCase()),
      );

      if (matchingAttempts.length === 0) {
        return {
          ...mod,
          phaseNumber: phase.phaseNumber,
          status: "pending" as RoadmapModuleStatus,
          attemptsCount: 0,
          bestScore: null,
          latestScore: null,
          requiredAccuracy,
          isNextRecommended: false,
          isDiagnosticPriority,
        };
      }

      const bestScore = Math.max(
        ...matchingAttempts.map((a) => Math.round(Number(a.score) || 0)),
      );
      const latestScore = Math.round(Number(matchingAttempts[0]?.score) || 0);
      const status: RoadmapModuleStatus =
        bestScore >= requiredAccuracy ? "mastered" : "reinforce";

      return {
        ...mod,
        phaseNumber: phase.phaseNumber,
        status,
        attemptsCount: matchingAttempts.length,
        bestScore,
        latestScore,
        requiredAccuracy,
        isNextRecommended: false,
        isDiagnosticPriority: status !== "mastered" && isDiagnosticPriority,
      };
    });

    const masteredCount = evaluatedModules.filter(
      (m) => m.status === "mastered",
    ).length;
    const totalCount = evaluatedModules.length;
    const progressPct =
      totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;

    return {
      phaseNumber: phase.phaseNumber,
      title: phase.title,
      subtitle: phase.subtitle,
      modules: evaluatedModules,
      masteredCount,
      totalCount,
      progressPct,
      isCurrentPhase: false,
    };
  });

  const firstIncompletePhase = tempPhases.find(
    (p) => p.masteredCount < p.totalCount,
  );
  const activePhaseNumber: 1 | 2 | 3 | 4 =
    firstIncompletePhase?.phaseNumber ?? 4;

  const activePhaseObj =
    tempPhases.find((p) => p.phaseNumber === activePhaseNumber) || tempPhases[0];
  const allModulesFlat = tempPhases.flatMap((p) => p.modules);

  const chosenNext =
    activePhaseObj.modules.find((m) => m.status !== "mastered" && m.isDiagnosticPriority) ||
    activePhaseObj.modules.find((m) => m.status === "pending") ||
    activePhaseObj.modules.find((m) => m.status === "reinforce") ||
    allModulesFlat.find((m) => m.status !== "mastered" && m.isDiagnosticPriority) ||
    allModulesFlat.find((m) => m.status === "pending") ||
    allModulesFlat.find((m) => m.status === "reinforce") ||
    allModulesFlat[allModulesFlat.length - 1];

  const phases: EvaluatedRoadmapPhase[] = tempPhases.map((p) => ({
    ...p,
    isCurrentPhase: p.phaseNumber === activePhaseNumber,
    modules: p.modules.map((m) => ({
      ...m,
      isNextRecommended: m.id === chosenNext.id,
    })),
  }));

  const allModules = phases.flatMap((p) => p.modules);
  const nextModule =
    allModules.find((m) => m.id === chosenNext.id) || allModules[0];
  const masteredModulesCount = allModules.filter(
    (m) => m.status === "mastered",
  ).length;
  const reinforceModulesCount = allModules.filter(
    (m) => m.status === "reinforce",
  ).length;
  const totalModulesCount = allModules.length;
  const overallProgressPct =
    totalModulesCount > 0
      ? Math.round((masteredModulesCount / totalModulesCount) * 100)
      : 0;

  return {
    careerGoal: blueprint.trackKey,
    trackTitle: blueprint.trackTitle,
    trackSubtitle: blueprint.trackSubtitle,
    phases,
    allModules,
    nextModule,
    masteredModulesCount,
    reinforceModulesCount,
    totalModulesCount,
    overallProgressPct,
    activePhaseNumber,
  };
}

export interface CurriculumTopicBadge {
  label: string;
  priority: boolean;
}

export function buildCurriculumTopicBadges(
  roadmap: EvaluatedCurriculumRoadmap,
  activeFocusTopic?: string,
): Record<string, CurriculumTopicBadge> {
  const map: Record<string, CurriculumTopicBadge> = {};
  for (const mod of roadmap.allModules) {
    if (mod.status === "mastered") continue;
    const keys = [mod.targetCategory, ...(mod.matchAliases ?? [])]
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    const label = mod.isNextRecommended
      ? `Kurikulum · Fase ${mod.phaseNumber}`
      : mod.isDiagnosticPriority
        ? "Prioritas Diagnostik"
        : `Fase ${mod.phaseNumber}`;
    const priority = Boolean(mod.isNextRecommended || mod.isDiagnosticPriority);
    for (const k of keys) {
      if (!map[k] || priority) map[k] = { label, priority };
    }
  }
  if (activeFocusTopic) {
    map[activeFocusTopic.trim().toLowerCase()] = { label: "Fokus Aktif", priority: true };
  }
  return map;
}

export function buildSmartDailyMissions(params: {
  roadmap: EvaluatedCurriculumRoadmap;
  attempts: AttemptRecord[];
  todayISO: string;
  artifacts: ArtifactItem[];
  readArtifactIds: string[];
  mistakeCount: number;
  artifactReadToday: boolean;
  mistakeEvaluatedToday: boolean;
  manualDoneIds: string[];
}): SmartDailyMission[] {
  const attemptsToday = params.attempts.filter((a) => {
    const dt = new Date(a.created_at);
    return !Number.isNaN(dt.getTime()) && toLocalISO(dt) === params.todayISO;
  });

  // 1. Focus curriculum module mission (exercise/assessment)
  const focusMod =
    params.roadmap.nextModule.kind !== "artifact"
      ? params.roadmap.nextModule
      : params.roadmap.allModules.find(
          (m) => m.kind !== "artifact" && m.status !== "mastered",
        ) ||
        params.roadmap.allModules.find((m) => m.kind !== "artifact") ||
        params.roadmap.nextModule;

  const focusDone =
    attemptsToday.length > 0 || params.manualDoneIds.includes("m1_focus");

  const m1: SmartDailyMission = {
    id: "m1_focus",
    kind: "roadmap_module",
    label: `${focusMod.kind === "assessment" ? "Simulasi" : "Latihan"}: ${focusMod.title}`,
    meta: `Fase ${focusMod.phaseNumber} · Target ${focusMod.requiredAccuracy}%`,
    done: focusDone,
    ctaLabel: focusMod.kind === "assessment" ? "Mulai Simulasi" : "Mulai Latihan",
    roadmapModule: focusMod,
  };

  // 2. Artifact concept reading mission
  const readSet = new Set(params.readArtifactIds.map(String));
  const nextArtifactMod = params.roadmap.allModules.find(
    (m) => m.kind === "artifact" && m.status !== "mastered",
  );
  const targetArtifact =
    (nextArtifactMod?.artifactId !== undefined
      ? params.artifacts.find(
          (a) => String(a.id) === String(nextArtifactMod.artifactId),
        )
      : undefined) ||
    params.artifacts.find((a) => !readSet.has(String(a.id))) ||
    params.artifacts[0];

  const allArtifactsRead =
    params.artifacts.length > 0 &&
    params.artifacts.every((a) => readSet.has(String(a.id)));

  const m2Done =
    params.artifactReadToday ||
    allArtifactsRead ||
    params.manualDoneIds.includes("m2_artifact");

  const m2: SmartDailyMission = {
    id: "m2_artifact",
    kind: "artifact_read",
    label: targetArtifact
      ? `Baca: ${targetArtifact.title}`
      : "Baca Esai Konseptual Artifact",
    meta: targetArtifact
      ? `Artifact · ${targetArtifact.readTime} mnt baca`
      : "Artifact Konseptual",
    done: m2Done,
    ctaLabel: "Baca Artifact",
    artifactId: targetArtifact?.id,
  };

  // 3. Mistake Bank / Reinforcement mission
  const reinforceMod = params.roadmap.allModules.find(
    (m) => m.status === "reinforce",
  );
  const m3Done =
    params.mistakeEvaluatedToday ||
    (params.mistakeCount === 0 && attemptsToday.length > 0) ||
    params.manualDoneIds.includes("m3_eval");

  let m3: SmartDailyMission;
  if (params.mistakeCount > 0) {
    m3 = {
      id: "m3_eval",
      kind: "mistake_review",
      label: `Evaluasi ${params.mistakeCount} soal perlu diulang`,
      meta: "Bank Evaluasi · Drill 1x lulus",
      done: m3Done,
      ctaLabel: "Buka Bank Evaluasi",
    };
  } else if (reinforceMod) {
    m3 = {
      id: "m3_eval",
      kind: "roadmap_module",
      label: `Perkuat: ${reinforceMod.title}`,
      meta: `Skor ${reinforceMod.bestScore}% · Target ${reinforceMod.requiredAccuracy}%`,
      done: m3Done,
      ctaLabel: "Mulai Penguatan",
      roadmapModule: reinforceMod,
    };
  } else {
    m3 = {
      id: "m3_eval",
      kind: "mistake_review",
      label: "Evaluasi soal & pembahasan",
      meta: "0 soal tertunda · Bank Evaluasi bersih",
      done: m3Done,
      ctaLabel: "Lihat Bank Evaluasi",
    };
  }

  return [m1, m2, m3];
}
