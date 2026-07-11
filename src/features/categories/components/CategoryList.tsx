"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { useState } from "react";
import { useCategories } from "../hooks/useCategories";
import { createCategory, deleteCategory, reorderCategories, updateCategory } from "../services/categories";
import { CategoryForm } from "./CategoryForm";
import { CategoryListItem } from "./CategoryListItem";
import styles from "./CategoryList.module.css";

export function CategoryList() {
  const { categories, setCategories, isLoading, reload } = useCategories();
  const [isCreating, setIsCreating] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  if (isLoading || categories === null) {
    return null;
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !categories) return;

    const oldIndex = categories.findIndex((category) => category.id === active.id);
    const newIndex = categories.findIndex((category) => category.id === over.id);
    const newOrder = arrayMove(categories, oldIndex, newIndex);

    setCategories(newOrder);
    await reorderCategories(newOrder.map((category) => category.id));
  }

  return (
    <div className={styles.list}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={categories.map((category) => category.id)}
          strategy={verticalListSortingStrategy}
        >
          {categories.map((category) => (
            <CategoryListItem
              key={category.id}
              category={category}
              onUpdate={async (id, values) => {
                await updateCategory(id, values);
                await reload();
              }}
              onDelete={async (id) => {
                await deleteCategory(id);
                await reload();
              }}
            />
          ))}
        </SortableContext>
      </DndContext>

      {isCreating ? (
        <CategoryForm
          onSubmit={async (values) => {
            await createCategory({ ...values, sortOrder: categories.length });
            await reload();
            setIsCreating(false);
          }}
          onCancel={() => setIsCreating(false)}
        />
      ) : (
        <button className={styles.addButton} onClick={() => setIsCreating(true)}>
          + Neue Kategorie
        </button>
      )}
    </div>
  );
}
