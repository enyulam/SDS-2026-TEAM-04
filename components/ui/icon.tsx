import type { ReactNode } from "react";

/**
 * Shared icon treatment (F1).
 *
 * The frozen references use a consistent stroked line-icon style at two sizes, frequently
 * set inside a soft tinted rounded tile. Every icon here is inline SVG — this project
 * depends on no icon package, no icon CDN and no remote asset.
 *
 * Only the icons the shared shell itself needs are defined here. Screen-specific icons
 * belong to their own reconstruction checkpoint.
 */

const strokeProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export type IconName =
  | "dashboard"
  | "reports"
  | "document"
  | "bell"
  | "logout"
  | "chevronLeft"
  | "chevronRight"
  | "chevronDown"
  | "check"
  | "close"
  | "cap";

export function Icon({
  name,
  size = 18,
  className = "",
}: {
  readonly name: IconName;
  readonly size?: number;
  readonly className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={`shrink-0 ${className}`}
      {...strokeProps}
    >
      {paths[name]}
    </svg>
  );
}

const paths: Readonly<Record<IconName, ReactNode>> = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.6" />
      <rect x="14" y="3" width="7" height="7" rx="1.6" />
      <rect x="3" y="14" width="7" height="7" rx="1.6" />
      <rect x="14" y="14" width="7" height="7" rx="1.6" />
    </>
  ),
  reports: (
    <>
      <path d="M4 20V10" />
      <path d="M10 20V4" />
      <path d="M16 20v-7" />
      <path d="M21 20H3" />
    </>
  ),
  document: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6" />
      <path d="M9 17h4" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </>
  ),
  logout: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </>
  ),
  chevronLeft: <path d="m15 18-6-6 6-6" />,
  chevronRight: <path d="m9 18 6-6-6-6" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  check: <path d="M20 6 9 17l-5-5" />,
  close: (
    <>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </>
  ),
  cap: (
    <>
      <path d="M22 9 12 5 2 9l10 4 10-4Z" />
      <path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" />
    </>
  ),
};

const tileTones = {
  brand: "bg-brand-100 text-brand-800",
  info: "bg-info-soft text-info-on",
  success: "bg-success-soft text-success-on",
  warning: "bg-warning-soft text-warning-on",
  neutral: "bg-neutral-soft text-neutral-on",
} as const;

const tileSizes = {
  small: "size-8",
  medium: "size-10",
  large: "size-11",
} as const;

/** Soft tinted rounded tile holding an icon — repeated across the reference frames. */
export function IconTile({
  tone = "brand",
  size = "medium",
  className = "",
  children,
}: {
  readonly tone?: keyof typeof tileTones;
  readonly size?: keyof typeof tileSizes;
  readonly className?: string;
  readonly children: ReactNode;
}) {
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-xl ${tileTones[tone]} ${tileSizes[size]} ${className}`}
    >
      {children}
    </span>
  );
}

/** Square white control used for the header notification affordance. */
export function IconButtonSurface({
  className = "",
  children,
}: {
  readonly className?: string;
  readonly children: ReactNode;
}) {
  return (
    <span
      className={`grid size-10 place-items-center rounded-xl border border-line bg-surface text-ink-muted shadow-raised ${className}`}
    >
      {children}
    </span>
  );
}
