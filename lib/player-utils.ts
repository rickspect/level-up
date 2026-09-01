import type {
  ActivityType,
  ApplyRewardsResult,
  BonusReward,
  Player,
  PlayerStatsData,
  QuestReward,
} from "@/lib/types";

export const PERFECT_DAY_ACTIVITIES: ActivityType[] = [
  "book",
  "bible",
  "workout",
  "coding",
];

export const PERFECT_DAY_BONUS: BonusReward = {
  xp: 75,
  gold: 30,
};

export function xpToNextLevel(level: number): number {
  return level * 100;
}

function applyXpAndGold(player: Player, xpGain: number, goldGain: number): ApplyRewardsResult {
  const fromLevel = player.level;
  let level = player.level;
  let xp = player.xp + xpGain;
  const gold = player.gold + goldGain;

  while (xp >= xpToNextLevel(level)) {
    xp -= xpToNextLevel(level);
    level += 1;
  }

  const updatedPlayer: Player = {
    ...player,
    level,
    xp,
    gold,
  };

  return {
    player: updatedPlayer,
    levelUp: fromLevel < level ? { fromLevel, toLevel: level } : null,
  };
}

export function applyRewards(player: Player, reward: QuestReward): ApplyRewardsResult {
  const { player: updatedPlayer, levelUp } = applyXpAndGold(
    player,
    reward.xp,
    reward.gold
  );

  return {
    player: {
      ...updatedPlayer,
      [reward.stat]: player[reward.stat] + reward.statAmount,
    },
    levelUp,
  };
}

export function applyBonusRewards(player: Player, bonus: BonusReward): ApplyRewardsResult {
  return applyXpAndGold(player, bonus.xp, bonus.gold);
}

export function isPerfectDayComplete(completedTypes: ActivityType[]): boolean {
  const completed = new Set(completedTypes);
  return PERFECT_DAY_ACTIVITIES.every((activity) => completed.has(activity));
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

export function getStartOfWeekUtc(): string {
  const now = new Date();
  const day = now.getUTCDay();
  const daysFromMonday = day === 0 ? 6 : day - 1;
  const start = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - daysFromMonday
    )
  );
  return start.toISOString();
}
