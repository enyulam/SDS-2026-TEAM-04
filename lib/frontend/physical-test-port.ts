import type {
  AvailabilityStateDto,
  AssessmentDraftDto,
  CanonicalReportDto,
  DimensionDto,
  DraftGenerationContextDto,
  ManagementApproveAndSubmitInput,
  ManagementApproveAndSubmitSuccess,
  ManagementEditWordingInput,
  ManagementEditWordingSuccess,
  ManagementQueueRowDto,
  ManagementReturnToTrainerInput,
  ManagementReturnToTrainerSuccess,
  ManagementReviewDto,
  ParentReportListItemDto,
  RequestDraftInput,
  RequestDraftSuccess,
  ReturnedReportQueueItemDto,
  RosterEntryDto,
  SaveObservationInput,
  SaveObservationSuccess,
  SaveTrainerEditInput,
  SaveTrainerEditSuccess,
  SessionUserDto,
  SetAttendanceInput,
  SetAttendanceSuccess,
  TrainerApproveInput,
  TrainerApproveSuccess,
  TrainerSessionSummaryDto,
  TrainerWorkingReportDto,
  UpdateTrainerChecklistInput,
  SaveFollowUpNotesInput,
} from "./contracts/physical-test";
import type { UiActionResult } from "./contracts/result";

export type PhysicalTestAdapterIdentity =
  | {
      readonly kind: "deterministic_fixture";
      readonly label: "Deterministic frontend fixture";
      readonly participantEligible: false;
      readonly persistence: "browser_session_only";
    }
  | {
      readonly kind: "real_participant_adapter";
      readonly label: "Local participant adapter";
      readonly participantEligible: true;
      readonly persistence: "local_supabase";
    };

export interface PhysicalTestPort {
  readonly identity: PhysicalTestAdapterIdentity;

  getSessionUser(): Promise<UiActionResult<SessionUserDto>>;
  listTrainerSessions(): Promise<
    UiActionResult<readonly TrainerSessionSummaryDto[]>
  >;
  getSessionRoster(
    sessionId: string,
  ): Promise<UiActionResult<readonly RosterEntryDto[]>>;
  getDimensions(): Promise<UiActionResult<readonly DimensionDto[]>>;
  getAssessmentDraft(
    sessionId: string,
    studentId: string,
  ): Promise<UiActionResult<AssessmentDraftDto>>;
  getTrainerWorkingReport(
    reportId: string,
  ): Promise<UiActionResult<TrainerWorkingReportDto>>;
  getDraftGenerationContext(
    reportId: string,
  ): Promise<UiActionResult<DraftGenerationContextDto>>;
  listReturnedReports(): Promise<
    UiActionResult<readonly ReturnedReportQueueItemDto[]>
  >;
  listManagementPendingReviews(): Promise<
    UiActionResult<readonly ManagementQueueRowDto[]>
  >;
  listManagementCorrectionTracking(): Promise<
    UiActionResult<readonly ManagementQueueRowDto[]>
  >;
  /**
   * C2C-004 — the Management "Approved" list. Backed by the governed
   * `report_list_management_submitted` boundary, which takes no parameters,
   * derives the centre from the caller's live active management membership
   * and admits only reports that have committed at `submitted`. It returns
   * publication metadata only; no preapproval Trainer draft content can reach
   * it because the SQL projection carries no column that could hold any.
   */
  listManagementSubmittedReports(): Promise<
    UiActionResult<readonly ManagementQueueRowDto[]>
  >;
  /**
   * C2C-004 — the canonical SUBMITTED report, for the one Management surface
   * an Approved row opens. It reuses the ratified status-gated read RPC-15
   * (`report_get_management_review`), which already returns the published
   * panels at `submitted`; nothing about that boundary is widened here. A
   * report at any other status resolves to the same non-disclosing
   * `unavailable` outcome a missing report does.
   */
  getManagementSubmittedReport(
    reportId: string,
  ): Promise<UiActionResult<CanonicalReportDto>>;
  getManagementReview(
    reportId: string,
  ): Promise<UiActionResult<ManagementReviewDto>>;
  getParentAvailability(): Promise<UiActionResult<AvailabilityStateDto>>;
  listParentSubmittedReports(): Promise<
    UiActionResult<readonly ParentReportListItemDto[]>
  >;
  getCanonicalReport(
    sessionId: string,
    studentId: string,
  ): Promise<UiActionResult<CanonicalReportDto>>;

  /**
   * A-018's governed Trainer Present/Absent control, and the FIRST governed
   * write of the whole report lifecycle. It was absent from this port until
   * Stage 2: `attendance` carried three SELECT policies and no INSERT/UPDATE
   * policy, so the table was writable by nobody and the lifecycle's entry
   * condition was being satisfied by a hand-seeded harness row rather than by
   * a governed write.
   */
  setAttendance(
    input: SetAttendanceInput,
  ): Promise<UiActionResult<SetAttendanceSuccess>>;
  saveObservation(
    input: SaveObservationInput,
  ): Promise<UiActionResult<SaveObservationSuccess>>;
  requestDraft(
    input: RequestDraftInput,
  ): Promise<UiActionResult<RequestDraftSuccess>>;
  saveTrainerEdit(
    input: SaveTrainerEditInput,
  ): Promise<UiActionResult<SaveTrainerEditSuccess>>;
  updateTrainerChecklist(
    input: UpdateTrainerChecklistInput,
  ): Promise<UiActionResult<TrainerWorkingReportDto>>;
  /**
   * Hero Phase 7 / `F-S6-REVIEW-1` — the governed follow-up note save from the
   * Review & Approve workflow surface (`CLAUDE.md` §6, D-2 ruled EDITABLE).
   *
   * ⚠️ Two fields only: the note and the report identity. Session, student and
   * centre are DERIVED server-side, so no governed rating round-trips through
   * the client and the write cannot be aimed at another learner. It writes
   * `observations.follow_up_notes` and nothing else — no lock bump, no rating
   * row, no status change, no audit event.
   */
  saveFollowUpNotes(
    input: SaveFollowUpNotesInput,
  ): Promise<UiActionResult<TrainerWorkingReportDto>>;
  trainerApprove(
    input: TrainerApproveInput,
  ): Promise<UiActionResult<TrainerApproveSuccess>>;
  managementEditWording(
    input: ManagementEditWordingInput,
  ): Promise<UiActionResult<ManagementEditWordingSuccess>>;
  managementReturnToTrainer(
    input: ManagementReturnToTrainerInput,
  ): Promise<UiActionResult<ManagementReturnToTrainerSuccess>>;
  managementApproveAndSubmit(
    input: ManagementApproveAndSubmitInput,
  ): Promise<UiActionResult<ManagementApproveAndSubmitSuccess>>;
}

export type FixturePhysicalTestPort = PhysicalTestPort & {
  readonly identity: Extract<
    PhysicalTestAdapterIdentity,
    { readonly kind: "deterministic_fixture" }
  >;
};

export type RealParticipantPhysicalTestPort = PhysicalTestPort & {
  readonly identity: Extract<
    PhysicalTestAdapterIdentity,
    { readonly kind: "real_participant_adapter" }
  >;
};
