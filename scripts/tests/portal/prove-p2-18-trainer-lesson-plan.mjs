#!/usr/bin/env node
// =====================================================================
// PORTAL PHASE P2-18 -- screen `03` Trainer Lesson Plan.
//
// ⛔ ZERO SCHEMA. Named as empty lists: no migration, function, grant,
//    table, column, enum, policy, client table grant, write path or audit
//    string. §12.10 for the TENTH consecutive phase.
//
// ⛔ THE `KEY FOCUS` CHIPS ARE RULED IN SCOPE AND ARE NOT BUILT. The
//    Operator ruled 2026-08-17 that `G-3`'s surviving prohibition is about
//    POSITION and that screen `03` carries no governed focus line for the
//    chips to displace -- and ruled in the same breath that the schema is a
//    SEPARATE authorization. The chips need a column. This suite asserts
//    the refusal at every layer that could leak it.
//
// ⛔ EVERY DETECTOR CARRIES A POSITIVE CONTROL ON REAL SOURCE (plan §60):
//    a pattern that has never matched anything is a hypothesis, not a
//    detector. The frame's own `.html` is the control corpus here -- it
//    genuinely draws the chips, so a detector that cannot find them there
//    cannot be trusted to find them in a component either.
//
// ⛔ Exit code is the only verdict.
//
// Run: npm run prove:portal-p2-18
// =====================================================================

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { stripComments, MEASURED, UNMEASURED } from "./artefact-read-rule.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
let bad = 0;
let total = 0;
const check = (ok, msg) => {
  total++;
  if (!ok) bad++;
  console.log(`${ok ? "PASS" : "FAIL"}    ${msg}`);
};
const read = (rel) => readFileSync(join(ROOT, ...rel.split("/")), "utf8");

const screenSrc = read("features/trainer/trainer-lesson-plan-screen.tsx");
const screen = stripComments(screenSrc);
const routeSrc = read("features/trainer/trainer-lesson-plan-route.tsx");
const projSrc = read("server/modules/class-session/trainer-lesson-plan.ts");
const proj = stripComments(projSrc);
const contracts = read("lib/frontend/contracts/physical-test.ts");
const adapterDtos = read("server/modules/integration-adapter/adapter-dtos.ts");
const actionsSrc = read("server/modules/integration-adapter/participant-actions.ts");
const fixture = read("lib/frontend/fixtures/physical-test-fixture.ts");
const myClassesSrc = read("features/trainer/trainer-my-classes-screen.tsx");
const myClasses = stripComments(myClassesSrc);
const frameHtml = read(
  "UI_REFERENCE_FINAL_MVP/reference/Trainer - Lesson Plan/Trainer - Lesson Plan.html",
);
const notes = read("UI_REFERENCE_FINAL_MVP/03-trainer-lesson-plan/implementation-notes.md");

// =====================================================================
// ⛔ P18-0 -- NON-VACUITY. Every prohibition below scans a stripped string.
//    An empty string satisfies every prohibition scanned over it, which is
//    the `P2-21` defect that produced this leg. Floors are MEASURED, never
//    guessed (§60's sibling lesson from `P2-22`).
// =====================================================================
check(
  screen.length > 4000 && /export function TrainerLessonPlanScreen/.test(screen),
  `P18-0a  the screen source is non-vacuous and exports its component (stripped ${screen.length} chars)`,
);
check(
  proj.length > 3000 && /export async function readTrainerLessonPlanCore/.test(proj),
  `P18-0b  the projection source is non-vacuous and exports its reader (stripped ${proj.length} chars)`,
);
check(
  frameHtml.length > 30000,
  `P18-0c  the frame .html is non-vacuous -- it is the positive-control corpus (${frameHtml.length} chars)`,
);

// =====================================================================
// ⛔ P18-1 -- THE `G-3` REFUSAL, ASSERTED AT EVERY LAYER THAT COULD LEAK IT.
//
// ⚠️ The chips are RULED IN SCOPE. The refusal is not "the chips are
//    prohibited" -- it is "the chips have no lawful source", and the only
//    columns that exist are the trainer's governed ASSESSMENT data.
// =====================================================================

// --- POSITIVE CONTROL: the detectors fire on the frame, which draws them ---
const CHIP_CAPTION = /KEY\s*FOCUS/i;
const CHIP_SOURCE = /focus_chips|strength_chips/;
check(
  CHIP_CAPTION.test(frameHtml),
  "P18-1a  CONTROL: the KEY FOCUS caption detector FIRES on the frame .html, which draws the panel",
);
check(
  CHIP_SOURCE.test("observations.focus_chips") && CHIP_SOURCE.test(projSrc),
  "P18-1b  CONTROL: the assessment-source detector fires on a real column name AND on the citation that names it",
);

// --- THE REFUSAL ---
check(
  !CHIP_SOURCE.test(screen) &&
    !CHIP_SOURCE.test(proj) &&
    !CHIP_SOURCE.test(stripComments(contracts)) &&
    !CHIP_SOURCE.test(stripComments(adapterDtos)),
  "P18-1c  `G-3`: NO layer READS observations.focus_chips or strength_chips -- screen, projection, both DTO mirrors (comments stripped, so the citation that NAMES the decoy cannot fail this)",
);
check(
  !/\bkeyFocus\b|\bfocusChips\b|\bfocusPoints\b/.test(contracts.slice(contracts.indexOf("TrainerLessonPlanDto"), contracts.indexOf("TrainerLessonPlanDto") + 900)),
  "P18-1d  `G-3`: `TrainerLessonPlanDto` declares NO focus field -- the refusal is held in the TYPE, not by convention",
);
check(
  !/\bkeyFocus\b|\bfocusChips\b|\bfocusPoints\b/.test(screen),
  "P18-1e  `G-3`: the screen binds no focus field (comments stripped, so the citation cannot satisfy this)",
);
check(
  !/from\s+["']@\/server\/modules\/observation/.test(projSrc),
  "P18-1f  `G-3`: the projection imports nothing from the observation module -- the decoy is not one import away",
);

// --- THE RULING IS CITED WHERE A READER WILL LOOK: the TRIPLE CITATION ---
// ⚠️ SINGLE-LINE ANCHORS ONLY. The ruling is quoted inside a block comment,
// so every phrase in it is broken by ` * ` line prefixes -- a multi-word
// pattern spanning a wrap can never match. Measured, then narrowed (§60).
const RULING = /BUILD THE KEY FOCUS CHIPS|authorizes the chips, not the/;
check(RULING.test(screenSrc), "P18-1g  CITATION 1 of 3: the ruling and its reasoning are in the component header");
check(
  RULING.test(contracts) && RULING.test(adapterDtos),
  "P18-1h  CITATION 2 of 3: the ruling is on the DTO in BOTH mirrors, where the missing field is the enforcement",
);
check(RULING.test(notes), "P18-1i  CITATION 3 of 3 (pack half): the ruling is in the pack's implementation notes");

// =====================================================================
// ⛔ P18-2 -- THE SCREEN CARRIES NO GOVERNED PREVIOUS-SESSION-FOCUS LINE.
//    The ruling's third constraint. If a phase ever adds one, the chips
//    move or go -- so the absence must be asserted, not assumed.
// =====================================================================
// ⚠️ `previousSessionFocus` and `carriedFocus` are the names the roster
// actually uses. The first draft scanned for `previousFocus`, which matches
// nothing anywhere in this codebase -- a hypothesis, not a detector (§60).
const GOVERNED_FOCUS = /follow_up_notes|followUpNotes|previousSessionFocus|carriedFocus/;
check(
  GOVERNED_FOCUS.test(read("features/trainer/trainer-roster.tsx")),
  "P18-2a  CONTROL: the governed-focus detector FIRES on the roster, which is the surface that carries it",
);
check(
  !GOVERNED_FOCUS.test(screenSrc) && !GOVERNED_FOCUS.test(projSrc),
  "P18-2b  screen `03` carries NO governed carried-over focus -- neither component nor projection",
);

// =====================================================================
// ⛔ P18-3 -- THE SECOND SCHEMA STOP: `SLIDES & MATERIALS`.
//    `class_session_materials` exists but is `permission denied` for a
//    trainer and holds 0 rows. Not built, and NOT dressed in the frame's
//    "Slides not uploaded yet" copy, which would assert a false fact.
// =====================================================================
check(
  /SLIDES\s*&(amp;)?\s*MATERIALS/i.test(frameHtml) && /Slides not uploaded yet/.test(frameHtml),
  "P18-3a  CONTROL: both materials strings FIRE on the frame .html, which draws the panel and its empty copy",
);
check(
  !/class_session_materials/.test(screen) && !/class_session_materials/.test(proj),
  "P18-3b  the screen and projection read no materials table -- the stop is a stop, not a silent empty panel",
);
check(
  !/Slides not uploaded yet/.test(screen),
  "P18-3c  `P2-10` one layer along: the frame's 'not uploaded yet' copy is NOT used -- 'cannot see' is not 'not yet'",
);

// =====================================================================
// ⛔ P18-4 -- BOTH OMISSIONS ARE DISCLOSED ON THE PAGE (§12.12).
//    An omission a user can see is disclosed on the surface, not only in a
//    plan file.
// =====================================================================
check(
  /Not available yet/.test(screen),
  "P18-4a  the page carries a visible 'Not available yet' disclosure block",
);
check(
  /[Kk]ey focus points/.test(screen) && /slides/i.test(screen),
  "P18-4b  the disclosure NAMES both omitted panels rather than gesturing at them",
);
check(
  /not built/.test(screen),
  "P18-4c  the disclosure says the panels are NOT BUILT -- not that the data is empty",
);

// =====================================================================
// ⛔ P18-5 -- `Q-27` / `A-052`. Screen `03` is Trainer-facing and not
//    rating-bearing; no competency vocabulary may appear.
// =====================================================================
const LABELS = /\b(Beginning|Developing|Mastering|Mastered)\b/;
check(
  LABELS.test("rated as Developing today"),
  "P18-5a  CONTROL: the competency-label detector fires on a real label string",
);
check(
  !LABELS.test(screen) && !LABELS.test(proj),
  "P18-5b  no competency label appears in the screen or the projection (pack: 'Not rating-bearing.')",
);
check(
  !/\brating\b|\bratings\b/i.test(screen),
  "P18-5c  the screen surfaces no rating of any kind",
);

// =====================================================================
// ⛔ P18-6 -- THE HERO `0B` RULE. NULL means NOT RECORDED: omit, never
//    fabricate, never render an empty string as a fact.
// =====================================================================
check(
  /lesson\.lessonNumber !== null/.test(screen),
  "P18-6a  the `LESSON n` pill is omitted when the number is not recorded -- never numbered by array index",
);
check(
  !/\.map\(\([^)]*,\s*(i|idx|index)\)\s*=>/.test(screen) ||
    !/LESSON \{/.test(screen.slice(screen.indexOf("LESSON"))),
  "P18-6b  no lesson number is derived from a map index anywhere in the screen",
);
check(
  /plan\.termLabel !== null/.test(screen) && /scheduleSummary/.test(screen),
  "P18-6c  the term and schedule lines are conditional on being recorded",
);
check(
  /filter\(\([^)]*\): [^=]*=> [a-zA-Z.]+ !== null\)/.test(screen),
  "P18-6d  composite lines drop their unrecorded parts rather than emitting a bare separator",
);

// =====================================================================
// ⛔ P18-7 -- `C-4d` CLIENT-SIDE. A rejected or empty read must not resolve
//    to a governed state. Ruled after `P2-22`; asserted here.
// =====================================================================
check(
  /kind === "failed"/.test(screen) && /StatePanel/.test(screen),
  "P18-7a  a failed read renders the failure panel, never an empty lesson list",
);
check(
  /plan === null/.test(screen),
  "P18-7b  a null plan is its OWN branch -- distinct from a module with zero lessons",
);
check(
  /No sessions are scheduled for \{plan\.displayLabel\}/.test(screen),
  "P18-7c  `Q-7`: the empty state NAMES the module it is empty for, so it cannot read as a failed read",
);

// =====================================================================
// ⛔ P18-8 -- AUTHORIZATION IS RESOLVED IN THE DATABASE, NEVER FROM THE
//    QUERY STRING (`ADR-4`, `A-045`).
// =====================================================================
check(
  /searchParams\.get\("module"\)/.test(routeSrc),
  "P18-8a  the route reads `?module=` and passes it as a REQUEST, not as an authority",
);
check(
  /class_session_assignments/.test(projSrc),
  "P18-8b  the projection's spine is the trainer's OWN assignment rows (`A-016`)",
);
check(
  !/\brole\b\s*===|user_metadata|app_metadata|jwt/i.test(projSrc),
  "P18-8c  the projection reads no role, claim or token -- reach is decided by RLS",
);

// =====================================================================
// ⛔ P18-9 -- THE FIXTURE REFUSES. A manufactured lesson plan would make the
//    two panels this phase REPORTS AS BLOCKED look built.
// =====================================================================
const fxSlice = fixture.slice(fixture.indexOf("readTrainerLessonPlan"), fixture.indexOf("readTrainerLessonPlan") + 400);
check(
  fxSlice.length > 100,
  `P18-9a  the fixture method was located and sliced (${fxSlice.length} chars) -- the legs below are not scanning ""`,
);
check(
  /outcome: "unavailable"/.test(fxSlice),
  "P18-9b  the fixture returns `unavailable` -- it manufactures no lesson plan",
);
check(
  !/lessonTitle|lessonNumber|scheduleSummary|termLabel/.test(fxSlice),
  "P18-9d  the fixture's lesson-plan method builds NO object at all -- it names no lesson field",
);

// =====================================================================
// ⛔ P18-10 -- SCREEN `02`'s CONTROL IS NOW ENABLED. `P2-17` shipped it
//    DISABLED WITH A REASON rather than absent; `P2-18` built the
//    destination, so the reason lapsed. The pattern discharging is the
//    point -- assert it, or a later phase will not know it happened.
// =====================================================================
check(
  /\/trainer\/my-classes\/lesson-plan\?module=/.test(myClasses),
  "P18-10a  screen `02`'s `Lesson plan` control links to the canonical route with the module id",
);
check(
  !/disabled\s*\n?\s*title="Lesson plans open/.test(myClassesSrc),
  "P18-10b  the disabled attribute and its lapsed reason are GONE from that control",
);
check(
  /ENABLED AT `P2-18`/.test(myClassesSrc),
  "P18-10c  the lapse is recorded at the control, so the discharge is legible where the pattern lived",
);

// =====================================================================
// ⛔ P18-11 -- ROUTE AND REGISTER.
// =====================================================================
check(
  existsSync(join(ROOT, "app", "(portals)", "trainer", "my-classes", "lesson-plan", "page.tsx")),
  "P18-11a  the canonical route `/trainer/my-classes/lesson-plan` exists on disk",
);
check(
  MEASURED.includes("03") && !UNMEASURED.includes("03"),
  "P18-11b  screen `03` moved UNMEASURED -> MEASURED, which is the only exit that list has",
);
check(
  /```artefact-read[\s\S]*screen: 03/.test(notes),
  "P18-11c  the pack carries its artefact-read citation block",
);

// =====================================================================
// ⛔ P18-12 -- ZERO SCHEMA, NAMED AS AN EMPTY LIST.
// =====================================================================
check(
  !/CREATE (TABLE|TYPE|POLICY|FUNCTION)|ALTER TABLE|GRANT /i.test(projSrc + screenSrc + actionsSrc),
  "P18-12a  no migration, function, grant, table, column, enum, policy, client grant, write path or audit string",
);
check(
  !/\.insert\(|\.update\(|\.delete\(|\.upsert\(/.test(projSrc + screenSrc),
  "P18-12b  the phase is read-only: no insert, update, delete or upsert on any layer",
);

console.log(`\n${23 - bad} PASS · ${bad} FAIL`);
process.exit(bad === 0 ? 0 : 1);
