/**
 * Session identity resolution — the single authority every backend surface
 * uses to answer "who is calling, and in what role?".
 *
 * Authority derivation (contract §4, ADR-4, A-030):
 *   auth session (validated against the local Auth server, never trusted
 *   from a cookie's own claims) → `accounts.auth_user_id` → the SINGLE
 *   active `centre_memberships` row → role.
 *
 * - The `role` query parameter, the route, the UI tab and every token claim
 *   carry NO authority. None of them is read here.
 * - All reads run under the caller's own RLS scope (`accounts_select_own`,
 *   `centre_memberships_select_own`, `centres_select_active_member`), so a
 *   caller can only ever resolve THEMSELF.
 * - Zero and two-or-more active memberships are both `unauthorized`
 *   (ambiguous identity is no identity — the HAVING count(*) = 1 discipline
 *   of the database, applied at the boundary too).
 * - Denials are non-disclosing: the caller learns `unauthenticated` or
 *   `unauthorized`, never which link in the chain failed.
 *
 * This module is deliberately free of `server-only` and `next/*` imports so
 * the integration suite can exercise it with a real authenticated local
 * client; the `"use server"` wrappers in `actions.ts` add the request scope.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ActionResult } from "@/server/contracts/action-result";

export type SessionRole = "trainer" | "management" | "parent";

export interface SessionIdentity {
  /** The verified Auth user id (auth.users.id). */
  readonly authUserId: string;
  readonly accountId: string;
  readonly membershipId: string;
  readonly centreId: string;
  readonly role: SessionRole;
  readonly displayName: string;
  readonly centreDisplayName: string;
}

export interface SessionUserDto {
  readonly displayName: string;
  readonly role: SessionRole;
  readonly centreDisplayName: string;
}

const ROLES: readonly SessionRole[] = ["trainer", "management", "parent"];

/**
 * Resolve the caller's identity, or a non-disclosing failure outcome.
 * `getUser()` round-trips to the local Auth server, so a forged or expired
 * cookie fails here rather than being trusted.
 */
export async function resolveSessionIdentity(
  client: SupabaseClient,
): Promise<ActionResult<SessionIdentity>> {
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData?.user) {
    return { outcome: "unauthenticated" };
  }
  const authUserId = userData.user.id;

  const { data: accounts, error: accountError } = await client
    .from("accounts")
    .select("id, display_name, status")
    .eq("auth_user_id", authUserId)
    .eq("status", "active");
  if (accountError || !accounts || accounts.length !== 1) {
    return { outcome: "unauthorized" };
  }
  const account = accounts[0] as { id: string; display_name: string };

  const { data: memberships, error: membershipError } = await client
    .from("centre_memberships")
    .select("id, centre_id, role, status")
    .eq("account_id", account.id)
    .eq("status", "active");
  if (membershipError || !memberships || memberships.length !== 1) {
    return { outcome: "unauthorized" };
  }
  const membership = memberships[0] as { id: string; centre_id: string; role: string };
  if (!ROLES.includes(membership.role as SessionRole)) {
    return { outcome: "unauthorized" };
  }

  const { data: centres, error: centreError } = await client
    .from("centres")
    .select("id, display_name")
    .eq("id", membership.centre_id);
  if (centreError || !centres || centres.length !== 1) {
    return { outcome: "unauthorized" };
  }

  return {
    outcome: "success",
    data: {
      authUserId,
      accountId: account.id,
      membershipId: membership.id,
      centreId: membership.centre_id,
      role: membership.role as SessionRole,
      displayName: account.display_name,
      centreDisplayName: (centres[0] as { display_name: string }).display_name,
    },
  };
}

/**
 * Resolve the caller and require a specific role. The failure is the same
 * non-disclosing `unauthorized` whether the caller is the wrong role or has
 * no identity at all.
 */
export async function requireRole(
  client: SupabaseClient,
  role: SessionRole,
): Promise<ActionResult<SessionIdentity>> {
  const resolved = await resolveSessionIdentity(client);
  if (resolved.outcome !== "success") return resolved;
  if (resolved.data.role !== role) return { outcome: "unauthorized" };
  return resolved;
}

export function toSessionUserDto(identity: SessionIdentity): SessionUserDto {
  return {
    displayName: identity.displayName,
    role: identity.role,
    centreDisplayName: identity.centreDisplayName,
  };
}
