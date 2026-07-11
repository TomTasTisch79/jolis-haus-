"use client";

import { useMemo } from "react";
import { useAllTasks } from "@/features/tasks/hooks/useAllTasks";
import { useRatings } from "./useRatings";
import { getPendingRatingTasks } from "../logic/pending";

export function usePendingRatings(profileId: string | null) {
  const { tasks, isLoading: tasksLoading, reload: reloadTasks } = useAllTasks();
  const { ratings, isLoading: ratingsLoading, reload: reloadRatings } = useRatings();

  const pendingTasks = useMemo(() => {
    if (!tasks || !ratings || !profileId) return [];
    return getPendingRatingTasks(tasks, ratings, profileId);
  }, [tasks, ratings, profileId]);

  return {
    pendingTasks,
    isLoading: tasksLoading || ratingsLoading,
    reload: async () => {
      await Promise.all([reloadTasks(), reloadRatings()]);
    },
  };
}
