import { supabase } from "@/lib/supabase/client";
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

export async function createTask(input: TaskInput, createdBy: string): Promise<Task> {
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      title: input.title,
      description: input.description || null,
      category_id: input.categoryId,
      size: input.size,
      due_date: input.dueDate,
      recurrence_rule: input.recurrenceRule,
      assigned_profile_id: input.assignedProfileId,
      is_random_pool: false,
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
      due_date: input.dueDate,
      recurrence_rule: input.recurrenceRule,
      assigned_profile_id: input.assignedProfileId,
    })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;
}
