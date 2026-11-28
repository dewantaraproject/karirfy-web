import { useMemo } from "react";
import type { QuestionItem, QuestionVisual as VisualData, ThemeMode } from "../../types";
import { themeQuestionSvg } from "../../lib/questionSvg";
import { QuestionMatrix } from "./QuestionMatrix";
import "../../styles/questionVisual.css";

const shapeLabels = { circle: "lingkaran", triangle: "segitiga", square: "persegi" };

function Shape({ shape }: { shape: keyof typeof shapeLabels }) {
  return <svg viewBox="0 0 20 20" className={`q-shape q-shape-${shape}`} aria-hidden="true">
    {shape === "circle" ? <circle cx="10" cy="10" r="7" /> : shape === "triangle"
      ? <path d="M10 2.5l8 14H2z" /> : <rect x="3" y="3" width="14" height="14" rx="2" />}
  </svg>;
}

type ScheduleData = Extract<VisualData, { kind: "schedule" }>;

function ScheduleTable({ schedule, options, selected, onSelect, start = 0, end = schedule.slots.length }: {
  schedule: ScheduleData; options: QuestionItem["options"]; selected?: string | null;
  onSelect?: (id: string) => void; start?: number; end?: number;
}) {
  const slots = schedule.slots.slice(start, end);
  return <table className="q-data-table q-schedule" aria-label={`Jadwal ${slots[0]} hingga ${slots[slots.length - 1]}`}>
    <thead><tr><th scope="col">Nama</th>{slots.map((slot) => {
      const option = options.find(({ text }) => text === slot);
      return <th key={slot} scope="col">
        {onSelect && option ? <button type="button" className="q-slot" aria-pressed={option.id === selected}
          aria-label={`Pilih pukul ${slot}`} onClick={() => onSelect(option.id)}>{slot}</button> : slot}
      </th>;
    })}</tr></thead>
    <tbody>{schedule.rows.map(({ label, free }) => <tr key={label}><th scope="row">{label}</th>
      {free.slice(start, end).map((available, i) => <td key={slots[i]} aria-label={available ? "Tersedia" : "Sibuk"}>
        <span className={`quiz-status-dot quiz-status-glass${available ? " is-green" : ""}`} aria-hidden="true" />
      </td>)}
    </tr>)}</tbody>
  </table>;
}

export function QuestionVisual({ question, theme, selected, onSelect }: {
  question: QuestionItem; theme: ThemeMode; selected?: string | null; onSelect?: (id: string) => void;
}) {
  const source = question.imageUrl;
  const image = useMemo(() => source ? themeQuestionSvg(source, theme) : undefined, [source, theme]);
  const visual = question.visual;
  const illustration = image ? <div className="glass q-visual q-illustration"><img src={image} alt="Ilustrasi soal" loading="lazy" /></div> : null;
  if (question.matrixData) return <>{illustration}<QuestionMatrix rows={question.matrixData} /></>;
  if (question.digitSymbolData && question.id.startsWith("digsym-v2-")) {
    const { symbolMap, testSequence } = question.digitSymbolData;
    return <div className="glass q-visual q-symbols">
      <span>Kunci simbol</span>
      <ul aria-label="Kunci simbol">{Object.entries(symbolMap).map(([symbol, value]) =>
        <li key={symbol} className="matrix-cell">{symbol} = {String(value)}</li>)}</ul>
      <span>Urutan soal</span>
      <ol aria-label="Urutan soal">{testSequence.map((symbol, index) =>
        <li key={index} className="matrix-cell">{symbol}</li>)}</ol>
    </div>;
  }
  if (visual?.kind === "algebra") {
    return <div className="glass q-visual q-algebra" role="group" aria-label="Persamaan aljabar visual">
      {[...visual.equations, { terms: visual.query, result: "?" }].map(({ terms, result }, row) => {
        const description = terms.map((term, i) => term ? `${term} ${shapeLabels[visual.symbols[i]]}` : "").filter(Boolean).join(" + ");
        return <div key={row} className={`matrix-cell q-equation${result === "?" ? " qmark" : ""}`}
          role="img" aria-label={`${description} sama dengan ${result === "?" ? "nilai yang dicari" : result}`}>
          <span className="q-terms" aria-hidden="true">
            {terms.flatMap((count, i) => Array.from({ length: count }, (_, j) => <Shape key={`${i}-${j}`} shape={visual.symbols[i]} />))}
          </span>
          <span aria-hidden="true">=</span><strong aria-hidden="true">{result}</strong>
        </div>;
      })}
    </div>;
  }
  if (visual?.kind === "schedule") {
    const middle = Math.ceil(visual.slots.length / 2);
    const table = { schedule: visual, options: question.options, selected, onSelect };
    return <section className="glass q-visual q-schedule-card" aria-label="Jadwal ketersediaan tim">
      <p className="q-schedule-legend">
        <span><i className="quiz-status-dot quiz-status-glass is-green" aria-hidden="true" />Tersedia</span>
        <span><i className="quiz-status-dot quiz-status-glass" aria-hidden="true" />Sibuk</span>
        {onSelect && <span className="q-schedule-hint">Ketuk jam</span>}
      </p>
      <div className="q-schedule-frame">
        <div className="q-schedule-wide"><ScheduleTable {...table} /></div>
        <div className="q-schedule-compact">
          <ScheduleTable {...table} end={middle} />
          <ScheduleTable {...table} start={middle} />
        </div>
      </div>
    </section>;
  }
  if (visual?.kind === "table") {
    return <div className="glass q-visual q-visual-scroll" role="region" tabIndex={0} aria-label={visual.caption}>
      <table className="q-data-table">
        <caption>{visual.caption}</caption>
        <thead><tr>{visual.headings.map((heading) => <th key={heading} scope="col">{heading}</th>)}</tr></thead>
        <tbody>{visual.rows.map(([header, ...data]) => <tr key={header}><th scope="row">{header}</th>
          {data.map((value, i) => <td className="matrix-cell" key={i}>{value}</td>)}</tr>)}</tbody>
      </table>
    </div>;
  }
  if (visual?.kind === "bars") {
    const largest = Math.max(...visual.entries.map(({ value }) => value), 1);
    return <figure className="glass q-visual q-bars">
      <figcaption>{visual.caption} · {visual.unit}</figcaption>
      <ul>{visual.entries.map(({ label, value }) => <li key={label}>
        <span>{label}</span><div className="q-bar-track" aria-hidden="true"><i style={{ width: `${value / largest * 100}%` }} /></div><strong>{value}</strong>
      </li>)}</ul>
    </figure>;
  }
  return illustration;
}
