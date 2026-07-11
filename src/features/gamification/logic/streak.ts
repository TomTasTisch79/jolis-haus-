import { addDays, toISODate } from "@/lib/date";
import type { Task } from "@/features/tasks/types";

export function computeCompletionStreak(
  tasks: Task[],
  profileId: string,
  now: Date = new Date()
): number {
  const completedDates = new Set(
    tasks
      .filter((task) => task.completed_by === profileId && task.completed_at)
      .map((task) => task.completed_at!.slice(0, 10))
  );

  let cursor = new Date(now);
  if (!completedDates.has(toISODate(cursor))) {
    cursor = addDays(cursor, -1);
  }

  let streak = 0;
  while (completedDates.has(toISODate(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}
