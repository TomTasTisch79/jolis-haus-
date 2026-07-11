import { CategoryList } from "@/features/categories/components/CategoryList";
import { RefreshButton } from "@/components/RefreshButton";
import styles from "./page.module.css";

export default function CategoriesSettingsPage() {
  return (
    <main className={styles.page}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Kategorien</h1>
        <RefreshButton />
      </div>
      <CategoryList />
    </main>
  );
}
