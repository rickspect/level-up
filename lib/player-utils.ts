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

export const APP_TIMEZONE = "Asia/Jakarta";

const JAKARTA_OFFSET = "+07:00";

const JAKARTA_WEEKDAY_MAP: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

function getJakartaDayOfWeek(date: Date = new Date()): number {
  const dayName = new Intl.DateTimeFormat("en-US", {
    timeZone: APP_TIMEZONE,
    weekday: "short",
  }).format(date);

  return JAKARTA_WEEKDAY_MAP[dayName] ?? 0;
}

function shiftJakartaDate(dateStr: string, days: number): string {
  const base = new Date(`${dateStr}T12:00:00${JAKARTA_OFFSET}`);
  base.setUTCDate(base.getUTCDate() + days);

  return new Intl.DateTimeFormat("en-CA", { timeZone: APP_TIMEZONE }).format(
    base
  );
}

function getStartOfDayIso(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00${JAKARTA_OFFSET}`).toISOString();
}

export function getTodayDate(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: APP_TIMEZONE }).format(
    new Date()
  );
}

export function getYesterdayDate(): string {
  return shiftJakartaDate(getTodayDate(), -1);
}

export function getStartOfToday(): string {
  return getStartOfDayIso(getTodayDate());
}

export function getStartOfYesterday(): string {
  return getStartOfDayIso(getYesterdayDate());
}

export function getWeekStartDate(): string {
  const today = getTodayDate();
  const dayOfWeek = getJakartaDayOfWeek();
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  return shiftJakartaDate(today, -daysFromMonday);
}

export function getMsUntilNextMidnight(): number {
  const todayMidnight = new Date(`${getTodayDate()}T00:00:00${JAKARTA_OFFSET}`);
  const tomorrowMidnight = new Date(
    todayMidnight.getTime() + 24 * 60 * 60 * 1000
  );

  return Math.max(0, tomorrowMidnight.getTime() - Date.now());
}

/** @deprecated Use getTodayDate */
export const getTodayUtcDate = getTodayDate;

/** @deprecated Use getStartOfToday */
export const getStartOfTodayUtc = getStartOfToday;

/** @deprecated Use getStartOfYesterday */
export const getStartOfYesterdayUtc = getStartOfYesterday;

export function computeStreakAfterFirstQuestOfDay(
  currentStreak: number,
  hadActivityYesterday: boolean
): number {
  if (hadActivityYesterday) {
    return currentStreak + 1;
  }

  return 1;
}

export function getStartOfWeek(): string {
  return getStartOfDayIso(getWeekStartDate());
}

/** @deprecated Use getStartOfWeek */
export const getStartOfWeekUtc = getStartOfWeek;
