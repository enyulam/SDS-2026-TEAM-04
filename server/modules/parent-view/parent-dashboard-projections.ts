import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { readRows, readRpcRows } from "@/server/platform/query-diagnostics";
import type { AppDatabase } from "@/server/db/app-database";

/**
 * `P2-22` — screen `30` Parent Dashboard.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⛔ `Q-27` IS A DATA BOUNDARY AND THIS FILE IS WHERE IT IS HELD
 * ═══════════════════════════════════════════════════════════════════════════
 * The reference frame draws a **"This Term's Skills"** card: nine B.E.S.T
 * dimensions, one rating bar each. Operator ruling **`Q-27`** rules the
 * **complete card absent** — title, all nine labels, all bars, all
 * rating-derived state, and **any equivalent replacement visualization**.
 *
 * ⚠️ **AND IT IS NOT A STYLING RULE.** *"The nine ratings must not reach a
 * Parent session at all — not through the Parent-facing DTO, projection, RPC
 * result, server action or client payload. Do not fetch them and hide them
 * with CSS."* ▶ So the exclusion lives **here**, in what this module reads,
 * and the DTO below carries no field a rating could occupy.
 *
 * ✅ **THE DATABASE REFUSES INDEPENDENTLY, AND THAT IS THE STRONGER LEG.**
 * Measured as the fixture parent: `observation_ratings` and
 * `report_version_ratings` both return **`permission denied for table`** —
 * a **GRANT-layer** refusal, not an RLS filter. A parent session cannot read a
 * rating even if this file asked for one.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⛔ ZERO NEW READS FOR FIVE OF THE SIX `Profile Details` ROWS — §12.10
 * ═══════════════════════════════════════════════════════════════════════════
 * Measured at HEAD as the fixture parent, **before** anything was written:
 *
 * | Frame row | Source | Reachable? |
 * |---|---|---|
 * | Date of birth | `students.date_of_birth` | ✅ 8 rows under RLS |
 * | Guardian | `students.guardian_name` | ✅ same row |
 * | Contact | `students.guardian_contact` | ✅ same row |
 * | Class | `class_grades.display_name` · `class_modules.title` | ✅ 3 / 3 |
 * | Enrolled | `enrolments.enrolled_at` | ✅ 8 rows |
 * | **Trainer** | `class_session_assignments` → `trainer_profiles` | ⛔ **0 / 0** |
 *
 * ▶ **One row of six needed anything.** `parent_get_child_trainer()` is that
 * one, and nothing else was widened to reach it.
 *
 * ⚠️ **THE THREE `C-14` COLUMNS ARE EMPTY ON EVERY FIXTURE ROW** — measured
 * `0/13` for `date_of_birth`, `guardian_name` and `guardian_contact`. They
 * were added at `P2-12`/`P2-14` for the management **create/update** paths, so
 * only a learner created since then carries them. ▶ That is a **FIXTURE**
 * fact, not a defect: the columns exist, the parent may read them, and the
 * screen **omits** each row that is `null` (hero `0B`) rather than inventing
 * one. The same shape as `P2-21`'s Lesson column.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⛔ WHAT THE FRAME DRAWS AND THIS MODULE REFUSES TO SOURCE
 * ═══════════════════════════════════════════════════════════════════════════
 * · **`Parent–Teacher Meeting`** in *Upcoming* — **`GC-13`'s family**: a second
 *   event entity beside the class session. *"Calendars are projections of
 *   class-session records; no duplicated event table"* (`A-016`). Upcoming is
 *   built from **real `class_sessions`** and carries nothing else.
 * · **`Grade 7 Speaking Assessment`** — `Grade 7` is a school-year label the
 *   model does not hold, and `A-016`/`A-054` fix Class Grade at
 *   `Beginner`/`Intermediate`/`Advanced`. The label rendered is
 *   `class_grades.display_name`.
 * · **`Junior`** — likewise not a ratified Class Grade. Not rendered.
 * · **A Trainer Assistant row** — the pack's **prose note** claims Profile
 *   Details shows *"assigned Trainer, Trainer Assistant (TA), and enrolment
 *   date"*. ⚠️ **The `.png` and the `.html` draw NO TA row** (measured:
 *   `Assist` ×0, `Trainer Assistant` ×0 in the `.html`). ▶ §7.4.1: a prose
 *   note is not evidence about what a frame draws. This is **agreement with
 *   the frame**, not a refusal of it — and it is recorded because a
 *   note-derived build would have added a field `A-014` prohibits.
 */

export interface ParentChildDto {
  readonly studentId: string;
  readonly studentName: string;
  /** `class_grades.display_name` · `class_modules.title`, never the frame's literal. */
  readonly classLabel: string | null;
  /**
   * ⚠️ EVERY ONE OF THESE IS `null` WHERE THE ROW DOES NOT CARRY IT, and
   * `null` means NOT RECORDED. The screen OMITS the row. Never a dash, never
   * "TBC", never a fabricated value.
   */
  readonly dateOfBirth: string | null;
  readonly guardianName: string | null;
  readonly guardianContact: string | null;
  readonly enrolledAt: string | null;
  readonly trainerDisplayName: string | null;
  /**
   * ⛔ SESSIONS ARE NESTED PER CHILD, NOT A FLAT LIST WITH A MODULE ID.
   *
   * ⚠️ The first draft of this module carried a flat `sessions` array plus a
   * `sessionsForChild(data, studentId)` helper that IGNORED its own
   * `studentId` and returned everything. ▶ **It would have shown one child's
   * timetable under another child's name** on a screen whose entire subject is
   * "which of my children am I looking at" — and the signature would have read
   * as though it filtered.
   *
   * Nesting makes the attribution structural: there is no array to hand the
   * wrong child, and the calendar and the "Upcoming for …" list are two views
   * of THIS one array, so a highlighted day cannot disagree with the list
   * beside it. It also keeps `class_module_id` out of the client payload.
   */
  readonly sessions: readonly ParentUpcomingSessionDto[];
}

/** One dated class session of the selected child's module. */
export interface ParentUpcomingSessionDto {
  readonly sessionId: string;
  readonly sessionDate: string;
  readonly lessonNumber: number | null;
  readonly lessonTitle: string | null;
}

export interface ParentDashboardDto {
  /**
   * ⛔ ONLY CHILDREN WITH A LIVE `parent_student_links` ROW. The selector is a
   * presentation control over rows RLS already resolved — never a picker over
   * the centre's students (`screen.md` §5, §14).
   */
  readonly children: readonly ParentChildDto[];
}

type StudentRow = {
  id: string;
  full_name: string;
  date_of_birth: string | null;
  guardian_name: string | null;
  guardian_contact: string | null;
};

type EnrolmentRow = {
  student_id: string;
  class_module_id: string;
  enrolled_at: string | null;
  is_active: boolean;
};

type ModuleRow = { id: string; title: string; class_grade_id: string };
type GradeRow = { id: string; display_name: string };
type SessionRow = {
  id: string;
  class_module_id: string;
  session_date: string;
  lesson_number: number | null;
  lesson_title: string | null;
};

export async function readParentDashboardCore(
  client: SupabaseClient<AppDatabase>,
): Promise<{ readonly ok: true; readonly data: ParentDashboardDto } | { readonly ok: false }> {
  /*
   * ⛔ `students` UNDER RLS IS THE LINKED SET. `students_select_parent` already
   * resolves `parent_student_links` in the database, so this is not a query
   * that "happens to" return the right children — it is the governed set, and
   * the screen never filters a wider one down (`ADR-4`).
   */
  const students = await readRows<StudentRow>("readParentDashboardCore:students", () =>
    client
      .from("students")
      .select("id, full_name, date_of_birth, guardian_name, guardian_contact")
      .eq("is_active", true),
  );
  if (!students.ok) return { ok: false };

  const enrolments = await readRows<EnrolmentRow>("readParentDashboardCore:enrolments", () =>
    client.from("enrolments").select("student_id, class_module_id, enrolled_at, is_active").eq("is_active", true),
  );
  if (!enrolments.ok) return { ok: false };

  const moduleIds = [...new Set(enrolments.rows.map((e) => e.class_module_id))];
  const modules = new Map<string, ModuleRow>();
  const grades = new Map<string, GradeRow>();
  const sessions: SessionRow[] = [];

  if (moduleIds.length > 0) {
    const moduleRows = await readRows<ModuleRow>("readParentDashboardCore:class_modules", () =>
      client.from("class_modules").select("id, title, class_grade_id").in("id", moduleIds),
    );
    if (!moduleRows.ok) return { ok: false };
    for (const m of moduleRows.rows) modules.set(m.id, m);

    const gradeIds = [...new Set(moduleRows.rows.map((m) => m.class_grade_id))];
    if (gradeIds.length > 0) {
      const gradeRows = await readRows<GradeRow>("readParentDashboardCore:class_grades", () =>
        client.from("class_grades").select("id, display_name").in("id", gradeIds),
      );
      if (!gradeRows.ok) return { ok: false };
      for (const g of gradeRows.rows) grades.set(g.id, g);
    }

    const sessionRows = await readRows<SessionRow>("readParentDashboardCore:class_sessions", () =>
      client
        .from("class_sessions")
        .select("id, class_module_id, session_date, lesson_number, lesson_title")
        .in("class_module_id", moduleIds),
    );
    if (!sessionRows.ok) return { ok: false };
    sessions.push(...sessionRows.rows);
  }

  const enrolmentOf = new Map<string, EnrolmentRow>();
  for (const e of enrolments.rows) if (!enrolmentOf.has(e.student_id)) enrolmentOf.set(e.student_id, e);

  const children: ParentChildDto[] = [];
  for (const s of [...students.rows].sort((a, b) => a.full_name.localeCompare(b.full_name))) {
    const enrolment = enrolmentOf.get(s.id) ?? null;
    const mod = enrolment === null ? null : (modules.get(enrolment.class_module_id) ?? null);
    const grade = mod === null ? null : (grades.get(mod.class_grade_id) ?? null);

    /*
     * ⚠️ ONE RPC CALL PER CHILD, AND THE ALTERNATIVE WAS WORSE. The governed
     * read is scoped to a single student because `app_parent_reaches_student`
     * takes one — a batch variant would have meant a SECOND function with a
     * second gate to keep in step, for a list whose measured size is 8.
     * ▶ A rejected call resolves to `null`, which renders as the row being
     * OMITTED — the same rendering as a genuinely unassigned session, and
     * correct here only because neither case is filled in (`Q-7`).
     */
    const trainer = await readRpcRows<{ trainer_display_name: string }>(
      "readParentDashboardCore:parent_get_child_trainer",
      () => client.rpc("parent_get_child_trainer", { p_student_id: s.id }),
    );

    children.push({
      studentId: s.id,
      studentName: s.full_name,
      classLabel: grade !== null && mod !== null ? `${grade.display_name} · ${mod.title}` : null,
      dateOfBirth: s.date_of_birth,
      guardianName: s.guardian_name,
      guardianContact: s.guardian_contact,
      enrolledAt: enrolment?.enrolled_at ?? null,
      trainerDisplayName: trainer.ok ? (trainer.rows[0]?.trainer_display_name ?? null) : null,
      sessions:
        enrolment === null
          ? []
          : sessions
              .filter((x) => x.class_module_id === enrolment.class_module_id)
              .sort((a, b) => (a.session_date < b.session_date ? -1 : a.session_date > b.session_date ? 1 : 0))
              .map((x) => ({
                sessionId: x.id,
                sessionDate: x.session_date,
                lessonNumber: x.lesson_number,
                lessonTitle: x.lesson_title,
              })),
    });
  }

  return { ok: true, data: { children } };
}
