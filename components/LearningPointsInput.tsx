"use client";

import { useRef } from "react";
import { inputClassName } from "@/components/QuestFormSheet";
import {
  MAX_LEARNING_POINTS,
  MAX_POINT_LENGTH,
  getValidLearningPoints,
} from "@/lib/learning-points";

type LearningPointsInputProps = {
  label: string;
  idPrefix: string;
  saving?: boolean;
  maxPoints?: number;
  addButtonLabel?: string;
  placeholder?: string;
  value: string[];
  onChange: (points: string[]) => void;
};

export function hasValidLearningPoints(points: string[]): boolean {
  return getValidLearningPoints(points).length > 0;
}

export default function LearningPointsInput({
  label,
  idPrefix,
  saving = false,
  maxPoints = MAX_LEARNING_POINTS,
  addButtonLabel = "+ Add another point",
  placeholder = "Write a takeaway...",
  value,
  onChange,
}: LearningPointsInputProps) {
  const inputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const rows = value.length > 0 ? value : [""];

  function updateRow(index: number, nextValue: string) {
    const nextRows = [...rows];
    nextRows[index] = nextValue.slice(0, MAX_POINT_LENGTH);
    onChange(nextRows);
  }

  function addRow(afterIndex?: number) {
    if (rows.length >= maxPoints) {
      return;
    }

    const insertAt =
      afterIndex === undefined ? rows.length : Math.min(afterIndex + 1, rows.length);
    const nextRows = [...rows];
    nextRows.splice(insertAt, 0, "");
    onChange(nextRows);

    requestAnimationFrame(() => {
      inputRefs.current[insertAt]?.focus();
    });
  }

  function removeRow(index: number) {
    if (rows.length === 1) {
      return;
    }

    onChange(rows.filter((_, rowIndex) => rowIndex !== index));
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();

    if (!rows[index]?.trim() || rows.length >= maxPoints) {
      return;
    }

    addRow(index);
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">
        {label} <span className="text-xp">*</span>
      </span>

      <div className="flex flex-col gap-2">
        {rows.map((row, index) => (
          <div key={`${idPrefix}-${index}`} className="flex items-start gap-2">
            <span
              className="mt-2 w-5 shrink-0 text-sm tabular-nums text-muted"
              aria-hidden="true"
            >
              {index + 1}.
            </span>
            <div className="min-w-0 flex-1">
              <input
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                id={`${idPrefix}-${index + 1}`}
                type="text"
                value={row}
                onChange={(event) => updateRow(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(event, index)}
                disabled={saving}
                placeholder={placeholder}
                className={inputClassName}
              />
            </div>
            {rows.length > 1 && (
              <button
                type="button"
                onClick={() => removeRow(index)}
                disabled={saving}
                className="mt-2 shrink-0 text-xs text-muted transition-colors hover:text-red-400 disabled:opacity-60"
                aria-label={`Remove point ${index + 1}`}
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      {rows.length < maxPoints && (
        <button
          type="button"
          onClick={() => addRow()}
          disabled={saving}
          className="rounded-lg border border-dashed border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:border-gold/40 hover:text-gold-light disabled:opacity-60"
        >
          {addButtonLabel}
        </button>
      )}
    </div>
  );
}
