#!/usr/bin/env node
// =====================================================================
// ⛔ EVERY `.rpc()` CALL SITE'S ARGUMENTS, AGAINST THE LIVE SIGNATURE
// =====================================================================
// See `rpc-argument-rule.mjs` for why this exists and what the type system
// provably cannot cover since `Functions` was dropped from `AppDatabase`.
//
// ⛔ Exit code is the only verdict. An unreachable stack is NOT-RUN (exit 2),
//    never a pass — an absent catalogue cannot prove agreement.
//
// Run: npm run prove:rpc-arguments
// =====================================================================

import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

import { resolveLocalTarget } from "../../fixtures/local-target-guard.mjs";
import {
  extractRpcCalls,
  inputParams,
  argumentMismatches,
  sqlArityMismatches,
} from "./rpc-argument-rule.mjs";

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
// The LIVE signatures. Never `database.types.ts` — which has been stale
// once already, and which no longer types Functions at all.
// ---------------------------------------------------------------------
const rawSigs = psql(
  "SELECT p.proname || '|' || pg_get_function_arguments(p.oid) " +
    "FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'public';",
);
const signatures = new Map();
for (const line of rawSigs.split("\n")) {
  const i = line.indexOf("|");
  if (i < 0) continue;
  const name = line.slice(0, i).trim();
  if (!name) continue;
  signatures.set(name, inputParams(line.slice(i + 1)));
}

if (signatures.size < 20) {
  console.log(`NOT-RUN  the signature read returned ${signatures.size} function(s) — the stack is unreachable`);
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

let callCount = 0;
const dynamicSites = [];
const findings = [];
for (const f of files) {
  const rel = relative(ROOT, f).split("\\").join("/");
  const calls = extractRpcCalls(readFileSync(f, "utf8"));
  callCount += calls.length;
  for (const c of calls) if (c.dynamic) dynamicSites.push(`${rel}: ${c.fn}()`);
  for (const b of argumentMismatches(calls, signatures)) {
    findings.push({ ...b, file: rel });
  }
}

// ---------------------------------------------------------------------
// PR-1 -- NON-VACUITY FIRST.
// ---------------------------------------------------------------------
check(
  signatures.size >= 20 && callCount >= 20,
  `PR-1  ⚠️ NON-VACUITY FIRST: ${signatures.size} live function(s) and ${callCount} parsed \`.rpc()\` call site(s) — ▶ if either collapsed, PR-4 below would sweep an EMPTY SET and report a green meaning "nothing was checked"`,
);

// ---------------------------------------------------------------------
// PR-2 -- THE DETECTOR MUST FIRE, IN BOTH DIRECTIONS.
// ---------------------------------------------------------------------
/*
 * ⛔ A FIXED SYNTHETIC SIGNATURE, NOT A SLICE OF THE LIVE MAP — §12.17,
 * recorded one pass ago from the ledger gate, where controls derived from live
 * state went red alongside the real finding they existed to detect. ▶ **A
 * control derived from live state is polluted by the very fault it exists to
 * detect.** This signature is a literal and cannot collide with anything.
 */
const CTRL_SIGS = new Map([
  ["ctrl_fn", { required: ["p_alpha", "p_beta"], accepted: ["p_alpha", "p_beta", "p_opt"] }],
]);

// The exact fault the Operator named: a caller left on the OLD, shorter list
// after a DROP + CREATE widened the signature.
const stale = argumentMismatches(
  extractRpcCalls(
    [
      "  const call = await client.rpc(\"ctrl_fn\", {",
      "    p_alpha: input.alpha,",
      "  });",
    ].join("\n"),
  ),
  CTRL_SIGS,
);
check(
  stale.length === 1 && stale[0].kind === "MISSING ARGUMENT" && stale[0].missing.join() === "p_beta",
  `PR-2a ⛔ CONTROL — STALE CALL SITE: a caller passing the old, shorter argument list yields ${stale.length} finding(s) [${stale.map((s) => s.kind + " " + s.missing.join("+")).join("; ") || "NOTHING — the detector is blind"}] — ▶ this is the exact defect the type system stopped covering when \`Functions\` was dropped from \`AppDatabase\``,
);

// The other direction: a caller passing an argument the function no longer takes.
const renamed = argumentMismatches(
  extractRpcCalls(
    [
      "  const call = await client.rpc(\"ctrl_fn\", {",
      "    p_alpha: a,",
      "    p_beta: b,",
      "    p_gone: c,",
      "  });",
    ].join("\n"),
  ),
  CTRL_SIGS,
);
check(
  renamed.length === 1 && renamed[0].kind === "UNKNOWN ARGUMENT" && renamed[0].extra.join() === "p_gone",
  `PR-2b ⛔ CONTROL — REMOVED/RENAMED PARAMETER: a caller passing an argument the function does not accept yields ${renamed.length} finding(s) [${renamed.map((s) => s.kind + " " + s.extra.join("+")).join("; ") || "NOTHING"}] — ▶ a gate catching only the shrinking direction is half a gate`,
);

// A function that no longer exists at all — the `PGRST202` shape.
const gone = argumentMismatches(extractRpcCalls('await client.rpc("ctrl_removed", { p_x: 1 });'), CTRL_SIGS);
check(
  gone.length === 1 && gone[0].kind === "NO SUCH FUNCTION",
  `PR-2c ⛔ CONTROL — VANISHED FUNCTION: calling a name absent from the catalogue yields ${gone.length} finding(s) [${gone.map((s) => s.kind).join("; ") || "NOTHING"}] — ▶ a DROP without a matching CREATE is the same runtime failure by another route`,
);

// ---------------------------------------------------------------------
// PR-3 -- ...AND MUST NOT FIRE ON CORRECT CODE.
// ---------------------------------------------------------------------
const correct = argumentMismatches(
  extractRpcCalls(
    ['  const call = await client.rpc("ctrl_fn", {', "    p_alpha: a,", "    p_beta: b,", "  });"].join("\n"),
  ),
  CTRL_SIGS,
);
const defaulted = argumentMismatches(extractRpcCalls('await client.rpc("ctrl_fn", { p_alpha: a, p_beta: b, p_opt: c });'), CTRL_SIGS);
check(
  correct.length === 0 && defaulted.length === 0,
  `PR-3  ⛔ AND THE CONTROL DISCRIMINATES: the correct set yields ${correct.length}, and supplying an OPTIONAL (\`DEFAULT\`) parameter yields ${defaulted.length} — ▶ omitting a defaulted parameter is LEGAL, so treating \`accepted\` as \`required\` would red every correct site and the gate would stop being read (§12.13)`,
);

// ---------------------------------------------------------------------
// PR-3b -- THE SCANNER'S OWN BEHAVIOUR, because PR-3 caught it failing once.
// ---------------------------------------------------------------------
/*
 * ⚠️ THESE TWO EXIST BECAUSE THE FIRST SCANNER GOT BOTH WRONG. It required each
 * key to start its own line, so the single-line form above lost every key after
 * the first — a FALSE `MISSING ARGUMENT` on correct code. The repair was a
 * depth-aware scan, and a repair with no control is a claim.
 */
const oneLine = extractRpcCalls('await client.rpc("ctrl_fn", { p_alpha: a, p_beta: b, p_opt: c });')[0];
const nested = extractRpcCalls(
  ['await client.rpc("ctrl_fn", {', "  p_alpha: { inner_key: 1, other: 2 },", "  p_beta: b,", "});"].join("\n"),
)[0];
const spread = extractRpcCalls('await client.rpc("ctrl_fn", { p_alpha: a, ...rest });')[0];
check(
  oneLine?.args.join() === "p_alpha,p_beta,p_opt" &&
    nested?.args.join() === "p_alpha,p_beta" &&
    spread?.dynamic === true,
  `PR-3b ⛔ SCANNER: single-line multi-key reads [${oneLine?.args.join(",") ?? "-"}] (expect all three) · a NESTED object contributes only its outer keys [${nested?.args.join(",") ?? "-"}] (expect p_alpha,p_beta — \`inner_key\`/\`other\` must NOT leak up) · a SPREAD marks the site dynamic=${spread?.dynamic} — ▶ the first scanner failed the first of these and PR-3 caught it as a red rather than as a silent under-read`,
);

// ---------------------------------------------------------------------
// PR-4 -- THE SWEEP.
// ---------------------------------------------------------------------
check(
  findings.length === 0,
  `PR-4  every \`.rpc()\` call site's argument set matches the live signature (${findings.length} mismatch(es))`,
);
for (const f of findings) {
  console.log(
    `          ⛔ ${f.file}: ${f.fn}() ${f.kind}` +
      (f.missing.length ? ` missing=${f.missing.join(",")}` : "") +
      (f.extra.length ? ` unknown=${f.extra.join(",")}` : "") +
      `  passed=[${f.passed.join(",")}]`,
  );
}

// ---------------------------------------------------------------------
// ⛔ PR-7 -- THE SQL SUITES, THE POPULATION THE FIRST DRAFT DID NOT SEE.
// ---------------------------------------------------------------------
/*
 * ⚠️ 22 POSITIONAL CALL SITES IN FOUR SUITES BROKE ON THE `C-14` SIGNATURE
 * CHANGE, AND THIS GATE WAS GREEN THROUGHOUT. It scanned `server/**`; a
 * `SELECT … FROM public.admin_create_student('A','B',ARRAY[…])` inside a proof
 * harness is a different grammar in a different tree. ▶ The FULL SWEEP caught
 * them, not the guard — which is a sweep working, and a guard with a
 * population problem.
 */
/*
 * ⛔ THIS RULE'S OWN TWO FILES ARE EXCLUDED, AND THE REASON IS NOT CONVENIENCE.
 *
 * They contain DELIBERATELY DEFECTIVE SAMPLES — `staleSql` is a 3-argument call
 * against a 6-argument signature, written on purpose so `PR-7b` can prove the
 * detector fires. ▶ Sweeping them makes the gate report its own control as a
 * defect: §42's family, a check broken by its own compliance, and the second
 * time that shape has appeared inside a control rather than in the subject.
 *
 * ⚠️ A CONTROL FILE CANNOT BE ITS OWN SUBJECT. The exclusion is exactly two
 * files and `PR-7c` asserts that — it is not an allow-list that can grow.
 */
const CONTROL_FILES = new Set(["rpc-argument-rule.mjs", "prove-rpc-arguments.mjs"]);
const excluded = [];
const sqlFiles = [];
(function walkTests(dir) {
  for (const e of readdirSync(dir)) {
    if (e === "node_modules") continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walkTests(p);
    else if (CONTROL_FILES.has(e)) excluded.push(e);
    else if (/\.(mjs|sql)$/.test(e)) sqlFiles.push(p);
  }
})(join(ROOT, "scripts", "tests"));

let sqlCallCount = 0;
const sqlFindings = [];
for (const f of sqlFiles) {
  const source = readFileSync(f, "utf8");
  sqlCallCount += (source.match(/public\.[a-z0-9_]+\s*\(/g) ?? []).length;
  for (const b of sqlArityMismatches(source, signatures)) {
    sqlFindings.push({ ...b, file: relative(ROOT, f).split("\\").join("/") });
  }
}

check(
  sqlCallCount >= 50,
  `PR-7  ⚠️ NON-VACUITY FOR THE SQL HALF: ${sqlCallCount} positional \`public.*(\` call site(s) across ${sqlFiles.length} test file(s) — ▶ if the walk collapsed, PR-8 would sweep an EMPTY SET`,
);

/*
 * ⛔ THE CONTROL, AND IT USES THE LIVE SIGNATURES DELIBERATELY. Unlike
 * `CTRL_SIGS` above — which is synthetic because §12.17 warns that a control
 * derived from the state under test inherits its faults — this one must prove
 * the SQL scanner reads a REAL signature correctly. The fault class here lives
 * in SOURCE, never in the catalogue, so the catalogue cannot pollute it.
 */
const staleSql = sqlArityMismatches(
  "SELECT o_reason FROM public.admin_create_student('A', 'B', ARRAY[]::uuid[]);",
  signatures,
);
const goodSql = sqlArityMismatches(
  "SELECT o_reason FROM public.admin_create_student('A', 'B', ARRAY[]::uuid[], NULL, NULL, NULL);",
  signatures,
);
/*
 * ⛔ AND FOUR SHAPES THAT MUST STAY SILENT. The first draft of the SQL scanner
 * flagged 19 sites and EVERY ONE WAS CORRECT CODE — the exact defect §12.13
 * names, committed inside the gate written to catch it. Each of these four is
 * a real construct taken from this repository, not an invented case.
 */
const NOT_CALLS = [
  ["a has_function_privilege TYPE-LIST STRING", "SELECT pg_catalog.has_function_privilege('authenticated','public.admin_create_student(text, text, uuid[], date, text, text)','EXECUTE');"],
  ["a decoy FUNCTION DEFINITION", "CREATE OR REPLACE FUNCTION public.report_content_hash_v2(a text) RETURNS text AS $$ SELECT $1 $$ LANGUAGE sql;"],
  ["a REVOKE naming a signature", "REVOKE ALL ON FUNCTION public.report_content_hash_v2(text) FROM PUBLIC, anon, authenticated;"],
  ["a DROP naming a signature", "DROP FUNCTION IF EXISTS public.report_list_management_corrections();"],
  ["a STRING-LITERAL grep needle", "for (const needle of ['public.assessment_save_observation(', 'public.report_create(']) {"],
];
const noisy = NOT_CALLS.filter(([, sample]) => sqlArityMismatches(sample, signatures).length > 0);
check(
  staleSql.length === 1 && staleSql[0].passed === 3 && goodSql.length === 0 && noisy.length === 0,
  `PR-7b ⛔ CONTROL — THE EXACT DEFECT THAT BROKE 22 SITES: the old 3-argument positional call is caught (${staleSql.length} finding, passed=${staleSql[0]?.passed ?? "-"} against required=${staleSql[0]?.required ?? "-"}) and the corrected 6-argument call is silent (${goodSql.length}). ⛔ AND ${NOT_CALLS.length} SHAPES THAT ARE NOT CALLS STAY SILENT — ${noisy.length === 0 ? "all of them" : "NOISY: " + noisy.map(([n]) => n).join("; ")} — ▶ this half matters more: the first draft flagged 19 sites and every one was CORRECT CODE, which is how a gate stops being read`,
);

check(
  excluded.length === 2 && CONTROL_FILES.size === 2,
  `PR-7c ⛔ THE EXCLUSION IS EXACTLY THIS RULE'S OWN TWO FILES (${excluded.sort().join(", ") || "NONE FOUND"}) — ▶ pinned as a COUNT so it cannot quietly grow into an allow-list for inconvenient files, and asserted as FOUND so a rename cannot silently empty it`,
);

check(
  sqlFindings.length === 0,
  `PR-8  every positional SQL call site supplies an argument count the live signature accepts (${sqlFindings.length} mismatch(es))`,
);
for (const f of sqlFindings) {
  console.log(
    `          ⛔ ${f.file}: ${f.fn}() passed ${f.passed}, signature takes ${f.required}${f.accepted !== f.required ? `..${f.accepted}` : ""}`,
  );
}

// ---------------------------------------------------------------------
// PR-5 -- STATED LIMITS, not implied by a green run.
// ---------------------------------------------------------------------
console.log(
  `INFO    PR-5  ⚠️ STATED LIMIT: ${dynamicSites.length} call site(s) build their argument object dynamically (spread, computed or quoted key) and are NOT checked — their argument set is not statically knowable, and guessing at one would produce false reds. ▶ NAMED, NOT COUNTED, so an unchecked site cannot hide inside a number:`,
);
for (const s of dynamicSites) console.log(`          ⚠️ UNCHECKED  ${s}`);
console.log(
  "INFO    PR-6  ⚠️ STATED LIMIT, AND THE TWO HALVES ARE NOT EQUALLY STRONG:" +
    " the TypeScript half (PR-4) checks argument NAMES; the SQL half (PR-8) checks ARITY ONLY," +
    " because a positional call has no names to check. ▶ A SQL caller passing the right COUNT in the" +
    " WRONG ORDER is invisible to PR-8 and surfaces as a runtime cast error. Neither half checks" +
    " argument TYPES or VALUES.",
);

console.log(`\nRESULT: ${bad === 0 ? "PASS" : "FAIL"}  (${bad} failed checks)`);
process.exit(bad === 0 ? 0 : 1);
