import React from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  Clock,
  Flame,
  Layers,
  Play,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useKarirfyData } from "../../contexts/KarirfyDataContext";
import { getLaunchOpenWeekStatus } from "../../lib/tierAccess";
import { formatRelativeTime, cn } from "../../lib/utils";
import type { NavTabId } from "../layout/Sidebar";

interface DashboardViewProps {
  onNavigateTab: (tab: NavTabId) => void;
  onLaunchExercise: (topicType: string) => void;
  onLaunchAssessment: (batteryType: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onLaunchExercise,
  onLaunchAssessment,
}) => {
  const { profile } = useAuth();
  const { isPrivacyMode } = useTheme();
  const {
    attempts,
    roadmap,
    missions,
    streak,
    weeklyBuckets,
    trajectory,
    trackReadiness,
    dueMistakeCount,
    examPlan,
    quotaStatus,
    toggleMissionDone,
  } = useKarirfyData();

  const avgScore = attempts.length
    ? Math.round(attempts.reduce((sum, a) => sum + (Number(a.score) || 0), 0) / attempts.length)
    : 0;

  const daysUntilExam = Math.max(
    0,
    Math.ceil(
      (new Date(`${examPlan.examDate}T00:00:00`).getTime() - Date.now()) / 86_400_000,
    ),
  );

  const highlightCardClass =
    profile.careerGoal === "CPNS" || profile.careerGoal === "Kedinasan" ? "c-red" : "c-navy";
  const launchPromo = getLaunchOpenWeekStatus();

  return (
    <div className="flex-1 min-h-0 flex flex-col xl:flex-row gap-3.5 overflow-hidden">
      {/* CENTER HERO SLAB (Accrual 2-slab Bento Architecture) */}
      <section className="floating-slab flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 min-h-0 slab-scroll scroll-gpu-layer p-5 lg:p-6 space-y-5">
        {launchPromo.active && (
          <div className="apple-card p-3.5 lg:px-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="apple-sub-box w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-[var(--text-primary)]" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-[var(--text-primary)]">
                    Pekan Peluncuran 7 Hari: Akses Pro Terbuka Penuh
                  </span>
                  <span className="apple-sub-box px-2 py-0.5 rounded-full text-[10px] font-bold text-[var(--text-secondary)]">
                    s/d 5 Des 2026
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5 truncate">
                  Seluruh CAT, Bank Evaluasi, CV Studio ATS, dan ekspor Pro aktif tanpa batas ({launchPromo.daysLeft} hari tersisa).
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab("assessment")}
              className="apple-sub-box px-3 py-1.5 rounded-full text-[11px] font-semibold text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)] transition-colors inline-flex items-center gap-1.5 shrink-0"
            >
              <span>Mulai Simulasi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {/* Top Hero & 3 Monochrome KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <div className="apple-card p-5">
            <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)]">
              <span>Rata-rata Skor</span>
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="text-3xl font-bold amount mt-2 text-[var(--text-primary)]">
              {isPrivacyMode ? "•••" : `${avgScore}%`}
            </div>
            <div className="text-[11px] text-[var(--text-tertiary)] mt-1">
              Target {profile.target_accuracy}% · {attempts.length} sesi tersimpan
            </div>
          </div>

          <div className="apple-card p-5">
            <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)]">
              <span>Konsistensi Belajar</span>
              <Flame className="w-4 h-4" />
            </div>
            <div className="text-3xl font-bold amount mt-2 text-[var(--text-primary)]">
              {streak.currentStreak} hari
            </div>
            <div className="text-[11px] text-[var(--text-tertiary)] mt-1">
              Total {streak.totalMinutes} mnt · {streak.totalQuestions} soal diselesaikan
            </div>
          </div>

          <div className="apple-card p-5">
            <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)]">
              <span>Bank Evaluasi SRS</span>
              <Target className="w-4 h-4" />
            </div>
            <div className="text-3xl font-bold amount mt-2 text-[var(--text-primary)]">
              {dueMistakeCount} soal
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-[var(--text-tertiary)]">
              <span>Siap diulang hari ini</span>
              <button
                type="button"
                onClick={() => onNavigateTab("mistakes")}
                className="font-semibold text-[var(--text-primary)] hover:underline"
              >
                Buka Drill →
              </button>
            </div>
          </div>
        </div>

        {/* Multi-Track Official Passing Grade Card (Karirfy Semantic Content Card) */}
        <div className={cn(highlightCardClass, "p-5 lg:p-6")}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 text-[10px] font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3" />
                <span>Kalibrasi Ambang Batas Resmi · {profile.careerGoal}</span>
              </div>
              <h2 className="text-lg font-bold mt-2">{trackReadiness.trackLabel}</h2>
              <p className="text-xs text-white/80 mt-0.5 max-w-2xl">{trackReadiness.note}</p>
            </div>

            <div className="text-right">
              <div className="text-[11px] text-white/75">Proyeksi Nilai</div>
              <div className="text-3xl font-bold amount">
                {isPrivacyMode
                  ? "•••"
                  : trackReadiness.projectedTotalScore !== null
                    ? `${trackReadiness.projectedTotalScore}`
                    : "-"}
                <span className="text-sm font-medium text-white/75">
                  {" "}
                  / {trackReadiness.scaleMax}
                </span>
              </div>
              <div className="text-[11px] text-white/80">
                Ambang acuan: {trackReadiness.targetPassingScore}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-4">
            {trackReadiness.subtests.map((sub) => (
              <div
                key={sub.label}
                className="rounded-2xl bg-black/25 border border-white/15 p-3 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold text-white/80 truncate">
                    {sub.label}
                  </div>
                  <div className="text-base font-bold amount text-white mt-0.5">
                    {sub.currentAccuracy !== null ? `${sub.currentAccuracy}%` : "Belum diuji"}
                  </div>
                  <div className="text-[10px] text-white/70">Target {sub.thresholdPct}%</div>
                </div>
                <button
                  type="button"
                  onClick={() => onLaunchExercise(sub.drillTopic)}
                  className="px-2.5 py-1.5 rounded-full bg-white text-black text-[11px] font-bold hover:opacity-90 shrink-0"
                >
                  Latih
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Monochrome Bento Charts Row (Accrual High-Contrast Monochrome Charts) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7 apple-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Lintasan Skor Terkini
                </h3>
                <p className="text-[11px] text-[var(--text-tertiary)]">
                  Perkembangan akurasi lintas simulasi dan latihan
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab("statistics")}
                className="inner-pseudo-glass px-3 py-1 rounded-full text-[11px] font-semibold text-[var(--text-secondary)]"
              >
                Detail →
              </button>
            </div>
            <div className="h-[190px] w-full">
              {trajectory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trajectory.slice(-12)}>
                    <defs>
                      <linearGradient id="karirfyAreaFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--chart-area-stroke)" stopOpacity={0.28} />
                        <stop offset="95%" stopColor="var(--chart-area-stroke)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 10, fill: "var(--text-tertiary)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 10, fill: "var(--text-tertiary)" }}
                      axisLine={false}
                      tickLine={false}
                      width={28}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--bg-elevated)",
                        border: "1px solid var(--glass-border)",
                        borderRadius: "14px",
                        fontSize: "12px",
                        color: "var(--text-primary)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="var(--chart-area-stroke)"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#karirfyAreaFill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center apple-sub-box p-4">
                  <p className="text-xs font-semibold text-[var(--text-secondary)]">
                    Belum ada riwayat sesi di akun ini
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigateTab("exercises")}
                    className="mt-2 px-3.5 py-1.5 rounded-full bg-[var(--accent)] text-[var(--accent-ink)] text-[11px] font-bold"
                  >
                    Mulai Latihan Pertama
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 apple-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Aktivitas 7 Hari
                </h3>
                <p className="text-[11px] text-[var(--text-tertiary)]">
                  Volume soal yang dikerjakan
                </p>
              </div>
              <span className="text-[11px] font-semibold text-[var(--text-tertiary)]">
                {quotaStatus.resetLabel}
              </span>
            </div>
            <div className="h-[190px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyBuckets}>
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: "var(--text-tertiary)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--bg-elevated)",
                      border: "1px solid var(--glass-border)",
                      borderRadius: "14px",
                      fontSize: "12px",
                      color: "var(--text-primary)",
                    }}
                  />
                  <Bar
                    dataKey="questions"
                    fill="var(--chart-bar-high)"
                    radius={[6, 6, 0, 0]}
                    barSize={18}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 4-Phase Curriculum Summary Strip */}
        <div className="apple-card p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Peta Kurikulum 4 Fase · {profile.careerGoal}
              </h3>
              <p className="text-[11px] text-[var(--text-tertiary)]">
                {roadmap.masteredModulesCount} dari {roadmap.totalModulesCount} modul dikuasai
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab("roadmap")}
              className="inner-pseudo-glass px-3 py-1.5 rounded-full text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1"
            >
              <span>Kelola Rencana</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {roadmap.phases.map((phase) => {
              const mastered = phase.modules.filter((m) => m.status === "mastered").length;
              const pct = phase.modules.length
                ? Math.round((mastered / phase.modules.length) * 100)
                : 0;
              return (
                <button
                  key={phase.phaseNumber}
                  type="button"
                  onClick={() => onNavigateTab("roadmap")}
                  className="apple-sub-box p-3.5 text-left hover:opacity-90 transition-opacity"
                >
                  <div className="flex items-center justify-between text-[10px] font-bold text-[var(--text-tertiary)]">
                    <span>FASE 0{phase.phaseNumber}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="text-xs font-bold text-[var(--text-primary)] mt-1 truncate">
                    {phase.title}
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 mt-2.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[var(--accent)]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        </div>
      </section>

      {/* RIGHT INSPECTOR SLAB (Accrual 370px Right Panel) */}
      <aside className="floating-slab w-full xl:w-[370px] 2xl:w-[385px] shrink-0 overflow-hidden flex flex-col">
        <div className="flex-1 min-h-0 slab-scroll scroll-gpu-layer p-5 space-y-4">
        {/* Countdown Card */}
        <div className="apple-card p-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold text-[var(--text-tertiary)] flex items-center gap-1.5">
              <CalendarClock className="w-3.5 h-3.5" />
              <span>Hitung Mundur Ujian</span>
            </div>
            <div className="text-2xl font-bold amount text-[var(--text-primary)] mt-1">
              {daysUntilExam} Hari Lagi
            </div>
            <div className="text-[11px] text-[var(--text-tertiary)]">
              Target {examPlan.examDate} · {examPlan.dailyMinutesGoal} mnt/hari
            </div>
          </div>
          {roadmap.nextModule && (
            <button
              type="button"
              onClick={() => {
                const mod = roadmap.nextModule;
                if (mod.kind === "artifact") onNavigateTab("artifacts");
                else if (mod.kind === "assessment")
                  onLaunchAssessment(mod.targetCategory);
                else onLaunchExercise(mod.targetCategory);
              }}
              className="px-3.5 py-2 rounded-full bg-[var(--accent)] text-[var(--accent-ink)] text-xs font-bold flex items-center gap-1.5 shrink-0 hover:opacity-90"
            >
              <Play className="w-3 h-3" />
              <span>Lanjut</span>
            </button>
          )}
        </div>

        {/* Daily Missions Checklist */}
        <div className="apple-card p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
              Misi Hari Ini
            </h3>
            <span className="text-[11px] font-semibold text-[var(--text-secondary)]">
              {missions.filter((m) => m.done).length}/{missions.length} Selesai
            </span>
          </div>
          <div className="space-y-2">
            {missions.map((m) => (
              <div
                key={m.id}
                className="apple-sub-box p-3 flex items-start justify-between gap-2.5"
              >
                <button
                  type="button"
                  onClick={() => toggleMissionDone(m.id)}
                  className="flex items-start gap-2.5 text-left min-w-0 flex-1"
                >
                  <CheckCircle2
                    className={cn(
                      "w-4 h-4 mt-0.5 shrink-0 transition-colors",
                      m.done ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)]",
                    )}
                  />
                  <div className="min-w-0">
                    <div
                      className={cn(
                        "text-xs font-semibold truncate",
                        m.done
                          ? "line-through text-[var(--text-tertiary)]"
                          : "text-[var(--text-primary)]",
                      )}
                    >
                      {m.label}
                    </div>
                    <div className="text-[10px] text-[var(--text-tertiary)] truncate">{m.meta}</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (m.kind === "artifact_read") onNavigateTab("artifacts");
                    else if (m.kind === "mistake_review") onNavigateTab("mistakes");
                    else if (m.roadmapModule?.kind === "assessment")
                      onLaunchAssessment(m.roadmapModule.targetCategory);
                    else if (m.roadmapModule?.targetCategory)
                      onLaunchExercise(m.roadmapModule.targetCategory);
                    else onNavigateTab("exercises");
                  }}
                  className="px-2 py-1 rounded-full inner-pseudo-glass text-[10px] font-semibold text-[var(--text-secondary)] shrink-0"
                >
                  Buka
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Attempts Feed */}
        <div className="apple-card p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
              Riwayat Aktivitas Terbaru
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab("statistics")}
              className="text-[11px] font-semibold text-[var(--text-secondary)] hover:underline"
            >
              Semua
            </button>
          </div>
          {attempts.length === 0 ? (
            <div className="apple-sub-box p-4 text-center text-xs text-[var(--text-tertiary)]">
              Belum ada riwayat simulasi atau latihan.
            </div>
          ) : (
            <div className="space-y-2">
              {attempts.slice(0, 6).map((att) => (
                <div
                  key={att.id}
                  className="cv-auto-feed apple-sub-box px-3 py-2.5 flex items-center justify-between gap-2.5"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full apple-card flex items-center justify-center shrink-0">
                      {att.attempt_type === "assessment" ? (
                        <Clock className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                      ) : (
                        <BookOpen className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[var(--text-primary)] truncate">
                        {att.subject_category}
                      </div>
                      <div className="text-[10px] text-[var(--text-tertiary)]">
                        {formatRelativeTime(att.created_at)} · {att.correct_answers_count}/
                        {att.total_questions} benar
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-bold amount text-[var(--text-primary)] shrink-0">
                    {isPrivacyMode ? "••" : `${att.score}%`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Shortcut Modules Pill Row */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onNavigateTab("cv-studio")}
            className="inner-pseudo-glass p-3 rounded-2xl text-left"
          >
            <Layers className="w-4 h-4 text-[var(--text-secondary)] mb-1" />
            <div className="text-xs font-bold text-[var(--text-primary)]">Studio CV ATS</div>
            <div className="text-[10px] text-[var(--text-tertiary)]">16 Template Gratis</div>
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab("kraepelin")}
            className="inner-pseudo-glass p-3 rounded-2xl text-left"
          >
            <Target className="w-4 h-4 text-[var(--text-secondary)] mb-1" />
            <div className="text-xs font-bold text-[var(--text-primary)]">Lab Kraepelin</div>
            <div className="text-[10px] text-[var(--text-tertiary)]">Keyboard Numpad</div>
          </button>
        </div>
        </div>
      </aside>
    </div>
  );
};
