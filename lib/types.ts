export type EvolutionStage = "baby" | "rookie" | "champion";

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
  evolution_stage: EvolutionStage;
  streak: number;
  equipped_aura_id: string | null;
  equipped_accessory_id: string | null;
};

export type EvolutionProgressData = {
  currentStage: EvolutionStage;
  currentStageLabel: string;
  nextStage: EvolutionStage | null;
  nextStageLabel: string | null;
  levelCurrent: number;
  levelRequired: number;
  energyCurrent: number;
  energyRequired: number;
  canEvolve: boolean;
  isMaxStage: boolean;
};

export type EvolutionInfo = {
  fromStage: EvolutionStage;
  toStage: EvolutionStage;
};

export type EvolveResult =
  | {
      success: true;
      player: Player;
      evolution: EvolutionInfo;
    }
  | {
      success: false;
      error: string;
    };

export type CosmeticCategory =
  | "default"
  | "knowledge"
  | "faith"
  | "fitness"
  | "tech";

export type CosmeticSlot = "aura" | "accessory";

export type Cosmetic = {
  id: string;
  name: string;
  category: CosmeticCategory;
  unlock_level: number;
  equipped: boolean;
  slot: CosmeticSlot | null;
};

export type EquippedCosmetics = {
  auraId: string | null;
  accessoryId: string | null;
};

export type EquipCosmeticResult =
  | {
      success: true;
      equipped: EquippedCosmetics;
    }
  | {
      success: false;
      error: string;
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

export type LevelUpInfo = {
  fromLevel: number;
  toLevel: number;
};

export type ApplyRewardsResult = {
  player: Player;
  levelUp: LevelUpInfo | null;
};

export type BonusReward = {
  xp: number;
  gold: number;
};

export type PerfectDayInfo = {
  xp: 75;
  gold: 30;
  energy: 1;
};

export type Reward = {
  id: string;
  name: string;
  price: number;
  is_active: boolean;
};

export type RewardRedemption = {
  id: string;
  reward_id: string;
  reward_name: string;
  gold_spent: number;
  created_at: string;
};

export type RedeemRewardResult =
  | {
      success: true;
      player: Player;
      redemption: RewardRedemption;
    }
  | {
      success: false;
      error: string;
    };

export type CompleteQuestResult =
  | {
      success: true;
      player: Player;
      reward: QuestReward;
      activityType: ActivityType;
      levelUp?: LevelUpInfo;
      perfectDay?: PerfectDayInfo;
    }
  | {
      success: false;
      error: string;
    };
