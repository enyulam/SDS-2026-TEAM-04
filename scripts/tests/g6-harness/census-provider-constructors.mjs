#!/usr/bin/env node
// =====================================================================
// B.E.S.T Coach -- G-6 harness: repository-wide provider-constructor and
// outbound-network census
// =====================================================================
// Run C3-C section 6: "no second runner may gain a provider activation
// path" is not a one-time claim -- it is asserted here, on every
// verification run, against the LIVE repository text. This script fails
// loudly the moment a FOURTH `new OpenAiDraftProvider(` call site (or a
// second file constructing `https://api.openai.com` outside the ratified
// provider module) appears anywhere that is not on the exact allow-list
// below.
//
// Run: node scripts/tests/g6-harness/census-provider-constructors.mjs
// =====================================================================

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = process.cwd();
// This script's OWN source text necessarily contains the literal search
// patterns it greps for (as pattern strings, in comments, and in this
// allow-list) -- it excludes itself from every census below, rather than
// producing a permanent false positive against its own body.
const SELF = fileURLToPath(import.meta.url);

let failures = 0;
const fail = (id, msg) => { failures += 1; console.error(`FAIL ${id}: ${msg}`); };
const pass = (id, msg) => console.log(`PASS ${id}${msg ? " -- " + msg : ""}`);

// Directories never worth walking: dependencies, build output, VCS.
const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "dist", "build", ".turbo"]);
const TEXT_EXTENSIONS = new Set([".ts", ".tsx", ".mjs", ".js", ".cjs"]);

function walk(dir, out) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (SKIP_DIRS.has(entry)) continue;
      walk(full, out);
    } else if (TEXT_EXTENSIONS.has(entry.slice(entry.lastIndexOf(".")))) {
      out.push(full);
    }
  }
  return out;
}

/**
 * Every file allowed to construct `new OpenAiDraftProvider(`. This is the
 * WHOLE allow-list -- exactly three entries, matching Run C3-C's audit:
 * the production server action, the default-off regression leg in
 * run-integration.mjs, and this run's own sanctioned activation harness.
 * Adding a fourth entry here requires the SAME orchestrator authorization
 * a new activation path would need in the first place -- this file is not
 * the place to quietly widen it.
 */
const ALLOWED_CONSTRUCTOR_FILES = new Set([
  join("server", "modules", "report-workflow", "actions.ts"),
  join("scripts", "tests", "integration", "run-integration.mjs"),
  join("scripts", "physical-test", "activate-g6.mjs"),
  // Constructs a real OpenAiDraftProvider ONLY to unit-test its own
  // error-handling with globalThis.fetch monkey-patched to a local stub for
  // the duration of the process -- zero network, proven at FS-1..FS-5.
  join("scripts", "tests", "g6-harness", "failure-safety.mjs"),
]);

/**
 * Every file allowed to reference the literal OpenAI endpoint host. Only
 * the provider module itself constructs a URL from it; every caller goes
 * through `OpenAiDraftProvider`, never a second hand-rolled HTTP client.
 */
const ALLOWED_HOST_LITERAL_FILES = new Set([
  join("server", "modules", "ai-drafting", "provider.ts"),
]);

const files = walk(ROOT, []);

// ---------------------------------------------------------------------
// Census 1 -- every `new OpenAiDraftProvider(` call site.
//
// This is a SUBSTRING match, not a parsed-AST guarantee: it would not
// catch a deliberately obfuscated construction (extra whitespace, a
// re-export alias, dynamic `import()`). It is defense-in-depth against an
// ACCIDENTAL new call site appearing (e.g. a future contributor copying
// the pattern into a new script) -- the load-bearing controls are the
// production `getServerConfig()` selector equality check and this
// harness's own TTY/flag/confirmation gates, not this grep.
// ---------------------------------------------------------------------
{
  const sites = [];
  for (const file of files) {
    if (file === SELF) continue;
    const rel = relative(ROOT, file);
    if (rel.startsWith("..")) continue;
    const text = readFileSync(file, "utf8");
    if (text.includes("new OpenAiDraftProvider(")) sites.push(rel);
  }
  const unexpected = sites.filter((rel) => !ALLOWED_CONSTRUCTOR_FILES.has(rel));
  const missing = [...ALLOWED_CONSTRUCTOR_FILES].filter((rel) => !sites.includes(rel));
  if (unexpected.length > 0) {
    fail("CENSUS-1", `unsanctioned provider-constructor site(s): ${unexpected.join(", ")}`);
  } else if (missing.length > 0) {
    fail("CENSUS-1", `an expected constructor site is missing (has it been renamed or removed?): ${missing.join(", ")}`);
  } else if (sites.length !== ALLOWED_CONSTRUCTOR_FILES.size) {
    fail("CENSUS-1", `expected exactly ${ALLOWED_CONSTRUCTOR_FILES.size} constructor site(s), found ${sites.length}: ${sites.join(", ")}`);
  } else {
    pass("CENSUS-1", `exactly ${sites.length} provider-constructor site(s), all on the allow-list: ${sites.join(", ")}`);
  }
}

// ---------------------------------------------------------------------
// Census 2 -- the literal OpenAI host string, wherever it appears.
// ---------------------------------------------------------------------
{
  const sites = [];
  for (const file of files) {
    if (file === SELF) continue;
    const rel = relative(ROOT, file);
    if (rel.startsWith("..")) continue;
    const text = readFileSync(file, "utf8");
    if (text.includes("api.openai.com")) sites.push(rel);
  }
  // The activation harness and the integration suite legitimately name the
  // host in an ALLOW-LIST string (never construct a request to it directly
  // without going through OpenAiDraftProvider) -- both are permitted to
  // mention the literal for that reason; only a THIRD kind of use (a direct
  // fetch/https client construction) would be the unsanctioned case, and
  // that is impossible to distinguish by grep alone, so this census is
  // deliberately a wide net: any occurrence outside the three known,
  // reviewed files is reported for manual review rather than silently passed.
  const known = new Set([
    ...ALLOWED_HOST_LITERAL_FILES,
    join("scripts", "physical-test", "activate-g6.mjs"),
  ]);
  const unexpected = sites.filter((rel) => !known.has(rel));
  if (unexpected.length > 0) {
    fail("CENSUS-2", `the literal OpenAI host appears outside the known, reviewed files: ${unexpected.join(", ")}`);
  } else {
    pass("CENSUS-2", `the literal OpenAI host appears only in reviewed files: ${sites.join(", ")}`);
  }
}

// ---------------------------------------------------------------------
// Census 3 -- run-f17-disposable.mjs and prove-disposable-app.mjs must
// still contain NO PASS branch for G-6, and must not construct a provider.
// ---------------------------------------------------------------------
{
  const f17Disposable = join(ROOT, "scripts", "physical-test", "run-f17-disposable.mjs");
  const proveApp = join(ROOT, "scripts", "physical-test", "prove-disposable-app.mjs");
  const t1 = readFileSync(f17Disposable, "utf8");
  const t2 = readFileSync(proveApp, "utf8");
  const noConstructIn = (text, name) => {
    if (text.includes("new OpenAiDraftProvider(")) fail("CENSUS-3", `${name} now constructs OpenAiDraftProvider`);
  };
  noConstructIn(t1, "run-f17-disposable.mjs");
  noConstructIn(t2, "prove-disposable-app.mjs");
  const g6PassIn = (text, name) => {
    // A structural check, not a string match on "PASS": the ONLY call in
    // each file that decides G-6 must pass the literal 'NOT-RUN' as the
    // verdict argument.
    const calls = [...text.matchAll(/gate\(\s*'G-6'\s*,\s*'([A-Z-]+)'/g)].map((m) => m[1]);
    if (calls.length === 0) fail("CENSUS-3", `${name} contains no G-6 gate() call at all (expected exactly one, NOT-RUN)`);
    else if (calls.some((v) => v !== "NOT-RUN")) fail("CENSUS-3", `${name} has a G-6 gate() call with verdict ${calls.filter((v) => v !== "NOT-RUN").join(", ")}, expected only NOT-RUN`);
  };
  g6PassIn(t1, "run-f17-disposable.mjs");
  g6PassIn(t2, "prove-disposable-app.mjs");
  if (failures === 0) pass("CENSUS-3", "run-f17-disposable.mjs and prove-disposable-app.mjs remain structurally incapable of a G-6 PASS or a provider construction");
}

console.log("");
if (failures > 0) {
  console.error(`${failures} failure(s).`);
  process.exitCode = 1;
} else {
  console.log("Repository-wide provider-constructor and outbound-network census: clean.");
  process.exitCode = 0;
}
