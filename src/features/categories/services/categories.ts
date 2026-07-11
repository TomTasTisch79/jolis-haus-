import { supabase } from "@/lib/supabase/client";
import type { Category, CategoryInput } from "../types";

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data;
}

export async function createCategory(
  input: CategoryInput & { sortOrder: number }
): Promise<Category> {
  const { data, error } = await supabase
    .from("categories")
    .insert({
      name: input.name,
      icon: input.icon,
      color: input.color,
      sort_order: input.sortOrder,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCategory(id: string, input: CategoryInput): Promise<void> {
  const { error } = await supabase
    .from("categories")
    .update({ name: input.name, icon: input.icon, color: input.color })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}

export async function reorderCategories(orderedIds: string[]): Promise<void> {
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("categories").update({ sort_order: index }).eq("id", id)
    )
  );
}
