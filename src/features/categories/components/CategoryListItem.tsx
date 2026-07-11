"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import type { Category, CategoryInput } from "../types";
import { CategoryForm } from "./CategoryForm";
import styles from "./CategoryListItem.module.css";

type CategoryListItemProps = {
  category: Category;
  onUpdate: (id: string, values: CategoryInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export function CategoryListItem({ category, onUpdate, onDelete }: CategoryListItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (isEditing) {
    return (
      <div ref={setNodeRef} style={style}>
        <CategoryForm
          initial={{
            name: category.name,
            icon: category.icon ?? "",
            color: category.color ?? "#0A84FF",
          }}
          onSubmit={async (values) => {
            await onUpdate(category.id, values);
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} className={styles.item}>
      <button className={styles.dragHandle} {...attributes} {...listeners} aria-label="Verschieben">
        ⠿
      </button>
      <span className={styles.avatar} style={{ background: category.color ?? "var(--color-accent)" }}>
        {category.icon}
      </span>
      <button className={styles.name} onClick={() => setIsEditing(true)}>
        {category.name}
      </button>
      {confirmDelete ? (
        <span className={styles.confirmRow}>
          <button className={styles.confirmYes} onClick={() => onDelete(category.id)}>
            Löschen
          </button>
          <button className={styles.confirmNo} onClick={() => setConfirmDelete(false)}>
            Abbrechen
          </button>
        </span>
      ) : (
        <button
          className={styles.deleteButton}
          onClick={() => setConfirmDelete(true)}
          aria-label="Löschen"
        >
          🗑️
        </button>
      )}
    </div>
  );
}
