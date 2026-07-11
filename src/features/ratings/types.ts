import type { RatingValue } from "@/lib/points";

export type { RatingValue };

export type Rating = {
  id: string;
  task_id: string;
  rated_by: string | null;
  rating: RatingValue;
  points_awarded: number;
  created_at: string;
};
