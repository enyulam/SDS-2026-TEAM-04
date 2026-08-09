import "server-only";

/**
 * The bounded generation-attempt cap — SERVER-ONLY.
 *
 * `request-draft-core` runs "one attempt plus ONE retry". That RATIFIED
 * behaviour is UNCHANGED: absent means 2, exactly as before. This only makes
 * the bound configurable so a measurement run can observe the RAW
 * first-attempt verdict without a retry silently masking it.
 *
 * ⚠️ Why that masking matters: if attempt 1 is rejected by grounding and
 * attempt 2 passes, the caller sees success and the rejection is invisible.
 * With `B-G06-DET-1` open — real-provider prose has never been tested against
 * rule 3 in either direction — that is precisely the signal being measured.
 *
 * FAIL-CLOSED ON A BAD VALUE, UNCHANGED ON ABSENCE:
 *   absent                  -> 2, the ratified default. Production is untouched.
 *   "1" or "2"              -> that value.
 *   anything else           -> THROWS.
 *
 * Blank, non-numeric, 0, 3, "two" and " 1 " all throw rather than falling back
 * to 2. Someone who sets this variable is expressing an intent; silently
 * ignoring a malformed one would be the "silent wrong choice" failure this
 * project keeps finding. The ceiling is 2 because raising it would change
 * ratified behaviour rather than make it configurable.
 *
 * ⚠️ Deliberately NOT prefixed `NEXT_PUBLIC_`: the bound must be settable only
 * by whoever starts the server process.
 */

export const DRAFT_MAX_ATTEMPTS_VAR = "BEST_COACH_DRAFT_MAX_ATTEMPTS" as const;

/** The ratified bound: one attempt plus one retry. */
export const RATIFIED_MAX_ATTEMPTS = 2;

export function resolveMaxDraftAttempts(): number {
  const raw = process.env[DRAFT_MAX_ATTEMPTS_VAR];
  if (raw === undefined) return RATIFIED_MAX_ATTEMPTS;
  if (raw === "1") return 1;
  if (raw === "2") return 2;
  throw new Error(
    `[E_SRV_DRAFT_ATTEMPTS] ${DRAFT_MAX_ATTEMPTS_VAR} must be exactly "1" or "2" when set at all`,
  );
}
