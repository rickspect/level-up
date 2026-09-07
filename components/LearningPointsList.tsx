"use client";

import { useState } from "react";

type LearningPointsListProps = {
  points: string[];
  maxVisible?: number;
  className?: string;
};

export default function LearningPointsList({
  points,
  maxVisible = 3,
  className = "",
}: LearningPointsListProps) {
  const [expanded, setExpanded] = useState(false);

  if (points.length === 0) {
    return null;
  }

  const hasHiddenPoints = points.length > maxVisible;
  const visiblePoints =
    expanded || !hasHiddenPoints ? points : points.slice(0, maxVisible);
  const hiddenCount = points.length - maxVisible;

  return (
    <div className={className}>
      <ul className="mt-1 flex flex-col gap-1.5 text-sm leading-[1.5] text-muted">
        {visiblePoints.map((point, index) => (
          <li key={`${index}-${point}`} className="flex gap-2">
            <span aria-hidden="true" className="shrink-0">•</span>
            <span className="min-w-0">{point}</span>
          </li>
        ))}
      </ul>

      {hasHiddenPoints && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-2 text-xs font-medium text-gold-light transition-colors hover:text-gold"
        >
          {expanded ? "Show less" : `View ${hiddenCount} more`}
        </button>
      )}
    </div>
  );
}
