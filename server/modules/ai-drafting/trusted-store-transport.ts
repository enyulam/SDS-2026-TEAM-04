import "server-only";

/**
 * Trusted-draft transport selection — SERVER-ONLY, EXPLICIT, FAIL-CLOSED.
 *
 * ---------------------------------------------------------------------
 * WHY THIS IS AN EXPLICIT VARIABLE AND NOT AN INFERENCE
 * ---------------------------------------------------------------------
 * There are two transports to the privileged role and they are NOT
 * interchangeable: `LocalTrustedDraftStore` shells out to `docker exec` into
 * a named local container, and `HostedTrustedDraftStore` opens a pooled
 * Postgres connection. Picking the wrong one does not degrade — it fails
 * outright, and it fails at the last step of the AI feature.
 *
 * Inferring it from `NODE_ENV` was expressly ruled out, and the reason is
 * concrete rather than stylistic: `NODE_ENV === "production"` is true for a
 * LOCAL `next build && next start` as well as for a hosted deployment, so
 * that inference would select the hosted transport on a developer machine
 * that has no pooled connection string, and the failure would look like a
 * broken AI feature rather than a misconfiguration.
 *
 * ---------------------------------------------------------------------
 * FAIL-CLOSED
 * ---------------------------------------------------------------------
 * ABSENT, blank, unknown or wrong-case all THROW. There is no default. A
 * default is what turns a missing setting into a silent, wrong choice, and
 * the caller in `report-workflow/actions.ts` converts the throw into a
 * neutral `generation_failure` whose diagnostic names the VARIABLE and never
 * a value.
 *
 * ⚠️ Deliberately NOT prefixed `NEXT_PUBLIC_`. That prefix is the only thing
 * that would place this in a browser bundle, and transport selection must be
 * reachable only by whoever can start the server process — never by a query
 * parameter, cookie, header or UI control.
 */

import { HostedTrustedDraftStore } from "@/server/modules/ai-drafting/hosted-trusted-store";
import { LocalTrustedDraftStore, type TrustedDraftStore } from "@/server/modules/ai-drafting/trusted-store";

export const TRUSTED_TRANSPORT_VAR = "BEST_COACH_TRUSTED_DRAFT_TRANSPORT" as const;

export const TRANSPORT_LOCAL = "local" as const;
export const TRANSPORT_HOSTED = "hosted" as const;

export type TrustedTransport = typeof TRANSPORT_LOCAL | typeof TRANSPORT_HOSTED;

/**
 * Resolve the configured transport, or THROW. Exact match only — `"Local"`,
 * `"LOCAL"`, `""` and `undefined` are all rejected, exactly as the Supabase
 * runtime profile treats its own values.
 */
export function requireTrustedTransport(): TrustedTransport {
  const raw = process.env[TRUSTED_TRANSPORT_VAR];
  if (raw === TRANSPORT_LOCAL) return TRANSPORT_LOCAL;
  if (raw === TRANSPORT_HOSTED) return TRANSPORT_HOSTED;
  throw new Error(
    `[E_SRV_TRUSTED_TRANSPORT] ${TRUSTED_TRANSPORT_VAR} must be exactly ` +
      `"${TRANSPORT_LOCAL}" or "${TRANSPORT_HOSTED}"`,
  );
}

/** Construct the configured trusted store. Throws if the transport is not explicitly set. */
export function createTrustedDraftStore(): TrustedDraftStore {
  return requireTrustedTransport() === TRANSPORT_HOSTED
    ? new HostedTrustedDraftStore()
    : new LocalTrustedDraftStore();
}
