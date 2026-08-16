import "server-only";

/**
 * Server-side diagnostics for a REJECTED data query.
 *
 * ---------------------------------------------------------------------
 * ⚠️ WHY THIS EXISTS — a real incident, not a precaution
 * ---------------------------------------------------------------------
 * `listAssignedSessions` read `class_sessions` with
 * `if (error || !data) return []`. Pointed at a database four migrations
 * behind the code, the selected `room` / `lesson_number` / `lesson_title`
 * columns did not exist, PostgREST rejected the query with `42703`, and the
 * Trainer schedule rendered **"no classes"**.
 *
 * ▶ **A REJECTED QUERY BECAME AN EMPTY ROSTER, AND NOTHING ANYWHERE NAMED
 *   THE CAUSE.** The screen made a positive claim — *this trainer has no
 *   sessions* — that it had never established. The operator could not walk
 *   the chain and had no way to see why.
 *
 * ⚠️ It is the same family as every instrument defect found in the hero
 * batch: **an absence reported as a fact when it is really a failure.** It
 * will recur on ANY schema skew, not only this one — which is precisely why
 * the fix is a mechanism rather than a repair of the one call.
 *
 * ---------------------------------------------------------------------
 * ⛔ WHAT THIS MUST NEVER DO
 * ---------------------------------------------------------------------
 * - **Never reach a user-facing surface.** The caller returns the ordinary
 *   non-disclosing `unavailable` outcome; a reader learns only that the view
 *   cannot be shown. Disclosing *why* to a client would leak schema shape,
 *   and R-C2-6 requires every parent-facing denial be indistinguishable.
 * - **Never log a row, a field value, a name, or anything from the caller's
 *   data.** Only the query's own identity and the driver's own error text.
 * - **Never log a credential.** ⚠️ Not by filtering — **by never being given
 *   one.** This function's parameters cannot carry a connection string, a
 *   key or a header; it receives a label and a PostgREST error object. That
 *   is deliberate: pattern-based redaction has now failed **twice** in this
 *   project, most recently by allow-listing key names with a regex that
 *   matched `..._DB_URL`, whose value embeds a password by construction.
 *   ▶ **Allow-list by name; never filter by pattern.**
 */

/** The shape `@supabase/supabase-js` returns in `error`. All fields optional. */
export interface QueryFailure {
  readonly code?: string | null;
  readonly message?: string | null;
  readonly details?: string | null;
  readonly hint?: string | null;
}

/**
 * Record that a query was REJECTED, naming the cause on the server.
 *
 * `context` must be a short, static, developer-authored label identifying the
 * read — never interpolated with data. It is what turns a log line into a
 * diagnosis: `"listAssignedSessions:class_sessions"` says immediately which
 * read failed and against which relation.
 */
export function reportQueryFailure(context: string, failure: QueryFailure | null): void {
  // Four named fields, copied one at a time. ⛔ Never `...failure` — a spread
  // would forward whatever the driver happens to attach next, which is the
  // same "everything matching a shape" mistake that leaked the password.
  console.error(
    "[query-rejected]",
    JSON.stringify({
      context,
      code: failure?.code ?? null,
      message: failure?.message ?? null,
      details: failure?.details ?? null,
      hint: failure?.hint ?? null,
    }),
  );
}

/**
 * The result of a read that can fail — the distinction the old shape lost.
 *
 * ⚠️ `rows: []` and `failed: true` are now DIFFERENT VALUES. A caller cannot
 * accidentally treat a rejection as an empty result, because there is no
 * single value that means both.
 */
export type QueryOutcome<T> = { readonly ok: true; readonly rows: T } | { readonly ok: false };

/**
 * The shape a `@supabase/supabase-js` builder resolves to, **carrying the row
 * type the builder inferred from the schema**.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⛔ `data` WAS `unknown`, AND THAT ONE WORD DEFEATED THE WHOLE TYPED CLIENT
 * ═══════════════════════════════════════════════════════════════════════════
 * Operator ruling, 2026-08-16: *"Type EVERY Supabase client as
 * `SupabaseClient<AppDatabase>`, so a wrong column fails `tsc`."* Typing the
 * clients was necessary and **not sufficient**, and the reason is here.
 *
 * ⚠️ A wrong column does NOT make `supabase-js` raise at the call site. It
 * resolves `data` to a BRANDED ERROR TYPE —
 * `SelectQueryError<"column 'membership_id' does not exist on
 * 'class_session_assignments'.">` — which surfaces only when the data is
 * CONSUMED by property access. ▶ Measured with a three-arm control: the wrong
 * column produced **zero** errors when the result was merely returned or
 * passed along, and `TS2339` naming the column the moment a field was read.
 *
 * ⛔ With `data: unknown`, every builder satisfied this interface, the branded
 * error was discarded at the seam, and the caller then HAND-DECLARED its own
 * `TRow` — so the hand-written interface, which is exactly where the wrong
 * name was typed, was never checked against the schema at all.
 *
 * ▶ Making `data` the generic closes it: an explicit `readRows<AssignmentRow>`
 * now checks that hand-written shape against what the builder really returns,
 * and a `SelectQueryError` is not assignable to it.
 *
 * ⚠️ `screen 23` shipped on this gap — `class_session_assignments.membership_id`
 * (real name `trainer_membership_id`) reached production, failed at runtime
 * with PostgREST `42703`, and rendered an empty Trainers list.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⛔ TWO RESPONSE TYPES, AND THE SPLIT IS THE WHOLE DESIGN
 * ═══════════════════════════════════════════════════════════════════════════
 * ⚠️ MEASURED, NOT REASONED — the first attempt used ONE type for both and
 * both single settings were wrong:
 *
 * - `TRow[] | null` — detection WORKS (`TS2322` on the wrong column), but four
 *   CORRECT `.rpc()` call sites went red, because an `OUT`-parameter function
 *   with `proretset` false resolves to a BARE RECORD, exactly as
 *   `readMaybeRow`'s own body already documented. ▶ **A gate that is red for
 *   false reasons is a gate that gets ignored** (§12.13).
 * - `TRow[] | TRow | null` — the RPC sites pass and ⛔ **DETECTION IS LOST**:
 *   the control's wrong-column arm went GREEN again. *(An earlier draft of this
 *   comment asserted the widening was safe "verified rather than assumed". It
 *   was not verified, it was wrong, and the control caught it — corrected here
 *   in the same pass, §12.11.)*
 *
 * ▶ So the shape is split by what the caller actually reads:
 * **`QueryResponse` — TABLE SELECTS, strictly `TRow[]`**, which is where the
 * defect class lives and where detection must hold; **`RpcResponse` — the
 * bare-or-array RPC shape**, which cannot carry the same guarantee and says so.
 */
interface QueryResponse<TRow> {
  readonly data: TRow[] | null;
  readonly error: QueryFailure | null;
}

/**
 * ⛔ THE LOOSE SHAPE, FOR `.rpc()` ONLY — and it is loose because PostgREST
 * genuinely returns either form, not because it is convenient.
 *
 * ⚠️ **STATED LIMIT: this shape CANNOT catch a wrong column**, because the bare
 * `TRow` position accepts what the strict array position rejects. RPC results
 * are protected by the migration's own apply-time assertions and by each
 * suite's real-caller leg (§26.1's two legs) instead. ▶ Recorded rather than
 * implied, so a later reader does not take an `RpcResponse` call site as
 * carrying the guarantee its neighbour does.
 */
interface RpcResponse {
  readonly data: unknown;
  readonly error: QueryFailure | null;
}

/**
 * Run a read and return a `QueryOutcome` — the ONE place the three cases are
 * decided.
 *
 * ⚠️ THIS EXISTS BECAUSE THE DEFECT WAS A REPEATED SHAPE, NOT A TYPO. Sixteen
 * call sites in this codebase collapsed a rejection into an empty array: two
 * wrote `if (error || !data) return []`, and **fourteen never destructured
 * `error` at all**, so the rejection was discarded before anything could
 * check it. Hand-writing the correct three-case block sixteen times would
 * leave sixteen chances to write it wrong again, and the seventeenth call
 * site would start the cycle over.
 *
 * ▶ **The three cases, decided once:**
 * 1. `error` — the read was REJECTED. Report it, return `{ ok: false }`.
 * 2. `!data` with no error — the driver gave neither rows nor a reason.
 *    ⛔ **This is NOT an empty result.** An emptiness must be OBSERVED before
 *    it may be reported, and nothing here observed one.
 * 3. rows — the only case that may be reported as data, `[]` included.
 *
 * ⚠️ `context` MUST be a short, static, developer-authored label naming the
 * read and the relation (`"listEnrolledStudents:enrolments"`). ⛔ Never
 * interpolate a value into it: it is written to a log, and the whole point of
 * `reportQueryFailure`'s design is that no caller datum can reach that log.
 */
export async function readRows<TRow>(
  context: string,
  run: () => PromiseLike<QueryResponse<TRow>>,
): Promise<QueryOutcome<TRow[]>> {
  const { data, error } = await run();

  if (error) {
    reportQueryFailure(context, error);
    return { ok: false };
  }
  if (data === null || data === undefined) {
    reportQueryFailure(context, {
      code: null,
      message: "the driver returned neither rows nor an error",
    });
    return { ok: false };
  }
  return { ok: true, rows: data as TRow[] };
}

/**
 * ⛔ THE ARRAY-RETURNING RPC COUNTERPART OF `readRows`.
 *
 * ⚠️ IT EXISTS BECAUSE THE TWO HAVE DIFFERENT GUARANTEES, NOT DIFFERENT STYLES.
 * `readRows` takes the builder's INFERRED row type, so a wrong column fails
 * `tsc`. An RPC has no inferred row type here — `AppDatabase` deliberately
 * leaves `Functions` permissive, because the generator renders `Args`
 * non-nullable and `OUT`-parameter `Returns` as `Record<string, unknown>`, and
 * typing them produced twelve FALSE errors (see `server/db/app-database.ts`).
 *
 * ▶ **STATED LIMIT: this helper CANNOT catch a wrong column or a wrong argument.**
 * RPC correctness is carried by §26.1's two legs — the migration EXECUTES the
 * function at apply time, and the paired suite CALLS it as a real authorized
 * caller — which is stronger than any shape check available here.
 *
 * ⛔ Use `readRows` for a TABLE select. Reaching for this one to silence a table
 * error would discard the only guarantee that caught screen `23`'s defect.
 */
export async function readRpcRows<TRow>(
  context: string,
  run: () => PromiseLike<RpcResponse>,
): Promise<QueryOutcome<TRow[]>> {
  const { data, error } = await run();
  if (error) {
    reportQueryFailure(context, error);
    return { ok: false };
  }
  if (data === null || data === undefined) {
    reportQueryFailure(context, {
      code: null,
      message: "the driver returned neither rows nor an error",
    });
    return { ok: false };
  }
  return { ok: true, rows: (Array.isArray(data) ? data : [data]) as TRow[] };
}

/**
 * The same three cases for a read that legitimately yields ZERO OR ONE row —
 * the `→ null` counterpart of the `→ []` shape above.
 *
 * ⚠️ THIS CLOSES A RESIDUE THE SIXTEEN-SITE SWEEP DID NOT REACH. That sweep
 * targeted table reads collapsing a rejection into `[]`. Two governed RPC
 * reads collapsed one into `null` instead — a different shape, the identical
 * defect — and were outside its scope by construction:
 *
 * - `trainer-projections.workingState` — `null` is read by three callers as
 *   *"this student has no report"*. A rejection therefore counted the student
 *   as `no_report` on the schedule, blanked the roster's status, and — worst
 *   — made `continue` skip them in the RETURNED-CORRECTIONS queue, telling a
 *   trainer they had **no corrections outstanding**. ⚠️ The line immediately
 *   above that loop already warned that a rejection *"would silently shorten
 *   the RETURNED-CORRECTIONS queue"* — and guarded the enumeration while the
 *   per-student read beneath it stayed unguarded.
 * - `management-view.gatedReview` — `null` is read as *"not a final-review
 *   candidate"*, so a rejection **dropped a trainer-approved report out of
 *   the management queue**: `"No reports waiting"` while a governed review
 *   step sat unreviewed (A-033).
 *
 * ▶ **`null` here means an OBSERVED absence and nothing else.** A rejection
 * is `{ ok: false }`, and there is no value that can mean both.
 */
export async function readMaybeRow<TRow>(
  context: string,
  run: () => PromiseLike<RpcResponse>,
): Promise<QueryOutcome<TRow | null>> {
  /*
   * ⛔ THE THREE CASES ARE DECIDED HERE RATHER THAN DELEGATED, and only because
   * `readRows` now demands the STRICT array shape this one cannot satisfy. ▶ The
   * SEMANTICS below are unchanged and must stay identical to `readRows`':
   * a rejection is `{ ok: false }`, a driver returning neither rows nor a reason
   * is `{ ok: false }`, and `null` means an OBSERVED absence and nothing else.
   */
  const { data: raw, error } = await run();
  if (error) {
    reportQueryFailure(context, error);
    return { ok: false };
  }
  if (raw === null || raw === undefined) {
    reportQueryFailure(context, {
      code: null,
      message: "the driver returned neither rows nor an error",
    });
    return { ok: false };
  }
  // Mirrors `firstRow`: an RPC may resolve to an array or to a bare object.
  const data: unknown = raw;
  if (Array.isArray(data)) return { ok: true, rows: data.length > 0 ? (data[0] as TRow) : null };
  if (data && typeof data === "object") return { ok: true, rows: data as TRow };
  return { ok: true, rows: null };
}
