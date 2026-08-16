import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { readMaybeRow, readRows,
  readRpcRows, type QueryOutcome } from "@/server/platform/query-diagnostics";
import type { AppDatabase } from "@/server/db/app-database";

/**
 * `P2-6` — screen `14` Management Lesson Plan Management.
 *
 * ⛔ TWO ACCESS SHAPES, AND THE SPLIT IS MEASURED RATHER THAN STYLISTIC.
 * `class_modules`, `class_grades`, `class_sessions`, `enrolments` and `terms`
 * each carry an `authenticated SELECT` grant, so the class-shaped half is a
 * direct RLS-scoped read (`ADR-3`). `class_session_materials` carries **ZERO
 * policies and ZERO client grants** — measured at HEAD and asserted by
 * migration `M-3` — so materials arrive **only** through the reviewed
 * `SECURITY DEFINER` RPC. A direct `.from("class_session_materials")` here
 * would not be a shortcut; it would return nothing at all.
 *
 * ⛔ NO WRITE LIVES IN THIS FILE. Attach and remove are governed mutations
 * and belong in a server action calling `material_attach_confirm` /
 * `material_remove`; this module is a projection.
 *
 * ---------------------------------------------------------------------
 * ⛔ WHAT THE FRAME DRAWS THAT THIS DELIBERATELY DOES NOT CARRY
 * ---------------------------------------------------------------------
 * * **KEY FOCUS POINTS.** ⛔ RAISED BY THIS PHASE AND DECLINED BY THE
 *   OPERATOR. `D-4` gave the chips a purpose and a position constraint and
 *   named **no author**; there is no authoring surface in the ratified
 *   inventory. Building a read for a field nobody can write yields a
 *   permanently empty panel — worse than absent. ⛔ There is no
 *   `class_sessions.key_focus`, migration assertion `M-6` fails the build if
 *   one appears, and `D-4`'s mention is **not licence** for a later phase.
 *   ⚠️ `observations.focus_chips` IS NOT THIS FIELD — that is the trainer's
 *   POST-session observation, while KEY FOCUS is lesson-plan INTENT (`G-3`).
 * * **"6-week persuasive speaking unit".** `class_modules` has **no
 *   description column**, measured. Schema'ing one from a frame is exactly
 *   what `A-022` bars, and it is the `C-14` family (`Class code`,
 *   `Capacity`, `Program`).
 * * **"Studio 2".** `class_sessions.room` EXISTS — this is **not** a `C-14`
 *   refusal — but it is **NULL on all 17 fixture sessions**. ▶ hero `0B`:
 *   NULL means NOT RECORDED, so the element is OMITTED rather than rendered
 *   as an empty separator or an invented room.
 * * **`LESSON n` and the lesson title.** `G-3` ruled both IN scope and the
 *   columns exist — but both are **NULL on all 17 sessions**, so hero `0B`
 *   omits them and the card's identity falls back to its DATE. ⚠️ An
 *   invented "Lesson 1" is precisely what `0B` forbids.
 */

/** A file attached to one class session. */
export type LessonMaterialDto = {
  readonly materialId: string;
  readonly displayName: string;
  readonly mediaType: string;
  readonly byteSize: number;
  readonly createdAt: string;
};

export type LessonPlanSessionDto = {
  readonly classSessionId: string;
  readonly sessionDate: string;
  readonly startsAt: string | null;
  readonly endsAt: string | null;
  /** ⚠️ NULL means NOT RECORDED (hero `0B`) — the card falls back to its date. */
  readonly lessonNumber: number | null;
  readonly lessonTitle: string | null;
  /** ⚠️ NULL means NOT RECORDED. The frame's "Studio 2" is omitted, never faked. */
  readonly room: string | null;
  readonly termLabel: string | null;
  readonly materials: readonly LessonMaterialDto[];
};

export type LessonPlanDto = {
  readonly classModuleId: string;
  readonly moduleTitle: string;
  readonly classGradeName: string;
  readonly learnerCount: number;
  readonly termLabel: string | null;
  readonly sessions: readonly LessonPlanSessionDto[];
};

type ModuleRow = {
  id: string;
  title: string;
  class_grades: { display_name: string } | { display_name: string }[] | null;
};

type SessionRow = {
  id: string;
  session_date: string;
  starts_at: string | null;
  ends_at: string | null;
  lesson_number: number | null;
  lesson_title: string | null;
  room: string | null;
  terms: { label: string } | { label: string }[] | null;
};

type MaterialRow = {
  o_material_id: string;
  o_display_name: string;
  o_media_type: string;
  o_byte_size: number;
  o_created_at: string;
};

/** Supabase returns an embedded to-one either as an object or a one-element array. */
function one<T>(value: T | T[] | null): T | null {
  if (value === null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

/**
 * The whole screen, in one outcome.
 *
 * ⛔ IT FAILS CLOSED. A refused read is `{ ok: false }`, never an empty
 * lesson list — rendering "no lessons" over a refusal would tell management
 * the module has no schedule when it is merely unreadable (`Q-7`).
 */
export async function readLessonPlansCore(
  client: SupabaseClient<AppDatabase>,
  classModuleId: string,
): Promise<QueryOutcome<LessonPlanDto | null>> {
  const moduleFound = await readMaybeRow<ModuleRow>("readLessonPlansCore.module", () =>
    client
      .from("class_modules")
      .select("id, title, class_grades ( display_name )")
      .eq("id", classModuleId)
      .maybeSingle(),
  );
  if (!moduleFound.ok) return { ok: false };
  // ⚠️ An unknown module and a REFUSED module are different answers, and the
  // caller must be able to tell them apart: this is `null`, not `ok:false`.
  if (moduleFound.rows === null) return { ok: true, rows: null };

  const sessionsFound = await readRows<SessionRow>("readLessonPlansCore.sessions", () =>
    client
      .from("class_sessions")
      .select("id, session_date, starts_at, ends_at, lesson_number, lesson_title, room, terms ( label )")
      .eq("class_module_id", classModuleId)
      .order("session_date", { ascending: true })
      .order("id", { ascending: true }),
  );
  if (!sessionsFound.ok) return { ok: false };

  const learnersFound = await readRows<{ id: string }>("readLessonPlansCore.enrolments", () =>
    client.from("enrolments").select("id").eq("class_module_id", classModuleId).eq("is_active", true),
  );
  if (!learnersFound.ok) return { ok: false };

  /*
   * ⛔ ONE RPC CALL PER SESSION, and that is deliberate rather than lazy.
   * `material_list_for_session` takes a single session id because it is the
   * unit the AUTHORIZATION is resolved over — management on the centre, or a
   * trainer on that specific assignment. A batched variant would have to
   * re-derive that per row inside one call, which is how a read RPC quietly
   * becomes a place authorization can be got wrong.
   */
  const materialsBySession = new Map<string, readonly LessonMaterialDto[]>();
  for (const session of sessionsFound.rows) {
    const found = await readRpcRows<MaterialRow>("readLessonPlansCore.materials", () =>
      client.rpc("material_list_for_session", { p_class_session_id: session.id }),
    );
    if (!found.ok) return { ok: false };
    materialsBySession.set(
      session.id,
      found.rows.map((row) => ({
        materialId: row.o_material_id,
        displayName: row.o_display_name,
        mediaType: row.o_media_type,
        byteSize: row.o_byte_size,
        createdAt: row.o_created_at,
      })),
    );
  }

  const sessions = sessionsFound.rows.map((row) => ({
    classSessionId: row.id,
    sessionDate: row.session_date,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    lessonNumber: row.lesson_number,
    lessonTitle: row.lesson_title,
    room: row.room,
    termLabel: one(row.terms)?.label ?? null,
    materials: materialsBySession.get(row.id) ?? [],
  }));

  return {
    ok: true,
    rows: {
      classModuleId,
      moduleTitle: moduleFound.rows.title,
      classGradeName: one(moduleFound.rows.class_grades)?.display_name ?? "",
      learnerCount: learnersFound.rows.length,
      /*
       * ⚠️ THE HEADER TERM IS THE ONE THE SESSIONS AGREE ON, or NULL.
       * The frame draws a single "Term 1 · 2025" chip, but a module's
       * sessions can legitimately span terms — 4 of the 17 fixture sessions
       * carry no term at all. ▶ Showing the FIRST session's term as if it
       * governed the module would be a claim the data does not make, so
       * disagreement resolves to NULL and the chip is omitted (hero `0B`).
       */
      termLabel: (() => {
        const labels = new Set(sessions.map((s) => s.termLabel));
        return labels.size === 1 ? (sessions[0]?.termLabel ?? null) : null;
      })(),
      sessions,
    },
  };
}
