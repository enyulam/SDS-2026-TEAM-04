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
  UNMEASURED,
  citedInHtml,
  fractionalValues,
  loadSources,
  normaliseValue,
  readLedger,
  usedInComponent,
} from "./artefact-read-rule.mjs";

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
  check(
    `AR-4-${id}`,
    distinct.size >= 6 && fractional.length >= 2 && leakedToNote.length === 0,
    `${distinct.size} distinct, ${fractional.length} fractional (${fractional.join(" ")}), none obtainable from the prose note (leaked: ${leakedToNote.join(", ") || "none"})`,
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
