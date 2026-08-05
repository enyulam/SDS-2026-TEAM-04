import type { ReactNode } from "react";

const styles = {
  info: "border-blue-200 bg-blue-50 text-blue-950",
  success: "border-green-200 bg-success-100 text-success-700",
  warning: "border-amber-200 bg-warning-100 text-warning-800",
  error: "border-red-200 bg-danger-100 text-danger-700",
  fixture: "border-sky-700/70 bg-navy-800 text-blue-50",
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
      className={`rounded-2xl border px-4 py-3.5 ${styles[tone]}`}
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
