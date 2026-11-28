import React, { useMemo, useState } from "react";
import { Bookmark, Check, Play, Search, StickyNote, Trash2 } from "lucide-react";
import { useKarirfyData } from "../../contexts/KarirfyDataContext";
import { getDueMistakes } from "../../lib/mistakeBankService";
import { cn } from "../../lib/utils";
import type { SavedQuestionEntry } from "../../types";

type MistakeFilter = "due" | "all" | "bookmarked";

export const MistakeBankView: React.FC = () => {
  const {
    savedQuestionsMap,
    updateQuestionNote,
    removeMistake,
    startQuizSession,
  } = useKarirfyData();

  const [filter, setFilter] = useState<MistakeFilter>("due");
  const [search, setSearch] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  const allEntries = useMemo(() => Object.values(savedQuestionsMap), [savedQuestionsMap]);
  const dueEntries = useMemo(() => getDueMistakes(allEntries), [allEntries]);

  const visibleEntries = useMemo(() => {
    const base =
      filter === "due"
        ? dueEntries
        : filter === "bookmarked"
          ? allEntries.filter((e) => e.isBookmarked)
          : allEntries.filter((e) => e.isMistake);

    const q = search.trim().toLowerCase();
    return base.filter(
      (e) =>
        !q ||
        e.question.question.toLowerCase().includes(q) ||
        e.question.type.toLowerCase().includes(q) ||
        (e.userNote || "").toLowerCase().includes(q),
    );
  }, [filter, dueEntries, allEntries, search]);

  const startDrill = (entries: SavedQuestionEntry[]) => {
    if (!entries.length) return;
    startQuizSession({
      category: "Evaluasi SRS",
      title: `Drill Bank Evaluasi (${entries.length} Soal)`,
      totalQuestions: entries.length,
      timeLimit: Math.max(10, Math.round(entries.length * 1.2)),
      source: "exercise",
      customQuestions: entries.slice(0, 25).map((e) => e.question),
      isMistakeDrill: true,
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            Bank Evaluasi &amp; Spaced Repetition (SRS)
          </h1>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">
            {dueEntries.length} soal jatuh tempo ·{" "}
            {allEntries.filter((e) => e.isBookmarked).length} bookmark tersimpan
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[var(--text-tertiary)] absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari soal atau catatan..."
              className="pl-8 pr-3.5 py-2 rounded-full apple-sub-box text-xs text-[var(--text-primary)] w-52 focus:outline-none"
            />
          </div>

          <button
            type="button"
            disabled={visibleEntries.length === 0}
            onClick={() => startDrill(visibleEntries)}
            className="px-4 py-2 rounded-full bg-[var(--accent)] text-[var(--accent-ink)] text-xs font-bold inline-flex items-center gap-1.5 disabled:opacity-40"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Mulai Drill ({Math.min(25, visibleEntries.length)})</span>
          </button>
        </div>
      </div>

      {/* Monochrome Segmented Filter */}
      <div className="apple-segmented-track">
        {[
          { id: "due" as const, label: `Jatuh Tempo (${dueEntries.length})` },
          {
            id: "all" as const,
            label: `Semua Evaluasi (${allEntries.filter((e) => e.isMistake).length})`,
          },
          {
            id: "bookmarked" as const,
            label: `Bookmark (${allEntries.filter((e) => e.isBookmarked).length})`,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={cn(
              "apple-segmented-btn",
              filter === tab.id && "apple-segmented-btn-active",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {visibleEntries.length === 0 ? (
        <div className="apple-card p-8 text-center">
          <p className="text-sm font-bold text-[var(--text-primary)]">
            Tidak ada butir evaluasi pada filter ini
          </p>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">
            Setiap jawaban salah atau terlewati saat simulasi otomatis masuk ke sini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
          {visibleEntries.map((entry) => (
            <article key={entry.id} className="c-pearl p-5 flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-white/75">
                  <span>{entry.question.type}</span>
                  <div className="flex items-center gap-2">
                    {entry.isBookmarked && <Bookmark className="w-3 h-3" />}
                    <span>Tahap SRS {entry.srsStage ?? 0}/3</span>
                  </div>
                </div>
                <p className="text-sm font-semibold text-white mt-2 line-clamp-3">
                  {entry.question.question}
                </p>

                {editingNoteId === entry.id ? (
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      placeholder="Tulis catatan kesalahan..."
                      className="flex-1 px-3 py-1.5 rounded-xl bg-black/35 border border-white/20 text-xs text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        updateQuestionNote(entry.id, noteDraft);
                        setEditingNoteId(null);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white text-black text-xs font-bold"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  entry.userNote && (
                    <div className="mt-2.5 px-3 py-2 rounded-xl bg-black/25 border border-white/10 text-[11px] text-white/85">
                      Catatan: {entry.userNote}
                    </div>
                  )
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/15">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingNoteId(entry.id);
                      setNoteDraft(entry.userNote || "");
                    }}
                    className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-[11px] font-semibold inline-flex items-center gap-1"
                  >
                    <StickyNote className="w-3 h-3" />
                    <span>Catatan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeMistake(entry.id)}
                    className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-[11px] font-semibold inline-flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Hapus</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => startDrill([entry])}
                  className="px-3 py-1.5 rounded-full bg-white text-black text-[11px] font-bold"
                >
                  Latih Ulang
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
