"use client";

import { motion, AnimatePresence } from "motion/react";

type QuestFormSheetProps = {
  open: boolean;
  title: string;
  icon: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export default function QuestFormSheet({
  open,
  title,
  icon,
  onClose,
  children,
  footer,
}: QuestFormSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col bg-background"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
        >
          <header className="flex items-center gap-3 border-b border-border px-4 py-4">
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:bg-white/5 hover:text-foreground"
              aria-label="Close"
            >
              <svg
                viewBox="0 0 20 20"
                fill="none"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  d="M12.5 5L7.5 10l5 5"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div className="flex min-w-0 flex-1 flex-col items-center pr-9">
              <span className="text-2xl" aria-hidden="true">
                {icon}
              </span>
              <h2 className="truncate text-base font-semibold text-foreground">
                {title}
              </h2>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>

          {footer && (
            <div className="border-t border-border bg-surface px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              {footer}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export const inputClassName =
  "rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted disabled:cursor-not-allowed disabled:opacity-60";

export const textareaClassName =
  "resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted disabled:cursor-not-allowed disabled:opacity-60";

export const primaryButtonClassName =
  "w-full rounded-lg border border-gold/40 bg-gold/10 px-4 py-2.5 text-sm font-semibold text-gold-light transition-colors hover:bg-gold/20 disabled:cursor-not-allowed disabled:opacity-60";
