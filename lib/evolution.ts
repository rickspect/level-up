import type { EvolutionProgressData, EvolutionStage, Player } from "@/lib/types";

export const EVOLUTION_STAGE_LABELS: Record<EvolutionStage, string> = {
  baby: "Baby",
  rookie: "Rookie",
  champion: "Champion",
};

const STAGE_ORDER: EvolutionStage[] = ["baby", "rookie", "champion"];

const EVOLUTION_REQUIREMENTS: Record<
  EvolutionStage,
  { minLevel: number; minEnergy: number } | null
> = {
  baby: { minLevel: 5, minEnergy: 2 },
  rookie: { minLevel: 10, minEnergy: 5 },
  champion: null,
};

export function getStageLabel(stage: EvolutionStage): string {
  return EVOLUTION_STAGE_LABELS[stage];
}

export function getNextStage(stage: EvolutionStage): EvolutionStage | null {
  const index = STAGE_ORDER.indexOf(stage);
  if (index === -1 || index >= STAGE_ORDER.length - 1) {
    return null;
  }
  return STAGE_ORDER[index + 1];
}

export function getEvolutionRequirements(
  stage: EvolutionStage
): { minLevel: number; minEnergy: number } | null {
  return EVOLUTION_REQUIREMENTS[stage];
}

export function canEvolve(player: Player): boolean {
  const requirements = getEvolutionRequirements(player.evolution_stage);
  if (!requirements) {
    return false;
  }

  return (
    player.level >= requirements.minLevel &&
    player.evolution_energy >= requirements.minEnergy
  );
}

export function getEvolutionProgress(player: Player): EvolutionProgressData {
  const currentStage = player.evolution_stage;
  const nextStage = getNextStage(currentStage);
  const requirements = getEvolutionRequirements(currentStage);

  if (!nextStage || !requirements) {
    return {
      currentStage,
      currentStageLabel: getStageLabel(currentStage),
      nextStage: null,
      nextStageLabel: null,
      levelCurrent: player.level,
      levelRequired: 0,
      energyCurrent: player.evolution_energy,
      energyRequired: 0,
      canEvolve: false,
      isMaxStage: true,
    };
  }

  return {
    currentStage,
    currentStageLabel: getStageLabel(currentStage),
    nextStage,
    nextStageLabel: getStageLabel(nextStage),
    levelCurrent: player.level,
    levelRequired: requirements.minLevel,
    energyCurrent: player.evolution_energy,
    energyRequired: requirements.minEnergy,
    canEvolve: canEvolve(player),
    isMaxStage: false,
  };
}
