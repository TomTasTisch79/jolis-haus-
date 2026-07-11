"use client";

import type { Category } from "@/features/categories/types";
import type { Profile } from "@/features/auth/types";
import { SIZE_POINTS } from "@/lib/points";
import type { Task } from "../types";
import styles from "./TaskListItem.module.css";

type TaskListItemProps = {
  task: Task;
  category?: Category;
  profile?: Profile;
  onClick: () => void;
};

function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  const today = new Date().toISOString().slice(0, 10);
  return dueDate < today;
}

export function TaskListItem({ task, category, profile, onClick }: TaskListItemProps) {
  const overdue = !task.completed_at && isOverdue(task.due_date);

  return (
    <button className={styles.item} onClick={onClick}>
      <span
        className={styles.avatar}
        style={{ background: profile?.color ?? "var(--color-accent)" }}
      >
        {profile?.username?.[0] ?? "?"}
      </span>
      <span className={styles.content}>
        <span className={styles.title}>{task.title}</span>
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
        </span>
      </span>
    </button>
  );
}
