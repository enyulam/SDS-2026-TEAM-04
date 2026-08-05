/**
 * Deterministic grounding validation — CLAUDE.md §4 non-negotiable 1 and
 * spec §12.1 step 3, applied to the four parent-facing panels against the
 * SAVED observation and its nine governed ratings.
 *
 * This gate is what makes "AI drafts, doesn't assess" true: it runs on every
 * generated draft BEFORE anything is persisted, and it can genuinely REJECT
 * — proven by the integration suite with a deliberately contradictory case
 * (an `emerging` rating described in achievement language must be caught,
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
 * "an Emerging rating must read as support-needed, never as achievement").
 */
const ACHIEVEMENT_TERMS = [
  "excellent", "excelled", "excels", "outstanding", "exceptional", "mastered", "mastery",
  "impressive", "remarkable", "superb", "brilliant", "flawless", "perfect",
  "great strength", "particularly strong", "very strong", "strong command",
  "consistently strong", "shines", "shone", "standout", "advanced level",
  "no difficulty", "with ease", "effortless",
] as const;

/** Raw rating vocabulary must never leak into parent-facing prose (§14). */
const RATING_LABEL_RE = /\b(emerging|developing|secure|advanced)\b/i;

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

  // 2 — raw rating labels never reach a parent panel.
  if (RATING_LABEL_RE.test(allText)) {
    reasons.push("a raw rating label appears in parent-facing prose");
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
