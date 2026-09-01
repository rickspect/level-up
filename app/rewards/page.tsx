import { getDefaultPlayer } from "@/lib/db/player";
import { getActiveRewards, getRewardRedemptions } from "@/lib/db/rewards";
import RewardShop from "@/components/RewardShop";
import PageTransition from "@/components/PageTransition";
import EmptyState from "@/components/EmptyState";

export default async function RewardsPage() {
  const [player, rewards, redemptions] = await Promise.all([
    getDefaultPlayer(),
    getActiveRewards(),
    getRewardRedemptions(),
  ]);

  if (!player) {
    return (
      <PageTransition>
        <div className="flex flex-col gap-4 px-4 py-6">
          <h1 className="text-xl font-semibold">Rewards</h1>
          <EmptyState message="Player not found. Run supabase/schema.sql in the Supabase SQL Editor, then refresh this page." />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="px-4 py-6">
        <RewardShop
          initialPlayer={player}
          initialRewards={rewards}
          initialRedemptions={redemptions}
        />
      </div>
    </PageTransition>
  );
}
