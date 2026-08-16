#!/usr/bin/env node
// =====================================================================
// MODULE 3 of 3 — `parent-view`: a fault must never be reported as a fact
//                 about a family
// =====================================================================
// All four reads discarded `error`, and what CONSUMES them is what makes this
// the most consequential of the fifteen:
//
//   * `getParentAvailabilityCore` branches on `linked.length === 0` →
//     `none_yet`, which the Parent Dashboard renders as **"No learner linked
//     to this account yet"**. ⛔ A REJECTED READ TOLD A PARENT, IN PLAIN
//     LANGUAGE, THAT NO LEARNER IS LINKED TO THEIR ACCOUNT — a false
//     statement about their own family, from a fault they could not see.
//   * An empty report list renders "No report published yet" — withholding a
//     SUBMITTED report from the audience it was published to.
//
// ⚠️ The copy fix that made those sentences honest is exactly what made these
// reads' failure mode dangerous: THE CLEARER THE EMPTY STATE, THE MORE
// CONVINCING THE LIE.
//
// ⛔ R-C2-6 IS NOT WEAKENED. The parent-facing denial stays a single
// indistinguishable outcome; what changed is that a FAULT is no longer
// reported as a FACT. `P-5` pins the one read that must KEEP its silent
// `continue` — the per-pair canonical RPC, whose silence IS the
// non-disclosure.
//
// Run: npm run prove:hero-16
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

const FILE = join(ROOT, "server", "modules", "parent-view", "projections.ts");

let bad = 0;
const check = (ok, msg) => {
  if (!ok) bad++;
  console.log(`${ok ? "PASS   " : "FAIL   "} ${msg}`);
};

for (const [ok, msg] of assertReachable(ROOT)) check(ok, msg);

// ---------------------------------------------------------------------
// P-1 — a REAL rejection on the relation that decides `none_yet`.
// ---------------------------------------------------------------------
const psql = (sql) =>
  spawnSync(
    "docker",
    ["exec", "-i", DB_CONTAINER, "psql", "--no-psqlrc", "-U", "postgres", "-d", "postgres", "-At", "-c", sql],
    { encoding: "utf8", shell: false },
  );

check(
  psql("SELECT no_such_column FROM public.parent_student_links LIMIT 1;").status !== 0,
  "P-1: a read of `parent_student_links` — the relation whose emptiness produces `none_yet` — is genuinely REJECTED when a column is absent",
);
check(
  psql("SELECT student_id, is_active FROM public.parent_student_links LIMIT 1;").status === 0,
  "P-1b: DISCRIMINATING — the SAME select list `listLinkedStudents` uses succeeds against the real schema",
);
const counts = psql(
  "SELECT (SELECT count(*) FROM public.reports)||'|'||(SELECT count(*) FROM public.audit_events);",
).stdout.trim();
check(/^\d+\|\d+$/.test(counts), `P-1c: the database is readable and unmoved (${counts})`);

// ---------------------------------------------------------------------
// P-2 — neither defective shape survives, in this module or anywhere.
// ---------------------------------------------------------------------
const strip = (src) =>
  src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/.*$/gm, (m, p) => p + m.slice(p.length).replace(/./g, " "));
const code = strip(readFileSync(FILE, "utf8"));

check(code.length > 3000, `P-2a: NON-VACUOUS — the stripped module is real (${code.length} chars)`);
const discarded = code.split(/\r?\n/).filter((l) => {
  const m =
    l.match(/const\s*\{([^}]*)\}\s*=\s*await\s+(?:client|caller)\s*$/) ??
    l.match(/const\s*\{([^}]*)\}\s*=\s*await\s+(?:client|caller)\./);
  return m && !/\berror\b/.test(m[1]);
});
check(discarded.length === 0, `P-2b: ⛔ no read discards \`error\` (${discarded.length})`);

// ---------------------------------------------------------------------
// P-3 — the two claims about the family fail closed.
// ---------------------------------------------------------------------
check(
  /if \(!linked\.ok\) return \{ outcome: "unavailable" \};\s*if \(linked\.rows\.length === 0\) return \{ outcome: "success", data: "none_yet" \};/.test(
    code.replace(/\s+/g, " ").replace(/ /g, " "),
  ) ||
    (/if \(!linked\.ok\) return \{ outcome: "unavailable" \};/.test(code) &&
      /if \(linked\.rows\.length === 0\) return \{ outcome: "success", data: "none_yet" \};/.test(code)),
  "P-3a: ⛔ `none_yet` is now reachable ONLY from an OBSERVED absence of links — a rejection returns `unavailable` before that branch",
);
check(
  (code.match(/if \(!\w+\.ok\) return \{ outcome: "unavailable" \};/g) ?? []).length >= 3,
  "P-3b: the report list also fails closed on its enrolment and session reads — an empty list renders `No report published yet`, which would withhold a SUBMITTED report from the audience it was published to",
);
check(
  /async function listLinkedStudents\([\s\S]{0,140}?Promise<QueryOutcome</.test(code),
  "P-3c: `listLinkedStudents` returns a `QueryOutcome`, so a rejection and a family with no links are DIFFERENT VALUES",
);

// ---------------------------------------------------------------------
// P-4 — labels are static, unique, and name read + relation.
// ---------------------------------------------------------------------
/*
 * ⚠️ WIDENED TO ALL THREE HELPERS 2026-08-16, AND THE COUNT DOES NOT MOVE.
 * Measured: parent-view has 4 reads under the narrow pattern and 4 under the
 * wide one — no blind spot here. ⛔ `prove:hero-15`'s sibling leg DID have one
 * (`gatedReview` used `readMaybeRow` and was never watched), so the pattern is
 * widened here PREVENTIVELY: this module is one `readMaybeRow` away from the
 * same silent gap, and a pin is only as exact as the pattern defining its
 * population.
 */
const contexts = [...code.matchAll(/read(?:Rows|RpcRows|MaybeRow)<[^>]*>\(\s*"([^"]+)"/g)].map((m) => m[1]);
check(contexts.length === 4, `P-4a: all FOUR reads go through \`readRows\` (${contexts.length})`);
check(
  contexts.every((c) => /^[A-Za-z]+:[a-z_]+$/.test(c)) && new Set(contexts).size === 4,
  `P-4b: each label is static, unique, and names read + relation — ${contexts.join(", ")}`,
);

// ---------------------------------------------------------------------
// P-5 — ⛔ THE READ THAT MUST KEEP ITS SILENCE.
// ---------------------------------------------------------------------
// ⚠️ The per-pair `report_get_canonical` call deliberately does `if (error)
// continue`. That silence IS the non-disclosure R-C2-6 requires: a parent must
// not be able to distinguish "not yours" from "nothing submitted" by the shape
// of the answer. Converting it to `unavailable` would have turned an
// authorization boundary into a distinguishable signal. It was left alone
// ON PURPOSE, and this leg exists so nobody later "completes" the sweep by
// changing it.
check(
  /if \(error\) continue;/.test(code),
  "P-5: ⛔ the per-pair canonical RPC KEEPS its silent `continue` — that silence is the R-C2-6 non-disclosure, not an instance of this defect",
);
check(
  !/readRows[\s\S]{0,80}report_get_canonical/.test(code),
  "P-5b: and it was NOT converted to `readRows` — a uniform sweep would have broken the boundary it protects",
);

// ---------------------------------------------------------------------
// P-6 — ⛔ Q-27 did not move while this module was edited.
// ---------------------------------------------------------------------
const dto = code.slice(
  code.indexOf("export interface ParentReportListItemDto"),
  code.indexOf("}", code.indexOf("export interface ParentReportListItemDto")),
);
check(dto.length > 100, "P-6a: NON-VACUOUS — the parent list DTO was located");
check(
  !/rating|dimension|competency|beginning|developing|mastering|mastered/i.test(dto),
  "P-6b: ⛔ Q-27 — the parent list DTO still carries no rating field for anything to bind to",
);
check(
  /studentDisplayName|lessonTitle|trainerDisplayName/.test(dto),
  "P-6c: DISCRIMINATING — the same slice DOES contain its real fields, so P-6b scanned real content",
);

console.log(
  bad === 0
    ? "\nRESULT: PASS — `parent-view` fails closed; a fault is no longer reported as a fact about a family, and the one read whose silence IS the boundary keeps it."
    : `\nRESULT: FAIL — ${bad} check(s) failed.`,
);
process.exit(bad === 0 ? 0 : 1);
