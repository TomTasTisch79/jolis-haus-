import { PoolList } from "@/features/tasks/components/PoolList";
import { RefreshButton } from "@/components/RefreshButton";
import styles from "./page.module.css";

export default function PoolPage() {
  return (
    <main className={styles.page}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Zufalls-Pool</h1>
        <RefreshButton />
      </div>
      <PoolList />
    </main>
  );
}
