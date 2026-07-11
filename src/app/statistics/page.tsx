import { StatisticsView } from "@/features/statistics/components/StatisticsView";
import { RefreshButton } from "@/components/RefreshButton";
import styles from "./page.module.css";

export default function StatisticsPage() {
  return (
    <main className={styles.page}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Statistik</h1>
        <RefreshButton />
      </div>
      <StatisticsView />
    </main>
  );
}
