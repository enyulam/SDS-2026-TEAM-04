export const RATING_LEVELS = [
  "emerging",
  "developing",
  "secure",
  "advanced",
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
