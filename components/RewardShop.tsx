"use client";

import { useState } from "react";
import { redeemReward } from "@/lib/actions/redeem-reward";
import type { Player, Reward, RewardRedemption } from "@/lib/types";

type RewardShopProps = {
  initialPlayer: Player;
  initialRewards: Reward[];
  initialRedemptions: RewardRedemption[];
};

function formatRedemptionDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function RewardShop({
  initialPlayer,
  initialRewards,
  initialRedemptions,
}: RewardShopProps) {
  const [player, setPlayer] = useState(initialPlayer);
  const [redemptions, setRedemptions] = useState(initialRedemptions);
  const [loadingRewardId, setLoadingRewardId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRedeem(rewardId: string) {
    const reward = initialRewards.find((item) => item.id === rewardId);
    if (!reward || player.gold < reward.price) {
      return;
    }

    setLoadingRewardId(rewardId);
    setError(null);

    const result = await redeemReward(rewardId);

    setLoadingRewardId(null);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setPlayer(result.player);
    setRedemptions((prev) => [result.redemption, ...prev]);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Reward Shop</h1>
        <p className="mt-1 text-sm text-muted">
          Spend gold on real-life treats you earn.
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-gold/30 bg-surface-elevated px-4 py-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-5 w-5 text-gold"
          aria-hidden
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.79-1.11 2.79-2.85 0-2.11-1.72-2.83-3.66-3.31z" />
        </svg>
        <span className="text-sm text-muted">Your Gold</span>
        <span className="ml-auto font-semibold text-gold-light">
          {player.gold.toLocaleString()}
        </span>
      </div>

      {error && (
        <div
          className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400"
          role="alert"
        >
          {error}
        </div>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
          Available Rewards
        </h2>
        <div className="flex flex-col gap-2">
          {initialRewards.map((reward) => {
            const canAfford = player.gold >= reward.price;
            const isLoading = loadingRewardId === reward.id;

            return (
              <div
                key={reward.id}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-surface-elevated px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{reward.name}</p>
                  <p className="text-sm text-gold-light">
                    {reward.price.toLocaleString()} Gold
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRedeem(reward.id)}
                  disabled={!canAfford || isLoading}
                  className="shrink-0 rounded-lg border border-gold/40 bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold-light transition-colors hover:bg-gold/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? "Redeeming..." : "Redeem"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
          Redemption History
        </h2>
        {redemptions.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-surface-elevated px-4 py-6 text-center text-sm text-muted">
            No redemptions yet. Complete quests to earn gold!
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {redemptions.map((redemption) => (
              <div
                key={redemption.id}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-surface-elevated px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">
                    {redemption.reward_name}
                  </p>
                  <p className="text-xs text-muted">
                    {formatRedemptionDate(redemption.created_at)}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-gold-light">
                  -{redemption.gold_spent.toLocaleString()} Gold
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
