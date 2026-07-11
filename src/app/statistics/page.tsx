import { StatisticsView } from "@/features/statistics/components/StatisticsView";
import styles from "./page.module.css";

export default function StatisticsPage() {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Statistik</h1>
      <StatisticsView />
    </main>
  );
}
