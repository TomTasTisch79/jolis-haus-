"use client";

import { useAllTasks } from "@/features/tasks/hooks/useAllTasks";
import { useRatings } from "@/features/ratings/hooks/useRatings";
import { computeProfileStats } from "@/features/statistics/logic/stats";
import { computeAchievements } from "../logic/achievements";
import { computeCompletionStreak } from "../logic/streak";
import styles from "./AchievementsList.module.css";

type AchievementsListProps = {
  profileId: string;
};

export function AchievementsList({ profileId }: AchievementsListProps) {
  const { tasks, isLoading: tasksLoading } = useAllTasks();
  const { ratings, isLoading: ratingsLoading } = useRatings();

  if (tasksLoading || ratingsLoading || !tasks || !ratings) {
    return null;
  }

  const stats = computeProfileStats(profileId, tasks, ratings, "lifetime");
  const streak = computeCompletionStreak(tasks, profileId);
  const achievements = computeAchievements({ ...stats, streak });

  return (
    <div className={styles.wrapper}>
      <span className={styles.title}>Achievements</span>
      <div className={styles.grid}>
        {achievements.map((achievement) => (
          <div
            key={achievement.key}
            className={`${styles.badge} ${achievement.earned ? styles.badgeEarned : ""}`}
          >
            <span className={styles.icon}>{achievement.icon}</span>
            <span className={styles.label}>{achievement.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
