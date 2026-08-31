import type { Cosmetic, EquippedCosmetics } from "@/lib/types";

type CosmeticDefinition = Omit<Cosmetic, "equipped">;

export const COSMETICS_CATALOG: CosmeticDefinition[] = [
  {
    id: "default",
    name: "Default",
    category: "default",
    unlock_level: 0,
    slot: null,
  },
  {
    id: "knowledge-glasses",
    name: "Glasses",
    category: "knowledge",
    unlock_level: 1,
    slot: "accessory",
  },
  {
    id: "faith-light-aura",
    name: "Light Aura",
    category: "faith",
    unlock_level: 1,
    slot: "aura",
  },
  {
    id: "fitness-headband",
    name: "Headband",
    category: "fitness",
    unlock_level: 1,
    slot: "accessory",
  },
  {
    id: "tech-cyber-visor",
    name: "Cyber Visor",
    category: "tech",
    unlock_level: 1,
    slot: "accessory",
  },
];

export function getCosmeticById(id: string): CosmeticDefinition | undefined {
  return COSMETICS_CATALOG.find((cosmetic) => cosmetic.id === id);
}

export function getEquippedCosmeticsFromPlayer(player: {
  equipped_aura_id?: string | null;
  equipped_accessory_id?: string | null;
}): EquippedCosmetics {
  return {
    auraId: player.equipped_aura_id ?? null,
    accessoryId: player.equipped_accessory_id ?? null,
  };
}

export function getCosmeticsWithEquipped(
  equipped: EquippedCosmetics
): Cosmetic[] {
  return COSMETICS_CATALOG.map((cosmetic) => ({
    ...cosmetic,
    equipped:
      cosmetic.slot === "aura"
        ? equipped.auraId === cosmetic.id
        : cosmetic.slot === "accessory"
          ? equipped.accessoryId === cosmetic.id
          : equipped.auraId === null && equipped.accessoryId === null,
  }));
}
