"use client";

import { useMemo, useState } from "react";
import { useAllTasks } from "@/features/tasks/hooks/useAllTasks";
import { useRatings } from "@/features/ratings/hooks/useRatings";
import { useProfiles } from "@/features/auth/hooks/useProfiles";
import { computeProfileStats, computeWorkloadPercentages, type Period } from "../logic/stats";
import styles from "./StatisticsView.module.css";

const PERIOD_LABELS: Record<Period, string> = {
  week: "Woche",
  month: "Monat",
  lifetime: "Lifetime",
};

export function StatisticsView() {
  const { tasks, isLoading: tasksLoading } = useAllTasks();
  const { ratings, isLoading: ratingsLoading } = useRatings();
  const { profiles, isLoading: profilesLoading } = useProfiles();
  const [period, setPeriod] = useState<Period>("week");

  const workloadByProfile = useMemo(() => {
    if (!tasks || !profiles || profiles.length !== 2) return {};
    return computeWorkloadPercentages([profiles[0].id, profiles[1].id], tasks);
  }, [tasks, profiles]);

  const history = useMemo(() => {
    if (!tasks || !ratings) return [];
    const ratingByTaskId = new Map(ratings.map((rating) => [rating.task_id, rating]));
    return tasks
      .filter((task) => task.completed_at)
      .sort((a, b) => (b.completed_at! > a.completed_at! ? 1 : -1))
      .slice(0, 20)
      .map((task) => ({ task, rating: ratingByTaskId.get(task.id) }));
  }, [tasks, ratings]);

  if (tasksLoading || ratingsLoading || profilesLoading || !tasks || !ratings || !profiles) {
    return null;
  }

  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));

  return (
    <div className={styles.wrapper}>
      <div className={styles.segmented}>
        {(Object.keys(PERIOD_LABELS) as Period[]).map((option) => (
          <button
            key={option}
            className={`${styles.segmentButton} ${
              period === option ? styles.segmentButtonSelected : ""
            }`}
            onClick={() => setPeriod(option)}
          >
            {PERIOD_LABELS[option]}
          </button>
        ))}
      </div>

      <div className={styles.cards}>
        {profiles.map((profile) => {
          const stats = computeProfileStats(profile.id, tasks, ratings, period);
          const workload = workloadByProfile[profile.id] ?? 0;

          return (
            <div key={profile.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.avatar} style={{ background: profile.color ?? "var(--color-accent)" }}>
                  {profile.username[0]}
                </span>
                <span className={styles.name}>{profile.username}</span>
                <span className={styles.points}>{stats.points} Pkt</span>
              </div>

              <div className={styles.workloadBar}>
                <div
                  className={styles.workloadFill}
                  style={{ width: `${workload}%`, background: profile.color ?? "var(--color-accent)" }}
                />
              </div>

              <div className={styles.metrics}>
                <div className={styles.metric}>
                  <span className={styles.metricValue}>{stats.completedCount}</span>
                  <span className={styles.metricLabel}>Erledigt</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricValue}>{stats.missedCount}</span>
                  <span className={styles.metricLabel}>Verpasst (aktuell)</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricValue}>👍 {stats.goodRatings}</span>
                  <span className={styles.metricLabel}>Gut bewertet</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricValue}>👎 {stats.badRatings}</span>
                  <span className={styles.metricLabel}>Schlecht bewertet</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricValue}>{stats.currentTaskCount}</span>
                  <span className={styles.metricLabel}>Aktuelle Aufgaben</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricValue}>{workload}%</span>
                  <span className={styles.metricLabel}>Aktuelles Pensum</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <p className={styles.historyTitle}>Verlauf</p>
        <div className={styles.historyList}>
          {history.length === 0 && <p className={styles.empty}>Noch keine erledigten Aufgaben.</p>}
          {history.map(({ task, rating }) => (
            <div key={task.id} className={styles.historyItem}>
              <span
                className={styles.avatar}
                style={{
                  background: profileById.get(task.completed_by ?? "")?.color ?? "var(--color-accent)",
                }}
              >
                {profileById.get(task.completed_by ?? "")?.username?.[0] ?? "?"}
              </span>
              <span className={styles.historyContent}>
                <span className={styles.historyTitleText}>{task.title}</span>
                <span className={styles.historyMeta}>{task.completed_at?.slice(0, 10)}</span>
              </span>
              <span className={styles.historyPoints}>
                {rating ? (rating.rating === "good" ? "👍" : "👎") : "⏳"}{" "}
                {(rating?.points_awarded ?? 0) + task.missed_penalty_points} Pkt
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
