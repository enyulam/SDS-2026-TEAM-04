/**
 * Backend action-result contract — the server-side mirror of the frontend's
 * `UiActionResult<T>` (48-hour contract §5.4).
 *
 * The frontend copy lives at `lib/frontend/contracts/result.ts`, which is
 * FRONTEND-OWNED (contract §7.2) — the backend must not import from or write
 * to it. The two shapes are intentionally identical, field for field, so the
 * frontend port maps backend results 1:1 at integration time. Any divergence
 * between the two files is a §9 blocker, not something either side patches
 * locally.
 *
 * Error discipline (Step 7I baseline §8.6, restated in contract §5.4): no
 * message interpolates row content, an unpublished content hash, a correction
 * reason, a credential or an environment value. `unauthorized` and
 * `unavailable` are byte-indistinguishable between "no such report" and
 * "not permitted".
 */

export type ActionFieldError = { readonly path: string; readonly message: string };

export type ActionResult<T> =
  | { readonly outcome: "success"; readonly data: T }
  | {
      readonly outcome: "validation";
      readonly message: string;
      readonly fields: readonly ActionFieldError[];
    }
  | { readonly outcome: "unauthenticated" }
  | { readonly outcome: "unauthorized" }
  | { readonly outcome: "unavailable" }
  | { readonly outcome: "stale_state"; readonly message: string }
  | {
      readonly outcome: "generation_failure";
      readonly retryable: boolean;
      readonly message: string;
    }
  | { readonly outcome: "retryable_failure"; readonly message: string }
  | { readonly outcome: "unexpected_failure"; readonly message: string };

/**
 * Map an authored SQLSTATE (the Step 7I 'BC' class plus the assessment
 * migration's BC1xx codes) to the shared result union.
 *
 * The mapping is deliberately COARSE on the authorization side: BC001 and
 * BC101 are already non-disclosing in the database, and the action layer
 * must not re-derive detail the database refused to disclose.
 */
export function mapSqlErrorToResult(code: string | undefined, message?: string): ActionResult<never> {
  switch (code) {
    // -- not found / not permitted (byte-identical by design) ------------
    case "BC001": // report: not found or not permitted
    case "BC101": // assessment: not found or not permitted
    case "BC201": // attendance: not found or not permitted
      return { outcome: "unauthorized" };

    // -- authorized, nothing to show ------------------------------------
    case "BC002":
      return { outcome: "unavailable" };

    // -- CAS / concurrency ----------------------------------------------
    case "BC003": // report stale state
    case "BC112": // observation stale state
    case "BC203": // attendance stale state (in either direction, incl. existence)
      return { outcome: "stale_state", message: "This changed while you were working. Reload and try again." };
    case "BC014": // report duplicate
    case "BC113": // observation duplicate
      return { outcome: "stale_state", message: "This was already created. Reload to continue from the current state." };

    // -- illegal transition / gates -------------------------------------
    case "BC004": // illegal transition
    case "BC011": // prior approval on target version
    case "BC012": // checklist Gate A
    case "BC013": // checklist Gate B
    case "BC024": // report already holds a version
      return { outcome: "stale_state", message: "This report is no longer in a state that allows that action. Reload to continue." };

    // -- validation-shaped authored errors ------------------------------
    case "BC005":
      return { outcome: "validation", message: "Complete all three checklist items before approving.", fields: [] };
    case "BC015":
      return { outcome: "validation", message: "The student is not recorded present for this session.", fields: [] };
    case "BC016":
    case "BC103":
    case "BC202": // attendance: no active enrolment
      return { outcome: "validation", message: "No active enrolment exists for this student and module.", fields: [] };

    // -- attendance: the ONE governed refusal (A-026) ---------------------
    // Deliberately its own authored message rather than a generic staleness
    // one: nothing has drifted and reloading changes nothing. Marking a
    // submitted report's student absent is a governed CORRECTION, and the
    // trainer needs to be told that, not told to reload.
    case "BC204":
      return {
        outcome: "validation",
        message:
          "This student's report has already been submitted. Changing attendance to absent is a governed correction, not a status change.",
        fields: [],
      };
    case "BC205": // attendance: no new status supplied
      return { outcome: "validation", message: "The request was not valid.", fields: [] };

    // -- source map: shape and write-once (owner-only writer) ------------
    // These are reachable ONLY from the trusted generation-completion
    // channel, never from a client, so they are integrity incidents rather
    // than user-correctable validation problems. They must NOT be reported
    // as a draft-generation failure, because the draft was already accepted
    // by grounding when they fire.
    case "BC301":
    case "BC302":
    case "BC303":
    case "BC304":
    case "BC305":
    case "BC306":
    case "BC307":
      return { outcome: "unexpected_failure", message: "The operation could not be completed." };
    case "BC017":
    case "BC104":
      return { outcome: "validation", message: "The scheduled session start has not been reached.", fields: [] };
    case "BC018":
      return { outcome: "validation", message: "All nine dimensions must be rated before continuing.", fields: [] };
    case "BC020":
      return { outcome: "validation", message: "The report content is incomplete.", fields: [] };
    case "BC021":
      return { outcome: "validation", message: "An unchanged report can only be saved as an explicit reaffirmation of the open correction request.", fields: [] };
    case "BC022":
    case "BC025":
      return { outcome: "validation", message: "The request was not valid.", fields: [] };
    case "BC023":
      return { outcome: "stale_state", message: "A correction request is already open for this report." };
    case "BC102":
      return { outcome: "validation", message: "The student is not recorded present for this session.", fields: [] };
    case "BC105":
    case "BC106":
    case "BC107":
    case "BC108":
    case "BC109":
    case "BC110":
    case "BC111":
      return { outcome: "validation", message: "The assessment payload was not valid. All nine dimensions must carry one governed rating each.", fields: [] };

    // -- caller-render staleness ----------------------------------------
    case "BC006": // caller content-hash mismatch
    case "BC008": // wording-hash mismatch
    case "BC019": // observation lock-version mismatch
      return { outcome: "stale_state", message: "The content you reviewed is no longer current. Reload and review again." };

    // -- data-integrity incidents (never disclose detail) ----------------
    case "BC007":
    case "BC010":
    case "BC009":
    case "BC114":
      return { outcome: "unexpected_failure", message: "The operation could not be completed." };

    default:
      // Transport-level failures (network, PostgREST unavailable) are the
      // retryable class; anything else is unexpected. The raw driver message
      // is NEVER forwarded — it may embed SQL or row content.
      if (message && /fetch failed|ECONNREFUSED|ETIMEDOUT|network/i.test(message)) {
        return { outcome: "retryable_failure", message: "The service is temporarily unreachable. Try again." };
      }
      return { outcome: "unexpected_failure", message: "The operation could not be completed." };
  }
}
