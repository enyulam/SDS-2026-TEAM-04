#!/usr/bin/env node
// =====================================================================
// ⛔ EVERY PROJECTION'S COLUMNS, AGAINST THE LIVE CATALOGUE
// =====================================================================
// See `projection-column-rule.mjs` for why this exists and what `tsc`
// provably cannot cover.
//
// ⛔ Exit code is the only verdict. An unreachable stack is NOT-RUN (exit 2),
//    never a pass.
//
// Run: npm run prove:projection-columns
// =====================================================================

import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

import { resolveLocalTarget } from "../../fixtures/local-target-guard.mjs";
import { extractQueries, unknownColumns } from "./projection-column-rule.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const { dbContainer: DB_CONTAINER } = resolveLocalTarget();

let bad = 0;
const check = (ok, msg) => {
  if (!ok) bad += 1;
  console.log(`${ok ? "PASS" : "FAIL"}    ${msg}`);
};

const psql = (sql) =>
  (
    spawnSync(
      "docker",
      ["exec", "-i", DB_CONTAINER, "psql", "--no-psqlrc", "-U", "postgres", "-d", "postgres", "-tAX", "-c", sql],
      { encoding: "utf8" },
    ).stdout ?? ""
  ).trim();

// ---------------------------------------------------------------------
// The LIVE catalogue. Never the generated types — those were stale once.
// ---------------------------------------------------------------------
const raw = psql(
  "SELECT table_name || '|' || column_name FROM information_schema.columns WHERE table_schema='public';",
);
const catalogue = new Map();
for (const line of raw.split("\n")) {
  const [t, c] = line.trim().split("|");
  if (!t || !c) continue;
  if (!catalogue.has(t)) catalogue.set(t, new Set());
  catalogue.get(t).add(c);
}

if (catalogue.size < 20) {
  console.log(`NOT-RUN  the catalogue read returned ${catalogue.size} table(s) — the stack is unreachable`);
  console.log("         ⛔ NOT A PASS: an absent catalogue cannot prove agreement");
  process.exit(2);
}

// ---------------------------------------------------------------------
// Every server-side source file.
// ---------------------------------------------------------------------
const files = [];
(function walk(dir) {
  for (const e of readdirSync(dir)) {
    if (e === "node_modules" || e === ".next") continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.ts$/.test(e)) files.push(p);
  }
})(join(ROOT, "server"));

let queryCount = 0;
let nestedCount = 0;
const findings = [];
for (const f of files) {
  const queries = extractQueries(readFileSync(f, "utf8"));
  queryCount += queries.length;
  nestedCount += queries.filter((q) => q.nested).length;
  for (const b of unknownColumns(queries, catalogue)) {
    findings.push({ ...b, file: relative(ROOT, f).split("\\").join("/") });
  }
}

// ---------------------------------------------------------------------
// PC-1 -- NON-VACUITY FIRST.
// ---------------------------------------------------------------------
check(
  catalogue.size >= 20 && queryCount >= 20,
  `PC-1  ⚠️ NON-VACUITY FIRST: ${catalogue.size} live table(s) and ${queryCount} parsed quer(ies) — ▶ if either collapsed, PC-3 below would sweep an EMPTY SET and report a green meaning "nothing was checked"`,
);

// ---------------------------------------------------------------------
// PC-2 -- THE DETECTOR MUST BE ABLE TO FIRE.
// ---------------------------------------------------------------------
/*
 * ⚠️ THE PLANT IS SHAPED LIKE REAL SOURCE, and the first draft was not — it was
 * a single line, the parser needs a chain terminator, and so the CONTROL
 * reported "the detector is blind" while PC-3 was detecting the very same
 * defect two lines below. ▶ **A control that fails while its subject works is
 * the lucky orientation**; the same mistake written the other way round is a
 * control that PASSES while the detector sees nothing.
 */
const planted = extractQueries(
  [
    "  const rows = await readRows(() =>",
    '    client.from("class_session_assignments")',
    '      .select("class_session_id, membership_id")',
    '      .in("membership_id", ids),',
    "  );",
  ].join("\n"),
);
const plantedBad = unknownColumns(planted, catalogue);
check(
  plantedBad.length === 2 &&
    plantedBad.every((b) => b.column === "membership_id"),
  `PC-2  ⛔ CONTROL: the exact defect screen \`23\` shipped is detected in both positions (${plantedBad.map((b) => b.where).join(" + ") || "NOTHING — the detector is blind"}) — ▶ without this, a clean PC-3 would be indistinguishable from a broken parser`,
);

// ---------------------------------------------------------------------
// PC-2b -- ...AND MUST NOT FIRE ON THE CORRECT NAME.
// ---------------------------------------------------------------------
const good = unknownColumns(
  extractQueries(
    [
      "  const rows = await readRows(() =>",
      '    client.from("class_session_assignments")',
      '      .select("class_session_id, trainer_membership_id")',
      '      .in("trainer_membership_id", ids),',
      "  );",
    ].join("\n"),
  ),
  catalogue,
);
check(
  good.length === 0,
  `PC-2b ⛔ AND THE CONTROL DISCRIMINATES: the CORRECT column produces ${good.length} finding(s) — ▶ a detector that flags everything is as useless as one that flags nothing`,
);

// ---------------------------------------------------------------------
// PC-3 -- THE SWEEP.
// ---------------------------------------------------------------------
check(
  findings.length === 0,
  `PC-3  every column named by a projection exists in the live schema (${findings.length} unknown reference(s))`,
);
for (const f of findings) {
  console.log(`          ⛔ ${f.file}: ${f.table}.${f.column} [${f.where}]`);
}

// ---------------------------------------------------------------------
// PC-4 -- STATED LIMIT, not implied by a green run.
// ---------------------------------------------------------------------
console.log(
  `INFO    PC-4  ⚠️ STATED LIMIT: ${nestedCount} quer(ies) use EMBEDDED RESOURCE syntax and are NOT column-checked here — a nested select is a different grammar and checking it with this parser would produce false reds, which is how a gate stops being read (§12.13)`,
);

console.log(`\nRESULT: ${bad === 0 ? "PASS" : "FAIL"}  (${bad} failed checks)`);
process.exit(bad === 0 ? 0 : 1);
