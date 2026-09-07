"use server";

import {
  buildBibleSummary,
  buildBookSummary,
  buildWorkoutSummary,
} from "@/lib/activity-summary";
import {
  serializeLearningPoints,
  validateLearningPoints,
} from "@/lib/learning-points";
import { revalidateActivityPages } from "@/lib/actions/revalidate-progress";
import { getActivityByTypeToday } from "@/lib/db/activity-logs";
import { createServerClient } from "@/lib/supabase/server";
import type { UpdateActivityResult, WorkoutExerciseInput } from "@/lib/types";

async function updateActivityLogRow(
  id: string,
  fields: {
    title: string;
    reference: string | null;
    reflection: string | null;
  }
): Promise<{ error: { code?: string; message: string } | null }> {
  const supabase = createServerClient();

  async function runUpdate(payload: Record<string, string | null>) {
    return supabase
      .from("activity_logs")
      .update(payload)
      .eq("id", id)
      .select("id")
      .maybeSingle();
  }

  let result = await runUpdate({
    ...fields,
    updated_at: new Date().toISOString(),
  });

  if (result.error?.message?.includes("updated_at")) {
    result = await runUpdate(fields);
  }

  if (result.error) {
    return { error: result.error };
  }

  if (!result.data) {
    return {
      error: {
        message:
          "Update did not apply. Run supabase/migrations/002_fix_activity_logs_update_policy.sql in the Supabase SQL Editor.",
      },
    };
  }

  return { error: null };
}

async function fetchActivityLogById(id: string) {
  const supabase = createServerClient();
  return supabase.from("activity_logs").select("*").eq("id", id).single();
}

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
  reflection: string[];
}): Promise<UpdateActivityResult> {
  const title = input.title.trim();
  const reference = input.reference?.trim() || null;
  const validation = validateLearningPoints(input.reflection);

  if (!title) {
    return { success: false, error: "Book title is required" };
  }

  if (!validation.valid) {
    return {
      success: false,
      error:
        validation.error === "At least one learning point is required"
          ? "At least one key takeaway is required"
          : validation.error,
    };
  }

  const reflection = serializeLearningPoints(validation.points);

  const existing = await getActivityByTypeToday("book");
  if (!existing) {
    return { success: false, error: "No book log found for today" };
  }

  const { error: updateError } = await updateActivityLogRow(existing.id, {
    title,
    reference,
    reflection,
  });

  if (updateError) {
    return {
      success: false,
      error: updateError.message || "Failed to update book log",
    };
  }

  const { data: updated, error: selectError } = await fetchActivityLogById(
    existing.id
  );

  if (selectError || !updated) {
    return {
      success: false,
      error: selectError?.message || "Failed to verify book log update",
    };
  }

  if (updated.title !== title || (updated.reflection ?? "") !== reflection) {
    return {
      success: false,
      error:
        "Update did not apply. Run supabase/migrations/002_fix_activity_logs_update_policy.sql in the Supabase SQL Editor.",
    };
  }

  const activitySummary = buildBookSummary(
    updated.title ?? title,
    updated.reference,
    updated.reflection ?? reflection
  );

  revalidateActivityPages("book");

  return {
    success: true,
    activitySummary,
  };
}

export async function updateBibleActivity(input: {
  passage: string;
  reflection: string[];
}): Promise<UpdateActivityResult> {
  const passage = input.passage.trim();
  const validation = validateLearningPoints(input.reflection);

  if (!passage) {
    return { success: false, error: "Passage is required" };
  }

  if (!validation.valid) {
    return { success: false, error: "Reflection is required" };
  }

  const reflection = serializeLearningPoints(validation.points);

  const existing = await getActivityByTypeToday("bible");
  if (!existing) {
    return { success: false, error: "No bible log found for today" };
  }

  const { error: updateError } = await updateActivityLogRow(existing.id, {
    title: passage,
    reference: null,
    reflection,
  });

  if (updateError) {
    return {
      success: false,
      error: updateError.message || "Failed to update bible log",
    };
  }

  const { data: updated, error: selectError } = await fetchActivityLogById(
    existing.id
  );

  if (selectError || !updated) {
    return {
      success: false,
      error: selectError?.message || "Failed to verify bible log update",
    };
  }

  revalidateActivityPages("bible");

  return {
    success: true,
    activitySummary: buildBibleSummary(
      updated.title ?? passage,
      updated.reflection ?? reflection
    ),
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

  const { error: updateError } = await updateActivityLogRow(existing.id, {
    title: "Workout",
    reference: null,
    reflection: notes,
  });

  if (updateError) {
    return {
      success: false,
      error: updateError.message || "Failed to update workout log",
    };
  }

  const exerciseError = await replaceWorkoutExercises(existing.id, exercises);
  if (exerciseError) {
    return { success: false, error: exerciseError };
  }

  const { data: updated, error: selectError } = await fetchActivityLogById(
    existing.id
  );

  if (selectError || !updated) {
    return {
      success: false,
      error: selectError?.message || "Failed to verify workout log update",
    };
  }

  revalidateActivityPages("workout");

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
