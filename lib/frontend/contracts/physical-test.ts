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
  /**
   * The centre's Class Grade DISPLAY NAME, read from `class_grades.display_name`
   * (A-054 vocabulary, unchanged by Amendment 006). F16-C widened this from the
   * three-value literal union to `string`: the union was a fixture artefact, and
   * the real adapter must report the row the database actually holds rather than
   * coerce an unrecognised grade into one of three. Presentation keys off it with
   * an explicit default (see `CLASS_GRADE_TONE` in `features/trainer/trainer-schedule.tsx`).
   */
  readonly classGrade: string;
  readonly date: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly studentCount: number;
  readonly countsByReportState: Readonly<Partial<Record<ReportStatus, number>>>;
  /**
   * Hero Phase 3 (screen `05` Schedule Details).
   *
   * ⚠️ NULL MEANS NOT RECORDED — render by OMITTING the row. Never "TBC",
   * never a placeholder dash. (Distinct from `startTime`/`endTime`, which the
   * adapter reports as `""` for absent — those are rows the frame always
   * draws.)
   *
   * ⚠️ `room` is descriptive only (G-6): it carries no authorization meaning
   * and must never scope a query.
   * ⛔ `trainerDisplayName` is the single assigned trainer (`Main:`). There is
   * NO `Assist.` field and none may be added — G-7 keeps
   * `centre_membership_role` unextended and the TA persona deferred (A-014).
   */
  readonly room: string | null;
  readonly trainerDisplayName: string | null;
};

export type RosterEntryDto = {
  readonly studentId: string;
  readonly displayName: string;
  readonly attendanceState: "present" | "absent";
  /**
   * Whether an `attendance` ROW exists for this (session, student) pair.
   *
   * `attendanceState` is the EFFECTIVE status and already folds in A-018's
   * Present default; this reports whether that default has actually been
   * MATERIALIZED. The two are different committed states and the governed
   * compare-and-set distinguishes them — `expectedStatus: undefined` means "I
   * believe no record exists", and there is no force mode — so a toggle built
   * on `attendanceState` alone would send the wrong expectation for every
   * learner whose row has not been written yet.
   */
  readonly attendanceRecorded: boolean;
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
  /**
   * NULL when the governed backend has not created a report for this pair yet.
   * Report creation is owned by `requestDraft` (RPC-1) — saving an assessment
   * never advances the report lifecycle — so a first assessment legitimately
   * has no report identifier. F16-C widened this rather than let the real
   * adapter emit a fabricated or empty id.
   */
  readonly reportId: string | null;
  readonly sessionId: string;
  readonly studentId: string;
  readonly studentDisplayName: string;
  readonly ratings: readonly AssessmentRatingDto[];
  readonly notes: string;
  readonly followUp: string;
  readonly observationLockVersion: number;
};

export type ReportPanelsDto = {
  readonly overview: string;
  readonly strengths: string;
  readonly areasForDevelopment: string;
  readonly remarks: string;
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
  /**
   * C2C-004 added `submitted` — the governed referent of the Management
   * Reports page's "Approved" filter. Under A-036 `approved` is
   * transient-in-transaction and never commits, so it can never appear here.
   */
  readonly status: "trainer_approved" | "needs_edit" | "draft_ready" | "submitted";
  readonly openCorrectionScope?: CorrectionRequestDto["issueScope"];
  readonly openCorrectionStatus?: CorrectionRequestDto["status"];
  /** Present only on the correction-tracking projection for a request this fixture raised. */
  readonly openCorrectionReason?: string;
  /**
   * Present only on the submitted-list projection: the write-once publication
   * timestamp of the canonical submitted version. Publication METADATA — it
   * says when management published, never what was published.
   */
  readonly submittedAt?: string;
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

/**
 * A row of the parent's submitted-report list — hero Phase 2 (screen `32`).
 *
 * ⛔ THIS TYPE IS THE PARENT-FACING DISCLOSURE SURFACE FOR THE LIST, and it
 * is pinned as such by `prove:hero-2` leg P2-7, which asserts this exact
 * field set. The five context fields are Class Grade, Class Module, lesson
 * number/title (G-3) and the assigned trainer (G-5 — permitted on a Parent
 * surface precisely because it is NOT a rating and NOT derived from one).
 * Nothing here is a rating in any vocabulary (Q-27, G-2), an observation, a
 * trainer note, a draft, AI history, a content hash, a REVISION NUMBER, a
 * lifecycle status or an audit row, and nothing discloses that a correction
 * cycle is or was underway.
 *
 * ⚠️ NULL MEANS NOT RECORDED — render by OMITTING the element. Never
 * "Lesson 1", never "TBC", never a placeholder dash.
 */
export type ParentReportListItemDto = {
  readonly studentId: string;
  readonly studentDisplayName: string;
  readonly sessionId: string;
  readonly sessionDate: string;
  readonly submittedAt: string;
  readonly classGradeLabel: string | null;
  readonly classModuleTitle: string | null;
  readonly lessonNumber: number | null;
  readonly lessonTitle: string | null;
  readonly trainerDisplayName: string | null;
};

/**
 * Hero Phase 1 display context for the canonical report.
 *
 * ⛔ Nothing here is a rating (Q-27, G-2), an observation, a trainer note, a
 * draft, AI history, a content hash, a revision number, a lifecycle status or
 * an audit row, and nothing discloses that a correction cycle is or was
 * underway. The database returns exactly these seven fields.
 *
 * ⚠️ NULL MEANS NOT RECORDED — render by OMITTING the row. Never "Lesson 1",
 * never "TBC", never a placeholder dash.
 */
export type CanonicalReportContextDto = {
  readonly studentDisplayName: string;
  readonly classGradeLabel: string;
  readonly classModuleTitle: string;
  readonly sessionDate: string;
  readonly lessonNumber: number | null;
  readonly lessonTitle: string | null;
  readonly trainerDisplayName: string | null;
};

export type CanonicalReportDto = {
  readonly panels: ReportPanelsDto;
  readonly submittedAt: string;
  readonly context: CanonicalReportContextDto | null;
};

export type AvailabilityStateDto =
  | "available"
  | "none_yet"
  | "linked_unavailable";

export type SaveObservationInput = {
  /** Null before `requestDraft` creates the report — see `AssessmentDraftDto.reportId`. */
  readonly reportId: string | null;
  readonly sessionId: string;
  readonly studentId: string;
  readonly ratings: readonly AssessmentRatingDto[];
  readonly notes: string;
  readonly followUp: string;
  readonly observationLockVersion: number;
};

export type SaveObservationSuccess = {
  /** Null when no report exists yet — see `AssessmentDraftDto.reportId`. */
  readonly reportId: string | null;
  readonly observationLockVersion: number;
  /**
   * The report position the DATABASE reports after the save, or `no_report`
   * when the governed backend has not created one. F16-C widened this from the
   * single literal `"observation_saved"`: saving an assessment does not advance
   * the report lifecycle, so restating that one status would have been
   * TypeScript asserting a transition PostgreSQL never performed.
   */
  readonly status: ReportStatus | "no_report";
};

/**
 * The governed Trainer Present/Absent control (A-018; G-04 item 3).
 *
 * ⚠️ `expectedStatus` is the caller's belief about the COMMITTED record.
 * `undefined` means "I believe there is no record yet" — it is NOT "I don't
 * care". Omitting it against a record that exists is answered `stale_state`,
 * exactly as a wrong value would be. Derive it from `RosterEntryDto`:
 * `attendanceRecorded ? attendanceState : undefined`.
 */
export type SetAttendanceInput = {
  readonly sessionId: string;
  readonly studentId: string;
  readonly expectedStatus?: "present" | "absent";
  readonly newStatus: "present" | "absent";
};

export type SetAttendanceSuccess = {
  /** The status the DATABASE reports, never one asserted by the client. */
  readonly status: "present" | "absent";
  /** True when this call materialized A-018's Present default for the pair. */
  readonly initialized: boolean;
  /**
   * False when the call was a confirmed no-op — authorized, answered and
   * deliberately unaudited, because A-029 records governed ACTIONS and a
   * no-op is not one. A surface must not report "saved" on `success` alone.
   */
  readonly changed: boolean;
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
