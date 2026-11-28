import React, { useState } from "react";
import { CheckCircle2, Mic, Sparkles } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { EMPTY_CV, getActiveCvVersion, loadCvCollection } from "../../lib/cv";
import {
  buildContributionEssayOutline,
  buildStarStoriesFromCv,
  countWords,
  ESSAY_RUBRIC_CRITERIA,
  loadStarStudioState,
  saveStarStudioState,
  STAR_PROMPTS_BY_TRACK,
  type StarStoryDraft,
  type StarStudioSavedState,
} from "../../lib/interviewStar";
import { getStudyTrack } from "../../lib/studyPreparation";
import { cn } from "../../lib/utils";

export const StarStudioView: React.FC = () => {
  const { profile } = useAuth();
  const track = getStudyTrack(profile.careerGoal);
  const [state, setState] = useState<StarStudioSavedState>(() => loadStarStudioState());
  const [selectedPromptIdx, setSelectedPromptIdx] = useState(0);
  const prompts = STAR_PROMPTS_BY_TRACK[track] ?? STAR_PROMPTS_BY_TRACK.CPNS;
  const activePrompt = prompts[selectedPromptIdx] || prompts[0];

  const col = loadCvCollection();
  const activeCv = getActiveCvVersion(col)?.draft ?? EMPTY_CV;

  const currentStory: StarStoryDraft = state.stories[activePrompt] ?? {
    id: `story-${selectedPromptIdx}`,
    sourceTitle: track,
    sourceOrg: "Karirfy",
    question: activePrompt,
    situation: "",
    task: "",
    action: "",
    result: "",
  };

  const persist = (next: StarStudioSavedState) => {
    setState(next);
    saveStarStudioState(next);
  };

  const updateStoryField = (
    field: "situation" | "task" | "action" | "result",
    value: string,
  ) => {
    persist({
      ...state,
      stories: {
        ...state.stories,
        [activePrompt]: { ...currentStory, [field]: value },
      },
    });
  };

  const generateFromCv = () => {
    const generated = buildStarStoriesFromCv(activeCv, track);
    if (generated.length > 0) {
      persist({
        ...state,
        stories: {
          ...state.stories,
          [activePrompt]: { ...generated[0], question: activePrompt },
        },
      });
    }
  };

  const toggleRubric = (criterion: string) => {
    const has = state.rubricChecks.includes(criterion);
    const rubricChecks = has
      ? state.rubricChecks.filter((x) => x !== criterion)
      : [...state.rubricChecks, criterion];
    persist({ ...state, rubricChecks });
  };

  const outline = buildContributionEssayOutline(activeCv, track);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            Interview STAR &amp; Essay Studio · {track}
          </h1>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">
            Susun kerangka wawancara Situation, Task, Action, Result dan garis besar esai kontribusi.
          </p>
        </div>

        <button
          type="button"
          onClick={generateFromCv}
          className="px-4 py-2 rounded-full bg-[var(--accent)] text-[var(--accent-ink)] text-xs font-bold inline-flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ekstrak Cerita dari Draf CV</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 apple-card p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
            <Mic className="w-4 h-4" />
            <span>Pilih Pertanyaan Panelis</span>
          </div>

          <div className="space-y-1.5">
            {prompts.map((p, idx) => (
              <button
                key={p}
                type="button"
                onClick={() => setSelectedPromptIdx(idx)}
                className={cn(
                  "w-full p-3 rounded-xl text-left text-xs border transition-all",
                  idx === selectedPromptIdx
                    ? "bg-[var(--accent)] text-[var(--accent-ink)] font-semibold border-transparent"
                    : "apple-sub-box text-[var(--text-secondary)]",
                )}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {(
              [
                ["situation", "Situation (Konteks & Tantangan)"],
                ["task", "Task (Peran & Tanggung Jawab)"],
                ["action", "Action (Langkah Spesifik)"],
                ["result", "Result (Dampak Terukur)"],
              ] as const
            ).map(([field, label]) => (
              <div key={field}>
                <label className="block text-[11px] font-semibold text-[var(--text-tertiary)] mb-1">
                  {label}
                </label>
                <textarea
                  rows={4}
                  value={currentStory[field]}
                  onChange={(e) => updateStoryField(field, e.target.value)}
                  className="w-full p-3 rounded-xl apple-sub-box text-xs text-[var(--text-primary)] focus:outline-none"
                  placeholder={`Tulis ${label}...`}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="apple-card p-5 space-y-3">
            <h2 className="text-sm font-bold text-[var(--text-primary)]">
              Outline Esai Kontribusi Indonesia
            </h2>
            <div className="space-y-2.5">
              {outline.map((sec) => {
                const text = state.essaySections[sec.id] ?? sec.draft;
                return (
                  <div key={sec.id} className="apple-sub-box p-3 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-[var(--text-primary)]">
                      <span>{sec.heading}</span>
                      <span className="text-[var(--text-tertiary)]">{countWords(text)} kata</span>
                    </div>
                    <p className="text-[11px] text-[var(--text-tertiary)]">{sec.prompt}</p>
                    <textarea
                      rows={3}
                      value={text}
                      onChange={(e) =>
                        persist({
                          ...state,
                          essaySections: { ...state.essaySections, [sec.id]: e.target.value },
                        })
                      }
                      className="w-full p-2.5 rounded-xl bg-transparent border border-[var(--glass-border)] text-xs text-[var(--text-primary)]"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="apple-card p-5 space-y-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
              Daftar Periksa Rubrik Esai
            </h2>
            {ESSAY_RUBRIC_CRITERIA.map((criterion) => {
              const checked = state.rubricChecks.includes(criterion);
              return (
                <button
                  key={criterion}
                  type="button"
                  onClick={() => toggleRubric(criterion)}
                  className="w-full apple-sub-box p-2.5 flex items-center gap-2 text-left text-xs"
                >
                  <CheckCircle2
                    className={cn(
                      "w-4 h-4 shrink-0",
                      checked ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)]",
                    )}
                  />
                  <span
                    className={
                      checked
                        ? "line-through text-[var(--text-tertiary)]"
                        : "text-[var(--text-primary)]"
                    }
                  >
                    {criterion}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
