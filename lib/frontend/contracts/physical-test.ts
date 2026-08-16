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
  /**
   * Hero Phase 4 (screen `06` lesson strip). NULL MEANS NOT RECORDED — OMIT
   * the element. Never "Lesson 1", never "TBC".
   *
   * ⛔ LESSON IDENTITY ONLY (G-3). There is NO KEY FOCUS field and none may be
   * added. KEY FOCUS is lesson-plan INTENT; `RosterEntryDto.previousSessionFocus`
   * is the trainer's own GOVERNED carried-over focus, derived from
   * `observations.follow_up_notes`. ⚠️ They occupy the same visual position in
   * the frame, so conflating them would silently replace a governed field with
   * an ungoverned one — invisibly, on the rendered page. No lesson field may be
   * rendered into the carried-over focus line, or into any surface that
   * presents the governed focus.
   */
  readonly lessonNumber: number | null;
  readonly lessonTitle: string | null;
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

/**
 * `P2-8` — screen `17` Management Students.
 *
 * ⛔ NO RATING FIELD, AND THERE IS NO PLACE TO PUT ONE. The frame draws an
 * `Overall` chip on every row and the pack note calls it *"current B.E.S.T.
 * Rating"*. `C-9` — whose own row names `P2-8` — confines the nine ratings to
 * report DETAIL surfaces because ratings on a list *"invite comparison between
 * children"*, and `G-2` bars every roll-up on every surface, permanently. A
 * column literally labelled `Overall` is a roll-up by name.
 *
 * ⛔ NO STUDENT CODE. The frame draws `ID 2025-113`; `public.students` carries
 * `id, centre_id, full_name, is_active` and timestamps and NO code column,
 * measured at HEAD. Inventing one would be schema inferred from a frame
 * (`A-022`). `REGISTERED-OMISSION`.
 */
export type ManagementStudentRowDto = {
  readonly studentId: string;
  readonly fullName: string;
  /** Every ACTIVE enrolment. The note says *"Class or Classes"* — a second is rendered. */
  readonly classes: readonly string[];
  /** `null` where no active link exists — hero `0B` OMITS, never `Unknown`. */
  readonly guardianName: string | null;
};

/**
 * `P2-10` — screen `23` Management Trainers.
 *
 * ⛔ THREE THINGS THE FRAME DRAWS THAT THIS SHAPE CANNOT CARRY, each for its
 * own reason and none of them "not built yet":
 *  ~~- the **email** under each name — the pack bars exposing authentication
 *    details…~~ ✅ **PERMITTED — Operator ruling, 2026-08-15.** *"An identifier a
 *    manager already typed is not a disclosure to that manager."* ⛔ **MANAGEMENT
 *    ONLY**; it generalises to no other role and no other person's email.
 *    ⚠️ The Operator also ratified the PROCESS: *"failing closed first was
 *    correct — I would rather see a closed field with a question than an open
 *    one with an assumption."*
 *  - **`On leave`** — `GC-12`. `centre_membership_status` has exactly three
 *    members and none of them is a leave state. Inventing one would be schema
 *    from a frame (`A-022`).
 *  - an **`Edit`** target — no Edit-Trainer screen exists in the ratified 36.
 */
export type ManagementTrainerRowDto = {
  readonly membershipId: string;
  readonly fullName: string;
  /** ⛔ `null` renders as an OMITTED line, never an empty one (hero `0B`). */
  readonly email: string | null;
  readonly status: "active" | "deactivated";
  /** A COUNT of class modules. ⛔ Never a rating, never a roll-up of one. */
  readonly classCount: number;
  /** A COUNT of actively-enrolled learners. ⛔ Never a rating. */
  readonly studentCount: number;
};

export type ManagementTrainerListDto = {
  readonly trainers: readonly ManagementTrainerRowDto[];
  readonly staffCount: number;
};

/**
 * `P2-11` — screen `24` Management Add Trainer.
 *
 * ⛔ THREE FIELDS. The frame draws SIX plus a photo and a class picker, and the
 * other five are absent for five DIFFERENT reasons — all recorded at
 * `server/modules/identity-access/trainer-invitation.ts`, none of them "not
 * built yet":
 *
 *  - **`Role`** — `GC-11`: `Assistant Trainer` is not a member of
 *    `centre_membership_role`, so the option cannot be persisted at all. TA is
 *    a deferred persona (`A-014`, `G-7`). The role is pinned inside the RPC.
 *  - **`Phone`** and **`Employee ID`** — ⛔ NO COLUMN EXISTS on any of the four
 *    tables, measured. ▶ **The one genuine Operator decision on this screen**:
 *    nothing forbids a staff phone number, there is simply nowhere to put one,
 *    and two columns is a schema change of its own.
 *  - **`Upload photo`** — no column, no bucket, no policy; `C-15` is the
 *    adjacent precedent, cited rather than stretched to cover this.
 *  - **`Assign Classes`** — `A-016` makes assignment authoritative at CLASS
 *    SESSION level and the chips are class MODULES, aimed at a `pending`
 *    membership. Assignment has its own governed path.
 *
 * ⚠️ `firstName` AND `lastName` JOIN INTO ONE `accounts.display_name`. Two
 * inputs, one column — the schema already represents a person's name once.
 */
export type CreateTrainerInput = {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  /**
   * `C-14` — `accounts.phone`. ⛔ A CONTACT DETAIL, NEVER A CREDENTIAL and
   * never an authentication factor (`A-027`). Optional; blank travels as
   * `null`.
   */
  readonly phone?: string | null;
  /*
   * ⛔ `employeeId` AND `role` are drawn by screen `24`'s frame and are
   * REFUSED — `role` additionally because the Assist./TA vocabulary is
   * prohibited.
   */
};

export type TrainerInvitationOutcomeDto = {
  readonly membershipId: string;
  readonly invitationId: string;
  /** `created`. ⛔ A refusal never arrives here — it arrives as a failure. */
  readonly reason: string;
};


/**
 * `P2-9` — screen `18` Management Student Profile.
 *
 * ⛔ NO RATING FIELD EXISTS ANYWHERE IN THIS SHAPE, AND THAT IS STRUCTURAL.
 * `GC-6` on pack `18` reads *"do not add a rating badge, bar, column, tile or
 * chip"*, and the frame draws three things that would be one: the nine-bar
 * **Skill Breakdown**, the **Strengths & Focus Areas** chips (Operator-ruled
 * 2026-08-15 — they are the Skill Breakdown thresholded), and the Reports
 * **GRADE** column (`G-2`, permanently). ▶ **None of them has a field here.**
 *
 * ⚠️ `sessionScore` IS `D-2` AND IT IS A COORDINATE. It exists so the Growth
 * Trend can be drawn. ⛔ **It must never be rendered as a number, a band or a
 * grade, on any surface, to any role** — the suite asserts that on the screen,
 * because rendering is where the constraint lives.
 */
export type StudentTrendPointDto = {
  readonly classSessionId: string;
  readonly sessionDate: string;
  readonly lessonTitle: string | null;
  readonly sessionScore: number;
};

export type StudentReportRowDto = {
  readonly reportId: string;
  readonly classSessionId: string;
  readonly sessionDate: string;
  readonly classLabel: string;
  readonly lessonTitle: string | null;
  readonly termLabel: string | null;
  /**
   * ⚠️ A LIFECYCLE STATE, NEVER A GRADE. `A-038` requires the row to gate on
   * it: `submitted` links to the canonical report, `trainer_approved` to the
   * management final-review surface, and every earlier status exposes no
   * report content at all.
   */
  readonly reportState: string;
  readonly submittedAt: string | null;
};

export type StudentClassRowDto = {
  readonly classModuleId: string;
  readonly title: string;
  readonly gradeLabel: string;
  readonly schedule: string | null;
  /** ⛔ ONE trainer. `A-014`/`G-7` — no Trainer Assistant line, ever. */
  readonly trainerName: string | null;
};

/**
 * ⛔ FOUR FIELDS THE FRAME DRAWS THAT HAVE NO COLUMN, so they have no field
 * here either: `Date of birth`, `Contact`, `Student ID 2025-113`, and the
 * `Good standing` chip — which is not a concept anywhere in this system.
 * `students` is `id · centre_id · full_name · is_active · created_at ·
 * updated_at · deactivated_at`, measured. **Disclosed on the page, not
 * invented.**
 */
export type ManagementStudentProfileDto = {
  readonly studentId: string;
  readonly fullName: string;
  readonly isActive: boolean;
  readonly guardianName: string | null;
  /**
   * `C-14`. ⛔ `guardianContact` IS PRE-LINK ONLY and is `null` the moment a
   * parent is linked — the linked account is the living record. `guardianLinked`
   * says WHICH source decided the pair, which is not derivable from the
   * resolved value itself, and screen `22` needs it to know whether the fields
   * are writable at all.
   * ⛔ `guardianLinked` DISCLOSES NO PARENT IDENTITY — a boolean, not an
   * account, an email or a link id.
   */
  readonly guardianContact: string | null;
  readonly guardianLinked: boolean;
  readonly dateOfBirth: string | null;
  readonly enrolledOn: string | null;
  readonly attendancePresent: number;
  readonly attendanceTotal: number;
  readonly classes: readonly StudentClassRowDto[];
  readonly trend: readonly StudentTrendPointDto[];
  readonly reports: readonly StudentReportRowDto[];
};


/**
 * `P2-15` — screen `15` Management Lesson Statistics.
 *
 * ⛔ FIVE OF THE FRAME'S SIX CARDS ARE PROHIBITED, AND NONE HAS A FIELD HERE:
 * **Skill Averages** (nine labelled percentage bars) · **Status Distribution**
 * (a donut counting `Mastering` / `Mastered` / `Developing` / `Beginning` —
 * the four ratified labels as legend values) · **`Class Average 82%`** (a
 * roll-up, and `D-2`'s *"never rendered as a number"*) · **Student Breakdown's
 * `Strongest` / `Focus area` / `Overall`** (`G-2` names those exact limbs) ·
 * **`Trainer & Assistant`** (`A-014`/`G-7`, plus five invented fields with no
 * columns). `GC-6` on this pack carries the ruling and the two independent
 * grounds, `C-9` and `G-2`.
 *
 * ✅ WHAT SURVIVES IS ALL COUNTS: who taught it, how many are enrolled, how
 * many were present, how many were assessed, how many reports are submitted.
 * ⛔ **The standing test applies** — if any becomes derived from rating VALUES
 * rather than counted, that is a stop-and-ask.
 */
export type LessonStatisticsDto = {
  readonly classSessionId: string;
  readonly classModuleId: string;
  readonly classLabel: string;
  readonly sessionDate: string;
  readonly lessonNumber: number | null;
  readonly lessonTitle: string | null;
  readonly startsAt: string | null;
  readonly endsAt: string | null;
  readonly room: string | null;
  /** ⛔ ONE trainer. `A-014`/`G-7` — there is no field for an Assistant. */
  readonly trainerName: string | null;
  readonly enrolledCount: number;
  readonly presentCount: number;
  readonly attendanceRecorded: number;
  readonly assessedCount: number;
  readonly submittedCount: number;
  readonly awaitingCount: number;
};

/**
 * `P2-16` — screen `16` Management Class Statistics. **`PARTIAL`.**
 *
 * ⛔ ALL THREE CARDS THE FRAME DRAWS ARE REFUSED — Skill Averages, the
 * Ongoing Performance donut (`82% avg` + the four rating labels as legend
 * values) and Student Breakdown’s Strongest / Focus area / Overall.
 * `GC-6` on `C-9` and `G-2`.
 *
 * ✅ AND TWO PANELS THE FRAME OMITS ARE BUILT, by ruling `C-17`.
 * ⛔ Neither is ever AI-authored prose.
 *
 * ⚠️ THE ALLOW-LIST CARRIES NO RATING, NO AVERAGE AND NO DISTRIBUTION —
 * refused by NOT BEING WRITTEN DOWN, which survives a later column appearing
 * upstream.
 */

/**
 * `P2-17` — screen `02` Trainer My Classes.
 * ⛔ NO rating, report state or assessment field. A label, a count, a schedule
 * string and a date.
 */
export type TrainerTermDto = {
  readonly termId: string;
  readonly label: string;
  readonly startsOn: string;
  readonly endsOn: string;
};

export type TrainerClassCardDto = {
  readonly classModuleId: string;
  readonly title: string;
  readonly gradeLabel: string;
  readonly displayLabel: string;
  readonly initials: string;
  readonly studentCount: number;
  readonly scheduleSummary: string | null;
  /** ⛔ NULL means no upcoming session — the line is omitted (hero `0B`). */
  readonly nextSessionDate: string | null;
};

export type TrainerMyClassesDto = {
  readonly terms: readonly TrainerTermDto[];
  readonly selectedTermId: string | null;
  readonly cards: readonly TrainerClassCardDto[];
};


/**
 * `P2-19` — screen `01` Trainer Dashboard.
 * ⛔ NO rating, panel, note or hash. Identifiers, a status and a timestamp.
 */
export type TrainerRecentReportDto = {
  readonly reportId: string;
  readonly classSessionId: string;
  readonly studentId: string;
  readonly studentName: string;
  readonly classLabel: string;
  readonly sessionDate: string;
  /** ⛔ A LIFECYCLE STATUS, never a rating. */
  readonly reportState: string;
  readonly updatedAt: string;
};

export type TrainerTodaySessionDto = {
  readonly classSessionId: string;
  readonly classLabel: string;
  readonly startsAt: string | null;
  readonly room: string | null;
  readonly isNow: boolean;
};

export type TrainerDashboardDto = {
  readonly displayName: string | null;
  readonly classCount: number;
  readonly studentCount: number;
  readonly pendingReviews: number;
  readonly classes: readonly TrainerClassCardDto[];
  readonly recent: readonly TrainerRecentReportDto[];
  readonly today: readonly TrainerTodaySessionDto[];
  readonly monthSessionDates: readonly string[];
  readonly monthLabel: string;
};


/**
 * `P2-20` — screen `04` Trainer Students.
 * ⛔ NO RATING FIELD EXISTS ON THIS TYPE, and none can: the governed read
 * returns none (`GC-7`, and `G-2` independently).
 */
export type TrainerStudentRowDto = {
  readonly studentId: string;
  readonly studentName: string;
  readonly initials: string;
  readonly classModuleId: string;
  readonly classLabel: string;
  /** ⚠️ NULL means NOT ASSESSED — rendered as the frame's own dash. */
  readonly lastAssessed: string | null;
};

export type TrainerStudentsDto = {
  /** ⛔ DISTINCT learners, never the row count. */
  readonly studentCount: number;
  readonly rows: readonly TrainerStudentRowDto[];
  readonly classes: readonly { readonly classModuleId: string; readonly classLabel: string }[];
};


/**
 * `P2-12` — screen `20` Register New Student.
 * ⛔ TWO FIELDS AND A CLASS LIST. The frame's seven other profile fields have
 * no column and are CITED on the page, not modelled here — a DTO field with
 * nowhere to go is how an invented column starts.
 */

/**
 * `P2-21` — screen `09` Trainer Reports.
 *
 * ⛔ NO RATING FIELD, AND THE ABSENCE IS THE REFUSAL. The frame draws a
 * `Level` column of `Mastering`/`Developing`/`Mastered`/`Beginning`;
 * `GC-7` refuses it because this pack's own `screen.md` §8 declares the
 * screen NOT RATING-BEARING. ▶ Held in the TYPE, which a component cannot
 * undo — a screen that merely declines to render one is a line away from
 * carrying it.
 *
 * ⛔ `reportState` IS ONE OF `A-036`'s EIGHT, never the frame's
 * `In session` / `Draft` (`GC-8`: a status must never be added to encode
 * UI presence).
 */
export type TrainerReportRowDto = {
  readonly reportId: string;
  readonly classSessionId: string;
  readonly studentId: string;
  readonly studentName: string;
  readonly classLabel: string;
  readonly sessionDate: string;
  readonly reportState: string;
  readonly updatedAt: string;
  /** ⚠️ `null` where the session carries no lesson — OMITTED, never invented (hero `0B`). */
  readonly lessonNumber: number | null;
  readonly lessonTitle: string | null;
};

export type TrainerReportsDto = {
  readonly reports: readonly TrainerReportRowDto[];
  readonly classes: readonly { readonly label: string; readonly count: number }[];
  readonly total: number;
};

export type LessonPlanEntryDto = {
  readonly sessionId: string;
  readonly lessonNumber: number | null;
  readonly lessonTitle: string | null;
  readonly sessionDate: string;
  readonly room: string | null;
  readonly timing: "completed" | "this_week" | "upcoming";
};

/**
 * Screen `03` Trainer Lesson Plan — `P2-18`.
 *
 * ⛔ THERE IS NO `keyFocus` FIELD, AND ITS ABSENCE IS THE `G-3` ENFORCEMENT.
 * ⚠️ Operator ruling 2026-08-17 — **"BUILD THE KEY FOCUS CHIPS"** — put them
 * IN SCOPE for this
 * screen — the surviving prohibition is about POSITION, and `03` carries no
 * governed previous-session-focus line for them to displace. ▶ But the same
 * ruling made the schema a SEPARATE authorization, and measurement showed the
 * only focus columns in the whole database are `observations.focus_chips` and
 * `observations.strength_chips` — post-session ASSESSMENT data, which is
 * exactly what `G-3` bars. **The chips are ruled in and are not built.**
 */
export type TrainerLessonPlanDto = {
  readonly classModuleId: string;
  readonly moduleTitle: string;
  readonly gradeLabel: string;
  readonly displayLabel: string;
  readonly termLabel: string | null;
  readonly learnerCount: number;
  readonly scheduleSummary: string | null;
  readonly lessons: readonly LessonPlanEntryDto[];
};

export type ParentUpcomingSessionDto = {
  readonly sessionId: string;
  readonly sessionDate: string;
  readonly lessonNumber: number | null;
  readonly lessonTitle: string | null;
};

export type ParentChildDto = {
  readonly studentId: string;
  readonly studentName: string;
  readonly classLabel: string | null;
  readonly dateOfBirth: string | null;
  readonly guardianName: string | null;
  readonly guardianContact: string | null;
  readonly enrolledAt: string | null;
  readonly trainerDisplayName: string | null;
  readonly sessions: readonly ParentUpcomingSessionDto[];
};

/**
 * Screen `30` Parent Dashboard — `P2-22`.
 *
 * ⛔ `Q-27` IS HELD IN THIS TYPE. The frame draws nine B.E.S.T dimensions with
 * rating bars; the ruling makes the COMPLETE card absent and states it as a
 * DATA boundary — the nine ratings must not reach a Parent-facing DTO,
 * projection, RPC result, server action or client payload. ▶ There is no field
 * here a rating could occupy, which is a stronger refusal than a component
 * choosing not to render one.
 *
 * ⚠️ Every nullable field means NOT RECORDED (hero `0B`) and is rendered by
 * OMITTING its row. Never a dash, never "TBC", never a fabricated value.
 */
export type ParentDashboardDto = {
  readonly children: readonly ParentChildDto[];
};

export type RegisterStudentInput = {
  readonly firstName: string;
  readonly lastName: string;
  readonly classModuleIds: readonly string[];
  /**
   * `C-14` (Operator ruling, 2026-08-16). ⚠️ ALL OPTIONAL; blank travels as
   * `null`, NEVER `""` — hero `0B` makes NULL mean NOT RECORDED, and an empty
   * string would render on screen `18` as a present-but-empty fact.
   * ⛔ `gender`, `studentId`, `homeAddress`, guardian `email` and `photo` are
   * drawn by screen `20`'s frame and are REFUSED — absent from this type, so
   * no caller can supply one.
   */
  readonly dateOfBirth?: string | null;
  readonly guardianName?: string | null;
  readonly guardianContact?: string | null;
};

export type RegisterStudentOutcomeDto = {
  readonly studentId: string;
  readonly enrolments: number;
  /** `created`. ⛔ A refusal never arrives here — it arrives as a failure. */
  readonly reason: string;
};


/**
 * `P2-13` — screen `21` Create Parent Account.
 * ⛔ NO `relationship` AND NO `phone`. Neither has a column, and a DTO field
 * with nowhere to go is how an invented column starts.
 */
export type CreateParentInput = {
  readonly fullName: string;
  readonly email: string;
  readonly studentIds: readonly string[];
  /**
   * `C-14` — `accounts.phone`. ⛔ A CONTACT DETAIL, NEVER A CREDENTIAL and
   * never an authentication factor (`A-027`). Optional; blank travels as
   * `null`.
   */
  readonly phone?: string | null;
  /* ⛔ `relationship` is drawn by screen `21`'s frame and is REFUSED. */
};

export type CreateParentOutcomeDto = {
  readonly membershipId: string;
  readonly invitationId: string;
  readonly links: number;
  /** `created`. ⛔ A refusal never arrives here — it arrives as a failure. */
  readonly reason: string;
};


/**
 * `P2-14` — screen `22` Edit Student.
 * ⛔ THE SAME THREE FIELDS AS REGISTRATION, plus the id. No DOB, gender,
 * student code, guardian field or photo — none has a column.
 */
export type UpdateStudentInput = {
  readonly studentId: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly classModuleIds: readonly string[];
  /**
   * `C-14` (Operator ruling, 2026-08-16). ⚠️ ALL OPTIONAL; blank travels as
   * `null`, NEVER `""` — hero `0B` makes NULL mean NOT RECORDED, and an empty
   * string would render on screen `18` as a present-but-empty fact.
   * ⛔ `gender`, `studentId`, `homeAddress`, guardian `email` and `photo` are
   * drawn by screen `20`'s frame and are REFUSED — absent from this type, so
   * no caller can supply one.
   */
  readonly dateOfBirth?: string | null;
  readonly guardianName?: string | null;
  readonly guardianContact?: string | null;
  /*
   * ⛔ SEND `null` FOR BOTH GUARDIAN FIELDS ONCE THE LEARNER HAS A LINKED
   * PARENT ACCOUNT. The linked account always wins, and `admin_update_student`
   * REFUSES rather than silently ignoring a value.
   */
};

export type UpdateStudentOutcomeDto = {
  /** `saved`. ⛔ A refusal never arrives here — it arrives as a failure. */
  readonly reason: string;
  readonly added: number;
  readonly removed: number;
  readonly nameChanged: boolean;
};

export type WithdrawStudentOutcomeDto = {
  /** `withdrawn`. */
  readonly reason: string;
  readonly removed: number;
};

export type ClassStatisticsDto = {
  readonly classModuleId: string;
  readonly classLabel: string;
  readonly enrolledCount: number;
  readonly assessedCount: number;
  readonly submittedCount: number;
  /** ⛔ A DIMENSION LABEL — never a rating, never a score. */
  readonly mainFollowUpDimension: string | null;
  readonly recommendedAction: string | null;
  /**
   * ✅ SLOT 2 — BUILT by Operator ruling 2026-08-16. ⛔ A DIMENSION LABEL,
   * never a value: *"a dimension name is not a rating — it names where
   * attention goes, not how anyone performed."*
   */
  readonly improvedDimension: string | null;
  /** §6's under-two-sessions floor. NULL when the read REFUSED (`Q-7`). */
  readonly trendSessionsConsidered: number | null;
  /** ⛔ Selected by REPORT STATUS, never by rating. */
  readonly followUpRows: readonly ClassOverviewRowDto[];
};

export type ManagementStudentListDto = {
  readonly students: readonly ManagementStudentRowDto[];
  readonly enrolledCount: number;
  readonly grades: readonly { readonly id: string; readonly label: string }[];
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
};

/**
 * P2-1 — screen `12` Management Classes.
 *
 * ⛔ THREE OMISSIONS ARE RULED, AND EACH IS RECORDED WHERE A LATER PASS WOULD
 * LOOK FOR IT:
 *  - the frame's `Asst. <name>` slot is a Teaching Assistant field, PROHIBITED
 *    by `A-014`/`G-7` (`centre_membership_role` is not extended). It NEVER
 *    ends and there is no DTO field for it.
 *  - the frame's `X / 12 Lessons done` needs lesson data that does not exist
 *    at HEAD. It is a `REGISTERED-OMISSION` that ENDS WHEN `D-3`/`D-4` DATA
 *    ARRIVES (`P2-2`/`P2-6`) — not a field to invent now (`A-022`).
 *  - the frame's level tab reads `Junior`. The ratified Class Grade vocabulary
 *    is `Beginner` / `Intermediate` / `Advanced` (`A-016`, `A-054`), and the
 *    tabs are read from the seeded `class_grades` rows, never from the frame.
 *
 * ⛔ NO RATING, ROLL-UP OR REPORT STATUS. `12` is a LIST surface: `C-9` bars
 * per-dimension ratings there and `G-2` bars a roll-up everywhere.
 */
export type ClassGradeOptionDto = {
  readonly code: string;
  readonly displayName: string;
  readonly sortOrder: number;
};

export type ManagementClassSummaryDto = {
  readonly classModuleId: string;
  readonly title: string;
  readonly classGradeCode: string;
  readonly classGradeLabel: string;
  readonly classGradeSortOrder: number;
  readonly activeStudentCount: number;
  /**
   * The DISTINCT trainers assigned across this module's sessions.
   * ⛔ Plural because `A-016` makes assignment authoritative at CLASS-SESSION
   * level — there is no module-level trainer field, and a second name means a
   * second session's trainer, never an assistant.
   */
  readonly trainerDisplayNames: readonly string[];
};

/**
 * `P2-5` — screen `25` Management Schedule.
 *
 * ⛔ FOUR THINGS THE FRAME DRAWS THAT THIS SHAPE DELIBERATELY CANNOT CARRY,
 * so a later phase cannot render one by accident:
 *
 *  - **`Showcase`** — the frame's second badge and its third chip colour.
 *    `GC-13` bars it outright. There is no session-type field here and none
 *    in the database (`session_type`, `event_type` and `showcase` return ZERO
 *    columns, measured at HEAD), so the concept has nowhere to live.
 *  - **`Assist. Sam Ong` / `Assist.`** — `A-014` defers the TA persona and
 *    `G-7` binds `centre_membership_role` against extension. ⚠️ Here it is
 *    also STRUCTURALLY INEXPRESSIBLE: `class_session_assignments.trainer_role`
 *    IS `centre_membership_role`, whose values are `management` / `trainer` /
 *    `parent`. `REGISTERED-OMISSION`, and it NEVER ENDS.
 *  - **`Main:`** — a CONSEQUENCE of the line above, not a separate decision.
 *    The prefix exists in the frame only to contrast with `Assist.`; with no
 *    assistant possible, it is a distinction with nothing on its other side.
 *  - **`Junior`** — the ratified Class Grade vocabulary is `Beginner` /
 *    `Intermediate` / `Advanced` (`A-016`, `A-026`, `A-054`). The label is
 *    READ from `class_grades.display_name`, never written as a literal.
 */
export type ScheduleSessionSummaryDto = {
  readonly classSessionId: string;
  readonly classModuleId: string;
  /** `YYYY-MM-DD`. */
  readonly sessionDate: string;
  /** `null` where not recorded — the surface omits the row (hero 0B). */
  readonly startTime: string | null;
  readonly endTime: string | null;
  /** `null` on every fixture session at HEAD. The column exists; the value does not. */
  readonly room: string | null;
  readonly moduleTitle: string;
  readonly classGradeLabel: string | null;
  /** Distinct assigned trainers. A second name is a second trainer, never an assistant. */
  readonly trainerDisplayNames: readonly string[];
};

export type ManagementScheduleDto = {
  readonly sessions: readonly ScheduleSessionSummaryDto[];
  /** `YYYY-MM` values this centre demonstrably has sessions in. */
  readonly monthsWithSessions: readonly string[];
};

/**
 * `P2-7` — screen `11` Management Dashboard KPI tiles.
 *
 * ⛔ FOUR INTEGERS. There is no field a rating, roll-up, panel, note,
 * checklist value or content hash could arrive in — `C-9` confines the nine
 * ratings to report DETAIL surfaces and `G-2` bars every roll-up everywhere.
 *
 * ⛔ `submittedReports`, NOT `approved`. `A-036` makes `approved`
 * TRANSIENT-IN-TRANSACTION and it never commits, so the frame's `Approved`
 * tile counts a status with an empty referent and would read ZERO FOREVER.
 * ▶ A KPI that can only ever report zero asserts a measurement that does not
 * exist, which is worse than the tile being absent. Operator ruling,
 * 2026-08-14 — the third sighting of the Step 7I1D-R2 defect.
 */
/*
 * ⛔ THREE TILES, NOT FOUR — `Ruling A`, Operator, 2026-08-15.
 *
 * `assessedStudents` is gone, dropped at the SOURCE by a forward migration
 * under `R-1` rather than left unread: *"Leaving it unread is the option that
 * rots."*
 *
 * ⚠️ AND `totalStudents` NOW MEANS **ENROLLED**, not centre-resident — the same
 * name over a different number. ⛔ **Both were 13 at HEAD**, so the change is
 * invisible until a learner withdraws, which is exactly why it was decided now
 * rather than when it split.
 */
export type ManagementDashboardSummaryDto = {
  readonly totalStudents: number;
  readonly pendingApproval: number;
  readonly submittedReports: number;
};

/**
 * `P2-6` — screen `14` Management Lesson Plan Management.
 *
 * ⛔ THREE THINGS THE FRAME DRAWS THAT THIS SHAPE DELIBERATELY CANNOT CARRY:
 *  - `KEY FOCUS POINTS` — RAISED BY THIS PHASE AND DECLINED BY THE OPERATOR.
 *    `D-4` gives the chips a purpose and a position constraint and names no
 *    AUTHOR; no authoring surface exists in the ratified inventory, so a read
 *    would render a permanently empty panel. There is no
 *    `class_sessions.key_focus` and migration assertion `M-6` fails the build
 *    if one appears. ⚠️ `D-4`'s mention is not licence for a later phase.
 *  - `6-week persuasive speaking unit` — no description column exists on
 *    `class_modules`, and schema'ing one from a frame is what `A-022` bars
 *    (`C-14` family).
 *  - `Studio 2` on the header line — the module-level recurrence summary.
 *    ⚠️ `room` IS carried PER SESSION, because the column exists; it is NULL
 *    on every fixture session, so the element is omitted rather than faked
 *    (hero `0B`).
 */
export type LessonMaterialDto = {
  readonly materialId: string;
  readonly displayName: string;
  readonly mediaType: string;
  readonly byteSize: number;
  readonly createdAt: string;
};

export type LessonPlanSessionDto = {
  readonly classSessionId: string;
  /** `YYYY-MM-DD`. */
  readonly sessionDate: string;
  readonly startsAt: string | null;
  readonly endsAt: string | null;
  /** `null` on every fixture session at HEAD. The column exists; the value does not. */
  readonly lessonNumber: number | null;
  readonly lessonTitle: string | null;
  readonly room: string | null;
  readonly termLabel: string | null;
  readonly materials: readonly LessonMaterialDto[];
};

/**
 * ⛔ `P2-6R` — THE MATERIAL TRANSPORT CONTRACTS, WHICH `P2-6` DID NOT SHIP.
 *
 * `P2-6` built `LessonMaterialDto` above and the read that fills it, and then
 * left the three write RPCs reachable from no application code at all. ▶ The
 * three controls on screen `14` rendered `disabled` with a tooltip, and the
 * phase reported COMPLETE — the limit stated in a source comment and nowhere
 * the Operator reads. These types are the repair, and `§12.12` is the rule.
 *
 * ⚠️ The shape mirrors `EvidenceUploadTicketDto` deliberately. Same
 * ticket-then-attach discipline, different owner: evidence is TRAINER-only
 * per-child media, a material is MANAGEMENT-only centre-owned teaching
 * material. ⛔ Neither role inherits the other's capability from the
 * similarity.
 */
/**
 * ⛔ THERE IS NO TICKET TYPE, AND ITS ABSENCE IS THE RULING — not an omission.
 *
 * A first draft of this phase carried `MaterialUploadTicketDto`,
 * `MaterialUploadTicketInput` and `MaterialAttachInput`, mirroring `D-5`'s
 * evidence transport. The Operator then ruled the transport to be a
 * **SERVER-ACTION RELAY**, and with the bytes passing through the server the
 * three-step shape buys nothing: ▶ **the ticket exists only to give a browser
 * something to upload against, and there is no longer a browser doing that.**
 * Splitting the call would leave a window in which an object sits in the bucket
 * referenced by no row, reachable by no read and removable by no caller.
 *
 * ⚠️ The upload therefore crosses as raw `FormData` — a `File` reaches a Server
 * Action no other way — and every field in it is re-read and re-validated
 * server-side, then re-checked again by the database.
 */

/** ⛔ A URL, never a storage path — the bucket is private and stays private. */
export type MaterialViewUrlDto = {
  readonly url: string;
  readonly mediaType: string;
  readonly expiresInSeconds: number;
};

export type ManagementLessonPlansDto = {
  readonly classModuleId: string;
  readonly moduleTitle: string;
  readonly classGradeName: string;
  readonly learnerCount: number;
  /** `null` where the module's sessions do not agree on one term. */
  readonly termLabel: string | null;
  readonly sessions: readonly LessonPlanSessionDto[];
};

export type ManagementClassListDto = {
  readonly grades: readonly ClassGradeOptionDto[];
  readonly classes: readonly ManagementClassSummaryDto[];
};

/**
 * P2-2 — screen `26` Management Add Class.
 *
 * ⛔ FIVE THINGS THE FRAME DRAWS THAT THIS SHAPE DELIBERATELY CANNOT CARRY:
 *  - `Class code` and `Capacity` — omitted by `C-14`.
 *  - `Program` — "programme" has NO ENTITY, and adding one would be a hidden
 *    `classes` entity between Class Grade and Class Module (`A-016`). The
 *    class's name IS the Class Module title.
 *  - ~~`Assigned Trainer` — assignment emits `admin.trainer_assigned`, a THIRD
 *    audit string the Operator did not name…~~ ✅ **BUILT AT `P2-2b`.** The
 *    string was ALREADY in the registry — measured at 19 — and the phase was
 *    stopped on a misread scope, not a missing string. ⛔ **UNASSIGNMENT is
 *    still not built**: leaving an assigned session with no trainer is a
 *    different action with no ratified string, and `26` needs none because at
 *    creation time there is nothing to unassign. A session with no assignment
 *    remains a REAL governed state, and `12` already renders one.
 *  - the `.md`'s `Trainer Assistant (TA)` slot — PROHIBITED (`A-014`, `G-7`),
 *    a `REGISTERED-OMISSION` that NEVER ENDS.
 *
 * ⚠️ TWO CONTROLS THE FRAME DRAWS AS DROPDOWNS ARE BUILT AS FREE INPUTS, AND
 * THE DIVERGENCE IS RECORDED RATHER THAN RESOLVED: `Room` and the two times.
 * The frame is a static render — it shows ONE value in each, and enumerates
 * no options. `room` is a plain descriptive column with no vocabulary
 * anywhere in the schema or in any ruling, so a `<select>` would require
 * INVENTING a room inventory (an entity `A-016` does not have); the times
 * likewise would require inventing a slot vocabulary. ▶ A text/time input
 * preserves the field and invents nothing. `Term` and `Level` ARE selects,
 * because both are backed by real seeded rows.
 */
export type ClassGradeChoiceDto = {
  readonly classGradeId: string;
  readonly code: string;
  readonly displayName: string;
  readonly sortOrder: number;
};

/**
 * ⚠️ `label` IS ONE FIELD. Every frame that mentions a term renders a single
 * string (`"Term 1, 2035"`), so splitting it into a number and a year would
 * invent a structure no frame shows and no rule requires (`D-3`).
 */
export type TermOptionDto = {
  readonly termId: string;
  readonly label: string;
  readonly startsOn: string;
  readonly endsOn: string;
};

/**
 * ⛔ A MEMBERSHIP id, never an account id. Assignment keys on
 * `(trainer_membership_id, centre_id, trainer_role)`, so an account id would
 * lose the centre and the role that make the assignment refusable.
 */
export type TrainerChoiceDto = {
  readonly trainerMembershipId: string;
  readonly displayName: string;
};

export type AddClassOptionsDto = {
  readonly grades: readonly ClassGradeChoiceDto[];
  readonly terms: readonly TermOptionDto[];
  readonly trainers: readonly TrainerChoiceDto[];
};

export type CreateClassInput = {
  readonly classGradeId: string;
  readonly title: string;
  readonly termId: string | null;
  readonly room: string | null;
  readonly startTime: string | null;
  readonly endTime: string | null;
  /** `0` = Sunday … `6` = Saturday, matching the frame's Sun–Sat strip. */
  readonly weekdays: readonly number[];
  /** A MEMBERSHIP id, or `null` for "no trainer yet" — a real governed state. */
  readonly trainerMembershipId: string | null;
};

/**
 * ⚠️ THE PARTIAL RESULT IS REPORTED, NOT COLLAPSED. One call creates one
 * dated session and one further call assigns it, so ten committed sessions
 * under a failed eleventh are real governed state — a "failed" banner over
 * them would be a lie. ⛔ `sessionsAssigned` is separate from
 * `sessionsCreated` for the same reason: a session that exists with no
 * trainer is usable, and collapsing the counts would hide it.
 */
/**
 * P2-4 — screen `13` Class Overview.
 *
 * ⛔ THE ABSENCE OF A RATING FIELD IS STRUCTURAL. `C-9` confines `D-1`'s
 * nine per-dimension ratings to report DETAIL surfaces and `G-2` bars every
 * roll-up on every surface, so this contract carries no field that could hold
 * either — and the two RPCs behind it are asserted not to name one.
 */
export type ClassOverviewRowDto = {
  readonly classSessionId: string;
  readonly sessionDate: string;
  readonly lessonNumber: number | null;
  readonly lessonTitle: string | null;
  readonly studentId: string;
  readonly studentDisplayName: string;
  readonly reportId: string | null;
  /** ⚠️ NULL means **No Report** — `A-038` gives that row no action at all. */
  readonly reportState: string | null;
  readonly evidenceCount: number;
};

export type ClassOverviewSessionDto = {
  readonly classSessionId: string;
  readonly sessionDate: string;
  readonly lessonNumber: number | null;
  readonly lessonTitle: string | null;
  readonly reportedCount: number;
  readonly submittedCount: number;
  readonly learnerCount: number;
};

export type ClassHealthDto = {
  readonly status: string;
  readonly action: string;
  readonly pendingReports: number;
  readonly evidenceMissing: number;
  readonly submittedReports: number;
  readonly totalReports: number;
  readonly mainFollowUpArea: string | null;
};

/**
 * The frame's header card and its two stat tiles (rebuild, 2026-08-13).
 *
 * ⛔ NO TA / ASSISTANT FIELD. The frame draws `ASSISTANT` beside
 * `ASSIGNED TRAINER`; `A-014` defers the persona and `G-7` binds
 * `centre_membership_role` against extension, so there is no field here that
 * could carry one — the omission is structural, not cosmetic.
 *
 * ⛔ NO CLASS CODE, PROGRAMME OR CAPACITY (`C-14`, `A-016`), and no lesson
 * FOCUS chip: lesson-plan focus is `D-4`/`P2-6` work with no substrate at
 * HEAD, and `G-3` bars it from any surface presenting a governed focus.
 *
 * ⚠️ EVERY OPTIONAL FIELD IS `null` WHERE NOT RECORDED and the surface OMITS
 * the element (hero 0B) — including `attendancePercent`, where `0` would be a
 * measured claim that nobody attended.
 */
export type ClassHeaderDto = {
  readonly classModuleId: string;
  readonly title: string;
  readonly classGradeLabel: string | null;
  readonly isActive: boolean;
  readonly meetingDays: readonly string[];
  readonly startTime: string | null;
  readonly endTime: string | null;
  readonly room: string | null;
  readonly learnerCount: number;
  readonly attendancePercent: number | null;
  readonly trainerDisplayNames: readonly string[];
};

export type ClassOverviewDto = {
  readonly header: ClassHeaderDto | null;
  readonly rows: readonly ClassOverviewRowDto[];
  readonly sessions: readonly ClassOverviewSessionDto[];
  readonly health: ClassHealthDto | null;
};

/**
 * P2-3 — screen `27` Edit Class.
 *
 * ⛔ THE THREE REFUSALS ARE HELD BY THIS TYPE. There is no field for
 * removing a session, none for unassigning a trainer, and none for a class
 * code, capacity or programme — so the surface cannot send any of them even
 * by mistake. Removing a session needs a cancel/delete audit string that does
 * not exist, and a session may already carry attendance, an observation or a
 * submitted report.
 */
export type EditableSessionDto = {
  readonly classSessionId: string;
  readonly sessionDate: string;
  readonly startTime: string | null;
  readonly endTime: string | null;
  readonly room: string | null;
  readonly termId: string | null;
  readonly trainerDisplayName: string | null;
};

export type ClassEditDto = {
  readonly classModuleId: string;
  readonly title: string;
  readonly classGradeId: string;
  readonly sessions: readonly EditableSessionDto[];
  /**
   * ⚠️ NULL unless EVERY session agrees on one trainer. `A-016` puts
   * assignment at session level, so a module can legitimately carry different
   * trainers on different sessions; `27` reassigns the whole module at once,
   * and pre-selecting one name over a mixed arrangement would propose
   * overwriting something the form never showed.
   */
  readonly trainerMembershipId: string | null;
};

export type UpdateClassInput = {
  readonly classModuleId: string;
  readonly classGradeId: string;
  readonly title: string;
  readonly termId: string | null;
  readonly room: string | null;
  readonly startTime: string | null;
  readonly endTime: string | null;
  readonly trainerMembershipId: string | null;
};

/** ⚠️ `unchanged` is a REAL outcome: the surface says so rather than claiming an edit. */
export type ClassUpdateOutcomeDto = {
  readonly moduleChanged: boolean;
  readonly sessionsChanged: number;
  readonly sessionsTotal: number;
  readonly trainerChanged: boolean;
  readonly reason: string;
};

export type ClassCreationOutcomeDto = {
  readonly classModuleId: string;
  readonly sessionsRequested: number;
  readonly sessionsCreated: number;
  readonly sessionsAssigned: number;
  readonly reason: string;
};

export type ManagementReviewDto = {
  /**
   * D-1 / C-10 — THE NINE PER-DIMENSION RATINGS, READ ONLY.
   *
   * ⛔ GOVERNANCE-MANDATED ADDITION, NOT DRIFT. The ratified frame
   * `reference/Management - Student Report/` draws a Performance Summary of
   * FOUR dimensions; operator ruling C-10 requires ALL NINE, because
   * rendering four is a selection of assessment substance with no ratified
   * basis. A later visual pass must NOT remove this for failing to match the
   * frame — the divergence is RULED and recorded (D-1, C-9, C-10).
   *
   * ⛔ C-9 — this field belongs to the REPORT DETAIL surface only. It must
   * never be added to `ManagementQueueRowDto` or any list/statistics DTO:
   * ratings on a list "invite comparison between children".
   *
   * ⛔ G-2 — nine pairs travel as nine pairs. No average, no headline band,
   * no Overall Grade is computed here or downstream.
   *
   * ⛔ Q-27 — this is a MANAGEMENT DTO. No parent-facing DTO gains a rating
   * field, in any vocabulary.
   */
  readonly ratings: readonly ReportRatingSnapshotDto[];
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

/**
 * ⛔ P1-5 — D-5's per-child clip metadata, and NOTHING ELSE.
 *
 * No storage path and no URL: the key is derived server-side and a URL is
 * minted only on demand (A-001 gates 6 and 7). No rating, no dimension, no
 * band — Q-27 governs this DTO, not merely the page drawn from it.
 */
export type ParentEvidenceClipDto = {
  readonly id: string;
  readonly mediaType: string;
  readonly byteSize: number;
};

export type CanonicalReportDto = {
  readonly panels: ReportPanelsDto;
  readonly submittedAt: string;
  readonly context: CanonicalReportContextDto | null;
  /**
   * ⚠️ GOVERNANCE-MANDATED ADDITION (P1-5, 2026-08-12). Empty until D-5's
   * clip exists for the linked child's SUBMITTED report. The frame draws
   * "Watch Together"; it was a REGISTERED OMISSION until D-5/C-1/A-002 ruled
   * it in, so its presence is a ruling, not drift.
   */
  readonly evidence: readonly ParentEvidenceClipDto[];
};

/**
 * ⛔ P1-5 — mint ONE short-TTL view URL for ONE clip (A-001 gate 6).
 *
 * ⚠️ ONE CALL = ONE `evidence.accessed` EVENT. It is deliberately NOT part of
 * `getCanonicalReport`: bundling it would record an access on every page view
 * and put a live URL in the document for visits nobody made. The only trace
 * that a URL to a child's video existed is this event, so it must correspond
 * to something a human actually asked for.
 *
 * ⛔ Returns a URL and nothing else — never a storage path (A-001 gate 7), and
 * never a download link (D-5).
 */
export type EvidenceViewUrlDto = {
  readonly url: string;
  readonly expiresInSeconds: number;
};

/**
 * ⛔ P1-2b — THE UPLOAD TICKET. An identity and a path, and NOT an
 * authorization.
 *
 * The server mints `evidenceId` and derives `objectPath` from it, so the
 * client chooses neither. ▶ **A forged ticket buys nothing**: the one
 * `storage.objects` INSERT policy re-derives trainer authority over the report
 * named in the FIRST PATH SEGMENT, live, on the actual INSERT (ADR-4).
 *
 * ⚠️ `chunkBytes` is not a tuning knob — Supabase's resumable endpoint
 * requires exactly 6 MiB parts for every chunk but the last.
 */
export type EvidenceUploadTicketDto = {
  readonly evidenceId: string;
  readonly reportId: string;
  readonly bucket: string;
  readonly objectPath: string;
  readonly maxBytes: number;
  readonly chunkBytes: number;
};

/**
 * ⛔ THE GOVERNED ACT IS THE ATTACH, NOT THE UPLOAD. Until this succeeds the
 * uploaded object is referenced by no row and reachable by no read path.
 *
 * ⚠️ `reason` discriminates ONLY after authorization has already succeeded —
 * every authorization failure collapses to `not_permitted` inside the RPC, so
 * a caller never learns whether a report exists or merely lies beyond them.
 */
export type EvidenceAttachSuccess = {
  readonly attached: boolean;
  readonly reason: string;
};

export type EvidenceUploadTicketInput = {
  readonly reportId: string;
  readonly mediaType: string;
  readonly byteSize: number;
};

export type EvidenceAttachInput = {
  readonly reportId: string;
  readonly evidenceId: string;
};

/** The trainer's own view of what is attached. Carries NO storage path. */
export type ReportEvidenceClipDto = {
  readonly id: string;
  readonly mediaType: string;
  readonly byteSize: number;
  readonly createdAt: string;
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

/**
 * Hero Phase 7 / F-S6-REVIEW-1. TWO FIELDS, deliberately: the note and the
 * report identity. No session id, no student id, no ratings, no lock version -
 * session, student and centre are DERIVED inside the governed RPC.
 */
export type SaveFollowUpNotesInput = {
  readonly reportId: string;
  readonly followUpNotes: string;
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
