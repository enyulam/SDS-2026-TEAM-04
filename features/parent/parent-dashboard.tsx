"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FeedbackBanner } from "@/components/ui/feedback-banner";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { PageHeading } from "@/components/ui/page-heading";
import { StatePanel } from "@/components/ui/state-panel";
import { asFailure, type ResourceState } from "@/features/trainer/resource-state";
import { usePhysicalTestPort } from "@/features/portal/portal-runtime-context";
import type {
  AvailabilityStateDto,
  ParentReportListItemDto,
} from "@/lib/frontend/contracts/physical-test";

/**
 * Screen 30 — Parent Dashboard.
 *
 * Current Final MVP visual authority is `UI_REFERENCE_FINAL_MVP/reference/Parent - Dashboard/`
 * (Amendment 007 A-056, which supersedes the A-045 ordering). There is no pack-local
 * `reference.png` for this screen, and its absence is NOT a missing reference and NOT a reason
 * to re-export from live Figma (`CLAUDE.md` §7.4). Implementation status is
 * `Partially implemented`: most of the frame is not built yet, which is INCOMPLETENESS, not
 * drift. Documentation added 2026-08-10; behaviour was not changed.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⛔ OPERATOR RULING Q-27 — THE NINE-DIMENSION SKILLS CARD IS `DO_NOT_IMPLEMENT`
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 *
 * THE RATIFIED REFERENCE FRAME FOR THIS SCREEN DRAWS A CARD THIS SURFACE MUST NEVER BUILD.
 * `reference/Parent - Dashboard/` shows **"This Term's Skills"** listing all nine B.E.S.T.
 * dimensions with rating indicators. The COMPLETE card is absent from the Final MVP — title,
 * all nine labels, all bars, all rating-derived visual state, and ANY replacement ratings
 * visualization. Hiding, obscuring, emptying, collapsing, renaming or substituting it are all
 * NON-COMPLIANCE (`FINAL_MVP_AUTHORITY_LOCK.md` §15.2; `CLAUDE.md` §6).
 *
 * ⚠️ ITS ABSENCE IS `EXPECTED / REQUIRED`, NEVER A VISUAL REGRESSION AND NEVER A MISSING
 * IMPLEMENTATION. Visual acceptance must treat it as satisfied-by-omission. This note exists
 * because a reader comparing this file against the frame would otherwise see nine missing rows
 * and "fix" them — reintroducing the exact leak the ruling closed. Every other reconstructed
 * surface records its governed omissions; this one previously recorded none.
 *
 * IT IS A DATA BOUNDARY, NOT CSS. The nine ratings must not reach a Parent session through the
 * Dashboard UI, page state, DTOs, projections, RPC results, APIs, server actions or client
 * payloads. FETCHING THEM AND HIDING THEM IN THE CLIENT IS A VIOLATION — the same error as
 * "hiding an Edit button is not authorization". Accordingly this component reads only
 * `getParentAvailability` and `listParentSubmittedReports`; neither carries a rating, and no
 * competency-rating token is rendered anywhere on this surface in either vocabulary
 * (A-021; A-048; A-052 forbids the bare-word regex, so the guard is structural, not lexical).
 *
 * LAYOUT CONSEQUENCE, ALSO RULED: Profile Details promotes upward into the vacated main-column
 * space. NO BLANK RECTANGLE, NO INVENTED FILLER CARD.
 *
 * Q-27 GRANTS MANAGEMENT NOTHING and changes no Trainer or Management rating authority; it
 * concerns Parent visibility only. OD-4's four panels are unaffected.
 *
 * REACHABILITY IS THE GOVERNED PROJECTION'S, NOT THIS COMPONENT'S. Parents receive only the
 * canonical submitted version `reports.latest_submitted_version_id` names, for students
 * reachable through a live `parent_student_links` row (A-021; A-038).
 */

type DashboardData = {
  readonly availability: AvailabilityStateDto;
  readonly reports: readonly ParentReportListItemDto[];
};

export function ParentDashboard() {
  const port = usePhysicalTestPort();
  const searchParams = useSearchParams();
  const [state, setState] = useState<ResourceState<DashboardData>>({ kind: "loading" });

  useEffect(() => {
    let active = true;
    void Promise.all([port.getParentAvailability(), port.listParentSubmittedReports()]).then(
      ([availability, reports]) => {
        if (!active) return;
        if (availability.outcome !== "success") {
          setState({ kind: "failed", result: asFailure(availability) });
        } else if (reports.outcome !== "success") {
          setState({ kind: "failed", result: asFailure(reports) });
        } else {
          setState({
            kind: "ready",
            data: { availability: availability.data, reports: reports.data },
          });
        }
      },
    );
    return () => {
      active = false;
    };
  }, [port]);

  if (state.kind === "loading") {
    return <LoadingSkeleton label="Loading family report availability" rows={3} />;
  }
  if (state.kind === "failed") {
    return (
      <StatePanel
        result={state.result}
        homeHref="/parent"
        homeLabel="Return to Parent workspace"
      />
    );
  }

  const preview = searchParams.get("preview");
  const availability: AvailabilityStateDto =
    preview === "none"
      ? "none_yet"
      : preview === "linked_unavailable"
        ? "linked_unavailable"
        : state.data.availability;

  return (
    <div className="page-grid" data-testid="parent-dashboard">
      <PageHeading
        eyebrow="Parent workspace"
        title="Family reports"
        description="Open reports that are ready for your linked learner."
      />

      {availability === "available" ? (
        <>
          <FeedbackBanner tone="success" title="A report is available">
            {state.data.reports.length} {state.data.reports.length === 1 ? "report is" : "reports are"}{" "}
            ready to view.
          </FeedbackBanner>
          <section className="card px-5 py-[18px]">
            {/*
              The legacy `text-2xl font-black text-navy-950` / `text-sm text-ink-muted`
              scale predates the reference foundation. `text-ink-muted` (#8a93a8) is
              additionally a LIVE 3.079:1 SC 1.4.3 failure on this fill, so it is
              re-pointed to `text-ink` here for the same F-01c reason applied elsewhere —
              hue preserved, luminance moved, NO token value redefined.
            */}
            <h2 className="text-[1rem] font-semibold text-ink-strong">Ready to read</h2>
            <p className="mt-1 text-[0.75rem] leading-5 text-ink">
              Visit the report list to open the latest available family report.
            </p>
            <Link
              href="/parent/reports"
              className="mt-4 inline-flex min-h-11 items-center justify-center rounded-field bg-brand-700 px-4 py-2.5 text-[0.78125rem] font-semibold text-white hover:bg-brand-800"
            >
              View available reports
            </Link>
          </section>
        </>
      ) : (
        <section className="card px-6 py-12 text-center" role="status">
          {/*
            ⚠️ BOTH BRANCHES ARE EMPTY STATES, NOT ERRORS, AND THE COPY NOW SAYS SO.
            The failure path is `state.kind === "failed"` above, which renders
            `StatePanel`. Reaching here means `getParentAvailability` SUCCEEDED and
            returned a real governed state.

            ⛔ The previous heading was "Family view unavailable", with a body saying
            the view could not be shown and inviting a retry. That is OUTAGE language.
            The actual state is: the learner IS linked, and no report has been
            published yet. The retry invitation was the worst part — it told a parent
            to keep retrying something that will never change by waiting.

            ▶ Third instance of the rule ratified 2026-08-11 (plan §12 item 16): AN
            OMISSION'S STATED REASON MUST SAY WHETHER IT ENDS WHEN DATA ARRIVES, OR
            NEVER ENDS. This one said neither and implied the wrong one — a transient
            fault, when the truth is a pending governed act by another person. Both
            branches now name the actor and the event that ends the wait.

            ⛔ NO GOVERNANCE BOUNDARY MOVES HERE. Neither string reveals whether a
            report exists in any pre-submitted state, and neither exposes a rating, a
            panel or a lifecycle status (Q-27, A-038). A parent still learns only what
            a parent may learn: whether something has been PUBLISHED to them.

            ⚠️ `none_yet` means NO LINKED LEARNER AT ALL — `listLinkedStudents`
            returned zero. Its old copy said "your linked learner", asserting the very
            link whose absence produced the state. Same defect class, same expression,
            corrected together.
          */}
          <h2 className="text-[1rem] font-semibold text-ink-strong">
            {availability === "linked_unavailable"
              ? "No report published yet"
              : "No learner linked to this account yet"}
          </h2>
          <p className="mx-auto mt-1 max-w-xl text-[0.75rem] leading-5 text-ink">
            {availability === "linked_unavailable"
              ? "Your learner is linked to this account. A report appears here once your centre’s management has completed its final review and published it. Nothing is wrong and there is nothing to retry — this page will show the report when that happens."
              : "Your centre’s management links a learner to your account. Once that link exists, any report they publish will appear here."}
          </p>
        </section>
      )}
    </div>
  );
}
