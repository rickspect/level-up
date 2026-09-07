import {
  ACTIVITY_ICONS,
  formatWorkoutSummary,
} from "@/lib/activity-summary";
import LearningPointsList from "@/components/LearningPointsList";
import { getTodayUtcDate } from "@/lib/player-utils";
import { parseLearningPoints } from "@/lib/learning-points";
import type { ActivityType, RecentActivityItem } from "@/lib/types";

type RecentActivityListProps = {
  activities: RecentActivityItem[];
};

function formatDayLabel(activityDate: string): string {
  const today = getTodayUtcDate();
  const yesterdayDate = new Date(`${today}T00:00:00.000Z`);
  yesterdayDate.setUTCDate(yesterdayDate.getUTCDate() - 1);
  const yesterday = yesterdayDate.toISOString().slice(0, 10);

  if (activityDate === today) {
    return "Today";
  }

  if (activityDate === yesterday) {
    return "Yesterday";
  }

  return new Date(`${activityDate}T00:00:00.000Z`).toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric", timeZone: "UTC" }
  );
}

function usesLearningPoints(activityType: ActivityType): boolean {
  return activityType === "book" || activityType === "bible" || activityType === "coding";
}

function ActivityItem({ activity }: { activity: RecentActivityItem }) {
  const icon = ACTIVITY_ICONS[activity.activityType];

  let subtitle = activity.reference ?? "";
  const learningPoints = parseLearningPoints(activity.reflection);
  const showLearningPoints = usesLearningPoints(activity.activityType);
  const workoutNotes =
    activity.activityType === "workout" ? activity.reflection : null;

  if (activity.activityType === "bible") {
    subtitle = "";
  }

  if (activity.activityType === "workout" && activity.exercises) {
    subtitle = formatWorkoutSummary(activity.exercises);
  }

  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-3">
      <div className="flex items-start gap-3">
        <span className="text-lg" aria-hidden="true">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">
            {activity.title}
          </p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-muted">{subtitle}</p>
          )}
          {showLearningPoints && (
            <LearningPointsList points={learningPoints} />
          )}
          {workoutNotes && (
            <p className="mt-1 text-sm leading-[1.5] text-muted">
              {workoutNotes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RecentActivityList({
  activities,
}: RecentActivityListProps) {
  if (activities.length === 0) {
    return (
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
          Recent Activity
        </h2>
        <p className="rounded-xl border border-border bg-surface px-4 py-6 text-center text-sm text-muted">
          No activity logged yet. Complete a daily quest to get started.
        </p>
      </section>
    );
  }

  const grouped = activities.reduce<Record<string, RecentActivityItem[]>>(
    (acc, activity) => {
      const label = formatDayLabel(activity.activityDate);
      acc[label] = acc[label] ?? [];
      acc[label].push(activity);
      return acc;
    },
    {}
  );

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
        Recent Activity
      </h2>
      <div className="flex flex-col gap-4">
        {Object.entries(grouped).map(([dayLabel, dayActivities]) => (
          <div key={dayLabel} className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
              {dayLabel}
            </h3>
            {dayActivities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
