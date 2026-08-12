#!/usr/bin/env node
// =====================================================================
// P2-1 -- THE COMPOSED SERVER PATH, RUN RATHER THAN INFERRED.
// =====================================================================
// ⛔ THIS FILE EXISTS BECAUSE P1-5 SHIPPED A BROKEN PATH FOR A DAY. That
// phase proved its RPC (11 legs, green) and scanned its surface's text (11
// more) -- and NOTHING RAN THE TYPESCRIPT BETWEEN THEM, which is exactly
// where the defect was.
//
// ▶ THE STANDING RULE IT PRODUCED: a green data proof plus a green source
//   scan is NOT a proof of the path between them. Where a phase adds a read
//   path, a leg must call the COMPOSED CORE with a real session of each
//   role that matters.
//
// P2-1 adds no RPC, so the only thing that could break the path is
// TypeScript: the role gate, the RLS-scoped reads and the joins. That is
// precisely what this runs.
//
// ⚠️ Sessions are ADMIN-MINTED. That is NEVER a sign-in proof and is not
// reported as one.
//
// Run: npm run prove:portal-p2-1-composed
// =====================================================================

import { createClient } from "@supabase/supabase-js";
import { listManagementClassesCore } from "@/server/modules/management-view/projections.ts";
import { listClassModulesCore } from "@/server/modules/class-session/class-list-projections.ts";

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
    type: "magiclink",
    token_hash: link.data.properties.hashed_token,
  });
  return v.error || !v.data?.session ? null : c;
}

const management = await mint("management.fixture@example.test");
const trainer = await mint("trainer.fixture@example.test");
const parent = await mint("parent.fixture@example.test");
check(
  management !== null && trainer !== null && parent !== null,
  "ADMIN-MINTED sessions established for all three roles (NOT a sign-in proof)",
);
if (!management || !trainer || !parent) process.exit(1);

// ---------------------------------------------------------------------
// The two DENIALS first, so the permit below is the control for both.
// ---------------------------------------------------------------------
const asTrainer = await listManagementClassesCore(trainer);
check(
  asTrainer.outcome === "unauthorized",
  `P21c-1  a TRAINER is refused by the composed core (outcome=${asTrainer.outcome})`,
);

const asParent = await listManagementClassesCore(parent);
check(
  asParent.outcome === "unauthorized",
  `P21c-2  a PARENT is refused by the composed core (outcome=${asParent.outcome})`,
);

// ---------------------------------------------------------------------
// ⚠️ THE CONTROL. Re-read as MANAGEMENT *after* the denials, so the two
// refusals are proven to be discrimination rather than a path that answers
// nobody. Same shape as D1a-6.
// ---------------------------------------------------------------------
const asManagement = await listManagementClassesCore(management);
const data = asManagement.outcome === "success" ? asManagement.data : null;
check(
  data !== null && data.classes.length > 0,
  `P21c-3  CONTROL: MANAGEMENT reads ${data?.classes.length ?? 0} class(es) through the SAME composed call (outcome=${asManagement.outcome}) -- the refusals above are discrimination, not blindness`,
);
if (!data) {
  console.log(`\nRESULT: FAIL  (${bad} failed checks)`);
  process.exit(1);
}

check(
  data.grades.length === 3 &&
    data.grades.map((g) => g.code).join(",") === "beginner,intermediate,advanced",
  `P21c-4  the level tabs are the THREE ratified Class Grades in seeded order [${data.grades.map((g) => g.code).join(",")}] -- A-016; the frame's \`Junior\` cannot appear because nothing here can mint a grade`,
);

check(
  data.classes.every((row) => Number.isInteger(row.activeStudentCount) && row.activeStudentCount >= 0) &&
    data.classes.some((row) => row.activeStudentCount > 0),
  "P21c-5  every card carries an integer active-learner count and at least one is non-zero -- the count is measured, not defaulted",
);

check(
  data.classes.some((row) => row.trainerDisplayNames.length > 0),
  "P21c-6  at least one card resolved a trainer through assignment -> membership -> account -- the three-hop label lookup actually works",
);

// ⛔ THE FIELD-SET ASSERTION. C-9 keeps ratings off a LIST surface and G-2
// keeps a roll-up off every surface; this measures the DTO that reaches the
// client rather than trusting the type to have stayed narrow.
const EXPECTED = [
  "activeStudentCount",
  "classGradeCode",
  "classGradeLabel",
  "classGradeSortOrder",
  "classModuleId",
  "title",
  "trainerDisplayNames",
].join(",");
const actual = [...new Set(data.classes.flatMap((row) => Object.keys(row)))].sort().join(",");
check(
  actual === EXPECTED,
  `P21c-7  ⛔ the card DTO carries EXACTLY [${actual}] -- no rating, roll-up, report status, term or lesson-progress field, asserted as an exact set rather than as an absence`,
);

// ---------------------------------------------------------------------
// The gate is the COMPOSED CORE's, and the read beneath it is not broken.
// ⚠️ Without this, P21c-1 is equally consistent with a read that fails for
// everyone and a role gate that never ran.
// ---------------------------------------------------------------------
const trainerRaw = await listClassModulesCore(trainer);
check(
  trainerRaw.ok === true,
  `P21c-8  the UNGATED read still succeeds for a trainer (ok=${trainerRaw.ok}) -- so P21c-1's refusal came from the ROLE GATE, not from a broken read`,
);

console.log(`\nRESULT: ${bad === 0 ? "PASS" : "FAIL"}  (${bad} failed check${bad === 1 ? "" : "s"})`);
process.exit(bad === 0 ? 0 : 1);
