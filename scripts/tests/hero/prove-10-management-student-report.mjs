#!/usr/bin/env node
// =====================================================================
// HERO PHASE 10 -- `19` Management Student Report: class, lesson, trainer
// =====================================================================
// ⚠️ PHASE 10 ADDED NO PROJECTION, AND THAT IS THE MEASURED FINDING. The
// plan classified its context delta `NEEDS NEW PROJECTION`; measured at
// HEAD, screen `19` ALREADY narrows its learner identity out of the same
// governed queue projection screen `29` reads, and Phase 9 put the class,
// lesson and trainer fields on that projection. So Phase 10 needed no new
// read, no new projection, no new RPC and no new database object -- only
// the render. A delta table is a reading of a frame, not a measurement of
// the build (plan §12 item 10).
//
// This suite is deliberately a SOURCE proof with no SQL half, and the
// reason is worth stating rather than leaving as an omission: there is no
// new database object to interrogate. Phase 9's `prove:hero-9` already
// proved the read, the RLS decision and the refusal legs behind these very
// fields, and re-running that against a second consumer would restate an
// accepted result rather than establish a new one (§14.7).
//
// ⛔ WHAT IT MUST PROVE INSTEAD is that the six ruled-out elements did NOT
// arrive alongside the four permitted ones, and that the ruled omissions
// were not quietly reclassified as data-availability ones now that data
// has arrived. Those two failure modes look identical on a rendered page.
//
// Run: npm run prove:hero-10
// =====================================================================

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SCREEN = join(ROOT, "features", "management", "management-report-review.tsx");

// ⚠️ Comments stripped first. This screen documents its prohibitions at
// GREAT length -- the header alone names "Overall Grade", "Term" and every
// R-B5 item in prose -- so an unstripped scan would report each prohibited
// element as PRESENT while reading the paragraph that forbids it. Sixth
// instance of that root in this batch (plan §12 item 13).
const raw = readFileSync(SCREEN, "utf8");
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
// P10-1 -- NON-VACUITY. Stripping is aggressive; if it ate the component
// the ten absence checks below would all pass against an empty string.
// ---------------------------------------------------------------------
check(
  code.length > 8000 && code.includes("export function ManagementReportReview"),
  `P10-1: NON-VACUOUS — the stripped component is real (${code.length} chars) and still declares its export, so the absence checks below scan actual code`,
);

// ---------------------------------------------------------------------
// P10-2 -- the four permitted context fields are rendered, each from its
// own governed field.
// ---------------------------------------------------------------------
for (const [label, token] of [
  ["Class", "classGradeLabel"],
  ["Class module", "classModuleTitle"],
  ["Lesson", "lessonNumber"],
  ["Trainer", "trainerDisplayName"],
]) {
  check(code.includes(token), `P10-2: ${label} is rendered from the governed field \`${token}\``);
}
check(
  /label="Class"/.test(code) && /label="Lesson"/.test(code) && /label="Trainer"/.test(code),
  "P10-2b: and all three appear as labelled Report Details rows, not as loose text",
);

// ---------------------------------------------------------------------
// P10-3 -- ⛔ THE RULED OMISSIONS. G-2, G-4 and the six R-B5 prohibitions
// did not arrive alongside the permitted four.
// ---------------------------------------------------------------------
// ⚠️ EVERY PATTERN HERE MATCHES A RENDERED SHAPE, NEVER A BARE WORD, and two
// of them are that way because the bare-word version FAILED on first run:
//
//   * `/\btermb/i` matched the screen's own sentence "A term is not recorded
//     anywhere in this product" — the copy that REFUSES term. `P10-4c` below
//     REQUIRES that sentence, so the bare-word check and P10-4c directly
//     contradicted each other: one demanded the word, the other forbade it.
//   * `/audience/i` matched `audience_awareness`, THE NINTH B.E.S.T DIMENSION.
//     That is `CLAUDE.md` §5's and A-054's hazard exactly — a token that means
//     one thing in one governed vocabulary and something else in another — and
//     G-06 expressly REFUSED narrowing `DIMENSION_TERMS.audience_awareness`.
//
// ▶ Both are the shape A-052 already prohibits for rating labels: a bare-word
// match over a governed vocabulary rejects legitimate content. The rule
// generalizes, and it applies to a TEST as much as to a leak guard — a test
// that fires on the sentence documenting compliance is not measuring
// compliance.
const PROHIBITED = {
  "Overall Grade (G-2, and A-038 independently)": /overall\s*grade|overallGrade/i,
  "a term row or field (G-4)": /label="Term"|termLabel|term_id|termId|"All terms"|Term \d/i,
  "an audience toggle (R-B5)": /audienceToggle|Report for:|["'`]Parent copy|["'`]Management copy/i,
  "a Performance Summary (R-B5, Q-27 class)": /performance summary/i,
  "per-dimension ratings (A-038)": /ratings\[|dimensionRatings|ratingFor|competencyRating/i,
  "trainer notes (R-B5)": /coachNotes|trainerNotes|followUpNotes/i,
  "evidence (R-B5, G-8)": /evidence/i,
  "attendance (R-B5)": /attendance|isPresent/i,
  "Save as draft (R-B5)": /save as draft|saveDraft/i,
};
for (const [label, pattern] of Object.entries(PROHIBITED)) {
  check(!pattern.test(code), `P10-3: ⛔ the screen renders no ${label}`);
}

// ---------------------------------------------------------------------
// P10-3b -- DISCRIMINATION. Nine absence checks are worthless unless the
// same matcher shape finds something that IS there. `dimensionCode` is a
// real identifier on this screen -- the return-to-trainer dialog names the
// dimension a correction concerns -- so a matcher family that cannot see
// it cannot be trusted to have seen the nine above either.
// ---------------------------------------------------------------------
check(
  /label="Class"/.test(code) && /dimensionCode/.test(code),
  "P10-3b: DISCRIMINATING — the same matcher family DOES find `dimensionCode`, which is genuinely present, so the nine absence checks measured absence rather than a broken pattern",
);
// ⚠️ And that presence is itself governed, so it is stated rather than
// left to look like a contradiction of P10-3: naming WHICH dimension a
// correction concerns is A-035's correction record. It carries no RATING.
check(
  !/dimensionCode\s*[:=]\s*["'`]?(beginning|developing|mastering|mastered)/i.test(code),
  "P10-3c: and `dimensionCode` never carries a rating value — it names which dimension a correction concerns (A-035), never how it was rated",
);

// ---------------------------------------------------------------------
// P10-4 -- ⚠️ THE SUBTLE ONE. A data-availability omission and a RULED
// omission look identical on a rendered page. Phase 9 discharged the first
// for lesson; the on-screen note must no longer claim the second for it,
// and must still refuse term outright.
// ---------------------------------------------------------------------
const note = (raw.match(/Nothing beyond the four parent-facing panels[\s\S]{0,400}?<\/p>/) ?? [""])[0];
check(note !== "", "P10-4a: the on-screen omission note was LOCATED, so P10-4b/c measure it rather than an empty string");
check(
  !/not carried by any governed Management projection/i.test(note),
  "P10-4b: the note no longer claims lesson is uncarried — Phase 9 made it carried, and leaving that reason in place would misstate a RULED omission as a temporary data gap",
);
check(
  /term is\s*\n?\s*not recorded|not recorded anywhere/i.test(note.replace(/\s+/g, " ")),
  "P10-4c: and it still refuses term on the permanent ground (G-4), not on a data-availability one",
);

console.log(
  bad === 0
    ? "\nRESULT: PASS — `19` states class, lesson and trainer from the projection Phase 9 already extended, the six R-B5 prohibitions and G-2/G-4 hold, and the discharged omission was not confused with the permanent ones."
    : `\nRESULT: FAIL — ${bad} check(s) failed.`,
);
process.exit(bad === 0 ? 0 : 1);
