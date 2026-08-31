"use client";

import { motion } from "motion/react";
import type { EquippedCosmetics, EvolutionStage } from "@/lib/types";

type AvatarProps = {
  size?: "lg" | "md";
  glow?: boolean;
  stage?: EvolutionStage;
  equipped?: EquippedCosmetics;
  animate?: boolean;
};

const sizeClasses = {
  lg: "h-32 w-32",
  md: "h-24 w-24",
};

const stageScaleClasses: Record<EvolutionStage, string> = {
  baby: "scale-90",
  rookie: "scale-100",
  champion: "scale-105",
};

function AuraLayer() {
  return (
    <g>
      <circle
        cx="32"
        cy="32"
        r="28"
        fill="url(#auraGradient)"
        opacity="0.5"
      />
      <circle
        cx="32"
        cy="32"
        r="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-gold-light"
        opacity="0.6"
      />
    </g>
  );
}

function StageAuraLayer() {
  return (
    <g>
      <circle
        cx="32"
        cy="32"
        r="30"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-gold-light"
        opacity="0.5"
      />
      <circle
        cx="32"
        cy="32"
        r="26"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        className="text-gold"
        opacity="0.3"
      />
    </g>
  );
}

function BodyLayer({ stage }: { stage: EvolutionStage }) {
  if (stage === "baby") {
    return (
      <g className="text-muted">
        <circle cx="32" cy="26" r="9" fill="currentColor" opacity="0.7" />
        <path
          d="M16 54c3-10 11-15 16-15s13 5 16 15"
          fill="currentColor"
          opacity="0.5"
        />
      </g>
    );
  }

  if (stage === "rookie") {
    return (
      <g className="text-muted">
        <circle cx="32" cy="24" r="13" fill="currentColor" opacity="0.7" />
        <path
          d="M10 58c5-15 17-22 22-22s17 7 22 22"
          fill="currentColor"
          opacity="0.5"
        />
        <circle cx="24" cy="28" r="2" fill="currentColor" opacity="0.25" />
        <circle cx="40" cy="28" r="2" fill="currentColor" opacity="0.25" />
      </g>
    );
  }

  return (
    <g className="text-muted">
      <circle cx="32" cy="22" r="15" fill="currentColor" opacity="0.8" />
      <path
        d="M6 60c6-18 19-26 26-26s20 8 26 26"
        fill="currentColor"
        opacity="0.6"
      />
      <path
        d="M14 52c4-8 11-12 18-12s14 4 18 12"
        fill="currentColor"
        opacity="0.3"
      />
    </g>
  );
}

function EyesLayer({ stage }: { stage: EvolutionStage }) {
  if (stage === "baby") {
    return (
      <g className="text-foreground">
        <circle cx="28" cy="25" r="1.5" fill="currentColor" />
        <circle cx="36" cy="25" r="1.5" fill="currentColor" />
      </g>
    );
  }

  if (stage === "champion") {
    return (
      <g className="text-foreground">
        <ellipse cx="26" cy="21" rx="2.5" ry="3" fill="currentColor" />
        <ellipse cx="38" cy="21" rx="2.5" ry="3" fill="currentColor" />
        <circle cx="27" cy="20" r="1" className="text-gold-light" fill="currentColor" />
        <circle cx="39" cy="20" r="1" className="text-gold-light" fill="currentColor" />
      </g>
    );
  }

  return (
    <g className="text-foreground">
      <ellipse cx="27" cy="23" rx="2" ry="2.5" fill="currentColor" />
      <ellipse cx="37" cy="23" rx="2" ry="2.5" fill="currentColor" />
    </g>
  );
}

function ChampionSparkleLayer() {
  return (
    <g className="text-gold-light">
      <circle cx="14" cy="14" r="1.5" fill="currentColor" opacity="0.8" />
      <circle cx="50" cy="18" r="1" fill="currentColor" opacity="0.6" />
      <circle cx="48" cy="46" r="1.5" fill="currentColor" opacity="0.7" />
      <circle cx="12" cy="42" r="1" fill="currentColor" opacity="0.5" />
    </g>
  );
}

function AccessoryLayer({ accessoryId }: { accessoryId: string }) {
  if (accessoryId === "knowledge-glasses") {
    return (
      <g className="text-gold-light" stroke="currentColor" fill="none">
        <rect x="20" y="20" width="10" height="7" rx="1.5" strokeWidth="1.5" />
        <rect x="34" y="20" width="10" height="7" rx="1.5" strokeWidth="1.5" />
        <path d="M30 23.5h4" strokeWidth="1.5" />
        <path d="M20 23.5h-4" strokeWidth="1.5" />
        <path d="M44 23.5h4" strokeWidth="1.5" />
      </g>
    );
  }

  if (accessoryId === "fitness-headband") {
    return (
      <g className="text-xp">
        <path
          d="M18 18c3-4 9-6 14-6s11 2 14 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="32" cy="12" r="2" fill="currentColor" />
      </g>
    );
  }

  if (accessoryId === "tech-cyber-visor") {
    return (
      <g className="text-xp">
        <path
          d="M18 24h28c-1 4-5 7-14 7s-13-3-14-7z"
          fill="currentColor"
          opacity="0.8"
        />
        <path
          d="M20 26h24"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.5"
        />
        <rect x="16" y="22" width="3" height="6" rx="1" fill="currentColor" />
        <rect x="45" y="22" width="3" height="6" rx="1" fill="currentColor" />
      </g>
    );
  }

  return null;
}

function AvatarSvg({
  equipped,
  stage,
}: {
  equipped: EquippedCosmetics;
  stage: EvolutionStage;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className="h-3/4 w-3/4"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="auraGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e8c547" stopOpacity="0.6" />
          <stop offset="70%" stopColor="#c9a227" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#c9a227" stopOpacity="0" />
        </radialGradient>
      </defs>

      {stage === "champion" && <StageAuraLayer />}
      {equipped.auraId === "faith-light-aura" && <AuraLayer />}
      <BodyLayer stage={stage} />
      <EyesLayer stage={stage} />
      {stage === "champion" && <ChampionSparkleLayer />}
      {equipped.accessoryId && (
        <AccessoryLayer accessoryId={equipped.accessoryId} />
      )}
    </svg>
  );
}

export default function Avatar({
  size = "lg",
  glow = false,
  stage = "baby",
  equipped = { auraId: null, accessoryId: null },
  animate = true,
}: AvatarProps) {
  const frame = (
    <div
      className={`${sizeClasses[size]} ${stageScaleClasses[stage]} relative flex items-center justify-center rounded-full border-2 border-gold/40 bg-surface-elevated ${
        glow
          ? "shadow-[0_0_48px_rgba(201,162,39,0.5)]"
          : "shadow-[0_0_24px_rgba(201,162,39,0.15)]"
      }`}
    >
      <div className="absolute inset-1 rounded-full bg-gradient-to-b from-white/10 to-transparent" />
      <AvatarSvg equipped={equipped} stage={stage} />
    </div>
  );

  if (!animate) {
    return frame;
  }

  return (
    <motion.div
      animate={{ y: [0, -3, 0] }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {frame}
    </motion.div>
  );
}
