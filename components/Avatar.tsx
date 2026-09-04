"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { motion } from "motion/react";
import type { EquippedCosmetics, EvolutionStage } from "@/lib/types";

type AvatarProps = {
  size?: "lg" | "md";
  glow?: boolean;
  stage?: EvolutionStage;
  equipped?: EquippedCosmetics;
  animate?: boolean;
  interactive?: boolean;
};

type FaceGeometry = {
  faceY: number;
  faceW: number;
  faceH: number;
  eyeY: number;
  leftEyeX: number;
  rightEyeX: number;
  eyeRx: number;
  eyeRy: number;
  domeY: number;
  smileY: number;
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

const pulseShadowLg = {
  default: [
    "0 0 28px rgba(201,162,39,0.18)",
    "0 0 40px rgba(201,162,39,0.32)",
    "0 0 28px rgba(201,162,39,0.18)",
  ],
  glow: [
    "0 0 40px rgba(201,162,39,0.4)",
    "0 0 56px rgba(201,162,39,0.6)",
    "0 0 40px rgba(201,162,39,0.4)",
  ],
};

const pulseShadowMd = {
  default: [
    "0 0 14px rgba(201,162,39,0.1)",
    "0 0 24px rgba(201,162,39,0.22)",
    "0 0 14px rgba(201,162,39,0.1)",
  ],
  glow: [
    "0 0 24px rgba(201,162,39,0.28)",
    "0 0 40px rgba(201,162,39,0.45)",
    "0 0 24px rgba(201,162,39,0.28)",
  ],
};

function getFaceGeometry(stage: EvolutionStage): FaceGeometry {
  if (stage === "baby") {
    return {
      faceY: 22,
      faceW: 14,
      faceH: 10,
      eyeY: 27,
      leftEyeX: 28,
      rightEyeX: 36,
      eyeRx: 1.8,
      eyeRy: 1.8,
      domeY: 14,
      smileY: 31,
    };
  }

  if (stage === "rookie") {
    return {
      faceY: 20,
      faceW: 16,
      faceH: 11,
      eyeY: 25,
      leftEyeX: 27,
      rightEyeX: 37,
      eyeRx: 2.2,
      eyeRy: 2.6,
      domeY: 12,
      smileY: 29,
    };
  }

  return {
    faceY: 18,
    faceW: 18,
    faceH: 12,
    eyeY: 23,
    leftEyeX: 26,
    rightEyeX: 38,
    eyeRx: 2.6,
    eyeRy: 3.1,
    domeY: 10,
    smileY: 27,
  };
}

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
        <circle
          cx="32"
          cy="32"
          r="28"
          fill={`url(#${auraGradientId})`}
          opacity="0.35"
        />
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

function FaithAuraOverlay({ animate }: { animate: boolean }) {
  const sparkles = [
    { cx: 14, cy: 18, delay: 0 },
    { cx: 50, cy: 22, delay: 0.8 },
    { cx: 48, cy: 44, delay: 1.6 },
    { cx: 16, cy: 40, delay: 2.4 },
  ];

  return (
    <g className="text-gold-light">
      <motion.circle
        cx="32"
        cy="32"
        r="27"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        initial={{ opacity: 0.4 }}
        animate={
          animate
            ? { opacity: [0.4, 0.7, 0.4], scale: [1, 1.02, 1] }
            : { opacity: 0.55 }
        }
        transition={
          animate
            ? { duration: 3, repeat: Infinity, ease: "easeInOut" }
            : undefined
        }
        style={{ transformOrigin: "32px 32px" }}
      />
      <motion.circle
        cx="32"
        cy="32"
        r="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.75"
        className="text-gold"
        initial={{ opacity: 0.25 }}
        animate={animate ? { opacity: [0.25, 0.45, 0.25] } : { opacity: 0.35 }}
        transition={
          animate
            ? { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }
            : undefined
        }
      />
      {sparkles.map((sparkle, index) => (
        <motion.circle
          key={index}
          cx={sparkle.cx}
          cy={sparkle.cy}
          r="1"
          fill="currentColor"
          initial={{ opacity: 0 }}
          animate={
            animate
              ? { opacity: [0, 0.7, 0], scale: [0.8, 1.1, 0.8] }
              : { opacity: 0.4 }
          }
          transition={
            animate
              ? {
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: sparkle.delay,
                  repeatDelay: 1.5,
                }
              : undefined
          }
        />
      ))}
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
  animate,
}: {
  stage: EvolutionStage;
  coreGradientId: string;
  animate: boolean;
}) {
  const coreY = stage === "baby" ? 40 : stage === "rookie" ? 42 : 44;
  const coreR = stage === "baby" ? 5 : stage === "rookie" ? 6 : 7;

  return (
    <g>
      <motion.circle
        cx="32"
        cy={coreY}
        r={coreR + 3}
        fill={`url(#${coreGradientId})`}
        animate={
          animate
            ? { opacity: [0.55, 0.75, 0.55], r: [coreR + 2.5, coreR + 3.5, coreR + 2.5] }
            : { opacity: 0.7, r: coreR + 3 }
        }
        transition={
          animate
            ? { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
            : undefined
        }
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

function FaceEyesLayer({
  stage,
  isBlinking,
  isHappy,
}: {
  stage: EvolutionStage;
  isBlinking: boolean;
  isHappy: boolean;
}) {
  const geo = getFaceGeometry(stage);
  const { faceY, faceW, faceH, eyeY, leftEyeX, rightEyeX, eyeRx, eyeRy, smileY } =
    geo;
  const happyScale = isHappy ? 1.15 : 1;
  const smileOpacity = isHappy ? 0.7 : 0.4;

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

      <g className="text-foreground">
        {stage === "baby" ? (
          <>
            <circle
              cx={leftEyeX}
              cy={eyeY}
              r={eyeRx * happyScale}
              fill="currentColor"
            />
            <circle
              cx={rightEyeX}
              cy={eyeY}
              r={eyeRx * happyScale}
              fill="currentColor"
            />
          </>
        ) : (
          <>
            <ellipse
              cx={leftEyeX}
              cy={eyeY}
              rx={eyeRx * happyScale}
              ry={eyeRy * happyScale}
              fill="currentColor"
            />
            <ellipse
              cx={rightEyeX}
              cy={eyeY}
              rx={eyeRx * happyScale}
              ry={eyeRy * happyScale}
              fill="currentColor"
            />
          </>
        )}

        {stage === "champion" ? (
          <>
            <circle
              cx={leftEyeX + 0.8}
              cy={eyeY - 0.8}
              r="0.9"
              className="text-gold-light"
              fill="currentColor"
            />
            <circle
              cx={rightEyeX + 0.8}
              cy={eyeY - 0.8}
              r="0.9"
              className="text-gold-light"
              fill="currentColor"
            />
          </>
        ) : (
          <>
            <circle
              cx={leftEyeX + 0.6}
              cy={eyeY - 0.6}
              r="0.7"
              fill="white"
              opacity="0.85"
            />
            <circle
              cx={rightEyeX + 0.6}
              cy={eyeY - 0.6}
              r="0.7"
              fill="white"
              opacity="0.85"
            />
          </>
        )}

        {stage === "rookie" && (
          <>
            <circle
              cx={leftEyeX - 3}
              cy={eyeY + 3}
              r="1"
              className="text-muted"
              fill="currentColor"
              opacity="0.4"
            />
            <circle
              cx={rightEyeX + 3}
              cy={eyeY + 3}
              r="1"
              className="text-muted"
              fill="currentColor"
              opacity="0.4"
            />
          </>
        )}

        {isBlinking && (
          <>
            <ellipse
              cx={leftEyeX}
              cy={eyeY}
              rx={eyeRx + 0.5}
              ry="0.6"
              className="text-surface-elevated"
              fill="currentColor"
            />
            <ellipse
              cx={rightEyeX}
              cy={eyeY}
              rx={eyeRx + 0.5}
              ry="0.6"
              className="text-surface-elevated"
              fill="currentColor"
            />
          </>
        )}
      </g>

      <path
        d={`M${leftEyeX - 2} ${smileY} Q32 ${smileY + (isHappy ? 3 : 2)} ${rightEyeX + 2} ${smileY}`}
        fill="none"
        stroke="currentColor"
        className="text-muted"
        strokeWidth="0.75"
        strokeLinecap="round"
        opacity={smileOpacity}
      />
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
  animate,
}: {
  accessoryId: string;
  stage: EvolutionStage;
  animate: boolean;
}) {
  const { eyeY, leftEyeX, rightEyeX, domeY } = getFaceGeometry(stage);

  if (accessoryId === "knowledge-glasses") {
    const lensW = 8.5;
    const lensH = 7.5;
    const leftLensX = leftEyeX - lensW / 2;
    const rightLensX = rightEyeX - lensW / 2;
    const lensY = eyeY - lensH / 2 + 0.5;
    const bridgeY = eyeY;

    return (
      <g className="text-gold-light">
        <rect
          x={leftLensX}
          y={lensY}
          width={lensW}
          height={lensH}
          rx="3"
          fill="currentColor"
          opacity="0.08"
          stroke="currentColor"
          strokeWidth="1.75"
        />
        <rect
          x={rightLensX}
          y={lensY}
          width={lensW}
          height={lensH}
          rx="3"
          fill="currentColor"
          opacity="0.08"
          stroke="currentColor"
          strokeWidth="1.75"
        />
        <path
          d={`M${leftLensX + lensW} ${bridgeY}h${rightLensX - (leftLensX + lensW)}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
        />
        <path
          d={`M${leftLensX} ${bridgeY}h-${leftLensX - 18}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <path
          d={`M${rightLensX + lensW} ${bridgeY}h${46 - (rightLensX + lensW)}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <motion.ellipse
          cx={leftEyeX - 0.5}
          cy={eyeY - 1}
          rx="1.2"
          ry="0.8"
          fill="white"
          initial={{ opacity: 0.15 }}
          animate={animate ? { opacity: [0.15, 0.45, 0.15] } : { opacity: 0.3 }}
          transition={
            animate
              ? { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
              : undefined
          }
        />
        <motion.ellipse
          cx={rightEyeX - 0.5}
          cy={eyeY - 1}
          rx="1.2"
          ry="0.8"
          fill="white"
          initial={{ opacity: 0.15 }}
          animate={animate ? { opacity: [0.15, 0.45, 0.15] } : { opacity: 0.3 }}
          transition={
            animate
              ? { duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }
              : undefined
          }
        />
      </g>
    );
  }

  if (accessoryId === "fitness-headband") {
    const bandTop = domeY - 1;
    const bandBottom = domeY + 5;

    return (
      <g className="text-xp">
        <path
          d={`M17 ${bandBottom} Q17 ${bandTop} 32 ${bandTop - 1} Q47 ${bandTop} 47 ${bandBottom} L45 ${bandBottom + 1.5} Q32 ${bandTop + 3} 19 ${bandBottom + 1.5} Z`}
          fill="currentColor"
          opacity="0.9"
        />
        <path
          d={`M17 ${bandBottom} Q14 ${bandBottom + 1} 16 ${bandBottom + 4}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d={`M47 ${bandBottom} Q50 ${bandBottom + 1} 48 ${bandBottom + 4}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d={`M19 ${bandTop + 1} Q32 ${bandTop - 0.5} 45 ${bandTop + 1}`}
          fill="none"
          stroke="white"
          strokeWidth="0.5"
          opacity="0.25"
        />
        <circle cx="32" cy={domeY + 1.5} r="2.5" fill="currentColor" />
        <circle cx="32" cy={domeY + 1.5} r="1" fill="white" opacity="0.35" />
      </g>
    );
  }

  if (accessoryId === "tech-cyber-visor") {
    const visorLeft = leftEyeX - 5;
    const visorRight = rightEyeX + 5;
    const visorWidth = visorRight - visorLeft;
    const visorHeight = 8;
    const visorY = eyeY - 4;
    const armY = eyeY - 1;

    return (
      <g className="text-xp">
        <rect
          x={visorLeft}
          y={visorY}
          width={visorWidth}
          height={visorHeight}
          rx="4"
          fill="currentColor"
          opacity="0.72"
        />
        <line
          x1={visorLeft + 3}
          y1={visorY + 2.5}
          x2={visorRight - 3}
          y2={visorY + 2.5}
          stroke="white"
          strokeWidth="0.75"
          opacity="0.35"
          strokeLinecap="round"
        />
        <rect
          x={visorLeft - 3}
          y={armY}
          width="2.5"
          height="5"
          rx="1"
          fill="currentColor"
          opacity="0.85"
        />
        <rect
          x={visorRight + 0.5}
          y={armY}
          width="2.5"
          height="5"
          rx="1"
          fill="currentColor"
          opacity="0.85"
        />
      </g>
    );
  }

  return null;
}

function AvatarSvg({
  equipped,
  stage,
  animate,
  isBlinking,
  isHappy,
}: {
  equipped: EquippedCosmetics;
  stage: EvolutionStage;
  animate: boolean;
  isBlinking: boolean;
  isHappy: boolean;
}) {
  const id = useId();
  const auraGradientId = `${id}-aura`;
  const coreGradientId = `${id}-core`;

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className="h-[92%] w-[92%]"
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
      {equipped.auraId === "faith-light-aura" && (
        <FaithAuraOverlay animate={animate} />
      )}
      <CoreGlowLayer
        stage={stage}
        coreGradientId={coreGradientId}
        animate={animate}
      />
      <FaceEyesLayer
        stage={stage}
        isBlinking={isBlinking}
        isHappy={isHappy}
      />
      {stage === "champion" && <ChampionSparkleLayer />}
      {equipped.accessoryId && (
        <AccessoryLayer
          accessoryId={equipped.accessoryId}
          stage={stage}
          animate={animate}
        />
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
  interactive,
}: AvatarProps) {
  const isInteractive = interactive ?? (size === "lg" && animate);
  const [isHappy, setIsHappy] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);

  const handleInteract = useCallback(() => {
    if (!isInteractive) {
      return;
    }
    setIsHappy(true);
    window.setTimeout(() => setIsHappy(false), 600);
  }, [isInteractive]);

  useEffect(() => {
    if (!animate) {
      return;
    }

    let blinkTimeoutId: number | undefined;
    let closeTimeoutId: number | undefined;

    const scheduleBlink = () => {
      const delay = 4000 + Math.random() * 2000;
      blinkTimeoutId = window.setTimeout(() => {
        setIsBlinking(true);
        closeTimeoutId = window.setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 150);
      }, delay);
    };

    scheduleBlink();

    return () => {
      if (blinkTimeoutId !== undefined) {
        window.clearTimeout(blinkTimeoutId);
      }
      if (closeTimeoutId !== undefined) {
        window.clearTimeout(closeTimeoutId);
      }
    };
  }, [animate]);

  const shadowClass = glow
    ? frameShadowClasses[size].glow
    : frameShadowClasses[size].default;

  const pulseShadow = glow
    ? size === "lg"
      ? pulseShadowLg.glow
      : pulseShadowMd.glow
    : size === "lg"
      ? pulseShadowLg.default
      : pulseShadowMd.default;

  const frameContent = (
    <>
      <div className="absolute inset-1 rounded-full bg-gradient-to-b from-white/10 to-transparent" />
      <AvatarSvg
        equipped={equipped}
        stage={stage}
        animate={animate}
        isBlinking={isBlinking}
        isHappy={isHappy}
      />
    </>
  );

  const frameClassName = `${sizeClasses[size]} ${stageScaleClasses[stage]} relative flex items-center justify-center rounded-full border-2 border-gold/40 bg-surface-elevated ring-1 ring-gold/20`;

  const frame =
    animate ? (
      <motion.div
        className={frameClassName}
        animate={{ boxShadow: pulseShadow }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {frameContent}
      </motion.div>
    ) : (
      <div className={`${frameClassName} ${shadowClass}`}>{frameContent}</div>
    );

  const interactiveFrame = isInteractive ? (
    <motion.div
      className="cursor-pointer"
      whileTap={{ scale: 0.96 }}
      onTap={handleInteract}
    >
      {frame}
    </motion.div>
  ) : (
    frame
  );

  if (!animate) {
    return interactiveFrame;
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
      {interactiveFrame}
    </motion.div>
  );
}
