/**
 * A development-only trace for the ONE question a rendered page cannot answer:
 * **did the save actually dispatch?**
 *
 * ---------------------------------------------------------------------
 * ⚠️ WHY THIS EXISTS — the half of a real defect that could not be measured
 * ---------------------------------------------------------------------
 * The Operator reported that both wording editors "render and accept input"
 * but do not save. Measurement showed every save that REACHED THE SERVER
 * succeeded and persisted. The attempts they described left **no trace of any
 * kind**: no action call, no rejected call, no 4xx, nothing in the dev server
 * log — because a submit that never dispatches produces no server-side record
 * at all.
 *
 * ▶ **Two candidates remained, and NOTHING IN THE SYSTEM COULD SEPARATE THEM:**
 *   1. the Save button never enabled, so the click did nothing; or
 *   2. the component never reached `ready`, so the handler returned early.
 *
 * Guessing between them would have been a repair aimed at an unidentified
 * cause. This makes the difference OBSERVABLE instead, so the next walk
 * measures it.
 *
 * ---------------------------------------------------------------------
 * ⛔ WHAT THIS MUST NEVER CARRY
 * ---------------------------------------------------------------------
 * **Report substance never reaches it, and cannot.** `details` accepts only
 * booleans, numbers, and a narrow set of state strings — there is no shape in
 * which a panel body, a learner's name, a rating, a trainer note, an id, a
 * hash or a token can be passed. ▶ **Nothing to redact, rather than a filter
 * to trust** — the same construction as `server/platform/query-diagnostics.ts`,
 * and for the same reason: pattern-based redaction has failed twice here.
 *
 * It is also **silent in production**: this is a diagnostic for a development
 * walk, not telemetry, and it never leaves the browser.
 */

import type { UiActionResult } from "@/lib/frontend/contracts/result";

/**
 * The permitted string values. ⛔ An arbitrary `string` would be a hole wide
 * enough for a panel body, so the union is CLOSED and `tsc` enforces it —
 * which it already did, rejecting the first version of this file for omitting
 * four ratified outcome labels.
 *
 * ⚠️ The outcome half is DERIVED from the ratified result contract rather than
 * re-typed here. A hand-copied list is a second place for the vocabulary to
 * live, and the two would drift.
 */
export type TraceStateWord =
  | UiActionResult<unknown>["outcome"]
  | "loading"
  | "ready"
  | "failed"
  | "corrected"
  | "reaffirmed";

export type TraceDetails = Readonly<Record<string, boolean | number | null | TraceStateWord>>;

export function makeEditorTrace(surface: "trainer-report-editor" | "management-wording-editor") {
  return function trace(event: string, details: TraceDetails): void {
    if (process.env.NODE_ENV === "production") return;
    console.debug(`[${surface}] ${event}`, details);
  };
}
