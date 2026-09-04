import type { WeeklyProgressStats } from "@/lib/types";

type ProgressThisWeekProps = {
  stats: WeeklyProgressStats;
};

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border bg-surface px-3 py-3">
      <span className="text-xs text-muted">{label}</span>
      <span className="text-lg font-semibold text-foreground">{value}</span>
    </div>
  );
}

export default function ProgressThisWeek({ stats }: ProgressThisWeekProps) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
        This Week
      </h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <StatCard label="Reading Days" value={stats.readingDays} />
        <StatCard label="Bible Days" value={stats.bibleDays} />
        <StatCard label="Workout Sessions" value={stats.workoutSessions} />
        <StatCard label="Coding Sessions" value={stats.codingSessions} />
        <StatCard label="Current Streak" value={`${stats.currentStreak} 🔥`} />
      </div>
    </section>
  );
}
