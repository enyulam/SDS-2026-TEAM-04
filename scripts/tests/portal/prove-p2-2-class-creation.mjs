#!/usr/bin/env node
// =====================================================================
// PORTAL PHASE P2-2 -- runner for prove-p2-2-class-creation.sql.
// =====================================================================
// The SQL half CALLS both RPCs and proves they discriminate. This half
// proves what SQL cannot say about itself:
//
//   * EVERY LEG EXECUTED -- a pinned count. An unrun leg is NOT-RUN, never
//     PASS.
//   * NOTHING SURVIVED. The suite creates real modules, sessions and audit
//     events inside a transaction it rolls back; the counts are re-read on
//     both sides.
//   * ⛔ THE STOP IS STRUCTURAL, NOT PROSE. The migration must carry the
//     assertion that fails the build if a create RPC ever reaches trainer
//     assignment -- a stop recorded only in a comment is a stop the next
//     phase edits away.
//   * ⛔ THE `C-14` OMISSIONS ARE NAMED IN THE MIGRATION, so whoever opens
//     it later reads why `Class code`, `Capacity` and `Program` are absent
//     rather than inferring they were forgotten.
//
// ⛔ Exit code is the only verdict, and no pipe sits between the verdict
//    and the decision that consumes it.
//
// Run: npm run prove:portal-p2-2-create
// =====================================================================

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { assertConfigProjectId, resolveLocalTarget } from "../../fixtures/local-target-guard.mjs";
import { emittedLegs } from "./suite-output-rule.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const { projectId: PROJECT_ID, dbContainer: DB_CONTAINER } = resolveLocalTarget();
assertConfigProjectId(
  (readFileSync(join(ROOT, "supabase", "config.toml"), "utf8").match(/^\s*project_id\s*=\s*"([^"]+)"/m) ?? [])[1] ?? "",
  PROJECT_ID,
);

const SUITE = join(ROOT, "scripts", "tests", "portal", "prove-p2-2-class-creation.sql");
const MIGRATION = join(ROOT, "supabase", "migrations", "20260813090000_portal_p2_2_class_creation.sql");

const COUNTS = `SELECT (SELECT count(*) FROM public.class_modules)
  || '|' || (SELECT count(*) FROM public.class_sessions)
  || '|' || (SELECT count(*) FROM public.class_session_assignments)
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

const passes = (out.match(/PASS P23-/g) ?? []).length;
const fails = (out.match(/FAIL P23-/g) ?? []).length;

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
  emittedLegs(out, "P23"),
  `the SQL suite ACTUALLY RAN and emitted its own P23- legs (${out.trim().length} chars of output) -- without this, the assertions below are satisfied by an unreachable database`,
);

check(!/^ERROR/m.test(out), "the SQL suite ran to completion without an error");
check(fails === 0, `no failing SQL leg (${fails} FAIL)`);
check(passes === 11, `all ELEVEN SQL legs EXECUTED (${passes}/11) -- an unrun leg is NOT-RUN, never PASS`);
check(
  before === after && before !== "",
  `the database is UNMOVED and was actually read (${before} -> ${after}) -- the suite really created modules, sessions and audit events, and rolled all of them back`,
);

/*
 * ⚠️ WHY THIS PHASE SUITE NO LONGER PINS THE WHOLE-DATABASE TOTALS — a
 * deliberate instrument change, recorded rather than quietly applied.
 *
 * It pinned all six census figures as one exact string. That fired on THREE
 * CONSECUTIVE PHASES, every time for the same reason: a LATER phase
 * legitimately added a migration and a function, and a PHASE-SCOPED proof
 * has no business failing because a later phase did its job. `hero-2`'s
 * `P2-6` comment already recorded the observation — *"a pinned census in one
 * phase's proof goes stale the moment a later phase legitimately adds an
 * object"* — and three firings is enough to act on it.
 *
 * ⛔ THE ANSWER IS NOT A FLOOR. `>=` keeps passing while something silently
 * stops being counted, which is the only thing a census ratchet exists to
 * catch.
 *
 * ▶ THE SPLIT INSTEAD:
 *   * THIS suite asserts, EXACTLY, the four figures that must NOT move when
 *     any phase lands — tables, enums, policies and the audit registry.
 *     Those are "nothing was added" invariants and they are this phase's own
 *     claim. A later phase adding a table SHOULD break this.
 *   * The migration and function TOTALS are REPORTED, not pinned, because
 *     they legitimately grow with every phase.
 *   * ⛔ THE GLOBAL FUNCTION RATCHET STILL EXISTS, in exactly ONE place —
 *     `hero-2`'s `P2-6` — where moving it requires writing down which
 *     authorization moved it. One site to update per phase, and the reason
 *     is recorded where somebody reads it.
 */
const census = psql(["-c", CENSUS]).stdout.trim();
const [migrations, tables, functions, enums, policies, registry] = census.split("|");
/*
 * ⚠️ THE REGISTRY WAS ONE OF THE FOUR AND IS NOT ANY MORE — REWRITTEN, NOT
 * DELETED, AND THE REASON MATTERS MORE THAN THE EDIT. `P2-3` was authorized to
 * add `admin.module_updated` and `admin.session_updated`, moving the registry
 * 19 → 21, and this leg fired: a `P2-2` suite was pinning a GLOBAL total that
 * measures every OTHER phase's behaviour rather than its own. That is the SAME
 * defect one level down from the one this comment block was written to fix.
 *
 * ▶ WHAT `P2-2` ACTUALLY CLAIMS is that IT added no string, and that is now
 * proved TWICE against things `P2-3` cannot move: `P23-10` asserts both of its
 * strings are still registered, and `P23a-0` asserts its MIGRATION FILE
 * declares no registry at all. The total is REPORTED so a reader still sees it
 * move.
 *
 * ⛔ THREE NUMERIC INVARIANTS REMAIN PINNED because tables, enums and policies
 * are genuinely untouched by every phase so far — and a phase that adds one
 * SHOULD break this.
 */
check(
  tables === "29" && enums === "12" && policies === "30",
  `the structural INVARIANTS this phase claims are unmoved: 29 tables | 12 enums | 30 policies (measured ${tables} | ${enums} | ${policies}). Reported, not pinned, because they grow with authorized phases: ${migrations} migrations, ${functions} functions, audit registry ${registry}`,
);

// ---------------------------------------------------------------------
// THE MIGRATION'S OWN TEXT. Structural claims the SQL suite cannot make
// about the file it is exercising.
// ---------------------------------------------------------------------
const migration = readFileSync(MIGRATION, "utf8");

/*
 * ⚠️ FIRST DRAFT ASSERTED THE FILE NEVER MENTIONS THE REGISTRY AT ALL, AND
 * IT FAILED — correctly. This migration READS the registry in an apply-time
 * assertion (`array_length(...) <> 19`), which was TRUE when it applied and is
 * a historical record of that moment. ⛔ AN APPLIED MIGRATION IS NOT EDITED TO
 * MAKE A LATER TEST PASS: the assertion already ran, and rewriting it would
 * falsify what `P2-2` actually checked. The leg was narrowed to the claim that
 * was always meant — DECLARES, not MENTIONS.
 */
check(
  !/CREATE OR REPLACE FUNCTION public\.audit_action_registry/i.test(migration),
  "P23a-0 ⛔ THE FILE-LEVEL CLAIM, AND IT CANNOT GO STALE: this migration DECLARES NO REGISTRY, so P2-2 provably added no audit string. Asserted against the FILE rather than against a global count, because the count belongs to whichever phase last changed it -- P2-3 legitimately moved it to 21",
);

check(
  /CREATE OR REPLACE FUNCTION public\.audit_action_registry/i.test(
    readFileSync(MIGRATION.replace(/20260813090000_portal_p2_2_class_creation/, "20260813150000_portal_p2_3_class_edit"), "utf8"),
  ),
  "P23a-0c CONTROL: the SAME detector MATCHES P2-3's migration, which really does declare the registry -- so P23a-0 above is a measurement and not a pattern that can never fire",
);

check(
  /assertion C-8 failed/.test(migration) && /class_session_assignments/.test(migration) && /trainer_assigned/.test(migration),
  "P23a-1 ⛔ THE SEPARATION IS STRUCTURAL: assertion C-8 FAILS THE BUILD if either CREATE RPC reaches class_session_assignments or names admin.trainer_assigned. ⚠️ It was written as a STOP and it survives as a BOUNDARY -- P2-2b built assignment in its OWN RPC, so the create path still must not reach it. One RPC, one governed action (A-029)",
);

check(
  /Class code/.test(migration) && /Capacity/.test(migration) && /Program/.test(migration) && /C-14/.test(migration),
  "P23a-2 ⛔ the C-14 omissions are NAMED IN THE MIGRATION with their reasons -- Class code and Capacity omitted, and \"programme\" refused because it has no entity and must not become a hidden classes entity (A-016)",
);

check(
  /Trainer Assistant \(TA\)/.test(migration) && /A-014/.test(migration) && /G-7/.test(migration),
  "P23a-3 ⛔ the TA slot the frame's own notes draw is recorded as PROHIBITED and REGISTERED-OMISSION -- A-014 and G-7, and it never ends",
);

check(
  !/ALTER TYPE|CREATE TYPE|CREATE TABLE|CREATE POLICY|ALTER TABLE/i.test(migration),
  "P23a-4 ⛔ the migration adds NO table, type, enum, policy or column -- the entire create path is two SECURITY DEFINER functions plus their EXECUTE grants, which is exactly why \"zero write policies, zero write grants\" survived it",
);

/*
 * ⚠️ THE CONTROL for the four text scans above. Three of them assert
 * PRESENCE and one asserts ABSENCE; a file that failed to read would report
 * the first three as failures and the fourth as a PASS. This proves the
 * file was read and is the right one.
 */
check(
  migration.length > 4000 && /CREATE FUNCTION public\.admin_create_class_module/.test(migration),
  `P23a-4c CONTROL: the migration was READ and is the right file (${migration.length} chars, declares admin_create_class_module)`,
);

console.log(`\nRESULT: ${bad === 0 ? "PASS" : "FAIL"}  (${bad} failed check${bad === 1 ? "" : "s"})`);
process.exit(bad === 0 ? 0 : 1);
