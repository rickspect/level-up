"use server";

import { applyQuestReward } from "@/lib/actions/quest-rewards";
import { getQuestById } from "@/lib/quests";
import type { CompleteQuestResult, QuestId } from "@/lib/types";

export async function completeQuest(
  questId: QuestId
): Promise<CompleteQuestResult> {
  const quest = getQuestById(questId);

  if (!quest) {
    return { success: false, error: "Unknown quest" };
  }

  return applyQuestReward(quest);
}
