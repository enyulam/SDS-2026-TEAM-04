"use server";

/**
 * F16-C — the PARTICIPANT ADAPTER action surface.
 *
 * This is the only thing `lib/frontend/adapters/real-participant-port.ts`
 * talks to. Every function here:
 *
 *  - is a Server Action bound to `createRequestSupabaseClient()`, so the call
 *    carries the CALLER'S OWN credential (`authenticated` role, resolving
 *    `auth.uid()`) and every predicate is re-derived inside the database on
 *    every request;
 *  - NEVER imports `server/platform/supabase/elevated.ts`. The service-role
 *    client is not reachable from any participant path, and T7I-40's scan
 *    proves it for the whole `server/` tree;
 *  - adds NO authority of its own. No role query parameter, header, cookie
 *    claim or route value is read anywhere in this file;
 *  - resolves the three REPORT-KEYED reads through the governed resolver
 *    `report_resolve_context` (R-22). The client supplies a report id and
 *    nothing else — never a session id, never a student id — so a caller
 *    cannot pair a report it may read with a session or student it may not.
 *
 * LIFECYCLE. No transition is decided here. TypeScript only ROUTES on
 * RPC-returned state (choosing which governed RPC to call next) and then
 * VERIFIES that the state the database reported is the one the frontend
 * contract's literal type promises; when it is not, the caller gets a
 * non-disclosing non-success outcome rather than an asserted status.
 * Trainer approval publishes nothing; AI approves, submits and publishes
 * nothing; management edits wording only; the parent surface reads the
 * submitted canonical version only.
 *
 * NON-DISCLOSURE. Every denial collapses to `unauthorized` or `unavailable`
 * exactly as the underlying cores and RPCs already define them. Nothing here
 * distinguishes "no such report" from "not permitted", and no message
 * interpolates row content.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ActionResult } from "@/server/contracts/action-result";
import { createRequestSupabaseClient } from "@/server/platform/supabase/request";
import {
  readMaybeRow,
  readRows,
  type QueryOutcome,
} from "@/server/platform/query-diagnostics";
import { resolveSessionIdentity, toSessionUserDto } from "@/server/modules/identity-access/session-core";
import {
  FRAMEWORK_DIMENSIONS,
  RUBRIC_ANCHORS,
  isDimensionCode,
  isRatingLevel,
} from "@/server/modules/framework/dimensions";
import { deriveSessionEligibility } from "@/lib/schedule/session-eligibility";
import { resolveReportContextCore } from "@/server/modules/report-workflow/context-resolver";
import {
  type CorrectionIssueScope,
  type WorkingReportRow,
} from "@/server/modules/report-workflow/rpc-types";
import {
  getSessionRosterCore,
  getTrainerWorkingReportCore,
  listReturnedReportsCore,
  listTrainerSessionsCore,
} from "@/server/modules/report-workflow/trainer-projections";
import {
  createManagementClassCore,
  readManagementClassForEditCore,
  readManagementClassOverviewCore,
  updateManagementClassCore,
  getManagementRatingsCore,
  getManagementReviewCandidateCore,
  listManagementClassesCore,
  readManagementScheduleCore,
  listManagementCorrectionTrackingCore,
  listManagementPendingReviewCore,
  listManagementSubmittedCore,
  readManagementAddClassOptionsCore,
} from "@/server/modules/management-view/projections";
import { createElevatedSupabaseClient } from "@/server/platform/supabase/elevated";
import {
  listEvidenceCore as listEvidenceForParentCore,
  mintEvidenceViewUrlCore,
  createEvidenceUploadTicketCore,
  confirmEvidenceAttachCore,
  removeEvidenceCore,
} from "@/server/modules/evidence/projections";
import {
  getCanonicalReportCore,
  getParentAvailabilityCore,
  listParentReportsCore,
} from "@/server/modules/parent-view/projections";
import {
  getTrainerObservationCore,
  saveObservationCore,
  type TrainerObservationDto,
} from "@/server/modules/observation/core";
import { setAttendanceStatusCore } from "@/server/modules/attendance/core";
import {
  managementApproveAndSubmitCore,
  managementEditWordingCore,
  managementReturnToTrainerCore,
  saveTrainerEditCore,
  trainerApproveCore,
  updateTrainerChecklistCore,
  saveFollowUpNotesCore,
} from "@/server/modules/report-workflow/core";
import { requestDraft as requestDraftAction } from "@/server/modules/report-workflow/actions";
import type {
  AdapterAssessmentDraftDto,
  AdapterAvailabilityStateDto,
  AdapterCanonicalReportDto,
  AdapterCorrectionRequestDto,
  AdapterDimensionCode,
  AdapterDimensionDto,
  AdapterDraftGenerationContextDto,
  AdapterIssueScope,
  AdapterManagementApproveAndSubmitInput,
  AdapterManagementApproveAndSubmitSuccess,
  AdapterAddClassOptionsDto,
  AdapterClassEditDto,
  AdapterClassOverviewDto,
  AdapterClassUpdateOutcomeDto,
  AdapterUpdateClassInput,
  AdapterClassCreationOutcomeDto,
  AdapterCreateClassInput,
  AdapterManagementClassListDto,
  AdapterManagementScheduleDto,
  AdapterManagementEditWordingInput,
  AdapterManagementEditWordingSuccess,
  AdapterManagementQueueRowDto,
  AdapterManagementReturnToTrainerInput,
  AdapterManagementReturnToTrainerSuccess,
  AdapterManagementReviewDto,
  AdapterParentReportListItemDto,
  AdapterRatingLevel,
  AdapterReportStatus,
  AdapterRequestDraftInput,
  AdapterRequestDraftSuccess,
  AdapterReturnedReportQueueItemDto,
  AdapterRosterEntryDto,
  AdapterSaveObservationInput,
  AdapterSaveObservationSuccess,
  AdapterSaveTrainerEditInput,
  AdapterSaveTrainerEditSuccess,
  AdapterSessionUserDto,
  AdapterSetAttendanceInput,
  AdapterSetAttendanceSuccess,
  AdapterTrainerApproveInput,
  AdapterTrainerApproveSuccess,
  AdapterTrainerSessionSummaryDto,
  AdapterTrainerWorkingReportDto,
  AdapterUpdateTrainerChecklistInput,
  AdapterSaveFollowUpNotesInput,
  AdapterEvidenceUploadTicketDto,
  AdapterEvidenceAttachSuccess,
  AdapterReportEvidenceClipDto,
} from "@/server/modules/integration-adapter/adapter-dtos";

// ---------------------------------------------------------------------
// internal helpers (not exported — a "use server" module may export only
// async functions, and these must never become a client-callable endpoint)
// ---------------------------------------------------------------------

/**
 * DB `assessment_fact` -> frontend `derived_assessment_fact`. The two
 * vocabularies are both ratified and deliberately spelled differently; the
 * translation lives here and nowhere else.
 */
function scopeToUi(scope: CorrectionIssueScope): AdapterIssueScope {
  return scope === "assessment_fact" ? "derived_assessment_fact" : scope;
}

function scopeToDb(scope: AdapterIssueScope): CorrectionIssueScope {
  return scope === "derived_assessment_fact" ? "assessment_fact" : scope;
}

function correctionToUi(correction: {
  readonly id: string;
  readonly issueScope: CorrectionIssueScope;
  readonly dimensionCode?: string;
  readonly status: "open" | "resolved";
  readonly reason?: string;
}): AdapterCorrectionRequestDto {
  return {
    id: correction.id,
    issueScope: scopeToUi(correction.issueScope),
    // The dimension is carried only when the database's value is one of the
    // ratified nine. An unrecognised code is DROPPED, never forwarded.
    ...(correction.dimensionCode && isDimensionCode(correction.dimensionCode)
      ? { dimensionCode: correction.dimensionCode as AdapterDimensionCode }
      : {}),
    status: correction.status,
    ...(correction.reason !== undefined ? { reason: correction.reason } : {}),
  };
}

/**
 * ⛔ A REJECTED READ IS NEVER "NO WORKING REPORT", AND NEVER "THE CORRECTION
 * IS RESOLVED".
 *
 * This returned `null` for a rejection and for a genuine absence alike. Four
 * of its six callers already mapped `null` to `unavailable`, so they were
 * safe by accident; the two that did not were the consequential ones:
 *
 * - `adapterGetAssessmentDraft` read `null` as `reportId: null`, so a
 *   rejection removed the trainer's path onward from the assessment surface.
 * - `adapterSaveTrainerEdit` computed
 *   `correctionResolved: … (after === null || …)` under a comment reading
 *   *"Observed, not asserted"*. ⚠️ **A REJECTED READ WAS THEREFORE REPORTED
 *   AS A RESOLVED GOVERNED CORRECTION REQUEST** — the one thing that comment
 *   promised could not happen.
 */
async function readWorking(
  client: SupabaseClient,
  sessionId: string,
  studentId: string,
): Promise<QueryOutcome<WorkingReportRow | null>> {
  return readMaybeRow<WorkingReportRow>("readWorking:report_get_working", () =>
    client.rpc("report_get_working", {
      p_class_session_id: sessionId,
      p_student_id: studentId,
    }),
  );
}

/**
 * Both helpers return `null` — an EXPLICIT "not read" marker — for a failed
 * read, a denied read and a zero-row read alike, so a caller can tell those
 * apart from a genuine value. Corrected at F16-C1: they used to collapse the
 * failure into `""` / `"Student"` inside the helper, which made a masked
 * failure indistinguishable from real data at every call site.
 *
 * The two DTO fields these feed (`sessionDate`, `studentDisplayName`) are
 * non-nullable `string` in the ratified adapter contract (`adapter-dtos.ts`)
 * and in its frontend mirror, so the caller must still choose a display
 * fallback at the boundary; the substitution is now VISIBLE at that boundary
 * rather than hidden here. Carrying the distinction all the way to the surface
 * requires a DTO contract change and is deliberately not made here.
 */
/*
 * ⚠️ THESE TWO KEEP THEIR `null` CONTRACT DELIBERATELY, and it is not the
 * defect the sweep removed elsewhere. The comment above records the ratified
 * F16-C1 design: `null` is an explicit "not read" marker, and the display
 * substitution happens ONCE, VISIBLY, at the boundary — carrying the
 * distinction further would need a DTO contract change that is out of scope.
 *
 * ⛔ What WAS missing is that a rejection reached that boundary having named
 * nothing. `readRows` now decides the cases, so the cause is recorded on the
 * server, while the returned shape and every caller stay exactly as ratified.
 * ▶ The boundary did not move; only the silence was removed.
 */
async function readSessionDate(
  client: SupabaseClient,
  sessionId: string,
): Promise<string | null> {
  const rows = await readRows<{ session_date?: string }>(
    "readSessionDate:class_sessions",
    () => client.from("class_sessions").select("id, session_date").eq("id", sessionId),
  );
  if (!rows.ok) return null;
  return rows.rows[0]?.session_date ?? null;
}

async function readStudentName(
  client: SupabaseClient,
  studentId: string,
): Promise<string | null> {
  const rows = await readRows<{ full_name?: string }>(
    "readStudentName:students",
    () => client.from("students").select("id, full_name").eq("id", studentId),
  );
  if (!rows.ok) return null;
  return rows.rows[0]?.full_name ?? null;
}

/**
 * The single, explicit place where an unreadable name/date becomes display
 * text. `null` here means "not read", never "this is the value".
 */
const UNREAD_STUDENT_NAME = "Student";
const UNREAD_SESSION_DATE = "";

/**
 * The governed report-id -> (session, student) translation. The ONLY input is
 * the report identifier plus the caller's live session; a zero-row answer is
 * the single non-disclosing denial for every reason at once.
 */
async function resolveContext(
  client: SupabaseClient,
  reportId: string,
): Promise<ActionResult<{ readonly sessionId: string; readonly studentId: string }>> {
  return resolveReportContextCore(client, reportId);
}

// ---------------------------------------------------------------------
// identity
// ---------------------------------------------------------------------

export async function adapterGetSessionUser(): Promise<ActionResult<AdapterSessionUserDto>> {
  const client = await createRequestSupabaseClient();
  const identity = await resolveSessionIdentity(client);
  if (identity.outcome !== "success") return identity;
  return { outcome: "success", data: toSessionUserDto(identity.data) };
}

// ---------------------------------------------------------------------
// framework constants
// ---------------------------------------------------------------------

/**
 * The nine governed dimensions and their four ratified rubric anchors. These
 * are FRAMEWORK CONSTANTS (spec §3.1/§3.3), read from the backend's own
 * `server/modules/framework/dimensions.ts` so the participant surface and the
 * AI skeleton are grounded in one declaration. Deliberately NOT read from
 * `lib/frontend/fixtures/**` — no participant path may reach the fixture.
 */
export async function adapterGetDimensions(): Promise<ActionResult<readonly AdapterDimensionDto[]>> {
  return {
    outcome: "success",
    data: FRAMEWORK_DIMENSIONS.map((dimension) => ({
      dimensionCode: dimension.code,
      group: dimension.group,
      displayName: dimension.displayName,
      focus: dimension.focus,
      ordinal: dimension.ordinal,
      rubricAnchors: RUBRIC_ANCHORS,
    })),
  };
}

// ---------------------------------------------------------------------
// trainer reads
// ---------------------------------------------------------------------

export async function adapterListTrainerSessions(): Promise<
  ActionResult<readonly AdapterTrainerSessionSummaryDto[]>
> {
  const client = await createRequestSupabaseClient();
  const result = await listTrainerSessionsCore(client);
  if (result.outcome !== "success") return result;
  return {
    outcome: "success",
    data: result.data.map((session) => ({
      sessionId: session.sessionId,
      moduleName: session.moduleName,
      classGrade: session.classGrade,
      date: session.date,
      // `starts_at`/`ends_at` are nullable in the schema. A missing clock time
      // is reported as the empty string, never as an invented time.
      startTime: session.startTime ?? "",
      endTime: session.endTime ?? "",
      studentCount: session.studentCount,
      countsByReportState: session.countsByReportState as Readonly<Record<string, number>>,
      // Hero Phase 3. Carried through as NULL, not coerced to "" like the
      // clock times above: those are a value the frame always draws, and an
      // empty string is how this boundary already reports "no time recorded".
      // Room and trainer are OMITTED ROWS when absent, and the renderer needs
      // to tell "not recorded" from "recorded as empty" to omit correctly.
      room: session.room,
      trainerDisplayName: session.trainerDisplayName,
      lessonNumber: session.lessonNumber,
      lessonTitle: session.lessonTitle,
    })),
  };
}

export async function adapterGetSessionRoster(
  sessionId: string,
): Promise<ActionResult<readonly AdapterRosterEntryDto[]>> {
  const client = await createRequestSupabaseClient();
  return getSessionRosterCore(client, sessionId);
}

/**
 * C2C-011 — THE ENTRY GATE, RESOLVED SERVER-SIDE, BEFORE ANY DRAFT IS RETURNED.
 *
 * THE DEFECT. The assessment route was fully reachable and fillable by DIRECT
 * URL for an ABSENT learner and for a session whose scheduled start had not
 * been reached. This read applied no attendance and no start condition, so the
 * trainer entered all nine ratings and only then met BC102 / BC104 at save
 * time, rendered as a generic banner. The refusal existed; the designed state
 * did not (spec §15).
 *
 * WHY THE GATE IS HERE AND NOT ONLY IN THE COMPONENT. A component that declines
 * to render is not a boundary: the route is a Server Action away from any
 * caller, and "hiding a control is not authorization" is the same rule that
 * governs every other surface in this project. This action refuses, so a direct
 * URL, a stale tab and a scripted call all get the same answer.
 *
 * THE REASONS ARE THE GOVERNED ONES, VERBATIM. They are the exact strings
 * `mapSqlErrorToResult` already produces for BC102 (attendance) and BC104
 * (scheduled start), so the pre-entry refusal and the post-save refusal read
 * identically and neither invents a new vocabulary. They name the CONDITION and
 * nothing else — no student name, no date, no time, no report state, no
 * existence claim — so the state is non-disclosing.
 *
 * THE SERVER GATES ARE UNTOUCHED. BC017/BC104 and BC102 remain authoritative in
 * the database (ADR-3); this changes when the trainer is offered the
 * instrument, never what the database permits.
 */
async function assessmentEntryRefusal(
  client: SupabaseClient,
  sessionId: string,
  studentId: string,
): Promise<ActionResult<never> | null> {
  // 1. ATTENDANCE. The roster read is itself trainer-scoped and assignment
  //    checked, so an unassigned caller never reaches the attendance value.
  const roster = await getSessionRosterCore(client, sessionId);
  if (roster.outcome !== "success") return roster;
  const entry = roster.data.find((row) => row.studentId === studentId) ?? null;
  if (entry === null || entry.attendanceState === "absent") {
    // A learner who is not on this roster and a learner marked absent get the
    // SAME answer. Distinguishing them would disclose enrolment.
    return {
      outcome: "validation",
      message: "The student is not recorded present for this session.",
      fields: [],
    };
  }

  // 2. SCHEDULED START, against the pinned Asia/Singapore clock the governed
  //    RPCs compare on. A session the caller is not assigned to is not in this
  //    projection at all, so a miss is refused rather than treated as eligible.
  const sessions = await listTrainerSessionsCore(client);
  if (sessions.outcome !== "success") return sessions;
  const session = sessions.data.find((row) => row.sessionId === sessionId) ?? null;
  if (session === null) {
    return { outcome: "unavailable" };
  }
  if (
    deriveSessionEligibility({
      date: session.date,
      startTime: session.startTime ?? "",
    }) === "future"
  ) {
    return {
      outcome: "validation",
      message: "The scheduled session start has not been reached.",
      fields: [],
    };
  }
  return null;
}

export async function adapterGetAssessmentDraft(
  sessionId: string,
  studentId: string,
): Promise<ActionResult<AdapterAssessmentDraftDto>> {
  const client = await createRequestSupabaseClient();
  const refusal = await assessmentEntryRefusal(client, sessionId, studentId);
  if (refusal !== null) return refusal;
  const observation = await getTrainerObservationCore(client, sessionId, studentId);
  if (observation.outcome !== "success") return observation;

  const saved: TrainerObservationDto = observation.data;
  const ratingOf = new Map(saved.ratings.map((entry) => [entry.dimensionCode as string, entry.rating]));
  const working = await readWorking(client, sessionId, studentId);
  // A rejection must not render as "no report yet" — that withdraws the
  // trainer's route onward from a surface that never established it.
  if (!working.ok) return { outcome: "unavailable" };

  return {
    outcome: "success",
    data: {
      // Null, not "", when no report exists yet — see AdapterAssessmentDraftDto.
      reportId: working.rows ? working.rows.report_id : null,
      sessionId,
      studentId,
      studentDisplayName: (await readStudentName(client, studentId)) ?? UNREAD_STUDENT_NAME,
      ratings: FRAMEWORK_DIMENSIONS.map((dimension) => ({
        dimensionCode: dimension.code,
        rating: (ratingOf.get(dimension.code) ?? null) as AdapterRatingLevel | null,
      })),
      notes: saved.observationNotes,
      followUp: saved.followUpNotes,
      observationLockVersion: saved.observationLockVersion ?? 0,
    },
  };
}

export async function adapterGetTrainerWorkingReport(
  reportId: string,
): Promise<ActionResult<AdapterTrainerWorkingReportDto>> {
  const client = await createRequestSupabaseClient();
  const context = await resolveContext(client, reportId);
  if (context.outcome !== "success") return context;

  const report = await getTrainerWorkingReportCore(client, context.data.sessionId, context.data.studentId);
  if (report.outcome !== "success") return report;

  // Both halves of every snapshot must be governed vocabulary or the snapshot
  // is dropped; nothing is coerced into the ratified unions.
  const snapshots = report.data.ratingSnapshots.filter(
    (snapshot) => isDimensionCode(snapshot.dimensionCode) && isRatingLevel(snapshot.rating),
  );
  return {
    outcome: "success",
    data: {
      reportId: report.data.reportId,
      sessionId: report.data.sessionId,
      studentId: report.data.studentId,
      studentDisplayName: report.data.studentDisplayName,
      sessionDate:
        (await readSessionDate(client, report.data.sessionId)) ?? UNREAD_SESSION_DATE,
      status: report.data.status,
      lockVersion: report.data.lockVersion,
      versionId: report.data.versionId,
      revisionNumber: report.data.revisionNumber,
      panels: report.data.panels,
      contentHash: report.data.contentHash,
      checklist: report.data.checklist,
      ratingSnapshots: snapshots.map((snapshot) => ({
        dimensionCode: snapshot.dimensionCode as AdapterDimensionCode,
        displayName: snapshot.displayName,
        rating: snapshot.rating as AdapterRatingLevel,
      })),
      canonicalPointer: report.data.canonicalPointer,
      coachNotes: report.data.coachNotes,
      ...(report.data.openCorrection
        ? { openCorrection: correctionToUi(report.data.openCorrection) }
        : {}),
    },
  };
}

export async function adapterGetDraftGenerationContext(
  reportId: string,
): Promise<ActionResult<AdapterDraftGenerationContextDto>> {
  const client = await createRequestSupabaseClient();
  const context = await resolveContext(client, reportId);
  if (context.outcome !== "success") return context;

  const workingOutcome = await readWorking(client, context.data.sessionId, context.data.studentId);
  // Rejection and genuine absence both stay `unavailable` here — the surface
  // is non-disclosing either way — but the cause is now NAMED on the server.
  if (!workingOutcome.ok || !workingOutcome.rows) return { outcome: "unavailable" };
  const working = workingOutcome.rows;
  // The generation surface exists for exactly two lifecycle positions. Any
  // other position is reported as `unavailable` rather than coerced into one
  // of the two — TypeScript never restates a status the database did not give.
  if (working.status !== "observation_saved" && working.status !== "draft_ready") {
    return { outcome: "unavailable" };
  }

  const observation = await getTrainerObservationCore(client, context.data.sessionId, context.data.studentId);
  if (observation.outcome !== "success") return observation;
  if (!observation.data.observationExists || observation.data.observationLockVersion === null) {
    return { outcome: "unavailable" };
  }

  return {
    outcome: "success",
    data: {
      reportId: working.report_id,
      studentDisplayName:
        (await readStudentName(client, context.data.studentId)) ?? UNREAD_STUDENT_NAME,
      observationLockVersion: observation.data.observationLockVersion,
      status: working.status,
    },
  };
}

export async function adapterListReturnedReports(): Promise<
  ActionResult<readonly AdapterReturnedReportQueueItemDto[]>
> {
  const client = await createRequestSupabaseClient();
  const result = await listReturnedReportsCore(client);
  if (result.outcome !== "success") return result;
  return {
    outcome: "success",
    data: result.data.map((item) => ({
      reportId: item.reportId,
      sessionId: item.sessionId,
      studentId: item.studentId,
      studentDisplayName: item.studentDisplayName,
      sessionDate: item.sessionDate,
      correction: correctionToUi(item.correction),
    })),
  };
}

// ---------------------------------------------------------------------
// management reads
// ---------------------------------------------------------------------

/**
 * `ManagementQueueRowDto.status` on the frontend is the three-value union
 * `trainer_approved | needs_edit | draft_ready`. The governed projections
 * return the full `report_status` enum, so a row outside the three is DROPPED
 * rather than coerced. No management surface has ever shown a fourth status,
 * and inventing one here would be TypeScript asserting a lifecycle position.
 */
function narrowQueueRows(
  rows: ReadonlyArray<{
    readonly reportId: string;
    readonly sessionId: string;
    readonly studentId: string;
    readonly studentDisplayName: string;
    readonly sessionDate: string;
    readonly status: string;
    readonly openCorrectionScope?: CorrectionIssueScope;
    readonly openCorrectionStatus?: "open" | "resolved";
    readonly openCorrectionReason?: string;
    readonly submittedAt?: string;
    // Hero chain Phase 9 — session identity and scheduling context only.
    readonly classModuleId?: string;
    readonly classGradeLabel?: string;
    readonly classModuleTitle?: string;
    readonly lessonNumber?: number;
    readonly lessonTitle?: string;
    readonly trainerDisplayName?: string;
  }>,
  // C2C-004: the submitted-list projection legitimately reports `submitted`,
  // and nothing else does. The allow-list is passed in rather than widened
  // globally, so a pending-review or correction-tracking row that somehow
  // arrived at `submitted` would still be DROPPED rather than rendered.
  allowed: ReadonlySet<string> = new Set(["trainer_approved", "needs_edit", "draft_ready"]),
): readonly AdapterManagementQueueRowDto[] {
  return rows
    .filter((row) => allowed.has(row.status))
    .map((row) => ({
      reportId: row.reportId,
      sessionId: row.sessionId,
      studentId: row.studentId,
      studentDisplayName: row.studentDisplayName,
      sessionDate: row.sessionDate,
      status: row.status as AdapterManagementQueueRowDto["status"],
      ...(row.openCorrectionScope ? { openCorrectionScope: scopeToUi(row.openCorrectionScope) } : {}),
      ...(row.openCorrectionStatus ? { openCorrectionStatus: row.openCorrectionStatus } : {}),
      ...(row.openCorrectionReason !== undefined
        ? { openCorrectionReason: row.openCorrectionReason }
        : {}),
      ...(row.submittedAt !== undefined ? { submittedAt: row.submittedAt } : {}),
      /*
       * Hero chain Phase 9. ⚠️ Listed EXPLICITLY, one field at a time, like
       * every field above: this mapper is an allow-list, so a field the
       * projection grows later does NOT reach the client until someone names
       * it here. That property is why the §5.5 exclusions cannot leak by
       * accident, and spreading `...row` to save six lines would destroy it.
       */
      ...(row.classModuleId !== undefined ? { classModuleId: row.classModuleId } : {}),
      ...(row.classGradeLabel !== undefined ? { classGradeLabel: row.classGradeLabel } : {}),
      ...(row.classModuleTitle !== undefined ? { classModuleTitle: row.classModuleTitle } : {}),
      ...(row.lessonNumber !== undefined ? { lessonNumber: row.lessonNumber } : {}),
      ...(row.lessonTitle !== undefined ? { lessonTitle: row.lessonTitle } : {}),
      ...(row.trainerDisplayName !== undefined
        ? { trainerDisplayName: row.trainerDisplayName }
        : {}),
    }));
}

export async function adapterListManagementPendingReviews(): Promise<
  ActionResult<readonly AdapterManagementQueueRowDto[]>
> {
  const client = await createRequestSupabaseClient();
  const result = await listManagementPendingReviewCore(client);
  if (result.outcome !== "success") return result;
  return { outcome: "success", data: narrowQueueRows(result.data) };
}

export async function adapterListManagementCorrectionTracking(): Promise<
  ActionResult<readonly AdapterManagementQueueRowDto[]>
> {
  const client = await createRequestSupabaseClient();
  const result = await listManagementCorrectionTrackingCore(client);
  if (result.outcome !== "success") return result;
  // `report_list_management_corrections` legitimately reports rows at
  // `needs_edit` (returned, awaiting the trainer), `draft_ready` (the trainer
  // has produced a correction version) and `trainer_approved` (re-approved and
  // back in the queue). All three survive `narrowQueueRows`.
  return { outcome: "success", data: narrowQueueRows(result.data) };
}

/**
 * C2C-004 — the Management "Approved" list.
 *
 * The centre, the authority and the status boundary all live inside
 * `report_list_management_submitted`; this action supplies none of them and
 * cannot. The narrowing below admits `submitted` and nothing else, so if the
 * boundary ever returned another status the row would be DROPPED here rather
 * than rendered as an Approved report.
 */
export async function adapterListManagementSubmittedReports(): Promise<
  ActionResult<readonly AdapterManagementQueueRowDto[]>
> {
  const client = await createRequestSupabaseClient();
  const result = await listManagementSubmittedCore(client);
  if (result.outcome !== "success") return result;
  return { outcome: "success", data: narrowQueueRows(result.data, new Set(["submitted"])) };
}

/**
 * P2-1 — screen `12` Management Classes.
 *
 * ⚠️ THE MAPPER IS AN ALLOW-LIST, ONE FIELD AT A TIME, exactly like
 * `narrowQueueRows` above and for the same reason: a field the projection
 * grows later does NOT reach the client until someone names it here.
 * Spreading `...row` to save eight lines would destroy that property, and it
 * is the property that keeps a rating out of a LIST surface (`C-9`) by
 * construction rather than by review.
 */
export async function adapterListManagementClasses(): Promise<
  ActionResult<AdapterManagementClassListDto>
> {
  const client = await createRequestSupabaseClient();
  const result = await listManagementClassesCore(client);
  if (result.outcome !== "success") return result;
  return {
    outcome: "success",
    data: {
      grades: result.data.grades.map((grade) => ({
        code: grade.code,
        displayName: grade.displayName,
        sortOrder: grade.sortOrder,
      })),
      classes: result.data.classes.map((row) => ({
        classModuleId: row.classModuleId,
        title: row.title,
        classGradeCode: row.classGradeCode,
        classGradeLabel: row.classGradeLabel,
        classGradeSortOrder: row.classGradeSortOrder,
        activeStudentCount: row.activeStudentCount,
        trainerDisplayNames: [...row.trainerDisplayNames],
      })),
    },
  };
}

/**
 * P2-2 — the choices screen `26` Add Class offers.
 *
 * Same allow-list mapper discipline as `adapterListManagementClasses`: one
 * field at a time, so a column added to `terms` or `class_grades` later does
 * NOT reach the client until someone names it here.
 */
export async function adapterReadAddClassOptions(): Promise<
  ActionResult<AdapterAddClassOptionsDto>
> {
  const client = await createRequestSupabaseClient();
  const result = await readManagementAddClassOptionsCore(client);
  if (result.outcome !== "success") return result;
  return {
    outcome: "success",
    data: {
      grades: result.data.grades.map((grade) => ({
        classGradeId: grade.classGradeId,
        code: grade.code,
        displayName: grade.displayName,
        sortOrder: grade.sortOrder,
      })),
      terms: result.data.terms.map((term) => ({
        termId: term.termId,
        label: term.label,
        startsOn: term.startsOn,
        endsOn: term.endsOn,
      })),
      trainers: result.data.trainers.map((trainer) => ({
        trainerMembershipId: trainer.trainerMembershipId,
        displayName: trainer.displayName,
      })),
    },
  };
}

/**
 * P2-2 — the governed create.
 *
 * ⛔ THE INPUT IS RE-BUILT FIELD BY FIELD, NEVER FORWARDED. A caller cannot
 * smuggle a `classCode`, a `capacity`, a `programme`, a `lessonNumber` or a
 * TA slot through this action, because nothing here would carry it — the
 * same construction that keeps a rating off a list surface, applied to a
 * write. ⚠️ `trainerMembershipId` IS carried (`P2-2b`), and it is the RPC —
 * not this mapper — that refuses a non-trainer, a deactivated trainer or a
 * membership from another centre.
 *
 * ⚠️ `weekdays` IS SANITISED TO A SORTED, DE-DUPLICATED SET OF 0..6. A
 * repeated day would otherwise generate the same date twice, and
 * `class_sessions` has NO unique constraint on (module, date) — measured, not
 * assumed — so duplicates really would be representable.
 */
export async function adapterCreateManagementClass(
  input: AdapterCreateClassInput,
): Promise<ActionResult<AdapterClassCreationOutcomeDto>> {
  const client = await createRequestSupabaseClient();
  const result = await createManagementClassCore(client, {
    classGradeId: input.classGradeId,
    title: input.title,
    termId: input.termId,
    room: input.room,
    startTime: input.startTime,
    endTime: input.endTime,
    weekdays: [...new Set(input.weekdays.filter((d) => Number.isInteger(d) && d >= 0 && d <= 6))].sort(
      (a, b) => a - b,
    ),
    trainerMembershipId: input.trainerMembershipId,
  });
  if (result.outcome !== "success") return result;
  return {
    outcome: "success",
    data: {
      classModuleId: result.data.classModuleId,
      sessionsRequested: result.data.sessionsRequested,
      sessionsCreated: result.data.sessionsCreated,
      sessionsAssigned: result.data.sessionsAssigned,
      reason: result.data.reason,
    },
  };
}

/**
 * P2-4 — screen `13` Class Overview. Allow-list mapper, one field at a time,
 * so a column added to any underlying relation later does NOT reach the client
 * until someone names it here.
 */
/**
 * `P2-5` — screen `25` Management Schedule.
 *
 * ⚠️ SAME ALLOW-LIST MAPPER DISCIPLINE AS EVERY OTHER READ HERE: one field at
 * a time, so a column added to `class_sessions` later cannot reach the client
 * until somebody names it on this list. ⛔ That is what keeps a future
 * `session_type` from arriving on a Showcase-barred surface by default.
 */
export async function adapterReadManagementSchedule(
  fromDate: string,
  toDate: string,
): Promise<ActionResult<AdapterManagementScheduleDto>> {
  const client = await createRequestSupabaseClient();
  const result = await readManagementScheduleCore(client, fromDate, toDate);
  if (result.outcome !== "success") return result;
  return {
    outcome: "success",
    data: {
      sessions: result.data.sessions.map((row) => ({
        classSessionId: row.classSessionId,
        classModuleId: row.classModuleId,
        sessionDate: row.sessionDate,
        startTime: row.startTime,
        endTime: row.endTime,
        room: row.room,
        moduleTitle: row.moduleTitle,
        classGradeLabel: row.classGradeLabel,
        trainerDisplayNames: row.trainerDisplayNames,
      })),
      monthsWithSessions: result.data.monthsWithSessions,
    },
  };
}

export async function adapterReadClassOverview(
  classModuleId: string,
): Promise<ActionResult<AdapterClassOverviewDto>> {
  const client = await createRequestSupabaseClient();
  const result = await readManagementClassOverviewCore(client, classModuleId);
  if (result.outcome !== "success") return result;
  const { header, rows, sessions, health, verdict } = result.data;
  return {
    outcome: "success",
    data: {
      // ⚠️ ONE FIELD AT A TIME, like every other mapper here: a column added
      // to `class_modules` or `attendance` later cannot reach the client
      // until somebody names it on this list.
      header:
        header === null
          ? null
          : {
              classModuleId: header.classModuleId,
              title: header.title,
              classGradeLabel: header.classGradeLabel,
              isActive: header.isActive,
              meetingDays: header.meetingDays,
              startTime: header.startTime,
              endTime: header.endTime,
              room: header.room,
              learnerCount: header.learnerCount,
              attendancePercent: header.attendancePercent,
              trainerDisplayNames: header.trainerDisplayNames,
            },
      rows: rows.map((row) => ({
        classSessionId: row.classSessionId,
        sessionDate: row.sessionDate,
        lessonNumber: row.lessonNumber,
        lessonTitle: row.lessonTitle,
        studentId: row.studentId,
        studentDisplayName: row.studentDisplayName,
        reportId: row.reportId,
        reportState: row.reportState,
        evidenceCount: row.evidenceCount,
      })),
      sessions: sessions.map((session) => ({
        classSessionId: session.classSessionId,
        sessionDate: session.sessionDate,
        lessonNumber: session.lessonNumber,
        lessonTitle: session.lessonTitle,
        reportedCount: session.reportedCount,
        submittedCount: session.submittedCount,
        learnerCount: session.learnerCount,
      })),
      // ⚠️ THE VERDICT AND THE COUNTS TRAVEL TOGETHER OR NOT AT ALL. A
      // health block carrying counts but no ratified sentence, or a sentence
      // with no counts behind it, would each be a half-answer the surface
      // would have to guess about.
      health: health === null || verdict === null ? null : {
        status: verdict.status,
        action: verdict.action,
        pendingReports: health.pendingReports,
        evidenceMissing: health.evidenceMissing,
        submittedReports: health.submittedReports,
        totalReports: health.totalReports,
        mainFollowUpArea: health.mainFollowUpArea,
      },
    },
  };
}

/**
 * P2-3 — screen `27` Edit Class: the read. Same allow-list mapper, one field
 * at a time, so a column added to `class_sessions` later does NOT reach the
 * client until someone names it here.
 */
export async function adapterReadClassForEdit(
  classModuleId: string,
): Promise<ActionResult<AdapterClassEditDto>> {
  const client = await createRequestSupabaseClient();
  const result = await readManagementClassForEditCore(client, classModuleId);
  if (result.outcome !== "success") return result;
  return {
    outcome: "success",
    data: {
      classModuleId: result.data.classModuleId,
      title: result.data.title,
      classGradeId: result.data.classGradeId,
      trainerMembershipId: result.data.trainerMembershipId,
      sessions: result.data.sessions.map((session) => ({
        classSessionId: session.classSessionId,
        sessionDate: session.sessionDate,
        startTime: session.startTime,
        endTime: session.endTime,
        room: session.room,
        termId: session.termId,
        trainerDisplayName: session.trainerDisplayName,
      })),
    },
  };
}

/**
 * P2-3 — the governed edit.
 *
 * ⛔ THE INPUT IS RE-BUILT FIELD BY FIELD. There is no field here that could
 * carry a session removal, an unassign, a class code, a capacity or a
 * programme — the three refusals are held by the TYPE, not only by prose.
 */
export async function adapterUpdateManagementClass(
  input: AdapterUpdateClassInput,
): Promise<ActionResult<AdapterClassUpdateOutcomeDto>> {
  const client = await createRequestSupabaseClient();
  const result = await updateManagementClassCore(client, {
    classModuleId: input.classModuleId,
    classGradeId: input.classGradeId,
    title: input.title,
    termId: input.termId,
    room: input.room,
    startTime: input.startTime,
    endTime: input.endTime,
    trainerMembershipId: input.trainerMembershipId,
  });
  if (result.outcome !== "success") return result;
  return {
    outcome: "success",
    data: {
      moduleChanged: result.data.moduleChanged,
      sessionsChanged: result.data.sessionsChanged,
      sessionsTotal: result.data.sessionsTotal,
      trainerChanged: result.data.trainerChanged,
      reason: result.data.reason,
    },
  };
}

/**
 * C2C-004 — the canonical SUBMITTED report an Approved row opens.
 *
 * It goes through the SAME ratified status-gated read the final-review
 * surface uses (RPC-15). No boundary is widened: RPC-15 already returns the
 * published panels at `submitted`, with a NULL wording hash and no candidate
 * version id, and this action refuses anything that is not `submitted` with a
 * publication timestamp. The shape returned is the CANONICAL report shape —
 * the four parent-facing panels and the publication time — so no management
 * mutation control can be built on top of it by accident.
 */
export async function adapterGetManagementSubmittedReport(
  reportId: string,
): Promise<ActionResult<AdapterCanonicalReportDto>> {
  const client = await createRequestSupabaseClient();
  const context = await resolveContext(client, reportId);
  if (context.outcome !== "success") return context;

  const review = await getManagementReviewCandidateCore(
    client,
    context.data.sessionId,
    context.data.studentId,
  );
  if (review.outcome !== "success") return review;

  // Anything other than a published report is the same non-disclosing
  // `unavailable` the zero-row case already produces. In particular a
  // `trainer_approved` candidate is NOT served here: that is the final-review
  // surface's read, and conflating the two would let a preapproval candidate
  // render as a published report.
  if (review.data.status !== "submitted" || review.data.submittedAt === null) {
    return { outcome: "unavailable" };
  }

  return {
    outcome: "success",
    // ⚠️ MANAGEMENT context is NOT populated here, deliberately. This is the
    // management submitted-report read; its context row (class, trainer,
    // lesson on screen `19`) is hero Phase 10's deliverable and has not been
    // authorized yet. `null` renders as omitted rows — the same treatment a
    // NULL lesson gets — rather than as fabricated or back-derived values.
    // ⛔ P1-5: the MANAGEMENT submitted-report read carries NO clip. D-5 gives
    // management the clip on its REVIEW surface, before Approve & Submit —
    // this is the after-the-fact published view, and widening it here would
    // add a media read nothing asked for. Empty, not omitted, so the DTO
    // stays one shape across every caller.
    data: {
      panels: review.data.panels,
      submittedAt: review.data.submittedAt,
      context: null,
      evidence: [],
    },
  };
}

export async function adapterGetManagementReview(
  reportId: string,
): Promise<ActionResult<AdapterManagementReviewDto>> {
  const client = await createRequestSupabaseClient();
  const context = await resolveContext(client, reportId);
  if (context.outcome !== "success") return context;

  const review = await getManagementReviewCandidateCore(
    client,
    context.data.sessionId,
    context.data.studentId,
  );
  if (review.outcome !== "success") return review;

  /*
   * RPC-15 is STATUS-GATED and only ever yields a trainer-approved candidate
   * (A-038). Anything else — and any missing render proof — is the same
   * non-disclosing `unavailable` the zero-row case already produces.
   *
   * ⛔ OPERATOR RULING, 2026-08-11 — LEAVE THIS NON-DISCLOSING. DO NOT
   * "IMPROVE" IT.
   *
   * This guard is why the Management wording editor renders a StatePanel
   * instead of an editable form once a report is `submitted`, and why that
   * panel does NOT say "already submitted". It was proposed that naming the
   * reason would be friendlier. **It was ruled against, deliberately:**
   * naming it converts a deliberately INDISTINGUISHABLE outcome into a
   * DISTINGUISHABLE one on an A-038 surface — the same answer must cover a
   * pre-approval status, a submitted report and "no such report".
   *
   * ▶ **The confusion cost is small; the boundary is not.**
   *
   * ⚠️ A later phase reading this as a missing error message and adding one
   * would be reopening a ruled decision, not polishing copy.
   */
  if (review.data.status !== "trainer_approved") return { outcome: "unavailable" };
  if (review.data.lockVersion === null || review.data.versionId === null || review.data.wordingHash === null) {
    return { outcome: "unavailable" };
  }

  /*
   * D-1 / C-9 / C-10 — the nine per-dimension ratings for this REPORT DETAIL
   * surface, READ ONLY.
   *
   * ⚠️ FETCHED ONLY AFTER the status gate above has already admitted this
   * caller, so the ratings read can never widen what the review read
   * refuses. `report_get_management_ratings` applies the SAME gate again in
   * the database — this ordering is defence in depth, not the boundary.
   *
   * ⛔ A FAILED RATINGS READ MAKES THE WHOLE SURFACE UNAVAILABLE. It does
   * NOT fall through to an empty grid: rendering "no ratings" for an
   * assessment that has nine would look entirely normal and would be the
   * Q-7 defect (`a rejected query is not an empty result`) on an A-038
   * surface.
   */
  const ratings = await getManagementRatingsCore(
    client,
    context.data.sessionId,
    context.data.studentId,
  );
  if (ratings.outcome !== "success") return { outcome: "unavailable" };

  return {
    outcome: "success",
    data: {
      ratings: ratings.data.map((r) => ({
        dimensionCode: r.dimensionCode,
        displayName: r.displayName,
        rating: r.rating,
      })),
      status: review.data.status,
      lockVersion: review.data.lockVersion,
      versionId: review.data.versionId,
      panels: review.data.panels,
      wordingHash: review.data.wordingHash,
      ...(review.data.submittedAt ? { submittedAt: review.data.submittedAt } : {}),
      ...(review.data.openCorrectionScope
        ? { openCorrectionScope: scopeToUi(review.data.openCorrectionScope) }
        : {}),
      ...(review.data.openCorrectionStatus
        ? { openCorrectionStatus: review.data.openCorrectionStatus }
        : {}),
    },
  };
}

// ---------------------------------------------------------------------
// parent reads — the submitted canonical narrative and nothing else
// ---------------------------------------------------------------------

export async function adapterGetParentAvailability(): Promise<
  ActionResult<AdapterAvailabilityStateDto>
> {
  return getParentAvailabilityCore(await createRequestSupabaseClient());
}

export async function adapterListParentSubmittedReports(): Promise<
  ActionResult<readonly AdapterParentReportListItemDto[]>
> {
  return listParentReportsCore(await createRequestSupabaseClient());
}

export async function adapterGetCanonicalReport(
  sessionId: string,
  studentId: string,
): Promise<ActionResult<AdapterCanonicalReportDto>> {
  // `report_get_canonical` is itself keyed by the pair and resolves EXCLUSIVELY
  // through `latest_submitted_version_id`, re-deriving the caller's reach on
  // every call. A caller naming a pair it may not read gets zero rows.
  const client = await createRequestSupabaseClient();
  const report = await getCanonicalReportCore(client, sessionId, studentId);
  if (report.outcome !== "success") return report;

  /*
   * ⛔ P1-5. The clip list is read AFTER the canonical read has already
   * admitted this caller, through a function whose parent arm carries the SAME
   * two gates — a live link and a submitted report. Two gates, written to
   * move together (R-C2-6).
   *
   * ⚠️ A FAILED EVIDENCE READ MAKES THE WHOLE REPORT `unavailable`, rather
   * than a report with no clip. An empty list is EXACTLY the shape a refused
   * read would take here, and a parent silently shown "no recording" when one
   * exists is a governance failure wearing a success (Q-7).
   */
  const clips = await listEvidenceForParentCore(client, sessionId, studentId);
  if (clips.outcome !== "success") return { outcome: "unavailable" };

  return { outcome: "success", data: { ...report.data, evidence: clips.data } };
}

// ---------------------------------------------------------------------
// writes
// ---------------------------------------------------------------------

/**
 * The governed Trainer Present/Absent control (A-018, A-026).
 *
 * NOTHING IS DECIDED HERE. `attendance_set_status` is the ONE write path and
 * it owns every gate: the actor must be the single active `trainer`
 * membership in the SESSION'S OWN centre with live session reach re-derived
 * per call — so management (A-034 forbids management touching attendance) and
 * parent are closed by the SAME predicate that authorizes the trainer, and
 * receive the same non-disclosing answer; A-018's Present default is
 * materialized by the COLUMN DEFAULT; `attendance.changed` (registry E4 — the
 * Step 7H registry is NOT extended) is appended in the same transaction; and
 * A-026's governed refusal of a move to `absent` once a version is submitted
 * is enforced there.
 *
 * ⚠️ This action deliberately takes the (session, student) PAIR rather than a
 * report id. The three report-keyed reads resolve their pair server-side
 * because a client-supplied pair could let a caller couple a report it may
 * read with a session it may not. Attendance is not report-keyed at all — it
 * exists BEFORE any report does, and is the lifecycle's first governed write —
 * so there is no report id to resolve from. The pair is safe to accept
 * because it is authorization INPUT, not authorization EVIDENCE: the RPC
 * re-derives the caller's reach to that exact session on every call and
 * answers a caller who names a pair outside it identically to one naming a
 * pair that does not exist.
 */
export async function adapterSetAttendance(
  input: AdapterSetAttendanceInput,
): Promise<ActionResult<AdapterSetAttendanceSuccess>> {
  const client = await createRequestSupabaseClient();
  const result = await setAttendanceStatusCore(client, {
    sessionId: input.sessionId,
    studentId: input.studentId,
    ...(input.expectedStatus !== undefined ? { expectedStatus: input.expectedStatus } : {}),
    newStatus: input.newStatus,
  });
  if (result.outcome !== "success") return result;
  // `attendanceId` is deliberately DROPPED rather than forwarded: the surface
  // has no use for it, and a governed row identifier is not something a
  // participant path hands to the client for free.
  return {
    outcome: "success",
    data: {
      status: result.data.status,
      initialized: result.data.initialized,
      changed: result.data.changed,
    },
  };
}

export async function adapterSaveObservation(
  input: AdapterSaveObservationInput,
): Promise<ActionResult<AdapterSaveObservationSuccess>> {
  const client = await createRequestSupabaseClient();

  // All nine dimensions, each with a governed rating. An unrated dimension is
  // a validation outcome here and again inside the database.
  const ratings: Array<{ dimensionCode: string; rating: string }> = [];
  for (const entry of input.ratings) {
    if (entry.rating === null) {
      return {
        outcome: "validation",
        message: "All nine dimensions must be rated before saving.",
        fields: [{ path: "ratings", message: "All nine dimensions must be rated." }],
      };
    }
    ratings.push({ dimensionCode: entry.dimensionCode, rating: entry.rating });
  }

  // The port carries notes and follow-up only. Chips and the term-evidence
  // note are read back and passed through UNCHANGED so a save through this
  // surface can never silently discard governed data the trainer entered
  // through another one.
  const existing = await getTrainerObservationCore(client, input.sessionId, input.studentId);
  if (existing.outcome !== "success") return existing;
  const prior = existing.data;

  const saved = await saveObservationCore(client, {
    sessionId: input.sessionId,
    studentId: input.studentId,
    ...(prior.observationExists && prior.observationId !== null
      ? {
          expectedObservationId: prior.observationId,
          // The CAS value is the one the CALLER rendered, not the one just
          // read back — that is what makes a concurrent edit lose.
          expectedLockVersion: input.observationLockVersion,
        }
      : {}),
    strengthChips: prior.strengthChips,
    focusChips: prior.focusChips,
    observationNotes: input.notes,
    followUpNotes: input.followUp,
    termEvidenceNotes: prior.termEvidenceNotes,
    ratings,
  });
  if (saved.outcome !== "success") return saved;

  // R-C2-1: the report identifier comes back from the SAME governed call
  // that performed the write, inside the same transaction. There is no
  // read-back, no second round trip, and no identifier constructed here.
  // `input.reportId` remains deliberately unread — a client-supplied report
  // key is an unverified assertion and is never trusted on this path.
  return {
    outcome: "success",
    data: {
      reportId: saved.data.reportId,
      observationLockVersion: saved.data.observationLockVersion,
      status: saved.data.reportStatus as AdapterReportStatus,
    },
  };
}

export async function adapterRequestDraft(
  input: AdapterRequestDraftInput,
): Promise<ActionResult<AdapterRequestDraftSuccess>> {
  const client = await createRequestSupabaseClient();
  const context = await resolveContext(client, input.reportId);
  if (context.outcome !== "success") return context;

  // The governed orchestration owns ensure/create -> mark -> request ->
  // grounded generation -> trusted store. It re-reads the saved observation
  // itself; the caller's `observationLockVersion` is a render proof only and
  // establishes nothing.
  const result = await requestDraftAction({
    sessionId: context.data.sessionId,
    studentId: context.data.studentId,
  });
  if (result.outcome !== "success") return result;
  if (result.data.status !== "draft_ready") return { outcome: "unavailable" };

  return {
    outcome: "success",
    data: {
      reportId: result.data.reportId,
      status: result.data.status,
      versionId: result.data.versionId,
    },
  };
}

export async function adapterSaveTrainerEdit(
  input: AdapterSaveTrainerEditInput,
): Promise<ActionResult<AdapterSaveTrainerEditSuccess>> {
  const client = await createRequestSupabaseClient();
  const context = await resolveContext(client, input.reportId);
  if (context.outcome !== "success") return context;

  const beforeOutcome = await readWorking(client, context.data.sessionId, context.data.studentId);
  if (!beforeOutcome.ok || !beforeOutcome.rows) return { outcome: "unavailable" };
  const before = beforeOutcome.rows;
  // The expected-state argument is the position the DATABASE just reported,
  // routed straight back into the CAS. RPC-6 re-verifies it under the
  // aggregate row lock, so this is routing, not a legality decision.
  if (before.status !== "draft_ready" && before.status !== "needs_edit") {
    return {
      outcome: "stale_state",
      message: "This report is no longer in a state that allows that action. Reload to continue.",
    };
  }
  const hadOpenCorrection = before.open_correction_request_id !== null;

  const saved = await saveTrainerEditCore(client, {
    reportId: input.reportId,
    expectedStatus: before.status,
    expectedLockVersion: input.expectedLockVersion,
    expectedVersionId: input.expectedVersionId,
    panels: input.panels,
    ...(input.reaffirmCorrectionRequestId !== undefined
      ? { reaffirmCorrectionRequestId: input.reaffirmCorrectionRequestId }
      : {}),
  });
  if (saved.outcome !== "success") return saved;
  if (saved.data.status !== "draft_ready") return { outcome: "unavailable" };

  const after = await readWorking(client, context.data.sessionId, context.data.studentId);
  /*
   * ⛔ THE READ MUST HAVE SUCCEEDED BEFORE ITS SILENCE MEANS ANYTHING. The
   * line below reads "no open correction" out of `after`, and a REJECTED read
   * used to reach it as `null` — reporting a governed correction request as
   * RESOLVED because a query failed, under a comment promising the opposite.
   */
  if (!after.ok) return { outcome: "unavailable" };
  const afterRow = after.rows;
  return {
    outcome: "success",
    data: {
      reportId: saved.data.reportId,
      status: saved.data.status,
      versionId: saved.data.versionId,
      checklistReset: true,
      // Observed, not asserted: the correction is resolved when the database
      // stops reporting an open one. `afterRow` is now only ever an OBSERVED
      // absence — a rejection returned above.
      correctionResolved:
        hadOpenCorrection && (afterRow === null || afterRow.open_correction_request_id === null),
    },
  };
}

export async function adapterUpdateTrainerChecklist(
  input: AdapterUpdateTrainerChecklistInput,
): Promise<ActionResult<AdapterTrainerWorkingReportDto>> {
  const client = await createRequestSupabaseClient();
  const context = await resolveContext(client, input.reportId);
  if (context.outcome !== "success") return context;

  const beforeOutcome = await readWorking(client, context.data.sessionId, context.data.studentId);
  if (!beforeOutcome.ok || !beforeOutcome.rows) return { outcome: "unavailable" };
  const before = beforeOutcome.rows;

  const updated = await updateTrainerChecklistCore(client, {
    reportId: input.reportId,
    expectedLockVersion: before.lock_version,
    expectedVersionId: input.expectedVersionId,
    evidenceConfirmed: input.checklist.evidenceConfirmed,
    aiDraftReviewed: input.checklist.aiDraftReviewed,
    privacyChecked: input.checklist.privacyChecked,
  });
  if (updated.outcome !== "success") return updated;

  // The port returns the re-read working report, never a locally patched copy.
  return adapterGetTrainerWorkingReport(input.reportId);
}

/**
 * Hero Phase 7 / `F-S6-REVIEW-1` — the governed follow-up note save.
 *
 * ⚠️ Note the contrast with the checklist action above, and it is deliberate:
 * that one reads the working report FIRST to obtain `lock_version` for its
 * compare-and-set. This one does not, because it performs no CAS and bumps no
 * lock. Adding a pre-read here would imply a concurrency guarantee the write
 * does not make, and would be the kind of ceremony that reads as safety
 * without providing it.
 *
 * It re-reads AFTERWARDS for the same reason the checklist action does: the
 * port returns the governed value the database now holds, never a locally
 * patched copy of what the client sent.
 */
export async function adapterSaveFollowUpNotes(
  input: AdapterSaveFollowUpNotesInput,
): Promise<ActionResult<AdapterTrainerWorkingReportDto>> {
  const client = await createRequestSupabaseClient();

  const saved = await saveFollowUpNotesCore(client, {
    reportId: input.reportId,
    followUpNotes: input.followUpNotes,
  });
  if (saved.outcome !== "success") return saved;

  return adapterGetTrainerWorkingReport(input.reportId);
}

export async function adapterTrainerApprove(
  input: AdapterTrainerApproveInput,
): Promise<ActionResult<AdapterTrainerApproveSuccess>> {
  const client = await createRequestSupabaseClient();
  const context = await resolveContext(client, input.reportId);
  if (context.outcome !== "success") return context;

  const beforeOutcome = await readWorking(client, context.data.sessionId, context.data.studentId);
  if (!beforeOutcome.ok || !beforeOutcome.rows) return { outcome: "unavailable" };
  const before = beforeOutcome.rows;
  if (before.status !== "draft_ready" && before.status !== "needs_edit") {
    return {
      outcome: "stale_state",
      message: "This report is no longer in a state that allows that action. Reload to continue.",
    };
  }

  const approved = await trainerApproveCore(client, {
    reportId: input.reportId,
    expectedStatus: before.status,
    expectedLockVersion: input.expectedLockVersion,
    expectedVersionId: input.expectedVersionId,
    expectedContentHash: input.expectedContentHash,
  });
  if (approved.outcome !== "success") return approved;
  if (approved.data.status !== "trainer_approved") return { outcome: "unavailable" };

  return {
    outcome: "success",
    data: {
      reportId: approved.data.reportId,
      status: approved.data.status,
      // A-020: trainer approval freezes a version and PUBLISHES NOTHING. The
      // database performs no submission here and none is claimed.
      published: false,
      managementReviewRequired: true,
    },
  };
}

export async function adapterManagementEditWording(
  input: AdapterManagementEditWordingInput,
): Promise<ActionResult<AdapterManagementEditWordingSuccess>> {
  const client = await createRequestSupabaseClient();
  // WORDING ONLY: the four panels are the entire mutable surface RPC-9
  // accepts. No rating, checklist item, observation or hash can be expressed.
  const edited = await managementEditWordingCore(client, {
    reportId: input.reportId,
    expectedLockVersion: input.expectedLockVersion,
    expectedVersionId: input.expectedVersionId,
    expectedWordingHash: input.expectedWordingHash,
    panels: input.panels,
  });
  if (edited.outcome !== "success") return edited;
  if (edited.data.status !== "trainer_approved") return { outcome: "unavailable" };

  return {
    outcome: "success",
    data: {
      reportId: edited.data.reportId,
      status: edited.data.status,
      versionId: edited.data.versionId,
      wordingHash: edited.data.wordingHash,
    },
  };
}

export async function adapterManagementReturnToTrainer(
  input: AdapterManagementReturnToTrainerInput,
): Promise<ActionResult<AdapterManagementReturnToTrainerSuccess>> {
  const client = await createRequestSupabaseClient();
  const returned = await managementReturnToTrainerCore(client, {
    reportId: input.reportId,
    expectedLockVersion: input.expectedLockVersion,
    expectedVersionId: input.expectedVersionId,
    issueScope: scopeToDb(input.issueScope),
    ...(input.dimensionCode !== undefined ? { dimensionCode: input.dimensionCode } : {}),
    reason: input.reason,
  });
  if (returned.outcome !== "success") return returned;
  if (returned.data.status !== "needs_edit") return { outcome: "unavailable" };

  return {
    outcome: "success",
    data: {
      reportId: returned.data.reportId,
      status: returned.data.status,
      correctionRequestId: returned.data.correctionRequestId,
      // Returning creates no version and moves no canonical pointer.
      parentVisible: false,
    },
  };
}

export async function adapterManagementApproveAndSubmit(
  input: AdapterManagementApproveAndSubmitInput,
): Promise<ActionResult<AdapterManagementApproveAndSubmitSuccess>> {
  const client = await createRequestSupabaseClient();
  // RPC-11 is the ONLY publication in the system, and it is a management
  // action. No AI path and no trainer path reaches it.
  const submitted = await managementApproveAndSubmitCore(client, {
    reportId: input.reportId,
    expectedLockVersion: input.expectedLockVersion,
    expectedVersionId: input.expectedVersionId,
    expectedWordingHash: input.expectedWordingHash,
  });
  if (submitted.outcome !== "success") return submitted;
  if (submitted.data.status !== "submitted") return { outcome: "unavailable" };

  return {
    outcome: "success",
    data: {
      reportId: submitted.data.reportId,
      status: submitted.data.status,
      submittedAt: submitted.data.submittedAt,
      parentVisible: true,
    },
  };
}

/**
 * ⛔ P1-5 — mint ONE short-TTL view URL for D-5's per-child clip (A-001 gate 6).
 *
 * ⚠️ TWO CLIENTS, DELIBERATELY. The REQUEST client carries the caller's own
 * identity, so the RPC's live gate applies exactly as it does to every other
 * read. The ELEVATED client is used ONLY to SIGN a path the governed RPC has
 * already authorized — ⛔ it never decides who may view, and it is never
 * reached before authorization succeeds.
 *
 * ⛔ NO DOWNLOAD OPTION IS PASSED (D-5). Adding one would create the download
 * control D-5 refuses for every role, Parent included — invisibly, inside an
 * options object.
 */
export async function adapterMintEvidenceViewUrl(
  evidenceId: string,
): Promise<ActionResult<{ readonly url: string; readonly expiresInSeconds: number }>> {
  return mintEvidenceViewUrlCore(
    await createRequestSupabaseClient(),
    createElevatedSupabaseClient(),
    evidenceId,
  );
}

// ---------------------------------------------------------------------
// ⛔ P1-2b — THE UPLOAD TRANSPORT'S THREE WRITES AND ONE READ.
//
// The bytes themselves do NOT pass through this file. They go directly from
// the browser to storage under the one RLS INSERT policy — the bounded ADR-3
// exception D-5 needs, because a 100 MB body relayed through a Server Action
// is neither resumable nor within the framework's request limits.
//
// ▶ WHAT THAT EXCEPTION LETS A CLIENT WRITE, EXACTLY: an OPAQUE OBJECT · into
//   a PRIVATE bucket (no SELECT/UPDATE/DELETE policy exists for any role) · at
//   a path it must prove TRAINER AUTHORITY over · GOVERNED BY NOTHING until
//   `confirmEvidenceAttach` attaches it. The governed act is the attach, and
//   the attach is here, server-side, in one transaction with its audit event.
// ---------------------------------------------------------------------

export async function adapterCreateEvidenceUploadTicket(
  input: { readonly reportId: string; readonly mediaType: string; readonly byteSize: number },
): Promise<ActionResult<AdapterEvidenceUploadTicketDto>> {
  return createEvidenceUploadTicketCore(
    await createRequestSupabaseClient(),
    input.reportId,
    input.mediaType,
    input.byteSize,
  );
}

export async function adapterConfirmEvidenceAttach(
  input: { readonly reportId: string; readonly evidenceId: string },
): Promise<ActionResult<AdapterEvidenceAttachSuccess>> {
  return confirmEvidenceAttachCore(
    await createRequestSupabaseClient(),
    input.reportId,
    input.evidenceId,
  );
}

/**
 * ⛔ TRAINER ONLY, AND NOT LIMITED TO PRE-SUBMITTED (Operator ruling).
 * Management may never remove — that is `CLAUDE.md` §6, not a D-5 choice.
 */
export async function adapterRemoveEvidence(
  evidenceId: string,
): Promise<ActionResult<{ readonly removed: boolean }>> {
  return removeEvidenceCore(
    await createRequestSupabaseClient(),
    createElevatedSupabaseClient(),
    evidenceId,
  );
}

/**
 * ⚠️ REPORT-KEYED, LIKE EVERY OTHER REPORT READ ON THIS SURFACE. The client
 * sends a report id and nothing else; the session/student pair is resolved
 * server-side through the governed resolver (R-22), so a caller cannot pair a
 * report it may read with a learner it may not.
 */
export async function adapterListReportEvidence(
  reportId: string,
): Promise<ActionResult<readonly AdapterReportEvidenceClipDto[]>> {
  const client = await createRequestSupabaseClient();
  const context = await resolveReportContextCore(client, reportId);
  if (context.outcome !== "success") return context;
  return listEvidenceForParentCore(client, context.data.sessionId, context.data.studentId);
}
