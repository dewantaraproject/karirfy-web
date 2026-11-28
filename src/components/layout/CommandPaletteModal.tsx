import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpen, Clock, Layers, Search, Terminal, X } from "lucide-react";
import { ASSESSMENT_CATEGORIES, EXERCISE_DOMAINS } from "../../data/curriculum";
import { useKarirfyData } from "../../contexts/KarirfyDataContext";
import type { NavTabId } from "./Sidebar";

interface CommandPaletteModalProps {
  open: boolean;
  onClose: () => void;
  onNavigateTab: (tab: NavTabId) => void;
  onLaunchExercise: (topicType: string) => void;
  onLaunchAssessment: (batteryType: string) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  open,
  onClose,
  onNavigateTab,
  onLaunchExercise,
  onLaunchAssessment,
}) => {
  const { artifacts } = useKarirfyData();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (open) setQuery("");
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const views: { label: string; sub: string; tab: NavTabId }[] = [
      { label: "Ringkasan Workstation", sub: "Bento Dashboard", tab: "dashboard" },
      { label: "Rencana & Kalkulator CPNS 2026", sub: "Kurikulum 4 Fase + 40/60 SKD SKB", tab: "roadmap" },
      { label: "Exercices 38 Topik", sub: "Latihan per domain", tab: "exercises" },
      { label: "Simulasi CAT CBT & Tryout Akhir Pekan", sub: "47+ Paket Resmi", tab: "assessment" },
      { label: "Analitik Kesiapan & Pacing", sub: "Radar & Tren Skor", tab: "statistics" },
      { label: "Bank Evaluasi SRS", sub: "Ulangi soal salah & bookmark", tab: "mistakes" },
      { label: "Studio CV ATS Gratis", sub: "16 Template ekspor PDF & DOCX", tab: "cv-studio" },
      { label: "Interview STAR Studio", sub: "Susun skrip LGD & wawancara", tab: "star-studio" },
      { label: "Lab Kraepelin", sub: "Ketahanan fokus dengan keyboard numpad", tab: "kraepelin" },
      { label: "Pustaka Artifact", sub: "Esai konseptual & regulasi", tab: "artifacts" },
      { label: "Pengaturan & Tautan QR", sub: "Profil, Paket Pro & sinkronisasi iOS", tab: "settings" },
    ];

    const matchedViews = views
      .filter((v) => !q || v.label.toLowerCase().includes(q) || v.sub.toLowerCase().includes(q))
      .slice(0, q ? 5 : 4);

    const matchedTopics = EXERCISE_DOMAINS.flatMap((dom) =>
      dom.topics
        .filter(
          (t) =>
            !q ||
            t.title.toLowerCase().includes(q) ||
            t.type.toLowerCase().includes(q) ||
            dom.label.toLowerCase().includes(q),
        )
        .map((t) => ({ domain: dom.shortLabel, topic: t })),
    ).slice(0, q ? 6 : 3);

    const matchedBatteries = ASSESSMENT_CATEGORIES.flatMap((cat) =>
      cat.batteries
        .filter(
          (b) =>
            !q ||
            b.title.toLowerCase().includes(q) ||
            b.type.toLowerCase().includes(q) ||
            cat.label.toLowerCase().includes(q),
        )
        .map((b) => ({ category: cat.shortLabel, battery: b })),
    ).slice(0, q ? 6 : 3);

    const matchedArtifacts = artifacts
      .filter(
        (a) =>
          !q ||
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q),
      )
      .slice(0, q ? 4 : 2);

    return { matchedViews, matchedTopics, matchedBatteries, matchedArtifacts };
  }, [query, artifacts]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Spotlight Karirfy"
    >
      <div
        className="dynamic-island-shell relative w-full max-w-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dynamic-island-specular-rim" />
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--glass-border)]">
          <Search className="w-4 h-4 text-[var(--text-tertiary)] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ketik topik latihan, simulasi SKD, CV ATS, atau halaman..."
            className="w-full bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="inner-pseudo-glass w-7 h-7 rounded-full flex items-center justify-center text-[var(--text-tertiary)]"
            aria-label="Tutup Spotlight"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {results.matchedViews.length > 0 && (
            <div>
              <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                Navigasi Workstation
              </div>
              <div className="space-y-1">
                {results.matchedViews.map((v) => (
                  <button
                    key={v.tab}
                    type="button"
                    onClick={() => {
                      onNavigateTab(v.tab);
                      onClose();
                    }}
                    className="w-full px-3 py-2 rounded-xl flex items-center justify-between text-left hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Terminal className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                      <div>
                        <div className="text-xs font-semibold text-[var(--text-primary)]">
                          {v.label}
                        </div>
                        <div className="text-[11px] text-[var(--text-tertiary)]">{v.sub}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.matchedTopics.length > 0 && (
            <div>
              <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                Topik Exercices
              </div>
              <div className="space-y-1">
                {results.matchedTopics.map(({ domain, topic }) => (
                  <button
                    key={topic.type}
                    type="button"
                    onClick={() => {
                      onLaunchExercise(topic.type);
                      onClose();
                    }}
                    className="w-full px-3 py-2 rounded-xl flex items-center justify-between text-left hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <BookOpen className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                      <div>
                        <div className="text-xs font-semibold text-[var(--text-primary)]">
                          {topic.title}
                        </div>
                        <div className="text-[11px] text-[var(--text-tertiary)]">
                          {domain} · {topic.defaultQuestions} soal · {topic.defaultMinutes} menit
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.matchedBatteries.length > 0 && (
            <div>
              <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                Simulasi &amp; Assessment CAT
              </div>
              <div className="space-y-1">
                {results.matchedBatteries.map(({ category, battery }) => (
                  <button
                    key={battery.type}
                    type="button"
                    onClick={() => {
                      onLaunchAssessment(battery.type);
                      onClose();
                    }}
                    className="w-full px-3 py-2 rounded-xl flex items-center justify-between text-left hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                      <div>
                        <div className="text-xs font-semibold text-[var(--text-primary)]">
                          {battery.title}
                        </div>
                        <div className="text-[11px] text-[var(--text-tertiary)]">
                          {category} · {battery.defaultQuestions} soal · {battery.defaultMinutes} menit
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.matchedArtifacts.length > 0 && (
            <div>
              <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                Pustaka Artifact
              </div>
              <div className="space-y-1">
                {results.matchedArtifacts.map((art) => (
                  <button
                    key={art.id}
                    type="button"
                    onClick={() => {
                      onNavigateTab("artifacts");
                      onClose();
                    }}
                    className="w-full px-3 py-2 rounded-xl flex items-center justify-between text-left hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Layers className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[var(--text-primary)] truncate">
                          {art.title}
                        </div>
                        <div className="text-[11px] text-[var(--text-tertiary)] truncate">
                          {art.readTime} menit baca
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
