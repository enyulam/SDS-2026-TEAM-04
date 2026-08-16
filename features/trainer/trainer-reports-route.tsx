"use client";

import { useSearchParams } from "next/navigation";

import { ReturnedReportsQueue } from "@/features/trainer/returned-reports-queue";
import { TrainerReportsScreen } from "@/features/trainer/trainer-reports-screen";

/**
 * ⛔ THE `C2C-007` FIX, AND IT IS ONE BRANCH.
 *
 * `/trainer/reports` is screen `09`'s canonical route. Before this it rendered
 * the returned-correction queue, which returned `unavailable` unless
 * `?status=needs_edit` was present — ▶ **so the canonical route refused
 * itself**, and the ratified inventory recorded `09` as
 * `Partially implemented`.
 *
 * ⚠️ THE QUEUE IS NOT MOVED AND NOT DELETED. `09-trainer-reports/screen.md` §1
 * ratifies exactly this shape: *"canonical route satisfied … `?status=needs_edit`
 * preserved as a compatibility alias."* Four live links point at that query
 * (`trainer-dashboard`, `trainer-report-review`, and their two management
 * counterparts at `/management/reports`), and none of them changes.
 *
 * ⛔ THE BRANCH IS ON THE QUERY, NOT ON AUTHORITY. Nothing here reads a role, a
 * claim or a permission — both surfaces resolve their own reach in the database
 * (`ADR-4`), and a query parameter is presentation selection only (`A-045`).
 */
export function TrainerReportsRoute() {
  const searchParams = useSearchParams();
  if (searchParams.get("status") === "needs_edit") return <ReturnedReportsQueue />;
  return <TrainerReportsScreen />;
}
