"use client";

import { useEffect } from "react";
import { ACTIVITY_ICONS, buildTodayCardSummary } from "@/lib/activity-summary";
import { dailyQuests, QUEST_INCOMPLETE_SUBTITLES } from "@/lib/quests";
import type { ActivityType, TodayActivitySummary } from "@/lib/types";
import { useDailyQuest } from "@/components/DailyQuestProvider";
import QuestCard from "@/components/QuestCard";

type DailyQuestSectionProps = {
  variant: "home" | "hub";
  initialCompletedActivityTypes: ActivityType[];
  initialTodaySummaries: TodayActivitySummary[];
};

function scrollToCodingSession() {
  document
    .getElementById("coding-session")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function DailyQuestSection({
  variant,
  initialCompletedActivityTypes,
  initialTodaySummaries,
}: DailyQuestSectionProps) {
  const {
    completedActivityTypes,
    todaySummaries,
    justCompletedQuestId,
    hydrate,
    openQuestForm,
  } = useDailyQuest();

  useEffect(() => {
    hydrate(initialCompletedActivityTypes, initialTodaySummaries);
  }, [hydrate, initialCompletedActivityTypes, initialTodaySummaries]);

  const isHub = variant === "hub";

  return (
    <section>
      <h2
        className={`font-semibold uppercase tracking-wider text-muted ${
          isHub ? "mb-2 text-xs" : "mb-3 text-sm"
        }`}
      >
        Daily Quests
      </h2>
      <div className="flex flex-col gap-2">
        {dailyQuests.map((quest) => {
          const completed = completedActivityTypes.has(quest.activityType);
          const isCodingQuest = quest.id === "learn-coding";
          const summary = todaySummaries.get(quest.activityType);
          const cardSummary = isCodingQuest && completed
            ? "Completed"
            : summary
              ? buildTodayCardSummary(
                  summary.activityType,
                  summary.title,
                  summary.reference,
                  summary.exercises
                )
              : undefined;

          const subtitle = !completed
            ? QUEST_INCOMPLETE_SUBTITLES[quest.id]
            : undefined;

          if (isHub) {
            return (
              <QuestCard
                key={quest.id}
                variant="hub"
                icon={ACTIVITY_ICONS[quest.activityType]}
                title={quest.title}
                completed={completed}
                justCompleted={justCompletedQuestId === quest.id}
                subtitle={subtitle}
                summary={cardSummary}
                showChevron={!completed}
                href={undefined}
                onComplete={
                  isCodingQuest
                    ? scrollToCodingSession
                    : () => openQuestForm(quest.id)
                }
              />
            );
          }

          return (
            <QuestCard
              key={quest.id}
              title={quest.title}
              completed={completed}
              justCompleted={justCompletedQuestId === quest.id}
              href={isCodingQuest ? "/quests" : undefined}
              subtitle={subtitle}
              summary={cardSummary}
              showChevron={!completed}
              onComplete={
                isCodingQuest ? undefined : () => openQuestForm(quest.id)
              }
            />
          );
        })}
      </div>
    </section>
  );
}
