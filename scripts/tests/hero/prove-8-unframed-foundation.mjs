#!/usr/bin/env node
// =====================================================================
// HERO PHASE 8 -- the UNFRAMED surfaces' foundation consistency
// =====================================================================
// ⚠️ PHASE 8 BUILT NO SURFACE, AND THAT IS THE FINDING -- the second time
// this batch, after Phase 5. Measured at HEAD, `trainer-report-editor.tsx`
// already sits on the same foundation as its sibling
// `trainer-report-review.tsx` on every probe. A delta table is a READING of
// a frame, not a measurement of the build (plan §12 item 10), and no change
// was manufactured to make a phase look productive.
//
// WHAT IT DELIVERS INSTEAD IS THE THING G-1 ACTUALLY NEEDS.
//
// `G-1` rules the three unframed hero surfaces -- Trainer Review & Approve,
// the Trainer wording editor and the Management wording editor -- as
// `VISUAL ACCEPTANCE: NOT APPLICABLE`. There is no artefact to accept them
// against, and the ruling's compensating requirement is that they "remain
// on their siblings' foundation -- the same tokens, primitives and shell".
//
// ⚠️ NOTHING ENFORCED THAT. For a framed screen a reference frame catches
// drift; these three have none, so an editor could quietly acquire its own
// shell, its own loading state or its own error panel and NO CHECK ANYWHERE
// WOULD NOTICE. That is the gap this closes: for the unframed surfaces, a
// mechanical consistency check is the ONLY guarantee that exists.
//
// ⛔ It is NOT a visual acceptance and must never be reported as one.
// `NOT APPLICABLE (G-1)` is a ruled disposition -- never a pass, never a gap.
//
// It touches no database, opens no transaction and writes nothing.
//
// Run: npm run prove:hero-8
// =====================================================================

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

/**
 * Each pair is an UNFRAMED surface and the FRAMED sibling whose foundation it
 * must share. The sibling is the reference precisely because it HAS a frame
 * and has been reconciled against it.
 */
const PAIRS = [
  {
    phase: "8",
    unframed: "features/trainer/trainer-report-editor.tsx",
    sibling: "features/trainer/trainer-report-review.tsx",
  },
];

/**
 * ⚠️ THE CONTROL. Plan §12 item 11 — a search is evidence only once it is
 * proven DISCRIMINATING. Every probe below is a boolean compared against a
 * boolean, so a probe set that were true of ANY file in this repository would
 * report "same foundation" for two surfaces that share nothing. This file is a
 * real surface that deliberately does NOT sit on the report-editor foundation;
 * if the probes cannot tell it apart, they are measuring nothing.
 */
const CONTROL = "features/parent/parent-reports-list.tsx";

/**
 * The foundation, as G-1 names it: shell, primitives and tokens. Each probe is
 * a thing that would DIVERGE VISIBLY if the surfaces drifted apart — a
 * different page shell, a different loading state, a different error panel, a
 * different panel vocabulary — not an incidental import.
 */
const PROBES = {
  "page shell (`page-grid`)": (s) => /className="page-grid/.test(s),
  "card primitive": (s) => /className="card/.test(s),
  "shared StatePanel (the non-disclosing error surface)": (s) => s.includes("StatePanel"),
  "shared LoadingSkeleton": (s) => s.includes("LoadingSkeleton"),
  "shared Button primitive": (s) => s.includes("@/components/ui/button"),
  "shared icon set": (s) => s.includes("@/components/ui/icon"),
  "the governed REPORT_PANEL_CONFIG panel vocabulary": (s) => s.includes("REPORT_PANEL_CONFIG"),
  "the governed port (`usePhysicalTestPort`)": (s) => s.includes("usePhysicalTestPort"),
  "the shared ResourceState discipline": (s) => s.includes("ResourceState"),
};

let bad = 0;
const check = (ok, msg) => {
  if (!ok) bad++;
  console.log(`${ok ? "PASS   " : "FAIL   "} ${msg}`);
};

for (const pair of PAIRS) {
  const a = readFileSync(join(ROOT, pair.unframed), "utf8");
  const b = readFileSync(join(ROOT, pair.sibling), "utf8");

  console.log(`\n${pair.unframed.split("/").pop()}  vs  ${pair.sibling.split("/").pop()}`);

  // ⚠️ NON-VACUITY FIRST, and it is not a formality here: every probe below
  // compares two booleans, and two EMPTY files would agree on all nine. The
  // sibling must actually exhibit the foundation before agreement means
  // anything.
  const siblingHas = Object.entries(PROBES).filter(([, fn]) => fn(b)).length;
  check(
    a.length > 500 && b.length > 500,
    `P8-1a: NON-VACUOUS — both files were read and are real (${a.length} / ${b.length} chars); two empty files would agree on every probe`,
  );
  check(
    siblingHas === Object.keys(PROBES).length,
    `P8-1b: NON-VACUOUS — the FRAMED sibling exhibits all ${Object.keys(PROBES).length} foundation markers (${siblingHas}), so agreement with it is meaningful`,
  );

  // ⚠️ DISCRIMINATION, before any agreement is reported as evidence.
  const control = readFileSync(join(ROOT, CONTROL), "utf8");
  const controlHas = Object.entries(PROBES).filter(([, fn]) => fn(control)).length;
  check(
    controlHas < Object.keys(PROBES).length,
    `P8-1c: DISCRIMINATING — the control surface (${CONTROL.split("/").pop()}) matches only ${controlHas}/${Object.keys(PROBES).length} probes, so the probe set separates foundations rather than being true of every file`,
  );

  for (const [label, fn] of Object.entries(PROBES)) {
    const inUnframed = fn(a);
    const inSibling = fn(b);
    check(
      inUnframed === inSibling,
      `P8-2: ${label} — unframed ${inUnframed ? "uses" : "does not use"}, sibling ${inSibling ? "uses" : "does not use"}`,
    );
  }

  // ⛔ The unframed surface must not have grown a shell of its own. These are
  // the specific shapes that would mean it had.
  const ownShell = [
    ["its own <html>/<body> or layout export", /export default function .*Layout|<html|<body/],
    ["a bespoke inline error panel instead of StatePanel", /outcome === "unauthorized"[\s\S]{0,200}<div/],
  ];
  for (const [label, pattern] of ownShell) {
    check(!pattern.test(a), `P8-3: ⛔ the unframed surface has NOT grown ${label}`);
  }
}

console.log(
  bad === 0
    ? "\nRESULT: PASS — the unframed surface shares its framed sibling's foundation on every probe.\n        ⛔ This is NOT a visual acceptance. G-1 records these surfaces as `NOT APPLICABLE`,\n           which is a RULED DISPOSITION — never a pass, and never a gap."
    : `\nRESULT: FAIL — ${bad} check(s) failed.`,
);
process.exit(bad === 0 ? 0 : 1);
