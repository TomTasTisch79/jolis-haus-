import { supabase } from "@/lib/supabase/client";
import { calculateRatingPoints, type TaskSize } from "@/lib/points";
import type { Rating, RatingValue } from "../types";

export async function fetchRatings(): Promise<Rating[]> {
  const { data, error } = await supabase.from("ratings").select("*");
  if (error) throw error;
  return data;
}

export async function rateTask(
  taskId: string,
  size: TaskSize,
  rating: RatingValue,
  ratedBy: string
): Promise<Rating> {
  const pointsAwarded = calculateRatingPoints(size, rating);

  const { data, error } = await supabase
    .from("ratings")
    .insert({ task_id: taskId, rated_by: ratedBy, rating, points_awarded: pointsAwarded })
    .select()
    .single();

  if (error) throw error;
  return data;
}
