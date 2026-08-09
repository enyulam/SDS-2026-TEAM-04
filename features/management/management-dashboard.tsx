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
 * ⛔ THE FRAME DRAWS RATINGS ON A MANAGEMENT SURFACE. IT MUST NOT BE BUILT (A-038)
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 *
 * `reference/Management - Dashboard/` shows an approval list whose rows carry the student's
 * current **B.E.S.T. Rating**. MANAGEMENT NEVER READS RAW PER-DIMENSION RATINGS (A-038;
 * `CLAUDE.md` §6; GLOBAL_UI_RULES §4). This is the same class of leak already caught once on a
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
    <article className="card p-5 sm:p-6">
      <p className="text-sm font-bold text-ink-muted">{label}</p>
      <p className="mt-2 text-4xl font-black text-navy-950">{count}</p>
      <Link
        href={href}
        className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-800"
      >
        {action}
      </Link>
    </article>
  );
}
