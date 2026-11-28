import React, { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "../../contexts/AuthContext";
import { useKarirfyData } from "../../contexts/KarirfyDataContext";
import { useTheme } from "../../contexts/ThemeContext";
import { toLocalISO } from "../../lib/curriculumRoadmap";
import { buildActivityBuckets, buildPacingQuadrants } from "../../lib/statsAnalytics";
import { cn } from "../../lib/utils";

export const StatisticsWorkstationView: React.FC = () => {
  const { profile } = useAuth();
  const { isPrivacyMode } = useTheme();
  const { attempts, trends, radar, trajectory } = useKarirfyData();
  const [windowRange, setWindowRange] = useState<"7D" | "30D">("7D");

  const todayISO = toLocalISO(new Date());
  const buckets = useMemo(
    () =>
      buildActivityBuckets(
        attempts,
        windowRange === "7D" ? "daily" : "monthly",
        todayISO,
      ),
    [attempts, windowRange, todayISO],
  );
  const pacing = useMemo(
    () => buildPacingQuadrants(trends, profile.target_accuracy || 80),
    [trends, profile.target_accuracy],
  );

  const radarData = radar.axes.map((ax) => ({
    subject: ax.label,
    score: ax.accuracy ?? 0,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            Analitik Kesiapan, Pacing &amp; Radar Kompetensi
          </h1>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">
            Grafik monokrom presisi untuk memantau tren skor dan kecepatan menjawab per topik
          </p>
        </div>

        <div className="apple-segmented-track">
          {(["7D", "30D"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setWindowRange(r)}
              className={cn(
                "apple-segmented-btn",
                windowRange === r && "apple-segmented-btn-active",
              )}
            >
              {r === "7D" ? "7 Hari" : "30 Hari"}
            </button>
          ))}
        </div>
      </div>

      {/* Top Charts Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 apple-card p-5">
          <h2 className="text-sm font-bold text-[var(--text-primary)] mb-3">
            Lintasan Skor Sesi ({trajectory.length} Sesi)
          </h2>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trajectory.slice(-20)}>
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
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="var(--chart-line)"
                  strokeWidth={2.2}
                  dot={{ r: 3, fill: "var(--chart-line)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 apple-card p-5">
          <h2 className="text-sm font-bold text-[var(--text-primary)] mb-3">
            Radar 5 Pilar Kompetensi
          </h2>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--glass-border)" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fontSize: 10, fill: "var(--text-secondary)" }}
                />
                <Radar
                  dataKey="score"
                  stroke="var(--chart-line)"
                  fill="var(--chart-line)"
                  fillOpacity={0.22}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Activity Volume Chart */}
      <div className="apple-card p-5">
        <h2 className="text-sm font-bold text-[var(--text-primary)] mb-3">
          Volume Soal Dikerjakan ({windowRange})
        </h2>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={buckets}>
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
                }}
              />
              <Bar dataKey="questions" fill="var(--chart-bar-high)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pacing Quadrants & Topic Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="apple-card p-5 space-y-3">
          <h2 className="text-sm font-bold text-[var(--text-primary)]">
            Kuadran Kecepatan &amp; Akurasi
          </h2>
          {pacing.length === 0 ? (
            <p className="text-xs text-[var(--text-tertiary)]">
              Kerjakan minimal satu latihan untuk memetakan pacing per topik.
            </p>
          ) : (
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {pacing.map((pt) => (
                <div
                  key={pt.key}
                  className="apple-sub-box p-3 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-[var(--text-primary)]">{pt.type}</div>
                    <div className="text-[11px] text-[var(--text-tertiary)]">
                      {pt.seconds} dtk/soal · {pt.quadrant}
                    </div>
                  </div>
                  <div className="font-bold amount text-[var(--text-primary)]">
                    {isPrivacyMode ? "••" : `${pt.accuracy}%`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="apple-card p-5 space-y-3">
          <h2 className="text-sm font-bold text-[var(--text-primary)]">
            Rekapitulasi Per Topik ({trends.length})
          </h2>
          <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
            {trends.map((t) => {
              const delta = Math.round(t.recent.accuracy - t.previous.accuracy);
              return (
                <div
                  key={t.key}
                  className="apple-sub-box p-3 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-[var(--text-primary)]">{t.type}</div>
                    <div className="text-[11px] text-[var(--text-tertiary)]">
                      {t.sessions} sesi · sebelumnya {Math.round(t.previous.accuracy)}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold amount text-[var(--text-primary)]">
                      {isPrivacyMode ? "••" : `${Math.round(t.recent.accuracy)}%`}
                    </div>
                    <div className="text-[10px] text-[var(--text-tertiary)]">
                      {delta >= 0 ? `+${delta}%` : `${delta}%`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
