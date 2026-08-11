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
  /**
   * Hero Phase 3 (screen `05`). NULL means NOT RECORDED — omit the row.
   * ⚠️ `room` is descriptive only (G-6) and never scopes a query.
   * ⛔ One assigned trainer (`Main:`); there is no `Assist.` field (G-7).
   */
  readonly room: string | null;
  readonly trainerDisplayName: string | null;
  /**
   * Hero Phase 4 (screen `06`). NULL means NOT RECORDED — omit the element.
   * ⛔ Lesson IDENTITY only. There is no KEY FOCUS field and none may be
   * added (G-3): lesson-plan intent must never be rendered into, or beside,
   * the governed carried-over previous-session focus.
   */
  readonly lessonNumber: number | null;
  readonly lessonTitle: string | null;
}

export interface AdapterRosterEntryDto {
  readonly studentId: string;
  readonly displayName: string;
  readonly attendanceState: "present" | "absent";
  /**
   * Whether an `attendance` row exists. `attendanceState` is the EFFECTIVE
   * status including A-018's lazily-materialized Present default; this says
   * whether that default has actually been written. The governed CAS needs
   * the distinction and there is no force mode — see the same field on
   * `server/modules/report-workflow/trainer-projections.ts`.
   */
  readonly attendanceRecorded: boolean;
  readonly reportState: AdapterReportStatus | "no_report";
  readonly reportId: string | null;
  readonly previousSessionFocus: string | null;
}

/**
 * The governed Trainer Present/Absent control (A-018; Operator ruling G-04
 * item 3 — a GOVERNED FUNCTIONAL INSERTION on the existing roster surface,
 * not a new screen).
 *
 * `expectedStatus` is the caller's belief about the COMMITTED record and
 * `undefined` means "I believe no record exists yet". It is not optional in
 * the "leave it out if you don't care" sense: omitting it against a record
 * that exists is answered `stale_state`, exactly as a wrong value would be.
 */
export interface AdapterSetAttendanceInput {
  readonly sessionId: string;
  readonly studentId: string;
  readonly expectedStatus?: "present" | "absent";
  readonly newStatus: "present" | "absent";
}

export interface AdapterSetAttendanceSuccess {
  /** The status the DATABASE reports, never one asserted client-side. */
  readonly status: "present" | "absent";
  /** True when this call materialized A-018's Present default for the pair. */
  readonly initialized: boolean;
  /**
   * False when the call was a confirmed no-op — authorized, answered and
   * deliberately NOT audited, because A-029 records governed ACTIONS and a
   * no-op is not one. A surface must not report "saved" on `success` alone.
   */
  readonly changed: boolean;
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
  /**
   * Hero chain Phase 9 — the frame's Class, Lesson and Trainer columns and its
   * class filter. Session IDENTITY and SCHEDULING facts only.
   *
   * ⛔ None is a rating, observation, attendance value, evidence reference,
   * trainer note, checklist value, content hash, revision count or AI history,
   * so contract §5.5's exclusion list is untouched. ⛔ There is no term field
   * and G-4 means there must never be one.
   */
  readonly classModuleId?: string;
  readonly classGradeLabel?: string;
  readonly classModuleTitle?: string;
  readonly lessonNumber?: number;
  readonly lessonTitle?: string;
  readonly trainerDisplayName?: string;
  readonly submittedAt?: string;
}

export interface AdapterRatingSnapshotDto {
  readonly dimensionCode: AdapterDimensionCode;
  readonly displayName: string;
  readonly rating: AdapterRatingLevel;
}

export interface AdapterManagementReviewDto {
  /**
   * D-1 / C-10 — the nine per-dimension ratings, READ ONLY.
   * ⛔ C-9: report detail surfaces only — never on a queue or list DTO.
   * ⛔ G-2: nine pairs, never an aggregate.
   */
  readonly ratings: readonly AdapterRatingSnapshotDto[];
  readonly status: "trainer_approved";
  readonly lockVersion: number;
  readonly versionId: string;
  readonly panels: AdapterReportPanelsDto;
  readonly wordingHash: string;
  readonly submittedAt?: string;
  readonly openCorrectionScope?: AdapterIssueScope;
  readonly openCorrectionStatus?: "open" | "resolved";
}

/**
 * Hero Phase 2 (screen `32`). The five context fields are Class Grade,
 * Class Module, lesson number/title (G-3) and the assigned trainer (G-5).
 * ⛔ No rating in any vocabulary (Q-27, G-2), no observation, note, draft,
 * AI history, hash, revision number, status or audit row, and nothing
 * disclosing a correction cycle. NULL means NOT RECORDED — omit.
 */
export interface AdapterParentReportListItemDto {
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
}

/**
 * Hero Phase 1 display context. ⛔ No rating (Q-27, G-2), no observation,
 * note, draft, AI history, hash, revision number, status or audit row, and
 * nothing disclosing a correction cycle. NULL means NOT RECORDED — omit.
 */
export interface AdapterCanonicalReportContextDto {
  readonly studentDisplayName: string;
  readonly classGradeLabel: string;
  readonly classModuleTitle: string;
  readonly sessionDate: string;
  readonly lessonNumber: number | null;
  readonly lessonTitle: string | null;
  readonly trainerDisplayName: string | null;
}

export interface AdapterEvidenceClipDto {
  readonly id: string;
  readonly mediaType: string;
  readonly byteSize: number;
}

export interface AdapterCanonicalReportDto {
  readonly panels: AdapterReportPanelsDto;
  readonly submittedAt: string;
  readonly context: AdapterCanonicalReportContextDto | null;
  /**
   * ⛔ P1-5 — D-5's per-child clip, METADATA ONLY.
   *
   * No storage path and no URL: the key is derived server-side and a URL is
   * minted only on demand (A-001 gates 6 and 7). ⛔ No rating, dimension or
   * band — Q-27 governs this DTO, not merely the page drawn from it.
   */
  readonly evidence: readonly AdapterEvidenceClipDto[];
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

/**
 * Hero Phase 7 / `F-S6-REVIEW-1`. ⚠️ TWO FIELDS, DELIBERATELY. The client
 * supplies the note and the report identity and NOTHING else — no session id,
 * no student id, no ratings, no lock version. Session, student and centre are
 * DERIVED inside the RPC, so no governed rating round-trips through the
 * browser and the write cannot be aimed at another learner.
 */
export interface AdapterSaveFollowUpNotesInput {
  readonly reportId: string;
  readonly followUpNotes: string;
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
