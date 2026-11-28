import React, { useState } from "react";
import { ArrowLeft, CheckCircle2, ChevronDown, ChevronUp, Download, ShieldAlert, Timer } from "lucide-react";
import { useKarirfyData } from "../../contexts/KarirfyDataContext";
import { computeForensicTimeSink } from "../../lib/statsAnalytics";
import { shareScoreCardPng } from "../../lib/scoreCardExport";
import { QuestionDiscussion } from "./QuestionDiscussion";
import { cn, formatDurationSeconds } from "../../lib/utils";

export const WebQuizResults: React.FC = () => {
  const { lastQuizResult, closeQuizSession } = useKarirfyData();
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0);
  const [exporting, setExporting] = useState(false);

  if (!lastQuizResult) return null;

  const forensic = computeForensicTimeSink(lastQuizResult);
  const official = lastQuizResult.officialSummary;
  const passed = official ? official.passed : lastQuizResult.score >= 70;

  const handleDownloadScoreCard = async () => {
    setExporting(true);
    try {
      await shareScoreCardPng({
        eyebrow: lastQuizResult.source === "assessment" ? "SIMULASI CAT CBT" : "LATIHAN KARIRFY",
        title: lastQuizResult.quizName,
        scoreLabel: official ? official.examLabel : "Skor Akurasi Akhir",
        scoreValue: official
          ? `${official.totalPoints}`
          : `${lastQuizResult.score}%`,
        statusBadge: passed ? "MEMENUHI AMBANG" : "PERLU PENGUATAN",
        highlightTone: passed ? "navy" : "crimson",
        metrics: [
          {
            label: "Jawaban Benar",
            value: `${lastQuizResult.correctAnswers}/${lastQuizResult.questions.length}`,
          },
          { label: "Durasi Sesi", value: formatDurationSeconds(lastQuizResult.timeTaken) },
          { label: "Skor Poin", value: `${lastQuizResult.rawPoints}/${lastQuizResult.maxPoints}` },
          { label: "Status", value: passed ? "Lolos Target" : "Evaluasi" },
        ],
        footerNote: "karirfy-web.dewantaraproject-id.workers.dev",
        filename: `karirfy-skor-${Date.now()}.png`,
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="floating-slab flex-1 overflow-hidden flex flex-col">
      {/* Pinned Top Results Bar */}
      <header className="shrink-0 px-5 lg:px-7 py-3.5 border-b border-[var(--glass-border)] flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={closeQuizSession}
          className="inner-pseudo-glass px-4 py-2 rounded-full text-xs font-semibold text-[var(--text-primary)] inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Workstation</span>
        </button>

        <button
          type="button"
          disabled={exporting}
          onClick={() => void handleDownloadScoreCard()}
          className="px-4 py-2 rounded-full bg-[var(--accent)] text-[var(--accent-ink)] text-xs font-bold inline-flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{exporting ? "Merender PNG..." : "Unduh Kartu Skor PNG"}</span>
        </button>
      </header>

      {/* Scrollable Results Content */}
      <div className="flex-1 min-h-0 slab-scroll scroll-gpu-layer p-5 lg:p-7">
        <div className="max-w-5xl mx-auto space-y-5">
          {/* Hero Summary Card (Karirfy Semantic Content Card) */}
          <div className={cn(passed ? "c-navy" : "c-red", "p-6")}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 text-[10px] font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{passed ? "Lolos Ambang Acuan" : "Perlu Penguatan Materi"}</span>
                </div>
                <h1 className="text-xl font-bold mt-2">{lastQuizResult.quizName}</h1>
                <p className="text-xs text-white/80 mt-1">
                  {lastQuizResult.correctAnswers} benar · {lastQuizResult.incorrectAnswers} salah ·{" "}
                  {lastQuizResult.unanswered} kosong ·{" "}
                  {formatDurationSeconds(lastQuizResult.timeTaken)}
                </p>
              </div>

              <div className="text-right">
                <div className="text-xs text-white/75">
                  {official ? official.examLabel : "Akurasi Total"}
                </div>
                <div className="text-4xl font-bold amount">
                  {official ? official.totalPoints : `${lastQuizResult.score}%`}
                  {official && (
                    <span className="text-sm font-medium text-white/75">
                      {" "}
                      / {official.maxPoints}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {official?.subtests?.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                {official.subtests.map((sub) => (
                  <div
                    key={sub.label}
                    className="rounded-2xl bg-black/25 border border-white/15 p-3.5"
                  >
                    <div className="text-[11px] font-semibold text-white/80">{sub.label}</div>
                    <div className="text-lg font-bold amount text-white mt-0.5">
                      {sub.points} / {sub.maxPoints}
                    </div>
                    <div className="text-[10px] text-white/75">
                      PG {sub.passingPoints} · {sub.passed ? "Lulus" : "Belum"}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* Category Breakdown + Forensic Time-Sink */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7 apple-card p-5 space-y-3">
              <h2 className="text-sm font-bold text-[var(--text-primary)]">Rincian per Topik</h2>
              <div className="space-y-2">
                {lastQuizResult.categoryBreakdown.map((item) => (
                  <div
                    key={item.type}
                    className="apple-sub-box p-3 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-[var(--text-primary)]">{item.type}</div>
                      <div className="text-[11px] text-[var(--text-tertiary)]">
                        {item.correct}/{item.total} benar
                        {item.avgSeconds ? ` · ${item.avgSeconds} dtk/soal` : ""}
                      </div>
                    </div>
                    <div className="text-sm font-bold amount text-[var(--text-primary)]">
                      {Math.round(item.percentage)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 apple-card p-5 space-y-3">
              <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Timer className="w-4 h-4" />
                <span>Forensic Time-Sink</span>
              </h2>
              {forensic ? (
                <div className="apple-sub-box p-4 space-y-2 text-xs">
                  <div className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    <span>{forensic.slowestTopic ?? "Kecepatan Merata"}</span>
                  </div>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    {forensic.wrongTimeSharePct}% total waktu (
                    {formatDurationSeconds(forensic.wrongSeconds)}) terserap pada{" "}
                    {forensic.wrongCount} soal yang kurang tepat
                    {forensic.slowestQuestionNumber
                      ? `, terlama pada No. ${forensic.slowestQuestionNumber} (${forensic.slowestSeconds} dtk)`
                      : "."}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-[var(--text-tertiary)]">
                  Kecepatan pengerjaan per soal sudah merata.
                </p>
              )}
            </div>
          </div>

          {/* Pembahasan Lengkap */}
          <div className="apple-card p-5 space-y-3">
            <h2 className="text-sm font-bold text-[var(--text-primary)]">
              Pembahasan &amp; Review ({lastQuizResult.questions.length} Soal)
            </h2>
            <div className="space-y-2.5">
              {lastQuizResult.questions.map((q, idx) => {
                const open = expandedIdx === idx;
                const userAns = lastQuizResult.userAnswers[idx];
                const isCorrect = Boolean(
                  userAns && q.correct && userAns.toLowerCase() === q.correct.toLowerCase(),
                );
                return (
                  <div key={q.id} className="apple-sub-box overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setExpandedIdx(open ? null : idx)}
                      className="w-full p-4 text-left flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-[11px] font-bold">
                          <span className="text-[var(--text-tertiary)]">
                            No. {idx + 1} · {q.type}
                          </span>
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-[10px]",
                              isCorrect
                                ? "bg-emerald-500/15 text-emerald-400"
                                : userAns
                                  ? "bg-red-500/15 text-red-400"
                                  : "bg-zinc-500/15 text-[var(--text-tertiary)]",
                            )}
                          >
                            {isCorrect ? "Benar" : userAns ? "Salah" : "Kosong"}
                          </span>
                        </div>
                        <div className="text-xs font-medium text-[var(--text-primary)] truncate mt-1">
                          {q.question}
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-[var(--text-secondary)] shrink-0 inline-flex items-center gap-1">
                        <span>{open ? "Tutup" : "Bahas"}</span>
                        {open ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </span>
                    </button>
                    {open && (
                      <div className="px-4 pb-4 pt-2 border-t border-[var(--glass-border)] text-xs text-[var(--text-secondary)]">
                        <QuestionDiscussion question={q} userAnswer={userAns} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
