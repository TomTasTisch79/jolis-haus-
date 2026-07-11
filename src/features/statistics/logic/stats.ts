import { addDays, getMonday, toISODate } from "@/lib/date";
import { SIZE_POINTS } from "@/lib/points";
import type { Task } from "@/features/tasks/types";
import type { Rating } from "@/features/ratings/types";

export type Period = "week" | "month" | "lifetime";

export type ProfileStats = {
  points: number;
  completedCount: number;
  missedCount: number;
  goodRatings: number;
  badRatings: number;
  currentTaskCount: number;
};

function isWithinPeriod(dateISO: string, period: Period, now: Date): boolean {
  if (period === "lifetime") return true;

  const date = new Date(dateISO);
  if (period === "week") {
    const monday = getMonday(now);
    const nextMonday = addDays(monday, 7);
    return date >= monday && date < nextMonday;
  }

  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

export function computeProfileStats(
  profileId: string,
  tasks: Task[],
  ratings: Rating[],
  period: Period,
  now: Date = new Date()
): ProfileStats {
  const ratingByTaskId = new Map(ratings.map((rating) => [rating.task_id, rating]));
  const todayISO = toISODate(now);

  let points = 0;
  let completedCount = 0;
  let goodRatings = 0;
  let badRatings = 0;

  for (const task of tasks) {
    if (task.completed_by !== profileId || !task.completed_at) continue;
    if (!isWithinPeriod(task.completed_at, period, now)) continue;

    completedCount += 1;
    points += task.missed_penalty_points;

    const rating = ratingByTaskId.get(task.id);
    if (rating) {
      points += rating.points_awarded;
      if (rating.rating === "good") goodRatings += 1;
      else badRatings += 1;
    }
  }

  const missedCount = tasks.filter(
    (task) =>
      task.assigned_profile_id === profileId &&
      !task.completed_at &&
      task.due_date !== null &&
      task.due_date < todayISO
  ).length;

  const currentTaskCount = tasks.filter(
    (task) => task.assigned_profile_id === profileId && !task.completed_at
  ).length;

  return { points, completedCount, missedCount, goodRatings, badRatings, currentTaskCount };
}

export function computeWorkloadPercentages(
  profileIds: [string, string],
  tasks: Task[]
): Record<string, number> {
  const openPoints: Record<string, number> = { [profileIds[0]]: 0, [profileIds[1]]: 0 };

  for (const task of tasks) {
    if (task.completed_at || !task.assigned_profile_id) continue;
    if (task.assigned_profile_id in openPoints) {
      openPoints[task.assigned_profile_id] += SIZE_POINTS[task.size];
    }
  }

  const total = openPoints[profileIds[0]] + openPoints[profileIds[1]];
  if (total === 0) return { [profileIds[0]]: 0, [profileIds[1]]: 0 };

  return {
    [profileIds[0]]: Math.round((openPoints[profileIds[0]] / total) * 100),
    [profileIds[1]]: Math.round((openPoints[profileIds[1]] / total) * 100),
  };
}
