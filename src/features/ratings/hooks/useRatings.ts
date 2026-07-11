"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchRatings } from "../services/ratings";
import type { Rating } from "../types";

export function useRatings() {
  const [ratings, setRatings] = useState<Rating[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchRatings();
    setRatings(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { ratings, isLoading, reload };
}
