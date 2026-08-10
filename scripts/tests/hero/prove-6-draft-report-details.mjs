#!/usr/bin/env node
// =====================================================================
// HERO PHASE 6 -- `08` Trainer AI Report Generation: Report Details
// =====================================================================
// Phase 6 adds the frame's "Lesson" row and adds NOTHING ELSE. Its real
// weight is in what stays out: `08` is the screen whose frame carries the
// MOST ruled-out material in the whole chain -- a term, an overall grade, a
// 500MB evidence uploader, and a "Confirm & Submit" that contradicts the
// two-stage workflow outright.
//
// ⚠️ THOSE ARE PRESERVED OMISSIONS, AND THIS SUITE IS WHAT KEEPS THEM
// PRESERVED. Each is a string a later phase could reinstate in one line
// while "matching the frame better" -- which plan §12 item 1 calls a phase
// FAILURE even when the result looks closer to the design.
//
// This suite is SOURCE- AND CONTRACT-SCOPED and says so: the lesson
// column's readability under RLS is proven by prove:hero-3 / prove:hero-4
// and is not re-proven here. It touches no database, opens no transaction,
// and writes nothing.
//
// Run: npm run prove:hero-6
// =====================================================================

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const DRAFT = join(ROOT, "features", "trainer", "trainer-draft-generation.tsx");
const CONTRACT = join(ROOT, "lib", "frontend", "contracts", "physical-test.ts");

const source = readFileSync(DRAFT, "utf8");
const contract = readFileSync(CONTRACT, "utf8");

// Strip comments before every absence assertion. The prohibitions are
// DOCUMENTED in this file at length -- "Confirm & Submit", "Overall Grade"
// and "500MB" all appear in its divergence register -- so a naive scan over
// the raw text would report a violation for the very comments that record
// why there is none.
const rendered = source
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/^\s*\/\/.*$/gm, "");

const detailsStart = rendered.indexOf("report-details-heading");
const detailsEnd = rendered.indexOf("performance-summary-heading");
const details = detailsStart < 0 || detailsEnd < 0 ? "" : rendered.slice(detailsStart, detailsEnd);

const sessionDto = (contract.match(/export type TrainerSessionSummaryDto = \{([\s\S]*?)\n\};/) ?? [])[1] ?? "";
const dtoFields = [...sessionDto.matchAll(/^\s*readonly\s+([A-Za-z0-9_]+)\s*[?:]/gm)].map((m) => m[1]);

let bad = 0;
const check = (ok, msg) => {
  if (!ok) bad++;
  console.log(`${ok ? "PASS   " : "FAIL   "} ${msg}`);
};

// ⚠️ NON-VACUITY FIRST. Every leg below is an ABSENCE assertion, and an
// absence assertion over an empty string passes perfectly. Both regions are
// pinned to something that must be there before anything is asserted missing.
check(
  details.length > 0 && details.includes("Report Details"),
  `P6-1a: NON-VACUOUS — the Report Details region was located and read (${details.length} chars)`,
);
check(
  rendered.includes("ratingSnapshots") || rendered.includes("Performance Summary"),
  "P6-1b: NON-VACUOUS — the rendered source really is this screen (it still carries the nine governed snapshots)",
);

check(
  details.includes('label="Lesson"') && details.includes("lessonLabel"),
  "P6-2: the frame's Lesson row is built, and from the GOVERNED session projection — not from a route parameter",
);
check(
  rendered.includes("session.lessonNumber") && rendered.includes("session.lessonTitle"),
  "P6-3: the lesson label is derived from both governed columns, so a NULL either side degrades rather than fabricates",
);

// ---- the preserved omissions -----------------------------------------
//
// ⚠️ EVERY PATTERN BELOW TARGETS THE SHAPE OF A VIOLATION, NOT ITS WORDS.
// The first revision of the Overall Grade leg was `/Overall Grade/i` and it
// FAILED — against this screen's own sentence saying a single overall grade is
// deliberately NOT shown. That is the A-052 failure exactly: a bare keyword
// match rejects legitimate prose, which is why A-052 prohibits that shape for
// the rating-label guard. A screen that EXPLAINS an omission necessarily names
// it, so the assertion must look for a RENDERED ROW — a `label="…"` binding —
// and never for the phrase.
//
const forbidden = [
  ["Term row (G-4)", /label=["{]\s*"?Term"?\s*[}"]/],
  ["Overall Grade row (G-2)", /label=["{]\s*"?Overall Grade"?\s*[}"]/i],
  ["the frame's 500MB evidence uploader (G-8)", /500\s?MB/i],
  ["a trainer Confirm & Submit (A-033/A-036 — the trainer approves and does not publish)", /Confirm\s*&(amp;)?\s*Submit/i],
  ["a second 'Save as draft' mutation (D7)", /Save as draft/i],
];
for (const [label, pattern] of forbidden) {
  check(!pattern.test(rendered), `P6-4: ⛔ ${label} is NOT rendered`);
}

// ⚠️ The row patterns must be DISCRIMINATING, not merely unmatched. A typo in
// `label=["{]…` would silently never match anything and every P6-4 leg would
// report PASS while measuring nothing — the same vacuity shape as a refusal
// leg with no permit leg. So the same matcher is run against a row that IS
// rendered: if it cannot find "Name", it cannot be trusted to find "Term".
check(
  /label=["{]\s*"?Name"?\s*[}"]/.test(rendered),
  "P6-4b: the row matcher is DISCRIMINATING — it finds the Name row that IS rendered, so its failure to find Term or Overall Grade is a measurement and not a broken pattern",
);

check(
  !dtoFields.some((f) => /term|overall|grade_band|gradeBand/i.test(f) && f !== "classGrade"),
  `P6-5: ⛔ no term or roll-up-grade field on the session DTO — the omission is refused at the DATA layer, not just left unrendered (fields: ${dtoFields.join(", ")})`,
);

// ⚠️ The on-screen reason for the term/overall omission must not claim the
// data is merely missing. It is RULED OUT. "We don't have it" and "we are not
// allowed to show it" are different statements, and the weaker one invites a
// later phase to "fix" a gap that is a decision.
check(
  !/not carried by any governed Trainer projection/i.test(rendered),
  "P6-6: ⚠️ the on-screen note no longer attributes the term / overall-grade omission to a MISSING FIELD — both are ruled out, and lesson is now carried",
);

console.log(
  bad === 0
    ? "\nRESULT: PASS — the Lesson row is built from governed data; every ruled-out element on the chain's most over-drawn frame stays out, in the render AND in the DTO."
    : `\nRESULT: FAIL — ${bad} check(s) failed.`,
);
process.exit(bad === 0 ? 0 : 1);
