import { getDefaultPlayer } from "@/lib/db/player";
import { getActiveRewards, getRewardRedemptions } from "@/lib/db/rewards";
import RewardShop from "@/components/RewardShop";

export default async function RewardsPage() {
  const [player, rewards, redemptions] = await Promise.all([
    getDefaultPlayer(),
    getActiveRewards(),
    getRewardRedemptions(),
  ]);

  if (!player) {
    return (
      <div className="flex flex-col gap-2 px-4 py-6">
        <h1 className="text-xl font-semibold">Rewards</h1>
        <p className="text-sm text-muted">Player not found.</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <RewardShop
        initialPlayer={player}
        initialRewards={rewards}
        initialRedemptions={redemptions}
      />
    </div>
  );
}
