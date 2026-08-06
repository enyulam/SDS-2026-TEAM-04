/**
 * The ratified four-level competency-rating vocabulary (Amendment 006 A-049).
 *
 * Ordered LOW to HIGH, arity 4, applied to all nine dimensions, all nine
 * mandatory (A-017). `developing` is unchanged in both value and ordinal
 * position — that is why the authorized backend migration renames exactly
 * three labels, not four. There is no fifth level.
 *
 * This union must agree EXACTLY with the backend's `RATING_LEVELS` in
 * `server/modules/framework/dimensions.ts`. A-049's R-A6-5 ruling deliberately
 * keeps the two declarations separate rather than unifying them; a divergence
 * is a defect, not a variant.
 *
 * The Class Grade vocabulary — `Beginner` / `Intermediate` / `Advanced` — is a
 * DIFFERENT, unchanged vocabulary (A-054) and is declared separately on the
 * session DTOs below. `Advanced` is no longer a competency rating and IS still
 * a Class Grade.
 */
export const RATING_LEVELS = [
  "beginning",
  "developing",
  "mastering",
  "mastered",
] as const;

export type RatingLevel = (typeof RATING_LEVELS)[number];

export const DIMENSION_CODES = [
  "body",
  "emotion",
  "speech",
  "tonality",
  "eye_contact",
  "vocal_projection",
  "emotional_expression",
  "sentence_flow",
  "audience_awareness",
] as const;

export type DimensionCode = (typeof DIMENSION_CODES)[number];

export type DimensionGroup = "competency" | "speech_linguistics";

export type ReportStatus =
  | "incomplete"
  | "observation_saved"
  | "drafting"
  | "draft_ready"
  | "needs_edit"
  | "trainer_approved"
  | "approved"
  | "submitted";

export type SessionRole = "trainer" | "management" | "parent";

export type SessionUserDto = {
  readonly displayName: string;
  readonly role: SessionRole;
  readonly centreDisplayName: string;
};

export type TrainerSessionSummaryDto = {
  readonly sessionId: string;
  readonly moduleName: string;
  readonly classGrade: "Beginner" | "Intermediate" | "Advanced";
  readonly date: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly studentCount: number;
  readonly countsByReportState: Readonly<Partial<Record<ReportStatus, number>>>;
};

export type RosterEntryDto = {
  readonly studentId: string;
  readonly displayName: string;
  readonly attendanceState: "present" | "absent";
  readonly reportState: ReportStatus | "no_report";
  readonly reportId: string | null;
  readonly previousSessionFocus: string | null;
};

export type DimensionDto = {
  readonly dimensionCode: DimensionCode;
  readonly group: DimensionGroup;
  readonly displayName: string;
  readonly focus: string;
  readonly ordinal: number;
  readonly rubricAnchors: Readonly<Record<RatingLevel, string>>;
};

export type AssessmentRatingDto = {
  readonly dimensionCode: DimensionCode;
  readonly rating: RatingLevel | null;
};

export type AssessmentDraftDto = {
  readonly reportId: string;
  readonly sessionId: string;
  readonly studentId: string;
  readonly studentDisplayName: string;
  readonly ratings: readonly AssessmentRatingDto[];
  readonly notes: string;
  readonly followUp: string;
  readonly observationLockVersion: number;
};

export type ReportPanelsDto = {
  readonly todaysStrength: string;
  readonly nextFocus: string;
  readonly practiceSuggestion: string;
  readonly sessionTakeaway: string;
};

export type ChecklistDto = {
  readonly evidenceConfirmed: boolean;
  readonly aiDraftReviewed: boolean;
  readonly privacyChecked: boolean;
};

export type CorrectionRequestDto = {
  readonly id: string;
  readonly issueScope: "rating" | "observation" | "derived_assessment_fact";
  readonly dimensionCode?: DimensionCode;
  readonly status: "open" | "resolved";
  readonly reason?: string;
};

export type ReportRatingSnapshotDto = {
  readonly dimensionCode: DimensionCode;
  readonly displayName: string;
  readonly rating: RatingLevel;
};

export type TrainerWorkingReportDto = {
  readonly reportId: string;
  readonly sessionId: string;
  readonly studentId: string;
  readonly studentDisplayName: string;
  readonly sessionDate: string;
  readonly status: ReportStatus;
  readonly lockVersion: number;
  readonly versionId: string;
  readonly revisionNumber: number;
  readonly panels: ReportPanelsDto;
  readonly contentHash: string;
  readonly checklist: {
    readonly evidenceConfirmed: boolean | null;
    readonly aiDraftReviewed: boolean | null;
    readonly privacyChecked: boolean | null;
  };
  readonly ratingSnapshots: readonly ReportRatingSnapshotDto[];
  readonly canonicalPointer: {
    readonly latestSubmittedVersionId: string | null;
    readonly submittedAt: string | null;
  };
  readonly coachNotes: string;
  readonly openCorrection?: CorrectionRequestDto;
};

export type ReturnedReportQueueItemDto = {
  readonly reportId: string;
  readonly sessionId: string;
  readonly studentId: string;
  readonly studentDisplayName: string;
  readonly sessionDate: string;
  readonly correction: CorrectionRequestDto;
};

export type ManagementQueueRowDto = {
  readonly reportId: string;
  readonly sessionId: string;
  readonly studentId: string;
  readonly studentDisplayName: string;
  readonly sessionDate: string;
  readonly status: "trainer_approved" | "needs_edit" | "draft_ready";
  readonly openCorrectionScope?: CorrectionRequestDto["issueScope"];
  readonly openCorrectionStatus?: CorrectionRequestDto["status"];
  /** Present only on the correction-tracking projection for a request this fixture raised. */
  readonly openCorrectionReason?: string;
};

export type ManagementReviewDto = {
  readonly status: "trainer_approved";
  readonly lockVersion: number;
  readonly versionId: string;
  readonly panels: ReportPanelsDto;
  readonly wordingHash: string;
  readonly submittedAt?: string;
  readonly openCorrectionScope?: CorrectionRequestDto["issueScope"];
  readonly openCorrectionStatus?: CorrectionRequestDto["status"];
};

export type ParentReportListItemDto = {
  readonly studentId: string;
  readonly studentDisplayName: string;
  readonly sessionId: string;
  readonly sessionDate: string;
  readonly submittedAt: string;
};

export type CanonicalReportDto = {
  readonly panels: ReportPanelsDto;
  readonly submittedAt: string;
};

export type AvailabilityStateDto =
  | "available"
  | "none_yet"
  | "linked_unavailable";

export type SaveObservationInput = {
  readonly reportId: string;
  readonly sessionId: string;
  readonly studentId: string;
  readonly ratings: readonly AssessmentRatingDto[];
  readonly notes: string;
  readonly followUp: string;
  readonly observationLockVersion: number;
};

export type SaveObservationSuccess = {
  readonly reportId: string;
  readonly observationLockVersion: number;
  readonly status: "observation_saved";
};

export type RequestDraftInput = {
  readonly reportId: string;
  readonly observationLockVersion: number;
};

export type DraftGenerationContextDto = {
  readonly reportId: string;
  readonly studentDisplayName: string;
  readonly observationLockVersion: number;
  readonly status: "observation_saved" | "draft_ready";
};

export type RequestDraftSuccess = {
  readonly reportId: string;
  readonly status: "draft_ready";
  readonly versionId: string;
};

export type SaveTrainerEditInput = {
  readonly reportId: string;
  readonly expectedLockVersion: number;
  readonly expectedVersionId: string;
  readonly panels: ReportPanelsDto;
  readonly reaffirmCorrectionRequestId?: string;
};

export type SaveTrainerEditSuccess = {
  readonly reportId: string;
  readonly status: "draft_ready";
  readonly versionId: string;
  readonly checklistReset: true;
  readonly correctionResolved: boolean;
};

export type UpdateTrainerChecklistInput = {
  readonly reportId: string;
  readonly expectedVersionId: string;
  readonly checklist: ChecklistDto;
};

export type TrainerApproveInput = {
  readonly reportId: string;
  readonly expectedLockVersion: number;
  readonly expectedVersionId: string;
  readonly expectedContentHash: string;
};

export type TrainerApproveSuccess = {
  readonly reportId: string;
  readonly status: "trainer_approved";
  readonly published: false;
  readonly managementReviewRequired: true;
};

export type ManagementEditWordingInput = {
  readonly reportId: string;
  readonly expectedLockVersion: number;
  readonly expectedVersionId: string;
  readonly expectedWordingHash: string;
  readonly panels: ReportPanelsDto;
};

export type ManagementEditWordingSuccess = {
  readonly reportId: string;
  readonly status: "trainer_approved";
  readonly versionId: string;
  readonly wordingHash: string;
};

export type ManagementReturnToTrainerInput = {
  readonly reportId: string;
  readonly expectedLockVersion: number;
  readonly expectedVersionId: string;
  readonly issueScope: CorrectionRequestDto["issueScope"];
  readonly dimensionCode?: DimensionCode;
  readonly reason: string;
};

export type ManagementReturnToTrainerSuccess = {
  readonly reportId: string;
  readonly status: "needs_edit";
  readonly correctionRequestId: string;
  readonly parentVisible: false;
};

export type ManagementApproveAndSubmitInput = {
  readonly reportId: string;
  readonly expectedLockVersion: number;
  readonly expectedVersionId: string;
  readonly expectedWordingHash: string;
};

export type ManagementApproveAndSubmitSuccess = {
  readonly reportId: string;
  readonly status: "submitted";
  readonly submittedAt: string;
  readonly parentVisible: true;
};
