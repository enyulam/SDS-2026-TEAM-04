import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppDatabase } from "@/server/db/app-database";

/**
 * `P2-13` — screen `21` Create Parent Account.
 *
 * ⛔ ONE GOVERNED WRITE RPC, `admin_create_parent`, AND NO CLIENT DML
 * (`ADR-3`). Five rows and four audit events commit in ONE transaction inside
 * the function: an account, a PENDING membership, a parent profile, an
 * invitation, and one link per child. ▶ Split across client calls, a failure
 * halfway would leave a guardian with an account and no child, or a child
 * linked to an account that can never sign in.
 *
 * ⚠️ **A REFUSAL IS NOT A FAILURE, AND NOT A SUCCESS.** Anything other than
 * `created` is reported NOT-OK, so no caller can read `email_in_use` as an
 * account having been made.
 */

export type ParentAccountResult =
  | {
      readonly ok: true;
      readonly membershipId: string;
      readonly invitationId: string;
      readonly links: number;
      readonly reason: "created";
    }
  | { readonly ok: false; readonly reason: string };

export async function createParentAccountCore(
  client: SupabaseClient<AppDatabase>,
  input: { readonly fullName: string; readonly email: string; readonly studentIds: readonly string[] },
): Promise<ParentAccountResult> {
  const result = await client.rpc("admin_create_parent", {
    p_display_name: input.fullName,
    p_email: input.email,
    p_student_ids: [...input.studentIds],
  });
  if (result.error !== null) return { ok: false, reason: "unavailable" };

  /* OUT parameters with `proretset` false → a BARE OBJECT, the `P2-11` shape. */
  const row = result.data as
    | { o_membership_id: string | null; o_invitation_id: string | null; o_links: number; o_reason: string }
    | null;
  if (row === null) return { ok: false, reason: "unavailable" };
  if (row.o_reason !== "created" || row.o_membership_id === null || row.o_invitation_id === null) {
    return { ok: false, reason: row.o_reason };
  }
  return {
    ok: true,
    membershipId: row.o_membership_id,
    invitationId: row.o_invitation_id,
    links: row.o_links,
    reason: "created",
  };
}
