"use client";

import { OnboardingScreen } from "@/features/auth/components/OnboardingScreen";
import { useCurrentProfileId } from "@/features/auth/hooks/useCurrentProfileId";
import styles from "./page.module.css";

export default function Home() {
  const { profileId, setProfileId, isLoaded } = useCurrentProfileId();

  if (!isLoaded) {
    return null;
  }

  if (!profileId) {
    return <OnboardingScreen onProfileSelected={setProfileId} />;
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Jolis Haus</h1>
      <p className={styles.subtitle}>Angemeldet.</p>
    </main>
  );
}
