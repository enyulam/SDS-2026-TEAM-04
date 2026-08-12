/**
 * ⛔ A SUITE THAT CANNOT RUN MUST NOT BE ABLE TO REPORT CLEAN.
 *
 * Operator ruling, 2026-08-13, after the defect below was measured:
 *
 *   "Record it as the vacuity class arriving through INFRASTRUCTURE FAILURE
 *    rather than logic — a suite that cannot run must not be able to report
 *    clean."
 *
 * ▶ THE DEFECT, MEASURED NOT HYPOTHESISED. With the Docker daemon stopped,
 * `psql` returned nothing and the `P2-4` runner printed **two PASS lines**:
 *
 *     PASS  the SQL suite ran to completion without an error
 *     PASS  no failing SQL leg (0 FAIL)
 *
 * Both are **trivially true of an empty string** — `/^ERROR/` matches nothing
 * in nothing, and a count of `FAIL` in nothing is zero. Only the pinned
 * executed-count leg caught it, so the runner as a whole failed correctly
 * while two of its legs actively asserted health that had not been measured.
 *
 * ⚠️ THIS IS THE SAME VACUITY CLASS AS A LEG THAT PASSES ON A FIXTURE LACKING
 * THE CASE IT TESTS, arriving by a different road: there, the data was
 * missing; here, the whole database was. **A negative assertion over nothing
 * is free**, however it came to be nothing.
 *
 * ⛔ SHARED, NOT COPIED — 17 runners carried the shape and every one of them
 * calls THIS function. A private copy in each is 17 chances to weaken the one
 * that matters, and it would leave `assertEmittedLegs`'s control guarding a
 * predicate nobody actually runs (the `T-P44c` lesson, applied before being
 * bitten by it).
 */

/**
 * Did the suite actually emit its own legs?
 *
 * @param out    combined stdout+stderr of the psql run
 * @param prefix the suite's leg prefix, e.g. `P26` for `PASS P26-1`
 * @returns `true` only when the output contains at least one leg of this suite
 */
export function emittedLegs(out, prefix) {
  if (typeof out !== "string" || out.trim().length === 0) return false;
  // ⚠️ THE PREFIX MATTERS. A non-empty output is not enough: a docker error is
  // non-empty too. What proves the SUITE ran is that ITS OWN legs appear.
  return new RegExp(`(PASS|FAIL) ${prefix}-`).test(out);
}
