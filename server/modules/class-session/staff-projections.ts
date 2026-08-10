/**
 * Class-session staff identity — hero chain Phase 0A.
 *
 * ONE shared read path for the assigned trainer's display name, consumed by
 * six of the eight framed hero screens (`05`, `06`, `29`, `19`, `32`, `33`).
 * It is built once, deliberately: deriving the same join inside six screen
 * phases is the layer-first duplication the plan excludes, and it would put
 * six independent copies of an authorization decision into the codebase.
 *
 * ---------------------------------------------------------------------
 * WHY THIS GOES THROUGH AN RPC AND NOT A DIRECT TABLE READ
 * ---------------------------------------------------------------------
 * Every other trainer/management projection in this codebase reads over the
 * caller's OWN credential, because Step 7G already scoped those tables to
 * those roles. This one cannot: G-5 permits the trainer's name on a PARENT
 * surface, and Step 7G gives a parent no path to `accounts` (own row and
 * management only) and none at all to `class_session_assignments` — its own
 * comment says "Parents receive no assignment path in this checkpoint".
 *
 * Serving that by widening an `accounts` policy would expose account rows to
 * parents generally, to deliver one display name. `class_session_staff_identity`
 * is the narrower instrument: it re-derives the caller's live reach per call
 * and returns one field.
 *
 * ---------------------------------------------------------------------
 * WHAT THIS MODULE MUST NEVER BECOME
 * ---------------------------------------------------------------------
 * ⛔ G-7 — there is no `Assist.` slot and no second staff row. The database
 *    guarantees at most one active assignment per session, and this module
 *    returns a single optional name. Do not add a second field, do not map
 *    over an array, and do not extend `centre_membership_role`.
 * ⛔ G-3 — this is staff identity ONLY. It must never be joined into, merged
 *    with, or rendered in place of the roster's governed carried-over
 *    previous-session focus (`RosterEntryDto.previousSessionFocus`). They are
 *    different fields with different authority.
 * ⛔ G-2 — no rating, roll-up or derived assessment fact belongs here.
 *
 * No email, account status, auth id or centre id crosses this boundary — the
 * RPC does not return them, so this module cannot leak them.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ActionResult } from "@/server/contracts/action-result";
import { firstRow } from "@/server/modules/report-workflow/rpc-types";

/**
 * The assigned trainer for one class session.
 *
 * `trainerDisplayName` is `null` when the session has no active assignment —
 * a real governed state (a session created but not yet assigned), which is
 * why this is an optional field rather than a failed read.
 */
export interface SessionStaffIdentityDto {
  readonly sessionId: string;
  readonly trainerMembershipId: string | null;
  readonly trainerDisplayName: string | null;
}

interface StaffIdentityRow {
  readonly class_session_id: string;
  readonly trainer_membership_id: string;
  readonly trainer_display_name: string;
}

/**
 * Read the assigned trainer for one session.
 *
 * ⚠️ Returns `success` with a null name for BOTH "no active assignment" and
 * "the caller may not see this session". That is deliberate and matches the
 * parent-denial discipline already ratified for the canonical report read
 * (R-C2-6): a caller must not be able to distinguish "unassigned" from "not
 * yours" by the shape of the answer. The authorization decision itself is
 * made in the database, per call, and is not re-implemented here — this
 * function has no role test of its own to get out of step with the RPC's.
 */
export async function getSessionStaffIdentityCore(
  client: SupabaseClient,
  sessionId: string,
): Promise<ActionResult<SessionStaffIdentityDto>> {
  const { data, error } = await client.rpc("class_session_staff_identity", {
    p_session_id: sessionId,
  });

  if (error) {
    // No SQLSTATE mapping: this RPC raises nothing. It returns zero rows for
    // every denial, so an error here is a transport or availability fault,
    // never an authorization signal.
    return { outcome: "unavailable" };
  }

  const row = firstRow<StaffIdentityRow>(data);
  if (row === null) {
    return {
      outcome: "success",
      data: { sessionId, trainerMembershipId: null, trainerDisplayName: null },
    };
  }

  return {
    outcome: "success",
    data: {
      sessionId,
      trainerMembershipId: row.trainer_membership_id,
      trainerDisplayName: row.trainer_display_name,
    },
  };
}

/**
 * Batch form for list surfaces (`29` Management Reports, `32` Parent Reports),
 * which render one trainer per row.
 *
 * ⚠️ Sequential by construction, and NOT because concurrency is hard: each
 * call is an independent authorization decision in the database, and the
 * result map must contain exactly the sessions this caller may actually see.
 * Sessions the caller cannot reach are ABSENT from the map rather than
 * present with a null — the caller already gets that distinction right by
 * asking only about sessions it enumerated through its own scope.
 */
export async function getSessionStaffIdentitiesCore(
  client: SupabaseClient,
  sessionIds: readonly string[],
): Promise<ActionResult<ReadonlyMap<string, SessionStaffIdentityDto>>> {
  const out = new Map<string, SessionStaffIdentityDto>();
  for (const sessionId of new Set(sessionIds)) {
    const one = await getSessionStaffIdentityCore(client, sessionId);
    if (one.outcome !== "success") return one;
    out.set(sessionId, one.data);
  }
  return { outcome: "success", data: out };
}
