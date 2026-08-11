import type {
  DimensionDto,
  RatingLevel,
} from "../contracts/physical-test";

/**
 * Spec §3.3 — the four behavioural anchors, verbatim.
 *
 * Amendment 006 A-050: the anchors carry forward POSITIONALLY and VERBATIM.
 * The anchor TEXT did not change; only the label each is keyed to did —
 * Emerging→Beginning · Developing→Developing · Secure→Mastering ·
 * Advanced→Mastered. `Mastered` remains the exceeds-expectations level; no
 * threshold moved and there is no fifth level.
 *
 * A-050 requires the backend and frontend copies to be BYTE-IDENTICAL. These
 * four strings are copied character-for-character from
 * `server/modules/framework/dimensions.ts` `RUBRIC_ANCHORS`, which itself
 * carries spec §3.3's authoritative wording. Do not paraphrase, re-wrap or
 * "improve" them — V4 verifies byte-identity and a divergence is a defect.
 */
const RUBRIC_ANCHORS: Readonly<Record<RatingLevel, string>> = {
  beginning:
    "Requires frequent prompting, modelling, and support to demonstrate the skill consistently.",
  developing:
    "Demonstrates the skill with some guidance and increasing confidence, but consistency may still vary.",
  mastering:
    "Demonstrates the skill independently and consistently across most classroom activities and presentations.",
  mastered:
    "Exceeds the expected level: strong confidence, natural expression, independent application, consistent across different contexts.",
};

/**
 * Amendment 006 A-049 — the display labels for the four ratified storage
 * values. Declared once so the assessment form and the Trainer review surface
 * cannot drift apart.
 */
export const RATING_DISPLAY_LABELS: Readonly<Record<RatingLevel, string>> = {
  beginning: "Beginning",
  developing: "Developing",
  mastering: "Mastering",
  mastered: "Mastered",
};

/**
 * Amendment 006 A-051 — the ratified polarity bands.
 *
 * `mastering` is `positive`, and that is a ratified ruling rather than a
 * judgement call: polarity derives from the ratified behavioural anchor
 * (independent, consistent demonstration across most activities), not from the
 * progressive grammatical form of the label. Demoting it would silently narrow
 * what the AI may describe as a strength in every report. Only `beginning`
 * carries `needs_support`.
 *
 * This table must agree EXACTLY with the backend's `POLARITY_BANDS`.
 */
export type PolarityBand = "needs_support" | "developing" | "positive";

export const POLARITY_BANDS: Readonly<Record<RatingLevel, PolarityBand>> = {
  beginning: "needs_support",
  developing: "developing",
  mastering: "positive",
  mastered: "positive",
};

export const GOVERNED_DIMENSIONS = [
  {
    dimensionCode: "body",
    group: "competency",
    displayName: "Body",
    focus: "Posture & Gesture",
    ordinal: 1,
    rubricAnchors: RUBRIC_ANCHORS,
  },
  {
    dimensionCode: "emotion",
    group: "competency",
    displayName: "Emotion",
    focus: "Facial Expression",
    ordinal: 2,
    rubricAnchors: RUBRIC_ANCHORS,
  },
  {
    dimensionCode: "speech",
    group: "competency",
    displayName: "Speech",
    focus: "Clarity & Structure",
    ordinal: 3,
    rubricAnchors: RUBRIC_ANCHORS,
  },
  {
    dimensionCode: "tonality",
    group: "competency",
    displayName: "Tonality",
    focus: "Voice Control",
    ordinal: 4,
    rubricAnchors: RUBRIC_ANCHORS,
  },
  {
    dimensionCode: "eye_contact",
    group: "speech_linguistics",
    displayName: "Eye Contact",
    focus: "Listener connection",
    ordinal: 5,
    rubricAnchors: RUBRIC_ANCHORS,
  },
  {
    dimensionCode: "vocal_projection",
    group: "speech_linguistics",
    displayName: "Vocal Projection",
    focus: "Audibility and reach",
    ordinal: 6,
    rubricAnchors: RUBRIC_ANCHORS,
  },
  {
    dimensionCode: "emotional_expression",
    group: "speech_linguistics",
    displayName: "Emotional Expression",
    focus: "Expressive delivery",
    ordinal: 7,
    rubricAnchors: RUBRIC_ANCHORS,
  },
  {
    dimensionCode: "sentence_flow",
    group: "speech_linguistics",
    displayName: "Sentence Flow",
    focus: "Pacing and continuity",
    ordinal: 8,
    rubricAnchors: RUBRIC_ANCHORS,
  },
  {
    dimensionCode: "audience_awareness",
    group: "speech_linguistics",
    displayName: "Audience Awareness",
    focus: "Adapting to listeners",
    ordinal: 9,
    rubricAnchors: RUBRIC_ANCHORS,
  },
] as const satisfies readonly DimensionDto[];

/**
 * The tile treatment for a rating band — ONE visual language for this data,
 * shared by every surface authorized to show it.
 *
 * ⚠️ EXTRACTED 2026-08-12 BY OPERATOR PREFERENCE. It was declared IDENTICALLY
 * in `trainer-draft-generation.tsx` and `trainer-report-review.tsx`, and screen
 * `19` was about to become a third site. ▶ Two copies of a colour map is how a
 * band silently acquires two different colours on two screens showing the same
 * assessment — so it is declared once, here, next to the labels it pairs with.
 *
 * ⛔ NO NEW COLOUR VALUES. These are the existing `rating-N-soft` tokens; the
 * four bands keep exactly the colours they already had on the trainer surface.
 *
 * ⚠️ THE BAND NAME IS RENDERED ON EVERY TILE, ALWAYS. Colour REINFORCES the
 * band; it never carries it alone (WCAG SC 1.4.1). A tile that drops its label
 * to look cleaner breaks that, and the label is not decoration.
 */
export const RATING_TILE_STYLE: Readonly<Record<RatingLevel, string>> = {
  beginning: "bg-rating-1-soft text-rating-1-on-soft",
  developing: "bg-rating-2-soft text-rating-2-on-soft",
  mastering: "bg-rating-3-soft text-rating-3-on-soft",
  mastered: "bg-rating-4-soft text-rating-4-on-soft",
};
