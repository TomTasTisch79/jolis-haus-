"use client";

import { ProgressRing } from "@/components/ProgressRing";
import { useAllTasks } from "@/features/tasks/hooks/useAllTasks";
import { useRatings } from "@/features/ratings/hooks/useRatings";
import { useProfiles } from "@/features/auth/hooks/useProfiles";
import { computeProfileStats } from "@/features/statistics/logic/stats";
import { computeCompletionStreak } from "../logic/streak";
import styles from "./Leaderboard.module.css";

export function Leaderboard() {
  const { tasks, isLoading: tasksLoading } = useAllTasks();
  const { ratings, isLoading: ratingsLoading } = useRatings();
  const { profiles, isLoading: profilesLoading } = useProfiles();

  if (tasksLoading || ratingsLoading || profilesLoading || !tasks || !ratings || !profiles) {
    return null;
  }

  const pointsByProfile = new Map(
    profiles.map((profile) => [
      profile.id,
      computeProfileStats(profile.id, tasks, ratings, "lifetime").points,
    ])
  );
  const totalPoints = [...pointsByProfile.values()].reduce(
    (sum, points) => sum + Math.max(points, 0),
    0
  );

  return (
    <div className={styles.card}>
      <span className={styles.title}>Punktestand</span>
      {profiles.map((profile) => {
        const points = pointsByProfile.get(profile.id) ?? 0;
        const share = totalPoints > 0 ? (Math.max(points, 0) / totalPoints) * 100 : 50;
        const streak = computeCompletionStreak(tasks, profile.id);
        const color = profile.color ?? "var(--color-accent)";

        return (
          <div key={profile.id} className={styles.row}>
            <div className={styles.ringWrapper}>
              <ProgressRing percent={share} color={color} />
              <span className={styles.ringLabel} style={{ color }}>
                {profile.username[0]}
              </span>
            </div>
            <div className={styles.info}>
              <span className={styles.name}>{profile.username}</span>
              {streak > 0 && <span className={styles.streak}>🔥 {streak} Tage Serie</span>}
            </div>
            <span className={styles.points}>{points} Pkt</span>
          </div>
        );
      })}
    </div>
  );
}
