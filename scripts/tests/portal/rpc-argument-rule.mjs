// =====================================================================
// ⛔ DOES EVERY `.rpc()` CALL SITE PASS THE ARGUMENTS THE FUNCTION TAKES?
// =====================================================================
// Operator ruling, 2026-08-16, and the reason is a cost they accepted
// knowingly and named as such:
//
//   "Dropping Functions from AppDatabase is what lets a stale three-arg
//    .rpc() compile. I accepted that trade to remove twelve false errors,
//    and this is its cost surfacing — invisible to compile, visible only
//    on the page. Add a guard for the class, since the type system no
//    longer covers it."
//
// ⛔ THE HAZARD, EXACTLY: changing a function's parameter list is a
//    DROP + CREATE, so the OLD SIGNATURE CEASES TO EXIST. A caller still
//    passing the old argument set compiles cleanly — `AppDatabase` leaves
//    `Functions` permissive by design — and fails at runtime with
//    `PGRST202 Could not find the function … in the schema cache`, which a
//    projection turns into `{ok:false}` and a screen turns into an empty
//    state. ▶ **The same failure shape as screen `23`'s wrong column, one
//    layer over: silent, green in every gate, visible only on the page.**
//
// ▶ SAME REASONING AS `prove:projection-columns`: **the generated types are
//   not the authority, the database is.** This reads each call site's
//   argument set from the SOURCE and compares it against
//   `pg_get_function_arguments` from the LIVE catalogue.
// =====================================================================

/**
 * Every `client.rpc("name", { a: …, b: … })` in a source file.
 *
 * ⚠️ COMMENTS ARE STRIPPED FIRST — the lesson from `extractQueries`, which
 * stopped seeing a query the moment its call site gained an explanatory
 * comment. A parser that punishes documentation gets the documentation
 * removed, which is the wrong repair.
 */
export function extractRpcCalls(rawSource) {
  const source = rawSource
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/^\s*\/\/[^\n]*$/gm, " ");
  const out = [];
  const HEAD = /\.rpc\(\s*"([a-z0-9_]+)"\s*/g;
  for (const m of source.matchAll(HEAD)) {
    let i = m.index + m[0].length;
    if (source[i] === ")") {
      out.push({ fn: m[1], args: [], hadObject: false, dynamic: false });
      continue;
    }
    if (source[i] !== "," ) continue;
    i += 1;
    while (/\s/.test(source[i])) i += 1;
    if (source[i] !== "{") continue;

    /*
     * ⛔ A DEPTH-AWARE SCAN, NOT A NON-GREEDY REGEX. The first draft matched
     * `\{([\s\S]*?)\}` and required each key to start its own line — and the
     * PR-3 control caught it immediately: a SINGLE-LINE multi-key call had only
     * its first key extracted, which would have fired a FALSE `MISSING
     * ARGUMENT` on correct code. ▶ **The lucky orientation again** (§43.1's
     * neighbour): the defect surfaced as a red control rather than as a green
     * sweep over an under-read body.
     *
     * Depth also does the job the line-start rule was reaching for: a nested
     * object's inner keys sit at depth > 1 and are excluded by construction,
     * with no dependence on how the source happens to be wrapped.
     */
    const args = [];
    let depth = 0;
    let dynamic = false;
    let quote = null;
    /*
     * ⛔ A KEY IS RECOGNISED BY POSITION, NEVER BY ITS COLON — and this is the
     * SECOND scanner defect the controls caught, this one on real source. A
     * colon-anywhere rule read the ternaries in
     * `assessment_save_complete_and_open_report`'s call
     * (`hasId ? input.expectedObservationId : null`) as keys, and reported
     * `expectedObservationId` and `null` as UNKNOWN ARGUMENTS against a call
     * site that was entirely correct. ▶ **A false red on correct code is how a
     * gate stops being read** (§12.13), so the over-read matters as much as the
     * under-read PR-3 caught.
     *
     * `expectKey` is true only at the start of the object and immediately after
     * a depth-1 comma — the only two places an object key can legally begin.
     */
    let expectKey = false;
    let j = i;
    for (; j < source.length; j += 1) {
      const ch = source[j];
      if (quote) {
        if (ch === "\\") j += 1;
        else if (ch === quote) quote = null;
        continue;
      }
      if (/\s/.test(ch)) continue;
      if (ch === '"' || ch === "'" || ch === "`") {
        // ⚠️ A QUOTED KEY is skipped by the string scan, so it would be silently
        // under-read. Reported as dynamic — unchecked and SAID to be unchecked.
        if (expectKey && depth === 1) { dynamic = true; expectKey = false; }
        quote = ch;
        continue;
      }
      if (ch === "{" || ch === "[" || ch === "(") {
        // A COMPUTED KEY (`[expr]: v`) is not statically knowable. Detected
        // BEFORE the increment — the first draft tested afterwards, where the
        // branch was unreachable because `[` had already been consumed as a
        // depth change. A dead detector reports no faults, which is
        // indistinguishable from finding none.
        if (ch === "[" && depth === 1 && expectKey) dynamic = true;
        if (depth === 1) expectKey = false;
        depth += 1;
        // Entering the argument object itself: the next token is a key position.
        if (depth === 1) expectKey = true;
        continue;
      }
      if (ch === "}" || ch === "]" || ch === ")") {
        depth -= 1;
        if (depth === 0) break;
        continue;
      }
      if (depth === 1 && ch === ",") { expectKey = true; continue; }
      if (depth !== 1 || !expectKey) continue;
      expectKey = false;
      if (ch === "." && source.slice(j, j + 3) === "...") { dynamic = true; continue; }
      const key = source.slice(j).match(/^([A-Za-z_]\w*)\s*:/);
      if (key) { args.push(key[1]); j += key[0].length - 1; }
    }

    out.push({
      fn: m[1],
      args: [...new Set(args)].sort(),
      hadObject: true,
      // ⚠️ A spread or a computed key means the argument set is not statically
      // knowable. Such a site is REPORTED AS UNCHECKED, never silently passed.
      dynamic,
    });
  }
  return out;
}

/**
 * `pg_get_function_arguments` text -> `{ required, accepted }` input parameters.
 *
 * ⛔ TWO EXCLUSIONS, BOTH LOAD-BEARING:
 *
 *   `OUT` params  — a caller never passes them. Counting them would make every
 *                   CORRECT site look stale, and a gate that reds on correct
 *                   code stops being read (§12.13).
 *   `DEFAULT`     — omitting one is legal, so it is ACCEPTED but not REQUIRED.
 *                   `report_save_edit`'s `p_reaffirm_correction_request_id` and
 *                   all three of `audit_verify_chain`'s are exactly this.
 */
export function inputParams(signatureText) {
  const required = [];
  const accepted = [];
  for (const raw of signatureText.split(",")) {
    const p = raw.trim();
    if (p.length === 0) continue;
    if (/^(OUT|INOUT)\b/i.test(p)) continue;
    const name = (p.replace(/^(IN|VARIADIC)\s+/i, "").match(/^([A-Za-z_]\w*)\s+/) ?? [])[1];
    if (!name) continue;
    accepted.push(name);
    if (!/\bDEFAULT\b/i.test(p)) required.push(name);
  }
  return { required: [...new Set(required)].sort(), accepted: [...new Set(accepted)].sort() };
}

/**
 * @param calls      from `extractRpcCalls`
 * @param signatures Map<fnName, {required, accepted}> from the LIVE catalogue
 * @returns mismatches, each naming what the site passes and what the function takes
 */
export function argumentMismatches(calls, signatures) {
  const bad = [];
  for (const c of calls) {
    if (c.dynamic) continue; // counted and reported by the caller as a stated limit
    const sig = signatures.get(c.fn);
    if (sig === undefined) {
      bad.push({ fn: c.fn, kind: "NO SUCH FUNCTION", passed: c.args, missing: [], extra: [] });
      continue;
    }
    const missing = sig.required.filter((p) => !c.args.includes(p));
    const extra = c.args.filter((p) => !sig.accepted.includes(p));
    if (missing.length > 0 || extra.length > 0) {
      bad.push({
        fn: c.fn,
        kind: missing.length > 0 ? "MISSING ARGUMENT" : "UNKNOWN ARGUMENT",
        passed: c.args,
        missing,
        extra,
      });
    }
  }
  return bad;
}
