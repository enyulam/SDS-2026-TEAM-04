import type { ReactNode } from "react";

/**
 * Shared authentication shell (FRONTEND RECONSTRUCTION F2).
 *
 * The three frozen login references — AUTH-01 `546:370`, AUTH-02 `459:13` and
 * AUTH-03 `546:413` — are structurally identical: a white page carrying four pale decorative
 * discs, and one narrow centred column holding the brand lockup, the "Sign in as" selector,
 * the heading pair, the credential fields and the primary action.
 *
 * `GLOBAL_UI_RULES.md` §2 permits exactly this: the three frames "may share one
 * implementation shell and one route implementation — the visual references do not merge".
 * The shell therefore carries no role-specific presentation; the caller supplies it.
 */

/** Fixed column width measured from the frozen frames at their 1440 × 1024 viewport. */
const COLUMN_WIDTH = "25rem";

export function AuthShell({
  children,
}: {
  readonly children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full" style={{ maxWidth: COLUMN_WIDTH }}>
      {children}
    </div>
  );
}

/**
 * The four pale discs the frozen frames bleed off each corner. Purely decorative: it is
 * `aria-hidden`, sits behind the content, and never intercepts a pointer event.
 */
export function AuthBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <span className="absolute -left-28 top-2 block size-[23rem] rounded-full bg-brand-100" />
      <span className="absolute -right-20 -top-24 block size-[20rem] rounded-full bg-brand-100" />
      <span className="absolute -bottom-40 left-8 block size-[23rem] rounded-full bg-brand-100" />
      <span className="absolute -bottom-2 -right-20 block size-[26rem] rounded-full bg-brand-100" />
    </div>
  );
}

/**
 * The heading pair beneath the role selector.
 *
 * Kept as its own primitive so each login checkpoint reuses identical type, spacing and
 * heading level rather than re-deriving them per role.
 */
export function AuthHeading({
  id,
  title,
  description,
}: {
  readonly id: string;
  readonly title: string;
  readonly description: string;
}) {
  return (
    <div className="mt-7">
      <h1
        id={id}
        className="text-[2rem] font-extrabold leading-tight tracking-[-0.02em] text-ink-strong"
      >
        {title}
      </h1>
      <p className="mt-1.5 text-body leading-6 text-ink-muted">{description}</p>
    </div>
  );
}

/** The quiet centred help line that closes every frozen login frame. */
export function AuthFooterNote({ children }: { readonly children: ReactNode }) {
  return (
    <p className="mt-6 text-center text-small leading-5 text-ink-muted">{children}</p>
  );
}
