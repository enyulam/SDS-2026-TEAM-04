import { Suspense } from "react";
import { ParentDashboard } from "@/features/parent/parent-dashboard";

export default function ParentPage() {
  return (
    <Suspense fallback={null}>
      <ParentDashboard />
    </Suspense>
  );
}
