#!/usr/bin/env node
// =====================================================================
// ⛔ EVERY PROOF SUITE. ENUMERATED, NEVER PATTERN-MATCHED.
// =====================================================================
// Operator ruling, 2026-08-16:
//
//   "Make the per-phase sweep run every suite, not the ones matching a
//    prefix. … a gate that only executes when its name matches a pattern is
//    a gate with a population problem, which is Finding 2's shape one layer
//    out."
//
// ⚠️ WHY IT EXISTS — MEASURED, AND IT COST EIGHT PHASES. Every per-phase
//    sweep in this project enumerated the `portal-p2-N` suites. Four gates sat
//    outside that naming and went unread:
//
//      `prove:hero-2` `P2-6`   the project's SINGLE GLOBAL function ratchet,
//                              reading 62 against a live 73 — stale across
//                              EIGHT authorized phases
//      `prove:ruling-a` `RAa-4` the registry pin, reading 23 against 24
//      `prove:hero-15` `M-3a`  asserting "all FOUR reads" while a FIFTH
//                              existed its pattern could not match
//      `prove:artefact-read`   `AR-5-11`, a citation left behind when a
//                              component moved
//
//    ▶ **A NAMING CONVENTION WAS DOING LOAD-BEARING WORK BY ACCIDENT.** Nobody
//      decided that `hero-*` need not be swept; it simply never matched.
//
// ⛔ THE POPULATION IS `package.json`'s OWN SCRIPT LIST, so a suite added
//    tomorrow is swept tomorrow without anyone remembering to add it here.
//    There is no list of suites in this file, and that is the point.
//
// ⛔ EXIT CODES ARE THE VERDICT, AND THERE ARE FOUR OUTCOMES, NOT TWO:
//      0  PASS      1  FAIL      2  NOT-RUN      *  ERROR
//    ⚠️ `NOT-RUN` IS NEVER A PASS. A suite that could not reach its stack has
//    established nothing, and counting it green is exactly the defect its own
//    exit-2 convention exists to prevent.
//
// Run: npm run prove:all
// =====================================================================

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

/**
 * ⛔ EXCLUDED, AND EACH FOR A STATED REASON. This is NOT an allow-list for
 * failures — a red suite can never be excluded here. It removes only scripts
 * that are not themselves suites.
 */
const NOT_A_SUITE = new Map([
  ["prove:all", "this runner"],
  ["prove:hero-all", "an AGGREGATE of the hero suites, every one of which this runner already invokes individually — including it would double that work and report each hero result twice"],
]);

/**
 * ⛔ THE KNOWN-RED REGISTER — ESCALATED, NOT WAIVED.
 *
 * ⚠️ AN ENTRY IS NOT AN EXEMPTION. Each names a red that has been REPORTED to
 * the Operator and is awaiting a ruling or a separate authorization. A red
 * with no entry fails this runner immediately.
 *
 * ⛔ AND THE REGISTER CANNOT ROT, because a KNOWN-RED that has gone GREEN is
 * ALSO A FAILURE here. ▶ That is the half most such registers omit, and its
 * absence is how a waiver outlives the defect it described — the same shape as
 * the stale `62`, one layer over.
 */
const KNOWN_RED = [
  {
    script: "prove:stage3-authenticated",
    leg: "S3-T1-r",
    reason:
      "`/trainer/schedule` hydrates but 2 of 3 selectors are absent — DIAGNOSED AS FIXTURE VINTAGE (the fixture's sessions fall outside the rendered month), not a defect in the screen. The re-dating awaits its own bounded Operator authorization (plan §34).",
    since: "2026-08-16",
  },
];

// ---------------------------------------------------------------------
// The population, read from package.json.
// ---------------------------------------------------------------------
const scripts = Object.keys(JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")).scripts ?? {})
  .filter((name) => name.startsWith("prove:"))
  .filter((name) => !NOT_A_SUITE.has(name))
  .sort();

// ⚠️ NON-VACUITY FIRST. If the enumeration collapsed, this runner would sweep
// nothing and report a green meaning "no suite disagreed with me".
if (scripts.length < 40) {
  console.log(`NOT-RUN  the enumeration found ${scripts.length} suite(s) — expected at least 40`);
  console.log("         ⛔ NOT A PASS: a runner that swept nothing has proven nothing");
  process.exit(2);
}

const knownRed = new Map(KNOWN_RED.map((k) => [k.script, k]));
const stale = KNOWN_RED.filter((k) => !scripts.includes(k.script));

console.log(`⛔ SWEEPING ALL ${scripts.length} PROOF SUITES — enumerated from package.json, not matched by prefix`);
console.log(`   known-red register: ${KNOWN_RED.length} entr(y/ies), each escalated and each re-checked below\n`);

const started = Date.now();
const results = [];
for (const name of scripts) {
  const run = spawnSync("npm", ["run", name, "--silent"], {
    cwd: ROOT,
    encoding: "utf8",
    shell: true,
  });
  const code = run.status ?? -1;
  const verdict = code === 0 ? "PASS" : code === 1 ? "FAIL" : code === 2 ? "NOT-RUN" : "ERROR";
  /*
   * ⚠️ stderr IS KEPT. A suite that dies before printing a single FAIL line —
   * an import error, a missing container, a thrown assertion — says everything
   * useful on stderr, and a report built from stdout alone shows an empty red.
   */
  results.push({ name, code, verdict, output: `${run.stdout ?? ""}\n${run.stderr ?? ""}` });
  const expected = knownRed.has(name);
  const mark =
    verdict === "PASS" && expected ? "⛔ NOW GREEN" : verdict === "PASS" ? "PASS   " : `⛔ ${verdict}`;
  console.log(`${mark.padEnd(12)} ${name}`);
}
const elapsed = Math.round((Date.now() - started) / 1000);

// ---------------------------------------------------------------------
// The verdict.
// ---------------------------------------------------------------------
const unexpectedRed = results.filter((r) => r.verdict !== "PASS" && !knownRed.has(r.name));
const notRun = results.filter((r) => r.verdict === "NOT-RUN" || r.verdict === "ERROR");
const healed = results.filter((r) => r.verdict === "PASS" && knownRed.has(r.name));

console.log(`\n─────────────────────────────────────────────────────────────────`);
console.log(`${results.filter((r) => r.verdict === "PASS").length} PASS · ${results.filter((r) => r.verdict === "FAIL").length} FAIL · ${notRun.length} NOT-RUN/ERROR   (${elapsed}s)`);

/*
 * ⛔ THE EXCERPT FALLS BACK TO THE TAIL WHEN THE PATTERN MATCHES NOTHING, AND
 *    THAT IS NOT A NICETY — IT IS §12.16's FAMILY INSIDE THIS FILE.
 *
 * ⚠️ MEASURED 2026-08-16, THE FIRST TIME THIS SWEEP CAUGHT SOMETHING REAL. The
 * excerpt was `/^FAIL|NOT-RUN/`, anchored at column zero. `prove:serving-
 * discipline` prints `  FAIL  D-x` with a two-space indent, so its red was
 * reported as a bare heading with **NOT ONE LINE UNDER IT** — the verdict was
 * correct and the evidence was silently dropped by a pattern.
 *
 * ▶ The exit code decided the verdict, which is why the sweep was still right
 * (§12.16). But a report that shows nothing forces the reader to re-run the
 * suite by hand to learn what a gate already knew, and that is exactly how a
 * red gets waved through.
 */
const excerpt = (output) => {
  const matched = output.split("\n").filter((l) => /^\s*(FAIL|NOT-RUN|ERROR|✗|⛔ FAIL)/.test(l));
  if (matched.length > 0) return matched.slice(0, 6);
  const tail = output.split("\n").filter((l) => l.trim().length > 0).slice(-6);
  /*
   * ⛔ THE STANDING FORM, RULED 2026-08-17 (plan §12.16): when a gate cannot
   * explain a failure it prints `NO EVIDENCE CAPTURED`. It NEVER prints
   * nothing. ▶ A defect that drops evidence does not leave a gap — a gap is
   * inert — it leaves a FALSE ENTITY that someone then reasons about. That is
   * measured, not hypothetical: an empty red from this very function was
   * carried as an unknown flake for a whole phase and was `D-10` all along.
   */
  return tail.length > 0
    ? ["⚠️ no FAIL-shaped line matched — LAST 6 NON-EMPTY LINES instead:", ...tail]
    : ["⛔ NO EVIDENCE CAPTURED — the suite produced nothing on stdout or stderr. Run it directly; do NOT reason about the cause from this line"];
};
for (const r of unexpectedRed) {
  console.log(`\n⛔ UNEXPECTED ${r.verdict}: ${r.name}`);
  for (const line of excerpt(r.output)) console.log(`     ${line}`);
}
for (const k of KNOWN_RED) {
  const r = results.find((x) => x.name === k.script);
  console.log(`\n⚠️ KNOWN-RED  ${k.script} (${k.leg}, since ${k.since}) — currently ${r?.verdict ?? "ABSENT"}`);
  console.log(`     ${k.reason}`);
}
for (const r of healed) {
  console.log(`\n⛔ A KNOWN-RED IS NOW GREEN: ${r.name}`);
  console.log("     ▶ Remove its KNOWN_RED entry in this file. A register that keeps");
  console.log("       describing a defect that no longer exists is how a waiver outlives");
  console.log("       the thing it waived — the stale `62` shape, one layer over.");
}
for (const k of stale) {
  console.log(`\n⛔ STALE KNOWN-RED ENTRY: ${k.script} is not in package.json at all`);
}

const bad = unexpectedRed.length + healed.length + stale.length;
console.log(
  `\nRESULT: ${bad === 0 ? "PASS" : "FAIL"}  (${unexpectedRed.length} unexpected red · ${healed.length} known-red now green · ${stale.length} stale register entr(y/ies))`,
);
process.exit(bad === 0 ? 0 : 1);
