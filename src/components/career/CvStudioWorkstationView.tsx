import React, { useMemo, useState } from "react";
import { Download, FilePlus2, FileText, Plus, Trash2 } from "lucide-react";
import {
  CV_TEMPLATES,
  createCvVersion,
  deleteCvVersion,
  EMPTY_CV,
  EMPTY_CV_ENTRY,
  getActiveCvVersion,
  getCvColumns,
  getCvDocument,
  getCvFilename,
  loadCvCollection,
  saveCvCollection,
  selectActiveCvVersion,
  updateActiveCvDraft,
  type CvCollectionState,
  type CvDraft,
  type CvTemplate,
} from "../../lib/cv";
import { cvSamples } from "../../data/cvSamples";
import { exportCv } from "../../lib/cvExport";
import { deliverCvFile } from "../../lib/cvFiles";
import { cn } from "../../lib/utils";
import { useAuth } from "../../contexts/AuthContext";
import { scheduleStudyVaultPush } from "../../lib/studyVaultSyncService";

export const CvStudioWorkstationView: React.FC = () => {
  const { userId } = useAuth();
  const [collection, setCollection] = useState<CvCollectionState>(() => loadCvCollection());
  const [exporting, setExporting] = useState<"pdf" | "docx" | null>(null);

  const activeVersion = getActiveCvVersion(collection);
  const draft: CvDraft = activeVersion?.draft ?? EMPTY_CV;

  const commitCollection = (next: CvCollectionState) => {
    setCollection(next);
    saveCvCollection(next);
    if (userId) scheduleStudyVaultPush(userId, 900);
  };

  const patchDraft = (patch: Partial<CvDraft>) => {
    const nextDraft = { ...draft, ...patch };
    commitCollection(updateActiveCvDraft(collection, nextDraft));
  };

  const cvDoc = useMemo(() => getCvDocument(draft), [draft]);
  const cvCols = useMemo(() => getCvColumns(cvDoc), [cvDoc]);

  const handleExport = async (format: "pdf" | "docx") => {
    setExporting(format);
    try {
      const blob = await exportCv(cvDoc, format);
      await deliverCvFile(blob, getCvFilename(cvDoc.name || "Kandidat", format), () => true);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            Studio CV ATS Gratis · 16 Template Resmi
          </h1>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">
            Edit CV bersebelahan dengan pratinjau kertas A4 dan unduh file PDF / DOCX bersih.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              commitCollection(
                createCvVersion(collection, {
                  title: `Versi ${(collection.items.length || 0) + 1}`,
                  draft,
                }),
              )
            }
            className="inner-pseudo-glass px-3.5 py-2 rounded-full text-xs font-semibold text-[var(--text-primary)] inline-flex items-center gap-1.5"
          >
            <FilePlus2 className="w-3.5 h-3.5" />
            <span>Simpan Versi Baru</span>
          </button>

          <button
            type="button"
            disabled={exporting !== null}
            onClick={() => void handleExport("docx")}
            className="inner-pseudo-glass px-4 py-2 rounded-full text-xs font-semibold text-[var(--text-primary)] inline-flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{exporting === "docx" ? "Memproses..." : "Unduh DOCX"}</span>
          </button>

          <button
            type="button"
            disabled={exporting !== null}
            onClick={() => void handleExport("pdf")}
            className="px-4 py-2 rounded-full bg-[var(--accent)] text-[var(--accent-ink)] text-xs font-bold inline-flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{exporting === "pdf" ? "Memproses..." : "Unduh PDF"}</span>
          </button>
        </div>
      </div>

      {/* Saved Versions + Sample Loader Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 apple-sub-box p-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {collection.items.map((ver) => (
            <div key={ver.id} className="inline-flex items-center gap-1">
              <button
                type="button"
                onClick={() => commitCollection(selectActiveCvVersion(collection, ver.id))}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-semibold",
                  ver.id === activeVersion?.id
                    ? "bg-[var(--accent)] text-[var(--accent-ink)]"
                    : "inner-pseudo-glass text-[var(--text-secondary)]",
                )}
              >
                {ver.title}
              </button>
              {collection.items.length > 1 && (
                <button
                  type="button"
                  onClick={() => commitCollection(deleteCvVersion(collection, ver.id))}
                  className="text-[var(--text-tertiary)] hover:text-red-400 p-1"
                  aria-label="Hapus Versi"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-[var(--text-tertiary)] mr-1">Muat Contoh:</span>
          {Object.entries(cvSamples)
            .slice(0, 3)
            .map(([key, sampleDraft]) => (
              <button
                key={key}
                type="button"
                onClick={() => patchDraft({ ...sampleDraft, photo: draft.photo })}
                className="inner-pseudo-glass px-2.5 py-1 rounded-full text-[11px] font-semibold text-[var(--text-secondary)]"
              >
                {CV_TEMPLATES[sampleDraft.template]?.label || key}
              </button>
            ))}
        </div>
      </div>

      {/* Desktop Split-View Editor + Live Paper Preview */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left Form Editor */}
        <div className="xl:col-span-6 space-y-4">
          <div className="apple-card p-5 space-y-3">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
              Template ATS ({Object.keys(CV_TEMPLATES).length} Pilihan)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1">
              {(Object.keys(CV_TEMPLATES) as CvTemplate[]).map((tplKey) => {
                const tpl = CV_TEMPLATES[tplKey];
                const selected = draft.template === tplKey;
                return (
                  <button
                    key={tplKey}
                    type="button"
                    onClick={() => patchDraft({ template: tplKey })}
                    className={cn(
                      "p-2.5 rounded-xl text-left text-xs border transition-all",
                      selected
                        ? "bg-[var(--accent)] text-[var(--accent-ink)] font-bold border-transparent"
                        : "apple-sub-box text-[var(--text-secondary)]",
                    )}
                  >
                    <div className="truncate">{tpl.label}</div>
                    <div className="text-[10px] opacity-70">{tpl.category}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="apple-card p-5 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
              Informasi Pribadi &amp; Ringkasan
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={draft.name}
                onChange={(e) => patchDraft({ name: e.target.value })}
                placeholder="Nama Lengkap"
                className="px-3.5 py-2 rounded-xl apple-sub-box text-xs text-[var(--text-primary)]"
              />
              <input
                type="text"
                value={draft.headline}
                onChange={(e) => patchDraft({ headline: e.target.value })}
                placeholder="Headline / Jabatan Sasaran"
                className="px-3.5 py-2 rounded-xl apple-sub-box text-xs text-[var(--text-primary)]"
              />
              <input
                type="email"
                value={draft.email}
                onChange={(e) => patchDraft({ email: e.target.value })}
                placeholder="Email Profesional"
                className="px-3.5 py-2 rounded-xl apple-sub-box text-xs text-[var(--text-primary)]"
              />
              <input
                type="text"
                value={draft.phone}
                onChange={(e) => patchDraft({ phone: e.target.value })}
                placeholder="Nomor Telepon"
                className="px-3.5 py-2 rounded-xl apple-sub-box text-xs text-[var(--text-primary)]"
              />
              <input
                type="text"
                value={draft.city}
                onChange={(e) => patchDraft({ city: e.target.value })}
                placeholder="Kota / Domisili"
                className="px-3.5 py-2 rounded-xl apple-sub-box text-xs text-[var(--text-primary)]"
              />
              <input
                type="text"
                value={draft.link}
                onChange={(e) => patchDraft({ link: e.target.value })}
                placeholder="LinkedIn / Portofolio"
                className="px-3.5 py-2 rounded-xl apple-sub-box text-xs text-[var(--text-primary)]"
              />
            </div>
            <textarea
              rows={3}
              value={draft.profile}
              onChange={(e) => patchDraft({ profile: e.target.value })}
              placeholder="Ringkasan eksekutif 2-3 kalimat..."
              className="w-full p-3 rounded-xl apple-sub-box text-xs text-[var(--text-primary)]"
            />
          </div>

          <div className="apple-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                Pengalaman ({draft.experience.length})
              </h2>
              <button
                type="button"
                onClick={() =>
                  patchDraft({
                    experience: [...draft.experience, { ...EMPTY_CV_ENTRY }],
                  })
                }
                className="inner-pseudo-glass px-3 py-1 rounded-full text-[11px] font-semibold inline-flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Tambah
              </button>
            </div>
            {draft.experience.map((exp, idx) => (
              <div key={idx} className="apple-sub-box p-3 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={exp.title}
                    onChange={(e) => {
                      const next = [...draft.experience];
                      next[idx] = { ...exp, title: e.target.value };
                      patchDraft({ experience: next });
                    }}
                    placeholder="Jabatan"
                    className="px-2.5 py-1.5 rounded-lg bg-transparent border border-[var(--glass-border)] text-xs"
                  />
                  <input
                    type="text"
                    value={exp.organization}
                    onChange={(e) => {
                      const next = [...draft.experience];
                      next[idx] = { ...exp, organization: e.target.value };
                      patchDraft({ experience: next });
                    }}
                    placeholder="Instansi / Perusahaan"
                    className="px-2.5 py-1.5 rounded-lg bg-transparent border border-[var(--glass-border)] text-xs"
                  />
                  <input
                    type="text"
                    value={exp.period}
                    onChange={(e) => {
                      const next = [...draft.experience];
                      next[idx] = { ...exp, period: e.target.value };
                      patchDraft({ experience: next });
                    }}
                    placeholder="Periode"
                    className="px-2.5 py-1.5 rounded-lg bg-transparent border border-[var(--glass-border)] text-xs"
                  />
                </div>
                <textarea
                  rows={2}
                  value={exp.details}
                  onChange={(e) => {
                    const next = [...draft.experience];
                    next[idx] = { ...exp, details: e.target.value };
                    patchDraft({ experience: next });
                  }}
                  placeholder="Pencapaian terukur (satu poin per baris)"
                  className="w-full p-2 rounded-lg bg-transparent border border-[var(--glass-border)] text-xs"
                />
              </div>
            ))}
          </div>

          <div className="apple-card p-5 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
              Keahlian &amp; Bahasa
            </h2>
            <textarea
              rows={2}
              value={draft.skills}
              onChange={(e) => patchDraft({ skills: e.target.value })}
              placeholder="Contoh: Analisis Kebijakan, SQL, Python, Audit Keuangan"
              className="w-full p-3 rounded-xl apple-sub-box text-xs"
            />
            <input
              type="text"
              value={draft.languages}
              onChange={(e) => patchDraft({ languages: e.target.value })}
              placeholder="Bahasa (mis. Bahasa Indonesia, English IELTS 7.5)"
              className="w-full px-3.5 py-2 rounded-xl apple-sub-box text-xs"
            />
          </div>
        </div>

        {/* Right Live Paper Preview */}
        <div className="xl:col-span-6 sticky top-0">
          <div className="rounded-3xl bg-white text-zinc-900 p-8 shadow-2xl border border-black/10 min-h-[680px] space-y-5">
            <header className="border-b pb-4" style={{ borderColor: cvDoc.color }}>
              <h2 className="text-2xl font-bold tracking-tight" style={{ color: cvDoc.color }}>
                {cvDoc.name || "Nama Kandidat"}
              </h2>
              {cvDoc.headline && (
                <p className="text-sm font-medium text-zinc-700 mt-0.5">{cvDoc.headline}</p>
              )}
              {cvDoc.contact.length > 0 && (
                <p className="text-xs text-zinc-500 mt-1.5">{cvDoc.contact.join(" · ")}</p>
              )}
            </header>

            <div className="space-y-4">
              {[...cvCols.body, ...cvCols.sidebar].map((section) => (
                <section key={section.label} className="space-y-2">
                  <h3
                    className="text-xs font-bold uppercase tracking-wider border-b border-zinc-200 pb-1"
                    style={{ color: cvDoc.color }}
                  >
                    {section.label}
                  </h3>
                  {section.blocks.map((blk, i) => (
                    <div key={i} className="space-y-0.5 text-xs">
                      {(blk.title || blk.organization || blk.period) && (
                        <div className="flex justify-between font-bold text-zinc-900">
                          <span>
                            {blk.title}
                            {blk.organization ? ` · ${blk.organization}` : ""}
                          </span>
                          <span className="text-zinc-500 font-normal">{blk.period}</span>
                        </div>
                      )}
                      {blk.lines.map((line, li) => (
                        <p key={li} className="text-zinc-700 leading-relaxed">
                          {section.bullets ? `• ${line}` : line}
                        </p>
                      ))}
                    </div>
                  ))}
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
