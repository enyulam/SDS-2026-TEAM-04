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

export interface TrainerSessionSummaryDto {
  readonly sessionId: string;
  readonly moduleName: string;
  readonly classGrade: string;
  readonly date: string;
  readonly startTime: string | null;
  readonly endTime: string | null;
  readonly studentCount: number;
  readonly countsByReportState: Readonly<Partial<Record<ReportStatus | "no_report", number>>>;
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
}

async function listAssignedSessions(client: SupabaseClient): Promise<SessionRow[]> {
  // class_sessions_select_trainer already scopes rows to the caller's live
  // active assignments, so a plain select IS the assigned-session list.
  const { data, error } = await client
    .from("class_sessions")
    .select("id, session_date, starts_at, ends_at, class_module_id")
    .order("session_date", { ascending: true });
  if (error || !data) return [];
  return data as SessionRow[];
}

async function listEnrolledStudents(
  client: SupabaseClient,
  moduleId: string,
): Promise<Array<{ studentId: string; displayName: string }>> {
  const { data, error } = await client
    .from("enrolments")
    .select("student_id, is_active")
    .eq("class_module_id", moduleId)
    .eq("is_active", true);
  if (error || !data) return [];
  const ids = (data as Array<{ student_id: string }>).map((r) => r.student_id);
  if (ids.length === 0) return [];
  const { data: students } = await client
    .from("students")
    .select("id, full_name")
    .in("id", ids);
  const names = new Map(((students ?? []) as Array<{ id: string; full_name: string }>).map((s) => [s.id, s.full_name]));
  return ids.map((id) => ({ studentId: id, displayName: names.get(id) ?? "Student" }));
}

async function workingState(
  client: SupabaseClient,
  sessionId: string,
  studentId: string,
): Promise<WorkingReportRow | null> {
  const { data, error } = await client.rpc("report_get_working", {
    p_class_session_id: sessionId,
    p_student_id: studentId,
  });
  if (error) return null;
  return firstRow<WorkingReportRow>(data);
}

// ---------------------------------------------------------------------
// R-1 — trainer dashboard and assigned sessions
// ---------------------------------------------------------------------
export async function listTrainerSessionsCore(
  client: SupabaseClient,
): Promise<ActionResult<readonly TrainerSessionSummaryDto[]>> {
  const identity = await requireRole(client, "trainer");
  if (identity.outcome !== "success") return identity;

  const sessions = await listAssignedSessions(client);
  const out: TrainerSessionSummaryDto[] = [];
  for (const session of sessions) {
    const { data: modules } = await client
      .from("class_modules")
      .select("id, title, class_grade_id")
      .eq("id", session.class_module_id);
    const moduleRow = (modules?.[0] ?? null) as { title: string; class_grade_id: string } | null;
    let grade = "";
    if (moduleRow) {
      const { data: grades } = await client
        .from("class_grades")
        .select("id, display_name")
        .eq("id", moduleRow.class_grade_id);
      grade = ((grades?.[0] as { display_name?: string } | undefined)?.display_name) ?? "";
    }
    const students = await listEnrolledStudents(client, session.class_module_id);
    const counts: Partial<Record<ReportStatus | "no_report", number>> = {};
    for (const student of students) {
      const state = await workingState(client, session.id, student.studentId);
      const key: ReportStatus | "no_report" = state ? state.status : "no_report";
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
  const { data: prior } = await client
    .from("class_sessions")
    .select("id, session_date")
    .eq("class_module_id", session.class_module_id)
    .lt("session_date", session.session_date)
    .order("session_date", { ascending: false })
    .limit(1);
  const priorSessionId = ((prior?.[0] as { id?: string } | undefined)?.id) ?? null;

  const { data: attendance } = await client
    .from("attendance")
    .select("student_id, status")
    .eq("class_session_id", sessionId);
  const attendanceOf = new Map(
    ((attendance ?? []) as Array<{ student_id: string; status: string }>).map((a) => [a.student_id, a.status]),
  );

  const students = await listEnrolledStudents(client, session.class_module_id);
  const out: RosterEntryDto[] = [];
  for (const student of students) {
    const state = await workingState(client, sessionId, student.studentId);
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
      reportState: state ? state.status : "no_report",
      reportId: state ? state.report_id : null,
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

  const { data: students } = await client.from("students").select("id, full_name").eq("id", studentId);
  const displayName = ((students?.[0] as { full_name?: string } | undefined)?.full_name) ?? "Student";

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

  const sessions = await listAssignedSessions(client);
  const out: ReturnedReportQueueItemDto[] = [];
  for (const session of sessions) {
    const students = await listEnrolledStudents(client, session.class_module_id);
    for (const student of students) {
      const state = await workingState(client, session.id, student.studentId);
      if (!state || state.status !== "needs_edit" || !state.open_correction_request_id) continue;
      out.push({
        reportId: state.report_id,
        sessionId: session.id,
        studentId: student.studentId,
        studentDisplayName: student.displayName,
        sessionDate: session.session_date,
        correction: {
          id: state.open_correction_request_id,
          issueScope: state.open_correction_issue_scope,
          ...(state.open_correction_dimension_code ? { dimensionCode: state.open_correction_dimension_code } : {}),
          status: "open",
          reason: state.open_correction_reason ?? undefined,
        },
      });
    }
  }
  return { outcome: "success", data: out };
}
