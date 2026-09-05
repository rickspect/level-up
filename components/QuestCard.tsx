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
  summary?: string;
  showChevron?: boolean;
  icon?: string;
  variant?: "default" | "hub";
  onComplete?: () => void;
};

function QuestCardContent({
  title,
  completed,
  loading = false,
  justCompleted = false,
  subtitle,
  summary,
  showChevron = false,
  icon,
  variant = "default",
}: Pick<
  QuestCardProps,
  | "title"
  | "completed"
  | "loading"
  | "justCompleted"
  | "subtitle"
  | "summary"
  | "showChevron"
  | "icon"
  | "variant"
>) {
  const isHub = variant === "hub";

  if (isHub) {
    return (
      <>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {icon && (
              <span className="shrink-0 text-base" aria-hidden="true">
                {icon}
              </span>
            )}
            <motion.span
              className="text-sm font-medium text-foreground"
              initial={justCompleted ? { opacity: 0.5 } : false}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {loading ? "Saving..." : title}
            </motion.span>
          </div>
          {completed && summary ? (
            <p className="mt-0.5 truncate text-xs text-muted">{summary}</p>
          ) : (
            subtitle && (
              <p className="mt-0.5 text-xs text-muted">{subtitle}</p>
            )
          )}
          {completed && (
            <p className="mt-1 text-xs font-medium text-xp">✓ Completed</p>
          )}
        </div>
        {showChevron && !completed && (
          <svg
            viewBox="0 0 20 20"
            fill="none"
            className="h-4 w-4 shrink-0 text-muted"
            aria-hidden="true"
          >
            <path
              d="M7.5 5l5 5-5 5"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </>
    );
  }

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
          className="text-sm font-medium text-foreground"
          initial={justCompleted ? { opacity: 0.5 } : false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {loading ? "Saving..." : title}
        </motion.span>
        {completed && summary ? (
          <p className="truncate text-xs text-muted">{summary}</p>
        ) : (
          subtitle && (
            <p className="text-xs text-muted">{subtitle}</p>
          )
        )}
      </div>
      {showChevron && !completed && (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          className="h-4 w-4 shrink-0 text-muted"
          aria-hidden="true"
        >
          <path
            d="M7.5 5l5 5-5 5"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
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
  summary,
  showChevron = false,
  icon,
  variant = "default",
  onComplete,
}: QuestCardProps) {
  const isLink = Boolean(href) && !onComplete;
  const isInteractive =
    !disabled && !loading && (onComplete || isLink);

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
          summary={summary}
          showChevron={showChevron}
          icon={icon}
          variant={variant}
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
        summary={summary}
        showChevron={showChevron}
        icon={icon}
        variant={variant}
      />
    </motion.button>
  );
}
