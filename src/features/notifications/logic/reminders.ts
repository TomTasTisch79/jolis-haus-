import { addDays, getMonday, isoWeekday, toISODate } from "@/lib/date";
import type { Task } from "@/features/tasks/types";

export type Reminder = {
  key: string;
  message: string;
};

export function computeReminders(
  tasks: Task[],
  profileId: string,
  plannedWeekStartDates: string[],
  now: Date = new Date()
): Reminder[] {
  const reminders: Reminder[] = [];
  const todayISO = toISODate(now);
  const tomorrowISO = toISODate(addDays(now, 1));
  const weekday = isoWeekday(now);

  const overdueCount = tasks.filter(
    (task) =>
      task.assigned_profile_id === profileId &&
      !task.completed_at &&
      task.due_date !== null &&
      task.due_date < todayISO
  ).length;
  if (overdueCount > 0) {
    reminders.push({
      key: "overdue",
      message: `Du hast ${overdueCount} überfällige Aufgabe${overdueCount > 1 ? "n" : ""}.`,
    });
  }

  const upcomingCount = tasks.filter(
    (task) =>
      task.assigned_profile_id === profileId &&
      !task.completed_at &&
      (task.due_date === todayISO || task.due_date === tomorrowISO)
  ).length;
  if (upcomingCount > 0) {
    reminders.push({
      key: "upcoming",
      message: `Du hast ${upcomingCount} Aufgabe${upcomingCount > 1 ? "n" : ""} heute oder morgen fällig.`,
    });
  }

  const nextWeekMonday = toISODate(getMonday(addDays(now, 7)));
  const nextWeekPlanned = plannedWeekStartDates.includes(nextWeekMonday);

  if (!nextWeekPlanned) {
    if (weekday === 7) {
      reminders.push({
        key: "sunday",
        message: "Sonntag: Die neue Woche wurde noch nicht geplant. Zeit für den Zufalls-Pool!",
      });
    } else if (weekday === 5 || weekday === 6) {
      reminders.push({
        key: "planning",
        message: "Die neue Woche ist noch nicht geplant.",
      });
    }
  }

  return reminders;
}
