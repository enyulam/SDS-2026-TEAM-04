/**
 * The B.E.S.T. Method™ framework constants — the ratified nine dimensions,
 * four-level scale, rubric anchors and polarity bands.
 *
 * Source of truth: Specification v3 §3.1/§3.3 and CLAUDE.md §5. The rubric
 * anchors deliberately have NO schema column (assessment baseline §2.3,
 * U-ASM-2): they are framework constants, carried from here into the AI
 * skeleton (spec §12.1 step 1) and into the dimension DTO the UI consumes.
 * Do not re-derive them, soften them, or pass a bare rating enum to the LLM
 * without them (CLAUDE.md §5).
 */

export const DIMENSION_CODES = [
  "body",
  "emotion",
  "speech",
  "tonality",
  "eye_contact",
  "vocal_projection",
  "emotional_expression",
  "sentence_flow",
  "audience_awareness",
] as const;

export type DimensionCode = (typeof DIMENSION_CODES)[number];

export const RATING_LEVELS = ["beginning", "developing", "mastering", "mastered"] as const;
export type RatingLevel = (typeof RATING_LEVELS)[number];

export type DimensionGroup = "competency" | "speech_linguistics";
export type PolarityBand = "needs_support" | "developing" | "positive";

/**
 * Spec §3.3 — the four behavioural anchors, verbatim.
 *
 * Amendment 006 A-050: the anchors carry forward POSITIONALLY and VERBATIM.
 * The anchor TEXT did not change; only the label each is keyed to did —
 * Emerging→Beginning · Developing→Developing · Secure→Mastering ·
 * Advanced→Mastered. `Mastered` remains the exceeds-expectations level; no
 * threshold moved and there is no fifth level. The authoritative wording is
 * spec §3.3's, preserved character-for-character — do not reword it.
 */
export const RUBRIC_ANCHORS: Readonly<Record<RatingLevel, string>> = Object.freeze({
  beginning:
    "Requires frequent prompting, modelling, and support to demonstrate the skill consistently.",
  developing:
    "Demonstrates the skill with some guidance and increasing confidence, but consistency may still vary.",
  mastering:
    "Demonstrates the skill independently and consistently across most classroom activities and presentations.",
  mastered:
    "Exceeds the expected level: strong confidence, natural expression, independent application, consistent across different contexts.",
});

/**
 * Amendment 006 A-051 / CLAUDE.md §5 — beginning → needs_support;
 * developing → developing; mastering → positive; mastered → positive.
 *
 * `mastering` is `positive`, and that is a ratified ruling rather than a
 * judgement call: polarity derives from the ratified behavioural anchor
 * (independent, consistent demonstration across most activities), not from
 * the progressive grammatical form of the label. Demoting it would silently
 * narrow what the AI may describe as a strength in every report. Only
 * `beginning` carries `needs_support`.
 */
export const POLARITY_BANDS: Readonly<Record<RatingLevel, PolarityBand>> = Object.freeze({
  beginning: "needs_support",
  developing: "developing",
  mastering: "positive",
  mastered: "positive",
});

export interface FrameworkDimension {
  readonly code: DimensionCode;
  readonly group: DimensionGroup;
  readonly displayName: string;
  /** Spec §3.1 — the dimension's focus, shown alongside its name. */
  readonly focus: string;
  /** 1-based ordinal in the ratified declaration order. */
  readonly ordinal: number;
}

/**
 * The nine governed dimensions in DECLARATION ORDER — the same hard-coded
 * order the database serializers and the assessment read pin (never
 * `assessment_dimensions.sort_order`, an ordinary mutable column).
 */
export const FRAMEWORK_DIMENSIONS: readonly FrameworkDimension[] = Object.freeze([
  { code: "body", group: "competency", displayName: "Body", focus: "Posture & Gesture", ordinal: 1 },
  { code: "emotion", group: "competency", displayName: "Emotion", focus: "Facial Expression", ordinal: 2 },
  { code: "speech", group: "competency", displayName: "Speech", focus: "Clarity & Structure", ordinal: 3 },
  { code: "tonality", group: "competency", displayName: "Tonality", focus: "Voice Control", ordinal: 4 },
  { code: "eye_contact", group: "speech_linguistics", displayName: "Eye Contact", focus: "Eye Contact", ordinal: 5 },
  { code: "vocal_projection", group: "speech_linguistics", displayName: "Vocal Projection", focus: "Vocal Projection", ordinal: 6 },
  { code: "emotional_expression", group: "speech_linguistics", displayName: "Emotional Expression", focus: "Emotional Expression", ordinal: 7 },
  { code: "sentence_flow", group: "speech_linguistics", displayName: "Sentence Flow", focus: "Sentence Flow", ordinal: 8 },
  { code: "audience_awareness", group: "speech_linguistics", displayName: "Audience Awareness", focus: "Audience Awareness", ordinal: 9 },
]);

export function isDimensionCode(value: string): value is DimensionCode {
  return (DIMENSION_CODES as readonly string[]).includes(value);
}

export function isRatingLevel(value: string): value is RatingLevel {
  return (RATING_LEVELS as readonly string[]).includes(value);
}
