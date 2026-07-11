"use client";

import type { Category } from "@/features/categories/types";
import type { Profile } from "@/features/auth/types";
import type { Rating, RatingValue } from "@/features/ratings/types";
import { SIZE_POINTS } from "@/lib/points";
import type { Task } from "../types";
import styles from "./TaskListItem.module.css";

type TaskListItemProps = {
  task: Task;
  category?: Category;
  profile?: Profile;
  rating?: Rating;
  currentProfileId: string | null;
  onEdit: () => void;
  onComplete: () => void;
  onRate: (rating: RatingValue) => void;
};

function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  const today = new Date().toISOString().slice(0, 10);
  return dueDate < today;
}

export function TaskListItem({
  task,
  category,
  profile,
  rating,
  currentProfileId,
  onEdit,
  onComplete,
  onRate,
}: TaskListItemProps) {
  const overdue = !task.completed_at && isOverdue(task.due_date);
  const canRate = task.completed_at && !rating && task.completed_by !== currentProfileId;
  const waitingForRating = task.completed_at && !rating && task.completed_by === currentProfileId;

  return (
    <div className={styles.item}>
      <span
        className={styles.avatar}
        style={{ background: profile?.color ?? "var(--color-accent)" }}
      >
        {profile?.username?.[0] ?? "?"}
      </span>
      <span className={styles.content}>
        <button className={styles.titleButton} onClick={onEdit}>
          <span className={styles.title}>{task.title}</span>
        </button>
        <span className={styles.meta}>
          {category && (
            <span>
              {category.icon} {category.name}
            </span>
          )}
          {task.due_date && (
            <span className={overdue ? styles.overdue : undefined}>
              {overdue ? "Überfällig: " : "Fällig: "}
              {task.due_date}
            </span>
          )}
          <span className={styles.points}>{SIZE_POINTS[task.size]} Punkte</span>
          {task.missed_penalty_points < 0 && (
            <span className={styles.overdue}>{task.missed_penalty_points} Punkte</span>
          )}
        </span>

        <span className={styles.actions}>
          {!task.completed_at && (
            <button className={styles.completeButton} onClick={onComplete}>
              Erledigt
            </button>
          )}
          {canRate && (
            <>
              <button className={styles.goodButton} onClick={() => onRate("good")}>
                Gut
              </button>
              <button className={styles.badButton} onClick={() => onRate("bad")}>
                Schlecht
              </button>
            </>
          )}
          {waitingForRating && <span className={styles.waitingText}>Wartet auf Bewertung</span>}
          {rating && (
            <span className={styles.ratingBadge}>
              {rating.rating === "good" ? "👍" : "👎"} {rating.points_awarded} Punkte
            </span>
          )}
        </span>
      </span>
    </div>
  );
}
