import "server-only";

/**
 * ⚠️ TEMPORARY DIAGNOSTIC ROUTE — REMOVE BEFORE THE DEMONSTRATION.
 * Tracked in `docs/progress/STATUS.md` with a removal task.
 *
 * WHY IT EXISTS. Two deployed draft runs emitted `BC_DRAFT_DIAG` records that
 * appeared in NO log view available to the Operator or to `vercel logs`. An
 * instrument whose output cannot be read is not an instrument. This returns
 * the same records in the RESPONSE BODY instead.
 *
 * ---------------------------------------------------------------------
 * WHAT IT DOES NOT DO
 * ---------------------------------------------------------------------
 *  * It NEVER returns a secret VALUE. It reports, per variable, only
 *    `present` and `length`. The single exception is the attempt cap, a
 *    COUNT and not a credential, ruled reportable by the Operator because
 *    the failure mode is a value that looks correct.
 *  * It grants NO authority. It runs the SAME `requestDraft` server action
 *    under the CALLER'S OWN session; a caller with no session gets exactly
 *    what the action gives them. It cannot draft for a report the caller
 *    could not already draft for.
 *  * It is GATED: `BEST_COACH_DIAG_ROUTE` must equal `enabled`, exactly.
 *    Absent, blank or any other value returns 404 — indistinguishable from
 *    the route not existing.
 */

import { NextResponse } from "next/server";
import { requestDraft } from "@/server/modules/report-workflow/actions";
import { collectDraftDiagnostics } from "@/server/modules/ai-drafting/draft-diagnostics";
import { DRAFT_MAX_ATTEMPTS_VAR } from "@/server/modules/ai-drafting/draft-attempts";
import { TRUSTED_TRANSPORT_VAR } from "@/server/modules/ai-drafting/trusted-store-transport";
import { HOSTED_DB_URL_VAR, probeTrustedStoreConnection } from "@/server/modules/ai-drafting/hosted-trusted-store";

const GATE_VAR = "BEST_COACH_DIAG_ROUTE";

/** presence and length ONLY — never a value. */
function shape(name: string) {
  const raw = process.env[name];
  return { name, present: raw !== undefined, length: typeof raw === "string" ? raw.length : 0 };
}

export async function POST(request: Request) {
  if (process.env[GATE_VAR] !== "enabled") {
    return new NextResponse("Not found", { status: 404 });
  }

  let body: { sessionId?: string; studentId?: string; probe?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "sessionId and studentId are required" }, { status: 400 });
  }
  if (body.probe !== "connection" && (!body.sessionId || !body.studentId)) {
    return NextResponse.json({ error: "sessionId and studentId are required" }, { status: 400 });
  }

  const rawCap = process.env[DRAFT_MAX_ATTEMPTS_VAR];

  const environment = {
    // Presence/length only.
    variables: [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      "SUPABASE_SECRET_KEY",
      "LLM_PROVIDER",
      "LLM_MODEL",
      "LLM_API_KEY",
      TRUSTED_TRANSPORT_VAR,
      HOSTED_DB_URL_VAR,
    ].map(shape),
    // The attempt cap is a COUNT, not a credential — Operator-ruled reportable.
    attemptCap: {
      name: DRAFT_MAX_ATTEMPTS_VAR,
      present: rawCap !== undefined,
      json: rawCap === undefined ? null : JSON.stringify(rawCap),
      length: rawCap === undefined ? 0 : rawCap.length,
    },
    region: process.env.VERCEL_REGION ?? null,
  };

  // Connection/privilege probe — NO provider call, NO write, NO spend. This
  // exists so the two untested candidates (pooler reachability from the
  // function's region; the role the connection string carries versus
  // `report_store_draft`'s owner-only EXECUTE) can be settled by measurement
  // instead of by a fit. Diagnosing by burning a billable generation is what
  // this whole run has been trying to stop doing.
  if (body.probe === "connection") {
    const probe = await probeTrustedStoreConnection();
    return NextResponse.json({ environment, probe }, { status: 200 });
  }

  // The SAME action, under the caller's own session. No authority is added.
  const { value, diagnostics } = await collectDraftDiagnostics(() =>
    requestDraft({ sessionId: body.sessionId as string, studentId: body.studentId as string }),
  );

  return NextResponse.json({ environment, result: value, diagnostics }, { status: 200 });
}
