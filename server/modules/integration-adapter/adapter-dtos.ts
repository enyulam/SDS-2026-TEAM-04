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

/**
 * P2-1 — screen `12` Management Classes.
 *
 * ⛔ IDENTITY, ENROLMENT AND STAFFING FACTS ONLY. There is no rating field, no
 * roll-up, no report status, no term and no lesson-progress field, and none
 * may be added: `C-9` confines `D-1` to report DETAIL surfaces, `G-2` excludes
 * a roll-up everywhere, `C-6`/`D-3` place terms at `P2-2`, and the frame's
 * `X / 12 Lessons done` is a `REGISTERED-OMISSION` awaiting data that does not
 * exist yet.
 *
 * ⛔ `trainerDisplayNames` is the DISTINCT SET of trainers assigned across the
 * module's sessions (`A-016` — assignment is authoritative at session level).
 * It is NOT the frame's `Asst.` slot, which is a TA field prohibited by
 * `A-014`/`G-7` and omitted permanently.
 */
export interface AdapterClassGradeOptionDto {
  readonly code: string;
  readonly displayName: string;
  readonly sortOrder: number;
}

export interface AdapterManagementClassSummaryDto {
  readonly classModuleId: string;
  readonly title: string;
  readonly classGradeCode: string;
  readonly classGradeLabel: string;
  readonly classGradeSortOrder: number;
  readonly activeStudentCount: number;
  readonly trainerDisplayNames: readonly string[];
}

export interface AdapterManagementClassListDto {
  readonly grades: readonly AdapterClassGradeOptionDto[];
  readonly classes: readonly AdapterManagementClassSummaryDto[];
}

/**
 * P2-5 — screen `25` Management Schedule.
 *
 * ⛔ NO SESSION-TYPE FIELD, AND THAT IS THE `Showcase` BAR MADE STRUCTURAL
 * (`GC-13`). ⛔ No assistant field either: `trainer_role` is typed
 * `centre_membership_role`, so an assistant is inexpressible in the database
 * before it is prohibited by `A-014`/`G-7`.
 */
export interface AdapterScheduleSessionSummaryDto {
  readonly classSessionId: string;
  readonly classModuleId: string;
  readonly sessionDate: string;
  readonly startTime: string | null;
  readonly endTime: string | null;
  readonly room: string | null;
  readonly moduleTitle: string;
  readonly classGradeLabel: string | null;
  readonly trainerDisplayNames: readonly string[];
}

export interface AdapterManagementScheduleDto {
  readonly sessions: readonly AdapterScheduleSessionSummaryDto[];
  readonly monthsWithSessions: readonly string[];
}

/**
 * `P2-6` — screen `14` Management Lesson Plan Management.
 *
 * ⛔ NOTHING HERE IS AN ASSESSMENT FACT, AND THERE IS NO FIELD ONE COULD
 * ARRIVE IN: no rating, roll-up, observation, attendance value, trainer note,
 * checklist value, content hash or report status (`C-9`, `G-2`).
 *
 * ⛔ NO `keyFocus`. RAISED BY THIS PHASE AND DECLINED BY THE OPERATOR — the
 * frame draws the chips, `D-4` names no author for them, and there is no
 * `class_sessions.key_focus` to read. `D-4`'s mention is not licence.
 *
 * ⛔ NO `description` and NO `programme` (`C-14`, `A-016`, `A-022`) — the
 * frame's "6-week persuasive speaking unit" has no column behind it.
 */
/**
 * `P2-7` — screen `11` Management Dashboard KPI tiles.
 *
 * ⛔ FOUR INTEGERS AND NOTHING ELSE. No rating, roll-up, panel field, trainer
 * note, checklist value or content hash — and no field one could arrive in.
 *
 * ⛔ `submittedReports`, NOT `approved`. `A-036` makes `approved`
 * transient-in-transaction, so the frame's `Approved` tile counts a status
 * that never commits and would read zero forever. Operator ruling.
 */
export interface AdapterDashboardSummaryDto {
  /** ⛔ `Ruling A` — ENROLLED (active), never centre-resident. A withdrawn learner does not count. */
  readonly totalStudents: number;
  readonly pendingApproval: number;
  readonly submittedReports: number;
}

/**
 * `P2-8` — screen `17` Management Students.
 *
 * ⛔ NO RATING FIELD AND NO STUDENT CODE. The frame draws both; `C-9`/`G-2`
 * prohibit the first and `public.students` has no column for the second. The
 * allow-list mapper below is what keeps either from arriving by default if a
 * column is ever added.
 */
export interface AdapterManagementStudentRowDto {
  readonly studentId: string;
  readonly fullName: string;
  readonly classes: readonly string[];
  readonly guardianName: string | null;
}

/**
 * `P2-10` — screen `23` Management Trainers.
 *
 * ✅ THE EMAIL IS PRESENT BY OPERATOR RULING, 2026-08-15. `P2-10` shipped it
 * REFUSED while the question was open — the pack bars *"authentication
 * details"* and an email is the Auth login identifier. ▶ The Operator permitted
 * it for THIS audience: *"An identifier a manager already typed is not a
 * disclosure to that manager."* ⛔ **MANAGEMENT ONLY. It generalises to no
 * other role and to no other person's email.**
 *
 * ⛔ NO `On leave`. The status union is the ratified enum minus `pending`.
 */
export interface AdapterManagementTrainerRowDto {
  readonly membershipId: string;
  readonly fullName: string;
  readonly email: string | null;
  readonly status: "active" | "deactivated";
  readonly classCount: number;
  readonly studentCount: number;
}

/**
 * `P2-9` — screen `18`. ⛔ The allow-list stops at these fields. A rating
 * column added to any underlying relation later cannot reach the client until
 * someone writes its name here, which is a visible act in a diff.
 */
export interface AdapterStudentTrendPointDto {
  readonly classSessionId: string;
  readonly sessionDate: string;
  readonly lessonTitle: string | null;
  readonly sessionScore: number;
}

export interface AdapterStudentReportRowDto {
  readonly reportId: string;
  readonly classSessionId: string;
  readonly sessionDate: string;
  readonly classLabel: string;
  readonly lessonTitle: string | null;
  readonly termLabel: string | null;
  readonly reportState: string;
  readonly submittedAt: string | null;
}

export interface AdapterStudentClassRowDto {
  readonly classModuleId: string;
  readonly title: string;
  readonly gradeLabel: string;
  readonly schedule: string | null;
  readonly trainerName: string | null;
}

export interface AdapterManagementStudentProfileDto {
  readonly studentId: string;
  readonly fullName: string;
  readonly isActive: boolean;
  readonly guardianName: string | null;
  readonly enrolledOn: string | null;
  readonly attendancePresent: number;
  readonly attendanceTotal: number;
  readonly classes: readonly AdapterStudentClassRowDto[];
  readonly trend: readonly AdapterStudentTrendPointDto[];
  readonly reports: readonly AdapterStudentReportRowDto[];
}

export interface AdapterLessonStatisticsDto {
  readonly classSessionId: string;
  readonly classModuleId: string;
  readonly classLabel: string;
  readonly sessionDate: string;
  readonly lessonNumber: number | null;
  readonly lessonTitle: string | null;
  readonly startsAt: string | null;
  readonly endsAt: string | null;
  readonly room: string | null;
  readonly trainerName: string | null;
  readonly enrolledCount: number;
  readonly presentCount: number;
  readonly attendanceRecorded: number;
  readonly assessedCount: number;
  readonly submittedCount: number;
  readonly awaitingCount: number;
}

export interface AdapterClassStatisticsDto {
  readonly classModuleId: string;
  readonly classLabel: string;
  readonly enrolledCount: number;
  readonly assessedCount: number;
  readonly submittedCount: number;
  readonly mainFollowUpDimension: string | null;
  readonly recommendedAction: string | null;
  readonly improvedDimension: string | null;
  readonly trendSessionsConsidered: number | null;
  readonly followUpRows: readonly AdapterClassOverviewRowDto[];
}

export interface AdapterTrainerTermDto {
  readonly termId: string;
  readonly label: string;
  readonly startsOn: string;
  readonly endsOn: string;
}

export interface AdapterTrainerClassCardDto {
  readonly classModuleId: string;
  readonly title: string;
  readonly gradeLabel: string;
  readonly displayLabel: string;
  readonly initials: string;
  readonly studentCount: number;
  readonly scheduleSummary: string | null;
  readonly nextSessionDate: string | null;
}

export interface AdapterTrainerMyClassesDto {
  readonly terms: readonly AdapterTrainerTermDto[];
  readonly selectedTermId: string | null;
  readonly cards: readonly AdapterTrainerClassCardDto[];
}

export interface AdapterTrainerRecentReportDto {
  readonly reportId: string;
  readonly classSessionId: string;
  readonly studentId: string;
  readonly studentName: string;
  readonly classLabel: string;
  readonly sessionDate: string;
  readonly reportState: string;
  readonly updatedAt: string;
}

export interface AdapterTrainerTodaySessionDto {
  readonly classSessionId: string;
  readonly classLabel: string;
  readonly startsAt: string | null;
  readonly room: string | null;
  readonly isNow: boolean;
}

export interface AdapterTrainerDashboardDto {
  readonly displayName: string | null;
  readonly classCount: number;
  readonly studentCount: number;
  readonly pendingReviews: number;
  readonly classes: readonly AdapterTrainerClassCardDto[];
  readonly recent: readonly AdapterTrainerRecentReportDto[];
  readonly today: readonly AdapterTrainerTodaySessionDto[];
  readonly monthSessionDates: readonly string[];
  readonly monthLabel: string;
}

export interface AdapterTrainerStudentRowDto {
  readonly studentId: string;
  readonly studentName: string;
  readonly initials: string;
  readonly classModuleId: string;
  readonly classLabel: string;
  readonly lastAssessed: string | null;
}

export interface AdapterTrainerStudentsDto {
  readonly studentCount: number;
  readonly rows: readonly AdapterTrainerStudentRowDto[];
  readonly classes: readonly { readonly classModuleId: string; readonly classLabel: string }[];
}

export interface AdapterRegisterStudentInput {
  readonly firstName: string;
  readonly lastName: string;
  readonly classModuleIds: readonly string[];
}

export interface AdapterRegisterStudentOutcomeDto {
  readonly studentId: string;
  readonly enrolments: number;
  readonly reason: string;
}

export interface AdapterCreateParentInput {
  readonly fullName: string;
  readonly email: string;
  readonly studentIds: readonly string[];
}

export interface AdapterCreateParentOutcomeDto {
  readonly membershipId: string;
  readonly invitationId: string;
  readonly links: number;
  readonly reason: string;
}

export interface AdapterCreateTrainerInput {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
}

/**
 * ⛔ IDS AND A REASON, AND NOTHING ELSE. No email, no display name, no
 * invitation token — the last of which cannot exist, because `A-027` gives the
 * table no column able to hold one. ▶ The client learns THAT an invitation was
 * created, never anything that would let it impersonate one.
 */
export interface AdapterTrainerInvitationOutcomeDto {
  readonly membershipId: string;
  readonly invitationId: string;
  readonly reason: string;
}

export interface AdapterManagementTrainerListDto {
  readonly trainers: readonly AdapterManagementTrainerRowDto[];
  readonly staffCount: number;
}

export interface AdapterManagementStudentListDto {
  readonly students: readonly AdapterManagementStudentRowDto[];
  readonly enrolledCount: number;
  readonly grades: readonly { readonly id: string; readonly label: string }[];
}

export interface AdapterLessonMaterialDto {
  readonly materialId: string;
  readonly displayName: string;
  readonly mediaType: string;
  readonly byteSize: number;
  readonly createdAt: string;
}

export interface AdapterLessonPlanSessionDto {
  readonly classSessionId: string;
  readonly sessionDate: string;
  readonly startsAt: string | null;
  readonly endsAt: string | null;
  /** `null` where NOT RECORDED — the card falls back to its date (hero `0B`). */
  readonly lessonNumber: number | null;
  readonly lessonTitle: string | null;
  readonly room: string | null;
  readonly termLabel: string | null;
  readonly materials: readonly AdapterLessonMaterialDto[];
}

export interface AdapterLessonPlanDto {
  readonly classModuleId: string;
  readonly moduleTitle: string;
  readonly classGradeName: string;
  readonly learnerCount: number;
  readonly termLabel: string | null;
  readonly sessions: readonly AdapterLessonPlanSessionDto[];
}

/**
 * P2-2 — screen `26` Add Class.
 *
 * ⛔ NOTHING HERE IS AN ASSESSMENT FACT, AND THERE IS NO FIELD ONE COULD
 * ARRIVE IN: no rating, roll-up, observation, attendance value, evidence
 * reference, trainer note, checklist value, content hash or report status.
 *
 * ✅ TRAINER ASSIGNMENT IS BUILT (`P2-2b`, Operator 2026-08-13). ~~The frame's
 * `Assigned Trainer` section is STOPPED at this phase — it emits
 * `admin.trainer_assigned`, a third audit string the Operator did not name.~~
 * ⚠️ **STRUCK: the string was ALREADY in the registry**, measured at 19, and
 * the phase was stopped on a misread scope rather than a missing string.
 * ⛔ **UNASSIGNMENT is still not built** — a different action, no ratified
 * string, and `26` needs none.
 *
 * ⛔ NO `classCode`, NO `capacity`, NO `programme` (`C-14`; `A-016`), and NO
 * TA field (`A-014`, `G-7`).
 */
export interface AdapterClassGradeChoiceDto {
  readonly classGradeId: string;
  readonly code: string;
  readonly displayName: string;
  readonly sortOrder: number;
}

export interface AdapterTermOptionDto {
  readonly termId: string;
  readonly label: string;
  readonly startsOn: string;
  readonly endsOn: string;
}

/** ⛔ A MEMBERSHIP id, never an account id — assignment is a membership fact. */
export interface AdapterTrainerChoiceDto {
  readonly trainerMembershipId: string;
  readonly displayName: string;
}

export interface AdapterAddClassOptionsDto {
  readonly grades: readonly AdapterClassGradeChoiceDto[];
  readonly terms: readonly AdapterTermOptionDto[];
  readonly trainers: readonly AdapterTrainerChoiceDto[];
}

export interface AdapterCreateClassInput {
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
}

/**
 * ⚠️ THREE COUNTS, REPORTED RATHER THAN COLLAPSED. One call creates one dated
 * session and one further call assigns it, so a partial result is real
 * governed state: a session that exists with no trainer is usable, and the
 * surface must be able to say exactly that.
 */
/**
 * P2-4 — screen `13` Class Overview.
 *
 * ⛔ THERE IS NO FIELD HERE THAT COULD CARRY AN ASSESSMENT FACT. No rating,
 * no roll-up, no panel text, no trainer note, no checklist or approval
 * internal, no content hash — the type holds the bar, and the database holds
 * it again (`V-4`).
 */
export interface AdapterClassOverviewRowDto {
  readonly classSessionId: string;
  readonly sessionDate: string;
  readonly lessonNumber: number | null;
  readonly lessonTitle: string | null;
  readonly studentId: string;
  readonly studentDisplayName: string;
  readonly reportId: string | null;
  readonly reportState: string | null;
  readonly evidenceCount: number;
}

export interface AdapterClassOverviewSessionDto {
  readonly classSessionId: string;
  readonly sessionDate: string;
  readonly lessonNumber: number | null;
  readonly lessonTitle: string | null;
  readonly reportedCount: number;
  readonly submittedCount: number;
  readonly learnerCount: number;
}

export interface AdapterClassHealthDto {
  readonly status: string;
  readonly action: string;
  readonly pendingReports: number;
  readonly evidenceMissing: number;
  readonly submittedReports: number;
  readonly totalReports: number;
  /** ⛔ ONE STRING, by Operator ruling. Never the underlying tags. */
  readonly mainFollowUpArea: string | null;
}

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
export interface AdapterClassHeaderDto {
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
}

export interface AdapterClassOverviewDto {
  readonly header: AdapterClassHeaderDto | null;
  readonly rows: readonly AdapterClassOverviewRowDto[];
  readonly sessions: readonly AdapterClassOverviewSessionDto[];
  readonly health: AdapterClassHealthDto | null;
}

/**
 * P2-3 — screen `27` Edit Class.
 *
 * ⛔ NO `dayOfWeek`, NO `sessionIds` TO REMOVE, AND NO UNASSIGN FLAG. `27`
 * can CHANGE a class; it cannot DESTROY one. Removing a session needs a
 * cancel/delete audit string that does not exist, and a session may already
 * carry attendance, an observation or a submitted report.
 *
 * ⛔ NO `classCode`, `capacity` or `programme` (`C-14`, `A-016`), and no TA
 * slot (`A-014`, `G-7`).
 */
export interface AdapterEditableSessionDto {
  readonly classSessionId: string;
  readonly sessionDate: string;
  readonly startTime: string | null;
  readonly endTime: string | null;
  readonly room: string | null;
  readonly termId: string | null;
  readonly trainerDisplayName: string | null;
}

export interface AdapterClassEditDto {
  readonly classModuleId: string;
  readonly title: string;
  readonly classGradeId: string;
  readonly sessions: readonly AdapterEditableSessionDto[];
  readonly trainerMembershipId: string | null;
}

export interface AdapterUpdateClassInput {
  readonly classModuleId: string;
  readonly classGradeId: string;
  readonly title: string;
  readonly termId: string | null;
  readonly room: string | null;
  readonly startTime: string | null;
  readonly endTime: string | null;
  readonly trainerMembershipId: string | null;
}

/** ⚠️ `unchanged` is a REAL outcome and reaches the surface as one. */
export interface AdapterClassUpdateOutcomeDto {
  readonly moduleChanged: boolean;
  readonly sessionsChanged: number;
  readonly sessionsTotal: number;
  readonly trainerChanged: boolean;
  readonly reason: string;
}

export interface AdapterClassCreationOutcomeDto {
  readonly classModuleId: string;
  readonly sessionsRequested: number;
  readonly sessionsCreated: number;
  readonly sessionsAssigned: number;
  readonly reason: string;
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

/**
 * ⛔ P1-2b — the upload ticket. An identity and a path, NOT an authorization:
 * the `storage.objects` INSERT policy re-derives trainer authority over the
 * report named in the first path segment, live, on the actual INSERT.
 */
/**
 * `P2-6R` — the lesson-material transport DTOs.
 *
 * ⛔ NO CHILD DATUM ANYWHERE, and that is structural rather than filtered: a
 * material is keyed to a SESSION, so there is no learner field to omit. ⚠️ The
 * shape is deliberately the same as evidence's above — different owner, same
 * ticket-then-attach discipline — so a reader comparing the two sees one
 * pattern, not two conventions.
 */
export interface AdapterMaterialUploadTicketDto {
  readonly materialId: string;
  readonly classSessionId: string;
  readonly bucket: string;
  readonly objectPath: string;
  readonly maxBytes: number;
  readonly chunkBytes: number;
}

export interface AdapterMaterialViewUrlDto {
  readonly url: string;
  readonly mediaType: string;
  readonly expiresInSeconds: number;
}

export interface AdapterEvidenceUploadTicketDto {
  readonly evidenceId: string;
  readonly reportId: string;
  readonly bucket: string;
  readonly objectPath: string;
  readonly maxBytes: number;
  readonly chunkBytes: number;
}

export interface AdapterEvidenceAttachSuccess {
  readonly attached: boolean;
  /** Discriminates ONLY after authorization succeeds; otherwise `not_permitted`. */
  readonly reason: string;
}

export interface AdapterReportEvidenceClipDto {
  readonly id: string;
  readonly mediaType: string;
  readonly byteSize: number;
  readonly createdAt: string;
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
