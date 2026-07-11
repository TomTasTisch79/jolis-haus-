"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "jolis-haus:profile-id";

export function useCurrentProfileId() {
  const [profileId, setProfileIdState] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setProfileIdState(localStorage.getItem(STORAGE_KEY));
    setIsLoaded(true);
  }, []);

  const setProfileId = useCallback((id: string) => {
    localStorage.setItem(STORAGE_KEY, id);
    setProfileIdState(id);
  }, []);

  return { profileId, setProfileId, isLoaded };
}
