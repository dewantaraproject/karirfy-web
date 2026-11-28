import React, { useEffect, useMemo, useState } from "react";
import { Award, Calendar, Clock, Play, Search, Sparkles } from "lucide-react";
import { ASSESSMENT_CATEGORIES } from "../../data/curriculum";
import { useKarirfyData } from "../../contexts/KarirfyDataContext";
import {
  getWeekendTryout,
  getWeekendWindow,
  loadWeekendQuiz,
  WEEKEND_TRACKS,
} from "../../lib/weekendTryoutService";
import { cn } from "../../lib/utils";
import type {
  AssessmentBattery,
  AssessmentCategoryKey,
  WeekendTrack,
  WeekendTryoutEvent,
} from "../../types";

const CATEGORY_VARIANT_MAP: Record<AssessmentCategoryKey, string> = {
  Government_BUMN: "c-red",
  Bank_Indonesia: "c-navy",
  LPDP_Scholastic: "c-navy",
  Cognitive_Screening: "c-navy",
  Comprehensive_Aptitude: "c-navy",
  English_Proficiency: "c-milk",
  Domain_Expertise: "c-milk",
  Psychometric_Behavioral: "c-pearl",
  Applied_Reasoning: "c-pearl",
  Premium_Comprehensive: "c-red",
};

export const AssessmentView: React.FC = () => {
  const { quotaStatus, cpnsQuotaTrack, startQuizSession } = useKarirfyData();
  const [selectedCat, setSelectedCat] = useState<"ALL" | AssessmentCategoryKey>("ALL");
  const [search, setSearch] = useState("");
  const [weekendTrack, setWeekendTrack] = useState<WeekendTrack>("CPNS");
  const [weekendEvent, setWeekendEvent] = useState<WeekendTryoutEvent | null>(null);
  const [weekendLoading, setWeekendLoading] = useState(false);
  const weekendWindow = useMemo(() => getWeekendWindow(), []);

  useEffect(() => {
    let active = true;
    void getWeekendTryout(weekendTrack, weekendWindow.weekKey).then((res) => {
      if (active) setWeekendEvent(res.event);
    });
    return () => {
      active = false;
    };
  }, [weekendTrack, weekendWindow.weekKey]);

  const handleStartWeekend = async () => {
    if (!weekendEvent) return;
    setWeekendLoading(true);
    try {
      const cfg = await loadWeekendQuiz(weekendEvent);
      if (cfg) startQuizSession(cfg);
    } finally {
      setWeekendLoading(false);
    }
  };

  const handleLaunchBattery = (battery: AssessmentBattery) => {
    startQuizSession({
      category: battery.type,
      title: battery.title,
      totalQuestions: battery.defaultQuestions,
      timeLimit: battery.defaultMinutes,
      source: "assessment",
      assessmentCategories: battery.exerciseCategories,
      categoryQuotas: battery.categoryQuotas,
      cpnsQuotaTrack,
    });
  };

  const visibleCategories = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ASSESSMENT_CATEGORIES.filter(
      (cat) => selectedCat === "ALL" || cat.key === selectedCat,
    )
      .map((cat) => ({
        ...cat,
        batteries: cat.batteries.filter(
          (b) =>
            !q ||
            b.title.toLowerCase().includes(q) ||
            b.desc.toLowerCase().includes(q) ||
            b.type.toLowerCase().includes(q),
        ),
      }))
      .filter((cat) => cat.batteries.length > 0);
  }, [selectedCat, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            Simulasi CAT CBT &amp; Tryout Serentak
          </h1>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">
            Paket assessment berstandar ujian nasional. Kuota harian:{" "}
            {quotaStatus.isPro
              ? "Tanpa Batas (Pro)"
              : quotaStatus.isGuest
                ? "Mode Tamu (Masuk untuk akses penuh)"
                : `${quotaStatus.assessmentRemaining ?? 0}/${quotaStatus.assessmentLimit ?? 1} tersisa hari ini`}
          </p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[var(--text-tertiary)] absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari paket SKD, AKHLAK, TBS..."
            className="pl-8 pr-3.5 py-2 rounded-full apple-sub-box text-xs text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] w-64 focus:outline-none"
          />
        </div>
      </div>

      {/* Weekend Tryout Serentak Banner Card (.c-navy highlight content card) */}
      <div className="c-navy p-5 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>Tryout Serentak Akhir Pekan · {weekendWindow.weekKey}</span>
            </div>
            <h2 className="text-lg font-bold mt-2">
              {weekendEvent?.title ?? `Tryout Nasional Jalur ${weekendTrack}`}
            </h2>
            <p className="text-xs text-white/80 mt-1">
              {weekendWindow.status === "active"
                ? "Sesi serentak sedang berlangsung! Kerjakan untuk melihat peringkat persentil nasional."
                : "Dibuka setiap Sabtu pukul 00.00 WIB hingga Minggu 23.59 WIB."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-black/25 p-1 rounded-full border border-white/15">
              {WEEKEND_TRACKS.map((trk) => (
                <button
                  key={trk}
                  type="button"
                  onClick={() => setWeekendTrack(trk)}
                  className={cn(
                    "px-3 py-1 rounded-full text-[11px] font-semibold transition-all",
                    weekendTrack === trk ? "bg-white text-black" : "text-white/80 hover:text-white",
                  )}
                >
                  {trk}
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={!weekendEvent || weekendWindow.status !== "active" || weekendLoading}
              onClick={() => void handleStartWeekend()}
              className="px-4 py-2 rounded-full bg-white text-black text-xs font-bold inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {weekendLoading
                  ? "Memuat..."
                  : weekendWindow.status === "active"
                    ? "Ikuti Tryout"
                    : "Menunggu Jadwal"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Monochrome Category Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSelectedCat("ALL")}
          className={cn(
            "px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all",
            selectedCat === "ALL"
              ? "bg-[var(--accent)] text-[var(--accent-ink)]"
              : "inner-pseudo-glass text-[var(--text-tertiary)]",
          )}
        >
          Semua Kategori ({ASSESSMENT_CATEGORIES.length})
        </button>
        {ASSESSMENT_CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            type="button"
            onClick={() => setSelectedCat(cat.key)}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all",
              selectedCat === cat.key
                ? "bg-[var(--accent)] text-[var(--accent-ink)]"
                : "inner-pseudo-glass text-[var(--text-tertiary)]",
            )}
          >
            {cat.shortLabel} ({cat.batteries.length})
          </button>
        ))}
      </div>

      {/* Semantic Colored Battery Cards */}
      <div className="space-y-6">
        {visibleCategories.map((cat) => {
          const cardVariant = CATEGORY_VARIANT_MAP[cat.key];
          const isMilk = cardVariant === "c-milk";
          return (
            <section key={cat.key} className="space-y-3">
              <div>
                <h2 className="text-sm font-bold text-[var(--text-primary)]">{cat.label}</h2>
                <p className="text-[11px] text-[var(--text-tertiary)]">{cat.description}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
                {cat.batteries.map((bat) => (
                  <article
                    key={bat.type}
                    className={cn(cardVariant, "p-5 flex flex-col justify-between gap-4")}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider opacity-80">
                        <span>{cat.shortLabel}</span>
                        {bat.passingScore && (
                          <span className="inline-flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            PG {bat.passingScore}%
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold mt-2 leading-snug">{bat.title}</h3>
                      <p className="text-xs opacity-80 mt-1.5 line-clamp-2">{bat.desc}</p>
                    </div>

                    <div
                      className={cn(
                        "flex items-center justify-between pt-2.5 border-t",
                        isMilk ? "border-[var(--glass-border)]" : "border-white/15",
                      )}
                    >
                      <div className="flex items-center gap-3 text-[11px] opacity-80">
                        <span>{bat.defaultQuestions} soal</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {bat.defaultMinutes} menit
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleLaunchBattery(bat)}
                        className={cn(
                          "px-3.5 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 hover:opacity-90",
                          isMilk
                            ? "bg-[var(--accent)] text-[var(--accent-ink)]"
                            : "bg-white text-black",
                        )}
                      >
                        <Play className="w-3 h-3" />
                        <span>Mulai CBT</span>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
