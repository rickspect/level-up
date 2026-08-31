"use server";

import { revalidatePath } from "next/cache";
import { getCosmeticById } from "@/lib/cosmetics";
import { DEFAULT_PLAYER_ID } from "@/lib/constants";
import { createServerClient } from "@/lib/supabase/server";
import type { EquipCosmeticResult, EquippedCosmetics } from "@/lib/types";

export async function equipCosmetic(
  cosmeticId: string
): Promise<EquipCosmeticResult> {
  const cosmetic = getCosmeticById(cosmeticId);

  if (!cosmetic) {
    return { success: false, error: "Unknown cosmetic" };
  }

  const supabase = createServerClient();

  const { data: player, error: playerError } = await supabase
    .from("player")
    .select("level, equipped_aura_id, equipped_accessory_id")
    .eq("id", DEFAULT_PLAYER_ID)
    .single();

  if (playerError || !player) {
    return { success: false, error: "Player not found" };
  }

  if (cosmetic.category !== "default" && player.level < cosmetic.unlock_level) {
    return {
      success: false,
      error: `Unlock at Lv. ${cosmetic.unlock_level}`,
    };
  }

  let equippedAuraId = player.equipped_aura_id as string | null;
  let equippedAccessoryId = player.equipped_accessory_id as string | null;

  if (cosmetic.category === "default") {
    equippedAuraId = null;
    equippedAccessoryId = null;
  } else if (cosmetic.slot === "aura") {
    equippedAuraId = cosmetic.id;
  } else if (cosmetic.slot === "accessory") {
    equippedAccessoryId = cosmetic.id;
  }

  const { error: updateError } = await supabase
    .from("player")
    .update({
      equipped_aura_id: equippedAuraId,
      equipped_accessory_id: equippedAccessoryId,
    })
    .eq("id", DEFAULT_PLAYER_ID);

  if (updateError) {
    return { success: false, error: "Failed to update cosmetic" };
  }

  const equipped: EquippedCosmetics = {
    auraId: equippedAuraId,
    accessoryId: equippedAccessoryId,
  };

  revalidatePath("/");
  revalidatePath("/profile");

  return { success: true, equipped };
}

export async function unequipCosmetic(
  slot: "aura" | "accessory"
): Promise<EquipCosmeticResult> {
  const supabase = createServerClient();

  const { data: player, error: playerError } = await supabase
    .from("player")
    .select("equipped_aura_id, equipped_accessory_id")
    .eq("id", DEFAULT_PLAYER_ID)
    .single();

  if (playerError || !player) {
    return { success: false, error: "Player not found" };
  }

  const updatePayload =
    slot === "aura"
      ? { equipped_aura_id: null }
      : { equipped_accessory_id: null };

  const { error: updateError } = await supabase
    .from("player")
    .update(updatePayload)
    .eq("id", DEFAULT_PLAYER_ID);

  if (updateError) {
    return { success: false, error: "Failed to update cosmetic" };
  }

  const equipped: EquippedCosmetics = {
    auraId: slot === "aura" ? null : (player.equipped_aura_id as string | null),
    accessoryId:
      slot === "accessory"
        ? null
        : (player.equipped_accessory_id as string | null),
  };

  revalidatePath("/");
  revalidatePath("/profile");

  return { success: true, equipped };
}
