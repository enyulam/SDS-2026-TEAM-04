import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppDatabase } from "@/server/db/app-database";

/**
 * `P2-12` — screen `20` Register New Student.
 *
 * ⛔ ONE GOVERNED WRITE RPC, `admin_create_student`, AND NO CLIENT DML.
 * `ADR-3`: governance-carrying writes go through reviewed `SECURITY DEFINER`
 * RPCs. The student row, its enrolments and their audit events commit in ONE
 * transaction inside the function — never as separate client calls, which
 * could leave a child registered into no class if the second call failed.
 *
 * ⚠️ **A REFUSAL IS NOT A FAILURE, AND NOT A SUCCESS.** The RPC returns a
 * governed `reason` for every path it declines. Anything other than
 * `created` is reported here as NOT-OK, so a caller can never read
 * `not_permitted` as a registration.
 */

export type StudentRegistrationResult =
  | { readonly ok: true; readonly studentId: string; readonly enrolments: number; readonly reason: "created" }
  | { readonly ok: false; readonly reason: string };

export async function registerStudentCore(
  client: SupabaseClient<AppDatabase>,
  input: { readonly firstName: string; readonly lastName: string; readonly classModuleIds: readonly string[] },
): Promise<StudentRegistrationResult> {
  const result = await client.rpc("admin_create_student", {
    p_first_name: input.firstName,
    p_last_name: input.lastName,
    p_class_module_ids: [...input.classModuleIds],
  });
  if (result.error !== null) return { ok: false, reason: "unavailable" };

  /*
   * `proretset` is false and the function uses OUT parameters, so PostgREST
   * returns a BARE OBJECT rather than an array — the `P2-11` shape, measured
   * rather than assumed.
   */
  const row = result.data as { o_student_id: string | null; o_enrolments: number; o_reason: string } | null;
  if (row === null) return { ok: false, reason: "unavailable" };
  if (row.o_reason !== "created" || row.o_student_id === null) {
    return { ok: false, reason: row.o_reason };
  }
  return { ok: true, studentId: row.o_student_id, enrolments: row.o_enrolments, reason: "created" };
}
