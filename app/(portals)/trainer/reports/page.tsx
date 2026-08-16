import { Suspense } from "react";

import { TrainerReportsRoute } from "@/features/trainer/trainer-reports-route";

/**
 * Screen `09` — Trainer Reports (`P2-21`), at its canonical route
 * `/trainer/reports`.
 *
 * ⛔ `C2C-007` IS FIXED HERE. This route previously rendered the returned-
 * correction queue and returned `unavailable` unless `?status=needs_edit` was
 * present — ▶ **the canonical route refused itself**, which is why the ratified
 * inventory recorded screen `09` as `Partially implemented`.
 *
 * ⚠️ THE QUEUE IS PRESERVED AS A COMPATIBILITY ALIAS, WHICH IS WHAT THE PACK
 * RATIFIES. `09-trainer-reports/screen.md` §1: *"No route mismatch — canonical
 * route satisfied; screen content incomplete. `?status=needs_edit` preserved as
 * a compatibility alias."* ▶ Four live links point at `?status=needs_edit`
 * (the trainer dashboard, the trainer review screen and their management
 * counterparts); none of them moves.
 */
export default function TrainerReportsPage() {
  return (
    <Suspense fallback={null}>
      <TrainerReportsRoute />
    </Suspense>
  );
}
