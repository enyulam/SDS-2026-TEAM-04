import type {
  AvailabilityStateDto,
  AssessmentDraftDto,
  CanonicalReportDto,
  EvidenceViewUrlDto,
  EvidenceUploadTicketDto,
  EvidenceUploadTicketInput,
  EvidenceAttachSuccess,
  EvidenceAttachInput,
  ReportEvidenceClipDto,
  DimensionDto,
  DraftGenerationContextDto,
  ManagementApproveAndSubmitInput,
  ManagementApproveAndSubmitSuccess,
  AddClassOptionsDto,
  ClassCreationOutcomeDto,
  ClassEditDto,
  ClassOverviewDto,
  ClassUpdateOutcomeDto,
  CreateClassInput,
  UpdateClassInput,
  ManagementClassListDto,
  ManagementScheduleDto,
  ManagementLessonPlansDto,
  MaterialViewUrlDto,
  ManagementDashboardSummaryDto,
  ManagementStudentListDto,
  ManagementTrainerListDto,
  CreateTrainerInput,
  TrainerInvitationOutcomeDto,
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
  /**
   * P2-1 — screen `12` Management Classes. Takes NO parameter: the centre is
   * derived server-side from the caller's live active management membership,
   * exactly as the three queue reads do, so a caller cannot aim this at a
   * centre it does not hold.
   *
   * ⛔ It returns identity, enrolment and staffing facts only — no rating
   * (`C-9`), no roll-up (`G-2`), no term (`C-6`/`D-3`) and no lesson progress
   * (`REGISTERED-OMISSION`, ends when that data arrives).
   */
  listManagementClasses(): Promise<UiActionResult<ManagementClassListDto>>;
  /**
   * P2-2 — screen `26` Add Class. Also takes NO parameter, for the same
   * reason: the centre is server-derived from the caller's live active
   * management membership.
   */
  readAddClassOptions(): Promise<UiActionResult<AddClassOptionsDto>>;
  /**
   * P2-2 — the governed create.
   *
   * ✅ THE INPUT CARRIES A TRAINER MEMBERSHIP (`P2-2b`), or `null`. ⛔ It
   * carries NO class code, capacity, programme or TA slot (`C-14`, `A-016`,
   * `A-014`/`G-7`) — the type has nowhere to put one.
   *
   * ⚠️ ONE TRAINER ACROSS N DATES IS N ASSIGNMENTS, each its own governed
   * transaction and audit event, because `A-016` makes assignment
   * authoritative at CLASS-SESSION level.
   *
   * ⚠️ The weekday strip is a GENERATOR (`C-14`): this expands into one
   * governed transaction per dated session, each with its own audit event.
   * NO RECURRENCE RULE IS STORED and no duplicated calendar record is created
   * (`A-047`) — calendars are projections of these session rows.
   */
  createManagementClass(
    input: CreateClassInput,
  ): Promise<UiActionResult<ClassCreationOutcomeDto>>;
  /**
   * P2-3 — screen `27` Edit Class. Module-keyed; the centre is server-derived,
   * and a module outside it resolves to the same non-disclosing `unavailable`
   * a missing one does.
   */
  readClassForEdit(classModuleId: string): Promise<UiActionResult<ClassEditDto>>;
  /**
   * P2-4 — screen `13` Class Overview. Module-keyed; the centre is
   * server-derived, and a module outside it resolves to the same
   * non-disclosing `unavailable` a missing one does.
   */
  readClassOverview(classModuleId: string): Promise<UiActionResult<ClassOverviewDto>>;

  /**
   * `P2-5` — screen `25`. The window is a VIEW selector, not an authorization
   * input: the centre is server-derived and RLS decides every row regardless
   * of the dates asked for.
   */
  readManagementSchedule(
    fromDate: string,
    toDate: string,
  ): Promise<UiActionResult<ManagementScheduleDto>>;
  /**
   * `P2-6` — screen `14`. ⛔ A READ ONLY. Attach and remove are governed
   * mutations with their own audit strings and belong on their own signatures;
   * a projection that could also write is how a read RPC quietly becomes one.
   */
  readManagementLessonPlans(
    classModuleId: string,
  ): Promise<UiActionResult<ManagementLessonPlansDto | null>>;
  /**
   * ⛔ `P2-6R` — THE THREE WRITES THE READ ABOVE WAS SHIPPED WITHOUT.
   *
   * The comment above says attach and remove "belong on their own signatures".
   * ▶ `P2-6` wrote that sentence and then did not write the signatures, so the
   * three RPCs existed in the database, were granted to `authenticated`, and
   * were reachable from no application code — an unwired write path behind a
   * `disabled` button. `PDTa-WIRED` fails the build for that shape now.
   *
   * ⚠️ THREE MEMBERS, NOT EVIDENCE'S FOUR — Operator ruling, 2026-08-15. The
   * upload is a SERVER-ACTION RELAY, so the bytes come through the server and
   * the ticket/attach split has nothing left to buy. ▶ `D-5` splits them
   * because its bytes BYPASS the server; here splitting would only open a
   * window in which an object sits in the bucket referenced by no row.
   *
   * ⛔ `uploadMaterial` TAKES `FormData` because a `File` crosses a Server
   * Action boundary no other way. The upload runs on the CALLER'S OWN
   * request-scoped client, so the one storage INSERT policy applies exactly as
   * it would to a browser — which is why this needed no `T-P44` widening.
   *
   * ⚠️ IT IS NOT RESUMABLE. A dropped upload restarts from the beginning, and
   * the surface says so rather than implying otherwise.
   */
  uploadMaterial(form: FormData): Promise<UiActionResult<{ readonly materialId: string }>>;
  readMaterialViewUrl(materialId: string): Promise<UiActionResult<MaterialViewUrlDto>>;
  removeMaterial(materialId: string): Promise<UiActionResult<{ readonly removed: boolean }>>;
  /**
   * `P2-7` — screen `11`. ⛔ NO PARAMETER, and that is the authorization
   * boundary rather than a convenience: the centre is resolved from the
   * caller's own active management membership inside the database, so there
   * is no other centre a caller could name.
   */
  readManagementDashboardSummary(): Promise<UiActionResult<ManagementDashboardSummaryDto>>;
  /** `P2-8` — screen `17`. ⛔ A READ ONLY; registration and parent creation are `P2-12`/`P2-13`. */
  readManagementStudents(): Promise<UiActionResult<ManagementStudentListDto>>;
  /**
   * `P2-10` — screen `23`. ⛔ A READ ONLY; trainer creation is `P2-11` and
   * needs an audit string this read does not touch.
   * ⚠️ NO PARAMETER — the centre is the caller's own, resolved by RLS on every
   * hop rather than filtered here.
   */
  readManagementTrainers(): Promise<UiActionResult<ManagementTrainerListDto>>;
  /**
   * `P2-11` — screen `24`. The governed trainer invitation.
   *
   * ⛔ IT CREATES A PROFILE, NEVER A LOGIN. `accounts.auth_user_id` is NULL and
   * the membership is `pending`; the recipient establishes their own
   * credential (`A-020`, `A-025`, `A-027`). **No password, token or secret
   * crosses this signature in either direction** — and there is no column that
   * could hold one if it did.
   */
  createTrainer(input: CreateTrainerInput): Promise<UiActionResult<TrainerInvitationOutcomeDto>>;
  /**
   * P2-3 — the governed edit. ⛔ `27` can CHANGE a class and cannot DESTROY
   * one: the input type carries no session removal and no unassign, because
   * both need audit strings that do not exist.
   */
  updateManagementClass(
    input: UpdateClassInput,
  ): Promise<UiActionResult<ClassUpdateOutcomeDto>>;
  getParentAvailability(): Promise<UiActionResult<AvailabilityStateDto>>;
  listParentSubmittedReports(): Promise<
    UiActionResult<readonly ParentReportListItemDto[]>
  >;
  getCanonicalReport(
    sessionId: string,
    studentId: string,
  ): Promise<UiActionResult<CanonicalReportDto>>;

  /**
   * ⛔ P1-5 — D-5's per-child clip. ONE call mints ONE short-TTL URL and emits
   * ONE `evidence.accessed`, so an access recorded is an access a human asked
   * for. ⚠️ It is a SEPARATE method on purpose: folding it into
   * `getCanonicalReport` would fabricate an access on every page view and put
   * a live URL in the document for visits nobody made.
   * Returns a URL — never a storage path (A-001 gate 7), never a download (D-5).
   */
  mintEvidenceViewUrl(evidenceId: string): Promise<UiActionResult<EvidenceViewUrlDto>>;

  /**
   * ⛔ P1-2b — THE UPLOAD TRANSPORT. Four members, and the split between them
   * is the governance boundary, not a convenience.
   *
   * `createEvidenceUploadTicket` mints an id and derives a path — it authorizes
   * nothing. The bytes then go DIRECTLY from the browser to storage under the
   * one RLS INSERT policy (the bounded ADR-3 exception), where trainer
   * authority over the report in the path is re-derived live. `confirmEvidenceAttach`
   * is the GOVERNED ACT: until it succeeds the object is referenced by no row,
   * reachable by no read path, and is simply bytes with a name.
   *
   * ⚠️ `listReportEvidence` takes a REPORT ID ALONE. The session/student pair
   * is resolved server-side through the governed resolver, so a caller cannot
   * pair a report it may read with a learner it may not.
   */
  createEvidenceUploadTicket(
    input: EvidenceUploadTicketInput,
  ): Promise<UiActionResult<EvidenceUploadTicketDto>>;
  confirmEvidenceAttach(
    input: EvidenceAttachInput,
  ): Promise<UiActionResult<EvidenceAttachSuccess>>;
  removeEvidence(evidenceId: string): Promise<UiActionResult<{ readonly removed: boolean }>>;
  listReportEvidence(
    reportId: string,
  ): Promise<UiActionResult<readonly ReportEvidenceClipDto[]>>;

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
