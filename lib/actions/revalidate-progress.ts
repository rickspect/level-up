import { revalidatePath } from "next/cache";
import type { ActivityType } from "@/lib/types";

export function revalidateActivityPages(activityType: ActivityType) {
  revalidatePath("/", "layout");
  revalidatePath("/progress", "layout");
  revalidatePath(`/progress/${activityType}`);
}
