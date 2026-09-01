"use client";

import { useCallback, useRef, useState } from "react";
import { completeQuest } from "@/lib/actions/complete-quest";
import { evolve } from "@/lib/actions/evolve";
import { dailyQuests } from "@/lib/quests";
import { toPlayerStatsData } from "@/lib/player-utils";
import type {
  ActivityType,
  EquippedCosmetics,
  EvolutionInfo,
  LevelUpInfo,
  Player,
  QuestId,
} from "@/lib/types";
import Avatar from "@/components/Avatar";
import EvolutionOverlay from "@/components/EvolutionOverlay";
import EvolutionProgress from "@/components/EvolutionProgress";
import FloatingReward from "@/components/FloatingReward";
import LevelUpOverlay from "@/components/LevelUpOverlay";
import PerfectDayOverlay from "@/components/PerfectDayOverlay";
import PlayerStats from "@/components/PlayerStats";
import QuestCard from "@/components/QuestCard";

type FloatingRewardItem = {
  id: string;
  type: "xp" | "gold";
  amount: number;
};

type HomeQuestSectionProps = {
  initialPlayer: Player;
  initialCompletedActivityTypes: ActivityType[];
  initialEquipped: EquippedCosmetics;
};

export default function HomeQuestSection({
  initialPlayer,
  initialCompletedActivityTypes,
  initialEquipped,
}: HomeQuestSectionProps) {
  const [player, setPlayer] = useState(initialPlayer);
  const [completedActivityTypes, setCompletedActivityTypes] = useState(
    new Set(initialCompletedActivityTypes)
  );
  const [loadingQuestId, setLoadingQuestId] = useState<QuestId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [justCompletedQuestId, setJustCompletedQuestId] =
    useState<QuestId | null>(null);
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

  async function handleCompleteQuest(questId: QuestId) {
    const quest = dailyQuests.find((item) => item.id === questId);
    if (!quest || completedActivityTypes.has(quest.activityType)) {
      return;
    }

    setLoadingQuestId(questId);
    setError(null);

    const result = await completeQuest(questId);

    setLoadingQuestId(null);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setJustCompletedQuestId(questId);
    setTimeout(() => setJustCompletedQuestId(null), 600);

    const rewardId = Date.now();
    const newFloatingRewards: FloatingRewardItem[] = [
      { id: `${rewardId}-xp`, type: "xp", amount: result.reward.xp },
      { id: `${rewardId}-gold`, type: "gold", amount: result.reward.gold },
    ];

    if (result.perfectDay) {
      newFloatingRewards.push(
        {
          id: `${rewardId}-perfect-xp`,
          type: "xp",
          amount: result.perfectDay.xp,
        },
        {
          id: `${rewardId}-perfect-gold`,
          type: "gold",
          amount: result.perfectDay.gold,
        }
      );
    }

    setFloatingRewards((prev) => [...prev, ...newFloatingRewards]);

    setPlayer(result.player);
    setCompletedActivityTypes(
      (prev) => new Set([...prev, result.activityType])
    );

    if (result.perfectDay) {
      if (result.levelUp) {
        pendingLevelUpRef.current = result.levelUp;
      }
      setTimeout(() => setShowPerfectDayOverlay(true), 800);
    } else if (result.levelUp) {
      setTimeout(() => setLevelUpOverlay(result.levelUp!), 800);
    }
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

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
          Daily Quests
        </h2>
        <div className="flex flex-col gap-2">
          {dailyQuests.map((quest) => {
            const completed = completedActivityTypes.has(quest.activityType);
            const isLoading = loadingQuestId === quest.id;
            const isCodingQuest = quest.id === "learn-coding";

            return (
              <QuestCard
                key={quest.id}
                title={quest.title}
                completed={completed}
                disabled={completed || isLoading}
                loading={isLoading}
                justCompleted={justCompletedQuestId === quest.id}
                href={isCodingQuest && !completed ? "/quests" : undefined}
                subtitle={
                  isCodingQuest && !completed
                    ? "Start a coding session"
                    : undefined
                }
                onComplete={
                  isCodingQuest
                    ? undefined
                    : () => handleCompleteQuest(quest.id)
                }
              />
            );
          })}
        </div>
      </section>

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
