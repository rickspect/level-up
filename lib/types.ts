export type Player = {
  id: string;
  level: number;
  xp: number;
  gold: number;
  knowledge: number;
  faith: number;
  fitness: number;
  tech: number;
  evolution_energy: number;
  streak: number;
};

export type ActivityLog = {
  id: string;
  activity_type: string;
  duration_minutes: number | null;
  xp_earned: number;
  gold_earned: number;
  stat_earned: string;
  created_at: string;
};

export type QuestId = "read-book" | "read-bible" | "workout" | "learn-coding";

export type ActivityType = "book" | "bible" | "workout" | "coding";

export type StatKey = "knowledge" | "faith" | "fitness" | "tech";

export type QuestReward = {
  xp: number;
  gold: number;
  stat: StatKey;
  statAmount: number;
};

export type Quest = {
  id: QuestId;
  title: string;
  activityType: ActivityType;
  reward: QuestReward;
};

export type PlayerStatsData = {
  level: number;
  currentXp: number;
  xpToNextLevel: number;
  gold: number;
  streak: number;
};

export type CompleteQuestResult =
  | {
      success: true;
      player: Player;
      reward: QuestReward;
      activityType: ActivityType;
    }
  | {
      success: false;
      error: string;
    };
