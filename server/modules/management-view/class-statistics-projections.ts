import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppDatabase } from "@/server/db/app-database";

import {
  readClassHealthCore,
  readClassStatusRowsCore,
  type ClassOverviewRowDto,
} from "@/server/modules/class-session/class-overview";

/**
 * `P2-16` — screen `16` Management Class Statistics.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ✅ NO NEW FUNCTION, NO NEW GRANT — §12.10 FOR THE SIXTH PHASE RUNNING
 * ═══════════════════════════════════════════════════════════════════════════
 * The batch pre-approves read-side `SECURITY DEFINER` functions and their
 * minimum matching grants. ▶ **This phase adds NONE.** Two governed reads
 * already shipped answer everything this screen is permitted to show:
 *
 *   · `report_class_health_summary(p_class_module_id)` — built at `P2-4`,
 *     returns `main_follow_up_area` as **one string, computed inside the
 *     database**, under the Operator's ruling that *"minimise what crosses the
 *     boundary, not what is displayed."*
 *   · `report_list_management_class_status(p_class_module_id)` — the
 *     per-session, per-learner status grid behind `A-038`'s row gating.
 *
 * ⚠️ **AND REUSING THE FIRST IS MANDATORY, NOT MERELY ECONOMICAL.**
 * `CLAUDE.md` §6 says so in terms: Management Insight's slot 1 *"reuses the
 * exact same computation as Class Overview's 'Main follow-up area' … Same
 * underlying fact stated consistently on both screens, **never computed two
 * different ways**."* ▶ A second read here would have been a second answer to
 * the same question, and the two screens would eventually disagree.
 *
 * ⛔ **RETURNING THE UNDERLYING `focus_chips` FOR A "RICHER BREAKDOWN" IS
 * PROHIBITED** and is a §12 stop-and-ask, not an enhancement — the constraint
 * `P2-4` recorded on this function, carried forward unchanged.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⛔ ALL THREE CARDS THE FRAME DRAWS ARE REFUSED
 * ═══════════════════════════════════════════════════════════════════════════
 * 1. ⛔ **Skill Averages** — the nine dimensions as labelled percentage bars,
 *    subtitled *"Class average across rubric criteria — Term 1"*. `GC-6` on
 *    **`C-9`** (a statistics surface is not a report DETAIL surface) and on
 *    **`G-2`** — a class average across children **is** the roll-up.
 * 2. ⛔ **Ongoing Performance** — a donut reading **`82% avg`**, legended
 *    `Mastering 15 · Mastered 8 · Developing 6 · Beginning 3`. ▶ **The four
 *    ratified rating labels rendered as values**, and `82% avg` is `G-2`'s
 *    roll-up **and** `D-2`'s *"never rendered as a number to any role."*
 * 3. ⛔ **Student Breakdown's `Strongest` / `Focus area` / `Overall`** — `G-2`
 *    names those exact limbs; a rating chip **per child in a comparison table**
 *    is `C-9`'s stated harm verbatim. (`Student ID` has no column either — the
 *    fifth screen to draw it.)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ✅ AND TWO PANELS THE FRAME OMITS ARE BUILT, BY RULING
 * ═══════════════════════════════════════════════════════════════════════════
 * `GC-10` records that the frame omits **Management Insight** and **Students
 * Needing Follow-up**, both mandated by `CLAUDE.md` §6. **`C-17` rules it:**
 * *"GOVERNANCE WINS. Build the two panels `CLAUDE.md` mandates. Record them as
 * governance-mandated additions the frame omits, cited."*
 *
 * ⛔ **NEITHER MAY EVER BE AI-AUTHORED PROSE.** Generating this text would
 * silently pull the §8-deferred Weekly Class Health Brief into scope. Slot 1 is
 * a database aggregate; slot 3 is a **fixed nine-row lookup**; the table is a
 * status filter. No model is involved at any point.
 *
 * ⏸ **SLOT 2 IS HELD — see `insightTrendHeld`.** It is the one open item on
 * this screen and it is one sentence wide.
 */

/** ⛔ `CLAUDE.md` §6's lookup table, verbatim. Nine rows, no tenth, no default prose. */
const RECOMMENDED_ACTION: Readonly<Record<string, string>> = {
  body: "Incorporate posture and gesture awareness activities into the next lesson.",
  emotion: "Add facial-expression practice, such as mirroring exercises, to the next lesson.",
  speech: "Review sentence structure and clarity techniques in the next lesson.",
  tonality: "Include vocal tone and pitch-control exercises in the next lesson.",
  eye_contact: "Include partner-facing eye contact practice in the next lesson.",
  vocal_projection:
    "Add projection exercises, such as speaking to the back of the room, to the next lesson.",
  emotional_expression: "Incorporate emotional-expression role-play into the next lesson.",
  sentence_flow: "Review pacing and sentence-flow techniques in the next lesson.",
  audience_awareness:
    "Add audience-awareness exercises, such as varying delivery for different listeners, to the next lesson.",
};

const DIMENSION_LABEL: Readonly<Record<string, string>> = {
  body: "Body",
  emotion: "Emotion",
  speech: "Speech",
  tonality: "Tonality",
  eye_contact: "Eye Contact",
  vocal_projection: "Vocal Projection",
  emotional_expression: "Emotional Expression",
  sentence_flow: "Sentence Flow",
  audience_awareness: "Audience Awareness",
};

/**
 * ⚠️ **THE TAG IS NOT A DIMENSION CODE, AND ASSUMING IT WAS WOULD HAVE SHIPPED
 * A SILENTLY EMPTY PANEL.** Measured live: `observations.focus_chips` holds
 * **free display text** — `"Vocal projection"`, `"Eye contact"` — and
 * `strength_chips` holds things that are not dimensions at all
 * (`"Clear structure"`, `"Confident posture"`). ▶ The nine dimension **codes**
 * are `body … audience_awareness`, so a `code in TABLE` lookup would have
 * matched **nothing**, every time, and rendered a panel with its first sentence
 * missing — with no error anywhere.
 *
 * ⛔ §6's slot-1 sentence is *"[**Dimension**] remains the main follow-up
 * area"*, so a tag that is not one of the nine may never be rendered into that
 * slot: doing so would assert the tag is a dimension. The match is on the
 * canonical display name, case- and space-insensitive, and **fails closed**.
 */
function resolveDimensionKey(tag: string | null): string | null {
  if (tag === null) return null;
  const normal = tag.trim().toLowerCase().replace(/[\s_]+/g, "");
  return (
    Object.keys(DIMENSION_LABEL).find(
      (key) => DIMENSION_LABEL[key].toLowerCase().replace(/[\s_]+/g, "") === normal,
    ) ?? null
  );
}

export interface ClassStatisticsDto {
  readonly classModuleId: string;
  readonly classLabel: string;
  readonly enrolledCount: number;
  readonly assessedCount: number;
  readonly submittedCount: number;
  /**
   * ⛔ SLOT 1, and it is a DIMENSION LABEL — never a rating, never a score.
   * NULL when no submitted report carries an improvement-focus tag, in which
   * case the whole sentence is omitted rather than rendered empty (hero `0B`).
   */
  readonly mainFollowUpDimension: string | null;
  /** ⛔ SLOT 3 — looked up from slot 1. NULL exactly when slot 1 is NULL. */
  readonly recommendedAction: string | null;
  /**
   * ✅ SLOT 2 — BUILT 2026-08-16 BY OPERATOR RULING. Previously held.
   *
   * ⛔ THE RULING'S REASONING, RECORDED HERE SO A LATER PHASE DOES NOT READ
   * §6's MANDATE AS THE ONLY GROUND: *"Its input is ratings across children;
   * its output is a dimension name and never a value. That is `D-2`'s exact
   * structure and `D-2` is permitted on precisely that ground: the aggregation
   * happens server-side and no rating, band or number is rendered. `G-2` bars
   * a roll-up RATING. A dimension name is not a rating — it names where
   * attention goes, not how anyone performed."*
   *
   * ▶ **The permission rests on the SHAPE, not on §6.** A future slot
   * mandating a NUMBER would not inherit this ruling.
   *
   * ⛔ A DIMENSION LABEL. NULL when there is no improving dimension.
   */
  readonly improvedDimension: string | null;
  /**
   * §6's own floor: *"If fewer than 2 sessions of **submitted** data exist in
   * range, this sentence is replaced with 'Not enough session data yet to
   * identify a trend.'"* ⚠️ Carried as the COUNT so the screen can tell the
   * three cases apart — and so a refusal (which returns no row at all) is
   * never mistaken for "not enough data".
   */
  readonly trendSessionsConsidered: number | null;
  /**
   * ⛔ `Students Needing Follow-up`, selected by REPORT STATUS.
   *
   * ⚠️ `CLAUDE.md` §6 mandates this table and pins `A-038`'s row-action gating
   * to it, but **never says what makes a learner "need follow-up."** ▶ A STATUS
   * reading needs no ruling and is the natural one: `A-038` gating is *about
   * report status*, and pinning it here only makes sense if the rows are
   * selected by status. ⛔ A RATING-based selection would be `C-9` and is not
   * built.
   */
  readonly followUpRows: readonly ClassOverviewRowDto[];
}

export async function readClassStatisticsCore(
  client: SupabaseClient<AppDatabase>,
  classModuleId: string,
): Promise<{ readonly ok: true; readonly data: ClassStatisticsDto } | { readonly ok: false }> {
  const [moduleRow, enrolments, health, statusRows, improved] = await Promise.all([
    client.from("class_modules").select("id, title, class_grade_id").eq("id", classModuleId).maybeSingle(),
    client.from("enrolments").select("student_id").eq("class_module_id", classModuleId).eq("is_active", true),
    readClassHealthCore(client, classModuleId),
    readClassStatusRowsCore(client, classModuleId),
    /*
     * ⛔ SLOT 2. `RETURNS TABLE(...)` → `proretset = true` → PostgREST sends an
     * ARRAY, so the row is taken at [0]. ⚠️ ZERO ROWS IS THE REFUSAL SIGNAL
     * and resolves to `null`/`null` — deliberately NOT to "0 sessions", which
     * would render §6's *"not enough session data"* over a class the caller
     * could not read at all (`Q-7`).
     */
    client.rpc("report_class_improved_dimension", { p_class_module_id: classModuleId }),
  ]);

  const mod = moduleRow.data as { id: string; title: string; class_grade_id: string } | null;
  if (mod === null) return { ok: false };

  const grade = await client
    .from("class_grades")
    .select("display_name")
    .eq("id", mod.class_grade_id)
    .maybeSingle();
  const gradeLabel = ((grade.data as { display_name: string } | null)?.display_name ?? "").trim();

  const rows = statusRows.ok ? statusRows.rows : [];

  const rawTag = health.ok && health.rows !== null ? health.rows.mainFollowUpArea : null;
  const dimensionKey = resolveDimensionKey(rawTag);

  /*
   * ⛔ SLOT 2's CODE IS A `dimension_code` ENUM, not a display phrase — the
   * OPPOSITE of slot 1's `focus_chips` free text. ⚠️ They are two different
   * shapes reaching the same nine dimensions, and collapsing them into one
   * resolver would have made one of them silently wrong.
   */
  /*
   * ⚠️ NARROWED THROUGH `Array.isArray`, NOT INDEXED BLIND. `AppDatabase` leaves
   * `Functions` permissive on purpose (see `server/db/app-database.ts`), so an
   * RPC's `data` is `unknown` here — and `unknown[0]` is exactly the silent
   * shape assumption this project keeps paying for. The guard makes the
   * assumption explicit and fails toward NO ROW rather than toward a wrong one.
   */
  const improvedRows = Array.isArray(improved.data)
    ? (improved.data as { improved_dimension: string | null; sessions_considered: number }[])
    : [];
  const improvedRow = improvedRows[0];
  const improvedKey =
    improvedRow?.improved_dimension != null && improvedRow.improved_dimension in DIMENSION_LABEL
      ? improvedRow.improved_dimension
      : null;

  return {
    ok: true,
    data: {
      classModuleId: mod.id,
      classLabel: [gradeLabel, mod.title].filter((v) => v.length > 0).join(" · "),
      enrolledCount: ((enrolments.data ?? []) as unknown[]).length,
      assessedCount: rows.filter((r) => r.reportId !== null).length,
      submittedCount: rows.filter((r) => r.reportState === "submitted").length,
      mainFollowUpDimension: dimensionKey === null ? null : DIMENSION_LABEL[dimensionKey],
      recommendedAction: dimensionKey === null ? null : RECOMMENDED_ACTION[dimensionKey],
      improvedDimension: improvedKey === null ? null : DIMENSION_LABEL[improvedKey],
      trendSessionsConsidered: improvedRow === undefined ? null : improvedRow.sessions_considered,
      /*
       * ⛔ "NEEDING FOLLOW-UP" = STARTED BUT NOT SUBMITTED. A learner with no
       * report at all is NOT here: `CLAUDE.md` §6 says a `No Report` row gets
       * no action button, so listing one in a follow-up table would put a row
       * on screen whose only possible action is "—".
       */
      followUpRows: rows.filter((r) => r.reportId !== null && r.reportState !== "submitted"),
    },
  };
}
