import type { ReactNode } from "react";

/**
 * Tones reconciled to the shared foundation at F1. `fixture` keeps a deliberate dark
 * accent surface so the non-participant fixture notice stays unmistakable against the
 * light canvas.
 */
const styles = {
  info: "border-transparent bg-info-soft text-info-on",
  success: "border-transparent bg-success-soft text-success-on",
  warning: "border-transparent bg-warning-soft text-warning-on",
  error: "border-transparent bg-danger-soft text-danger-on",
  fixture: "border-transparent bg-accent-ink text-white",
} as const;

export function FeedbackBanner({
  title,
  children,
  tone = "info",
  actions,
}: {
  readonly title: string;
  readonly children: ReactNode;
  readonly tone?: keyof typeof styles;
  readonly actions?: ReactNode;
}) {
  return (
    <section
      className={`rounded-card border px-4 py-3.5 ${styles[tone]}`}
      role={tone === "error" ? "alert" : "status"}
      aria-live={tone === "error" ? "assertive" : "polite"}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-extrabold">{title}</p>
          <div className="mt-0.5 text-sm leading-6 opacity-90">{children}</div>
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
    </section>
  );
}
