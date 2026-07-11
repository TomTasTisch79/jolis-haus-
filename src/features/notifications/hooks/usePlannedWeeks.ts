"use client";

import { useEffect, useState } from "react";
import { fetchPlannedWeekStartDates } from "@/features/fairness/services/weeklyAssignment";

export function usePlannedWeeks() {
  const [plannedWeekStartDates, setPlannedWeekStartDates] = useState<string[] | null>(null);

  useEffect(() => {
    fetchPlannedWeekStartDates().then(setPlannedWeekStartDates);
  }, []);

  return { plannedWeekStartDates, isLoading: plannedWeekStartDates === null };
}
