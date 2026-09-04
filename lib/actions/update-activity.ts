"use server";

import {
  buildBibleSummary,
  buildBookSummary,
  buildWorkoutSummary,
} from "@/lib/activity-summary";
import { getActivityByTypeToday } from "@/lib/db/activity-logs";
import { getTodayUtcDate } from "@/lib/player-utils";
import { createServerClient } from "@/lib/supabase/server";
import type { UpdateActivityResult, WorkoutExerciseInput } from "@/lib/types";
import { DEFAULT_PLAYER_ID } from "@/lib/constants";

async function replaceWorkoutExercises(
  activityLogId: string,
  exercises: WorkoutExerciseInput[]
): Promise<string | null> {
  const supabase = createServerClient();

  const { error: deleteError } = await supabase
    .from("workout_exercises")
    .delete()
    .eq("activity_log_id", activityLogId);

  if (deleteError) {
    return "Failed to update workout exercises";
  }

  if (exercises.length === 0) {
    return "Add at least one exercise";
  }

  const rows = exercises.map((exercise) => ({
    activity_log_id: activityLogId,
    exercise_name: exercise.name.trim(),
    sets: exercise.sets,
    reps: exercise.reps,
    weight: exercise.weight ?? null,
  }));

  const { error: insertError } = await supabase
    .from("workout_exercises")
    .insert(rows);

  if (insertError) {
    return "Failed to update workout exercises";
  }

  return null;
}

export async function updateBookActivity(input: {
  title: string;
  reference?: string;
  reflection: string;
}): Promise<UpdateActivityResult> {
  const title = input.title.trim();
  const reference = input.reference?.trim() || null;
  const reflection = input.reflection.trim();

  if (!title) {
    return { success: false, error: "Book title is required" };
  }

  if (!reflection) {
    return { success: false, error: "What you learned is required" };
  }

  const existing = await getActivityByTypeToday("book");
  if (!existing) {
    return { success: false, error: "No book log found for today" };
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from("activity_logs")
    .update({
      title,
      reference,
      reflection,
      updated_at: new Date().toISOString(),
    })
    .eq("id", existing.id)
    .eq("user_id", DEFAULT_PLAYER_ID)
    .eq("activity_date", getTodayUtcDate());

  if (error) {
    return { success: false, error: "Failed to update book log" };
  }

  return {
    success: true,
    activitySummary: buildBookSummary(title, reference),
  };
}

export async function updateBibleActivity(input: {
  passage: string;
  reflection: string;
}): Promise<UpdateActivityResult> {
  const passage = input.passage.trim();
  const reflection = input.reflection.trim();

  if (!passage) {
    return { success: false, error: "Passage is required" };
  }

  if (!reflection) {
    return { success: false, error: "Reflection is required" };
  }

  const existing = await getActivityByTypeToday("bible");
  if (!existing) {
    return { success: false, error: "No bible log found for today" };
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from("activity_logs")
    .update({
      title: passage,
      reference: null,
      reflection,
      updated_at: new Date().toISOString(),
    })
    .eq("id", existing.id)
    .eq("user_id", DEFAULT_PLAYER_ID)
    .eq("activity_date", getTodayUtcDate());

  if (error) {
    return { success: false, error: "Failed to update bible log" };
  }

  return {
    success: true,
    activitySummary: buildBibleSummary(passage, reflection),
  };
}

export async function updateWorkoutActivity(input: {
  exercises: WorkoutExerciseInput[];
  notes?: string;
}): Promise<UpdateActivityResult> {
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

  const existing = await getActivityByTypeToday("workout");
  if (!existing) {
    return { success: false, error: "No workout log found for today" };
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from("activity_logs")
    .update({
      title: "Workout",
      reference: null,
      reflection: notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", existing.id)
    .eq("user_id", DEFAULT_PLAYER_ID)
    .eq("activity_date", getTodayUtcDate());

  if (error) {
    return { success: false, error: "Failed to update workout log" };
  }

  const exerciseError = await replaceWorkoutExercises(existing.id, exercises);
  if (exerciseError) {
    return { success: false, error: exerciseError };
  }

  return {
    success: true,
    activitySummary: buildWorkoutSummary(exercises, notes),
  };
}

export async function loadMoreActivities(
  category: "book" | "bible" | "workout" | "coding",
  offset: number,
  limit = 15
) {
  const { getActivitiesByType } = await import("@/lib/db/activity-logs");
  return getActivitiesByType(category, limit, offset);
}
