"use client";

import { useMemo, useState } from "react";
import { addDays, getMonday, toISODate } from "@/lib/date";
import { useAllTasks } from "@/features/tasks/hooks/useAllTasks";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { useProfiles } from "@/features/auth/hooks/useProfiles";
import type { Task } from "@/features/tasks/types";
import styles from "./MiniCalendar.module.css";

const WEEKDAY_LABELS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export function MiniCalendar() {
  const { tasks, isLoading: tasksLoading } = useAllTasks();
  const { categories } = useCategories();
  const { profiles } = useProfiles();
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));

  const todayISO = toISODate(new Date());
  const [selectedDate, setSelectedDate] = useState(todayISO);

  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => toISODate(addDays(weekStart, i))),
    [weekStart]
  );

  const categoryById = useMemo(
    () => new Map(categories?.map((category) => [category.id, category])),
    [categories]
  );
  const profileById = useMemo(
    () => new Map(profiles?.map((profile) => [profile.id, profile])),
    [profiles]
  );

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const task of tasks ?? []) {
      if (!task.due_date) continue;
      const list = map.get(task.due_date) ?? [];
      list.push(task);
      map.set(task.due_date, list);
    }
    return map;
  }, [tasks]);

  if (tasksLoading || !tasks) {
    return null;
  }

  const selectedTasks = tasksByDate.get(selectedDate) ?? [];

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <button
          className={styles.navButton}
          onClick={() => setWeekStart((current) => addDays(current, -7))}
          aria-label="Vorherige Woche"
        >
          ‹
        </button>
        <span className={styles.headerLabel}>Kalender</span>
        <button
          className={styles.navButton}
          onClick={() => setWeekStart((current) => addDays(current, 7))}
          aria-label="Nächste Woche"
        >
          ›
        </button>
      </div>

      <div className={styles.week}>
        {weekDates.map((date, index) => {
          const dayTasks = tasksByDate.get(date) ?? [];
          const isToday = date === todayISO;
          const isSelected = date === selectedDate;

          return (
            <button
              key={date}
              className={`${styles.day} ${isToday ? styles.today : ""} ${
                isSelected ? styles.selected : ""
              }`}
              onClick={() => setSelectedDate(date)}
            >
              <span className={styles.weekdayLabel}>{WEEKDAY_LABELS[index]}</span>
              <span className={styles.dayNumber}>{Number(date.slice(8, 10))}</span>
              <span className={styles.dots}>
                {dayTasks.slice(0, 3).map((task) => (
                  <span
                    key={task.id}
                    className={styles.dot}
                    style={{
                      background: task.assigned_profile_id
                        ? profileById.get(task.assigned_profile_id)?.color ?? "var(--color-accent)"
                        : "var(--color-text-tertiary)",
                      opacity: task.completed_at ? 0.4 : 1,
                    }}
                  />
                ))}
              </span>
            </button>
          );
        })}
      </div>

      <div className={styles.taskList}>
        {selectedTasks.length === 0 && (
          <p className={styles.empty}>Keine Aufgaben an diesem Tag.</p>
        )}
        {selectedTasks.map((task) => (
          <div key={task.id} className={styles.taskRow}>
            <span
              className={styles.taskDot}
              style={{
                background: task.assigned_profile_id
                  ? profileById.get(task.assigned_profile_id)?.color ?? "var(--color-accent)"
                  : "var(--color-text-tertiary)",
              }}
            />
            <span className={task.completed_at ? styles.taskTitleDone : styles.taskTitle}>
              {task.category_id ? categoryById.get(task.category_id)?.icon : ""} {task.title}
            </span>
            <span className={styles.taskProfile}>
              {task.assigned_profile_id
                ? profileById.get(task.assigned_profile_id)?.username
                : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
