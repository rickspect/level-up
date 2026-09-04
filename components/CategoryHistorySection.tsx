"use client";

import { useState } from "react";
import { loadMoreActivities } from "@/lib/actions/update-activity";
import {
  ACTIVITY_ICONS,
  CATEGORY_LABELS,
  formatWorkoutSummary,
} from "@/lib/activity-summary";
import type { ProgressCategory, RecentActivityItem } from "@/lib/types";

type CategoryHistorySectionProps = {
  category: ProgressCategory;
  initialActivities: RecentActivityItem[];
  pageSize?: number;
};

function HistoryItem({ activity }: { activity: RecentActivityItem }) {
  const dateLabel = new Date(
    `${activity.activityDate}T00:00:00.000Z`
  ).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">
          {dateLabel}
        </span>
        <span className="text-sm" aria-hidden="true">
          {ACTIVITY_ICONS[activity.activityType]}
        </span>
      </div>

      <p className="text-sm font-semibold text-foreground">{activity.title}</p>

      {activity.reference && (
        <p className="mt-0.5 text-xs text-muted">{activity.reference}</p>
      )}

      {activity.activityType === "workout" && activity.exercises && (
        <p className="mt-1 text-sm text-muted">
          {formatWorkoutSummary(activity.exercises)}
        </p>
      )}

      {activity.activityType === "coding" && (
        <p className="mt-0.5 text-xs text-muted">
          Session logged
        </p>
      )}

      {activity.reflection && (
        <p className="mt-2 text-sm italic text-muted">
          &ldquo;{activity.reflection}&rdquo;
        </p>
      )}
    </div>
  );
}

export default function CategoryHistorySection({
  category,
  initialActivities,
  pageSize = 15,
}: CategoryHistorySectionProps) {
  const [activities, setActivities] =
    useState<RecentActivityItem[]>(initialActivities);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(
    initialActivities.length === pageSize
  );

  async function handleLoadMore() {
    setLoading(true);

    const nextActivities = await loadMoreActivities(
      category,
      activities.length,
      pageSize
    );

    setLoading(false);

    if (nextActivities.length === 0) {
      setHasMore(false);
      return;
    }

    setActivities((prev) => [...prev, ...nextActivities]);
    setHasMore(nextActivities.length === pageSize);
  }

  return (
    <div className="flex flex-col gap-4">
      {activities.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface px-4 py-6 text-center text-sm text-muted">
          No {CATEGORY_LABELS[category].toLowerCase()} history yet.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {activities.map((activity) => (
            <HistoryItem key={activity.id} activity={activity} />
          ))}
        </div>
      )}

      {hasMore && (
        <button
          type="button"
          onClick={handleLoadMore}
          disabled={loading}
          className="rounded-lg border border-border bg-surface-elevated px-4 py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  );
}
