import { Suspense } from "react";
import { TrainerReportReview } from "@/features/trainer/trainer-report-review";

export default function TrainerReportReviewPage() {
  return (
    <Suspense fallback={null}>
      <TrainerReportReview />
    </Suspense>
  );
}
