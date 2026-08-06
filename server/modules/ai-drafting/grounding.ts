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
 */

import type { RatingLevel, PolarityBand, DimensionCode } from "@/server/modules/framework/dimensions";
import { POLARITY_BANDS } from "@/server/modules/framework/dimensions";
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
 */
const ACHIEVEMENT_TERMS = [
  "excellent", "excelled", "excels", "outstanding", "exceptional", "mastered", "mastery",
  "impressive", "remarkable", "superb", "brilliant", "flawless", "perfect",
  "great strength", "particularly strong", "very strong", "strong command",
  "consistently strong", "shines", "shone", "standout", "advanced level",
  "no difficulty", "with ease", "effortless",
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

function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Validate the four panels against the saved assessment. Returns every
 * violated rule, so a rejection names all its grounds at once.
 */
export function validateGrounding(panels: ReportPanels, input: GroundingInput): GroundingVerdict {
  const reasons: string[] = [];

  // 1 — completeness: exactly nine ratings must back the draft.
  if (input.ratings.length !== 9) {
    reasons.push(`the saved assessment carries ${input.ratings.length} ratings, not nine`);
  }

  const bandOf = new Map<DimensionCode, PolarityBand>();
  for (const r of input.ratings) bandOf.set(r.dimensionCode, POLARITY_BANDS[r.rating]);

  const allText = PANEL_KEYS.map((k) => panels[k]).join("\n");

  // 2 — A-052: rating ATTRIBUTION and taxonomy disclosure never reach a
  // parent panel. Ordinary prose using the same words stays legal.
  for (const rule of ATTRIBUTION_RULES) {
    if (rule.re.test(allText)) reasons.push(rule.reason);
  }

  // 3 — polarity contradiction: sentence-level attribution. A sentence that
  // names a non-positive dimension may not carry an achievement claim.
  for (const key of PANEL_KEYS) {
    for (const sentence of sentences(panels[key])) {
      const lower = sentence.toLowerCase();
      const hasAchievement = ACHIEVEMENT_TERMS.some((t) => lower.includes(t));
      if (!hasAchievement) continue;
      for (const [code, terms] of Object.entries(DIMENSION_TERMS) as Array<[DimensionCode, readonly string[]]>) {
        const band = bandOf.get(code);
        if (band === undefined || band === "positive") continue;
        if (terms.some((t) => lower.includes(t))) {
          reasons.push(
            `${key}: achievement language about a ${band} dimension (${code}) contradicts the trainer's rating`,
          );
        }
      }
    }
  }

  // 4 — a needs_support dimension may never be presented as the strength.
  {
    const lower = panels.todaysStrength.toLowerCase();
    for (const [code, terms] of Object.entries(DIMENSION_TERMS) as Array<[DimensionCode, readonly string[]]>) {
      if (bandOf.get(code) !== "needs_support") continue;
      if (terms.some((t) => lower.includes(t)) && !/support|prompt|guidance|develop|practice|working on|building/.test(lower)) {
        reasons.push(`todaysStrength presents a needs_support dimension (${code}) without support framing`);
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

  return reasons.length === 0 ? { ok: true } : { ok: false, reasons };
}
