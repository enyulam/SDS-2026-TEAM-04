#!/usr/bin/env node
// =====================================================================
// MODULE 2 of 3 — `management-view`: the queue spine fails closed
// =====================================================================
// All three reads in `listCentrePairs` DISCARDED `error` — none was even
// destructured. That enumeration is the SPINE of the pending-final-review
// queue, so a rejection silently shortened the list of (session, student)
// pairs, and a pair that never enters the list is never gated, never rendered
// and never counted.
//
// ⛔ Screen `29` would have said "No reports waiting" — a positive claim that
// the final-review queue is CLEAR — while trainer-approved reports sat
// unreviewed. Management's final review is the ONLY gate between a trainer
// approval and a parent seeing a report (A-033), so this did not degrade a
// display: IT MADE A GOVERNED REVIEW STEP INVISIBLE.
//
// ⚠️ Gated on reachability first — a proof that reads text cannot tell you
// the text is reachable (`prove:hero-13`).
//
// Run: npm run prove:hero-15
// =====================================================================

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { assertConfigProjectId, resolveLocalTarget } from "../../fixtures/local-target-guard.mjs";
import { assertReachable } from "./reachability-gate.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const { projectId: PROJECT_ID, dbContainer: DB_CONTAINER } = resolveLocalTarget();
assertConfigProjectId(
  (readFileSync(join(ROOT, "supabase", "config.toml"), "utf8").match(/^\s*project_id\s*=\s*"([^"]+)"/m) ?? [])[1] ?? "",
  PROJECT_ID,
);

const FILE = join(ROOT, "server", "modules", "management-view", "projections.ts");

let bad = 0;
const check = (ok, msg) => {
  if (!ok) bad++;
  console.log(`${ok ? "PASS   " : "FAIL   "} ${msg}`);
};

for (const [ok, msg] of assertReachable(ROOT)) check(ok, msg);

// ---------------------------------------------------------------------
// M-1 — a REAL rejection, on a relation THIS module's spine reads.
// ---------------------------------------------------------------------
const psql = (sql) =>
  spawnSync(
    "docker",
    ["exec", "-i", DB_CONTAINER, "psql", "--no-psqlrc", "-U", "postgres", "-d", "postgres", "-At", "-c", sql],
    { encoding: "utf8", shell: false },
  );

check(
  psql("SELECT no_such_column FROM public.class_sessions LIMIT 1;").status !== 0,
  "M-1: a read of `class_sessions` — the first read of the queue spine — is genuinely REJECTED when a column is absent",
);
check(
  psql("SELECT id, session_date, class_module_id FROM public.class_sessions LIMIT 1;").status === 0,
  "M-1b: DISCRIMINATING — the SAME select list `listCentrePairs` uses succeeds against the real schema",
);
const counts = psql(
  "SELECT (SELECT count(*) FROM public.reports)||'|'||(SELECT count(*) FROM public.audit_events);",
).stdout.trim();
check(/^\d+\|\d+$/.test(counts), `M-1c: the database is readable and unmoved (${counts})`);

// ---------------------------------------------------------------------
// M-2 — neither defective shape survives in this module.
// ---------------------------------------------------------------------
const strip = (src) =>
  src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/.*$/gm, (m, p) => p + m.slice(p.length).replace(/./g, " "));
const code = strip(readFileSync(FILE, "utf8"));

check(code.length > 3000, `M-2a: NON-VACUOUS — the stripped module is real (${code.length} chars)`);
check(
  !/if\s*\(\s*error\s*\|\|\s*!data\s*\)\s*return\s*\[\]/.test(code),
  "M-2b: ⛔ no `error || !data → []` site",
);
const discarded = code.split(/\r?\n/).filter((l) => {
  const m =
    l.match(/const\s*\{([^}]*)\}\s*=\s*await\s+(?:client|caller)\s*$/) ??
    l.match(/const\s*\{([^}]*)\}\s*=\s*await\s+(?:client|caller)\./);
  return m && !/\berror\b/.test(m[1]);
});
check(discarded.length === 0, `M-2c: ⛔ no read discards \`error\` (${discarded.length})`);

// ---------------------------------------------------------------------
// M-3 — all three spine reads report, with static unique labels.
// ---------------------------------------------------------------------
const contexts = [...code.matchAll(/readRows<[^>]*>\(\s*"([^"]+)"/g)].map((m) => m[1]);
check(contexts.length === 3, `M-3a: all THREE spine reads go through \`readRows\` (${contexts.length})`);
check(
  contexts.join(",") === "listCentrePairs:class_sessions,listCentrePairs:enrolments,listCentrePairs:students",
  `M-3b: each names the read and its relation — ${contexts.join(", ")}`,
);
check(
  contexts.every((c) => !/\$\{|\+/.test(c)),
  "M-3c: ⛔ every label is a STATIC literal — no caller datum can reach a log line",
);

// ---------------------------------------------------------------------
// M-4 — the queue returns `unavailable`, never an empty queue.
// ---------------------------------------------------------------------
check(
  /if \(!pairs\.ok\) return \{ outcome: "unavailable" \};/.test(code),
  'M-4a: ⛔ a rejected enumeration returns `unavailable` — never a success rendering "No reports waiting"',
);
check(
  /async function listCentrePairs\([\s\S]{0,120}?Promise<QueryOutcome<PairRow\[\]>>/.test(code),
  "M-4b: `listCentrePairs` returns a `QueryOutcome`, so a rejection and an empty centre are DIFFERENT VALUES",
);
check(
  (code.match(/if \(!\w+\.ok\) return \{ ok: false \};/g) ?? []).length === 3,
  "M-4c: each of the three reads propagates its rejection rather than continuing with partial pairs",
);

// ---------------------------------------------------------------------
// M-5 — ⛔ §5.5 did not move while this module was edited.
// ---------------------------------------------------------------------
// ⚠️ Touching a projection is exactly when an exclusion slips, so it is
// re-checked here rather than assumed from the Phase 9 proof.
const dto = code.slice(
  code.indexOf("export interface ManagementQueueRowDto"),
  code.indexOf("export interface ManagementReviewDto"),
);
check(dto.length > 200, "M-5a: NON-VACUOUS — the queue DTO was located");
for (const [label, pattern] of [
  ["ratings", /rating|dimension|competency/i],
  ["trainer notes or observations", /observation|trainerNote|coachNote|followUp/i],
  ["attendance", /attendance/i],
  ["a content hash", /contentHash|\bhash\b/i],
  ["a term (G-4)", /\bterm\b/i],
]) {
  check(!pattern.test(dto), `M-5: ⛔ the queue DTO still carries no ${label}`);
}
check(
  /classGradeLabel|lessonNumber|trainerDisplayName/.test(dto),
  "M-5b: DISCRIMINATING — the same slice DOES contain the Phase 9 context fields, so the scans ran against real content",
);

console.log(
  bad === 0
    ? "\nRESULT: PASS — the management queue spine fails closed; a rejected enumeration is `unavailable`, never an empty final-review queue."
    : `\nRESULT: FAIL — ${bad} check(s) failed.`,
);
process.exit(bad === 0 ? 0 : 1);
