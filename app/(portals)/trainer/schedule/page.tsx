import { Suspense } from "react";
import { TrainerSchedule } from "@/features/trainer/trainer-schedule";

/**
 * Screen 05 — Trainer Schedule, at its canonical route `/trainer/schedule`
 * (Amendment 005 A-042; inventory §7.3 / U-A5-1, resolved by operator ruling R-B1).
 *
 * This route is CREATED by checkpoint F-04. `/trainer` is preserved as a compatibility
 * redirect onto it — see `app/(portals)/trainer/page.tsx`. No working route was deleted.
 */
export default function TrainerSchedulePage() {
  return (
    <Suspense fallback={null}>
      <TrainerSchedule />
    </Suspense>
  );
}
