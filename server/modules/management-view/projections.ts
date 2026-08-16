/**
 * Management read projections — R-6 (pending-final-review queue), R-7
 * (correction tracking) and R-8 (safe review candidate) of contract §5.2.
 *
 * CP-3 IS RESOLVED HERE (B2 task §4): management discovers a report awaiting
 * final review through `listManagementPendingReviewCore`, built entirely
 * from the accepted surface — the Step 7G management SELECT scope for
 * enumeration plus the STATUS-GATED `report_get_management_review` (RPC-15)
 * for every report fact. No new database function, grant or policy was
 * added, so RPC-15's ratified zero-row posture (T7I-63) is untouched and
 * authority is re-proved by the database for every pair.
 *
 * U-B2-1 IS RESOLVED HERE (Round B2.1). R-7 now reads the governed
 * boundary `report_list_management_corrections`, added by
 * `20260806103000_management_correction_tracking.sql`. The previous
 * implementation could only track pairs whose STATUS-GATED read still
 * returned a row, which meant a returned report vanished from every
 * management surface the moment management returned it — RPC-15 returns
 * ZERO ROWS at `needs_edit` and at `draft_ready` (A-038; pinned by
 * T7I-63), and `report_correction_requests` carries zero client
 * privileges. Neither of those decisions was reopened: the new function
 * returns tracking METADATA ONLY and no version content whatsoever, so
 * A-038's "no report content to management before trainer approval" is
 * intact, and the correction table still has no policy and no grant.
 *
 * DTO exclusions (contract §5.5, absolute): no ratings, observations,
 * attendance, evidence, trainer notes, checklist values, content hashes,
 * revision counts or AI history appear in any shape this module returns.
 * `wordingHash` appears only on the review candidate. `openCorrectionReason`
 * appears ONLY on the correction-tracking row, under the §5.5 carve-out —
 * every correction request is management-authored by CHECK and composite
 * FK, and the reader is live active management of the same centre. It is
 * never carried on `ManagementReviewDto` and never on a parent surface.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppDatabase } from "@/server/db/app-database";
import type { ActionResult } from "@/server/contracts/action-result";
import { mapSqlErrorToResult } from "@/server/contracts/action-result";
import { requireRole } from "@/server/modules/identity-access/session-core";
import { getSessionContextsCore } from "@/server/modules/class-session/session-context-projections";
import { getSessionStaffIdentitiesCore } from "@/server/modules/class-session/staff-projections";
import {
  listClassModulesCore,
  type ClassListDto,
} from "@/server/modules/class-session/class-list-projections";
import {
  classHealthVerdict,
  readClassHealthCore,
  readClassStatusRowsCore,
  summariseSessions,
  type ClassHealthDto,
  readClassHeaderCore,
  type ClassHeaderDto,
  type ClassOverviewRowDto,
  type ClassOverviewSessionDto,
} from "@/server/modules/class-session/class-overview";
import { readCentreScheduleCore, type ScheduleDto } from "@/server/modules/class-session/schedule";
import { readLessonPlansCore, type LessonPlanDto } from "@/server/modules/class-session/lesson-plans";
import { readDashboardSummaryCore, type DashboardSummaryDto } from "@/server/modules/class-session/dashboard";
import {
  listManagementStudentsCore,
  type ManagementStudentListDto,
} from "@/server/modules/class-session/student-list-projections";
import {
  readClassForEditCore,
  updateClassCore,
  type ClassEditDto,
  type ClassUpdateOutcome,
  type UpdateClassInput,
} from "@/server/modules/class-session/class-edit";
import {
  createClassCore,
  readAddClassOptionsCore,
  type AddClassOptionsDto,
  type ClassCreationOutcome,
  type CreateClassInput,
} from "@/server/modules/class-session/class-creation";
import { readMaybeRow, readRows,
  readRpcRows, type QueryOutcome } from "@/server/platform/query-diagnostics";
import type { DimensionCode, RatingLevel } from "@/server/modules/framework/dimensions";
import {
  firstRow,
  type CorrectionIssueScope,
  type CorrectionRequestStatus,
  type ManagementCorrectionRow,
  type ManagementReviewRow,
  type ReportStatus,
  type RpcCaller,
} from "@/server/modules/report-workflow/rpc-types";

/**
 * One row of the governed Management submitted-report list boundary
 * `report_list_management_submitted` (C2C-004). It is deliberately the
 * NARROWEST shape the boundary can return: publication metadata only. There
 * is no field for a parent-facing panel, a rating, a version id or either
 * hash, because the SQL projection carries no such column.
 */
interface ManagementSubmittedRow {
  report_id: string;
  student_id: string;
  student_display_name: string;
  class_session_id: string;
  session_date: string;
  report_status: ReportStatus;
  submitted_at: string | null;
}

export interface ManagementQueueRowDto {
  readonly reportId: string;
  readonly sessionId: string;
  readonly studentId: string;
  readonly studentDisplayName: string;
  readonly sessionDate: string;
  readonly status: ReportStatus;
  readonly openCorrectionScope?: CorrectionIssueScope;
  readonly openCorrectionStatus?: CorrectionRequestStatus;
  /**
   * Contract §5.5 carve-out — present ONLY on the R-7 correction-tracking
   * projection, never on R-6 and never on `ManagementReviewDto`.
   */
  readonly openCorrectionReason?: string;
  /**
   * Hero chain Phase 9 — the frame's Class, Lesson and Trainer columns and its
   * class filter.
   *
   * ⚠️ Every one of these is an IDENTITY OR SCHEDULING fact about the session,
   * carried so management can tell one queue row from another. None is a
   * rating, an observation, an attendance value, an evidence reference, a
   * trainer note, a checklist value, a content hash or a revision count, so
   * §5.5's exclusion list is untouched — re-checked field by field at this
   * phase's exit rather than assumed.
   *
   * ⛔ There is no term field, and G-4 means there must never be one.
   *
   * All are optional: they are decoration on rows whose governed content was
   * already authorized, and a row must never disappear because its class
   * label could not be read.
   */
  readonly classModuleId?: string;
  readonly classGradeLabel?: string;
  readonly classModuleTitle?: string;
  readonly lessonNumber?: number;
  readonly lessonTitle?: string;
  readonly trainerDisplayName?: string;
  /**
   * C2C-004 — the write-once publication timestamp of the canonical submitted
   * version, present ONLY on the submitted-list projection. It is publication
   * METADATA, not content: it says WHEN management published, never WHAT was
   * published. No panel, rating, version id or hash accompanies it.
   */
  readonly submittedAt?: string;
}

export interface ManagementReviewDto {
  readonly reportId: string;
  readonly status: ReportStatus;
  readonly lockVersion: number | null;
  readonly versionId: string | null;
  readonly panels: {
    readonly overview: string;
    readonly strengths: string;
    readonly areasForDevelopment: string;
    readonly remarks: string;
  };
  readonly wordingHash: string | null;
  readonly submittedAt: string | null;
  readonly openCorrectionScope?: CorrectionIssueScope;
  readonly openCorrectionStatus?: CorrectionRequestStatus;
}

interface PairRow {
  sessionId: string;
  sessionDate: string;
  studentId: string;
  studentDisplayName: string;
}

/**
 * Enumerate every (session, enrolled student) pair of the managed centre.
 *
 * ⛔ ALL THREE READS PREVIOUSLY DISCARDED `error` — none was even
 * destructured — and this enumeration is the SPINE of the pending-final-review
 * queue. A rejection on any of them silently shortened the list of pairs, and
 * a pair that never enters the list is never gated, never rendered and never
 * counted.
 *
 * ⚠️ THAT IS THE MOST CONSEQUENTIAL SILENT EMPTINESS IN THIS MODULE. Screen
 * `29` would have told management **"No reports waiting"** — a positive
 * statement that the final-review queue is clear — while trainer-approved
 * reports sat unreviewed. Management's final review is the ONLY gate between
 * a trainer approval and a parent seeing a report (A-033), so a queue that
 * silently under-reports does not degrade a display: it makes a governed
 * review step invisible.
 *
 * It now returns a `QueryOutcome`, and every caller returns `unavailable`.
 */
async function listCentrePairs(client: SupabaseClient<AppDatabase>): Promise<QueryOutcome<PairRow[]>> {
  const sessions = await readRows<{ id: string; session_date: string; class_module_id: string }>(
    "listCentrePairs:class_sessions",
    () =>
      client
        .from("class_sessions")
        .select("id, session_date, class_module_id")
        .order("session_date", { ascending: true }),
  );
  if (!sessions.ok) return { ok: false };

  const pairs: PairRow[] = [];
  const nameCache = new Map<string, string>();
  for (const session of sessions.rows) {
    const enrolments = await readRows<{ student_id: string }>(
      "listCentrePairs:enrolments",
      () =>
        client
          .from("enrolments")
          .select("student_id")
          .eq("class_module_id", session.class_module_id)
          .eq("is_active", true),
    );
    if (!enrolments.ok) return { ok: false };

    for (const enrolment of enrolments.rows) {
      let name = nameCache.get(enrolment.student_id);
      if (name === undefined) {
        const students = await readRows<{ full_name?: string }>(
          "listCentrePairs:students",
          () => client.from("students").select("id, full_name").eq("id", enrolment.student_id),
        );
        if (!students.ok) return { ok: false };
        // ⚠️ The "Student" placeholder survives for its LEGITIMATE case — a
        // row read successfully whose name is genuinely unrecorded. What no
        // longer reaches it is a rejection.
        name = students.rows[0]?.full_name ?? "Student";
        nameCache.set(enrolment.student_id, name);
      }
      pairs.push({
        sessionId: session.id,
        sessionDate: session.session_date,
        studentId: enrolment.student_id,
        studentDisplayName: name,
      });
    }
  }
  return { ok: true, rows: pairs };
}

/**
 * ⛔ A REJECTED READ IS NEVER "NOT A FINAL-REVIEW CANDIDATE".
 *
 * This returned `null` for both, and the queue's caller `continue`d on
 * `null` — so a rejection DROPPED A TRAINER-APPROVED REPORT out of the
 * management queue and rendered "No reports waiting" over a governed review
 * step nobody had performed (A-033). ▶ The same reasoning that already
 * guards the ENUMERATION eight lines below; only the per-pair read was left
 * open. `null` now means an OBSERVED absence and nothing else.
 */
async function gatedReview(
  client: SupabaseClient<AppDatabase>,
  sessionId: string,
  studentId: string,
): Promise<QueryOutcome<ManagementReviewRow | null>> {
  return readMaybeRow<ManagementReviewRow>("gatedReview:report_get_management_review", () =>
    client.rpc("report_get_management_review", {
      p_class_session_id: sessionId,
      p_student_id: studentId,
    }),
  );
}

/**
 * Hero chain Phase 9 — attach the frame's Class, Lesson and Trainer context to
 * a queue already assembled and already authorized.
 *
 * ⚠️ IT RUNS LAST, AND THAT ORDERING IS THE POINT. Every row handed to it has
 * already passed its own governed gate — the STATUS-GATED review read, the
 * correction boundary or the submitted boundary. This function therefore
 * decides NOTHING about who may see what; it only labels rows the caller was
 * already entitled to. Reversing the order — filtering a queue by a class the
 * caller can see — would put an authorization decision in TypeScript, which is
 * exactly what this codebase does not do.
 *
 * ⚠️ Fail-soft on BOTH reads, deliberately. A row whose class label or trainer
 * name cannot be read renders without them. **A missing column heading must
 * never be able to hide a report management is required to review** — losing a
 * row from the final-review queue is a governance failure; losing a label is a
 * cosmetic one.
 */
async function decorateQueueRows(
  client: SupabaseClient<AppDatabase>,
  rows: readonly ManagementQueueRowDto[],
): Promise<readonly ManagementQueueRowDto[]> {
  if (rows.length === 0) return rows;
  const sessionIds = rows.map((row) => row.sessionId);

  const contexts = await getSessionContextsCore(client, sessionIds);
  const staff = await getSessionStaffIdentitiesCore(client, sessionIds);
  const staffMap = staff.outcome === "success" ? staff.data : null;

  return rows.map((row) => {
    const ctx = contexts.get(row.sessionId);
    const trainer = staffMap?.get(row.sessionId)?.trainerDisplayName ?? null;
    return {
      ...row,
      ...(ctx?.classModuleId ? { classModuleId: ctx.classModuleId } : {}),
      ...(ctx?.classGradeLabel ? { classGradeLabel: ctx.classGradeLabel } : {}),
      ...(ctx?.classModuleTitle ? { classModuleTitle: ctx.classModuleTitle } : {}),
      ...(ctx?.lessonNumber === null || ctx?.lessonNumber === undefined
        ? {}
        : { lessonNumber: ctx.lessonNumber }),
      ...(ctx?.lessonTitle ? { lessonTitle: ctx.lessonTitle } : {}),
      ...(trainer ? { trainerDisplayName: trainer } : {}),
    };
  });
}

// ---------------------------------------------------------------------
// R-6 — the pending-final-review queue (CP-3's resolution)
// ---------------------------------------------------------------------
export async function listManagementPendingReviewCore(
  client: SupabaseClient<AppDatabase>,
): Promise<ActionResult<readonly ManagementQueueRowDto[]>> {
  const identity = await requireRole(client, "management");
  if (identity.outcome !== "success") return identity;

  const pairs = await listCentrePairs(client);
  /*
   * ⛔ A REJECTED ENUMERATION IS NEVER AN EMPTY QUEUE. Success-with-zero-rows
   * here renders "No reports waiting" — management being told the final-review
   * queue is clear when it may not be. That is a governed review step made
   * invisible, not a display defect.
   */
  if (!pairs.ok) return { outcome: "unavailable" };

  const out: ManagementQueueRowDto[] = [];
  for (const pair of pairs.rows) {
    const review = await gatedReview(client, pair.sessionId, pair.studentId);
    // A rejection must not shrink the queue: `continue` here would hide a
    // trainer-approved report behind "No reports waiting".
    if (!review.ok) return { outcome: "unavailable" };
    const row = review.rows;
    if (!row || row.status !== "trainer_approved") continue;
    out.push({
      reportId: row.report_id,
      sessionId: pair.sessionId,
      studentId: pair.studentId,
      studentDisplayName: pair.studentDisplayName,
      sessionDate: pair.sessionDate,
      status: row.status,
      ...(row.open_correction_issue_scope ? { openCorrectionScope: row.open_correction_issue_scope } : {}),
      ...(row.open_correction_status ? { openCorrectionStatus: row.open_correction_status } : {}),
    });
  }
  return { outcome: "success", data: await decorateQueueRows(client, out) };
}

// ---------------------------------------------------------------------
// R-7 — correction tracking, through the governed read boundary (U-B2-1)
// ---------------------------------------------------------------------
/**
 * The RPC-only half, so the disposable-database lifecycle proof can exercise
 * the real projection through a psql-backed caller. It adds NO authority of
 * its own: `report_list_management_corrections` re-derives the caller's live
 * active management membership and its centre on every call, which is why a
 * trainer, a parent or an unauthenticated caller reaching this function
 * directly still receives an empty list.
 *
 * Rows arrive already ordered (returned-at, then report id), so the queue is
 * deterministic without the server re-sorting and possibly disagreeing with
 * the boundary about what "latest" means.
 */
export async function listManagementCorrectionsFromRpc(
  caller: RpcCaller,
): Promise<ActionResult<readonly ManagementQueueRowDto[]>> {
  const { data, error } = await caller.rpc("report_list_management_corrections", {});
  if (error) return mapSqlErrorToResult(error.code, error.message);

  const rows = (Array.isArray(data) ? data : []) as readonly ManagementCorrectionRow[];
  return {
    outcome: "success",
    data: rows.map((row) => ({
      reportId: row.report_id,
      sessionId: row.class_session_id,
      studentId: row.student_id,
      studentDisplayName: row.student_display_name,
      sessionDate: row.session_date,
      status: row.report_status,
      openCorrectionScope: row.issue_scope,
      openCorrectionStatus: row.correction_status,
      openCorrectionReason: row.correction_reason,
    })),
  };
}

export async function listManagementCorrectionTrackingCore(
  client: SupabaseClient<AppDatabase>,
): Promise<ActionResult<readonly ManagementQueueRowDto[]>> {
  // The role gate is what turns a wrong-role caller's empty list into the
  // contract's `unauthorized` outcome at the action boundary. It is a
  // presentation improvement, NOT the security boundary — the database
  // re-proves authority independently inside the RPC.
  const identity = await requireRole(client, "management");
  if (identity.outcome !== "success") return identity;

  const listed = await listManagementCorrectionsFromRpc(client);
  if (listed.outcome !== "success") return listed;
  return { outcome: "success", data: await decorateQueueRows(client, listed.data) };
}

// ---------------------------------------------------------------------
// C2C-004 — the Management "Approved" list, through its own governed
// boundary `report_list_management_submitted`
// ---------------------------------------------------------------------
/**
 * WHY "APPROVED" READS `submitted`, STATED ONCE HERE AND ENFORCED IN SQL.
 *
 * Under A-036 the eight `report_status` labels include `approved`, but
 * `report_management_approve_and_submit` performs
 * `trainer_approved -> approved -> submitted` inside ONE exception-free
 * transaction, so no reader outside that transaction can ever observe
 * `approved`. A filter over the literal label would therefore return the
 * empty set on every database, forever. The governed referent of the
 * Management Reports page's "Approved" option is `submitted`, and the
 * boundary — not this module — is what restricts the rows: the SQL function
 * takes NO status parameter and restricts its WHERE clause to the `submitted`
 * status alone, so a preapproval report is never a row of the result at all.
 * (The comparison is deliberately not written out here as an assignment-shaped
 * expression: T7I-40 scans this tree for a report-status literal on the left of
 * an assignment, because TypeScript deciding a transition is forbidden, and a
 * prose example would trip a scan that is doing exactly its job.)
 *
 * NO PREAPPROVAL TRAINER DRAFT CONTENT CAN REACH THIS FUNCTION, because the
 * boundary's RETURNS TABLE carries no column that could hold any. That is a
 * structural guarantee, not a rendering decision.
 *
 * The RPC-only half exists for the same reason its correction-tracking
 * sibling's does: so a psql-backed caller can exercise the real projection.
 * It adds NO authority of its own — the function re-derives the caller's live
 * active management membership and its centre on every call, which is why a
 * trainer, a parent or an unauthenticated caller reaching it directly still
 * receives an empty list.
 */
export async function listManagementSubmittedFromRpc(
  caller: RpcCaller,
): Promise<ActionResult<readonly ManagementQueueRowDto[]>> {
  const { data, error } = await caller.rpc("report_list_management_submitted", {});
  if (error) return mapSqlErrorToResult(error.code, error.message);

  const rows = (Array.isArray(data) ? data : []) as readonly ManagementSubmittedRow[];
  return {
    outcome: "success",
    data: rows.map((row) => ({
      reportId: row.report_id,
      sessionId: row.class_session_id,
      studentId: row.student_id,
      studentDisplayName: row.student_display_name,
      sessionDate: row.session_date,
      status: row.report_status,
      ...(row.submitted_at ? { submittedAt: row.submitted_at } : {}),
    })),
  };
}

export async function listManagementSubmittedCore(
  client: SupabaseClient<AppDatabase>,
): Promise<ActionResult<readonly ManagementQueueRowDto[]>> {
  // As with correction tracking, the role gate is what turns a wrong-role
  // caller's empty list into the contract's `unauthorized` outcome at the
  // action boundary. It is a presentation improvement, NOT the security
  // boundary — the database re-proves authority independently inside the RPC.
  const identity = await requireRole(client, "management");
  if (identity.outcome !== "success") return identity;

  const listed = await listManagementSubmittedFromRpc(client);
  if (listed.outcome !== "success") return listed;
  return { outcome: "success", data: await decorateQueueRows(client, listed.data) };
}

// ---------------------------------------------------------------------
// P2-1 — screen `12` Management Classes
// ---------------------------------------------------------------------
/**
 * The centre's Class Modules, grouped by Class Grade.
 *
 * ⚠️ THE ROLE GATE HERE IS A PRESENTATION IMPROVEMENT, NOT THE SECURITY
 * BOUNDARY — the same statement `listManagementSubmittedCore` makes above it.
 * It turns a wrong-role caller's list into the contract's `unauthorized`
 * outcome; RLS decides independently, per row, inside the database, and a
 * trainer or parent reaching `listClassModulesCore` directly still sees only
 * what their own policies admit.
 *
 * ⛔ NOTHING ON THIS SURFACE IS AN ASSESSMENT FACT. `ClassListDto` carries no
 * rating, roll-up, average, observation, attendance value, evidence reference,
 * trainer note, checklist value, content hash or report status — `C-9` bars
 * per-dimension ratings from a LIST surface and `G-2` bars a roll-up from
 * every surface, so there is no field one could arrive in.
 *
 * ⛔ NO TERM FIELD (`D-3` schedules terms at `P2-2`, grouping SESSIONS under
 * `C-6`), and ⛔ NO LESSON PROGRESS FIELD — the frame's `X / 12 Lessons done`
 * needs lesson data that does not exist at HEAD. It is a `REGISTERED-OMISSION`
 * that ENDS WHEN THAT DATA ARRIVES, and inventing a denominator now would be
 * schema by inference from a frame (`A-022`).
 */
export async function listManagementClassesCore(
  client: SupabaseClient<AppDatabase>,
): Promise<ActionResult<ClassListDto>> {
  const identity = await requireRole(client, "management");
  if (identity.outcome !== "success") return identity;

  const listed = await listClassModulesCore(client);
  /*
   * ⛔ A REJECTED READ IS NEVER AN EMPTY ACADEMY. Success-with-zero-rows here
   * renders "No classes yet" — a positive claim that this centre runs none.
   * `Q-7`: the two are different values and only one of them was observed.
   */
  if (!listed.ok) return { outcome: "unavailable" };
  return { outcome: "success", data: listed.rows };
}

// ---------------------------------------------------------------------
// P2-5 — screen `25` Management Schedule
// ---------------------------------------------------------------------
/**
 * The centre's calendar for a window, as a PROJECTION of class sessions.
 *
 * ⚠️ THE ROLE GATE IS A PRESENTATION IMPROVEMENT, NOT THE SECURITY BOUNDARY
 * — the same statement `listManagementClassesCore` makes. RLS decides each
 * row independently inside the database, so a trainer reaching
 * `readCentreScheduleCore` directly still sees only their own sessions.
 *
 * ⛔ THE WINDOW IS NOT AN AUTHORIZATION INPUT. Widening it reaches no row a
 * narrow one could not; the centre comes from the caller's membership, never
 * from a parameter.
 *
 * ⛔ A REJECTED READ IS NEVER AN EMPTY CALENDAR. Success-with-zero-sessions
 * renders "nothing scheduled this month" — a positive claim about the
 * academy. `Q-7`: the two are different values and only one was observed.
 */
export async function readManagementScheduleCore(
  client: SupabaseClient<AppDatabase>,
  fromDate: string,
  toDate: string,
): Promise<ActionResult<ScheduleDto>> {
  const identity = await requireRole(client, "management");
  if (identity.outcome !== "success") return identity;

  const schedule = await readCentreScheduleCore(client, fromDate, toDate);
  if (!schedule.ok) return { outcome: "unavailable" };
  return { outcome: "success", data: schedule.rows };
}

// ---------------------------------------------------------------------
// P2-7 — screen `11` Management Dashboard
// ---------------------------------------------------------------------
/**
 * The four KPI tiles, plus the pending-review queue the same screen draws.
 *
 * ⚠️ THE ROLE GATE IS DEFENCE IN DEPTH, NOT THE BOUNDARY. The RPC beneath
 * resolves the centre from the caller's OWN active management membership and
 * takes no parameter, so a non-management caller reaching
 * `readDashboardSummaryCore` directly gets NULLs from the database itself.
 *
 * ⛔ A REJECTED READ IS NEVER FOUR ZEROES. `readDashboardSummaryCore` turns
 * the RPC's NULLs into `{ ok: false }` precisely so a refusal cannot be
 * painted as a centre with no learners and nothing assessed (`Q-7`).
 */
export async function readManagementDashboardSummaryCore(
  client: SupabaseClient<AppDatabase>,
): Promise<ActionResult<DashboardSummaryDto>> {
  const identity = await requireRole(client, "management");
  if (identity.outcome !== "success") return identity;

  const summary = await readDashboardSummaryCore(client);
  if (!summary.ok) return { outcome: "unavailable" };
  return { outcome: "success", data: summary.rows };
}

// ---------------------------------------------------------------------
// P2-6 — screen `14` Management Lesson Plan Management
// ---------------------------------------------------------------------
/**
 * A Class Module's lessons and the materials attached to each.
 *
 * ⚠️ THE ROLE GATE IS DEFENCE IN DEPTH, NOT THE BOUNDARY — the same
 * statement every read above makes. The class-shaped half is RLS-scoped, and
 * the materials half goes through `material_list_for_session`, which
 * re-resolves management-or-assigned-trainer authority **inside the
 * database** for each session. ▶ A trainer reaching `readLessonPlansCore`
 * directly still sees only the sessions they are assigned to.
 *
 * ⛔ THE GATE IS MANAGEMENT BECAUSE `14` IS A MANAGEMENT SURFACE, and that is
 * NOT a claim that trainers may not read materials — `D-4` says they
 * download. The trainer's route is a separate surface with its own phase;
 * the RPC beneath already admits them.
 *
 * ⛔ A REJECTED READ IS NEVER AN EMPTY LESSON LIST. Success-with-zero renders
 * "no lessons scheduled", a positive claim about the module (`Q-7`).
 */
export async function readManagementLessonPlansCore(
  client: SupabaseClient<AppDatabase>,
  classModuleId: string,
): Promise<ActionResult<LessonPlanDto | null>> {
  const identity = await requireRole(client, "management");
  if (identity.outcome !== "success") return identity;

  const plans = await readLessonPlansCore(client, classModuleId);
  if (!plans.ok) return { outcome: "unavailable" };
  return { outcome: "success", data: plans.rows };
}

// ---------------------------------------------------------------------
// P2-2 — screen `26` Add Class: the options read and the governed create
// ---------------------------------------------------------------------
/**
 * The Class Grade and term choices screen `26` offers.
 *
 * ⚠️ The role gate here is DEFENCE IN DEPTH, not the boundary. Both reads
 * are RLS-scoped over the caller's own credential, so a trainer reaching
 * `readAddClassOptionsCore` directly still sees only what their policies
 * admit — and `terms`' policy is deliberately ACTIVE MEMBER, not
 * management-only, because five other screens render a term to a
 * non-management reader. The gate is here because `26` is a MANAGEMENT
 * surface and a non-management caller has no business being offered it.
 */
export async function readManagementAddClassOptionsCore(
  client: SupabaseClient<AppDatabase>,
): Promise<ActionResult<AddClassOptionsDto>> {
  const identity = await requireRole(client, "management");
  if (identity.outcome !== "success") return identity;

  const options = await readAddClassOptionsCore(client);
  // ⛔ A REJECTED READ IS NEVER AN EMPTY CALENDAR. An empty term list renders
  // a form that silently cannot schedule anything (`Q-7`).
  if (!options.ok) return { outcome: "unavailable" };
  return { outcome: "success", data: options.rows };
}

/**
 * Create a Class Module and its dated sessions.
 *
 * ⛔ THE ROLE GATE HERE IS NOT THE AUTHORIZATION. Both RPCs independently
 * re-resolve exactly one ACTIVE `management` membership and refuse anything
 * else with a single non-disclosing `not_permitted`, and they do it inside
 * the same transaction as the write. Removing this gate would change the
 * error a wrong caller sees; it would not let one through.
 *
 * ⛔ NO TRAINER ASSIGNMENT — see `class-creation.ts`. It needs a third audit
 * string the Operator did not name, and it is STOPPED.
 */
export async function createManagementClassCore(
  client: SupabaseClient<AppDatabase>,
  input: CreateClassInput,
): Promise<ActionResult<ClassCreationOutcome>> {
  const identity = await requireRole(client, "management");
  if (identity.outcome !== "success") return identity;
  return createClassCore(client, input);
}

/**
 * P2-4 — screen `13` Class Overview.
 *
 * ⛔ THE ROLE GATE IS DEFENCE IN DEPTH, not the boundary. Both RPCs
 * re-resolve exactly one ACTIVE management membership inside the database and
 * return ZERO ROWS otherwise, so a caller who bypassed this file entirely
 * still reads nothing.
 *
 * ⚠️ THE SUMMARY IS FETCHED EVEN WHEN THE GRID IS EMPTY, and the two are
 * NOT collapsed into one call. A module with no sessions yet is a real state
 * whose health is still answerable — `CLAUDE.md` §6's condition 4 — and
 * deriving the counts from the grid would silently re-implement the ratified
 * definition of *pending* in a second place.
 */
export async function readManagementClassOverviewCore(
  client: SupabaseClient<AppDatabase>,
  classModuleId: string,
): Promise<ActionResult<{
  readonly header: ClassHeaderDto | null;
  readonly rows: readonly ClassOverviewRowDto[];
  readonly sessions: readonly ClassOverviewSessionDto[];
  readonly health: ClassHealthDto | null;
  readonly verdict: { readonly status: string; readonly action: string } | null;
}>> {
  const identity = await requireRole(client, "management");
  if (identity.outcome !== "success") return identity;

  /*
   * ⛔ THE HEADER FAILS CLOSED WITH EVERYTHING ELSE. A rejected class read is
   * `unavailable`, never a page with a blank title over a real report grid:
   * a header that silently renders nothing is how a management reader ends up
   * looking at one class while believing they are looking at another.
   */
  const header = await readClassHeaderCore(client, classModuleId);
  if (!header.ok) return { outcome: "unavailable" };
  if (header.rows === null) return { outcome: "unavailable" };

  const grid = await readClassStatusRowsCore(client, classModuleId);
  if (!grid.ok) return { outcome: "unavailable" };
  const health = await readClassHealthCore(client, classModuleId);
  if (!health.ok) return { outcome: "unavailable" };

  return {
    outcome: "success",
    data: {
      header: header.rows,
      rows: grid.rows,
      sessions: summariseSessions(grid.rows),
      health: health.rows,
      // ⚠️ NO VERDICT WITHOUT A SUMMARY. `classHealthVerdict` would happily
      // return "On Track" for a fabricated all-zero summary, which is exactly
      // the sentence a refused read must never produce.
      verdict: health.rows === null ? null : classHealthVerdict(health.rows),
    },
  };
}

/**
 * P2-3 — screen `27` Edit Class: the read.
 *
 * ⛔ A MODULE THAT DOES NOT EXIST AND ONE OUTSIDE THIS CENTRE RESOLVE TO THE
 * SAME `unavailable`. The read is RLS-scoped, so the two are already
 * indistinguishable at the database; this keeps them indistinguishable at the
 * surface too.
 */
export async function readManagementClassForEditCore(
  client: SupabaseClient<AppDatabase>,
  classModuleId: string,
): Promise<ActionResult<ClassEditDto>> {
  const identity = await requireRole(client, "management");
  if (identity.outcome !== "success") return identity;

  const found = await readClassForEditCore(client, classModuleId);
  if (!found.ok) return { outcome: "unavailable" };
  if (!found.rows) return { outcome: "unavailable" };
  return { outcome: "success", data: found.rows };
}

/**
 * P2-3 — the governed edit.
 *
 * ⛔ THE ROLE GATE IS DEFENCE IN DEPTH. Both update RPCs re-resolve exactly
 * one ACTIVE `management` membership inside the same transaction as the write
 * and refuse anything else with one non-disclosing string.
 */
export async function updateManagementClassCore(
  client: SupabaseClient<AppDatabase>,
  input: UpdateClassInput,
): Promise<ActionResult<ClassUpdateOutcome>> {
  const identity = await requireRole(client, "management");
  if (identity.outcome !== "success") return identity;
  return updateClassCore(client, input);
}

// ---------------------------------------------------------------------
// R-8 — the safe final-review candidate
// ---------------------------------------------------------------------
export async function getManagementReviewCandidateCore(
  client: SupabaseClient<AppDatabase>,
  sessionId: string,
  studentId: string,
): Promise<ActionResult<ManagementReviewDto>> {
  const identity = await requireRole(client, "management");
  if (identity.outcome !== "success") return identity;

  const { data, error } = await client.rpc("report_get_management_review", {
    p_class_session_id: sessionId,
    p_student_id: studentId,
  });
  if (error) return mapSqlErrorToResult(error.code, error.message);
  const row = firstRow<ManagementReviewRow>(data);
  // Zero rows is the NON-DISCLOSING unavailable outcome for every
  // pre-approval status and for "no such report" alike (A-038 / §5.4).
  if (!row) return { outcome: "unavailable" };

  return {
    outcome: "success",
    data: {
      reportId: row.report_id,
      status: row.status,
      lockVersion: row.lock_version,
      versionId: row.current_version_id,
      panels: {
        overview: row.overview ?? "",
        strengths: row.strengths ?? "",
        areasForDevelopment: row.areas_for_development ?? "",
        remarks: row.remarks ?? "",
      },
      wordingHash: row.wording_hash,
      submittedAt: row.submitted_at,
      ...(row.open_correction_issue_scope ? { openCorrectionScope: row.open_correction_issue_scope } : {}),
      ...(row.open_correction_status ? { openCorrectionStatus: row.open_correction_status } : {}),
    },
  };
}

/**
 * D-1 / C-9 / C-10 — the nine per-dimension ratings for a MANAGEMENT REPORT
 * DETAIL surface, READ ONLY.
 *
 * ⛔ MANAGEMENT MAY VIEW, NEVER EDIT. This is a read. An assessment-level
 * disagreement remains a RETURN TO THE TRAINER (A-034, D-1), and no write
 * path to a rating exists on any management surface.
 *
 * ⛔ C-9 — REPORT DETAIL SURFACES ONLY. Not the queue, not a list, not a
 * statistics surface: "ratings on a list or a statistics surface is a
 * different disclosure shape — it invites comparison between children".
 * The gate is enforced in the database (only `trainer_approved` and
 * `submitted` return anything), not here; this function must never be
 * called from a list projection regardless.
 *
 * ⛔ Q-27 IS UNTOUCHED. D-1 moves A-038 in the MANAGEMENT direction only and
 * grants Parent nothing. `report_get_management_ratings` returns zero rows
 * for a parent, a trainer and an unidentified caller alike, proven by
 * `npm run prove:portal-1` legs D1a-3/4/5 with a control leg (D1a-6) showing
 * the probe can return rows at all.
 *
 * ⛔ NO ROLL-UP IS COMPUTED HERE OR ANYWHERE (G-2). There is no average, no
 * headline band, no Overall Grade. Nine dimension/rating pairs travel as
 * nine pairs.
 */
/**
 * The row shape `report_get_management_ratings` returns.
 *
 * ⚠️ DECLARED LOCALLY, NOT DERIVED FROM `Database`, AND THAT IS DELIBERATE.
 * The committed generated database types predate migration
 * `20260811140000` and do not carry this function. ⛔ `CLAUDE.md` §12
 * prohibits HAND-EDITING generated database types, and regenerating them is
 * Step 7J's own checkpoint — not a side effect of this phase. Deriving the
 * type here would therefore mean either editing a generated file or
 * regenerating one unauthorized.
 *
 * ▶ This shape is asserted against the DATABASE by `prove:portal-1`, not
 * against a type file — the function's own in-migration assertion `D1-5`
 * pins the return type's field names, and leg `D1a-2` pins nine distinct
 * dimension codes at runtime.
 */
type ManagementRatingRow = {
  readonly dimension_code: DimensionCode;
  readonly display_name: string;
  readonly rating: RatingLevel;
};

/**
 * One dimension and its rating, as a management report detail surface reads
 * it. ⛔ There is no aggregate field, and none may be added (G-2).
 */
export type ReportRatingSnapshotDto = {
  readonly dimensionCode: DimensionCode;
  readonly displayName: string;
  readonly rating: RatingLevel;
};

export async function getManagementRatingsCore(
  client: SupabaseClient<AppDatabase>,
  sessionId: string,
  studentId: string,
): Promise<ActionResult<readonly ReportRatingSnapshotDto[]>> {
  const identity = await requireRole(client, "management");
  if (identity.outcome !== "success") return identity;

  const rows = await readRpcRows<ManagementRatingRow>(
    "getManagementRatingsCore:report_get_management_ratings",
    () =>
      client.rpc("report_get_management_ratings", {
        p_class_session_id: sessionId,
        p_student_id: studentId,
      }),
  );
  // ⚠️ A REJECTED QUERY IS NOT AN EMPTY RESULT (Q-7). `readRows` decides the
  // three cases once; collapsing a rejection into `[]` here would render an
  // assessment as having no ratings, which looks entirely normal.
  if (!rows.ok) return { outcome: "unavailable" };

  return {
    outcome: "success",
    data: rows.rows.map((row: ManagementRatingRow) => ({
      dimensionCode: row.dimension_code,
      displayName: row.display_name,
      rating: row.rating,
    })),
  };
}

// ---------------------------------------------------------------------
// P2-8 — screen `17` Management Students
// ---------------------------------------------------------------------
/**
 * The centre's student roll: learner, class(es) and guardian.
 *
 * ⚠️ THE ROLE GATE IS DEFENCE IN DEPTH, NOT THE BOUNDARY — the same statement
 * every read above makes. Every table `listManagementStudentsCore` touches is
 * RLS-scoped and carries its own management policy; the gate here means a
 * non-management caller is refused BEFORE the reads rather than returned an
 * empty roll by the database.
 *
 * ⛔ A REJECTED READ IS NEVER AN EMPTY ACADEMY. Success-with-zero-rows renders
 * "no students enrolled" — a positive claim about the centre that nobody
 * measured (`Q-7`).
 *
 * ⛔ NOTHING THIS RETURNS IS AN ASSESSMENT FACT. Learner name, class label and
 * guardian name are identity and enrolment facts. The frame's `Overall` rating
 * chip is REFUSED under `C-9` — whose own row names `P2-8` — and under `G-2`,
 * which bars every roll-up permanently; there is no field here one could arrive
 * in, and `PSTa-RATINGS` fails the build if that ever stops being true.
 */
export async function readManagementStudentsCore(
  client: SupabaseClient<AppDatabase>,
): Promise<ActionResult<ManagementStudentListDto>> {
  const identity = await requireRole(client, "management");
  if (identity.outcome !== "success") return identity;

  const listed = await listManagementStudentsCore(client);
  if (!listed.ok) return { outcome: "unavailable" };
  return { outcome: "success", data: listed.rows };
}
