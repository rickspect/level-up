import HomeQuestSection from "@/components/HomeQuestSection";
import {
  getDefaultPlayer,
  getTodayCompletedActivityTypes,
} from "@/lib/db/player";

export default async function Home() {
  const player = await getDefaultPlayer();
  const completedActivityTypes = await getTodayCompletedActivityTypes();

  return (
    <div className="flex flex-col gap-6 px-4 py-6">
      {!player ? (
        <div className="rounded-xl border border-border bg-surface p-4 text-sm text-muted">
          Player not found. Run{" "}
          <code className="text-foreground">supabase/schema.sql</code> in the
          Supabase SQL Editor, then refresh this page.
        </div>
      ) : (
        <HomeQuestSection
          initialPlayer={player}
          initialCompletedActivityTypes={completedActivityTypes}
        />
      )}
    </div>
  );
}
