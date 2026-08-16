"use client";

import { useSearchParams } from "next/navigation";

import { TrainerLessonPlanScreen } from "@/features/trainer/trainer-lesson-plan-screen";

/**
 * Screen `03`'s canonical route (`P2-18`).
 *
 * ⛔ `?module=` IS PRESENTATION SELECTION, NEVER AUTHORITY (`A-045`). The
 * projection resolves the requested module against the trainer's OWN assignment
 * rows and falls back to their first one when the id is absent, unknown, or
 * simply not theirs — so a hand-edited query reaches nothing new.
 */
export function TrainerLessonPlanRoute() {
  const searchParams = useSearchParams();
  return <TrainerLessonPlanScreen classModuleId={searchParams.get("module")} />;
}
