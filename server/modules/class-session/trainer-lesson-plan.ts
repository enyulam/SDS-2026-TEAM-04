import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { readRows } from "@/server/platform/query-diagnostics";
import type { AppDatabase } from "@/server/db/app-database";

/**
 * `P2-18` — screen `03` Trainer Lesson Plan.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⛔ `G-3` / `D-4` — THE KEY FOCUS CHIPS ARE RULED **IN SCOPE** AND ARE **NOT
 *    BUILT**, AND THOSE TWO FACTS ARE NOT IN TENSION
 * ═══════════════════════════════════════════════════════════════════════════
 * ⚠️ **CITATION 1 OF 3** (the Operator required the ruling cited in the
 * projection, the DTO and the plan, *"since a later reader seeing chips near a
 * lesson will check `G-3` and find a prohibition"*).
 *
 * **Operator ruling, 2026-08-17 — BUILD THE KEY FOCUS CHIPS.** The reasoning,
 * recorded because it is what makes the ruling safe:
 *
 * > *"The surviving prohibition is about **POSITION**, and it protects §10
 * > Phase 1 exit (c) — the governed carried-over previous-session focus.
 * > Screen `03` is the lesson-plan surface. It is not the roster and carries no
 * > governed focus line, so there is nothing there for the chips to displace or
 * > be mistaken for. `D-4` permitted them 'in a distinct visual position with a
 * > distinct label'. On `03` that condition is satisfied trivially, because the
 * > position they would have contended for does not exist on this screen."*
 *
 * ⛔ **AND ITS FOUR CONSTRAINTS ARE ABSOLUTE:**
 * 1. The chips are **LESSON-PLAN INTENT**. They must **never** be sourced from
 *    **`observations.focus_chips`** — that is the trainer's governed assessment
 *    data and `G-3`'s whole point.
 * 2. Screen `03` must carry **no governed previous-session-focus line**, now or
 *    later. If a phase ever adds one, the chips move or go.
 * 3. The label must distinguish them **by NAME**, not only by position.
 * 4. **If they need a column, STOP and state it.** The ruling authorizes the
 *    chips, not the schema.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⛔ CONSTRAINT 4 IS THE ONE THAT FIRED. **THEY NEED A COLUMN — MEASURED.**
 * ═══════════════════════════════════════════════════════════════════════════
 * An exhaustive catalogue search for any lesson-plan focus field —
 * `%focus%`, `%chip%`, `%objective%`, `%topic%`, `%plan%`, `%tag%`,
 * `%outcome%` across **all 30 tables** — returns **exactly two columns**:
 *
 *   · `observations.focus_chips`   ⛔ the decoy `G-3` names
 *   · `observations.strength_chips` ⛔ the same table, same prohibition
 *
 * ▶ **There is no lesson-plan focus column anywhere in the schema**, and the
 * ratified inventory says the same independently: screen `03` is
 * `Backend dependency missing` — *"no lesson-plan table, enum or RPC exists in
 * the 26-table / 12-enum census."*
 *
 * ⚠️ **AND THE BLOCKER IS LARGER THAN A COLUMN, WHICH IS WHY THIS IS REPORTED
 * RATHER THAN MIGRATED.** `P2-6` raised this exact panel and the Operator
 * declined it then, on grounds a column does not remove — recorded verbatim in
 * that phase's own guard, `PLMa-KEYFOCUS`:
 *
 * > *"`D-4` names no author, no authoring surface exists, and a read for a
 * > field nobody can write is a permanently empty panel."*
 *
 * ▶ So shipping a column today would put a **permanently empty KEY FOCUS
 * POINTS panel** on this screen — worse than the honest omission, and exactly
 * the *"inert control"* §12.12 refuses. **The chips need a column, an author
 * and an authoring surface; this phase states that and builds neither.**
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⛔ THE SECOND STOP: `SLIDES & MATERIALS` IS UNREADABLE BY A TRAINER
 * ═══════════════════════════════════════════════════════════════════════════
 * `class_session_materials` **exists** — `P2-6` built it for the MANAGEMENT
 * upload side (screen `14`). Measured as the fixture trainer:
 * **`permission denied for table class_session_materials`**, a GRANT-layer
 * refusal, and the table holds **0 rows** besides.
 *
 * ▶ A trainer read path needs **a policy and a matching grant, or a read RPC**.
 * That is schema, and the ruling expressly does not authorize it. **Stated, not
 * built.**
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ✅ WHAT THIS PROJECTION DOES BUILD — ZERO SCHEMA
 * ═══════════════════════════════════════════════════════════════════════════
 * The lesson spine the frame draws around those two panels: lesson number,
 * title, date, room, and a **status derived from the date** — all from
 * `class_sessions`, which a trainer already reads (17 rows measured).
 */

export interface LessonPlanEntryDto {
  readonly sessionId: string;
  /** ⚠️ `null` where the session carries none — the badge is OMITTED (hero `0B`). */
  readonly lessonNumber: number | null;
  readonly lessonTitle: string | null;
  readonly sessionDate: string;
  readonly room: string | null;
  /**
   * ⛔ DERIVED FROM THE DATE, NEVER STORED. The frame's three pills are
   * `Completed` / `This week` / `Upcoming`, and none of them is a governed
   * lifecycle value — `A-036`'s eight belong to a REPORT, not a session, and
   * inventing a session-status enum to back a pill would be encoding UI
   * presence as a governed fact (the `GC-8` reasoning, one entity over).
   */
  readonly timing: "completed" | "this_week" | "upcoming";
}

export interface TrainerLessonPlanDto {
  readonly classModuleId: string;
  readonly moduleTitle: string;
  readonly gradeLabel: string;
  readonly displayLabel: string;
  readonly termLabel: string | null;
  readonly learnerCount: number;
  readonly scheduleSummary: string | null;
  readonly lessons: readonly LessonPlanEntryDto[];
  /**
   * ⛔ THERE IS NO `keyFocus` FIELD, AND ITS ABSENCE IS THE `G-3` ENFORCEMENT.
   * ⚠️ **CITATION 2 OF 3.** The Operator ruled the chips IN SCOPE for this
   * screen and made the schema a separate authorization; measurement then
   * showed the only focus columns in the database are
   * `observations.focus_chips` / `strength_chips`, which `G-3` bars because
   * they are **post-session assessment**, not **lesson-plan intent**.
   * ▶ **The refusal is held HERE, in the type**, so no component can bind a
   * chip list to assessment data by choosing to.
   */
}

type AssignmentRow = { class_session_id: string };
type SessionRow = {
  id: string;
  class_module_id: string;
  session_date: string;
  starts_at: string | null;
  ends_at: string | null;
  room: string | null;
  lesson_number: number | null;
  lesson_title: string | null;
  term_id: string | null;
};

function timingOf(sessionDate: string, todayIso: string): LessonPlanEntryDto["timing"] {
  /*
   * ⚠️ "THIS WEEK" IS A SEVEN-DAY WINDOW FORWARD FROM TODAY, not a calendar
   * week, and the choice is deliberate: a calendar week makes Sunday's lesson
   * "this week" on Saturday and "last week" a day later, which reads as the
   * page changing its mind. Compared as ISO strings — no `Date` round-trip and
   * no timezone to get wrong.
   */
  if (sessionDate < todayIso) return "completed";
  const d = new Date(`${todayIso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 7);
  return sessionDate <= d.toISOString().slice(0, 10) ? "this_week" : "upcoming";
}

export async function readTrainerLessonPlanCore(
  client: SupabaseClient<AppDatabase>,
  todayIso: string,
  requestedModuleId: string | null,
): Promise<{ readonly ok: true; readonly data: TrainerLessonPlanDto | null } | { readonly ok: false }> {
  /*
   * ⛔ `A-016`: ASSIGNMENT IS AUTHORITATIVE AT SESSION LEVEL, so the assignment
   * rows are the spine and the module is derived from them. The same shape
   * `P2-17` and `P2-20` use — deliberately, because a module-level filter would
   * be inventing a module-level assignment the model does not have.
   */
  const assignments = await readRows<AssignmentRow>("readTrainerLessonPlanCore:assignments", () =>
    client.from("class_session_assignments").select("class_session_id").eq("is_active", true),
  );
  if (!assignments.ok) return { ok: false };
  const sessionIds = assignments.rows.map((a) => a.class_session_id);
  if (sessionIds.length === 0) return { ok: true, data: null };

  const sessions = await readRows<SessionRow>("readTrainerLessonPlanCore:sessions", () =>
    client
      .from("class_sessions")
      .select("id, class_module_id, session_date, starts_at, ends_at, room, lesson_number, lesson_title, term_id")
      .in("id", sessionIds),
  );
  if (!sessions.ok) return { ok: false };
  if (sessions.rows.length === 0) return { ok: true, data: null };

  /*
   * ⚠️ THE REQUESTED MODULE IS RESOLVED AGAINST THE TRAINER'S OWN SET, NEVER
   * TRUSTED. An id that is not in this list falls back to the first — so a
   * hand-edited query string selects nothing it could not already reach
   * (`A-045`: a query parameter is presentation selection, never authority).
   */
  const moduleIds = [...new Set(sessions.rows.map((s) => s.class_module_id))];
  const moduleId = requestedModuleId !== null && moduleIds.includes(requestedModuleId)
    ? requestedModuleId
    : moduleIds[0];

  const own = sessions.rows.filter((s) => s.class_module_id === moduleId);

  const modules = await readRows<{ id: string; title: string; class_grade_id: string }>(
    "readTrainerLessonPlanCore:modules",
    () => client.from("class_modules").select("id, title, class_grade_id").eq("id", moduleId),
  );
  if (!modules.ok || modules.rows.length === 0) return { ok: true, data: null };
  const mod = modules.rows[0];

  /* ⚠️ `class_grades.display_name` vs `terms.label` — adjacent tables, OPPOSITE
     column names, and the pair that broke `P2-9`'s migration. Both measured. */
  const [grades, terms, enrolments] = await Promise.all([
    readRows<{ id: string; display_name: string }>("readTrainerLessonPlanCore:grades", () =>
      client.from("class_grades").select("id, display_name").eq("id", mod.class_grade_id),
    ),
    readRows<{ id: string; label: string }>("readTrainerLessonPlanCore:terms", () =>
      client.from("terms").select("id, label"),
    ),
    readRows<{ class_module_id: string }>("readTrainerLessonPlanCore:enrolments", () =>
      client.from("enrolments").select("class_module_id").eq("class_module_id", moduleId).eq("is_active", true),
    ),
  ]);

  const gradeLabel = grades.ok ? (grades.rows[0]?.display_name ?? "") : "";
  const termId = own.find((s) => s.term_id !== null)?.term_id ?? null;
  const termLabel = terms.ok && termId !== null ? (terms.rows.find((t) => t.id === termId)?.label ?? null) : null;

  const times = [...new Set(own.map((s) => s.starts_at).filter((v): v is string => v !== null))];
  const rooms = [...new Set(own.map((s) => s.room).filter((v): v is string => v !== null))];
  /*
   * ⚠️ THE SUMMARY IS OMITTED WHEN THE SESSIONS DISAGREE, rather than picking
   * one. The frame prints a single "Tue & Thu · 3:00–4:00 PM · Studio 2" line;
   * with sessions in different rooms that line would be a claim the data does
   * not support. Omitting an ambiguous value is the same discipline as omitting
   * a null one — never fabricate, never pick.
   */
  const scheduleSummary =
    times.length === 1 && rooms.length === 1 ? `${times[0].slice(0, 5)} · ${rooms[0]}` : null;

  return {
    ok: true,
    data: {
      classModuleId: moduleId,
      moduleTitle: mod.title,
      gradeLabel,
      displayLabel: [gradeLabel, mod.title].filter((v) => v.length > 0).join(" · "),
      termLabel,
      learnerCount: enrolments.ok ? enrolments.rows.length : 0,
      scheduleSummary,
      lessons: [...own]
        .sort((a, b) => a.session_date.localeCompare(b.session_date))
        .map((s) => ({
          sessionId: s.id,
          lessonNumber: s.lesson_number,
          lessonTitle: s.lesson_title,
          sessionDate: s.session_date,
          room: s.room,
          timing: timingOf(s.session_date, todayIso),
        })),
    },
  };
}
