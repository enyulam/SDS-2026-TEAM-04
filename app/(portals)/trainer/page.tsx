import { Suspense } from "react";
import { TrainerDashboard } from "@/features/trainer/trainer-dashboard";

export default function TrainerPage() {
  return (
    <Suspense fallback={null}>
      <TrainerDashboard />
    </Suspense>
  );
}
