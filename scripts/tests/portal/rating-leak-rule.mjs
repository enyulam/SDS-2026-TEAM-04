// =====================================================================
// THE RATING-LEAK RULE -- NARROWED BY OPERATOR RULING, 2026-08-15.
// =====================================================================
// > *"RULING: narrow it. Match the labels only where they appear AS A RATING --
// >  adjacent to a dimension name, in a chip, or in a rating-shaped context --
// >  never as bare words in prose. Prove the narrowed detector still fires on a
// >  real rating and no longer fires on 'at the beginning of the session'."*
//
// ⛔ WHAT WAS WRONG. Four suites each carried their own copy of
//    `["beginning","developing","mastering","mastered", ...]` and matched every
//    one as a BARE WORD. ▶ `CLAUDE.md` §3.4 / `A-052` prohibit exactly that
//    shape: *"Ordinary prose stays legal -- 'at the beginning of the session',
//    'has mastered maintaining eye contact'. A regex equivalent to
//    `\\b(beginning|developing|mastering|mastered)\\b` is prohibited: it would
//    reject valid parent-facing English."*
//    It was caught when a non-resumability notice reading *"it starts again
//    from the beginning"* turned `PLMa-RATINGS` red on screen `14`.
//
// ⚠️ ONE MODULE, NOT FOUR COPIES. A narrowing applied to three of four files is
//    worse than no narrowing, because the surviving copy fails LATE and looks
//    like a real finding.
//
// =====================================================================
// ⛔ THE DISCRIMINATOR IS **ATTRIBUTION**, NOT ADJACENCY -- AND `A-052`'S OWN
//    SECOND EXAMPLE IS WHAT PROVES IT.
// =====================================================================
// The obvious narrowing is *"a label near a dimension name"*. ▶ **IT IS WRONG,
// and A-052 already supplies the counter-example**: `has mastered maintaining
// eye contact` is EXPLICITLY LEGAL and puts `mastered` four words from a
// dimension name. An adjacency rule would re-create the exact false positive
// the ruling exists to remove -- one layer deeper, where it is harder to see.
//
// ▶ What actually separates the two is **whether the label is PRESENTED AS A
//   VALUE**: `Mastered eye contact` is label-first, the shape a chip or a
//   summary row renders. `has mastered maintaining eye contact` is a VERB with
//   a subject in front of it. **Grammar, not distance.**
// =====================================================================

/** The four ratified labels (`A-049`). Ordinary English words, every one. */
const LABELS = ["beginning", "developing", "mastering", "mastered"];

/**
 * ⛔ IDENTIFIERS, NOT ENGLISH. These are matched BARE and always -- nobody
 * writes `competency_rating` in prose, so there is no false positive to avoid
 * and narrowing them would only create a hole.
 */
const STRUCTURAL = [
  "competency_rating",
  "competencyRating",
  "overallGrade",
  "overall_grade",
  "ratingLevel",
  "rating_level",
  "ratingBand",
];

const L = LABELS.join("|");

/**
 * The four rating-shaped contexts. A label matches ONLY inside one of them.
 */
const CONTEXTS = [
  {
    id: "value-literal",
    // The label IS the entire string literal -- how a rating value appears in
    // code, an enum member or a fixture: `"mastering"`, `'beginning'`.
    rx: new RegExp(`["'\`](${L})["'\`]`, "i"),
    why: "the label is the WHOLE string literal, which is how a rating VALUE appears in code",
  },
  {
    id: "attribution",
    // `A-052`'s named shapes: `rating: Mastered`, `rated as Beginning`,
    // `Mastering level`, `grade = developing`, `band: mastered`.
    rx: new RegExp(`(?:rating|rated|grade|band|level|score)s?\\s*(?:as|:|=)?\\s*(?:${L})\\b|\\b(?:${L})\\s+(?:level|band|grade|rating)\\b`, "i"),
    why: "explicit rating ATTRIBUTION or taxonomy disclosure -- the shapes A-052 names",
  },
  {
    id: "isolated-element",
    // `A-052`'s *"an isolated raw label presented as a rating value"* -- a
    // chip, a cell or a badge whose ENTIRE content is the label.
    rx: new RegExp(`>\\s*(${L})\\s*<`, "i"),
    why: "an ISOLATED raw label as an element's entire content -- a chip, badge or cell",
  },
  {
    id: "label-first-dimension",
    // `Mastered eye contact` / `Beginning on sentence flow` -- the label opens
    // the phrase and a dimension follows. ⛔ Deliberately NOT plain adjacency:
    // the leading boundary is what excludes `has mastered maintaining eye
    // contact`, where a subject precedes the verb.
    rx: new RegExp(
      `(?:^|[>\\n,;·|\\-])\\s*(?:${L})\\b[^<>\\n]{0,30}?\\b(?:eye contact|vocal projection|emotional expression|sentence flow|audience awareness|body language|speech structure|tonality|posture)`,
      "im",
    ),
    why: "the label OPENS the phrase and a dimension follows -- the shape a chip or a summary row renders",
  },
];

/**
 * Every rating-shaped hit in `source`, as `{ term, context, why }`.
 *
 * ⚠️ It returns the CONTEXT that fired, not just the word. A leg that reports
 * only *"beginning"* sends the next reader looking for a rating in a sentence
 * about uploads.
 */
export function ratingLeaks(source) {
  const hits = [];
  for (const term of STRUCTURAL) {
    if (new RegExp(term, "i").test(source)) {
      hits.push({ term, context: "structural-identifier", why: "an identifier, never English prose" });
    }
  }
  for (const { id, rx, why } of CONTEXTS) {
    const m = source.match(rx);
    if (m) hits.push({ term: m[0].trim().slice(0, 48), context: id, why });
  }
  return hits;
}

/**
 * ⛔ THE RULE'S OWN CONTROL SET, EXPORTED SO EVERY CONSUMER RUNS IT.
 *
 * ⚠️ A narrowed detector is worth less than a bare one UNLESS the narrowing is
 * proven in BOTH directions on the same run. ▶ `MUST_FIRE` proves it still
 * catches a real rating; `MUST_NOT_FIRE` proves it no longer catches English --
 * and every entry in the second list is either `A-052`'s own wording or the
 * exact sentence that produced this ruling.
 */
export const MUST_FIRE = [
  ["competency_rating mastering", "the original planted sample"],
  ["Mastered eye contact, clear projection", "P2-7's planted sample: label-first + dimension"],
  ["Beginning on sentence flow & pace", "P2-7's second planted sample"],
  ["rating: Mastered", "A-052's named attribution shape"],
  ["rated as Beginning", "A-052's named attribution shape"],
  ["Mastering level", "A-052's named taxonomy disclosure"],
  ['const status = "developing";', "a rating VALUE as a whole string literal"],
  ["<span class=\"chip\">Mastering</span>", "an isolated raw label as a chip's entire content"],
  ["overallGrade", "a structural identifier"],
];

export const MUST_NOT_FIRE = [
  ["at the beginning of the session", "A-052's own legal example"],
  ["has mastered maintaining eye contact", "A-052's own legal example -- and it puts the label FOUR WORDS from a dimension name, which is why adjacency was refused"],
  [
    "Uploads do not resume — an interrupted upload must be started again from the beginning.",
    "the exact sentence that produced this ruling (screen 14's non-resumability notice)",
  ],
  ["The lesson is developing well and the room is booked", "ordinary progressive-tense English"],
  ["a developing country's education policy", "the label as an ordinary adjective"],
  ["Beginning next term, classes run on Tuesdays", "the label opening a sentence with NO dimension following"],
];

/**
 * Run both control lists. Returns `{ ok, missed, falsePositives }`.
 * ⛔ A consumer that calls `ratingLeaks` without this is running an unproven
 * detector, which is what the bare-word version effectively was.
 */
export function proveNarrowing() {
  const missed = MUST_FIRE.filter(([sample]) => ratingLeaks(sample).length === 0).map(
    ([sample, why]) => `${JSON.stringify(sample)} (${why})`,
  );
  const falsePositives = MUST_NOT_FIRE.filter(([sample]) => ratingLeaks(sample).length > 0).map(
    ([sample, why]) => `${JSON.stringify(sample)} -> ${JSON.stringify(ratingLeaks(sample))} (${why})`,
  );
  return { ok: missed.length === 0 && falsePositives.length === 0, missed, falsePositives };
}
