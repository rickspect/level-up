"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "motion/react";
import { equipCosmetic, unequipCosmetic } from "@/lib/actions/equip-cosmetic";
import { getCosmeticsWithEquipped } from "@/lib/cosmetics";
import type { Cosmetic, EquippedCosmetics, EvolutionStage } from "@/lib/types";
import Avatar from "@/components/Avatar";

type CosmeticsSectionProps = {
  playerLevel: number;
  playerStage: EvolutionStage;
  initialEquipped: EquippedCosmetics;
};

const categoryLabels: Record<Cosmetic["category"], string> = {
  default: "Default",
  knowledge: "Knowledge",
  faith: "Faith",
  fitness: "Fitness",
  tech: "Tech",
};

function getPreviewEquipped(
  cosmetic: Cosmetic,
  currentEquipped: EquippedCosmetics
): EquippedCosmetics {
  if (cosmetic.category === "default") {
    return { auraId: null, accessoryId: null };
  }

  if (cosmetic.slot === "aura") {
    return { ...currentEquipped, auraId: cosmetic.id };
  }

  if (cosmetic.slot === "accessory") {
    return { ...currentEquipped, accessoryId: cosmetic.id };
  }

  return currentEquipped;
}

export default function CosmeticsSection({
  playerLevel,
  playerStage,
  initialEquipped,
}: CosmeticsSectionProps) {
  const router = useRouter();
  const [equipped, setEquipped] = useState(initialEquipped);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [popId, setPopId] = useState<string | null>(null);

  const cosmetics = getCosmeticsWithEquipped(equipped);

  function triggerPop(cosmeticId: string) {
    setPopId(cosmeticId);
    window.setTimeout(() => setPopId(null), 400);
  }

  async function handleEquip(cosmetic: Cosmetic) {
    setLoadingId(cosmetic.id);
    setError(null);

    const result = await equipCosmetic(cosmetic.id);

    setLoadingId(null);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setEquipped(result.equipped);
    triggerPop(cosmetic.id);
    router.refresh();
  }

  async function handleUnequip(cosmetic: Cosmetic) {
    if (!cosmetic.slot) {
      return;
    }

    setLoadingId(cosmetic.id);
    setError(null);

    const result = await unequipCosmetic(cosmetic.slot);

    setLoadingId(null);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setEquipped(result.equipped);
    triggerPop(cosmetic.id);
    router.refresh();
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
        Cosmetics
      </h2>

      {error && (
        <div
          className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="flex flex-col gap-2">
        {cosmetics.map((cosmetic) => {
          const locked = playerLevel < cosmetic.unlock_level;
          const isLoading = loadingId === cosmetic.id;
          const previewEquipped = getPreviewEquipped(cosmetic, equipped);
          const shouldPop = popId === cosmetic.id;

          return (
            <div
              key={cosmetic.id}
              className={`flex items-center gap-3 rounded-xl border bg-surface px-4 py-3 ${
                locked ? "border-border opacity-60" : "border-border"
              } ${cosmetic.equipped ? "border-gold/40" : ""}`}
            >
              <motion.div
                key={`${cosmetic.id}-${cosmetic.equipped}`}
                className={`shrink-0 scale-110 rounded-full ${
                  cosmetic.equipped ? "ring-1 ring-gold/30" : ""
                }`}
                animate={
                  shouldPop ? { scale: [1.1, 1.22, 1.1] } : { scale: 1.1 }
                }
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <Avatar
                  size="md"
                  stage={playerStage}
                  equipped={previewEquipped}
                  glow={cosmetic.category !== "default"}
                  animate={false}
                />
              </motion.div>

              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold">
                    {cosmetic.name}
                  </span>
                  <span className="shrink-0 rounded-full bg-white/5 px-2 py-0.5 text-xs text-muted">
                    {categoryLabels[cosmetic.category]}
                  </span>
                </div>

                {locked ? (
                  <span className="text-xs text-muted">
                    Unlock at Lv. {cosmetic.unlock_level}
                  </span>
                ) : cosmetic.equipped ? (
                  <span className="text-xs text-gold-light">Equipped</span>
                ) : (
                  <span className="text-xs text-muted">Available</span>
                )}
              </div>

              {!locked && cosmetic.category !== "default" && (
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() =>
                    cosmetic.equipped
                      ? handleUnequip(cosmetic)
                      : handleEquip(cosmetic)
                  }
                  className="shrink-0 rounded-lg border border-gold/40 bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold-light transition-colors hover:bg-gold/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading
                    ? "..."
                    : cosmetic.equipped
                      ? "Unequip"
                      : "Equip"}
                </button>
              )}

              {!locked && cosmetic.category === "default" && cosmetic.equipped && (
                <span className="shrink-0 text-xs text-muted">Active</span>
              )}

              {!locked &&
                cosmetic.category === "default" &&
                !cosmetic.equipped && (
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleEquip(cosmetic)}
                    className="shrink-0 rounded-lg border border-border bg-white/5 px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? "..." : "Reset"}
                  </button>
                )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
