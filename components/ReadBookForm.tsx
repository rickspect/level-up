"use client";

import { useEffect, useState } from "react";
import LearningPointsInput, {
  hasValidLearningPoints,
} from "@/components/LearningPointsInput";
import {
  inputClassName,
  primaryButtonClassName,
  formCardClassName,
} from "@/components/QuestFormSheet";
import {
  getValidLearningPoints,
  parseLearningPoints,
} from "@/lib/learning-points";

type ReadBookFormProps = {
  initialTitle?: string;
  initialReference?: string;
  initialReflection?: string;
  mode: "create" | "edit";
  saving: boolean;
  onSubmit: (data: {
    title: string;
    reference?: string;
    reflection: string[];
  }) => void;
};

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
  const [points, setPoints] = useState<string[]>(() => {
    const parsed = parseLearningPoints(initialReflection);
    return parsed.length > 0 ? parsed : [""];
  });

  useEffect(() => {
    const parsed = parseLearningPoints(initialReflection);
    setPoints(parsed.length > 0 ? parsed : [""]);
  }, [initialReflection]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onSubmit({
      title,
      reference,
      reflection: getValidLearningPoints(points),
    });
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

        <LearningPointsInput
          label="Key Takeaways"
          idPrefix="book-takeaway"
          value={points}
          onChange={setPoints}
          saving={saving}
          placeholder="What did you learn from this reading?"
        />

        <button
          type="submit"
          disabled={saving || !title.trim() || !hasValidLearningPoints(points)}
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
