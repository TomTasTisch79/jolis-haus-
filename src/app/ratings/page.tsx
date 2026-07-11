import { RatingsList } from "@/features/ratings/components/RatingsList";
import { RefreshButton } from "@/components/RefreshButton";
import styles from "./page.module.css";

export default function RatingsPage() {
  return (
    <main className={styles.page}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Bewertungen</h1>
        <RefreshButton />
      </div>
      <RatingsList />
    </main>
  );
}
