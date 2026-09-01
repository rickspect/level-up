import { getStartOfWeekUtc } from "@/lib/player-utils";
import { createServerClient } from "@/lib/supabase/server";
import type { CodingSession, CodingWeekStats } from "@/lib/types";

const TECH_STAT_PER_QUEST = 3;

export async function getCodingWeekStats(): Promise<CodingWeekStats> {
  const supabase = createServerClient();
  const startOfWeek = getStartOfWeekUtc();

  const [sessionsResult, logsResult] = await Promise.all([
    supabase
      .from("coding_sessions")
      .select("duration_minutes")
      .gte("created_at", startOfWeek),
    supabase
      .from("activity_logs")
      .select("id")
      .eq("activity_type", "coding")
      .gte("created_at", startOfWeek),
  ]);

  const sessions = sessionsResult.data ?? [];
  const codingLogs = logsResult.data ?? [];

  return {
    totalSessions: sessions.length,
    totalMinutes: sessions.reduce(
      (sum, row) => sum + (row.duration_minutes ?? 0),
      0
    ),
    techXpEarned: codingLogs.length * TECH_STAT_PER_QUEST,
  };
}

export async function getRecentCodingSessions(
  limit = 5
): Promise<CodingSession[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("coding_sessions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data as CodingSession[];
}
