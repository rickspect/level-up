"use server";

import { applyQuestReward } from "@/lib/actions/quest-rewards";
import { getQuestById } from "@/lib/quests";
import { createServerClient } from "@/lib/supabase/server";
import type { CodingSession, FinishCodingSessionResult } from "@/lib/types";

type FinishCodingSessionInput = {
  topic: string;
  durationMinutes: number;
  learningNote: string;
};

export async function finishCodingSession(
  input: FinishCodingSessionInput
): Promise<FinishCodingSessionResult> {
  const topic = input.topic.trim();
  const learningNote = input.learningNote.trim();
  const durationMinutes = Math.round(input.durationMinutes);

  if (!topic) {
    return { success: false, error: "Topic is required" };
  }

  if (durationMinutes < 1) {
    return { success: false, error: "Session must be at least 1 minute" };
  }

  if (!learningNote) {
    return { success: false, error: "Learning note is required" };
  }

  const supabase = createServerClient();

  const { data: sessionRow, error: sessionError } = await supabase
    .from("coding_sessions")
    .insert({
      topic,
      duration_minutes: durationMinutes,
      learning_note: learningNote,
    })
    .select("*")
    .single();

  if (sessionError || !sessionRow) {
    return { success: false, error: "Failed to save coding session" };
  }

  const session = sessionRow as CodingSession;
  const quest = getQuestById("learn-coding");

  if (!quest) {
    return { success: false, error: "Coding quest not found" };
  }

  const rewardResult = await applyQuestReward(quest, { durationMinutes });

  if (!rewardResult.success) {
    if (rewardResult.error === "Already completed today") {
      return {
        success: true,
        session,
        questRewarded: false,
      };
    }

    return { success: false, error: rewardResult.error };
  }

  return {
    success: true,
    session,
    questRewarded: true,
    player: rewardResult.player,
    reward: rewardResult.reward,
    ...(rewardResult.levelUp ? { levelUp: rewardResult.levelUp } : {}),
    ...(rewardResult.perfectDay ? { perfectDay: rewardResult.perfectDay } : {}),
  };
}
