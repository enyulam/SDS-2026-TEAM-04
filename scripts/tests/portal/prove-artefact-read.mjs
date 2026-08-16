/**
 * prove:artefact-read -- every rebuilt screen DEMONSTRATES it opened the
 * frame's `.html` and the numbered pack's `screen.md`.
 *
 * ⚠️ Read `artefact-read-rule.mjs` first: it states what this can prove and
 * what it CANNOT (the `.png`), before any code.
 *
 * Legs:
 *   AR-0  non-vacuity      -- the ledger parsed at least one block
 *   AR-1  coverage         -- every MEASURED screen has exactly one block
 *   AR-2  sources exist    -- `.html`, `screen.md` and the component resolve
 *   AR-3  html-read        -- every cited value occurs LITERALLY in the .html
 *   AR-4  not-from-a-note  -- >=6 distinct values, >=2 FRACTIONAL, none of
 *                             them present in the pack's prose `.md`
 *   AR-5  derived-not-quoted -- every cited value is USED in the component
 *   AR-6  screen.md-read   -- the quotation occurs literally in screen.md
 *   AR-7  CONTROLS         -- three planted falsehoods must each be REJECTED
 *   AR-8  no back-fill     -- MEASURED and UNMEASURED are disjoint and every
 *                             pack is accounted for exactly once
 */

import { existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  MEASURED,
  PRE_GATE,
  UNMEASURED,
  citedInHtml,
  fractionalValues,
  loadSources,
  normaliseValue,
  readLedger,
  screenInventory,
  usedInComponent,
} from "./artefact-read-rule.mjs";
/*
 * ⛔ THE SAME CENSUS THE NAVIGATION SUITE USES, IMPORTED RATHER THAN COPIED.
 * `AR-1b`'s whole strength is that the ship signal is READ FROM THE APP TREE;
 * a private re-implementation here could drift from the one the rest of the
 * project trusts, and then this gate would be measuring its own copy.
 */
import { shippedPortalRoutes } from "../../../tests/frontend/app-route-census.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

let pass = 0;
let fail = 0;
const check = (id, ok, detail) => {
  if (ok) pass += 1;
  else fail += 1;
  console.log(`${ok ? "PASS" : "FAIL"} ${id}  ${detail}`);
};

const ledger = readLedger(ROOT);

// --- AR-0 -------------------------------------------------------------
check("AR-0", ledger.length > 0, `ledger parsed ${ledger.length} artefact-read block(s)`);
if (ledger.length === 0) {
  console.log("\nAR-0 failed; every later leg would assert over nothing. Stopping.");
  process.exit(1);
}

// --- AR-1 -------------------------------------------------------------
const byScreen = new Map();
for (const block of ledger) {
  byScreen.set(block.screen, [...(byScreen.get(block.screen) ?? []), block]);
}
const missing = MEASURED.filter((id) => (byScreen.get(id) ?? []).length !== 1);
check("AR-1", missing.length === 0, `every MEASURED screen carries exactly one block (gaps: ${missing.join(", ") || "none"})`);

// ---------------------------------------------------------------------
// ⛔ AR-1a … AR-1d -- THE MECHANISM. Added 2026-08-16 by Operator ruling.
// ---------------------------------------------------------------------
// ⚠️ THE DEFECT: `MEASURED` was HAND-MAINTAINED, and NOTHING FAILED WHEN A
//    PHASE FORGOT TO EXTEND IT. Three consecutive phases forgot — `15`
//    (`P2-15`), `16` (`P2-16`) and `02` (`P2-17`) each shipped a screen built
//    under this rule and left it off the list. ▶ It was caught only because
//    `P2-19` happened to look.
//
//    Operator: *"A gate nothing enforces is not a gate. Make it mechanical:
//    a phase that ships a screen without a register entry FAILS."*
//
// ⛔ SO THE LIST IS NO LONGER THE AUTHORITY. `AR-1b` DERIVES the obligation
//    from two independent sources that a phase cannot both forget:
//      1. the ratified route inventory (screen id → canonical route), and
//      2. the app tree itself (`app/**/page.tsx`), read by the same census
//         the navigation suite uses.
//    A screen whose route SHIPS must carry a block. Remembering is not a
//    control — same shape as the RPC-caller rule and `P24a-CALL`.
// ---------------------------------------------------------------------
const inventory = screenInventory(ROOT);
const shipped = new Set(await shippedPortalRoutes());
check(
  "AR-1a",
  inventory.length === 36 && shipped.size > 0,
  `⚠️ NON-VACUITY FIRST: the route inventory parsed ${inventory.length} screens (expected 36) and the app tree yielded ${shipped.size} routes — ▶ if either collapsed to nothing, AR-1b below would pass over an EMPTY SET and report a green that means "no screens exist"`,
);

const shippedScreens = inventory.filter((row) => shipped.has(row.route));
const unregistered = shippedScreens
  .filter((row) => (byScreen.get(row.screen) ?? []).length === 0 && !PRE_GATE.includes(row.screen))
  .map((row) => row.screen);
check(
  "AR-1b",
  inventory.length === 36 && unregistered.length === 0,
  `⛔ THE MECHANISM: every screen whose canonical route SHIPS carries an artefact-read block, or is on the frozen pre-gate list — ${shippedScreens.length} shipped = ${shippedScreens.length - PRE_GATE.length} registered + ${PRE_GATE.length} pre-gate (UNREGISTERED: ${unregistered.join(", ") || "none"})`,
);

const preGateWithBlocks = PRE_GATE.filter((id) => (byScreen.get(id) ?? []).length > 0);
check(
  "AR-1c",
  PRE_GATE.length === 10 && preGateWithBlocks.length === 0,
  `⛔ THE PRE-GATE LIST IS CLOSED at exactly 10 (${PRE_GATE.length}) and NO member has acquired a block (${preGateWithBlocks.join(", ") || "none"}) — ⚠️ it may only SHRINK: a screen REBUILT under the rule gains a block and this leg then goes red until it is removed from the list, so the forcing function points at REMOVAL and never at addition. ⛔ An eleventh entry would be a phase exempting itself: `+
    `\`CLAUDE.md\` §12 stop-and-ask`,
);

/*
 * ⚠️ ONLY THE RELATION `AR-8` DOES NOT ALREADY COVER. `AR-8a`/`AR-8b` prove
 * MEASURED and UNMEASURED are disjoint and jointly exhaustive; duplicating
 * that here would be a second copy free to drift from the first — which is
 * the very failure this whole addition is about.
 */
const strays = PRE_GATE.filter((id) => !UNMEASURED.includes(id));
check(
  "AR-1d",
  strays.length === 0,
  `⚠️ PRE_GATE ⊆ UNMEASURED (strays: ${strays.join(", ") || "none"}) — ▶ a pre-gate screen that had drifted into MEASURED would be claiming a block it does not carry. Disjointness and coverage are AR-8's, deliberately not restated here`,
);

// --- AR-2 .. AR-6, per block -----------------------------------------
for (const block of ledger) {
  const id = block.screen;
  const src = loadSources(ROOT, block);

  check(
    `AR-2-${id}`,
    src.html !== null && src.screenMd !== null && src.component !== null && src.note !== null,
    `sources resolve for screen ${id} (${block.referencePack})`,
  );
  if (src.html === null || src.screenMd === null || src.component === null || src.note === null) continue;

  const notInHtml = block.htmlValues.filter((v) => !citedInHtml(src.html, v));
  check(`AR-3-${id}`, notInHtml.length === 0 && block.htmlValues.length > 0, `all ${block.htmlValues.length} cited values occur literally in the .html (absent: ${notInHtml.join(", ") || "none"})`);

  const distinct = new Set(block.htmlValues);
  const fractional = fractionalValues([...distinct]);
  const leakedToNote = [...distinct].filter((v) => src.note.includes(v));
  /*
   * ═══════════════════════════════════════════════════════════════════════
   * ⛔ THE FRACTIONAL MINIMUM IS RETIRED — OPERATOR RULING, 2026-08-16.
   * ═══════════════════════════════════════════════════════════════════════
   * The condition was `distinct.size >= 6 && fractional.length >= 2 && …`.
   * ⚠️ IT IS RETIRED, NOT LOWERED TO FIT. The Operator's words, recorded
   * because the distinction is the whole ruling:
   *
   *   "RETIRE THE FRACTIONAL REQUIREMENT. It was a heuristic for 'did you read
   *    the .html', and prove:artefact-read now has AR-2, AR-3, AR-5 and AR-6
   *    doing that work against the file directly. … Record it as retired with
   *    the three instances as evidence, not as a threshold lowered to fit."
   *
   * ▶ THE EVIDENCE IS THREE MEASURED INSTANCES, AND THE THIRD IDENTIFIED THE
   *   CAUSE AS STRUCTURAL:
   *     `AR-4-14`  1 fractional (2026-08-14) — escalated, ruled KNOWN-RED
   *     `AR-4-17`  1 fractional (2026-08-15) — second instance, escalated
   *     `AR-4-21`  0 fractional (2026-08-16) — third, and the frame's `.html`
   *                carries 38 fractional values of which EVERY ONE belongs to a
   *                SHARED CONTROL (icon internals; the sidebar rail's 13.50px)
   *
   * ⛔ WHY IT COULD NEVER BE SATISFIED HONESTLY: on those screens the fractional
   *   values are owned by shared controls, so meeting the minimum meant either
   *   RESTYLING A SHARED CONTROL to match a citation, or CITING VALUES THE
   *   COMPONENT DOES NOT USE — and `AR-5` correctly reds on the second. ▶ Both
   *   were refused by the Operator, which is what makes this a wall rather than
   *   a bar someone declined to clear.
   *
   * ⛔ WHAT REPLACED IT WAS ALREADY THERE, AND IS STRONGER: `AR-3` checks every
   *   cited value occurs LITERALLY in the `.html`, `AR-5` checks every cited
   *   value is USED in the component, and `AR-6` verifies a `screen.md`
   *   quotation at source. The fraction was a PROXY for reading the file; those
   *   three read the file.
   *
   * ⛔ THE DISTINCT-VALUE REQUIREMENT AND THE NOTE-LEAK REQUIREMENT BOTH STAND.
   *   `leakedToNote` is the one that carries §7.4.1's rule — a value obtainable
   *   from the prose note is not evidence the `.html` was opened.
   */
  check(
    `AR-4-${id}`,
    distinct.size >= 6 && leakedToNote.length === 0,
    `${distinct.size} distinct value(s), none obtainable from the prose note (leaked: ${leakedToNote.join(", ") || "none"}) — ⚠️ the >=2 FRACTIONAL minimum is RETIRED by Operator ruling 2026-08-16 after three measured instances, the third at zero with the cause identified as structural: shared controls own the fractional values, so satisfying it meant restyling a shared control or citing values the component does not use, and both were refused. It was a PROXY for reading the .html; AR-3, AR-5 and AR-6 read it. Observed here: ${fractional.length} fractional (${fractional.join(" ") || "none"}), REPORTED and NOT ASSERTED`,
  );

  const notUsed = block.htmlValues.filter((v) => !usedInComponent(src.component, v));
  check(`AR-5-${id}`, notUsed.length === 0, `every cited value is USED in ${block.components.join(" + ")} (unused: ${notUsed.join(", ") || "none"})`);

  check(
    `AR-6-${id}`,
    block.quote.length > 0 && src.screenMd.includes(block.quote),
    `screen.md quotation verified at source: "${block.quote}"`,
  );
}

// --- AR-7 CONTROLS ----------------------------------------------------
// ⛔ Every absence assertion above needs a detector proven able to fire.
{
  const sample = ledger.find((b) => b.screen === MEASURED[0]) ?? ledger[0];
  const src = loadSources(ROOT, sample);
  const fabricated = "8887.75px"; // present in no artefact anywhere
  check("AR-7a", src.html !== null && !citedInHtml(src.html, fabricated), "a fabricated value is REJECTED by the .html check");
  check("AR-7b", src.component !== null && !usedInComponent(src.component, fabricated), "a fabricated value is REJECTED by the component check");
  check("AR-7c", fractionalValues(["326px", "13px"]).length === 0, "an all-integer citation set is REJECTED by the fractional check");
  check("AR-7d", normaliseValue("10.50px") === "10.5px" && normaliseValue("13.00px") === "13px" && normaliseValue("326px") === "326px", "value normalisation is exact, so AR-5 cannot pass by rounding");
  // ▶ and the positive clause: without it, "the guard fires" would be equally
  //   true of a predicate that rejects everything.
  check("AR-7e", src.html !== null && citedInHtml(src.html, sample.htmlValues[0]), `the same predicate ACCEPTS a real value (${sample.htmlValues[0]})`);
  // ⛔ "used" must not degenerate into "quoted": a value living only in a comment is rejected.
  check(
    "AR-7f",
    !usedInComponent("/* measured 326px */\n// also 326px\nconst a = 1;", "326px") &&
      usedInComponent('const a = "w-[326px]";', "326px"),
    "a value present ONLY in a comment is REJECTED, while the same value in code is ACCEPTED",
  );
}

// --- AR-8 -------------------------------------------------------------
{
  const overlap = MEASURED.filter((id) => UNMEASURED.includes(id));
  const packs = readdirSync(join(ROOT, "UI_REFERENCE_FINAL_MVP"))
    .filter((name) => existsSync(join(ROOT, "UI_REFERENCE_FINAL_MVP", name, "screen.md")))
    .map((name) => (name.startsWith("AUTH-") ? name.slice(0, 7) : name.slice(0, 2)));
  const unaccounted = packs.filter((id) => !MEASURED.includes(id) && !UNMEASURED.includes(id));
  check("AR-8a", overlap.length === 0, `MEASURED and UNMEASURED are disjoint (overlap: ${overlap.join(", ") || "none"})`);
  check(
    "AR-8b",
    unaccounted.length === 0,
    `every governed pack is accounted for; unbuilt screens sit in UNMEASURED until rebuilt (unaccounted: ${unaccounted.join(", ") || "none"})`,
  );
}

console.log(`\n${pass} PASS · ${fail} FAIL`);
console.log(
  "⛔ RESIDUAL LIMIT, reported every run: the .png is NOT mechanically provable. " +
    "This suite demonstrates the .html and screen.md were read and built from; it cannot demonstrate the image was viewed.",
);
process.exit(fail === 0 ? 0 : 1);
