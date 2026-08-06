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
import type { ActionResult } from "@/server/contracts/action-result";
import { mapSqlErrorToResult } from "@/server/contracts/action-result";
import { requireRole } from "@/server/modules/identity-access/session-core";
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
  client: SupabaseClient,
): Promise<ActionResult<readonly ManagementQueueRowDto[]>> {
  // The role gate is what turns a wrong-role caller's empty list into the
  // contract's `unauthorized` outcome at the action boundary. It is a
  // presentation improvement, NOT the security boundary — the database
  // re-proves authority independently inside the RPC.
  const identity = await requireRole(client, "management");
  if (identity.outcome !== "success") return identity;

  return listManagementCorrectionsFromRpc(client);
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
 * takes NO status parameter and hard-codes `r.status = 'submitted'` in its
 * WHERE clause, so a preapproval report is never a row of the result at all.
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
  client: SupabaseClient,
): Promise<ActionResult<readonly ManagementQueueRowDto[]>> {
  // As with correction tracking, the role gate is what turns a wrong-role
  // caller's empty list into the contract's `unauthorized` outcome at the
  // action boundary. It is a presentation improvement, NOT the security
  // boundary — the database re-proves authority independently inside the RPC.
  const identity = await requireRole(client, "management");
  if (identity.outcome !== "success") return identity;

  return listManagementSubmittedFromRpc(client);
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
