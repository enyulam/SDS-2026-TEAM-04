import type { ReactNode } from "react";

export function PageHeading({
  eyebrow,
  title,
  description,
  actions,
}: {
  readonly eyebrow?: string;
  readonly title: string;
  readonly description?: string;
  readonly actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        {eyebrow && (
          <p className="text-micro font-bold uppercase tracking-[0.14em] text-brand-800">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 text-page-title font-extrabold tracking-[-0.02em] text-ink-strong">
          {title}
        </h1>
        {description && (
          <p className="mt-1 max-w-2xl text-body leading-6 text-ink-muted">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </header>
  );
}
