/**
 * Result-row shapes of the governed RPCs, as the committed migrations define
 * them. The generated `server/db/database.types.ts` is authoritative for the
 * schema (ADR-8); these narrowed interfaces exist because several RPCs use
 * `OUT` records the generator types as `Record<string, unknown>`, and the
 * cores must not silently consume an untyped shape.
 */

import type { Database } from "@/server/db/database.types";

export type ReportStatus = Database["public"]["Enums"]["report_status"];
export type CorrectionIssueScope = Database["public"]["Enums"]["correction_issue_scope"];
export type CorrectionRequestStatus = Database["public"]["Enums"]["correction_request_status"];

/** RPC-1 report_create */
export interface ReportCreateRow {
  report_id: string;
  status: ReportStatus;
  lock_version: number;
}

/** RPC-2 / RPC-5 — status + lock_version only */
export interface StatusLockRow {
  status: ReportStatus;
  lock_version: number;
}

/** RPC-3 report_request_draft */
export interface RequestDraftRow extends StatusLockRow {
  observation_lock_version: number;
}

/** RPC-4 report_store_draft (owner-only; reached via the trusted channel) */
export interface StoreDraftRow extends StatusLockRow {
  report_version_id: string;
  revision_number: number;
  content_hash: string;
}

/** RPC-6 report_save_edit */
export interface SaveEditRow extends StatusLockRow {
  report_version_id: string;
  revision_number: number;
  content_hash: string;
}

/** RPC-8 report_trainer_approve */
export interface TrainerApproveRow extends StatusLockRow {
  report_version_id: string;
}

/** RPC-9 report_management_edit_wording */
export interface ManagementEditWordingRow extends StatusLockRow {
  report_version_id: string;
  revision_number: number;
  wording_hash: string;
}

/** RPC-10 report_management_return_to_trainer */
export interface ManagementReturnRow extends StatusLockRow {
  correction_request_id: string;
}

/** RPC-11 report_management_approve_and_submit */
export interface ApproveAndSubmitRow extends StatusLockRow {
  submitted_version_id: string;
  submitted_at: string;
}

/** RPC-14 report_get_working (trainer-only working read) */
export type WorkingReportRow =
  Database["public"]["Functions"]["report_get_working"]["Returns"][number];

/** RPC-15 report_get_management_review (status-gated management read) */
export type ManagementReviewRow =
  Database["public"]["Functions"]["report_get_management_review"]["Returns"][number];

/** RPC-13 report_get_canonical (submitted-canonical read, all three roles) */
export type CanonicalReportRow =
  Database["public"]["Functions"]["report_get_canonical"]["Returns"][number];

/** ASM-1 assessment_save_observation */
export interface AssessmentSaveRow {
  observation_id: string;
  lock_version: number;
  dimension_count: number;
  is_complete: boolean;
  was_created: boolean;
}

/** ASM-2 assessment_get_trainer_observation */
export interface TrainerObservationRow {
  observation_exists: boolean;
  observation_id: string | null;
  lock_version: number | null;
  strength_chips: string[];
  focus_chips: string[];
  observation_notes: string | null;
  follow_up_notes: string | null;
  term_evidence_notes: string | null;
  ratings: unknown;
  dimension_count: number;
  is_complete: boolean;
}

/**
 * The minimal structural dependency of every core: something that can call a
 * governed RPC and report `{ data, error }`. A `SupabaseClient` satisfies it
 * directly; the integration suite satisfies it with a psql-backed caller on
 * the DISPOSABLE database.
 */
export interface RpcCaller {
  rpc(
    fn: string,
    args?: Record<string, unknown>,
  ): PromiseLike<{ data: unknown; error: { code?: string; message: string } | null }>;
}

/** Normalize a set-returning or single-record RPC result to its first row. */
export function firstRow<T>(data: unknown): T | null {
  if (Array.isArray(data)) return (data.length > 0 ? (data[0] as T) : null);
  if (data && typeof data === "object") return data as T;
  return null;
}
