#!/usr/bin/env node
// =====================================================================
// PORTAL PHASE P2-4 -- runner for prove-p2-4-class-overview.sql.
// =====================================================================
// ⛔ THIS PHASE ADDS NO AUDIT STRING, AND SAYS SO WITHOUT PINNING A GLOBAL
//    TOTAL. `P2-3` moving the registry 19 -> 21 fired THREE earlier suites
//    that each pinned the total, because a phase-scoped claim written as a
//    global absolute measures every OTHER phase's behaviour. ▶ The lesson is
//    applied here BEFORE being bitten a fourth time: this runner asserts
//    that its own MIGRATION FILE declares no registry (a claim that cannot
//    go stale) and REPORTS the total.
//
// It also carries:
//   * ⛔ THE RPC-CALL RULE. `P2-4` is the phase that proved why it exists a
//     second time: both new functions applied cleanly and, called as owner,
//     returned ZERO ROWS -- the deny path. A structural assertion cannot
//     prove a function runs, and a call as the wrong identity cannot prove
//     it permits.
//   * ⛔ THE STRUCTURAL BARS, asserted against the MIGRATION TEXT as well as
//     the returned shape, because the two answer different questions.
//
// ⛔ Exit code is the only verdict.
//
// Run: npm run prove:portal-p2-4
// =====================================================================

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { assertConfigProjectId, resolveLocalTarget } from "../../fixtures/local-target-guard.mjs";
import { unpairedMigrations, uncalledFunctions } from "./rpc-call-rule.mjs";
import { emittedLegs } from "./suite-output-rule.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const { projectId: PROJECT_ID, dbContainer: DB_CONTAINER } = resolveLocalTarget();
assertConfigProjectId(
  (readFileSync(join(ROOT, "supabase", "config.toml"), "utf8").match(/^\s*project_id\s*=\s*"([^"]+)"/m) ?? [])[1] ?? "",
  PROJECT_ID,
);

const SUITE = join(ROOT, "scripts", "tests", "portal", "prove-p2-4-class-overview.sql");
const MIGRATION = join(ROOT, "supabase", "migrations", "20260813180000_portal_p2_4_class_overview.sql");

const COUNTS = `SELECT (SELECT count(*) FROM public.students)
  || '|' || (SELECT count(*) FROM public.enrolments)
  || '|' || (SELECT count(*) FROM public.audit_events)
  || '|' || (SELECT coalesce(array_to_string(focus_chips, '+'), 'none')
               FROM public.observations ORDER BY created_at LIMIT 1);`;

const CENSUS = `SELECT (SELECT count(*) FROM supabase_migrations.schema_migrations)
  || '|' || (SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE')
  || '|' || (SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public')
  || '|' || (SELECT count(DISTINCT typname) FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' AND typtype='e')
  || '|' || (SELECT count(*) FROM pg_policies WHERE schemaname='public')
  || '|' || (SELECT array_length(public.audit_action_registry(),1));`;

function psql(args, input) {
  return spawnSync("docker", ["exec", "-i", DB_CONTAINER, "psql", "--no-psqlrc", "-U", "postgres",
    "-d", "postgres", "-At", ...args], { input, encoding: "utf8", shell: false });
}

let bad = 0;
const check = (ok, msg) => {
  if (!ok) bad++;
  console.log(`${ok ? "PASS   " : "FAIL   "} ${msg}`);
};

const before = psql(["-c", COUNTS]).stdout.trim();
const run = psql([], readFileSync(SUITE, "utf8"));
const out = `${run.stdout}\n${run.stderr}`;
for (const line of out.split(/\r?\n/)) {
  if (/^(NOTICE|WARNING|ERROR)/.test(line.trim())) console.log(`  ${line.trim()}`);
}
const after = psql(["-c", COUNTS]).stdout.trim();

const passes = (out.match(/PASS P26-/g) ?? []).length;
const fails = (out.match(/FAIL P26-/g) ?? []).length;

console.log("");
/*
 * ⛔ THE SUITE PRODUCED OUTPUT AT ALL — FIRST, because the two legs after it
 * are BOTH TRUE OF AN EMPTY STRING.
 *
 * ⚠️ MEASURED, NOT HYPOTHETICAL: with the Docker daemon stopped, `psql`
 * returned nothing and this runner printed *"the SQL suite ran to completion
 * without an error"* and *"no failing SQL leg (0 FAIL)"* as PASS. Only the
 * executed-count leg caught it. ▶ The same vacuity class as a leg that passes
 * on a fixture lacking the case it tests: a NEGATIVE assertion over nothing is
 * free.
 */
check(
  emittedLegs(out, "P26"),
  `the SQL suite ACTUALLY RAN and emitted its own P26- legs (${out.trim().length} chars of output) -- without this, the two checks below are trivially true of an unreachable database`,
);

/*
 * ⛔ THE CONTROL FOR THE GUARD ITSELF, and it covers ALL EIGHTEEN RUNNERS
 * because every one of them calls the SAME `emittedLegs`. ⚠️ It asserts the
 * predicate REJECTS the two things an unreachable database actually produces
 * — nothing at all, and a non-empty docker error carrying no legs — and
 * ACCEPTS a realistic sample. Without the third clause, "the guard fires"
 * would be equally true of a predicate that rejects everything, which would
 * fail every suite forever.
 */
check(
  !emittedLegs("", "P26")
    && !emittedLegs("Error: No such container: supabase_db_absent", "P26")
    && !emittedLegs("NOTICE: PASS P25-1 something from another suite", "P26")
    && emittedLegs("NOTICE:  PASS P26-1  non-vacuity", "P26"),
  "P26a-EMPTY CONTROL: the shared emitted-output guard REJECTS an empty result, REJECTS a non-empty docker error carrying no legs, REJECTS another suite's legs, and ACCEPTS a real one -- so the leg above is a measurement, and the same predicate now guards all 18 runners",
);
check(!/^ERROR/m.test(out), "the SQL suite ran to completion without an error");
check(fails === 0, `no failing SQL leg (${fails} FAIL)`);
check(passes === 11, `all ELEVEN SQL legs EXECUTED (${passes}/11) -- an unrun leg is NOT-RUN, never PASS`);
check(
  before === after && before !== "",
  `the database is UNMOVED and was actually read (${before} -> ${after}) -- the suite really planted a second learner, enrolled them and rewrote an observation's focus chips, and rolled all of it back. ⚠️ The CHIPS are in the probe deliberately: row counts alone would not notice the UPDATE`,
);

// ---------------------------------------------------------------------
// Census — phase-scoped claims only.
// ---------------------------------------------------------------------
const census = psql(["-c", CENSUS]).stdout.trim();
const [migrations, tables, functions, enums, policies, registry] = census.split("|");
check(
  tables === "29" && enums === "12" && policies === "30",
  `the structural INVARIANTS this phase claims are unmoved: 29 tables | 12 enums | 30 policies (measured ${tables} | ${enums} | ${policies}). Reported, not pinned, because they grow with authorized phases: ${migrations} migrations, ${functions} functions, audit registry ${registry}`,
);

// ---------------------------------------------------------------------
// The migration's own text.
// ---------------------------------------------------------------------
const migration = readFileSync(MIGRATION, "utf8");

check(
  !/CREATE OR REPLACE FUNCTION public\.audit_action_registry/i.test(migration),
  "P26a-0 ⛔ THE FILE-LEVEL CLAIM, and it cannot go stale: this migration DECLARES NO REGISTRY, so P2-4 provably added no audit string. Asserted against the FILE rather than against a global count, because the count belongs to whichever phase last changed it -- P2-3 moved it to 21 and a later authorized phase may move it again",
);

check(
  !/CREATE TABLE|CREATE TYPE|ALTER TYPE|CREATE POLICY|ALTER TABLE|ADD COLUMN/i.test(migration),
  "P26a-1 ⛔ the migration adds NO table, type, enum, policy or column -- the entire surface is two SECURITY DEFINER reads plus their two EXECUTE grants, which is exactly why \"zero write policies, zero write grants\" survived it",
);

check(
  /assertion V-4 failed/.test(migration)
    && ["areas_for_development", "observation_notes", "checklist", "approval", "content_hash", "'rating'"]
      .every((needle) => migration.includes(needle)),
  "P26a-2 ⛔ THE BARS ARE ASSERTED STRUCTURALLY, in the shape the Operator asked for: assertion V-4 FAILS THE BUILD if either RPC so much as names panel text, a trainer note, a checklist, an approval, a content hash or ANY rating (C-9, G-2, A-038)",
);

check(
  /assertion V-7 failed/.test(migration) && /report_evidence/.test(migration) && /observations/.test(migration),
  "P26a-3 ⛔ assertion V-7 keeps the JUSTIFICATION honest -- it fails the build if a policy or client grant ever appears on reports, observations or report_evidence, because the sole reason these RPCs exist is that a client cannot read those tables",
);

check(
  /Minimise what crosses the boundary/.test(migration) && /PROHIBITED/.test(migration),
  "P26a-4 ⚠️ the FOLLOW-UP-AREA DESIGN RULING is recorded IN THE MIGRATION with the Operator's reasoning, and a \"richer breakdown\" is named PROHIBITED -- so a later phase reads why one string is returned instead of re-deriving it as a missing feature",
);

check(
  migration.length > 4000 && /report_class_health_summary/.test(migration),
  `P26a-4c CONTROL: the migration was READ and is the right file (${migration.length} chars, declares report_class_health_summary)`,
);

// ---------------------------------------------------------------------
// ⛔ THE STANDING RULE, MECHANIZED — shared across every portal migration.
// ---------------------------------------------------------------------
// ⚠️ THE HELPER RETURNS `{ declared, uncalled }`, NOT AN ARRAY. The first
// draft read `.length` off the object and got `undefined`, so BOTH legs went
// red — which is the right failure: `undefined === 0` is false, and a
// mis-shaped read failed CLOSED rather than reporting a green nothing.
const { declared, uncalled } = uncalledFunctions(ROOT);
check(
  uncalled.length === 0,
  `P26a-CALL ⛔ A STRUCTURAL ASSERTION CANNOT PROVE A FUNCTION RUNS. all ${declared} function(s) declared by the portal migrations are CALLED by their paired suite (${uncalled.length} uncalled${uncalled.length ? `: ${uncalled.join(", ")}` : ""}). ⚠️ P2-4 is the SECOND phase to prove why this exists: both new RPCs applied cleanly and returned ZERO ROWS when called as owner, because postgres carries no JWT -- a green migration and a silent deny path look identical from the outside`,
);

const unpaired = unpairedMigrations(ROOT);
check(
  unpaired.length === 0,
  `P26a-PAIR ⛔ every portal-era migration has a paired suite (${unpaired.length} unpaired${unpaired.length ? `: ${unpaired.join(", ")}` : ""}) -- without this, the CALL rule above is satisfiable by never registering a migration`,
);

const { declared: controlDeclared, uncalled: controlUncalled } = uncalledFunctions(ROOT, [
  // ⚠️ BARE FILENAMES, not paths — the helper prefixes the directories itself.
  // The first draft passed full paths and the control CRASHED, which is the
  // right failure: a control that cannot run is NOT-RUN, and it said so loudly.
  { migration: "20260813180000_portal_p2_4_class_overview.sql", suite: "prove-p2-2b-trainer-assignment.sql" },
]);
check(
  controlUncalled.length === controlDeclared && controlDeclared === 2,
  `P26a-CALLc CONTROL: pointed at a suite that CANNOT contain the calls, the same detector reports ${controlUncalled.length} of this migration's ${controlDeclared} functions uncalled -- so P26a-CALL is a measurement and not a matcher that can never fire. ⚠️ It asserts ALL of them here, unlike P2-3's control, because P2-4 declares no registry function for the other suite to be calling incidentally`,
);

console.log(`\nRESULT: ${bad === 0 ? "PASS" : "FAIL"}  (${bad} failed check${bad === 1 ? "" : "s"})`);
process.exit(bad === 0 ? 0 : 1);
