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
check(!/^ERROR/m.test(out), "the SQL suite ran to completion without an error");
check(fails === 0, `no failing SQL leg (${fails} FAIL)`);
check(passes === 9, `all NINE SQL legs EXECUTED (${passes}/9) -- an unrun leg is NOT-RUN, never PASS`);
check(
  before === after && before !== "",
  `the database is UNMOVED and was actually read (${before} -> ${after}) -- the probe policy did not survive`,
);

// ---------------------------------------------------------------------
// The census.
// ---------------------------------------------------------------------
// ⚠️ THE PIN MOVED, AND IT WAS REWRITTEN RATHER THAN DELETED. It read
// `26|29|49|12|30|19` -- the figure the `C-7` proposal committed to in
// advance, and exactly right at the terms commit. The Operator then ruled
// reading B, and `20260813090000_portal_p2_2_class_creation.sql` added ONE
// migration and TWO create RPCs.
//
// ▶ WHAT THIS LEG ACTUALLY PROTECTS is unchanged and is the part worth
//   keeping: the TERMS migration itself contributed nothing but its table
//   -- no function, no enum, no extra policy -- and `P22a-4` asserts that
//   against the file, which is the claim a whole-database census can no
//   longer make on its own once a second migration lands beside it.
const census = psql(["-c", CENSUS]).stdout.trim();
check(
  census === "27|29|51|12|30|19",
  `the census is where the two P2-2 migrations together said it would be: 27 migrations | 29 tables | 51 functions (49 + the two create RPCs; terms added ZERO) | 12 enums | 30 policies (terms' one SELECT policy was already counted) | registry 19 (measured: ${census})`,
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
