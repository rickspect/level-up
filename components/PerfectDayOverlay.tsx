"use client";

import { useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";

type PerfectDayOverlayProps = {
  onClose: () => void;
};

const CONFETTI_COLORS = [
  "bg-xp",
  "bg-gold",
  "bg-gold-light",
  "bg-foreground",
];

type ConfettiPiece = {
  id: number;
  left: string;
  delay: number;
  duration: number;
  rotate: number;
  colorClass: string;
  size: number;
};

function createConfettiPieces(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, index) => ({
    id: index,
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 0.4,
    duration: 2 + Math.random() * 1.5,
    rotate: Math.random() * 360,
    colorClass: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
    size: 6 + Math.floor(Math.random() * 6),
  }));
}

export default function PerfectDayOverlay({ onClose }: PerfectDayOverlayProps) {
  const confettiPieces = useMemo(() => createConfettiPieces(16), []);

  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="absolute inset-0 bg-black/75"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />

        {confettiPieces.map((piece) => (
          <motion.span
            key={piece.id}
            className={`pointer-events-none absolute top-0 rounded-sm ${piece.colorClass}`}
            style={{
              left: piece.left,
              width: piece.size,
              height: piece.size * 1.6,
            }}
            initial={{ y: "-10%", opacity: 1, rotate: 0 }}
            animate={{
              y: "110vh",
              opacity: [1, 1, 0],
              rotate: piece.rotate,
            }}
            transition={{
              duration: piece.duration,
              delay: piece.delay,
              ease: "linear",
            }}
          />
        ))}

        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <motion.p
            className="text-4xl font-bold tracking-wider text-gold-light"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            PERFECT DAY ✨
          </motion.p>

          <motion.p
            className="text-sm font-medium text-foreground"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            +75 XP · +30 Gold · +1 Evolution Energy
          </motion.p>

          <motion.button
            type="button"
            onClick={onClose}
            className="mt-2 rounded-xl border border-gold/40 bg-gold/10 px-8 py-3 text-sm font-semibold text-gold-light transition-colors hover:bg-gold/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.9 }}
          >
            Continue
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
