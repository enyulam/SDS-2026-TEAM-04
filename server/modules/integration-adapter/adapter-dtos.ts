/**
 * F16-C — the shapes the participant adapter's server actions return.
 *
 * WHY THIS FILE EXISTS. `server/modules/integration-adapter/participant-actions.ts`
 * carries the `"use server"` directive, and a `"use server"` module may export
 * nothing but async functions. Every type the action surface needs therefore
 * lives here, in an ordinary module.
 *
 * WHY THE SHAPES ARE RESTATED RATHER THAN IMPORTED. `lib/frontend/contracts/**`
 * is FRONTEND-OWNED (48-hour contract §7.2): the backend must not import from
 * it. These declarations are the backend's own statement of what it will emit,
 * deliberately shaped to be assignable to the frontend port's DTOs. The
 * assignment is proved by `tsc` at `lib/frontend/adapters/real-participant-port.ts`,
 * where the two sides meet — a divergence is a compile error there, not a
 * silent runtime mismatch.
 *
 * DISCLOSURE DISCIPLINE. Nothing here widens what the underlying projections
 * already return. In particular the management shapes carry NO rating, no
 * observation text, no chip, no content hash and no revision number, and the
 * parent shape carries the four submitted panels and `submitted_at` and
 * nothing else.
 */

export type AdapterSessionRole = "trainer" | "management" | "parent";

export type AdapterRatingLevel = "beginning" | "developing" | "mastering" | "mastered";

/** The ratified nine, in declaration order — identical to the frontend union. */
export type AdapterDimensionCode =
  | "body"
  | "emotion"
  | "speech"
  | "tonality"
  | "eye_contact"
  | "vocal_projection"
  | "emotional_expression"
  | "sentence_flow"
  | "audience_awareness";

export type AdapterReportStatus =
  | "incomplete"
  | "observation_saved"
  | "drafting"
  | "draft_ready"
  | "needs_edit"
  | "trainer_approved"
  | "approved"
  | "submitted";

/**
 * The FRONTEND spelling of the third correction scope. The database enum
 * `correction_issue_scope` spells it `assessment_fact`; the ratified frontend
 * contract spells it `derived_assessment_fact`. The translation happens once,
 * in `participant-actions.ts`, in both directions. Neither vocabulary is
 * changed to suit the other.
 */
export type AdapterIssueScope = "rating" | "observation" | "derived_assessment_fact";

export interface AdapterSessionUserDto {
  readonly displayName: string;
  readonly role: AdapterSessionRole;
  readonly centreDisplayName: string;
}

export interface AdapterTrainerSessionSummaryDto {
  readonly sessionId: string;
  readonly moduleName: string;
  readonly classGrade: string;
  readonly date: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly studentCount: number;
  readonly countsByReportState: Readonly<Record<string, number>>;
}

export interface AdapterRosterEntryDto {
  readonly studentId: string;
  readonly displayName: string;
  readonly attendanceState: "present" | "absent";
  readonly reportState: AdapterReportStatus | "no_report";
  readonly reportId: string | null;
  readonly previousSessionFocus: string | null;
}

export interface AdapterDimensionDto {
  readonly dimensionCode: AdapterDimensionCode;
  readonly group: "competency" | "speech_linguistics";
  readonly displayName: string;
  readonly focus: string;
  readonly ordinal: number;
  readonly rubricAnchors: Readonly<Record<AdapterRatingLevel, string>>;
}

export interface AdapterAssessmentDraftDto {
  /**
   * NULL when the governed backend has not created a report for this pair yet.
   * Report creation is owned by `requestDraft` (RPC-1) by ratified operator
   * ruling — saving an assessment never advances the report lifecycle — so a
   * first assessment legitimately has no report identifier. It is reported as
   * `null`, never as a fabricated or empty identifier.
   */
  readonly reportId: string | null;
  readonly sessionId: string;
  readonly studentId: string;
  readonly studentDisplayName: string;
  readonly ratings: ReadonlyArray<{
    readonly dimensionCode: AdapterDimensionCode;
    readonly rating: AdapterRatingLevel | null;
  }>;
  readonly notes: string;
  readonly followUp: string;
  readonly observationLockVersion: number;
}

export interface AdapterCorrectionRequestDto {
  readonly id: string;
  readonly issueScope: AdapterIssueScope;
  readonly dimensionCode?: AdapterDimensionCode;
  readonly status: "open" | "resolved";
  readonly reason?: string;
}

export interface AdapterReportPanelsDto {
  readonly overview: string;
  readonly strengths: string;
  readonly areasForDevelopment: string;
  readonly remarks: string;
}

export interface AdapterTrainerWorkingReportDto {
  readonly reportId: string;
  readonly sessionId: string;
  readonly studentId: string;
  readonly studentDisplayName: string;
  readonly sessionDate: string;
  readonly status: AdapterReportStatus;
  readonly lockVersion: number;
  readonly versionId: string;
  readonly revisionNumber: number;
  readonly panels: AdapterReportPanelsDto;
  readonly contentHash: string;
  readonly checklist: {
    readonly evidenceConfirmed: boolean | null;
    readonly aiDraftReviewed: boolean | null;
    readonly privacyChecked: boolean | null;
  };
  readonly ratingSnapshots: ReadonlyArray<{
    readonly dimensionCode: AdapterDimensionCode;
    readonly displayName: string;
    readonly rating: AdapterRatingLevel;
  }>;
  readonly canonicalPointer: {
    readonly latestSubmittedVersionId: string | null;
    readonly submittedAt: string | null;
  };
  readonly coachNotes: string;
  readonly openCorrection?: AdapterCorrectionRequestDto;
}

export interface AdapterReturnedReportQueueItemDto {
  readonly reportId: string;
  readonly sessionId: string;
  readonly studentId: string;
  readonly studentDisplayName: string;
  readonly sessionDate: string;
  readonly correction: AdapterCorrectionRequestDto;
}

export interface AdapterManagementQueueRowDto {
  readonly reportId: string;
  readonly sessionId: string;
  readonly studentId: string;
  readonly studentDisplayName: string;
  readonly sessionDate: string;
  /**
   * C2C-004 added `submitted`. It is produced ONLY by the governed
   * submitted-list boundary, whose WHERE clause admits no other status, and
   * it carries publication metadata only — never a panel, rating or hash.
   */
  readonly status: "trainer_approved" | "needs_edit" | "draft_ready" | "submitted";
  readonly openCorrectionScope?: AdapterIssueScope;
  readonly openCorrectionStatus?: "open" | "resolved";
  readonly openCorrectionReason?: string;
  readonly submittedAt?: string;
}

export interface AdapterManagementReviewDto {
  readonly status: "trainer_approved";
  readonly lockVersion: number;
  readonly versionId: string;
  readonly panels: AdapterReportPanelsDto;
  readonly wordingHash: string;
  readonly submittedAt?: string;
  readonly openCorrectionScope?: AdapterIssueScope;
  readonly openCorrectionStatus?: "open" | "resolved";
}

export interface AdapterParentReportListItemDto {
  readonly studentId: string;
  readonly studentDisplayName: string;
  readonly sessionId: string;
  readonly sessionDate: string;
  readonly submittedAt: string;
}

export interface AdapterCanonicalReportDto {
  readonly panels: AdapterReportPanelsDto;
  readonly submittedAt: string;
}

export type AdapterAvailabilityStateDto = "available" | "none_yet" | "linked_unavailable";

export interface AdapterDraftGenerationContextDto {
  readonly reportId: string;
  readonly studentDisplayName: string;
  readonly observationLockVersion: number;
  readonly status: "observation_saved" | "draft_ready";
}

// ---------------------------------------------------------------------
// write inputs / successes
// ---------------------------------------------------------------------

export interface AdapterSaveObservationInput {
  readonly reportId: string | null;
  readonly sessionId: string;
  readonly studentId: string;
  readonly ratings: ReadonlyArray<{
    readonly dimensionCode: AdapterDimensionCode;
    readonly rating: AdapterRatingLevel | null;
  }>;
  readonly notes: string;
  readonly followUp: string;
  readonly observationLockVersion: number;
}

export interface AdapterSaveObservationSuccess {
  /**
   * R-C2-1: the REAL report identifier the governed save returned. Always
   * present — the complete save now opens the shell atomically, in the same
   * transaction as the observation write. Never constructed, cast or
   * defaulted on this side of the boundary.
   */
  readonly reportId: string;
  readonly observationLockVersion: number;
  /** The report status the DATABASE reports afterwards. Never asserted by TypeScript. */
  readonly status: AdapterReportStatus;
}

export interface AdapterRequestDraftInput {
  readonly reportId: string;
  readonly observationLockVersion: number;
}

export interface AdapterRequestDraftSuccess {
  readonly reportId: string;
  readonly status: "draft_ready";
  readonly versionId: string;
}

export interface AdapterSaveTrainerEditInput {
  readonly reportId: string;
  readonly expectedLockVersion: number;
  readonly expectedVersionId: string;
  readonly panels: AdapterReportPanelsDto;
  readonly reaffirmCorrectionRequestId?: string;
}

export interface AdapterSaveTrainerEditSuccess {
  readonly reportId: string;
  readonly status: "draft_ready";
  readonly versionId: string;
  readonly checklistReset: true;
  readonly correctionResolved: boolean;
}

export interface AdapterUpdateTrainerChecklistInput {
  readonly reportId: string;
  readonly expectedVersionId: string;
  readonly checklist: {
    readonly evidenceConfirmed: boolean;
    readonly aiDraftReviewed: boolean;
    readonly privacyChecked: boolean;
  };
}

export interface AdapterTrainerApproveInput {
  readonly reportId: string;
  readonly expectedLockVersion: number;
  readonly expectedVersionId: string;
  readonly expectedContentHash: string;
}

export interface AdapterTrainerApproveSuccess {
  readonly reportId: string;
  readonly status: "trainer_approved";
  /** Trainer approval PUBLISHES NOTHING (A-020). The literal is the contract, not a decision. */
  readonly published: false;
  readonly managementReviewRequired: true;
}

export interface AdapterManagementEditWordingInput {
  readonly reportId: string;
  readonly expectedLockVersion: number;
  readonly expectedVersionId: string;
  readonly expectedWordingHash: string;
  readonly panels: AdapterReportPanelsDto;
}

export interface AdapterManagementEditWordingSuccess {
  readonly reportId: string;
  readonly status: "trainer_approved";
  readonly versionId: string;
  readonly wordingHash: string;
}

export interface AdapterManagementReturnToTrainerInput {
  readonly reportId: string;
  readonly expectedLockVersion: number;
  readonly expectedVersionId: string;
  readonly issueScope: AdapterIssueScope;
  readonly dimensionCode?: string;
  readonly reason: string;
}

export interface AdapterManagementReturnToTrainerSuccess {
  readonly reportId: string;
  readonly status: "needs_edit";
  readonly correctionRequestId: string;
  readonly parentVisible: false;
}

export interface AdapterManagementApproveAndSubmitInput {
  readonly reportId: string;
  readonly expectedLockVersion: number;
  readonly expectedVersionId: string;
  readonly expectedWordingHash: string;
}

export interface AdapterManagementApproveAndSubmitSuccess {
  readonly reportId: string;
  readonly status: "submitted";
  readonly submittedAt: string;
  readonly parentVisible: true;
}
