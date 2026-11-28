import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Search,
  Type,
  X,
} from "lucide-react";
import { useKarirfyData } from "../../contexts/KarirfyDataContext";
import { cn } from "../../lib/utils";
import type { ArtifactItem } from "../../types";

const ARTIFACT_VARIANTS = ["c-pearl", "c-navy", "c-milk"] as const;

export const ArtifactsLibraryView: React.FC = () => {
  const { artifacts, readArtifactIds, markArtifactRead } = useKarirfyData();
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("ALL");
  const [activeArtifact, setActiveArtifact] = useState<ArtifactItem | null>(null);
  const [readerFont, setReaderFont] = useState<"sm" | "md" | "lg">("md");
  const [scrollPct, setScrollPct] = useState(0);
  const bodyScrollRef = useRef<HTMLDivElement | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    artifacts.forEach((a) => a.categories?.forEach((c) => set.add(c)));
    return ["ALL", ...Array.from(set)];
  }, [artifacts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return artifacts.filter((a) => {
      const matchCat = selectedCat === "ALL" || a.categories?.includes(selectedCat);
      const matchQ =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [artifacts, search, selectedCat]);

  const openReader = (art: ArtifactItem) => {
    setActiveArtifact(art);
    setScrollPct(0);
    window.setTimeout(() => {
      if (bodyScrollRef.current) bodyScrollRef.current.scrollTop = 0;
    }, 0);
    void markArtifactRead(art.id);
  };

  useEffect(() => {
    if (!activeArtifact) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveArtifact(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeArtifact]);

  const activeListIdx = useMemo(() => {
    if (!activeArtifact) return -1;
    return filtered.findIndex((a) => String(a.id) === String(activeArtifact.id));
  }, [activeArtifact, filtered]);

  const handleReaderScroll = () => {
    const el = bodyScrollRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    if (max <= 0) {
      setScrollPct(100);
      return;
    }
    setScrollPct(Math.min(100, Math.max(0, Math.round((el.scrollTop / max) * 100))));
  };

  const readerProseClass =
    readerFont === "sm"
      ? "text-[14px] leading-[1.78]"
      : readerFont === "lg"
        ? "text-[17.5px] leading-[1.88]"
        : "text-[15.5px] leading-[1.82]";

  return (
    <div className="space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            Pustaka Artifact &amp; Referensi Kebijakan
          </h1>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">
            {readArtifactIds.length} dari {artifacts.length} bacaan sudah diselesaikan
          </p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[var(--text-tertiary)] absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari esai atau konsep..."
            className="pl-8 pr-3.5 py-2 rounded-full apple-sub-box text-xs text-[var(--text-primary)] w-64 focus:outline-none"
          />
        </div>
      </div>

      {/* Monochrome Category Pills (Wrap Cleanly Without Clipping) */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCat(cat)}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all",
              selectedCat === cat
                ? "bg-[var(--accent)] text-[var(--accent-ink)]"
                : "inner-pseudo-glass text-[var(--text-tertiary)]",
            )}
          >
            {cat === "ALL" ? "Semua Kategori" : cat}
          </button>
        ))}
      </div>

      {/* Semantic Colored Artifact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((art, idx) => {
          const isRead = readArtifactIds.includes(String(art.id));
          const variant = ARTIFACT_VARIANTS[idx % ARTIFACT_VARIANTS.length];
          const isMilk = variant === "c-milk";
          return (
            <article
              key={art.id}
              onClick={() => openReader(art)}
              className={cn(
                variant,
                "p-5 flex flex-col justify-between gap-4 cursor-pointer",
              )}
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider opacity-80">
                  <span>{art.categories?.[0] || "Artikel"}</span>
                  {isRead && (
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Dibaca
                    </span>
                  )}
                </div>
                <h2 className="text-base font-bold mt-2 leading-snug">{art.title}</h2>
                <p className="text-xs opacity-80 mt-1.5 line-clamp-3">{art.summary}</p>
              </div>

              <div
                className={cn(
                  "flex items-center justify-between pt-2.5 border-t",
                  isMilk ? "border-[var(--glass-border)]" : "border-white/15",
                )}
              >
                <span className="text-[11px] opacity-80 inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {art.readTime} menit · {art.depth}
                </span>
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1",
                    isMilk
                      ? "bg-[var(--accent)] text-[var(--accent-ink)]"
                      : "bg-white text-black",
                  )}
                >
                  <BookOpen className="w-3 h-3" />
                  Baca
                </span>
              </div>
            </article>
          );
        })}
      </div>

      {/* Editorial Liquid Glass Reader Modal */}
      {activeArtifact && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md"
          onClick={() => setActiveArtifact(null)}
          role="dialog"
          aria-modal="true"
          aria-label={activeArtifact.title}
        >
          <article
            className="dynamic-island-shell relative w-full max-w-3xl max-h-[88vh] overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dynamic-island-specular-rim" />

            {/* Top Reading Progress Bar */}
            <div className="h-[2px] w-full bg-[var(--glass-border)] shrink-0">
              <div
                className="h-full bg-[var(--accent)] transition-all duration-150"
                style={{ width: `${scrollPct}%` }}
              />
            </div>

            {/* Pinned Editorial Header */}
            <header className="shrink-0 px-6 sm:px-8 py-4 border-b border-[var(--glass-border)] flex items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2 min-w-0">
                <span className="px-2.5 py-1 rounded-full apple-sub-box text-[10px] font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  {activeArtifact.categories?.join(" · ") || "Artikel"}
                </span>
                <span className="text-[11px] text-[var(--text-tertiary)] inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {activeArtifact.readTime} mnt baca · {activeArtifact.depth}
                </span>
                {readArtifactIds.includes(String(activeArtifact.id)) && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" />
                    Sudah Dibaca
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    setReaderFont((f) => (f === "sm" ? "md" : f === "md" ? "lg" : "sm"))
                  }
                  title="Ubah ukuran font baca"
                  className="inner-pseudo-glass px-3 py-1.5 rounded-full text-xs font-semibold text-[var(--text-secondary)] inline-flex items-center gap-1"
                >
                  <Type className="w-3.5 h-3.5" />
                  <span className="uppercase">{readerFont}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveArtifact(null)}
                  className="inner-pseudo-glass w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                  aria-label="Tutup bacaan"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </header>

            {/* Scrollable Editorial Typography Body */}
            <div
              ref={bodyScrollRef}
              onScroll={handleReaderScroll}
              className="flex-1 min-h-0 slab-scroll scroll-gpu-layer px-6 sm:px-10 py-8"
            >
              <div className="max-w-[65ch] mx-auto space-y-6">
                <header className="space-y-4 pb-5 border-b border-[var(--glass-border)]">
                  <h2 className="font-serif text-2xl sm:text-4xl leading-[1.16] tracking-tight text-[var(--text-primary)]">
                    {activeArtifact.title}
                  </h2>
                  <p className="text-sm sm:text-base italic leading-relaxed text-[var(--text-tertiary)]">
                    {activeArtifact.summary}
                  </p>
                </header>

                {activeArtifact.image && (
                  <figure className="rounded-2xl overflow-hidden border border-[var(--glass-border)]">
                    <img
                      src={activeArtifact.image}
                      alt={activeArtifact.title}
                      className="w-full max-h-72 object-cover"
                    />
                  </figure>
                )}

                <div className={cn("space-y-5 text-[var(--text-secondary)]", readerProseClass)}>
                  {activeArtifact.contentBlocks?.map((block, idx) => {
                    if (block.type === "heading") {
                      return block.level === 2 ? (
                        <h3
                          key={idx}
                          className="text-lg sm:text-xl font-bold text-[var(--text-primary)] pt-3 tracking-tight"
                        >
                          {block.text}
                        </h3>
                      ) : (
                        <h4
                          key={idx}
                          className="text-base font-bold text-[var(--text-primary)] pt-2"
                        >
                          {block.text}
                        </h4>
                      );
                    }
                    if (block.type === "quote") {
                      return (
                        <blockquote
                          key={idx}
                          className="apple-sub-box p-4 sm:p-5 border-l-2 border-[var(--accent)] italic text-[var(--text-primary)]"
                        >
                          "{block.text}"
                          {block.author && (
                            <footer className="text-xs text-[var(--text-tertiary)] mt-2 not-italic font-semibold">
                              {block.author}
                            </footer>
                          )}
                        </blockquote>
                      );
                    }
                    if (block.type === "list") {
                      return (
                        <ul key={idx} className="list-disc pl-6 space-y-2">
                          {block.items.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      );
                    }
                    if (block.type === "formula") {
                      return (
                        <div
                          key={idx}
                          className="apple-sub-box px-4 py-3 font-mono text-xs sm:text-sm text-[var(--text-primary)] overflow-x-auto"
                        >
                          {block.latex}
                        </div>
                      );
                    }
                    if (block.type === "image") {
                      return (
                        <figure key={idx} className="space-y-2">
                          <img
                            src={block.src}
                            alt={block.caption || activeArtifact.title}
                            className="w-full rounded-2xl border border-[var(--glass-border)]"
                          />
                          {block.caption && (
                            <figcaption className="text-xs text-[var(--text-tertiary)] text-center">
                              {block.caption}
                            </figcaption>
                          )}
                        </figure>
                      );
                    }
                    return <p key={idx}>{block.text}</p>;
                  })}
                </div>
              </div>
            </div>

            {/* Pinned Prev / Next Navigation Footer */}
            <footer className="shrink-0 px-6 sm:px-8 py-3.5 border-t border-[var(--glass-border)] flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={activeListIdx <= 0}
                onClick={() => activeListIdx > 0 && openReader(filtered[activeListIdx - 1])}
                className="inner-pseudo-glass px-3.5 py-1.5 rounded-full text-xs font-semibold text-[var(--text-primary)] inline-flex items-center gap-1 disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Bacaan Sebelumnya</span>
              </button>

              <span className="text-[11px] font-semibold text-[var(--text-tertiary)] hidden sm:inline">
                {activeListIdx >= 0 ? `${activeListIdx + 1} / ${filtered.length}` : ""}
              </span>

              <button
                type="button"
                disabled={activeListIdx < 0 || activeListIdx >= filtered.length - 1}
                onClick={() =>
                  activeListIdx >= 0 &&
                  activeListIdx < filtered.length - 1 &&
                  openReader(filtered[activeListIdx + 1])
                }
                className="px-4 py-1.5 rounded-full bg-[var(--accent)] text-[var(--accent-ink)] text-xs font-bold inline-flex items-center gap-1 disabled:opacity-40"
              >
                <span>Bacaan Berikutnya</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </footer>
          </article>
        </div>
      )}
    </div>
  );
};
