import PageTransition from "@/components/PageTransition";
import EmptyState from "@/components/EmptyState";

export default function ProgressPage() {
  return (
    <PageTransition>
      <div className="flex flex-col gap-4 px-4 py-6">
        <div>
          <h1 className="text-xl font-semibold">Progress</h1>
          <p className="mt-1 text-sm text-muted">
            Track your habit journey over time.
          </p>
        </div>
        <EmptyState message="Detailed progress charts are coming soon. Check Coding This Week on the Quests tab for your weekly coding stats." />
      </div>
    </PageTransition>
  );
}
