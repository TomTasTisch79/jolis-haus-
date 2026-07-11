"use client";

import Link from "next/link";
import { OnboardingScreen } from "@/features/auth/components/OnboardingScreen";
import { useCurrentProfileId } from "@/features/auth/hooks/useCurrentProfileId";
import { MiniCalendar } from "@/features/calendar/components/MiniCalendar";
import { Leaderboard } from "@/features/gamification/components/Leaderboard";
import { AchievementsList } from "@/features/gamification/components/AchievementsList";
import { ReminderBanner } from "@/features/notifications/components/ReminderBanner";
import { OpenTasksCard } from "@/features/tasks/components/OpenTasksCard";
import { usePendingRatings } from "@/features/ratings/hooks/usePendingRatings";
import { RefreshButton } from "@/components/RefreshButton";
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
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Herzens App ❤️</h1>
        <RefreshButton />
      </div>

      <ReminderBanner profileId={profileId} />
      <OpenTasksCard />
      <MiniCalendar />
      <Leaderboard />
      <AchievementsList profileId={profileId} />

      <nav className={styles.navGrid}>
        <Link href="/tasks" className={styles.navCard}>
          <span className={styles.navIcon}>📋</span>
          <span className={styles.navLabel}>Aufgaben</span>
        </Link>
        <Link href="/pool" className={styles.navCard}>
          <span className={styles.navIcon}>🎲</span>
          <span className={styles.navLabel}>Zufalls-Pool</span>
        </Link>
        <Link
          href="/ratings"
          className={pendingCount > 0 ? styles.navCard : `${styles.navCard} ${styles.navCardMuted}`}
        >
          <span className={styles.navIcon}>⭐</span>
          <span className={styles.navLabel}>
            Bewertungen{pendingCount > 0 ? ` (${pendingCount})` : ""}
          </span>
        </Link>
        <Link href="/statistics" className={styles.navCard}>
          <span className={styles.navIcon}>📊</span>
          <span className={styles.navLabel}>Statistik</span>
        </Link>
        <Link href="/settings/categories" className={`${styles.navCard} ${styles.navCardWide}`}>
          <span className={styles.navIcon}>🏷️</span>
          <span className={styles.navLabel}>Kategorien verwalten</span>
        </Link>
      </nav>
    </main>
  );
}
