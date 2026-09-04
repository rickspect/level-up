import Avatar from "@/components/Avatar";
import CosmeticsSection from "@/components/CosmeticsSection";
import PageTransition from "@/components/PageTransition";
import EmptyState from "@/components/EmptyState";
import { getEquippedCosmeticsFromPlayer } from "@/lib/cosmetics";
import { getStageLabel } from "@/lib/evolution";
import { getDefaultPlayer } from "@/lib/db/player";

export default async function ProfilePage() {
  const player = await getDefaultPlayer();

  if (!player) {
    return (
      <PageTransition>
        <div className="flex flex-col gap-4 px-4 py-6">
          <h1 className="text-xl font-semibold">Profile</h1>
          <EmptyState message="Player not found. Run supabase/schema.sql in the Supabase SQL Editor, then refresh this page." />
        </div>
      </PageTransition>
    );
  }

  const equipped = getEquippedCosmeticsFromPlayer(player);

  return (
    <PageTransition>
      <div className="flex flex-col gap-6 px-4 py-6">
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-xl font-semibold">Profile</h1>
          <Avatar size="lg" stage={player.evolution_stage} equipped={equipped} />
          <p className="text-sm text-muted">
            {getStageLabel(player.evolution_stage)} · Level {player.level}
          </p>
        </div>

        <CosmeticsSection
          playerLevel={player.level}
          playerStage={player.evolution_stage}
          initialEquipped={equipped}
        />
      </div>
    </PageTransition>
  );
}
