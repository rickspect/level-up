"use server";

import { DEFAULT_PLAYER_ID } from "@/lib/constants";
import { getStartOfTodayUtc } from "@/lib/player-utils";
import { getQuestById } from "@/lib/quests";
import { createServerClient } from "@/lib/supabase/server";
import type { CompleteQuestResult, Player, QuestId } from "@/lib/types";

export async function completeQuest(
  questId: QuestId
): Promise<CompleteQuestResult> {
  const quest = getQuestById(questId);

  if (!quest) {
    return { success: false, error: "Unknown quest" };
  }

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
  const { reward } = quest;

  const updatedPlayer: Player = {
    ...currentPlayer,
    xp: currentPlayer.xp + reward.xp,
    gold: currentPlayer.gold + reward.gold,
    [reward.stat]: currentPlayer[reward.stat] + reward.statAmount,
  };

  const { data: savedPlayer, error: updateError } = await supabase
    .from("player")
    .update({
      xp: updatedPlayer.xp,
      gold: updatedPlayer.gold,
      knowledge: updatedPlayer.knowledge,
      faith: updatedPlayer.faith,
      fitness: updatedPlayer.fitness,
      tech: updatedPlayer.tech,
    })
    .eq("id", DEFAULT_PLAYER_ID)
    .select("*")
    .single();

  if (updateError || !savedPlayer) {
    return { success: false, error: "Failed to update player" };
  }

  const { error: logError } = await supabase.from("activity_logs").insert({
    activity_type: quest.activityType,
    duration_minutes: null,
    xp_earned: reward.xp,
    gold_earned: reward.gold,
    stat_earned: reward.stat,
  });

  if (logError) {
    return { success: false, error: "Failed to log activity" };
  }

  return {
    success: true,
    player: savedPlayer as Player,
    reward,
    activityType: quest.activityType,
  };
}
