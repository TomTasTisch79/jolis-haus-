import { PoolList } from "@/features/tasks/components/PoolList";
import styles from "./page.module.css";

export default function PoolPage() {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Zufalls-Pool</h1>
      <PoolList />
    </main>
  );
}
