// =====================================================================
// THE ARTEFACT-READ RULE -- can a phase DEMONSTRATE it opened the frame?
// =====================================================================
// ⛔ THE DEFECT IT CLOSES (Operator ruling, 2026-08-13):
//
//      "The rule was in §3 of the plan you were executing, and no proof
//       measures §3 compliance. That is the gap. CLOSE IT FIRST. A phase
//       must be able to DEMONSTRATE it opened the .png, the .html and the
//       numbered pack's screen.md -- NOT ASSERT IT."
//
//   Four consecutive phases (`12`, `13`, `26`, `27`) derived their layouts
//   from the reference pack's PROSE NOTE. `PORTAL_COMPLETION_PLAN.md` §3
//   already required all three artefacts. Every phase was reported complete
//   with a full gate table and accepted. Nothing measured the requirement,
//   so nothing caught it for four phases running.
//
// ---------------------------------------------------------------------
// ⚠️ WHAT THIS PROVES, AND WHAT IT CANNOT -- STATED BEFORE THE CODE
// ---------------------------------------------------------------------
//
//   `.html`      ✅ PROVABLE. It is the only artefact carrying COMPUTED
//                VALUES (`326px`, `10.50px`, `13px` radii, `2px` gaps).
//                A phase cites values; this rule verifies each one occurs
//                LITERALLY in that pack's `.html` AND in the built
//                component. ▶ You cannot cite a substring of a file you
//                have not opened, and you cannot USE it without deriving
//                from it. That is a demonstration, not a claim.
//
//   `screen.md`  ✅ PROVABLE, same mechanism -- an exact quotation that
//                must occur in the numbered pack's `screen.md`.
//
//   `.png`       ⛔ **NOT MECHANICALLY PROVABLE, AND THIS RULE DOES NOT
//                PRETEND OTHERWISE.** An image leaves no derivable textual
//                residue. `atime` is disabled by default on this platform,
//                is written by any tool that touches the file (including a
//                checker), and proves "something opened it", never "a
//                session looked at it". A declaration would be exactly the
//                "check that only records a claim" the Operator refused.
//
//                ▶ THE HONEST BOUND: the `.html` in this corpus is a full
//                render of the same frame, so it carries everything the
//                `.png` shows PLUS the computed values. Proving the `.html`
//                was read therefore covers the frame's CONTENT and
//                GEOMETRY. What remains unproven is narrow and real: the
//                `.png` is the tie-break authority where the render and the
//                image DISAGREE (font fallback, clipping, overflow), and
//                nothing here can prove a session consulted it for that.
//                **Reported as a residual limit at every boundary.**
//
// ---------------------------------------------------------------------
// ⛔ NOT BACK-FILLED, DELIBERATELY.
// ---------------------------------------------------------------------
//   Screens built before this rule existed are listed in `UNMEASURED` and
//   are NOT given citations. Back-filling would mean opening the `.html`
//   TODAY and recording it as though the building phase had -- fabricating
//   a historical record, which is the precise failure this rule exists to
//   prevent. A screen leaves `UNMEASURED` only by being REBUILT under the
//   rule.
// =====================================================================

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const PACK_ROOT = "UI_REFERENCE_FINAL_MVP";
const REF_ROOT = join(PACK_ROOT, "reference");

/**
 * Screens NOT measured by this rule -- either built before it existed, or
 * not built at all yet. ⛔ Never back-fill one: a screen leaves this list by
 * being BUILT OR REBUILT under the rule, never by being annotated.
 */
export const UNMEASURED = [
  "01", "02", "03", "04", "05", "06", "07", "08", "09", "10",
  // ⛔ `17` LEFT THIS LIST AT `P2-8` — by being BUILT UNDER THE RULE, which is
  // the only exit this list has. It was never annotated out.
  "15", "16", "18", "19", "20", "21", "22", "23", "24", "28",
  "29", "30", "31", "32", "33", "AUTH-01", "AUTH-02", "AUTH-03",
];

/** Screens that MUST carry a citation block. */
export const MEASURED = ["11", "12", "13", "14", "17", "25", "26", "27"];

/*
 * ⛔ `KNOWN-RED-AR-4-14` -- OPERATOR RULING, 2026-08-14. A THIRD STATUS.
 *
 * ⚠️ `AR-4-14` FAILS ON PURPOSE AND MUST KEEP FAILING. It is **not a defect**
 *    (nothing is wrong with screen `14`, its citation or its build) and it is
 *    **not a waiver** (the leg still runs, still fails, still reports).
 *
 * ▶ THE MEASURED CAUSE: `AR-4` requires >=2 FRACTIONAL values, and the
 *   `Management - Lesson Plan Management` frame carries exactly THREE --
 *   `10.50px` (`Management Portal`) and `13.50px` (sidebar nav) belong to the
 *   SHARED PORTAL SHELL, leaving `11.50px` (the breadcrumb) as the only one
 *   inside screen `14`'s own component. **That is a property of the FRAME.**
 *
 * ⛔ BOTH ROUTES TO GREEN WERE REFUSED, and the reasons are the ruling:
 *    1. Citing icon-internal geometry (`7.50px`, `5.83px`) is FABRICATING
 *       EVIDENCE -- quoting values the component does not build to, inside a
 *       rule whose whole purpose is to separate `derived from` from `quoted
 *       at`.
 *    2. Rewriting the shell's `text-[0.84375rem]` -> `text-[13.5px]` is
 *       arithmetically identical and still TOUCHES A SHARED CONTROL ON FOUR
 *       ACCEPTED SCREENS to satisfy a threshold.
 *
 * ⛔ DO NOT LOWER THE THRESHOLD. Operator: *"a rule relaxed to fit one frame
 *    stops measuring the next."* `AR-4` is a HEURISTIC for whether the
 *    `.html` was opened; weakening it to fit the one frame it cannot measure
 *    destroys it for every frame it can.
 *
 * ⚠️ ESCALATION CONDITION, SET IN ADVANCE: if a LATER frame hits the same
 *    wall, that is a STOP-AND-ASK, not a second `KNOWN-RED`. Operator: *"two
 *    instances would make it a RULE problem rather than a FRAME accident."*
 */

const BLOCK = /```artefact-read\r?\n([\s\S]*?)```/g;

/** `10.50px` -> `10.5px`, `13.00px` -> `13px`; anything else unchanged. */
export function normaliseValue(value) {
  const match = /^(\d+)\.(\d+)px$/.exec(value);
  if (!match) return value;
  const fraction = match[2].replace(/0+$/, "");
  return fraction.length === 0 ? `${match[1]}px` : `${match[1]}.${fraction}px`;
}

/** Parse every `artefact-read` block out of the numbered packs. */
export function readLedger(root) {
  const blocks = [];
  const dir = join(root, PACK_ROOT);
  for (const pack of readdirSync(dir).sort()) {
    const notes = join(dir, pack, "implementation-notes.md");
    if (!existsSync(notes)) continue;
    const text = readFileSync(notes, "utf8");
    for (const [, body] of text.matchAll(BLOCK)) {
      const fields = {};
      for (const line of body.split(/\r?\n/)) {
        const at = line.indexOf(":");
        if (at < 0) continue;
        fields[line.slice(0, at).trim()] = line.slice(at + 1).trim();
      }
      blocks.push({
        numberedPack: pack,
        notes,
        screen: fields.screen ?? "",
        referencePack: fields.pack ?? "",
        // A derivation may legitimately span a shared primitive: the `mini`
        // avatar's `9.50px` is measured from THIS frame and lives in
        // `components/ui/avatar.tsx`. Comma-separated; AR-5 checks the union.
        components: (fields.component ?? "").split(",").map((v) => v.trim()).filter(Boolean),
        htmlValues: (fields["html-values"] ?? "").split(",").map((v) => v.trim()).filter(Boolean),
        quote: fields["screen-md-quote"] ?? "",
      });
    }
  }
  return blocks;
}

/** The three source texts a block's claims are checked against. */
export function loadSources(root, block) {
  const refDir = join(root, REF_ROOT, block.referencePack);
  const html = join(refDir, `${block.referencePack}.html`);
  const note = join(refDir, `${block.referencePack}.md`);
  const screenMd = join(root, PACK_ROOT, block.numberedPack, "screen.md");
  return {
    htmlPath: html,
    html: existsSync(html) ? readFileSync(html, "utf8") : null,
    note: existsSync(note) ? readFileSync(note, "utf8") : null,
    screenMdPath: screenMd,
    screenMd: existsSync(screenMd) ? readFileSync(screenMd, "utf8") : null,
    componentPaths: block.components,
    component: block.components.every((rel) => existsSync(join(root, rel)))
      ? block.components.map((rel) => readFileSync(join(root, rel), "utf8")).join("\n")
      : null,
  };
}

/**
 * ▶ THE CORE PREDICATE. A cited value counts as DEMONSTRATED only when it
 * occurs literally in the `.html` and is actually USED in the component --
 * quoting a value without building to it is not a derivation.
 */
export function citedInHtml(html, value) {
  return typeof html === "string" && html.includes(value);
}

/**
 * ⛔ COMMENTS ARE STRIPPED FIRST. Without this, "USED in the component"
 * degenerates into "QUOTED in the component" -- a phase could paste the
 * values into a comment block and satisfy the rule while building to
 * something else entirely. The line-comment form is anchored to the start of
 * a line so a `https://` inside an import is not mistaken for one.
 */
export function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^[ \t]*\/\/.*$/gm, "");
}

export function usedInComponent(source, value) {
  if (typeof source !== "string") return false;
  const code = stripComments(source);
  return code.includes(value) || code.includes(normaliseValue(value));
}

/** Values that cannot come from a prose note: they carry a fraction. */
export function fractionalValues(values) {
  return values.filter((value) => /^\d+\.\d+px$/.test(value));
}
