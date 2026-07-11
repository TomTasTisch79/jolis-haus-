import { CategoryList } from "@/features/categories/components/CategoryList";
import styles from "./page.module.css";

export default function CategoriesSettingsPage() {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Kategorien</h1>
      <CategoryList />
    </main>
  );
}
