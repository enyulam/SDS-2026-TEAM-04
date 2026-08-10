#!/usr/bin/env node
// =====================================================================
// EVERY HERO-CHAIN PROOF, KEYED OFF EXIT CODE
// =====================================================================
// ⚠️ THIS SCRIPT EXISTS BECAUSE THE OBVIOUS WAY TO DO IT PRODUCED A FALSE
// GREEN, AND IT IS WORTH STATING EXACTLY HOW.
//
// The Phase 8/11 harness was edited to include a template literal whose
// text contained BACKTICKS around "NOT APPLICABLE". That is a syntax
// error: the module never parsed and never ran a single check. But the
// shell sweep in use at the time was
//
//     npm run prove:hero-$n | grep -o "RESULT: [A-Z]*"
//
// and Node's SyntaxError report ECHOES THE OFFENDING SOURCE LINE — which
// was the success message, containing the literal text `RESULT: PASS`.
//
// ▶ THE HARNESS'S OWN SUCCESS STRING BECAME THE EVIDENCE OF ITS SUCCESS
//   WHILE IT HAD NEVER EXECUTED. A broken measuring instrument reported
//   that everything it had not measured was fine.
//
// This is the family this project keeps meeting -- `bool_and` over zero
// rows, the `CANONICAL_CONTAINERS` inversion, the S-8 gate denying
// everyone because nothing was submitted -- but one level worse: the
// defect was in the INSTRUMENT, not in the thing measured, so it
// contaminated every phase the sweep was used at rather than one leg.
//
// ⛔ Never decide a suite's verdict by matching its output. A process that
// died before running anything can print any string it contains. EXIT CODE
// IS THE ONLY VERDICT, and a non-zero exit with no output is still a
// FAILURE, never a pass.
//
// Plan §12 item 14 requires every earlier proof re-run at each phase
// boundary; this is the mechanism for doing that correctly.
//
// Run: npm run prove:hero-all
// =====================================================================

import { spawnSync } from "node:child_process";

// ⚠️ EVERY suite belongs here — §12 item 17. Adding a proof includes adding
// it to this list; a suite outside the sweep is a suite whose verdict nobody
// is checking.
const PROOFS = ["0a", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

const results = [];
for (const id of PROOFS) {
  const run = spawnSync("npm", ["run", `prove:hero-${id}`, "--silent"], {
    encoding: "utf8",
    shell: true,
  });
  // ⚠️ `status` is null when the process was killed by a signal. Treat that
  // as a failure rather than letting `null !== 0` be evaluated loosely.
  const ok = run.status === 0;
  results.push({ id, ok, status: run.status, output: `${run.stdout}\n${run.stderr}` });
  console.log(`${ok ? "PASS  " : "FAIL  "} prove:hero-${id}${ok ? "" : `  (exit ${run.status})`}`);
}

const failed = results.filter((r) => !r.ok);

// ⚠️ The self-check that keeps this script honest: if a suite exits 0 it
// must ALSO have said so. A harness that printed a failure and exited 0
// anyway is a different bug, and this catches it rather than trusting
// either signal alone.
const liars = results.filter((r) => r.ok && /RESULT: FAIL/.test(r.output));
for (const liar of liars) {
  console.log(`FAIL  prove:hero-${liar.id}  exited 0 but printed RESULT: FAIL -- the two signals disagree`);
}

console.log(
  failed.length === 0 && liars.length === 0
    ? `\nRESULT: PASS -- all ${PROOFS.length} hero-chain proofs exited 0, and none contradicted its own exit code.`
    : `\nRESULT: FAIL -- ${failed.length} suite(s) failed and ${liars.length} contradicted its exit code.`,
);
process.exit(failed.length === 0 && liars.length === 0 ? 0 : 1);
