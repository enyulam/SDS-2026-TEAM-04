/**
 * Q-28 — the encoding decision, in a module with NO side effects.
 * =====================================================================
 * ⛔ THIS FILE EXISTS BECAUSE IMPORTING THE LOADER RUNS IT.
 *
 * `load-local-fixtures.mjs` calls `main()` at module scope. When
 * `prove:encoding` imported `findLostLiterals` from it to get a control on
 * the real decision function, **the fixture loader executed** — it captured
 * the local API URL and service-role key before the proof's own output
 * appeared. ▶ **Nothing was destroyed, and that was luck rather than
 * design**: that script's other path tears down the three synthetic Auth
 * identities, which only the Operator can recreate with three no-echo
 * passwords, and it would have taken the six walkthrough learners with it.
 *
 * ⚠️ THE LESSON: a module that DOES something on import is not a library,
 * and reaching into one for a single function is how a test harness
 * acquires a destructive side effect nobody wrote down. The decision moved
 * here, where importing it does nothing at all.
 *
 * ⛔ NOTHING IN THIS FILE MAY EXECUTE ON IMPORT.
 */

/**
 * Which of `literals` did NOT come back from the database?
 *
 * This is the whole of the encoding assertion's judgement. It is separated
 * so `prove:encoding` can hand it a corrupted `returned` set and require a
 * non-empty answer — ▶ **an encoding check that has never rejected anything
 * is a comment.**
 */
export function findLostLiterals(literals, returned) {
  return literals.filter((s) => !returned.includes(s));
}

/**
 * Every non-ASCII single-quoted literal in a SQL file. Comments are not
 * excluded deliberately: a comment carrying corrupt bytes is still evidence
 * the file took a bad route, and a false positive here costs one glance.
 */
export function nonAsciiLiterals(sql) {
  return [...sql.matchAll(/'([^']*)'/g)]
    .map((m) => m[1])
    // eslint-disable-next-line no-control-regex
    .filter((s) => /[^\x00-\x7F]/.test(s));
}
