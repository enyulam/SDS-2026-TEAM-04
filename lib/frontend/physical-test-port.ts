import type {
  AssessmentDraftDto,
  DimensionDto,
  DraftGenerationContextDto,
  RequestDraftInput,
  RequestDraftSuccess,
  ReturnedReportQueueItemDto,
  RosterEntryDto,
  SaveObservationInput,
  SaveObservationSuccess,
  SaveTrainerEditInput,
  SaveTrainerEditSuccess,
  SessionUserDto,
  TrainerApproveInput,
  TrainerApproveSuccess,
  TrainerSessionSummaryDto,
  TrainerWorkingReportDto,
  UpdateTrainerChecklistInput,
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
  trainerApprove(
    input: TrainerApproveInput,
  ): Promise<UiActionResult<TrainerApproveSuccess>>;
}
