"use server";

import { revalidatePath } from "next/cache";
import { DEFAULT_PLAYER_ID } from "@/lib/constants";
import { createServerClient } from "@/lib/supabase/server";
import type { Player, RedeemRewardResult, RewardRedemption } from "@/lib/types";

export async function redeemReward(rewardId: string): Promise<RedeemRewardResult> {
  const supabase = createServerClient();

  const { data: reward, error: rewardError } = await supabase
    .from("rewards")
    .select("*")
    .eq("id", rewardId)
    .eq("is_active", true)
    .single();

  if (rewardError || !reward) {
    return { success: false, error: "Reward not found" };
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

  if (currentPlayer.gold < reward.price) {
    return { success: false, error: "Not enough gold" };
  }

  const newGold = currentPlayer.gold - reward.price;

  const { data: savedPlayer, error: updateError } = await supabase
    .from("player")
    .update({ gold: newGold })
    .eq("id", DEFAULT_PLAYER_ID)
    .select("*")
    .single();

  if (updateError || !savedPlayer) {
    return { success: false, error: "Failed to update player" };
  }

  const { data: redemptionRow, error: redemptionError } = await supabase
    .from("reward_redemptions")
    .insert({
      reward_id: reward.id,
      gold_spent: reward.price,
    })
    .select("id, reward_id, gold_spent, created_at")
    .single();

  if (redemptionError || !redemptionRow) {
    return { success: false, error: "Failed to record redemption" };
  }

  const redemption: RewardRedemption = {
    id: redemptionRow.id,
    reward_id: redemptionRow.reward_id,
    reward_name: reward.name,
    gold_spent: redemptionRow.gold_spent,
    created_at: redemptionRow.created_at,
  };

  revalidatePath("/rewards");
  revalidatePath("/");

  return {
    success: true,
    player: savedPlayer as Player,
    redemption,
  };
}
