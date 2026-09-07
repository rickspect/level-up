"use client";

import { motion } from "motion/react";
import { primaryButtonClassName } from "@/components/QuestFormSheet";
import LearningPointsList from "@/components/LearningPointsList";
import { parseLearningPoints } from "@/lib/learning-points";
import type { ActivitySummary } from "@/lib/types";

type QuestSuccessScreenProps = {
  icon: string;
  title: string;
  subtitle: string;
  summary: ActivitySummary;
  onContinue: () => void;
};

export default function QuestSuccessScreen({
  icon,
  title,
  subtitle,
  summary,
  onContinue,
}: QuestSuccessScreenProps) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-6 px-4 py-8 text-center">
      <div className="relative">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <motion.span
            key={index}
            className="absolute text-xs text-gold"
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0.5],
              x: Math.cos((index / 6) * Math.PI * 2) * 40,
              y: Math.sin((index / 6) * Math.PI * 2) * 40,
            }}
            transition={{ duration: 0.8, delay: index * 0.05 }}
            aria-hidden="true"
          >
            ✦
          </motion.span>
        ))}
        <motion.div
          className="flex h-20 w-20 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-4xl"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
        >
          {icon}
        </motion.div>
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        <p className="text-sm text-muted">{subtitle}</p>
      </div>

      <div className="w-full rounded-xl border border-border bg-surface p-4 text-left">
        <p className="text-sm font-semibold text-foreground">{summary.title}</p>
        <p className="mt-1 text-sm text-muted">{summary.subtitle}</p>
        {summary.reflection && (
          <LearningPointsList
            points={parseLearningPoints(summary.reflection)}
            className="mt-2"
          />
        )}
      </div>

      <button type="button" onClick={onContinue} className={primaryButtonClassName}>
        Back to Quests
      </button>
    </div>
  );
}
