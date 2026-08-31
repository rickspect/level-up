"use client";

import { motion } from "motion/react";

type AnimatedXpBarProps = {
  currentXp: number;
  xpToNextLevel: number;
  level: number;
};

export default function AnimatedXpBar({
  currentXp,
  xpToNextLevel,
  level,
}: AnimatedXpBarProps) {
  const xpPercent = Math.min(
    100,
    Math.round((currentXp / xpToNextLevel) * 100)
  );

  return (
    <div className="h-2 overflow-hidden rounded-full bg-white/10">
      <motion.div
        key={level}
        className="h-full rounded-full bg-gradient-to-r from-xp to-gold"
        initial={{ width: 0 }}
        animate={{ width: `${xpPercent}%` }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
    </div>
  );
}
