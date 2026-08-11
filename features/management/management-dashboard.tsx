"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FeedbackBanner } from "@/components/ui/feedback-banner";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { PageHeading } from "@/components/ui/page-heading";
import { StatePanel } from "@/components/ui/state-panel";
import { asFailure, type ResourceState } from "@/features/trainer/resource-state";
import { usePhysicalTestPort } from "@/features/portal/portal-runtime-context";
import type { ManagementQueueRowDto } from "@/lib/frontend/contracts/physical-test";

/**
 * Screen 11 — Management Dashboard.
 *
 * Current Final MVP visual authority is `UI_REFERENCE_FINAL_MVP/reference/Management - Dashboard/`
 * (Amendment 007 A-056, which supersedes the A-045 ordering). There is no pack-local
 * `reference.png`, and its absence is NOT a missing reference and NOT a reason to re-export from
 * live Figma (`CLAUDE.md` §7.4). Implementation status is `Partially implemented`: most of the
 * frame is not built yet, which is INCOMPLETENESS, not drift. Documentation added 2026-08-10;
 * behaviour was not changed.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⛔ THE FRAME DRAWS RATINGS ON A MANAGEMENT SURFACE. IT MUST NOT BE BUILT
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 *
 * ⚠️ CORRECTED 2026-08-11 (operator ruling C-18, FINAL_MVP_PORTAL_DECISIONS.md §C). THE
 * CONCLUSION IS UNCHANGED — NO RATING IS BUILT HERE — BUT THE GROUND HAS MOVED, AND CITING
 * THE LAPSED ONE IS WHAT INVITES A LATER PHASE TO "FIX" IT.
 *
 * ⛔ D-1 (2026-08-11) permits Management to VIEW the nine per-dimension ratings, READ ONLY.
 *    So `A-038` no longer bars Management from ratings as such, and this banner previously
 *    reached the RIGHT CONCLUSION FOR THE WRONG REASON. Two independent grounds now carry it,
 *    and either alone is sufficient:
 *
 *      1. C-9 — D-1 reaches REPORT DETAIL SURFACES ONLY. This is a LIST surface. Ratings on a
 *         list "invite comparison between children", which was expressly not authorized.
 *      2. G-2 — what this frame actually draws is a SINGLE ROLL-UP "B.E.S.T. Rating" per row,
 *         not the nine. A roll-up is PERMANENTLY EXCLUDED on every surface. G-2's own
 *         A-038-derived ground lapsed with D-1; it survives on the other two (the roll-up is
 *         unratified, and on a Parent surface it is the Q-27 leak).
 *
 * ⛔ SO: NOTHING CHANGES ON THIS SCREEN. Do not add a rating column, chip, tile or bar here,
 *    and do not read D-1 as permitting one. If you are implementing D-1, the surface you want
 *    is screen 19 (`management-report-review.tsx`), not this one.
 *
 * `reference/Management - Dashboard/` shows an approval list whose rows carry the student's
 * current **B.E.S.T. Rating**. This is the same class of leak already caught once on a
 * Parent surface, and the same adjudication operator ruling R-B5 recorded for screen 19's
 * "Performance Summary": governance overrides the frozen screenshot, the divergence is
 * RECORDED and never silently resolved (A-045, preserved by A-056).
 *
 * ⚠️ THE ABSENCE OF ANY RATING COLUMN, CHIP OR TILE HERE IS `EXPECTED / REQUIRED`, never a
 * visual regression and never a missing implementation. NOTHING on this surface renders a
 * competency-rating token in either vocabulary. It reads only
 * `listManagementPendingReviews` and `listManagementCorrectionTracking`, whose
 * `ManagementQueueRowDto` carries no rating, no observation, no trainer note, no checklist or
 * approval internal and no content hash — the exclusion is at the governed projection, not in
 * the client, because hiding a value the client already holds is not a boundary.
 *
 * ⚠️ THE CONTENT HASH NEVER REACHES ANY MANAGEMENT SURFACE (A-038). It covers the four panels
 * PLUS the nine ratings, so a reader holding the panels and the hash recovers the exact rating
 * grid in 4^9 = 262,144 trials. That is the caught leak this project already fixed once.
 *
 * ROW ACTIONS ARE DECIDED BY STATUS, INDIVIDUALLY (A-038). `trainer_approved` is the only
 * status that links to report content, and it links to the management final-review surface;
 * `submitted` links to the canonical submitted report. `incomplete`, `observation_saved`,
 * `drafting`, `draft_ready` and `needs_edit` expose NO report content and get "Send Reminder to
 * Trainer"; a row with no report gets no action at all. There is deliberately NO shared generic
 * "view report" handler — that is the defect this rule exists to prevent.
 */

type DashboardData = {
  readonly pending: readonly ManagementQueueRowDto[];
  readonly corrections: readonly ManagementQueueRowDto[];
};

export function ManagementDashboard() {
  const port = usePhysicalTestPort();
  const [state, setState] = useState<ResourceState<DashboardData>>({ kind: "loading" });

  useEffect(() => {
    let active = true;
    void Promise.all([
      port.listManagementPendingReviews(),
      port.listManagementCorrectionTracking(),
    ]).then(([pending, corrections]) => {
      if (!active) return;
      if (pending.outcome !== "success") {
        setState({ kind: "failed", result: asFailure(pending) });
      } else if (corrections.outcome !== "success") {
        setState({ kind: "failed", result: asFailure(corrections) });
      } else {
        setState({ kind: "ready", data: { pending: pending.data, corrections: corrections.data } });
      }
    });
    return () => {
      active = false;
    };
  }, [port]);

  if (state.kind === "loading") {
    return <LoadingSkeleton label="Loading Management workspace" rows={3} />;
  }
  if (state.kind === "failed") {
    return (
      <StatePanel
        result={state.result}
        homeHref="/management"
        homeLabel="Return to Management workspace"
      />
    );
  }

  return (
    <div className="page-grid">
      <PageHeading
        eyebrow="Management · final quality review"
        title="Review centre reports"
        description="Complete the final wording review, return assessment-fact concerns to the Trainer, or submit an accepted report."
      />

      {state.data.pending.length > 0 && (
        <FeedbackBanner tone="warning" title="Reports are waiting for final review">
          {state.data.pending.length} {state.data.pending.length === 1 ? "report is" : "reports are"}{" "}
          ready in the durable review queue.
        </FeedbackBanner>
      )}

      <section className="grid gap-4 sm:grid-cols-2" aria-label="Management queue summary">
        <QueueCard
          label="Pending final review"
          count={state.data.pending.length}
          href="/management/reports?status=trainer_approved"
          action="Open review queue"
        />
        <QueueCard
          label="Corrections in progress"
          count={state.data.corrections.length}
          href="/management/reports?status=needs_edit"
          action="Open correction tracking"
        />
      </section>
    </div>
  );
}

function QueueCard({
  label,
  count,
  href,
  action,
}: {
  readonly label: string;
  readonly count: number;
  readonly href: string;
  readonly action: string;
}) {
  return (
    /*
     * The frame's KPI tile: a 12px / 500 quiet label over a 23px / 700 value.
     *
     * This card was still on the pre-reference LEGACY scale — `text-sm font-bold`
     * over `text-4xl font-black text-navy-950`, at a `rounded-xl` action. None of
     * those appears in any frame. `text-ink-muted` (#8a93a8) was additionally a
     * LIVE 3.079:1 SC 1.4.3 failure on this fill and is re-pointed to `text-ink`,
     * the same F-01c treatment applied elsewhere — hue preserved, luminance moved,
     * NO token value redefined.
     */
    <article className="card px-5 py-[18px]">
      <p className="text-[0.75rem] font-medium text-ink">{label}</p>
      <p className="mt-1 text-[1.4375rem] font-bold text-ink-strong">{count}</p>
      <Link
        href={href}
        className="mt-4 inline-flex min-h-11 items-center justify-center rounded-field bg-brand-700 px-4 py-2.5 text-[0.78125rem] font-semibold text-white hover:bg-brand-800"
      >
        {action}
      </Link>
    </article>
  );
}
