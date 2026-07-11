"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchPoolTasks } from "../services/tasks";
import type { Task } from "../types";

export function usePoolTasks() {
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchPoolTasks();
    setTasks(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { tasks, isLoading, reload };
}
