"use client";

import Link from "next/link";
import { motion } from "motion/react";

type QuestCardProps = {
  title: string;
  completed: boolean;
  disabled?: boolean;
  loading?: boolean;
  justCompleted?: boolean;
  href?: string;
  subtitle?: string;
  onComplete?: () => void;
};

function QuestCardContent({
  title,
  completed,
  loading = false,
  justCompleted = false,
  subtitle,
}: Pick<
  QuestCardProps,
  "title" | "completed" | "loading" | "justCompleted" | "subtitle"
>) {
  return (
    <>
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
      <div className="min-w-0 flex-1">
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
        {subtitle && !completed && (
          <p className="text-xs text-muted">{subtitle}</p>
        )}
      </div>
    </>
  );
}

export default function QuestCard({
  title,
  completed,
  disabled = false,
  loading = false,
  justCompleted = false,
  href,
  subtitle,
  onComplete,
}: QuestCardProps) {
  const isLink = Boolean(href) && !completed;
  const isInteractive =
    !completed && !disabled && !loading && (onComplete || isLink);

  const className = `flex w-full items-center gap-3 rounded-xl border bg-surface px-4 py-3 text-left transition-colors ${
    justCompleted || completed ? "border-xp/60" : "border-border"
  } ${
    isInteractive ? "cursor-pointer hover:bg-white/5 active:scale-[0.99]" : ""
  } ${disabled || loading ? "opacity-60" : ""}`;

  if (isLink && href) {
    return (
      <Link href={href} className={className}>
        <QuestCardContent
          title={title}
          completed={completed}
          loading={loading}
          justCompleted={justCompleted}
          subtitle={subtitle}
        />
      </Link>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={isInteractive && onComplete ? onComplete : undefined}
      disabled={!isInteractive}
      className={className}
    >
      <QuestCardContent
        title={title}
        completed={completed}
        loading={loading}
        justCompleted={justCompleted}
        subtitle={subtitle}
      />
    </motion.button>
  );
}
