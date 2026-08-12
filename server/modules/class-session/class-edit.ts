/**
 * CLASS EDIT — the read and the governed writes behind screen `27` (P2-3).
 *
 * ---------------------------------------------------------------------
 * ⛔ WHAT `27` CAN DO, AND WHAT IT DELIBERATELY CANNOT
 * ---------------------------------------------------------------------
 * It can CHANGE a class. It cannot DESTROY one, and the difference is not a
 * UI decision — it is the shape of the audit registry.
 *
 * ✅ **CHANGE** — the module's `title` and Class Grade (`admin.module_updated`),
 * and each session's date, times, room and term (`admin.session_updated`).
 * Both strings were ratified by the Operator on 2026-08-13, with the count
 * stated in advance: **registry 19 → 21, exactly two.**
 *
 * ⛔ **THE DAY STRIP IS READ-ONLY HERE.** Changing which weekdays a class
 * meets means REMOVING sessions, and there is **no ratified cancel or delete
 * string**. A session may already carry attendance, an observation or a
 * submitted report, so destroying one is a governed act that must be
 * recorded — and nothing can record it yet. ▶ **The control is absent rather
 * than present-and-inert**, because a disabled day chip on an Edit form reads
 * as "not yet wired" instead of "not permitted".
 *
 * ⛔ **NO UNASSIGN.** Choosing a DIFFERENT trainer is reassignment and uses
 * the existing `admin_assign_session_trainer` (`P2-2b`). Leaving a session
 * with NO trainer is a different action with no ratified string.
 *
 * ⛔ **NO CLASS CODE, CAPACITY OR PROGRAMME** (`C-14`; `A-016` — "programme"
 * has no entity and must never become a hidden `classes` entity).
 *
 * ⚠️ The frame's breadcrumb reads `Classes / Junior Public Speaking / Edit`.
 * `Junior` is a CLASS CODE, which `C-14` omits, so the breadcrumb renders the
 * Class Module title alone. Recorded divergence, not drift.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ActionResult } from "@/server/contracts/action-result";
import { readRows, readMaybeRow, type QueryOutcome } from "@/server/platform/query-diagnostics";

export interface EditableSessionDto {
  readonly classSessionId: string;
  readonly sessionDate: string;
  readonly startTime: string | null;
  readonly endTime: string | null;
  readonly room: string | null;
  readonly termId: string | null;
  /** ⛔ Read-only context. `27` does not assign per session; it reassigns all. */
  readonly trainerDisplayName: string | null;
}

export interface ClassEditDto {
  readonly classModuleId: string;
  readonly title: string;
  readonly classGradeId: string;
  readonly sessions: readonly EditableSessionDto[];
  /** The membership currently assigned across this module's sessions, if one. */
  readonly trainerMembershipId: string | null;
}

interface ModuleRow {
  readonly id: string;
  readonly title: string;
  readonly class_grade_id: string;
}

interface SessionRow {
  readonly id: string;
  readonly session_date: string;
  readonly starts_at: string | null;
  readonly ends_at: string | null;
  readonly room: string | null;
  readonly term_id: string | null;
}

interface AssignmentRow {
  readonly class_session_id: string;
  readonly trainer_membership_id: string;
}

interface MembershipRow {
  readonly id: string;
  readonly account_id: string;
}

interface AccountRow {
  readonly id: string;
  readonly display_name: string | null;
}

/**
 * Read one Class Module and its sessions for editing.
 *
 * ⛔ THE SPINE FAILS CLOSED. A module that cannot be read is not an empty
 * form — rendering blank fields over a rejected read would let a save
 * overwrite real values with nothing (`Q-7`).
 *
 * ⚠️ THE TRAINER CHAIN FAILS SOFT, as everywhere else: a name that cannot be
 * resolved is omitted, and the class still edits.
 */
export async function readClassForEditCore(
  client: SupabaseClient,
  classModuleId: string,
): Promise<QueryOutcome<ClassEditDto | null>> {
  const classModule = await readMaybeRow<ModuleRow>("readClassForEditCore:class_modules", () =>
    client
      .from("class_modules")
      .select("id, title, class_grade_id")
      .eq("id", classModuleId)
      .eq("is_active", true),
  );
  if (!classModule.ok) return { ok: false };
  // ⚠️ NULL here means "no such module, or not yours" — one value, deliberately
  // indistinguishable, which is what the caller renders as a non-disclosing
  // unavailable.
  if (!classModule.rows) return { ok: true, rows: null };

  const sessions = await readRows<SessionRow>("readClassForEditCore:class_sessions", () =>
    client
      .from("class_sessions")
      .select("id, session_date, starts_at, ends_at, room, term_id")
      .eq("class_module_id", classModuleId)
      .order("session_date", { ascending: true }),
  );
  if (!sessions.ok) return { ok: false };

  const staff = await readAssignedTrainer(
    client,
    sessions.rows.map((row) => row.id),
  );

  return {
    ok: true,
    rows: {
      classModuleId: classModule.rows.id,
      title: classModule.rows.title,
      classGradeId: classModule.rows.class_grade_id,
      trainerMembershipId: staff.membershipId,
      sessions: sessions.rows.map((row) => ({
        classSessionId: row.id,
        sessionDate: row.session_date,
        // ⚠️ Postgres `time` arrives as `HH:MM:SS`; the form's `<input type=time>`
        // wants `HH:MM`. Trimmed here rather than in the component, so every
        // consumer sees one shape.
        startTime: row.starts_at ? row.starts_at.slice(0, 5) : null,
        endTime: row.ends_at ? row.ends_at.slice(0, 5) : null,
        room: row.room,
        termId: row.term_id,
        trainerDisplayName: staff.displayName,
      })),
    },
  };
}

/**
 * The trainer assigned across this module's sessions.
 *
 * ⚠️ ONE NAME, AND ONLY WHEN IT IS UNAMBIGUOUS. `A-016` puts assignment at
 * session level, so a module CAN legitimately carry different trainers on
 * different sessions. Screen `27` reassigns the whole module at once, so it
 * may only pre-select a trainer when every session agrees — otherwise the
 * form would silently propose overwriting an arrangement it never showed.
 */
async function readAssignedTrainer(
  client: SupabaseClient,
  sessionIds: readonly string[],
): Promise<{ membershipId: string | null; displayName: string | null }> {
  const none = { membershipId: null, displayName: null };
  if (sessionIds.length === 0) return none;

  const assignments = await readRows<AssignmentRow>("readAssignedTrainer:class_session_assignments", () =>
    client
      .from("class_session_assignments")
      .select("class_session_id, trainer_membership_id")
      .eq("is_active", true)
      .in("class_session_id", sessionIds),
  );
  if (!assignments.ok || assignments.rows.length === 0) return none;

  const distinct = [...new Set(assignments.rows.map((row) => row.trainer_membership_id))];
  // ⛔ MORE THAN ONE, OR FEWER THAN EVERY SESSION, MEANS NO PRE-SELECTION.
  if (distinct.length !== 1 || assignments.rows.length !== sessionIds.length) return none;

  const membershipId = distinct[0];
  const membership = await readMaybeRow<MembershipRow>("readAssignedTrainer:centre_memberships", () =>
    client.from("centre_memberships").select("id, account_id").eq("id", membershipId),
  );
  if (!membership.ok || !membership.rows) return { membershipId, displayName: null };

  const account = await readMaybeRow<AccountRow>("readAssignedTrainer:accounts", () =>
    client.from("accounts").select("id, display_name").eq("id", membership.rows!.account_id),
  );
  return {
    membershipId,
    displayName: account.ok && account.rows ? account.rows.display_name : null,
  };
}

export interface UpdateClassInput {
  readonly classModuleId: string;
  readonly classGradeId: string;
  readonly title: string;
  readonly termId: string | null;
  readonly room: string | null;
  readonly startTime: string | null;
  readonly endTime: string | null;
  readonly trainerMembershipId: string | null;
}

export interface ClassUpdateOutcome {
  readonly moduleChanged: boolean;
  readonly sessionsChanged: number;
  readonly sessionsTotal: number;
  readonly trainerChanged: boolean;
  /** `updated`, `unchanged`, or the first discriminating refusal. */
  readonly reason: string;
}

interface UpdateRpcRow {
  readonly o_changed: boolean | null;
  readonly o_reason: string | null;
}

interface AssignRpcRow {
  readonly o_assignment_id: string | null;
  readonly o_reason: string | null;
}

/**
 * Apply an edit: the module's own fields, then room/times/term across every
 * one of its sessions, then the trainer.
 *
 * ⛔ THE DATE IS NEVER REWRITTEN HERE. `27` applies the SHARED properties
 * across a module's sessions; each session keeps its own date, because
 * changing them all to one date would collapse a term into a single day. A
 * per-session date edit belongs to a session surface, not to this one.
 *
 * ⚠️ N SESSIONS IS N GOVERNED TRANSACTIONS, each with its own audit event —
 * the same shape as creation, and for the same reason: each session is a
 * separate governed record.
 *
 * ⚠️ AN UNCHANGED SAVE IS REPORTED AS SUCH, not as a failure and not as a
 * silent success. `unchanged` reaches the surface so it can say "nothing to
 * save" rather than claiming an edit that never happened.
 */
export async function updateClassCore(
  client: SupabaseClient,
  input: UpdateClassInput,
): Promise<ActionResult<ClassUpdateOutcome>> {
  const moduleCall = await client.rpc("admin_update_class_module", {
    p_class_module_id: input.classModuleId,
    p_class_grade_id: input.classGradeId,
    p_title: input.title,
  });
  if (moduleCall.error) return { outcome: "unavailable" };
  const moduleRow = firstRpcRow<UpdateRpcRow>(moduleCall.data);
  if (!moduleRow) return { outcome: "unavailable" };

  const moduleReason = moduleRow.o_reason ?? "not_permitted";
  if (moduleReason !== "updated" && moduleReason !== "unchanged") {
    return mapUpdateReason(moduleReason);
  }

  const current = await readClassForEditCore(client, input.classModuleId);
  if (!current.ok || !current.rows) return { outcome: "unavailable" };

  let sessionsChanged = 0;
  let trainerChanged = false;
  let firstRefusal = "";
  for (const session of current.rows.sessions) {
    const call = await client.rpc("admin_update_class_session", {
      p_class_session_id: session.classSessionId,
      p_session_date: session.sessionDate,
      p_starts_at: input.startTime,
      p_ends_at: input.endTime,
      p_room: input.room,
      p_term_id: input.termId,
    });
    const row = call.error ? null : firstRpcRow<UpdateRpcRow>(call.data);
    if (row?.o_reason === "updated") sessionsChanged += 1;
    else if (row?.o_reason !== "unchanged" && !firstRefusal) {
      firstRefusal = row?.o_reason ?? "unavailable";
    }

    /*
     * ⛔ REASSIGNMENT USES THE `P2-2b` RPC, which is a DIFFERENT governed
     * action with its own ratified string. It is only called when the choice
     * actually moved: re-asserting the same trainer is a no-op the RPC
     * answers without an event, and calling it anyway would put N pointless
     * round trips behind every save.
     */
    if (input.trainerMembershipId && input.trainerMembershipId !== current.rows.trainerMembershipId) {
      const assign = await client.rpc("admin_assign_session_trainer", {
        p_class_session_id: session.classSessionId,
        p_trainer_membership_id: input.trainerMembershipId,
      });
      const assignRow = assign.error ? null : firstRpcRow<AssignRpcRow>(assign.data);
      if (assignRow?.o_reason === "assigned") trainerChanged = true;
      else if (!assignRow?.o_assignment_id && !firstRefusal) {
        firstRefusal = assignRow?.o_reason ?? "unavailable";
      }
    }
  }

  const moduleChanged = moduleRow.o_changed === true;
  return {
    outcome: "success",
    data: {
      moduleChanged,
      sessionsChanged,
      sessionsTotal: current.rows.sessions.length,
      trainerChanged,
      reason:
        firstRefusal ||
        (moduleChanged || sessionsChanged > 0 || trainerChanged ? "updated" : "unchanged"),
    },
  };
}

function firstRpcRow<T>(data: unknown): T | null {
  const row = Array.isArray(data) ? data[0] : data;
  return (row as T) ?? null;
}

/**
 * ⚠️ THE REFUSAL SIDE COLLAPSES; THE DIAGNOSTIC SIDE DOES NOT — the same
 * split the create path uses. `not_permitted` is one indistinguishable answer
 * to "not management", "nobody", "that module is not yours" and "that grade
 * is not yours".
 */
function mapUpdateReason(reason: string): ActionResult<never> {
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
        message: "Another class at this level already has that name.",
        fields: [{ path: "title", message: "Another class at this level already has that name." }],
      };
    default:
      return { outcome: "unexpected_failure", message: "The operation could not be completed." };
  }
}
