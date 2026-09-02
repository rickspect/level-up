"use client";

import { useId } from "react";
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

const frameShadowClasses = {
  lg: {
    default: "shadow-[0_0_32px_rgba(201,162,39,0.22)]",
    glow: "shadow-[0_0_48px_rgba(201,162,39,0.5)]",
  },
  md: {
    default: "shadow-[0_0_16px_rgba(201,162,39,0.12)]",
    glow: "shadow-[0_0_32px_rgba(201,162,39,0.35)]",
  },
};

function OrbitAuraLayer({
  stage,
  equipped,
  auraGradientId,
}: {
  stage: EvolutionStage;
  equipped: EquippedCosmetics;
  auraGradientId: string;
}) {
  return (
    <g>
      {stage === "champion" && (
        <g className="text-gold-light">
          <circle
            cx="32"
            cy="32"
            r="30"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="0.45"
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
          <circle cx="48" cy="20" r="1.5" fill="currentColor" opacity="0.7" />
          <circle cx="14" cy="28" r="1" fill="currentColor" opacity="0.5" />
          <circle cx="52" cy="38" r="1.2" fill="currentColor" opacity="0.6" />
        </g>
      )}

      {equipped.auraId === "faith-light-aura" && (
        <g>
          <circle
            cx="32"
            cy="32"
            r="28"
            fill={`url(#${auraGradientId})`}
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
      )}

      <g className="text-gold" opacity="0.25">
        <ellipse
          cx="32"
          cy="32"
          rx="27"
          ry="12"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.75"
          transform="rotate(-20 32 32)"
        />
        <circle cx="52" cy="30" r="1.2" fill="currentColor" />
        <circle cx="10" cy="34" r="1" fill="currentColor" />
      </g>
    </g>
  );
}

function BodyLayer({ stage }: { stage: EvolutionStage }) {
  if (stage === "baby") {
    return (
      <g className="text-muted">
        <path
          d="M32 11 C22 11 15 19 15 28 C15 36 18 46 32 54 C46 46 49 36 49 28 C49 19 42 11 32 11 Z"
          fill="currentColor"
          opacity="0.75"
        />
        <path
          d="M32 11 C22 11 15 19 15 28 C15 36 18 46 32 54 C46 46 49 36 49 28 C49 19 42 11 32 11 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.75"
          opacity="0.4"
        />
        <path
          d="M12 30 L8 34 L12 36 Z"
          fill="currentColor"
          opacity="0.5"
        />
        <path
          d="M52 30 L56 34 L52 36 Z"
          fill="currentColor"
          opacity="0.5"
        />
        <path
          d="M26 20 L32 17 L38 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.75"
          opacity="0.35"
        />
        <path
          d="M24 38 L40 38"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          opacity="0.3"
        />
      </g>
    );
  }

  if (stage === "rookie") {
    return (
      <g className="text-muted">
        <path
          d="M32 8 C20 8 12 18 12 28 C12 38 16 48 32 56 C48 48 52 38 52 28 C52 18 44 8 32 8 Z"
          fill="currentColor"
          opacity="0.78"
        />
        <path
          d="M32 8 C20 8 12 18 12 28 C12 38 16 48 32 56 C48 48 52 38 52 28 C52 18 44 8 32 8 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.75"
          opacity="0.45"
        />
        <path
          d="M10 26 L5 32 L10 38 Z"
          fill="currentColor"
          opacity="0.55"
        />
        <path
          d="M54 26 L59 32 L54 38 Z"
          fill="currentColor"
          opacity="0.55"
        />
        <path
          d="M24 18 L32 14 L40 18"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.75"
          opacity="0.4"
        />
        <path
          d="M22 40 L42 40"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          opacity="0.35"
        />
        <path
          d="M28 46 L36 46"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          opacity="0.25"
        />
      </g>
    );
  }

  return (
    <g className="text-muted">
      <path
        d="M32 6 C18 6 10 17 10 28 C10 39 14 50 32 58 C50 50 54 39 54 28 C54 17 46 6 32 6 Z"
        fill="currentColor"
        opacity="0.82"
      />
      <path
        d="M32 6 C18 6 10 17 10 28 C10 39 14 50 32 58 C50 50 54 39 54 28 C54 17 46 6 32 6 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.75"
        opacity="0.5"
      />
      <path
        d="M8 24 L3 32 L8 40 Z"
        fill="currentColor"
        opacity="0.6"
      />
      <path
        d="M56 24 L61 32 L56 40 Z"
        fill="currentColor"
        opacity="0.6"
      />
      <path
        d="M32 4 L34 8 L30 8 Z"
        fill="currentColor"
        className="text-gold-light"
        opacity="0.7"
      />
      <path
        d="M22 16 L32 12 L42 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.75"
        opacity="0.45"
      />
      <path
        d="M20 42 L44 42"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.4"
      />
      <path
        d="M16 50 C22 46 42 46 48 50"
        fill="currentColor"
        opacity="0.25"
      />
    </g>
  );
}

function CoreGlowLayer({
  stage,
  coreGradientId,
}: {
  stage: EvolutionStage;
  coreGradientId: string;
}) {
  const coreY = stage === "baby" ? 40 : stage === "rookie" ? 42 : 44;
  const coreR = stage === "baby" ? 5 : stage === "rookie" ? 6 : 7;

  return (
    <g>
      <circle
        cx="32"
        cy={coreY}
        r={coreR + 3}
        fill={`url(#${coreGradientId})`}
        opacity="0.7"
      />
      <g className="text-xp">
        <path
          d={`M32 ${coreY - coreR + 1} L${32 + coreR - 1} ${coreY} L32 ${coreY + coreR - 1} L${32 - coreR + 1} ${coreY} Z`}
          fill="currentColor"
          opacity="0.9"
        />
        <path
          d={`M32 ${coreY - coreR + 1} L${32 + coreR - 1} ${coreY} L32 ${coreY + coreR - 1} L${32 - coreR + 1} ${coreY} Z`}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          opacity="0.5"
        />
      </g>
    </g>
  );
}

function FaceEyesLayer({ stage }: { stage: EvolutionStage }) {
  const faceY = stage === "baby" ? 22 : stage === "rookie" ? 20 : 18;
  const faceW = stage === "baby" ? 14 : stage === "rookie" ? 16 : 18;
  const faceH = stage === "baby" ? 10 : stage === "rookie" ? 11 : 12;

  return (
    <g>
      <rect
        x={32 - faceW / 2}
        y={faceY}
        width={faceW}
        height={faceH}
        rx="3"
        className="text-surface-elevated"
        fill="currentColor"
        opacity="0.85"
      />
      <rect
        x={32 - faceW / 2}
        y={faceY}
        width={faceW}
        height={faceH}
        rx="3"
        fill="none"
        stroke="currentColor"
        className="text-muted"
        strokeWidth="0.5"
        opacity="0.5"
      />

      {stage === "baby" && (
        <g className="text-foreground">
          <circle cx="28" cy={faceY + 5} r="1.5" fill="currentColor" />
          <circle cx="36" cy={faceY + 5} r="1.5" fill="currentColor" />
        </g>
      )}

      {stage === "rookie" && (
        <g className="text-foreground">
          <ellipse
            cx="27"
            cy={faceY + 5}
            rx="2"
            ry="2.5"
            fill="currentColor"
          />
          <ellipse
            cx="37"
            cy={faceY + 5}
            rx="2"
            ry="2.5"
            fill="currentColor"
          />
          <circle
            cx="24"
            cy={faceY + 8}
            r="1"
            className="text-muted"
            fill="currentColor"
            opacity="0.4"
          />
          <circle
            cx="40"
            cy={faceY + 8}
            r="1"
            className="text-muted"
            fill="currentColor"
            opacity="0.4"
          />
        </g>
      )}

      {stage === "champion" && (
        <g className="text-foreground">
          <ellipse
            cx="26"
            cy={faceY + 5}
            rx="2.5"
            ry="3"
            fill="currentColor"
          />
          <ellipse
            cx="38"
            cy={faceY + 5}
            rx="2.5"
            ry="3"
            fill="currentColor"
          />
          <circle
            cx="27"
            cy={faceY + 4}
            r="1"
            className="text-gold-light"
            fill="currentColor"
          />
          <circle
            cx="39"
            cy={faceY + 4}
            r="1"
            className="text-gold-light"
            fill="currentColor"
          />
        </g>
      )}
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

function AccessoryLayer({
  accessoryId,
  stage,
}: {
  accessoryId: string;
  stage: EvolutionStage;
}) {
  const faceY = stage === "baby" ? 22 : stage === "rookie" ? 20 : 18;
  const eyeY = faceY + 5;
  const domeY = stage === "baby" ? 14 : stage === "rookie" ? 12 : 10;

  if (accessoryId === "knowledge-glasses") {
    return (
      <g className="text-gold-light" stroke="currentColor" fill="none">
        <rect
          x="21"
          y={eyeY - 3}
          width="9"
          height="7"
          rx="1.5"
          strokeWidth="1.5"
        />
        <rect
          x="34"
          y={eyeY - 3}
          width="9"
          height="7"
          rx="1.5"
          strokeWidth="1.5"
        />
        <path d={`M30 ${eyeY}h4`} strokeWidth="1.5" />
        <path d={`M21 ${eyeY}h-3`} strokeWidth="1.5" />
        <path d={`M43 ${eyeY}h3`} strokeWidth="1.5" />
      </g>
    );
  }

  if (accessoryId === "fitness-headband") {
    return (
      <g className="text-xp">
        <path
          d={`M19 ${domeY + 4}c3-4 9-6 13-6s10 2 13 6`}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="32" cy={domeY - 2} r="2" fill="currentColor" />
      </g>
    );
  }

  if (accessoryId === "tech-cyber-visor") {
    const visorY = eyeY - 1;
    return (
      <g className="text-xp">
        <path
          d={`M19 ${visorY + 2}h26c-1 4-5 6-13 6s-12-2-13-6z`}
          fill="currentColor"
          opacity="0.8"
        />
        <path
          d={`M21 ${visorY + 4}h22`}
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.5"
        />
        <rect x="17" y={visorY} width="3" height="6" rx="1" fill="currentColor" />
        <rect x="44" y={visorY} width="3" height="6" rx="1" fill="currentColor" />
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
  const id = useId();
  const auraGradientId = `${id}-aura`;
  const coreGradientId = `${id}-core`;

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className="h-[85%] w-[85%]"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={auraGradientId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e8c547" stopOpacity="0.6" />
          <stop offset="70%" stopColor="#c9a227" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#c9a227" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={coreGradientId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2dd4a8" stopOpacity="0.7" />
          <stop offset="60%" stopColor="#2dd4a8" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#2dd4a8" stopOpacity="0" />
        </radialGradient>
      </defs>

      <OrbitAuraLayer
        stage={stage}
        equipped={equipped}
        auraGradientId={auraGradientId}
      />
      <BodyLayer stage={stage} />
      <CoreGlowLayer stage={stage} coreGradientId={coreGradientId} />
      <FaceEyesLayer stage={stage} />
      {stage === "champion" && <ChampionSparkleLayer />}
      {equipped.accessoryId && (
        <AccessoryLayer accessoryId={equipped.accessoryId} stage={stage} />
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
  const shadowClass = glow
    ? frameShadowClasses[size].glow
    : frameShadowClasses[size].default;

  const frame = (
    <div
      className={`${sizeClasses[size]} ${stageScaleClasses[stage]} relative flex items-center justify-center rounded-full border-2 border-gold/40 bg-surface-elevated ring-1 ring-gold/20 ${shadowClass}`}
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
