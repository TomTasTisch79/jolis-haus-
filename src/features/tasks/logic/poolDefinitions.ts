import type { Task } from "../types";

/**
 * Pool tasks accumulate one row per completed cycle (recurrence spawns a
 * fresh row on completion). For management UI purposes we only want to
 * show/edit one representative row per recurring chore.
 */
export function getLatestPerSeries(tasks: Task[]): Task[] {
  const groups = new Map<string, Task[]>();
  for (const task of tasks) {
    const key = task.series_id ?? task.id;
    const list = groups.get(key) ?? [];
    list.push(task);
    groups.set(key, list);
  }

  return Array.from(groups.values()).map((group) =>
    group.reduce((latest, task) => (task.created_at > latest.created_at ? task : latest))
  );
}
