import { createServerClient } from "@/lib/supabase/server";
import type { Reward, RewardRedemption } from "@/lib/types";

export async function getActiveRewards(): Promise<Reward[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("rewards")
    .select("*")
    .eq("is_active", true)
    .order("price", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data as Reward[];
}

export async function getRewardRedemptions(
  limit = 20
): Promise<RewardRedemption[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("reward_redemptions")
    .select("id, reward_id, gold_spent, created_at, rewards(name)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data.map((row) => {
    const reward = row.rewards as { name: string } | { name: string }[] | null;
    const rewardName = Array.isArray(reward)
      ? reward[0]?.name ?? "Unknown"
      : reward?.name ?? "Unknown";

    return {
      id: row.id,
      reward_id: row.reward_id,
      reward_name: rewardName,
      gold_spent: row.gold_spent,
      created_at: row.created_at,
    };
  });
}
