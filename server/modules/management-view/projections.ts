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
 * R-7, STATED HONESTLY. Full correction tracking — listing reports still at
 * `needs_edit` with their open request's scope and status — is NOT
 * reachable through the ratified read inventory: RPC-15 deliberately
 * returns ZERO ROWS at `needs_edit` (A-038; pinned by T7I-63), the
 * correction table carries zero client privileges, and widening either is
 * ratified out (`CLAUDE.md` §12) / a §9 blocker (contract §5.2). This
 * projection therefore tracks what management may lawfully see: pairs whose
 * gated read returns a row that still carries open-correction metadata.
 * The physical-test discovery minimum (contract §3) is unaffected — it
 * requires management to discover reports AWAITING REVIEW (R-6), which is
 * fully delivered. Extending R-7 to `needs_edit` visibility is recorded as
 * an operator decision (U-B2-1 in the backend log), not improvised.
 *
 * DTO exclusions (contract §5.5, absolute): no ratings, observations,
 * attendance, evidence, trainer notes, checklist values, content hashes,
 * revision counts, correction reasons or AI history appear in any shape
 * this module returns. `wordingHash` appears only on the review candidate.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ActionResult } from "@/server/contracts/action-result";
import { mapSqlErrorToResult } from "@/server/contracts/action-result";
import { requireRole } from "@/server/modules/identity-access/session-core";
import {
  firstRow,
  type CorrectionIssueScope,
  type CorrectionRequestStatus,
  type ManagementReviewRow,
  type ReportStatus,
} from "@/server/modules/report-workflow/rpc-types";

export interface ManagementQueueRowDto {
  readonly reportId: string;
  readonly sessionId: string;
  readonly studentId: string;
  readonly studentDisplayName: string;
  readonly sessionDate: string;
  readonly status: ReportStatus;
  readonly openCorrectionScope?: CorrectionIssueScope;
  readonly openCorrectionStatus?: CorrectionRequestStatus;
}

export interface ManagementReviewDto {
  readonly reportId: string;
  readonly status: ReportStatus;
  readonly lockVersion: number | null;
  readonly versionId: string | null;
  readonly panels: {
    readonly todaysStrength: string;
    readonly nextFocus: string;
    readonly practiceSuggestion: string;
    readonly sessionTakeaway: string;
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

/** Enumerate every (session, enrolled student) pair of the managed centre. */
async function listCentrePairs(client: SupabaseClient): Promise<PairRow[]> {
  const { data: sessions } = await client
    .from("class_sessions")
    .select("id, session_date, class_module_id")
    .order("session_date", { ascending: true });
  const pairs: PairRow[] = [];
  const nameCache = new Map<string, string>();
  for (const session of (sessions ?? []) as Array<{ id: string; session_date: string; class_module_id: string }>) {
    const { data: enrolments } = await client
      .from("enrolments")
      .select("student_id")
      .eq("class_module_id", session.class_module_id)
      .eq("is_active", true);
    for (const enrolment of (enrolments ?? []) as Array<{ student_id: string }>) {
      let name = nameCache.get(enrolment.student_id);
      if (name === undefined) {
        const { data: students } = await client
          .from("students")
          .select("id, full_name")
          .eq("id", enrolment.student_id);
        name = ((students?.[0] as { full_name?: string } | undefined)?.full_name) ?? "Student";
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
  return pairs;
}

async function gatedReview(
  client: SupabaseClient,
  sessionId: string,
  studentId: string,
): Promise<ManagementReviewRow | null> {
  const { data, error } = await client.rpc("report_get_management_review", {
    p_class_session_id: sessionId,
    p_student_id: studentId,
  });
  if (error) return null;
  return firstRow<ManagementReviewRow>(data);
}

// ---------------------------------------------------------------------
// R-6 — the pending-final-review queue (CP-3's resolution)
// ---------------------------------------------------------------------
export async function listManagementPendingReviewCore(
  client: SupabaseClient,
): Promise<ActionResult<readonly ManagementQueueRowDto[]>> {
  const identity = await requireRole(client, "management");
  if (identity.outcome !== "success") return identity;

  const out: ManagementQueueRowDto[] = [];
  for (const pair of await listCentrePairs(client)) {
    const row = await gatedReview(client, pair.sessionId, pair.studentId);
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
  return { outcome: "success", data: out };
}

// ---------------------------------------------------------------------
// R-7 — correction tracking (bounded to the lawful surface; see header)
// ---------------------------------------------------------------------
export async function listManagementCorrectionTrackingCore(
  client: SupabaseClient,
): Promise<ActionResult<readonly ManagementQueueRowDto[]>> {
  const identity = await requireRole(client, "management");
  if (identity.outcome !== "success") return identity;

  const out: ManagementQueueRowDto[] = [];
  for (const pair of await listCentrePairs(client)) {
    const row = await gatedReview(client, pair.sessionId, pair.studentId);
    if (!row || row.open_correction_status !== "open") continue;
    out.push({
      reportId: row.report_id,
      sessionId: pair.sessionId,
      studentId: pair.studentId,
      studentDisplayName: pair.studentDisplayName,
      sessionDate: pair.sessionDate,
      status: row.status,
      openCorrectionScope: row.open_correction_issue_scope,
      openCorrectionStatus: row.open_correction_status,
    });
  }
  return { outcome: "success", data: out };
}

// ---------------------------------------------------------------------
// R-8 — the safe final-review candidate
// ---------------------------------------------------------------------
export async function getManagementReviewCandidateCore(
  client: SupabaseClient,
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
        todaysStrength: row.todays_strength ?? "",
        nextFocus: row.next_focus ?? "",
        practiceSuggestion: row.practice_suggestion ?? "",
        sessionTakeaway: row.session_takeaway ?? "",
      },
      wordingHash: row.wording_hash,
      submittedAt: row.submitted_at,
      ...(row.open_correction_issue_scope ? { openCorrectionScope: row.open_correction_issue_scope } : {}),
      ...(row.open_correction_status ? { openCorrectionStatus: row.open_correction_status } : {}),
    },
  };
}
