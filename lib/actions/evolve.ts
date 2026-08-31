"use server";

import { DEFAULT_PLAYER_ID } from "@/lib/constants";
import { canEvolve, getNextStage } from "@/lib/evolution";
import { createServerClient } from "@/lib/supabase/server";
import type { EvolveResult, Player } from "@/lib/types";

export async function evolve(): Promise<EvolveResult> {
  const supabase = createServerClient();

  const { data: player, error: playerError } = await supabase
    .from("player")
    .select("*")
    .eq("id", DEFAULT_PLAYER_ID)
    .single();

  if (playerError || !player) {
    return { success: false, error: "Player not found" };
  }

  const currentPlayer = player as Player;

  if (!canEvolve(currentPlayer)) {
    return { success: false, error: "Evolution requirements not met" };
  }

  const fromStage = currentPlayer.evolution_stage;
  const toStage = getNextStage(fromStage);

  if (!toStage) {
    return { success: false, error: "Already at max evolution stage" };
  }

  const { data: savedPlayer, error: updateError } = await supabase
    .from("player")
    .update({
      evolution_stage: toStage,
      evolution_energy: 0,
    })
    .eq("id", DEFAULT_PLAYER_ID)
    .select("*")
    .single();

  if (updateError || !savedPlayer) {
    return { success: false, error: "Failed to evolve" };
  }

  return {
    success: true,
    player: savedPlayer as Player,
    evolution: { fromStage, toStage },
  };
}
