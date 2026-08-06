/**
 * Shared visual foundation assertions (FRONTEND RECONSTRUCTION F1).
 *
 * These guard the foundation's invariants, not any screen's appearance. No assertion here
 * claims a screen is visually accepted.
 *
 * Run compiled, the same way the existing fixture assertion suites are run.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  BRAND_TOKENS,
  INK_TOKENS,
  LAYOUT_TOKENS,
  PRIMARY_ACTION_FILL,
  RADIUS_TOKENS,
  RATING_RAMP,
  SHADOW_TOKENS,
  STATUS_TOKENS,
  SURFACE_TOKENS,
  TYPE_SCALE,
} from "../../lib/frontend/design/tokens";

let failures = 0;

function check(condition: boolean, message: string): void {
  if (condition) {
    console.log(`  ok   ${message}`);
    return;
  }
  failures += 1;
  console.error(`  FAIL ${message}`);
}

/** Relative luminance per WCAG 2.x. */
function luminance(hex: string): number {
  const value = hex.replace("#", "");
  const channels = [0, 2, 4].map((offset) => {
    const raw = parseInt(value.slice(offset, offset + 2), 16) / 255;
    return raw <= 0.03928 ? raw / 12.92 : ((raw + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(foreground: string, background: string): number {
  const a = luminance(foreground);
  const b = luminance(background);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}

console.log("Design foundation — token integrity");

check(
  RATING_RAMP.length === 4,
  "the competency rating ramp has exactly four steps (no fifth level)",
);
check(
  RATING_RAMP.every((step, index) => step.ordinal === index + 1),
  "rating ramp ordinals are 1..4 in ascending order",
);
check(
  new Set(RATING_RAMP.map((step) => step.solid)).size === 4,
  "each rating ordinal has a distinct solid colour",
);
check(
  RATING_RAMP.every((step) => /^#[0-9a-f]{6}$/.test(step.solid)),
  "rating ramp colours are six-digit hex",
);

console.log("Design foundation — contrast (WCAG 2.2 AA)");

const AA_BODY = 4.5;
const AA_LARGE = 3;

check(
  contrastRatio(INK_TOKENS.strong, SURFACE_TOKENS.surface) >= AA_BODY,
  `heading ink on surface >= ${AA_BODY}:1 (${contrastRatio(INK_TOKENS.strong, SURFACE_TOKENS.surface).toFixed(2)})`,
);
check(
  contrastRatio(INK_TOKENS.base, SURFACE_TOKENS.surface) >= AA_BODY,
  `body ink on surface >= ${AA_BODY}:1 (${contrastRatio(INK_TOKENS.base, SURFACE_TOKENS.surface).toFixed(2)})`,
);
check(
  contrastRatio(INK_TOKENS.strong, SURFACE_TOKENS.canvas) >= AA_BODY,
  `heading ink on canvas >= ${AA_BODY}:1 (${contrastRatio(INK_TOKENS.strong, SURFACE_TOKENS.canvas).toFixed(2)})`,
);
check(
  contrastRatio(INK_TOKENS.onDark, SURFACE_TOKENS.accentInk) >= AA_BODY,
  `white on the dark accent surface >= ${AA_BODY}:1 (${contrastRatio(INK_TOKENS.onDark, SURFACE_TOKENS.accentInk).toFixed(2)})`,
);
check(
  contrastRatio("#ffffff", PRIMARY_ACTION_FILL) >= AA_BODY,
  `white label on the primary action fill >= ${AA_BODY}:1 (${contrastRatio("#ffffff", PRIMARY_ACTION_FILL).toFixed(2)})`,
);
check(
  contrastRatio("#ffffff", BRAND_TOKENS[600]) >= AA_LARGE,
  `white glyph on the brand tile >= ${AA_LARGE}:1 graphical object (${contrastRatio("#ffffff", BRAND_TOKENS[600]).toFixed(2)})`,
);
check(
  contrastRatio(BRAND_TOKENS[800], BRAND_TOKENS[100]) >= AA_BODY,
  `active navigation text on its pink tint >= ${AA_BODY}:1 (${contrastRatio(BRAND_TOKENS[800], BRAND_TOKENS[100]).toFixed(2)})`,
);
check(
  contrastRatio("#d6357a", SURFACE_TOKENS.canvas) >= AA_LARGE,
  `the focus ring against the page canvas >= ${AA_LARGE}:1 non-text (${contrastRatio("#d6357a", SURFACE_TOKENS.canvas).toFixed(2)})`,
);

for (const [tone, pair] of Object.entries(STATUS_TOKENS)) {
  check(
    contrastRatio(pair.on, pair.soft) >= AA_BODY,
    `status tone "${tone}" text on its tint >= ${AA_BODY}:1 (${contrastRatio(pair.on, pair.soft).toFixed(2)})`,
  );
}

for (const step of RATING_RAMP) {
  check(
    contrastRatio(step.onSoft, step.soft) >= AA_BODY,
    `rating ordinal ${step.ordinal} text on its soft tint >= ${AA_BODY}:1 (${contrastRatio(step.onSoft, step.soft).toFixed(2)})`,
  );
}

console.log("Design foundation — stylesheet reconciliation");

const cssPath = join(process.cwd(), "app", "globals.css");
const css = readFileSync(cssPath, "utf8");

const mustDeclare: readonly [string, string][] = [
  ["--color-canvas", SURFACE_TOKENS.canvas],
  ["--color-surface", SURFACE_TOKENS.surface],
  ["--color-surface-muted", SURFACE_TOKENS.surfaceMuted],
  ["--color-line", SURFACE_TOKENS.line],
  ["--color-accent-ink", SURFACE_TOKENS.accentInk],
  ["--color-ink-strong", INK_TOKENS.strong],
  ["--color-ink-muted", INK_TOKENS.muted],
  ["--color-brand-600", BRAND_TOKENS[600]],
  ["--color-brand-700", BRAND_TOKENS[700]],
  ["--color-brand-800", BRAND_TOKENS[800]],
  ["--color-neutral-on", STATUS_TOKENS.neutral.on],
  ["--color-info-on", STATUS_TOKENS.info.on],
  ["--color-success-on", STATUS_TOKENS.success.on],
  ["--color-rating-1", RATING_RAMP[0].solid],
  ["--color-rating-2", RATING_RAMP[1].solid],
  ["--color-rating-3", RATING_RAMP[2].solid],
  ["--color-rating-4", RATING_RAMP[3].solid],
  ["--radius-card", RADIUS_TOKENS.xl],
  ["--shadow-card", SHADOW_TOKENS.card],
  ["--text-page-title", TYPE_SCALE.pageTitle],
  ["--spacing-sidebar", LAYOUT_TOKENS.sidebarWidth],
];

for (const [name, value] of mustDeclare) {
  check(
    css.includes(`${name}: ${value}`),
    `globals.css declares ${name} as ${value} (matches the typed token)`,
  );
}

console.log("Design foundation — the final MVP is a light design");

check(
  /background: var\(--background\)/.test(css) && /--background: #f4f5fa/.test(css),
  "the page background is the light canvas",
);

/**
 * The superseded navy ramp survives only as three legacy aliases pointed at the accent-ink
 * family, so feature components not yet reconstructed keep white text on a real surface.
 * The invariant that matters is that none of them is dark enough to read as a page theme
 * and that the scale did not grow back.
 */
const navyAliases = [...css.matchAll(/--color-navy-(\d+): (#[0-9a-f]{6})/g)];
check(
  navyAliases.length === 3,
  `exactly three legacy navy aliases remain (found ${navyAliases.length})`,
);
const permittedLegacyValues: readonly string[] = [
  SURFACE_TOKENS.accentInk,
  SURFACE_TOKENS.accentInkSoft,
  INK_TOKENS.base,
];
check(
  navyAliases.every(([, , value]) => permittedLegacyValues.includes(value)),
  "every legacy navy alias resolves to an accent-ink or ink value, not a theme colour",
);
check(
  !/(background|--background)\s*:\s*var\(--color-navy/.test(css),
  "no page background is driven by a legacy navy alias",
);

const rootLayout = readFileSync(join(process.cwd(), "app", "layout.tsx"), "utf8");
check(
  !rootLayout.includes("bg-navy-950"),
  "the root layout no longer forces a dark page surface",
);
check(
  rootLayout.includes("bg-canvas"),
  "the root layout carries the light canvas on <html> and <body>",
);

console.log("Design foundation — no utility names an UNDEFINED project token (F-01c)");

/**
 * F-01c. `features/trainer/trainer-dashboard.tsx` declared `bg-warning-800` and
 * `text-warning-800`. This project defines `--color-warning-soft` and `--color-warning-on` and
 * NO numeric `warning` ramp, so Tailwind emitted no rule at all: the element rendered its
 * declared white label on whatever background it inherited. A declared class is not evidence it
 * applied — the same class of defect that voided `.text-white` on every button at F-01b.
 *
 * The guard is structural rather than a hardcoded blocklist. It reads the token names
 * `app/globals.css` actually declares, then flags any colour utility that names one of THIS
 * PROJECT's token families with a step that family does not have. Default Tailwind palette
 * families (`amber-*`, `slate-*`, …) are not project families and are deliberately not flagged —
 * they resolve to real Tailwind rules.
 */
const declaredTokens = new Set(
  [...css.matchAll(/--color-([a-z0-9-]+):/g)].map((match) => match[1]),
);
const projectFamilies = new Set([...declaredTokens].map((name) => name.split("-")[0]));

const COLOUR_UTILITY_PREFIXES = [
  "bg", "text", "border", "ring", "fill", "stroke", "divide", "placeholder",
  "decoration", "outline", "accent", "caret", "from", "via", "to",
];
const utilityPattern = new RegExp(
  `\\b(?:${COLOUR_UTILITY_PREFIXES.join("|")})-([a-z][a-z0-9]*(?:-[a-z0-9]+)*)\\b`,
  "g",
);

/** Comments legitimately NAME the broken token when they explain the fix; strip them first. */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");
}

function sourceFiles(directory: string): string[] {
  const collected: string[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const full = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".next", ".git"].includes(entry.name)) continue;
      collected.push(...sourceFiles(full));
    } else if (/\.tsx?$/.test(entry.name)) {
      collected.push(full);
    }
  }
  return collected;
}

/** Paths this checkpoint owns. Offenders anywhere else are REPORTED, never silently fixed. */
const OWNED = [
  join("components", ""),
  join("app", ""),
  join("features", "trainer", "trainer-dashboard.tsx"),
];

const ownedOffenders: string[] = [];
const unownedOffenders: string[] = [];

for (const file of [
  ...sourceFiles(join(process.cwd(), "components")),
  ...sourceFiles(join(process.cwd(), "app")),
  ...sourceFiles(join(process.cwd(), "features")),
]) {
  const relative = file.slice(process.cwd().length + 1);
  const source = stripComments(readFileSync(file, "utf8"));
  for (const match of source.matchAll(utilityPattern)) {
    const name = match[1];
    if (declaredTokens.has(name)) continue;
    if (!projectFamilies.has(name.split("-")[0])) continue;
    const record = `${relative}: ${match[0]}`;
    if (OWNED.some((owned) => relative.startsWith(owned))) ownedOffenders.push(record);
    else unownedOffenders.push(record);
  }
}

check(
  ownedOffenders.length === 0,
  `no utility in components/, app/ or trainer-dashboard.tsx names an undefined project token${
    ownedOffenders.length ? ` — found ${[...new Set(ownedOffenders)].join(", ")}` : ""
  }`,
);

if (unownedOffenders.length > 0) {
  console.log(
    `  note UNOWNED residual, reported not fixed (outside the F-01c owned paths): ${[
      ...new Set(unownedOffenders),
    ].join(", ")}`,
  );
}

console.log("Design foundation — no external runtime asset");

check(
  !/@import\s+url\(/.test(css) && !/fonts\.googleapis|fonts\.gstatic|cdn\./.test(css),
  "globals.css fetches no remote font, icon or stylesheet",
);

const iconSource = readFileSync(
  join(process.cwd(), "components", "ui", "icon.tsx"),
  "utf8",
);
check(
  !/https?:\/\//.test(iconSource),
  "the shared icon set is inline SVG with no remote reference",
);

console.log(
  failures === 0
    ? "\nDesign foundation assertions passed."
    : `\nDesign foundation assertions FAILED (${failures}).`,
);

process.exit(failures === 0 ? 0 : 1);
