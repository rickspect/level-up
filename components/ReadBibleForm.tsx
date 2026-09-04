"use client";

import { useState } from "react";
import {
  inputClassName,
  primaryButtonClassName,
  textareaClassName,
} from "@/components/QuestFormSheet";

type ReadBibleFormProps = {
  initialPassage?: string;
  initialReflection?: string;
  mode: "create" | "edit";
  saving: boolean;
  onSubmit: (data: { passage: string; reflection: string }) => void;
};

const MAX_REFLECTION_LENGTH = 300;

export default function ReadBibleForm({
  initialPassage = "",
  initialReflection = "",
  mode,
  saving,
  onSubmit,
}: ReadBibleFormProps) {
  const [passage, setPassage] = useState(initialPassage);
  const [reflection, setReflection] = useState(initialReflection);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onSubmit({ passage, reflection });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="bible-passage" className="text-sm font-medium">
          Passage <span className="text-xp">*</span>
        </label>
        <input
          id="bible-passage"
          type="text"
          value={passage}
          onChange={(event) => setPassage(event.target.value)}
          disabled={saving}
          placeholder="e.g. Matthew 5:1-12"
          className={inputClassName}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="bible-reflection" className="text-sm font-medium">
          Reflection / What I Learned <span className="text-xp">*</span>
        </label>
        <textarea
          id="bible-reflection"
          value={reflection}
          onChange={(event) =>
            setReflection(event.target.value.slice(0, MAX_REFLECTION_LENGTH))
          }
          disabled={saving}
          rows={4}
          placeholder="What can you learn or apply from this passage?"
          className={textareaClassName}
        />
        <span className="text-right text-xs text-muted">
          {reflection.length}/{MAX_REFLECTION_LENGTH}
        </span>
      </div>

      <button
        type="submit"
        disabled={saving || !passage.trim() || !reflection.trim()}
        className={primaryButtonClassName}
      >
        {saving
          ? "Saving..."
          : mode === "create"
            ? "Complete Quest"
            : "Save Changes"}
      </button>
    </form>
  );
}
