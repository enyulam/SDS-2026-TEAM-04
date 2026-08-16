import { redirect } from "next/navigation";

/**
 * `/parent` — COMPATIBILITY REDIRECT onto the canonical Parent entry route.
 *
 * ⚠️ Operator ruling, 2026-08-17 (`P2-22`, option 3). Screen `30`'s canonical
 * route is `/parent/dashboard`; this file is deliberately **NOT deleted**,
 * because `/parent` is a destination delivered surfaces and the portal shell
 * already link to and must keep working.
 *
 * ⛔ **BUILT TO THE RATIFIED PRECEDENT, NOT A NEW PATTERN.** `R-B1` made
 * `/trainer` a compatibility redirect onto `/trainer/schedule`, and `P2-7` gave
 * `/management` the same treatment onto `/management/dashboard`. ▶ **This is the
 * third and last of the three portal roots**, in the identical shape, and the
 * rail names the DESTINATION rather than the redirect — a rail item pointing at
 * a route that redirects away could never be the current one.
 *
 * ⚠️ **WHAT THIS FILE STOPS RENDERING, RECORDED RATHER THAN DELETED.** It
 * previously rendered `features/parent/parent-dashboard.tsx`, the R-10
 * availability card. **That component is RETAINED** — two live suites assert
 * over it (`prove:hero-13` on its Operator-ruled three-state empty copy, and
 * `prove:p1-1b` on its `Q-27` rating-free-ness) — but **no route renders it
 * now**, so the ruled availability copy is unreachable. ▶ That is a
 * CONSEQUENCE of this ruling, not a decision taken inside it, and it is
 * reported rather than resolved: where that copy belongs (screen `32`, the
 * reports surface, is the natural candidate) is a ruling, not an inference.
 *
 * ⚠️ `portal-destinations.ts` is UNCHANGED and needs no change: a parent
 * sign-in already lands on `/parent/reports` (screen `32`, `C2C-012`), never on
 * this route.
 */
export default function ParentEntryRoute() {
  redirect("/parent/dashboard");
}
