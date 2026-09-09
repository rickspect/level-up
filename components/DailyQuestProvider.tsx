"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
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
import { dailyQuests, QUEST_FORM_META } from "@/lib/quests";
import { getMsUntilNextMidnight } from "@/lib/player-utils";
import type {
  ActivitySummary,
  ActivityType,
  LevelUpInfo,
  Player,
  QuestId,
  QuestReward,
  SaveActivityResult,
  TodayActivitySummary,
  UpdateActivityResult,
} from "@/lib/types";
import QuestFormSheet from "@/components/QuestFormSheet";
import QuestSuccessScreen from "@/components/QuestSuccessScreen";
import ReadBibleForm from "@/components/ReadBibleForm";
import ReadBookForm from "@/components/ReadBookForm";
import WorkoutForm from "@/components/WorkoutForm";

type FormQuestId = Exclude<QuestId, "learn-coding">;

export type PendingQuestReward = {
  reward: QuestReward;
  levelUp?: LevelUpInfo;
  perfectDay?: { xp: number; gold: number; energy: number };
};

type DailyQuestContextValue = {
  completedActivityTypes: Set<ActivityType>;
  todaySummaries: Map<ActivityType, TodayActivitySummary>;
  justCompletedQuestId: QuestId | null;
  hydrate: (
    completed: ActivityType[],
    summaries: TodayActivitySummary[]
  ) => void;
  markCompleted: (activityType: ActivityType, questId?: QuestId) => void;
  openQuestForm: (questId: QuestId) => void;
  closeQuestSheet: () => void;
  setRewardCallback: (callback: ((pending: PendingQuestReward) => void) | null) => void;
  setPlayerUpdateCallback: (callback: ((player: Player) => void) | null) => void;
};

const DailyQuestContext = createContext<DailyQuestContextValue | null>(null);

export function useDailyQuest() {
  const context = useContext(DailyQuestContext);
  if (!context) {
    throw new Error("useDailyQuest must be used within DailyQuestProvider");
  }
  return context;
}

function isFormQuest(questId: QuestId): questId is FormQuestId {
  return questId !== "learn-coding";
}

export function DailyQuestProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [completedActivityTypes, setCompletedActivityTypes] = useState<
    Set<ActivityType>
  >(new Set());
  const [todaySummaries, setTodaySummaries] = useState<
    Map<ActivityType, TodayActivitySummary>
  >(new Map());
  const [justCompletedQuestId, setJustCompletedQuestId] =
    useState<QuestId | null>(null);

  const [activeQuestId, setActiveQuestId] = useState<FormQuestId | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successSummary, setSuccessSummary] = useState<ActivitySummary | null>(
    null
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pendingRewardRef = useRef<PendingQuestReward | null>(null);
  const rewardCallbackRef = useRef<((pending: PendingQuestReward) => void) | null>(
    null
  );
  const playerUpdateCallbackRef = useRef<((player: Player) => void) | null>(
    null
  );

  const hydrate = useCallback(
    (completed: ActivityType[], summaries: TodayActivitySummary[]) => {
      setCompletedActivityTypes(new Set(completed));
      setTodaySummaries(
        new Map(summaries.map((summary) => [summary.activityType, summary]))
      );
    },
    []
  );

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleMidnightRefresh = () => {
      timeoutId = setTimeout(() => {
        setCompletedActivityTypes(new Set());
        setTodaySummaries(new Map());
        router.refresh();
        scheduleMidnightRefresh();
      }, getMsUntilNextMidnight());
    };

    scheduleMidnightRefresh();

    return () => clearTimeout(timeoutId);
  }, [router]);

  const markCompleted = useCallback(
    (activityType: ActivityType, questId?: QuestId) => {
      setCompletedActivityTypes((prev) => new Set([...prev, activityType]));
      if (questId) {
        setJustCompletedQuestId(questId);
        setTimeout(() => setJustCompletedQuestId(null), 600);
      }
    },
    []
  );

  const closeQuestSheet = useCallback(() => {
    setActiveQuestId(null);
    setShowSuccess(false);
    setSuccessSummary(null);
    setError(null);
    setSaving(false);
  }, []);

  const handleSuccessContinue = useCallback(() => {
    const pending = pendingRewardRef.current;
    pendingRewardRef.current = null;
    closeQuestSheet();

    if (pending && rewardCallbackRef.current) {
      rewardCallbackRef.current(pending);
    }
  }, [closeQuestSheet]);

  const openQuestForm = useCallback(
    (questId: QuestId) => {
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
    },
    [completedActivityTypes]
  );

  const setRewardCallback = useCallback(
    (callback: ((pending: PendingQuestReward) => void) | null) => {
      rewardCallbackRef.current = callback;
    },
    []
  );

  const setPlayerUpdateCallback = useCallback(
    (callback: ((player: Player) => void) | null) => {
      playerUpdateCallbackRef.current = callback;
    },
    []
  );

  function refreshProgressData() {
    router.refresh();
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
    reflection: string[];
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
      playerUpdateCallbackRef.current?.(saveResult.player);
      markCompleted("book", "read-book");
      pendingRewardRef.current = {
        reward: saveResult.reward,
        ...(saveResult.levelUp ? { levelUp: saveResult.levelUp } : {}),
        ...(saveResult.perfectDay ? { perfectDay: saveResult.perfectDay } : {}),
      };
      setSuccessSummary(saveResult.activitySummary);
      setShowSuccess(true);
      refreshProgressData();
    } else {
      updateTodaySummary("book", result.activitySummary);
      refreshProgressData();
      closeQuestSheet();
    }
  }

  async function handleBibleSubmit(data: {
    passage: string;
    reflection: string[];
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
      playerUpdateCallbackRef.current?.(saveResult.player);
      markCompleted("bible", "read-bible");
      pendingRewardRef.current = {
        reward: saveResult.reward,
        ...(saveResult.levelUp ? { levelUp: saveResult.levelUp } : {}),
        ...(saveResult.perfectDay ? { perfectDay: saveResult.perfectDay } : {}),
      };
      setSuccessSummary(saveResult.activitySummary);
      setShowSuccess(true);
      refreshProgressData();
    } else {
      updateTodaySummary("bible", result.activitySummary);
      refreshProgressData();
      closeQuestSheet();
    }
  }

  async function handleWorkoutSubmit(data: {
    exercises: {
      name: string;
      sets: number;
      reps: number;
      weight?: number | null;
    }[];
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
      playerUpdateCallbackRef.current?.(saveResult.player);
      markCompleted("workout", "workout");
      pendingRewardRef.current = {
        reward: saveResult.reward,
        ...(saveResult.levelUp ? { levelUp: saveResult.levelUp } : {}),
        ...(saveResult.perfectDay ? { perfectDay: saveResult.perfectDay } : {}),
      };
      setSuccessSummary(saveResult.activitySummary);
      setShowSuccess(true);
      refreshProgressData();
    } else {
      updateTodaySummary("workout", result.activitySummary, exerciseRows);
      refreshProgressData();
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

  const contextValue: DailyQuestContextValue = {
    completedActivityTypes,
    todaySummaries,
    justCompletedQuestId,
    hydrate,
    markCompleted,
    openQuestForm,
    closeQuestSheet,
    setRewardCallback,
    setPlayerUpdateCallback,
  };

  return (
    <DailyQuestContext.Provider value={contextValue}>
      {children}

      {activeQuest && activeMeta && (
        <QuestFormSheet
          open={Boolean(activeQuestId)}
          title={activeQuest.title}
          icon={activeMeta.icon}
          description={activeMeta.description}
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
    </DailyQuestContext.Provider>
  );
}
