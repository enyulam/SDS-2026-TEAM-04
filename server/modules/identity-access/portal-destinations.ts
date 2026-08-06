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
 */

import type { SessionRole } from "@/server/modules/identity-access/session-core";

const PORTAL_HOME: Readonly<Record<SessionRole, string>> = {
  trainer: "/trainer",
  management: "/management",
  parent: "/parent",
};

/** The portal home for a role the SERVER derived. Never call with user input. */
export function portalHomeForRole(role: SessionRole): string {
  return PORTAL_HOME[role];
}
