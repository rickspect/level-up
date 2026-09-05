import PageTransition from "@/components/PageTransition";
import ProgressThisWeek from "@/components/ProgressThisWeek";
import ActivityCategoryGrid from "@/components/ActivityCategoryGrid";
import RecentActivityList from "@/components/RecentActivityList";
import {
  getRecentActivities,
  getWeeklyProgressStats,
} from "@/lib/db/activity-logs";

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const [stats, recentActivities] = await Promise.all([
    getWeeklyProgressStats(),
    getRecentActivities(10),
  ]);

  return (
    <PageTransition>
      <div className="flex flex-col gap-6 px-4 py-6">
        <div>
          <h1 className="text-xl font-semibold">Progress</h1>
          <p className="mt-1 text-sm text-muted">
            Track your habit journey over time.
          </p>
        </div>

        <ProgressThisWeek stats={stats} />
        <ActivityCategoryGrid />
        <RecentActivityList activities={recentActivities} />
      </div>
    </PageTransition>
  );
}
