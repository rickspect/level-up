"use server";

import { applyQuestReward } from "@/lib/actions/quest-rewards";
import { revalidateActivityPages } from "@/lib/actions/revalidate-progress";
import {
  buildBibleSummary,
  buildBookSummary,
  buildWorkoutSummary,
} from "@/lib/activity-summary";
import { getQuestById } from "@/lib/quests";
import { createServerClient } from "@/lib/supabase/server";
import type { SaveActivityResult, WorkoutExerciseInput } from "@/lib/types";

async function insertWorkoutExercises(
  activityLogId: string,
  exercises: WorkoutExerciseInput[]
): Promise<string | null> {
  const supabase = createServerClient();

  const rows = exercises.map((exercise) => ({
    activity_log_id: activityLogId,
    exercise_name: exercise.name.trim(),
    sets: exercise.sets,
    reps: exercise.reps,
    weight: exercise.weight ?? null,
  }));

  const { error } = await supabase.from("workout_exercises").insert(rows);

  if (error) {
    return "Failed to save workout exercises";
  }

  return null;
}

export async function saveBookActivity(input: {
  title: string;
  reference?: string;
  reflection: string;
}): Promise<SaveActivityResult> {
  const title = input.title.trim();
  const reference = input.reference?.trim() || null;
  const reflection = input.reflection.trim();

  if (!title) {
    return { success: false, error: "Book title is required" };
  }

  if (!reflection) {
    return { success: false, error: "What you learned is required" };
  }

  const quest = getQuestById("read-book");
  if (!quest) {
    return { success: false, error: "Quest not found" };
  }

  const result = await applyQuestReward(quest, {
    title,
    reference,
    reflection,
  });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidateActivityPages("book");

  return {
    success: true,
    player: result.player,
    reward: result.reward,
    activityType: result.activityType,
    activitySummary: buildBookSummary(title, reference, reflection),
    ...(result.levelUp ? { levelUp: result.levelUp } : {}),
    ...(result.perfectDay ? { perfectDay: result.perfectDay } : {}),
  };
}

export async function saveBibleActivity(input: {
  passage: string;
  reflection: string;
}): Promise<SaveActivityResult> {
  const passage = input.passage.trim();
  const reflection = input.reflection.trim();

  if (!passage) {
    return { success: false, error: "Passage is required" };
  }

  if (!reflection) {
    return { success: false, error: "Reflection is required" };
  }

  const quest = getQuestById("read-bible");
  if (!quest) {
    return { success: false, error: "Quest not found" };
  }

  const result = await applyQuestReward(quest, {
    title: passage,
    reference: null,
    reflection,
  });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidateActivityPages("bible");

  return {
    success: true,
    player: result.player,
    reward: result.reward,
    activityType: result.activityType,
    activitySummary: buildBibleSummary(passage, reflection),
    ...(result.levelUp ? { levelUp: result.levelUp } : {}),
    ...(result.perfectDay ? { perfectDay: result.perfectDay } : {}),
  };
}

export async function saveWorkoutActivity(input: {
  exercises: WorkoutExerciseInput[];
  notes?: string;
}): Promise<SaveActivityResult> {
  const notes = input.notes?.trim() || null;
  const exercises = input.exercises
    .map((exercise) => ({
      name: exercise.name.trim(),
      sets: Math.round(exercise.sets),
      reps: Math.round(exercise.reps),
      weight: exercise.weight ?? null,
    }))
    .filter((exercise) => exercise.name.length > 0);

  if (exercises.length === 0) {
    return { success: false, error: "Add at least one exercise" };
  }

  for (const exercise of exercises) {
    if (exercise.sets < 1) {
      return { success: false, error: "Sets must be at least 1" };
    }
    if (exercise.reps < 1) {
      return { success: false, error: "Reps must be at least 1" };
    }
  }

  const quest = getQuestById("workout");
  if (!quest) {
    return { success: false, error: "Quest not found" };
  }

  const result = await applyQuestReward(quest, {
    title: "Workout",
    reference: null,
    reflection: notes,
  });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  const exerciseError = await insertWorkoutExercises(
    result.activityLogId,
    exercises
  );

  if (exerciseError) {
    return { success: false, error: exerciseError };
  }

  revalidateActivityPages("workout");

  return {
    success: true,
    player: result.player,
    reward: result.reward,
    activityType: result.activityType,
    activitySummary: buildWorkoutSummary(exercises, notes),
    ...(result.levelUp ? { levelUp: result.levelUp } : {}),
    ...(result.perfectDay ? { perfectDay: result.perfectDay } : {}),
  };
}
