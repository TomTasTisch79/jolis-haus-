"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchProfiles } from "../services/profiles";
import type { Profile } from "../types";

export function useProfiles() {
  const [profiles, setProfiles] = useState<Profile[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchProfiles();
    setProfiles(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { profiles, isLoading, reload };
}
