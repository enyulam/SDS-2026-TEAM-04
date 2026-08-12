#!/usr/bin/env node
// =====================================================================
// PORTAL PHASE P2-3 -- runner for prove-p2-3-class-edit.sql.
// =====================================================================
// This phase EXTENDS THE AUDIT REGISTRY, 19 -> 21, which no phase since
// `P1-2` has done. So this runner carries the legs that matter for an
// extension specifically:
//
//   * ⛔ EXACTLY the two AUTHORIZED strings, and no third. The Operator
//     approved a COUNT, not a class of change.
//   * ⛔ THE SINGLE-SOURCE REGISTRY IS STILL SINGLE-SOURCE, which is what
//     their "extend BOTH declaration sites" instruction was protecting —
//     a premise that had LAPSED, because `P1-2` consolidated the two sites.
//   * ⛔ THE THREE REFUSALS ARE NAMED IN THE MIGRATION with their reasons,
//     so a later phase reads why the day strip is read-only rather than
//     building the control and quietly not wiring it.
//   * ⛔ THE RPC-CALL RULE, now shared across every portal migration, plus
//     the guard that catches a migration nobody paired.
//
// ⛔ Exit code is the only verdict.
//
// Run: npm run prove:portal-p2-3
// =====================================================================

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { assertConfigProjectId, resolveLocalTarget } from "../../fixtures/local-target-guard.mjs";
import { unpairedMigrations, uncalledFunctions } from "./rpc-call-rule.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const { projectId: PROJECT_ID, dbContainer: DB_CONTAINER } = resolveLocalTarget();
assertConfigProjectId(
  (readFileSync(join(ROOT, "supabase", "config.toml"), "utf8").match(/^\s*project_id\s*=\s*"([^"]+)"/m) ?? [])[1] ?? "",
  PROJECT_ID,
);

const SUITE = join(ROOT, "scripts", "tests", "portal", "prove-p2-3-class-edit.sql");
const MIGRATION = join(ROOT, "supabase", "migrations", "20260813150000_portal_p2_3_class_edit.sql");

const COUNTS = `SELECT (SELECT count(*) FROM public.class_modules)
  || '|' || (SELECT count(*) FROM public.class_sessions)
  || '|' || (SELECT count(*) FROM public.class_session_assignments)
  || '|' || (SELECT count(*) FROM public.audit_events)
  || '|' || (SELECT title FROM public.class_modules ORDER BY created_at LIMIT 1);`;

const CENSUS = `SELECT (SELECT count(*) FROM supabase_migrations.schema_migrations)
  || '|' || (SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE')
  || '|' || (SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public')
  || '|' || (SELECT count(DISTINCT typname) FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' AND typtype='e')
  || '|' || (SELECT count(*) FROM pg_policies WHERE schemaname='public')
  || '|' || (SELECT array_length(public.audit_action_registry(),1));`;

/** The six strings the ruling deliberately did NOT authorize. */
const UNAUTHORIZED = [
  "admin.session_cancelled",
  "admin.session_deleted",
  "admin.trainer_unassigned",
  "admin.module_deleted",
  "admin.module_deactivated",
  "admin.class_updated",
];

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

const passes = (out.match(/PASS P25-/g) ?? []).length;
const fails = (out.match(/FAIL P25-/g) ?? []).length;

console.log("");
check(!/^ERROR/m.test(out), "the SQL suite ran to completion without an error");
check(fails === 0, `no failing SQL leg (${fails} FAIL)`);
check(passes === 12, `all TWELVE SQL legs EXECUTED (${passes}/12) -- an unrun leg is NOT-RUN, never PASS`);
check(
  before === after && before !== "",
  `the database is UNMOVED and was actually read (${before} -> ${after}) -- the suite really renamed a module, moved it to another grade and rewrote a session, and rolled all of it back. ⚠️ The module TITLE is in the probe deliberately: a count alone would not notice a rename`,
);

// ---------------------------------------------------------------------
// The registry extension — the legs that matter for an extension.
// ---------------------------------------------------------------------
const census = psql(["-c", CENSUS]).stdout.trim();
const [migrations, tables, functions, enums, policies, registry] = census.split("|");
check(
  tables === "29" && enums === "12" && policies === "30" && registry === "21",
  `⛔ the registry moved to EXACTLY 21 and the three structural invariants did NOT move: 29 tables | 12 enums | 30 policies (measured ${tables} | ${enums} | ${policies} | registry ${registry}). Reported, not pinned: ${migrations} migrations, ${functions} functions`,
);

const added = psql(["-c",
  `SELECT string_agg(x, ',' ORDER BY x) FROM unnest(public.audit_action_registry()) x WHERE x IN ('admin.module_updated','admin.session_updated');`,
]).stdout.trim();
check(
  added === "admin.module_updated,admin.session_updated",
  `⛔ EXACTLY the two AUTHORIZED strings are present (measured: ${added || "<none>"})`,
);

const smuggled = psql(["-c",
  `SELECT coalesce(string_agg(x, ',' ORDER BY x), '') FROM unnest(public.audit_action_registry()) x WHERE x IN (${UNAUTHORIZED.map((s) => `'${s}'`).join(",")});`,
]).stdout.trim();
check(
  smuggled === "",
  `⛔ NONE of the six neighbouring actions the ruling did NOT authorize was smuggled in (measured: ${smuggled || "none"}) -- the Operator approved a COUNT, not a class of change, and each of the six is a fresh §12 stop-and-ask`,
);

/*
 * ⚠️ THE CONTROL FOR THE TWO REGISTRY SCANS ABOVE. Both query the same
 * function through the same path; if that path returned nothing, the first
 * would fail loudly but the SECOND WOULD PASS — an absence assertion is
 * trivially satisfied by a query that matches nothing.
 */
const registryProbe = psql(["-c",
  `SELECT coalesce(string_agg(x, ',' ORDER BY x), '') FROM unnest(public.audit_action_registry()) x WHERE x IN ('admin.module_created','report.created');`,
]).stdout.trim();
check(
  registryProbe === "admin.module_created,report.created",
  `CONTROL: the SAME query path returns two strings KNOWN to be in the registry (measured: ${registryProbe || "<nothing>"}) -- so the "none were smuggled in" leg above is a measurement, not a query that matches nothing`,
);

// ---------------------------------------------------------------------
// ⛔ THE RPC-CALL RULE, shared — and the guard on its own registry.
// ---------------------------------------------------------------------
const { declared, uncalled } = uncalledFunctions(ROOT);
check(
  uncalled.length === 0,
  `P25a-CALL ⛔ all ${declared} function(s) declared by the portal migrations are CALLED by their paired suite, not merely inspected -- a structural assertion cannot prove a function RUNS${uncalled.length ? ` · UNCALLED: ${uncalled.join(", ")}` : ""}`,
);

const unpaired = unpairedMigrations(ROOT);
check(
  unpaired.length === 0,
  `P25a-PAIR ⛔ every portal-era migration that declares a function is REGISTERED in the call rule (${unpaired.length ? `UNPAIRED: ${unpaired.join(", ")}` : "none missing"}) -- ▶ without this guard the rule quietly stops covering new work: a phase adds an RPC, forgets the pairing, and every existing leg still passes`,
);

/*
 * ⚠️ THE EXPECTED VALUE HERE WAS WRONG ON FIRST RUN, AND THE DETECTOR WAS
 * RIGHT. This migration declares THREE functions — `audit_action_registry`
 * plus the two update RPCs — and I expected the control to report all three
 * uncalled. It reported TWO, because the terms suite genuinely DOES call
 * `public.audit_action_registry()`. ▶ The control was measuring real
 * behaviour; my expectation was the thing that had not been measured.
 */
const { declared: controlDeclared, uncalled: controlUncalled } = uncalledFunctions(ROOT, [
  { migration: "20260813150000_portal_p2_3_class_edit.sql", suite: "prove-p2-2-terms-substrate.sql" },
]);
check(
  controlDeclared === 3 && controlUncalled.length === 2,
  `P25a-CALLc CONTROL: pointed at a suite that cannot contain the calls, the same detector reports ${controlUncalled.length} of this migration's ${controlDeclared} functions uncalled -- the third, audit_action_registry, IS called there, which is why the control asserts a MEASURED value and not "all of them"`,
);

// ---------------------------------------------------------------------
// THE MIGRATION'S OWN TEXT.
// ---------------------------------------------------------------------
const migration = readFileSync(MIGRATION, "utf8");

check(
  /THREE THINGS THIS PHASE REFUSES/.test(migration) &&
    /day strip is NOT\s*\n--\s*EDITABLE|day strip is \*\*NOT\s+EDITABLE|day strip is NOT EDITABLE/.test(migration) &&
    /NO UNASSIGN STRING/.test(migration),
  "P25a-1 ⛔ THE THREE REFUSALS ARE NAMED IN THE MIGRATION with their reasons -- no cancel/delete string so the day strip is read-only, no unassign string, and nothing for Class code / Capacity / Program. ▶ Recording a refusal only in a plan is what lets a later phase build the control and quietly not wire it",
);

check(
  /premise/i.test(migration) && /P1-2/.test(migration) && /refuted by\s*\n--\s*measurement|refuted by measurement/i.test(migration),
  "P25a-2 ⚠️ the LAPSED PREMISE is recorded in the migration: \"extend BOTH declaration sites\" was true at Step 7H and P1-2 consolidated them, so the single site is extended and assertion U-3 re-proves no second exists -- an operator-supplied premise refuted by measurement, the third",
);

check(
  /assertion U-2/.test(migration) && /assertion U-5/.test(migration),
  "P25a-3 ⛔ the count and the refusals are STRUCTURAL: U-2 fails the build if an unauthorized string appears, U-5 fails it if either RPC deletes, deactivates or reaches trainer assignment",
);

check(
  !/CREATE TABLE|CREATE TYPE|ALTER TYPE|CREATE POLICY|ALTER TABLE/i.test(migration),
  "P25a-4 ⛔ the migration adds NO table, type, enum, policy or column -- one registry replacement and two SECURITY DEFINER functions with their EXECUTE grants",
);

check(
  migration.length > 4000 && /CREATE FUNCTION public\.admin_update_class_module/.test(migration),
  `P25a-4c CONTROL: the migration was READ and is the right file (${migration.length} chars, declares admin_update_class_module)`,
);

console.log(`\nRESULT: ${bad === 0 ? "PASS" : "FAIL"}  (${bad} failed check${bad === 1 ? "" : "s"})`);
process.exit(bad === 0 ? 0 : 1);
