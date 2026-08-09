/**
 * Deterministic grounding validation — CLAUDE.md §4 non-negotiable 1 and
 * spec §12.1 step 3, applied to the four parent-facing panels against the
 * SAVED observation and its nine governed ratings.
 *
 * This gate is what makes "AI drafts, doesn't assess" true: it runs on every
 * generated draft BEFORE anything is persisted, and it can genuinely REJECT
 * — proven by the integration suite with a deliberately contradictory case
 * (a `beginning` rating described in achievement language must be caught,
 * not eyeballed).
 *
 * Every check is deterministic — string analysis over closed lexicons and
 * the ratified framework constants. No model is consulted here.
 *
 * =====================================================================
 * G-06 — RATIFIED 2026-08-09. `FINAL_MVP_G06_GROUNDING_RULING.md`.
 * =====================================================================
 * The rule set below is the Operator-ratified one. It is a RE-DERIVATION,
 * never a rename — `FINAL_MVP_OD4_REPORT_SEMANTICS_RULING.md` §5.2 and
 * CLAUDE.md §12 both prohibit the rename, and that prohibition is satisfied
 * by design rather than waived.
 *
 * The four OD-4 panels are NOT symmetric, and that asymmetry is the ruling:
 *
 *   overview             G06-3  general synthesis; MAY carry developmental
 *                               and mixed context. The Strengths rule is
 *                               NOT inherited here — doing so would
 *                               FALSE-REJECT correctly-grounded drafts.
 *   strengths            G06-2  positive demonstrated capability. The
 *                               polarity-contradiction rule (rule 4) lives
 *                               here, and ONLY here.
 *   areasForDevelopment  G06-4  EXPECTED to name non-positive dimensions.
 *                               Rule 4 must not extend here.
 *   remarks              G06-5  GROUNDED BUT POLARITY-NEUTRAL (packet R-A).
 *                               No positive-only and no development-only
 *                               posture — but rules 1, 1b, 2, 3 and 5 all
 *                               reach it in full. It is not a free channel.
 *
 * "No Strengths-specific polarity rule" NEVER means "no grounding" (G06-3).
 *
 * EXPRESSLY NOT RATIFIED — each remains a CLAUDE.md §12 stop-and-ask, and
 * none may be added here without a fresh ruling:
 *   · extending rule 4 from `needs_support` to `developing` (rule 3 already
 *     covers achievement claims about ANY non-positive dimension, in all
 *     four panels, so the concern is discharged without it);
 *   · the inverse "rule 4b" — a `positive` dimension presented in Areas for
 *     Development as a deficiency. That is a NEW control, not a migration;
 *   · narrowing `DIMENSION_TERMS.audience_awareness`'s bare `audience`. It
 *     is a precision defect, and narrowing it would LOOSEN detection.
 */

import type { RatingLevel, PolarityBand, DimensionCode } from "@/server/modules/framework/dimensions";
import { POLARITY_BANDS, DIMENSION_CODES } from "@/server/modules/framework/dimensions";
import type { ReportPanels } from "@/server/modules/ai-drafting/provider";
import { PANEL_KEYS } from "@/server/modules/ai-drafting/provider";

export interface GroundingInput {
  readonly studentDisplayName: string;
  readonly ratings: ReadonlyArray<{
    readonly dimensionCode: DimensionCode;
    readonly displayName: string;
    readonly rating: RatingLevel;
  }>;
}

export type GroundingVerdict =
  | { readonly ok: true }
  | { readonly ok: false; readonly reasons: readonly string[] };

/**
 * Phrases a panel may use about a dimension ONLY when that dimension's
 * polarity band is `positive`. Applied sentence-by-sentence: a sentence that
 * names a needs_support or developing dimension and carries an achievement
 * claim contradicts the trainer's rating and is rejected (spec §12.1:
 * "a Beginning rating must read as support-needed, never as achievement").
 *
 * A-052: `mastered` and `mastery` are RETAINED here deliberately. They are
 * genuine achievement language whatever the enum is called, and this rule
 * is resolved independently of the attribution rule below.
 *
 * G06-3 — bare `strong` is RATIFIED into this lexicon. It closes the
 * measured C7 defect (Overview praising a `needs_support` dimension with
 * ordinary praise, because the lexicon carried "very strong" and "strong
 * command" but not the bare word). The ruling is explicit that C7 is closed
 * by WIDENING THIS LEXICON and NOT by applying the Strengths rule to
 * Overview — the latter would false-reject the legitimate
 * developmental-context case that G06-3 protects. The longer "…strong"
 * entries are kept even though bare `strong` subsumes them: they document
 * the phrases this rule was built to catch, and a redundant entry costs one
 * boolean.
 *
 * ⚠️ RULE 3 HAS NO ESCAPE CLAUSE, and must never be given one. That is what
 * makes the narrowed support-framing escape below safe: an escape can only
 * ever soften rule 4's weaker "presented as a strength" detection, and can
 * NEVER immunize explicit achievement language about a non-positive
 * dimension in any panel.
 */
const ACHIEVEMENT_TERMS = [
  "excellent", "excelled", "excels", "outstanding", "exceptional", "mastered", "mastery",
  "impressive", "remarkable", "superb", "brilliant", "flawless", "perfect",
  "strong",
  "great strength", "particularly strong", "very strong", "strong command",
  "consistently strong", "shines", "shone", "standout", "advanced level",
  "no difficulty", "with ease", "effortless",
] as const;

/**
 * G06-6 — THE SUPPORT-FRAMING ESCAPE, RE-DERIVED.
 *
 * The superseded escape was `/support|prompt|guidance|develop|practice|
 * working on|building/` evaluated over the WHOLE Strengths panel. It had two
 * compounding defects, both MEASURED (packet §5, §5.1):
 *
 *   1. WHOLE-PANEL SCOPE. One escape word anywhere in the panel disarmed the
 *      rule for EVERY dimension in it (case C4).
 *   2. THE LEXICON WAS ORDINARY STRENGTHS VOCABULARY. `develop`, `practice`
 *      and `building` appear naturally in legitimate positive prose, so a
 *      model writing normal Strengths text tripped the escape most of the
 *      time — making rule 4 close to VACUOUS. It also survived
 *      sentence-scoping when the escape word sat INSIDE the contradicting
 *      sentence (case C8), which is the shape a model actually emits.
 *
 * G06-6 requires BOTH halves fixed together, because sentence-scoping alone
 * does not close C8:
 *
 *   · SCOPE is now SENTENCE-LOCAL and DIMENSION-ATTRIBUTED. The escape is
 *     evaluated on the specific sentence that names the specific dimension,
 *     so a support phrase about dimension A can never immunize a
 *     contradictory positive claim about dimension B elsewhere in the panel
 *     — which is exactly the "in the same panel" guarantee G06-6 demands.
 *   · THE LEXICON IS NARROWED TO EXPLICIT SUPPORT MARKERS. Every one of the
 *     seven words G06-6 names as prohibited escapes — develop, developing,
 *     building, practice, practising, improving, working on — is ABSENT in
 *     every form, including inside a longer phrase. This is the strictest
 *     reading of the ruling, and it can only ever make the rule fire MORE
 *     often, never less.
 *
 * HONEST LIMIT, recorded rather than hidden (packet §5): this remains a
 * lexical heuristic and will never be complete. Within a SINGLE sentence
 * naming two needs_support dimensions, a marker escapes both — clause-level
 * attribution is not implemented, and G06-6 accepts "sentence-local +
 * dimension-local" as the minimum boundary where reliable clause analysis
 * does not already exist. It is a NECESSARY, not sufficient, control. Rule 3
 * is the stronger of the two and is unaffected by this escape.
 */
const SUPPORT_MARKERS = [
  "with support", "with adult support", "with teacher support",
  "with prompting", "with frequent prompting", "when prompted", "after prompting",
  "with guidance", "with encouragement", "with reminders", "with modelling", "with modeling",
  "needs", "needed", "still needs",
  "is working towards", "working towards", "is working toward", "working toward",
] as const;

/**
 * Amendment 006 A-052 — CONTEXTUAL ATTRIBUTION AND TAXONOMY-DISCLOSURE
 * detection. This replaces the previous bare-word leak regex, which A-052
 * EXPRESSLY PROHIBITS: a guard equivalent to
 * `\b(beginning|developing|mastering|mastered)\b` would reject ordinary
 * parent-facing English ("at the beginning of the session", "is mastering
 * sentence flow", "has mastered maintaining eye contact"), turning a leak
 * guard into a rejecter of normal prose. A word-list substitution is
 * likewise not an acceptable implementation of the clause.
 *
 * What is prohibited is the ATTRIBUTION of a raw label to a student as a
 * rating value, and disclosure of the internal taxonomy — never the words
 * themselves. Five rules, each requiring rating CONTEXT:
 *
 *   A  an attribution term followed by a label   ("rated as Beginning",
 *      "rating: Mastered", "assessment level is Developing")
 *   B  a label used as a rating noun             ("Mastering level")
 *   C  an isolated label presented as a value    ("Eye contact — Mastered")
 *   D  three or more labels enumerated as a scale
 *   E  explicit disclosure of the four-level taxonomy
 *
 * The label set deliberately includes the SUPERSEDED labels as well as the
 * ratified ones: attributing `Emerging`/`Secure`/`Advanced` to a student is
 * still rating attribution, and the historical values still exist in
 * archived prose and fixtures. (A-054: this is contextual classification,
 * not a keyword sweep — `Advanced` remains a Class Grade and is matched
 * only when it appears IN RATING CONTEXT.)
 *
 * This rule is SEPARATE from ACHIEVEMENT_TERMS above: `mastered`/`mastery`
 * remain achievement language for polarity-contradiction detection, so
 * "has mastered maintaining eye contact" is legal here and is still caught
 * by rule 3 when it describes a non-positive dimension (A-052).
 */
const RATING_LABEL_WORDS = [
  "beginning", "developing", "mastering", "mastered", // ratified (A-049)
  "emerging", "secure", "advanced",                   // superseded, still attributable
] as const;

const LABEL = `(?:${RATING_LABEL_WORDS.join("|")})`;

/** Nouns/verbs that make what follows a RATING, not ordinary description. */
const ATTRIBUTION_TERMS =
  "ratings?|rated|rates?|scored?|scores|scoring|levels?|bands?|assess|assessed|assessment|" +
  "graded|grading|marked|classified|classification|tiers?|categor(?:y|ies|ised|ized)|scale|descriptor";

/** Tokens that may sit between the attribution term and the label. */
const CONNECTORS =
  "is|was|are|were|as|of|at|to|the|a|an|currently|now|still|remains|reads|stands|sits|being|been|for|this|that|his|her|their|it";

const SEPARATOR = "(?:,|/|\\||;|→|->|–|—|\\bthen\\b|\\bor\\b|\\bto\\b)";

/** A — "rated as Beginning", "rating: Mastered", "assessment level is Developing". */
const ATTRIBUTED_LABEL_RE = new RegExp(
  `\\b(?:${ATTRIBUTION_TERMS})\\b(?:\\s+(?:${CONNECTORS})\\b)*\\s*[:=–—]?\\s*(?:the\\s+)?${LABEL}\\b`,
  "i",
);

/** B — "Mastering level", "Developing band". */
const LABEL_AS_RATING_NOUN_RE = new RegExp(
  `\\b${LABEL}\\b(?:\\s+(?:is|was|as))?\\s+(?:levels?|ratings?|bands?|tiers?|categor(?:y|ies)|scores?|descriptors?)\\b`,
  "i",
);

/** C — an isolated raw label standing alone as a value: "Eye contact — Mastered". */
const ISOLATED_LABEL_VALUE_RE = new RegExp(
  `(?:^|[:=|•]|—|–)\\s*(?:the\\s+)?${LABEL}\\b\\s*(?=$|[.;,)\\]!?])`,
  "im",
);

/** D — the scale itself, enumerated: "Beginning → Developing → Mastering". */
const TAXONOMY_ENUMERATION_RE = new RegExp(
  `\\b${LABEL}\\b\\s*${SEPARATOR}\\s*${LABEL}\\b\\s*${SEPARATOR}\\s*${LABEL}\\b`,
  "i",
);

/** E — explicit disclosure of the internal four-level taxonomy. */
const TAXONOMY_DISCLOSURE_RE =
  /\b(?:four[-\s](?:level|point|band|tier|stage)s?|four\s+levels|scale\s+of\s+four|one\s+of\s+(?:the\s+)?four|(?:internal|our|the)\s+(?:rating|assessment|competency|grading)\s+(?:scale|taxonomy|system|framework|levels)|rating\s+scale|assessment\s+scale)\b/i;

const ATTRIBUTION_RULES: ReadonlyArray<{ readonly re: RegExp; readonly reason: string }> = [
  { re: ATTRIBUTED_LABEL_RE, reason: "a rating label is attributed to the student as a rating value" },
  { re: LABEL_AS_RATING_NOUN_RE, reason: "a rating label is presented as a rating level" },
  { re: ISOLATED_LABEL_VALUE_RE, reason: "an isolated raw rating label is presented as a value" },
  { re: TAXONOMY_ENUMERATION_RE, reason: "the internal rating scale is enumerated in parent-facing prose" },
  { re: TAXONOMY_DISCLOSURE_RE, reason: "the internal rating taxonomy is disclosed in parent-facing prose" },
];

/**
 * Terms mapped to each dimension so a sentence can be attributed to the
 * dimensions it talks about. Closed, lowercase, matched as substrings of a
 * lowercased sentence.
 *
 * `audience_awareness` carrying bare `audience` is a KNOWN precision defect
 * (packet §8): "holding the audience's gaze" is about eye contact and is
 * also attributed here, which can produce a spurious REASON and in principle
 * a spurious rejection. It is deliberately NOT narrowed — G-06 does not
 * ratify narrowing it, and narrowing would LOOSEN detection, the one
 * direction this ruling never authorizes. Recorded, not fixed.
 */
const DIMENSION_TERMS: Readonly<Record<DimensionCode, readonly string[]>> = {
  body: ["posture", "gesture", "body language", "stance"],
  emotion: ["facial expression", "facial expressions"],
  speech: ["clarity", "structure", "clearly structured", "articulation"],
  tonality: ["tone", "tonality", "voice control", "pitch"],
  eye_contact: ["eye contact"],
  vocal_projection: ["projection", "volume", "project the voice", "projecting"],
  emotional_expression: ["emotional expression", "expressiveness", "expressive delivery"],
  sentence_flow: ["sentence flow", "pacing", "fluency", "flow of sentences"],
  audience_awareness: ["audience awareness", "audience", "listeners"],
};

/**
 * G-06 REQUIRED PROOF 10 — "required grounding anchors disappearing: FAIL
 * CLOSED."
 *
 * Every rule below is only as strong as the closed lexicon it reads. An
 * emptied lexicon, a lost panel key or a missing dimension code would make
 * the corresponding rule SILENTLY UNABLE TO FIRE while the suite stayed
 * green — the exact silent-green class that already bit this project at the
 * A-053 rename and again at the OD-4 column rename (nine guards green and
 * blind).
 *
 * The anchors are therefore INJECTED rather than closed over, so a proof can
 * degrade one and demonstrate the guard FIRING. A control that has never
 * been demonstrated failing is not evidence (G-06 required proofs, closing
 * paragraph). Production always uses the frozen `GROUNDING_ANCHORS`; the
 * parameter exists so the failure mode is reachable from a test.
 */
export interface GroundingAnchors {
  readonly panelKeys: readonly (keyof ReportPanels)[];
  readonly dimensionCodes: readonly DimensionCode[];
  readonly dimensionTerms: Readonly<Record<string, readonly string[]>>;
  readonly achievementTerms: readonly string[];
  readonly supportMarkers: readonly string[];
  readonly polarityBands: Readonly<Record<string, PolarityBand>>;
  readonly attributionRules: ReadonlyArray<{ readonly re: RegExp; readonly reason: string }>;
}

export const GROUNDING_ANCHORS: GroundingAnchors = Object.freeze({
  panelKeys: PANEL_KEYS,
  dimensionCodes: DIMENSION_CODES,
  dimensionTerms: DIMENSION_TERMS,
  achievementTerms: ACHIEVEMENT_TERMS,
  supportMarkers: SUPPORT_MARKERS,
  polarityBands: POLARITY_BANDS,
  attributionRules: ATTRIBUTION_RULES,
});

/** The exact shape the anchors must have. A deviation FAILS CLOSED. */
const EXPECTED_PANEL_KEYS = 4;
const EXPECTED_DIMENSION_CODES = 9;
const EXPECTED_RATING_LEVELS = 4;
const EXPECTED_ATTRIBUTION_RULES = 5;

function anchorIntegrityFailures(a: GroundingAnchors): string[] {
  const out: string[] = [];
  if (a.panelKeys.length !== EXPECTED_PANEL_KEYS) {
    out.push(`grounding anchors degraded: ${a.panelKeys.length} panel keys, not ${EXPECTED_PANEL_KEYS}`);
  }
  if (a.dimensionCodes.length !== EXPECTED_DIMENSION_CODES) {
    out.push(`grounding anchors degraded: ${a.dimensionCodes.length} dimension codes, not ${EXPECTED_DIMENSION_CODES}`);
  }
  if (Object.keys(a.polarityBands).length !== EXPECTED_RATING_LEVELS) {
    out.push(
      `grounding anchors degraded: ${Object.keys(a.polarityBands).length} polarity bands, not ${EXPECTED_RATING_LEVELS}`,
    );
  }
  if (a.attributionRules.length !== EXPECTED_ATTRIBUTION_RULES) {
    out.push(
      `grounding anchors degraded: ${a.attributionRules.length} attribution rules, not ${EXPECTED_ATTRIBUTION_RULES}`,
    );
  }
  if (a.achievementTerms.length === 0) {
    out.push("grounding anchors degraded: the achievement lexicon is empty, so rule 3 could never fire");
  }
  for (const code of a.dimensionCodes) {
    const terms = a.dimensionTerms[code];
    if (terms === undefined || terms.length === 0) {
      out.push(`grounding anchors degraded: dimension ${code} has no attribution terms, so no rule could name it`);
    }
  }
  return out;
}

function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * G06-1 / G06-7 — resolve every rating to a ratified polarity band, and
 * assert COVERAGE of all nine governed dimension codes.
 *
 * This replaces a fail-OPEN that was measured twice, by two independent
 * routes, into the same silent skip:
 *
 *   C5  an unmapped rating label made `POLARITY_BANDS[rating]` undefined,
 *       and rules 3 and 4 skipped that dimension. A blatant contradiction
 *       about it was ACCEPTED — an impossible rating bought a free pass.
 *   C6  a merely DUPLICATED dimension code left another code ABSENT from
 *       the band map, with NO invalid enum value anywhere and rule 1's
 *       count of nine fully satisfied. The same contradiction was ACCEPTED.
 *
 * G06-1 is explicit that rule 1b must assert COVERAGE, not a count, and
 * that a duplicate must not satisfy it. Unknown / impossible / missing-map
 * state FAILS CLOSED: it is reported as an explicit reason, never a
 * `continue`, a skip, an `undefined` or an ignored dimension.
 *
 * Rule 1's count is retained rather than replaced — it names a different
 * defect (wrong arity) with a clearer message, and coverage does not imply
 * arity when duplicates are present.
 */
function resolveBands(
  input: GroundingInput,
  anchors: GroundingAnchors,
): { readonly bands: ReadonlyMap<DimensionCode, PolarityBand>; readonly problems: readonly string[] } {
  const problems: string[] = [];
  const bands = new Map<DimensionCode, PolarityBand>();
  const known = new Set<string>(anchors.dimensionCodes);
  const seen = new Set<string>();

  for (const r of input.ratings) {
    const code = r.dimensionCode as string;
    const rating = r.rating as string;

    if (!known.has(code)) {
      problems.push(`the saved assessment carries an unrecognised dimension code (${code})`);
      continue;
    }
    if (seen.has(code)) {
      problems.push(`the saved assessment repeats dimension ${code}, so another governed dimension is unrated`);
      continue;
    }
    seen.add(code);

    const band = Object.prototype.hasOwnProperty.call(anchors.polarityBands, rating)
      ? anchors.polarityBands[rating]
      : undefined;
    if (band === undefined) {
      problems.push(
        `dimension ${code} carries a rating (${rating}) that does not resolve to a ratified polarity band`,
      );
      continue;
    }
    bands.set(code as DimensionCode, band);
  }

  for (const code of anchors.dimensionCodes) {
    if (!bands.has(code)) {
      problems.push(`the saved assessment does not cover governed dimension ${code} with a resolvable rating`);
    }
  }

  return { bands, problems };
}

/**
 * Validate the four panels against the saved assessment. Returns every
 * violated rule, so a rejection names all its grounds at once.
 *
 * `anchors` is injected ONLY so required proof 10 can degrade an anchor and
 * demonstrate the fail-closed behaviour. Every production caller uses the
 * default.
 */
export function validateGrounding(
  panels: ReportPanels,
  input: GroundingInput,
  anchors: GroundingAnchors = GROUNDING_ANCHORS,
): GroundingVerdict {
  const reasons: string[] = [];

  // 0 — REQUIRED PROOF 10: the anchors this validation depends on must be
  // intact. A degraded lexicon cannot silently disable a rule.
  reasons.push(...anchorIntegrityFailures(anchors));

  // The panels themselves must all be present as strings. A missing panel
  // would otherwise read as an empty string and be trivially "grounded".
  for (const key of anchors.panelKeys) {
    if (typeof panels[key] !== "string") {
      reasons.push(`panel ${String(key)} is absent from the draft, so it cannot be grounded`);
    }
  }
  const panelText = (key: keyof ReportPanels): string =>
    typeof panels[key] === "string" ? panels[key] : "";

  // 1 — completeness: exactly nine ratings must back the draft.
  if (input.ratings.length !== 9) {
    reasons.push(`the saved assessment carries ${input.ratings.length} ratings, not nine`);
  }

  // 1b — G06-1 / G06-7: COVERAGE of all nine governed dimension codes, each
  // resolving to a ratified polarity band. FAIL CLOSED, never a silent skip.
  const { bands: bandOf, problems } = resolveBands(input, anchors);
  reasons.push(...problems);

  const allText = anchors.panelKeys.map((k) => panelText(k)).join("\n");

  // 2 — A-052: rating ATTRIBUTION and taxonomy disclosure never reach a
  // parent panel. Ordinary prose using the same words stays legal.
  for (const rule of anchors.attributionRules) {
    if (rule.re.test(allText)) reasons.push(rule.reason);
  }

  // 3 — POLARITY CONTRADICTION, in ALL FOUR PANELS, sentence-scoped and
  // dimension-attributed. A sentence that names a non-positive dimension may
  // not carry an achievement claim.
  //
  // G06-3/G06-4/G06-5: this is the "general grounding" that continues to
  // govern `overview`, `areasForDevelopment` and `remarks` even though the
  // Strengths-specific rule 4 does not reach them. Mentioning a
  // needs_support dimension is legitimate in those panels; CLAIMING IT AS AN
  // ACHIEVEMENT is never legitimate anywhere.
  //
  // ⚠️ THIS RULE HAS NO ESCAPE CLAUSE AND MUST NEVER BE GIVEN ONE. It is
  // what stops the narrowed support-framing escape below from ever
  // immunizing explicit achievement language.
  for (const key of anchors.panelKeys) {
    for (const sentence of sentences(panelText(key))) {
      const lower = sentence.toLowerCase();
      const hasAchievement = anchors.achievementTerms.some((t) => lower.includes(t));
      if (!hasAchievement) continue;
      for (const code of anchors.dimensionCodes) {
        const band = bandOf.get(code);
        // An unresolved band is NOT skipped silently: rule 1b has already
        // recorded it as an explicit failure, so the verdict is a rejection
        // either way (G06-7).
        if (band === undefined || band === "positive") continue;
        const terms = anchors.dimensionTerms[code] ?? [];
        if (terms.some((t) => lower.includes(t))) {
          reasons.push(
            `${String(key)}: achievement language about a ${band} dimension (${code}) contradicts the trainer's rating`,
          );
        }
      }
    }
  }

  // 4 — G06-2: a needs_support dimension may never be presented as a
  //     demonstrated strength. STRENGTHS ONLY.
  //
  // NOT applied to `overview` (G06-3 — would false-reject legitimate
  // developmental context), NOT to `areasForDevelopment` (G06-4 — that panel
  // exists to name non-positive dimensions), NOT to `remarks` (G06-5 —
  // ratified POLARITY-NEUTRAL, packet option R-A; R-B and R-C were
  // considered and rejected, see FINAL_MVP_G06_GROUNDING_RULING.md §2).
  //
  // The escape is SENTENCE-LOCAL and DIMENSION-ATTRIBUTED (G06-6): it is
  // evaluated on the sentence that names this dimension, so a support phrase
  // about one dimension can never immunize a contradictory claim about
  // another dimension elsewhere in the panel.
  if (anchors.panelKeys.includes("strengths")) {
    for (const sentence of sentences(panelText("strengths"))) {
      const lower = sentence.toLowerCase();
      const escaped = anchors.supportMarkers.some((m) => lower.includes(m));
      for (const code of anchors.dimensionCodes) {
        if (bandOf.get(code) !== "needs_support") continue;
        const terms = anchors.dimensionTerms[code] ?? [];
        if (!terms.some((t) => lower.includes(t))) continue;
        if (escaped) continue;
        reasons.push(`strengths presents a needs_support dimension (${code}) without support framing`);
      }
    }
  }

  // 5 — the prose addresses this student and no one else: any capitalized
  // given name is fine to omit, but the panels must not name a DIFFERENT
  // student. Deterministic proxy: the configured display name, when present,
  // is the only permitted match for "the student's name" placeholder tokens.
  if (/\{\{|\}\}|\[student|\bSTUDENT_NAME\b/i.test(allText)) {
    reasons.push("an unresolved placeholder token appears in the prose");
  }

  return reasons.length === 0 ? { ok: true } : { ok: false, reasons: [...new Set(reasons)] };
}
