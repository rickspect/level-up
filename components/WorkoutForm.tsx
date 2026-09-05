"use client";

import { useState } from "react";
import {
  inputClassName,
  primaryButtonClassName,
  textareaClassName,
  formCardClassName,
} from "@/components/QuestFormSheet";
import type { WorkoutExerciseInput } from "@/lib/types";

type WorkoutRow = WorkoutExerciseInput & { id: string };

type WorkoutFormProps = {
  initialExercises?: WorkoutExerciseInput[];
  initialNotes?: string;
  mode: "create" | "edit";
  saving: boolean;
  onSubmit: (data: {
    exercises: WorkoutExerciseInput[];
    notes?: string;
  }) => void;
};

function createRow(
  exercise?: Partial<WorkoutExerciseInput>
): WorkoutRow {
  return {
    id: crypto.randomUUID(),
    name: exercise?.name ?? "",
    sets: exercise?.sets ?? 3,
    reps: exercise?.reps ?? 10,
    weight: exercise?.weight ?? null,
  };
}

function Stepper({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={disabled || value <= 1}
          onClick={() => onChange(Math.max(1, value - 1))}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-sm text-muted transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <span className="w-8 text-center text-sm font-semibold tabular-nums">
          {value}
        </span>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(value + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-sm text-muted transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function WorkoutForm({
  initialExercises,
  initialNotes = "",
  mode,
  saving,
  onSubmit,
}: WorkoutFormProps) {
  const [rows, setRows] = useState<WorkoutRow[]>(() =>
    initialExercises && initialExercises.length > 0
      ? initialExercises.map((exercise) => createRow(exercise))
      : [createRow()]
  );
  const [notes, setNotes] = useState(initialNotes);

  function updateRow(id: string, patch: Partial<WorkoutRow>) {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...patch } : row))
    );
  }

  function addRow() {
    setRows((prev) => [...prev, createRow()]);
  }

  function removeRow(id: string) {
    setRows((prev) =>
      prev.length === 1 ? prev : prev.filter((row) => row.id !== id)
    );
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onSubmit({
      exercises: rows.map(({ name, sets, reps, weight }) => ({
        name,
        sets,
        reps,
        weight,
      })),
      notes,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className={`flex flex-col gap-4 ${formCardClassName}`}>
        <div className="flex flex-col gap-3">
          {rows.map((row, index) => (
            <div
              key={row.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-background p-3"
            >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Exercise {index + 1}
              </span>
              {rows.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  disabled={saving}
                  className="text-xs text-muted transition-colors hover:text-red-400 disabled:opacity-60"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Exercise Name</label>
              <input
                type="text"
                value={row.name}
                onChange={(event) =>
                  updateRow(row.id, { name: event.target.value })
                }
                disabled={saving}
                placeholder="e.g. Push Up"
                className={inputClassName}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Stepper
                label="Sets"
                value={row.sets}
                onChange={(sets) => updateRow(row.id, { sets })}
                disabled={saving}
              />
              <Stepper
                label="Reps"
                value={row.reps}
                onChange={(reps) => updateRow(row.id, { reps })}
                disabled={saving}
              />
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted">Weight (kg)</span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={row.weight ?? ""}
                  onChange={(event) =>
                    updateRow(row.id, {
                      weight: event.target.value
                        ? Number(event.target.value)
                        : null,
                    })
                  }
                  disabled={saving}
                  placeholder="—"
                  className={inputClassName}
                />
              </div>
            </div>
          </div>
        ))}
        </div>

        <button
          type="button"
          onClick={addRow}
          disabled={saving}
          className="rounded-lg border border-dashed border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:border-gold/40 hover:text-gold-light disabled:opacity-60"
        >
          + Add Exercise
        </button>

        <div className="flex flex-col gap-2">
          <label htmlFor="workout-notes" className="text-sm font-medium">
            Notes
          </label>
          <textarea
            id="workout-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            disabled={saving}
            rows={2}
            placeholder="Optional session notes..."
            className={textareaClassName}
          />
        </div>

        <button
          type="submit"
          disabled={saving || rows.every((row) => !row.name.trim())}
          className={primaryButtonClassName}
        >
          {saving
            ? "Saving..."
            : mode === "create"
              ? "Complete Quest"
              : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
