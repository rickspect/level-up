import { DEFAULT_PLAYER_ID } from "@/lib/constants";
import { getStartOfTodayUtc } from "@/lib/player-utils";
import { createServerClient } from "@/lib/supabase/server";
import type { ActivityType, Player } from "@/lib/types";

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
  const startOfToday = getStartOfTodayUtc();

  const { data, error } = await supabase
    .from("activity_logs")
    .select("activity_type")
    .gte("created_at", startOfToday);

  if (error || !data) {
    return [];
  }

  return data.map((row) => row.activity_type as ActivityType);
}
