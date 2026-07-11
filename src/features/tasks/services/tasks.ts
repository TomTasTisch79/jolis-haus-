import { supabase } from "@/lib/supabase/client";
import { computeMissedPenaltyPoints, computeNextDueDate } from "../logic/recurrence";
import type { Task, TaskInput } from "../types";

export async function fetchFixedTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("is_random_pool", false)
    .order("due_date", { ascending: true, nullsFirst: false });

  if (error) throw error;
  return data;
}

export async function fetchPoolTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("is_random_pool", true)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function fetchAllTasks(): Promise<Task[]> {
  const { data, error } = await supabase.from("tasks").select("*");
  if (error) throw error;
  return data;
}

export async function createTask(input: TaskInput, createdBy: string): Promise<Task> {
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      title: input.title,
      description: input.description || null,
      category_id: input.categoryId,
      size: input.size,
      due_date: input.isRandomPool ? null : input.dueDate,
      recurrence_rule: input.recurrenceRule,
      assigned_profile_id: input.isRandomPool ? null : input.assignedProfileId,
      is_random_pool: input.isRandomPool,
      created_by: createdBy,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTask(id: string, input: TaskInput): Promise<void> {
  const { error } = await supabase
    .from("tasks")
    .update({
      title: input.title,
      description: input.description || null,
      category_id: input.categoryId,
      size: input.size,
      due_date: input.isRandomPool ? null : input.dueDate,
      recurrence_rule: input.recurrenceRule,
      assigned_profile_id: input.isRandomPool ? null : input.assignedProfileId,
      is_random_pool: input.isRandomPool,
    })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;
}

export async function completeTask(task: Task, completedByProfileId: string): Promise<void> {
  const completedAt = new Date().toISOString();
  const missedPenaltyPoints = computeMissedPenaltyPoints(task.due_date, completedAt);
  const seriesId = task.recurrence_rule ? task.series_id ?? task.id : task.series_id;

  const { error } = await supabase
    .from("tasks")
    .update({
      completed_at: completedAt,
      completed_by: completedByProfileId,
      missed_penalty_points: missedPenaltyPoints,
      series_id: seriesId,
    })
    .eq("id", task.id);

  if (error) throw error;

  if (task.recurrence_rule) {
    // Recurring pool tasks return to the pool unassigned; the next weekly
    // fairness run picks them up and sets a fresh due date.
    const nextDueDate = task.is_random_pool
      ? null
      : computeNextDueDate(task.due_date ?? completedAt.slice(0, 10), task.recurrence_rule);

    const { error: insertError } = await supabase.from("tasks").insert({
      title: task.title,
      description: task.description,
      category_id: task.category_id,
      size: task.size,
      due_date: nextDueDate,
      recurrence_rule: task.recurrence_rule,
      series_id: seriesId,
      is_random_pool: task.is_random_pool,
      assigned_profile_id: task.is_random_pool ? null : task.assigned_profile_id,
      created_by: task.created_by,
    });

    if (insertError) throw insertError;
  }
}
