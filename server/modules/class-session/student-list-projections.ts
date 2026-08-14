import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { readRows, type QueryOutcome } from "@/server/platform/query-diagnostics";

/**
 * `P2-8` — screen `17` Management Students.
 *
 * ⛔ NO SCHEMA, NO MIGRATION, NO RPC. Every table this reads carries a management
 * `SELECT` **policy** AND its matching **grant**, measured at HEAD:
 * `students`, `enrolments`, `class_modules`, `class_grades`, `parent_student_links`,
 * `parent_profiles`, `centre_memberships`, `accounts`. Centre scoping is RLS's,
 * never a parameter and never a filter written here.
 *
 * ⚠️ THE GUARDIAN NAME NEEDED NO COLUMN, AND THAT WAS WORTH MEASURING RATHER THAN
 * ASSUMING. `docs/plan/PORTAL_COMPLETION_PLAN.md` records *"guardian name and
 * contact need columns"* — true of `parent_profiles`, which carries neither, and
 * the note is what a later reader trusts without re-checking. ▶ But the NAME lives
 * on `accounts.display_name`, reachable through `parent_student_links →
 * parent_profiles → centre_memberships → accounts`, and management can already
 * read every hop. **This is §12.10 applied on the phase immediately after it was
 * written: before adding a read — or a column — for a field, check whether it is
 * already reachable.** ⛔ The columns question is NOT discharged for `P2-12`/`P2-13`,
 * which CREATE a parent and need contact fields this screen never shows.
 */
export type ManagementStudentRowDto = {
  readonly studentId: string;
  readonly fullName: string;
  /**
   * Every ACTIVE enrolment, in grade order. The frame draws one class per row but
   * the model permits several, and the pack note itself says *"their Class or
   * Classes"* — so a second enrolment is rendered, never silently dropped.
   */
  readonly classes: readonly string[];
  /**
   * `null` where no active parent link exists. ⛔ hero `0B`: an absent guardian is
   * an OMITTED element, never `Unknown` and never a placeholder — the fixture has
   * learners with no link today, and inventing a guardian for them would be a
   * fabricated fact about a child's family.
   */
  readonly guardianName: string | null;
};

export type ManagementStudentListDto = {
  readonly students: readonly ManagementStudentRowDto[];
  /** The frame's `248 enrolled` pill, built from the list it sits on. */
  readonly enrolledCount: number;
  /** The `All grades` filter's options, READ from `class_grades` — never literals. */
  readonly grades: readonly { readonly id: string; readonly label: string }[];
};

interface StudentRow {
  readonly id: string;
  readonly full_name: string;
}
interface EnrolmentRow {
  readonly student_id: string;
  readonly class_module_id: string;
}
interface ModuleRow {
  readonly id: string;
  readonly title: string;
  readonly class_grade_id: string;
}
interface GradeRow {
  readonly id: string;
  readonly display_name: string;
  readonly sort_order: number;
}
interface LinkRow {
  readonly student_id: string;
  readonly parent_membership_id: string;
}
interface MembershipRow {
  readonly id: string;
  readonly account_id: string;
}
interface AccountRow {
  readonly id: string;
  readonly display_name: string;
}

/**
 * ⛔ EVERY READ FAILS CLOSED. A rejected enumeration must never render as *"this
 * centre has no learners"* (`Q-7`): a refusal and an empty academy are different
 * facts and there is no value that can mean both.
 *
 * ⚠️ THE TWO GUARDIAN HOPS ARE THE EXCEPTION, AND DELIBERATELY SO. A guardian name
 * that cannot be read renders as an omitted cell; it must never be able to remove
 * a LEARNER from the roll. Losing a label is cosmetic — losing a child from the
 * centre's own student list is not. Same reasoning `decorateQueueRows` records for
 * the management queue, applied to the same class of problem.
 */
export async function listManagementStudentsCore(
  client: SupabaseClient,
): Promise<QueryOutcome<ManagementStudentListDto>> {
  const students = await readRows<StudentRow>("listManagementStudentsCore:students", () =>
    client
      .from("students")
      .select("id, full_name")
      .eq("is_active", true)
      .order("full_name", { ascending: true }),
  );
  if (!students.ok) return { ok: false };

  const grades = await readRows<GradeRow>("listManagementStudentsCore:class_grades", () =>
    client
      .from("class_grades")
      .select("id, display_name, sort_order")
      .order("sort_order", { ascending: true }),
  );
  if (!grades.ok) return { ok: false };

  const studentIds = students.rows.map((row) => row.id);

  const enrolments =
    studentIds.length === 0
      ? ({ ok: true, rows: [] } as QueryOutcome<EnrolmentRow[]>)
      : await readRows<EnrolmentRow>("listManagementStudentsCore:enrolments", () =>
          client
            .from("enrolments")
            .select("student_id, class_module_id")
            .eq("is_active", true)
            .in("student_id", studentIds),
        );
  if (!enrolments.ok) return { ok: false };

  const moduleIds = [...new Set(enrolments.rows.map((row) => row.class_module_id))];
  const modules =
    moduleIds.length === 0
      ? ({ ok: true, rows: [] } as QueryOutcome<ModuleRow[]>)
      : await readRows<ModuleRow>("listManagementStudentsCore:class_modules", () =>
          client.from("class_modules").select("id, title, class_grade_id").in("id", moduleIds),
        );
  if (!modules.ok) return { ok: false };

  // ---------------------------------------------------------------------
  // The guardian chain. Fail-soft from here down — see the header.
  // ---------------------------------------------------------------------
  const links =
    studentIds.length === 0
      ? ({ ok: true, rows: [] } as QueryOutcome<LinkRow[]>)
      : await readRows<LinkRow>("listManagementStudentsCore:parent_student_links", () =>
          client
            .from("parent_student_links")
            .select("student_id, parent_membership_id")
            .eq("is_active", true)
            .in("student_id", studentIds),
        );

  const membershipIds = links.ok ? [...new Set(links.rows.map((row) => row.parent_membership_id))] : [];
  const memberships =
    membershipIds.length === 0
      ? ({ ok: true, rows: [] } as QueryOutcome<MembershipRow[]>)
      : await readRows<MembershipRow>("listManagementStudentsCore:centre_memberships", () =>
          client.from("centre_memberships").select("id, account_id").in("id", membershipIds),
        );

  const accountIds = memberships.ok ? [...new Set(memberships.rows.map((row) => row.account_id))] : [];
  const accounts =
    accountIds.length === 0
      ? ({ ok: true, rows: [] } as QueryOutcome<AccountRow[]>)
      : await readRows<AccountRow>("listManagementStudentsCore:accounts", () =>
          client.from("accounts").select("id, display_name").in("id", accountIds),
        );

  const gradeById = new Map(grades.rows.map((row) => [row.id, row]));
  const moduleById = new Map(modules.rows.map((row) => [row.id, row]));
  const accountById = accounts.ok ? new Map(accounts.rows.map((row) => [row.id, row.display_name])) : new Map();
  const membershipAccount = memberships.ok
    ? new Map(memberships.rows.map((row) => [row.id, row.account_id]))
    : new Map<string, string>();

  const classesByStudent = new Map<string, string[]>();
  for (const row of enrolments.rows) {
    const module = moduleById.get(row.class_module_id);
    if (module === undefined) continue;
    const grade = gradeById.get(module.class_grade_id);
    /*
     * ⛔ `Beginner · <module>`, and the grade label is READ from `class_grades`.
     * The frame writes `Junior · Public Speaking`; `Junior` is NOT a ratified
     * Class Grade — the vocabulary is Beginner/Intermediate/Advanced (`A-016`,
     * `A-026`/`A-054`) — so no grade label is ever a literal in this file.
     */
    const label = grade ? `${grade.display_name} · ${module.title}` : module.title;
    const list = classesByStudent.get(row.student_id) ?? [];
    list.push(label);
    classesByStudent.set(row.student_id, list);
  }

  const guardianByStudent = new Map<string, string>();
  if (links.ok) {
    for (const row of links.rows) {
      const accountId = membershipAccount.get(row.parent_membership_id);
      const name = accountId === undefined ? undefined : accountById.get(accountId);
      // The frame's column is singular. First linked guardian by read order; a
      // second link is not invented into the cell and not dropped from the data.
      if (name !== undefined && !guardianByStudent.has(row.student_id)) {
        guardianByStudent.set(row.student_id, name);
      }
    }
  }

  return {
    ok: true,
    rows: {
      students: students.rows.map((row) => ({
        studentId: row.id,
        fullName: row.full_name,
        classes: (classesByStudent.get(row.id) ?? []).sort((a, b) => a.localeCompare(b)),
        guardianName: guardianByStudent.get(row.id) ?? null,
      })),
      enrolledCount: students.rows.length,
      grades: grades.rows.map((row) => ({ id: row.id, label: row.display_name })),
    },
  };
}
