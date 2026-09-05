import type { Quest, QuestId } from "@/lib/types";

export const dailyQuests: Quest[] = [
  {
    id: "read-book",
    title: "Read Book",
    activityType: "book",
    reward: { xp: 30, gold: 15, stat: "knowledge", statAmount: 3 },
  },
  {
    id: "read-bible",
    title: "Read Bible",
    activityType: "bible",
    reward: { xp: 20, gold: 10, stat: "faith", statAmount: 3 },
  },
  {
    id: "workout",
    title: "Workout",
    activityType: "workout",
    reward: { xp: 40, gold: 20, stat: "fitness", statAmount: 3 },
  },
  {
    id: "learn-coding",
    title: "Learn Coding",
    activityType: "coding",
    reward: { xp: 40, gold: 20, stat: "tech", statAmount: 3 },
  },
];

export function getQuestById(questId: QuestId): Quest | undefined {
  return dailyQuests.find((quest) => quest.id === questId);
}

export function formatRewardSummary(quest: Quest): string {
  const { reward } = quest;
  const statLabel =
    reward.stat.charAt(0).toUpperCase() + reward.stat.slice(1);
  return `+${reward.xp} XP, +${reward.gold} Gold, ${statLabel} +${reward.statAmount}`;
}

export const QUEST_INCOMPLETE_SUBTITLES: Record<QuestId, string> = {
  "read-book": "Log your reading",
  "read-bible": "Log your passage",
  workout: "Log your activity",
  "learn-coding": "Start a coding session",
};

export const QUEST_FORM_META: Record<
  Exclude<QuestId, "learn-coding">,
  {
    icon: string;
    description: string;
    successTitle: string;
    successSubtitle: string;
  }
> = {
  "read-book": {
    icon: "📚",
    description: "Capture what you learned",
    successTitle: "Book Logged!",
    successSubtitle: "Great job! Keep going!",
  },
  "read-bible": {
    icon: "📖",
    description: "Log your passage",
    successTitle: "Passage Logged!",
    successSubtitle: "Great job! Keep going!",
  },
  workout: {
    icon: "💪",
    description: "Log your activity",
    successTitle: "Workout Logged!",
    successSubtitle: "Great job! Keep going!",
  },
};
