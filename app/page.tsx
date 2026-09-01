import HomeQuestSection from "@/components/HomeQuestSection";
import PageTransition from "@/components/PageTransition";
import EmptyState from "@/components/EmptyState";
import { getEquippedCosmeticsFromPlayer } from "@/lib/cosmetics";
import {
  getDefaultPlayer,
  getTodayCompletedActivityTypes,
} from "@/lib/db/player";

export default async function Home() {
  const player = await getDefaultPlayer();
  const completedActivityTypes = await getTodayCompletedActivityTypes();

  return (
    <PageTransition>
      <div className="flex flex-col gap-6 px-4 py-6">
        {!player ? (
          <EmptyState message="Player not found. Run supabase/schema.sql in the Supabase SQL Editor, then refresh this page." />
        ) : (
          <HomeQuestSection
            initialPlayer={player}
            initialCompletedActivityTypes={completedActivityTypes}
            initialEquipped={getEquippedCosmeticsFromPlayer(player)}
          />
        )}
      </div>
    </PageTransition>
  );
}
