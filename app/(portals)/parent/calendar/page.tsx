import { Suspense } from "react";

import { ParentCalendarScreen } from "@/features/parent/parent-calendar-screen";

/**
 * Screen `31` Parent Calendar (`P2-23`), at its canonical route
 * `/parent/calendar`.
 *
 * ⚠️ **A ROUTE CREATION, NOT A COMPATIBILITY TREATMENT.** The ratified
 * inventory records screen `31` as having **no implemented route** and its
 * route-compatibility treatment as **"Not applicable"** — so nothing is moved,
 * redirected, aliased or replaced here, and the `CLAUDE.md` §12 gate `P2-22`
 * stopped on does not apply. Checked, not assumed.
 */
export default function ParentCalendarPage() {
  return (
    <Suspense fallback={null}>
      <ParentCalendarScreen />
    </Suspense>
  );
}
