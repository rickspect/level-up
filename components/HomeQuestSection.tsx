"use client";

import { useState } from "react";
import { completeQuest } from "@/lib/actions/complete-quest";
import { dailyQuests, formatRewardSummary } from "@/lib/quests";
import { toPlayerStatsData } from "@/lib/player-utils";
import type { ActivityType, Player, QuestId } from "@/lib/types";
import Avatar from "@/components/Avatar";
import PlayerStats from "@/components/PlayerStats";
import QuestCard from "@/components/QuestCard";

type HomeQuestSectionProps = {
  initialPlayer: Player;
  initialCompletedActivityTypes: ActivityType[];
};

export default function HomeQuestSection({
  initialPlayer,
  initialCompletedActivityTypes,
}: HomeQuestSectionProps) {
  const [player, setPlayer] = useState(initialPlayer);
  const [completedActivityTypes, setCompletedActivityTypes] = useState(
    new Set(initialCompletedActivityTypes)
  );
  const [loadingQuestId, setLoadingQuestId] = useState<QuestId | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

    setPlayer(result.player);
    setCompletedActivityTypes(
      (prev) => new Set([...prev, result.activityType])
    );
    setFeedback(`Quest Complete! ${formatRewardSummary(quest)}`);
  }

  return (
    <>
      <PlayerStats player={toPlayerStatsData(player)} />

      {feedback && (
        <div
          className="rounded-xl border border-xp/40 bg-xp/10 px-4 py-3 text-sm font-medium text-xp"
          role="status"
        >
          {feedback}
        </div>
      )}

      {error && (
        <div
          className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="flex justify-center py-2">
        <Avatar />
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
          Daily Quests
        </h2>
        <div className="flex flex-col gap-2">
          {dailyQuests.map((quest) => {
            const completed = completedActivityTypes.has(quest.activityType);
            const isLoading = loadingQuestId === quest.id;

            return (
              <QuestCard
                key={quest.id}
                title={quest.title}
                completed={completed}
                disabled={completed || isLoading}
                loading={isLoading}
                onComplete={() => handleCompleteQuest(quest.id)}
              />
            );
          })}
        </div>
      </section>
    </>
  );
}
