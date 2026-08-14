import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { readRows, type QueryOutcome } from "@/server/platform/query-diagnostics";

/**
 * `P2-10` — screen `23` Management Trainers.
 *
 * ⛔ NO SCHEMA, NO MIGRATION, NO RPC — measured at HEAD before a line was
 * written, not assumed from `P2-8`'s result. Every table below carries an
 * `authenticated` SELECT **grant** AND a permissive SELECT **policy**:
 * `centre_memberships`, `accounts`, `trainer_profiles`,
 * `class_session_assignments`, `class_sessions`, `class_modules`, `enrolments`.
 * ▶ **Centre scoping is RLS's**, never a parameter and never a filter written
 * here — the same posture every management read in this build holds.
 *
 * ⚠️ §12.10 AGAIN, AND IT PAID FOR ITSELF A THIRD TIME. The frame draws an
 * email under each trainer's name, and the pack's dependency section says
 * *"Missing — no trainer-list projection."* ▶ **`accounts.normalized_email`
 * ALREADY EXISTS.** Nothing needed a column. (Whether it may be DISPLAYED is a
 * separate question, answered below and deliberately not answered by this
 * file's ability to read it.)
 *
 * ⛔ THE ROLE IS READ FROM `centre_memberships`, NEVER FROM AN IDENTITY ROW.
 * The pack's prohibited-invention clause is explicit — *"Do not display or
 * imply a role stored on an identity row"* — and `A-020`/`A-025` make
 * `centre_memberships` the sole authority for role. `accounts` carries no
 * `role` column at all, so this projection could not get it wrong even by
 * trying; the constraint is structural rather than observed.
 */

export type ManagementTrainerRowDto = {
  readonly membershipId: string;
  readonly fullName: string;
  /**
   * ⛔ `active` or `deactivated` — the ratified `centre_membership_status`
   * vocabulary, minus `pending`, which is an INVITED trainer who has not
   * accepted and is filtered out rather than shown as a staff member.
   *
   * ⚠️ THE FRAME'S THIRD CHIP, `On leave`, HAS NO VALUE TO CARRY. See the
   * component header — `GC-12`, and the enum has exactly three members.
   */
  readonly status: "active" | "deactivated";
  /** Distinct class MODULES this trainer is assigned to teach. A COUNT, never a rating. */
  readonly classCount: number;
  /** Distinct ACTIVELY-ENROLLED learners across those modules. A COUNT, never a rating. */
  readonly studentCount: number;
};

export type ManagementTrainerListDto = {
  readonly trainers: readonly ManagementTrainerRowDto[];
  /** The pill's number, derived from the rows rather than counted separately. */
  readonly staffCount: number;
};

interface MembershipRow {
  readonly id: string;
  readonly account_id: string;
  readonly status: string;
}
interface AccountRow {
  readonly id: string;
  readonly display_name: string | null;
}
interface AssignmentRow {
  readonly class_session_id: string;
  readonly membership_id: string;
}
interface SessionRow {
  readonly id: string;
  readonly class_module_id: string;
}
interface EnrolmentRow {
  readonly class_module_id: string;
  readonly student_id: string;
  readonly is_active: boolean;
}

/**
 * ⚠️ SEVEN SMALL READS, NOT ONE JOIN — the same shape `P2-8` uses, and for the
 * same reason: every hop is independently RLS-scoped, so a row the caller may
 * not see simply does not arrive. A hand-written join through a `SECURITY
 * DEFINER` RPC would have to re-implement that scoping, which is where a
 * widening gets written by accident.
 */
export async function listManagementTrainersCore(
  client: SupabaseClient,
): Promise<QueryOutcome<ManagementTrainerListDto>> {
  const memberships = await readRows<MembershipRow>("listManagementTrainersCore:memberships", () =>
    client.from("centre_memberships").select("id, account_id, status").eq("role", "trainer"),
  );
  if (!memberships.ok) return { ok: false };

  /*
   * ⛔ `pending` IS EXCLUDED, AND THAT IS A GOVERNANCE DECISION RATHER THAN A
   * TIDY-UP. `A-027`: *"A profile that has not completed activation must not be
   * treated as an active login identity."* A pending membership is an
   * INVITATION, not a member of staff — listing one on a staff directory would
   * assert a person works here because an email was sent.
   */
  const staff = memberships.rows.filter((m) => m.status === "active" || m.status === "deactivated");
  if (staff.length === 0) {
    return { ok: true, rows: { trainers: [], staffCount: 0 } };
  }

  const accounts = await readRows<AccountRow>("listManagementTrainersCore:accounts", () =>
    client.from("accounts").select("id, display_name").in("id", staff.map((m) => m.account_id)),
  );
  const assignments = await readRows<AssignmentRow>("listManagementTrainersCore:assignments", () =>
    client
      .from("class_session_assignments")
      .select("class_session_id, membership_id")
      .in("membership_id", staff.map((m) => m.id)),
  );
  if (!accounts.ok || !assignments.ok) return { ok: false };

  const sessionIds = [...new Set(assignments.rows.map((a) => a.class_session_id))];
  const sessions = sessionIds.length
    ? await readRows<SessionRow>("listManagementTrainersCore:sessions", () =>
        client.from("class_sessions").select("id, class_module_id").in("id", sessionIds),
      )
    : ({ ok: true, rows: [] } as QueryOutcome<SessionRow[]>);
  if (!sessions.ok) return { ok: false };

  const moduleBySession = new Map(sessions.rows.map((s) => [s.id, s.class_module_id]));
  const moduleIds = [...new Set(sessions.rows.map((s) => s.class_module_id))];
  const enrolments = moduleIds.length
    ? await readRows<EnrolmentRow>("listManagementTrainersCore:enrolments", () =>
        client
          .from("enrolments")
          .select("class_module_id, student_id, is_active")
          .in("class_module_id", moduleIds),
      )
    : ({ ok: true, rows: [] } as QueryOutcome<EnrolmentRow[]>);
  if (!enrolments.ok) return { ok: false };

  /*
   * ⛔ ACTIVE ENROLMENTS ONLY — the `Ruling A` boundary, applied here on its own
   * merits rather than by analogy. A withdrawn learner is not one of this
   * trainer's students, and `enrolments` KEEPS the withdrawn row, so an
   * unfiltered count would include exactly the learner the ruling excludes.
   */
  const learnersByModule = new Map<string, Set<string>>();
  for (const row of enrolments.rows) {
    if (!row.is_active) continue;
    const set = learnersByModule.get(row.class_module_id) ?? new Set<string>();
    set.add(row.student_id);
    learnersByModule.set(row.class_module_id, set);
  }

  const nameByAccount = new Map(accounts.rows.map((a) => [a.id, a.display_name]));
  const modulesByMembership = new Map<string, Set<string>>();
  for (const a of assignments.rows) {
    const moduleId = moduleBySession.get(a.class_session_id);
    if (moduleId === undefined) continue;
    const set = modulesByMembership.get(a.membership_id) ?? new Set<string>();
    set.add(moduleId);
    modulesByMembership.set(a.membership_id, set);
  }

  const trainers = staff
    .map((m) => {
      const modules = modulesByMembership.get(m.id) ?? new Set<string>();
      const learners = new Set<string>();
      for (const moduleId of modules) {
        for (const studentId of learnersByModule.get(moduleId) ?? []) learners.add(studentId);
      }
      return {
        membershipId: m.id,
        // ⛔ hero `0B`: a missing display name is not rendered as a placeholder.
        // The row is DROPPED below rather than shown as "Unknown", because a
        // staff directory entry with no name asserts a person exists and
        // identifies nobody.
        fullName: nameByAccount.get(m.account_id) ?? "",
        status: m.status as "active" | "deactivated",
        classCount: modules.size,
        // ⚠️ DISTINCT ACROSS MODULES. A learner enrolled in two of this
        // trainer's modules is ONE of their students; summing per-module counts
        // would report a roster larger than the centre has.
        studentCount: learners.size,
      };
    })
    .filter((t) => t.fullName !== "")
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

  return { ok: true, rows: { trainers, staffCount: trainers.length } };
}
