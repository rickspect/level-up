"use client";

import { useCallback, useRef, useState } from "react";
import {
  saveBibleActivity,
  saveBookActivity,
  saveWorkoutActivity,
} from "@/lib/actions/save-activity";
import {
  updateBibleActivity,
  updateBookActivity,
  updateWorkoutActivity,
} from "@/lib/actions/update-activity";
import { evolve } from "@/lib/actions/evolve";
import { buildTodayCardSummary } from "@/lib/activity-summary";
import { dailyQuests, QUEST_FORM_META } from "@/lib/quests";
import { toPlayerStatsData } from "@/lib/player-utils";
import type {
  ActivitySummary,
  ActivityType,
  EquippedCosmetics,
  EvolutionInfo,
  LevelUpInfo,
  Player,
  QuestId,
  QuestReward,
  SaveActivityResult,
  TodayActivitySummary,
  UpdateActivityResult,
} from "@/lib/types";
import Avatar from "@/components/Avatar";
import EvolutionOverlay from "@/components/EvolutionOverlay";
import EvolutionProgress from "@/components/EvolutionProgress";
import FloatingReward from "@/components/FloatingReward";
import LevelUpOverlay from "@/components/LevelUpOverlay";
import PerfectDayOverlay from "@/components/PerfectDayOverlay";
import PlayerStats from "@/components/PlayerStats";
import QuestCard from "@/components/QuestCard";
import QuestFormSheet from "@/components/QuestFormSheet";
import QuestSuccessScreen from "@/components/QuestSuccessScreen";
import ReadBibleForm from "@/components/ReadBibleForm";
import ReadBookForm from "@/components/ReadBookForm";
import WorkoutForm from "@/components/WorkoutForm";

type FloatingRewardItem = {
  id: string;
  type: "xp" | "gold";
  amount: number;
};

type FormQuestId = Exclude<QuestId, "learn-coding">;

type HomeQuestSectionProps = {
  initialPlayer: Player;
  initialCompletedActivityTypes: ActivityType[];
  initialTodaySummaries: TodayActivitySummary[];
  initialEquipped: EquippedCosmetics;
};

function isFormQuest(questId: QuestId): questId is FormQuestId {
  return questId !== "learn-coding";
}

export default function HomeQuestSection({
  initialPlayer,
  initialCompletedActivityTypes,
  initialTodaySummaries,
  initialEquipped,
}: HomeQuestSectionProps) {
  const [player, setPlayer] = useState(initialPlayer);
  const [completedActivityTypes, setCompletedActivityTypes] = useState(
    new Set(initialCompletedActivityTypes)
  );
  const [todaySummaries, setTodaySummaries] = useState<
    Map<ActivityType, TodayActivitySummary>
  >(
    () =>
      new Map(
        initialTodaySummaries.map((summary) => [summary.activityType, summary])
      )
  );
  const [error, setError] = useState<string | null>(null);
  const [justCompletedQuestId, setJustCompletedQuestId] =
    useState<QuestId | null>(null);
  const [floatingRewards, setFloatingRewards] = useState<FloatingRewardItem[]>(
    []
  );
  const [levelUpOverlay, setLevelUpOverlay] = useState<LevelUpInfo | null>(
    null
  );
  const [showPerfectDayOverlay, setShowPerfectDayOverlay] = useState(false);
  const pendingLevelUpRef = useRef<LevelUpInfo | null>(null);
  const pendingRewardRef = useRef<{
    reward: QuestReward;
    levelUp?: LevelUpInfo;
    perfectDay?: { xp: number; gold: number; energy: number };
  } | null>(null);
  const [evolutionOverlay, setEvolutionOverlay] =
    useState<EvolutionInfo | null>(null);
  const [evolving, setEvolving] = useState(false);

  const [activeQuestId, setActiveQuestId] = useState<FormQuestId | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successSummary, setSuccessSummary] = useState<ActivitySummary | null>(
    null
  );
  const [saving, setSaving] = useState(false);

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

  const closeEvolutionOverlay = useCallback(() => {
    setEvolutionOverlay(null);
  }, []);

  function triggerRewardAnimations(
    reward: QuestReward,
    levelUp?: LevelUpInfo,
    perfectDay?: { xp: number; gold: number; energy: number }
  ) {
    const rewardId = Date.now();
    const newFloatingRewards: FloatingRewardItem[] = [
      { id: `${rewardId}-xp`, type: "xp", amount: reward.xp },
      { id: `${rewardId}-gold`, type: "gold", amount: reward.gold },
    ];

    if (perfectDay) {
      newFloatingRewards.push(
        {
          id: `${rewardId}-perfect-xp`,
          type: "xp",
          amount: perfectDay.xp,
        },
        {
          id: `${rewardId}-perfect-gold`,
          type: "gold",
          amount: perfectDay.gold,
        }
      );
    }

    setFloatingRewards((prev) => [...prev, ...newFloatingRewards]);

    if (perfectDay) {
      if (levelUp) {
        pendingLevelUpRef.current = levelUp;
      }
      setTimeout(() => setShowPerfectDayOverlay(true), 800);
    } else if (levelUp) {
      setTimeout(() => setLevelUpOverlay(levelUp), 800);
    }
  }

  function closeQuestSheet() {
    setActiveQuestId(null);
    setShowSuccess(false);
    setSuccessSummary(null);
    setError(null);
    setSaving(false);
  }

  function handleSuccessContinue() {
    const pending = pendingRewardRef.current;
    pendingRewardRef.current = null;
    closeQuestSheet();

    if (pending) {
      triggerRewardAnimations(
        pending.reward,
        pending.levelUp,
        pending.perfectDay
      );
    }
  }

  function openQuestForm(questId: QuestId) {
    if (!isFormQuest(questId)) {
      return;
    }

    const quest = dailyQuests.find((item) => item.id === questId);
    if (!quest) {
      return;
    }

    const completed = completedActivityTypes.has(quest.activityType);
    setFormMode(completed ? "edit" : "create");
    setShowSuccess(false);
    setSuccessSummary(null);
    setError(null);
    setActiveQuestId(questId);
  }

  async function handleEvolve() {
    setEvolving(true);
    setError(null);

    const result = await evolve();

    setEvolving(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setPlayer(result.player);
    setEvolutionOverlay(result.evolution);
  }

  function updateTodaySummary(
    activityType: ActivityType,
    summary: ActivitySummary,
    exercises?: TodayActivitySummary["exercises"]
  ) {
    let title = summary.title;
    let reference: string | null = null;

    if (activityType === "book") {
      if (summary.subtitle.includes("·")) {
        const [bookTitle, ...rest] = summary.subtitle.split("·");
        title = bookTitle.trim();
        reference = rest.join("·").trim() || null;
      } else {
        title = summary.title;
      }
    }

    const nextSummary: TodayActivitySummary = {
      activityType,
      title,
      reference,
      reflection: summary.reflection ?? null,
      ...(exercises ? { exercises } : {}),
    };

    setTodaySummaries((prev) => {
      const next = new Map(prev);
      next.set(activityType, nextSummary);
      return next;
    });
  }

  async function handleBookSubmit(data: {
    title: string;
    reference?: string;
    reflection: string;
  }) {
    setSaving(true);
    setError(null);

    let result: SaveActivityResult | UpdateActivityResult;

    if (formMode === "create") {
      result = await saveBookActivity(data);
    } else {
      result = await updateBookActivity(data);
    }

    setSaving(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    if (formMode === "create") {
      const saveResult = result as SaveActivityResult & { success: true };
      updateTodaySummary("book", saveResult.activitySummary);
      setPlayer(saveResult.player);
      setCompletedActivityTypes((prev) => new Set([...prev, "book"]));
      setJustCompletedQuestId("read-book");
      setTimeout(() => setJustCompletedQuestId(null), 600);
      pendingRewardRef.current = {
        reward: saveResult.reward,
        ...(saveResult.levelUp ? { levelUp: saveResult.levelUp } : {}),
        ...(saveResult.perfectDay ? { perfectDay: saveResult.perfectDay } : {}),
      };
      setSuccessSummary(saveResult.activitySummary);
      setShowSuccess(true);
    } else {
      updateTodaySummary("book", result.activitySummary);
      closeQuestSheet();
    }
  }

  async function handleBibleSubmit(data: {
    passage: string;
    reflection: string;
  }) {
    setSaving(true);
    setError(null);

    let result: SaveActivityResult | UpdateActivityResult;

    if (formMode === "create") {
      result = await saveBibleActivity(data);
    } else {
      result = await updateBibleActivity(data);
    }

    setSaving(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    if (formMode === "create") {
      const saveResult = result as SaveActivityResult & { success: true };
      updateTodaySummary("bible", saveResult.activitySummary);
      setPlayer(saveResult.player);
      setCompletedActivityTypes((prev) => new Set([...prev, "bible"]));
      setJustCompletedQuestId("read-bible");
      setTimeout(() => setJustCompletedQuestId(null), 600);
      pendingRewardRef.current = {
        reward: saveResult.reward,
        ...(saveResult.levelUp ? { levelUp: saveResult.levelUp } : {}),
        ...(saveResult.perfectDay ? { perfectDay: saveResult.perfectDay } : {}),
      };
      setSuccessSummary(saveResult.activitySummary);
      setShowSuccess(true);
    } else {
      updateTodaySummary("bible", result.activitySummary);
      closeQuestSheet();
    }
  }

  async function handleWorkoutSubmit(data: {
    exercises: { name: string; sets: number; reps: number; weight?: number | null }[];
    notes?: string;
  }) {
    setSaving(true);
    setError(null);

    let result: SaveActivityResult | UpdateActivityResult;

    if (formMode === "create") {
      result = await saveWorkoutActivity(data);
    } else {
      result = await updateWorkoutActivity(data);
    }

    setSaving(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    const exerciseRows = data.exercises.map((exercise, index) => ({
      id: `temp-${index}`,
      activity_log_id: "",
      exercise_name: exercise.name,
      sets: exercise.sets,
      reps: exercise.reps,
      weight: exercise.weight ?? null,
      created_at: new Date().toISOString(),
    }));

    if (formMode === "create") {
      const saveResult = result as SaveActivityResult & { success: true };
      updateTodaySummary("workout", saveResult.activitySummary, exerciseRows);
      setPlayer(saveResult.player);
      setCompletedActivityTypes((prev) => new Set([...prev, "workout"]));
      setJustCompletedQuestId("workout");
      setTimeout(() => setJustCompletedQuestId(null), 600);
      pendingRewardRef.current = {
        reward: saveResult.reward,
        ...(saveResult.levelUp ? { levelUp: saveResult.levelUp } : {}),
        ...(saveResult.perfectDay ? { perfectDay: saveResult.perfectDay } : {}),
      };
      setSuccessSummary(saveResult.activitySummary);
      setShowSuccess(true);
    } else {
      updateTodaySummary("workout", result.activitySummary, exerciseRows);
      closeQuestSheet();
    }
  }

  const activeQuest = activeQuestId
    ? dailyQuests.find((quest) => quest.id === activeQuestId)
    : null;
  const activeSummary = activeQuest
    ? todaySummaries.get(activeQuest.activityType)
    : undefined;
  const activeMeta = activeQuestId ? QUEST_FORM_META[activeQuestId] : null;

  return (
    <>
      <PlayerStats player={toPlayerStatsData(player)} />

      <EvolutionProgress
        player={player}
        onEvolve={handleEvolve}
        evolving={evolving}
      />

      {error && !activeQuestId && (
        <div
          className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="relative flex justify-center py-2">
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
        <Avatar stage={player.evolution_stage} equipped={initialEquipped} />
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
          Daily Quests
        </h2>
        <div className="flex flex-col gap-2">
          {dailyQuests.map((quest) => {
            const completed = completedActivityTypes.has(quest.activityType);
            const isCodingQuest = quest.id === "learn-coding";
            const summary = todaySummaries.get(quest.activityType);

            return (
              <QuestCard
                key={quest.id}
                title={quest.title}
                completed={completed}
                justCompleted={justCompletedQuestId === quest.id}
                href={isCodingQuest ? "/quests" : undefined}
                subtitle={
                  isCodingQuest && !completed
                    ? "Start a coding session"
                    : !completed
                      ? "Log your activity"
                      : undefined
                }
                summary={
                  summary
                    ? buildTodayCardSummary(
                        summary.activityType,
                        summary.title,
                        summary.reference,
                        summary.exercises
                      )
                    : undefined
                }
                showChevron={!isCodingQuest && !completed}
                onComplete={
                  isCodingQuest ? undefined : () => openQuestForm(quest.id)
                }
              />
            );
          })}
        </div>
      </section>

      {activeQuest && activeMeta && (
        <QuestFormSheet
          open={Boolean(activeQuestId)}
          title={activeQuest.title}
          icon={activeMeta.icon}
          onClose={closeQuestSheet}
        >
          {error && (
            <div
              className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400"
              role="alert"
            >
              {error}
            </div>
          )}

          {showSuccess && successSummary ? (
            <QuestSuccessScreen
              icon={activeMeta.icon}
              title={activeMeta.successTitle}
              subtitle={activeMeta.successSubtitle}
              summary={successSummary}
              onContinue={handleSuccessContinue}
            />
          ) : activeQuestId === "read-book" ? (
            <ReadBookForm
              mode={formMode}
              saving={saving}
              initialTitle={activeSummary?.title}
              initialReference={activeSummary?.reference ?? ""}
              initialReflection={activeSummary?.reflection ?? ""}
              onSubmit={handleBookSubmit}
            />
          ) : activeQuestId === "read-bible" ? (
            <ReadBibleForm
              mode={formMode}
              saving={saving}
              initialPassage={activeSummary?.title}
              initialReflection={activeSummary?.reflection ?? ""}
              onSubmit={handleBibleSubmit}
            />
          ) : (
            <WorkoutForm
              mode={formMode}
              saving={saving}
              initialNotes={activeSummary?.reflection ?? ""}
              initialExercises={activeSummary?.exercises?.map((exercise) => ({
                name: exercise.exercise_name,
                sets: exercise.sets,
                reps: exercise.reps,
                weight: exercise.weight,
              }))}
              onSubmit={handleWorkoutSubmit}
            />
          )}
        </QuestFormSheet>
      )}

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

      {evolutionOverlay && (
        <EvolutionOverlay
          fromStage={evolutionOverlay.fromStage}
          toStage={evolutionOverlay.toStage}
          equipped={initialEquipped}
          onClose={closeEvolutionOverlay}
        />
      )}
    </>
  );
}
