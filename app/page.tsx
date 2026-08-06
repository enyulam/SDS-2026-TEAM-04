import { redirect } from "next/navigation";
import { createRequestSupabaseClient } from "@/server/platform/supabase/request";
import { resolveSessionIdentity } from "@/server/modules/identity-access/session-core";
import { portalHomeForRole } from "@/server/modules/identity-access/portal-destinations";

/**
 * Root route — a server-only routing decision, and nothing else (F16-A).
 *
 * This replaces the create-next-app starter that previously occupied `/`.
 *
 * It renders NO UI: every path out of this component is a `redirect`, so there is no markup,
 * no fallback and no branch on which a datum could be exposed. It reads only the caller's own
 * identity, under the caller's own RLS scope, via the request-scoped client — the elevated
 * service-role client is never imported here.
 *
 * Both failure modes — no session at all, and a session with no single active
 * account/membership — go to `/login`. They are indistinguishable from outside: the same
 * destination, the same status, no message, so `/` never discloses whether an authenticated
 * identity exists but lacks a membership.
 *
 * The destination for a successful resolution comes from `identity.data.role`, which
 * `resolveSessionIdentity` derived from the live `centre_memberships` row. Nothing the caller
 * supplied — no query parameter, no cookie claim, no header — influences it.
 *
 * This is NOT route protection for the portals; that is F16-B. `/` simply refuses to be a
 * landing page for an unresolved caller.
 */

/** `cookies()` already forces this dynamic; the declaration makes the intent explicit. */
export const dynamic = "force-dynamic";

export default async function RootRoute(): Promise<never> {
  const client = await createRequestSupabaseClient();
  const identity = await resolveSessionIdentity(client);

  if (identity.outcome !== "success") {
    redirect("/login");
  }

  redirect(portalHomeForRole(identity.data.role));
}
