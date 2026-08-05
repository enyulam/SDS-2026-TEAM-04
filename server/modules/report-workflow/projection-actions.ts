"use server";

/**
 * Read-projection server actions — the §5.2 reads, bound to the
 * request-scoped authenticated client. Flowing every read through a Server
 * Action (rather than a bare RSC query) is what lets session-refresh cookie
 * writes propagate (see identity-access/actions.ts).
 */

import { createRequestSupabaseClient } from "@/server/platform/supabase/request";
import type { ActionResult } from "@/server/contracts/action-result";
import {
  getSessionRosterCore,
  getTrainerWorkingReportCore,
  listReturnedReportsCore,
  listTrainerSessionsCore,
  type ReturnedReportQueueItemDto,
  type RosterEntryDto,
  type TrainerSessionSummaryDto,
  type TrainerWorkingReportDto,
} from "@/server/modules/report-workflow/trainer-projections";
import {
  getManagementReviewCandidateCore,
  listManagementCorrectionTrackingCore,
  listManagementPendingReviewCore,
  type ManagementQueueRowDto,
  type ManagementReviewDto,
} from "@/server/modules/management-view/projections";
import {
  getCanonicalReportCore,
  getParentAvailabilityCore,
  listParentReportsCore,
  type AvailabilityState,
  type CanonicalReportDto,
  type ParentReportListItemDto,
} from "@/server/modules/parent-view/projections";

// ---- trainer ---------------------------------------------------------
export async function listTrainerSessions(): Promise<ActionResult<readonly TrainerSessionSummaryDto[]>> {
  return listTrainerSessionsCore(await createRequestSupabaseClient());
}

export async function getSessionRoster(
  sessionId: string,
): Promise<ActionResult<readonly RosterEntryDto[]>> {
  return getSessionRosterCore(await createRequestSupabaseClient(), sessionId);
}

export async function getTrainerWorkingReport(
  sessionId: string,
  studentId: string,
): Promise<ActionResult<TrainerWorkingReportDto>> {
  return getTrainerWorkingReportCore(await createRequestSupabaseClient(), sessionId, studentId);
}

export async function listReturnedReports(): Promise<ActionResult<readonly ReturnedReportQueueItemDto[]>> {
  return listReturnedReportsCore(await createRequestSupabaseClient());
}

// ---- management ------------------------------------------------------
export async function listManagementPendingReview(): Promise<ActionResult<readonly ManagementQueueRowDto[]>> {
  return listManagementPendingReviewCore(await createRequestSupabaseClient());
}

export async function listManagementCorrectionTracking(): Promise<ActionResult<readonly ManagementQueueRowDto[]>> {
  return listManagementCorrectionTrackingCore(await createRequestSupabaseClient());
}

export async function getManagementReviewCandidate(
  sessionId: string,
  studentId: string,
): Promise<ActionResult<ManagementReviewDto>> {
  return getManagementReviewCandidateCore(await createRequestSupabaseClient(), sessionId, studentId);
}

// ---- parent ----------------------------------------------------------
export async function listParentReports(): Promise<ActionResult<readonly ParentReportListItemDto[]>> {
  return listParentReportsCore(await createRequestSupabaseClient());
}

export async function getParentAvailability(): Promise<ActionResult<AvailabilityState>> {
  return getParentAvailabilityCore(await createRequestSupabaseClient());
}

export async function getCanonicalReport(
  sessionId: string,
  studentId: string,
): Promise<ActionResult<CanonicalReportDto>> {
  return getCanonicalReportCore(await createRequestSupabaseClient(), sessionId, studentId);
}
