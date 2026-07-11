import { TaskList } from "@/features/tasks/components/TaskList";
import { RefreshButton } from "@/components/RefreshButton";
import styles from "./page.module.css";

export default function TasksPage() {
  return (
    <main className={styles.page}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Aufgaben</h1>
        <RefreshButton />
      </div>
      <TaskList />
    </main>
  );
}
