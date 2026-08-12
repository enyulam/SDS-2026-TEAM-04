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
import { uncalledFunctions } from "./rpc-call-rule.mjs";
import { emittedLegs } from "./suite-output-rule.mjs";

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
/*
 * ⛔ THE SUITE ACTUALLY EMITTED ITS OWN LEGS — ASSERTED FIRST, because the
 * check(s) immediately below are TRUE OF AN EMPTY STRING.
 *
 * ⚠️ Measured, not hypothesised: with the Docker daemon stopped, `psql`
 * returned nothing and a runner of this exact shape reported *"ran to
 * completion without an error"* and *"0 FAIL"* as PASS. ▶ The vacuity class,
 * arriving through INFRASTRUCTURE FAILURE rather than logic — a suite that
 * cannot run must not be able to report clean.
 */
check(
  emittedLegs(out, "P24"),
  `the SQL suite ACTUALLY RAN and emitted its own P24- legs (${out.trim().length} chars of output) -- without this, the assertions below are satisfied by an unreachable database`,
);

check(!/^ERROR/m.test(out), "the SQL suite ran to completion without an error");
check(fails === 0, `no failing SQL leg (${fails} FAIL)`);
check(passes === 9, `all NINE SQL legs EXECUTED (${passes}/9) -- an unrun leg is NOT-RUN, never PASS`);
check(
  before === after && before !== "",
  `the database is UNMOVED and was actually read (${before} -> ${after}) -- the suite planted an account, a membership and real assignments, and rolled all of them back`,
);

/*
 * ⚠️ THIS PINNED ALL SIX FIGURES AND FIRED WHEN `P2-3` LEGITIMATELY MOVED
 * THE REGISTRY TO 21 — the same defect as the earlier census pins, and it
 * reached the REGISTRY figure too, which the first split had left exact
 * because it looked like a true invariant. ▶ It is not: it is an invariant
 * *for this phase*, and a phase-scoped claim written as a global total is a
 * claim about every future phase.
 *
 * ▶ What this phase actually claims is asserted instead: the three
 * structural invariants are exact, and THIS MIGRATION DECLARES NO REGISTRY AT
 * ALL, which is checked against the FILE below (`P24a-0`) and cannot go stale.
 */
const census = psql(["-c", CENSUS]).stdout.trim();
const [migrations, tables, functions, enums, policies, registry] = census.split("|");
check(
  tables === "29" && enums === "12" && policies === "30",
  `the three structural INVARIANTS are unmoved: 29 tables | 12 enums | 30 policies (measured ${tables} | ${enums} | ${policies}). Reported, not pinned: ${migrations} migrations, ${functions} functions, registry ${registry}`,
);

// ---------------------------------------------------------------------
// ⛔ THE STANDING RULE, MECHANIZED.
// ---------------------------------------------------------------------
/*
 * ⚠️ THE DETECTOR AND ITS PAIRING NOW LIVE IN `rpc-call-rule.mjs`, not here.
 * It was declared inline in this file first; `P2-3` needed the same rule, and
 * two copies of a rule is how one of them silently stops enforcing it — the
 * reason the rating colour map was extracted at screen `19`.
 */
const { declared, uncalled } = uncalledFunctions(ROOT);
check(
  uncalled.length === 0,
  `P24a-CALL ⛔ THE STANDING RULE: all ${declared} function(s) declared by the portal migrations are CALLED by their paired proof suite, not merely inspected -- a structural assertion cannot prove a function RUNS (Operator, 2026-08-13)${uncalled.length ? ` · UNCALLED: ${uncalled.join(", ")}` : ""}`,
);

/*
 * ⚠️ ITS CONTROL. The same detector, pointed at a pairing that CANNOT hold
 * the calls, must report every function uncalled. Without it, "all functions
 * are called" is equally true of a matcher that matches nothing — the
 * false-`CLEAN` shape this project has been bitten by four times.
 */
const { declared: controlDeclared, uncalled: controlUncalled } = uncalledFunctions(ROOT, [
  { migration: "20260813120000_portal_p2_2b_trainer_assignment.sql", suite: "prove-p2-2-terms-substrate.sql" },
]);
check(
  controlDeclared === 1 && controlUncalled.length === 1,
  `P24a-CALLc CONTROL: the SAME detector reports this migration's function UNCALLED when pointed at a suite that cannot contain the call (${controlUncalled.length}/${controlDeclared})`,
);

// ---------------------------------------------------------------------
// THE MIGRATION'S OWN TEXT.
// ---------------------------------------------------------------------
const migration = readFileSync(MIGRATION, "utf8");

check(
  !/CREATE OR REPLACE FUNCTION public\.audit_action_registry/i.test(migration),
  "P24a-0 ⛔ THE FILE-LEVEL CLAIM, and it cannot go stale: this migration DECLARES NO REGISTRY. Asserted against the FILE rather than against a global count, because the count belongs to whichever phase last changed it -- P2-3 legitimately moved it to 21",
);

check(
  /registry is NOT\s+--\s+EXTENDED|registry is \*\*NOT\s*\n--\s*EXTENDED|\*\*The registry is NOT/i.test(migration) &&
    /assertion A-3/.test(migration),
  "P24a-1 ⛔ the migration states that the registry is NOT extended AND carries assertion A-3, which fails its OWN build if admin.trainer_assigned is absent",
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
