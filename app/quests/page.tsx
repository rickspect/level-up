import CodingSessionSection from "@/components/CodingSessionSection";
import PageTransition from "@/components/PageTransition";
import EmptyState from "@/components/EmptyState";
import { getEquippedCosmeticsFromPlayer } from "@/lib/cosmetics";
import { getCodingWeekStats } from "@/lib/db/coding-sessions";
import { getDefaultPlayer, getTodayCompletedActivityTypes } from "@/lib/db/player";

export default async function QuestsPage() {
  const [player, weekStats, completedActivityTypes] = await Promise.all([
    getDefaultPlayer(),
    getCodingWeekStats(),
    getTodayCompletedActivityTypes(),
  ]);

  const codingCompletedToday = completedActivityTypes.includes("coding");

  return (
    <PageTransition>
      <div className="flex flex-col gap-6 px-4 py-6">
        {!player ? (
          <>
            <h1 className="text-xl font-semibold">Coding Session</h1>
            <EmptyState message="Player not found. Run supabase/schema.sql in the Supabase SQL Editor, then refresh this page." />
          </>
        ) : (
          <>
            {codingCompletedToday && (
              <p className="rounded-xl border border-xp/30 bg-xp/10 px-4 py-2 text-sm text-xp">
                Daily coding quest completed today. Extra sessions save without
                rewards.
              </p>
            )}
            <CodingSessionSection
              initialWeekStats={weekStats}
              initialEquipped={getEquippedCosmeticsFromPlayer(player)}
              initialPlayer={player}
            />
          </>
        )}
      </div>
    </PageTransition>
  );
}
