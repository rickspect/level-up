"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { EquippedCosmetics, EvolutionStage } from "@/lib/types";
import Avatar from "@/components/Avatar";

type LevelUpOverlayProps = {
  fromLevel: number;
  toLevel: number;
  stage?: EvolutionStage;
  equipped?: EquippedCosmetics;
  onClose: () => void;
};

export default function LevelUpOverlay({
  fromLevel,
  toLevel,
  stage = "baby",
  equipped = { auraId: null, accessoryId: null },
  onClose,
}: LevelUpOverlayProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="absolute inset-0 bg-black/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />

        <div className="relative z-10 flex flex-col items-center gap-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{
                duration: 0.5,
                delay: 1.2,
                ease: "easeOut",
              }}
            >
              <Avatar size="lg" glow stage={stage} equipped={equipped} animate={false} />
            </motion.div>
          </motion.div>

          <motion.p
            className="text-3xl font-bold tracking-wider text-gold-light"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            LEVEL UP!
          </motion.p>

          <motion.p
            className="text-lg font-semibold text-foreground"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.8 }}
          >
            Lv. {fromLevel} → Lv. {toLevel}
          </motion.p>

          <motion.button
            type="button"
            onClick={onClose}
            className="mt-2 rounded-xl border border-gold/40 bg-gold/10 px-8 py-3 text-sm font-semibold text-gold-light transition-colors hover:bg-gold/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 1.4 }}
          >
            Continue
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
