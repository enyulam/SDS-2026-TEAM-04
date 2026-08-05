import type {
  DimensionDto,
  RatingLevel,
} from "../contracts/physical-test";

const RUBRIC_ANCHORS: Readonly<Record<RatingLevel, string>> = {
  emerging:
    "Requires frequent prompting, modelling, and support to demonstrate the skill consistently.",
  developing:
    "Demonstrates the skill with some guidance and increasing confidence, but consistency may still vary.",
  secure:
    "Demonstrates the skill independently and consistently across most classroom activities and presentations.",
  advanced:
    "Exceeds the expected level through confident, natural, independent application across different contexts.",
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
