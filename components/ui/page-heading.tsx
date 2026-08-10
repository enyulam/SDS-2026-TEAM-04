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
          <p className="text-[0.625rem] font-semibold uppercase tracking-[0.06em] text-brand-800">
            {eyebrow}
          </p>
        )}
        {/*
         * Reconciled at plan Phase 7 to the page-title treatment every measured frame
         * carries — 22px / 700 (`Management - Reports`, `Management - Student Report`,
         * `Trainer - Schedule`, `Trainer - Student Roster`; the Management Dashboard
         * frame sets 23px). `tracking-[-0.02em]` was REMOVED rather than restyled: the
         * unlayered `h1..h4 { letter-spacing: -0.015em }` rule in globals.css outranks
         * it, so it was emitted, matched and discarded.
         *
         * ⚠️ Reconciled HERE rather than five times over, because five of this
         * component's seven consumers are Batch 3 screens. Of the other two,
         * `trainer-dashboard` is UNMOUNTED (plan §4 Phase 13) so nothing renders, and
         * `returned-reports-queue` (screen 09) is out of plan — it moves TOWARD
         * consistency with every other page title, not away from it, and screen 09's
         * open item is a surface SUBSTITUTION, which a type change does not touch.
         */}
        <h1 className={`${eyebrow ? "mt-1 " : ""}text-[1.375rem] font-bold text-ink-strong`}>
          {title}
        </h1>
        {description && (
          /*
           * `text-ink-muted` (#8a93a8) measured 3.079:1 on the canvas — BELOW the 4.5:1
           * SC 1.4.3 floor for normal-size text, and live on three consumers that still
           * pass this prop. Two earlier checkpoints worked around it by not using the
           * prop and recorded the failure instead of fixing it. Re-pointed to `text-ink`
           * (#33405c), the same F-01c treatment applied elsewhere: hue preserved,
           * luminance moved, and NO TOKEN VALUE REDEFINED — `--color-ink-muted` is
           * unchanged and still serves placeholders and disabled controls.
           */
          <p className="mt-0.5 max-w-2xl text-small leading-5 text-ink">{description}</p>
        )}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </header>
  );
}
