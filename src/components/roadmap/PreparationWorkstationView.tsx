import React, { useMemo, useState } from "react";
import {
  Briefcase,
  Calculator,
  CalendarClock,
  CheckCircle2,
  Play,
  Plus,
  Trash2,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useKarirfyData } from "../../contexts/KarirfyDataContext";
import {
  calculateCpns2026FinalScore,
  CPNS_2026_TIE_BREAKER_ORDER,
  type CpnsAgencyType,
  type SkbCatQuestionCount,
} from "../../lib/cpns2026ScoreEstimator";
import {
  APPLICATION_STAGES,
  createApplicationId,
  getStudyTrack,
  removeJobApplication,
  upsertJobApplication,
  type ApplicationStage,
} from "../../lib/studyPreparation";
import { cn } from "../../lib/utils";
import type { CpnsQuotaTrack } from "../../types";

interface PreparationWorkstationViewProps {
  onLaunchExercise: (topicType: string) => void;
  onLaunchAssessment: (batteryType: string) => void;
}

type PrepTab = "roadmap" | "cpns2026" | "tracker";

export const PreparationWorkstationView: React.FC<PreparationWorkstationViewProps> = ({
  onLaunchExercise,
  onLaunchAssessment,
}) => {
  const { profile } = useAuth();
  const { roadmap, preparation, updatePreparation, cpnsQuotaTrack, setCpnsQuotaTrack } =
    useKarirfyData();

  const [tab, setTab] = useState<PrepTab>("roadmap");

  // CPNS 2026 40/60 Simulator State
  const [twk, setTwk] = useState(95);
  const [tiu, setTiu] = useState(115);
  const [tkp, setTkp] = useState(190);
  const [agencyType, setAgencyType] = useState<CpnsAgencyType>("pusat");
  const [skbCount, setSkbCount] = useState<SkbCatQuestionCount>(100);
  const [skbCorrect, setSkbCorrect] = useState(76);
  const [addWeight, setAddWeight] = useState(20);
  const [addScore, setAddScore] = useState(80);
  const [interviewWeight, setInterviewWeight] = useState(10);

  const cpnsResult = useMemo(
    () =>
      calculateCpns2026FinalScore({
        twk,
        tiu,
        tkp,
        quotaTrack: cpnsQuotaTrack,
        agencyType,
        skbCatQuestionCount: skbCount,
        skbCatCorrect: skbCorrect,
        additionalSkbWeightPct: addWeight,
        additionalSkbScore100: addScore,
        interviewWeightPct: interviewWeight,
      }),
    [twk, tiu, tkp, cpnsQuotaTrack, agencyType, skbCount, skbCorrect, addWeight, addScore, interviewWeight],
  );

  // Job Application Tracker Form State
  const [inst, setInst] = useState("");
  const [role, setRole] = useState("");
  const [stage, setStage] = useState<ApplicationStage>("Persiapan");
  const [nextDate, setNextDate] = useState("");

  const applications = preparation.applications ?? [];

  const handleAddApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inst.trim() || !role.trim()) return;
    const entry = {
      id: createApplicationId(applications),
      institution: inst.trim(),
      roleTitle: role.trim(),
      track: getStudyTrack(profile.careerGoal),
      stage,
      nextDate: nextDate || new Date().toISOString().slice(0, 10),
      notes: "",
      updatedAt: new Date().toISOString(),
    };
    updatePreparation({
      ...preparation,
      applications: upsertJobApplication(applications, entry),
    });
    setInst("");
    setRole("");
    setNextDate("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            Rencana Belajar, Kalkulator CPNS 2026 &amp; Tracker Lamaran
          </h1>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">
            {roadmap.trackTitle} · {roadmap.overallProgressPct}% penguasaan kurikulum
          </p>
        </div>

        {/* Strictly Monochrome Segmented Switcher */}
        <div className="apple-segmented-track">
          {[
            { id: "roadmap" as const, label: "Kurikulum 4 Fase", icon: CalendarClock },
            { id: "cpns2026" as const, label: "Kalkulator CPNS 2026", icon: Calculator },
            { id: "tracker" as const, label: "Tracker Lamaran", icon: Briefcase },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  "apple-segmented-btn flex items-center gap-1.5",
                  tab === item.id && "apple-segmented-btn-active",
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {tab === "roadmap" && (
        <div className="space-y-4">
          {roadmap.phases.map((phase) => (
            <section key={phase.phaseNumber} className="apple-card p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                    Fase 0{phase.phaseNumber}
                  </div>
                  <h2 className="text-base font-bold text-[var(--text-primary)]">{phase.title}</h2>
                  <p className="text-xs text-[var(--text-tertiary)]">{phase.subtitle}</p>
                </div>
                <span className="px-3 py-1 rounded-full apple-sub-box text-xs font-bold text-[var(--text-primary)]">
                  {phase.progressPct}%
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {phase.modules.map((mod) => (
                  <div
                    key={mod.id}
                    className="apple-sub-box p-4 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                        <span>{mod.kind}</span>
                        <span className="inline-flex items-center gap-1">
                          {mod.status === "mastered" && <CheckCircle2 className="w-3 h-3" />}
                          {mod.status === "mastered"
                            ? "Tuntas"
                            : mod.status === "reinforce"
                              ? "Perkuat"
                              : "Terjadwal"}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-[var(--text-primary)] mt-1">
                        {mod.title}
                      </h3>
                      <p className="text-[11px] text-[var(--text-tertiary)] mt-1 line-clamp-2">
                        {mod.subtitle}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[var(--glass-border)]">
                      <span className="text-[11px] text-[var(--text-tertiary)]">
                        {mod.bestScore !== null ? `Terbaik ${mod.bestScore}%` : "Belum dikerjakan"}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (mod.kind === "assessment") onLaunchAssessment(mod.targetCategory);
                          else if (mod.kind === "exercise") onLaunchExercise(mod.targetCategory);
                        }}
                        className="px-3 py-1 rounded-full bg-[var(--accent)] text-[var(--accent-ink)] text-[11px] font-bold inline-flex items-center gap-1"
                      >
                        <Play className="w-3 h-3" />
                        <span>Mulai</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {tab === "cpns2026" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7 apple-card p-5 space-y-4">
            <h2 className="text-sm font-bold text-[var(--text-primary)]">
              Parameter Nilai SKD 40% &amp; SKB 60% (KepmenPANRB 674 &amp; PermenPANRB 18/2026)
            </h2>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-tertiary)] mb-1">
                  TWK (0-150)
                </label>
                <input
                  type="number"
                  min={0}
                  max={150}
                  value={twk}
                  onChange={(e) => setTwk(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl apple-sub-box text-sm font-bold amount text-[var(--text-primary)]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-tertiary)] mb-1">
                  TIU (0-175)
                </label>
                <input
                  type="number"
                  min={0}
                  max={175}
                  value={tiu}
                  onChange={(e) => setTiu(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl apple-sub-box text-sm font-bold amount text-[var(--text-primary)]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-tertiary)] mb-1">
                  TKP (0-225)
                </label>
                <input
                  type="number"
                  min={0}
                  max={225}
                  value={tkp}
                  onChange={(e) => setTkp(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl apple-sub-box text-sm font-bold amount text-[var(--text-primary)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-tertiary)] mb-1">
                  Jalur Formasi
                </label>
                <select
                  value={cpnsQuotaTrack}
                  onChange={(e) => setCpnsQuotaTrack(e.target.value as CpnsQuotaTrack)}
                  className="w-full px-3 py-2 rounded-xl apple-sub-box text-xs text-[var(--text-primary)]"
                >
                  <option value="umum">Umum</option>
                  <option value="cumlaude_diaspora">Cumlaude / Diaspora</option>
                  <option value="disabilitas_papua">Disabilitas / Papua</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-tertiary)] mb-1">
                  Jenis Instansi
                </label>
                <select
                  value={agencyType}
                  onChange={(e) => setAgencyType(e.target.value as CpnsAgencyType)}
                  className="w-full px-3 py-2 rounded-xl apple-sub-box text-xs text-[var(--text-primary)]"
                >
                  <option value="pusat">Instansi Pusat</option>
                  <option value="daerah">Instansi Daerah</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-tertiary)] mb-1">
                  Soal SKB CAT
                </label>
                <select
                  value={skbCount}
                  onChange={(e) => setSkbCount(Number(e.target.value) as SkbCatQuestionCount)}
                  className="w-full px-3 py-2 rounded-xl apple-sub-box text-xs text-[var(--text-primary)]"
                >
                  <option value={100}>100 Soal (90m)</option>
                  <option value={80}>80 Soal (60m)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-tertiary)] mb-1">
                  Benar SKB CAT
                </label>
                <input
                  type="number"
                  min={0}
                  max={skbCount}
                  value={skbCorrect}
                  onChange={(e) => setSkbCorrect(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl apple-sub-box text-xs font-bold amount"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-tertiary)] mb-1">
                  Bobot Tambahan (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={addWeight}
                  onChange={(e) => setAddWeight(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl apple-sub-box text-xs font-bold amount"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-tertiary)] mb-1">
                  Skor Tambahan (0-100)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={addScore}
                  onChange={(e) => setAddScore(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl apple-sub-box text-xs font-bold amount"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-tertiary)] mb-1">
                  Wawancara (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={interviewWeight}
                  onChange={(e) => setInterviewWeight(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl apple-sub-box text-xs font-bold amount"
                />
              </div>
            </div>

            {cpnsResult.warnings.length > 0 && (
              <div className="apple-sub-box p-3 text-xs text-amber-400 space-y-1">
                {cpnsResult.warnings.map((w) => (
                  <div key={w}>• {w}</div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className={cn(cpnsResult.skd.passedPg ? "c-navy" : "c-red", "p-6 space-y-3")}>
              <div className="text-[11px] font-bold uppercase tracking-wider opacity-80">
                Estimasi Skor Akhir Integrasi CPNS
              </div>
              <div className="text-4xl font-bold amount">{cpnsResult.finalScore100.toFixed(3)}</div>
              <p className="text-xs text-white/85">{cpnsResult.skd.reason}</p>
              <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                <div className="rounded-xl bg-black/25 p-2.5">
                  <div className="text-white/70">SKD (40%)</div>
                  <div className="font-bold amount">{cpnsResult.skd.weightedSkd40.toFixed(2)}</div>
                </div>
                <div className="rounded-xl bg-black/25 p-2.5">
                  <div className="text-white/70">SKB (60%)</div>
                  <div className="font-bold amount">{cpnsResult.weightedSkb60.toFixed(2)}</div>
                </div>
              </div>
            </div>

            <div className="apple-card p-5 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                Urutan Tie-Breaker Seri Nilai
              </h3>
              <ol className="text-xs text-[var(--text-secondary)] space-y-1 list-decimal pl-4">
                {CPNS_2026_TIE_BREAKER_ORDER.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}

      {tab === "tracker" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <form onSubmit={handleAddApplication} className="lg:col-span-4 apple-card p-5 space-y-3 h-fit">
            <h2 className="text-sm font-bold text-[var(--text-primary)]">
              Tambah Lamaran / Instansi
            </h2>
            <input
              type="text"
              required
              value={inst}
              onChange={(e) => setInst(e.target.value)}
              placeholder="Instansi / Perusahaan (mis. Kemenkeu)"
              className="w-full px-3.5 py-2 rounded-xl apple-sub-box text-xs"
            />
            <input
              type="text"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Jabatan / Formasi"
              className="w-full px-3.5 py-2 rounded-xl apple-sub-box text-xs"
            />
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value as ApplicationStage)}
              className="w-full px-3.5 py-2 rounded-xl apple-sub-box text-xs"
            >
              {APPLICATION_STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={nextDate}
              onChange={(e) => setNextDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl apple-sub-box text-xs"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-full bg-[var(--accent)] text-[var(--accent-ink)] text-xs font-bold inline-flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Simpan ke Tracker</span>
            </button>
          </form>

          <div className="lg:col-span-8 apple-card p-5 space-y-3">
            <h2 className="text-sm font-bold text-[var(--text-primary)]">
              Daftar Lamaran Aktif ({applications.length})
            </h2>
            {applications.length === 0 ? (
              <div className="apple-sub-box p-6 text-center text-xs text-[var(--text-tertiary)]">
                Belum ada instansi dicatat. Tambahkan formasi atau program beasiswa sasaran Anda.
              </div>
            ) : (
              <div className="space-y-2">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="apple-sub-box p-3.5 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-xs font-bold text-[var(--text-primary)]">
                        {app.institution} · {app.roleTitle}
                      </div>
                      <div className="text-[11px] text-[var(--text-tertiary)]">
                        Tahap: {app.stage} · Jadwal berikutnya: {app.nextDate}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        updatePreparation({
                          ...preparation,
                          applications: removeJobApplication(applications, app.id),
                        })
                      }
                      className="inner-pseudo-glass w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-tertiary)]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
