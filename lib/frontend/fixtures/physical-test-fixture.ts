import {
  DIMENSION_CODES,
  type AssessmentDraftDto,
  type AssessmentRatingDto,
  type ChecklistDto,
  type CorrectionRequestDto,
  type DimensionCode,
  type DraftGenerationContextDto,
  type RatingLevel,
  type ReportPanelsDto,
  type ReportStatus,
  type RequestDraftInput,
  type RequestDraftSuccess,
  type ReturnedReportQueueItemDto,
  type RosterEntryDto,
  type SaveObservationInput,
  type SaveObservationSuccess,
  type SaveTrainerEditInput,
  type SaveTrainerEditSuccess,
  type SessionUserDto,
  type TrainerApproveInput,
  type TrainerApproveSuccess,
  type TrainerSessionSummaryDto,
  type TrainerWorkingReportDto,
  type UpdateTrainerChecklistInput,
} from "../contracts/physical-test";
import type { UiActionResult } from "../contracts/result";
import type { PhysicalTestPort } from "../physical-test-port";
import { GOVERNED_DIMENSIONS } from "./dimensions";

const STORAGE_KEY = "best-coach.frontend-f1.deterministic-fixture.v1";

type FixtureStudent = {
  readonly studentId: string;
  readonly displayName: string;
  readonly attendanceState: "present" | "absent";
  readonly reportId: string | null;
  readonly previousSessionFocus: string | null;
};

type FixtureSession = {
  readonly sessionId: string;
  readonly moduleName: string;
  readonly classGrade: "Beginner" | "Intermediate" | "Advanced";
  readonly date: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly students: readonly FixtureStudent[];
};

type FixtureObservation = {
  ratings: Record<DimensionCode, RatingLevel | null>;
  notes: string;
  followUp: string;
  lockVersion: number;
  validSaveAttempts: number;
};

type FixtureReport = {
  readonly reportId: string;
  readonly sessionId: string;
  readonly studentId: string;
  status: ReportStatus;
  lockVersion: number;
  versionId: string;
  revisionNumber: number;
  panels: ReportPanelsDto;
  contentHash: string;
  checklist: ChecklistDto;
  observation: FixtureObservation;
  generationAttempts: number;
  openCorrection?: CorrectionRequestDto;
};

type FixtureState = {
  readonly schemaVersion: 1;
  reports: Record<string, FixtureReport>;
};

const EMPTY_PANELS: ReportPanelsDto = {
  todaysStrength: "",
  nextFocus: "",
  practiceSuggestion: "",
  sessionTakeaway: "",
};

const EMPTY_CHECKLIST: ChecklistDto = {
  evidenceConfirmed: false,
  aiDraftReviewed: false,
  privacyChecked: false,
};

const EMPTY_RATINGS = Object.fromEntries(
  DIMENSION_CODES.map((code) => [code, null]),
) as Record<DimensionCode, RatingLevel | null>;

const MIXED_RATINGS: Record<DimensionCode, RatingLevel | null> = {
  body: "secure",
  emotion: "developing",
  speech: "secure",
  tonality: "emerging",
  eye_contact: "developing",
  vocal_projection: "emerging",
  emotional_expression: "secure",
  sentence_flow: "advanced",
  audience_awareness: "developing",
};

const ADVANCED_MIXED_RATINGS: Record<DimensionCode, RatingLevel | null> = {
  body: "advanced",
  emotion: "secure",
  speech: "secure",
  tonality: "developing",
  eye_contact: "secure",
  vocal_projection: "developing",
  emotional_expression: "advanced",
  sentence_flow: "secure",
  audience_awareness: "developing",
};

const SESSIONS: readonly FixtureSession[] = [
  {
    sessionId: "session-storytelling-lab",
    moduleName: "Storytelling Foundations",
    classGrade: "Beginner",
    date: "2026-08-05",
    startTime: "14:00",
    endTime: "15:30",
    students: [
      {
        studentId: "student-aster",
        displayName: "Learner Aster",
        attendanceState: "present",
        reportId: "report-aster",
        previousSessionFocus:
          "Pause after each main idea and reconnect with the listener.",
      },
      {
        studentId: "student-birch",
        displayName: "Learner Birch",
        attendanceState: "present",
        reportId: "report-birch",
        previousSessionFocus:
          "Project the final word of each sentence to the back of the room.",
      },
      {
        studentId: "student-cedar",
        displayName: "Learner Cedar",
        attendanceState: "present",
        reportId: "report-cedar",
        previousSessionFocus:
          "Use facial expression to make the story change clear.",
      },
      {
        studentId: "student-delta",
        displayName: "Learner Delta",
        attendanceState: "absent",
        reportId: null,
        previousSessionFocus: null,
      },
    ],
  },
  {
    sessionId: "session-presentation-practice",
    moduleName: "Presentation Practice",
    classGrade: "Intermediate",
    date: "2026-08-07",
    startTime: "16:00",
    endTime: "17:30",
    students: [],
  },
];

const INITIAL_STATE: FixtureState = {
  schemaVersion: 1,
  reports: {
    "report-aster": {
      reportId: "report-aster",
      sessionId: "session-storytelling-lab",
      studentId: "student-aster",
      status: "incomplete",
      lockVersion: 0,
      versionId: "fixture-version-aster-working",
      revisionNumber: 0,
      panels: EMPTY_PANELS,
      contentHash: "fixture-internal-content-aster-working",
      checklist: EMPTY_CHECKLIST,
      observation: {
        ratings: EMPTY_RATINGS,
        notes: "",
        followUp: "",
        lockVersion: 0,
        validSaveAttempts: 0,
      },
      generationAttempts: 0,
    },
    "report-birch": {
      reportId: "report-birch",
      sessionId: "session-storytelling-lab",
      studentId: "student-birch",
      status: "draft_ready",
      lockVersion: 3,
      versionId: "fixture-version-birch-draft-1",
      revisionNumber: 1,
      panels: {
        todaysStrength:
          "Learner Birch organised each idea clearly and used a steady pace throughout the presentation.",
        nextFocus:
          "The next focus is building more vocal reach while keeping that clear structure.",
        practiceSuggestion:
          "Practise one short paragraph while aiming the final word of each sentence toward the back of the room.",
        sessionTakeaway:
          "A clear structure gave the presentation a confident foundation today.",
      },
      contentHash: "fixture-internal-content-birch-draft-1",
      checklist: EMPTY_CHECKLIST,
      observation: {
        ratings: ADVANCED_MIXED_RATINGS,
        notes:
          "Strong sequence and calm pacing. Projection softened at sentence endings.",
        followUp:
          "Project the final word of each sentence to the back of the room.",
        lockVersion: 2,
        validSaveAttempts: 2,
      },
      generationAttempts: 2,
    },
    "report-cedar": {
      reportId: "report-cedar",
      sessionId: "session-storytelling-lab",
      studentId: "student-cedar",
      status: "needs_edit",
      lockVersion: 6,
      versionId: "fixture-version-cedar-returned",
      revisionNumber: 2,
      panels: {
        todaysStrength:
          "Learner Cedar kept the story sequence easy to follow and spoke with a calm rhythm.",
        nextFocus:
          "The next focus is using facial expression consistently when the story mood changes.",
        practiceSuggestion:
          "Retell a short scene in front of a mirror and mark two moments where the character's emotion changes.",
        sessionTakeaway:
          "Clear sequencing supported the story, with expression ready for more focused practice.",
      },
      contentHash: "fixture-internal-content-cedar-returned",
      checklist: EMPTY_CHECKLIST,
      observation: {
        ratings: MIXED_RATINGS,
        notes:
          "Clear story sequence. Expression was visible with prompts during the middle section.",
        followUp: "Use facial expression to make the story change clear.",
        lockVersion: 3,
        validSaveAttempts: 2,
      },
      generationAttempts: 2,
      openCorrection: {
        id: "correction-cedar-expression",
        issueScope: "rating",
        dimensionCode: "emotional_expression",
        status: "open",
        reason:
          "Please re-check the Emotional Expression rating against the saved observation before creating a fresh correction version.",
      },
    },
  },
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    globalThis.setTimeout(resolve, milliseconds);
  });
}

function findStudent(sessionId: string, studentId: string) {
  const session = SESSIONS.find((item) => item.sessionId === sessionId);
  const student = session?.students.find((item) => item.studentId === studentId);
  return session && student ? { session, student } : null;
}

function isCompleteRatings(
  ratings: Record<DimensionCode, RatingLevel | null>,
): ratings is Record<DimensionCode, RatingLevel> {
  return DIMENSION_CODES.every((code) => ratings[code] !== null);
}

function assertFixtureState(state: FixtureState): void {
  for (const report of Object.values(state.reports)) {
    const dimensions = Object.keys(report.observation.ratings);
    if (
      dimensions.length !== DIMENSION_CODES.length ||
      !DIMENSION_CODES.every((code) => dimensions.includes(code))
    ) {
      throw new Error("Fixture invariant failed: every observation has nine dimensions.");
    }

    if (
      report.status === "trainer_approved" &&
      !Object.values(report.checklist).every(Boolean)
    ) {
      throw new Error(
        "Fixture invariant failed: trainer approval requires the complete checklist.",
      );
    }

    if (report.openCorrection?.status === "open" && report.status !== "needs_edit") {
      throw new Error(
        "Fixture invariant failed: an open correction is represented as needs_edit.",
      );
    }

    if (report.status === "submitted" || report.status === "approved") {
      throw new Error(
        "Fixture invariant failed: Round F1 contains no publication transition.",
      );
    }
  }
}

function buildPanels(studentDisplayName: string): ReportPanelsDto {
  return {
    todaysStrength: `${studentDisplayName} kept the story sequence clear and used steady sentence flow throughout the presentation.`,
    nextFocus:
      "The next focus is building vocal projection with support, especially at the end of each main idea.",
    practiceSuggestion:
      "Practise one short paragraph twice: first at a comfortable volume, then again while aiming each final word toward the back of the room.",
    sessionTakeaway:
      "Clear sequencing provided a strong base today, with vocal reach identified as the next supported step.",
  };
}

export class DeterministicFixturePhysicalTestPort implements PhysicalTestPort {
  readonly identity = {
    kind: "deterministic_fixture",
    label: "Deterministic frontend fixture",
    participantEligible: false,
    persistence: "browser_session_only",
  } as const;

  private memoryState = clone(INITIAL_STATE);

  reset(): void {
    this.memoryState = clone(INITIAL_STATE);
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  }

  private readState(): FixtureState {
    if (typeof window === "undefined") {
      return this.memoryState;
    }

    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (!stored) {
      this.writeState(this.memoryState);
      return this.memoryState;
    }

    try {
      const parsed = JSON.parse(stored) as FixtureState;
      if (parsed.schemaVersion !== 1) {
        this.reset();
        return this.memoryState;
      }
      assertFixtureState(parsed);
      this.memoryState = parsed;
      return parsed;
    } catch {
      this.reset();
      return this.memoryState;
    }
  }

  private writeState(state: FixtureState): void {
    assertFixtureState(state);
    this.memoryState = state;
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }

  async getSessionUser(): Promise<UiActionResult<SessionUserDto>> {
    await delay(100);
    return {
      outcome: "success",
      data: {
        displayName: "Trainer Fixture",
        role: "trainer",
        centreDisplayName: "iSpeak Academy",
      },
    };
  }

  async listTrainerSessions(): Promise<
    UiActionResult<readonly TrainerSessionSummaryDto[]>
  > {
    await delay(220);
    const state = this.readState();
    return {
      outcome: "success",
      data: SESSIONS.map((session) => {
        const counts: Partial<Record<ReportStatus, number>> = {};
        for (const student of session.students) {
          if (!student.reportId) continue;
          const status = state.reports[student.reportId]?.status;
          if (status) counts[status] = (counts[status] ?? 0) + 1;
        }
        return {
          sessionId: session.sessionId,
          moduleName: session.moduleName,
          classGrade: session.classGrade,
          date: session.date,
          startTime: session.startTime,
          endTime: session.endTime,
          studentCount: session.students.length,
          countsByReportState: counts,
        };
      }),
    };
  }

  async getSessionRoster(
    sessionId: string,
  ): Promise<UiActionResult<readonly RosterEntryDto[]>> {
    await delay(240);
    const session = SESSIONS.find((item) => item.sessionId === sessionId);
    if (!session) return { outcome: "unavailable" };
    const state = this.readState();
    return {
      outcome: "success",
      data: session.students.map((student) => ({
        studentId: student.studentId,
        displayName: student.displayName,
        attendanceState: student.attendanceState,
        reportState: student.reportId
          ? (state.reports[student.reportId]?.status ?? "no_report")
          : "no_report",
        reportId: student.reportId,
        previousSessionFocus: student.previousSessionFocus,
      })),
    };
  }

  async getDimensions() {
    await delay(80);
    return { outcome: "success", data: GOVERNED_DIMENSIONS } as const;
  }

  async getAssessmentDraft(
    sessionId: string,
    studentId: string,
  ): Promise<UiActionResult<AssessmentDraftDto>> {
    await delay(220);
    const match = findStudent(sessionId, studentId);
    if (!match || match.student.attendanceState === "absent" || !match.student.reportId) {
      return { outcome: "unavailable" };
    }
    const report = this.readState().reports[match.student.reportId];
    if (!report) return { outcome: "unavailable" };
    return {
      outcome: "success",
      data: {
        reportId: report.reportId,
        sessionId,
        studentId,
        studentDisplayName: match.student.displayName,
        ratings: DIMENSION_CODES.map((dimensionCode) => ({
          dimensionCode,
          rating: report.observation.ratings[dimensionCode],
        })),
        notes: report.observation.notes,
        followUp: report.observation.followUp,
        observationLockVersion: report.observation.lockVersion,
      },
    };
  }

  async getTrainerWorkingReport(
    reportId: string,
  ): Promise<UiActionResult<TrainerWorkingReportDto>> {
    await delay(240);
    const report = this.readState().reports[reportId];
    if (!report || !report.panels.todaysStrength) {
      return { outcome: "unavailable" };
    }
    const match = findStudent(report.sessionId, report.studentId);
    const completeRatings = report.observation.ratings;
    if (!match || !isCompleteRatings(completeRatings)) {
      return { outcome: "unavailable" };
    }

    return {
      outcome: "success",
      data: {
        reportId,
        sessionId: report.sessionId,
        studentId: report.studentId,
        studentDisplayName: match.student.displayName,
        sessionDate: match.session.date,
        status: report.status,
        lockVersion: report.lockVersion,
        versionId: report.versionId,
        revisionNumber: report.revisionNumber,
        panels: report.panels,
        contentHash: report.contentHash,
        checklist: report.checklist,
        ratingSnapshots: GOVERNED_DIMENSIONS.map((dimension) => ({
          dimensionCode: dimension.dimensionCode,
          displayName: dimension.displayName,
          rating: completeRatings[dimension.dimensionCode],
        })),
        canonicalPointer: {
          latestSubmittedVersionId: null,
          submittedAt: null,
        },
        coachNotes: report.observation.followUp,
        ...(report.openCorrection ? { openCorrection: report.openCorrection } : {}),
      },
    };
  }

  async getDraftGenerationContext(
    reportId: string,
  ): Promise<UiActionResult<DraftGenerationContextDto>> {
    await delay(180);
    const report = this.readState().reports[reportId];
    if (
      !report ||
      (report.status !== "observation_saved" && report.status !== "draft_ready")
    ) {
      return { outcome: "unavailable" };
    }
    const match = findStudent(report.sessionId, report.studentId);
    if (!match) return { outcome: "unavailable" };
    return {
      outcome: "success",
      data: {
        reportId,
        studentDisplayName: match.student.displayName,
        observationLockVersion: report.observation.lockVersion,
        status: report.status,
      },
    };
  }

  async listReturnedReports(): Promise<
    UiActionResult<readonly ReturnedReportQueueItemDto[]>
  > {
    await delay(220);
    const state = this.readState();
    const returned: ReturnedReportQueueItemDto[] = [];
    for (const report of Object.values(state.reports)) {
      if (report.status !== "needs_edit" || report.openCorrection?.status !== "open") {
        continue;
      }
      const match = findStudent(report.sessionId, report.studentId);
      if (!match) continue;
      returned.push({
        reportId: report.reportId,
        sessionId: report.sessionId,
        studentId: report.studentId,
        studentDisplayName: match.student.displayName,
        sessionDate: match.session.date,
        correction: report.openCorrection,
      });
    }
    return { outcome: "success", data: returned };
  }

  async saveObservation(
    input: SaveObservationInput,
  ): Promise<UiActionResult<SaveObservationSuccess>> {
    await delay(520);
    const fields = DIMENSION_CODES.filter(
      (code) => !input.ratings.some((item) => item.dimensionCode === code && item.rating),
    ).map((code) => ({
      path: `ratings.${code}`,
      message: "Choose one of the four governed ratings.",
    }));
    const uniqueCodes = new Set(input.ratings.map((item) => item.dimensionCode));
    if (input.ratings.length !== 9 || uniqueCodes.size !== 9 || fields.length > 0) {
      return {
        outcome: "validation",
        message: "Rate all nine dimensions before saving the observation.",
        fields,
      };
    }

    const match = findStudent(input.sessionId, input.studentId);
    if (!match || match.student.attendanceState !== "present") {
      return { outcome: "unavailable" };
    }
    const state = this.readState();
    const report = state.reports[input.reportId];
    if (
      !report ||
      report.sessionId !== input.sessionId ||
      report.studentId !== input.studentId
    ) {
      return { outcome: "unavailable" };
    }
    if (report.observation.lockVersion !== input.observationLockVersion) {
      return {
        outcome: "stale_state",
        message: "This assessment changed while you were working. Reload it to continue.",
      };
    }

    report.observation.validSaveAttempts += 1;
    if (report.observation.validSaveAttempts === 1) {
      this.writeState(state);
      return {
        outcome: "retryable_failure",
        message:
          "The deterministic fixture returned its one planned save error. Your ratings and notes are still here; try saving again.",
      };
    }

    report.observation.ratings = Object.fromEntries(
      input.ratings.map((item) => [item.dimensionCode, item.rating]),
    ) as Record<DimensionCode, RatingLevel>;
    report.observation.notes = input.notes;
    report.observation.followUp = input.followUp;
    report.observation.lockVersion += 1;
    report.status = "observation_saved";
    report.lockVersion += 1;
    report.checklist = clone(EMPTY_CHECKLIST);
    this.writeState(state);
    return {
      outcome: "success",
      data: {
        reportId: report.reportId,
        observationLockVersion: report.observation.lockVersion,
        status: "observation_saved",
      },
    };
  }

  async requestDraft(
    input: RequestDraftInput,
  ): Promise<UiActionResult<RequestDraftSuccess>> {
    await delay(900);
    const state = this.readState();
    const report = state.reports[input.reportId];
    if (!report) return { outcome: "unavailable" };
    if (report.observation.lockVersion !== input.observationLockVersion) {
      return {
        outcome: "stale_state",
        message: "This assessment changed while the draft was being prepared. Reload it.",
      };
    }
    if (!isCompleteRatings(report.observation.ratings)) {
      return {
        outcome: "validation",
        message: "All nine saved ratings are required before draft generation.",
        fields: DIMENSION_CODES.map((code) => ({
          path: `ratings.${code}`,
          message: "A saved governed rating is required.",
        })),
      };
    }
    if (report.status === "draft_ready") {
      return {
        outcome: "success",
        data: {
          reportId: report.reportId,
          status: "draft_ready",
          versionId: report.versionId,
        },
      };
    }
    if (report.status !== "observation_saved") {
      return { outcome: "unavailable" };
    }

    report.generationAttempts += 1;
    if (report.generationAttempts === 1) {
      this.writeState(state);
      return {
        outcome: "generation_failure",
        retryable: true,
        message:
          "Grounding rejected the first fixture draft because it described an Emerging rating as an achievement. The suspect draft was not shown or saved.",
      };
    }

    const match = findStudent(report.sessionId, report.studentId);
    if (!match) return { outcome: "unavailable" };
    report.panels = buildPanels(match.student.displayName);
    report.status = "draft_ready";
    report.lockVersion += 1;
    report.revisionNumber += 1;
    report.versionId = `fixture-version-${report.studentId}-draft-${report.revisionNumber}`;
    report.contentHash = `fixture-internal-content-${report.studentId}-draft-${report.revisionNumber}`;
    report.checklist = clone(EMPTY_CHECKLIST);
    this.writeState(state);
    return {
      outcome: "success",
      data: {
        reportId: report.reportId,
        status: "draft_ready",
        versionId: report.versionId,
      },
    };
  }

  async saveTrainerEdit(
    input: SaveTrainerEditInput,
  ): Promise<UiActionResult<SaveTrainerEditSuccess>> {
    await delay(500);
    const state = this.readState();
    const report = state.reports[input.reportId];
    if (!report) return { outcome: "unavailable" };
    if (
      report.lockVersion !== input.expectedLockVersion ||
      report.versionId !== input.expectedVersionId
    ) {
      return {
        outcome: "stale_state",
        message: "This report changed while you were working. Reload it before saving.",
      };
    }
    if (report.status !== "draft_ready" || report.openCorrection?.status === "open") {
      return { outcome: "unavailable" };
    }

    const fields = Object.entries(input.panels)
      .filter(([, value]) => !value.trim())
      .map(([path]) => ({ path, message: "This report panel is required." }));
    if (fields.length > 0) {
      return {
        outcome: "validation",
        message: "Complete all four parent-facing panels before saving.",
        fields,
      };
    }
    if (JSON.stringify(report.panels) === JSON.stringify(input.panels)) {
      return {
        outcome: "validation",
        message: "Make a wording change before saving a new version.",
        fields: [],
      };
    }

    report.panels = clone(input.panels);
    report.revisionNumber += 1;
    report.versionId = `fixture-version-${report.studentId}-edit-${report.revisionNumber}`;
    report.contentHash = `fixture-internal-content-${report.studentId}-edit-${report.revisionNumber}`;
    report.lockVersion += 1;
    report.checklist = clone(EMPTY_CHECKLIST);
    this.writeState(state);
    return {
      outcome: "success",
      data: {
        reportId: report.reportId,
        status: "draft_ready",
        versionId: report.versionId,
        checklistReset: true,
      },
    };
  }

  async updateTrainerChecklist(
    input: UpdateTrainerChecklistInput,
  ): Promise<UiActionResult<TrainerWorkingReportDto>> {
    await delay(180);
    const state = this.readState();
    const report = state.reports[input.reportId];
    if (!report) return { outcome: "unavailable" };
    if (report.versionId !== input.expectedVersionId) {
      return {
        outcome: "stale_state",
        message: "This report changed while you were working. Reload it to continue.",
      };
    }
    if (report.status !== "draft_ready" && report.status !== "needs_edit") {
      return { outcome: "unavailable" };
    }
    report.checklist = clone(input.checklist);
    this.writeState(state);
    return this.getTrainerWorkingReport(input.reportId);
  }

  async trainerApprove(
    input: TrainerApproveInput,
  ): Promise<UiActionResult<TrainerApproveSuccess>> {
    await delay(520);
    const state = this.readState();
    const report = state.reports[input.reportId];
    if (!report) return { outcome: "unavailable" };
    if (
      report.lockVersion !== input.expectedLockVersion ||
      report.versionId !== input.expectedVersionId ||
      report.contentHash !== input.expectedContentHash
    ) {
      return {
        outcome: "stale_state",
        message: "This report changed while you were working. Reload it before approving.",
      };
    }
    if (report.openCorrection?.status === "open") {
      return {
        outcome: "validation",
        message:
          "A returned report requires a fresh correction version before it can be approved again.",
        fields: [],
      };
    }
    if (report.status !== "draft_ready") return { outcome: "unavailable" };
    if (!Object.values(report.checklist).every(Boolean)) {
      return {
        outcome: "validation",
        message: "Complete all three quality checks before trainer approval.",
        fields: [
          {
            path: "checklist",
            message: "All three checklist items are required for this exact version.",
          },
        ],
      };
    }

    report.status = "trainer_approved";
    report.lockVersion += 1;
    this.writeState(state);
    return {
      outcome: "success",
      data: {
        reportId: report.reportId,
        status: "trainer_approved",
        published: false,
        managementReviewRequired: true,
      },
    };
  }
}

export function createDeterministicFixturePhysicalTestPort(): DeterministicFixturePhysicalTestPort {
  return new DeterministicFixturePhysicalTestPort();
}

export function makeAssessmentRatings(
  ratings: Readonly<Record<DimensionCode, RatingLevel | null>>,
): readonly AssessmentRatingDto[] {
  return DIMENSION_CODES.map((dimensionCode) => ({
    dimensionCode,
    rating: ratings[dimensionCode],
  }));
}
