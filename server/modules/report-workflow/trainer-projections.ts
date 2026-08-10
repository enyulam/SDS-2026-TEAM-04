/**
 * Trainer read projections — R-1 (dashboard sessions), R-2 (roster and
 * per-student report state), R-3 (working report), R-4 (returned-correction
 * queue), R-5 (returned-correction detail) of contract §5.2.
 *
 * Mechanism (CP-3 resolution, recorded): every projection is a SERVER-SIDE
 * read over the caller's OWN credential — the accepted Step 7G RLS grants
 * for roster/relationship data plus the ratified read RPCs for anything
 * report-shaped. NO new database function, table grant or policy was added
 * for these projections: the enumeration surface (sessions, enrolments,
 * students, attendance) is exactly what Step 7G already scoped to the
 * trainer, and every report fact flows through `report_get_working`, which
 * re-proves the trainer's live reach per call. Authority is therefore
 * re-derived by the database on every row — the projection can only ever
 * see what its caller could already see.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ActionResult } from "@/server/contracts/action-result";
import { mapSqlErrorToResult } from "@/server/contracts/action-result";
import { requireRole } from "@/server/modules/identity-access/session-core";
import { getTrainerObservationCore } from "@/server/modules/observation/core";
import {
  firstRow,
  type CorrectionIssueScope,
  type CorrectionRequestStatus,
  type ReportStatus,
  type WorkingReportRow,
} from "@/server/modules/report-workflow/rpc-types";
import { isDimensionCode, isRatingLevel } from "@/server/modules/framework/dimensions";
import { getSessionStaffIdentitiesCore } from "@/server/modules/class-session/staff-projections";
import {
  readMaybeRow,
  readRows,
  reportQueryFailure,
  type QueryOutcome,
} from "@/server/platform/query-diagnostics";

export interface TrainerSessionSummaryDto {
  readonly sessionId: string;
  readonly moduleName: string;
  readonly classGrade: string;
  readonly date: string;
  readonly startTime: string | null;
  readonly endTime: string | null;
  readonly studentCount: number;
  readonly countsByReportState: Readonly<Partial<Record<ReportStatus | "no_report", number>>>;
  /**
   * Hero Phase 3 (screen `05`). Both NULLABLE, and NULL MEANS NOT RECORDED —
   * render by OMITTING the row. Never "TBC", never a placeholder dash.
   *
   * ⚠️ `room` is a PLAIN DESCRIPTIVE COLUMN (G-6). It carries NO authorization
   * meaning and must never be used to scope a query — trainer reach is proved
   * through the live class-session assignment (ADR-4), never through a
   * location.
   *
   * ⛔ `trainerDisplayName` is the single assigned trainer (`Main:`, G-7).
   * There is NO `Assist.` field and none may be added: a second staff role
   * means extending `centre_membership_role`, which carries authorization
   * vocabulary, and it would reintroduce the TA persona A-014 defers.
   */
  readonly room: string | null;
  readonly trainerDisplayName: string | null;
  /**
   * Hero Phase 4 (screen `06` lesson strip). Both NULLABLE — NULL MEANS NOT
   * RECORDED, so the element is OMITTED. Never "Lesson 1", never "TBC".
   *
   * ⛔ LESSON IDENTITY ONLY (G-3). These are the lesson's NUMBER and TITLE.
   * The frame's **KEY FOCUS chips are PROHIBITED** and no column exists for
   * them: KEY FOCUS is lesson-plan INTENT, whereas `RosterEntryDto.
   * previousSessionFocus` is the trainer's own governed carried-over focus,
   * derived from `observations.follow_up_notes`. ⚠️ They occupy the same
   * visual position in the frame, so conflating them would silently replace a
   * governed field with an ungoverned one and the substitution would be
   * invisible on the rendered page. **No lesson field may ever be rendered
   * into the carried-over focus line, or into any surface presenting the
   * governed focus** — this protects `CLAUDE.md` §10 Phase 1 exit (c).
   */
  readonly lessonNumber: number | null;
  readonly lessonTitle: string | null;
}

export interface RosterEntryDto {
  readonly studentId: string;
  readonly displayName: string;
  readonly attendanceState: "present" | "absent";
  /**
   * Whether an `attendance` ROW actually exists for this (session, student).
   *
   * A-018 materializes the Present default LAZILY — by the column default, on
   * the first governed write — so "no row yet" and "row says present" are two
   * different committed states that this projection had been rendering
   * IDENTICALLY as `attendanceState: "present"`. That is an unmeasured value
   * presented as a measured one, and it is not merely cosmetic: the governed
   * write `attendance_set_status` is a compare-and-set whose `expectedStatus`
   * distinguishes exactly these two cases (`undefined` = "I believe there is
   * no record"), and there is NO FORCE MODE. A trainer toggling a learner
   * whose row does not exist yet would have sent `expected: "present"` and
   * been answered `stale_state`, with nothing on the surface able to explain
   * why.
   *
   * `attendanceState` keeps its meaning — the EFFECTIVE status, default
   * included — so every existing reader is unchanged. This field carries the
   * distinction the CAS needs, and nothing else.
   */
  readonly attendanceRecorded: boolean;
  readonly reportState: ReportStatus | "no_report";
  readonly reportId: string | null;
  readonly previousSessionFocus: string | null;
}

export interface CorrectionRequestDto {
  readonly id: string;
  readonly issueScope: CorrectionIssueScope;
  readonly dimensionCode?: string;
  readonly status: CorrectionRequestStatus;
  /** Present on TRAINER surfaces only (contract §5.5). */
  readonly reason?: string;
}

export interface TrainerWorkingReportDto {
  readonly reportId: string;
  readonly sessionId: string;
  readonly studentId: string;
  readonly studentDisplayName: string;
  readonly status: ReportStatus;
  readonly lockVersion: number;
  readonly versionId: string;
  readonly revisionNumber: number;
  readonly panels: {
    readonly overview: string;
    readonly strengths: string;
    readonly areasForDevelopment: string;
    readonly remarks: string;
  };
  /** Trainer-only (contract §5.3): the sole DTO permitted to carry it. */
  readonly contentHash: string;
  readonly checklist: {
    readonly evidenceConfirmed: boolean | null;
    readonly aiDraftReviewed: boolean | null;
    readonly privacyChecked: boolean | null;
  };
  readonly ratingSnapshots: ReadonlyArray<{
    readonly dimensionCode: string;
    readonly displayName: string;
    readonly rating: string;
  }>;
  readonly canonicalPointer: {
    readonly latestSubmittedVersionId: string | null;
    readonly submittedAt: string | null;
  };
  /** `observations.follow_up_notes` — ONE column, two screens (CLAUDE.md §6). */
  readonly coachNotes: string;
  readonly openCorrection?: CorrectionRequestDto;
}

export interface ReturnedReportQueueItemDto {
  readonly reportId: string;
  readonly sessionId: string;
  readonly studentId: string;
  readonly studentDisplayName: string;
  readonly sessionDate: string;
  readonly correction: CorrectionRequestDto;
}

interface SessionRow {
  id: string;
  session_date: string;
  starts_at: string | null;
  ends_at: string | null;
  class_module_id: string;
  /** Hero Phase 0B, surfaced at Phase 3/4. Nullable; NULL means NOT RECORDED. */
  room?: string | null;
  lesson_number?: number | null;
  lesson_title?: string | null;
}

/**
 * ⚠️ RETURNS A `QueryOutcome`, NOT AN ARRAY, AND THAT IS THE WHOLE FIX.
 *
 * This function previously ended `if (error || !data) return []`. Pointed at
 * a database four migrations behind the code, the selected `room` /
 * `lesson_number` / `lesson_title` columns did not exist, PostgREST rejected
 * the read with `42703`, and the Trainer schedule rendered **"no classes"** —
 * ⛔ **A REJECTED QUERY PRESENTED AS AN ESTABLISHED EMPTINESS**, with nothing
 * anywhere naming the cause.
 *
 * ▶ **`[]` and "the query failed" are now different VALUES.** No single
 * return means both, so a caller cannot conflate them by accident — which is
 * stronger than remembering to check a flag beside an array.
 *
 * The rejection is named on the server (`reportQueryFailure`) and the caller
 * returns the ordinary non-disclosing `unavailable`. **The surface never
 * learns why, and never claims an emptiness it has not established.**
 */
async function listAssignedSessions(
  client: SupabaseClient,
): Promise<QueryOutcome<SessionRow[]>> {
  // class_sessions_select_trainer already scopes rows to the caller's live
  // active assignments, so a plain select IS the assigned-session list.
  const { data, error } = await client
    .from("class_sessions")
    .select("id, session_date, starts_at, ends_at, class_module_id, room, lesson_number, lesson_title")
    .order("session_date", { ascending: true });

  if (error) {
    reportQueryFailure("listAssignedSessions:class_sessions", error);
    return { ok: false };
  }
  // ⚠️ `data` null WITHOUT an error is not an empty roster either — it is a
  // response the driver could not give rows for. Treated as a failure for the
  // same reason: this function may only report an emptiness it has actually
  // observed.
  if (!data) {
    reportQueryFailure("listAssignedSessions:class_sessions", {
      code: null,
      message: "the driver returned neither rows nor an error",
    });
    return { ok: false };
  }
  return { ok: true, rows: data as SessionRow[] };
}

/**
 * ⚠️ THE SECOND HALF OF THE ROSTER FIX. `listAssignedSessions` was corrected
 * first; this function kept the identical `if (error || !data) return []`,
 * in the SAME file, feeding the SAME surface — so the roster could still
 * empty silently through it. Half a fix is not a fix.
 *
 * ⛔ The `students` read was worse than the enrolments one: it never
 * destructured `error` at all, so a rejection there was discarded before
 * anything could check it and every learner silently became "Student".
 */
async function listEnrolledStudents(
  client: SupabaseClient,
  moduleId: string,
): Promise<QueryOutcome<Array<{ studentId: string; displayName: string }>>> {
  const enrolments = await readRows<{ student_id: string }>(
    "listEnrolledStudents:enrolments",
    () =>
      client
        .from("enrolments")
        .select("student_id, is_active")
        .eq("class_module_id", moduleId)
        .eq("is_active", true),
  );
  if (!enrolments.ok) return { ok: false };

  const ids = enrolments.rows.map((r) => r.student_id);
  // ⚠️ A GENUINELY OBSERVED emptiness — the read succeeded and returned no
  // rows. This is the only kind this function may report.
  if (ids.length === 0) return { ok: true, rows: [] };

  const students = await readRows<{ id: string; full_name: string }>(
    "listEnrolledStudents:students",
    () => client.from("students").select("id, full_name").in("id", ids),
  );
  if (!students.ok) return { ok: false };

  const names = new Map(students.rows.map((s) => [s.id, s.full_name]));
  return {
    ok: true,
    rows: ids.map((id) => ({ studentId: id, displayName: names.get(id) ?? "Student" })),
  };
}

/**
 * ⛔ A REJECTED READ IS NEVER "THIS STUDENT HAS NO REPORT".
 *
 * This returned `null` for both, and all three callers read `null` as the
 * absence: the schedule counted the student as `no_report`, the roster
 * rendered no status, and the returned-corrections queue skipped them —
 * telling a trainer they had no corrections outstanding. `null` now means an
 * OBSERVED absence and nothing else; a rejection is `{ ok: false }`.
 */
async function workingState(
  client: SupabaseClient,
  sessionId: string,
  studentId: string,
): Promise<QueryOutcome<WorkingReportRow | null>> {
  return readMaybeRow<WorkingReportRow>("workingState:report_get_working", () =>
    client.rpc("report_get_working", {
      p_class_session_id: sessionId,
      p_student_id: studentId,
    }),
  );
}

// ---------------------------------------------------------------------
// R-1 — trainer dashboard and assigned sessions
// ---------------------------------------------------------------------
export async function listTrainerSessionsCore(
  client: SupabaseClient,
): Promise<ActionResult<readonly TrainerSessionSummaryDto[]>> {
  const identity = await requireRole(client, "trainer");
  if (identity.outcome !== "success") return identity;

  const assigned = await listAssignedSessions(client);
  /*
   * ⛔ A REJECTED READ IS `unavailable`, NEVER AN EMPTY SCHEDULE. Returning
   * success-with-zero-rows here would assert that the trainer has no sessions — a positive
   * claim this projection has not established. The cause is already named in
   * the server log; the caller receives the same non-disclosing outcome every
   * other unavailable read returns, so nothing about the schema reaches a
   * client.
   */
  if (!assigned.ok) return { outcome: "unavailable" };
  const sessions = assigned.rows;

  /*
   * Hero Phase 3. The assigned trainer comes from the SHARED Phase 0A read
   * path, not from a join written here — one source of truth for staff
   * identity across the six screens that render it, and one place an
   * authorization decision could ever drift.
   *
   * ⚠️ Fail-soft, and only because of what it is: staff identity is display
   * context on this surface. If the batch read is unavailable the schedule
   * still renders every session the trainer is assigned to, with the `Main:`
   * row omitted — the same treatment a NULL room gets. It must never be able
   * to remove a session the caller's own scope already returned.
   *
   * ⛔ One name, never two. There is no `Assist.` slot (G-7).
   */
  const staff = await getSessionStaffIdentitiesCore(client, sessions.map((s) => s.id));
  const staffById = staff.outcome === "success" ? staff.data : null;

  const out: TrainerSessionSummaryDto[] = [];
  for (const session of sessions) {
    const modules = await readRows<{ title: string; class_grade_id: string }>(
      "listTrainerSessionsCore:class_modules",
      () =>
        client
          .from("class_modules")
          .select("id, title, class_grade_id")
          .eq("id", session.class_module_id),
    );
    if (!modules.ok) return { outcome: "unavailable" };
    const moduleRow = modules.rows[0] ?? null;

    let grade = "";
    if (moduleRow) {
      const grades = await readRows<{ display_name?: string }>(
        "listTrainerSessionsCore:class_grades",
        () =>
          client
            .from("class_grades")
            .select("id, display_name")
            .eq("id", moduleRow.class_grade_id),
      );
      if (!grades.ok) return { outcome: "unavailable" };
      grade = grades.rows[0]?.display_name ?? "";
    }

    /*
     * ⛔ A REJECTED ROSTER READ IS NOT A SESSION WITH ZERO LEARNERS. The old
     * code rendered `studentCount: 0` for a rejection, which is a MEASUREMENT
     * a trainer would reasonably act on — an empty class. It is now the
     * non-disclosing `unavailable`, exactly as a rejected session list is.
     */
    const enrolled = await listEnrolledStudents(client, session.class_module_id);
    if (!enrolled.ok) return { outcome: "unavailable" };
    const students = enrolled.rows;
    const counts: Partial<Record<ReportStatus | "no_report", number>> = {};
    for (const student of students) {
      const state = await workingState(client, session.id, student.studentId);
      // A rejection must not be counted as `no_report` — that is a fabricated
      // status breakdown, not a missing one.
      if (!state.ok) return { outcome: "unavailable" };
      const key: ReportStatus | "no_report" = state.rows ? state.rows.status : "no_report";
      counts[key] = (counts[key] ?? 0) + 1;
    }
    out.push({
      sessionId: session.id,
      moduleName: moduleRow?.title ?? "",
      classGrade: grade,
      date: session.session_date,
      startTime: session.starts_at,
      endTime: session.ends_at,
      studentCount: students.length,
      countsByReportState: counts,
      room: session.room ?? null,
      trainerDisplayName: staffById?.get(session.id)?.trainerDisplayName ?? null,
      lessonNumber: session.lesson_number ?? null,
      lessonTitle: session.lesson_title ?? null,
    });
  }
  return { outcome: "success", data: out };
}

// ---------------------------------------------------------------------
// R-2 — session roster with per-student report state and previous-session
// focus continuity
// ---------------------------------------------------------------------
export async function getSessionRosterCore(
  client: SupabaseClient,
  sessionId: string,
): Promise<ActionResult<readonly RosterEntryDto[]>> {
  const identity = await requireRole(client, "trainer");
  if (identity.outcome !== "success") return identity;

  const { data: sessions, error } = await client
    .from("class_sessions")
    .select("id, session_date, class_module_id")
    .eq("id", sessionId);
  if (error || !sessions || sessions.length !== 1) return { outcome: "unauthorized" };
  const session = sessions[0] as SessionRow;

  // The previous assigned session of the same module (for follow-up carry-over).
  /*
   * ⚠️ THE CARRY-OVER'S OWN READ, AND THE MOST DANGEROUS ONE ON THIS SURFACE.
   * A rejection here previously became `priorSessionId = null`, i.e. "there is
   * no previous session" — so the roster would render EVERY learner with no
   * carried-over previous-session focus and look completely normal. That is
   * `CLAUDE.md` §10 Phase 1 exit condition (c) silently not holding, which is
   * precisely the guarantee the G-3 prohibition exists to protect.
   */
  const prior = await readRows<{ id?: string }>(
    "getSessionRosterCore:class_sessions(prior)",
    () =>
      client
        .from("class_sessions")
        .select("id, session_date")
        .eq("class_module_id", session.class_module_id)
        .lt("session_date", session.session_date)
        .order("session_date", { ascending: false })
        .limit(1),
  );
  if (!prior.ok) return { outcome: "unavailable" };
  const priorSessionId = prior.rows[0]?.id ?? null;

  /*
   * ⛔ A REJECTED ATTENDANCE READ MUST NOT BECOME "no row recorded". `A-018`
   * materializes the Present default LAZILY, so "no row" is a REAL committed
   * state that `attendanceRecorded: false` reports and that the governed
   * compare-and-set depends on. A rejection rendered as "no row" would feed
   * the trainer's toggle a false `expectedStatus` and be answered
   * `stale_state`, with nothing on the surface able to explain why.
   */
  const attendance = await readRows<{ student_id: string; status: string }>(
    "getSessionRosterCore:attendance",
    () => client.from("attendance").select("student_id, status").eq("class_session_id", sessionId),
  );
  if (!attendance.ok) return { outcome: "unavailable" };
  const attendanceOf = new Map(attendance.rows.map((a) => [a.student_id, a.status]));

  const enrolled = await listEnrolledStudents(client, session.class_module_id);
  if (!enrolled.ok) return { outcome: "unavailable" };
  const students = enrolled.rows;
  const out: RosterEntryDto[] = [];
  for (const student of students) {
    const state = await workingState(client, sessionId, student.studentId);
    // The roster must not report `no_report` for a status it failed to read.
    if (!state.ok) return { outcome: "unavailable" };
    const reportRow = state.rows;
    let previousFocus: string | null = null;
    if (priorSessionId) {
      const priorObservation = await getTrainerObservationCore(client, priorSessionId, student.studentId);
      if (priorObservation.outcome === "success" && priorObservation.data.observationExists) {
        previousFocus = priorObservation.data.followUpNotes || null;
      }
    }
    const attendanceRow = attendanceOf.get(student.studentId);
    out.push({
      studentId: student.studentId,
      displayName: student.displayName,
      // EFFECTIVE status: an absent row is absent, everything else — including
      // a row that does not exist yet — presents as A-018's Present default.
      attendanceState: attendanceRow === "absent" ? "absent" : "present",
      // ...and whether that default was materialized or merely implied. See
      // the field's declaration for why the two must not be conflated.
      attendanceRecorded: attendanceRow !== undefined,
      reportState: reportRow ? reportRow.status : "no_report",
      reportId: reportRow ? reportRow.report_id : null,
      previousSessionFocus: previousFocus,
    });
  }
  return { outcome: "success", data: out };
}

// ---------------------------------------------------------------------
// R-3 / R-5 — the trainer working report (including returned-correction
// detail: scope, dimension AND reason — the trainer surface owns the reason)
// ---------------------------------------------------------------------
export async function getTrainerWorkingReportCore(
  client: SupabaseClient,
  sessionId: string,
  studentId: string,
): Promise<ActionResult<TrainerWorkingReportDto>> {
  const identity = await requireRole(client, "trainer");
  if (identity.outcome !== "success") return identity;

  const { data, error } = await client.rpc("report_get_working", {
    p_class_session_id: sessionId,
    p_student_id: studentId,
  });
  if (error) return mapSqlErrorToResult(error.code, error.message);
  const row = firstRow<WorkingReportRow>(data);
  if (!row) return { outcome: "unavailable" };

  /*
   * ⚠️ Fail-CLOSED rather than fail-soft, and the difference matters on this
   * surface: the trainer approval confirmation NAMES the learner. Rendering
   * the placeholder "Student" because a read was rejected would ask a trainer
   * to approve a report for someone the screen could not name.
   */
  const students = await readRows<{ full_name?: string }>(
    "getTrainerWorkingReportCore:students",
    () => client.from("students").select("id, full_name").eq("id", studentId),
  );
  if (!students.ok) return { outcome: "unavailable" };
  const displayName = students.rows[0]?.full_name ?? "Student";

  const observation = await getTrainerObservationCore(client, sessionId, studentId);
  const coachNotes =
    observation.outcome === "success" && observation.data.observationExists
      ? observation.data.followUpNotes
      : "";

  const snapshots = Array.isArray(row.ratings)
    ? (row.ratings as Array<{ dimension_code: string; display_name?: string; rating: string }>)
        .filter((r) => isDimensionCode(r.dimension_code) && isRatingLevel(r.rating))
        .map((r) => ({
          dimensionCode: r.dimension_code,
          displayName: r.display_name ?? r.dimension_code,
          rating: r.rating,
        }))
    : [];

  return {
    outcome: "success",
    data: {
      reportId: row.report_id,
      sessionId,
      studentId,
      studentDisplayName: displayName,
      status: row.status,
      lockVersion: row.lock_version,
      versionId: row.current_version_id,
      revisionNumber: row.revision_number,
      panels: {
        overview: row.overview ?? "",
        strengths: row.strengths ?? "",
        areasForDevelopment: row.areas_for_development ?? "",
        remarks: row.remarks ?? "",
      },
      contentHash: row.content_hash ?? "",
      checklist: {
        evidenceConfirmed: row.evidence_confirmed,
        aiDraftReviewed: row.ai_draft_reviewed,
        privacyChecked: row.privacy_checked,
      },
      ratingSnapshots: snapshots,
      canonicalPointer: {
        latestSubmittedVersionId: row.latest_submitted_version_id,
        submittedAt: row.submitted_at,
      },
      coachNotes,
      ...(row.open_correction_request_id
        ? {
            openCorrection: {
              id: row.open_correction_request_id,
              issueScope: row.open_correction_issue_scope,
              ...(row.open_correction_dimension_code ? { dimensionCode: row.open_correction_dimension_code } : {}),
              status: "open" as CorrectionRequestStatus,
              reason: row.open_correction_reason ?? undefined,
            },
          }
        : {}),
    },
  };
}

// ---------------------------------------------------------------------
// R-4 — the returned-correction queue
// ---------------------------------------------------------------------
export async function listReturnedReportsCore(
  client: SupabaseClient,
): Promise<ActionResult<readonly ReturnedReportQueueItemDto[]>> {
  const identity = await requireRole(client, "trainer");
  if (identity.outcome !== "success") return identity;

  const assigned = await listAssignedSessions(client);
  /*
   * ⛔ A REJECTED READ IS `unavailable`, NEVER AN EMPTY QUEUE. Returning
   * success-with-zero-rows here would assert that no report has been returned to this trainer — a positive
   * claim this projection has not established. The cause is already named in
   * the server log; the caller receives the same non-disclosing outcome every
   * other unavailable read returns, so nothing about the schema reaches a
   * client.
   */
  if (!assigned.ok) return { outcome: "unavailable" };
  const sessions = assigned.rows;
  const out: ReturnedReportQueueItemDto[] = [];
  for (const session of sessions) {
    const enrolled = await listEnrolledStudents(client, session.class_module_id);
    // ⛔ A rejection here would silently shorten the RETURNED-CORRECTIONS
    // queue — a trainer would be told they have no corrections outstanding.
    if (!enrolled.ok) return { outcome: "unavailable" };
    for (const student of enrolled.rows) {
      const state = await workingState(client, session.id, student.studentId);
      /*
       * ⛔ THE SAME HAZARD THE COMMENT SIX LINES ABOVE ALREADY NAMES. That one
       * guards the ENUMERATION; this per-student read was left unguarded, and
       * a rejection here `continue`d — telling a trainer they had NO
       * corrections outstanding while a returned report waited.
       */
      if (!state.ok) return { outcome: "unavailable" };
      const row = state.rows;
      if (!row || row.status !== "needs_edit" || !row.open_correction_request_id) continue;
      out.push({
        reportId: row.report_id,
        sessionId: session.id,
        studentId: student.studentId,
        studentDisplayName: student.displayName,
        sessionDate: session.session_date,
        correction: {
          id: row.open_correction_request_id,
          issueScope: row.open_correction_issue_scope,
          ...(row.open_correction_dimension_code ? { dimensionCode: row.open_correction_dimension_code } : {}),
          status: "open",
          reason: row.open_correction_reason ?? undefined,
        },
      });
    }
  }
  return { outcome: "success", data: out };
}
