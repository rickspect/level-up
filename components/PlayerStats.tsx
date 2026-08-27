import type { PlayerStatsData } from "@/lib/types";

type PlayerStatsProps = {
  player: PlayerStatsData;
};

export default function PlayerStats({ player }: PlayerStatsProps) {
  const xpPercent = Math.round(
    (player.currentXp / player.xpToNextLevel) * 100
  );

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted">
            Level
          </p>
          <p className="text-2xl font-semibold text-gold-light">
            {player.level}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">
            Streak
          </p>
          <p className="flex items-center justify-end gap-1 text-2xl font-semibold">
            <span aria-hidden="true">🔥</span>
            <span>{player.streak}</span>
          </p>
        </div>
      </div>

      <div className="mb-4">
        <div className="mb-1.5 flex justify-between text-xs text-muted">
          <span>XP</span>
          <span>
            {player.currentXp} / {player.xpToNextLevel}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-xp to-gold"
            style={{ width: `${xpPercent}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-5 w-5 text-gold"
          aria-hidden="true"
        >
          <circle cx="10" cy="10" r="8" opacity="0.3" />
          <circle cx="10" cy="10" r="5" />
        </svg>
        <span className="text-sm text-muted">Gold</span>
        <span className="ml-auto font-semibold text-gold-light">
          {player.gold.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
