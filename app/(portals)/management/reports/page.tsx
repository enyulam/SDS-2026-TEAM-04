import { Suspense } from "react";
import { ManagementReportsQueue } from "@/features/management/management-reports-queue";

export default function ManagementReportsPage() {
  return (
    <Suspense fallback={null}>
      <ManagementReportsQueue />
    </Suspense>
  );
}
