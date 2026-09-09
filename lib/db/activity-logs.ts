import { DEFAULT_PLAYER_ID } from "@/lib/constants";
import {
  buildTodayCardSummary,
  toTodayActivitySummary,
} from "@/lib/activity-summary";
import { getDefaultPlayer } from "@/lib/db/player";
import {
  getStartOfWeek,
  getTodayDate,
  getWeekStartDate,
} from "@/lib/player-utils";
import { createServerClient } from "@/lib/supabase/server";
import type {
  ActivityLog,
  ActivityType,
  ProgressCategory,
  RecentActivityItem,
  TodayActivitySummary,
  WeeklyProgressStats,
  WorkoutExercise,
} from "@/lib/types";

const FORM_ACTIVITY_TYPES: ActivityType[] = ["book", "bible", "workout"];

async function getWorkoutExercisesForLogs(
  logIds: string[]
): Promise<Map<string, WorkoutExercise[]>> {
  if (logIds.length === 0) {
    return new Map();
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("workout_exercises")
    .select("*")
    .in("activity_log_id", logIds)
    .order("created_at", { ascending: true });

  if (error || !data) {
    return new Map();
  }

  const map = new Map<string, WorkoutExercise[]>();
  for (const row of data as WorkoutExercise[]) {
    const existing = map.get(row.activity_log_id) ?? [];
    existing.push(row);
    map.set(row.activity_log_id, existing);
  }

  return map;
}

export async function getTodayActivitySummaries(): Promise<
  TodayActivitySummary[]
> {
  const supabase = createServerClient();
  const today = getTodayDate();

  const { data, error } = await supabase
    .from("activity_logs")
    .select("*")
    .eq("user_id", DEFAULT_PLAYER_ID)
    .eq("activity_date", today)
    .in("activity_type", FORM_ACTIVITY_TYPES);

  if (error || !data) {
    return [];
  }

  const logs = data as ActivityLog[];
  const workoutLogIds = logs
    .filter((log) => log.activity_type === "workout")
    .map((log) => log.id);
  const exercisesByLog = await getWorkoutExercisesForLogs(workoutLogIds);

  return logs.map((log) => {
    const exercises = exercisesByLog.get(log.id);
    return toTodayActivitySummary(
      log.activity_type,
      log.title ?? "",
      log.reference,
      log.reflection,
      exercises
    );
  });
}

export async function getTodayActivitySummaryMap(): Promise<
  Map<ActivityType, TodayActivitySummary>
> {
  const summaries = await getTodayActivitySummaries();
  return new Map(summaries.map((summary) => [summary.activityType, summary]));
}

export async function getActivityByTypeToday(
  activityType: ActivityType
): Promise<(ActivityLog & { exercises?: WorkoutExercise[] }) | null> {
  const supabase = createServerClient();
  const today = getTodayDate();

  const { data, error } = await supabase
    .from("activity_logs")
    .select("*")
    .eq("user_id", DEFAULT_PLAYER_ID)
    .eq("activity_type", activityType)
    .eq("activity_date", today)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const log = data as ActivityLog;

  if (activityType !== "workout") {
    return log;
  }

  const exercisesByLog = await getWorkoutExercisesForLogs([log.id]);
  return {
    ...log,
    exercises: exercisesByLog.get(log.id) ?? [],
  };
}

export async function getWeeklyProgressStats(): Promise<WeeklyProgressStats> {
  const supabase = createServerClient();
  const weekStartDate = getWeekStartDate();
  const startOfWeek = getStartOfWeek();
  const player = await getDefaultPlayer();

  const [bookResult, bibleResult, workoutResult, codingResult] =
    await Promise.all([
      supabase
        .from("activity_logs")
        .select("activity_date")
        .eq("user_id", DEFAULT_PLAYER_ID)
        .eq("activity_type", "book")
        .gte("activity_date", weekStartDate),
      supabase
        .from("activity_logs")
        .select("activity_date")
        .eq("user_id", DEFAULT_PLAYER_ID)
        .eq("activity_type", "bible")
        .gte("activity_date", weekStartDate),
      supabase
        .from("activity_logs")
        .select("activity_date")
        .eq("user_id", DEFAULT_PLAYER_ID)
        .eq("activity_type", "workout")
        .gte("activity_date", weekStartDate),
      supabase
        .from("coding_sessions")
        .select("id")
        .gte("created_at", startOfWeek),
    ]);

  const uniqueDays = (rows: { activity_date: string }[] | null) =>
    new Set((rows ?? []).map((row) => row.activity_date)).size;

  return {
    readingDays: uniqueDays(bookResult.data),
    bibleDays: uniqueDays(bibleResult.data),
    workoutSessions: (workoutResult.data ?? []).length,
    codingSessions: (codingResult.data ?? []).length,
    currentStreak: player?.streak ?? 0,
  };
}

function logToRecentItem(
  log: ActivityLog,
  exercises?: WorkoutExercise[]
): RecentActivityItem {
  return {
    id: log.id,
    activityType: log.activity_type,
    title: log.title ?? "",
    reference: log.reference,
    reflection: log.reflection,
    ...(exercises ? { exercises } : {}),
    createdAt: log.created_at,
    activityDate: log.activity_date,
    updatedAt: log.updated_at,
  };
}

function codingSessionToRecentItem(session: {
  id: string;
  topic: string;
  learning_note: string;
  created_at: string;
}): RecentActivityItem {
  const activityDate = session.created_at.slice(0, 10);
  return {
    id: session.id,
    activityType: "coding",
    title: session.topic,
    reference: null,
    reflection: session.learning_note,
    createdAt: session.created_at,
    activityDate,
  };
}

export async function getRecentActivities(
  limit = 10,
  offset = 0
): Promise<RecentActivityItem[]> {
  const supabase = createServerClient();
  const fetchCount = limit + offset + 20;

  const [logsResult, codingResult] = await Promise.all([
    supabase
      .from("activity_logs")
      .select("*")
      .eq("user_id", DEFAULT_PLAYER_ID)
      .in("activity_type", FORM_ACTIVITY_TYPES)
      .order("updated_at", { ascending: false })
      .limit(fetchCount),
    supabase
      .from("coding_sessions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(fetchCount),
  ]);

  const logs = (logsResult.data ?? []) as ActivityLog[];
  const workoutLogIds = logs
    .filter((log) => log.activity_type === "workout")
    .map((log) => log.id);
  const exercisesByLog = await getWorkoutExercisesForLogs(workoutLogIds);

  const merged: RecentActivityItem[] = [
    ...logs.map((log) =>
      logToRecentItem(log, exercisesByLog.get(log.id))
    ),
    ...(codingResult.data ?? []).map(codingSessionToRecentItem),
  ];

  merged.sort((a, b) => {
    const aTime = new Date(a.updatedAt ?? a.createdAt).getTime();
    const bTime = new Date(b.updatedAt ?? b.createdAt).getTime();
    return bTime - aTime;
  });

  return merged.slice(offset, offset + limit);
}

export async function getActivitiesByType(
  category: ProgressCategory,
  limit = 15,
  offset = 0
): Promise<RecentActivityItem[]> {
  if (category === "coding") {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("coding_sessions")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error || !data) {
      return [];
    }

    return data.map(codingSessionToRecentItem);
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("activity_logs")
    .select("*")
    .eq("user_id", DEFAULT_PLAYER_ID)
    .eq("activity_type", category)
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error || !data) {
    return [];
  }

  const logs = data as ActivityLog[];

  if (category !== "workout") {
    return logs.map((log) => logToRecentItem(log));
  }

  const exercisesByLog = await getWorkoutExercisesForLogs(
    logs.map((log) => log.id)
  );

  return logs.map((log) =>
    logToRecentItem(log, exercisesByLog.get(log.id) ?? [])
  );
}
