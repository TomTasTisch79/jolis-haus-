"use client";

import Link from "next/link";
import { OnboardingScreen } from "@/features/auth/components/OnboardingScreen";
import { useCurrentProfileId } from "@/features/auth/hooks/useCurrentProfileId";
import { MiniCalendar } from "@/features/calendar/components/MiniCalendar";
import { Leaderboard } from "@/features/gamification/components/Leaderboard";
import { AchievementsList } from "@/features/gamification/components/AchievementsList";
import { ReminderBanner } from "@/features/notifications/components/ReminderBanner";
import { usePendingRatings } from "@/features/ratings/hooks/usePendingRatings";
import styles from "./page.module.css";

export default function Home() {
  const { profileId, setProfileId, isLoaded } = useCurrentProfileId();
  const { pendingTasks } = usePendingRatings(profileId);

  if (!isLoaded) {
    return null;
  }

  if (!profileId) {
    return <OnboardingScreen onProfileSelected={setProfileId} />;
  }

  const pendingCount = pendingTasks.length;

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Jolis Haus</h1>

      <ReminderBanner profileId={profileId} />
      <MiniCalendar />
      <Leaderboard />
      <AchievementsList profileId={profileId} />

      <nav className={styles.nav}>
        <Link href="/tasks" className={styles.link}>
          Aufgaben
        </Link>
        <Link href="/pool" className={styles.link}>
          Zufalls-Pool
        </Link>
        <Link href="/ratings" className={pendingCount > 0 ? styles.link : styles.linkMuted}>
          Bewertungen{pendingCount > 0 ? ` (${pendingCount})` : ""}
        </Link>
        <Link href="/statistics" className={styles.link}>
          Statistik
        </Link>
        <Link href="/settings/categories" className={styles.link}>
          Kategorien verwalten
        </Link>
      </nav>
    </main>
  );
}
