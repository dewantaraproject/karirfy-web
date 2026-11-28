import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  ArtifactItem,
  AttemptRecord,
  CpnsQuotaTrack,
  DailyProgressState,
  EvaluatedCurriculumRoadmap,
  ExamPlan,
  QuestionItem,
  QuizResultPayload,
  QuizSessionConfig,
  SavedQuestionEntry,
  SmartDailyMission,
} from "../types";
import { useAuth } from "./AuthContext";
import { KIPRAH_STORAGE_KEYS } from "../lib/sessionCleanup";
import { supabase, withTimeout } from "../lib/supabase";
import { DEFAULT_ARTIFACTS, fetchArtifactsCatalog, markArtifactAsRead } from "../data/artifactsCatalog";
import {
  buildSmartDailyMissions,
  DEFAULT_DAILY_PROGRESS_STATE,
  evaluateCurriculumRoadmap,
  loadDailyProgressState,
  saveDailyProgressState,
  toLocalISO,
} from "../lib/curriculumRoadmap";
import {
  getDueMistakes,
  loadSavedQuestions,
  reconcileQuizResultWithMistakeBank,
  removeMistakeInMap,
  saveSavedQuestions,
  toggleBookmarkInMap,
  updateQuestionNoteInMap,
} from "../lib/mistakeBankService";
import {
  enqueueOfflineAttempt,
  flushPendingOfflineAttempts,
  getPendingOfflineAttempts,
  newOfflineAttemptId,
  uploadOfflineAttempt,
} from "../lib/offlineSyncService";
import {
  pullStudyVault,
  scheduleStudyVaultPush,
  VAULT_DIRTY_EVENT,
} from "../lib/studyVaultSyncService";
import {
  applyStudyResult,
  EMPTY_PREPARATION,
  loadPreparation,
  savePreparation,
  type PreparationState,
} from "../lib/studyPreparation";
import {
  captureTopicSession,
  loadTopicSessions,
  saveTopicSessions,
  type TopicSession,
} from "../lib/topicTrends";
import {
  buildActivityBuckets,
  buildCompetencyRadar,
  buildScoreTrajectory,
  buildTopicTrendBundle,
  buildTrackPassingReadiness,
  computeStudyStreakAndHabits,
  summarizeMistakeBank,
} from "../lib/statsAnalytics";
import { computeDailyQuotaStatus, type DailyQuotaStatus } from "../lib/tierAccess";
import { markQuestionsAsSeen } from "../lib/questionService";

function addDaysIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toLocalISO(d);
}

export const DEFAULT_EXAM_PLAN: ExamPlan = {
  examDate: addDaysIso(120),
  examStartDate: toLocalISO(new Date()),
  dailyMinutesGoal: 30,
  weeklyGoal: 7,
  reminderTime: "19:30",
  reminderEnabled: false,
};

function mergeAttempts(
  current: AttemptRecord[],
  pending: AttemptRecord[],
  remote: AttemptRecord[],
): AttemptRecord[] {
  const byId = new Map<string, AttemptRecord>();
  for (const row of [...current, ...pending, ...remote]) {
    if (row?.id) byId.set(row.id, row);
  }
  return Array.from(byId.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

interface KarirfyDataContextValue {
  syncing: boolean;
  lastSyncedAt: string | null;
  attempts: AttemptRecord[];
  artifacts: ArtifactItem[];
  readArtifactIds: string[];
  savedQuestionsMap: Record<string, SavedQuestionEntry>;
  preparation: PreparationState;
  topicSessions: TopicSession[];
  examPlan: ExamPlan;
  dailyProgress: DailyProgressState;
  cpnsQuotaTrack: CpnsQuotaTrack;
  setCpnsQuotaTrack: (track: CpnsQuotaTrack) => void;
  quotaStatus: DailyQuotaStatus;
  roadmap: EvaluatedCurriculumRoadmap;
  missions: SmartDailyMission[];
  trends: ReturnType<typeof buildTopicTrendBundle>;
  radar: ReturnType<typeof buildCompetencyRadar>;
  streak: ReturnType<typeof computeStudyStreakAndHabits>;
  trajectory: ReturnType<typeof buildScoreTrajectory>;
  weeklyBuckets: ReturnType<typeof buildActivityBuckets>;
  trackReadiness: ReturnType<typeof buildTrackPassingReadiness>;
  mistakeSummary: ReturnType<typeof summarizeMistakeBank>;
  dueMistakeCount: number;
  activeQuiz: QuizSessionConfig | null;
  lastQuizResult: QuizResultPayload | null;
  startQuizSession: (config: QuizSessionConfig) => void;
  closeQuizSession: () => void;
  completeQuizSession: (result: QuizResultPayload) => Promise<void>;
  markArtifactRead: (id: number | string) => Promise<void>;
  toggleBookmark: (q: QuestionItem) => void;
  updateQuestionNote: (id: string, note: string) => void;
  removeMistake: (id: string) => void;
  toggleMissionDone: (id: string) => void;
  updatePreparation: (next: PreparationState) => void;
  updateExamPlan: (patch: Partial<ExamPlan>) => void;
  refreshAllData: () => Promise<void>;
}

const KarirfyDataContext = createContext<KarirfyDataContextValue | null>(null);

const CPNS_QUOTA_KEY = "karirfy_cpns_quota_track";

export const KarirfyDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userId, isGuest, profile } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const [attempts, setAttempts] = useState<AttemptRecord[]>(() => {
    try {
      const raw = localStorage.getItem(KIPRAH_STORAGE_KEYS.guestAttempts);
      return raw ? (JSON.parse(raw) as AttemptRecord[]) : [];
    } catch {
      return [];
    }
  });
  const [artifacts, setArtifacts] = useState<ArtifactItem[]>(DEFAULT_ARTIFACTS);
  const [readArtifactIds, setReadArtifactIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(KIPRAH_STORAGE_KEYS.readArtifacts);
      return raw ? (JSON.parse(raw) as string[]).map(String) : [];
    } catch {
      return [];
    }
  });
  const [savedQuestionsMap, setSavedQuestionsMap] = useState<Record<string, SavedQuestionEntry>>(
    () => loadSavedQuestions(),
  );
  const [preparation, setPreparation] = useState<PreparationState>(() => loadPreparation());
  const [topicSessions, setTopicSessions] = useState<TopicSession[]>(() => loadTopicSessions());
  const [examPlan, setExamPlan] = useState<ExamPlan>(() => {
    try {
      const raw = localStorage.getItem(KIPRAH_STORAGE_KEYS.examPlan);
      return raw ? { ...DEFAULT_EXAM_PLAN, ...JSON.parse(raw) } : DEFAULT_EXAM_PLAN;
    } catch {
      return DEFAULT_EXAM_PLAN;
    }
  });
  const todayISO = toLocalISO(new Date());
  const [dailyProgress, setDailyProgress] = useState<DailyProgressState>(() =>
    loadDailyProgressState(todayISO),
  );
  const [cpnsQuotaTrack, setCpnsQuotaTrackState] = useState<CpnsQuotaTrack>(() => {
    try {
      const val = localStorage.getItem(CPNS_QUOTA_KEY);
      if (val === "cumlaude_diaspora" || val === "disabilitas_papua") return val;
    } catch {
      // ignore
    }
    return "umum";
  });

  const [activeQuiz, setActiveQuiz] = useState<QuizSessionConfig | null>(null);
  const [lastQuizResult, setLastQuizResult] = useState<QuizResultPayload | null>(null);

  const setCpnsQuotaTrack = useCallback((track: CpnsQuotaTrack) => {
    setCpnsQuotaTrackState(track);
    try {
      localStorage.setItem(CPNS_QUOTA_KEY, track);
    } catch {
      // ignore
    }
  }, []);

  const refreshAllData = useCallback(async () => {
    if (!userId) {
      const artBundle = await fetchArtifactsCatalog(undefined).catch(() => ({
        artifacts: DEFAULT_ARTIFACTS,
        readIds: readArtifactIds,
      }));
      setArtifacts(artBundle.artifacts);
      setLastSyncedAt(new Date().toISOString());
      return;
    }

    setSyncing(true);
    try {
      const [attRes, artBundle, queued] = await Promise.all([
        withTimeout(
          supabase
            .from("user_attempts")
            .select(
              "id, user_id, created_at, attempt_type, subject_category, score, total_questions, correct_answers_count, time_taken_seconds",
            )
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(150),
          6000,
        ).catch(() => ({ data: [] as AttemptRecord[] })),
        fetchArtifactsCatalog(userId).catch(() => ({
          artifacts: DEFAULT_ARTIFACTS,
          readIds: readArtifactIds,
        })),
        getPendingOfflineAttempts(userId).catch(() => []),
      ]);

      setAttempts((prev) =>
        mergeAttempts(
          prev,
          queued.map((q) => q.attempt),
          (attRes.data ?? []) as AttemptRecord[],
        ),
      );
      setArtifacts(artBundle.artifacts);
      setReadArtifactIds(artBundle.readIds);

      await flushPendingOfflineAttempts(userId);
      await pullStudyVault(userId, {
        onPreparationMerged: (next) => setPreparation(next),
        onSavedQuestionsMerged: (next) => setSavedQuestionsMap(next),
      });
      setLastSyncedAt(new Date().toISOString());
    } finally {
      setSyncing(false);
    }
  }, [userId, readArtifactIds]);

  useEffect(() => {
    void refreshAllData();
  }, [userId]);

  // Real-time bidirectional sync with Karirfy Mobile via Supabase Realtime
  useEffect(() => {
    if (!userId) return;

    const onDirty = () => {
      scheduleStudyVaultPush(userId, 1200);
    };
    window.addEventListener(VAULT_DIRTY_EVENT, onDirty);

    const vaultChannel = supabase
      .channel(`karirfy-vault-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_study_vault",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          void pullStudyVault(userId, {
            onPreparationMerged: (next) => setPreparation(next),
            onSavedQuestionsMerged: (next) => setSavedQuestionsMap(next),
          });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "user_attempts",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as AttemptRecord | undefined;
          if (row?.id) {
            setAttempts((prev) => mergeAttempts(prev, [], [row]));
          }
        },
      )
      .subscribe();

    return () => {
      window.removeEventListener(VAULT_DIRTY_EVENT, onDirty);
      void supabase.removeChannel(vaultChannel);
    };
  }, [userId]);

  const startQuizSession = useCallback((config: QuizSessionConfig) => {
    setLastQuizResult(null);
    setActiveQuiz(config);
  }, []);

  const closeQuizSession = useCallback(() => {
    setActiveQuiz(null);
    setLastQuizResult(null);
  }, []);

  const completeQuizSession = useCallback(
    async (result: QuizResultPayload) => {
      setActiveQuiz(null);
      setLastQuizResult(result);

      const attemptId = newOfflineAttemptId();
      const attemptRecord: AttemptRecord = {
        id: attemptId,
        user_id: userId ?? "guest",
        created_at: new Date().toISOString(),
        attempt_type: result.source,
        subject_category: result.quizName,
        score: result.score,
        total_questions: result.questions.length,
        correct_answers_count: result.correctAnswers,
        time_taken_seconds: result.timeTaken,
      };

      setAttempts((prev) => {
        const next = [attemptRecord, ...prev];
        if (!userId) {
          try {
            localStorage.setItem(KIPRAH_STORAGE_KEYS.guestAttempts, JSON.stringify(next.slice(0, 80)));
          } catch {
            // ignore
          }
        }
        return next;
      });

      const session = captureTopicSession(attemptRecord, result);
      setTopicSessions((prev) => {
        const next = [session, ...prev].slice(0, 200);
        saveTopicSessions(next);
        return next;
      });

      setSavedQuestionsMap((prev) => {
        const { nextMap } = reconcileQuizResultWithMistakeBank(
          prev,
          result,
          Boolean(result.isMistakeDrill),
          todayISO,
        );
        saveSavedQuestions(nextMap);
        return nextMap;
      });

      if (result.isMistakeDrill) {
        setDailyProgress((prev) => {
          const next = { ...prev, mistakeEvaluatedToday: true };
          saveDailyProgressState(todayISO, next);
          return next;
        });
      }

      if (result.studySession) {
        const studySession = result.studySession;
        const secPerQ = result.questions.length
          ? Math.max(1, Math.round(result.timeTaken / result.questions.length))
          : 45;
        setPreparation((prev) => {
          const plans = applyStudyResult(
            prev.plans,
            studySession,
            result.categoryBreakdown,
            secPerQ,
            todayISO,
            result.questions,
          );
          const next = { ...prev, plans };
          savePreparation(next);
          return next;
        });
      }

      markQuestionsAsSeen(result.questions.map((q) => q.id));

      if (userId) {
        const answers = result.questions.map((q, idx) => {
          const chosen = result.userAnswers[idx] ?? null;
          const isCorrect = Boolean(
            chosen && q.correct && chosen.toLowerCase() === q.correct.toLowerCase(),
          );
          return { question_id: q.id, user_answer: chosen, is_correct: isCorrect };
        });

        const queued = {
          localAttemptId: attemptId,
          userId,
          attempt: attemptRecord,
          answers,
        };
        const uploaded = await uploadOfflineAttempt(queued);
        if (!uploaded) {
          await enqueueOfflineAttempt(queued);
        }
        scheduleStudyVaultPush(userId, 600);
      }
    },
    [userId, todayISO],
  );

  const markArtifactReadHandler = useCallback(
    async (id: number | string) => {
      const strId = String(id);
      const updated = await markArtifactAsRead(id, userId ?? undefined);
      setReadArtifactIds(updated.length ? updated : Array.from(new Set([...readArtifactIds, strId])));
      setDailyProgress((prev) => {
        const next = { ...prev, artifactReadToday: true };
        saveDailyProgressState(todayISO, next);
        return next;
      });
    },
    [userId, readArtifactIds, todayISO],
  );

  const toggleBookmark = useCallback(
    (q: QuestionItem) => {
      setSavedQuestionsMap((prev) => {
        const next = toggleBookmarkInMap(prev, q);
        saveSavedQuestions(next);
        return next;
      });
      if (userId) scheduleStudyVaultPush(userId, 800);
    },
    [userId],
  );

  const updateQuestionNote = useCallback(
    (id: string, note: string) => {
      setSavedQuestionsMap((prev) => {
        const existing = prev[id];
        if (!existing?.question) return prev;
        const next = updateQuestionNoteInMap(prev, existing.question, note);
        saveSavedQuestions(next);
        return next;
      });
      if (userId) scheduleStudyVaultPush(userId, 800);
    },
    [userId],
  );

  const removeMistake = useCallback(
    (id: string) => {
      setSavedQuestionsMap((prev) => {
        const next = removeMistakeInMap(prev, id);
        saveSavedQuestions(next);
        return next;
      });
      if (userId) scheduleStudyVaultPush(userId, 800);
    },
    [userId],
  );

  const toggleMissionDone = useCallback(
    (id: string) => {
      setDailyProgress((prev) => {
        const has = prev.manualDoneIds.includes(id);
        const manualDoneIds = has
          ? prev.manualDoneIds.filter((x) => x !== id)
          : [...prev.manualDoneIds, id];
        const next = { ...prev, manualDoneIds };
        saveDailyProgressState(todayISO, next);
        return next;
      });
    },
    [todayISO],
  );

  const updatePreparation = useCallback(
    (next: PreparationState) => {
      setPreparation(next);
      savePreparation(next);
      if (userId) scheduleStudyVaultPush(userId, 800);
    },
    [userId],
  );

  const updateExamPlan = useCallback((patch: Partial<ExamPlan>) => {
    setExamPlan((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(KIPRAH_STORAGE_KEYS.examPlan, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const quotaStatus = useMemo(
    () =>
      computeDailyQuotaStatus({
        rawTier: profile.tier,
        isPremium: profile.is_premium,
        premiumExpiryDate: profile.premium_expiry_date,
        isGuest,
        attempts,
      }),
    [profile.tier, profile.is_premium, profile.premium_expiry_date, isGuest, attempts],
  );

  const roadmap = useMemo(
    () =>
      evaluateCurriculumRoadmap({
        careerGoal: profile.careerGoal,
        targetAccuracy: profile.target_accuracy,
        attempts,
        readArtifactIds,
      }),
    [profile.careerGoal, profile.target_accuracy, attempts, readArtifactIds],
  );

  const savedEntries = useMemo(() => Object.values(savedQuestionsMap), [savedQuestionsMap]);
  const dueMistakeCount = useMemo(() => getDueMistakes(savedEntries, todayISO).length, [
    savedEntries,
    todayISO,
  ]);
  const mistakeSummary = useMemo(() => summarizeMistakeBank(savedEntries), [savedEntries]);

  const missions = useMemo(
    () =>
      buildSmartDailyMissions({
        roadmap,
        attempts,
        todayISO,
        artifacts,
        readArtifactIds,
        mistakeCount: dueMistakeCount,
        artifactReadToday: dailyProgress.artifactReadToday,
        mistakeEvaluatedToday: dailyProgress.mistakeEvaluatedToday,
        manualDoneIds: dailyProgress.manualDoneIds,
      }),
    [roadmap, attempts, todayISO, artifacts, readArtifactIds, dueMistakeCount, dailyProgress],
  );

  const trends = useMemo(
    () => buildTopicTrendBundle(attempts, topicSessions),
    [attempts, topicSessions],
  );
  const radar = useMemo(() => buildCompetencyRadar(trends), [trends]);
  const streak = useMemo(
    () => computeStudyStreakAndHabits(attempts, todayISO),
    [attempts, todayISO],
  );
  const trajectory = useMemo(
    () => buildScoreTrajectory(attempts, "all", 12),
    [attempts],
  );
  const weeklyBuckets = useMemo(
    () => buildActivityBuckets(attempts, "daily", todayISO),
    [attempts, todayISO],
  );
  const trackReadiness = useMemo(
    () => buildTrackPassingReadiness(profile.careerGoal, trends, cpnsQuotaTrack),
    [profile.careerGoal, trends, cpnsQuotaTrack],
  );

  return (
    <KarirfyDataContext.Provider
      value={{
        syncing,
        lastSyncedAt,
        attempts,
        artifacts,
        readArtifactIds,
        savedQuestionsMap,
        preparation: preparation ?? EMPTY_PREPARATION,
        topicSessions,
        examPlan,
        dailyProgress,
        cpnsQuotaTrack,
        setCpnsQuotaTrack,
        quotaStatus,
        roadmap,
        missions,
        trends,
        radar,
        streak,
        trajectory,
        weeklyBuckets,
        trackReadiness,
        mistakeSummary,
        dueMistakeCount,
        activeQuiz,
        lastQuizResult,
        startQuizSession,
        closeQuizSession,
        completeQuizSession,
        markArtifactRead: markArtifactReadHandler,
        toggleBookmark,
        updateQuestionNote,
        removeMistake,
        toggleMissionDone,
        updatePreparation,
        updateExamPlan,
        refreshAllData,
      }}
    >
      {children}
    </KarirfyDataContext.Provider>
  );
};

export function useKarirfyData() {
  const ctx = useContext(KarirfyDataContext);
  if (!ctx) throw new Error("useKarirfyData must be used inside KarirfyDataProvider");
  return ctx;
}
