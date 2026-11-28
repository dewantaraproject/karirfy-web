import { supabase, withTimeout } from "./supabase";
import { getOfflineQuestionsByTypes } from "./offlinePackService";
import { normalizeSupabaseQuestionRow, QUESTION_SELECT } from "./questionRows";
import { KIPRAH_STORAGE_KEYS } from "./sessionCleanup";
import { applyReviewedQuestion } from "../data/questionBank/questionCorrections";
import { hashQuestionSeed } from "../data/questionBank/questionRandom";
import type {
  QuestionItem,
  QuizSessionConfig,
} from "../types";

export { normalizeSupabaseQuestionRow } from "./questionRows";

type LocalFallbackBanks = {
  generatedNumerik: typeof import("../data/questionBank/NumericalMatrix")["default"];
  generatedDigitSymbol: typeof import("../data/questionBank/Digitsymbol")["default"];
  speedAccuracyQuestions: typeof import("../data/questionBank/speedAccuracy")["speedAccuracyQuestions"];
  getFallbackQuestions: typeof import("../data/questionBank/fallbackQuestions")["getFallbackQuestions"];
};

let localFallbackBanksPromise: Promise<LocalFallbackBanks> | undefined;
let visualBankPromise:
  | Promise<typeof import("../data/questionBank/visualExercises")["visualExerciseBank"]>
  | undefined;

function loadLocalFallbackBanks(): Promise<LocalFallbackBanks> {
  if (!localFallbackBanksPromise) {
    localFallbackBanksPromise = Promise.all([
      import("../data/questionBank/NumericalMatrix"),
      import("../data/questionBank/Digitsymbol"),
      import("../data/questionBank/speedAccuracy"),
      import("../data/questionBank/fallbackQuestions"),
    ])
      .then(([numerikMod, digitMod, speedMod, fallbackMod]) => ({
        generatedNumerik: numerikMod.default,
        generatedDigitSymbol: digitMod.default,
        speedAccuracyQuestions: speedMod.speedAccuracyQuestions,
        getFallbackQuestions: fallbackMod.getFallbackQuestions,
      }))
      .catch((error) => {
        localFallbackBanksPromise = undefined;
        throw error;
      });
  }
  return localFallbackBanksPromise;
}

function loadVisualExerciseBank() {
  if (!visualBankPromise) {
    visualBankPromise = import("../data/questionBank/visualExercises")
      .then((m) => m.visualExerciseBank)
      .catch((error) => {
        visualBankPromise = undefined;
        throw error;
      });
  }
  return visualBankPromise;
}

const MAX_SEEN_IDS = 5000;

export function loadSeenQuestionIds(): Set<string> {
  if (typeof window === "undefined" || !window.localStorage) {
    return new Set();
  }
  try {
    const raw = localStorage.getItem(KIPRAH_STORAGE_KEYS.seenQuestions);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? new Set(parsed.map((x) => String(x)))
      : new Set();
  } catch {
    return new Set();
  }
}

export function markQuestionsAsSeen(ids: string[]): void {
  if (typeof window === "undefined" || !window.localStorage || ids.length === 0) {
    return;
  }
  try {
    const existing = Array.from(loadSeenQuestionIds());
    const mergedSet = new Set(existing);
    ids.forEach((raw) => {
      const clean = String(raw || "").trim();
      if (clean) mergedSet.add(clean);
    });
    const list = Array.from(mergedSet);
    const trimmed =
      list.length > MAX_SEEN_IDS
        ? list.slice(list.length - MAX_SEEN_IDS)
        : list;
    localStorage.setItem(
      KIPRAH_STORAGE_KEYS.seenQuestions,
      JSON.stringify(trimmed),
    );
  } catch {
    // ignore storage quota errors
  }
}

export function prioritizeUnseenQuestions(
  pool: QuestionItem[],
  count: number,
  seenIds: Set<string>,
): QuestionItem[] {
  if (count <= 0 || pool.length === 0) return [];
  const uniqueMap = new Map<string, QuestionItem>();
  pool.forEach((q) => {
    if (!uniqueMap.has(q.id)) {
      uniqueMap.set(q.id, q);
    }
  });
  const deduped = Array.from(uniqueMap.values());
  const unseen = shuffleArray(deduped.filter((q) => !seenIds.has(q.id)));
  if (unseen.length >= count) {
    return unseen.slice(0, count);
  }
  const seen = shuffleArray(deduped.filter((q) => seenIds.has(q.id)));
  return [...unseen, ...seen].slice(0, count);
}

export function shuffleArray<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function pairDiagnosticQuestions(
  pool: QuestionItem[], count: number, seen: Set<string>, difficulty = new Map<string, number>(),
): QuestionItem[] {
  const groups = new Map<string, QuestionItem[]>();
  for (const question of prioritizeUnseenQuestions(pool, pool.length, seen).filter((q) => !seen.has(q.id))) {
    const key = JSON.stringify([
      question.question_format, Boolean(question.scores), Boolean(question.imageUrl),
      Boolean(question.matrixData), question.visual?.kind, question.options.length,
    ]);
    const items = groups.get(key) ?? [];
    items.push(question);
    groups.set(key, items);
  }
  const pairs: QuestionItem[] = [];
  for (const items of groups.values()) {
    const measured = items.filter((item) => difficulty.has(item.id))
      .sort((a, b) => difficulty.get(a.id)! - difficulty.get(b.id)!);
    const unknown = items.filter((item) => !difficulty.has(item.id));
    for (const group of [measured, unknown]) {
      for (let index = 0; index + 1 < group.length && pairs.length < count; index++) {
        const question = group[index];
        const partner = group[index + 1];
        if (group === measured && difficulty.get(partner.id)! - difficulty.get(question.id)! > 0.12) continue;
        pairs.push({ ...question, benchmarkPartnerId: partner.id });
        index++;
      }
    }
  }
  return pairs;
}

async function loadItemDifficulty(questions: QuestionItem[]): Promise<Map<string, number>> {
  if (!questions.length || (typeof navigator !== "undefined" && navigator.onLine === false)) return new Map();
  try {
    const ids = [...new Set(questions.map(({ id }) => id))].slice(0, 600);
    const { data, error } = await withTimeout(supabase.rpc("get_karirfy_item_difficulty", { p_question_ids: ids }), 2200);
    if (!error && Array.isArray(data)) return new Map(data.map(({ question_id, success_rate }) => [question_id, Number(success_rate)]));
  } catch {
    // Diagnostic pairing can still use shared structure without measured difficulty.
  }
  return new Map();
}

async function getLocalNumericalMatrixQuestions(count: number): Promise<QuestionItem[]> {
  const { generatedNumerik } = await loadLocalFallbackBanks();
  const picked = shuffleArray(generatedNumerik).slice(0, count);
  return picked.map((q) => normalizeSupabaseQuestionRow(q));
}

async function getLocalDigitSymbolQuestions(count: number): Promise<QuestionItem[]> {
  const { generatedDigitSymbol } = await loadLocalFallbackBanks();
  const picked = shuffleArray(generatedDigitSymbol).slice(0, count);
  return picked.map((q) => normalizeSupabaseQuestionRow(q));
}

async function getLocalAttentionDetailQuestions(count: number): Promise<QuestionItem[]> {
  const { generatedDigitSymbol, speedAccuracyQuestions } = await loadLocalFallbackBanks();
  const combined = deduplicateQuestionContent([
    ...speedAccuracyQuestions,
    ...generatedDigitSymbol.map((q) => normalizeSupabaseQuestionRow(q)),
  ]);
  return shuffleArray(combined).slice(0, count);
}

async function normalizeFallbackList(category: string, count: number): Promise<QuestionItem[]> {
  const { getFallbackQuestions } = await loadLocalFallbackBanks();
  const raw = getFallbackQuestions(category, count);
  return raw.map((q) => normalizeSupabaseQuestionRow(q));
}

interface QuestionFetchOptions {
  allowOfflinePack?: boolean;
  onOfflinePack?: () => void;
  excludeQuestionIds?: string[];
}

export function deduplicateQuestionContent(pool: QuestionItem[]): QuestionItem[] {
  const plain = (text: string) => text.trim().replace(/\s+/g, " ");
  const signatures = new Set<string>();
  return pool.filter((question) => {
    if (question.options.length < 2) return true;
    const choices = question.options.map(({ id, text }) => JSON.stringify([
      plain(text), id === question.correct, question.scores?.[id],
    ])).sort();
    const signature = JSON.stringify([question.type, plain(question.question), question.imageUrl,
      question.matrixData, question.visual, question.digitSymbolData, choices]);
    if (signatures.has(signature)) return false;
    signatures.add(signature);
    return true;
  });
}

async function loadQuestionPool(
  loadRemote: () => PromiseLike<{ data: unknown[] | null; error: unknown }>,
  types: string[],
  timeout: number,
  options?: QuestionFetchOptions,
): Promise<QuestionItem[]> {
  if (typeof navigator === "undefined" || navigator.onLine !== false) {
    try {
      const { data, error } = await withTimeout(loadRemote(), timeout);
      if (!error) return deduplicateQuestionContent((data ?? []).map(normalizeSupabaseQuestionRow));
    } catch {
      // Try the downloaded bank before using the built-in sample.
    }
  }
  if (!options?.allowOfflinePack) return [];
  const cached = await getOfflineQuestionsByTypes(types).catch(() => []);
  if (cached.length > 0) options.onOfflinePack?.();
  return deduplicateQuestionContent(cached.map(applyReviewedQuestion));
}

export async function fetchQuizQuestions(
  config: QuizSessionConfig,
  options?: QuestionFetchOptions,
): Promise<QuestionItem[]> {
  const cleanCategory = config.category.replace(/["\\]/g, "").trim();
  const catLower = cleanCategory.toLowerCase();
  const seenIds = loadSeenQuestionIds();
  const excluded = new Set([...(config.excludeQuestionIds ?? []), ...(options?.excludeQuestionIds ?? [])]);
  if (config.source === "exercise" && (catLower === "aljabar" || catLower === "analisis visual")) {
    const visualExerciseBank = await loadVisualExerciseBank();
    const builtInTopic = Object.entries(visualExerciseBank).find(([type]) => type.toLowerCase() === catLower)?.[1];
    if (builtInTopic) {
      return prioritizeUnseenQuestions(builtInTopic.filter(({ id }) => !excluded.has(id)), config.totalQuestions, seenIds);
    }
  }

  if (
    config.source === "assessment" &&
    config.assessmentCategories &&
    config.assessmentCategories.length > 0
  ) {
    const categories = Array.from(new Set(config.assessmentCategories));
    const perCat = Math.floor(config.totalQuestions / categories.length);
    let remainder = config.totalQuestions % categories.length;

    const pool = config.sessionMode || config.studySession?.kind === "diagnostic" || config.benchmarkIds
      ? (await Promise.all(categories
      .filter((type) => config.categoryQuotas?.[type] !== 0)
      .map((type) => loadQuestionPool(
        () => supabase.from("questions").select(QUESTION_SELECT).eq("type", type).limit(200), [type], 5500, options,
      )))).flat()
      : await loadQuestionPool(
      () => supabase.from("questions").select(QUESTION_SELECT)
        .in("type", categories).limit(Math.max(500, config.totalQuestions * 4)),
      categories, 5500, options,
    );

    const difficulty = config.studySession?.kind === "diagnostic" ? await loadItemDifficulty(pool) : undefined;
    const combined: QuestionItem[] = [];
    for (const cat of categories) {
      let target = config.categoryQuotas?.[cat] ?? perCat;
      if (!config.categoryQuotas && remainder > 0) {
        target += 1;
        remainder -= 1;
      }
      if (target <= 0) continue;

      const matching = pool.filter(
        (q) => !excluded.has(q.id) && (q.type === cat || q.category === cat),
      );
      if (config.requireFreshQuestions || config.studySession?.kind === "diagnostic" || config.sessionMode) {
        const eligible = matching.filter((q) => q.type === cat && (!config.requireFreshQuestions || !seenIds.has(q.id)));
        const reserved = config.benchmarkIds?.[cat];
        const paired = config.studySession?.kind === "diagnostic" ? pairDiagnosticQuestions(eligible, target, seenIds, difficulty) : [];
        const picked = paired.length === target ? paired : prioritizeUnseenQuestions(
          reserved ? eligible.filter((q) => reserved.includes(q.id)) : eligible, target, seenIds,
        );
        if (picked.length < target) {
          if (!config.sessionMode) return [];
          const local = (await normalizeFallbackList(cat, target)).filter((q) => q.type === cat);
          const full = prioritizeUnseenQuestions([...eligible, ...local], target, seenIds);
          if (full.length < target) return [];
          combined.push(...full);
          continue;
        }
        combined.push(...picked);
        continue;
      }
      if (matching.length > 0) {
        const picked = prioritizeUnseenQuestions(matching, target, seenIds);
        combined.push(...picked);
        if (picked.length < target) {
          const extra =
            cat.toLowerCase().includes("numerical matrix")
              ? await getLocalNumericalMatrixQuestions(target - picked.length)
              : await normalizeFallbackList(cat, target - picked.length);
          combined.push(...extra);
        }
      } else if (cat.toLowerCase().includes("numerical matrix")) {
        combined.push(...(await getLocalNumericalMatrixQuestions(target)));
      } else if (cat.toLowerCase().includes("attention to detail")) {
        combined.push(...(await getLocalAttentionDetailQuestions(target)));
      } else {
        combined.push(...(await normalizeFallbackList(cat, target)));
      }
    }

    if (combined.length > 0) {
      return combined.slice(0, config.totalQuestions);
    }
    return normalizeFallbackList(cleanCategory, config.totalQuestions);
  }

  // Exercise / single-topic fetch (including Numerical Matrix & Attention to Detail via Supabase first)
  const pool = await loadQuestionPool(
    () => supabase.from("questions").select(QUESTION_SELECT)
      .eq("type", cleanCategory).limit(Math.max(200, config.totalQuestions * 4)),
    [cleanCategory], 4500, options,
  );
  if (pool.length > 0) {
    let enrichedPool = pool;
    if (catLower.includes("attention to detail")) {
      const { speedAccuracyQuestions } = await loadLocalFallbackBanks();
      enrichedPool = deduplicateQuestionContent([...pool, ...speedAccuracyQuestions]);
    }
    const picked = prioritizeUnseenQuestions(
      enrichedPool.filter((q) => !excluded.has(q.id)),
      config.totalQuestions,
      seenIds,
    );
    if (picked.length === config.totalQuestions || (!config.sessionMode && catLower !== "bahasa indonesia")) {
      return picked;
    }
    const pickedIds = new Set(picked.map((q) => q.id));
    const local = (await localTopicQuestions(cleanCategory, config.totalQuestions))
      .filter(({ id }) => !excluded.has(id) && !pickedIds.has(id));
    const extra = prioritizeUnseenQuestions(local, config.totalQuestions - picked.length, seenIds);
    return [...picked, ...extra];
  }

  const local = (await localTopicQuestions(cleanCategory, config.totalQuestions)).filter(({ id }) => !excluded.has(id));
  return prioritizeUnseenQuestions(local, config.totalQuestions, seenIds);
}

async function localTopicQuestions(category: string, count: number): Promise<QuestionItem[]> {
  const catLower = category.toLowerCase();
  const { generatedNumerik, generatedDigitSymbol, speedAccuracyQuestions } = await loadLocalFallbackBanks();
  if (catLower.includes("numerical matrix") || catLower === "numerik") {
    return getLocalNumericalMatrixQuestions(generatedNumerik.length);
  }
  if (catLower.includes("attention to detail")) {
    return getLocalAttentionDetailQuestions(speedAccuracyQuestions.length + generatedDigitSymbol.length);
  }
  if (catLower.includes("digit symbol")) {
    return getLocalDigitSymbolQuestions(generatedDigitSymbol.length);
  }
  return (await normalizeFallbackList(category, count)).filter((question) => question.type.toLowerCase() === catLower);
}

function getDailySprintTopicsForGoal(careerGoal?: string): string[] {
  const goal = (careerGoal || "CPNS").toLowerCase();
  if (goal.includes("lpdp") || goal.includes("beasiswa")) {
    return [
      "TBS Penalaran Verbal",
      "TBS Penalaran Kuantitatif",
      "TBS Pemecahan Masalah",
      "Reading Comprehension",
    ];
  }
  if (goal.includes("bi") || goal.includes("bank indonesia") || goal.includes("pcpm")) {
    return [
      "BI Essential",
      "Monetary Policy",
      "Quantitative Reasoning",
      "Logical Reasoning",
    ];
  }
  if (goal.includes("bumn")) {
    return [
      "Verbal Reasoning",
      "Quantitative Reasoning",
      "Work Personality",
      "Attention to Detail",
    ];
  }
  if (goal.includes("pppk")) {
    return [
      "Situational Judgement",
      "Work Personality",
      "Behavioral Competencies",
      "Government & Public Administration",
    ];
  }
  return [
    "National Foundation",
    "Verbal Reasoning",
    "Quantitative Reasoning",
    "Situational Judgement",
  ];
}

export async function fetchDailySprintQuestions(
  careerGoal: string,
  todayISO: string,
  options?: QuestionFetchOptions,
): Promise<QuestionItem[]> {
  const seenIds = loadSeenQuestionIds();
  const excluded = new Set(options?.excludeQuestionIds);
  const sprintTypes = ["Abstract Reasoning", ...getDailySprintTopicsForGoal(careerGoal)];
  const pool = await loadQuestionPool(
    () => supabase.from("questions").select(QUESTION_SELECT).in("type", sprintTypes).limit(250),
    sprintTypes, 4500, options,
  );

  const picked: QuestionItem[] = [];
  const usedIds = new Set<string>();

  for (let idx = 0; idx < sprintTypes.length; idx += 1) {
    const topicType = sprintTypes[idx];
    const candidates = pool
      .filter((q) => q.type === topicType && !usedIds.has(q.id) && !excluded.has(q.id))
      .sort((a, b) => a.id.localeCompare(b.id));

    if (candidates.length > 0) {
      const unseen = candidates.filter((q) => !seenIds.has(q.id));
      const activePool = unseen.length > 0 ? unseen : candidates;
      const pickIndex =
        hashQuestionSeed(`${todayISO}:${careerGoal}:${topicType}:${idx}`) %
        activePool.length;
      const chosen = activePool[pickIndex];
      picked.push(chosen);
      usedIds.add(chosen.id);
    } else {
      const fb = (await normalizeFallbackList(topicType, 5)).find((q) => !usedIds.has(q.id) && !excluded.has(q.id));
      if (fb) {
        picked.push(fb);
        usedIds.add(fb.id);
      }
    }
  }

  return picked.slice(0, 5);
}
