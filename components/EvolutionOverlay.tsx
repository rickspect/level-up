"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { getStageLabel } from "@/lib/evolution";
import type { EquippedCosmetics, EvolutionStage } from "@/lib/types";
import Avatar from "@/components/Avatar";

type EvolutionOverlayProps = {
  fromStage: EvolutionStage;
  toStage: EvolutionStage;
  equipped?: EquippedCosmetics;
  onClose: () => void;
};

export default function EvolutionOverlay({
  fromStage,
  toStage,
  equipped = { auraId: null, accessoryId: null },
  onClose,
}: EvolutionOverlayProps) {
  const [displayStage, setDisplayStage] = useState<EvolutionStage>(fromStage);
  const [showComplete, setShowComplete] = useState(false);

  useEffect(() => {
    const swapTimer = setTimeout(() => {
      setDisplayStage(toStage);
    }, 1200);

    const completeTimer = setTimeout(() => {
      setShowComplete(true);
    }, 1500);

    const closeTimer = setTimeout(onClose, 4000);

    return () => {
      clearTimeout(swapTimer);
      clearTimeout(completeTimer);
      clearTimeout(closeTimer);
    };
  }, [onClose, toStage]);

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
          className="absolute inset-0 bg-black/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />

        <div className="relative z-10 flex flex-col items-center gap-6">
          <motion.div
            className="relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: [0.8, 1, 1.3, 1],
              opacity: 1,
              x: [0, 0, -4, 4, -4, 4, 0],
            }}
            transition={{
              scale: { duration: 1.2, times: [0, 0.3, 0.7, 1] },
              opacity: { duration: 0.4, delay: 0.2 },
              x: { duration: 0.5, delay: 0.6 },
            }}
          >
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 24px rgba(201,162,39,0.3)",
                  "0 0 64px rgba(201,162,39,0.8)",
                  "0 0 48px rgba(201,162,39,0.5)",
                ],
              }}
              transition={{ duration: 1.2 }}
              className="rounded-full"
            >
              <Avatar
                size="lg"
                glow
                stage={displayStage}
                equipped={equipped}
                animate={false}
              />
            </motion.div>

            <motion.div
              className="pointer-events-none absolute inset-0 rounded-full bg-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0, 0.8, 0] }}
              transition={{ duration: 1.2, times: [0, 0.55, 0.65, 1] }}
            />
          </motion.div>

          <AnimatePresence>
            {showComplete && (
              <>
                <motion.p
                  className="text-3xl font-bold tracking-wider text-gold-light"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  EVOLUTION COMPLETE
                </motion.p>

                <motion.p
                  className="text-lg font-semibold text-foreground"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  {getStageLabel(fromStage)} → {getStageLabel(toStage)}
                </motion.p>

                <motion.button
                  type="button"
                  onClick={onClose}
                  className="mt-2 rounded-xl border border-gold/40 bg-gold/10 px-8 py-3 text-sm font-semibold text-gold-light transition-colors hover:bg-gold/20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  Continue
                </motion.button>
              </>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
