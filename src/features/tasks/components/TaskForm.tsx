"use client";

import { useId, useState } from "react";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { useProfiles } from "@/features/auth/hooks/useProfiles";
import { SIZE_LABELS, SIZE_POINTS } from "@/lib/points";
import type { RecurrenceRule, TaskInput, TaskSize } from "../types";
import { WEEKDAYS } from "../types";
import styles from "./TaskForm.module.css";

type RecurrenceType = "none" | "daily" | "weekly" | "monthly" | "custom";

type TaskFormProps = {
  initial?: TaskInput;
  onSubmit: (values: TaskInput) => Promise<void>;
  onCancel: () => void;
};

function ruleToType(rule: RecurrenceRule | null): RecurrenceType {
  return rule?.type ?? "none";
}

export function TaskForm({ initial, onSubmit, onCancel }: TaskFormProps) {
  const { categories } = useCategories();
  const { profiles } = useProfiles();
  const formId = useId();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [size, setSize] = useState<TaskSize>(initial?.size ?? "small");
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? "");
  const [assignedProfileId, setAssignedProfileId] = useState(initial?.assignedProfileId ?? "");
  const [isRandomPool, setIsRandomPool] = useState(initial?.isRandomPool ?? false);
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>(
    ruleToType(initial?.recurrenceRule ?? null)
  );
  const [interval, setInterval] = useState(
    initial?.recurrenceRule && "interval" in initial.recurrenceRule
      ? initial.recurrenceRule.interval
      : 1
  );
  const [weekdays, setWeekdays] = useState<number[]>(
    initial?.recurrenceRule?.type === "custom" ? initial.recurrenceRule.weekdays : []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  function toggleWeekday(value: number) {
    setWeekdays((current) =>
      current.includes(value) ? current.filter((day) => day !== value) : [...current, value]
    );
  }

  function buildRecurrenceRule(): RecurrenceRule | null {
    if (recurrenceType === "none") return null;
    if (recurrenceType === "custom") return { type: "custom", weekdays };
    return { type: recurrenceType, interval };
  }

  async function handleSubmit() {
    const trimmedTitle = title.trim();
    if (!trimmedTitle || (!isRandomPool && !assignedProfileId)) return;

    setIsSubmitting(true);
    await onSubmit({
      title: trimmedTitle,
      description,
      categoryId: categoryId || null,
      size,
      dueDate: dueDate || null,
      recurrenceRule: buildRecurrenceRule(),
      assignedProfileId: isRandomPool ? null : assignedProfileId,
      isRandomPool,
    });
    setIsSubmitting(false);
  }

  const canSubmit = title.trim() && (isRandomPool || assignedProfileId) && !isSubmitting;

  return (
    <div className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${formId}-title`}>
          Titel
        </label>
        <input
          id={`${formId}-title`}
          className={styles.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${formId}-description`}>
          Beschreibung
        </label>
        <textarea
          id={`${formId}-description`}
          className={styles.textarea}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${formId}-category`}>
          Kategorie
        </label>
        <select
          id={`${formId}-category`}
          className={styles.select}
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">Keine</option>
          {categories?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.icon} {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <span className={styles.label} id={`${formId}-size-label`}>
          Größe
        </span>
        <div className={styles.segmented} role="group" aria-labelledby={`${formId}-size-label`}>
          {(Object.keys(SIZE_POINTS) as TaskSize[]).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={size === option}
              className={`${styles.segmentButton} ${
                size === option ? styles.segmentButtonSelected : ""
              }`}
              onClick={() => setSize(option)}
            >
              {SIZE_LABELS[option]} ({SIZE_POINTS[option]})
            </button>
          ))}
        </div>
      </div>

      <div className={styles.field}>
        <span className={styles.label} id={`${formId}-assignment-label`}>
          Zuweisung
        </span>
        <div
          className={styles.segmented}
          role="group"
          aria-labelledby={`${formId}-assignment-label`}
        >
          <button
            type="button"
            aria-pressed={!isRandomPool}
            className={`${styles.segmentButton} ${!isRandomPool ? styles.segmentButtonSelected : ""}`}
            onClick={() => setIsRandomPool(false)}
          >
            Fest zugewiesen
          </button>
          <button
            type="button"
            aria-pressed={isRandomPool}
            className={`${styles.segmentButton} ${isRandomPool ? styles.segmentButtonSelected : ""}`}
            onClick={() => setIsRandomPool(true)}
          >
            In Zufalls-Pool
          </button>
        </div>
      </div>

      {!isRandomPool && (
        <>
          <div className={styles.field}>
            <label className={styles.label} htmlFor={`${formId}-due-date`}>
              Fälligkeit
            </label>
            <input
              id={`${formId}-due-date`}
              type="date"
              className={styles.input}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor={`${formId}-assigned-profile`}>
              Zugewiesen an
            </label>
            <select
              id={`${formId}-assigned-profile`}
              className={styles.select}
              value={assignedProfileId ?? ""}
              onChange={(e) => setAssignedProfileId(e.target.value)}
            >
              <option value="">Bitte wählen</option>
              {profiles?.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.username}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${formId}-recurrence`}>
          Wiederholung
        </label>
        <select
          id={`${formId}-recurrence`}
          className={styles.select}
          value={recurrenceType}
          onChange={(e) => setRecurrenceType(e.target.value as RecurrenceType)}
        >
          <option value="none">Keine</option>
          <option value="daily">Täglich</option>
          <option value="weekly">Wöchentlich</option>
          <option value="monthly">Monatlich</option>
          <option value="custom">Bestimmte Wochentage</option>
        </select>
      </div>

      {(recurrenceType === "daily" ||
        recurrenceType === "weekly" ||
        recurrenceType === "monthly") && (
        <div className={styles.intervalRow}>
          <span className={styles.intervalLabel} id={`${formId}-interval-label`}>
            alle
          </span>
          <input
            type="number"
            min={1}
            className={styles.intervalInput}
            value={interval}
            onChange={(e) => setInterval(Math.max(1, Number(e.target.value)))}
            aria-labelledby={`${formId}-interval-label`}
          />
          <span className={styles.intervalLabel}>
            {recurrenceType === "daily" && "Tag(e)"}
            {recurrenceType === "weekly" && "Woche(n)"}
            {recurrenceType === "monthly" && "Monat(e)"}
          </span>
        </div>
      )}

      {recurrenceType === "custom" && (
        <div className={styles.weekdayRow} role="group" aria-label="Wochentage auswählen">
          {WEEKDAYS.map((day) => (
            <button
              key={day.value}
              type="button"
              aria-pressed={weekdays.includes(day.value)}
              className={`${styles.weekdayButton} ${
                weekdays.includes(day.value) ? styles.weekdayButtonSelected : ""
              }`}
              onClick={() => toggleWeekday(day.value)}
            >
              {day.label}
            </button>
          ))}
        </div>
      )}

      <div className={styles.actions}>
        <button type="button" className={styles.cancelButton} onClick={onCancel}>
          Abbrechen
        </button>
        <button type="button" className={styles.saveButton} disabled={!canSubmit} onClick={handleSubmit}>
          Speichern
        </button>
      </div>
    </div>
  );
}
