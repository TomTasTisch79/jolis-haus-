"use client";

import { useMemo, useState } from "react";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { useProfiles } from "@/features/auth/hooks/useProfiles";
import { useCurrentProfileId } from "@/features/auth/hooks/useCurrentProfileId";
import { useTasks } from "../hooks/useTasks";
import { createTask, deleteTask, updateTask } from "../services/tasks";
import type { Task, TaskInput } from "../types";
import { TaskForm } from "./TaskForm";
import { TaskListItem } from "./TaskListItem";
import styles from "./TaskList.module.css";

type StatusFilter = "open" | "completed" | "all";

export function TaskList() {
  const { tasks, isLoading, reload } = useTasks();
  const { categories } = useCategories();
  const { profiles } = useProfiles();
  const { profileId: currentProfileId } = useCurrentProfileId();

  const [categoryFilter, setCategoryFilter] = useState("");
  const [profileFilter, setProfileFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("open");
  const [isCreating, setIsCreating] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const categoryById = useMemo(
    () => new Map(categories?.map((category) => [category.id, category])),
    [categories]
  );
  const profileById = useMemo(
    () => new Map(profiles?.map((profile) => [profile.id, profile])),
    [profiles]
  );

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks.filter((task) => {
      if (categoryFilter && task.category_id !== categoryFilter) return false;
      if (profileFilter && task.assigned_profile_id !== profileFilter) return false;
      if (statusFilter === "open" && task.completed_at) return false;
      if (statusFilter === "completed" && !task.completed_at) return false;
      return true;
    });
  }, [tasks, categoryFilter, profileFilter, statusFilter]);

  if (isLoading || tasks === null) {
    return null;
  }

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

  return (
    <div className={styles.wrapper}>
      <div className={styles.filters}>
        <select
          className={styles.filterSelect}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">Alle Kategorien</option>
          {categories?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.icon} {category.name}
            </option>
          ))}
        </select>
        <select
          className={styles.filterSelect}
          value={profileFilter}
          onChange={(e) => setProfileFilter(e.target.value)}
        >
          <option value="">Alle Personen</option>
          {profiles?.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {profile.username}
            </option>
          ))}
        </select>
        <select
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
        >
          <option value="open">Offen</option>
          <option value="completed">Erledigt</option>
          <option value="all">Alle</option>
        </select>
      </div>

      <div className={styles.list}>
        {filteredTasks.length === 0 && <p className={styles.empty}>Keine Aufgaben gefunden.</p>}
        {filteredTasks.map((task) => (
          <TaskListItem
            key={task.id}
            task={task}
            category={task.category_id ? categoryById.get(task.category_id) : undefined}
            profile={task.assigned_profile_id ? profileById.get(task.assigned_profile_id) : undefined}
            onClick={() => setEditingTask(task)}
          />
        ))}
      </div>

      <button className={styles.addButton} onClick={() => setIsCreating(true)}>
        + Neue Aufgabe
      </button>

      {isCreating && (
        <div className={styles.overlay} onClick={() => setIsCreating(false)}>
          <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
            <TaskForm
              initial={
                currentProfileId
                  ? {
                      title: "",
                      description: "",
                      categoryId: null,
                      size: "small",
                      dueDate: null,
                      recurrenceRule: null,
                      assignedProfileId: currentProfileId,
                    }
                  : undefined
              }
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
                assignedProfileId: editingTask.assigned_profile_id ?? "",
              }}
              onSubmit={(values) => handleUpdate(editingTask.id, values)}
              onCancel={() => setEditingTask(null)}
            />
            <button
              className={styles.addButton}
              style={{ marginTop: "var(--space-2)", borderColor: "var(--color-danger)", color: "var(--color-danger)" }}
              onClick={() => handleDelete(editingTask.id)}
            >
              Aufgabe löschen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
