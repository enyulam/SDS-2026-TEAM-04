import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppDatabase } from "@/server/db/app-database";

/**
 * `P2-17` — screen `02` Trainer My Classes.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ✅ NO NEW FUNCTION, NO NEW GRANT — §12.10 FOR THE SEVENTH PHASE RUNNING
 * ═══════════════════════════════════════════════════════════════════════════
 * Measured at HEAD before a line was written: `class_modules`,
 * `class_sessions`, `class_grades`, `class_session_assignments`, `terms`,
 * `students`, `enrolments` and `attendance` each carry **a grant, RLS enabled
 * and a trainer policy**. ▶ `class_modules_select_trainer` is
 * `app_trainer_reaches_module(id)`, so "my classes" is already what RLS
 * returns — this screen needs no governed read of its own.
 *
 * ⚠️ **THE ASSIGNMENT FILTER IS STILL WRITTEN EXPLICITLY**, through
 * `class_session_assignments` (own, active) → sessions → modules, rather than
 * leaning on RLS to be assignment-scoped. **`A-016` makes trainer assignment
 * authoritative at SESSION level**, so that is the join that decides the
 * answer; RLS agreeing is a second layer, not the reason the query is right.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⛔ THE `Lesson plan` BUTTON — DISABLED WITH A REASON, NOT PROHIBITED
 * ═══════════════════════════════════════════════════════════════════════════
 * The frame draws a full-width `Lesson plan` control on every card. ⚠️ **It is
 * NOT `G-3`'s prohibited "View lesson plan":** its destination, **screen `03`
 * Trainer Lesson Plan**, is one of the ratified 36 and lands at **`P2-18`**.
 * ▶ So this is `18`'s `Edit` case, not `23`'s — **a destination that exists
 * but is not built yet**, which is disabled-with-a-reason rather than absent.
 * ⛔ Whether `03`'s CONTENT is buildable is `P2-18`'s question: `G-3` prohibits
 * SLIDES and the lesson-plan control as drawn on `06`, and `D-4` narrows that
 * only for materials **tagged to a specific class session**.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⚠️ THE TERM FILTER IS BY DATE, AND THAT IS A MEASURED DECISION
 * ═══════════════════════════════════════════════════════════════════════════
 * `class_sessions.term_id` is **nullable**, and **4 of 17 fixture sessions
 * carry none**. ▶ Filtering by `term_id` would have made those four
 * **silently vanish** from a trainer's own class list because an administrator
 * did not set a field. Filtering by the term's **date window** against
 * `session_date` — a column every session has — puts every real session in the
 * term it actually falls in. `D-3` frames terms as scheduling structure, which
 * is what a date window is.
 *
 * ⛔ **NO `Assist.` / TA ANYWHERE** (`A-014`/`G-7`), and the frame draws none
 * here either — measured: the `.html` contains `Assist` **0** times.
 */

export interface TrainerTermDto {
  readonly termId: string;
  readonly label: string;
  readonly startsOn: string;
  readonly endsOn: string;
}

export interface TrainerClassCardDto {
  readonly classModuleId: string;
  readonly title: string;
  readonly gradeLabel: string;
  /** `Junior · Public Speaking` — grade and title, exactly as the frame draws it. */
  readonly displayLabel: string;
  readonly initials: string;
  readonly studentCount: number;
  /** `Tue & Thu · 3:00 PM · Studio 2`. NULL when nothing is scheduled. */
  readonly scheduleSummary: string | null;
  /** ⛔ NULL means NO UPCOMING SESSION — the line is omitted, never shown empty (hero `0B`). */
  readonly nextSessionDate: string | null;
}

export interface TrainerMyClassesDto {
  readonly terms: readonly TrainerTermDto[];
  readonly selectedTermId: string | null;
  readonly cards: readonly TrainerClassCardDto[];
}

type SessionRow = {
  id: string;
  class_module_id: string;
  session_date: string;
  starts_at: string | null;
  room: string | null;
};

const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export async function readTrainerMyClassesCore(
  client: SupabaseClient<AppDatabase>,
  todayIso: string,
  requestedTermId: string | null,
): Promise<{ readonly ok: true; readonly data: TrainerMyClassesDto } | { readonly ok: false }> {
  const terms = await client.from("terms").select("id, label, starts_on, ends_on").order("starts_on");
  if (terms.error) return { ok: false };
  const termRows = (terms.data ?? []) as { id: string; label: string; starts_on: string; ends_on: string }[];

  /*
   * ⚠️ THE DEFAULT TERM IS THE ONE CONTAINING TODAY, and it falls back to the
   * LAST term rather than the first when today sits outside every window —
   * a trainer opening this in the holidays should land on the term that just
   * ended, not on January.
   */
  const containing = termRows.find((t) => t.starts_on <= todayIso && todayIso <= t.ends_on);
  const selected =
    termRows.find((t) => t.id === requestedTermId) ?? containing ?? termRows[termRows.length - 1] ?? null;

  /*
   * ⛔ `A-016`: TRAINER ASSIGNMENT IS AUTHORITATIVE AT SESSION LEVEL. The
   * assignment rows are the spine; the module list is derived from them, never
   * the other way round.
   */
  const assignments = await client
    .from("class_session_assignments")
    .select("class_session_id")
    .eq("is_active", true);
  if (assignments.error) return { ok: false };
  const sessionIds = ((assignments.data ?? []) as { class_session_id: string }[]).map((a) => a.class_session_id);
  if (sessionIds.length === 0) {
    return { ok: true, data: { terms: termRows.map(toTerm), selectedTermId: selected?.id ?? null, cards: [] } };
  }

  let q = client
    .from("class_sessions")
    .select("id, class_module_id, session_date, starts_at, room")
    .in("id", sessionIds);
  if (selected !== null) q = q.gte("session_date", selected.starts_on).lte("session_date", selected.ends_on);
  const sessions = await q;
  if (sessions.error) return { ok: false };
  const sessionRows = (sessions.data ?? []) as SessionRow[];

  const moduleIds = [...new Set(sessionRows.map((s) => s.class_module_id))];
  if (moduleIds.length === 0) {
    return { ok: true, data: { terms: termRows.map(toTerm), selectedTermId: selected?.id ?? null, cards: [] } };
  }

  const [modules, enrolments] = await Promise.all([
    client.from("class_modules").select("id, title, class_grade_id").in("id", moduleIds),
    client.from("enrolments").select("class_module_id").in("class_module_id", moduleIds).eq("is_active", true),
  ]);
  if (modules.error) return { ok: false };
  const moduleRows = (modules.data ?? []) as { id: string; title: string; class_grade_id: string }[];

  const gradeIds = [...new Set(moduleRows.map((m) => m.class_grade_id))];
  /* ⚠️ `class_grades.display_name` — and `terms.label`. Two adjacent tables,
     OPPOSITE column names, and guessing the wrong one is exactly the defect
     that broke `P2-9`'s migration at runtime. Both are measured here. */
  const grades = await client.from("class_grades").select("id, display_name").in("id", gradeIds);
  const gradeById = new Map(
    ((grades.data ?? []) as { id: string; display_name: string }[]).map((g) => [g.id, g.display_name]),
  );

  const enrolCount = new Map<string, number>();
  for (const e of (enrolments.data ?? []) as { class_module_id: string }[]) {
    enrolCount.set(e.class_module_id, (enrolCount.get(e.class_module_id) ?? 0) + 1);
  }

  const cards = moduleRows
    .map((m) => {
      const own = sessionRows.filter((s) => s.class_module_id === m.id);
      const upcoming = own
        .filter((s) => s.session_date >= todayIso)
        .sort((a, b) => a.session_date.localeCompare(b.session_date))[0];
      const gradeLabel = (gradeById.get(m.class_grade_id) ?? "").trim();
      return {
        classModuleId: m.id,
        title: m.title,
        gradeLabel,
        displayLabel: [gradeLabel, m.title].filter((v) => v.length > 0).join(" · "),
        initials: initialsOf(m.title),
        studentCount: enrolCount.get(m.id) ?? 0,
        scheduleSummary: summariseSchedule(own),
        nextSessionDate: upcoming?.session_date ?? null,
      };
    })
    .sort((a, b) => a.displayLabel.localeCompare(b.displayLabel));

  return { ok: true, data: { terms: termRows.map(toTerm), selectedTermId: selected?.id ?? null, cards } };
}

function toTerm(t: { id: string; label: string; starts_on: string; ends_on: string }): TrainerTermDto {
  return { termId: t.id, label: t.label, startsOn: t.starts_on, endsOn: t.ends_on };
}

/**
 * ⛔ THE AVATAR INITIALS COME FROM THE MODULE TITLE, AND THAT IS DELIBERATE.
 *
 * ⚠️ `P2-8` shipped a defect where an avatar was tinted **by row index**, so a
 * learner changed colour when the filter reordered the table. ▶ Keying off the
 * TITLE reproduces what the frame actually does — both Public Speaking cards
 * are pink, both Speech and Drama cards teal — and is stable under any
 * ordering, filter or term change.
 */
function initialsOf(title: string): string {
  const words = title.split(/\s+/).filter((w) => /[a-z]/i.test(w[0] ?? ""));
  if (words.length === 0) return "?";
  if (words.length === 1) return (words[0].slice(0, 2) || "?").toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/**
 * `Tue & Thu · 3:00 PM · Studio 2` — the frame's schedule line.
 *
 * ⛔ EVERY LIMB IS OMITTED WHEN IT IS NOT RECORDED (hero `0B`), and the whole
 * line resolves to NULL rather than to a string of separators. ⚠️ The time and
 * room are shown **only when every session in the term agrees**: a module whose
 * sessions run at two different times has no single "3:00 PM", and printing one
 * of them would state a schedule the trainer does not have.
 */
function summariseSchedule(sessions: readonly SessionRow[]): string | null {
  if (sessions.length === 0) return null;

  const days = [...new Set(sessions.map((s) => new Date(`${s.session_date}T00:00:00Z`).getUTCDay()))]
    .sort((a, b) => a - b)
    .map((d) => DAY[d]);

  const times = new Set(sessions.map((s) => s.starts_at).filter((v): v is string => v !== null));
  const rooms = new Set(sessions.map((s) => s.room).filter((v): v is string => v !== null && v.trim() !== ""));

  const parts = [
    days.length > 0 ? days.join(" & ") : null,
    times.size === 1 ? shortTime([...times][0]) : null,
    rooms.size === 1 ? [...rooms][0] : null,
  ].filter((v): v is string => v !== null);

  return parts.length === 0 ? null : parts.join(" · ");
}

function shortTime(value: string): string {
  const [h, m] = value.split(":");
  const hour = Number(h);
  const suffix = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:${m ?? "00"} ${suffix}`;
}
