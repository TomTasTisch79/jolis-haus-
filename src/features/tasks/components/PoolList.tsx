"use client";

import { useMemo, useState } from "react";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { useProfiles } from "@/features/auth/hooks/useProfiles";
import { useCurrentProfileId } from "@/features/auth/hooks/useCurrentProfileId";
import { useRatings } from "@/features/ratings/hooks/useRatings";
import { rateTask } from "@/features/ratings/services/ratings";
import type { RatingValue } from "@/features/ratings/types";
import {
  computeWeeklyAssignmentPreview,
  commitWeeklyAssignment,
  fetchPlannedWeekStartDates,
} from "@/features/fairness/services/weeklyAssignment";
import { getUpcomingMondays } from "@/features/fairness/logic/week";
import type { AssignmentPreview } from "@/features/fairness/types";
import { usePoolTasks } from "../hooks/usePoolTasks";
import { completeTask, createTask, deleteTask, updateTask } from "../services/tasks";
import type { Task, TaskInput } from "../types";
import { TaskForm } from "./TaskForm";
import { TaskListItem } from "./TaskListItem";
import styles from "./PoolList.module.css";

type WeekOption = { date: string; isPlanned: boolean };

function formatWeekLabel(dateISO: string): string {
  const [, month, day] = dateISO.split("-");
  return `Mo, ${day}.${month}.`;
}

export function PoolList() {
  const { tasks, isLoading, reload } = usePoolTasks();
  const { categories } = useCategories();
  const { profiles } = useProfiles();
  const { profileId: currentProfileId } = useCurrentProfileId();
  const { ratings, reload: reloadRatings } = useRatings();

  const [isCreating, setIsCreating] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [weekOptions, setWeekOptions] = useState<WeekOption[] | null>(null);
  const [preview, setPreview] = useState<AssignmentPreview | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

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

  if (isLoading || tasks === null) {
    return null;
  }

  const unassigned = tasks.filter((task) => !task.assigned_profile_id && !task.completed_at);
  const assignedThisWeek = tasks.filter((task) => task.assigned_profile_id && !task.completed_at);
  const completed = tasks.filter((task) => task.completed_at);

  async function handleCreate(values: TaskInput) {
    await createTask(values, currentProfileId ?? "");
    await reload();
    setIsCreating(false);
  }

  async function handleUpdate(id: string, values: TaskInput) {
    await updateTask(id, values);
    await reload();
    setEditingTask(null);
  }

  async function handleDelete(id: string) {
    await deleteTask(id);
    await reload();
    setEditingTask(null);
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

  async function handleOpenWeekPicker() {
    const planned = await fetchPlannedWeekStartDates();
    const plannedSet = new Set(planned);
    const mondays = getUpcomingMondays(8);
    setWeekOptions(mondays.map((date) => ({ date, isPlanned: plannedSet.has(date) })));
  }

  async function handleSelectWeek(date: string) {
    if (!profiles || profiles.length !== 2) return;
    setWeekOptions(null);
    const nextPreview = await computeWeeklyAssignmentPreview(
      [profiles[0].id, profiles[1].id],
      date
    );
    setPreview(nextPreview);
  }

  async function handleConfirmAssignment() {
    if (!preview || !currentProfileId) return;
    setIsAssigning(true);
    await commitWeeklyAssignment(preview, currentProfileId);
    await reload();
    setIsAssigning(false);
    setPreview(null);
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
        onEdit={() => setEditingTask(task)}
        onComplete={() => handleComplete(task)}
        onRate={(rating) => handleRate(task, rating)}
      />
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.section}>
        <span className={styles.sectionTitle}>Unzugewiesen im Pool</span>
        {unassigned.length === 0 && <p className={styles.empty}>Keine offenen Pool-Aufgaben.</p>}
        {unassigned.map(renderTask)}
      </div>

      <button className={styles.assignButton} onClick={handleOpenWeekPicker}>
        Neue Woche zuweisen
      </button>

      {assignedThisWeek.length > 0 && (
        <div className={styles.section}>
          <span className={styles.sectionTitle}>Diese Woche zugewiesen</span>
          {assignedThisWeek.map(renderTask)}
        </div>
      )}

      {completed.length > 0 && (
        <div className={styles.section}>
          <span className={styles.sectionTitle}>Erledigt</span>
          {completed.map(renderTask)}
        </div>
      )}

      <button className={styles.addButton} onClick={() => setIsCreating(true)}>
        + Neue Pool-Aufgabe
      </button>

      {isCreating && (
        <div className={styles.overlay} onClick={() => setIsCreating(false)}>
          <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
            <TaskForm
              initial={{
                title: "",
                description: "",
                categoryId: null,
                size: "small",
                dueDate: null,
                recurrenceRule: null,
                assignedProfileId: null,
                isRandomPool: true,
              }}
              onSubmit={handleCreate}
              onCancel={() => setIsCreating(false)}
            />
          </div>
        </div>
      )}

      {editingTask && (
        <div className={styles.overlay} onClick={() => setEditingTask(null)}>
          <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
            <TaskForm
              initial={{
                title: editingTask.title,
                description: editingTask.description ?? "",
                categoryId: editingTask.category_id,
                size: editingTask.size,
                dueDate: editingTask.due_date,
                recurrenceRule: editingTask.recurrence_rule,
                assignedProfileId: editingTask.assigned_profile_id,
                isRandomPool: editingTask.is_random_pool,
              }}
              onSubmit={(values) => handleUpdate(editingTask.id, values)}
              onCancel={() => setEditingTask(null)}
            />
            <button
              className={styles.addButton}
              style={{ borderColor: "var(--color-danger)", color: "var(--color-danger)" }}
              onClick={() => handleDelete(editingTask.id)}
            >
              Aufgabe löschen
            </button>
          </div>
        </div>
      )}

      {weekOptions && (
        <div className={styles.overlay} onClick={() => setWeekOptions(null)}>
          <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.previewTitle}>Woche wählen</h2>
            <p className={styles.previewMeta}>
              Ab welchem Montag soll die Zuweisung starten?
            </p>
            <div className={styles.weekOptionList}>
              {weekOptions.map((option) => (
                <button
                  key={option.date}
                  className={styles.weekOptionButton}
                  disabled={option.isPlanned}
                  onClick={() => handleSelectWeek(option.date)}
                >
                  <span>{formatWeekLabel(option.date)}</span>
                  {option.isPlanned && (
                    <span className={styles.weekOptionBadge}>bereits geplant</span>
                  )}
                </button>
              ))}
            </div>
            <div className={styles.previewActions}>
              <button className={styles.cancelButton} onClick={() => setWeekOptions(null)}>
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}

      {preview && (
        <div className={styles.overlay} onClick={() => setPreview(null)}>
          <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.previewTitle}>Woche ab {preview.weekStartDate}</h2>
            <p className={styles.previewMeta}>
              {preview.items.length === 0
                ? "Keine offenen Pool-Aufgaben zum Zuweisen."
                : `${preview.items.length} Aufgabe(n) werden zugewiesen:`}
            </p>
            {preview.items.map((item) => (
              <div key={item.taskId} className={styles.previewItem}>
                <span>{item.title}</span>
                <span>{profileById.get(item.assignedProfileId)?.username}</span>
              </div>
            ))}
            <div className={styles.previewActions}>
              <button className={styles.cancelButton} onClick={() => setPreview(null)}>
                Abbrechen
              </button>
              <button
                className={styles.confirmButton}
                disabled={preview.items.length === 0 || isAssigning}
                onClick={handleConfirmAssignment}
              >
                Bestätigen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
