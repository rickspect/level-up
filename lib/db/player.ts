import { DEFAULT_PLAYER_ID } from "@/lib/constants";
import { getStartOfToday, getTodayDate } from "@/lib/player-utils";
import { createServerClient } from "@/lib/supabase/server";
import { getEquippedCosmeticsFromPlayer } from "@/lib/cosmetics";
import type { ActivityType, EquippedCosmetics, Player } from "@/lib/types";

export async function getDefaultPlayer(): Promise<Player | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("player")
    .select("*")
    .eq("id", DEFAULT_PLAYER_ID)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Player;
}

export async function getTodayCompletedActivityTypes(): Promise<
  ActivityType[]
> {
  const supabase = createServerClient();
  const today = getTodayDate();

  const { data, error } = await supabase
    .from("activity_logs")
    .select("activity_type")
    .eq("user_id", DEFAULT_PLAYER_ID)
    .eq("activity_date", today);

  if (error || !data) {
    return [];
  }

  return data.map((row) => row.activity_type as ActivityType);
}

export async function getEquippedCosmetics(): Promise<EquippedCosmetics> {
  const player = await getDefaultPlayer();

  if (!player) {
    return { auraId: null, accessoryId: null };
  }

  return getEquippedCosmeticsFromPlayer(player);
}

export async function hasPerfectDayClaimToday(): Promise<boolean> {
  const supabase = createServerClient();
  const startOfToday = getStartOfToday();

  const { data, error } = await supabase
    .from("perfect_day_claims")
    .select("id")
    .gte("created_at", startOfToday)
    .maybeSingle();

  if (error) {
    return false;
  }

  return Boolean(data);
}
