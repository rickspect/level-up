"use client";

import { motion } from "motion/react";

type FloatingRewardProps = {
  id: string;
  type: "xp" | "gold";
  amount: number;
  index: number;
  onComplete: (id: string) => void;
};

export default function FloatingReward({
  id,
  type,
  amount,
  index,
  onComplete,
}: FloatingRewardProps) {
  const label = type === "xp" ? `+${amount} XP` : `+${amount} Gold`;
  const colorClass = type === "xp" ? "text-xp" : "text-gold-light";

  return (
    <motion.span
      className={`pointer-events-none absolute left-1/2 -translate-x-1/2 text-sm font-bold ${colorClass}`}
      style={{ top: `${20 + index * 28}px` }}
      initial={{ opacity: 1, y: 0 }}
      animate={{ opacity: 0, y: -40 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      onAnimationComplete={() => onComplete(id)}
    >
      {label}
    </motion.span>
  );
}
