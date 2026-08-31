"use client";

import { motion } from "motion/react";

type QuestCardProps = {
  title: string;
  completed: boolean;
  disabled?: boolean;
  loading?: boolean;
  justCompleted?: boolean;
  onComplete?: () => void;
};

export default function QuestCard({
  title,
  completed,
  disabled = false,
  loading = false,
  justCompleted = false,
  onComplete,
}: QuestCardProps) {
  const isInteractive = !completed && !disabled && !loading && onComplete;

  return (
    <motion.button
      type="button"
      onClick={isInteractive ? onComplete : undefined}
      disabled={!isInteractive}
      className={`flex w-full items-center gap-3 rounded-xl border bg-surface px-4 py-3 text-left transition-colors ${
        justCompleted || completed
          ? "border-xp/60"
          : "border-border"
      } ${
        isInteractive ? "cursor-pointer hover:bg-white/5 active:scale-[0.99]" : ""
      } ${disabled || loading ? "opacity-60" : ""}`}
    >
      <div
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
          completed
            ? "border-xp bg-xp/20 text-xp"
            : "border-white/20 bg-transparent"
        }`}
        aria-label={completed ? "Completed" : "Not completed"}
      >
        {completed && (
          <motion.svg
            viewBox="0 0 12 12"
            fill="none"
            className="h-3 w-3"
            aria-hidden="true"
            initial={justCompleted ? { scale: 0 } : false}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <path
              d="M2 6l3 3 5-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        )}
      </div>
      <motion.span
        className={`text-sm font-medium ${
          completed ? "text-muted line-through" : "text-foreground"
        }`}
        initial={justCompleted ? { opacity: 0.5 } : false}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {loading ? "Completing..." : title}
      </motion.span>
    </motion.button>
  );
}
