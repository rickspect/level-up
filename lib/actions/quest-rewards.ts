"use server";

import { DEFAULT_PLAYER_ID } from "@/lib/constants";
import { hasPerfectDayClaimToday } from "@/lib/db/player";
import {
  applyBonusRewards,
  applyRewards,
  computeStreakAfterFirstQuestOfDay,
  getStartOfTodayUtc,
  getStartOfYesterdayUtc,
  isPerfectDayComplete,
  PERFECT_DAY_BONUS,
} from "@/lib/player-utils";
import { createServerClient } from "@/lib/supabase/server";
import type {
  ActivityType,
  LevelUpInfo,
  PerfectDayInfo,
  Player,
  Quest,
  QuestReward,
} from "@/lib/types";

export type ApplyQuestRewardResult =
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

export async function applyQuestReward(
  quest: Quest,
  durationMinutes: number | null = null
): Promise<ApplyQuestRewardResult> {
  const supabase = createServerClient();
  const startOfToday = getStartOfTodayUtc();

  const { data: existingLog } = await supabase
    .from("activity_logs")
    .select("id")
    .eq("activity_type", quest.activityType)
    .gte("created_at", startOfToday)
    .maybeSingle();

  if (existingLog) {
    return { success: false, error: "Already completed today" };
  }

  const { data: player, error: playerError } = await supabase
    .from("player")
    .select("*")
    .eq("id", DEFAULT_PLAYER_ID)
    .single();

  if (playerError || !player) {
    return { success: false, error: "Player not found" };
  }

  const currentPlayer = player as Player;
  const startingLevel = currentPlayer.level;
  const { reward } = quest;
  const { player: updatedPlayer } = applyRewards(currentPlayer, reward);

  const evolutionEnergy = currentPlayer.evolution_energy + 1;

  const { data: todayLogsBefore } = await supabase
    .from("activity_logs")
    .select("id")
    .gte("created_at", startOfToday);

  const isFirstQuestToday = (todayLogsBefore ?? []).length === 0;
  let newStreak = currentPlayer.streak;

  if (isFirstQuestToday) {
    const { data: yesterdayLogs } = await supabase
      .from("activity_logs")
      .select("id")
      .gte("created_at", getStartOfYesterdayUtc())
      .lt("created_at", startOfToday)
      .limit(1);

    const hadActivityYesterday = (yesterdayLogs ?? []).length > 0;
    newStreak = computeStreakAfterFirstQuestOfDay(
      currentPlayer.streak,
      hadActivityYesterday
    );
  } else if (currentPlayer.streak === 0 && (todayLogsBefore ?? []).length > 0) {
    newStreak = 1;
  }

  const { data: savedPlayer, error: updateError } = await supabase
    .from("player")
    .update({
      level: updatedPlayer.level,
      xp: updatedPlayer.xp,
      gold: updatedPlayer.gold,
      knowledge: updatedPlayer.knowledge,
      faith: updatedPlayer.faith,
      fitness: updatedPlayer.fitness,
      tech: updatedPlayer.tech,
      evolution_energy: evolutionEnergy,
      streak: newStreak,
    })
    .eq("id", DEFAULT_PLAYER_ID)
    .select("*")
    .single();

  if (updateError || !savedPlayer) {
    return { success: false, error: "Failed to update player" };
  }

  const { error: logError } = await supabase.from("activity_logs").insert({
    activity_type: quest.activityType,
    duration_minutes: durationMinutes,
    xp_earned: reward.xp,
    gold_earned: reward.gold,
    stat_earned: reward.stat,
  });

  if (logError) {
    return { success: false, error: "Failed to log activity" };
  }

  let finalPlayer = savedPlayer as Player;
  let perfectDay: PerfectDayInfo | undefined;

  const { data: todayLogs } = await supabase
    .from("activity_logs")
    .select("activity_type")
    .gte("created_at", startOfToday);

  const completedTypes = (todayLogs ?? []).map(
    (row) => row.activity_type as ActivityType
  );

  if (isPerfectDayComplete(completedTypes)) {
    const alreadyClaimed = await hasPerfectDayClaimToday();

    if (!alreadyClaimed) {
      const { player: bonusPlayer } = applyBonusRewards(
        finalPlayer,
        PERFECT_DAY_BONUS
      );
      const bonusEnergy = finalPlayer.evolution_energy + 1;

      const { data: perfectDayPlayer, error: perfectDayError } = await supabase
        .from("player")
        .update({
          level: bonusPlayer.level,
          xp: bonusPlayer.xp,
          gold: bonusPlayer.gold,
          evolution_energy: bonusEnergy,
        })
        .eq("id", DEFAULT_PLAYER_ID)
        .select("*")
        .single();

      if (perfectDayError || !perfectDayPlayer) {
        return { success: false, error: "Failed to apply Perfect Day bonus" };
      }

      const { error: claimError } = await supabase
        .from("perfect_day_claims")
        .insert({
          xp_earned: PERFECT_DAY_BONUS.xp,
          gold_earned: PERFECT_DAY_BONUS.gold,
          energy_earned: 1,
        });

      if (claimError) {
        return { success: false, error: "Failed to record Perfect Day claim" };
      }

      finalPlayer = perfectDayPlayer as Player;
      perfectDay = { xp: 75, gold: 30, energy: 1 };
    }
  }

  const levelUp: LevelUpInfo | undefined =
    finalPlayer.level > startingLevel
      ? { fromLevel: startingLevel, toLevel: finalPlayer.level }
      : undefined;

  return {
    success: true,
    player: finalPlayer,
    reward,
    activityType: quest.activityType,
    ...(levelUp ? { levelUp } : {}),
    ...(perfectDay ? { perfectDay } : {}),
  };
}
