import { RatingsList } from "@/features/ratings/components/RatingsList";
import styles from "./page.module.css";

export default function RatingsPage() {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Bewertungen</h1>
      <RatingsList />
    </main>
  );
}
