#!/usr/bin/env node
// =====================================================================
// THE PARENT EMPTY STATE IS AN EMPTY STATE, AND SAYS SO
// =====================================================================
// ⛔ `/parent` rendered "Family view unavailable — This family view cannot be
// shown right now. Try again later." That is OUTAGE language. Measured, the
// read had SUCCEEDED: `getParentAvailability` returned `linked_unavailable`,
// a real governed state meaning **the learner is linked and no report has
// been published yet**. The failure path (`StatePanel`) never ran.
//
// ⚠️ "Try again later" was the worst part: it told a parent to retry
// something that will never change by waiting. What ends the wait is a
// PERSON — management completing its final review and publishing.
//
// ▶ Third instance of the rule ratified 2026-08-11 (plan §12 item 16): AN
//   OMISSION'S STATED REASON MUST SAY WHETHER IT ENDS WHEN DATA ARRIVES OR
//   NEVER ENDS. This one said neither, and implied the wrong one.
//
// ⚠️ This suite reads SOURCE, not a rendered page — the rendered capture on
// authenticated surfaces remains `NOT-RUN` and this does not change that.
// What it can prove is that the strings are gone, that the replacements name
// the actor and the event, and that no governance boundary moved with them.
//
// ⛔ AND A SOURCE SCAN CAN PASS ON A FILE THAT DOES NOT COMPILE. This suite
// DID exactly that on its first run: the explanatory comment had been placed
// as `{/* … */}` directly inside a `? :` branch, where JSX permits only a
// single expression and not a children-position comment. Every leg below
// passed — the strings were present and the old ones gone — against a file
// `tsc` rejected with six errors.
//
// ▶ **A PROOF THAT READS TEXT CANNOT TELL YOU THE TEXT IS REACHABLE.** This
//   suite is never sufficient alone; `tsc` and `build` are the gate that
//   catches it, and both are run at the same boundary. Recorded rather than
//   patched, because adding a compile step here would hide the general point.
//
// Run: npm run prove:hero-13
// =====================================================================

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SCREEN = join(ROOT, "features", "parent", "parent-dashboard.tsx");
const PROJECTION = join(ROOT, "server", "modules", "parent-view", "projections.ts");

const raw = readFileSync(SCREEN, "utf8");
// ⚠️ Comments stripped. This file now DOCUMENTS the old copy verbatim in
// order to explain its removal, so an unstripped scan would find the exact
// strings it is asserting are gone. Seventh instance of plan §12 item 13, and
// the first where the prose quotes the thing under test word for word.
const code = raw
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/^\s*\/\/.*$/gm, "");

let bad = 0;
const check = (ok, msg) => {
  if (!ok) bad++;
  console.log(`${ok ? "PASS   " : "FAIL   "} ${msg}`);
};

// ---------------------------------------------------------------------
// C-1 — NON-VACUITY. Stripping is aggressive; if it ate the component, every
// "the string is gone" leg below would pass against nothing.
// ---------------------------------------------------------------------
check(
  code.includes("export function ParentDashboard") && code.length > 3000,
  `C-1: NON-VACUOUS — the stripped component is real (${code.length} chars) and still declares its export`,
);
check(
  /availability === "linked_unavailable"/.test(code),
  "C-1b: and the branch under test is still present in code, so the legs below measure the live expression",
);

// ---------------------------------------------------------------------
// C-2 — ⛔ the outage language is gone.
// ---------------------------------------------------------------------
for (const [label, pattern] of [
  ['"Family view unavailable"', /Family view unavailable/],
  ['"cannot be shown right now"', /cannot be shown right now/],
  ['⛔ "Try again later" — the retry instruction for something waiting has no retry', /Try again later/],
]) {
  check(!pattern.test(code), `C-2: ${label} no longer renders`);
}

// ---------------------------------------------------------------------
// C-3 — the replacement says what is TRUE, and what ENDS the wait.
// ---------------------------------------------------------------------
check(/No report published yet/.test(code), "C-3a: the heading states the actual condition — nothing published yet");
check(
  /linked to this account/.test(code),
  "C-3b: and the body affirms the learner IS linked, which is what distinguishes this state from the other one",
);
check(
  /management has completed its final review and published it/.test(code),
  "C-3c: ⚠️ it names the ACTOR and the EVENT that ends the wait — management publishing — rather than implying time will",
);
check(
  /nothing to retry/.test(code),
  "C-3d: and says plainly there is nothing to retry, replacing the instruction that told a parent to wait for something waiting cannot fix",
);

// ---------------------------------------------------------------------
// C-4 — ⚠️ the OTHER branch had the same defect and was corrected with it.
// ---------------------------------------------------------------------
// `none_yet` means `listLinkedStudents` returned ZERO. Its old copy said
// "your linked learner" — asserting the very link whose absence produced the
// state.
check(
  !/When a report is ready for your linked learner/.test(code),
  "C-4: ⛔ the `none_yet` copy no longer asserts a linked learner — the state means there is none",
);
check(
  /No learner linked to this account yet/.test(code) && /management links a learner/.test(code),
  "C-4b: it now states the real condition and names who ends it, the same shape as C-3",
);
check(
  /if \(!linked\.ok\) return \{ outcome: "unavailable" \};/.test(readFileSync(PROJECTION, "utf8")),
  "C-4d: ⛔ and `none_yet` is now UNREACHABLE from a rejected read — the copy this suite verifies would otherwise tell a parent no learner is linked to their account because of a database fault",
);
check(
  /if \(linked\.rows\.length === 0\) return \{ outcome: "success", data: "none_yet" \};/.test(
    readFileSync(PROJECTION, "utf8"),
  ),
  // ⚠️ Updated when `listLinkedStudents` became a `QueryOutcome`: the shape is
  // now `linked.rows.length`. The CLAIM is unchanged and still verified at
  // source — `none_yet` comes from zero linked students — and the pin caught
  // the change rather than following it silently, which is why it is written
  // as an exact match.
  "C-4c: SOURCE-CONFIRMED — `none_yet` is produced by ZERO linked students, so the corrected copy matches the projection rather than my reading of it",
);

// ---------------------------------------------------------------------
// C-5 — ⛔ NO GOVERNANCE BOUNDARY MOVED.
// ---------------------------------------------------------------------
// Copy is the easiest place to leak, because prose is not obviously data.
const strings = [...code.matchAll(/"([^"\\]{25,})"/g)].map((m) => m[1]).join(" ");
for (const [label, pattern] of [
  ["a rating word (Q-27, A-052)", /\b(beginning|developing|mastering|mastered)\b/i],
  ["a lifecycle status", /trainer_approved|draft_ready|needs_edit|submitted|incomplete/],
  ["a draft, review or correction state", /draft|correction|return(ed)? to trainer|checklist/i],
  ["a count of anything unpublished", /\d+ (report|draft|pending)/i],
] ) {
  check(!pattern.test(strings), `C-5: ⛔ no user-facing string discloses ${label}`);
}
check(
  strings.length > 200,
  `C-5b: DISCRIMINATING — ${strings.length} chars of user-facing string were actually extracted, so the four scans above ran against real copy`,
);

console.log(
  bad === 0
    ? "\nRESULT: PASS — both parent empty states name the true condition and the actor who ends it; the outage language is gone and no boundary moved.\n        ⚠️ Source-level only. RENDERED CAPTURE on this authenticated surface remains NOT-RUN."
    : `\nRESULT: FAIL — ${bad} check(s) failed.`,
);
process.exit(bad === 0 ? 0 : 1);
