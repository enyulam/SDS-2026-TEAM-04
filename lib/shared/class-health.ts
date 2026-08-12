/**
 * `CLAUDE.md` §6's Class Health Summary — the four conditions, in ONE place.
 *
 * ⛔ WHY THIS IS EXTRACTED RATHER THAN COPIED. The server projection and the
 * deterministic fixture both need this verdict, and the server module that
 * first held it is `server-only`. ▶ Two copies of a **ratified closed set**
 * is precisely how one surface quietly acquires a fifth condition or a
 * paraphrased sentence — and §6's whole point is that **exactly one result is
 * ever shown**. The same reasoning that extracted `RATING_TILE_STYLE` rather
 * than declaring it a third time.
 *
 * ⛔ NOT A CONTRACT FILE AND NOT A SERVER MODULE: it is a pure function over
 * two integers, with no import, no I/O and no environment. That is what lets
 * both sides share it without either reaching across a boundary.
 */

export type ClassHealthCounts = {
  readonly pendingReports: number;
  readonly evidenceMissing: number;
};

export type ClassHealthVerdict = {
  readonly status: string;
  readonly action: string;
};

/**
 * ⛔ FOUR CONDITIONS, EXHAUSTIVE, EVALUATED TOP TO BOTTOM, FIRST MATCH WINS.
 *
 * ⚠️ THE SENTENCES ARE QUOTED VERBATIM from `CLAUDE.md` §6 and must not be
 * paraphrased, softened or reordered. There is **no fifth condition**, no
 * escalation tier for how long a report has been pending, and this text is
 * **never AI-authored** — generating it would silently pull the §8-deferred
 * Weekly Class Health Brief into scope.
 *
 * ⚠️ Conditions 1–3 all read `Pending follow-up`. That is not a transcription
 * slip: only the ACTION differs between them.
 */
export function classHealthVerdict(counts: ClassHealthCounts): ClassHealthVerdict {
  const pending = counts.pendingReports;
  const missing = counts.evidenceMissing;

  if (pending > 0 && missing > 0) {
    return {
      status: "Pending follow-up",
      action: "Check pending report and evidence before closing class record.",
    };
  }
  if (pending > 0 && missing === 0) {
    return {
      status: "Pending follow-up",
      action: "Check pending report(s) before closing class record.",
    };
  }
  if (pending === 0 && missing > 0) {
    return {
      status: "Pending follow-up",
      action: "Follow up on missing evidence before closing class record.",
    };
  }
  /*
   * ⚠️ Condition 4 additionally requires that all reports are `Submitted`.
   * With `pending = 0` every report has reached `submitted` by construction —
   * `pending` counts exactly the reports that have not — so that third clause
   * is SATISFIED here rather than dropped.
   */
  return {
    status: "On Track",
    action: "All reports and evidence complete — no action needed.",
  };
}
