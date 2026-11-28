import React, { useState } from "react";
import { Check, Compass, X } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useKarirfyData } from "../../contexts/KarirfyDataContext";
import type { CareerGoal, CpnsQuotaTrack } from "../../types";
import { cn } from "../../lib/utils";

const TRACK_OPTIONS: { id: CareerGoal; desc: string }[] = [
  { id: "CPNS", desc: "SKD 110 Soal (TWK, TIU, TKP) & Integrasi SKB 40/60" },
  { id: "BUMN", desc: "TKD Kognitif, AKHLAK Core Values & English RBB" },
  { id: "Bank Indonesia", desc: "PCPM BI, Ekonomi Moneter & Tes Logika Ketat" },
  { id: "PPPK", desc: "Manajerial, Sosial Kultural & Teknis Kompetensi" },
  { id: "Kedinasan", desc: "Sekolah Kedinasan SKD BKN + Ketahanan Psikotes" },
  { id: "Beasiswa LPDP", desc: "TBS Verbal, Kuantitatif, Pemecahan Masalah & Esai" },
];

const CPNS_QUOTA_OPTIONS: { id: CpnsQuotaTrack; label: string }[] = [
  { id: "umum", label: "Formasi Umum (TWK 65 / TIU 80 / TKP 166)" },
  { id: "cumlaude_diaspora", label: "Cumlaude / Diaspora (TIU 85 / Total 311)" },
  { id: "disabilitas_papua", label: "Disabilitas / Putra-Putri Papua (TIU 60 / Total 286)" },
];

interface TrackSwitcherModalProps {
  open: boolean;
  onClose: () => void;
}

export const TrackSwitcherModal: React.FC<TrackSwitcherModalProps> = ({ open, onClose }) => {
  const { profile, updateProfilePatch } = useAuth();
  const { cpnsQuotaTrack, setCpnsQuotaTrack, examPlan, updateExamPlan } = useKarirfyData();

  const [selectedGoal, setSelectedGoal] = useState<CareerGoal>(profile.careerGoal);
  const [targetAcc, setTargetAcc] = useState<number>(profile.target_accuracy || 80);
  const [examDate, setExamDate] = useState<string>(examPlan.examDate);

  if (!open) return null;

  const handleSave = async () => {
    await updateProfilePatch({
      careerGoal: selectedGoal,
      target_accuracy: Math.min(95, Math.max(60, Number(targetAcc) || 80)),
    });
    if (examDate) {
      updateExamPlan({ examDate });
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Pengaturan Jalur Seleksi"
    >
      <div
        className="dynamic-island-shell relative w-full max-w-lg p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dynamic-island-specular-rim" />
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full apple-sub-box flex items-center justify-center">
              <Compass className="w-4 h-4 text-[var(--text-primary)]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Jalur Seleksi &amp; Target Kesiapan
              </h3>
              <p className="text-[11px] text-[var(--text-tertiary)]">
                Menyesuaikan peta kurikulum 4 fase dan kalkulator ambang batas
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inner-pseudo-glass w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-tertiary)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 max-h-[42vh] overflow-y-auto pr-1">
          {TRACK_OPTIONS.map((t) => {
            const active = selectedGoal === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedGoal(t.id)}
                className={cn(
                  "w-full p-3 rounded-2xl text-left flex items-center justify-between border transition-all",
                  active
                    ? "nav-active-item border-[var(--glass-border)]"
                    : "apple-sub-box hover:opacity-90",
                )}
              >
                <div>
                  <div className="text-xs font-bold">{t.id}</div>
                  <div className="text-[11px] opacity-75 mt-0.5">{t.desc}</div>
                </div>
                {active && <Check className="w-4 h-4 shrink-0" />}
              </button>
            );
          })}
        </div>

        {selectedGoal === "CPNS" && (
          <div className="mt-4">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">
              Jalur Formasi CPNS 2026
            </label>
            <div className="space-y-1.5">
              {CPNS_QUOTA_OPTIONS.map((q) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCpnsQuotaTrack(q.id)}
                  className={cn(
                    "w-full px-3 py-2 rounded-xl text-left text-xs border transition-all flex items-center justify-between",
                    cpnsQuotaTrack === q.id
                      ? "bg-[var(--accent)] text-[var(--accent-ink)] font-semibold border-transparent"
                      : "apple-sub-box text-[var(--text-secondary)]",
                  )}
                >
                  <span>{q.label}</span>
                  {cpnsQuotaTrack === q.id && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div>
            <label className="block text-[11px] font-semibold text-[var(--text-tertiary)] mb-1">
              Target Akurasi ({targetAcc}%)
            </label>
            <input
              type="range"
              min={60}
              max={95}
              value={targetAcc}
              onChange={(e) => setTargetAcc(Number(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[var(--text-tertiary)] mb-1">
              Tanggal Target Ujian
            </label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl apple-sub-box text-xs text-[var(--text-primary)]"
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="inner-pseudo-glass px-4 py-2 rounded-full text-xs font-semibold text-[var(--text-secondary)]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            className="px-5 py-2 rounded-full bg-[var(--accent)] text-[var(--accent-ink)] text-xs font-bold hover:opacity-90"
          >
            Simpan Pengaturan
          </button>
        </div>
      </div>
    </div>
  );
};
