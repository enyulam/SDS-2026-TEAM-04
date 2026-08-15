import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { readClassStatusRowsCore } from "@/server/modules/class-session/class-overview";

/**
 * `P2-15` — screen `15` Management Lesson Statistics.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ✅ NO NEW FUNCTION, NO NEW GRANT — §12.10 FOR THE FIFTH PHASE RUNNING
 * ═══════════════════════════════════════════════════════════════════════════
 * The batch authorization pre-approves read-side `SECURITY DEFINER` functions
 * and their minimum matching grants. ▶ **This phase adds NONE**, and that is
 * the check earning its keep rather than a corner cut:
 * `report_list_management_class_status(p_class_module_id)` already returns
 * per-session, per-learner rows carrying `class_session_id`, `session_date`,
 * `lesson_number`, `lesson_title`, `student_id`, `report_id`, `report_state`
 * and `evidence_count`. **Filtered to one session, it answers every count this
 * screen is permitted to show.**
 *
 * ⚠️ **§12.10: check whether the row you already have answers the question
 * before adding a read for it.** A `report_lesson_statistics(uuid)` would have
 * been trivially authorizable under the batch and would have duplicated a
 * governed read — a second definition of "assessed" that could drift from the
 * first.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⛔ FIVE OF THIS FRAME'S SIX CARDS ARE PROHIBITED. THE SCREEN IS MOSTLY GONE.
 * ═══════════════════════════════════════════════════════════════════════════
 * `GC-6` is recorded on this pack in full and ends: *"do not add a rating
 * badge, bar, column, tile or chip, and do not read `D-1` as permitting one
 * here."* Two independent grounds carry it, either sufficient — **`C-9`** (`D-1`
 * reaches report DETAIL surfaces only; a statistics surface *"invites
 * comparison between children"*) and **`G-2`** (roll-ups are permanently
 * excluded on every surface).
 *
 * 1. ⛔ **Skill Averages** — the nine dimensions as labelled percentage bars.
 *    A per-dimension rating surface, exactly what `GC-6` names.
 * 2. ⛔ **Status Distribution** — a donut counting `Mastering 15 · Mastered 8 ·
 *    Developing 6 · Beginning 3`. ▶ **The four ratified rating labels rendered
 *    as chart legend values.** A count *of a rating* is not the *"count of
 *    assessments"* the Operator permitted — it discloses the distribution of
 *    the ratings themselves.
 * 3. ⛔ **`Class Average 82%`** — a roll-up of ratings (`G-2`), and separately
 *    barred by `D-2`'s own constraint: *"the number is never rendered as a
 *    number on any surface, to any role."*
 * 4. ⛔ **Student Breakdown's `Strongest` / `Focus area` / `Overall`** — `G-2`
 *    names those exact limbs as roll-up ratings. `Overall` also renders a
 *    rating label per child in a comparison table, which is `C-9`'s stated
 *    harm verbatim.
 * 5. ⛔ **`Trainer & Assistant · This Lesson`** — the **Assistant** half is
 *    `A-014`/`G-7`, a deferred persona. ▶ And the Trainer half's fields are
 *    **invented concepts with no columns**: `Session delivered`, `Sent to
 *    parents`, `On time`, `Materials prepped`, `Learner check-ins`. Nothing in
 *    the schema records any of them, and a frame is never schema (`A-022`).
 *
 * ⚠️ **`Student ID 2025-113` HAS NO COLUMN EITHER** — `students` is `id ·
 * centre_id · full_name · is_active · created_at · updated_at ·
 * deactivated_at`, measured. Same finding as screens `18` and `24`.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ✅ WHAT SURVIVES, AND IT IS A REAL SURFACE RATHER THAN A REMNANT
 * ═══════════════════════════════════════════════════════════════════════════
 * Who taught the lesson · how many learners are enrolled · how many were
 * present · how many were assessed · how many reports have been submitted.
 * ▶ **Every one is a COUNT**, on the Operator's own ground: *"a count of
 * assessments is not an assessment"*, and *"attendance is not a rating."*
 *
 * ⛔ **THE STANDING TEST APPLIES:** if any of these ever becomes derived from
 * rating VALUES rather than counted, that is a stop-and-ask.
 */

export interface LessonStatisticsDto {
  readonly classSessionId: string;
  readonly classModuleId: string;
  readonly classLabel: string;
  readonly sessionDate: string;
  readonly lessonNumber: number | null;
  readonly lessonTitle: string | null;
  readonly startsAt: string | null;
  readonly endsAt: string | null;
  readonly room: string | null;
  /** ⛔ ONE trainer. `A-014`/`G-7`: no Assistant, and no field for one. */
  readonly trainerName: string | null;
  readonly enrolledCount: number;
  readonly presentCount: number;
  readonly attendanceRecorded: number;
  /** Learners with an observation behind them. ⛔ A COUNT, never a rating. */
  readonly assessedCount: number;
  readonly submittedCount: number;
  readonly awaitingCount: number;
}

export async function readLessonStatisticsCore(
  client: SupabaseClient,
  classSessionId: string,
): Promise<{ readonly ok: true; readonly data: LessonStatisticsDto } | { readonly ok: false }> {
  const session = await client
    .from("class_sessions")
    .select("id, class_module_id, session_date, starts_at, ends_at, room, lesson_number, lesson_title")
    .eq("id", classSessionId)
    .maybeSingle();
  if (session.error || session.data === null) return { ok: false };
  const s = session.data as {
    id: string;
    class_module_id: string;
    session_date: string;
    starts_at: string | null;
    ends_at: string | null;
    room: string | null;
    lesson_number: number | null;
    lesson_title: string | null;
  };

  const [moduleRow, enrolments, attendance, statusRows, assignment] = await Promise.all([
    client
      .from("class_modules")
      .select("id, title, class_grade_id")
      .eq("id", s.class_module_id)
      .maybeSingle(),
    client
      .from("enrolments")
      .select("student_id")
      .eq("class_module_id", s.class_module_id)
      .eq("is_active", true),
    client.from("attendance").select("status").eq("class_session_id", classSessionId),
    /*
     * ⚠️ THE GOVERNED READ, REUSED RATHER THAN RE-DERIVED. It is module-keyed,
     * so it is filtered to this session below — which also means the two
     * screens can never disagree about what "assessed" or "submitted" means.
     */
    readClassStatusRowsCore(client, s.class_module_id),
    client
      .from("class_session_assignments")
      .select("trainer_membership_id")
      .eq("class_session_id", classSessionId)
      .eq("is_active", true)
      .maybeSingle(),
  ]);

  const mod = moduleRow.data as { id: string; title: string; class_grade_id: string } | null;
  let gradeLabel = "";
  if (mod !== null) {
    const grade = await client
      .from("class_grades")
      .select("display_name")
      .eq("id", mod.class_grade_id)
      .maybeSingle();
    gradeLabel = ((grade.data as { display_name: string } | null)?.display_name ?? "").trim();
  }

  const attendanceRows = (attendance.data ?? []) as { status: string }[];
  const own = statusRows.ok ? statusRows.rows.filter((r) => r.classSessionId === classSessionId) : [];

  /*
   * ⛔ "ASSESSED" IS `reportId !== null`, AND THE EQUIVALENCE IS STRUCTURAL,
   * not an assumption. `assessment_save_complete_and_open_report` is the only
   * path that persists an observation, and it opens the report in the same
   * transaction — so a learner has a report row exactly when they have been
   * assessed. ▶ Counting `observations` directly would need a second read AND
   * a second definition of the same fact.
   */
  const assessedCount = own.filter((r) => r.reportId !== null).length;
  const submittedCount = own.filter((r) => r.reportState === "submitted").length;

  return {
    ok: true,
    data: {
      classSessionId: s.id,
      classModuleId: s.class_module_id,
      classLabel: [gradeLabel, mod?.title ?? ""].filter((v) => v.length > 0).join(" · "),
      sessionDate: s.session_date,
      lessonNumber: s.lesson_number,
      lessonTitle: s.lesson_title,
      startsAt: s.starts_at,
      endsAt: s.ends_at,
      room: s.room,
      trainerName: await resolveTrainerName(
        client,
        (assignment.data as { trainer_membership_id: string } | null)?.trainer_membership_id ?? null,
      ),
      enrolledCount: ((enrolments.data ?? []) as unknown[]).length,
      presentCount: attendanceRows.filter((a) => a.status === "present").length,
      attendanceRecorded: attendanceRows.length,
      assessedCount,
      /*
       * ⚠️ `awaitingCount` IS DERIVED FROM THE SAME ROWS, not counted a second
       * way. Learners assessed but whose report has not been submitted — the
       * honest reading of the frame's `Reports submitted 10 / 12`.
       */
      awaitingCount: assessedCount - submittedCount,
      submittedCount,
    },
  };
}

async function resolveTrainerName(
  client: SupabaseClient,
  membershipId: string | null,
): Promise<string | null> {
  if (membershipId === null) return null;
  const membership = await client
    .from("centre_memberships")
    .select("account_id")
    .eq("id", membershipId)
    .maybeSingle();
  const accountId = (membership.data as { account_id: string } | null)?.account_id ?? null;
  if (accountId === null) return null;
  const account = await client
    .from("accounts")
    .select("display_name")
    .eq("id", accountId)
    .maybeSingle();
  const name = ((account.data as { display_name: string | null } | null)?.display_name ?? "").trim();
  return name.length > 0 ? name : null;
}
