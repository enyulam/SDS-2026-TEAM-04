import "server-only";

/**
 * Portal access guard — SERVER-SIDE PORTAL AUTHORIZATION (F16-B), layer 2 of 2.
 *
 * `proxy.ts` at the repository root is layer 1: it intercepts every portal
 * request before it reaches the App Router, refreshes the session cookies, and
 * redirects an unresolved or wrong-role caller. This module is the SECOND,
 * independent layer, invoked from each portal route-group layout
 * (`app/(portals)/{trainer,management,parent}/layout.tsx`).
 *
 * WHY BOTH. A matcher is a configuration artefact: a typo, a reordering, a new
 * route group added outside the matched prefixes, or a future refactor that
 * drops `proxy.ts` would each silently disable layer 1 with no type error and
 * no build failure. Because this guard runs inside the layout itself, it cannot
 * be bypassed by any route beneath that layout — a proxy misconfiguration ALONE
 * can never expose a portal. Neither layer is a client-side rendering check:
 * both re-derive authority on the server from live database state on every
 * request.
 *
 * The rule is not re-invented here. It is the same `resolveSessionIdentity`
 * chain — validated Auth user -> exactly one active `accounts` row -> exactly
 * one active `centre_memberships` row -> `centres` — read under the caller's
 * own RLS scope through the request-scoped publishable-key client. The elevated
 * service-role client is never imported on this path.
 *
 * Denials are non-disclosing and match the proxy's exactly:
 *   - no session, no active account, no membership, ambiguous membership
 *     -> `/login`, with no reason encoded in the URL, headers or body;
 *   - authenticated but wrong role -> the caller's OWN portal root, which
 *     reveals neither that the requested route exists nor which permission was
 *     missing.
 *
 * The `role` query parameter is not read here and is not a parameter of this
 * function; it grants nothing (A-046, Amendment 005). The caller of this guard
 * passes a portal constant fixed in the layout's own source — never anything
 * derived from the request.
 *
 * `redirect()` throws, so control never returns from a denial and the returned
 * `SessionIdentity` is always a resolved one.
 */

import { redirect } from "next/navigation";
import { createRequestSupabaseClient } from "@/server/platform/supabase/request";
import {
  resolveSessionIdentity,
  type SessionIdentity,
  type SessionRole,
} from "@/server/modules/identity-access/session-core";
import { portalHomeForRole } from "@/server/modules/identity-access/portal-destinations";

/**
 * Require that the caller's SERVER-DERIVED role is exactly `portal`.
 *
 * @param portal a literal fixed in the layout source, never request-derived.
 * @returns the resolved identity, for a layout that wants to render the
 *          caller's own display name / centre without re-resolving.
 */
export async function requirePortalAccess(portal: SessionRole): Promise<SessionIdentity> {
  const client = await createRequestSupabaseClient();
  const identity = await resolveSessionIdentity(client);

  if (identity.outcome !== "success") {
    redirect("/login");
  }

  if (identity.data.role !== portal) {
    redirect(portalHomeForRole(identity.data.role));
  }

  return identity.data;
}
