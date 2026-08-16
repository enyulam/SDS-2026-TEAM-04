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
import { extractRpcCalls, inputParams, argumentMismatches } from "./rpc-argument-rule.mjs";

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
// PR-5 -- STATED LIMITS, not implied by a green run.
// ---------------------------------------------------------------------
console.log(
  `INFO    PR-5  ⚠️ STATED LIMIT: ${dynamicSites.length} call site(s) build their argument object dynamically (spread, computed or quoted key) and are NOT checked — their argument set is not statically knowable, and guessing at one would produce false reds. ▶ NAMED, NOT COUNTED, so an unchecked site cannot hide inside a number:`,
);
for (const s of dynamicSites) console.log(`          ⚠️ UNCHECKED  ${s}`);
console.log(
  `INFO    PR-6  ⚠️ STATED LIMIT: this checks argument NAMES against the signature, not argument TYPES or VALUES. A caller passing a \`text\` where the function takes \`uuid\` is invisible here and surfaces as a runtime cast error.`,
);

console.log(`\nRESULT: ${bad === 0 ? "PASS" : "FAIL"}  (${bad} failed checks)`);
process.exit(bad === 0 ? 0 : 1);
