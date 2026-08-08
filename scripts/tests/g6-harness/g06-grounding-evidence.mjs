#!/usr/bin/env node
// =====================================================================
// G-06 / P1-T09 -- GROUNDING RULE EVIDENCE PROBE (read-only, no ruling)
// =====================================================================
// LOCAL ONLY. Constructs NO provider and makes NO network call. It imports
// the SHIPPED grounding implementation and reports what it ACTUALLY DOES
// today, panel by panel, against a fixed set of synthetic drafts.
//
// THIS PROBE RATIFIES NOTHING AND CHANGES NOTHING. G-06 is an open Operator
// gate. Its purpose is to replace assertion with measurement in the decision
// packet: every behaviour claimed in
// docs/plan/G06_GROUNDING_RULE_DESIGN_PACKET.md is produced by running this,
// so the Operator can re-run it and check the claims rather than trust them.
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
  // CASE 3 -- REMARKS. Grounded commentary. NO polarity posture is ruled
  // for this panel, so what the CURRENT implementation does here is a
  // measurement, not an expectation.
  // -----------------------------------------------------------------
  {
    id: "C3a remarks / grounded neutral",
    want: "ACCEPT",
    panels: { ...BASE, remarks: "This report covers the full session; the trainer observed the whole presentation." },
  },
  {
    id: "C3b remarks / needs_support named as a positive (UNRULED)",
    want: "UNRULED",
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
