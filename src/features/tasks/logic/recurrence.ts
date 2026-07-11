import { addDays, addMonths, isoWeekday, toISODate } from "@/lib/date";
import type { RecurrenceRule } from "../types";

export function computeNextDueDate(fromDateISO: string, rule: RecurrenceRule): string {
  const from = new Date(`${fromDateISO}T00:00:00`);

  if (rule.type === "daily") return toISODate(addDays(from, rule.interval));
  if (rule.type === "weekly") return toISODate(addDays(from, rule.interval * 7));
  if (rule.type === "monthly") return toISODate(addMonths(from, rule.interval));

  if (rule.weekdays.length === 0) return toISODate(addDays(from, 7));

  let cursor = addDays(from, 1);
  for (let i = 0; i < 14; i++) {
    if (rule.weekdays.includes(isoWeekday(cursor))) return toISODate(cursor);
    cursor = addDays(cursor, 1);
  }
  return toISODate(addDays(from, 7));
}

export function computeMissedPenaltyPoints(
  dueDateISO: string | null,
  completedAtISO: string
): number {
  if (!dueDateISO) return 0;

  const due = new Date(`${dueDateISO}T00:00:00`);
  const completedDateOnly = new Date(`${completedAtISO.slice(0, 10)}T00:00:00`);
  const diffDays = Math.round((completedDateOnly.getTime() - due.getTime()) / 86_400_000);

  return diffDays > 0 ? -diffDays : 0;
}
