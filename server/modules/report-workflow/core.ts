/**
 * Report-workflow action cores — the testable halves of the contract §5.1
 * server actions (everything except `saveObservation` and `requestDraft`,
 * which live with their owning modules).
 *
 * Discipline (contract §5.1): each core validates request SHAPE only (UUID
 * syntax, presence, bounds), passes expected-state values through, calls the
 * governed RPC under the CALLER'S OWN credential, and maps authored SQL
 * errors to the shared result union. NO core adds authority of its own —
 * every authorization fact is re-derived inside the SECURITY DEFINER RPC
 * from `auth.uid()`, so a browser route, query parameter or role tab can
 * never establish authority here.
 *
 * No direct table mutation exists anywhere in this module: the only writes
 * are the governed RPCs.
 */

import type { ActionResult } from "@/server/contracts/action-result";
import { mapSqlErrorToResult } from "@/server/contracts/action-result";
import {
  firstRow,
  type ApproveAndSubmitRow,
  type CorrectionIssueScope,
  type ManagementEditWordingRow,
  type ManagementReturnRow,
  type ReportStatus,
  type RpcCaller,
  type SaveEditRow,
  type TrainerApproveRow,
} from "@/server/modules/report-workflow/rpc-types";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const HASH_RE = /^[0-9a-f]{64}$/;
const PANEL_MAX = 4000;
const REASON_MAX = 2000;

export interface ReportPanels {
  readonly todaysStrength: string;
  readonly nextFocus: string;
  readonly practiceSuggestion: string;
  readonly sessionTakeaway: string;
}

function invalid(message: string, path?: string): ActionResult<never> {
  return { outcome: "validation", message, fields: path ? [{ path, message }] : [] };
}

function requireUuid(value: string, path: string): ActionResult<never> | null {
  return UUID_RE.test(value) ? null : invalid("A valid identifier is required.", path);
}

function validatePanels(panels: ReportPanels): ActionResult<never> | null {
  for (const [path, value] of Object.entries(panels)) {
    if (typeof value !== "string") return invalid("All four report panels are required.", path);
    if (value.length > PANEL_MAX) return invalid("A report panel exceeds the permitted length.", path);
  }
  return null;
}

// ---------------------------------------------------------------------
// saveTrainerEdit — RPC-6 (T5/T6). New immutable version; carries the
// reaffirmation argument when the panels are byte-identical (R-7b).
// ---------------------------------------------------------------------
export interface SaveTrainerEditInput {
  readonly reportId: string;
  readonly expectedStatus: Extract<ReportStatus, "draft_ready" | "needs_edit">;
  readonly expectedLockVersion: number;
  readonly expectedVersionId: string;
  readonly panels: ReportPanels;
  readonly reaffirmCorrectionRequestId?: string;
}

export interface SaveTrainerEditSuccess {
  readonly reportId: string;
  readonly status: ReportStatus;
  readonly lockVersion: number;
  readonly versionId: string;
  readonly revisionNumber: number;
  readonly contentHash: string;
  /** Every trainer-authored version starts with a fresh all-false checklist. */
  readonly checklistReset: true;
}

export async function saveTrainerEditCore(
  db: RpcCaller,
  input: SaveTrainerEditInput,
): Promise<ActionResult<SaveTrainerEditSuccess>> {
  const shape =
    requireUuid(input.reportId, "reportId") ??
    requireUuid(input.expectedVersionId, "expectedVersionId") ??
    validatePanels(input.panels) ??
    (input.reaffirmCorrectionRequestId !== undefined
      ? requireUuid(input.reaffirmCorrectionRequestId, "reaffirmCorrectionRequestId")
      : null) ??
    (input.expectedStatus === "draft_ready" || input.expectedStatus === "needs_edit"
      ? null
      : invalid("The report is not editable in its current state.", "expectedStatus")) ??
    (Number.isInteger(input.expectedLockVersion) && input.expectedLockVersion >= 1
      ? null
      : invalid("A valid expected state is required.", "expectedLockVersion"));
  if (shape) return shape;

  const { data, error } = await db.rpc("report_save_edit", {
    p_report_id: input.reportId,
    p_expected_status: input.expectedStatus,
    p_expected_lock_version: input.expectedLockVersion,
    p_expected_version_id: input.expectedVersionId,
    p_todays_strength: input.panels.todaysStrength,
    p_next_focus: input.panels.nextFocus,
    p_practice_suggestion: input.panels.practiceSuggestion,
    p_session_takeaway: input.panels.sessionTakeaway,
    ...(input.reaffirmCorrectionRequestId !== undefined
      ? { p_reaffirm_correction_request_id: input.reaffirmCorrectionRequestId }
      : {}),
  });
  if (error) return mapSqlErrorToResult(error.code, error.message);
  const row = firstRow<SaveEditRow>(data);
  if (!row) return { outcome: "unexpected_failure", message: "The operation could not be completed." };
  return {
    outcome: "success",
    data: {
      reportId: input.reportId,
      status: row.status,
      lockVersion: row.lock_version,
      versionId: row.report_version_id,
      revisionNumber: row.revision_number,
      contentHash: row.content_hash,
      checklistReset: true,
    },
  };
}

// ---------------------------------------------------------------------
// updateTrainerChecklist — RPC-7. Version-scoped; no audit event; never
// bumps lock_version (it validates it under the aggregate row lock).
// ---------------------------------------------------------------------
export interface UpdateTrainerChecklistInput {
  readonly reportId: string;
  readonly expectedLockVersion: number;
  readonly expectedVersionId: string;
  readonly evidenceConfirmed: boolean;
  readonly aiDraftReviewed: boolean;
  readonly privacyChecked: boolean;
}

export async function updateTrainerChecklistCore(
  db: RpcCaller,
  input: UpdateTrainerChecklistInput,
): Promise<ActionResult<{ reportId: string }>> {
  const shape =
    requireUuid(input.reportId, "reportId") ?? requireUuid(input.expectedVersionId, "expectedVersionId");
  if (shape) return shape;

  const { error } = await db.rpc("report_update_checklist", {
    p_report_id: input.reportId,
    p_expected_lock_version: input.expectedLockVersion,
    p_expected_version_id: input.expectedVersionId,
    p_evidence_confirmed: input.evidenceConfirmed === true,
    p_ai_draft_reviewed: input.aiDraftReviewed === true,
    p_privacy_checked: input.privacyChecked === true,
  });
  if (error) return mapSqlErrorToResult(error.code, error.message);
  return { outcome: "success", data: { reportId: input.reportId } };
}

// ---------------------------------------------------------------------
// trainerApprove — RPC-8 (T7/T8). Freezes the version; PUBLISHES NOTHING.
// ---------------------------------------------------------------------
export interface TrainerApproveInput {
  readonly reportId: string;
  readonly expectedStatus: Extract<ReportStatus, "draft_ready" | "needs_edit">;
  readonly expectedLockVersion: number;
  readonly expectedVersionId: string;
  /** The trainer-side render proof — the CONTENT hash RPC-14 returned. */
  readonly expectedContentHash: string;
}

export interface TrainerApproveSuccess {
  readonly reportId: string;
  readonly status: ReportStatus;
  readonly lockVersion: number;
  readonly published: false;
  readonly managementReviewRequired: true;
}

export async function trainerApproveCore(
  db: RpcCaller,
  input: TrainerApproveInput,
): Promise<ActionResult<TrainerApproveSuccess>> {
  const shape =
    requireUuid(input.reportId, "reportId") ??
    requireUuid(input.expectedVersionId, "expectedVersionId") ??
    (HASH_RE.test(input.expectedContentHash)
      ? null
      : invalid("A valid content proof is required.", "expectedContentHash"));
  if (shape) return shape;

  const { data, error } = await db.rpc("report_trainer_approve", {
    p_report_id: input.reportId,
    p_expected_status: input.expectedStatus,
    p_expected_lock_version: input.expectedLockVersion,
    p_expected_version_id: input.expectedVersionId,
    p_expected_content_hash: input.expectedContentHash,
  });
  if (error) return mapSqlErrorToResult(error.code, error.message);
  const row = firstRow<TrainerApproveRow>(data);
  if (!row) return { outcome: "unexpected_failure", message: "The operation could not be completed." };
  return {
    outcome: "success",
    data: {
      reportId: input.reportId,
      status: row.status,
      lockVersion: row.lock_version,
      published: false,
      managementReviewRequired: true,
    },
  };
}

// ---------------------------------------------------------------------
// managementEditWording — RPC-9 (T9). The allow-list is the SIGNATURE:
// four panels and nothing else can even be expressed.
// ---------------------------------------------------------------------
export interface ManagementEditWordingInput {
  readonly reportId: string;
  readonly expectedLockVersion: number;
  readonly expectedVersionId: string;
  /** The management-side render proof — the WORDING hash, never the content hash (R-26). */
  readonly expectedWordingHash: string;
  readonly panels: ReportPanels;
}

export interface ManagementEditWordingSuccess {
  readonly reportId: string;
  readonly status: ReportStatus;
  readonly lockVersion: number;
  readonly versionId: string;
  readonly wordingHash: string;
}

export async function managementEditWordingCore(
  db: RpcCaller,
  input: ManagementEditWordingInput,
): Promise<ActionResult<ManagementEditWordingSuccess>> {
  const shape =
    requireUuid(input.reportId, "reportId") ??
    requireUuid(input.expectedVersionId, "expectedVersionId") ??
    validatePanels(input.panels) ??
    (HASH_RE.test(input.expectedWordingHash)
      ? null
      : invalid("A valid wording proof is required.", "expectedWordingHash"));
  if (shape) return shape;

  const { data, error } = await db.rpc("report_management_edit_wording", {
    p_report_id: input.reportId,
    p_expected_lock_version: input.expectedLockVersion,
    p_expected_version_id: input.expectedVersionId,
    p_expected_wording_hash: input.expectedWordingHash,
    p_todays_strength: input.panels.todaysStrength,
    p_next_focus: input.panels.nextFocus,
    p_practice_suggestion: input.panels.practiceSuggestion,
    p_session_takeaway: input.panels.sessionTakeaway,
  });
  if (error) return mapSqlErrorToResult(error.code, error.message);
  const row = firstRow<ManagementEditWordingRow>(data);
  if (!row) return { outcome: "unexpected_failure", message: "The operation could not be completed." };
  return {
    outcome: "success",
    data: {
      reportId: input.reportId,
      status: row.status,
      lockVersion: row.lock_version,
      versionId: row.report_version_id,
      wordingHash: row.wording_hash,
    },
  };
}

// ---------------------------------------------------------------------
// managementReturnToTrainer — RPC-10 (T10). Records a bounded request;
// creates no version; moves no pointer.
// ---------------------------------------------------------------------
export interface ManagementReturnInput {
  readonly reportId: string;
  readonly expectedLockVersion: number;
  readonly expectedVersionId: string;
  readonly issueScope: CorrectionIssueScope;
  /** Required exactly when issueScope = 'rating'; must be absent otherwise. */
  readonly dimensionCode?: string;
  readonly reason: string;
}

export interface ManagementReturnSuccess {
  readonly reportId: string;
  readonly status: ReportStatus;
  readonly lockVersion: number;
  readonly correctionRequestId: string;
}

export async function managementReturnToTrainerCore(
  db: RpcCaller,
  input: ManagementReturnInput,
): Promise<ActionResult<ManagementReturnSuccess>> {
  const shape =
    requireUuid(input.reportId, "reportId") ?? requireUuid(input.expectedVersionId, "expectedVersionId");
  if (shape) return shape;
  if (!["rating", "observation", "assessment_fact"].includes(input.issueScope)) {
    return invalid("A valid issue scope is required.", "issueScope");
  }
  if (typeof input.reason !== "string" || input.reason.trim() === "") {
    return invalid("A reason is required.", "reason");
  }
  if (input.reason.length > REASON_MAX) {
    return invalid("The reason exceeds the permitted length.", "reason");
  }

  const { data, error } = await db.rpc("report_management_return_to_trainer", {
    p_report_id: input.reportId,
    p_expected_lock_version: input.expectedLockVersion,
    p_expected_version_id: input.expectedVersionId,
    p_issue_scope: input.issueScope,
    p_dimension_code: input.dimensionCode ?? null,
    p_reason: input.reason,
  });
  if (error) return mapSqlErrorToResult(error.code, error.message);
  const row = firstRow<ManagementReturnRow>(data);
  if (!row) return { outcome: "unexpected_failure", message: "The operation could not be completed." };
  return {
    outcome: "success",
    data: {
      reportId: input.reportId,
      status: row.status,
      lockVersion: row.lock_version,
      correctionRequestId: row.correction_request_id,
    },
  };
}

// ---------------------------------------------------------------------
// managementApproveAndSubmit — RPC-11 (T11). The ONLY publication:
// trainer_approved → approved → submitted in one transaction, exactly two
// ordered state-change audit events, no committed `approved` residue.
// ---------------------------------------------------------------------
export interface ManagementApproveAndSubmitInput {
  readonly reportId: string;
  readonly expectedLockVersion: number;
  readonly expectedVersionId: string;
  readonly expectedWordingHash: string;
}

export interface ManagementApproveAndSubmitSuccess {
  readonly reportId: string;
  readonly status: ReportStatus;
  readonly lockVersion: number;
  readonly submittedVersionId: string;
  readonly submittedAt: string;
}

export async function managementApproveAndSubmitCore(
  db: RpcCaller,
  input: ManagementApproveAndSubmitInput,
): Promise<ActionResult<ManagementApproveAndSubmitSuccess>> {
  const shape =
    requireUuid(input.reportId, "reportId") ??
    requireUuid(input.expectedVersionId, "expectedVersionId") ??
    (HASH_RE.test(input.expectedWordingHash)
      ? null
      : invalid("A valid wording proof is required.", "expectedWordingHash"));
  if (shape) return shape;

  const { data, error } = await db.rpc("report_management_approve_and_submit", {
    p_report_id: input.reportId,
    p_expected_lock_version: input.expectedLockVersion,
    p_expected_version_id: input.expectedVersionId,
    p_expected_wording_hash: input.expectedWordingHash,
  });
  if (error) return mapSqlErrorToResult(error.code, error.message);
  const row = firstRow<ApproveAndSubmitRow>(data);
  if (!row) return { outcome: "unexpected_failure", message: "The operation could not be completed." };
  return {
    outcome: "success",
    data: {
      reportId: input.reportId,
      status: row.status,
      lockVersion: row.lock_version,
      submittedVersionId: row.submitted_version_id,
      submittedAt: row.submitted_at,
    },
  };
}
