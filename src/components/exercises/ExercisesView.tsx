import React, { useMemo, useState } from "react";
import { BookOpen, Clock, Play, Search, SlidersHorizontal } from "lucide-react";
import { EXERCISE_DOMAINS } from "../../data/curriculum";
import { useKarirfyData } from "../../contexts/KarirfyDataContext";
import { cn } from "../../lib/utils";
import type { ExerciseDomainKey, ExerciseTopic } from "../../types";

const DOMAIN_VARIANT_MAP: Record<ExerciseDomainKey, string> = {
  LPDP_Scholastic: "c-navy",
  Cognitive_Aptitude: "c-navy",
  English_Proficiency: "c-milk",
  Business_Economics: "c-milk",
  Civic_Knowledge: "c-red",
  Banking_Monetary: "c-navy",
  Psychometric: "c-pearl",
  General_Knowledge: "c-pearl",
};

export const ExercisesView: React.FC = () => {
  const { trends, quotaStatus, startQuizSession } = useKarirfyData();
  const [selectedDomain, setSelectedDomain] = useState<"ALL" | ExerciseDomainKey>("ALL");
  const [search, setSearch] = useState("");
  const [customCount, setCustomCount] = useState<number | null>(null);
  const [untimed, setUntimed] = useState(false);

  const visibleDomains = useMemo(() => {
    const q = search.trim().toLowerCase();
    return EXERCISE_DOMAINS.filter(
      (dom) => selectedDomain === "ALL" || dom.key === selectedDomain,
    )
      .map((dom) => ({
        ...dom,
        topics: dom.topics.filter(
          (t) =>
            !q ||
            t.title.toLowerCase().includes(q) ||
            t.desc.toLowerCase().includes(q) ||
            t.type.toLowerCase().includes(q),
        ),
      }))
      .filter((dom) => dom.topics.length > 0);
  }, [selectedDomain, search]);

  const handleLaunchTopic = (topic: ExerciseTopic) => {
    const totalQuestions = customCount ?? topic.defaultQuestions;
    const timeLimit = untimed
      ? 0
      : Math.max(5, Math.round((topic.defaultMinutes * totalQuestions) / topic.defaultQuestions));
    startQuizSession({
      category: topic.type,
      title: topic.title,
      totalQuestions,
      timeLimit,
      source: "exercise",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header + Monochrome Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            Exercices Terstruktur · {EXERCISE_DOMAINS.length} Domain ·{" "}
            {EXERCISE_DOMAINS.reduce((sum, d) => sum + d.topics.length, 0)} Topik
          </h1>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">
            Kartu latihan berwarna mengikuti domain kompetensi Karirfy. Kuota hari ini:{" "}
            {quotaStatus.isPro
              ? "Tanpa Batas (Pro)"
              : `${quotaStatus.exerciseRemaining ?? 0}/${quotaStatus.exerciseLimit ?? 3} tersisa`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[var(--text-tertiary)] absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari topik latihan..."
              className="pl-8 pr-3.5 py-2 rounded-full apple-sub-box text-xs text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] w-56 focus:outline-none"
            />
          </div>

          <div className="apple-segmented-track">
            {[
              { label: "Default", val: null },
              { label: "10 Soal", val: 10 },
              { label: "20 Soal", val: 20 },
            ].map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => setCustomCount(opt.val)}
                className={cn(
                  "apple-segmented-btn",
                  customCount === opt.val && "apple-segmented-btn-active",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setUntimed((u) => !u)}
            className={cn(
              "inner-pseudo-glass px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5",
              untimed ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)]",
            )}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{untimed ? "Tanpa Timer" : "Dengan Timer"}</span>
          </button>
        </div>
      </div>

      {/* Monochrome Domain Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSelectedDomain("ALL")}
          className={cn(
            "px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all",
            selectedDomain === "ALL"
              ? "bg-[var(--accent)] text-[var(--accent-ink)]"
              : "inner-pseudo-glass text-[var(--text-tertiary)]",
          )}
        >
          Semua Domain (8)
        </button>
        {EXERCISE_DOMAINS.map((dom) => (
          <button
            key={dom.key}
            type="button"
            onClick={() => setSelectedDomain(dom.key)}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all",
              selectedDomain === dom.key
                ? "bg-[var(--accent)] text-[var(--accent-ink)]"
                : "inner-pseudo-glass text-[var(--text-tertiary)]",
            )}
          >
            {dom.shortLabel} ({dom.topics.length})
          </button>
        ))}
      </div>

      {/* Domains & Semantic Karirfy Colored Exercise Cards */}
      <div className="space-y-6">
        {visibleDomains.map((dom) => {
          const cardVariant = DOMAIN_VARIANT_MAP[dom.key];
          const isMilk = cardVariant === "c-milk";
          return (
            <section key={dom.key} className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[var(--text-primary)]">{dom.label}</h2>
                <span className="text-[11px] text-[var(--text-tertiary)]">
                  {dom.topics.length} topik aktif
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
                {dom.topics.map((topic) => {
                  const trend = trends.find(
                    (tr) => tr.type.toLowerCase() === topic.type.toLowerCase(),
                  );
                  return (
                    <article
                      key={topic.type}
                      className={cn(cardVariant, "p-5 flex flex-col justify-between gap-4")}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-wider opacity-80">
                          <span>{topic.level}</span>
                          {trend ? (
                            <span>Terakhir {Math.round(trend.recent.accuracy)}%</span>
                          ) : (
                            <span>Belum diuji</span>
                          )}
                        </div>
                        <h3 className="text-base font-bold mt-2 leading-snug">{topic.title}</h3>
                        <p className="text-xs opacity-80 mt-1.5 line-clamp-2">{topic.desc}</p>
                      </div>

                      <div
                        className={cn(
                          "flex items-center justify-between gap-2 pt-2.5 border-t",
                          isMilk ? "border-[var(--glass-border)]" : "border-white/15",
                        )}
                      >
                        <div className="flex items-center gap-3 text-[11px] opacity-80">
                          <span className="inline-flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5" />
                            {customCount ?? topic.defaultQuestions} soal
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {untimed ? "Bebas" : `${topic.defaultMinutes}m`}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleLaunchTopic(topic)}
                          className={cn(
                            "px-3.5 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 transition-opacity hover:opacity-90",
                            isMilk
                              ? "bg-[var(--accent)] text-[var(--accent-ink)]"
                              : "bg-white text-black",
                          )}
                        >
                          <Play className="w-3 h-3" />
                          <span>Latih</span>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
