import type { TaskSize } from "@/lib/points";

export type { TaskSize };

export type RecurrenceRule =
  | { type: "daily"; interval: number }
  | { type: "weekly"; interval: number }
  | { type: "monthly"; interval: number }
  | { type: "custom"; weekdays: number[] };

export type Task = {
  id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  size: TaskSize;
  due_date: string | null;
  recurrence_rule: RecurrenceRule | null;
  series_id: string | null;
  is_random_pool: boolean;
  assigned_profile_id: string | null;
  completed_at: string | null;
  completed_by: string | null;
  missed_penalty_points: number;
  created_by: string | null;
  created_at: string;
  sunday_allowed: boolean;
};

export type TaskInput = {
  title: string;
  description: string;
  categoryId: string | null;
  size: TaskSize;
  dueDate: string | null;
  recurrenceRule: RecurrenceRule | null;
  assignedProfileId: string | null;
  isRandomPool: boolean;
  sundayAllowed: boolean;
};

export const WEEKDAYS = [
  { value: 1, label: "Mo" },
  { value: 2, label: "Di" },
  { value: 3, label: "Mi" },
  { value: 4, label: "Do" },
  { value: 5, label: "Fr" },
  { value: 6, label: "Sa" },
  { value: 7, label: "So" },
] as const;
