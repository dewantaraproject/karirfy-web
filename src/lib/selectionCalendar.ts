import type { StudyTrack } from "../types";
import { toLocalISO } from "./curriculumRoadmap";
import { buildFocusDays, STUDY_TRACKS, type ApplicationStage, type PreparationState } from "./studyPreparation";

export const AGENDA_CATEGORIES = ["Pendaftaran", "Dokumen", "Tes", "Wawancara", "Belajar"] as const;
export type CalendarView = "month" | "week";

export interface AgendaItem {
  id: number;
  track: StudyTrack;
  date: string;
  time: string;
  title: string;
  category: typeof AGENDA_CATEGORIES[number];
  notes: string;
  done: boolean;
  remind: boolean;
}

interface CalendarEntry {
  date: string;
  time: string;
  title: string;
  done: boolean;
  track: StudyTrack;
}

export type SelectionEvent = CalendarEntry & (
  | { type: "agenda"; key: number; item: AgendaItem }
  | { type: "radar" | "focus"; key: string }
  | { type: "application"; key: string; applicationId: string; stage: ApplicationStage }
);

function localDay(date: string): Date {
  return new Date(`${date}T12:00:00`);
}

export function calendarDays(anchor: string, view: CalendarView): string[] {
  const start = localDay(anchor);
  const end = localDay(anchor);
  if (view === "month") {
    start.setDate(1);
    end.setMonth(end.getMonth() + 1, 0);
  }
  start.setDate(start.getDate() - (start.getDay() + 6) % 7);
  if (view === "week") end.setTime(start.getTime());
  end.setDate(end.getDate() + (7 - end.getDay()) % 7);

  const dates: string[] = [];
  while (start <= end) {
    dates.push(toLocalISO(start));
    start.setDate(start.getDate() + 1);
  }
  return dates;
}

export function moveCalendar(anchor: string, view: CalendarView, direction: -1 | 1): string {
  const date = localDay(anchor);
  if (view === "month") date.setMonth(date.getMonth() + direction, 1);
  else date.setDate(date.getDate() + 7 * direction);
  return toLocalISO(date);
}

export function selectionEvents(state: PreparationState, filter: StudyTrack | "all"): SelectionEvent[] {
  const events: SelectionEvent[] = (state.agenda ?? []).map((item) => ({ ...item, key: item.id, type: "agenda", item }));
  for (const track of STUDY_TRACKS) {
    const target = state.targets[track];
    if (target?.date) events.push({ type: "radar", key: `radar-${track}`, track, date: target.date, time: "", done: false, title: target.name.trim() || "Target seleksi" });
    const plan = state.plans[track];
    if (plan) {
      for (const day of buildFocusDays(plan)) {
        events.push({ type: "focus", key: `focus-${track}-${day.number}`, track, date: day.date, time: "", done: day.done, title: `Fokus ${day.number} · ${day.label}` });
      }
    }
  }
  for (const app of state.applications ?? []) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(app.nextDate)) continue;
    const label = [app.institution.trim(), app.roleTitle.trim()].filter(Boolean).join(" · ") || "Lamaran Aktif";
    events.push({
      type: "application",
      key: `app-${app.id}`,
      applicationId: app.id,
      stage: app.stage,
      track: app.track,
      date: app.nextDate,
      time: "",
      done: app.stage === "Diterima" || app.stage === "Evaluasi",
      title: `${label} (${app.stage})`,
    });
  }
  return events.filter((event) => filter === "all" || event.track === filter).sort((a, b) =>
    a.date.localeCompare(b.date) || a.time.localeCompare(b.time) || a.title.localeCompare(b.title, "id"));
}

export function reminderDate(item: Pick<AgendaItem, "date" | "time" | "remind" | "done">, now = new Date()) {
  if (!item.remind || item.done || !item.time) return undefined;
  const at = new Date(`${item.date}T${item.time}:00`);
  return at > now ? at : undefined;
}
