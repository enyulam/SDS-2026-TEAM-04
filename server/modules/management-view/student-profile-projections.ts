import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppDatabase } from "@/server/db/app-database";

/**
 * `P2-9` — screen `18` Management Student Profile.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⛔ TWO RPCs AND FIVE RLS-SCOPED READS, AND THE SPLIT IS THE GOVERNANCE
 * ═══════════════════════════════════════════════════════════════════════════
 * Measured at HEAD before a line was written: `students`, `enrolments`,
 * `attendance`, `terms`, `parent_student_links`, `parent_profiles`,
 * `centre_memberships`, `accounts`, `class_modules`, `class_grades`,
 * `class_sessions` and `class_session_assignments` **all carry a management
 * SELECT grant AND a permissive policy**, so the header, the attendance tile,
 * Profile Details and Classes Enrolled are ordinary RLS-scoped reads.
 *
 * ⛔ `observations`, `observation_ratings`, `reports` and `report_versions`
 * carry **`grant=0, policies=0`**. They are reachable only through the two
 * `SECURITY DEFINER` reads `P2-9` added, and the migration asserts (`VP-10`,
 * `VQ-5`) that **no client table grant was created for any of them**.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⛔ THE AGGREGATION HAPPENS INSIDE THE DATABASE. THAT IS THE RULING.
 * ═══════════════════════════════════════════════════════════════════════════
 * > *"reusing `report_get_management_ratings` per session would ship the nine
 * > per-dimension ratings into a profile-surface payload, which is `C-9` and
 * > the `Q-27` error exactly."*
 *
 * ▶ `report_get_management_ratings` **is** granted to `authenticated` and would
 * have worked. **Using it would have been the defect**: nine rating values per
 * session, arriving in a profile-surface payload, hidden by a component that
 * chose not to render them — which is the shape `Q-27` names by hand (*"do not
 * fetch them into the Parent client and hide them with CSS"*), one role over.
 *
 * ⛔ **THIS FILE NEVER SEES A RATING.** `report_management_student_trend`
 * returns `session_score` only, and the migration pins both result types string
 * for string so a rating column cannot be added without deleting an assertion.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⚠️ `D-2`'s CONSTRAINT IS A RENDERING CONSTRAINT, AND IT IS ENFORCED ABOVE
 * ═══════════════════════════════════════════════════════════════════════════
 * *"The trend is a line with no number, band or grade rendered anywhere, to any
 * role."* The score is carried because a line needs coordinates; the screen is
 * where that must be proven, and the suite asserts it there.
 *
 * ⚠️ `assessmentCount` IS `trend.length`, BY §12.10. `A-017` makes all nine
 * dimensions mandatory, and the RPC drops any session without exactly nine, so
 * a session is either assessed or absent. **A third RPC for the count would
 * have re-derived a number the rows already carry.**
 */

export interface StudentTrendPointDto {
  readonly classSessionId: string;
  readonly sessionDate: string;
  readonly lessonTitle: string | null;
  /**
   * ⛔ `D-2`. A COORDINATE, NEVER A LABEL. It exists so a line can be drawn and
   * must not be rendered as a number, a band or a grade on any surface, to any
   * role. `G-2` is what that protects.
   */
  readonly sessionScore: number;
}

export interface StudentReportRowDto {
  readonly reportId: string;
  readonly classSessionId: string;
  readonly sessionDate: string;
  readonly classLabel: string;
  readonly lessonTitle: string | null;
  readonly termLabel: string | null;
  /**
   * ⚠️ CARRIED BECAUSE `A-038` REQUIRES THE ROW TO GATE ON IT — `submitted`
   * links to the canonical report, `trainer_approved` to the management
   * final-review surface, and every earlier status exposes no report content.
   * ⛔ It is a LIFECYCLE state, never a grade.
   */
  readonly reportState: string;
  readonly submittedAt: string | null;
}

export interface StudentClassRowDto {
  readonly classModuleId: string;
  readonly title: string;
  readonly gradeLabel: string;
  /** `Tue & Thu · 3–4 PM`, or `null` where no session carries a time. */
  readonly schedule: string | null;
  /** ⛔ ONE trainer. `A-014`/`G-7`: no TA line, ever. */
  readonly trainerName: string | null;
}

export interface StudentProfileDto {
  readonly studentId: string;
  readonly fullName: string;
  readonly isActive: boolean;
  /**
   * ⛔ THE LINKED ACCOUNT'S NAME WHERE ONE EXISTS, otherwise the pre-link text
   * captured at registration. `null` where neither — the line is OMITTED
   * (hero `0B`), never rendered as `Unknown` or `—`.
   */
  readonly guardianName: string | null;
  /**
   * ⛔ PRE-LINK ONLY, AND `null` THE MOMENT A PARENT IS LINKED. The linked
   * account is the living record; `accounts.phone` is where a linked
   * guardian's contact lives, and showing a stale registration string beside a
   * live account would be the two-sources defect wearing a different label.
   */
  readonly guardianContact: string | null;
  /** ⛔ `null` where not captured — omitted, never a placeholder date. */
  readonly dateOfBirth: string | null;
  /** The earliest active enrolment, or `null`. */
  readonly enrolledOn: string | null;
  readonly attendancePresent: number;
  readonly attendanceTotal: number;
  readonly classes: readonly StudentClassRowDto[];
  readonly trend: readonly StudentTrendPointDto[];
  readonly reports: readonly StudentReportRowDto[];
}

interface TrendRow {
  readonly class_session_id: string;
  readonly session_date: string;
  readonly lesson_title: string | null;
  readonly session_score: number | string;
}

interface ReportRow {
  readonly report_id: string;
  readonly class_session_id: string;
  readonly session_date: string;
  readonly class_label: string;
  readonly lesson_title: string | null;
  readonly term_label: string | null;
  readonly report_state: string;
  readonly submitted_at: string | null;
}

export async function readStudentProfileCore(
  client: SupabaseClient<AppDatabase>,
  studentId: string,
): Promise<{ readonly ok: true; readonly data: StudentProfileDto } | { readonly ok: false }> {
  const student = await client
    .from("students")
    .select("id, full_name, is_active, date_of_birth, guardian_name, guardian_contact")
    .eq("id", studentId)
    .maybeSingle();
  if (student.error || student.data === null) return { ok: false };
  const row = student.data as {
    id: string;
    full_name: string;
    is_active: boolean;
    date_of_birth: string | null;
    guardian_name: string | null;
    guardian_contact: string | null;
  };

  /*
   * ⚠️ SEVEN SMALL READS, NOT ONE JOIN — the `P2-10` shape, for the same reason:
   * every hop is RLS-scoped independently, so a policy that stops admitting a
   * row produces a MISSING FIELD rather than a silently truncated join.
   */
  const [enrolments, attendance, links, trendCall, reportCall] = await Promise.all([
    client
      .from("enrolments")
      .select("class_module_id, enrolled_at, is_active")
      .eq("student_id", studentId)
      .eq("is_active", true),
    client.from("attendance").select("status").eq("student_id", studentId),
    client
      .from("parent_student_links")
      .select("parent_membership_id")
      .eq("student_id", studentId)
      .eq("is_active", true),
    client.rpc("report_management_student_trend", { p_student_id: studentId }),
    client.rpc("report_management_student_reports", { p_student_id: studentId }),
  ]);

  const moduleIds = [
    ...new Set(((enrolments.data ?? []) as { class_module_id: string }[]).map((e) => e.class_module_id)),
  ];

  const [modules, sessions] = await Promise.all([
    moduleIds.length === 0
      ? Promise.resolve({ data: [] })
      : client.from("class_modules").select("id, title, class_grade_id").in("id", moduleIds),
    moduleIds.length === 0
      ? Promise.resolve({ data: [] })
      : client
          .from("class_sessions")
          .select("id, class_module_id, session_date, starts_at, ends_at")
          .in("class_module_id", moduleIds),
  ]);

  const moduleRows = (modules.data ?? []) as { id: string; title: string; class_grade_id: string }[];
  const gradeIds = [...new Set(moduleRows.map((m) => m.class_grade_id))];
  const sessionRows = (sessions.data ?? []) as {
    id: string;
    class_module_id: string;
    session_date: string;
    starts_at: string | null;
    ends_at: string | null;
  }[];

  const [grades, assignments, guardians] = await Promise.all([
    gradeIds.length === 0
      ? Promise.resolve({ data: [] })
      : client.from("class_grades").select("id, display_name").in("id", gradeIds),
    sessionRows.length === 0
      ? Promise.resolve({ data: [] })
      : client
          .from("class_session_assignments")
          .select("class_session_id, trainer_membership_id, is_active")
          .in("class_session_id", sessionRows.map((s) => s.id))
          .eq("is_active", true),
    resolveGuardian(client, ((links.data ?? []) as { parent_membership_id: string }[])),
  ]);

  const gradeById = new Map(
    ((grades.data ?? []) as { id: string; display_name: string }[]).map((g) => [g.id, g.display_name]),
  );

  const trainerByMembership = await resolveTrainerNames(
    client,
    ((assignments.data ?? []) as { trainer_membership_id: string }[]).map((a) => a.trainer_membership_id),
  );
  const trainerBySession = new Map(
    ((assignments.data ?? []) as { class_session_id: string; trainer_membership_id: string }[]).map((a) => [
      a.class_session_id,
      trainerByMembership.get(a.trainer_membership_id) ?? null,
    ]),
  );

  const classes: StudentClassRowDto[] = moduleRows
    .map((m) => {
      const own = sessionRows.filter((s) => s.class_module_id === m.id);
      const trainer = own.map((s) => trainerBySession.get(s.id) ?? null).find((n) => n !== null) ?? null;
      return {
        classModuleId: m.id,
        title: m.title,
        gradeLabel: gradeById.get(m.class_grade_id) ?? "",
        schedule: summariseSchedule(own),
        trainerName: trainer,
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));

  const attendanceRows = (attendance.data ?? []) as { status: string }[];

  /*
   * ⛔ `RETURNS TABLE` RESOLVES TO AN ARRAY, unlike the `OUT`-parameter RPCs
   * elsewhere in this codebase — `proretset` is TRUE for both of these, which
   * is why they are read as rows rather than through `firstRpcRow`.
   */
  const trend: StudentTrendPointDto[] = (
    (trendCall.error ? [] : ((trendCall.data ?? []) as TrendRow[]))
  ).map((t) => ({
    classSessionId: t.class_session_id,
    sessionDate: t.session_date,
    lessonTitle: t.lesson_title,
    sessionScore: Number(t.session_score),
  }));

  const reports: StudentReportRowDto[] = (
    (reportCall.error ? [] : ((reportCall.data ?? []) as ReportRow[]))
  ).map((r) => ({
    reportId: r.report_id,
    classSessionId: r.class_session_id,
    sessionDate: r.session_date,
    classLabel: r.class_label,
    lessonTitle: r.lesson_title,
    termLabel: r.term_label,
    reportState: r.report_state,
    submittedAt: r.submitted_at,
  }));

  const enrolledOn =
    ((enrolments.data ?? []) as { enrolled_at: string }[])
      .map((e) => e.enrolled_at)
      .sort()
      .at(0) ?? null;

  return {
    ok: true,
    data: {
      studentId: row.id,
      fullName: row.full_name,
      isActive: row.is_active,
      /*
       * ═══════════════════════════════════════════════════════════════════
       * ⛔ THE PRECEDENCE RULE — A LINKED ACCOUNT ALWAYS WINS
       * ═══════════════════════════════════════════════════════════════════
       * Operator ruling, 2026-08-16, verbatim: *"a linked account always wins;
       * the free-text fields are what registration captured before a link
       * existed."*
       *
       * ⚠️ IT EXISTS BECAUSE ONE DISPLAYED FACT NOW HAS TWO POSSIBLE SOURCES,
       * and `C-14` warned about exactly this shape for email. Screen `20`
       * captures a guardian name BEFORE any parent account exists, so the
       * column is real and necessary; the moment a `parent_student_links` row
       * exists, the ACCOUNT is the living record and the captured text is a
       * historical artefact of registration.
       *
       * ▶ WITHOUT THIS ORDERING both would claim to be current, and they would
       * disagree the first time a parent corrects their own name.
       *
       * ⛔ Asserted with a DIVERGENT case (`prove:portal-c14`): a learner where
       * both exist and differ must show the ACCOUNT value. A test where they
       * agree would pass under either ordering and prove nothing (§12.15).
       */
      guardianName: guardians ?? row.guardian_name,
      guardianContact: guardians !== null ? null : row.guardian_contact,
      dateOfBirth: row.date_of_birth,
      enrolledOn,
      attendancePresent: attendanceRows.filter((a) => a.status === "present").length,
      attendanceTotal: attendanceRows.length,
      classes,
      trend,
      reports,
    },
  };
}

/**
 * ⚠️ ONE GUARDIAN NAME, OR `null`. The frame draws a single `Guardian` line.
 * Where several parents are linked the FIRST by name is shown — deterministic
 * rather than arbitrary, and stated because the frame cannot express the case.
 */
async function resolveGuardian(
  client: SupabaseClient<AppDatabase>,
  links: readonly { parent_membership_id: string }[],
): Promise<string | null> {
  if (links.length === 0) return null;
  const memberships = await client
    .from("centre_memberships")
    .select("id, account_id")
    .in("id", links.map((l) => l.parent_membership_id));
  const accountIds = ((memberships.data ?? []) as { account_id: string }[]).map((m) => m.account_id);
  if (accountIds.length === 0) return null;
  const accounts = await client.from("accounts").select("display_name").in("id", accountIds);
  const names = ((accounts.data ?? []) as { display_name: string | null }[])
    .map((a) => (a.display_name ?? "").trim())
    .filter((n) => n.length > 0)
    .sort();
  return names.at(0) ?? null;
}

async function resolveTrainerNames(
  client: SupabaseClient<AppDatabase>,
  membershipIds: readonly string[],
): Promise<Map<string, string | null>> {
  const unique = [...new Set(membershipIds)];
  if (unique.length === 0) return new Map();
  const memberships = await client.from("centre_memberships").select("id, account_id").in("id", unique);
  const rows = (memberships.data ?? []) as { id: string; account_id: string }[];
  if (rows.length === 0) return new Map();
  const accounts = await client
    .from("accounts")
    .select("id, display_name")
    .in("id", rows.map((m) => m.account_id));
  const nameByAccount = new Map(
    ((accounts.data ?? []) as { id: string; display_name: string | null }[]).map((a) => [a.id, a.display_name]),
  );
  return new Map(rows.map((m) => [m.id, nameByAccount.get(m.account_id) ?? null]));
}

/**
 * `Tue & Thu · 3–4 PM`, built from the sessions themselves.
 *
 * ⛔ NO RECURRENCE RULE IS STORED ANYWHERE (`A-016`, `C-14`) — calendars and
 * schedules are PROJECTIONS of session rows. This summarises what the rows
 * actually say and invents no pattern.
 *
 * ⚠️ `null` where no session carries a time, and the line is then OMITTED
 * rather than shown empty (hero `0B`).
 */
function summariseSchedule(
  sessions: readonly { session_date: string; starts_at: string | null; ends_at: string | null }[],
): string | null {
  if (sessions.length === 0) return null;
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const days = [
    ...new Set(sessions.map((s) => new Date(`${s.session_date}T00:00:00Z`).getUTCDay())),
  ].sort((a, b) => a - b);
  const timed = sessions.find((s) => s.starts_at !== null && s.ends_at !== null);
  const dayPart = days.map((d) => DAYS[d]).join(" & ");
  if (timed === undefined) return dayPart.length > 0 ? dayPart : null;
  return `${dayPart} · ${shortTime(timed.starts_at as string)}–${shortTime(timed.ends_at as string)}`;
}

function shortTime(value: string): string {
  const [h, m] = value.split(":");
  const hour = Number(h);
  const suffix = hour >= 12 ? "PM" : "AM";
  const twelve = hour % 12 === 0 ? 12 : hour % 12;
  return m === "00" ? `${twelve} ${suffix}` : `${twelve}:${m} ${suffix}`;
}
