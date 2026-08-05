import Link from "next/link";
import type { UiActionResult } from "@/lib/frontend/contracts/result";

type FailureResult = Exclude<UiActionResult<never>, { outcome: "success" }>;

export function StatePanel({
  result,
  title,
  homeHref = "/trainer",
  homeLabel = "Return to Trainer workspace",
}: {
  readonly result: FailureResult;
  readonly title?: string;
  readonly homeHref?: string;
  readonly homeLabel?: string;
}) {
  const copy = getCopy(result, title);
  return (
    <section className="card mx-auto max-w-2xl px-6 py-12 text-center" role="status">
      <span
        className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-100 text-lg font-black text-navy-800"
        aria-hidden="true"
      >
        {copy.marker}
      </span>
      <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-navy-950">
        {copy.title}
      </h1>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-ink-muted">
        {copy.message}
      </p>
      <Link
        href={homeHref}
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-500"
      >
        {homeLabel}
      </Link>
    </section>
  );
}

function getCopy(result: FailureResult, title?: string) {
  switch (result.outcome) {
    case "unauthenticated":
      return {
        marker: "→",
        title: title ?? "Sign-in required",
        message: "Return to the login presentation to continue.",
      };
    case "unauthorized":
    case "unavailable":
      return {
        marker: "—",
        title: title ?? "This item isn't available",
        message:
          "It may no longer be available in this workspace. No additional details can be shown.",
      };
    case "stale_state":
      return { marker: "↻", title: title ?? "Reload required", message: result.message };
    case "generation_failure":
    case "retryable_failure":
    case "unexpected_failure":
      return { marker: "!", title: title ?? "Something went wrong", message: result.message };
    case "validation":
      return { marker: "!", title: title ?? "Check the required fields", message: result.message };
  }
}
