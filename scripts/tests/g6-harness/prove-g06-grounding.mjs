#!/usr/bin/env node
// =====================================================================
// G-06 / P1-T09 -- PERMANENT ACCEPTANCE PROOF FOR THE RATIFIED GROUNDING
// RULE SET
// =====================================================================
// Authority: FINAL_MVP_G06_GROUNDING_RULING.md (Operator ruling, ratified
// 2026-08-09). This file discharges that instrument's ten REQUIRED PROOFS.
//
// HOW THIS DIFFERS FROM g06-grounding-evidence.mjs, which it does not
// replace: the evidence probe MEASURES and deliberately exits 0 either way,
// because a non-zero exit there would have read as a verdict the Operator
// had not yet given. The gate is now crossed, so this file is an ACCEPTANCE
// TEST and exits non-zero on any failure.
//
// WHY THE MUTATION SECTION EXISTS. The ruling closes with:
//
//   "Every new control must be proven capable of FIRING against a
//    deliberately planted regression ... A control that has never been
//    demonstrated failing is not evidence."
//
// A suite of REJECT assertions cannot distinguish "the new rule caught it"
// from "something else caught it, and the new rule is vacuous". This project
// has already shipped that exact illusion twice -- the A-053 polarity skip,
// and the nine OD-4 guards that stayed green while scanning for column names
// that no longer existed. So section M below REVERTS each new control, one at
// a time, and requires the corresponding case to FLIP TO ACCEPT. If a
// reverted control does not flip its case, the case was never proving that
// control and the proof fails loudly.
//
// The grounding function is PURE -- (panels, input, anchors) -> verdict -- so
// nothing here needs a database, a fixture row, a provider or a network call.
//
// Run: node --import ./scripts/tests/integration/alias-loader.mjs \
//        scripts/tests/g6-harness/prove-g06-grounding.mjs
// =====================================================================

import {
  validateGrounding,
  GROUNDING_ANCHORS,
} from "@/server/modules/ai-drafting/grounding.ts";

let failures = 0;
let checks = 0;

function check(id, want, panels, input, anchors, note) {
  checks += 1;
  const verdict = validateGrounding(panels, input, anchors ?? GROUNDING_ANCHORS);
  const actual = verdict.ok ? "ACCEPT" : "REJECT";
  if (actual !== want) {
    failures += 1;
    console.log(`FAIL ${id} -- expected ${want}, got ${actual}${note ? ` (${note})` : ""}`);
    if (!verdict.ok) for (const r of verdict.reasons) console.log(`       reason: ${r}`);
    return verdict;
  }
  console.log(`PASS ${id} -- ${want}${note ? ` (${note})` : ""}`);
  return verdict;
}

/** A REJECT whose reasons must additionally mention every fragment given. */
function checkReject(id, panels, input, mustMention, note) {
  const verdict = check(id, "REJECT", panels, input, undefined, note);
  if (verdict.ok) return;
  for (const fragment of mustMention) {
    checks += 1;
    if (verdict.reasons.some((r) => r.includes(fragment))) {
      console.log(`PASS ${id}.reason -- names "${fragment}"`);
    } else {
      failures += 1;
      console.log(`FAIL ${id}.reason -- no reason names "${fragment}"`);
      for (const r of verdict.reasons) console.log(`       reason: ${r}`);
    }
  }
}

// ---------------------------------------------------------------------
// The governed assessment these panels are validated against.
//
// eye_contact = beginning        -> needs_support
// vocal_projection = beginning   -> needs_support   (a SECOND needs_support
//                                   dimension, required by proof 9)
// body = mastered, speech/sentence_flow = mastering -> positive
// the rest = developing          -> developing
// ---------------------------------------------------------------------
const RATINGS = [
  { dimensionCode: "body", displayName: "Body", rating: "mastered" },
  { dimensionCode: "emotion", displayName: "Emotion", rating: "developing" },
  { dimensionCode: "speech", displayName: "Speech", rating: "mastering" },
  { dimensionCode: "tonality", displayName: "Tonality", rating: "developing" },
  { dimensionCode: "eye_contact", displayName: "Eye Contact", rating: "beginning" },
  { dimensionCode: "vocal_projection", displayName: "Vocal Projection", rating: "beginning" },
  { dimensionCode: "emotional_expression", displayName: "Emotional Expression", rating: "developing" },
  { dimensionCode: "sentence_flow", displayName: "Sentence Flow", rating: "mastering" },
  { dimensionCode: "audience_awareness", displayName: "Audience Awareness", rating: "developing" },
];
const INPUT = { studentDisplayName: "Fixture Student One", ratings: RATINGS };

/** A clean, correctly-grounded four-panel draft. Every ACCEPT baseline. */
const BASE = {
  overview:
    "The student sequenced the talk clearly and used posture confidently. Eye contact still needed frequent prompting throughout.",
  strengths:
    "The student used posture and gesture confidently and independently across today's activities.",
  areasForDevelopment:
    "Eye contact needs frequent prompting to become more consistent, and the voice was quiet at the back of the room.",
  remarks: "A steady session overall, with consistent participation throughout.",
};

console.log("G-06 GROUNDING RULE SET -- PERMANENT ACCEPTANCE PROOF");
console.log("Authority: FINAL_MVP_G06_GROUNDING_RULING.md, ratified 2026-08-09\n");

// =====================================================================
// SECTION 0 -- the baseline must ACCEPT.
// Without this every REJECT below would be satisfiable by a rule set that
// simply rejects everything.
// =====================================================================
console.log("--- 0. baseline ---");
check("G06-P0", "ACCEPT", BASE, INPUT, undefined, "a correctly-grounded draft is not rejected");

// =====================================================================
// PROOF 1 -- deliberate contradiction in Strengths: REJECT.
// =====================================================================
console.log("\n--- 1. deliberate contradiction in Strengths -> REJECT ---");
checkReject(
  "G06-P1a",
  { ...BASE, strengths: "Eye contact was the highlight of the session." },
  INPUT,
  ["strengths", "eye_contact"],
  "rule 4: needs_support presented as a demonstrated strength",
);
checkReject(
  "G06-P1b",
  {
    ...BASE,
    strengths: "Excellent eye contact throughout -- the student has clearly mastered it.",
  },
  INPUT,
  ["eye_contact", "contradicts the trainer's rating"],
  "rule 3: explicit achievement language about a needs_support dimension",
);

// =====================================================================
// PROOF 2 -- legitimate developmental Overview: ACCEPT.
// G06-3: Overview may carry developmental and mixed context. This is the
// FALSE-REJECTION the ruling exists to prevent, so it is as load-bearing as
// any rejection in this file.
// =====================================================================
console.log("\n--- 2. legitimate developmental Overview -> ACCEPT ---");
check(
  "G06-P2a",
  "ACCEPT",
  {
    ...BASE,
    overview:
      "The student presented with clear structure. Eye contact is still building and needed frequent prompting throughout the talk.",
  },
  INPUT,
  undefined,
  "a needs_support dimension described developmentally in Overview",
);
check(
  "G06-P2b",
  "ACCEPT",
  {
    ...BASE,
    overview:
      "A mixed session: posture was confident and independent, while eye contact and projection both needed steady prompting.",
  },
  INPUT,
  undefined,
  "mixed positive-and-developmental synthesis in Overview",
);

// =====================================================================
// PROOF 3 -- legitimate Areas for Development: ACCEPT.
// G06-4: this panel EXISTS to name non-positive dimensions.
// =====================================================================
console.log("\n--- 3. legitimate Areas for Development -> ACCEPT ---");
check(
  "G06-P3",
  "ACCEPT",
  {
    ...BASE,
    areasForDevelopment:
      "Eye contact needs continued support; the student looked at the floor for most of the talk and responded well to prompting. Projection also needs to carry to the back of the room.",
  },
  INPUT,
  undefined,
  "both needs_support dimensions named as needs",
);

// =====================================================================
// PROOF 4 -- grounded neutral Remarks: ACCEPT.
// G06-5 / packet R-A: Remarks is POLARITY-NEUTRAL. Neither a positive-only
// nor a development-only posture may be imposed on it.
// =====================================================================
console.log("\n--- 4. grounded neutral Remarks -> ACCEPT ---");
check(
  "G06-P4a",
  "ACCEPT",
  { ...BASE, remarks: "This report covers the full session; the trainer observed the whole presentation." },
  INPUT,
  undefined,
  "neutral commentary",
);
check(
  "G06-P4b",
  "ACCEPT",
  { ...BASE, remarks: "Eye contact came up again this week and is worth practising at home before the next session." },
  INPUT,
  undefined,
  "R-A: a needs_support dimension MENTIONED in Remarks is not itself a violation",
);

// =====================================================================
// PROOF 5 -- unsupported / contradictory Remarks: REJECT through GENERAL
// grounding.
//
// This is what "polarity-neutral is not ungoverned" means (G06-5). Rule 4
// does not reach Remarks; rule 3 does, in full, and rule 3 has no escape
// clause.
// =====================================================================
console.log("\n--- 5. contradictory Remarks -> REJECT through general grounding ---");
checkReject(
  "G06-P5a",
  { ...BASE, remarks: "Eye contact was excellent all session and is clearly mastered now." },
  INPUT,
  ["remarks", "eye_contact", "contradicts the trainer's rating"],
  "rule 3 reaches Remarks",
);
checkReject(
  "G06-P5b",
  { ...BASE, remarks: "Projection was outstanding throughout." },
  INPUT,
  ["remarks", "vocal_projection"],
  "rule 3 reaches Remarks for the second needs_support dimension too",
);
checkReject(
  "G06-P5c",
  { ...BASE, remarks: "Eye contact is rated as Mastered this term." },
  INPUT,
  ["attributed to the student"],
  "rule 2 (A-052 attribution) reaches Remarks",
);

// G06-P5d -- THE C3b CASE. This is the design packet's own canonical
// contradictory-Remarks case, and it was the RESIDUAL that P1-T09 reported
// rather than absorbed: `highlight` was not in ACHIEVEMENT_TERMS, so a
// genuine contradiction was ACCEPTED. Closed by Operator ruling on
// 2026-08-09 by widening the lexicon -- the same mechanism G06-3 uses,
// NOT by giving Remarks a polarity posture. R-A is unaffected: rule 4
// still does not reach Remarks, and this rejection comes from rule 3.
checkReject(
  "G06-P5d",
  { ...BASE, remarks: "Eye contact was a real highlight worth celebrating at home." },
  INPUT,
  ["remarks", "eye_contact", "contradicts the trainer's rating"],
  "C3b: celebratory wording about a needs_support dimension is now caught by rule 3",
);
checkReject(
  "G06-P5e",
  { ...BASE, overview: "Eye contact was a real highlight worth celebrating at home." },
  INPUT,
  ["overview", "eye_contact"],
  "and the identical wording is caught in Overview too -- it is a lexicon fix, not a per-panel rule",
);

// =====================================================================
// PROOF 6 -- unknown / unmapped rating: REJECT (G06-7, case C5).
// An impossible rating must never buy a free pass through polarity
// grounding. It previously did: POLARITY_BANDS[rating] was undefined and the
// dimension was silently skipped -- the A-053 shape exactly.
// =====================================================================
console.log("\n--- 6. unknown / unmapped rating -> REJECT (fail closed) ---");
checkReject(
  "G06-P6a",
  { ...BASE, strengths: "Excellent eye contact throughout -- truly outstanding and clearly mastered." },
  {
    studentDisplayName: "Fixture Student One",
    ratings: RATINGS.map((r) => (r.dimensionCode === "eye_contact" ? { ...r, rating: "not_a_real_label" } : r)),
  },
  ["does not resolve to a ratified polarity band"],
  "an unmapped rating label",
);
checkReject(
  "G06-P6b",
  BASE,
  {
    studentDisplayName: "Fixture Student One",
    ratings: RATINGS.map((r) => (r.dimensionCode === "tonality" ? { ...r, rating: "secure" } : r)),
  },
  ["does not resolve to a ratified polarity band"],
  "a SUPERSEDED label is not a ratified band either -- an even cleanly-spelled ghost fails closed",
);
checkReject(
  "G06-P6c",
  BASE,
  {
    studentDisplayName: "Fixture Student One",
    ratings: RATINGS.map((r) => (r.dimensionCode === "emotion" ? { ...r, dimensionCode: "confidence" } : r)),
  },
  ["unrecognised dimension code"],
  "an unrecognised dimension CODE also fails closed",
);

// =====================================================================
// PROOF 7 -- all nine canonical dimension codes recognised, proven by
// COVERAGE, not by count, and NOT satisfiable by a duplicate (G06-1).
//
// The count of nine was always satisfied in case C6: one code duplicated,
// another absent, no invalid enum anywhere. The coverage assertion is
// therefore run against EVERY ONE of the nine codes in turn, so a rule that
// happened to cover only the one dimension the other cases use cannot pass
// this section.
// =====================================================================
console.log("\n--- 7. nine-code COVERAGE, not a count, not satisfiable by a duplicate ---");
checkReject(
  "G06-P7-dup",
  { ...BASE, strengths: "Eye contact was the highlight of the session." },
  {
    studentDisplayName: "Fixture Student One",
    ratings: RATINGS.map((r) => (r.dimensionCode === "eye_contact" ? { ...r, dimensionCode: "body" } : r)),
  },
  ["repeats dimension body", "does not cover governed dimension eye_contact"],
  "count of nine satisfied, coverage is not",
);

for (const code of GROUNDING_ANCHORS.dimensionCodes) {
  // Drop exactly one code by re-pointing it at another governed code. The
  // array LENGTH stays nine, so rule 1's count still passes and only the
  // coverage assertion can catch it.
  const substitute = code === "body" ? "emotion" : "body";
  checkReject(
    `G06-P7[${code}]`,
    BASE,
    {
      studentDisplayName: "Fixture Student One",
      ratings: RATINGS.map((r) => (r.dimensionCode === code ? { ...r, dimensionCode: substitute } : r)),
    },
    [`does not cover governed dimension ${code}`],
    "one governed dimension left uncovered while the count stays nine",
  );
}

// =====================================================================
// PROOF 8 -- a panel-wide support-word bypass cannot bypass (G06-6).
//
// Every one of the SEVEN words G06-6 names as prohibited escapes is tried,
// in BOTH shapes that were measured: in a separate sentence (case C4) and
// inside the contradicting sentence itself (case C8).
// =====================================================================
console.log("\n--- 8. support-word bypass cannot bypass ---");
const PROHIBITED_ESCAPES = [
  "develop",
  "developing",
  "building",
  "practice",
  "practising",
  "improving",
  "working on",
];

for (const word of PROHIBITED_ESCAPES) {
  checkReject(
    `G06-P8-sep[${word}]`,
    {
      ...BASE,
      strengths: `Eye contact was the highlight of the session. The student is ${word} a confident stance too.`,
    },
    INPUT,
    ["eye_contact", "without support framing"],
    "C4 shape: escape word in a SEPARATE sentence",
  );
  checkReject(
    `G06-P8-same[${word}]`,
    {
      ...BASE,
      strengths: `Eye contact was a highlight of the session, and the student is ${word} it further.`,
    },
    INPUT,
    ["eye_contact", "without support framing"],
    "C8 shape: escape word INSIDE the contradicting sentence",
  );
}

// A genuine support marker in the SAME sentence must still escape, or the
// narrowing would have been achieved by making the escape unreachable.
check(
  "G06-P8-legit",
  "ACCEPT",
  {
    ...BASE,
    strengths:
      "Eye contact steadied noticeably with prompting during the group activity, which is real progress.",
  },
  INPUT,
  undefined,
  "an EXPLICIT support marker still escapes -- the escape is narrowed, not removed",
);

// =====================================================================
// PROOF 9 -- a support phrase for dimension A cannot immunize a
// contradictory positive claim about dimension B in the same panel (G06-6).
//
// Proved DIFFERENTIALLY, so the rejection is attributed to the right
// sentence: the support-framed sentence ALONE must ACCEPT, and adding the
// contradicting sentence about the OTHER dimension must flip it to REJECT.
// Under the superseded whole-panel escape, the word "support" in sentence 1
// disarmed the rule for every dimension in the panel and this ACCEPTED.
// =====================================================================
console.log("\n--- 9. cross-dimension immunization is impossible ---");
const SUPPORT_SENTENCE_A = "Projection needs support and carried better with reminders today.";
const CONTRADICTION_SENTENCE_B = "Eye contact was the highlight of the session.";

check(
  "G06-P9a",
  "ACCEPT",
  { ...BASE, strengths: SUPPORT_SENTENCE_A },
  INPUT,
  undefined,
  "control: the support-framed sentence alone is legitimately escaped",
);
checkReject(
  "G06-P9b",
  { ...BASE, strengths: `${SUPPORT_SENTENCE_A} ${CONTRADICTION_SENTENCE_B}` },
  INPUT,
  ["eye_contact", "without support framing"],
  "dimension A's support phrase does not immunize dimension B",
);
checkReject(
  "G06-P9c",
  { ...BASE, strengths: `${CONTRADICTION_SENTENCE_B} ${SUPPORT_SENTENCE_A}` },
  INPUT,
  ["eye_contact", "without support framing"],
  "and the order does not matter",
);

// =====================================================================
// PROOF 10 -- required grounding anchors disappearing: FAIL CLOSED.
//
// Every rule above is only as strong as the closed lexicon it reads. These
// degradations are exactly the silent-green class that has already bitten
// this project twice, so each must produce a REJECT even on a PERFECTLY
// CLEAN draft -- the strongest available statement that the failure is not
// being absorbed.
// =====================================================================
console.log("\n--- 10. degraded anchors -> FAIL CLOSED even on a clean draft ---");
const DEGRADATIONS = [
  ["achievement lexicon emptied", { achievementTerms: [] }],
  ["a panel key lost", { panelKeys: ["overview", "strengths", "remarks"] }],
  ["a dimension code lost", { dimensionCodes: GROUNDING_ANCHORS.dimensionCodes.slice(0, 8) }],
  ["a dimension's attribution terms emptied", {
    dimensionTerms: { ...GROUNDING_ANCHORS.dimensionTerms, eye_contact: [] },
  }],
  ["a polarity band lost", {
    polarityBands: { beginning: "needs_support", developing: "developing", mastering: "positive" },
  }],
  ["an attribution rule deleted", { attributionRules: GROUNDING_ANCHORS.attributionRules.slice(0, 4) }],
];

for (const [label, patch] of DEGRADATIONS) {
  checks += 1;
  const verdict = validateGrounding(BASE, INPUT, { ...GROUNDING_ANCHORS, ...patch });
  if (verdict.ok) {
    failures += 1;
    console.log(`FAIL G06-P10[${label}] -- a degraded anchor set ACCEPTED a draft; the guard is fail-OPEN`);
  } else {
    console.log(`PASS G06-P10[${label}] -- REJECT`);
  }
}

// A missing PANEL, as distinct from a missing panel key, must also reject:
// an absent panel would otherwise read as "" and be trivially grounded.
checks += 1;
{
  const withoutRemarks = { ...BASE };
  delete withoutRemarks.remarks;
  const verdict = validateGrounding(withoutRemarks, INPUT);
  if (verdict.ok) {
    failures += 1;
    console.log("FAIL G06-P10[panel absent] -- a draft missing a whole panel was ACCEPTED");
  } else if (!verdict.reasons.some((r) => r.includes("remarks") && r.includes("absent"))) {
    failures += 1;
    console.log("FAIL G06-P10[panel absent] -- rejected, but not for the missing panel");
    for (const r of verdict.reasons) console.log(`       reason: ${r}`);
  } else {
    console.log("PASS G06-P10[panel absent] -- REJECT, naming the absent panel");
  }
}

// =====================================================================
// SECTION M -- MUTATION / FIRING PROOFS.
//
// Revert each NEW control and require its case to FLIP TO ACCEPT. A case
// that does not flip was never proving that control, and this section fails
// rather than letting a vacuous assertion stand.
// =====================================================================
console.log("\n--- M. mutation proofs: each new control is load-bearing ---");

function mustFlipToAccept(id, panels, input, anchors, what) {
  checks += 1;
  const before = validateGrounding(panels, input);
  const after = validateGrounding(panels, input, anchors);
  if (!before.ok && after.ok) {
    console.log(`PASS ${id} -- reverting ${what} flips REJECT -> ACCEPT, so the control is load-bearing`);
  } else {
    failures += 1;
    console.log(
      `FAIL ${id} -- reverting ${what} did NOT flip the verdict (before=${before.ok ? "ACCEPT" : "REJECT"}, after=${after.ok ? "ACCEPT" : "REJECT"}). ` +
        "The case is not proving this control.",
    );
  }
}

// M1 -- the NARROWED support lexicon is what closes the C8 SHAPE (an escape
// word inside the contradicting sentence). Restore the superseded lexicon
// (which contained `develop`) and the case must go green again.
//
// ⚠️ THIS CASE WAS RE-DERIVED ON 2026-08-09, AND THE REASON IS THE WHOLE
// POINT OF SECTION M. It originally used the packet's literal C8 sentence,
// "Eye contact was a highlight of the session, and the student will keep
// developing it." When `highlight` entered ACHIEVEMENT_TERMS, RULE 3 began
// rejecting that sentence outright -- so reverting rule 4's support lexicon
// no longer flipped the verdict, and M1 FAILED LOUDLY.
//
// That failure was correct and valuable: the case had stopped isolating the
// control it claimed to prove. The fix is to re-derive the case, NOT to
// delete the mutation proof and NOT to relax it -- a sentence carrying no
// achievement-lexicon term, so rule 3 stays silent and rule 4's escape is
// the only thing under test. The literal C8 sentence is unaffected and is
// still asserted, twice, at G06-P8-same[develop*] -- it is now caught by
// TWO independent rules instead of one, which is strictly stronger.
// ⚠️ RE-DERIVED A SECOND TIME at the adversarial-review remediation, and again
// because it FAILED LOUDLY rather than being quietly weakened.
//
// The previous case leaned on a mutated lexicon containing "develop" matching
// inside "developing". Term matching is now WORD-BOUNDARY anchored (it had to
// be: `strong` was matching "stronger", `tone` was matching "monotone", and
// valid parent prose was being rejected), so "develop" no longer matches
// "developing" and the mutation could not flip the verdict. The case had
// stopped isolating its control for the second time.
//
// It now targets the control that actually changed: bare `needs`/`needed` were
// removed from the support lexicon because they were a GENERAL-PURPOSE escape,
// not support framing — any Strengths sentence containing "needs" anywhere,
// including outright praise like "needs no reminders", disarmed rule 4. This
// case proves that narrowing is load-bearing: with the superseded lexicon
// restored, the praise is immunized again and the verdict flips to ACCEPT.
mustFlipToAccept(
  "G06-M1",
  { ...BASE, strengths: "Eye contact needs no reminders now." },
  INPUT,
  {
    ...GROUNDING_ANCHORS,
    supportMarkers: [...GROUNDING_ANCHORS.supportMarkers, "needs", "needed"],
  },
  "the narrowed support lexicon (restoring bare `needs`/`needed`)",
);

// M2 -- bare `strong` in ACHIEVEMENT_TERMS is what closes C7. Remove it and
// Overview can praise a needs_support dimension again.
mustFlipToAccept(
  "G06-M2",
  {
    ...BASE,
    overview: "The student showed strong, confident eye contact throughout the session.",
  },
  INPUT,
  {
    ...GROUNDING_ANCHORS,
    achievementTerms: GROUNDING_ANCHORS.achievementTerms.filter((t) => t !== "strong"),
  },
  "bare `strong` in the achievement lexicon",
);

// M4 -- `highlight` in ACHIEVEMENT_TERMS is what closes C3b. Remove it and
// the packet's canonical contradictory-Remarks case goes green again,
// exactly as it was before the 2026-08-09 ruling.
mustFlipToAccept(
  "G06-M4",
  { ...BASE, remarks: "Eye contact was a real highlight worth celebrating at home." },
  INPUT,
  {
    ...GROUNDING_ANCHORS,
    achievementTerms: GROUNDING_ANCHORS.achievementTerms.filter(
      (t) => t !== "highlight" && t !== "worth celebrating",
    ),
  },
  "the celebratory wording added to the achievement lexicon",
);

// M3 -- rule 4 is what closes C1. Remove `strengths` from the panel keys and
// the rule stops reading it. (The anchor guard would normally reject a
// 3-key set, so this mutation also relaxes the expected count by supplying a
// 4-key list in which `strengths` is replaced by a harmless duplicate-free
// stand-in is NOT possible -- instead the flip is demonstrated by emptying
// the eye_contact terms, which is what rule 4 uses to name the dimension.)
mustFlipToAccept(
  "G06-M3",
  { ...BASE, strengths: "Eye contact was the highlight of the session." },
  INPUT,
  {
    ...GROUNDING_ANCHORS,
    // Emptying eye_contact's terms would trip the anchor guard, so instead
    // narrow them to a token the sentence does not contain. The dimension is
    // still "covered" and the anchor guard still passes -- only rule 4's
    // ability to ATTRIBUTE the sentence is removed.
    dimensionTerms: { ...GROUNDING_ANCHORS.dimensionTerms, eye_contact: ["ocular engagement"] },
  },
  "rule 4's ability to attribute the sentence to eye_contact",
);

// =====================================================================
// SECTION F -- THE DETERMINISTIC FIXTURE PROVIDER MUST GROUND ITSELF, AT
// EVERY RATING DISTRIBUTION.
//
// Design packet §8.1, measured and recorded but not fixed at the time: with
// every dimension at `beginning` there was no positive dimension, so the
// provider fell back to the LITERAL "participation" and Strengths asserted
// "showed steady, confident work in participation". Grounding returned ok
// SOLELY because "participation" is not a dimension term -- it passed by
// being UNGROUNDED rather than by being correct.
//
// G06-8 authorizes correcting it as a correctness defect. This section is
// the regression: the provider's OWN output is fed through the ratified
// grounding gate at every uniform band and at the extremes, so the defect
// cannot return by way of a distribution nobody tested. The hero lifecycle
// runs on this provider, so a fabrication here reaches a parent-facing
// panel.
// =====================================================================
console.log("\n--- F. the fixture provider grounds its own output at every distribution ---");

const { DeterministicFixtureDraftProvider } = await import("@/server/modules/ai-drafting/provider.ts");
const { POLARITY_BANDS, RUBRIC_ANCHORS, FRAMEWORK_DIMENSIONS } = await import(
  "@/server/modules/framework/dimensions.ts"
);
const provider = new DeterministicFixtureDraftProvider();

function requestFor(ratingOf) {
  return {
    reportId: "00000000-0000-0000-0000-000000000000",
    observationLockVersion: 1,
    studentDisplayName: "Fixture Student One",
    ratings: FRAMEWORK_DIMENSIONS.map((d, i) => {
      const rating = ratingOf(d, i);
      return {
        dimensionCode: d.code,
        displayName: d.displayName,
        rating,
        anchorText: RUBRIC_ANCHORS[rating],
        polarityBand: POLARITY_BANDS[rating],
      };
    }),
    strengthChips: [],
    focusChips: [],
    trainerNotes: "",
    followUpNotes: "",
  };
}

const DISTRIBUTIONS = [
  ["all beginning (no positive dimension exists -- the §8.1 case)", () => "beginning"],
  ["all developing (no positive dimension exists either)", () => "developing"],
  ["all mastering", () => "mastering"],
  ["all mastered", () => "mastered"],
  ["mixed, one positive", (d) => (d.code === "body" ? "mastered" : "beginning")],
  ["mixed, one needs_support", (d) => (d.code === "eye_contact" ? "beginning" : "mastering")],
  // ⚠️ RE-DERIVED FROM THE LIVE DATABASE, 2026-08-09. The single entry that
  // used to sit here was labelled "the ratified fixture shape" but was a
  // HAND-TRANSCRIBED literal, and it had DRIFTED: positions 7 and 9
  // (emotional_expression, audience_awareness) both read `developing`, while
  // the live `observation_ratings` rows carry `mastering` and `mastered`.
  // Both shapes happen to ACCEPT, so nothing was failing -- which is exactly
  // why it went unnoticed. A control labelled with the fixture's name while
  // asserting a shape nobody re-derived does not prove what its label claims.
  //
  // Both live observations are now covered, read out of the database with:
  //   select r.dimension_code, r.rating from public.observation_ratings r
  //   join public.assessment_dimensions d on d.code = r.dimension_code
  //   order by r.observation_id, d.sort_order;
  // FRAMEWORK_DIMENSIONS is in that same sort_order, so index i aligns.
  //
  // These stay literals ON PURPOSE: this harness is PURE (no database, no
  // fixture row, no network -- see the header), and that property is worth
  // more than auto-derivation. The cost is that they must be re-derived
  // whenever the fixture changes, which is what this comment is for.
  [
    "live fixture observation e9000000 (the ratified Step 7F shape)",
    (d, i) => ["mastered", "developing", "mastering", "developing", "beginning", "beginning", "mastering", "developing", "mastered"][i],
  ],
  [
    "live fixture observation c9000000 (the P1-T09a continuity expansion)",
    (d, i) => ["mastering", "developing", "beginning", "mastering", "mastered", "developing", "beginning", "mastering", "mastered"][i],
  ],
];

for (const [label, ratingOf] of DISTRIBUTIONS) {
  const request = requestFor(ratingOf);
  const outcome = await provider.generate(request);
  checks += 1;
  if (outcome.kind !== "ok") {
    failures += 1;
    console.log(`FAIL G06-F[${label}] -- provider returned ${outcome.kind}, not a draft`);
    continue;
  }
  const verdict = validateGrounding(outcome.panels, {
    studentDisplayName: request.studentDisplayName,
    ratings: request.ratings,
  });
  if (verdict.ok) {
    console.log(`PASS G06-F[${label}] -- the provider's own draft passes the ratified gate`);
  } else {
    failures += 1;
    console.log(`FAIL G06-F[${label}] -- the provider emitted a draft its own gate rejects`);
    for (const r of verdict.reasons) console.log(`       reason: ${r}`);
  }
  // The invented literals must be gone entirely. Grounding cannot see them
  // -- that was the whole defect -- so this is asserted directly.
  for (const literal of ["participation", "overall delivery"]) {
    checks += 1;
    const all = Object.values(outcome.panels).join(" ").toLowerCase();
    if (all.includes(literal)) {
      failures += 1;
      console.log(`FAIL G06-F[${label}] -- the fabricated literal "${literal}" is back in the prose`);
    }
  }
  console.log(`PASS G06-F[${label}].literals -- no invented dimension name in any panel`);
}

// =====================================================================
// SECTION R -- WHAT THE CELEBRATORY-WORDING FIX MUST NOT BREAK.
//
// This section was a RESIDUAL register at P1-T09: `highlight` was not in
// ACHIEVEMENT_TERMS, the packet's canonical C3b case was still accepted,
// and that was reported rather than absorbed. The Operator ruled it closed
// on 2026-08-09. C3b is now an ASSERTED proof (G06-P5d/P5e above).
//
// What survives here is the other half of that change, and it is the half
// that is easy to get wrong: widening a rejection lexicon can FALSE-REJECT.
// These cases exist to prove it did not. Celebratory wording about a
// dimension whose own rating SUPPORTS it must stay legal in every panel --
// rule 3 fires only on the CONTRADICTION, never on the vocabulary.
// =====================================================================
console.log("\n--- R. the widened lexicon must not false-reject legitimate praise ---");

// `body` is `mastered` and `audience_awareness` is `developing` in this
// input, so praise about POSTURE is grounded and must pass, while the same
// sentence shape about a non-positive dimension is what P5d/P5e reject.
check(
  "G06-R1",
  "ACCEPT",
  { ...BASE, strengths: "Posture was a real highlight of the session and is worth celebrating at home." },
  INPUT,
  undefined,
  "celebratory wording about a POSITIVE dimension stays legal in Strengths",
);
check(
  "G06-R2",
  "ACCEPT",
  { ...BASE, overview: "The confident stance was the highlight of the talk." },
  INPUT,
  undefined,
  "...and in Overview",
);
check(
  "G06-R3",
  "ACCEPT",
  { ...BASE, remarks: "A highlight worth celebrating: the gesture work has really settled." },
  INPUT,
  undefined,
  "...and in Remarks, which R-A leaves polarity-neutral",
);

// =====================================================================
// SECTION A -- ADVERSARIAL-REVIEW REMEDIATION (P1-T11).
//
// Two independent read-only reviewers were run against the ratified rule set
// under CLAUDE.md §14.6, instructed to falsify rather than confirm. Each case
// below is a defect one of them DEMONSTRATED against the shipped implementation
// and which is now closed. They are permanent so the defects cannot silently
// return: every one of them passed this suite at the time it was found.
//
// ⚠️ Each is scoped to the RATIFIED rules. None adds a rule, none widens a
// panel's polarity posture, and none narrows a ruled escape: they make the
// implementation do what G06-1..G06-8 already say.
// =====================================================================
console.log("\n--- A. adversarial-review remediation ---");

// A1 -- DIMENSION DISPLAY NAMES WERE UNDETECTABLE, so rule 3 could not fire.
// body / emotion / speech carried no term matching their own name, so the most
// explicit contradiction possible -- naming the dimension and claiming mastery
// of it -- was ACCEPTED, while the identical sentence about tonality REJECTED.
for (const [code, sentence] of [
  ["body", "Body was mastered today and quite outstanding."],
  ["emotion", "Emotion was excellent throughout the talk."],
  ["speech", "Speech was excellent and essentially flawless."],
]) {
  checkReject(
    `G06-A1[${code}]`,
    { ...BASE, strengths: sentence },
    { ...INPUT, ratings: RATINGS.map((r) => (r.dimensionCode === code ? { ...r, rating: "beginning" } : r)) },
    ["contradicts the trainer's rating"],
    "a dimension's own display name is attributable, so rule 3 can fire",
  );
}

// A2 -- BARE `needs`/`needed` WAS A GENERAL-PURPOSE ESCAPE, not support
// framing. Any Strengths sentence containing the word -- including outright
// praise -- disarmed rule 4 for that sentence. G06-6 scopes the escape to
// SUPPORT FRAMING, so this is the implementation matching the ruling.
checkReject(
  "G06-A2a",
  { ...BASE, strengths: "Eye contact was outstanding and needs no reminders." },
  INPUT,
  ["without support framing"],
  "praise containing 'needs' is not support framing",
);
checkReject(
  "G06-A2b",
  { ...BASE, strengths: "Eye contact was a real strength; needed no help at all." },
  INPUT,
  ["without support framing"],
  "...nor is 'needed'",
);

// A3 -- THE ESCAPE WAS SENTENCE-LOCAL BUT NOT DIMENSION-LOCAL, a literal miss
// against G06-6's "CLAIM/SENTENCE + REFERENCED DIMENSION LOCAL". One
// dimension's support phrase immunized a contradictory claim about ANOTHER
// dimension in the same sentence.
checkReject(
  "G06-A3",
  { ...BASE, strengths: "Eye contact was a real strength, and projection is coming along with prompting." },
  INPUT,
  ["without support framing"],
  "dimension B's support phrase cannot immunize a claim about dimension A",
);
// ...and the escape is NOT removed: genuine same-clause support framing works.
check(
  "G06-A3-legit",
  "ACCEPT",
  { ...BASE, strengths: "Eye contact is steadying with frequent prompting during group work." },
  INPUT,
  undefined,
  "the escape is dimension-local, not removed",
);

// A4 -- FALSE REJECTIONS from substring matching. `strong` matched "stronger",
// `highlight` matched "highlighted", `perfect` matched "imperfect", `tone`
// matched "monotone". Rejecting valid parent-facing English is the exact harm
// A-052 forbids, and G06-8 requires the rejection to track the CONTRADICTION,
// never the vocabulary.
for (const [word, sentence] of [
  ["stronger", "Sentence flow grew stronger through the session."],
  ["highlighted", "The trainer highlighted sentence flow as a positive today."],
  ["imperfect", "Sentence flow was imperfect but improving steadily."],
  ["monotone", "Sentence flow avoided a monotone delivery throughout."],
]) {
  check(
    `G06-A4[${word}]`,
    "ACCEPT",
    { ...BASE, strengths: sentence },
    INPUT,
    undefined,
    "an innocent longer word is not a lexicon hit",
  );
}

// A5 -- ORTHOGRAPHIC BYPASS. A hyphen, a closed-up spelling or a double space
// defeated the eye_contact terms entirely, so a contradiction was ACCEPTED for
// the cost of one character.
for (const [shape, sentence] of [
  ["hyphen", "Eye-contact was outstanding today."],
  ["closed", "Eyecontact was outstanding today."],
  ["double-space", "Eye  contact was outstanding today."],
]) {
  checkReject(
    `G06-A5[${shape}]`,
    { ...BASE, strengths: sentence },
    INPUT,
    ["eye_contact"],
    "normalization closes the orthographic bypass",
  );
}
// ...without over-matching into a genuinely different word.
check(
  "G06-A5-boundary",
  "ACCEPT",
  { ...BASE, strengths: "Sentence flow was excellent, and eyecontactless framing helped the delivery." },
  INPUT,
  undefined,
  "boundaries still prevent matching inside a longer word",
);

// A6 -- FOUR EMPTY PANELS ACCEPTED. Every rule is a rule about prose, so a
// draft with no prose satisfied all of them and was certified as grounded.
checkReject(
  "G06-A6a",
  { overview: "", strengths: "", areasForDevelopment: "", remarks: "" },
  INPUT,
  ["is empty"],
  "an empty draft fails closed rather than reaching the trainer certified",
);
checkReject(
  "G06-A6b",
  { overview: "  ", strengths: "\n", areasForDevelopment: " \t", remarks: "  " },
  INPUT,
  ["is empty"],
  "...and whitespace is not content",
);

// A7 -- ANCHOR INTEGRITY WAS ARITY-ONLY. Every degradation below satisfied the
// counted guards while disarming the rules, which is the silent-green class
// required proof 10 exists to prevent.
{
  // Rule 4's escape lexicon is load-bearing in the OPPOSITE direction to the
  // others: emptying it does not disarm rule 4, it makes rule 4 reject
  // legitimately support-framed prose. It was never checked at all.
  const verdict = validateGrounding(BASE, INPUT, { ...GROUNDING_ANCHORS, supportMarkers: [] });
  checks += 1;
  if (!verdict.ok && verdict.reasons.some((r) => r.includes("support-framing lexicon is empty"))) {
    console.log("PASS G06-A7a -- an emptied escape lexicon is caught as a degraded anchor");
  } else {
    failures += 1;
    console.log("FAIL G06-A7a -- an emptied escape lexicon was not caught");
  }
}
{
  const verdict = validateGrounding(BASE, INPUT, {
    ...GROUNDING_ANCHORS,
    panelKeys: ["strengths", "strengths", "overview", "remarks"],
  });
  checks += 1;
  if (!verdict.ok && verdict.reasons.some((r) => r.includes("duplicate panel keys"))) {
    console.log("PASS G06-A7b -- duplicated panel keys are caught despite the count still being four");
  } else {
    failures += 1;
    console.log("FAIL G06-A7b -- duplicated panel keys were not caught");
  }
}
{
  // The A-051 map INVERTED: still four bands, every needs_support dimension
  // reclassified positive, rules 3 and 4 silently disarmed.
  const verdict = validateGrounding(BASE, INPUT, {
    ...GROUNDING_ANCHORS,
    polarityBands: {
      beginning: "positive",
      developing: "positive",
      mastering: "needs_support",
      mastered: "needs_support",
    },
  });
  checks += 1;
  if (!verdict.ok && verdict.reasons.some((r) => r.includes("not the ratified"))) {
    console.log("PASS G06-A7c -- an inverted A-051 polarity map is caught by VALUE, not by size");
  } else {
    failures += 1;
    console.log("FAIL G06-A7c -- an inverted polarity map was not caught");
  }
}

// =====================================================================
// SECTION D -- DETECTOR COMPLETENESS: THE OPEN FALSE-NEGATIVE CLASS.
//
// REGISTERED OPEN BY OPERATOR INSTRUCTION, 2026-08-09. NOT RESOLVED HERE,
// and this section must NOT be read as authorization to close it.
//
// Rule 3 is LEXICAL: it fires when a sentence carries a term from
// ACHIEVEMENT_TERMS and names a dimension whose own rating is non-positive.
// That makes its false-negative class OPEN-ENDED -- English has unbounded
// ways to praise something. The second G-06 decision (`highlight` /
// `worth celebrating`) closed the packet's canonical C3b INSTANCE. It did
// not, and could not, close the CLASS.
//
// The Operator's instruction: "Enumerate at least three further unmatched
// positive formulations against a needs_support dimension in the proof
// output, so the residual is visible in evidence rather than prose."
//
// So the register below is MEASURED at run time, not asserted from memory.
// Every sentence makes a positive claim about `eye_contact`, which INPUT
// rates `beginning` -> needs_support, and every one is placed in REMARKS,
// where R-A leaves rule 4 absent and only rule 3 (lexical) can catch it.
//
// WHY THIS IS NOT A FAILURE. Closing the class needs either a new ruling or
// a non-lexical detector, and both are CLAUDE.md §12 stop-and-ask. Widening
// the lexicon again is EXPRESSLY not the default answer. The practical
// bound today is that the hero path runs on the DETERMINISTIC FIXTURE
// PROVIDER, whose output contains ZERO terms from the 28-entry achievement
// lexicon at EVERY distribution (section F) -- so none of these formulations
// can be emitted. This residual is a REAL-PROVIDER risk, and the real
// provider is at ZERO AUTHORIZED.
// =====================================================================
console.log("\n--- D. detector completeness: the OPEN false-negative class (registered, not resolved) ---");

const RESIDUAL_PROBES = [
  "Ava's eye contact was a joy to watch today.",
  "Eye contact is clearly one of Ava's best skills.",
  "Ava nailed eye contact in every activity.",
  "Ava's eye contact was spot on the whole session.",
  "Eye contact came naturally to Ava today.",
  "Ava needs no further work on eye contact.",
  "Ava's eye contact is well above what we expect at this stage.",
  "Ava's eye contact was a pleasure to see.",
  "Eye contact was second nature to Ava.",
  "Ava led the group with her eye contact.",
  "Ava's eye contact was better than anyone else's today.",
  "Ava's eye contact requires no prompting at all.",
  "Ava has fully secured eye contact.",
  "Ava's eye contact was faultless.",
  "Eye contact is a real credit to Ava.",
];

// The control cases. If these stop rejecting, rule 3 has broken and this
// section is no longer measuring a residual -- it is measuring an outage.
// These are HARD assertions; the residual probes below are not.
for (const [id, sentence] of [
  ["G06-D1", "Eye contact was a real highlight worth celebrating at home."],
  ["G06-D2", "Ava's eye contact was excellent throughout."],
  ["G06-D3", "Ava has mastered eye contact."],
]) {
  checkReject(
    id,
    { ...BASE, remarks: sentence },
    INPUT,
    // An ARRAY of fragments. `checkReject` iterates this, so a bare string
    // would be walked character by character and assert almost nothing --
    // eleven vacuous "names c" / "names o" checks instead of one real one.
    ["remarks", "eye_contact", "contradicts"],
    "rule 3 still catches the lexicon it DOES cover (guards this section against vacuity)",
  );
}

let residualOpen = 0;
let residualClosed = 0;
for (const sentence of RESIDUAL_PROBES) {
  checks += 1;
  const verdict = validateGrounding({ ...BASE, remarks: sentence }, INPUT);
  if (verdict.ok) {
    residualOpen += 1;
    console.log(`RESIDUAL G06-D -- NOT MATCHED: "${sentence}"`);
  } else {
    residualClosed += 1;
    console.log(`RESIDUAL-CLOSED G06-D -- now caught: "${sentence}" (update this register)`);
  }
}
console.log(
  `RESIDUAL SUMMARY -- ${residualOpen} of ${RESIDUAL_PROBES.length} positive formulations about a ` +
    `needs_support dimension are UNMATCHED by rule 3 and would reach a parent-facing panel ` +
    `(${residualClosed} since closed).`,
);
if (residualOpen === 0) {
  console.log("RESIDUAL SUMMARY -- every probe is now caught; re-derive this register with fresh probes.");
}

// =====================================================================
console.log("\n---------------------------------------------------------------");
console.log(`G-06 acceptance proof: ${checks} checks, ${failures} failure(s).`);
if (failures > 0) {
  console.log("RESULT: FAIL");
  process.exit(1);
}
console.log("RESULT: PASS -- all ten required proofs hold, and every new control");
console.log("        was demonstrated capable of firing against a planted regression.");
