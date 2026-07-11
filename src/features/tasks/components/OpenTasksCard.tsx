"use client";

import { useMemo, useState } from "react";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { useProfiles } from "@/features/auth/hooks/useProfiles";
import { useCurrentProfileId } from "@/features/auth/hooks/useCurrentProfileId";
import { useRatings } from "@/features/ratings/hooks/useRatings";
import { rateTask } from "@/features/ratings/services/ratings";
import type { RatingValue } from "@/features/ratings/types";
import { useAllTasks } from "../hooks/useAllTasks";
import { completeTask } from "../services/tasks";
import type { Task } from "../types";
import { TaskListItem } from "./TaskListItem";
import styles from "./OpenTasksCard.module.css";

export function OpenTasksCard() {
  const { tasks, isLoading: tasksLoading, reload } = useAllTasks();
  const { categories } = useCategories();
  const { profiles } = useProfiles();
  const { profileId: currentProfileId } = useCurrentProfileId();
  const { ratings, reload: reloadRatings } = useRatings();
  const [expanded, setExpanded] = useState(false);

  const categoryById = useMemo(
    () => new Map(categories?.map((category) => [category.id, category])),
    [categories]
  );
  const profileById = useMemo(
    () => new Map(profiles?.map((profile) => [profile.id, profile])),
    [profiles]
  );
  const ratingByTaskId = useMemo(
    () => new Map(ratings?.map((rating) => [rating.task_id, rating])),
    [ratings]
  );

  if (tasksLoading || !tasks) {
    return null;
  }

  const openTasks = tasks
    .filter((task) => !task.completed_at && task.assigned_profile_id)
    .sort((a, b) => (a.due_date ?? "9999-99-99").localeCompare(b.due_date ?? "9999-99-99"));

  async function handleComplete(task: Task) {
    if (!currentProfileId) return;
    await completeTask(task, currentProfileId);
    await reload();
  }

  async function handleRate(task: Task, rating: RatingValue) {
    if (!currentProfileId) return;
    await rateTask(task.id, task.size, rating, currentProfileId);
    await reloadRatings();
  }

  return (
    <div className={styles.card}>
      <button className={styles.header} onClick={() => setExpanded((current) => !current)}>
        <span className={styles.headerLabel}>Offene Aufgaben</span>
        <span className={styles.count}>{openTasks.length}</span>
        <span className={styles.chevron}>{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className={styles.list}>
          {openTasks.length === 0 && <p className={styles.empty}>Alles erledigt 🎉</p>}
          {openTasks.map((task) => (
            <TaskListItem
              key={task.id}
              task={task}
              category={task.category_id ? categoryById.get(task.category_id) : undefined}
              profile={
                task.assigned_profile_id ? profileById.get(task.assigned_profile_id) : undefined
              }
              rating={ratingByTaskId.get(task.id)}
              currentProfileId={currentProfileId}
              onEdit={() => {}}
              onComplete={() => handleComplete(task)}
              onRate={(rating) => handleRate(task, rating)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
