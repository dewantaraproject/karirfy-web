import { useState } from "react";
import { areAnswersEqual } from "../../lib/quizGrading";
import { getDiscussionForOptions, optionLabel } from "../../lib/questionOptions";
import type { QuestionItem } from "../../types";

export function QuestionDiscussion({ question, userAnswer }: { question: QuestionItem; userAnswer: string | null }) {
  const [failedUrl, setFailedUrl] = useState<string>();
  const image = question.explanationUrl !== failedUrl ? question.explanationUrl : undefined;
  const { text, sourceLabels } = getDiscussionForOptions(question);
  const blocks = text ? text.split(/\n\s*\n/) : [];
  const scores = question.scores ?? {};
  const bestScore = Math.max(0, ...Object.values(scores).map((v) => Number(v) || 0));
  const weighted = bestScore > 1;
  const chosen = question.options.find(({ id }) => areAnswersEqual(id, userAnswer));
  const key = question.options.find(({ id }) => areAnswersEqual(id, question.correct));
  const points = chosen && weighted ? scores[chosen.id.toLowerCase()] : undefined;
  const bestOptions = weighted ? question.options.filter(({ id }) => scores[id.toLowerCase()] === bestScore) : [];
  const best = weighted ? bestOptions : key ? [key] : [];

  return (
    <section className="expl question-discussion" aria-label="Pembahasan">
      <div className="question-discussion-heading">
        <h3>Pembahasan</h3>
        {best.length > 0 && <span>{weighted ? "Poin tertinggi" : "Kunci"} · {best.map((option) => optionLabel(question.options.indexOf(option))).join(", ")}</span>}
      </div>
      {typeof points === "number" && <p className="mut">Pilihanmu mendapat {points} dari {bestScore} poin.</p>}
      {sourceLabels.length > 0 && <p className="mut">
        Padanan huruf pembahasan ke opsi soal · {sourceLabels.map(([original, label]) => `${original} → ${label}`).join(" · ")}
      </p>}
      {blocks.map((block, index) => {
        const rows = block.split(/\r?\n/);
        return rows.length > 1 && rows.every((row) => /^\d+[.)]\s/.test(row))
          ? <ol key={index}>{rows.map((row, step) => <li key={step}>{row.replace(/^\d+[.)]\s+/, "")}</li>)}</ol>
          : <p key={index}>{block}</p>;
      })}
      {image && <img src={image} alt="Ilustrasi pembahasan soal" loading="lazy" onError={() => setFailedUrl(image)} />}
      {!blocks.length && !image && <p className="mut">Pembahasan belum tersedia untuk soal ini.</p>}
    </section>
  );
}
