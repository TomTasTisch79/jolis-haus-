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
