/**
 * F16-C — the REAL participant `PhysicalTestPort`.
 *
 * WHAT IT IS. A thin, non-deciding client-side binding of the 24 port members
 * (23 until Stage 2 added `setAttendance`, A-018's governed Present/Absent
 * write — the lifecycle's first governed write, which no surface had ever
 * exercised)
 * onto the governed Server Actions in
 * `server/modules/integration-adapter/participant-actions.ts`. It holds no
 * state, no cache, no fallback data and no simulation. Every member either
 * returns exactly what a governed action returned, or returns an explicit
 * non-success `UiActionResult` — nothing is stubbed to look like it works.
 *
 * WHAT IT NEVER DOES.
 *  - It never talks to the database. There is no Supabase client, no `fetch`
 *    to PostgREST and no SQL anywhere in this file; the only outbound calls
 *    are Server Actions, each of which builds a REQUEST-SCOPED client from the
 *    caller's own cookies.
 *  - It never reaches `server/platform/supabase/elevated.ts`, directly or
 *    transitively.
 *  - It never sends a session id or a student id for a REPORT-keyed read. The
 *    three report-keyed reads (`getTrainerWorkingReport`,
 *    `getDraftGenerationContext`, `getManagementReview`) send the report id
 *    alone; the server resolves the pair through the governed
 *    `report_resolve_context` using the caller's live session.
 *  - It never reads the `role` query parameter, a cookie or a header. Role is
 *    server-derived on every call.
 *
 * RESULT MAPPING. The backend's `ActionResult<T>` and the frontend's
 * `UiActionResult<T>` are, by ratified design, the same union field for field
 * (`server/contracts/action-result.ts` header). The bindings below therefore
 * return the action's result directly and let `tsc` prove the two sides agree
 * — a divergence is a compile error here, which is exactly where the contract
 * says it should surface.
 *
 * KNOWN, DELIBERATE GAP (recorded, not hidden). `saveObservation` cannot
 * return a report identifier for a pair that has no report yet: report
 * creation is owned by `requestDraft` (RPC-1) by ratified operator ruling, so
 * saving an assessment never advances the report lifecycle. The port therefore
 * reports `reportId: null`, and the assessment surface renders a success state
 * WITHOUT a "continue to draft" link rather than linking to a fabricated id.
 */

import type {
  AssessmentDraftDto,
  AvailabilityStateDto,
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
  ManagementStudentProfileDto,
  LessonStatisticsDto,
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
} from "../contracts/physical-test";
import type { UiActionResult } from "../contracts/result";
import type {
  PhysicalTestAdapterIdentity,
  RealParticipantPhysicalTestPort,
} from "../physical-test-port";
import {
  adapterGetAssessmentDraft,
  adapterGetCanonicalReport,
  adapterMintEvidenceViewUrl,
  adapterCreateEvidenceUploadTicket,
  adapterConfirmEvidenceAttach,
  adapterRemoveEvidence,
  adapterListReportEvidence,
  adapterGetDimensions,
  adapterGetDraftGenerationContext,
  adapterGetManagementReview,
  adapterGetParentAvailability,
  adapterGetSessionRoster,
  adapterGetSessionUser,
  adapterGetTrainerWorkingReport,
  adapterGetManagementSubmittedReport,
  adapterCreateManagementClass,
  adapterReadClassForEdit,
  adapterReadClassOverview,
  adapterUpdateManagementClass,
  adapterListManagementClasses,
  adapterReadManagementSchedule,
  adapterReadLessonPlans,
  adapterUploadMaterial,
  adapterReadMaterialViewUrl,
  adapterRemoveMaterial,
  adapterReadDashboardSummary,
  adapterReadManagementStudents,
  adapterReadManagementTrainers,
  adapterCreateTrainer,
  adapterReadManagementStudentProfile,
  adapterReadLessonStatistics,
  adapterReadAddClassOptions,
  adapterListManagementCorrectionTracking,
  adapterListManagementPendingReviews,
  adapterListManagementSubmittedReports,
  adapterListParentSubmittedReports,
  adapterListReturnedReports,
  adapterListTrainerSessions,
  adapterManagementApproveAndSubmit,
  adapterManagementEditWording,
  adapterManagementReturnToTrainer,
  adapterRequestDraft,
  adapterSaveObservation,
  adapterSaveTrainerEdit,
  adapterSetAttendance,
  adapterTrainerApprove,
  adapterUpdateTrainerChecklist,
  adapterSaveFollowUpNotes,
} from "@/server/modules/integration-adapter/participant-actions";

const REAL_PARTICIPANT_IDENTITY: Extract<
  PhysicalTestAdapterIdentity,
  { readonly kind: "real_participant_adapter" }
> = {
  kind: "real_participant_adapter",
  label: "Local participant adapter",
  participantEligible: true,
  persistence: "local_supabase",
};

/**
 * A network/transport fault reaching the client (a Server Action that failed
 * to reach the server at all) is reported as the RETRYABLE class with a
 * message that names no host, no route, no row and no environment value.
 */
function transportFailure(): UiActionResult<never> {
  return {
    outcome: "retryable_failure",
    message: "The service is temporarily unreachable. Try again.",
  };
}

async function guard<T>(call: () => Promise<UiActionResult<T>>): Promise<UiActionResult<T>> {
  try {
    return await call();
  } catch {
    // The thrown value is deliberately not inspected, forwarded or logged: it
    // may carry a URL, a header or a driver message.
    return transportFailure();
  }
}

export function createRealParticipantPhysicalTestPort(): RealParticipantPhysicalTestPort {
  return {
    identity: REAL_PARTICIPANT_IDENTITY,

    // ---- reads -------------------------------------------------------
    getSessionUser(): Promise<UiActionResult<SessionUserDto>> {
      return guard(() => adapterGetSessionUser());
    },

    listTrainerSessions(): Promise<UiActionResult<readonly TrainerSessionSummaryDto[]>> {
      return guard(() => adapterListTrainerSessions());
    },

    getSessionRoster(sessionId: string): Promise<UiActionResult<readonly RosterEntryDto[]>> {
      return guard(() => adapterGetSessionRoster(sessionId));
    },

    getDimensions(): Promise<UiActionResult<readonly DimensionDto[]>> {
      return guard(() => adapterGetDimensions());
    },

    getAssessmentDraft(
      sessionId: string,
      studentId: string,
    ): Promise<UiActionResult<AssessmentDraftDto>> {
      return guard(() => adapterGetAssessmentDraft(sessionId, studentId));
    },

    /** Report-keyed: the pair is resolved SERVER-SIDE from the report id alone. */
    getTrainerWorkingReport(reportId: string): Promise<UiActionResult<TrainerWorkingReportDto>> {
      return guard(() => adapterGetTrainerWorkingReport(reportId));
    },

    /** Report-keyed: as above. */
    getDraftGenerationContext(
      reportId: string,
    ): Promise<UiActionResult<DraftGenerationContextDto>> {
      return guard(() => adapterGetDraftGenerationContext(reportId));
    },

    listReturnedReports(): Promise<UiActionResult<readonly ReturnedReportQueueItemDto[]>> {
      return guard(() => adapterListReturnedReports());
    },

    listManagementPendingReviews(): Promise<UiActionResult<readonly ManagementQueueRowDto[]>> {
      return guard(() => adapterListManagementPendingReviews());
    },

    listManagementCorrectionTracking(): Promise<UiActionResult<readonly ManagementQueueRowDto[]>> {
      return guard(() => adapterListManagementCorrectionTracking());
    },

    /** C2C-004 — the governed "Approved" (`submitted`) list. */
    listManagementSubmittedReports(): Promise<UiActionResult<readonly ManagementQueueRowDto[]>> {
      return guard(() => adapterListManagementSubmittedReports());
    },

    /** Report-keyed: the pair is resolved SERVER-SIDE from the report id alone. */
    getManagementSubmittedReport(reportId: string): Promise<UiActionResult<CanonicalReportDto>> {
      return guard(() => adapterGetManagementSubmittedReport(reportId));
    },

    /** Report-keyed: as above. */
    getManagementReview(reportId: string): Promise<UiActionResult<ManagementReviewDto>> {
      return guard(() => adapterGetManagementReview(reportId));
    },

    /** P2-1 — screen `12`. No parameter: the centre is server-derived. */
    listManagementClasses(): Promise<UiActionResult<ManagementClassListDto>> {
      return guard(() => adapterListManagementClasses());
    },

    /** P2-2 — screen `26`. Same: no parameter, centre server-derived. */
    readAddClassOptions(): Promise<UiActionResult<AddClassOptionsDto>> {
      return guard(() => adapterReadAddClassOptions());
    },

    /**
     * P2-2 — the governed create. ⛔ Carries no trainer, no class code, no
     * capacity and no programme, because the input type has nowhere to put
     * one.
     */
    createManagementClass(
      input: CreateClassInput,
    ): Promise<UiActionResult<ClassCreationOutcomeDto>> {
      return guard(() => adapterCreateManagementClass(input));
    },

    /** P2-3 — screen `27`. Module-keyed; the centre is server-derived. */
    readClassForEdit(classModuleId: string): Promise<UiActionResult<ClassEditDto>> {
      return guard(() => adapterReadClassForEdit(classModuleId));
    },

    /** P2-4 — screen `13`. Two governed reads behind one call. */
    readClassOverview(classModuleId: string): Promise<UiActionResult<ClassOverviewDto>> {
      return guard(() => adapterReadClassOverview(classModuleId));
    },

    /** P2-5 — screen `25`. The window is a view selector; the centre is server-derived. */
    readManagementSchedule(
      fromDate: string,
      toDate: string,
    ): Promise<UiActionResult<ManagementScheduleDto>> {
      return guard(() => adapterReadManagementSchedule(fromDate, toDate));
    },

    /** `P2-6` — screen `14`. A read; the two mutations are separate signatures. */
    readManagementLessonPlans(
      classModuleId: string,
    ): Promise<UiActionResult<ManagementLessonPlansDto | null>> {
      return guard(() => adapterReadLessonPlans(classModuleId));
    },

    /*
     * ⛔ `P2-6R` — the three bindings `P2-6` never wrote. The bytes do NOT pass
     * through here; they go browser-direct to the private bucket under the one
     * INSERT policy. ▶ What crosses HERE is the ticket, the governed attach,
     * the governed removal and the short-TTL view URL.
     */
    uploadMaterial(form: FormData): Promise<UiActionResult<{ readonly materialId: string }>> {
      return guard(() => adapterUploadMaterial(form));
    },

    readMaterialViewUrl(materialId: string): Promise<UiActionResult<MaterialViewUrlDto>> {
      return guard(() => adapterReadMaterialViewUrl(materialId));
    },

    removeMaterial(materialId: string): Promise<UiActionResult<{ readonly removed: boolean }>> {
      return guard(() => adapterRemoveMaterial(materialId));
    },

    /** `P2-7` — screen `11`. No parameter: the centre is the caller's own. */
    readManagementDashboardSummary(): Promise<UiActionResult<ManagementDashboardSummaryDto>> {
      return guard(() => adapterReadDashboardSummary());
    },

    readManagementTrainers(): Promise<UiActionResult<ManagementTrainerListDto>> {
      return guard(() => adapterReadManagementTrainers());
    },

    /**
     * `P2-11` — screen `24`. ⛔ Three fields, because the input type has
     * nowhere to put a role, a phone, an employee id or a photo. Creating a
     * PROFILE, never a login.
     */
    createTrainer(input: CreateTrainerInput): Promise<UiActionResult<TrainerInvitationOutcomeDto>> {
      return guard(() => adapterCreateTrainer(input));
    },

    readManagementStudents(): Promise<UiActionResult<ManagementStudentListDto>> {
      return guard(() => adapterReadManagementStudents());
    },

    /** `P2-9` — screen `18`. ⛔ No rating field exists in the returned type. */
    readManagementStudentProfile(
      studentId: string,
    ): Promise<UiActionResult<ManagementStudentProfileDto>> {
      return guard(() => adapterReadManagementStudentProfile(studentId));
    },

    /** `P2-15` — screen `15`. ⛔ Counts only. */
    readLessonStatistics(classSessionId: string): Promise<UiActionResult<LessonStatisticsDto>> {
      return guard(() => adapterReadLessonStatistics(classSessionId));
    },

    /** P2-3 — the governed edit. Carries no removal and no unassign. */
    updateManagementClass(
      input: UpdateClassInput,
    ): Promise<UiActionResult<ClassUpdateOutcomeDto>> {
      return guard(() => adapterUpdateManagementClass(input));
    },

    getParentAvailability(): Promise<UiActionResult<AvailabilityStateDto>> {
      return guard(() => adapterGetParentAvailability());
    },

    listParentSubmittedReports(): Promise<UiActionResult<readonly ParentReportListItemDto[]>> {
      return guard(() => adapterListParentSubmittedReports());
    },

    getCanonicalReport(
      sessionId: string,
      studentId: string,
    ): Promise<UiActionResult<CanonicalReportDto>> {
      return guard(() => adapterGetCanonicalReport(sessionId, studentId));
    },

    /*
     * ⛔ P1-5. One call, one mint, one `evidence.accessed`. The elevated
     * client used behind this signs a path the governed RPC has ALREADY
     * authorized — it never decides who may view.
     */
    mintEvidenceViewUrl(evidenceId: string): Promise<UiActionResult<EvidenceViewUrlDto>> {
      return guard(() => adapterMintEvidenceViewUrl(evidenceId));
    },

    /*
     * ⛔ P1-2b. The bytes do NOT pass through these bindings — they go from
     * the browser straight to storage under the one RLS INSERT policy
     * (). ▶ What crosses HERE is the ticket,
     * the governed attach, the governed removal and the list.
     */
    createEvidenceUploadTicket(
      input: EvidenceUploadTicketInput,
    ): Promise<UiActionResult<EvidenceUploadTicketDto>> {
      return guard(() => adapterCreateEvidenceUploadTicket(input));
    },

    confirmEvidenceAttach(
      input: EvidenceAttachInput,
    ): Promise<UiActionResult<EvidenceAttachSuccess>> {
      return guard(() => adapterConfirmEvidenceAttach(input));
    },

    removeEvidence(evidenceId: string): Promise<UiActionResult<{ readonly removed: boolean }>> {
      return guard(() => adapterRemoveEvidence(evidenceId));
    },

    listReportEvidence(
      reportId: string,
    ): Promise<UiActionResult<readonly ReportEvidenceClipDto[]>> {
      return guard(() => adapterListReportEvidence(reportId));
    },

    // ---- writes ------------------------------------------------------
    /**
     * A-018's Present/Absent control — the lifecycle's FIRST governed write.
     * `expectedStatus` is forwarded exactly as the surface derived it; this
     * binding neither supplies a default for it nor retries on `stale_state`,
     * because either would be a force mode the governed RPC deliberately does
     * not offer.
     */
    setAttendance(input: SetAttendanceInput): Promise<UiActionResult<SetAttendanceSuccess>> {
      return guard(() => adapterSetAttendance(input));
    },

    saveObservation(input: SaveObservationInput): Promise<UiActionResult<SaveObservationSuccess>> {
      return guard(() =>
        adapterSaveObservation({
          reportId: input.reportId,
          sessionId: input.sessionId,
          studentId: input.studentId,
          ratings: input.ratings,
          notes: input.notes,
          followUp: input.followUp,
          observationLockVersion: input.observationLockVersion,
        }),
      );
    },

    requestDraft(input: RequestDraftInput): Promise<UiActionResult<RequestDraftSuccess>> {
      return guard(() => adapterRequestDraft(input));
    },

    saveTrainerEdit(input: SaveTrainerEditInput): Promise<UiActionResult<SaveTrainerEditSuccess>> {
      return guard(() => adapterSaveTrainerEdit(input));
    },

    updateTrainerChecklist(
      input: UpdateTrainerChecklistInput,
    ): Promise<UiActionResult<TrainerWorkingReportDto>> {
      return guard(() => adapterUpdateTrainerChecklist(input));
    },

    /**
     * Hero Phase 7 / `F-S6-REVIEW-1`. Two fields cross this boundary — the
     * note and the report identity. Session, student and centre are DERIVED
     * inside the governed RPC, so no rating round-trips through the client.
     */
    saveFollowUpNotes(
      input: SaveFollowUpNotesInput,
    ): Promise<UiActionResult<TrainerWorkingReportDto>> {
      return guard(() => adapterSaveFollowUpNotes(input));
    },

    /** Freezes a version. PUBLISHES NOTHING (A-020). */
    trainerApprove(input: TrainerApproveInput): Promise<UiActionResult<TrainerApproveSuccess>> {
      return guard(() => adapterTrainerApprove(input));
    },

    /** WORDING ONLY — the four panels are the whole mutable surface. */
    managementEditWording(
      input: ManagementEditWordingInput,
    ): Promise<UiActionResult<ManagementEditWordingSuccess>> {
      return guard(() => adapterManagementEditWording(input));
    },

    managementReturnToTrainer(
      input: ManagementReturnToTrainerInput,
    ): Promise<UiActionResult<ManagementReturnToTrainerSuccess>> {
      return guard(() => adapterManagementReturnToTrainer(input));
    },

    /** The ONLY publication in the system, and it is a management action. */
    managementApproveAndSubmit(
      input: ManagementApproveAndSubmitInput,
    ): Promise<UiActionResult<ManagementApproveAndSubmitSuccess>> {
      return guard(() => adapterManagementApproveAndSubmit(input));
    },
  };
}
