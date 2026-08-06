import { Suspense } from "react";
import { ParentReportsList } from "@/features/parent/parent-reports-list";

export default function ParentReportsPage() {
  return (
    <Suspense fallback={null}>
      <ParentReportsList />
    </Suspense>
  );
}
