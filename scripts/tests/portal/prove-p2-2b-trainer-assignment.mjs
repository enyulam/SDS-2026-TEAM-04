#!/usr/bin/env node
// =====================================================================
// PORTAL PHASE P2-2b -- runner for prove-p2-2b-trainer-assignment.sql.
// =====================================================================
// ⛔ THIS RUNNER CARRIES THE STANDING RULE THE OPERATOR SET AFTER THIS
//    PHASE'S MOST IMPORTANT DEFECT, AND IT CARRIES IT AS A MEASUREMENT
//    RATHER THAN AS A PROMISE IN A COMMENT:
//
//        "A STRUCTURAL ASSERTION CANNOT PROVE A FUNCTION RUNS. Every RPC
//         migration from here carries a leg that CALLS the function, not
//         one that inspects it."
//
//    `P24a-CALL` reads every `CREATE FUNCTION public.<name>` out of each
//    migration in the `P2-2` family and requires the paired SQL suite to
//    CALL it. ▶ A migration that adds an RPC nobody exercises now FAILS
//    the phase, which is the only form of this rule that survives the next
//    person in a hurry.
//
// Also proves:
//   * EVERY LEG EXECUTED -- a pinned count. An unrun leg is NOT-RUN.
//   * NOTHING SURVIVED. The suite plants an account, a membership and real
//     assignments inside a transaction it rolls back.
//   * ⛔ THE REGISTRY IS NOT EXTENDED -- 19 before, 19 after. This phase
//     writes a string Step 7H ratified and nobody had ever written.
//
// ⛔ Exit code is the only verdict, and no pipe sits between the verdict
//    and the decision that consumes it.
//
// Run: npm run prove:portal-p2-2b
// =====================================================================

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

const M = (name) => join(ROOT, "supabase", "migrations", name);
const S = (name) => join(ROOT, "scripts", "tests", "portal", name);

const SUITE = S("prove-p2-2b-trainer-assignment.sql");
const MIGRATION = M("20260813120000_portal_p2_2b_trainer_assignment.sql");

/*
 * ⚠️ THE WHOLE `P2-2` FAMILY, EACH MIGRATION PAIRED WITH THE SUITE THAT MUST
 * EXERCISE IT. The terms substrate is here deliberately: it creates NO
 * function, and the rule must be satisfiable by "there is nothing to call"
 * as well as by "everything is called" -- otherwise it would push future
 * phases toward adding a function just to have one.
 */
const FAMILY = [
  { migration: M("20260812230000_portal_d3_terms_substrate.sql"), suite: S("prove-p2-2-terms-substrate.sql") },
  { migration: M("20260813090000_portal_p2_2_class_creation.sql"), suite: S("prove-p2-2-class-creation.sql") },
  { migration: MIGRATION, suite: SUITE },
];

const COUNTS = `SELECT (SELECT count(*) FROM public.class_session_assignments)
  || '|' || (SELECT count(*) FROM public.centre_memberships)
  || '|' || (SELECT count(*) FROM public.accounts)
  || '|' || (SELECT count(*) FROM public.audit_events);`;

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

const passes = (out.match(/PASS P24-/g) ?? []).length;
const fails = (out.match(/FAIL P24-/g) ?? []).length;

console.log("");
check(!/^ERROR/m.test(out), "the SQL suite ran to completion without an error");
check(fails === 0, `no failing SQL leg (${fails} FAIL)`);
check(passes === 9, `all NINE SQL legs EXECUTED (${passes}/9) -- an unrun leg is NOT-RUN, never PASS`);
check(
  before === after && before !== "",
  `the database is UNMOVED and was actually read (${before} -> ${after}) -- the suite planted an account, a membership and real assignments, and rolled all of them back`,
);

const census = psql(["-c", CENSUS]).stdout.trim();
check(
  census === "28|29|52|12|30|19",
  `the census moved by EXACTLY one migration and one function: 28 | 29 tables | 52 functions (51 + the assignment RPC) | 12 enums | 30 policies | ⛔ registry STILL 19 (measured: ${census})`,
);

// ---------------------------------------------------------------------
// ⛔ THE STANDING RULE, MECHANIZED.
// ---------------------------------------------------------------------
const CREATE_FN = /CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+public\.([a-z0-9_]+)\s*\(/gi;
const uncalled = [];
let declared = 0;
for (const { migration, suite } of FAMILY) {
  const sql = readFileSync(migration, "utf8");
  const proof = readFileSync(suite, "utf8");
  for (const match of sql.matchAll(CREATE_FN)) {
    declared += 1;
    // A CALL is the function name followed by an open paren, anywhere in the
    // suite -- `SELECT ... FROM public.f(` or `PERFORM public.f(`.
    if (!new RegExp(`public\\.${match[1]}\\s*\\(`).test(proof)) uncalled.push(match[1]);
  }
}
check(
  uncalled.length === 0,
  `P24a-CALL ⛔ THE STANDING RULE: all ${declared} function(s) created by the P2-2 family are CALLED by their paired proof suite, not merely inspected -- a structural assertion cannot prove a function RUNS (Operator, 2026-08-13)${uncalled.length ? ` · UNCALLED: ${uncalled.join(", ")}` : ""}`,
);

/*
 * ⚠️ ITS CONTROL, and the leg that makes P24a-CALL mean anything. The
 * detector is run against a suite that CANNOT contain the calls -- this
 * runner's own source. If it reports zero uncalled functions there too, it
 * is matching nothing and the assertion above is worthless.
 */
const controlSubject = readFileSync(fileURLToPath(import.meta.url), "utf8");
let controlUncalled = 0;
for (const { migration } of FAMILY) {
  for (const match of readFileSync(migration, "utf8").matchAll(CREATE_FN)) {
    if (!new RegExp(`public\\.${match[1]}\\s*\\(`).test(controlSubject)) controlUncalled += 1;
  }
}
check(
  declared > 0 && controlUncalled === declared,
  `P24a-CALLc CONTROL: the SAME detector reports all ${declared} function(s) UNCALLED when pointed at a file that cannot contain the calls (${controlUncalled}/${declared}) -- so the leg above is a measurement, not a query that matches nothing`,
);

// ---------------------------------------------------------------------
// THE MIGRATION'S OWN TEXT.
// ---------------------------------------------------------------------
const migration = readFileSync(MIGRATION, "utf8");

check(
  /registry is NOT\s+--\s+EXTENDED|registry is \*\*NOT\s*\n--\s*EXTENDED|\*\*The registry is NOT/i.test(migration) &&
    /assertion A-3/.test(migration),
  "P24a-1 ⛔ the migration states that the registry is NOT extended AND carries assertion A-3, which fails the build if it is no longer 19 or if admin.trainer_assigned is absent",
);

check(
  /NO UNASSIGN/.test(migration) && /no ratified audit string/i.test(migration),
  "P24a-2 ⛔ UNASSIGNMENT is recorded as NOT BUILT with its reason -- it is a different action with no ratified string, and screen `26` needs none because the frame's `-` removes the trainer from the FORM before it is saved",
);

check(
  !/CREATE TABLE|CREATE TYPE|ALTER TYPE|CREATE POLICY|ALTER TABLE/i.test(migration),
  "P24a-3 ⛔ the migration adds NO table, type, enum, policy or column -- one SECURITY DEFINER function and its EXECUTE grant, which is why `no write policy, no write grant` survives a phase that WRITES an assignment",
);

check(
  migration.length > 4000 && /CREATE FUNCTION public\.admin_assign_session_trainer/.test(migration),
  `P24a-3c CONTROL: the migration was READ and is the right file (${migration.length} chars, declares admin_assign_session_trainer)`,
);

console.log(`\nRESULT: ${bad === 0 ? "PASS" : "FAIL"}  (${bad} failed check${bad === 1 ? "" : "s"})`);
process.exit(bad === 0 ? 0 : 1);
