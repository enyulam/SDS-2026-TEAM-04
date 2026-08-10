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

/** The shape a `@supabase/supabase-js` builder resolves to. */
interface QueryResponse {
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
  run: () => PromiseLike<QueryResponse>,
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
