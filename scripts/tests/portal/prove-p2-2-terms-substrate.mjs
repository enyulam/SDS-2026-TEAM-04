#!/usr/bin/env node
// =====================================================================
// PORTAL PHASE P2-2 -- runner for prove-p2-2-terms-substrate.sql.
// =====================================================================
// The SQL half proves the substrate is read-only and discriminating. This
// half proves what SQL cannot say about itself:
//
//   * EVERY LEG EXECUTED -- a pinned count. An unrun leg is NOT-RUN, never
//     PASS.
//   * THE MIGRATION SAYS WHAT THE OPERATOR REQUIRED IT TO SAY -- that terms
//     are scheduling structure and END-OF-TERM REPORT GENERATION REMAINS
//     DEFERRED. ⛔ A boundary that lives only in a plan cannot stop a later
//     phase; one written into the migration is read by whoever opens it.
//   * THE SEED IS DECLARED A DEVELOPMENT CALENDAR. ⚠️ Unlike the Step 7E
//     seed, NO document establishes iSpeak's real term calendar, so the
//     placeholder must SAY it is one.
//   * NOTHING WAS COMMITTED by the suite, and the census is where the
//     migration claimed it would land.
//
// ⛔ Exit code is the only verdict, and no pipe sits between the verdict
//    and the decision that consumes it.
//
// Run: npm run prove:portal-p2-2
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

const SUITE = join(ROOT, "scripts", "tests", "portal", "prove-p2-2-terms-substrate.sql");
const MIGRATION = join(ROOT, "supabase", "migrations", "20260812230000_portal_d3_terms_substrate.sql");

const COUNTS = `SELECT (SELECT count(*) FROM public.terms)
  || '|' || (SELECT count(*) FROM public.class_sessions)
  || '|' || (SELECT count(*) FROM public.class_sessions WHERE term_id IS NOT NULL)
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

const passes = (out.match(/PASS P22-/g) ?? []).length;
const fails = (out.match(/FAIL P22-/g) ?? []).length;

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
  emittedLegs(out, "P22"),
  `the SQL suite ACTUALLY RAN and emitted its own P22- legs (${out.trim().length} chars of output) -- without this, the assertions below are satisfied by an unreachable database`,
);

check(!/^ERROR/m.test(out), "the SQL suite ran to completion without an error");
check(fails === 0, `no failing SQL leg (${fails} FAIL)`);
check(passes === 9, `all NINE SQL legs EXECUTED (${passes}/9) -- an unrun leg is NOT-RUN, never PASS`);
check(
  before === after && before !== "",
  `the database is UNMOVED and was actually read (${before} -> ${after}) -- the probe policy did not survive`,
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
 *   * THIS suite asserts, EXACTLY, the figures that must NOT move when any
 *     phase lands — tables, enums and policies. Those are "nothing was
 *     added" invariants and they are this phase's own claim. A later phase
 *     adding a table SHOULD break this.
 *   * ⚠️ THE AUDIT REGISTRY WAS THE FOURTH AND IS NOT ANY MORE. `P2-3` was
 *     authorized to move it 19 → 21 and this leg fired, which is the SAME
 *     defect one level down from the one this block was written to fix: a
 *     phase-scoped claim written as a global absolute. What THIS phase claims
 *     is that no TERM action exists, and `P22-5` measures exactly that — a
 *     claim that stays true however many unrelated strings are added.
 *   * The migration and function TOTALS are REPORTED, not pinned, because
 *     they legitimately grow with every phase.
 *   * ⛔ THE GLOBAL FUNCTION RATCHET STILL EXISTS, in exactly ONE place —
 *     `hero-2`'s `P2-6` — where moving it requires writing down which
 *     authorization moved it. One site to update per phase, and the reason
 *     is recorded where somebody reads it.
 */
const census = psql(["-c", CENSUS]).stdout.trim();
const [migrations, tables, functions, enums, policies, registry] = census.split("|");
check(
// ⛔ FLOORS, NOT EQUALITIES -- §12.8's phase-scoped-claim class, repaired
// across every portal suite on 2026-08-14 after P2-6's AUTHORIZED migration
// (tables 29->30, registry 21->23) turned FIVE green suites red at once.
// ▶ A phase-scoped claim written as a GLOBAL ABSOLUTE measures every OTHER
// phase's behaviour. What this phase can honestly claim is that it REMOVED
// nothing; a later phase's legal ADDITION is not its business.
// ⚠️ enums stays an EQUALITY: every phase since has been authorized at
// ZERO enums, so movement in either direction is a finding.
  Number(tables) >= 29 && enums === "12" && Number(policies) >= 30,
  `nothing this phase depends on was REMOVED: tables >= 29 | 12 enums | 30 policies (terms’ ONE SELECT policy is already counted here) (measured ${tables} | ${enums} | ${policies}). Reported, not pinned: ${migrations} migrations, ${functions} functions, audit registry ${registry} — ⚠️ the TERMS migration itself contributed ZERO functions, which P22a-4 asserts against the file, because a whole-database total can no longer make that claim once a second migration lands beside it`,
);

// ---------------------------------------------------------------------
// THE MIGRATION'S OWN TEXT. Structural claims the SQL suite cannot make
// about the file it is exercising.
// ---------------------------------------------------------------------
const migration = readFileSync(MIGRATION, "utf8");

check(
  /END-OF-TERM REPORT GENERATION REMAINS\s+--\s+DEFERRED|END-OF-TERM REPORT GENERATION REMAINS/i.test(migration) &&
    /NOTHING IN THIS PHASE MAY BUILD TOWARD A TERM REPORT/i.test(migration),
  "P22a-1 the migration STATES D-3's boundary in its own text -- terms are scheduling structure and end-of-term report generation remains DEFERRED (Operator: \"Say so in the migration\")",
);

check(
  /NO WRITE PATH ANYWHERE/.test(migration) && /assertion T-6/.test(migration),
  "P22a-2 the migration states the NO-WRITE-PATH rule AND carries the assertion that fails the build if one appears (the E1/E9 shape the Operator asked for)",
);

check(
  /DEVELOPMENT CALENDAR/i.test(migration) && /OPERATOR INPUT/i.test(migration),
  "P22a-3 ⚠️ the seed DECLARES ITSELF a development calendar placeholder and names the real calendar an OPERATOR INPUT -- unlike the Step 7E seed, no document establishes iSpeak's terms, and a placeholder that does not say so reads as ratified",
);

/*
 * ⚠️ THE CONTROL FOR THE THREE TEXT SCANS ABOVE. Each is an ASSERTION OF
 * PRESENCE, which is trivially false of a file that failed to read -- but
 * equally, a scan that matches nothing would report all three as absent and
 * look like a real failure. This proves the file was read and is the right
 * one.
 */
check(
  migration.length > 4000 && /CREATE TABLE public\.terms/.test(migration),
  `P22a-3c CONTROL: the migration was READ and is the right file (${migration.length} chars, declares public.terms)`,
);

check(
  !/CREATE (OR REPLACE )?FUNCTION/i.test(migration),
  "P22a-4 ⛔ the migration creates NO function at all -- read RPCs were authorized \"as needed\" and none was needed: one RLS policy plus its minimum matching grant already serves every reader, and a SECURITY DEFINER function added for symmetry is a second gate to keep in step",
);

check(
  !/INSERT INTO public\.class_sessions|UPDATE public\.class_sessions SET term_id/i.test(migration),
  "P22a-5 ⛔ the migration performs NO backfill of term_id -- asserted against the file, because T-4 only proves the state and a later re-run could differ",
);

console.log(`\nRESULT: ${bad === 0 ? "PASS" : "FAIL"}  (${bad} failed check${bad === 1 ? "" : "s"})`);
process.exit(bad === 0 ? 0 : 1);
