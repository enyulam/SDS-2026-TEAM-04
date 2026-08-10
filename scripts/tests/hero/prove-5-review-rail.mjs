#!/usr/bin/env node
// =====================================================================
// HERO PHASE 5 -- `07` Trainer Grade Student: the REVIEW & APPROVE rail
// =====================================================================
// ⚠️ PHASE 5 BUILT NO SURFACE, AND THAT IS THE FINDING, NOT AN OMISSION.
// The plan classified this screen's only delta -- "rail bucket counts and
// per-learner status" -- as NEEDS NEW PROJECTION. Measured at HEAD, the
// rail EXISTS: `ReviewApproveRail` renders four counters over the governed
// report states and the Class Session's learner list, fed from
// `getSessionRosterCore`, with absent learners counted in NO bucket. A
// delta table is a READING of a frame, not a measurement of the build --
// the same discipline that produced the no-trainer-row ruling on `33`.
//
// So this suite exists to close the one thing NOTHING pinned:
//
//   ⚠️ THE BUCKETS MUST PARTITION THE STATUSES THE DATABASE ACTUALLY HAS.
//   The four buckets enumerate report states in a HAND-AUTHORED list. If a
//   ninth `report_status` label ever existed, a present learner in it would
//   be counted in NO bucket while still appearing in the list below --
//   counters and list silently disagreeing, on the screen a trainer uses to
//   decide who still needs assessing. Nothing detected that.
//
// ⚠️ THE LABEL SET IS READ FROM `pg_enum`, NOT RESTATED HERE. A test that
// restates the thing it measures cannot fail when the thing changes -- the
// defect already recorded against the hand-authored route census.
//
// It writes NOTHING and opens no transaction: every leg is a read.
//
// Run: npm run prove:hero-5
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

const ASSESS = join(ROOT, "features", "trainer", "trainer-assessment.tsx");
const CONTRACT = join(ROOT, "lib", "frontend", "contracts", "physical-test.ts");

// ---- the enum, READ from the catalogue --------------------------------
const enumOut = spawnSync("docker", ["exec", "-i", DB_CONTAINER, "psql", "--no-psqlrc", "-U", "postgres",
  "-d", "postgres", "-At", "-c",
  "SELECT e.enumlabel FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid WHERE t.typname = 'report_status' ORDER BY e.enumsortorder;",
], { encoding: "utf8", shell: false });
const dbStatuses = enumOut.stdout.trim().split(/\r?\n/).filter(Boolean);

// ---- the buckets, READ from the component source ----------------------
const source = readFileSync(ASSESS, "utf8");
const bucketsBlock = (source.match(/const REVIEW_BUCKETS = \[([\s\S]*?)\n\] as const/) ?? [])[1] ?? "";
const buckets = [...bucketsBlock.matchAll(/key:\s*"([a-z_]+)"[\s\S]*?states:\s*\[([^\]]*)\]/g)].map((m) => ({
  key: m[1],
  states: [...m[2].matchAll(/"([a-z_]+)"/g)].map((s) => s[1]),
}));
const covered = buckets.flatMap((b) => b.states);

// `no_report` is the projection's own synthetic state for a learner with no
// report row at all. It is not a `report_status` label and must be covered too.
const expected = [...dbStatuses, "no_report"];
const missing = expected.filter((s) => !covered.includes(s));
const unknown = covered.filter((s) => !expected.includes(s));
const duplicated = covered.filter((s, i) => covered.indexOf(s) !== i);

// ---- the rail's inputs -------------------------------------------------
// ⚠️ Bounded by the NEXT top-level declaration, not by the first `\n}\n`.
// An earlier revision used the latter and captured only the parameter list,
// so P5-5 reported FAIL against a predicate that was plainly present three
// lines further down. Same shape as the emitted-CSS false MISSING: a negative
// result from a search you wrote is evidence about the search until the search
// is proven discriminating — which is what P5-5b below now measures.
const railStart = source.indexOf("function ReviewApproveRail(");
const railEnd = source.indexOf("function RailEntry(", railStart + 1);
const railBlock = railStart < 0 ? "" : source.slice(railStart, railEnd < 0 ? source.length : railEnd);
const excludesAbsent = railBlock.includes('entry.attendanceState === "present"');
const contract = readFileSync(CONTRACT, "utf8");
const rosterDto = (contract.match(/export type RosterEntryDto = \{([\s\S]*?)\n\};/) ?? [])[1] ?? "";

let bad = 0;
const check = (ok, msg) => {
  if (!ok) bad++;
  console.log(`${ok ? "PASS   " : "FAIL   "} ${msg}`);
};

console.log(`report_status labels read from pg_enum: ${dbStatuses.length} — ${dbStatuses.join(", ")}`);
console.log(`REVIEW_BUCKETS read from source: ${buckets.length} buckets covering ${covered.length} state(s)\n`);

// ⚠️ NON-VACUITY FIRST. Every leg below compares two sets; if either were
// empty the comparisons would all pass while measuring nothing — the S-8
// failure shape. Both are pinned to the ratified figures.
check(dbStatuses.length === 8, `P5-1a: NON-VACUOUS — the database really holds the 8 ratified report_status labels (${dbStatuses.length})`);
check(buckets.length === 4, `P5-1b: NON-VACUOUS — four buckets were parsed out of the component (${buckets.length})`);

check(
  missing.length === 0,
  `P5-2: ⚠️ the buckets COVER every status the database has, plus \`no_report\`${missing.length ? ` (uncovered: ${missing.join(", ")})` : ""} — an uncovered status makes a present learner vanish from the counters while still appearing in the list`,
);
check(
  duplicated.length === 0,
  `P5-3: no status is counted TWICE${duplicated.length ? ` (duplicated: ${duplicated.join(", ")})` : ""} — the four counters must partition the learners, not overlap them`,
);
check(
  unknown.length === 0,
  `P5-4: no bucket names a status the database does not have${unknown.length ? ` (unknown: ${unknown.join(", ")})` : ""}`,
);
check(
  excludesAbsent,
  "P5-5a: ⛔ absent learners are counted in NO bucket — absence exposes no report state (A-018), asserted on the counting predicate itself",
);
// ⚠️ The search must be shown to be looking at the right thing. Without this,
// a mis-scoped extraction reports FAIL (or, worse, a rewritten assertion
// reports PASS) about a region it never actually read.
check(
  railBlock.includes("REVIEW_BUCKETS") && railBlock.includes("data-review-bucket"),
  "P5-5b: the extracted region really IS the rail — it contains both the bucket map and the rendered counter, so P5-5a read the counting code and not an empty slice",
);
check(
  rosterDto.includes("reportState") && rosterDto.includes("attendanceState"),
  "P5-6: the rail's only two inputs are still on the GOVERNED roster DTO — it derives no state of its own and issues no second read",
);

console.log(
  bad === 0
    ? "\nRESULT: PASS — the rail's four buckets partition every status the DATABASE actually has, read from pg_enum rather than restated here."
    : `\nRESULT: FAIL — ${bad} check(s) failed.`,
);
process.exit(bad === 0 ? 0 : 1);
