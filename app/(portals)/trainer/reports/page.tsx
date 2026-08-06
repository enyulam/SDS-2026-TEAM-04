import { Suspense } from "react";
import { ReturnedReportsQueue } from "@/features/trainer/returned-reports-queue";

export default function TrainerReportsPage() {
  return (
    <Suspense fallback={null}>
      <ReturnedReportsQueue />
    </Suspense>
  );
}
