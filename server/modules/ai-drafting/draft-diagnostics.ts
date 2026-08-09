import "server-only";

/**
 * Draft-attempt diagnostics — SERVER-ONLY, NEVER PRODUCT STATE.
 *
 * ---------------------------------------------------------------------
 * WHY THIS EXISTS
 * ---------------------------------------------------------------------
 * `request-draft-core` computed `verdict.reasons` — which rule fired, on which
 * panel, for which dimension — and then DISCARDED it, returning only "The
 * generated draft did not match the saved assessment and was rejected." It
 * discarded the rejected panel text too, and the provider's token usage.
 *
 * A fail-closed check whose cause is invisible is a defect, not a safeguard:
 * it is undiagnosable, so it gets worked around instead of fixed. This is the
 * same correction already applied to the fixture loader's error handler and to
 * the secret scan that reported CLEAN because its own query had failed.
 *
 * ---------------------------------------------------------------------
 * THE BOUNDARY IT MUST NOT CROSS (Operator ruling, 2026-08-09)
 * ---------------------------------------------------------------------
 *  * SERVER-SIDE ONLY. This writes to the server's own stderr and returns
 *    nothing. No caller can put it into a response.
 *  * NEVER a client payload. The `ActionResult` shape is untouched, so there
 *    is no field for it to travel in.
 *  * NEVER a parent-facing surface.
 *  * NEVER persisted into a report row — no column, no table, no audit event.
 *    The audit registry stays at 16.
 *
 * It is harness-readable diagnostic output. On a hosted deployment it lands in
 * the platform's runtime logs.
 *
 * ⚠️ It changes NO gate, NO lexicon and NO threshold. Grounding decides
 * exactly what it decided before; this only says so out loud.
 */

/** A distinctive, greppable marker so a run can be isolated in a log stream. */
import { AsyncLocalStorage } from "node:async_hooks";

export const DRAFT_DIAG_MARKER = "BC_DRAFT_DIAG" as const;

export interface DraftAttemptDiagnostic {
  readonly reportId: string;
  readonly attempt: number;
  readonly maxAttempts: number;
  /** `ok` · `grounding_rejected` · `provider_failure` · `malformed` */
  readonly result: string;
  /** Verbatim grounding reasons. Empty unless grounding rejected. */
  readonly reasons?: readonly string[];
  /** The four OD-4 panels the provider returned, accepted or rejected. */
  readonly panels?: Readonly<Record<string, string>>;
  /** The authoritative saved ratings the draft was grounded AGAINST. */
  readonly ratings?: ReadonlyArray<{ readonly dimensionCode: string; readonly rating: string }>;
  readonly usage?: Readonly<Record<string, number>> | null;
}

/**
 * Emit one diagnostic record. Never throws — a diagnostics failure must never
 * take down the drafting path it is observing.
 */
/**
 * Per-request collector.
 *
 * ⚠️ stderr PROVED UNREADABLE. Two deployed runs emitted diagnostics that
 * never appeared in any log view available to the Operator or to
 * `vercel logs`. An instrument whose output cannot be read is not an
 * instrument, so the records are ALSO collected in request scope and can be
 * returned in a RESPONSE BODY by the gated diagnostic route.
 *
 * `AsyncLocalStorage` rather than a module-level array: a module array would
 * bleed between concurrent requests on a warm instance, which is exactly the
 * kind of quiet cross-contamination this project keeps finding.
 */
const collector = new AsyncLocalStorage<DraftAttemptDiagnostic[]>();

/** Run `fn` with collection active, returning both its value and the records. */
export async function collectDraftDiagnostics<T>(
  fn: () => Promise<T>,
): Promise<{ value: T; diagnostics: DraftAttemptDiagnostic[] }> {
  const sink: DraftAttemptDiagnostic[] = [];
  const value = await collector.run(sink, fn);
  return { value, diagnostics: sink };
}

export function emitDraftDiagnostic(record: DraftAttemptDiagnostic): void {
  try {
    collector.getStore()?.push(record);
  } catch {
    // Deliberately silent.
  }
  try {
    // Kept as well as, never instead of: on a platform whose logs ARE
    // readable this is the zero-config channel.
    process.stderr.write(`${DRAFT_DIAG_MARKER} ${JSON.stringify(record)}\n`);
  } catch {
    // Deliberately silent.
  }
}
