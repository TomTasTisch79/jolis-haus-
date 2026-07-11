"use client";

import styles from "./RefreshButton.module.css";

export function RefreshButton() {
  return (
    <button
      type="button"
      className={styles.button}
      onClick={() => window.location.reload()}
      aria-label="Aktualisieren"
    >
      ↻
    </button>
  );
}
