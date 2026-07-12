import { getMonday, toISODate } from "@/lib/date";
import type { Task } from "../types";

export type WeekGroup = {
  weekStart: string;
  tasks: Task[];
};

export function groupTasksByWeek(tasks: Task[]): WeekGroup[] {
  const groups = new Map<string, Task[]>();

  for (const task of tasks) {
    if (!task.due_date) continue;
    const weekStart = toISODate(getMonday(new Date(`${task.due_date}T00:00:00`)));
    const list = groups.get(weekStart) ?? [];
    list.push(task);
    groups.set(weekStart, list);
  }

  return Array.from(groups.entries())
    .map(([weekStart, weekTasks]) => ({ weekStart, tasks: weekTasks }))
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart));
}

export function formatWeekLabel(weekStartISO: string): string {
  const [, month, day] = weekStartISO.split("-");
  return `Woche ab ${day}.${month}.`;
}
