import type { Task } from "@/features/tasks/types";
import type { Rating } from "../types";

export function getPendingRatingTasks(tasks: Task[], ratings: Rating[], profileId: string): Task[] {
  const ratedTaskIds = new Set(ratings.map((rating) => rating.task_id));
  return tasks.filter(
    (task) => task.completed_at && task.completed_by !== profileId && !ratedTaskIds.has(task.id)
  );
}
