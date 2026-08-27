import type { Player, PlayerStatsData } from "@/lib/types";

export function xpToNextLevel(level: number): number {
  return level * 100;
}

export function toPlayerStatsData(player: Player): PlayerStatsData {
  return {
    level: player.level,
    currentXp: player.xp,
    xpToNextLevel: xpToNextLevel(player.level),
    gold: player.gold,
    streak: player.streak,
  };
}

export function getStartOfTodayUtc(): string {
  const now = new Date();
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  return start.toISOString();
}
