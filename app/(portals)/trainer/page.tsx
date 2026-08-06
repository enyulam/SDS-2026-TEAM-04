import { redirect } from "next/navigation";

/**
 * `/trainer` — COMPATIBILITY REDIRECT onto the canonical Trainer entry route.
 *
 * Operator ruling R-B1 resolves the long-open decision U-A5-1 (inventory §7.3):
 * `/trainer/schedule` becomes the canonical Trainer entry route, and `/trainer` is
 * PRESERVED as a compatibility redirect or alias through the physical test. This file is
 * deliberately NOT deleted — `/trainer` works today, is the destination the AUTH-01 login
 * presentation and several delivered surfaces already link to, and must keep working
 * (inventory §7.2 records the same treatment for the deferred screen `01` at
 * `/trainer/dashboard`: "Preserve existing route as redirect").
 *
 * The session-selection function that previously lived on this landing surface is preserved
 * on `/trainer/schedule`, where each Class Session opens the same governed roster
 * (`screen.md` §6). `features/trainer/trainer-dashboard.tsx` is retained unchanged for the
 * deferred screen `01` checkpoint; it is not deleted by this checkpoint.
 */
export default function TrainerEntryRoute() {
  redirect("/trainer/schedule");
}
