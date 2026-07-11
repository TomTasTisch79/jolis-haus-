import { supabase } from "@/lib/supabase/client";
import type { Profile } from "../types";

export async function fetchProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function createProfile(username: string, color: string): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .insert({ username, color })
    .select()
    .single();

  if (error) throw error;
  return data;
}
