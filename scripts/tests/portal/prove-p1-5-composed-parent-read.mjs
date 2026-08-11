#!/usr/bin/env node
// =====================================================================
// P1-5 -- THE COMPOSED SERVER PATH, RUN RATHER THAN INFERRED.
// =====================================================================
// ⛔ THIS LEG EXISTS BECAUSE P1-5 SHIPPED A BROKEN PARENT PATH FOR A DAY.
//
// P1-5 proved the RPC (11 SQL legs, all green) and scanned the surface's
// text (11 more). ▶ NOTHING RAN THE TYPESCRIPT BETWEEN THEM -- and that is
// exactly where the defect was: `listEvidenceCore` still carried an early
// `role !== trainer && role !== management -> unauthorized` guard from the
// phase when A-002 was unruled. The parent arm existed in the database,
// was reachable by nobody, and `adapterGetCanonicalReport` turns a failed
// clip read into `unavailable` -- so a linked parent would have been shown
// NO REPORT AT ALL, not merely no clip.
//
// ⚠️ THE LESSON, AND THE REASON THIS FILE IS PERMANENT: a green RPC proof
// plus a green text scan is NOT a proof of the path between them. A stale
// guard in a CALLER silently outranks the corrected function beneath it.
//
// Run: npm run prove:portal-5-composed
// =====================================================================

import { createClient } from "@supabase/supabase-js";
import { listEvidenceCore } from "@/server/modules/evidence/projections.ts";
import { listParentReportsCore } from "@/server/modules/parent-view/projections.ts";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const PUBLISHABLE = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const SERVICE_KEY = process.env.SUPABASE_SECRET_KEY;

let bad = 0;
const check = (ok, msg) => {
  if (!ok) bad++;
  console.log(`${ok ? "PASS   " : "FAIL   "} ${msg}`);
};

if (!SUPABASE_URL || !PUBLISHABLE || !SERVICE_KEY) {
  console.log("FAIL    local Supabase env values are absent");
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

async function mint(email) {
  const link = await admin.auth.admin.generateLink({ type: "magiclink", email });
  if (link.error || !link.data?.properties?.hashed_token) return null;
  const c = createClient(SUPABASE_URL, PUBLISHABLE, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const v = await c.auth.verifyOtp({
    type: "magiclink", token_hash: link.data.properties.hashed_token,
  });
  return v.error || !v.data?.session ? null : c;
}

const parent = await mint("parent.fixture@example.test");
const trainer = await mint("trainer.fixture@example.test");
check(parent !== null && trainer !== null, "ADMIN-MINTED sessions established (NOT a sign-in proof)");
if (!parent || !trainer) process.exit(1);

// The linked pair, resolved through the parent's OWN governed projection —
// never hard-coded, so this leg cannot pass against a fixture that drifted.
// ⚠️ It is also a SECOND composed path exercised for free: if the parent's
// report list is broken, this leg says so instead of reporting a green
// evidence read on a surface nobody can reach.
const list = await listParentReportsCore(parent);
const row = list.outcome === "success" ? list.data[0] : undefined;
check(
  !!row?.sessionId && !!row?.studentId,
  `the fixture parent has a SUBMITTED report to read (outcome=${list.outcome}) -- the legs below are not vacuous`,
);
if (!row) {
  console.log("\nRESULT: FAIL  (no submitted parent report)");
  process.exit(1);
}

// ⛔ THE LEG. The COMPOSED core, called with a real parent session.
const asParent = await listEvidenceCore(parent, row.sessionId, row.studentId);
check(
  asParent.outcome === "success",
  `the COMPOSED core admits a linked PARENT (outcome=${asParent.outcome}) -- the TypeScript guard no longer refuses what the RPC permits`,
);

// ⚠️ ITS CONTROL, IN THE ONE DIRECTION THAT MATTERS. Admitting the parent is
// only correct if the RPC beneath is still doing the gating — so the same
// composed call, aimed at a learner this parent is NOT linked to, must return
// an EMPTY list rather than a refusal-shaped one. (`Q-7`: the two differ.)
const strangerStudent = "00000000-0000-4000-8000-0000000000ff";
const unrelated = await listEvidenceCore(parent, row.sessionId, strangerStudent);
check(
  unrelated.outcome === "success" && unrelated.data.length === 0,
  `and an UNLINKED learner yields zero rows through the same call (outcome=${unrelated.outcome}) -- the gate is the RPC's, not the caller's`,
);

// The trainer path must be unchanged by the correction.
const asTrainer = await listEvidenceCore(trainer, row.sessionId, row.studentId);
check(
  asTrainer.outcome === "success",
  `the TRAINER path is UNCHANGED by the correction (outcome=${asTrainer.outcome}) -- widening for the parent did not narrow anyone`,
);

console.log(`\nRESULT: ${bad === 0 ? "PASS" : "FAIL"}  (${bad} failed check${bad === 1 ? "" : "s"})`);
process.exit(bad === 0 ? 0 : 1);
