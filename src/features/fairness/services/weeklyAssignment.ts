import { supabase } from "@/lib/supabase/client";
import { addDays, toISODate } from "@/lib/date";
import { SIZE_POINTS, type TaskSize } from "@/lib/points";
import { assignPoolTasks } from "../logic/assignPool";
import { getWeekEnd } from "../logic/week";
import type { AssignmentPreview } from "../types";

export async function fetchPlannedWeekStartDates(): Promise<string[]> {
  const { data, error } = await supabase.from("weekly_assignments").select("week_start_date");
  if (error) throw error;
  return (data ?? []).map((week) => week.week_start_date);
}

export async function computeWeeklyAssignmentPreview(
  profileIds: [string, string],
  weekStartDate: string
): Promise<AssignmentPreview> {
  const weekEndDate = getWeekEnd(weekStartDate);

  const { data: fixedTasks, error: fixedError } = await supabase
    .from("tasks")
    .select("assigned_profile_id, size")
    .eq("is_random_pool", false)
    .gte("due_date", weekStartDate)
    .lte("due_date", weekEndDate);
  if (fixedError) throw fixedError;

  const { data: poolTasks, error: poolError } = await supabase
    .from("tasks")
    .select("id, title, size, sunday_allowed")
    .eq("is_random_pool", true)
    .is("assigned_profile_id", null)
    .is("completed_at", null);
  if (poolError) throw poolError;

  const fixedPointsByProfile: Record<string, number> = {};
  const fixedCountByProfile: Record<string, number> = {};
  for (const id of profileIds) {
    fixedPointsByProfile[id] = 0;
    fixedCountByProfile[id] = 0;
  }
  for (const task of fixedTasks ?? []) {
    if (task.assigned_profile_id && task.assigned_profile_id in fixedPointsByProfile) {
      fixedPointsByProfile[task.assigned_profile_id] += SIZE_POINTS[task.size as TaskSize];
      fixedCountByProfile[task.assigned_profile_id] += 1;
    }
  }

  const assignment = assignPoolTasks({
    profileIds,
    fixedPointsByProfile,
    fixedCountByProfile,
    poolTasks: (poolTasks ?? []).map((task) => ({
      id: task.id,
      points: SIZE_POINTS[task.size as TaskSize],
    })),
  });

  // Spread same-week tasks across the week's days instead of piling them
  // all onto the last one. Tasks marked "not on Sunday" (e.g. loud chores
  // like vacuuming) cycle through Monday-Saturday only.
  const weekStart = new Date(`${weekStartDate}T00:00:00`);
  const anyDayOffsets = [0, 1, 2, 3, 4, 5, 6];
  const noSundayOffsets = [0, 1, 2, 3, 4, 5];
  let anyDayIndex = 0;
  let noSundayIndex = 0;

  const items = (poolTasks ?? []).map((task) => {
    const sundayAllowed = task.sunday_allowed ?? true;
    const offset = sundayAllowed
      ? anyDayOffsets[anyDayIndex++ % anyDayOffsets.length]
      : noSundayOffsets[noSundayIndex++ % noSundayOffsets.length];

    return {
      taskId: task.id,
      title: task.title,
      size: task.size as TaskSize,
      points: SIZE_POINTS[task.size as TaskSize],
      assignedProfileId: assignment[task.id],
      dueDate: toISODate(addDays(weekStart, offset)),
    };
  });

  return { weekStartDate, weekEndDate, items };
}

export async function commitWeeklyAssignment(
  preview: AssignmentPreview,
  createdBy: string
): Promise<void> {
  await Promise.all(
    preview.items.map((item) =>
      supabase
        .from("tasks")
        .update({ assigned_profile_id: item.assignedProfileId, due_date: item.dueDate })
        .eq("id", item.taskId)
    )
  );

  const { error } = await supabase
    .from("weekly_assignments")
    .insert({ week_start_date: preview.weekStartDate, created_by: createdBy });

  if (error) throw error;
}
