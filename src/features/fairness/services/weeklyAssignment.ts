import { supabase } from "@/lib/supabase/client";
import { SIZE_POINTS, type TaskSize } from "@/lib/points";
import { assignPoolTasks } from "../logic/assignPool";
import { getNextUnplannedWeekStart, getWeekEnd } from "../logic/week";
import type { AssignmentPreview } from "../types";

export async function computeWeeklyAssignmentPreview(
  profileIds: [string, string]
): Promise<AssignmentPreview> {
  const { data: existingWeeks, error: weeksError } = await supabase
    .from("weekly_assignments")
    .select("week_start_date");
  if (weeksError) throw weeksError;

  const weekStartDate = getNextUnplannedWeekStart(
    (existingWeeks ?? []).map((week) => week.week_start_date)
  );
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
    .select("id, title, size")
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

  const items = (poolTasks ?? []).map((task) => ({
    taskId: task.id,
    title: task.title,
    size: task.size as TaskSize,
    points: SIZE_POINTS[task.size as TaskSize],
    assignedProfileId: assignment[task.id],
  }));

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
        .update({ assigned_profile_id: item.assignedProfileId, due_date: preview.weekEndDate })
        .eq("id", item.taskId)
    )
  );

  const { error } = await supabase
    .from("weekly_assignments")
    .insert({ week_start_date: preview.weekStartDate, created_by: createdBy });

  if (error) throw error;
}
