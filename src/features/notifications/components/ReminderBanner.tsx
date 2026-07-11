"use client";

import { useState } from "react";
import { useAllTasks } from "@/features/tasks/hooks/useAllTasks";
import { usePlannedWeeks } from "../hooks/usePlannedWeeks";
import { computeReminders } from "../logic/reminders";
import styles from "./ReminderBanner.module.css";

type ReminderBannerProps = {
  profileId: string;
};

export function ReminderBanner({ profileId }: ReminderBannerProps) {
  const { tasks, isLoading: tasksLoading } = useAllTasks();
  const { plannedWeekStartDates, isLoading: weeksLoading } = usePlannedWeeks();
  const [dismissed, setDismissed] = useState<string[]>([]);

  if (tasksLoading || weeksLoading || !tasks || !plannedWeekStartDates) {
    return null;
  }

  const reminders = computeReminders(tasks, profileId, plannedWeekStartDates).filter(
    (reminder) => !dismissed.includes(reminder.key)
  );

  if (reminders.length === 0) {
    return null;
  }

  return (
    <div className={styles.wrapper} role="status" aria-live="polite">
      {reminders.map((reminder) => (
        <div key={reminder.key} className={styles.banner}>
          <span className={styles.message}>{reminder.message}</span>
          <button
            className={styles.dismiss}
            onClick={() => setDismissed((current) => [...current, reminder.key])}
            aria-label="Ausblenden"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
