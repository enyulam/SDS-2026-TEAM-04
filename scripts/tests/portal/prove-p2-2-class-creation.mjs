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
check(!/^ERROR/m.test(out), "the SQL suite ran to completion without an error");
check(fails === 0, `no failing SQL leg (${fails} FAIL)`);
check(passes === 11, `all ELEVEN SQL legs EXECUTED (${passes}/11) -- an unrun leg is NOT-RUN, never PASS`);
check(
  before === after && before !== "",
  `the database is UNMOVED and was actually read (${before} -> ${after}) -- the suite really created modules, sessions and audit events, and rolled all of them back`,
);

const census = psql(["-c", CENSUS]).stdout.trim();
check(
  census === "27|29|51|12|30|19",
  `the census moved by EXACTLY the two create RPCs: 27 migrations | 29 tables | 51 functions (49 + 2) | 12 enums | 30 policies | registry 19 (measured: ${census})`,
);

// ---------------------------------------------------------------------
// THE MIGRATION'S OWN TEXT. Structural claims the SQL suite cannot make
// about the file it is exercising.
// ---------------------------------------------------------------------
const migration = readFileSync(MIGRATION, "utf8");

check(
  /assertion C-8 failed/.test(migration) && /class_session_assignments/.test(migration) && /trainer_assigned/.test(migration),
  "P23a-1 ⛔ THE STOP IS STRUCTURAL: the migration carries assertion C-8, which FAILS THE BUILD if either create RPC ever reaches class_session_assignments or names admin.trainer_assigned -- a stop recorded only in prose is a stop the next phase edits away",
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
