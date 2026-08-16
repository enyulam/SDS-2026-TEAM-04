import { Suspense } from "react";

import { TrainerLessonPlanRoute } from "@/features/trainer/trainer-lesson-plan-route";

/** Screen `03` — Trainer Lesson Plan (`P2-18`). */
export default function TrainerLessonPlanPage() {
  return (
    <Suspense fallback={null}>
      <TrainerLessonPlanRoute />
    </Suspense>
  );
}
