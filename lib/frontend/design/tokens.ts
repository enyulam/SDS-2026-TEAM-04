/**
 * Final MVP shared design tokens.
 *
 * Derived at FRONTEND RECONSTRUCTION F1 from the patterns repeated across the twelve
 * frozen core `reference.png` files in the in-repository UI reference pack. This module is
 * the typed mirror of the CSS custom properties declared in `app/globals.css` — the CSS is what
 * the browser renders; this module exists so shared primitives and foundation tests can
 * reference the same values without re-deriving them.
 *
 * Current Final MVP visual authority is UI_REFERENCE_FINAL_MVP/reference/ (Amendment 007
 * A-056, which supersedes the A-045 ordering). See CLAUDE.md §7.4 and
 * FINAL_MVP_AUTHORITY_LOCK.md §2.4 for the ladder and for governed deviations.
 *
 * This module declares presentation only. It carries no rating label, no lifecycle status
 * label, no permission and no route.
 */

/** Page, surface and structural colours shared by every portal frame. */
export const SURFACE_TOKENS = {
  /** Page background behind the portal shell. */
  canvas: "#f4f5fa",
  /** Card, panel and sidebar background. */
  surface: "#ffffff",
  /** Input fill, unselected segmented-control track, inert row background. */
  surfaceMuted: "#f4f5f9",
  /** Softest neutral wash used behind grouped meta rows. */
  surfaceSubtle: "#fafbfd",
  /** Hairline borders and separators. */
  line: "#edeff5",
  /** Slightly stronger separator used inside dense tables and grids. */
  lineStrong: "#e3e6ef",
  /**
   * Deliberate dark accent surface. This is NOT a dark theme: it appears in the frozen
   * references as the roster "class in session" banner and the report submit panel, and
   * nowhere else.
   */
  accentInk: "#16233f",
  accentInkSoft: "#1e2d4d",
} as const;

/** Text colours, darkest first. */
export const INK_TOKENS = {
  /** Headings and primary emphasis. */
  strong: "#1b2b4b",
  /** Default body copy. */
  base: "#33405c",
  /** Secondary copy, descriptions, meta lines. */
  muted: "#8a93a8",
  /** Table column labels and eyebrows. */
  subtle: "#a6aec0",
  /** Copy placed on a dark accent or brand surface. */
  onDark: "#ffffff",
} as const;

/** Brand ramp. Pink is the single primary-action colour across all three portals. */
export const BRAND_TOKENS = {
  50: "#fdf2f8",
  100: "#fce7f3",
  200: "#fbcfe4",
  500: "#f472b6",
  600: "#ec4899",
  700: "#d6357a",
  800: "#b02a63",
} as const;

/**
 * The four-step competency rating ramp, in ratified ordinal order, low to high.
 *
 * Amendment 006 A-049 governs the LABELS; this module deliberately declares none. The
 * ramp here is ordinal position -> colour only, so the Frontend V3 vocabulary checkpoint
 * (FRONTEND RECONSTRUCTION F6) renames labels without re-mapping, re-ordering or
 * re-tokenizing the ramp.
 */
export const RATING_RAMP = [
  { ordinal: 1, solid: "#ef4b35", soft: "#fdecea", onSoft: "#b3301f" },
  { ordinal: 2, solid: "#f5b721", soft: "#fef6e0", onSoft: "#8a6106" },
  { ordinal: 3, solid: "#2fbdbd", soft: "#e4f6f6", onSoft: "#186f6f" },
  { ordinal: 4, solid: "#54bc77", soft: "#e9f6ed", onSoft: "#2c6b43" },
] as const;

/**
 * Semantic status tints used by badges, pills and inline state copy.
 *
 * The `soft` tints are taken from the frozen references. The `on` text colours were
 * DEEPENED at F1 relative to the frame's apparent tone so every pair clears WCAG 2.2 AA
 * 4.5:1 for normal-size text. Hue is preserved; only luminance moved. The frames and the
 * accessibility requirement disagreed, and the ratified requirement wins (A-045,
 * `CLAUDE.md` persona 3.5) — recorded, not silently resolved.
 */
export const STATUS_TOKENS = {
  neutral: { soft: "#f1f3f8", on: "#5f6880" },
  brand: { soft: "#fce7f3", on: "#b02a63" },
  info: { soft: "#e2f5f5", on: "#166b6b" },
  success: { soft: "#e4f6ea", on: "#2a7248" },
  warning: { soft: "#fef3d7", on: "#8a6106" },
  danger: { soft: "#fdecea", on: "#b3301f" },
} as const;

/**
 * The primary-action fill.
 *
 * The frames render the primary button in `BRAND_TOKENS[600]`. White label text on that
 * fill measures 3.53:1 — enough for a graphical object or large text, but short of the
 * 4.5:1 that normal-size button labels require. The fill is therefore `BRAND_TOKENS[700]`,
 * the next step of the same hue, which measures 4.52:1. `BRAND_TOKENS[600]` remains in use
 * where only a graphical object sits on it, such as the brand tile.
 */
export const PRIMARY_ACTION_FILL = BRAND_TOKENS[700];

/** Corner radii, smallest first. */
export const RADIUS_TOKENS = {
  sm: "0.5rem",
  md: "0.625rem",
  lg: "0.75rem",
  xl: "1rem",
  "2xl": "1.25rem",
  pill: "9999px",
} as const;

/** Elevation. The references use very restrained shadows on a light canvas. */
export const SHADOW_TOKENS = {
  card: "0 1px 2px rgba(16, 24, 40, 0.04), 0 8px 24px rgba(16, 24, 40, 0.05)",
  raised: "0 1px 3px rgba(16, 24, 40, 0.08), 0 1px 2px rgba(16, 24, 40, 0.04)",
  overlay: "0 12px 32px rgba(16, 24, 40, 0.12)",
} as const;

/** Shell and content layout measurements. */
export const LAYOUT_TOKENS = {
  /** Fixed sidebar width at the desktop reference viewport. */
  sidebarWidth: "15.625rem",
  /** Maximum content width before the container stops growing. */
  contentMax: "96rem",
  /** Horizontal page gutter at the desktop reference viewport. */
  gutter: "1.75rem",
  /** The viewport the frozen references were captured at. */
  referenceViewport: { width: 1440, height: 1024 },
} as const;

/** Type scale, in rem, matched to the frozen frames at 1440px wide. */
export const TYPE_SCALE = {
  micro: "0.6875rem",
  small: "0.8125rem",
  body: "0.875rem",
  cardTitle: "1.0625rem",
  sectionTitle: "1.25rem",
  pageTitle: "1.875rem",
} as const;

export type RatingOrdinal = (typeof RATING_RAMP)[number]["ordinal"];
export type StatusTone = keyof typeof STATUS_TOKENS;
