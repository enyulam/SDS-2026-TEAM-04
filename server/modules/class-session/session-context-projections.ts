/**
 * Class-session ACADEMIC CONTEXT — hero chain Phase 9.
 *
 * One shared read path for the Class Grade, Class Module and lesson identity
 * of a class session, consumed by `29` Management Reports (Phase 9) and `19`
 * Management Student Report (Phase 10). Built once for the same reason
 * `staff-projections.ts` was: deriving the same three-table join inside two
 * screen phases is the layer-first duplication the plan excludes.
 *
 * ---------------------------------------------------------------------
 * ⚠️ WHY THIS IS A DIRECT READ AND NOT `report_get_canonical_context`
 * ---------------------------------------------------------------------
 * The Phase 0B RPC returns the same four fields and would have been the
 * obvious reuse — but it is gated on `latest_submitted_version_id IS NOT
 * NULL`, because it exists to describe a SUBMITTED report. **Measured at
 * HEAD: two of screen `29`'s three queue modes hold no submitted version at
 * all** — `trainer_approved` awaits final review and `needs_edit` is a
 * correction in flight — so the RPC returns zero rows for exactly the rows
 * this screen is mostly made of.
 *
 * ⛔ THE FIX WAS NOT TO WIDEN THAT GATE. Dropping the submitted-version
 * precondition to serve a column heading would weaken a governed read that
 * three roles share, to solve a problem management does not have. Management
 * already holds its own Step 7G SELECT scope over these tables:
 * `class_sessions_select_management`, `class_modules_select_management`,
 * `class_grades_select_active_member` and their matching grants, all measured
 * present. Reading over the caller's own credential is what every other
 * management projection in this codebase does, and it is the NARROWER
 * instrument here — the exact inverse of `staff-projections.ts`, which needed
 * an RPC precisely because a PARENT has no such scope.
 *
 * ---------------------------------------------------------------------
 * AUTHORIZATION
 * ---------------------------------------------------------------------
 * This module makes no authorization decision and contains no role test.
 * RLS decides, per caller, per row: a session the caller cannot reach is
 * simply ABSENT from the returned map. There is therefore no second copy of
 * an access rule here to drift out of step with the database's.
 *
 * ⛔ WHAT THIS MUST NEVER BECOME
 * - **G-2** — no rating, roll-up, average or derived assessment fact. This
 *   returns identity and scheduling facts only.
 * - **G-4** — there is no term field and there must never be one. A `terms`
 *   table is the substrate End-of-Term generation needs (§8, spec §28), and
 *   G-4 ruled that a display label is not worth building it.
 * - **G-3** — `lessonTitle` is lesson-plan identity. It must never be merged
 *   into, or rendered in place of, the roster's governed carried-over
 *   previous-session focus. Different fields, different authority.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * The academic context of one class session.
 *
 * Every field is nullable-tolerant by construction: `lessonNumber` and
 * `lessonTitle` are optional columns (Phase 0B), and a session the caller
 * cannot see never produces a row at all rather than producing a blank one.
 */
export interface SessionAcademicContextDto {
  readonly sessionId: string;
  readonly classModuleId: string | null;
  readonly classGradeLabel: string | null;
  readonly classModuleTitle: string | null;
  readonly lessonNumber: number | null;
  readonly lessonTitle: string | null;
}

interface SessionContextRow {
  readonly id: string;
  readonly class_module_id: string | null;
  readonly lesson_number: number | null;
  readonly lesson_title: string | null;
  readonly class_modules: {
    readonly id: string;
    readonly title: string | null;
    readonly class_grades: { readonly display_name: string | null } | null;
  } | null;
}

/**
 * Read the academic context of many sessions in one round trip.
 *
 * ⚠️ Fail-soft, deliberately: this is decorative context on surfaces whose
 * governed content has already been authorized and fetched. If the read
 * fails, the caller renders the row WITHOUT its class and lesson labels
 * rather than failing the whole screen — a missing column heading must never
 * be able to hide a report that management is required to review.
 */
export async function getSessionContextsCore(
  client: SupabaseClient,
  sessionIds: readonly string[],
): Promise<ReadonlyMap<string, SessionAcademicContextDto>> {
  const out = new Map<string, SessionAcademicContextDto>();
  const ids = [...new Set(sessionIds)];
  if (ids.length === 0) return out;

  const { data, error } = await client
    .from("class_sessions")
    .select(
      "id, class_module_id, lesson_number, lesson_title, class_modules(id, title, class_grades(display_name))",
    )
    .in("id", ids);

  if (error) return out;

  for (const row of (data ?? []) as unknown as readonly SessionContextRow[]) {
    out.set(row.id, {
      sessionId: row.id,
      classModuleId: row.class_module_id ?? row.class_modules?.id ?? null,
      classGradeLabel: row.class_modules?.class_grades?.display_name ?? null,
      classModuleTitle: row.class_modules?.title ?? null,
      lessonNumber: row.lesson_number ?? null,
      lessonTitle: row.lesson_title ?? null,
    });
  }
  return out;
}
