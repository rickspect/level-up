import type {
  ActivitySummary,
  ActivityType,
  TodayActivitySummary,
  WorkoutExercise,
  WorkoutExerciseInput,
} from "@/lib/types";
import { serializeLearningPoints, toLearningPoints } from "@/lib/learning-points";

export function formatWorkoutExerciseSummary(
  exercise: Pick<WorkoutExercise, "exercise_name" | "sets" | "reps" | "weight">
): string {
  const base = `${exercise.exercise_name} ${exercise.sets}x${exercise.reps}`;
  if (exercise.weight != null && exercise.weight > 0) {
    return `${base} @ ${exercise.weight}kg`;
  }
  return base;
}

export function formatWorkoutSummary(exercises: WorkoutExercise[]): string {
  if (exercises.length === 0) {
    return "Workout";
  }
  return exercises.map(formatWorkoutExerciseSummary).join(" · ");
}

export function buildBookSummary(
  title: string,
  reference: string | null,
  reflection?: string[] | string | null
): ActivitySummary {
  const points = toLearningPoints(reflection);
  const subtitle = reference?.trim() ? reference.trim() : title;
  return {
    title,
    subtitle: reference?.trim() ? `${title} · ${reference.trim()}` : title,
    reflection:
      points.length > 0 ? serializeLearningPoints(points) : null,
  };
}

export function buildBibleSummary(
  passage: string,
  reflection: string[] | string
): ActivitySummary {
  const points = toLearningPoints(reflection);
  return {
    title: passage,
    subtitle: passage,
    reflection: points.length > 0 ? serializeLearningPoints(points) : null,
  };
}

export function buildWorkoutSummary(
  exercises: WorkoutExerciseInput[],
  notes?: string | null
): ActivitySummary {
  const exerciseSummaries = exercises.map((exercise) =>
    formatWorkoutExerciseSummary({
      exercise_name: exercise.name,
      sets: exercise.sets,
      reps: exercise.reps,
      weight: exercise.weight ?? null,
    })
  );

  return {
    title: "Workout",
    subtitle: exerciseSummaries.join(" · "),
    reflection: notes?.trim() || null,
  };
}

export function buildTodayCardSummary(
  activityType: ActivityType,
  title: string,
  reference: string | null,
  exercises?: WorkoutExercise[]
): string {
  if (activityType === "book") {
    return reference?.trim() ? `${title} · ${reference.trim()}` : title;
  }

  if (activityType === "bible") {
    return title;
  }

  if (activityType === "workout" && exercises && exercises.length > 0) {
    return formatWorkoutSummary(exercises);
  }

  return title;
}

export function toTodayActivitySummary(
  activityType: ActivityType,
  title: string,
  reference: string | null,
  reflection: string | null,
  exercises?: WorkoutExercise[]
): TodayActivitySummary {
  return {
    activityType,
    title,
    reference,
    reflection,
    ...(exercises ? { exercises } : {}),
  };
}

export const ACTIVITY_ICONS: Record<ActivityType, string> = {
  book: "📚",
  bible: "📖",
  workout: "💪",
  coding: "💻",
};

export const CATEGORY_LABELS: Record<ActivityType, string> = {
  book: "Reading",
  bible: "Bible",
  workout: "Workout",
  coding: "Coding",
};
