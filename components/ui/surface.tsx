import type { ElementType, ReactNode } from "react";

/**
 * Shared surface primitives (F1).
 *
 * The frozen references compose almost every screen from one white card surface on a light
 * canvas, with an optional titled header row. These primitives carry that surface only —
 * no screen-specific layout is encoded here.
 */

export function Card({
  as: Tag = "section",
  padded = true,
  className = "",
  children,
}: {
  readonly as?: ElementType;
  readonly padded?: boolean;
  readonly className?: string;
  readonly children: ReactNode;
}) {
  return (
    <Tag className={`card ${padded ? "p-5 sm:p-6" : ""} ${className}`}>{children}</Tag>
  );
}

export function CardHeader({
  title,
  description,
  actions,
  icon,
  className = "",
}: {
  readonly title: string;
  readonly description?: string;
  readonly actions?: ReactNode;
  readonly icon?: ReactNode;
  readonly className?: string;
}) {
  return (
    <div
      className={`flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between ${className}`}
    >
      <div className="flex min-w-0 items-start gap-3">
        {icon}
        <div className="min-w-0">
          <h2 className="text-card-title font-bold text-ink-strong">{title}</h2>
          {description && (
            <p className="mt-1 text-small leading-6 text-ink-muted">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}

/** Small uppercase label used above grouped meta blocks in the references. */
export function Eyebrow({
  children,
  className = "",
}: {
  readonly children: ReactNode;
  readonly className?: string;
}) {
  return (
    <p
      className={`text-micro font-bold uppercase tracking-[0.14em] text-ink-subtle ${className}`}
    >
      {children}
    </p>
  );
}

/**
 * The deliberate dark accent surface from the frozen references — the roster
 * "class in session" banner and the report submit panel.
 *
 * This is an accent surface, not a theme. Do not use it as a page background.
 */
export function AccentPanel({
  className = "",
  children,
}: {
  readonly className?: string;
  readonly children: ReactNode;
}) {
  return (
    <section
      className={`rounded-panel bg-accent-ink px-5 py-4 text-white sm:px-6 sm:py-5 ${className}`}
    >
      {children}
    </section>
  );
}

/** Hairline separator matching the reference table and panel dividers. */
export function Divider({ className = "" }: { readonly className?: string }) {
  return <hr className={`border-0 border-t border-line ${className}`} />;
}
