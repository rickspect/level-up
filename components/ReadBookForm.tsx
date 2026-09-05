"use client";

import { useState } from "react";
import {
  inputClassName,
  primaryButtonClassName,
  textareaClassName,
  formCardClassName,
} from "@/components/QuestFormSheet";

type ReadBookFormProps = {
  initialTitle?: string;
  initialReference?: string;
  initialReflection?: string;
  mode: "create" | "edit";
  saving: boolean;
  onSubmit: (data: {
    title: string;
    reference?: string;
    reflection: string;
  }) => void;
};

const MAX_REFLECTION_LENGTH = 300;

export default function ReadBookForm({
  initialTitle = "",
  initialReference = "",
  initialReflection = "",
  mode,
  saving,
  onSubmit,
}: ReadBookFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [reference, setReference] = useState(initialReference);
  const [reflection, setReflection] = useState(initialReflection);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onSubmit({ title, reference, reflection });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className={`flex flex-col gap-4 ${formCardClassName}`}>
        <div className="flex flex-col gap-2">
          <label htmlFor="book-title" className="text-sm font-medium">
            Book Title <span className="text-xp">*</span>
          </label>
          <input
            id="book-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={saving}
            placeholder="e.g. Atomic Habits"
            className={inputClassName}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="book-reference" className="text-sm font-medium">
            Pages / Chapter
          </label>
          <input
            id="book-reference"
            type="text"
            value={reference}
            onChange={(event) => setReference(event.target.value)}
            disabled={saving}
            placeholder="e.g. Chapter 3 or Pages 45-60"
            className={inputClassName}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="book-reflection" className="text-sm font-medium">
            What I Learned <span className="text-xp">*</span>
          </label>
          <textarea
            id="book-reflection"
            value={reflection}
            onChange={(event) =>
              setReflection(event.target.value.slice(0, MAX_REFLECTION_LENGTH))
            }
            disabled={saving}
            rows={4}
            placeholder="What did you learn from this reading?"
            className={textareaClassName}
          />
          <span className="text-right text-xs text-muted">
            {reflection.length}/{MAX_REFLECTION_LENGTH}
          </span>
        </div>

        <button
          type="submit"
          disabled={saving || !title.trim() || !reflection.trim()}
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
