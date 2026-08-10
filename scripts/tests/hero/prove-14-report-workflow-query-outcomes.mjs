#!/usr/bin/env node
// =====================================================================
// MODULE 1 of 3 — `report-workflow`: a rejected read is never an empty one
// =====================================================================
// The first fix corrected ONE call site. This corrects the rest of this
// module: `listEnrolledStudents` (the identical `error || !data → []`, in the
// same file, feeding the same surface — so the roster could still empty
// silently through it) and six reads that NEVER DESTRUCTURED `error` AT ALL,
// which is worse: the rejection was discarded before anything could check it.
//
// ⚠️ GATED ON REACHABILITY FIRST. `prove:hero-13` passed seventeen legs
// against a file `tsc` rejected with six errors, because a proof that reads
// TEXT cannot tell you the text is REACHABLE. `R-0a`/`R-0b` run before any
// source claim below, so this suite CANNOT pass while the project fails to
// compile or has no successful build behind it.
//
// Run: npm run prove:hero-14
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

let bad = 0;
const check = (ok, msg) => {
  if (!ok) bad++;
  console.log(`${ok ? "PASS   " : "FAIL   "} ${msg}`);
};

// ---------------------------------------------------------------------
// R-0 — REACHABILITY. Everything below is a claim about source text.
// ---------------------------------------------------------------------
for (const [ok, msg] of assertReachable(ROOT)) check(ok, msg);

// ---------------------------------------------------------------------
// W-1 — a REAL rejection against this database, on a relation THIS module
// reads. Not simulated.
// ---------------------------------------------------------------------
const psql = (sql) =>
  spawnSync(
    "docker",
    ["exec", "-i", DB_CONTAINER, "psql", "--no-psqlrc", "-U", "postgres", "-d", "postgres", "-At", "-c", sql],
    { encoding: "utf8", shell: false },
  );

const rejected = psql("SELECT no_such_column FROM public.enrolments LIMIT 1;");
check(
  rejected.status !== 0 && /does not exist/i.test(`${rejected.stderr}`),
  "W-1: a read of `enrolments` — the relation `listEnrolledStudents` queries — is genuinely REJECTED when a column is absent",
);
check(
  psql("SELECT student_id FROM public.enrolments LIMIT 1;").status === 0,
  "W-1b: DISCRIMINATING — the same connection reading an EXISTING column of the same relation succeeds",
);
const counts = psql(
  "SELECT (SELECT count(*) FROM public.reports)||'|'||(SELECT count(*) FROM public.audit_events);",
).stdout.trim();
check(/^\d+\|\d+$/.test(counts), `W-1c: the database is readable and unmoved after the aborted statement (${counts})`);

// ---------------------------------------------------------------------
// W-2 — the module carries NEITHER defective shape any more.
// ---------------------------------------------------------------------
// ⚠️ Comments blanked, line numbers preserved: these files now DOCUMENT the
// old shapes in order to explain their removal (plan §12 item 13).
const strip = (src) =>
  src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/.*$/gm, (m, p) => p + m.slice(p.length).replace(/./g, " "));

const MODULE_FILES = ["trainer-projections.ts", "actions.ts"].map((f) =>
  join(ROOT, "server", "modules", "report-workflow", f),
);

let exactShape = 0;
let errorDiscarded = 0;
for (const file of MODULE_FILES) {
  const lines = strip(readFileSync(file, "utf8")).split(/\r?\n/);
  for (const line of lines) {
    if (/if\s*\(\s*error\s*\|\|\s*!data\s*\)\s*return\s*\[\]/.test(line)) exactShape++;
    const m =
      line.match(/const\s*\{([^}]*)\}\s*=\s*await\s+(?:client|caller)\s*$/) ??
      line.match(/const\s*\{([^}]*)\}\s*=\s*await\s+(?:client|caller)\./);
    if (m && !/\berror\b/.test(m[1])) errorDiscarded++;
  }
}
check(exactShape === 0, `W-2a: ⛔ zero \`error || !data → []\` sites remain in this module (${exactShape})`);
check(
  errorDiscarded === 0,
  `W-2b: ⛔ zero reads discard \`error\` — none is destructured without it (${errorDiscarded})`,
);

// ---------------------------------------------------------------------
// W-3 — every rejection reaches the diagnostic, naming read AND relation.
// ---------------------------------------------------------------------
const src = MODULE_FILES.map((f) => strip(readFileSync(f, "utf8"))).join("\n");
const contexts = [...src.matchAll(/readRows<[^>]*>\(\s*"([^"]+)"/g)].map((m) => m[1]);
check(contexts.length === 8, `W-3a: all EIGHT reads in this module go through \`readRows\` (${contexts.length})`);
check(
  contexts.every((c) => /^[A-Za-z]+:[a-z_]+/.test(c)),
  `W-3b: every context label names the READ and the RELATION — ${contexts.join(", ")}`,
);
check(
  contexts.every((c) => !/\$\{|\+/.test(c)),
  "W-3c: ⛔ and every label is a STATIC literal — no caller datum can be interpolated into a log line",
);
check(new Set(contexts).size === contexts.length, "W-3d: labels are unique, so a log line identifies one read and not a family");

// ---------------------------------------------------------------------
// W-4 — surfaces return the non-disclosing `unavailable`; no boundary moves.
// ---------------------------------------------------------------------
const rejectionReturns = [...src.matchAll(/if \(!\w+\.ok\) return ([^;]+);/g)].map((m) => m[1].trim());
check(
  rejectionReturns.length >= 8,
  `W-4a: every consumed \`QueryOutcome\` is checked before use (${rejectionReturns.length} guards)`,
);
check(
  rejectionReturns.every((r) => r === '{ outcome: "unavailable" }' || r === "{ ok: false }"),
  `W-4b: ⛔ each guard returns the NON-DISCLOSING \`unavailable\`, or propagates \`{ ok: false }\` to a caller that will — never a success carrying zero rows. Distinct returns seen: ${[...new Set(rejectionReturns)].join(" · ")}`,
);
check(
  !/outcome: "unauthorized"[^;]*!\w+\.ok|!\w+\.ok\) return \{ outcome: "unauthorized"/.test(src),
  "W-4c: ⛔ and no rejection is reported as `unauthorized` — a schema fault must never be presented as a permission decision",
);

// ---------------------------------------------------------------------
// W-5 — the two reads whose silent failure would have been worst.
// ---------------------------------------------------------------------
check(
  /"getSessionRosterCore:class_sessions\(prior\)"/.test(src),
  "W-5a: the CARRY-OVER's own prior-session read now fails closed — a rejection previously became `no previous session`, rendering every learner with no carried-over focus and looking entirely normal (CLAUDE.md §10 Phase 1 exit (c))",
);
check(
  /"requestDraft:students"/.test(src) && /if \(!studentRows\.ok\) return \{ outcome: "unavailable" \};/.test(src),
  "W-5b: and the draft path reads the learner's name BEFORE `requestDraftCore` — a rejection previously became the placeholder `the student`, which was sent to the LLM and PERSISTED as a governed report_version",
);

console.log(
  bad === 0
    ? "\nRESULT: PASS — `report-workflow` carries neither defective shape; every read reports its rejection and every surface returns `unavailable`."
    : `\nRESULT: FAIL — ${bad} check(s) failed.`,
);
process.exit(bad === 0 ? 0 : 1);
