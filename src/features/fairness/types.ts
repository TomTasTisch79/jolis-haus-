import type { TaskSize } from "@/lib/points";

export type AssignmentPreviewItem = {
  taskId: string;
  title: string;
  size: TaskSize;
  points: number;
  assignedProfileId: string;
  dueDate: string;
};

export type AssignmentPreview = {
  weekStartDate: string;
  weekEndDate: string;
  items: AssignmentPreviewItem[];
};
