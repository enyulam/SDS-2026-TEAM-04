/**
 * Portal destinations — the single mapping from a SERVER-DERIVED role to the
 * portal a signed-in caller lands on.
 *
 * This module is deliberately keyed by `SessionRole`, the role resolved by
 * `resolveSessionIdentity` from `accounts` → the single active
 * `centre_memberships` row. It is NEVER keyed by the `role` query parameter,
 * which is presentation only and grants nothing (A-046, Amendment 005).
 *
 * There is no string-to-destination lookup exported here: the only way to get a
 * destination is to hold a `SessionRole` the server itself derived. That keeps
 * a caller-supplied value from ever reaching this table.
 *
 * `/trainer` is a compatibility redirect to `/trainer/schedule` and is left as
 * the Trainer destination on purpose — the redirect stays authoritative.
 *
 * ---------------------------------------------------------------------------
 * C2C-012 — MANAGEMENT AND PARENT LAND ON THEIR RATIFIED CORE SCREEN
 * ---------------------------------------------------------------------------
 * This table used to send `management` to `/management` and `parent` to
 * `/parent`. Both are DEFERRED placeholder dashboards: `SCREEN_INDEX.md`
 * classifies screen 11 Management Dashboard and screen 30 Parent Dashboard as
 * Deferred / "not in the physical-test flow", and no frozen reference exists
 * for either. The post-authentication destination must be the next CORE screen
 * of the ratified twelve-screen flow (A-043), not a deferred one.
 *
 * The ratified targets, confirmed in `48H_CORE_SLICE.md` before this change:
 *   - flow 1  AUTH-01 Trainer Login    → "Next screen | 05 Trainer Schedule"
 *   - flow 7  AUTH-02 Management Login → "Next screen | 29 Management Reports"
 *   - flow 10 AUTH-03 Parent Login     → "Next screen | 32 Parent Reports"
 * and their canonical routes, from the same file's flow table:
 *   screen 29 → `/management/reports`, screen 32 → `/parent/reports`.
 *
 * Trainer was ALREADY correct and is unchanged: `/trainer` is the R-B1
 * compatibility alias and `app/(portals)/trainer/page.tsx` redirects it onto
 * `/trainer/schedule`, which is screen 05. Hardcoding the schedule route here
 * would bypass, and quietly devalue, that ratified redirect.
 *
 * `/management` and `/parent` remain REAL, REACHABLE routes and remain the
 * rail's Dashboard/Home destinations (C2C-043). What changed is only where a
 * sign-in LANDS — no route was created, moved, redirected or deleted.
 */

import type { SessionRole } from "@/server/modules/identity-access/session-core";

const PORTAL_HOME: Readonly<Record<SessionRole, string>> = {
  trainer: "/trainer",
  management: "/management/reports",
  parent: "/parent/reports",
};

/** The portal home for a role the SERVER derived. Never call with user input. */
export function portalHomeForRole(role: SessionRole): string {
  return PORTAL_HOME[role];
}
