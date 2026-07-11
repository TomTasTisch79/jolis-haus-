"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchAllTasks } from "../services/tasks";
import type { Task } from "../types";

export function useAllTasks() {
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchAllTasks();
    setTasks(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { tasks, isLoading, reload };
}
