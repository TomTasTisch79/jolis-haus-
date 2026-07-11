"use client";

import { useState } from "react";
import { APPLE_SYSTEM_COLORS } from "@/lib/colors";
import type { CategoryInput } from "../types";
import styles from "./CategoryForm.module.css";

type CategoryFormProps = {
  initial?: CategoryInput;
  onSubmit: (values: CategoryInput) => Promise<void>;
  onCancel: () => void;
};

export function CategoryForm({ initial, onSubmit, onCancel }: CategoryFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? "🏷️");
  const [color, setColor] = useState<string>(initial?.color ?? APPLE_SYSTEM_COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    setIsSubmitting(true);
    await onSubmit({ name: trimmedName, icon, color });
    setIsSubmitting(false);
  }

  return (
    <div className={styles.form}>
      <div className={styles.row}>
        <input
          className={styles.iconInput}
          value={icon}
          onChange={(event) => setIcon(event.target.value)}
          maxLength={4}
          aria-label="Icon"
        />
        <input
          className={styles.nameInput}
          placeholder="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      <div className={styles.colorRow}>
        {APPLE_SYSTEM_COLORS.map((swatch) => (
          <button
            key={swatch}
            type="button"
            className={`${styles.swatch} ${swatch === color ? styles.swatchSelected : ""}`}
            style={{ background: swatch }}
            onClick={() => setColor(swatch)}
            aria-label={`Farbe ${swatch}`}
          />
        ))}
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.cancelButton} onClick={onCancel}>
          Abbrechen
        </button>
        <button
          type="button"
          className={styles.saveButton}
          disabled={!name.trim() || isSubmitting}
          onClick={handleSubmit}
        >
          Speichern
        </button>
      </div>
    </div>
  );
}
