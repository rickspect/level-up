import Link from "next/link";
import { ACTIVITY_ICONS, CATEGORY_LABELS } from "@/lib/activity-summary";
import type { ProgressCategory } from "@/lib/types";

const CATEGORIES: ProgressCategory[] = ["book", "bible", "workout", "coding"];

export default function ActivityCategoryGrid() {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
        Activity Categories
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {CATEGORIES.map((category) => (
          <Link
            key={category}
            href={`/progress/${category}`}
            className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 transition-colors hover:bg-white/5 active:scale-[0.99]"
          >
            <span className="text-xl" aria-hidden="true">
              {ACTIVITY_ICONS[category]}
            </span>
            <span className="text-sm font-medium text-foreground">
              {CATEGORY_LABELS[category]}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
