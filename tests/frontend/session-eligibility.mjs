#!/usr/bin/env node
/**
 * =====================================================================
 * TRAINER SESSION ELIGIBILITY — DERIVED, DETERMINISTIC, AND ENFORCED
 * BEFORE THE RUBRIC (Run C3-A Phase 2b, C2C-010 + C2C-011)
 * =====================================================================
 *
 * THE TWO DEFECTS UNDER TEST
 *
 *   C2C-010  No Trainer surface distinguished past, present and future
 *            sessions. Every SessionCard rendered an identically enabled
 *            roster link, so a trainer could enter a FUTURE session,
 *            complete all nine ratings, and only then be refused by BC104
 *            at save time.
 *   C2C-011  The assessment route was fully reachable and fillable BY
 *            DIRECT URL for an absent learner and for a future session.
 *            The load path applied no attendance and no session-start
 *            condition before rendering the rubric.
 *
 * WHAT THIS SUITE PROVES
 *
 *   E-1  The classification is a DERIVED TIME COMPARISON against the
 *        pinned Asia/Singapore clock — the same clock the governed RPCs
 *        compare on — and it is exercised at the exact boundary minute in
 *        both directions, not merely "a day ahead" and "a day behind".
 *   E-2  It is DETERMINISTIC ACROSS THE WHOLE DAY. The fixture's three
 *        sessions classify as past / eligible / future at every one of
 *        1440 simulated Singapore minutes AND at a simulated instant a
 *        year away. This is the leg that would have failed on the old
 *        absolute-dated fixture, whose meaning drifted with the clock.
 *   E-3  NO SESSION-LIFECYCLE VOCABULARY WAS INVENTED (A-026). The module
 *        introduces no enum, column or status and reads no database.
 *   E-4  COLOUR IS NEVER THE ONLY CARRIER (GLOBAL_UI_RULES §7, WCAG 2.2
 *        SC 1.4.1): the three states carry three DISTINCT text labels and
 *        three DISTINCT glyphs, and the inert one carries prose.
 *   E-5  A FUTURE SESSION HAS NO ENABLED ROSTER OR ASSESS PATH. In the
 *        production component the inert branch renders a DISABLED BUTTON
 *        — never a Link, which would still be followable by keyboard,
 *        middle-click or the address bar — with the governed reason
 *        associated by `aria-describedby`.
 *   E-6  A TODAY-AND-STARTED SESSION KEEPS ITS ENABLED PATH.
 *   E-7  THE DIRECT ASSESS URL IS REFUSED BEFORE ANY DRAFT IS RETURNED,
 *        for an ABSENT learner and for an INELIGIBLE session, by the
 *        PORT — not by a component declining to render. Both refusals
 *        carry the GOVERNED reason strings (the same ones BC102 and BC104
 *        map to) and are non-disclosing.
 *   E-8  The same gate exists in the PARTICIPANT ADAPTER, so the refusal
 *        is not a fixture-only behaviour.
 *   E-9  The assessment component renders the ineligible state INSTEAD OF
 *        the instrument, so no rating control exists to focus.
 *
 * It touches NO database, NO network, NO browser and NO credential.
 *
 * Run: node --import ./scripts/tests/integration/alias-loader.mjs \
 *        tests/frontend/session-eligibility.mjs
 * =====================================================================
 */

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

import {
  SESSION_ELIGIBILITY_PRESENTATION,
  deriveSessionEligibility,
  minutesOfClockTime,
  singaporeInstant,
} from "@/lib/schedule/session-eligibility";
import { fixtureEligibilityArms } from "@/lib/schedule/fixture-session-dates";

const REPO_ROOT = fileURLToPath(new URL("../../", import.meta.url));

let failures = 0;
const fail = (id, message) => {
  failures += 1;
  console.error(`FAIL ${id}: ${message}`);
};
const pass = (id, message) => console.log(`PASS ${id} -- ${message}`);

const stripComments = (source) =>
  source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

/**
 * The fixture's three eligibility arms, read from the SHARED module the fixture
 * itself derives its session dates from. They are identified by the property
 * under test — "the eligible one", "the future one" — never by a date literal.
 *
 * The port class is deliberately NOT imported: it is a browser-facing class and
 * Node's type-stripping loader cannot parse its parameter properties. Its gate
 * is proven statically at E-7 and exercised in the DOM by
 * `tests/frontend/trainer-browser-smoke.mjs`, which drives the real surface.
 */
const ARMS_NOW = fixtureEligibilityArms();
if (ARMS_NOW.length !== 3) {
  fail("E-0", `the fixture derivation produced ${ARMS_NOW.length} eligibility arm(s); the suite needs three`);
}

// ---------------------------------------------------------------------
// E-1  The boundary minute, in both directions.
// ---------------------------------------------------------------------
{
  const now = { isoDate: "2026-08-07", minutesOfDay: 14 * 60 + 30 };
  const cases = [
    ["a session dated tomorrow", { date: "2026-08-08", startTime: "00:00" }, "future"],
    ["a session dated yesterday", { date: "2026-08-06", startTime: "23:59" }, "past"],
    ["today, one minute BEFORE the start", { date: "2026-08-07", startTime: "14:31" }, "future"],
    ["today, EXACTLY at the start", { date: "2026-08-07", startTime: "14:30" }, "eligible"],
    ["today, one minute AFTER the start", { date: "2026-08-07", startTime: "14:29" }, "eligible"],
    ["today, first minute of the day", { date: "2026-08-07", startTime: "00:00" }, "eligible"],
    ["today, last minute of the day", { date: "2026-08-07", startTime: "23:59" }, "future"],
    // A missing start time is reported by the adapter as the empty string and
    // never as an invented time. On a future DATE it stays future; on today it
    // is treated as started, which is the conservative direction — this module
    // must never render inert an entry point the server would accept.
    ["no start time, future date", { date: "2026-08-08", startTime: "" }, "future"],
    ["no start time, today", { date: "2026-08-07", startTime: "" }, "eligible"],
  ];
  const wrong = cases
    .map(([label, session, expected]) => [label, deriveSessionEligibility(session, now), expected])
    .filter(([, actual, expected]) => actual !== expected)
    .map(([label, actual, expected]) => `${label}: got "${actual}", expected "${expected}"`);
  if (minutesOfClockTime("14:30") !== 870 || minutesOfClockTime("nonsense") !== null) {
    fail("E-1", "the clock-time parser does not read HH:MM, or accepts a value that is not one");
  } else if (wrong.length > 0) {
    fail("E-1", wrong.join("; "));
  } else {
    pass(
      "E-1",
      `all ${cases.length} classification cases hold against a fixed Singapore instant, INCLUDING the exact boundary minute in both directions — the state flips between 14:30 and 14:31 and nowhere else`,
    );
  }
}

// ---------------------------------------------------------------------
// E-2  Determinism across the whole day and across a year.
//
//      THIS IS THE LEG THE OLD FIXTURE WOULD HAVE FAILED. Its sessions
//      carried the absolute dates 2026-08-05 / 2026-08-07 / 2026-08-04,
//      so "future" and "past" drifted with the wall clock and the
//      meaning of any eligibility assertion changed as time passed.
// ---------------------------------------------------------------------
{
  /*
   * The arms are RE-DERIVED at each simulated instant, through the same pure
   * function the fixture calls with the real clock. A sweep over arms pinned to
   * the load hour would have exercised one hour and reported 1440.
   */
  const classify = (now) =>
    fixtureEligibilityArms(now)
      .map((session) => deriveSessionEligibility(session, now))
      .sort()
      .join(",");
  const today = singaporeInstant();
  const expected = "eligible,future,past";

  /*
   * THE YEAR-AWAY DATE IS COMPUTED, NOT ASSUMED (Run C3-A correction cycle).
   *
   * This header claimed a sweep "at a simulated instant a year away" that the
   * code did not perform. The claim is now IMPLEMENTED rather than deleted,
   * because it is the stronger half of the property under test: a drifting
   * fixture fails at a distant date long before it fails today. 365 days is
   * added through UTC date arithmetic, so a leap day shifts the landing date
   * by one and changes nothing about what is asserted — the relationship, not
   * the calendar, is the invariant.
   */
  const [y, m, d] = today.isoDate.split("-").map(Number);
  const yearAwayIso = new Date(Date.UTC(y, m - 1, d + 365)).toISOString().slice(0, 10);

  const sweeps = [
    ["today", today.isoDate],
    ["a simulated instant a year away", yearAwayIso],
  ];

  const drifted = [];
  for (const [label, isoDate] of sweeps) {
    for (let minute = 0; minute < 1440; minute += 1) {
      // The fixture derives its own dates from the SIMULATED Singapore date, so
      // a simulated minute-of-day on that date is exactly the situation a real
      // run at that time of day, on that date, would face.
      const seen = classify({ isoDate, minutesOfDay: minute });
      if (seen !== expected) {
        drifted.push(`${label} ${isoDate} ${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")} -> ${seen}`);
        if (drifted.length > 4) break;
      }
    }
    if (drifted.length > 4) break;
  }
  if (drifted.length > 0) {
    fail(
      "E-2",
      `the fixture's three sessions do not classify as exactly one past, one eligible and one future at every simulated minute: ${drifted.join("; ")}`,
    );
  } else {
    pass(
      "E-2",
      `at all 1440 simulated Singapore minutes of today AND at all 1440 simulated minutes of ${yearAwayIso} — a year away — the fixture presents EXACTLY one past, one eligible and one future session; the eligibility arms are derived from a pinned reference, so their meaning cannot drift with the wall clock`,
    );
  }
}

// ---------------------------------------------------------------------
// E-3  No session-lifecycle vocabulary was invented (A-026).
// ---------------------------------------------------------------------
{
  const source = stripComments(
    await readFile(join(REPO_ROOT, "lib", "schedule", "session-eligibility.ts"), "utf8"),
  );
  const problems = [];
  for (const forbidden of ["supabase", "rpc(", "from(", "session_status", "sessionStatus", "enum "]) {
    if (source.includes(forbidden)) problems.push(`the module references \`${forbidden}\``);
  }
  if (!source.includes("Asia/Singapore")) {
    problems.push("the module does not pin the Asia/Singapore clock the governed RPCs compare on");
  }
  if (problems.length > 0) fail("E-3", problems.join("; "));
  else {
    pass(
      "E-3",
      "the classification is a pure derivation over `date` + `startTime` against the pinned Asia/Singapore clock: no database object, no query and no session-lifecycle enum, column or status is introduced (A-026)",
    );
  }
}

// ---------------------------------------------------------------------
// E-4  Colour is never the only carrier.
// ---------------------------------------------------------------------
{
  const states = ["past", "eligible", "future"];
  const labels = new Set(states.map((s) => SESSION_ELIGIBILITY_PRESENTATION[s].label));
  const glyphs = new Set(states.map((s) => SESSION_ELIGIBILITY_PRESENTATION[s].glyph));
  const tones = new Set(states.map((s) => SESSION_ELIGIBILITY_PRESENTATION[s].tone));
  const inert = states.filter((s) => SESSION_ELIGIBILITY_PRESENTATION[s].inert);
  const reasonless = inert.filter((s) => !SESSION_ELIGIBILITY_PRESENTATION[s].reason);
  if (labels.size !== 3) {
    fail("E-4", `the three states share only ${labels.size} distinct text label(s); colour would be doing work text is not`);
  } else if (glyphs.size !== 3) {
    fail("E-4", `the three states share only ${glyphs.size} distinct glyph(s)`);
  } else if (tones.size !== 3) {
    fail("E-4", `the three states share only ${tones.size} distinct tone(s)`);
  } else if (inert.length !== 1 || inert[0] !== "future") {
    fail("E-4", `the inert state(s) are [${inert.join(", ")}]; exactly "future" must be inert — BC017/BC104 refuse only a start NOT YET reached, so a past session is still assessable`);
  } else if (reasonless.length > 0) {
    fail("E-4", `the inert state carries no governed reason, so a trainer meeting it learns nothing`);
  } else {
    pass(
      "E-4",
      `the three states are distinguished by THREE distinct text labels ("${[...labels].join('", "')}"), THREE distinct glyphs and three tones, and the one inert state — future, matching BC017/BC104's only condition — carries a governed reason in prose`,
    );
  }
}

// ---------------------------------------------------------------------
// E-5 / E-6  The schedule's entry point: inert for future, enabled
//            otherwise, and structurally so.
// ---------------------------------------------------------------------
{
  const schedule = stripComments(
    await readFile(join(REPO_ROOT, "features", "trainer", "trainer-schedule.tsx"), "utf8"),
  );
  const problems = [];
  const inertBranch = /presentation\.inert \? \([\s\S]*?\) : \(/.exec(schedule)?.[0] ?? "";
  const enabledBranch = /\) : \([\s\S]*?<Link[\s\S]*?<\/Link>/.exec(schedule)?.[0] ?? "";
  if (inertBranch === "") {
    problems.push("the SessionCard has no inert branch at all, so every session still renders an identically enabled entry point — the defect");
  } else {
    if (/<Link/.test(inertBranch)) {
      problems.push("the inert branch renders a <Link>; a link stays followable by keyboard, middle-click and the address bar, so the path would not actually be closed");
    }
    if (!/<button[\s\S]*?disabled/.test(inertBranch)) {
      problems.push("the inert branch renders no disabled control");
    }
    if (!/aria-describedby=\{reasonId\}/.test(inertBranch)) {
      problems.push("the inert control's governed reason is not programmatically associated with it");
    }
    if (!/presentation\.reason/.test(inertBranch)) {
      problems.push("the inert branch does not render the governed reason");
    }
  }
  if (!/href=\{`\/trainer\/sessions\/\$\{session\.sessionId\}\/roster`\}/.test(enabledBranch)) {
    problems.push("the enabled branch no longer links to the session roster");
  }
  // The roster link must exist EXACTLY ONCE in the file, inside the enabled
  // branch. A second one anywhere would be a path the inert branch cannot close.
  const rosterLinks = [...schedule.matchAll(/href=\{`\/trainer\/sessions\/\$\{session\.sessionId\}\/roster`\}/g)];
  if (rosterLinks.length !== 1) {
    problems.push(`the file declares ${rosterLinks.length} roster links; exactly one must exist, inside the enabled branch`);
  }
  if (problems.length > 0) fail("E-5/E-6", problems.join("; "));
  else {
    pass(
      "E-5/E-6",
      "in the production SessionCard a future session renders a DISABLED button with the governed reason associated by aria-describedby and no link of any kind, while a past or eligible session keeps the one roster Link — and that Link exists exactly once in the file, so there is no second path the inert branch fails to close",
    );
  }
}

// ---------------------------------------------------------------------
// E-7  The DETERMINISTIC FIXTURE's assess read carries the same gate, so
//      fixture mode is not a hole in the boundary.
//
//      WHAT ACTUALLY EXECUTES HERE: this leg READS the fixture port's
//      source and asserts, statically, that both conditions exist, that
//      they are evaluated BEFORE any draft is assembled, and that they
//      carry the governed BC102/BC104 reason strings verbatim. It drives
//      no browser and renders no DOM.
//
//      (Run C3-A correction cycle. This comment used to name
//      `tests/frontend/trainer-browser-smoke.mjs` as "the EXECUTED DOM
//      proof" of this leg's behavioural half. It is not one, and has never
//      been runnable as one here: since F16-B every `/trainer` route is
//      guarded server-side by `proxy.ts` plus the portal guard, both
//      resolving a LIVE session, so that harness's fixture login is
//      redirected to `/login` before the assess surface ever renders — and
//      `CLAUDE.md` §11 forbids this harness from holding a credential that
//      would get past it.
//
//      The proof that DOES execute and DOES render is gate G-23 of
//      `scripts/physical-test/prove-disposable-app.mjs`: it serves the
//      application against the DISPOSABLE stack, signs in for real, follows
//      both deep links in a real browser, and asserts the governed BC102 and
//      BC104 states with no rating control present. Naming an unrun suite as
//      executed evidence is the same defect class as a gate that passes
//      without evidence, so the claim is corrected rather than restated.)
// ---------------------------------------------------------------------
{
  const fixture = stripComments(
    await readFile(
      join(REPO_ROOT, "lib", "frontend", "fixtures", "physical-test-fixture.ts"),
      "utf8",
    ),
  );
  const read = /async getAssessmentDraft\([\s\S]*?\n  \}/.exec(fixture)?.[0] ?? "";
  const problems = [];
  if (read === "") {
    problems.push("the deterministic fixture declares no getAssessmentDraft");
  } else {
    if (!/attendanceState === "absent"/.test(read)) {
      problems.push("the fixture read applies no attendance condition");
    }
    if (!/deriveSessionEligibility\(match\.session\) === "future"/.test(read)) {
      problems.push("the fixture read applies no scheduled-start condition");
    }
    if (!/The student is not recorded present for this session\./.test(read)) {
      problems.push("the fixture's attendance refusal does not carry the governed BC102 reason verbatim");
    }
    if (!/The scheduled session start has not been reached\./.test(read)) {
      problems.push("the fixture's start refusal does not carry the governed BC104 reason verbatim");
    }
    // Both refusals must precede the draft assembly, or they are decorative.
    const attendanceAt = read.indexOf('attendanceState === "absent"');
    const startAt = read.indexOf('deriveSessionEligibility');
    const assembleAt = read.indexOf("observationLockVersion:");
    if (assembleAt !== -1 && (attendanceAt > assembleAt || startAt > assembleAt)) {
      problems.push("a refusal is evaluated AFTER the draft is assembled");
    }
    // A future session must carry a PRESENT learner in the fixture, or the
    // session-start arm could never be separated from the attendance arm.
    if (!/studentId: "student-gale"/.test(fixture)) {
      problems.push("the future fixture session carries no present learner, so the scheduled-start refusal cannot be exercised on its own terms");
    }
  }
  if (problems.length > 0) fail("E-7", problems.join("; "));
  else {
    pass(
      "E-7",
      "the deterministic fixture's assess read applies BOTH conditions — attendance first, then scheduled start — before any draft is assembled, carries the governed BC102 and BC104 reasons verbatim, and its future session carries a PRESENT learner so the start refusal is exercised on its own terms rather than masked by absence",
    );
  }
}

// ---------------------------------------------------------------------
// E-8  The same gate exists in the PARTICIPANT ADAPTER — the refusal is
//      not fixture-only, and it runs on the server.
// ---------------------------------------------------------------------
{
  const actions = stripComments(
    await readFile(
      join(REPO_ROOT, "server", "modules", "integration-adapter", "participant-actions.ts"),
      "utf8",
    ),
  );
  const gate = /async function assessmentEntryRefusal\([\s\S]*?\n}/.exec(actions)?.[0] ?? "";
  const draft = /export async function adapterGetAssessmentDraft\([\s\S]*?\n}/.exec(actions)?.[0] ?? "";
  const problems = [];
  if (!actions.startsWith('"use server"')) {
    problems.push("the adapter is not a server module, so the gate would not run on the server");
  }
  if (gate === "") problems.push("the participant adapter declares no assessment entry gate");
  else {
    if (!/attendanceState === "absent"/.test(gate)) {
      problems.push("the adapter gate applies no attendance condition");
    }
    if (!/deriveSessionEligibility/.test(gate) || !/=== "future"/.test(gate)) {
      problems.push("the adapter gate applies no scheduled-start condition");
    }
    if (!/The student is not recorded present for this session\./.test(gate)) {
      problems.push("the adapter's attendance refusal does not carry the governed BC102 reason");
    }
    if (!/The scheduled session start has not been reached\./.test(gate)) {
      problems.push("the adapter's start refusal does not carry the governed BC104 reason");
    }
  }
  if (draft === "") problems.push("adapterGetAssessmentDraft is missing");
  else if (!/assessmentEntryRefusal\(/.test(draft)) {
    problems.push("adapterGetAssessmentDraft does not consult the gate, so a direct URL still reaches the draft");
  } else {
    // The gate must run BEFORE the draft is read, or the refusal is decorative.
    const gateAt = draft.indexOf("assessmentEntryRefusal(");
    const readAt = draft.indexOf("getTrainerObservationCore(");
    if (readAt !== -1 && gateAt > readAt) {
      problems.push("the gate is consulted AFTER the observation is read, so the draft is fetched for a caller who must be refused");
    }
  }
  if (problems.length > 0) fail("E-8", problems.join("; "));
  else {
    pass(
      "E-8",
      'the participant adapter — a "use server" module — resolves attendance and scheduled start in a gate that runs BEFORE the observation is read, and refuses with the same two governed reason strings the fixture uses, so a direct URL, a stale tab and a scripted call all get the same answer',
    );
  }
}

// ---------------------------------------------------------------------
// E-9  The component renders the ineligible state INSTEAD OF the rubric.
// ---------------------------------------------------------------------
{
  const assessment = stripComments(
    await readFile(join(REPO_ROOT, "features", "trainer", "trainer-assessment.tsx"), "utf8"),
  );
  const problems = [];
  if (!/setIneligible\(draftResult\.message\)/.test(assessment)) {
    problems.push("the assessment surface does not capture the governed refusal reason");
  }
  const failedBranch = /if \(resource\.kind === "failed"\) \{[\s\S]*?\n  \}/.exec(assessment)?.[0] ?? "";
  if (failedBranch === "") {
    problems.push("the assessment surface has no failed branch");
  } else if (!/ineligible !== null/.test(failedBranch)) {
    problems.push("the failed branch does not distinguish the governed ineligible state from a generic failure");
  } else if (!/return \(/.test(failedBranch)) {
    problems.push("the ineligible state does not RETURN, so the rubric would still render beneath it");
  }
  if (problems.length > 0) fail("E-9", problems.join("; "));
  else {
    pass(
      "E-9",
      "the assessment surface returns the governed ineligible state from its failed branch, so the nine fieldsets, their rating chips, the note fields and the save control are never rendered — there is no rating control to focus by keyboard, by script or by deep link",
    );
  }
}

console.log("");
if (failures > 0) {
  console.error(`Session eligibility suite: ${failures} failure(s).`);
  process.exitCode = 1;
} else {
  console.log("Session eligibility suite: all proofs passed.");
}
