import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { ActionResult } from "@/server/contracts/action-result";
import { resolveSessionIdentity } from "@/server/modules/identity-access/session-core";
import type { AppDatabase } from "@/server/db/app-database";

/**
 * `P2-11` — screen `24` Management Add Trainer. The governed trainer
 * invitation.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⛔ THIS MODULE OWNS NO TABLE AND WRITES NO ROW ITSELF
 * ═══════════════════════════════════════════════════════════════════════════
 * Every row is written by `admin_create_trainer`, a `SECURITY DEFINER` RPC, in
 * ONE transaction. `authenticated` holds **no `INSERT` anywhere** — `accounts`,
 * `centre_memberships` and `trainer_profiles` are `SELECT`-only and
 * `invitations` carries **no grant at all**, all four asserted as EXACT
 * privilege sets by the migration's `PC-5`. ▶ This file is the caller, the
 * validator-for-UX and the mapper. **It is not the boundary**, and a caller who
 * skipped it entirely would still be refused by the database.
 *
 * ⚠️ FOUR ROWS, ONE ACTION. An account, a `pending` membership, a trainer
 * profile and an invitation. Splitting them across calls would make a
 * membership with no invitation representable — a person who exists as staff
 * and can never be told so — which is why the RPC is the unit rather than four
 * client calls.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⛔ FOUR FIELDS THE FRAME DRAWS THAT THIS DOES NOT CARRY — EACH FOR A
 *    DIFFERENT REASON, AND NONE OF THEM "not built yet"
 * ═══════════════════════════════════════════════════════════════════════════
 * 1. **`Role` (Main Trainer / Assistant Trainer)** — ⛔ `GC-11`, recorded in
 *    pack `24` under ruling `Q-24` and NOT re-derived here: `Assistant Trainer`
 *    is **not a member of the `centre_membership_role` enum**, so the option
 *    cannot be persisted at all. TA is a deferred persona (`A-014`, `G-7`). The
 *    role is pinned inside the RPC and is not a parameter of anything.
 *
 * 2. **`Employee ID`** and 3. **`Phone`** — ⛔ **NO COLUMN EXISTS** on
 *    `accounts`, `centre_memberships`, `trainer_profiles` or `invitations`,
 *    measured in the catalogue before writing this file. ▶ They are the ONE
 *    item here that is a genuine Operator decision rather than a governance
 *    refusal: there is no rule against a staff phone number, only no place to
 *    put one, and adding two columns is a schema change that needs its own
 *    authorization. **Raised, not invented, and not quietly dropped.**
 *
 * 4. **`Upload photo`** — ⛔ no column, no bucket, no policy, and `C-15` defers
 *    the STUDENT photo on PDPA grounds for `P2-12`/`P2-14`. That ruling does
 *    not literally name a trainer photo; this refusal rests on its own footing
 *    — three missing objects — with `C-15` cited as the adjacent precedent
 *    rather than as if it had ruled this.
 *
 * ⛔ `Assign Classes` IS ALSO ABSENT, and it is the subtlest of the five.
 * `A-016` makes trainer assignment authoritative at **CLASS SESSION** level;
 * the frame's chips are **Class MODULES**. Selecting one would have to mean
 * "assign every session of this module", which is a different governed action
 * with different consequences — and it would be aimed at a **`pending`**
 * membership, i.e. someone who has not yet accepted and may never. ▶ Assignment
 * already has a governed path (`admin_assign_session_trainer`, `P2-2b`) and it
 * runs from the class screens, against a real trainer, per session.
 *
 * ⚠️ THE FRAME'S CHIPS ALSO READ `Junior · Public Speaking`. `Junior` is **not
 * a ratified Class Grade** — the three are `Beginner`, `Intermediate`,
 * `Advanced` (`A-016`) — and one chip is drawn twice. Mock inconsistencies,
 * recorded so a later reader does not take them for a vocabulary.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⛔ TWO INPUTS ON THE FORM, ONE COLUMN IN THE DATABASE
 * ═══════════════════════════════════════════════════════════════════════════
 * The frame draws `First name` and `Last name`; `accounts.display_name` is ONE
 * `NOT NULL` column. ▶ They are joined HERE, and the joined value is what every
 * surface shows — so the directory, the audit target and the invitation all
 * name the same person the same way. Storing two columns would have required a
 * schema change to represent something the schema already represents.
 */

/** What the form sends. ⛔ No role, no phone, no employee id, no photo. */
export interface CreateTrainerInput {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
}

export interface TrainerInvitationOutcome {
  readonly membershipId: string;
  readonly invitationId: string;
  /** `created`, or the governed reason the RPC refused. */
  readonly reason: string;
}

interface CreateTrainerRpcRow {
  readonly o_membership_id: string | null;
  readonly o_invitation_id: string | null;
  readonly o_reason: string | null;
}

/**
 * ⚠️ THE REASONS THE RPC CAN RETURN, LISTED SO THE UI CANNOT INVENT A
 * FRIENDLIER ONE. `not_permitted` is deliberately non-disclosing: it is what a
 * caller with no active management membership sees, and it must never grow a
 * detail that tells an unauthorized caller what exists.
 */
export const TRAINER_INVITATION_REASONS = [
  "created",
  "not_permitted",
  "invalid_name",
  "invalid_email",
  "email_in_use",
  "invitation_pending",
] as const;

/**
 * Create a trainer profile and its invitation.
 *
 * ⛔ THE CLIENT-SIDE VALIDATION BELOW IS UX CONVENIENCE, NOT A GATE (`ADR-3`,
 * §3.5). Every one of these checks is repeated inside the RPC, over the values
 * the database actually receives. Deleting this block would change the message
 * a user sees and would let nothing through.
 */
export async function createTrainerCore(
  client: SupabaseClient<AppDatabase>,
  input: CreateTrainerInput,
): Promise<ActionResult<TrainerInvitationOutcome>> {
  const guard = await resolveSessionIdentity(client);
  if (guard.outcome !== "success") return guard;
  if (guard.data.role !== "management") return { outcome: "unauthorized" };

  const displayName = [input.firstName, input.lastName]
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .join(" ");
  const email = input.email.trim().toLowerCase();
  if (displayName.length === 0 || displayName.length > 120) return { outcome: "unavailable" };
  if (email.length < 3 || !email.includes("@")) return { outcome: "unavailable" };

  const call = await client.rpc("admin_create_trainer", {
    p_display_name: displayName,
    p_email: email,
  });
  if (call.error) return { outcome: "unavailable" };

  /*
   * ⚠️ `firstRpcRow`, WHICH ACCEPTS A BARE OBJECT.
   * `admin_create_trainer` is `RETURNS record` with `proretset = false`, so
   * PostgREST resolves it to a BARE OBJECT rather than an array — the same
   * shape every other `OUT`-parameter RPC in this project returns, and the
   * reason a set-shaped reader would find `undefined` on a call that in fact
   * succeeded.
   */
  const row = firstRpcRow<CreateTrainerRpcRow>(call.data);
  if (row === null) return { outcome: "unavailable" };

  /*
   * ⛔ A REFUSAL IS NOT AN EMPTY SUCCESS (`Q-7`). The RPC returns NULL ids
   * with a reason, and that reason is MAPPED rather than flattened into one
   * generic failure — `email_in_use` and `not_permitted` mean entirely
   * different things to the person at the form, and only one of them is
   * something they can act on.
   */
  if (row.o_membership_id === null || row.o_invitation_id === null) {
    return mapInvitationReason(row.o_reason ?? "not_permitted");
  }

  return {
    outcome: "success",
    data: {
      membershipId: row.o_membership_id,
      invitationId: row.o_invitation_id,
      reason: row.o_reason ?? "created",
    },
  };
}

function firstRpcRow<T>(data: unknown): T | null {
  const row = Array.isArray(data) ? data[0] : data;
  return (row as T) ?? null;
}

/**
 * ⚠️ THE REFUSAL SIDE COLLAPSES; THE DIAGNOSTIC SIDE DOES NOT — the same
 * split `class-creation.ts` established.
 *
 * ⛔ `not_permitted` becomes a bare `unauthorized` WITH NO MESSAGE. It is the
 * RPC's single indistinguishable answer to *"you are not management"*, *"you
 * are nobody"* and *"your management membership is ambiguous"* alike, and
 * adding a detail here would leak back out what the database deliberately
 * refused to say.
 *
 * ⚠️ EVERYTHING ELSE IS A DIAGNOSTIC FOR SOMEONE THE DATABASE ALREADY
 * PROVED IS ACTIVE MANAGEMENT OF THIS CENTRE, so naming the field is safe and
 * is the difference between a form the user can fix and one that just says no.
 * ⛔ None of these messages interpolates a row value — the address is one the
 * caller just typed, and it is not echoed back.
 */
function mapInvitationReason(reason: string): ActionResult<never> {
  switch (reason) {
    case "invalid_name":
      return {
        outcome: "validation",
        message: "Enter the trainer's name.",
        fields: [{ path: "firstName", message: "A first or last name is required." }],
      };
    case "invalid_email":
      return {
        outcome: "validation",
        message: "Enter a valid email address.",
        fields: [{ path: "email", message: "That does not look like an email address." }],
      };
    case "email_in_use":
      return {
        outcome: "validation",
        message: "That email already belongs to an account at this centre.",
        fields: [{ path: "email", message: "Already in use." }],
      };
    case "invitation_pending":
      return {
        outcome: "validation",
        message: "An invitation to that address is already pending.",
        fields: [{ path: "email", message: "Revoke the pending invitation first." }],
      };
    case "not_permitted":
      return { outcome: "unauthorized" };
    default:
      return { outcome: "unavailable" };
  }
}
