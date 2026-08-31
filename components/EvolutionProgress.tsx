"use client";

import { motion } from "motion/react";
import { getEvolutionProgress } from "@/lib/evolution";
import type { Player } from "@/lib/types";

type EvolutionProgressProps = {
  player: Player;
  onEvolve: () => void;
  evolving?: boolean;
};

function ProgressBar({
  label,
  current,
  required,
}: {
  label: string;
  current: number;
  required: number;
}) {
  const percent = Math.min(100, Math.round((current / required) * 100));
  const met = current >= required;

  return (
    <div>
      <div className="mb-1.5 flex justify-between text-xs text-muted">
        <span>{label}</span>
        <span className={met ? "text-gold-light" : ""}>
          {current} / {required}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className={`h-full rounded-full ${
            met
              ? "bg-gradient-to-r from-gold to-gold-light"
              : "bg-gradient-to-r from-xp/70 to-gold/70"
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export default function EvolutionProgress({
  player,
  onEvolve,
  evolving = false,
}: EvolutionProgressProps) {
  const progress = getEvolutionProgress(player);

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted">
            Evolution
          </p>
          <p className="text-lg font-semibold text-gold-light">
            {progress.currentStageLabel}
          </p>
        </div>
        {progress.isMaxStage && (
          <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-medium text-gold-light">
            Max
          </span>
        )}
      </div>

      {progress.isMaxStage ? (
        <p className="text-sm text-muted">Max evolution reached</p>
      ) : (
        <>
          <p className="mb-3 text-xs text-muted">
            Next:{" "}
            <span className="font-medium text-foreground">
              {progress.nextStageLabel}
            </span>
          </p>

          <div className="mb-4 flex flex-col gap-3">
            <ProgressBar
              label="Level"
              current={progress.levelCurrent}
              required={progress.levelRequired}
            />
            <ProgressBar
              label="Evolution Energy"
              current={progress.energyCurrent}
              required={progress.energyRequired}
            />
          </div>

          {progress.canEvolve && (
            <motion.button
              type="button"
              onClick={onEvolve}
              disabled={evolving}
              className="w-full rounded-xl border border-gold/50 bg-gold/20 py-3 text-sm font-bold tracking-widest text-gold-light transition-colors hover:bg-gold/30 disabled:opacity-50"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {evolving ? "EVOLVING..." : "EVOLVE"}
            </motion.button>
          )}
        </>
      )}
    </div>
  );
}
