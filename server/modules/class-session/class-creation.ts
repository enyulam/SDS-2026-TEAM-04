/**
 * CLASS CREATION — the governed write behind screen `26` Add Class (P2-2).
 *
 * ---------------------------------------------------------------------
 * ⚠️ THIS IS THE PRODUCT'S FIRST ADMINISTRATIVE WRITE PATH
 * ---------------------------------------------------------------------
 * Every governed write before it was a trainer or management act inside the
 * REPORT lifecycle. This one creates academic structure, so it is the first
 * place a management caller mutates the class hierarchy — which is why the
 * proof suite re-asserts, at runtime, that it did not quietly open a write
 * surface on anything else (`P23-9`, `P23-11`).
 *
 * ⛔ IT WRITES NOTHING DIRECTLY. Both calls are reviewed `SECURITY DEFINER`
 * RPCs (`ADR-3`, `A-030`): `admin_create_class_module` and
 * `admin_create_class_session`. That is what let the Operator's
 * *"zero write policies, zero write grants"* survive this phase intact — the
 * owner writes, the caller holds only EXECUTE.
 *
 * ---------------------------------------------------------------------
 * ⛔ WHAT THIS DELIBERATELY CANNOT DO, AND IT IS A STOP, NOT A GAP
 * ---------------------------------------------------------------------
 * **NO TRAINER ASSIGNMENT.** The frame draws an `Assigned Trainer` section;
 * assigning one emits `admin.trainer_assigned`, a THIRD audit string the
 * Operator did not name when they authorized this phase on
 * `admin.module_created` and `admin.session_created`. It is STOPPED and
 * stated, not half-built — and the migration carries assertion `C-8`, which
 * fails the build if either RPC ever reaches it.
 *
 * ▶ A session created with no assignment is a REAL GOVERNED STATE, not a
 * broken one: `staff-projections.ts` already documents *"a session created
 * but not yet assigned"* and returns no name for it.
 *
 * ⛔ NO CLASS CODE, NO CAPACITY, NO PROGRAMME (`C-14`; `A-016` — "programme"
 * has no entity and must never become a hidden `classes` entity between
 * Class Grade and Class Module). ⛔ NO TA FIELD (`A-014`, `G-7`) — a
 * `REGISTERED-OMISSION` that never ends. ⛔ NO LESSON NUMBER OR TITLE: the
 * `26` frame draws neither, and a parameter no surface supplies is a field
 * invented from nothing. A session created here carries NULL lesson
 * identity, which is the correct NOT RECORDED state (hero 0B).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ActionResult } from "@/server/contracts/action-result";
import { readRows, type QueryOutcome } from "@/server/platform/query-diagnostics";

/** One Class Grade, carrying the id the create RPC takes as a parameter. */
export interface ClassGradeChoiceDto {
  readonly classGradeId: string;
  readonly code: string;
  readonly displayName: string;
  readonly sortOrder: number;
}

/**
 * One term.
 *
 * ⚠️ `label` IS ONE FIELD, not a number plus a year — every frame that
 * mentions a term renders a single string, and splitting it would invent a
 * structure no frame shows and no rule requires (`D-3`).
 *
 * ⛔ THE DATES ARE SCHEDULING STRUCTURE AND NOTHING ELSE. `D-3` authorizes
 * terms to group SESSIONS; END-OF-TERM REPORT GENERATION REMAINS DEFERRED
 * (`C-11`), and no field here leads toward one.
 */
export interface TermOptionDto {
  readonly termId: string;
  readonly label: string;
  readonly startsOn: string;
  readonly endsOn: string;
}

export interface AddClassOptionsDto {
  readonly grades: readonly ClassGradeChoiceDto[];
  readonly terms: readonly TermOptionDto[];
}

interface ClassGradeRow {
  readonly id: string;
  readonly code: string;
  readonly display_name: string;
  readonly sort_order: number;
}

interface TermRow {
  readonly id: string;
  readonly label: string;
  readonly starts_on: string;
  readonly ends_on: string;
}

/**
 * The two option sets the form needs before it can submit anything.
 *
 * ⛔ BOTH FAIL CLOSED. A grade list that silently arrives empty would render
 * a form that cannot create anything, and a term list that silently arrives
 * empty would look like an academy with no calendar. "None" and "could not
 * read" are different values and only one of them was observed (`Q-7`).
 *
 * ⚠️ Read over the caller's own credential, no RPC: `terms` carries one
 * `SELECT` policy — ACTIVE MEMBER OF THE CENTRE — and its minimum matching
 * grant, and `class_grades` carries the same pair. The narrower instrument.
 */
export async function readAddClassOptionsCore(
  client: SupabaseClient,
): Promise<QueryOutcome<AddClassOptionsDto>> {
  const grades = await readRows<ClassGradeRow>("readAddClassOptionsCore:class_grades", () =>
    client
      .from("class_grades")
      .select("id, code, display_name, sort_order")
      .order("sort_order", { ascending: true }),
  );
  if (!grades.ok) return { ok: false };

  const terms = await readRows<TermRow>("readAddClassOptionsCore:terms", () =>
    client
      .from("terms")
      .select("id, label, starts_on, ends_on")
      .eq("is_active", true)
      .order("starts_on", { ascending: true }),
  );
  if (!terms.ok) return { ok: false };

  return {
    ok: true,
    rows: {
      grades: grades.rows.map((row) => ({
        classGradeId: row.id,
        code: row.code,
        displayName: row.display_name,
        sortOrder: row.sort_order,
      })),
      terms: terms.rows.map((row) => ({
        termId: row.id,
        label: row.label,
        startsOn: row.starts_on,
        endsOn: row.ends_on,
      })),
    },
  };
}

/**
 * What actually happened, reported honestly enough that a partial result is
 * legible rather than looking like a failure.
 *
 * ⚠️ `sessionsRequested` VS `sessionsCreated` IS THE POINT. One call creates
 * one dated session, so a Tue/Thu pattern across a term is N independent
 * governed transactions with N audit events. If the module lands and the
 * eleventh session does not, the eleven that did are real and the surface
 * must say so — a "failed" banner over ten committed sessions would be a lie
 * about governed state.
 */
export interface ClassCreationOutcome {
  readonly classModuleId: string;
  readonly sessionsRequested: number;
  readonly sessionsCreated: number;
  /** `created`, or the first discriminating reason a session refused. */
  readonly reason: string;
}

export interface CreateClassInput {
  readonly classGradeId: string;
  readonly title: string;
  readonly termId: string | null;
  readonly room: string | null;
  readonly startTime: string | null;
  readonly endTime: string | null;
  /** `0` = Sunday … `6` = Saturday, matching the frame's Sun–Sat strip. */
  readonly weekdays: readonly number[];
}

interface ModuleRpcRow {
  readonly o_module_id: string | null;
  readonly o_reason: string | null;
}

interface SessionRpcRow {
  readonly o_session_id: string | null;
  readonly o_reason: string | null;
}

/**
 * Create the Class Module, then one dated Class Session per occurrence.
 *
 * ---------------------------------------------------------------------
 * ⛔ THE DAY SELECTORS ARE A GENERATOR, NOT A STORED SCHEDULE (`C-14`)
 * ---------------------------------------------------------------------
 * No recurrence rule is persisted anywhere, and no duplicated calendar or
 * event record is created (`A-016`, `A-047`) — calendars are projections of
 * these session rows. Re-running the form would create new sessions, not
 * edit a pattern, because there is no pattern to edit.
 *
 * ⚠️ ONE DEVIATION FROM THE PLAN'S WORDING, STATED RATHER THAN QUIET. The
 * plan says *"the CLIENT expands the chosen days"*. The expansion arithmetic
 * runs HERE, in server code, because `ADR-3` makes governed writes
 * server-only — a browser cannot call the RPC at all. ▶ Every property the
 * recommendation was actually chosen for is preserved exactly: N separate
 * governed transactions, one audit event each, no rule stored, and partial
 * failure that is legible instead of ambiguous.
 *
 * ⛔ NO TERM MEANS NO SESSIONS, AND THAT IS NOT AN ERROR. The term supplies
 * the date range the weekdays are expanded across; without one there is
 * nothing to expand into, so the module is created alone. A module with no
 * sessions yet is a legitimate state — `12` renders it with no trainer and
 * no learners, which is exactly what it is.
 */
export async function createClassCore(
  client: SupabaseClient,
  input: CreateClassInput,
): Promise<ActionResult<ClassCreationOutcome>> {
  const moduleCall = await client.rpc("admin_create_class_module", {
    p_class_grade_id: input.classGradeId,
    p_title: input.title,
  });
  if (moduleCall.error) return { outcome: "unavailable" };

  const moduleRow = firstRpcRow<ModuleRpcRow>(moduleCall.data);
  if (!moduleRow) return { outcome: "unavailable" };

  const moduleReason = moduleRow.o_reason ?? "not_permitted";
  if (!moduleRow.o_module_id) return mapCreateReason(moduleReason);

  const dates = await resolveOccurrences(client, input);

  let created = 0;
  let firstRefusal = "";
  for (const sessionDate of dates) {
    const call = await client.rpc("admin_create_class_session", {
      p_class_module_id: moduleRow.o_module_id,
      p_session_date: sessionDate,
      p_starts_at: input.startTime,
      p_ends_at: input.endTime,
      p_room: input.room,
      p_term_id: input.termId,
    });
    const row = call.error ? null : firstRpcRow<SessionRpcRow>(call.data);
    if (row?.o_session_id) {
      created += 1;
    } else if (!firstRefusal) {
      firstRefusal = row?.o_reason ?? "unavailable";
    }
  }

  return {
    outcome: "success",
    data: {
      classModuleId: moduleRow.o_module_id,
      sessionsRequested: dates.length,
      sessionsCreated: created,
      reason: firstRefusal || "created",
    },
  };
}

/**
 * The dates the weekday strip expands into, over the chosen term's range.
 *
 * ⛔ THE RANGE IS READ FROM THE DATABASE, NEVER TAKEN FROM THE FORM. A
 * caller-supplied range would let a tampered request generate sessions
 * outside the term it names — the RPC would still refuse a foreign TERM, but
 * it has no opinion about a DATE, so nothing downstream would catch it. The
 * read is RLS-scoped, so a term outside the caller's centre resolves to
 * nothing and produces no dates.
 */
async function resolveOccurrences(
  client: SupabaseClient,
  input: CreateClassInput,
): Promise<readonly string[]> {
  if (!input.termId || input.weekdays.length === 0) return [];
  const term = await readRows<TermRow>("resolveOccurrences:terms", () =>
    client.from("terms").select("id, label, starts_on, ends_on").eq("id", input.termId ?? ""),
  );
  if (!term.ok || term.rows.length !== 1) return [];
  const range = { startsOn: term.rows[0].starts_on, endsOn: term.rows[0].ends_on };

  const wanted = new Set(input.weekdays);
  const out: string[] = [];
  // UTC arithmetic throughout: a local-time cursor can cross a DST boundary
  // and silently skip or repeat a weekday.
  const cursor = new Date(`${range.startsOn}T00:00:00Z`);
  const end = new Date(`${range.endsOn}T00:00:00Z`);
  if (Number.isNaN(cursor.getTime()) || Number.isNaN(end.getTime())) return [];
  while (cursor.getTime() <= end.getTime()) {
    if (wanted.has(cursor.getUTCDay())) out.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return out;
}

function firstRpcRow<T>(data: unknown): T | null {
  const row = Array.isArray(data) ? data[0] : data;
  return (row as T) ?? null;
}

/**
 * ⚠️ THE REFUSAL SIDE COLLAPSES; THE DIAGNOSTIC SIDE DOES NOT.
 * `not_permitted` is the RPC's single, deliberately indistinguishable answer
 * to "you are not management", "you are nobody" and "that grade is not
 * yours" alike. Everything else is a diagnostic for someone the database
 * already proved is active management of this centre.
 */
function mapCreateReason(reason: string): ActionResult<never> {
  switch (reason) {
    case "not_permitted":
      return { outcome: "unauthorized" };
    case "invalid_title":
      return { outcome: "validation", message: "Enter a class name.", fields: [{ path: "title", message: "Enter a class name." }] };
    case "title_too_long":
      return { outcome: "validation", message: "The class name is too long.", fields: [{ path: "title", message: "Use 120 characters or fewer." }] };
    case "already_exists":
      return {
        outcome: "validation",
        message: "A class with that name already exists at this level.",
        fields: [{ path: "title", message: "A class with that name already exists at this level." }],
      };
    default:
      return { outcome: "unexpected_failure", message: "The operation could not be completed." };
  }
}
