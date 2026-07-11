import { addDays, getMonday, toISODate } from "@/lib/date";

export function getNextUnplannedWeekStart(plannedWeekStartDates: string[]): string {
  const planned = new Set(plannedWeekStartDates);
  let cursor = getMonday(new Date());

  for (let i = 0; i < 52; i++) {
    const iso = toISODate(cursor);
    if (!planned.has(iso)) return iso;
    cursor = addDays(cursor, 7);
  }

  return toISODate(cursor);
}

export function getWeekEnd(weekStartISO: string): string {
  const start = new Date(`${weekStartISO}T00:00:00`);
  return toISODate(addDays(start, 6));
}
