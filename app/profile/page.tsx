import Avatar from "@/components/Avatar";
import CosmeticsSection from "@/components/CosmeticsSection";
import { getEquippedCosmeticsFromPlayer } from "@/lib/cosmetics";
import { getStageLabel } from "@/lib/evolution";
import { getDefaultPlayer } from "@/lib/db/player";

export default async function ProfilePage() {
  const player = await getDefaultPlayer();

  if (!player) {
    return (
      <div className="flex flex-col gap-2 px-4 py-6">
        <h1 className="text-xl font-semibold">Profile</h1>
        <p className="text-sm text-muted">
          Player not found. Run{" "}
          <code className="text-foreground">supabase/schema.sql</code> in the
          Supabase SQL Editor, then refresh this page.
        </p>
      </div>
    );
  }

  const equipped = getEquippedCosmeticsFromPlayer(player);

  return (
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
        initialEquipped={equipped}
      />
    </div>
  );
}
