import { Suspense } from "react";

import { ParentDashboardScreen } from "@/features/parent/parent-dashboard-screen";

/**
 * Screen `30` Parent Dashboard (`P2-22`), at its canonical route
 * `/parent/dashboard`.
 *
 * ⛔ BUILT UNDER AN OPERATOR RULING, 2026-08-17 — option 3 of the three stated
 * at plan §57.6: canonical route here, `/parent` preserved as a compatibility
 * redirect on the ratified **`R-B1`** precedent, and the rail retargeted with
 * `Home` becoming `Overview`.
 *
 * ⚠️ **THE RAIL MOVED WITH IT, AND THAT COUPLING IS THE RULING'S REASON.**
 * Leaving the rail pointing at `/parent` while this screen lives here would
 * manufacture **exactly the navigation dead end `P2-21` just closed** — an item
 * naming one surface and reaching another.
 *
 * ⚠️ `proxy.ts` needs no change and was checked, not assumed: its parent
 * entries are PORTAL-PREFIX matchers (`/parent`, `/parent/:path*`), so this
 * route was inside the authenticated boundary before it existed.
 */
export default function ParentDashboardPage() {
  return (
    <Suspense fallback={null}>
      <ParentDashboardScreen />
    </Suspense>
  );
}
