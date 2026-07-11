import { addDays, getMonday, toISODate } from "@/lib/date";

export function getWeekEnd(weekStartISO: string): string {
  const start = new Date(`${weekStartISO}T00:00:00`);
  return toISODate(addDays(start, 6));
}

export function getUpcomingMondays(count: number, now: Date = new Date()): string[] {
  const firstMonday = getMonday(now);
  return Array.from({ length: count }, (_, i) => toISODate(addDays(firstMonday, i * 7)));
}
