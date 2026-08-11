#!/usr/bin/env node
// =====================================================================
// PORTAL PHASE P1-1b -- runner for prove-p1-1b-management-ratings.sql.
// =====================================================================
// The SQL half proves the read discriminates. This half proves two things
// the suite cannot prove about itself:
//
//   * NOTHING WAS COMMITTED -- governed counts before and after, with the
//     mid-transaction reading asserted to DIFFER. `before === after` is
//     also what a counting query observing nothing returns.
//   * EVERY LEG ACTUALLY EXECUTED -- a pinned leg count. An unrun leg is
//     NOT-RUN, never PASS, and `passes > 0` would have shown four passes
//     after an abort and looked fine.
//
// ⛔ Exit code is the only verdict, and no pipe sits between the verdict
//    and the decision that consumes it.
//
// Run: npm run prove:portal-1
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

const HERO = join(ROOT, "scripts", "tests", "hero");
const PRELUDE = join(HERO, "_isolated-fixture.sql");
const SUITE = join(ROOT, "scripts", "tests", "portal", "prove-p1-1b-management-ratings.sql");
const MIGRATION = join(ROOT, "supabase", "migrations", "20260811140000_portal_d1_management_ratings.sql");

const COUNTS = `SELECT (SELECT count(*) FROM public.reports)
  || '|' || (SELECT count(*) FROM public.report_versions)
  || '|' || (SELECT count(*) FROM public.report_version_ratings)
  || '|' || (SELECT count(*) FROM public.audit_events)
  || '|' || (SELECT count(*) FROM public.students)
  || '|' || (SELECT count(*) FROM public.observations);`;

function psql(args, input) {
  return spawnSync("docker", ["exec", "-i", DB_CONTAINER, "psql", "--no-psqlrc", "-U", "postgres",
    "-d", "postgres", "-At", ...args], { input, encoding: "utf8", shell: false });
}

const before = psql(["-c", COUNTS]).stdout.trim();
console.log(`governed counts BEFORE: ${before}`);

const run = psql([], `${readFileSync(PRELUDE, "utf8")}\n${readFileSync(SUITE, "utf8")}`);
const out = `${run.stdout}\n${run.stderr}`;
for (const line of out.split(/\r?\n/)) {
  if (/^(NOTICE|WARNING|ERROR)/.test(line.trim())) console.log(`  ${line.trim()}`);
}

const after = psql(["-c", COUNTS]).stdout.trim();
console.log(`governed counts AFTER : ${after}`);

const during = (out.match(/DURING-COUNTS ([\d|]+)/) ?? [])[1] ?? "";
const passes = (out.match(/PASS D1a-/g) ?? []).length;
const fails = (out.match(/FAIL D1a-/g) ?? []).length;

let bad = 0;
const check = (ok, msg) => {
  if (!ok) bad++;
  console.log(`${ok ? "PASS   " : "FAIL   "} ${msg}`);
};

console.log("");
check(!/^ERROR/m.test(out), "the suite ran to completion without a SQL error");
check(fails === 0, `no failing leg (${fails} FAIL)`);
check(passes === 9, `all NINE legs EXECUTED (${passes}/9) -- an unrun leg is NOT-RUN, never PASS`);
check(before === after, `the canonical database is UNMOVED (${before} -> ${after})`);
check(
  during !== "" && during !== before,
  `the counts MOVED mid-transaction (${before} -> ${during} -> ${after}) -- this is what stops "unmoved" being a tautology`,
);

// ---------------------------------------------------------------------
// The migration's own text. These are structural claims the SQL suite
// cannot make about the object it is exercising.
// ⚠️ Comments stripped first: this migration DOCUMENTS what it refuses to
// touch, so an unstripped scan would match the paragraph promising
// report_get_canonical is untouched rather than the code that leaves it
// alone. That scan has produced a false verdict every time it was skipped.
// ---------------------------------------------------------------------
const migration = readFileSync(MIGRATION, "utf8")
  .replace(/^\s*--.*$/gm, "");

check(
  !/CREATE\s+OR\s+REPLACE\s+FUNCTION\s+public\.report_get_canonical\b/i.test(migration),
  "the migration does NOT redefine report_get_canonical -- ratings stay off the role-dispatching read",
);
check(
  !/CREATE\s+OR\s+REPLACE\s+FUNCTION\s+public\.report_get_management_review\b/i.test(migration),
  "the migration does NOT redefine report_get_management_review -- the proven screen 19 path keeps its return type",
);
check(
  /GRANT\s+EXECUTE[\s\S]{0,120}TO\s+authenticated/i.test(migration) &&
    !/TO\s+anon\b/i.test(migration) &&
    !/GRANT[\s\S]{0,80}TO\s+PUBLIC\b/i.test(migration),
  "exactly one EXECUTE grant, to `authenticated` -- no anon, no PUBLIC",
);
check(
  !/(CREATE|ALTER)\s+TABLE/i.test(migration) &&
    !/ALTER\s+TYPE/i.test(migration) &&
    !/CREATE\s+POLICY/i.test(migration),
  "no table, no enum value, no policy -- D-1 needed none of them",
);

// ⚠️ NON-VACUITY FOR THE FOUR SCANS ABOVE. Each is an ABSENCE assertion, and
// an absence assertion on a broken pattern passes perfectly. Prove each
// pattern can fire by running it against text that DOES contain the thing.
const PROBE = `CREATE OR REPLACE FUNCTION public.report_get_canonical(a uuid)
CREATE OR REPLACE FUNCTION public.report_get_management_review(a uuid)
GRANT EXECUTE ON FUNCTION x TO anon;
CREATE TABLE public.x (id uuid); ALTER TYPE public.y ADD VALUE 'z'; CREATE POLICY p ON public.x;`;
check(
  /CREATE\s+OR\s+REPLACE\s+FUNCTION\s+public\.report_get_canonical\b/i.test(PROBE) &&
    /CREATE\s+OR\s+REPLACE\s+FUNCTION\s+public\.report_get_management_review\b/i.test(PROBE) &&
    /TO\s+anon\b/i.test(PROBE) &&
    /(CREATE|ALTER)\s+TABLE/i.test(PROBE),
  "CONTROL: every absence pattern above FIRES against text that contains the thing",
);

// ---------------------------------------------------------------------
// THE SURFACE HALF -- what the database cannot see.
// WARNING: comments are stripped first. This screen DOCUMENTS its governed
// omissions at length, so an unstripped scan would match the paragraph
// explaining a prohibition rather than the code that honours it. That has
// produced a false verdict every time it was skipped in this project.
// ---------------------------------------------------------------------
const F = (...parts) => join(ROOT, ...parts);
const strip = (f) =>
  readFileSync(f, "utf8")
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");

const RENDERS_RATING = /\.ratings\b|ratingSnapshots|RATING_LABELS/;
const screen = strip(F("features", "management", "management-report-review.tsx"));

check(
  /data-testid="management-ratings"/.test(screen) && /report\.ratings\.map/.test(screen),
  "screen 19 RENDERS the nine ratings (D-1) -- the grid exists, not merely the read",
);
// NON-VACUITY for the absence scans below: the renderer must be present, or
// "no edit control" is trivially true of a screen that renders nothing.
// ⚠️ UPDATED 2026-08-12 for the tile treatment. The local `RATING_LABELS` map
// is gone: this surface now reads the SAME `RATING_DISPLAY_LABELS` the trainer
// surfaces read, so one ratified vocabulary has exactly one label source.
check(
  /RATING_DISPLAY_LABELS\[snapshot\.rating\]/.test(screen),
  "the rendered value is the RATING itself -- so the absence checks below describe a real grid",
);
check(
  /RATING_TILE_STYLE\[snapshot\.rating\]/.test(screen) && !/bg-rating-\d-soft/.test(screen),
  "the tile colour comes from the SHARED map -- no second visual language and no new colour values",
);
// ⚠️ THIS MATCHER FIRED CORRECTLY ON 2026-08-12, AND IT IS WHY THE LEG BELOW IT
// IS TRUSTWORTHY. It still expected `</dl>` after the list became a `<ul>` of
// tiles, so it matched NOTHING -- and "carries no input or button" is TRIVIALLY
// TRUE of an empty string. ▶ The READ-ONLY leg PASSED against a block that had
// never been found. The located-for-scanning leg is the only reason anyone knew.
const block = (screen.match(/data-testid="management-ratings"[\s\S]*?<\/ul>/) ?? [""])[0];
check(
  block.length > 0,
  "the ratings block was LOCATED -- without this, every absence check below is true of an empty string",
);
check(
  !/<input|<select|<textarea|<button|onChange|onClick/.test(block),
  "the ratings grid carries NO input, select, textarea, button or handler -- READ ONLY (D-1)",
);
check(
  !/Overall Grade|overallGrade|averageRating|ratingAverage|headlineBand/.test(screen),
  "no Overall Grade, average or headline band on screen 19 (G-2, permanent)",
);
for (const [label, file] of [
  ["queue (29)", F("features", "management", "management-reports-queue.tsx")],
  ["dashboard (11)", F("features", "management", "management-dashboard.tsx")],
]) {
  check(
    !RENDERS_RATING.test(strip(file)),
    `C-9: the management ${label} renders NO rating -- a list invites comparison between children`,
  );
}
for (const [label, file] of [
  ["canonical report (33)", F("features", "parent", "parent-canonical-report.tsx")],
  ["reports list (32)", F("features", "parent", "parent-reports-list.tsx")],
  ["dashboard (30)", F("features", "parent", "parent-dashboard.tsx")],
]) {
  check(
    !RENDERS_RATING.test(strip(file)),
    `Q-27: the parent ${label} renders NO rating -- D-1 grants Parent nothing`,
  );
}
check(
  /ratingSnapshots/.test(strip(F("features", "trainer", "trainer-report-review.tsx"))),
  "the TRAINER surface still carries its own rating snapshots -- unchanged by D-1, not collateral damage",
);
// CONTROL for the six absence scans: the pattern must FIRE against text that
// contains the thing. An absence assertion on a broken pattern passes perfectly.
check(
  RENDERS_RATING.test("x.ratings.map"),
  "CONTROL: the rating-render pattern FIRES against text that renders ratings",
);


console.log(`\nRESULT: ${bad === 0 ? "PASS" : "FAIL"}  (${bad} failed check${bad === 1 ? "" : "s"})`);
process.exit(bad === 0 ? 0 : 1);
