"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { finishCodingSession } from "@/lib/actions/finish-coding-session";
import type {
  CodingWeekStats,
  EquippedCosmetics,
  LevelUpInfo,
  Player,
} from "@/lib/types";
import CodingThisWeek from "@/components/CodingThisWeek";
import LearningPointsInput, {
  hasValidLearningPoints,
} from "@/components/LearningPointsInput";
import { useDailyQuest } from "@/components/DailyQuestProvider";
import { getValidLearningPoints } from "@/lib/learning-points";
import FloatingReward from "@/components/FloatingReward";
import LevelUpOverlay from "@/components/LevelUpOverlay";
import PerfectDayOverlay from "@/components/PerfectDayOverlay";

const GOAL_PRESETS = [15, 25, 45, 60] as const;

type SessionPhase = "idle" | "running" | "finishing";

type FloatingRewardItem = {
  id: string;
  type: "xp" | "gold";
  amount: number;
};

type CodingSessionSectionProps = {
  initialWeekStats: CodingWeekStats;
  initialEquipped: EquippedCosmetics;
  initialPlayer: Player;
};

function formatElapsed(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default function CodingSessionSection({
  initialWeekStats,
  initialEquipped,
  initialPlayer,
}: CodingSessionSectionProps) {
  const router = useRouter();
  const { markCompleted } = useDailyQuest();
  const [phase, setPhase] = useState<SessionPhase>("idle");
  const [topic, setTopic] = useState("");
  const [goalMinutes, setGoalMinutes] = useState<number>(25);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [learningPoints, setLearningPoints] = useState<string[]>([""]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [weekStats, setWeekStats] = useState(initialWeekStats);
  const [player, setPlayer] = useState(initialPlayer);
  const [floatingRewards, setFloatingRewards] = useState<FloatingRewardItem[]>(
    []
  );
  const [levelUpOverlay, setLevelUpOverlay] = useState<LevelUpInfo | null>(
    null
  );
  const [showPerfectDayOverlay, setShowPerfectDayOverlay] = useState(false);
  const pendingLevelUpRef = useRef<LevelUpInfo | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const goalReached = elapsedSeconds >= goalMinutes * 60;
  const durationMinutes = Math.max(1, Math.ceil(elapsedSeconds / 60));

  useEffect(() => {
    if (phase !== "running") {
      return;
    }

    const interval = setInterval(() => {
      if (startTimeRef.current) {
        setElapsedSeconds(
          Math.floor((Date.now() - startTimeRef.current) / 1000)
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [phase]);

  const removeFloatingReward = useCallback((id: string) => {
    setFloatingRewards((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const closeLevelUpOverlay = useCallback(() => {
    setLevelUpOverlay(null);
  }, []);

  const closePerfectDayOverlay = useCallback(() => {
    setShowPerfectDayOverlay(false);

    if (pendingLevelUpRef.current) {
      setLevelUpOverlay(pendingLevelUpRef.current);
      pendingLevelUpRef.current = null;
    }
  }, []);

  function handleStart() {
    if (!topic.trim()) {
      setError("Enter a topic before starting");
      return;
    }

    setError(null);
    setInfo(null);
    startTimeRef.current = Date.now();
    setElapsedSeconds(0);
    setPhase("running");
  }

  function handleFinish() {
    if (phase === "running") {
      setPhase("finishing");
      return;
    }
  }

  function resetSession() {
    setPhase("idle");
    setTopic("");
    setLearningPoints([""]);
    setElapsedSeconds(0);
    startTimeRef.current = null;
  }

  async function handleSubmitFinish() {
    const cleanedPoints = getValidLearningPoints(learningPoints);
    if (cleanedPoints.length === 0) {
      setError("Write what you learned before finishing");
      return;
    }

    setSaving(true);
    setError(null);
    setInfo(null);

    const result = await finishCodingSession({
      topic: topic.trim(),
      durationMinutes,
      learningPoints: cleanedPoints,
    });

    setSaving(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setWeekStats((prev) => ({
      totalSessions: prev.totalSessions + 1,
      totalMinutes: prev.totalMinutes + result.session.duration_minutes,
      techXpEarned: result.questRewarded
        ? prev.techXpEarned + 3
        : prev.techXpEarned,
    }));

    resetSession();
    router.refresh();

    if (!result.questRewarded) {
      setInfo("Session saved. Daily quest reward already claimed today.");
      return;
    }

    markCompleted("coding", "learn-coding");

    const rewardId = Date.now();
    const newFloatingRewards: FloatingRewardItem[] = [
      { id: `${rewardId}-xp`, type: "xp", amount: result.reward!.xp },
      { id: `${rewardId}-gold`, type: "gold", amount: result.reward!.gold },
    ];

    if (result.perfectDay) {
      newFloatingRewards.push(
        {
          id: `${rewardId}-perfect-xp`,
          type: "xp",
          amount: result.perfectDay.xp,
        },
        {
          id: `${rewardId}-perfect-gold`,
          type: "gold",
          amount: result.perfectDay.gold,
        }
      );
    }

    setFloatingRewards((prev) => [...prev, ...newFloatingRewards]);

    if (result.player) {
      setPlayer(result.player);
    }

    if (result.perfectDay) {
      if (result.levelUp) {
        pendingLevelUpRef.current = result.levelUp;
      }
      setTimeout(() => setShowPerfectDayOverlay(true), 800);
    } else if (result.levelUp) {
      setTimeout(() => setLevelUpOverlay(result.levelUp!), 800);
    }
  }

  const isRunning = phase === "running";
  const isFinishing = phase === "finishing";
  const inputsLocked = isRunning || isFinishing || saving;

  return (
    <div id="coding-session" className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Coding Session</h1>
        <p className="mt-1 text-sm text-muted">
          Focus, learn, and earn your daily coding quest reward.
        </p>
      </div>

      {error && (
        <div
          className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400"
          role="alert"
        >
          {error}
        </div>
      )}

      {info && (
        <div
          className="rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold-light"
          role="status"
        >
          {info}
        </div>
      )}

      <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="coding-topic" className="text-sm font-medium">
            Topic
          </label>
          <input
            id="coding-topic"
            type="text"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            disabled={inputsLocked}
            placeholder="e.g. React hooks, TypeScript generics"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Goal duration</span>
          <div className="flex flex-wrap gap-2">
            {GOAL_PRESETS.map((minutes) => (
              <button
                key={minutes}
                type="button"
                onClick={() => setGoalMinutes(minutes)}
                disabled={inputsLocked}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                  goalMinutes === minutes
                    ? "border-gold/50 bg-gold/15 text-gold-light"
                    : "border-border bg-background text-muted hover:text-foreground"
                }`}
              >
                {minutes} min
              </button>
            ))}
          </div>
        </div>

        <div className="relative flex flex-col items-center gap-1 py-4">
          {floatingRewards.map((reward, index) => (
            <FloatingReward
              key={reward.id}
              id={reward.id}
              type={reward.type}
              amount={reward.amount}
              index={index}
              onComplete={removeFloatingReward}
            />
          ))}
          <span
            className={`font-mono text-4xl font-bold tabular-nums ${
              goalReached ? "text-gold-light" : "text-foreground"
            }`}
          >
            {formatElapsed(elapsedSeconds)}
          </span>
          <span className="text-xs text-muted">
            Goal: {goalMinutes} min
            {goalReached ? " · Goal reached!" : ""}
          </span>
        </div>

        {isFinishing && (
          <LearningPointsInput
            label="What did you learn?"
            idPrefix="coding-learning"
            value={learningPoints}
            onChange={setLearningPoints}
            saving={saving}
            placeholder="Summarize what you practiced or discovered..."
          />
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          {phase === "idle" && (
            <button
              type="button"
              onClick={handleStart}
              disabled={!topic.trim()}
              className="flex-1 rounded-lg border border-gold/40 bg-gold/10 px-4 py-2.5 text-sm font-semibold text-gold-light transition-colors hover:bg-gold/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Start
            </button>
          )}

          {isRunning && (
            <button
              type="button"
              onClick={handleFinish}
              className="flex-1 rounded-lg border border-border bg-surface-elevated px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-white/5"
            >
              Finish Session
            </button>
          )}

          {isFinishing && (
            <>
              <button
                type="button"
                onClick={() => setPhase("running")}
                disabled={saving}
                className="flex-1 rounded-lg border border-border bg-surface-elevated px-4 py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmitFinish}
                disabled={saving || !hasValidLearningPoints(learningPoints)}
                className="flex-1 rounded-lg border border-gold/40 bg-gold/10 px-4 py-2.5 text-sm font-semibold text-gold-light transition-colors hover:bg-gold/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Session"}
              </button>
            </>
          )}
        </div>
      </section>

      <CodingThisWeek stats={weekStats} />

      {levelUpOverlay && (
        <LevelUpOverlay
          fromLevel={levelUpOverlay.fromLevel}
          toLevel={levelUpOverlay.toLevel}
          stage={player.evolution_stage}
          equipped={initialEquipped}
          onClose={closeLevelUpOverlay}
        />
      )}

      {showPerfectDayOverlay && (
        <PerfectDayOverlay onClose={closePerfectDayOverlay} />
      )}
    </div>
  );
}
