import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Bookmark,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  Send,
  Type,
  X,
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { useKarirfyData } from "../../contexts/KarirfyDataContext";
import { fetchQuizQuestions } from "../../lib/questionService";
import { evaluateQuizSession } from "../../lib/quizGrading";
import { optionLabel } from "../../lib/questionOptions";
import { QuestionVisual } from "./QuestionVisual";
import { cn, formatDurationSeconds } from "../../lib/utils";
import type { QuestionItem, QuizFontSize } from "../../types";

export const WebQuizRunner: React.FC = () => {
  const { theme } = useTheme();
  const {
    activeQuiz,
    closeQuizSession,
    completeQuizSession,
    savedQuestionsMap,
    toggleBookmark,
    cpnsQuotaTrack,
  } = useKarirfyData();

  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>([]);
  const [flaggedIndices, setFlaggedIndices] = useState<number[]>([]);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [fontSize, setFontSize] = useState<QuizFontSize>("md");
  const [confirmExit, setConfirmExit] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  const startedAtRef = useRef<number>(Date.now());
  const durationsRef = useRef<number[]>([]);
  const lastSwitchRef = useRef<number>(Date.now());
  const readingScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!activeQuiz) return;
    let active = true;
    setLoading(true);
    startedAtRef.current = Date.now();
    lastSwitchRef.current = Date.now();

    const load = async () => {
      const items = activeQuiz.customQuestions?.length
        ? activeQuiz.customQuestions
        : await fetchQuizQuestions(activeQuiz);
      if (!active) return;
      setQuestions(items);
      const initial = items.map((q) => activeQuiz.initialAnswers?.[q.id] ?? null);
      setUserAnswers(initial);
      setFlaggedIndices([]);
      durationsRef.current = items.map(() => 0);
      setCurrentIndex(0);
      setSecondsLeft(activeQuiz.timeLimit > 0 ? activeQuiz.timeLimit * 60 : 0);
      setLoading(false);
    };

    void load();
    return () => {
      active = false;
    };
  }, [activeQuiz]);

  const recordDwell = useCallback((idx: number) => {
    const now = Date.now();
    const deltaSec = Math.max(0, Math.round((now - lastSwitchRef.current) / 1000));
    durationsRef.current[idx] = (durationsRef.current[idx] || 0) + deltaSec;
    lastSwitchRef.current = now;
  }, []);

  const submitQuiz = useCallback(async () => {
    if (!activeQuiz || questions.length === 0) return;
    setConfirmSubmit(false);
    recordDwell(currentIndex);
    const totalTimeSec = activeQuiz.timeLimit > 0 ? activeQuiz.timeLimit * 60 : 0;
    const elapsedSec = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));
    const result = evaluateQuizSession(
      questions,
      userAnswers,
      flaggedIndices,
      elapsedSec,
      totalTimeSec,
      activeQuiz.source,
      activeQuiz.title || activeQuiz.category,
      durationsRef.current,
      {
        cpnsQuotaTrack: activeQuiz.cpnsQuotaTrack ?? cpnsQuotaTrack,
        cpnsSensoryNetra: activeQuiz.cpnsSensoryNetra,
      },
    );
    result.isMistakeDrill = activeQuiz.isMistakeDrill;
    result.isDailySprint = activeQuiz.isDailySprint;
    result.weekendEventId = activeQuiz.weekendEventId;
    result.weekendTrack = activeQuiz.weekendTrack;
    result.studySession = activeQuiz.studySession;
    await completeQuizSession(result);
  }, [
    activeQuiz,
    questions,
    userAnswers,
    flaggedIndices,
    currentIndex,
    recordDwell,
    cpnsQuotaTrack,
    completeQuizSession,
  ]);

  useEffect(() => {
    if (loading || !activeQuiz || activeQuiz.timeLimit <= 0) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          void submitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [loading, activeQuiz, submitQuiz]);

  const jumpTo = useCallback(
    (nextIdx: number) => {
      if (nextIdx < 0 || nextIdx >= questions.length) return;
      recordDwell(currentIndex);
      setCurrentIndex(nextIdx);
      readingScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    },
    [questions.length, recordDwell, currentIndex],
  );

  const selectOption = useCallback(
    (optionId: string) => {
      setUserAnswers((prev) => {
        const next = [...prev];
        next[currentIndex] = optionId;
        return next;
      });
    },
    [currentIndex],
  );

  const toggleFlag = () => {
    setFlaggedIndices((prev) =>
      prev.includes(currentIndex)
        ? prev.filter((x) => x !== currentIndex)
        : [...prev, currentIndex],
    );
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (loading || !questions.length || confirmExit || confirmSubmit) return;
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;

      const key = e.key.toUpperCase();
      const idxMap: Record<string, number> = {
        A: 0,
        B: 1,
        C: 2,
        D: 3,
        E: 4,
        "1": 0,
        "2": 1,
        "3": 2,
        "4": 3,
        "5": 4,
      };
      if (key in idxMap) {
        const opt = questions[currentIndex]?.options[idxMap[key]];
        if (opt) selectOption(opt.id);
      } else if (e.key === "ArrowRight") {
        jumpTo(currentIndex + 1);
      } else if (e.key === "ArrowLeft") {
        jumpTo(currentIndex - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [loading, questions, currentIndex, confirmExit, confirmSubmit, selectOption, jumpTo]);

  if (!activeQuiz) return null;

  if (loading) {
    return (
      <div className="floating-slab flex-1 flex flex-col items-center justify-center p-10">
        <p className="text-sm font-bold text-[var(--text-primary)]">
          Menyiapkan bank soal {activeQuiz.title || activeQuiz.category}...
        </p>
        <p className="text-xs text-[var(--text-tertiary)] mt-1">
          Sinkronisasi butir soal CAT CBT &amp; prioritas soal baru
        </p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const currentAnswer = userAnswers[currentIndex] ?? null;
  const isFlagged = flaggedIndices.includes(currentIndex);
  const isBookmarked = Boolean(
    currentQuestion && savedQuestionsMap[currentQuestion.id]?.isBookmarked,
  );
  const answeredCount = userAnswers.filter(Boolean).length;
  const unansweredCount = Math.max(0, questions.length - answeredCount);
  const progressPct = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0;

  const stemFontClass =
    fontSize === "sm"
      ? "text-[14.5px] leading-[1.72]"
      : fontSize === "lg"
        ? "text-[18px] leading-[1.82]"
        : "text-[16px] leading-[1.78]";

  const optionFontClass =
    fontSize === "sm"
      ? "text-[13px] leading-relaxed"
      : fontSize === "lg"
        ? "text-[15.5px] leading-relaxed"
        : "text-[14px] leading-relaxed";

  const cycleFontSize = () => {
    setFontSize((prev) => (prev === "sm" ? "md" : prev === "md" ? "lg" : "sm"));
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-3.5 overflow-hidden">
      {/* LEFT QUESTION SLAB: Pinned Header + Smooth Inset Scroll Stage + Pinned Footer */}
      <section className="floating-slab flex-1 min-w-0 overflow-hidden flex flex-col">
        {/* Top 2px Hairline Progress */}
        <div className="h-[2px] w-full bg-[var(--glass-border)] shrink-0">
          <div
            className="h-full bg-[var(--accent)] transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Pinned Runner Header */}
        <header className="shrink-0 px-5 lg:px-7 py-3.5 border-b border-[var(--glass-border)] flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] truncate">
              {activeQuiz.source === "assessment" ? "Simulasi CAT CBT" : "Mode Latihan"} ·{" "}
              {currentQuestion?.type || activeQuiz.category}
            </div>
            <h2 className="text-sm lg:text-base font-bold text-[var(--text-primary)] truncate">
              {activeQuiz.title || activeQuiz.category}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeQuiz.timeLimit > 0 && (
              <div
                className={cn(
                  "px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold amount border",
                  secondsLeft <= 120
                    ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                    : "apple-sub-box text-[var(--text-primary)]",
                )}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{formatDurationSeconds(secondsLeft)}</span>
              </div>
            )}

            <button
              type="button"
              onClick={cycleFontSize}
              title="Ubah ukuran teks soal"
              className="inner-pseudo-glass px-3 py-1.5 rounded-full text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1"
            >
              <Type className="w-3.5 h-3.5" />
              <span className="uppercase">{fontSize}</span>
            </button>

            <button
              type="button"
              onClick={() => currentQuestion && toggleBookmark(currentQuestion)}
              className={cn(
                "inner-pseudo-glass px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1",
                isBookmarked ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)]",
              )}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isBookmarked ? "Tersimpan" : "Simpan"}</span>
            </button>

            <button
              type="button"
              onClick={toggleFlag}
              className={cn(
                "inner-pseudo-glass px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1",
                isFlagged
                  ? "text-amber-400 border-amber-500/40"
                  : "text-[var(--text-tertiary)]",
              )}
            >
              <Flag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ragu</span>
            </button>

            <button
              type="button"
              onClick={() => setConfirmExit(true)}
              className="inner-pseudo-glass w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              aria-label="Keluar Sesi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Scrollable Centered Question Reading Canvas */}
        <div
          ref={readingScrollRef}
          className="flex-1 min-h-0 slab-scroll scroll-gpu-layer px-5 lg:px-8 py-6"
        >
          {currentQuestion && (
            <div className="max-w-3xl mx-auto space-y-5">
              {/* Metadata Badge Bar */}
              <div className="flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full apple-sub-box text-xs font-bold text-[var(--text-primary)]">
                    Soal {currentIndex + 1} / {questions.length}
                  </span>
                  <span className="text-[11px] font-semibold text-[var(--text-tertiary)]">
                    {currentQuestion.type}
                  </span>
                </div>
                {isFlagged && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px] font-semibold">
                    Ditandai Ragu-ragu
                  </span>
                )}
              </div>

              {/* Optional Visual / Matrix / Diagram */}
              <QuestionVisual
                question={currentQuestion}
                theme={theme}
                selected={currentAnswer}
                onSelect={selectOption}
              />

              {/* Question Stem */}
              <div
                className={cn(
                  "font-medium text-[var(--text-primary)] whitespace-pre-line",
                  stemFontClass,
                )}
              >
                {currentQuestion.question}
              </div>

              {/* Options List */}
              <div className="space-y-2.5 pt-2">
                {currentQuestion.options.map((opt, idx) => {
                  const selected = currentAnswer === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => selectOption(opt.id)}
                      className={cn(
                        "w-full p-4 rounded-2xl text-left flex items-start justify-between gap-3 border transition-all",
                        selected
                          ? "bg-[var(--accent)] text-[var(--accent-ink)] border-transparent shadow-md"
                          : "apple-card hover:opacity-95 text-[var(--text-primary)]",
                      )}
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <span
                          className={cn(
                            "w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0 mt-0.5",
                            selected
                              ? "bg-[var(--accent-ink)] text-[var(--accent)]"
                              : "apple-sub-box text-[var(--text-secondary)]",
                          )}
                        >
                          {optionLabel(idx)}
                        </span>
                        <span className={cn("pt-0.5", optionFontClass)}>{opt.text}</span>
                      </div>
                      {selected && <Check className="w-4 h-4 shrink-0 mt-1" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Pinned Footer Controls */}
        <footer className="shrink-0 px-5 lg:px-7 py-3.5 border-t border-[var(--glass-border)] flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => jumpTo(currentIndex - 1)}
            className="inner-pseudo-glass px-4 py-2 rounded-full text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Sebelumnya</span>
          </button>

          <div className="text-[11px] text-[var(--text-tertiary)] hidden sm:block">
            Pintasan: A-E memilih · Panah Kiri/Kanan navigasi
          </div>

          {currentIndex < questions.length - 1 ? (
            <button
              type="button"
              onClick={() => jumpTo(currentIndex + 1)}
              className="px-5 py-2 rounded-full bg-[var(--accent)] text-[var(--accent-ink)] text-xs font-bold flex items-center gap-1"
            >
              <span>Berikutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmSubmit(true)}
              className="px-5 py-2 rounded-full bg-[var(--accent)] text-[var(--accent-ink)] text-xs font-bold flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kumpulkan Jawaban</span>
            </button>
          )}
        </footer>
      </section>

      {/* RIGHT NAVIGATOR SLAB */}
      <aside className="floating-slab w-full lg:w-[304px] shrink-0 overflow-hidden flex flex-col">
        <div className="shrink-0 p-5 pb-3 border-b border-[var(--glass-border)]">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
              Peta Navigasi Soal
            </h3>
            <span className="text-xs font-bold amount text-[var(--text-primary)]">
              {answeredCount}/{questions.length}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-2.5 text-[10px] text-[var(--text-tertiary)]">
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[var(--text-primary)]" /> Terjawab
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Ragu ({flaggedIndices.length})
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full border border-[var(--glass-border)]" /> Kosong
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-0 slab-scroll scroll-gpu-layer p-5">
          <div className="grid grid-cols-5 gap-2">
            {questions.map((_, idx) => {
              const isCurrent = idx === currentIndex;
              const isAns = Boolean(userAnswers[idx]);
              const isFlg = flaggedIndices.includes(idx);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => jumpTo(idx)}
                  className={cn(
                    "h-9 rounded-xl text-xs font-bold transition-transform border relative",
                    isCurrent
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 border-transparent shadow-sm ring-2 ring-zinc-900/20 dark:ring-white/30"
                      : isFlg
                        ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/45"
                        : isAns
                          ? "bg-zinc-200 text-zinc-950 border-zinc-400/50 dark:bg-white/20 dark:text-white dark:border-white/25"
                          : "bg-black/[0.04] text-zinc-500 border-black/[0.08] dark:bg-white/[0.04] dark:text-zinc-400 dark:border-white/[0.08] hover:text-zinc-900 dark:hover:text-white",
                  )}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        <div className="shrink-0 p-4 border-t border-[var(--glass-border)]">
          <button
            type="button"
            onClick={() => setConfirmSubmit(true)}
            className="w-full py-2.5 px-4 rounded-full bg-[var(--accent)] text-[var(--accent-ink)] text-xs font-bold flex items-center justify-center gap-2 hover:opacity-90"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Selesaikan &amp; Nilai</span>
          </button>
        </div>
      </aside>

      {/* Confirm Submit Modal */}
      {confirmSubmit && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setConfirmSubmit(false)}
        >
          <div
            className="dynamic-island-shell relative max-w-md w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dynamic-island-specular-rim" />
            <div>
              <h4 className="text-base font-bold text-[var(--text-primary)]">
                Kumpulkan Sesi Sekarang?
              </h4>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                Periksa kembali ringkasan jawaban sebelum skor dihitung.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="apple-sub-box p-3">
                <div className="text-lg font-bold amount text-[var(--text-primary)]">
                  {answeredCount}
                </div>
                <div className="text-[10px] text-[var(--text-tertiary)]">Terjawab</div>
              </div>
              <div className="apple-sub-box p-3">
                <div className="text-lg font-bold amount text-amber-400">
                  {flaggedIndices.length}
                </div>
                <div className="text-[10px] text-[var(--text-tertiary)]">Ragu-ragu</div>
              </div>
              <div className="apple-sub-box p-3">
                <div className="text-lg font-bold amount text-[var(--text-tertiary)]">
                  {unansweredCount}
                </div>
                <div className="text-[10px] text-[var(--text-tertiary)]">Kosong</div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setConfirmSubmit(false)}
                className="inner-pseudo-glass px-4 py-2 rounded-full text-xs font-semibold text-[var(--text-primary)]"
              >
                Periksa Lagi
              </button>
              <button
                type="button"
                onClick={() => void submitQuiz()}
                className="px-5 py-2 rounded-full bg-[var(--accent)] text-[var(--accent-ink)] text-xs font-bold"
              >
                Ya, Nilai Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Exit Modal */}
      {confirmExit && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setConfirmExit(false)}
        >
          <div
            className="dynamic-island-shell relative max-w-sm w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dynamic-island-specular-rim" />
            <h4 className="text-sm font-bold text-[var(--text-primary)]">
              Keluar dari sesi ujian?
            </h4>
            <p className="text-xs text-[var(--text-tertiary)]">
              Progres sesi yang belum dikumpulkan tidak akan disimpan ke riwayat nilai.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmExit(false)}
                className="inner-pseudo-glass px-4 py-2 rounded-full text-xs font-semibold text-[var(--text-primary)]"
              >
                Lanjutkan Ujian
              </button>
              <button
                type="button"
                onClick={closeQuizSession}
                className="px-4 py-2 rounded-full bg-red-600 text-white text-xs font-bold"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
