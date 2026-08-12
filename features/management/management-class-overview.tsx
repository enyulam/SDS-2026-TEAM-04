"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { PageHeading } from "@/components/ui/page-heading";
import { StatePanel } from "@/components/ui/state-panel";
import { asFailure, type ResourceState } from "@/features/trainer/resource-state";
import { usePhysicalTestPort } from "@/features/portal/portal-runtime-context";
import type { ClassOverviewDto, ClassOverviewRowDto } from "@/lib/frontend/contracts/physical-test";

/**
 * Screen 13 — Management Class Overview (PORTAL COMPLETION PLAN phase `P2-4`).
 *
 * Current Final MVP visual authority is `UI_REFERENCE_FINAL_MVP/reference/Management - Class
 * Overview/` (Amendment 007 A-056). No pack-local `reference.png`, which is not a gap (§7.4).
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⛔ NOTHING ON THIS SURFACE IS AN ASSESSMENT FACT, AND THE ABSENCE IS STRUCTURAL
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * The frame's own note describes a *"Rubric focus-area list … assessed speaking criteria such
 * as audience awareness, body language, and vocal projection"* and lists **B.E.S.T. Ratings**
 * among what the screen summarises. ⛔ **NOT BUILT, and this is governance overriding a frame,
 * not an omission.** `C-9` confines `D-1`'s nine per-dimension ratings to report **DETAIL**
 * surfaces because ratings on an overview *"invite comparison between children"*; `G-2` bars
 * every roll-up on **every** surface, permanently.
 *
 * ▶ The exclusion is enforced three deep and not by this component's good behaviour: the two
 * RPCs carry migration assertion `V-4`, which **fails the build** if either so much as names a
 * rating; `P26-7` re-asserts it on the returned shape; and the frontend contract declares no
 * field that could hold one.
 *
 * ⚠️ What legitimately survives from that frame section is the **single most frequent
 * improvement-focus tag**, which `CLAUDE.md` §6 mandates by name — computed **server-side** and
 * arriving as **one string**, never as the underlying tags (Operator ruling, `P2-4`).
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⛔ THE CLASS HEALTH SUMMARY IS A GOVERNANCE-MANDATED ADDITION THE FRAME OMITS (`C-17`)
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * `CLAUDE.md` §6 fixes it **exhaustively**: four conditions, evaluated top to bottom, first
 * match wins, so exactly one result is ever shown. The verdict comes from
 * `lib/shared/class-health.ts` — **one copy**, shared with the fixture — and the sentences are
 * **verbatim**. ⛔ Never AI-authored: generating this prose would silently pull the §8-deferred
 * Weekly Class Health Brief into scope.
 *
 * ⛔ Per an interface-cleanup pass recorded in §6, this panel does **not** repeat "Reports
 * completed", "Evidence completion" or "Parent communication" — those duplicate the KPI figures
 * shown above it.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⛔ PER-ROW ACTION GATING — `A-038`, RATIFIED, BUILT TO THE RULE RATHER THAN TO THE FRAME
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * The inventory records that this screen's gating *"must be built to that rule, not inferred
 * from the frame"*. Exactly four outcomes, and no generic "view report" handler is shared
 * across them:
 *
 *   `submitted`         → opens the CANONICAL submitted report
 *   `trainer_approved`  → opens the management FINAL-REVIEW surface
 *   any earlier status  → **Send Reminder to Trainer**, and NO report content of any kind
 *   NULL (`No Report`)  → **no action button at all** — a plain "—", matching how the Parent
 *                         Calendar disables Access for an absent learner
 *
 * ⚠️ The last case is why the projection returns a **row** for a learner with no report rather
 * than omitting them: an absent row could not be told apart from a learner who is not enrolled.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⚠️ REGISTERED OMISSIONS
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * 1. **`Trainer Assistant (TA)`** on the class card — `A-014`/`G-7`. **PROHIBITED, NEVER ENDS.**
 * 2. **`Manage lesson plans`** → screen `14`, which `P2-6` builds under `D-4`. **INERT with a
 *    stated reason**, not hidden: a link to a route that 404s is worse than a control that says
 *    why. ⚠️ This is the INERT treatment (target not yet built), **not** the ABSENT treatment
 *    (capability refused) — standing prohibition 17 keeps the two apart.
 * 3. **`View Overall Class Statistics`** → screen `16`, which `P2-16` builds. Same treatment.
 * 4. **Lesson name and number** render only where recorded. **NULL means NOT RECORDED** (hero
 *    0B) — never "Lesson 1", never "TBC", never a dash.
 * 5. ⛔ **NO EDIT CONTROL, AND ITS ABSENCE IS RULED.** Neither this frame nor screen `12` draws
 *    an inbound affordance to screen `27` Edit Class. The Operator ruled it a **DESIGN GAP, not
 *    a build gap**: *"It is a question for the design set, not something the build resolves."*
 *    ⛔ Do not add one here or anywhere else, and do not read this note as licence to place one
 *    "where it seems natural". `27` remains reachable at its canonical route.
 */

const REPORT_LABEL: Record<string, string> = {
  incomplete: "Not started",
  observation_saved: "Assessment saved",
  drafting: "Draft generating",
  draft_ready: "Awaiting trainer review",
  needs_edit: "Returned for correction",
  trainer_approved: "Awaiting final review",
  submitted: "Submitted",
};

export function ManagementClassOverview({ classModuleId }: { readonly classModuleId: string }) {
  const port = usePhysicalTestPort();
  const [state, setState] = useState<ResourceState<ClassOverviewDto>>({ kind: "loading" });

  useEffect(() => {
    let active = true;
    void port.readClassOverview(classModuleId).then((result) => {
      if (!active) return;
      setState(
        result.outcome === "success"
          ? { kind: "ready", data: result.data }
          : { kind: "failed", result: asFailure(result) },
      );
    });
    return () => {
      active = false;
    };
  }, [port, classModuleId]);

  if (state.kind === "loading") return <LoadingSkeleton label="Loading class overview" rows={4} />;
  if (state.kind === "failed") {
    return (
      <StatePanel
        result={state.result}
        homeHref="/management/classes"
        homeLabel="Return to Classes"
      />
    );
  }

  const { rows, sessions, health } = state.data;

  return (
    <div className="page-grid">
      <div>
        <PageHeading title="Class Overview" />
        <p className="mt-0.5 text-small text-ink">
          <Link href="/management/classes" className="underline hover:text-brand-700">
            Classes
          </Link>{" "}
          / Overview
        </p>
      </div>

      {/*
        ⛔ THE CLASS HEALTH SUMMARY — `C-17`, mandated by `CLAUDE.md` §6 and absent from the
        frame. Exactly TWO computed fields, as §6 specifies: Status and Main follow-up area.
      */}
      {health !== null && (
        <section className="card flex flex-col gap-3 px-6 py-5" aria-label="Class Health Summary">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-section-title font-extrabold text-ink-strong">
              Class Health Summary
            </h2>
            <Badge tone={health.status === "On Track" ? "success" : "warning"}>
              {health.status}
            </Badge>
          </div>
          <p className="text-body text-ink-strong">{health.action}</p>
          {/*
            ⚠️ OMITTED WHEN NULL, never rendered as "None" or "—". NULL means NOT RECORDED
            (hero 0B): with no submitted report carrying an improvement-focus tag there is no
            follow-up area, and inventing a label would fabricate an assessment fact.
          */}
          {health.mainFollowUpArea !== null && (
            <p className="text-small text-ink">
              Main follow-up area:{" "}
              <span className="font-semibold text-ink-strong">
                {health.mainFollowUpArea.replace(/_/g, " ")}
              </span>
            </p>
          )}
          <p className="text-small text-ink">
            {health.submittedReports} of {health.totalReports} reports submitted
            {health.evidenceMissing > 0
              ? ` · ${health.evidenceMissing} missing evidence`
              : ""}
          </p>
        </section>
      )}

      <section className="card flex flex-col gap-4 px-6 py-5" aria-label="Lesson timeline">
        <h2 className="text-section-title font-extrabold text-ink-strong">Lessons</h2>
        {sessions.length === 0 ? (
          <p className="text-small text-ink" role="status">
            No class sessions have been created for this class yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {sessions.map((session) => (
              <li
                key={session.classSessionId}
                className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line px-4 py-3"
              >
                <span className="text-[0.8125rem] font-semibold text-ink-strong">
                  {/*
                    ⛔ NULL MEANS NOT RECORDED — THE ELEMENT IS OMITTED (hero 0B). A session
                    with no lesson number and no title shows its DATE alone; it never shows
                    "Lesson 1", "Untitled" or a dash.
                  */}
                  {session.lessonNumber !== null && `Lesson ${session.lessonNumber}`}
                  {session.lessonNumber !== null && session.lessonTitle !== null && " · "}
                  {session.lessonTitle}
                  {session.lessonNumber === null && session.lessonTitle === null && session.sessionDate}
                </span>
                <span className="text-small text-ink">
                  {session.sessionDate} · {session.submittedCount} of {session.learnerCount} reports
                  sent
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card flex flex-col gap-4 px-6 py-5" aria-label="Student Report Status">
        <h2 className="text-section-title font-extrabold text-ink-strong">Student Report Status</h2>
        {rows.length === 0 ? (
          <p className="text-small text-ink" role="status">
            No learners are enrolled in this class yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">
                Report status for every enrolled learner, by class session
              </caption>
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className="py-2 pe-4 text-small font-bold text-ink-strong">
                    Student
                  </th>
                  <th scope="col" className="py-2 pe-4 text-small font-bold text-ink-strong">
                    Session
                  </th>
                  <th scope="col" className="py-2 pe-4 text-small font-bold text-ink-strong">
                    Report
                  </th>
                  <th scope="col" className="py-2 text-small font-bold text-ink-strong">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={`${row.classSessionId}-${row.studentId}`}
                    className="border-b border-line last:border-0"
                  >
                    <td className="py-2.5 pe-4 text-[0.8125rem] font-semibold text-ink-strong">
                      {row.studentDisplayName}
                    </td>
                    <td className="py-2.5 pe-4 text-small text-ink">{row.sessionDate}</td>
                    <td className="py-2.5 pe-4 text-small text-ink">
                      {row.reportState === null
                        ? "No Report"
                        : REPORT_LABEL[row.reportState] ?? row.reportState}
                    </td>
                    <td className="py-2.5">
                      <RowAction row={row} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/*
        ⚠️ THE TWO INERT CONTROLS, with their reasons ON THE SURFACE. Their targets are real
        screens that later phases build; until then a link would 404, and a silent hole would
        read as a missing feature. ⛔ This is the INERT treatment, deliberately distinct from
        screen `27`'s ABSENT day strip: that capability is REFUSED, these are NOT YET BUILT.
      */}
      <section className="card flex flex-col gap-2 px-6 py-5">
        <h2 className="text-section-title font-extrabold text-ink-strong">Related</h2>
        <p className="text-small text-ink">
          <span className="font-semibold text-ink-strong">Manage lesson plans</span> and{" "}
          <span className="font-semibold text-ink-strong">View Overall Class Statistics</span> open
          screens that are not built yet, so neither is a link on this page.
        </p>
      </section>
    </div>
  );
}

/**
 * ⛔ `A-038`'s PER-ROW GATE. Four outcomes, checked independently for every row.
 *
 * ⚠️ NOT ONE GENERIC "view report" HANDLER. `CLAUDE.md` §6 names that specifically: *"Do not
 * implement this as one generic 'view report' handler shared across all rows/screens regardless
 * of status; every such handler must check status first, independently."*
 */
function RowAction({ row }: { readonly row: ClassOverviewRowDto }) {
  // ⛔ NO REPORT → NO BUTTON AT ALL. "Send Reminder to Trainer" does not apply when no report
  // was ever started, and §6 says a plain "—" is the correct treatment.
  if (row.reportState === null || row.reportId === null) {
    return (
      <span className="text-small text-ink" aria-label="No action available">
        —
      </span>
    );
  }

  if (row.reportState === "submitted") {
    return (
      <Link
        href={`/management/reports?status=submitted`}
        className="inline-flex min-h-11 items-center text-small font-semibold text-brand-700 underline"
      >
        View submitted report
      </Link>
    );
  }

  if (row.reportState === "trainer_approved") {
    return (
      <Link
        href={`/management/reports/${row.reportId}/review`}
        className="inline-flex min-h-11 items-center text-small font-semibold text-brand-700 underline"
      >
        Open final review
      </Link>
    );
  }

  /*
   * ⛔ EVERY EARLIER STATUS EXPOSES NO REPORT CONTENT AT ALL — not a panel, not a draft, not a
   * note. The row-level action is a reminder, and `CLAUDE.md` §6 is explicit that it is a
   * row-level control rather than a page-level Quick Action.
   *
   * ⚠️ It is rendered DISABLED rather than absent, and that is the correct side of standing
   * prohibition 17: sending a reminder is a capability nothing forbids — it simply has no
   * notification substrate yet (`G-04` places notifications OUT of scope).
   */
  return (
    <button
      type="button"
      disabled
      title="Reminders are not available yet — no notification path is in scope."
      className="inline-flex min-h-11 cursor-not-allowed items-center rounded-field border border-line px-3 py-1.5 text-small font-semibold text-neutral-on"
    >
      Send Reminder to Trainer
    </button>
  );
}
