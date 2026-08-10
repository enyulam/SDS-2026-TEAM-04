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
