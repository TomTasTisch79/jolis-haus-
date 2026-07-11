export type TaskSize = "small" | "medium" | "large";

export const SIZE_POINTS: Record<TaskSize, number> = {
  small: 1,
  medium: 2,
  large: 3,
};

export const SIZE_LABELS: Record<TaskSize, string> = {
  small: "Klein",
  medium: "Mittel",
  large: "Groß",
};

export type RatingValue = "good" | "bad";

const BAD_RATING_POINTS: Record<TaskSize, number> = {
  small: -1,
  medium: 0,
  large: 1,
};

export function calculateRatingPoints(size: TaskSize, rating: RatingValue): number {
  return rating === "good" ? SIZE_POINTS[size] : BAD_RATING_POINTS[size];
}
