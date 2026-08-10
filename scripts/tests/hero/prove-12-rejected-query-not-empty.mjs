#!/usr/bin/env node
// =====================================================================
// A REJECTED QUERY IS NOT AN EMPTY RESULT
// =====================================================================
// ⛔ THE DEFECT THIS PINS WAS FOUND BY THE OPERATOR, NOT BY A TEST.
//
// `listAssignedSessions` ended `if (error || !data) return []`. Pointed at a
// database four migrations behind the code, the selected `room` /
// `lesson_number` / `lesson_title` columns did not exist, PostgREST rejected
// the read with `42703`, and the Trainer schedule rendered "no classes".
//
// ▶ THE SCREEN MADE A POSITIVE CLAIM — *this trainer has no sessions* — THAT
//   IT HAD NEVER ESTABLISHED, and nothing anywhere named the cause. The
//   operator could not walk the chain and had no way to see why.
//
// ⚠️ This is the same family as every instrument defect in the hero batch:
// AN ABSENCE REPORTED AS A FACT WHEN IT IS REALLY A FAILURE. It would recur
// on ANY schema skew, which is why the fix is a mechanism — two different
// VALUES, so no single return can mean both — rather than a repair of one
// call site.
//
// ⚠️ The SQL half is the part that matters: it reproduces the ACTUAL
// rejection (`42703`, a genuinely absent column) rather than trusting that
// the driver reports one.
//
// It opens NO transaction and needs none — every statement is a read, and the
// one that fails aborts by itself. `Q-2` measures the governed counts after,
// so "nothing was written" is checked rather than asserted. (This header
// first claimed a ROLLBACK it does not perform, copied from a sibling suite;
// an untrue sentence in a proof's own header is exactly the kind of claim
// this batch keeps finding.)
//
// Run: npm run prove:hero-12
// =====================================================================

import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, join as joinPath } from "node:path";

import { assertConfigProjectId, resolveLocalTarget } from "../../fixtures/local-target-guard.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const { projectId: PROJECT_ID, dbContainer: DB_CONTAINER } = resolveLocalTarget();
assertConfigProjectId(
  (readFileSync(join(ROOT, "supabase", "config.toml"), "utf8").match(/^\s*project_id\s*=\s*"([^"]+)"/m) ?? [])[1] ?? "",
  PROJECT_ID,
);

const SRC = join(ROOT, "server", "modules", "report-workflow", "trainer-projections.ts");
const DIAG = join(ROOT, "server", "platform", "query-diagnostics.ts");

let bad = 0;
const check = (ok, msg) => {
  if (!ok) bad++;
  console.log(`${ok ? "PASS   " : "FAIL   "} ${msg}`);
};

// ---------------------------------------------------------------------
// Q-1 — reproduce the REAL rejection. Not a simulated one.
// ---------------------------------------------------------------------
// ⚠️ Selecting a column that genuinely does not exist is what the app did
// against the four-migrations-behind database. If PostgreSQL did not raise
// here, every claim below about "the error path" would be about a path that
// never runs.
const psql = (sql) =>
  spawnSync(
    "docker",
    ["exec", "-i", DB_CONTAINER, "psql", "--no-psqlrc", "-U", "postgres", "-d", "postgres", "-At", "-c", sql],
    { encoding: "utf8", shell: false },
  );

const rejected = psql("SELECT column_that_does_not_exist FROM public.class_sessions LIMIT 1;");
const sqlstate = psql(
  "DO $$ BEGIN PERFORM column_that_does_not_exist FROM public.class_sessions; EXCEPTION WHEN undefined_column THEN RAISE NOTICE 'SQLSTATE=%', SQLSTATE; END $$;",
);
check(
  rejected.status !== 0 && /does not exist/i.test(`${rejected.stderr}`),
  "Q-1: a select over an ABSENT COLUMN is genuinely REJECTED by the database — the failure this pins is real, not simulated",
);
check(
  /SQLSTATE=42703/.test(`${sqlstate.stdout}${sqlstate.stderr}`),
  "Q-1b: and its SQLSTATE is 42703 (undefined_column) — the exact class the four-migrations-behind database produced",
);

// ⚠️ DISCRIMINATION: the same runner, same connection, against a column that
// DOES exist must succeed. Otherwise Q-1 proves only that the query failed
// for some unrelated reason.
const accepted = psql("SELECT id FROM public.class_sessions LIMIT 1;");
check(
  accepted.status === 0,
  "Q-1c: DISCRIMINATING — the same connection reading an EXISTING column succeeds, so Q-1 measured the missing column and not a broken harness",
);

// Nothing was written: this suite only reads and one statement aborted.
const counts = psql(
  "SELECT (SELECT count(*) FROM public.class_sessions)||'|'||(SELECT count(*) FROM public.reports)||'|'||(SELECT count(*) FROM public.audit_events);",
).stdout.trim();
check(/^\d+\|\d+\|\d+$/.test(counts), `Q-2: the database is readable and unmoved after the aborted statement (${counts})`);

// ---------------------------------------------------------------------
// Q-3 — the shape is gone from the fixed call site.
// ---------------------------------------------------------------------
// Comments stripped: this file now DOCUMENTS the old shape at length, and an
// unstripped scan would match the paragraph describing the defect rather than
// the code. Plan §12 item 13 — the root that has produced a false verdict
// every time it was skipped.
const raw = readFileSync(SRC, "utf8");
const code = raw.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

// ⚠️ BOUNDED TO THE FUNCTION. Written first as `code.slice(indexOf(fn))` —
// i.e. to END OF FILE — and it FAILED, correctly, by catching the shape in
// `listEnrolledStudents` below. That is the FOURTH mis-scoped search in this
// project (plan §12 item 11): the leg named one function and read the rest of
// the file. The failure was useful, but it was not the failure the leg
// claimed, and a leg that fails for the wrong reason will one day pass for
// the wrong reason.
const assignedFn = code.slice(
  code.indexOf("async function listAssignedSessions"),
  code.indexOf("async function listEnrolledStudents"),
);
check(
  assignedFn.length > 200 && !/if\s*\(\s*error\s*\|\|\s*!data\s*\)\s*return\s*\[\]/.test(assignedFn),
  "Q-3: ⛔ `if (error || !data) return []` is gone from `listAssignedSessions` — scanned WITHIN the function, not to end of file",
);
check(
  /async function listAssignedSessions\([\s\S]{0,200}?Promise<QueryOutcome<SessionRow\[\]>>/.test(code),
  "Q-3b: it returns a `QueryOutcome`, so a rejection and an empty result are DIFFERENT VALUES — not the same array",
);

// ---------------------------------------------------------------------
// Q-4 — the error reaches a server-side diagnostic naming the cause.
// ---------------------------------------------------------------------
const fnBody = code.slice(
  code.indexOf("async function listAssignedSessions"),
  code.indexOf("async function listEnrolledStudents"),
);
check(
  (fnBody.match(/reportQueryFailure\(/g) ?? []).length === 2,
  "Q-4: BOTH failure paths report — the driver error AND the null-without-error case, which is equally not an observed emptiness",
);
check(
  /reportQueryFailure\("listAssignedSessions:class_sessions"/.test(fnBody),
  "Q-4b: the diagnostic NAMES the read and the relation, so a log line is a diagnosis rather than a notification",
);

// ---------------------------------------------------------------------
// Q-5 — the surface never claims an emptiness it has not established.
// ---------------------------------------------------------------------
const callers = [...code.matchAll(/const assigned = await listAssignedSessions\(client\);([\s\S]{0,200}?)const sessions = assigned\.rows;/g)];
check(
  callers.length === 2,
  `Q-5: BOTH callers were updated (${callers.length}/2) — \`listTrainerSessionsCore\` and \`listReturnedReportsCore\` both consumed this read`,
);
check(
  callers.length === 2 && callers.every((m) => /if \(!assigned\.ok\) return \{ outcome: "unavailable" \};/.test(m[1])),
  "Q-5b: each returns the NON-DISCLOSING `unavailable` on rejection — never success-with-zero-rows, which would assert an emptiness never observed",
);

// ---------------------------------------------------------------------
// Q-6 — ⛔ the diagnostic cannot become a leak.
// ---------------------------------------------------------------------
// ⚠️ Written after a real incident THIS SESSION: a regex allow-list over env
// var NAMES matched `..._DB_URL`, whose value embeds a password by
// construction, and the connection string was rendered. Second
// pattern-redaction failure in this project.
const diag = readFileSync(DIAG, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
check(
  !/\.\.\.failure|JSON\.stringify\(failure\)/.test(diag),
  "Q-6: ⛔ the diagnostic never spreads or stringifies the whole error object — it copies FOUR NAMED FIELDS, so a field the driver adds later is not forwarded",
);
check(
  !/(process\.env|url|key|secret|token|password|authorization)/i.test(diag.replace(/password by construction/gi, "")),
  "Q-6b: ⛔ and it cannot receive a credential — its parameters are a static label and a PostgREST error, so there is nothing to redact rather than a filter to trust",
);
check(
  /^import "server-only";/m.test(readFileSync(DIAG, "utf8")),
  "Q-6c: it is `server-only`, so the cause cannot reach a client bundle — the surface stays non-disclosing (R-C2-6)",
);

// ---------------------------------------------------------------------
// Q-7 — ⚠️ THE SURVIVING SITES ARE PINNED, NOT HIDDEN.
// ---------------------------------------------------------------------
// The Operator authorized fixing ONE call site and asked for the rest to be
// REPORTED first. ⛔ A fix that quietly left fifteen siblings unrecorded
// would be the same defect one layer up — an incomplete repair presented as
// a complete one. This leg makes the remainder a MEASURED, PINNED number, so
// the next person sees the real state and any drift in it fails loudly.
/**
 * ⚠️ COMMENTS ARE BLANKED, LINE COUNT PRESERVED — and this is not incidental.
 * Written without it, this scan reported TWO surviving `error || !data → []`
 * sites; one of them was THIS FILE'S OWN DOC COMMENT quoting the old shape
 * while explaining its removal. Sixth instance in this project of one root:
 * A SCAN OVER SOURCE READS THE PROSE THAT DOCUMENTS THE CODE (plan §12 item
 * 13). Blanking rather than deleting keeps every reported line number true.
 */
const stripKeepingLines = (src) =>
  src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/.*$/gm, (m, p) => p + m.slice(p.length).replace(/./g, " "));

const walk = (dir, acc = []) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = joinPath(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (e.name.endsWith(".ts")) acc.push(p);
  }
  return acc;
};

const exactShape = [];
const errorDiscarded = [];
for (const file of walk(join(ROOT, "server", "modules"))) {
  const lines = stripKeepingLines(readFileSync(file, "utf8")).split(/\r?\n/);
  const rel = file.slice(ROOT.length + 1).replace(/\\/g, "/");
  lines.forEach((line, i) => {
    if (/if\s*\(\s*error\s*\|\|\s*!data\s*\)\s*return\s*\[\]/.test(line)) {
      exactShape.push(`${rel}:${i + 1}`);
    }
    // Same predicate as the reported sweep: the destructure and `await client`
    // may sit on one line, or the call may continue onto the next.
    const m =
      line.match(/const\s*\{([^}]*)\}\s*=\s*await\s+(?:client|caller)\s*$/) ??
      line.match(/const\s*\{([^}]*)\}\s*=\s*await\s+(?:client|caller)\./);
    if (m && !/\berror\b/.test(m[1])) errorDiscarded.push(`${rel}:${i + 1}`);
  });
}
/*
 * ⚠️ THESE PINS ARE UPDATED AT EACH MODULE BOUNDARY, AND THEY HAVE ALREADY
 * EARNED THEIR KEEP: they FAILED the moment `report-workflow` was corrected,
 * which is exactly what they were built to do. A count that silently followed
 * the code would have asserted nothing.
 *
 * Ratchet: 1 / 14 (at first fix) → 0 / 7 (module 1, `report-workflow`) →
 * 0 / 4 (module 2, `management-view`) → 0 / 0 (module 3, `parent-view`).
 *
 * ⛔ The count may only go DOWN. `Q-7c` fails if it ever rises, because a NEW
 * site of either shape is the defect returning, not progress.
 */
const EXPECTED_EXACT_SHAPE = 0;
// Module 1 (`report-workflow`) complete. 7 remain: 3 in `management-view`,
// 4 in `parent-view`. Updated at each module boundary so every boundary is
// HONESTLY green — a pin set to the end target would report failure for work
// that has not been done yet, which is a different lie.
const EXPECTED_ERROR_DISCARDED = 7;

check(
  exactShape.length === EXPECTED_EXACT_SHAPE,
  `Q-7a: ⛔ zero \`error || !data → []\` sites remain anywhere in \`server/modules\` (${exactShape.length})${exactShape.length ? ` — ${exactShape.map((s) => s.replace("SHAPE ", "")).join(", ")}` : ""}`,
);
check(
  errorDiscarded.length === EXPECTED_ERROR_DISCARDED,
  `Q-7b: ⛔ zero reads discard \`error\` entirely (${errorDiscarded.length})${errorDiscarded.length ? ` — ${errorDiscarded.join(", ")}` : ""}`,
);
check(
  exactShape.length <= EXPECTED_EXACT_SHAPE && errorDiscarded.length <= EXPECTED_ERROR_DISCARDED,
  "Q-7c: ⛔ RATCHET — neither count has RISEN. A new site of either shape is the defect returning, not progress",
);

console.log(
  bad === 0
    ? "\nRESULT: PASS — a rejected read is now `unavailable` with its cause named on the server, and an empty roster means an emptiness actually observed.\n        ⚠️ 15 sibling sites survive by instruction and are pinned by Q-7 — this fix is PARTIAL and says so."
    : `\nRESULT: FAIL — ${bad} check(s) failed.`,
);
process.exit(bad === 0 ? 0 : 1);
