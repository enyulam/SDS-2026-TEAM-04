import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppDatabase } from "@/server/db/app-database";

/**
 * `P2-14` — screen `22` Edit Student.
 *
 * ⛔ TWO GOVERNED WRITE RPCs AND NO CLIENT DML (`ADR-3`). The name change,
 * every enrolment added or withdrawn, and their audit events commit in ONE
 * transaction inside each function.
 *
 * ⚠️ **A REFUSAL IS NOT A FAILURE AND NOT A SUCCESS.** Anything other than
 * `saved` / `withdrawn` is reported NOT-OK, so no caller can read
 * `unknown_student` as a change having been made.
 */

export type UpdateStudentResult =
  | { readonly ok: true; readonly added: number; readonly removed: number; readonly nameChanged: boolean }
  | { readonly ok: false; readonly reason: string };

export async function updateStudentCore(
  client: SupabaseClient<AppDatabase>,
  input: {
    readonly studentId: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly classModuleIds: readonly string[];
    readonly dateOfBirth?: string | null;
    /**
     * ⛔ SEND `null` FOR BOTH WHENEVER THE LEARNER HAS A LINKED PARENT ACCOUNT.
     * The RPC REFUSES with `guardian_locked` rather than silently ignoring a
     * value, because a linked account always wins (Operator ruling 2026-08-16,
     * option (c)) — and a silent ignore would let a caller believe it had
     * corrected a guardian's details while the screen kept showing the
     * account's, with nothing to say why they disagreed.
     */
    readonly guardianName?: string | null;
    readonly guardianContact?: string | null;
  },
): Promise<UpdateStudentResult> {
  const result = await client.rpc("admin_update_student", {
    p_student_id: input.studentId,
    p_first_name: input.firstName,
    p_last_name: input.lastName,
    p_class_module_ids: [...input.classModuleIds],
    p_date_of_birth: input.dateOfBirth ?? null,
    p_guardian_name: input.guardianName ?? null,
    p_guardian_contact: input.guardianContact ?? null,
  });
  if (result.error !== null) return { ok: false, reason: "unavailable" };
  const row = result.data as
    | { o_reason: string; o_added: number; o_removed: number; o_name_changed: boolean }
    | null;
  if (row === null || row.o_reason !== "saved") {
    return { ok: false, reason: row?.o_reason ?? "unavailable" };
  }
  return { ok: true, added: row.o_added, removed: row.o_removed, nameChanged: row.o_name_changed };
}

export type WithdrawStudentResult =
  | { readonly ok: true; readonly removed: number }
  | { readonly ok: false; readonly reason: string };

export async function withdrawStudentCore(
  client: SupabaseClient<AppDatabase>,
  studentId: string,
): Promise<WithdrawStudentResult> {
  const result = await client.rpc("admin_withdraw_student", { p_student_id: studentId });
  if (result.error !== null) return { ok: false, reason: "unavailable" };
  const row = result.data as { o_reason: string; o_removed: number } | null;
  if (row === null || row.o_reason !== "withdrawn") {
    return { ok: false, reason: row?.o_reason ?? "unavailable" };
  }
  return { ok: true, removed: row.o_removed };
}
