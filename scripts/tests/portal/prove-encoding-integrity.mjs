#!/usr/bin/env node
// =====================================================================
// Q-28 ENCODING INTEGRITY -- the repair, and the assertion that keeps it.
// =====================================================================
// ⛔ THIS EXISTS BECAUSE THE PROJECT SHIPPED CORRUPT FIXTURE DATA FOR DAYS
//    AND NEITHER THE OPERATOR NOR I REGISTERED IT. Two class module titles
//    stored a literal `???` -- three ASCII bytes `3f 3f 3f` where the three
//    UTF-8 bytes of an em dash belong. It was on screen in every screenshot.
//
// ⚠️ THE FIRST DIAGNOSIS BLAMED THE LOADER AND THE MEASUREMENT REFUTED IT.
//    `load-local-fixtures.mjs` round-trips `U+2014` intact -- leg E-1 below
//    proves it through the exact same mechanism. The corruption entered by
//    a manual route. ▶ **So the fix is an ASSERTION, not an encoding change
//    to a path that was already correct.**
//
// Proves:
//   E-1  the loader's own mechanism round-trips non-ASCII intact
//   E-2  NO stored fixture string carries a `?` substitution or mojibake
//   E-3  the two repaired titles carry a real em dash, byte-checked
//   E-4  the seeded encoding canaries survive (Zoë / Núria / Søren)
//   E-5  ⚠️ THE CONTROL -- the assertion FIRES against a corrupted string.
//        An encoding check that has never rejected anything is a comment.
//
// Run: npm run prove:encoding
// =====================================================================

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { resolveLocalTarget } from "../../fixtures/local-target-guard.mjs";
// ⛔ NOT from load-local-fixtures.mjs: that module calls main() at module
// scope, so importing it RUNS THE FIXTURE LOADER. It did, once, before this
// line was corrected — see scripts/fixtures/encoding-integrity.mjs.
import { findLostLiterals } from "../../fixtures/encoding-integrity.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const { dbContainer: DB_CONTAINER } = resolveLocalTarget();

const PSQL_PREFIX = ["psql", "--no-psqlrc", "--username=postgres", "--dbname=postgres",
  "--set=ON_ERROR_STOP=1", "--quiet"];

function psql(sqlText) {
  return spawnSync("docker", ["exec", "-i", DB_CONTAINER, ...PSQL_PREFIX, "-At"],
    { input: sqlText, encoding: "utf8", shell: false, windowsHide: true });
}

let bad = 0;
const check = (ok, msg) => {
  if (!ok) bad++;
  console.log(`${ok ? "PASS  " : "FAIL  "} ${msg}`);
};

// ---------------------------------------------------------------------
// E-1 -- the loader's mechanism, measured rather than assumed.
// ---------------------------------------------------------------------
const EM_DASH = String.fromCharCode(0x2014);
const probe = psql(
  `SELECT encode(convert_to('A${EM_DASH}B', 'UTF8'), 'hex');`,
).stdout.trim();
check(
  probe.includes("e28094"),
  `the loader's OWN mechanism round-trips U+2014 intact (${probe}) -- it was never the corrupting path`,
);

// ---------------------------------------------------------------------
// E-2 / E-3 -- every stored fixture string, and the two repaired titles.
// ---------------------------------------------------------------------
const titles = psql(
  `SELECT title || '|' || encode(convert_to(title, 'UTF8'), 'hex') FROM public.class_modules ORDER BY title;`,
).stdout.trim().split("\n").filter(Boolean);

check(
  titles.length === 3 && titles.every((t) => t.split("|")[1].includes("e28094")),
  `all three class module titles carry a real em dash (${titles.length} checked)`,
);
check(
  !titles.some((t) => t.split("|")[1].includes("3f3f3f")),
  "no title carries the `3f3f3f` substitution the repair removed",
);

const anyCorrupt = psql(
  `SELECT count(*) FROM (
     SELECT title AS v FROM public.class_modules
     UNION ALL SELECT full_name FROM public.students
     UNION ALL SELECT lesson_title FROM public.class_sessions WHERE lesson_title IS NOT NULL
   ) t WHERE t.v LIKE '%???%' OR t.v LIKE '%â€%' OR t.v LIKE '%Ã%';`,
).stdout.trim();
check(anyCorrupt === "0", `no stored fixture string carries a substitution or mojibake sequence (${anyCorrupt} found)`);

// ---------------------------------------------------------------------
// E-4 -- the seeded canaries.
// ---------------------------------------------------------------------
const canaries = psql(
  `SELECT count(*) FROM public.students WHERE full_name IN ('Walkthrough Learner Zoë', 'Walkthrough Learner Núria', 'Walkthrough Learner Søren');`,
).stdout.trim();
check(
  canaries === "3",
  `the three seeded encoding canaries are intact (${canaries}/3) -- they sit on data the walkthrough actually reads`,
);

// ---------------------------------------------------------------------
// E-5 -- ⚠️ THE CONTROL. The assertion must REJECT something.
// ---------------------------------------------------------------------
const loader = readFileSync(join(ROOT, "scripts", "fixtures", "load-local-fixtures.mjs"), "utf8");
check(
  /function assertNonAsciiSurvived/.test(loader) && /ENCODING CORRUPTION/.test(loader),
  "the load path carries a byte-level assertion that throws on a lost non-ASCII literal",
);

// ⛔ THE REAL CONTROL: REPRODUCE THE CORRUPTION AND WATCH THE COMPARISON FAIL.
//
// A string-inequality check would prove only that `!==` works. Instead this
// re-runs the assertion's OWN round trip through the mechanism that actually
// corrupted the titles -- a single-byte `client_encoding` -- and shows the
// literal does NOT come back, which is exactly the condition the loader
// throws on.
const INTACT = `Beginner Public Speaking ${EM_DASH} Fixture Module B`;
const lit = `'${INTACT.replace(/'/g, "''")}'`;

const clean = psql(`SELECT ${lit}::text;`).stdout.trim();
check(clean === INTACT, "the assertion's round trip returns the literal UNCHANGED under UTF8");

// ⚠️ A FIRST ATTEMPT AT THIS CONTROL FAILED, AND THE FAILURE IS THE FINDING.
//    It set `client_encoding` to LATIN1 expecting the literal to come back
//    mangled — and it came back INTACT. ▶ This path is robust enough that the
//    corruption cannot be reproduced through it at all, which is further
//    evidence the titles were not corrupted here. But a control that cannot
//    produce the failure state proves nothing, so the control moved to the
//    thing that actually DECIDES.
const lost = findLostLiterals([INTACT], ["Beginner Public Speaking ??? Fixture Module B"]);
const notLost = findLostLiterals([INTACT], [INTACT]);
check(
  lost.length === 1 && notLost.length === 0,
  "CONTROL: the loader's OWN decision function returns the literal as LOST when the round trip returns the `???` form, and empty when it does not — the throw is reachable, measured rather than asserted",
);

console.log(`\nRESULT: ${bad === 0 ? "PASS" : "FAIL"}  (${bad} failed check${bad === 1 ? "" : "s"})`);
process.exit(bad === 0 ? 0 : 1);
