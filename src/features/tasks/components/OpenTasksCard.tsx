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
import { groupTasksByWeek, formatWeekLabel } from "../logic/weekGrouping";
import type { Task } from "../types";
import { TaskListItem } from "./TaskListItem";
import styles from "./OpenTasksCard.module.css";

export function OpenTasksCard() {
  const { tasks, isLoading: tasksLoading, reload } = useAllTasks();
  const { categories } = useCategories();
  const { profiles } = useProfiles();
  const { profileId: currentProfileId } = useCurrentProfileId();
  const { ratings, reload: reloadRatings } = useRatings();
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());

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

  const openTasks = tasks.filter((task) => !task.completed_at && task.assigned_profile_id);
  const weekGroups = groupTasksByWeek(openTasks);
  const partner = profiles?.find((profile) => profile.id !== currentProfileId);

  function toggleWeek(weekStart: string) {
    setExpandedWeeks((current) => {
      const next = new Set(current);
      if (next.has(weekStart)) {
        next.delete(weekStart);
      } else {
        next.add(weekStart);
      }
      return next;
    });
  }

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

  function renderTask(task: Task) {
    return (
      <TaskListItem
        key={task.id}
        task={task}
        category={task.category_id ? categoryById.get(task.category_id) : undefined}
        profile={task.assigned_profile_id ? profileById.get(task.assigned_profile_id) : undefined}
        rating={ratingByTaskId.get(task.id)}
        currentProfileId={currentProfileId}
        onEdit={() => {}}
        onComplete={() => handleComplete(task)}
        onRate={(rating) => handleRate(task, rating)}
      />
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardHeaderLabel}>Offene Aufgaben</span>
        <span className={styles.count}>{openTasks.length}</span>
      </div>

      {weekGroups.length === 0 && <p className={styles.empty}>Alles erledigt 🎉</p>}

      {weekGroups.map((group) => {
        const isExpanded = expandedWeeks.has(group.weekStart);
        const mine = group.tasks.filter((task) => task.assigned_profile_id === currentProfileId);
        const theirs = group.tasks.filter((task) => task.assigned_profile_id !== currentProfileId);

        return (
          <div key={group.weekStart} className={styles.weekGroup}>
            <button className={styles.weekHeader} onClick={() => toggleWeek(group.weekStart)}>
              <span className={styles.weekHeaderLabel}>{formatWeekLabel(group.weekStart)}</span>
              <span className={styles.count}>{group.tasks.length}</span>
              <span className={styles.chevron}>{isExpanded ? "▲" : "▼"}</span>
            </button>

            {isExpanded && (
              <div className={styles.weekContent}>
                {mine.length > 0 && (
                  <div className={styles.profileGroup}>
                    <span className={styles.profileGroupTitle}>Meine Aufgaben</span>
                    {mine.map(renderTask)}
                  </div>
                )}
                {theirs.length > 0 && (
                  <div className={styles.profileGroup}>
                    <span className={styles.profileGroupTitle}>
                      {partner ? `${partner.username}s Aufgaben` : "Aufgaben"}
                    </span>
                    {theirs.map(renderTask)}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
