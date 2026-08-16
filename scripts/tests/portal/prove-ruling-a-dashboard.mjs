#!/usr/bin/env node
// =====================================================================
// RULING A -- ENROLLED, NOT CENTRE-RESIDENT; AND ONE PARAMETER GONE.
// =====================================================================
// ⛔ THE OPERATOR'S AUTHORIZATION WAS ITS OWN BOUNDARY: *"forward migration
//    dropping `o_assessed_students` ... and Total Students changed to count
//    ENROLLED learners rather than centre-resident students. **No table,
//    column, enum, policy, grant or audit string. Registry unmoved.**"*
//
// ⚠️ THE HARD PART IS NOT THE DROP, IT IS THE RENAME-THAT-ISN'T. `totalStudents`
//    KEPT ITS NAME AND CHANGED ITS MEANING, and the two readings were
//    **IDENTICAL AT HEAD -- both 13**. ▶ A suite that asserted "total students
//    is 13" would pass on BOTH the old and the new function and would prove
//    nothing at all. The legs below therefore assert the DIVERGENCE directly:
//    they construct the case where enrolled and resident differ, and require
//    the function to follow ENROLLED.
//
// ⛔ EXIT CODE IS THE ONLY VERDICT.
//
// Run: npm run prove:ruling-a
// =====================================================================

import { createClient } from "@supabase/supabase-js";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { assertConfigProjectId, resolveLocalTarget } from "../../fixtures/local-target-guard.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const { projectId: PROJECT_ID, dbContainer: DB_CONTAINER } = resolveLocalTarget();
assertConfigProjectId(
  (readFileSync(join(ROOT, "supabase", "config.toml"), "utf8").match(/^\s*project_id\s*=\s*"([^"]+)"/m) ?? [])[1] ?? "",
  PROJECT_ID,
);

let failures = 0;
const check = (ok, msg) => {
  if (!ok) failures += 1;
  console.log(`${ok ? "PASS" : "FAIL"}    ${msg}`);
};
const psql = (sql) =>
  (spawnSync("docker", ["exec", "-i", DB_CONTAINER, "psql", "-U", "postgres", "-d", "postgres", "-tAX", "-c", sql], {
    encoding: "utf8",
  }).stdout ?? "").trim();

// ---------------------------------------------------------------------
// RAa-0 -- NON-VACUITY.
// ---------------------------------------------------------------------
const resident = Number(psql("SELECT count(*) FROM public.students;"));
const enrolled = Number(psql("SELECT count(DISTINCT student_id) FROM public.enrolments WHERE is_active;"));
check(
  resident > 0 && enrolled > 0,
  `RAa-0  NON-VACUITY: the fixture holds ${resident} centre-resident learner(s) and ${enrolled} actively-enrolled learner(s) — a zero on either side would make the divergence legs below unmeasurable`,
);

// ---------------------------------------------------------------------
// RAa-1 -- THE SIGNATURE. Three OUT integers, and `assessed` is gone.
// ---------------------------------------------------------------------
const args = psql(
  "SELECT pg_get_function_arguments(p.oid) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname='report_centre_dashboard_summary';",
);
check(
  args !== "" && !args.includes("o_assessed_students") && (args.match(/OUT /g) ?? []).length === 3,
  `RAa-1  ⛔ THE LIVE CATALOGUE carries exactly THREE OUT integers and no o_assessed_students — "${args}". ▶ Read from the catalogue, not from the migration file: a migration that failed to apply would still contain the right text`,
);

// ---------------------------------------------------------------------
// RAa-2 -- THE DIVERGENCE. This is the leg that could not be written as
//          "total students is 13", because both readings ARE 13.
// ---------------------------------------------------------------------
/*
 * ⛔ CONSTRUCTED, MEASURED AND ROLLED BACK IN ONE TRANSACTION. A learner is
 * withdrawn (`is_active = false`), the function is called AS THE MANAGEMENT
 * ACCOUNT, and the reading must DROP. ▶ The old function read `students` and
 * would have been UNMOVED by exactly this change — which is the whole ruling,
 * and the only way to prove it is to make the two numbers differ.
 *
 * ⚠️ `ROLLBACK`, always. The fixture is left exactly as found.
 */
const MGMT = "d0000000-0000-4000-8000-000000000001";
const TRAINER = "d0000000-0000-4000-8000-000000000002";
const claims = (sub) => `{"sub":"${sub}","role":"authenticated"}`;

/*
 * ⛔ ONE TRANSACTION, ROLLED BACK. A learner is withdrawn, the function is
 * called AS THE MANAGEMENT PRINCIPAL, and the reading must DROP while
 * `public.students` stays put.
 *
 * ⚠️ THE FIRST DRAFT USED `RAISE NOTICE` INSIDE A `DO` BLOCK AND MEASURED
 * NOTHING -- notices go to STDERR, `psql -tAX` returned the literal "DO", and
 * two legs failed against a database that was answering correctly. ▶ The values
 * are now emitted as LABELLED ROWS on stdout, which is the channel this runner
 * actually reads.
 *
 * ⚠️ AND THE WITHDRAWAL MUST SET `withdrawn_at`, WHICH THIS TEST LEARNED FROM
 * THE SCHEMA REFUSING IT: `enrolments_active_timestamp_chk` rejects an inactive
 * row with a NULL `withdrawn_at`. ▶ A worthwhile finding in its own right --
 * **the database will not let a withdrawal be recorded as a bare flag flip**,
 * so the state the ruling excludes cannot exist without its timestamp.
 */
const divergence = psql(`
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '${claims(MGMT)}', true);
SELECT 'BEFORE=' || o_total_students FROM public.report_centre_dashboard_summary();
RESET ROLE;
UPDATE public.enrolments SET is_active = false, withdrawn_at = pg_catalog.now()
 WHERE student_id = (SELECT student_id FROM public.enrolments WHERE is_active LIMIT 1);
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '${claims(MGMT)}', true);
SELECT 'AFTER=' || o_total_students FROM public.report_centre_dashboard_summary();
RESET ROLE;
SELECT 'RESIDENT=' || count(*) FROM public.students;
ROLLBACK;
`);
/*
 * ⚠️ NO TEMP TABLE. The first attempt stashed the readings in one, and
 * `CREATE TEMP TABLE` runs as `postgres` while the reads must run as
 * `authenticated` -- so the INSERT was refused with *"permission denied for
 * table _m"*. ▶ Labelled rows on stdout need no privilege at all, and each
 * value is emitted by the very statement that produced it.
 */
const grab = (k) => {
  const m = divergence.match(new RegExp(`^${k}=(\\d+)$`, "m"));
  return m ? Number(m[1]) : NaN;
};
const seen = [grab("BEFORE"), grab("AFTER"), grab("RESIDENT")];
check(
  seen.every(Number.isFinite) && seen[1] === seen[0] - 1 && seen[2] === resident,
  `RAa-2  \u26d4 THE DIVERGENCE IS REAL: withdrawing ONE learner moved the tile ${seen[0] ?? "?"} \u2192 ${seen[1] ?? "?"} while public.students stayed at ${seen[2] ?? "?"} (resident = ${resident}). \u25b6 The OLD function read \`students\` and would have been UNMOVED by exactly this change \u2014 so this leg FAILS against the pre-ruling function and passes only against the new one. **It could not have been written as "total students is 13", because both readings were 13**`,
);
check(
  Number(psql("SELECT count(DISTINCT student_id) FROM public.enrolments WHERE is_active;")) === enrolled,
  `RAa-2b and THE ROLLBACK HELD \u2014 active enrolments back to ${enrolled}. A proof that mutates the fixture is a proof nobody can safely re-run`,
);

// ---------------------------------------------------------------------
// RAa-3 -- IT STILL FAILS CLOSED. A trainer reads NULL, not 0.
// ---------------------------------------------------------------------
const trainerRead = psql(`
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '${claims(TRAINER)}', true);
SELECT coalesce(o_total_students::text, 'NULL') FROM public.report_centre_dashboard_summary();
ROLLBACK;
`);
check(
  /\bNULL\b/.test(trainerRead),
  `RAa-3  \u26d4 A TRAINER READS \`NULL\`, NOT \`0\` \u2014 the fail-closed refusal survives the rewrite. \u25b6 Zero would render as a centre with no learners, which is a DIFFERENT and FALSE statement (Q-7). Saw: ${JSON.stringify(trainerRead.trim())}`,
);
check(
  !/^\s*0\s*$/m.test(trainerRead),
  "RAa-3b CONTROL on the leg above: the trainer's reading is not the string `0` either, so RAa-3 is discriminating between a refusal and an empty centre rather than matching any falsy-looking output",
);

// ---------------------------------------------------------------------
// RAa-4 -- THE AUTHORIZATION'S BOUNDARY, re-measured AFTER the migration.
// ---------------------------------------------------------------------
const census = psql(
  "SELECT (SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE')||'|'||(SELECT count(DISTINCT typname) FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' AND typtype='e')||'|'||(SELECT count(*) FROM pg_policies WHERE schemaname='public')||'|'||(SELECT array_length(public.audit_action_registry(),1));",
);
/*
 * ⛔ THE REGISTRY PIN GOES 23 -> 24 BY RULING, AND THIS LEG WAS RED FOR THREE
 *    PHASES WITHOUT ANYONE SEEING IT.
 *
 * `20260816200000` (`P2-14`) added `admin.student_updated` under an EXPLICIT
 * Operator authorization — *"registry 23 -> 24"*, written into the migration's
 * own header. ▶ This pin was correct when it was written and has been stale
 * ever since, and it stayed stale because this suite is not named
 * `portal-p2-N`: the sweep that ran after each phase enumerated the phase
 * suites, and this one was never in it.
 *
 * ⚠️ THAT IS PLAN §48.1 A THIRD TIME — *"I re-ran the suites I expected to be
 * affected, so I found the suites I expected to be affected."* It was caught
 * only by running ALL 64 `prove:*` scripts rather than the portal subset.
 *
 * ⛔ RE-PINNED, NOT RELAXED. The leg stays an EQUALITY over all four counts,
 * because the authorization it guards was an exhaustive negative.
 */
check(
  census === "30|12|30|24",
  `RAa-4  ⛔ tables 30 · enums 12 · policies 30 · registry 24 — UNMOVED (saw ${census}). ⚠️ Asserted as EQUALITIES because the authorization was an exhaustive negative: *"No table, column, enum, policy, grant or audit string. Registry unmoved."* The registry figure is 24 since P2-14's authorized "admin.student_updated"; the other three have not moved since this leg was written.`,
);
check(
  psql("SELECT has_function_privilege('authenticated','public.report_centre_dashboard_summary()','EXECUTE');") === "t" &&
    psql("SELECT has_function_privilege('anon','public.report_centre_dashboard_summary()','EXECUTE');") === "f",
  "RAa-4b ⛔ AND THE GRANT IS EXACTLY WHAT IT WAS — authenticated holds EXECUTE, anon holds none. `DROP FUNCTION` destroyed the original grant, so this is a RESTORATION rather than a change, and it is measured rather than assumed",
);

// ---------------------------------------------------------------------
// RAa-5 -- NO CONSUMER STILL EXPECTS A FOURTH INTEGER.
// ---------------------------------------------------------------------
const SOURCES = [
  "server/modules/class-session/dashboard.ts",
  "server/modules/integration-adapter/adapter-dtos.ts",
  "server/modules/integration-adapter/participant-actions.ts",
  "lib/frontend/contracts/physical-test.ts",
  "lib/frontend/fixtures/physical-test-fixture.ts",
  "features/management/management-dashboard-screen.tsx",
].map((p) => [p, readFileSync(join(ROOT, ...p.split("/")), "utf8")]);
const live = SOURCES.filter(([, src]) =>
  // A mention inside a comment is the RECORD of the removal and is required;
  // a mention in code is a consumer that would read `undefined`.
  src.split("\n").some((line) => /assessedStudents/.test(line) && !/^\s*[*/]/.test(line) && !/\*/.test(line)),
).map(([p]) => p);
check(
  SOURCES.length === 6 && live.length === 0,
  `RAa-5  ⛔ NO LIVE CONSUMER of \`assessedStudents\` survives across all ${SOURCES.length} layers (offenders: ${live.join(", ") || "none"}) — comment-only mentions are the RECORD of the removal and are required, which is why this matches code lines rather than the whole file`,
);
const stage3 = readFileSync(join(ROOT, "scripts", "physical-test", "prove-stage3-authenticated.mjs"), "utf8");
check(
  !/'Assessed',/.test(stage3) && !/captions = \['Total Students', 'Assessed'/.test(stage3),
  "RAa-5b and the TWO STAGE-3 LEGS that asserted the removed caption were corrected in the SAME PASS (§12.11) — they would have gone RED against a correct build, and the failure would have pointed at the KPI read rather than at a stale list",
);

console.log(`\nRESULT: ${failures === 0 ? "PASS" : "FAIL"}  (${failures} failed check${failures === 1 ? "" : "s"})`);
process.exit(failures === 0 ? 0 : 1);
