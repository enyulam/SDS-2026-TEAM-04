import {
  type AvailabilityStateDto,
  DIMENSION_CODES,
  RATING_LEVELS,
  type AssessmentDraftDto,
  type AssessmentRatingDto,
  type CanonicalReportContextDto,
  type CanonicalReportDto,
  type EvidenceViewUrlDto,
  type EvidenceUploadTicketDto,
  type EvidenceAttachSuccess,
  type ReportEvidenceClipDto,
  type ChecklistDto,
  type CorrectionRequestDto,
  type DimensionCode,
  type DraftGenerationContextDto,
  type ManagementApproveAndSubmitInput,
  type ManagementApproveAndSubmitSuccess,
  type ManagementEditWordingInput,
  type ManagementEditWordingSuccess,
  type ManagementQueueRowDto,
  type ManagementReturnToTrainerInput,
  type ManagementReturnToTrainerSuccess,
  type ManagementReviewDto,
  type ParentReportListItemDto,
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
  type SessionRole,
  type SetAttendanceInput,
  type SetAttendanceSuccess,
  type TrainerApproveInput,
  type TrainerApproveSuccess,
  type TrainerSessionSummaryDto,
  type TrainerWorkingReportDto,
  type UpdateTrainerChecklistInput,
  type SaveFollowUpNotesInput,
} from "../contracts/physical-test";
import type { UiActionResult } from "../contracts/result";
import type { PhysicalTestPort } from "../physical-test-port";
import { GOVERNED_DIMENSIONS } from "./dimensions";
import { deriveSessionEligibility } from "@/lib/schedule/session-eligibility";
import { fixtureSessionDates } from "@/lib/schedule/fixture-session-dates";

/*
 * Derived ONCE, from the real pinned Asia/Singapore clock, at fixture load.
 * The derivation itself is a pure function of the instant so a test can sweep
 * simulated ones through the same code.
 */
const FIXTURE_DATES = fixtureSessionDates();

/*
 * THE SESSION DATES ARE DERIVED FROM A PINNED REFERENCE, NOT ABSOLUTE LITERALS.
 * The derivation and the reasoning behind it live in
 * `lib/schedule/fixture-session-dates.ts`, outside this file, so a test can read
 * the three eligibility arms without importing this browser-facing port class.
 */

const STORAGE_KEY = "best-coach.frontend-f2.deterministic-fixture.v2";

type FixtureStudent = {
  readonly studentId: string;
  readonly displayName: string;
  readonly attendanceState: "present" | "absent";
  readonly reportId: string | null;
  readonly previousSessionFocus: string | null;
};

type FixtureSession = {
  readonly sessionId: string;
  /**
   * Hero Phase 9 — the STABLE identity the `29` class filter selects on.
   *
   * ⚠️ It is a separate field rather than the module NAME because a filter
   * must key off identity, not a label: two modules may legitimately share a
   * title, and a rename must not silently reassign which rows a selection
   * matches. The governed projection uses `class_sessions.class_module_id`
   * for exactly the same reason.
   */
  readonly classModuleId: string;
  readonly moduleName: string;
  readonly classGrade: "Beginner" | "Intermediate" | "Advanced";
  readonly date: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly students: readonly FixtureStudent[];
  /**
   * Hero Phase 0B/1 context. OPTIONAL ON PURPOSE — the governed columns are
   * nullable and NULL means NOT RECORDED, so sessions that leave these unset
   * exercise the OMIT path, which is a real rendering case and not a gap.
   */
  readonly lessonNumber?: number;
  readonly lessonTitle?: string;
  readonly trainerName?: string;
  /** Hero Phase 0B/3. Descriptive only (G-6) — it never scopes anything. */
  readonly room?: string;
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
  wordingHash: string;
  checklist: ChecklistDto;
  observation: FixtureObservation;
  versionRatings: Record<DimensionCode, RatingLevel | null>;
  observationChangedSinceVersion: boolean;
  generationAttempts: number;
  openCorrection?: CorrectionRequestDto;
  latestSubmitted?: {
    readonly versionId: string;
    readonly panels: ReportPanelsDto;
    readonly submittedAt: string;
  };
};

type FixtureState = {
  readonly schemaVersion: 2;
  reports: Record<string, FixtureReport>;
};

const EMPTY_PANELS: ReportPanelsDto = {
  overview: "",
  strengths: "",
  areasForDevelopment: "",
  remarks: "",
};

const EMPTY_CHECKLIST: ChecklistDto = {
  evidenceConfirmed: false,
  aiDraftReviewed: false,
  privacyChecked: false,
};

const EMPTY_RATINGS = Object.fromEntries(
  DIMENSION_CODES.map((code) => [code, null]),
) as Record<DimensionCode, RatingLevel | null>;

/**
 * Deliberately mixed rating sets in the ratified Amendment 006 A-049
 * vocabulary. Between them the two sets exercise ALL FOUR rating states, which
 * is what makes the grounding-contradiction path (a `beginning` dimension that
 * must never be presented as a strength — A-051) meaningful rather than
 * decorative.
 */
const MIXED_RATINGS: Record<DimensionCode, RatingLevel | null> = {
  body: "mastering",
  emotion: "developing",
  speech: "mastering",
  tonality: "beginning",
  eye_contact: "developing",
  vocal_projection: "beginning",
  emotional_expression: "mastering",
  sentence_flow: "mastered",
  audience_awareness: "developing",
};

const MASTERED_MIXED_RATINGS: Record<DimensionCode, RatingLevel | null> = {
  body: "mastered",
  emotion: "mastering",
  speech: "mastering",
  tonality: "developing",
  eye_contact: "mastering",
  vocal_projection: "developing",
  emotional_expression: "mastered",
  sentence_flow: "mastering",
  audience_awareness: "developing",
};

/**
 * Hero Phase 1 display context, assembled from the fixture's own session and
 * student records. Returns `null` when the pair does not resolve — the same
 * shape the governed read produces when its context call yields nothing.
 *
 * ⚠️ `lessonNumber`, `lessonTitle` and `trainerDisplayName` pass through as
 * `null` where the session leaves them unset. That is NOT RECORDED and the
 * surface omits the row; nothing is substituted.
 */
function fixtureReportContext(
  sessionId: string,
  studentId: string,
): CanonicalReportContextDto | null {
  const session = SESSIONS.find((item) => item.sessionId === sessionId);
  if (!session) return null;
  const student = session.students.find((item) => item.studentId === studentId);
  if (!student) return null;
  return {
    studentDisplayName: student.displayName,
    classGradeLabel: session.classGrade,
    classModuleTitle: session.moduleName,
    sessionDate: session.date,
    lessonNumber: session.lessonNumber ?? null,
    lessonTitle: session.lessonTitle ?? null,
    trainerDisplayName: session.trainerName ?? null,
  };
}

/**
 * Hero Phase 9 — the fixture mirror of `decorateQueueRows`.
 *
 * ⚠️ It is applied to a row that has ALREADY passed the fixture's status
 * checks, in the same order the server applies its own: context is a LABEL on
 * an authorized row, never a condition of authorization. Fields the session
 * leaves unset are OMITTED rather than substituted, so the surface's "—" path
 * is genuinely exercised.
 */
function fixtureQueueContext(session: FixtureSession) {
  return {
    classModuleId: session.classModuleId,
    classGradeLabel: session.classGrade,
    classModuleTitle: session.moduleName,
    ...(session.lessonNumber === undefined ? {} : { lessonNumber: session.lessonNumber }),
    ...(session.lessonTitle ? { lessonTitle: session.lessonTitle } : {}),
    ...(session.trainerName ? { trainerDisplayName: session.trainerName } : {}),
  };
}

const SESSIONS: readonly FixtureSession[] = [
  {
    sessionId: "session-storytelling-lab",
    classModuleId: "module-storytelling-foundations",
    moduleName: "Storytelling Foundations",
    classGrade: "Beginner",
    date: FIXTURE_DATES.eligible.date,
    startTime: FIXTURE_DATES.eligible.startTime,
    endTime: FIXTURE_DATES.eligible.endTime,
    // Populated so the lesson strip and trainer row are actually exercised.
    // The other sessions leave these unset, which exercises the OMIT path.
    lessonNumber: 4,
    lessonTitle: "Expressive Delivery",
    trainerName: "Fixture Trainer One",
    room: "Studio 2",
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
    classModuleId: "module-presentation-practice",
    moduleName: "Presentation Practice",
    classGrade: "Intermediate",
    date: FIXTURE_DATES.future.date,
    startTime: "16:00",
    endTime: "17:30",
    /*
     * C2C-011 — one PRESENT learner on the FUTURE session, and no report.
     *
     * The session previously carried no roster at all, which made the
     * "ineligible session" arm untestable: with nobody enrolled, an assess
     * deep link was refused for ABSENCE and the scheduled-start condition was
     * never reached. A present learner separates the two refusals, so the
     * start gate is exercised on its own terms.
     *
     * `reportId` is null and stays null: a future session must never carry a
     * report, and absence of one is what the governed lifecycle produces.
     */
    students: [
      {
        studentId: "student-gale",
        displayName: "Learner Gale",
        attendanceState: "present",
        reportId: null,
        previousSessionFocus: null,
      },
    ],
  },
  {
    sessionId: "session-speech-showcase",
    classModuleId: "module-speech-showcase",
    moduleName: "Speech Showcase",
    classGrade: "Advanced",
    date: FIXTURE_DATES.past.date,
    startTime: "17:00",
    endTime: "18:30",
    students: [
      {
        studentId: "student-ember",
        displayName: "Learner Ember",
        attendanceState: "present",
        reportId: "report-ember",
        previousSessionFocus: "Add vocal variety between key ideas.",
      },
      {
        studentId: "student-fern",
        displayName: "Learner Fern",
        attendanceState: "present",
        reportId: "report-fern",
        previousSessionFocus: "Pause before the final idea.",
      },
    ],
  },
];

const INITIAL_STATE: FixtureState = {
  schemaVersion: 2,
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
      wordingHash: "fixture-wording-aster-working",
      checklist: EMPTY_CHECKLIST,
      observation: {
        ratings: EMPTY_RATINGS,
        notes: "",
        followUp: "",
        lockVersion: 0,
        validSaveAttempts: 0,
      },
      versionRatings: EMPTY_RATINGS,
      observationChangedSinceVersion: false,
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
        overview:
          "Learner Birch presented with a clear structure and a steady pace, and is now working on carrying that same control through to vocal reach at the end of each sentence.",
        strengths:
          "Learner Birch organised each idea clearly and used a steady pace throughout the presentation.",
        areasForDevelopment:
          "Projection softened at sentence endings, so building more vocal reach while keeping that clear structure would benefit the next session.",
        remarks:
          "The observation was taken from the full presentation rather than a single section.",
      },
      contentHash: "fixture-internal-content-birch-draft-1",
      wordingHash: "fixture-wording-birch-draft-1",
      checklist: EMPTY_CHECKLIST,
      observation: {
        ratings: MASTERED_MIXED_RATINGS,
        notes:
          "Strong sequence and calm pacing. Projection softened at sentence endings.",
        followUp:
          "Project the final word of each sentence to the back of the room.",
        lockVersion: 2,
        validSaveAttempts: 2,
      },
      versionRatings: MASTERED_MIXED_RATINGS,
      observationChangedSinceVersion: false,
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
        overview:
          "Learner Cedar told the story with clear sequencing and a calm rhythm, and showed facial expression when prompted during the middle section.",
        strengths:
          "Learner Cedar kept the story sequence easy to follow and spoke with a calm rhythm.",
        areasForDevelopment:
          "Facial expression was visible with prompts rather than independently, so using it consistently when the story mood changes is the area to support next.",
        remarks:
          "This report was returned for correction and reflects the trainer's second observation of the session.",
      },
      contentHash: "fixture-internal-content-cedar-returned",
      wordingHash: "fixture-wording-cedar-returned",
      checklist: {
        evidenceConfirmed: true,
        aiDraftReviewed: true,
        privacyChecked: true,
      },
      observation: {
        ratings: MIXED_RATINGS,
        notes:
          "Clear story sequence. Expression was visible with prompts during the middle section.",
        followUp: "Use facial expression to make the story change clear.",
        lockVersion: 3,
        validSaveAttempts: 2,
      },
      versionRatings: MIXED_RATINGS,
      observationChangedSinceVersion: false,
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
    "report-ember": {
      reportId: "report-ember",
      sessionId: "session-speech-showcase",
      studentId: "student-ember",
      status: "trainer_approved",
      lockVersion: 5,
      versionId: "fixture-version-ember-approved",
      revisionNumber: 2,
      panels: {
        overview:
          "Learner Ember opened with a clear purpose and sequenced the supporting ideas well; tonal variety between those ideas is still developing.",
        strengths:
          "Learner Ember opened with a clear purpose and kept each supporting idea easy to follow.",
        areasForDevelopment:
          "Adding a little more vocal variety when moving between key ideas would help each transition land.",
        remarks:
          "The trainer approved this version after reviewing the draft against the session observation.",
      },
      contentHash: "fixture-internal-content-ember-approved",
      wordingHash: "fixture-wording-ember-approved",
      checklist: {
        evidenceConfirmed: true,
        aiDraftReviewed: true,
        privacyChecked: true,
      },
      observation: {
        ratings: MASTERED_MIXED_RATINGS,
        notes: "Clear purpose and sequence. Tonal variety can develop further.",
        followUp: "Add vocal variety between key ideas.",
        lockVersion: 2,
        validSaveAttempts: 2,
      },
      versionRatings: MASTERED_MIXED_RATINGS,
      observationChangedSinceVersion: false,
      generationAttempts: 2,
    },
    "report-fern": {
      reportId: "report-fern",
      sessionId: "session-speech-showcase",
      studentId: "student-fern",
      status: "submitted",
      lockVersion: 7,
      versionId: "fixture-version-fern-submitted",
      revisionNumber: 3,
      panels: {
        overview:
          "Learner Fern delivered the main message confidently from a warm opening, and the pace accelerated through the closing section.",
        strengths:
          "Learner Fern shared the main message confidently and used a warm, welcoming opening.",
        areasForDevelopment:
          "The closing pace accelerated, so pausing briefly before the closing idea would let it land clearly.",
        remarks:
          "This is the canonical submitted version and is the one shown to the parent.",
      },
      contentHash: "fixture-internal-content-fern-submitted",
      wordingHash: "fixture-wording-fern-submitted",
      checklist: {
        evidenceConfirmed: true,
        aiDraftReviewed: true,
        privacyChecked: true,
      },
      observation: {
        ratings: MIXED_RATINGS,
        notes: "Warm opening and clear message. Closing pace accelerated.",
        followUp: "Pause before the final idea.",
        lockVersion: 2,
        validSaveAttempts: 2,
      },
      versionRatings: MIXED_RATINGS,
      observationChangedSinceVersion: false,
      generationAttempts: 2,
      latestSubmitted: {
        versionId: "fixture-version-fern-submitted",
        panels: {
          overview:
            "Learner Fern delivered the main message confidently from a warm opening, and the pace accelerated through the closing section.",
          strengths:
            "Learner Fern shared the main message confidently and used a warm, welcoming opening.",
          areasForDevelopment:
            "The closing pace accelerated, so pausing briefly before the closing idea would let it land clearly.",
          remarks:
            "This is the canonical submitted version and is the one shown to the parent.",
        },
        submittedAt: "2026-08-05T09:30:00.000Z",
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

function ratingsMatch(
  left: Record<DimensionCode, RatingLevel | null>,
  right: Record<DimensionCode, RatingLevel | null>,
): boolean {
  return DIMENSION_CODES.every((code) => left[code] === right[code]);
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

    if (report.status === "approved") {
      throw new Error(
        "Fixture invariant failed: approved is never a committed state.",
      );
    }

    if (report.status === "submitted" && !report.latestSubmitted) {
      throw new Error(
        "Fixture invariant failed: a submitted report has a canonical snapshot.",
      );
    }
  }
}

function buildPanels(studentDisplayName: string): ReportPanelsDto {
  return {
    overview: `${studentDisplayName} sequenced the presentation clearly with steady sentence flow, and vocal projection is still developing towards the end of each main idea.`,
    strengths: `${studentDisplayName} kept the story sequence clear and used steady sentence flow throughout the presentation.`,
    areasForDevelopment:
      "Building vocal projection with support, especially at the end of each main idea, would help the message carry to the whole room.",
    remarks:
      "This draft was generated from the trainer's saved observation for this session.",
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

  /**
   * Attendance overrides, keyed `sessionId|studentId`.
   *
   * DELIBERATELY NOT PERSISTED to `sessionStorage` and deliberately outside
   * `FixtureState`: adding a field there would bump `schemaVersion` and widen
   * `assertFixtureState`, and the persisted schema is not worth churning for a
   * surface that exists to exercise the toggle's CAS handling.
   *
   * ⚠️ This models the compare-and-set SHAPE — including its `stale_state`
   * refusal — and nothing else. It is NOT a governed write: it appends no
   * audit event, enforces no A-026 submitted-report refusal, and re-derives no
   * authorization. Fixture mode is unreachable unless the BUILD set
   * `NEXT_PUBLIC_BEST_COACH_FIXTURE_MODE=1`, and no participant path can reach
   * it, so no hero-path claim ever rests on this.
   */
  private readonly attendanceOverrides = new Map<string, "present" | "absent">();

  constructor(private readonly sessionRole: SessionRole = "trainer") {}

  reset(): void {
    this.memoryState = clone(INITIAL_STATE);
    this.attendanceOverrides.clear();
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  }

  private attendanceOf(sessionId: string, student: FixtureStudent): "present" | "absent" {
    return this.attendanceOverrides.get(`${sessionId}|${student.studentId}`) ?? student.attendanceState;
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
      if (parsed.schemaVersion !== 2) {
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
    const displayNames: Readonly<Record<SessionRole, string>> = {
      trainer: "Trainer Fixture",
      management: "Management Fixture",
      parent: "Parent Fixture",
    };
    return {
      outcome: "success",
      data: {
        displayName: displayNames[this.sessionRole],
        role: this.sessionRole,
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
          // Hero Phase 3. Sessions that leave these unset exercise the OMIT
          // path, which is a real rendering case and not a gap.
          room: session.room ?? null,
          trainerDisplayName: session.trainerName ?? null,
          lessonNumber: session.lessonNumber ?? null,
          lessonTitle: session.lessonTitle ?? null,
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
        attendanceState: this.attendanceOf(sessionId, student),
        // Every fixture learner is declared with an EXPLICIT attendance state,
        // so in this runtime the record always exists. The real projection
        // derives this from whether an `attendance` row is actually present.
        attendanceRecorded: true,
        reportState: student.reportId
          ? (state.reports[student.reportId]?.status ?? "no_report")
          : "no_report",
        reportId: student.reportId,
        previousSessionFocus: student.previousSessionFocus,
      })),
    };
  }

  /**
   * The CAS SHAPE of A-018's Present/Absent control. See
   * `attendanceOverrides` for what this deliberately does not model.
   */
  async setAttendance(
    input: SetAttendanceInput,
  ): Promise<UiActionResult<SetAttendanceSuccess>> {
    await delay(160);
    const session = SESSIONS.find((item) => item.sessionId === input.sessionId);
    const student = session?.students.find((item) => item.studentId === input.studentId);
    if (!session || !student) return { outcome: "unavailable" };

    const current = this.attendanceOf(input.sessionId, student);
    // A fixture learner's record ALWAYS exists, so a caller asserting "no
    // record yet" is as stale as one asserting the wrong value. Both are
    // refused; there is no force mode here either.
    if (input.expectedStatus !== current) {
      return {
        outcome: "stale_state",
        message: "Attendance changed since this roster was loaded. Reload to continue.",
      };
    }
    this.attendanceOverrides.set(`${input.sessionId}|${input.studentId}`, input.newStatus);
    return {
      outcome: "success",
      data: { status: input.newStatus, initialized: false, changed: input.newStatus !== current },
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
    /*
     * C2C-011 — THE ENTRY GATE, mirroring the participant adapter's exactly.
     *
     * The two refusals are the GOVERNED ones, verbatim: the same strings the
     * backend's SQLSTATE map produces for BC102 (attendance) and BC104
     * (scheduled start). Each names the CONDITION and nothing else — no
     * learner name, no date, no time, no report state and no existence claim —
     * so the state is non-disclosing, and a caller cannot tell "absent" from
     * "not enrolled here" or "future session" from "no such session".
     *
     * Order matters: attendance is resolved first, so an absent learner in a
     * future session is refused for attendance rather than leaking that the
     * session exists but has not begun.
     */
    if (!match || match.student.attendanceState === "absent") {
      return {
        outcome: "validation",
        message: "The student is not recorded present for this session.",
        fields: [],
      };
    }
    if (deriveSessionEligibility(match.session) === "future") {
      return {
        outcome: "validation",
        message: "The scheduled session start has not been reached.",
        fields: [],
      };
    }
    if (!match.student.reportId) {
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
    if (!report || !report.panels.overview) {
      return { outcome: "unavailable" };
    }
    const match = findStudent(report.sessionId, report.studentId);
    const completeRatings = report.versionRatings;
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
          latestSubmittedVersionId: report.latestSubmitted?.versionId ?? null,
          submittedAt: report.latestSubmitted?.submittedAt ?? null,
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

  async listManagementPendingReviews(): Promise<
    UiActionResult<readonly ManagementQueueRowDto[]>
  > {
    await delay(240);
    const rows: ManagementQueueRowDto[] = [];
    for (const report of Object.values(this.readState().reports)) {
      if (report.status !== "trainer_approved") continue;
      const match = findStudent(report.sessionId, report.studentId);
      if (!match) continue;
      rows.push({
        reportId: report.reportId,
        sessionId: report.sessionId,
        studentId: report.studentId,
        studentDisplayName: match.student.displayName,
        sessionDate: match.session.date,
        status: "trainer_approved",
        ...fixtureQueueContext(match.session),
        ...(report.openCorrection
          ? {
              openCorrectionScope: report.openCorrection.issueScope,
              openCorrectionStatus: report.openCorrection.status,
            }
          : {}),
      });
    }
    return { outcome: "success", data: rows };
  }

  async listManagementCorrectionTracking(): Promise<
    UiActionResult<readonly ManagementQueueRowDto[]>
  > {
    await delay(240);
    const rows: ManagementQueueRowDto[] = [];
    for (const report of Object.values(this.readState().reports)) {
      if (report.status !== "needs_edit" || !report.openCorrection) continue;
      const match = findStudent(report.sessionId, report.studentId);
      if (!match) continue;
      rows.push({
        reportId: report.reportId,
        sessionId: report.sessionId,
        studentId: report.studentId,
        studentDisplayName: match.student.displayName,
        sessionDate: match.session.date,
        status: "needs_edit",
        ...fixtureQueueContext(match.session),
        openCorrectionScope: report.openCorrection.issueScope,
        openCorrectionStatus: report.openCorrection.status,
        ...(report.openCorrection.reason
          ? { openCorrectionReason: report.openCorrection.reason }
          : {}),
      });
    }
    return { outcome: "success", data: rows };
  }

  /**
   * C2C-004 — the deterministic mirror of the governed
   * `report_list_management_submitted` boundary.
   *
   * The two conditions below are the fixture's statement of the SAME rule the
   * SQL WHERE clause enforces: the report must have COMMITTED at `submitted`
   * AND must carry a canonical submitted version. A report at any earlier
   * status is not a row of this result at all — it is not filtered out of a
   * rendered list — so no preapproval Trainer draft content can reach the
   * Approved queue in fixture mode either. The row carries publication
   * metadata only: no panel, no rating, no version id and neither hash.
   */
  async listManagementSubmittedReports(): Promise<
    UiActionResult<readonly ManagementQueueRowDto[]>
  > {
    await delay(240);
    const rows: ManagementQueueRowDto[] = [];
    for (const report of Object.values(this.readState().reports)) {
      if (report.status !== "submitted" || !report.latestSubmitted) continue;
      const match = findStudent(report.sessionId, report.studentId);
      if (!match) continue;
      rows.push({
        reportId: report.reportId,
        sessionId: report.sessionId,
        studentId: report.studentId,
        studentDisplayName: match.student.displayName,
        sessionDate: match.session.date,
        status: "submitted",
        ...fixtureQueueContext(match.session),
        submittedAt: report.latestSubmitted.submittedAt,
      });
    }
    rows.sort((a, b) => (a.submittedAt ?? "") < (b.submittedAt ?? "") ? 1 : -1);
    return { outcome: "success", data: rows };
  }

  /**
   * C2C-004 — the canonical SUBMITTED report an Approved row opens. It
   * resolves ONLY a report that has committed at `submitted`; a
   * `trainer_approved` candidate is the final-review surface's read and is
   * refused here with the same non-disclosing outcome a missing report gets.
   */
  async getManagementSubmittedReport(
    reportId: string,
  ): Promise<UiActionResult<CanonicalReportDto>> {
    await delay(240);
    if (reportId === "denied") return { outcome: "unauthorized" };
    const report = this.readState().reports[reportId];
    if (!report || report.status !== "submitted" || !report.latestSubmitted) {
      return { outcome: "unavailable" };
    }
    return {
      outcome: "success",
      data: {
        panels: clone(report.latestSubmitted.panels),
        submittedAt: report.latestSubmitted.submittedAt,
        context: fixtureReportContext(report.sessionId, report.studentId),
        /*
         * ⛔ P1-5. The fixture carries NO clip: the evidence substrate exists
         * but the upload transport does not, so no fixture report has one.
         * ⚠️ An invented clip here would put a player on the fixture surface
         * that no governed path backs — the affordance-without-a-backing rule
         * (GLOBAL_UI_RULES §10). The empty list is the honest state.
         */
        evidence: [],
      },
    };
  }

  async getManagementReview(
    reportId: string,
  ): Promise<UiActionResult<ManagementReviewDto>> {
    await delay(240);
    if (reportId === "denied") return { outcome: "unauthorized" };
    const report = this.readState().reports[reportId];
    if (!report || report.status !== "trainer_approved") {
      return { outcome: "unavailable" };
    }
    /*
     * D-1 / C-10 -- the nine ratings. ⛔ An INCOMPLETE rating set makes the
     * surface unavailable rather than rendering a partial grid: a management
     * reviewer seeing six of nine would have no way to tell that three are
     * missing rather than unrated, and the whole point of C-10 is that a
     * SUBSET of the nine is a selection of assessment substance.
     */
    const reviewRatings = report.versionRatings;
    if (!isCompleteRatings(reviewRatings)) return { outcome: "unavailable" };
    return {
      outcome: "success",
      data: {
        // D-1 / C-10 -- all NINE, read only. C-9: this surface only.
        ratings: GOVERNED_DIMENSIONS.map((dimension) => ({
          dimensionCode: dimension.dimensionCode,
          displayName: dimension.displayName,
          rating: reviewRatings[dimension.dimensionCode],
        })),
        status: "trainer_approved",
        lockVersion: report.lockVersion,
        versionId: report.versionId,
        panels: clone(report.panels),
        wordingHash: report.wordingHash,
        ...(report.latestSubmitted?.submittedAt
          ? { submittedAt: report.latestSubmitted.submittedAt }
          : {}),
        ...(report.openCorrection
          ? {
              openCorrectionScope: report.openCorrection.issueScope,
              openCorrectionStatus: report.openCorrection.status,
            }
          : {}),
      },
    };
  }

  async getParentAvailability(): Promise<UiActionResult<AvailabilityStateDto>> {
    await delay(180);
    const available = Object.values(this.readState().reports).some(
      (report) => report.latestSubmitted !== undefined,
    );
    return { outcome: "success", data: available ? "available" : "none_yet" };
  }

  async listParentSubmittedReports(): Promise<
    UiActionResult<readonly ParentReportListItemDto[]>
  > {
    await delay(240);
    const reports: ParentReportListItemDto[] = [];
    for (const report of Object.values(this.readState().reports)) {
      if (!report.latestSubmitted) continue;
      const match = findStudent(report.sessionId, report.studentId);
      if (!match) continue;
      // Hero Phase 2 context, from the SAME helper the canonical detail read
      // uses — one fixture source, so the list and the detail can never drift
      // apart the way two hand-written literals would. Sessions that leave
      // the optional fields unset exercise the OMIT path, which is a real
      // rendering case and not a gap.
      const context = fixtureReportContext(report.sessionId, report.studentId);
      reports.push({
        studentId: report.studentId,
        studentDisplayName: match.student.displayName,
        sessionId: report.sessionId,
        sessionDate: match.session.date,
        submittedAt: report.latestSubmitted.submittedAt,
        classGradeLabel: context?.classGradeLabel ?? null,
        classModuleTitle: context?.classModuleTitle ?? null,
        lessonNumber: context?.lessonNumber ?? null,
        lessonTitle: context?.lessonTitle ?? null,
        trainerDisplayName: context?.trainerDisplayName ?? null,
      });
    }
    return { outcome: "success", data: reports };
  }

  /*
   * ⛔ THE FIXTURE MINTS NOTHING, AND NEVER WILL. No fixture report carries a
   * clip, so this is unreachable through the UI — and it answers `unavailable`
   * rather than inventing a URL, because a fake media URL on a PARENT surface
   * is exactly the affordance-without-a-backing this project refuses
   * (GLOBAL_UI_RULES §10). ⚠️ It also emits no `evidence.accessed`, which is
   * correct: nothing was accessed.
   */
  async mintEvidenceViewUrl(): Promise<UiActionResult<EvidenceViewUrlDto>> {
    await delay(120);
    return { outcome: "unavailable" };
  }

  /*
   * ⛔ P1-2b — THE FIXTURE UPLOADS NOTHING, AND THAT IS THE ONLY HONEST
   * ANSWER IT CAN GIVE.
   *
   * A fixture ticket would be a path into a real private bucket that the
   * fixture cannot write to, and a fixture "attach" would report a governed
   * act — with its `evidence.attached` audit event — that never happened. ▶ A
   * simulated success on an AUDITED write is strictly worse than a refusal:
   * it teaches the operator the transport works on a path that recorded
   * nothing.
   *
   * ⚠️ `listReportEvidence` returns an EMPTY LIST rather than `unavailable`,
   * because "this fixture report has no clip" is TRUE — where the three above
   * would each be a claim about an action, and no action occurred.
   */
  async createEvidenceUploadTicket(): Promise<UiActionResult<EvidenceUploadTicketDto>> {
    await delay(120);
    return { outcome: "unavailable" };
  }

  async confirmEvidenceAttach(): Promise<UiActionResult<EvidenceAttachSuccess>> {
    await delay(120);
    return { outcome: "unavailable" };
  }

  async removeEvidence(): Promise<UiActionResult<{ readonly removed: boolean }>> {
    await delay(120);
    return { outcome: "unavailable" };
  }

  async listReportEvidence(): Promise<UiActionResult<readonly ReportEvidenceClipDto[]>> {
    await delay(80);
    return { outcome: "success", data: [] };
  }

  async getCanonicalReport(
    sessionId: string,
    studentId: string,
  ): Promise<UiActionResult<CanonicalReportDto>> {
    await delay(240);
    if (sessionId === "denied" || studentId === "denied") {
      return { outcome: "unauthorized" };
    }
    const report = Object.values(this.readState().reports).find(
      (candidate) =>
        candidate.sessionId === sessionId && candidate.studentId === studentId,
    );
    if (!report?.latestSubmitted) return { outcome: "unavailable" };
    return {
      outcome: "success",
      data: {
        panels: clone(report.latestSubmitted.panels),
        submittedAt: report.latestSubmitted.submittedAt,
        context: fixtureReportContext(report.sessionId, report.studentId),
        /*
         * ⛔ P1-5. The fixture carries NO clip: the evidence substrate exists
         * but the upload transport does not, so no fixture report has one.
         * ⚠️ An invented clip would put a player on the fixture surface that
         * no governed path backs — an affordance without a backing is never
         * invented (GLOBAL_UI_RULES §10). The empty list is the honest state.
         */
        evidence: [],
      },
    };
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
    const ratingsAreGoverned = input.ratings.every(
      (item) => item.rating !== null && RATING_LEVELS.includes(item.rating),
    );
    if (
      input.ratings.length !== 9 ||
      uniqueCodes.size !== 9 ||
      fields.length > 0 ||
      !ratingsAreGoverned
    ) {
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
    // `reportId` is nullable on the port since F16-C (the governed backend
    // creates the report at draft request, not at assessment save). This
    // fixture always pre-creates one, so a null id here is simply unreachable
    // in fixture data and resolves to the non-disclosing outcome.
    const report = input.reportId === null ? undefined : state.reports[input.reportId];
    if (
      !report ||
      report.sessionId !== input.sessionId ||
      report.studentId !== input.studentId
    ) {
      return { outcome: "unavailable" };
    }
    const returnedCorrection =
      report.status === "needs_edit" && report.openCorrection?.status === "open";
    if (
      !returnedCorrection &&
      report.status !== "incomplete" &&
      report.status !== "observation_saved"
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

    const nextRatings = Object.fromEntries(
      input.ratings.map((item) => [item.dimensionCode, item.rating]),
    ) as Record<DimensionCode, RatingLevel>;
    const observationChanged =
      !ratingsMatch(report.observation.ratings, nextRatings) ||
      report.observation.notes !== input.notes ||
      report.observation.followUp !== input.followUp;
    report.observation.ratings = nextRatings;
    report.observation.notes = input.notes;
    report.observation.followUp = input.followUp;
    report.observation.lockVersion += 1;
    report.observationChangedSinceVersion =
      report.observationChangedSinceVersion || observationChanged;
    if (!returnedCorrection) {
      report.status = "observation_saved";
      report.lockVersion += 1;
    }
    if (!returnedCorrection) {
      report.checklist = clone(EMPTY_CHECKLIST);
    }
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
          "Grounding rejected the first fixture draft because it described a Beginning rating as an achievement. The suspect draft was not shown or saved.",
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
    report.wordingHash = `fixture-wording-${report.studentId}-draft-${report.revisionNumber}`;
    report.checklist = clone(EMPTY_CHECKLIST);
    report.versionRatings = clone(report.observation.ratings);
    report.observationChangedSinceVersion = false;
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
    const returnedCorrection =
      report.status === "needs_edit" && report.openCorrection?.status === "open";
    if (report.status !== "draft_ready" && !returnedCorrection) {
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
    const panelsChanged = JSON.stringify(report.panels) !== JSON.stringify(input.panels);
    const assessmentChanged =
      report.observationChangedSinceVersion ||
      !ratingsMatch(report.versionRatings, report.observation.ratings);
    if (
      returnedCorrection &&
      !panelsChanged &&
      !assessmentChanged &&
      input.reaffirmCorrectionRequestId !== report.openCorrection?.id
    ) {
      return {
        outcome: "validation",
        message:
          "Confirm the open correction request explicitly before creating an unchanged reaffirmation version.",
        fields: [
          {
            path: "reaffirmCorrectionRequestId",
            message: "Explicit reaffirmation is required for unchanged content.",
          },
        ],
      };
    }
    if (!returnedCorrection && !panelsChanged) {
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
    report.wordingHash = `fixture-wording-${report.studentId}-edit-${report.revisionNumber}`;
    report.lockVersion += 1;
    report.checklist = clone(EMPTY_CHECKLIST);
    report.versionRatings = clone(report.observation.ratings);
    report.observationChangedSinceVersion = false;
    report.status = "draft_ready";
    if (returnedCorrection && report.openCorrection) {
      report.openCorrection = { ...report.openCorrection, status: "resolved" };
    }
    this.writeState(state);
    return {
      outcome: "success",
      data: {
        reportId: report.reportId,
        status: "draft_ready",
        versionId: report.versionId,
        checklistReset: true,
        correctionResolved: returnedCorrection,
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

  /**
   * Hero Phase 7 / `F-S6-REVIEW-1`.
   *
   * ⚠️ It writes `observation.followUp` — the SAME field `saveObservation`
   * writes and the same one the roster's carried-over focus reads. That is the
   * point of the clause: one column, two surfaces. A fixture that kept a
   * separate "review note" would model two notes and would hide exactly the
   * defect the governed function exists to prevent.
   *
   * ⛔ No status gate and no lock bump, mirroring the RPC: the note is in no
   * frozen version and under no content hash, and the carry-over must stay
   * correctable. Contrast `updateTrainerChecklist` above, which legitimately
   * refuses outside `draft_ready`/`needs_edit` and version-checks — the
   * checklist attests to a specific text, this note does not.
   */
  async saveFollowUpNotes(
    input: SaveFollowUpNotesInput,
  ): Promise<UiActionResult<TrainerWorkingReportDto>> {
    await delay(200);
    const state = this.readState();
    const report = state.reports[input.reportId];
    if (!report) return { outcome: "unavailable" };
    report.observation.followUp = input.followUpNotes;
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

  async managementEditWording(
    input: ManagementEditWordingInput,
  ): Promise<UiActionResult<ManagementEditWordingSuccess>> {
    await delay(480);
    const state = this.readState();
    const report = state.reports[input.reportId];
    if (!report) return { outcome: "unavailable" };
    if (
      report.lockVersion !== input.expectedLockVersion ||
      report.versionId !== input.expectedVersionId ||
      report.wordingHash !== input.expectedWordingHash
    ) {
      return {
        outcome: "stale_state",
        message: "This report changed while you were working. Reload it before saving.",
      };
    }
    if (report.status !== "trainer_approved") return { outcome: "unavailable" };
    const fields = Object.entries(input.panels)
      .filter(([, value]) => !value.trim())
      .map(([path]) => ({ path, message: "This parent-facing panel is required." }));
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
    report.versionId = `fixture-version-${report.studentId}-management-${report.revisionNumber}`;
    report.contentHash = `fixture-internal-content-${report.studentId}-management-${report.revisionNumber}`;
    report.wordingHash = `fixture-wording-${report.studentId}-management-${report.revisionNumber}`;
    report.lockVersion += 1;
    this.writeState(state);
    return {
      outcome: "success",
      data: {
        reportId: report.reportId,
        status: "trainer_approved",
        versionId: report.versionId,
        wordingHash: report.wordingHash,
      },
    };
  }

  async managementReturnToTrainer(
    input: ManagementReturnToTrainerInput,
  ): Promise<UiActionResult<ManagementReturnToTrainerSuccess>> {
    await delay(480);
    const state = this.readState();
    const report = state.reports[input.reportId];
    if (!report) return { outcome: "unavailable" };
    if (
      report.lockVersion !== input.expectedLockVersion ||
      report.versionId !== input.expectedVersionId
    ) {
      return {
        outcome: "stale_state",
        message: "This report changed while you were working. Reload it before returning.",
      };
    }
    if (report.status !== "trainer_approved") return { outcome: "unavailable" };

    const fields: { path: string; message: string }[] = [];
    const reason = input.reason.trim();
    if (!reason || reason.length > 2000) {
      fields.push({
        path: "reason",
        message: "Provide a correction reason between 1 and 2,000 characters.",
      });
    }
    if (input.issueScope === "rating" && !input.dimensionCode) {
      fields.push({
        path: "dimensionCode",
        message: "Choose the affected dimension for a rating concern.",
      });
    }
    if (input.issueScope !== "rating" && input.dimensionCode) {
      fields.push({
        path: "dimensionCode",
        message: "An affected dimension is used only for a rating concern.",
      });
    }
    if (fields.length > 0) {
      return {
        outcome: "validation",
        message: "Complete the bounded assessment-fact concern before returning.",
        fields,
      };
    }

    const correctionRequestId = `correction-${report.studentId}-${report.lockVersion + 1}`;
    report.status = "needs_edit";
    report.lockVersion += 1;
    report.openCorrection = {
      id: correctionRequestId,
      issueScope: input.issueScope,
      ...(input.dimensionCode ? { dimensionCode: input.dimensionCode } : {}),
      status: "open",
      reason,
    };
    report.observationChangedSinceVersion = false;
    this.writeState(state);
    return {
      outcome: "success",
      data: {
        reportId: report.reportId,
        status: "needs_edit",
        correctionRequestId,
        parentVisible: false,
      },
    };
  }

  async managementApproveAndSubmit(
    input: ManagementApproveAndSubmitInput,
  ): Promise<UiActionResult<ManagementApproveAndSubmitSuccess>> {
    await delay(520);
    const state = this.readState();
    const report = state.reports[input.reportId];
    if (!report) return { outcome: "unavailable" };
    if (
      report.lockVersion !== input.expectedLockVersion ||
      report.versionId !== input.expectedVersionId ||
      report.wordingHash !== input.expectedWordingHash
    ) {
      return {
        outcome: "stale_state",
        message: "This report changed while you were working. Reload it before submitting.",
      };
    }
    if (report.status !== "trainer_approved") return { outcome: "unavailable" };

    const submittedAt = "2026-08-05T12:00:00.000Z";
    report.status = "submitted";
    report.lockVersion += 1;
    report.latestSubmitted = {
      versionId: report.versionId,
      panels: clone(report.panels),
      submittedAt,
    };
    this.writeState(state);
    return {
      outcome: "success",
      data: {
        reportId: report.reportId,
        status: "submitted",
        submittedAt,
        parentVisible: true,
      },
    };
  }
}

export function createDeterministicFixturePhysicalTestPort(
  sessionRole: SessionRole = "trainer",
): DeterministicFixturePhysicalTestPort {
  return new DeterministicFixturePhysicalTestPort(sessionRole);
}

export function makeAssessmentRatings(
  ratings: Readonly<Record<DimensionCode, RatingLevel | null>>,
): readonly AssessmentRatingDto[] {
  return DIMENSION_CODES.map((dimensionCode) => ({
    dimensionCode,
    rating: ratings[dimensionCode],
  }));
}
