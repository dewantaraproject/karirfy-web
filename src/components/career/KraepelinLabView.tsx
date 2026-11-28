import React, { useEffect, useState } from "react";
import { Activity, Play, RotateCcw } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import {
  evaluateKraepelinSession,
  generateKraepelinColumns,
  KRAEPELIN_PRESETS,
  type KraepelinColumn,
  type KraepelinEvaluation,
  type KraepelinPresetKey,
} from "../../lib/kraepelinEngine";
import { cn } from "../../lib/utils";

export const KraepelinLabView: React.FC = () => {
  const [presetKey, setPresetKey] = useState<KraepelinPresetKey>("sprint");
  const preset = KRAEPELIN_PRESETS[presetKey];

  const [running, setRunning] = useState(false);
  const [columns, setColumns] = useState<KraepelinColumn[]>([]);
  const [colIndex, setColIndex] = useState(0);
  const [rowIndex, setRowIndex] = useState(0);
  const [answers, setAnswers] = useState<number[][]>([]);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [evaluation, setEvaluation] = useState<KraepelinEvaluation | null>(null);

  const startSession = () => {
    const generated = generateKraepelinColumns(
      `web-${Date.now()}`,
      preset.columns,
      preset.digitsPerColumn,
    );
    setColumns(generated);
    setAnswers(generated.map(() => []));
    setColIndex(0);
    setRowIndex(0);
    setSecondsLeft(preset.secondsPerColumn);
    setEvaluation(null);
    setRunning(true);
  };

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (colIndex + 1 >= columns.length) {
            setRunning(false);
            setEvaluation(
              evaluateKraepelinSession(columns, answers, preset.secondsPerColumn),
            );
            return 0;
          }
          setColIndex((c) => c + 1);
          setRowIndex(0);
          return preset.secondsPerColumn;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running, colIndex, columns, answers, preset.secondsPerColumn]);

  const inputDigit = (digit: number) => {
    if (!running) return;
    const col = columns[colIndex];
    if (!col || rowIndex >= col.expectedSums.length) return;
    setAnswers((prev) => {
      const next = prev.map((arr) => [...arr]);
      next[colIndex][rowIndex] = digit;
      return next;
    });
    if (rowIndex + 1 < col.expectedSums.length) {
      setRowIndex((r) => r + 1);
    }
  };

  useEffect(() => {
    if (!running) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        e.preventDefault();
        inputDigit(Number(e.key));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [running, colIndex, rowIndex, columns]);

  const currentCol = columns[colIndex];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            Lab Ketahanan Kraepelin / Pauli
          </h1>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">
            Jumlahkan dua angka berurutan dan ketik digit terakhir (satuan) via keyboard 0-9 atau numpad.
          </p>
        </div>

        <div className="apple-segmented-track">
          {(Object.keys(KRAEPELIN_PRESETS) as KraepelinPresetKey[]).map((key) => (
            <button
              key={key}
              type="button"
              disabled={running}
              onClick={() => setPresetKey(key)}
              className={cn(
                "apple-segmented-btn",
                presetKey === key && "apple-segmented-btn-active",
              )}
            >
              {key === "sprint" ? "Sprint" : key === "standard" ? "Standar" : "Endurance"}
            </button>
          ))}
        </div>
      </div>

      {!running && !evaluation && (
        <div className="apple-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-[var(--text-primary)]">{preset.title}</div>
            <div className="text-xs text-[var(--text-tertiary)] mt-1">{preset.subtitle}</div>
          </div>
          <button
            type="button"
            onClick={startSession}
            className="px-5 py-2.5 rounded-full bg-[var(--accent)] text-[var(--accent-ink)] text-xs font-bold inline-flex items-center gap-2"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Mulai Uji Kecepatan</span>
          </button>
        </div>
      )}

      {running && currentCol && (
        <div className="apple-card p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)]">
              <span>
                Lajur {colIndex + 1} / {columns.length}
              </span>
              <span className="font-bold amount text-[var(--text-primary)]">{secondsLeft} detik</span>
            </div>

            <div className="apple-sub-box p-6 flex flex-col items-center justify-center gap-3">
              <div className="text-4xl font-bold amount text-[var(--text-primary)]">
                {currentCol.digits[rowIndex]}
              </div>
              <div className="text-xs font-bold text-[var(--text-tertiary)]">+</div>
              <div className="text-4xl font-bold amount text-[var(--text-primary)]">
                {currentCol.digits[rowIndex + 1]}
              </div>
              <div className="text-[11px] text-[var(--text-tertiary)] mt-2">
                Pasangan ke-{rowIndex + 1} dari {currentCol.expectedSums.length}
              </div>
            </div>
          </div>

          <div className="md:col-span-6 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => inputDigit(num)}
                  className="inner-pseudo-glass py-3.5 rounded-2xl text-lg font-bold amount text-[var(--text-primary)]"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={() => inputDigit(0)}
                className="col-span-3 inner-pseudo-glass py-3.5 rounded-2xl text-lg font-bold amount text-[var(--text-primary)]"
              >
                0
              </button>
            </div>
          </div>
        </div>
      )}

      {evaluation && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span>Hasil Profil Kraepelin</span>
            </h2>
            <button
              type="button"
              onClick={startSession}
              className="inner-pseudo-glass px-3.5 py-1.5 rounded-full text-xs font-semibold text-[var(--text-primary)] inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Ulangi</span>
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { title: "Panker (Kecepatan)", val: evaluation.panker.rawText, sub: evaluation.panker.label },
              { title: "Tianker (Ketelitian)", val: evaluation.tianker.rawText, sub: evaluation.tianker.label },
              { title: "Janker (Stabilitas)", val: evaluation.janker.rawText, sub: evaluation.janker.label },
              { title: "Hanker (Ketahanan)", val: evaluation.hanker.rawText, sub: evaluation.hanker.label },
            ].map((item) => (
              <div key={item.title} className="apple-card p-4">
                <div className="text-[11px] text-[var(--text-tertiary)]">{item.title}</div>
                <div className="text-xl font-bold amount text-[var(--text-primary)] mt-1">
                  {item.val}
                </div>
                <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">{item.sub}</div>
              </div>
            ))}
          </div>

          <div className="apple-card p-5">
            <div className="text-xs font-bold text-[var(--text-primary)] mb-3">
              Kurva Kecepatan &amp; Ketelitian per Lajur
            </div>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={evaluation.columnStats}>
                  <XAxis
                    dataKey="columnIndex"
                    tickFormatter={(v) => `L${Number(v) + 1}`}
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
                  <Bar
                    dataKey="answered"
                    fill="var(--chart-bar-high)"
                    radius={[6, 6, 0, 0]}
                    barSize={16}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
