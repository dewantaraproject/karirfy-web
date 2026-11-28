import type {
  CvCollectionState,
  SavedCvVersion,
} from "./cv";
import type { StarStudioSavedState } from "./interviewStar";
import { loadSavedQuestions, saveSavedQuestions } from "./mistakeBankService";
import type { AgendaItem } from "./selectionCalendar";
import {
  EMPTY_PREPARATION,
  loadPreparation,
  savePreparation,
  STUDY_TRACKS,
  type FocusPlan,
  type JobApplicationEntry,
  type PreparationState,
} from "./studyPreparation";
import { supabase } from "./supabase";
import type { SavedQuestionEntry } from "../types";

const MAX_SYNC_CV_VERSIONS = 8;

export const VAULT_DIRTY_EVENT = "karirfy:vault-dirty";

interface VaultRow {
  user_id: string;
  cv_collection: CvCollectionState | null;
  cv_updated_at: string | null;
  study_preparation: PreparationState | null;
  preparation_updated_at: string | null;
  star_studio: StarStudioSavedState | null;
  star_updated_at: string | null;
  saved_questions: Record<string, SavedQuestionEntry> | null;
  saved_questions_updated_at: string | null;
}

interface VaultSession {
  userId: string | null;
  controller: AbortController;
  pushTimer?: number;
  unavailable?: boolean;
}

let vaultSession: VaultSession = {
  userId: null,
  controller: new AbortController(),
};

export function setStudyVaultOwner(userId: string | null): void {
  if (vaultSession.userId === userId) return;
  if (vaultSession.pushTimer !== undefined && typeof window !== "undefined") {
    window.clearTimeout(vaultSession.pushTimer);
  }
  vaultSession.controller.abort();
  vaultSession = {
    userId,
    controller: new AbortController(),
  };
}

export function emitStudyVaultDirty(): void {
  if (
    typeof window === "undefined" ||
    typeof window.dispatchEvent !== "function" ||
    typeof CustomEvent !== "function"
  ) {
    return;
  }
  window.dispatchEvent(new CustomEvent(VAULT_DIRTY_EVENT));
}

function toEpochMs(iso?: string | null): number {
  if (!iso) return 0;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : 0;
}

function mergeByUpdatedAt<T extends { id: string; updatedAt?: string }>(
  local: T[] = [],
  remote: T[] = [],
  limit?: number,
): T[] {
  const byId = new Map<string, T>();
  for (const item of remote) {
    if (item && typeof item.id === "string" && item.id) {
      byId.set(item.id, item);
    }
  }
  for (const item of local) {
    if (!item || typeof item.id !== "string" || !item.id) continue;
    const prev = byId.get(item.id);
    if (!prev || toEpochMs(item.updatedAt) >= toEpochMs(prev.updatedAt)) {
      byId.set(item.id, item);
    }
  }
  const merged = Array.from(byId.values()).sort(
    (a, b) => toEpochMs(b.updatedAt) - toEpochMs(a.updatedAt),
  );
  return limit ? merged.slice(0, limit) : merged;
}

export function mergeCvCollections(
  local: CvCollectionState,
  remote?: Partial<CvCollectionState> | null,
): CvCollectionState {
  const remoteItems = Array.isArray(remote?.items) ? (remote.items as SavedCvVersion[]) : [];
  if (!remoteItems.length && !local.items.length) {
    return { activeId: "", items: [] };
  }
  const byId = new Map<string, SavedCvVersion>();
  for (const item of remoteItems) {
    if (item && typeof item.id === "string" && item.draft) {
      byId.set(item.id, item);
    }
  }
  for (const item of local.items) {
    if (!item || typeof item.id !== "string" || !item.draft) continue;
    const existing = byId.get(item.id);
    if (!existing || toEpochMs(item.updatedAt) >= toEpochMs(existing.updatedAt)) {
      const mergedPhoto = item.draft.photo || existing?.draft.photo || "";
      byId.set(item.id, {
        ...item,
        draft: mergedPhoto !== item.draft.photo ? { ...item.draft, photo: mergedPhoto } : item.draft,
      });
    }
  }
  const items = Array.from(byId.values())
    .sort((a, b) => toEpochMs(b.updatedAt) - toEpochMs(a.updatedAt))
    .slice(0, MAX_SYNC_CV_VERSIONS);
  const preferredActive = local.activeId || remote?.activeId || "";
  const activeId = items.some((i) => i.id === preferredActive) ? preferredActive : (items[0]?.id ?? "");
  return { activeId, items };
}

export function sanitizeCvCollectionForCloud(collection: CvCollectionState): CvCollectionState {
  const MAX_BYTES = 450_000;
  const serialized = JSON.stringify(collection);
  if (serialized.length <= MAX_BYTES) return collection;
  return {
    ...collection,
    items: collection.items.map((item) => ({
      ...item,
      draft: item.draft.photo ? { ...item.draft, photo: "" } : item.draft,
    })),
  };
}

function mergeFocusPlan(localPlan?: FocusPlan, remotePlan?: FocusPlan): FocusPlan | undefined {
  if (!localPlan) return remotePlan;
  if (!remotePlan) return localPlan;
  if (localPlan.date !== remotePlan.date) {
    return localPlan.date > remotePlan.date ? localPlan : remotePlan;
  }
  const completed: FocusPlan["completed"] = { ...remotePlan.completed };
  for (const [dayKey, entries] of Object.entries(localPlan.completed)) {
    const day = Number(dayKey);
    if (entries) completed[day] = entries;
  }
  return {
    ...remotePlan,
    ...localPlan,
    completed,
    benchmarkIds: localPlan.benchmarkIds ?? remotePlan.benchmarkIds,
  };
}

export function mergePreparationStates(
  local: PreparationState,
  remote?: Partial<PreparationState> | null,
): PreparationState {
  if (!remote) return local;
  const plans: PreparationState["plans"] = {};
  for (const track of STUDY_TRACKS) {
    const merged = mergeFocusPlan(local.plans?.[track], remote.plans?.[track]);
    if (merged) plans[track] = merged;
  }
  const skills: PreparationState["skills"] = { ...(remote.skills ?? {}) };
  for (const [k, val] of Object.entries(local.skills ?? {})) {
    const existing = skills[k as keyof PreparationState["skills"]];
    if (!existing || val.date >= existing.date) {
      skills[k as keyof PreparationState["skills"]] = val;
    }
  }
  const targets: PreparationState["targets"] = { ...(remote.targets ?? {}) };
  for (const [track, val] of Object.entries(local.targets ?? {})) {
    if (val) targets[track as keyof PreparationState["targets"]] = val;
  }
  const stage: PreparationState["stage"] = { ...(remote.stage ?? {}) };
  for (const [track, val] of Object.entries(local.stage ?? {})) {
    if (val) {
      stage[track as keyof PreparationState["stage"]] = {
        ...(stage[track as keyof PreparationState["stage"]] ?? {}),
        ...val,
      };
    }
  }
  const agendaById = new Map<number, AgendaItem>();
  for (const item of remote.agenda ?? []) {
    if (item?.id) agendaById.set(item.id, item);
  }
  for (const item of local.agenda ?? []) {
    if (item?.id) agendaById.set(item.id, item);
  }
  const agenda = Array.from(agendaById.values()).sort((a, b) => a.date.localeCompare(b.date));
  const applications = mergeByUpdatedAt<JobApplicationEntry>(
    local.applications ?? [],
    remote.applications ?? [],
    120,
  );
  return {
    plans,
    skills,
    targets,
    stage,
    ...(agenda.length ? { agenda } : {}),
    ...(applications.length ? { applications } : {}),
  };
}

export function mergeStarStudioStates(
  local: StarStudioSavedState,
  remote?: Partial<StarStudioSavedState> | null,
): StarStudioSavedState {
  if (!remote) return local;
  const stories = { ...(remote.stories ?? {}), ...(local.stories ?? {}) };
  const essaySections: Record<string, string> = { ...(remote.essaySections ?? {}) };
  for (const [k, text] of Object.entries(local.essaySections ?? {})) {
    if (text && (text.trim().length >= (essaySections[k] ?? "").trim().length)) {
      essaySections[k] = text;
    }
  }
  const rubricChecks = Array.from(new Set([...(remote.rubricChecks ?? []), ...(local.rubricChecks ?? [])]));
  return { stories, essaySections, rubricChecks };
}

export function mergeSavedQuestionMaps(
  local: Record<string, SavedQuestionEntry>,
  remote?: Record<string, SavedQuestionEntry> | null,
): Record<string, SavedQuestionEntry> {
  if (!remote || typeof remote !== "object") return local;
  const merged: Record<string, SavedQuestionEntry> = { ...remote };
  for (const [id, entry] of Object.entries(local)) {
    if (!entry) continue;
    const prev = merged[id];
    if (!prev) {
      merged[id] = entry;
      continue;
    }
    const localNewer = toEpochMs(entry.updatedAt) >= toEpochMs(prev.updatedAt);
    const chosen = localNewer ? entry : prev;
    const fallback = localNewer ? prev : entry;
    merged[id] = {
      ...chosen,
      userNote: chosen.userNote || fallback.userNote,
      isBookmarked: Boolean(entry.isBookmarked || prev.isBookmarked),
    };
  }
  const ordered = Object.entries(merged)
    .sort(([, a], [, b]) => toEpochMs(b.updatedAt) - toEpochMs(a.updatedAt))
    .slice(0, 250);
  return Object.fromEntries(ordered);
}

function isVaultMissingTableError(err: { code?: string; message?: string } | null | undefined): boolean {
  if (!err) return false;
  if (["42P01", "PGRST205", "PGRST204"].includes(err.code || "")) return true;
  return (err.message || "").toLowerCase().includes("user_study_vault");
}

export interface PullStudyVaultCallbacks {
  onPreparationMerged?: (next: PreparationState) => void;
  onSavedQuestionsMerged?: (next: Record<string, SavedQuestionEntry>) => void;
}

export async function pullStudyVault(
  userId: string,
  callbacks?: PullStudyVaultCallbacks,
): Promise<boolean> {
  if (!userId || vaultSession.userId !== userId || vaultSession.unavailable) return false;
  if (typeof navigator !== "undefined" && navigator.onLine === false) return false;

  const session = vaultSession;
  const tx = new AbortController();
  const onAbort = () => tx.abort();
  session.controller.signal.addEventListener("abort", onAbort, { once: true });
  const timer = typeof window !== "undefined" ? window.setTimeout(onAbort, 6000) : undefined;

  try {
    const { data, error } = await supabase
      .from("user_study_vault")
      .select(
        "user_id, cv_collection, cv_updated_at, study_preparation, preparation_updated_at, star_studio, star_updated_at, saved_questions, saved_questions_updated_at",
      )
      .eq("user_id", userId)
      .abortSignal(tx.signal)
      .maybeSingle();

    if (error) {
      if (isVaultMissingTableError(error)) session.unavailable = true;
      return false;
    }
    if (session.controller.signal.aborted || session.userId !== userId) return false;

    const remote = data as VaultRow | null;
    if (!remote) {
      await pushStudyVault(userId);
      return true;
    }

    const [{ loadCvCollection, saveCvCollection }, { loadStarStudioState, saveStarStudioState }] =
      await Promise.all([import("./cv"), import("./interviewStar")]);

    const localCv = loadCvCollection();
    const mergedCv = mergeCvCollections(localCv, remote.cv_collection);
    if (JSON.stringify(mergedCv) !== JSON.stringify(localCv)) {
      saveCvCollection(mergedCv);
    }

    const localPrep = loadPreparation();
    const mergedPrep = mergePreparationStates(localPrep, remote.study_preparation);
    if (JSON.stringify(mergedPrep) !== JSON.stringify(localPrep)) {
      savePreparation(mergedPrep);
      callbacks?.onPreparationMerged?.(mergedPrep);
    }

    const localStar = loadStarStudioState();
    const mergedStar = mergeStarStudioStates(localStar, remote.star_studio);
    if (JSON.stringify(mergedStar) !== JSON.stringify(localStar)) {
      saveStarStudioState(mergedStar);
    }

    const localSaved = loadSavedQuestions();
    const mergedSaved = mergeSavedQuestionMaps(localSaved, remote.saved_questions);
    if (JSON.stringify(mergedSaved) !== JSON.stringify(localSaved)) {
      saveSavedQuestions(mergedSaved);
      callbacks?.onSavedQuestionsMerged?.(mergedSaved);
    }

    return true;
  } catch {
    return false;
  } finally {
    if (timer !== undefined && typeof window !== "undefined") window.clearTimeout(timer);
    session.controller.signal.removeEventListener("abort", onAbort);
  }
}

export async function pushStudyVault(userId: string): Promise<boolean> {
  if (!userId || vaultSession.userId !== userId || vaultSession.unavailable) return false;
  if (typeof navigator !== "undefined" && navigator.onLine === false) return false;

  const session = vaultSession;
  const tx = new AbortController();
  const onAbort = () => tx.abort();
  session.controller.signal.addEventListener("abort", onAbort, { once: true });
  const timer = typeof window !== "undefined" ? window.setTimeout(onAbort, 6000) : undefined;

  try {
    const [{ loadCvCollection }, { loadStarStudioState }] =
      await Promise.all([import("./cv"), import("./interviewStar")]);
    const now = new Date().toISOString();
    const payload = {
      user_id: userId,
      cv_collection: sanitizeCvCollectionForCloud(loadCvCollection()),
      cv_updated_at: now,
      study_preparation: loadPreparation() ?? EMPTY_PREPARATION,
      preparation_updated_at: now,
      star_studio: loadStarStudioState(),
      star_updated_at: now,
      saved_questions: loadSavedQuestions(),
      saved_questions_updated_at: now,
      updated_at: now,
    };

    const { error } = await supabase
      .from("user_study_vault")
      .upsert(payload, { onConflict: "user_id" })
      .abortSignal(tx.signal);

    if (error && isVaultMissingTableError(error)) {
      session.unavailable = true;
      return false;
    }
    return !error && !session.controller.signal.aborted;
  } catch {
    return false;
  } finally {
    if (timer !== undefined && typeof window !== "undefined") window.clearTimeout(timer);
    session.controller.signal.removeEventListener("abort", onAbort);
  }
}

export function scheduleStudyVaultPush(userId: string, delayMs = 1500): void {
  if (!userId || vaultSession.userId !== userId || vaultSession.unavailable) return;
  if (typeof window === "undefined") return;
  if (vaultSession.pushTimer !== undefined) {
    window.clearTimeout(vaultSession.pushTimer);
  }
  vaultSession.pushTimer = window.setTimeout(() => {
    vaultSession.pushTimer = undefined;
    void pushStudyVault(userId);
  }, delayMs);
}
