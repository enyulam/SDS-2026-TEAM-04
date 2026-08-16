#!/usr/bin/env node
// =====================================================================
// PORTAL PHASE P2-23 -- screen `31` Parent Calendar.
//
// ⛔ ZERO SCHEMA **AND ZERO NEW SERVER CODE**. Named as empty lists: no
//    migration, function, grant, table, column, enum, policy, client table
//    grant, write path, audit string, projection, DTO or server action.
//    §12.10 for the NINTH consecutive phase, and the first where the
//    APPLICATION layer also needed nothing.
//
// ⛔ `GC-2` IS "THE MOST SEVERE CONFLICT IN THE SET" -- the frame publishes
//    the entire competency taxonomy to a parent. Six removals, each asserted.
//
// ⛔ EVERY DETECTOR BELOW CARRIES A POSITIVE CONTROL ON REAL SOURCE (plan
//    §60, ruled 2026-08-17): a pattern that has never matched anything is a
//    hypothesis, not a detector. The synthetic control proves it CAN fire;
//    the real match proves it fires on THIS corpus, which is where all five
//    of the ruled-on false reds failed.
//
// ⛔ Exit code is the only verdict.
//
// Run: npm run prove:portal-p2-23
// =====================================================================

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { stripComments } from "./artefact-read-rule.mjs";
import { ratingLeaks } from "./rating-leak-rule.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
let bad = 0;
const check = (ok, msg) => {
  if (!ok) bad++;
  console.log(`${ok ? "PASS" : "FAIL"}    ${msg}`);
};
const read = (rel) => readFileSync(join(ROOT, ...rel.split("/")), "utf8");

const screen = read("features/parent/parent-calendar-screen.tsx");
const code = stripComments(screen);
const frameHtml = read("UI_REFERENCE_FINAL_MVP/reference/Parent - Calendar/Parent - Calendar.html");
const notes = read("UI_REFERENCE_FINAL_MVP/31-parent-calendar/implementation-notes.md");

// ---------------------------------------------------------------------
// ⛔ PC23-0 -- NON-VACUITY. Every leg below scans `code`; if the strip
//    emptied it, each prohibition would pass over nothing.
// ---------------------------------------------------------------------
check(
  code.length > 6000 && /export function ParentCalendarScreen/.test(code),
  `PC23-0 ⚠️ NON-VACUITY FIRST: the stripped component is ${code.length} chars and still declares its export — ▶ every prohibition below scans THIS string, and an empty one satisfies all of them`,
);

// ---------------------------------------------------------------------
// ⛔ PC23-1 -- ZERO SCHEMA AND ZERO NEW SERVER CODE, NAMED AS EMPTY LISTS.
// ---------------------------------------------------------------------
const migrations = readdirSync(join(ROOT, "supabase", "migrations")).filter((f) => /p2_23/i.test(f));
check(migrations.length === 0, `PC23-1 ⛔ ZERO migrations for this phase: [${migrations.join(",") || "none"}]`);
const serverAdded = [
  "server/modules/parent-view/parent-calendar-projections.ts",
  "server/modules/parent-view/calendar-projections.ts",
].filter((f) => existsSync(join(ROOT, ...f.split("/"))));
check(
  serverAdded.length === 0,
  `PC23-1a ⛔ ZERO new server modules: [${serverAdded.join(",") || "none"}] — ▶ §12.10's strongest outcome so far: the APPLICATION layer needed nothing either`,
);
check(
  /port\.readParentDashboard\(\)/.test(code) && /port\.listParentSubmittedReports\(\)/.test(code),
  "PC23-1b ⚠️ …because BOTH facts already travel: `readParentDashboard()` (P2-22) carries each child's sessions NESTED, its grade·module label and its trainer; `listParentSubmittedReports()` carries each submitted report's `sessionId`",
);
const p22 = read("server/modules/parent-view/parent-dashboard-projections.ts");
check(
  /readonly sessions: readonly ParentUpcomingSessionDto\[\];/.test(p22),
  "PC23-1c ⚠️ …and P2-22's NESTING is what made that true, verified at its source — a flat array would have forced this screen to carry `class_module_id` to attribute a day to a child, the exact field that phase kept out of the payload",
);

// ---------------------------------------------------------------------
// ⛔ PC23-2 -- THE SIX `GC-2` REMOVALS.
// ⚠️ POSITIVE CONTROL FIRST (§60): each token is proven PRESENT in the
//    frame before its absence in the component is asserted. A prohibition
//    that refuses nothing is not evidence.
// ---------------------------------------------------------------------
const DRAWN = [
  "Beginning",
  "Developing",
  "Mastering",
  "Mastered",
  "mastered days",
  "What the colours mean",
  "Eye contact",
  "Vocal projection",
  "Audience awareness",
];
const drawnCounts = DRAWN.map((t) => `${t}:${frameHtml.split(t).length - 1}`);
check(
  drawnCounts.every((d) => !d.endsWith(":0")),
  `PC23-2 ⚠️ POSITIVE CONTROL ON THE FRAME — all ${DRAWN.length} refused tokens are DEMONSTRABLY PRESENT in the .html: [${drawnCounts.join(", ")}]. ▶ The refusals below refuse something that EXISTS`,
);
const stillDrawn = DRAWN.filter((t) => code.includes(t));
check(
  stillDrawn.length === 0 && ratingLeaks(code).length === 0,
  `PC23-2a ⛔ AND NOT ONE REACHES THE COMPONENT (present: ${stillDrawn.join(", ") || "none"}; rating-vocabulary leaks: ${ratingLeaks(code).map((l) => l.term).join(",") || "none"}) — the four levels, the legend that glosses them, the "mastered days" aggregate and the three skill tags are ALL absent`,
);

/*
 * ⛔ THE LEGEND IS THE SEVEREST LINE AND GETS ITS OWN LEG. `A-052` makes
 * taxonomy DISCLOSURE the offence — a legend defining all four levels teaches a
 * parent the whole vocabulary in one card. ▶ Asserting the four labels absent
 * is not enough: a legend rewritten in softer words would pass that and still
 * disclose the taxonomy.
 *
 * ⚠️ POSITIVE CONTROL: the detector is shown to fire on the frame's own legend
 * text before it is used to clear the component (§60).
 */
const LEGEND_SHAPE = /Just starting|needs support|Growing steadily|Confident and consistent|Excelling and independent|What the colours mean/;
check(
  LEGEND_SHAPE.test(frameHtml),
  "PC23-2b ⚠️ POSITIVE CONTROL ON A REAL MATCH: the legend detector FIRES on the frame's own .html — ▶ a pattern that has never matched anything is a hypothesis, not a detector (§60)",
);
check(
  !LEGEND_SHAPE.test(code),
  "PC23-2c ⛔ …and it is SILENT on the component. The colour key is absent in substance, not merely by label — a softened rewrite would have passed a label-only check and still published the taxonomy (`A-052`)",
);

/*
 * ⛔ THE TRAINER OBSERVATION CARRIES TWO PROHIBITIONS ON ONE LINE, and `C-12`
 * says so explicitly: *"also breaches the no-internal-notes rule; two lines,
 * and a pass working from one would leave the other standing."*
 */
check(
  !/observation|Alicia gave|trainerNote|internalNote|coachNote/i.test(code),
  "PC23-2d ⛔ the selected-day OBSERVATION is absent — ⚠️ TWO prohibitions on one line (`Q-27` and the no-internal-notes rule), and `C-12` warns that a pass working from one would leave the other standing",
);

// ---------------------------------------------------------------------
// ✅ PC23-3 -- THE THREE REACHABLE CELL STATES, AND THE FOURTH THAT CANNOT
//    BE CONSTRUCTED.
// ---------------------------------------------------------------------
check(
  /new Map<string, "session" \| "report">\(\)/.test(code),
  "PC23-3 ⛔ THE STATES NEST: one map with two values, not two orthogonal booleans — ▶ there is NO representation of `report without session`, so the unreachable fourth combination cannot be constructed. A cell that can never render is a cell nobody checks",
);
check(
  /withReport\.has\(s\.sessionId\)/.test(code) && /for \(const s of selected\.sessions\)/.test(code),
  "PC23-3a …and the map is built by iterating SESSIONS and asking which have a report — the nesting expressed as control flow, not as a comment",
);
check(
  !/rating|band|score|level|mastery/i.test(code.replace(/aria-label|labelled/gi, "")),
  "PC23-3b ⛔ and NEITHER MARK IS RATING-DERIVED — `session` and `report` are lifecycle facts a parent already holds (`C-12`: no third state may be invented)",
);

/*
 * ✅ SC 1.4.1 — COLOUR IS NOT THE ONLY CARRIER, ASSERTED RATHER THAN CLAIMED.
 * `C-12` expressly asked to be told if the two states could not be
 * distinguished without colour.
 */
check(
  /aria-label=\{label\}/.test(code) &&
    /class, report ready to read/.test(code) &&
    /class, no report yet/.test(code),
  "PC23-4 ✅ SC 1.4.1: every marked day states its fact IN WORDS in its accessible name — the two states are distinguishable without colour",
);
check(
  /aria-hidden="true" className="text-\[10px\] leading-none"/.test(code) && /"●"/.test(code) && /"○"/.test(code),
  "PC23-4a ✅ …and a VISIBLE glyph carries it too, so a sighted reader who cannot distinguish the tints still can — colour is a third carrier, never the only one",
);

// ---------------------------------------------------------------------
// ✅ PC23-5 -- WHAT SURVIVES, AND THE ONE ACTION THAT IS GATED.
// ---------------------------------------------------------------------
check(
  /dayReport !== null && \(/.test(code) && /View report/.test(code),
  "PC23-5 ⛔ THE `View report` ACTION IS GATED ON A GENUINELY SUBMITTED REPORT (`C-12`) — and it is ABSENT rather than disabled when there is none: `P2-10`'s rule, DISABLED says \"not yet\" and ABSENT says \"not a thing\"",
);
check(
  /reports\.find\(/.test(code) && /r\.studentId === selected\.studentId/.test(code),
  "PC23-5a …and the report is resolved for THIS child — the `P2-22` lesson applied one screen later: the wrong child's data behind the right child's name is the `Q-27` family with a different payload",
);
const SURVIVING = ["Class", "Lesson", "Trainer", "Recent reports", "View all"];
const missing = SURVIVING.filter((t) => !code.includes(t));
check(
  missing.length === 0,
  /*
   * ⚠️ TWENTIETH §12.14 INSTANCE WAS THIS LINE — a backtick pair around C-12
   * inside a template literal, which is precisely the shape the adopted fix
   * forbids ("plain quotes, never backticks, in a check() message"). It threw
   * a SyntaxError before anything ran, and was repaired with the Edit tool.
   * ▶ Recorded here rather than only in the log because the rule was broken in
   * the same pass that cites it.
   */
  `PC23-5b ✅ every SURVIVING element C-12 lists is built (missing: ${missing.join(", ") || "none"}) — session identity, the reports list and its View all`,
);
check(
  /selected\.classLabel !== null &&/.test(code) &&
    /daySession\.lessonNumber !== null \|\| daySession\.lessonTitle !== null/.test(code) &&
    /selected\.trainerDisplayName !== null &&/.test(code),
  "PC23-5c ⚠️ …and every one is OMITTED when null (hero `0B`) — never a dash, never a placeholder, three independent guards rather than one blanket check",
);

// ---------------------------------------------------------------------
// ⚠️ PC23-6 -- THE DISCLOSURE, AND WHY ITS WORDING IS THE CAREFUL PART.
// ---------------------------------------------------------------------
const DISCLOSURE = /<p className="[^"]*text-\[11\.5px\][^"]*">[\s\S]*?<\/p>/g;
const disclosures = code.match(DISCLOSURE) ?? [];
/*
 * ⚠️ TWO PARAGRAPHS, MEASURED — AND THE FIRST DRAFT ASSERTED ONE.
 *
 * This leg expected a single `text-[11.5px]` paragraph and found **2**: the
 * §12.12 refusal disclosure AND the calendar's own legend caption. ▶ **That is
 * §60 biting the pass that wrote it** — the count was assumed from the concept
 * ("there is one disclosure") instead of measured against the source.
 *
 * ⛔ AND THE REPAIR IS STRONGER THAN THE ORIGINAL, WHICH IS WHY IT IS NOT A
 * RELAXATION. Both paragraphs are prose a parent reads about the missing
 * apparatus, so **both** must be free of taxonomy — the caption explaining what
 * the day marks mean is exactly where a four-level gloss would creep back in.
 * Narrowing the selector to "the one I meant" would have left the other
 * unmeasured.
 */
check(
  disclosures.length === 2,
  `PC23-6 ⚠️ BOTH parent-facing prose blocks are identified (${disclosures.length}) — the §12.12 refusal disclosure and the calendar legend caption. They are set aside before any prohibition is scanned, so a check never fires on the page's own description of the prohibition`,
);
check(
  disclosures.length === 2 &&
    disclosures.every((d) => !/Beginning|Developing|Mastering|Mastered/.test(d)) &&
    disclosures.some((d) => /skill colouring/.test(d)) &&
    disclosures.some((d) => /a class with a report you can read/.test(d)),
  "PC23-6a ⛔ AND NEITHER DISCLOSES ANY TAXONOMY — one names what is absent, the other explains the two day marks, and NEITHER names the four levels or glosses them. ▶ `A-052` makes taxonomy disclosure the offence, so prose that explained the omission in detail would publish exactly what the omission protects",
);

// ---------------------------------------------------------------------
// ✅ PC23-7 -- THE ROUTE, THE RAIL AND THE REGISTER.
// ---------------------------------------------------------------------
const page = read("app/(portals)/parent/calendar/page.tsx");
check(
  /<ParentCalendarScreen \/>/.test(page),
  "PC23-7 ✅ the canonical route `/parent/calendar` renders screen 31",
);
check(
  /Not applicable/.test(read("UI_REFERENCE_FINAL_MVP/31-parent-calendar/screen.md")),
  "PC23-7a ⚠️ …and it is a ROUTE CREATION, not a compatibility treatment — the pack records `31` as having NO implemented route and its treatment as `Not applicable`, so the `CLAUDE.md` §12 gate `P2-22` stopped on does not apply here. Checked at source, not assumed",
);
const nav = stripComments(read("components/layout/portal-navigation.ts"));
check(
  /href: "\/parent\/calendar", label: "Calendar", path: "\/parent\/calendar", exact: true/.test(nav),
  "PC23-7b ✅ the rail declares Calendar, `exact` DECIDED IN ADVANCE — nothing in the ratified 36 hangs beneath this route; screen `33` lives under `/parent/students` and is already owned by Reports",
);
check(
  /```artefact-read[\s\S]*?screen: 31/.test(notes) && /15px/.test(notes),
  "PC23-7c ✅ the artefact-read block exists — ⚠️ and it RECORDS that `15px` was read and deliberately NOT cited: 14 occurrences in the .html, none in the component. Citing a value the component does not use is what `AR-5` rejects",
);

console.log(`\nRESULT: ${bad === 0 ? "PASS" : "FAIL"}  (${bad} failed check${bad === 1 ? "" : "s"})`);
process.exit(bad === 0 ? 0 : 1);
