#!/usr/bin/env node
// =====================================================================
// G-06 / P1-T09 -- GROUNDING RULE EVIDENCE PROBE (read-only, no ruling)
// =====================================================================
// LOCAL ONLY. Constructs NO provider and makes NO network call. It imports
// the SHIPPED grounding implementation and reports what it ACTUALLY DOES
// today, panel by panel, against a fixed set of synthetic drafts.
//
// THIS PROBE RATIFIES NOTHING AND CHANGES NOTHING. Its purpose is to replace
// assertion with measurement in the decision packet: every behaviour claimed
// in docs/plan/G06_GROUNDING_RULE_DESIGN_PACKET.md is produced by running
// this, so the Operator can re-run it and check the claims rather than trust
// them.
//
// ✅ UPDATED 2026-08-09 -- G-06 IS NOW RATIFIED
// (FINAL_MVP_G06_GROUNDING_RULING.md). The gate this probe was built to
// inform is CROSSED. Two consequences, and only two:
//
//   1. The ACCEPTANCE TEST is now scripts/tests/g6-harness/
//      prove-g06-grounding.mjs, which discharges the ruling's ten required
//      proofs, exits NON-ZERO on failure, and is run by run-canonical.mjs.
//      THIS file remains a measurement instrument and still exits 0 either
//      way -- it is deliberately NOT converted into a second acceptance
//      test, because a probe that reports what the code does is worth
//      keeping distinct from one that asserts what it must do.
//   2. C3b's expectation was `UNRULED` and is now ruled: G06-5 selects the
//      packet's option R-A, so ACCEPT is the ratified behaviour. That single
//      label is the ONLY case expectation changed. No case, no rating and no
//      panel text was edited, so every "current behaviour" line below is
//      still a like-for-like re-measurement of the same inputs.
//
// The grounding function is PURE -- (panels, {ratings}) -> verdict -- so
// these cases need no database, no fixture row and no provider. That also
// means nothing here depends on P1-T09a's fixture expansion, and nothing
// here is a substitute for it: the end-to-end proof against real fixture
// rows is still owed.
//
// Run: node --import ./scripts/tests/integration/alias-loader.mjs \
//        scripts/tests/g6-harness/g06-grounding-evidence.mjs
// =====================================================================

import { validateGrounding } from "@/server/modules/ai-drafting/grounding.ts";

// eye_contact is `beginning` -> needs_support (A-051).
// body is `mastered` -> positive. sentence_flow is `mastering` -> positive.
const RATINGS = [
  { dimensionCode: "body", rating: "mastered" },
  { dimensionCode: "emotion", rating: "developing" },
  { dimensionCode: "speech", rating: "mastering" },
  { dimensionCode: "tonality", rating: "developing" },
  { dimensionCode: "eye_contact", rating: "beginning" },
  { dimensionCode: "vocal_projection", rating: "developing" },
  { dimensionCode: "emotional_expression", rating: "developing" },
  { dimensionCode: "sentence_flow", rating: "mastering" },
  { dimensionCode: "audience_awareness", rating: "developing" },
];
const INPUT = { studentDisplayName: "Fixture Student One", ratings: RATINGS };

const BASE = {
  overview: "The student sequenced the talk clearly and used posture confidently. Eye contact continued to need frequent prompting.",
  strengths: "The student used posture and gesture confidently and independently across today's activities.",
  areasForDevelopment: "Eye contact needs frequent prompting and support to become more consistent.",
  remarks: "A steady session overall, with consistent participation throughout.",
};

const CASES = [
  // -----------------------------------------------------------------
  // CASE 1 -- DELIBERATE CONTRADICTION. eye_contact is governed
  // needs_support and is described in Strengths as a demonstrated
  // positive capability. EXPECTED (proposed): REJECT.
  // -----------------------------------------------------------------
  {
    id: "C1 contradiction / Strengths",
    want: "REJECT",
    panels: { ...BASE, strengths: "Eye contact was the highlight of the session." },
  },
  {
    id: "C1b contradiction / Strengths, achievement wording",
    want: "REJECT",
    panels: { ...BASE, strengths: "Excellent eye contact throughout -- the student has clearly mastered holding the audience's gaze." },
  },

  // -----------------------------------------------------------------
  // CASE 2 -- LEGITIMATE DEVELOPMENTAL CONTEXT. The SAME non-positive
  // dimension, correctly described as a developmental need, in Overview
  // and in Areas for Development. EXPECTED (proposed): ACCEPT.
  // -----------------------------------------------------------------
  {
    id: "C2a developmental context / Overview",
    want: "ACCEPT",
    panels: { ...BASE, overview: "The student presented with clear structure. Eye contact is still developing and needed frequent prompting throughout." },
  },
  {
    id: "C2b developmental need / Areas for Development",
    want: "ACCEPT",
    panels: { ...BASE, areasForDevelopment: "Eye contact needs continued support; the student looked at the floor for most of the talk and responded well to prompting." },
  },

  // -----------------------------------------------------------------
  // CASE 3 -- REMARKS. Grounded commentary.
  //
  // ✅ RULED 2026-08-09 (G06-5): Remarks is GROUNDED BUT POLARITY-NEUTRAL --
  // the packet's option R-A. Rule 4 does not reach it; rules 1, 1b, 2, 3 and
  // 5 do, in full. C3b's ACCEPT is therefore the RATIFIED behaviour, not an
  // unruled measurement.
  //
  // ⚠️ HONEST LIMIT, and it is NOT what R-A means. C3b's wording ("a real
  // highlight worth celebrating") is a genuine contradiction that rule 3
  // does not catch, because `highlight` is not in ACHIEVEMENT_TERMS. G06-3
  // ratified exactly ONE lexicon addition (bare `strong`); widening further
  // changes rejection behaviour and is a §12 stop-and-ask. Recorded as a
  // standing residual in prove-g06-grounding.mjs section R -- not absorbed.
  // -----------------------------------------------------------------
  {
    id: "C3a remarks / grounded neutral",
    want: "ACCEPT",
    panels: { ...BASE, remarks: "This report covers the full session; the trainer observed the whole presentation." },
  },
  {
    id: "C3b remarks / needs_support named as a positive (RULED R-A, 2026-08-09)",
    want: "ACCEPT",
    panels: { ...BASE, remarks: "Eye contact was a real highlight worth celebrating at home." },
  },

  // -----------------------------------------------------------------
  // CASE 4 -- THE SUPPORT-FRAMING ESCAPE. Identical contradiction to C1,
  // plus ONE incidental use of an escape word ELSEWHERE in the same
  // panel. If the escape disarms the rule, the contradiction rule is
  // vacuous in ordinary Strengths prose.
  // -----------------------------------------------------------------
  {
    id: "C4 escape-word bypass / Strengths",
    want: "REJECT",
    panels: {
      ...BASE,
      strengths: "Eye contact was the highlight of the session. The student also continued to develop a confident stance.",
    },
  },

  // -----------------------------------------------------------------
  // CASE 5 -- RULE-3 FAIL-OPEN. One rating carries an unmapped label, so
  // POLARITY_BANDS[rating] is undefined. EXPECTED (proposed): REJECT
  // (fail closed). An impossible rating must never mean "skip grounding".
  // -----------------------------------------------------------------
  {
    id: "C5 unmapped rating / fail-open probe",
    want: "REJECT",
    panels: { ...BASE, strengths: "Excellent eye contact throughout -- truly outstanding and clearly mastered." },
    input: {
      studentDisplayName: "Fixture Student One",
      ratings: RATINGS.map((r) => (r.dimensionCode === "eye_contact" ? { ...r, rating: "not_a_real_label" } : r)),
    },
  },

  // -----------------------------------------------------------------
  // CASE 6 -- A SECOND ROUTE TO THE SAME FAIL-OPEN, found by adversarial
  // review and NOT anticipated by C5.
  //
  // Rule 1 checks only that the ratings array has LENGTH nine. `bandOf` is
  // a Map keyed by dimensionCode, so nine ratings in which one code is
  // DUPLICATED leave another code absent -- `bandOf.get(code)` is
  // undefined, and rules 3 and 4 both skip it. This needs no invalid enum
  // value at all, so it is reachable from any upstream read that does not
  // enforce distinct-code coverage.
  //
  // Proposed rule 1b must therefore assert COVERAGE of all nine governed
  // dimension codes, not a count.
  // -----------------------------------------------------------------
  {
    id: "C6 duplicated dimension code / second fail-open route",
    want: "REJECT",
    panels: { ...BASE, strengths: "Eye contact was the highlight of the session." },
    input: {
      studentDisplayName: "Fixture Student One",
      ratings: RATINGS.map((r) => (r.dimensionCode === "eye_contact" ? { ...r, dimensionCode: "body" } : r)),
    },
  },

  // -----------------------------------------------------------------
  // CASE 7 -- OVERVIEW CAN PRESENT A needs_support DIMENSION AS A
  // DEMONSTRATED STRENGTH.
  //
  // Rule 4 reads only `strengths`. Rule 3 fires only on ACHIEVEMENT_TERMS,
  // which contains "very strong" / "particularly strong" / "strong
  // command" but NOT bare "strong". So ordinary praise about a
  // needs_support dimension passes in Overview.
  //
  // This matters more after OD-4, not less: SYSTEM_PROMPT now tells the
  // model Overview "MAY draw together demonstrated strengths". The G-06
  // design must decide whether Overview needs its own rule, or whether
  // ACHIEVEMENT_TERMS should carry bare "strong".
  // -----------------------------------------------------------------
  {
    id: "C7 needs_support praised in Overview / bare-'strong' gap",
    want: "REJECT",
    panels: { ...BASE, overview: "The student showed strong, confident eye contact throughout the session and held the audience well." },
  },

  // -----------------------------------------------------------------
  // CASE 8 -- THE SUPPORT-FRAMING ESCAPE, second demonstration. C4 shows
  // an escape word in a SEPARATE sentence; this shows it in the SAME
  // sentence as the contradiction, which is the shape a model producing
  // natural Strengths prose will actually emit.
  // -----------------------------------------------------------------
  {
    id: "C8 escape word inside the contradicting sentence",
    want: "REJECT",
    panels: { ...BASE, strengths: "Eye contact was a highlight of the session, and the student will keep developing it." },
  },
];

console.log("G-06 GROUNDING EVIDENCE PROBE -- CURRENT SHIPPED BEHAVIOUR");
console.log("This measures. It ratifies nothing.\n");

const rows = [];
for (const c of CASES) {
  const verdict = validateGrounding(c.panels, c.input ?? INPUT);
  const actual = verdict.ok ? "ACCEPT" : "REJECT";
  const agrees = c.want === "UNRULED" ? "n/a" : (actual === c.want ? "yes" : "NO");
  rows.push({ id: c.id, want: c.want, actual, agrees, reasons: verdict.ok ? [] : verdict.reasons });
  console.log(`${c.id}`);
  console.log(`  proposed-expectation: ${c.want}`);
  console.log(`  CURRENT behaviour   : ${actual}${agrees === "NO" ? "   <-- CURRENT DISAGREES WITH THE PROPOSAL" : ""}`);
  if (!verdict.ok) for (const r of verdict.reasons) console.log(`      reason: ${r}`);
  console.log("");
}

const disagreements = rows.filter((r) => r.agrees === "NO");
console.log("---------------------------------------------------------------");
console.log(`Cases: ${rows.length}. Current implementation disagrees with the PROPOSED rule set in ${disagreements.length} case(s):`);
for (const d of disagreements) console.log(`  - ${d.id}: proposed ${d.want}, current ${d.actual}`);
console.log("");
console.log("Those disagreements are exactly what G-06 must decide. This probe");
console.log("exits 0 either way: it is EVIDENCE, not an acceptance test, and a");
console.log("non-zero exit here would read as a verdict the Operator has not given.");
