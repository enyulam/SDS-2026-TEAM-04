/**
 * CLASS MODULE LIST — the read behind screen `12` Management Classes (P2-1).
 *
 * It answers one question: what Class Modules exist under which Class Grades,
 * how many learners are actively enrolled in each, and which trainers are
 * actually assigned to their sessions.
 *
 * ---------------------------------------------------------------------
 * WHY THIS LIVES IN `class-session` AND NOT IN `management-view`
 * ---------------------------------------------------------------------
 * `CLAUDE.md` §9 rule 1: a module owns its tables. `class_grades`,
 * `class_modules`, `class_sessions`, `enrolments` and
 * `class_session_assignments` are this module's. The management role gate and
 * the management DTO live in `management-view`, which composes this — exactly
 * the split `staff-projections.ts` and `session-context-projections.ts`
 * already use.
 *
 * ---------------------------------------------------------------------
 * ⚠️ WHY THIS IS A DIRECT RLS-SCOPED READ AND NOT AN RPC
 * ---------------------------------------------------------------------
 * MEASURED AT HEAD, not read off a document — `pg_policies` and
 * `information_schema.role_table_grants` on 2026-08-12:
 *
 *   class_grades_select_active_member · class_modules_select_management ·
 *   class_sessions_select_management · enrolments_select_management ·
 *   students_select_management · centre_memberships_select_management ·
 *   class_session_assignments_select_management · accounts_select_management
 *
 * …each with a matching `GRANT SELECT TO authenticated`. ⚠️ POLICY AND GRANT
 * ARE TWO SEPARATE LAYERS and both were checked: a present policy with no
 * grant reads as an RLS failure, which `A-030` names explicitly.
 *
 * ▶ So no new schema, RPC, policy or grant is required for this screen, and
 * none was requested. Reading over the caller's own credential is what every
 * other management projection here does, and it is the NARROWER instrument —
 * the inverse of `staff-projections.ts`, which needed an RPC precisely because
 * a PARENT holds no such scope. This module makes NO authorization decision
 * and holds NO role test: RLS decides, per caller, per row.
 *
 * ---------------------------------------------------------------------
 * ⛔ WHAT THIS MUST NEVER BECOME
 * ---------------------------------------------------------------------
 * - **G-2 / C-9 / Q-27** — no rating, no roll-up, no average, no derived
 *   assessment fact, ever. `12` is a LIST surface: `C-9` confines `D-1` to
 *   report DETAIL surfaces because ratings on a list "invite comparison
 *   between children". There is no field here that could carry one.
 * - **A-016** — no `classes` entity between Class Grade and Class Module, and
 *   no fourth Class Grade. The grades come from the three seeded
 *   `class_grades` rows; nothing here can mint one.
 * - **A-014 / G-7** — no assistant, no second staff slot, no TA field. See
 *   `trainerDisplayNames` below for why it is a list and what it is NOT.
 * - **D-3 / C-6** — no term field. Terms arrive at `P2-2` as scheduling
 *   structure grouping SESSIONS, and they are not this read's business.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { readRows, type QueryOutcome } from "@/server/platform/query-diagnostics";

/**
 * One Class Grade, as the screen's level tabs read it.
 *
 * ⚠️ `code` is carried alongside `displayName` because a FILTER MUST KEY OFF
 * IDENTITY, NEVER A LABEL — the same reasoning that gave the `29` class filter
 * a `classModuleId`. A grade renamed in the database must not silently change
 * which cards a tab selects.
 */
export interface ClassGradeOptionDto {
  readonly code: string;
  readonly displayName: string;
  readonly sortOrder: number;
}

/**
 * One Class Module card.
 *
 * ⛔ `trainerDisplayNames` IS A LIST, AND THE PLURAL IS THE GOVERNANCE.
 * `A-016` makes trainer assignment authoritative AT CLASS-SESSION LEVEL. There
 * is no module-level trainer column and inventing one would be schema by
 * inference from a frame (`A-022`). This field is therefore the DISTINCT SET
 * of trainers actually assigned across this module's sessions — a derivation
 * over governed facts, never a new module-level fact.
 *
 * ⛔ It is NOT the frame's `Asst. <name>` slot. That slot is a Teaching
 * Assistant field, PROHIBITED by `A-014` and `G-7`
 * (`centre_membership_role` is not extended), and it is a `REGISTERED-OMISSION`
 * that NEVER ENDS. A second name appearing in this list means a second trainer
 * was assigned to a different session of the same module — not an assistant.
 */
export interface ClassModuleSummaryDto {
  readonly classModuleId: string;
  readonly title: string;
  readonly classGradeCode: string;
  readonly classGradeLabel: string;
  readonly classGradeSortOrder: number;
  readonly activeStudentCount: number;
  readonly trainerDisplayNames: readonly string[];
}

export interface ClassListDto {
  readonly grades: readonly ClassGradeOptionDto[];
  readonly classes: readonly ClassModuleSummaryDto[];
}

interface ClassGradeRow {
  readonly id: string;
  readonly code: string;
  readonly display_name: string;
  readonly sort_order: number;
}

interface ClassModuleRow {
  readonly id: string;
  readonly title: string;
  readonly class_grade_id: string;
}

interface EnrolmentRow {
  readonly class_module_id: string;
  readonly student_id: string;
}

interface SessionRow {
  readonly id: string;
  readonly class_module_id: string;
}

interface AssignmentRow {
  readonly class_session_id: string;
  readonly trainer_membership_id: string;
}

interface MembershipRow {
  readonly id: string;
  readonly account_id: string;
}

interface AccountRow {
  readonly id: string;
  readonly display_name: string | null;
}

/**
 * Read every active Class Module the caller may see, with its grade, its
 * active learner count and its assigned trainers.
 *
 * ⛔ THE SPINE FAILS CLOSED. Grades, modules and enrolments are the SUBSTANCE
 * of this screen: "no classes" and "6 classes" are both positive claims, and a
 * rejected read must never be rendered as the first one (`Q-7`). All three
 * return `{ ok: false }` on rejection and the caller reports `unavailable`.
 *
 * ⚠️ THE TRAINER CHAIN FAILS SOFT, AND THE ASYMMETRY IS DELIBERATE — the same
 * split `decorateQueueRows` already makes. A card whose trainer name cannot be
 * read renders WITHOUT it; a class that cannot be read must not vanish from a
 * list that claims to be the centre's classes. Losing a class is a governance
 * failure; losing a name is a cosmetic one.
 */
export async function listClassModulesCore(
  client: SupabaseClient,
): Promise<QueryOutcome<ClassListDto>> {
  const grades = await readRows<ClassGradeRow>("listClassModulesCore:class_grades", () =>
    client
      .from("class_grades")
      .select("id, code, display_name, sort_order")
      .order("sort_order", { ascending: true }),
  );
  if (!grades.ok) return { ok: false };

  const modules = await readRows<ClassModuleRow>("listClassModulesCore:class_modules", () =>
    client
      .from("class_modules")
      .select("id, title, class_grade_id")
      .eq("is_active", true)
      .order("title", { ascending: true }),
  );
  if (!modules.ok) return { ok: false };

  const moduleIds = modules.rows.map((row) => row.id);

  /*
   * The learner count is over ACTIVE enrolments only, and it counts DISTINCT
   * students. `enrolments` is unique per (module, student) today, so the
   * de-duplication changes nothing measurable — it is here so the count stays
   * a count of CHILDREN rather than of rows if a re-enrolment shape is ever
   * introduced. A withdrawn learner is not in this centre's class.
   */
  const enrolments =
    moduleIds.length === 0
      ? ({ ok: true, rows: [] } as QueryOutcome<EnrolmentRow[]>)
      : await readRows<EnrolmentRow>("listClassModulesCore:enrolments", () =>
          client
            .from("enrolments")
            .select("class_module_id, student_id")
            .eq("is_active", true)
            .in("class_module_id", moduleIds),
        );
  if (!enrolments.ok) return { ok: false };

  const learners = new Map<string, Set<string>>();
  for (const row of enrolments.rows) {
    const set = learners.get(row.class_module_id) ?? new Set<string>();
    set.add(row.student_id);
    learners.set(row.class_module_id, set);
  }

  const trainers = await readTrainersByModule(client, moduleIds);

  const gradeById = new Map(grades.rows.map((row) => [row.id, row]));
  const classes: ClassModuleSummaryDto[] = [];
  for (const row of modules.rows) {
    const grade = gradeById.get(row.class_grade_id);
    /*
     * ⚠️ A module whose grade the caller cannot read is DROPPED rather than
     * rendered under an invented label. `class_grades_select_active_member` and
     * `class_modules_select_management` are different policies, so the two
     * reads can legitimately disagree, and "Unknown level" is a fabricated
     * academic fact — `A-016` fixes the vocabulary at exactly three values.
     */
    if (!grade) continue;
    classes.push({
      classModuleId: row.id,
      title: row.title,
      classGradeCode: grade.code,
      classGradeLabel: grade.display_name,
      classGradeSortOrder: grade.sort_order,
      activeStudentCount: learners.get(row.id)?.size ?? 0,
      trainerDisplayNames: trainers.get(row.id) ?? [],
    });
  }

  classes.sort(
    (a, b) =>
      a.classGradeSortOrder - b.classGradeSortOrder || a.title.localeCompare(b.title),
  );

  return {
    ok: true,
    rows: {
      grades: grades.rows.map((row) => ({
        code: row.code,
        displayName: row.display_name,
        sortOrder: row.sort_order,
      })),
      classes,
    },
  };
}

/**
 * The trainers actually assigned to a module's sessions.
 *
 * ⚠️ FAIL-SOFT AT EVERY STEP, returning an EMPTY MAP rather than a failure.
 * Read the contract precisely: an empty result here means "no trainer name is
 * shown", and the surface OMITS the element rather than rendering a dash or a
 * placeholder (`NULL` MEANS NOT RECORDED — hero 0B). It never means "this
 * class has no trainer", because nothing here established that.
 *
 * ⛔ THREE HOPS, AND NONE OF THEM IS AN AUTHORIZATION DECISION. Assignment →
 * membership → account is a label lookup over rows RLS already admitted. A
 * caller who cannot read `class_session_assignments` gets no names and the
 * same list of classes — the class list is not narrowed by what its labels
 * resolve to.
 */
async function readTrainersByModule(
  client: SupabaseClient,
  moduleIds: readonly string[],
): Promise<ReadonlyMap<string, readonly string[]>> {
  const empty = new Map<string, readonly string[]>();
  if (moduleIds.length === 0) return empty;

  const sessions = await readRows<SessionRow>("readTrainersByModule:class_sessions", () =>
    client.from("class_sessions").select("id, class_module_id").in("class_module_id", moduleIds),
  );
  if (!sessions.ok || sessions.rows.length === 0) return empty;

  const moduleBySession = new Map(sessions.rows.map((row) => [row.id, row.class_module_id]));
  const sessionIds = [...moduleBySession.keys()];

  const assignments = await readRows<AssignmentRow>(
    "readTrainersByModule:class_session_assignments",
    () =>
      client
        .from("class_session_assignments")
        .select("class_session_id, trainer_membership_id")
        .eq("is_active", true)
        .in("class_session_id", sessionIds),
  );
  if (!assignments.ok || assignments.rows.length === 0) return empty;

  const membershipIds = [...new Set(assignments.rows.map((row) => row.trainer_membership_id))];
  const memberships = await readRows<MembershipRow>("readTrainersByModule:centre_memberships", () =>
    client.from("centre_memberships").select("id, account_id").in("id", membershipIds),
  );
  if (!memberships.ok || memberships.rows.length === 0) return empty;

  const accountByMembership = new Map(memberships.rows.map((row) => [row.id, row.account_id]));
  const accountIds = [...new Set([...accountByMembership.values()])];
  const accounts = await readRows<AccountRow>("readTrainersByModule:accounts", () =>
    client.from("accounts").select("id, display_name").in("id", accountIds),
  );
  if (!accounts.ok) return empty;

  const nameByAccount = new Map(accounts.rows.map((row) => [row.id, row.display_name]));
  const byModule = new Map<string, Set<string>>();
  for (const assignment of assignments.rows) {
    const moduleId = moduleBySession.get(assignment.class_session_id);
    if (!moduleId) continue;
    const accountId = accountByMembership.get(assignment.trainer_membership_id);
    if (!accountId) continue;
    const name = nameByAccount.get(accountId);
    // A membership whose account name is genuinely unrecorded contributes
    // NOTHING — never a blank chip, never "Unnamed trainer".
    if (!name) continue;
    const set = byModule.get(moduleId) ?? new Set<string>();
    set.add(name);
    byModule.set(moduleId, set);
  }

  const out = new Map<string, readonly string[]>();
  for (const [moduleId, names] of byModule) out.set(moduleId, [...names].sort());
  return out;
}
