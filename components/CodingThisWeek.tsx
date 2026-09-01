import EmptyState from "@/components/EmptyState";
import type { CodingWeekStats } from "@/lib/types";

type CodingThisWeekProps = {
  stats: CodingWeekStats;
};

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border bg-surface px-3 py-3">
      <span className="text-xs text-muted">{label}</span>
      <span className="text-lg font-semibold text-foreground">{value}</span>
    </div>
  );
}

export default function CodingThisWeek({ stats }: CodingThisWeekProps) {
  const isEmpty = stats.totalSessions === 0;

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
        Coding This Week
      </h2>

      {isEmpty ? (
        <EmptyState message="No coding sessions yet this week." />
      ) : (
        <div className="grid grid-cols-3 gap-2">
          <StatCard label="Sessions" value={stats.totalSessions} />
          <StatCard label="Minutes" value={stats.totalMinutes} />
          <StatCard label="Tech XP" value={stats.techXpEarned} />
        </div>
      )}
    </section>
  );
}
