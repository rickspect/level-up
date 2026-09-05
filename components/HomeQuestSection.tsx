"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { evolve } from "@/lib/actions/evolve";
import { toPlayerStatsData } from "@/lib/player-utils";
import type {
  EquippedCosmetics,
  EvolutionInfo,
  LevelUpInfo,
  Player,
  QuestReward,
  TodayActivitySummary,
} from "@/lib/types";
import type { ActivityType } from "@/lib/types";
import Avatar from "@/components/Avatar";
import DailyQuestSection from "@/components/DailyQuestSection";
import {
  useDailyQuest,
  type PendingQuestReward,
} from "@/components/DailyQuestProvider";
import EvolutionOverlay from "@/components/EvolutionOverlay";
import EvolutionProgress from "@/components/EvolutionProgress";
import FloatingReward from "@/components/FloatingReward";
import LevelUpOverlay from "@/components/LevelUpOverlay";
import PerfectDayOverlay from "@/components/PerfectDayOverlay";
import PlayerStats from "@/components/PlayerStats";

type FloatingRewardItem = {
  id: string;
  type: "xp" | "gold";
  amount: number;
};

type HomeQuestSectionProps = {
  initialPlayer: Player;
  initialCompletedActivityTypes: ActivityType[];
  initialTodaySummaries: TodayActivitySummary[];
  initialEquipped: EquippedCosmetics;
};

export default function HomeQuestSection({
  initialPlayer,
  initialCompletedActivityTypes,
  initialTodaySummaries,
  initialEquipped,
}: HomeQuestSectionProps) {
  const { setRewardCallback, setPlayerUpdateCallback } = useDailyQuest();

  const [player, setPlayer] = useState(initialPlayer);
  const [error, setError] = useState<string | null>(null);
  const [floatingRewards, setFloatingRewards] = useState<FloatingRewardItem[]>(
    []
  );
  const [levelUpOverlay, setLevelUpOverlay] = useState<LevelUpInfo | null>(
    null
  );
  const [showPerfectDayOverlay, setShowPerfectDayOverlay] = useState(false);
  const pendingLevelUpRef = useRef<LevelUpInfo | null>(null);
  const [evolutionOverlay, setEvolutionOverlay] =
    useState<EvolutionInfo | null>(null);
  const [evolving, setEvolving] = useState(false);

  const removeFloatingReward = useCallback((id: string) => {
    setFloatingRewards((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const closeLevelUpOverlay = useCallback(() => {
    setLevelUpOverlay(null);
  }, []);

  const closePerfectDayOverlay = useCallback(() => {
    setShowPerfectDayOverlay(false);

    if (pendingLevelUpRef.current) {
      setLevelUpOverlay(pendingLevelUpRef.current);
      pendingLevelUpRef.current = null;
    }
  }, []);

  const closeEvolutionOverlay = useCallback(() => {
    setEvolutionOverlay(null);
  }, []);

  const triggerRewardAnimations = useCallback(
    (
      reward: QuestReward,
      levelUp?: LevelUpInfo,
      perfectDay?: { xp: number; gold: number; energy: number }
    ) => {
      const rewardId = Date.now();
      const newFloatingRewards: FloatingRewardItem[] = [
        { id: `${rewardId}-xp`, type: "xp", amount: reward.xp },
        { id: `${rewardId}-gold`, type: "gold", amount: reward.gold },
      ];

      if (perfectDay) {
        newFloatingRewards.push(
          {
            id: `${rewardId}-perfect-xp`,
            type: "xp",
            amount: perfectDay.xp,
          },
          {
            id: `${rewardId}-perfect-gold`,
            type: "gold",
            amount: perfectDay.gold,
          }
        );
      }

      setFloatingRewards((prev) => [...prev, ...newFloatingRewards]);

      if (perfectDay) {
        if (levelUp) {
          pendingLevelUpRef.current = levelUp;
        }
        setTimeout(() => setShowPerfectDayOverlay(true), 800);
      } else if (levelUp) {
        setTimeout(() => setLevelUpOverlay(levelUp), 800);
      }
    },
    []
  );

  const handleRewardEarned = useCallback(
    (pending: PendingQuestReward) => {
      triggerRewardAnimations(
        pending.reward,
        pending.levelUp,
        pending.perfectDay
      );
    },
    [triggerRewardAnimations]
  );

  useEffect(() => {
    setRewardCallback(handleRewardEarned);
    setPlayerUpdateCallback(setPlayer);
    return () => {
      setRewardCallback(null);
      setPlayerUpdateCallback(null);
    };
  }, [
    handleRewardEarned,
    setRewardCallback,
    setPlayerUpdateCallback,
  ]);

  async function handleEvolve() {
    setEvolving(true);
    setError(null);

    const result = await evolve();

    setEvolving(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setPlayer(result.player);
    setEvolutionOverlay(result.evolution);
  }

  return (
    <>
      <PlayerStats player={toPlayerStatsData(player)} />

      <EvolutionProgress
        player={player}
        onEvolve={handleEvolve}
        evolving={evolving}
      />

      {error && (
        <div
          className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="relative flex justify-center py-2">
        {floatingRewards.map((reward, index) => (
          <FloatingReward
            key={reward.id}
            id={reward.id}
            type={reward.type}
            amount={reward.amount}
            index={index}
            onComplete={removeFloatingReward}
          />
        ))}
        <Avatar stage={player.evolution_stage} equipped={initialEquipped} />
      </div>

      <DailyQuestSection
        variant="home"
        initialCompletedActivityTypes={initialCompletedActivityTypes}
        initialTodaySummaries={initialTodaySummaries}
      />

      {levelUpOverlay && (
        <LevelUpOverlay
          fromLevel={levelUpOverlay.fromLevel}
          toLevel={levelUpOverlay.toLevel}
          stage={player.evolution_stage}
          equipped={initialEquipped}
          onClose={closeLevelUpOverlay}
        />
      )}

      {showPerfectDayOverlay && (
        <PerfectDayOverlay onClose={closePerfectDayOverlay} />
      )}

      {evolutionOverlay && (
        <EvolutionOverlay
          fromStage={evolutionOverlay.fromStage}
          toStage={evolutionOverlay.toStage}
          equipped={initialEquipped}
          onClose={closeEvolutionOverlay}
        />
      )}
    </>
  );
}
