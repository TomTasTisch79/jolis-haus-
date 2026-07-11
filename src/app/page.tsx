import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Jolis Haus</h1>
      <p className={styles.subtitle}>Projekt-Setup läuft.</p>
    </main>
  );
}
