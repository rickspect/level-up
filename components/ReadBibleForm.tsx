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

type ReadBibleFormProps = {
  initialPassage?: string;
  initialReflection?: string;
  mode: "create" | "edit";
  saving: boolean;
  onSubmit: (data: { passage: string; reflection: string[] }) => void;
};

export default function ReadBibleForm({
  initialPassage = "",
  initialReflection = "",
  mode,
  saving,
  onSubmit,
}: ReadBibleFormProps) {
  const [passage, setPassage] = useState(initialPassage);
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
      passage,
      reflection: getValidLearningPoints(points),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className={`flex flex-col gap-4 ${formCardClassName}`}>
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

        <LearningPointsInput
          label="What I Learned"
          idPrefix="bible-learning"
          value={points}
          onChange={setPoints}
          saving={saving}
          placeholder="What can you learn or apply from this passage?"
        />

        <button
          type="submit"
          disabled={saving || !passage.trim() || !hasValidLearningPoints(points)}
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
