"use client";

import type { ReactNode } from "react";
import { DailyQuestProvider } from "@/components/DailyQuestProvider";

export default function DailyQuestShell({ children }: { children: ReactNode }) {
  return <DailyQuestProvider>{children}</DailyQuestProvider>;
}
