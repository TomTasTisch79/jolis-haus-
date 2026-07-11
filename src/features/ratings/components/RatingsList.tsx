"use client";

import { useMemo } from "react";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { useProfiles } from "@/features/auth/hooks/useProfiles";
import { useCurrentProfileId } from "@/features/auth/hooks/useCurrentProfileId";
import { TaskListItem } from "@/features/tasks/components/TaskListItem";
import { rateTask } from "../services/ratings";
import type { RatingValue } from "../types";
import { usePendingRatings } from "../hooks/usePendingRatings";
import styles from "./RatingsList.module.css";

export function RatingsList() {
  const { profileId: currentProfileId } = useCurrentProfileId();
  const { categories } = useCategories();
  const { profiles } = useProfiles();
  const { pendingTasks, isLoading, reload } = usePendingRatings(currentProfileId);

  const categoryById = useMemo(
    () => new Map(categories?.map((category) => [category.id, category])),
    [categories]
  );
  const profileById = useMemo(
    () => new Map(profiles?.map((profile) => [profile.id, profile])),
    [profiles]
  );

  if (isLoading || !currentProfileId) {
    return null;
  }

  async function handleRate(taskId: string, size: Parameters<typeof rateTask>[1], rating: RatingValue) {
    await rateTask(taskId, size, rating, currentProfileId!);
    await reload();
  }

  return (
    <div className={styles.list}>
      {pendingTasks.length === 0 && (
        <p className={styles.empty}>Aktuell liegt nichts zur Bewertung an.</p>
      )}
      {pendingTasks.map((task) => (
        <TaskListItem
          key={task.id}
          task={task}
          category={task.category_id ? categoryById.get(task.category_id) : undefined}
          profile={task.assigned_profile_id ? profileById.get(task.assigned_profile_id) : undefined}
          currentProfileId={currentProfileId}
          onEdit={() => {}}
          onComplete={() => {}}
          onRate={(rating) => handleRate(task.id, task.size, rating)}
        />
      ))}
    </div>
  );
}
