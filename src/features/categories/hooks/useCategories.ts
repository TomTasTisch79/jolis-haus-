"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchCategories } from "../services/categories";
import type { Category } from "../types";

export function useCategories() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchCategories();
    setCategories(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { categories, setCategories, isLoading, reload };
}
