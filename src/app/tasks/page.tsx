import { TaskList } from "@/features/tasks/components/TaskList";
import styles from "./page.module.css";

export default function TasksPage() {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Aufgaben</h1>
      <TaskList />
    </main>
  );
}
