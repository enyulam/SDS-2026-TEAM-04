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
  /*
   * PHASE 1 — geometry read from the frozen export. All four discs are the
   * SAME size there (380 x 380 = 23.75rem); the build had drifted to four
   * different sizes (23 / 20 / 23 / 26rem) and four positions of its own.
   *
   * Positions are expressed as PERCENTAGES of the 1440 x 1024 frame rather
   * than as the export's absolute pixels, so the composition survives a
   * viewport the frame never drew. Reading a value out of the export is
   * permitted; carrying its absolute positioning into the build is not
   * (plan §3.1 hard constraint).
   *
   * The FILL stays `brand-100`. The export paints `rgba(236, 75, 150, 0.16)`,
   * which composited over the white page resolves to #FCE2EE — a token this
   * project does not declare. `brand-100` is #FCE7F3, i.e. the same disc to
   * within a couple of levels per channel, and it is an existing declared
   * token. Introducing an opacity modifier for a difference that small would
   * risk a fully-opaque disc if the utility failed to emit, for no visible
   * gain.
   */
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <span className="absolute left-[-8.26%] top-[6.64%] block size-[23.75rem] rounded-full bg-brand-100" />
      <span className="absolute left-[83.33%] top-[-13.28%] block size-[23.75rem] rounded-full bg-brand-100" />
      <span className="absolute left-[76.81%] top-[59.67%] block size-[23.75rem] rounded-full bg-brand-100" />
      <span className="absolute left-[2.5%] top-[86.23%] block size-[23.75rem] rounded-full bg-brand-100" />
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
  /*
   * PHASE 1 — 27px/700 heading, 5px gap, 13px description, and an 18px block
   * gap above; the build carried 32px/800, a 6px gap, a 14px description and a
   * 28px block gap.
   *
   * The description colour moves `ink-muted` -> `neutral-on` and does NOT
   * follow the frame. Measured on the rendered production DOM this run,
   * `ink-muted` #8a93a8 on white is 3.07:1 and the frame's own #8A93A6 is
   * 3.086:1 — both below the 4.5:1 SC 1.4.3 requires at this size.
   * `neutral-on` is 5.558:1. This is the F-01c adjudication applied to the
   * authentication surfaces: accessibility wins, the divergence is recorded,
   * and no token VALUE is redefined.
   */
  return (
    <div className="mt-[1.125rem]">
      <h1
        id={id}
        className="text-[1.6875rem] font-bold leading-tight tracking-[-0.02em] text-ink-strong"
      >
        {title}
      </h1>
      <p className="mt-[0.3125rem] text-[0.8125rem] leading-5 text-neutral-on">
        {description}
      </p>
    </div>
  );
}

/**
 * The quiet help line that closes every frozen login frame.
 *
 * PHASE 1 — it is LEFT-ALIGNED, not centred. The export lays the column out
 * `align-items: flex-start` and the frame renders the line flush with the
 * column's left edge; the build had centred it. Size 13px -> 12px, and the
 * 24px gap above becomes the column's 18px rhythm.
 *
 * The colour does not follow the frame, for the reason given on `AuthHeading`:
 * the frame's #AEB6C4 measures 2.041:1 on white, well under SC 1.4.3.
 */
export function AuthFooterNote({ children }: { readonly children: ReactNode }) {
  return (
    <p className="mt-[1.125rem] text-[0.75rem] leading-5 text-neutral-on">{children}</p>
  );
}
