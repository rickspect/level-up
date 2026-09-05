import Link from "next/link";
import { notFound } from "next/navigation";
import CategoryHistorySection from "@/components/CategoryHistorySection";
import PageTransition from "@/components/PageTransition";
import { ACTIVITY_ICONS, CATEGORY_LABELS } from "@/lib/activity-summary";
import { getActivitiesByType } from "@/lib/db/activity-logs";
import type { ProgressCategory } from "@/lib/types";

const VALID_CATEGORIES: ProgressCategory[] = [
  "book",
  "bible",
  "workout",
  "coding",
];

type CategoryPageProps = {
  params: Promise<{ category: string }>;
};

export const dynamic = "force-dynamic";

export default async function CategoryHistoryPage({ params }: CategoryPageProps) {
  const { category } = await params;

  if (!VALID_CATEGORIES.includes(category as ProgressCategory)) {
    notFound();
  }

  const typedCategory = category as ProgressCategory;
  const activities = await getActivitiesByType(typedCategory, 15);

  return (
    <PageTransition>
      <div className="flex flex-col gap-6 px-4 py-6">
        <div className="flex items-center gap-3">
          <Link
            href="/progress"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:bg-white/5 hover:text-foreground"
            aria-label="Back to progress"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                d="M12.5 5L7.5 10l5 5"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden="true">
                {ACTIVITY_ICONS[typedCategory]}
              </span>
              <h1 className="text-xl font-semibold">
                {CATEGORY_LABELS[typedCategory]} History
              </h1>
            </div>
            <p className="mt-1 text-sm text-muted">
              Your past {CATEGORY_LABELS[typedCategory].toLowerCase()} logs.
            </p>
          </div>
        </div>

        <CategoryHistorySection
          category={typedCategory}
          initialActivities={activities}
        />
      </div>
    </PageTransition>
  );
}
