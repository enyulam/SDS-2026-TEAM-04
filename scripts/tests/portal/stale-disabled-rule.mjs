#!/usr/bin/env node
// =====================================================================
// ⛔ THE DISABLED-WITH-A-REASON DEBT CHECK.
// =====================================================================
// ⚠️ WHY THIS EXISTS, MEASURED NOT HYPOTHESISED. `P2-14` built screen `22`
//    Management Edit Student and its route, and LEFT THE ONLY AFFORDANCE
//    THAT REACHES IT DISABLED. The control's own note said the destination
//    "WILL become live" -- and nothing made it so. The screen sat built and
//    unreachable for five phases until an Operator walk found it.
//
// ⛔ BUILT AND UNREACHABLE IS WORSE THAN UNBUILT: nothing reports it, every
//    proof passes, and the work looks done.
//
// ⚠️ THE PATTERN IS STILL RIGHT. `P2-10` ruled it: DISABLED says "not yet",
//    ABSENT says "not a thing", and only one of those is ever true. ▶ What
//    it lacked was a way to COLLECT ON THE DEBT. It discharged correctly at
//    `P2-18` only because the same phase happened to build the destination.
//
// THE RULE: a control that is disabled AND names a screen number in its
// stated reason is STALE the moment that screen's canonical route exists on
// disk. A reason that names no screen (e.g. "no notification path is in
// scope", `G-04`) carries no destination and is never stale by this test.
//
// ⛔ Exit code is the only verdict.
//
// Run: npm run prove:stale-disabled
// =====================================================================

import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
let bad = 0;
let total = 0;
const check = (ok, msg) => {
  total++;
  if (!ok) bad++;
  console.log(`${ok ? "PASS" : "FAIL"}    ${msg}`);
};

// ---------------------------------------------------------------------
// The corpus.
// ---------------------------------------------------------------------
const components = [];
(function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (entry.name.endsWith(".tsx")) components.push(p);
  }
})(join(ROOT, "features"));

/** Screen id -> canonical route, read from the ratified inventory. */
const index = readFileSync(join(ROOT, "UI_REFERENCE_FINAL_MVP", "SCREEN_INDEX.md"), "utf8");
const routeOf = new Map();
for (const m of index.matchAll(/^\|\s*`([0-9A-Z-]+)`\s*\|[^|]*\|[^|]*\|[^|]*\|\s*`([^`]+)`\s*\|/gm)) {
  if (!routeOf.has(m[1])) routeOf.set(m[1], m[2]);
}

/** Routes that exist on disk. */
const shipped = new Set();
(function rw(dir, url) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) rw(p, `${url}/${entry.name}`);
    else if (entry.name === "page.tsx") shipped.add(url || "/");
  }
})(join(ROOT, "app", "(portals)"), "");

const routeExists = (route) =>
  shipped.has(route) ||
  [...shipped].some(
    (s) =>
      s.split("/").length === route.split("/").length &&
      s
        .split("/")
        .every((seg, i) => seg === route.split("/")[i] || (seg.startsWith("[") && route.split("/")[i].startsWith("["))),
  );

// ---------------------------------------------------------------------
// ⛔ SD-0 -- NON-VACUITY. A corpus or an index that failed to load would
//    make every assertion below true of nothing.
// ---------------------------------------------------------------------
check(components.length > 30, `SD-0a  the component corpus is non-vacuous (${components.length} .tsx files)`);
check(routeOf.size >= 36, `SD-0b  the ratified route index parsed (${routeOf.size} screens)`);
check(shipped.size >= 30, `SD-0c  the shipped-route census is non-vacuous (${shipped.size} routes)`);

// ---------------------------------------------------------------------
// ⛔ SD-1 -- THE DETECTOR FIRES ON REAL PRESENT SOURCE (plan §60).
//    A pattern that has never matched anything is a hypothesis. Both the
//    button matcher and the screen-number extractor are shown working
//    before either is trusted to clear anything.
// ---------------------------------------------------------------------
const disabled = [];
for (const file of components) {
  const src = readFileSync(file, "utf8");
  for (const m of src.match(/<button[\s\S]{0,600}?<\/button>/g) ?? []) {
    if (!/\bdisabled\b/.test(m)) continue;
    const title = /title="([^"]*)"/.exec(m)?.[1] ?? "";
    const label = m.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    disabled.push({ file: file.slice(ROOT.length + 1).replace(/\\/g, "/"), title, label });
  }
}
check(
  disabled.length > 0,
  `SD-1a  CONTROL: the disabled-button detector FIRES on this corpus (${disabled.length} control(s) found)`,
);
check(
  /screen\s*`?(\d+)`?/i.exec("Editing a student arrives with screen 22")?.[1] === "22",
  "SD-1b  CONTROL: the screen-number extractor fires on the exact reason string that produced this rule",
);
check(
  /screen\s*`?(\d+)`?/i.exec("Reminders are not available yet — no notification path is in scope.") === null,
  "SD-1c  CONTROL: ...and does NOT fire on a reason that names no destination (`G-04`, notifications out of scope)",
);

// ---------------------------------------------------------------------
// ⛔ SD-2 -- THE RULE ITSELF.
// ---------------------------------------------------------------------
const resolve = (controls) => {
  const out = [];
  for (const control of controls) {
    const id = /screen\s*`?(\d+)`?/i.exec(control.title)?.[1];
    if (id === undefined) continue;
    const padded = id.padStart(2, "0");
    const route = routeOf.get(padded) ?? routeOf.get(id);
    if (route === undefined) continue;
    if (routeExists(route)) out.push({ ...control, id: padded, route });
  }
  return out;
};

/*
 * ⛔ SD-1d -- THE NEGATIVE CONTROL, AND SD-2 IS WORTHLESS WITHOUT IT.
 *
 * ⚠️ SD-2 asserts an EMPTY result, so it passes identically whether the rule
 * works or the resolution silently returns nothing — a broken extractor, a
 * mis-parsed index, a route matcher that never matches. ▶ This replays the
 * EXACT control that produced this rule, in its pre-fix form, and requires
 * the resolution to FLAG it. Only then does SD-2's emptiness mean anything.
 */
const replay = resolve([
  {
    file: "features/management/management-student-profile-screen.tsx",
    title: "Editing a student arrives with screen 22",
    label: "Edit",
  },
]);
check(
  replay.length === 1 && replay[0].id === "22" && replay[0].route.includes("/edit"),
  `SD-1d  NEGATIVE CONTROL: the ACTUAL pre-fix control is replayed and the resolution FLAGS it (screen ${
    replay[0]?.id ?? "—"
  } -> ${replay[0]?.route ?? "not resolved"}) — without this, SD-2's empty result proves nothing`,
);

const stale = resolve(disabled);
check(
  stale.length === 0,
  stale.length === 0
    ? "SD-2  ⛔ no disabled control names a screen whose canonical route already ships — every 'not yet' is still true"
    : `SD-2  ⛔ STALE DISABLED CONTROL(S): ${stale
        .map((s) => `${s.file} "${s.label}" names screen ${s.id}, whose route ${s.route} EXISTS`)
        .join(" | ")} — the destination shipped and the affordance did not open. Built and unreachable is worse than unbuilt`,
);

// ---------------------------------------------------------------------
// ⛔ SD-3 -- AND THE ONE THAT PRODUCED THIS RULE IS NOW LIVE.
//    A regression guard on the specific defect, so a later edit cannot
//    quietly re-disable it and leave SD-2 the only witness.
// ---------------------------------------------------------------------
const profile = readFileSync(
  join(ROOT, "features", "management", "management-student-profile-screen.tsx"),
  "utf8",
);
check(
  /href=\{`\/management\/students\/\$\{encodeURIComponent\(studentId\)\}\/edit`\}/.test(profile),
  "SD-3a  screen `18`'s `Edit` links to screen `22`'s canonical route, carrying the student id",
);
check(
  !/title="Editing a student arrives with screen 22"/.test(profile),
  "SD-3b  ...and the lapsed reason is GONE, not merely bypassed",
);

console.log(`\n${total - bad} PASS · ${bad} FAIL  (of ${total} checks)`);
process.exit(bad === 0 ? 0 : 1);
