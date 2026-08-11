"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FeedbackBanner } from "@/components/ui/feedback-banner";
import { Icon, IconTile, type IconName } from "@/components/ui/icon";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { StatePanel } from "@/components/ui/state-panel";
import { StatusPill } from "@/components/ui/status-pill";
import type {
  DraftGenerationContextDto,
  ReportEvidenceClipDto,
  RequestDraftSuccess,
  TrainerSessionSummaryDto,
  TrainerWorkingReportDto,
} from "@/lib/frontend/contracts/physical-test";
import type { UiActionResult } from "@/lib/frontend/contracts/result";
import { RATING_DISPLAY_LABELS, RATING_TILE_STYLE } from "@/lib/frontend/fixtures/dimensions";
import { uploadEvidenceResumable } from "@/lib/frontend/evidence-upload";
import { EvidenceClipPlayer } from "@/components/ui/evidence-viewer";
import { REPORT_PANEL_CONFIG } from "./report-panel-config";
import { asFailure, type FailureResult } from "./resource-state";
import { usePhysicalTestPort } from "@/features/portal/portal-runtime-context";

/**
 * Screen 08 — Trainer AI Report Generation (operator checkpoint F-08).
 *
 * Route: `/trainer/reports/[reportId]/generate` — the PINNED implemented path. The canonical
 * route recorded for this screen is
 * `/trainer/schedule/[sessionId]/student-roster/[studentId]/grade-student/ai-report-generation`
 * and its ratified treatment is "replace after integration; pinned path preserved as a
 * redirect" (`screen.md` §1). That move requires its own authorization, so NO route is created,
 * moved, renamed or redirected here.
 *
 * Current Final MVP visual authority is
 * `UI_REFERENCE_FINAL_MVP/reference/Trainer - AI Report Generation/` (Amendment 007 A-056,
 * which supersedes the A-045 ordering). The pack-local
 * `UI_REFERENCE_FINAL_MVP/08-trainer-ai-report-generation/reference.png` (node `784:340`) is
 * an optional frozen duplicate, SHA-identical to it. See CLAUDE.md §7.4 and
 * FINAL_MVP_AUTHORITY_LOCK.md §2.4 for the ladder and for governed deviations.
 * FIGMA NEVER BYPASSES GOVERNANCE (A-045, preserved by A-056): where the
 * frame and a ratified rule disagree the RULE WINS, the prohibited thing is OMITTED or rendered
 * INERT with a visible reason, and the divergence is RECORDED in this screen's
 * `implementation-notes.md` and in the workstream log — never silently resolved.
 *
 * GOVERNANCE BOUNDARIES HELD HERE:
 *
 *  - GROUNDING VALIDATION RUNS BEFORE ANY DRAFT REACHES THIS SCREEN (`CLAUDE.md` §4
 *    non-negotiable 1). The port's `requestDraft` is the whole request -> grounding -> store
 *    path (RPC-3 -> RPC-4/RPC-5); a rejected draft returns `generation_failure` and this screen
 *    NEVER renders the rejected wording. Panels are read from `getTrainerWorkingReport` only
 *    AFTER a stored, validated draft exists — unvalidated model output is never displayed.
 *  - A GENERATION FAILURE PRESERVES THE ASSESSMENT AND OFFERS RETRY (spec §15). This is a
 *    designed recovery state with its own copy and a bounded retry, not a generic error toast.
 *    The saved observation and its lock version are held across the failure, so no rating work
 *    is destroyed.
 *  - AI NEVER APPROVES, SUBMITS OR PUBLISHES. The only forward affordance is human review.
 *  - THE TRAINER DOES NOT PUBLISH (Amendment 004 A-033). The governed trainer action is
 *    APPROVE, gated on the three-item version-scoped Quality Checklist, and it lives on the
 *    Review & Approve surface. Nothing here claims publication or a parent notification.
 *  - THE CONTENT HASH IS NEVER RENDERED (A-038): it covers the four panels PLUS the nine
 *    ratings. It is carried only as a concurrency proof on governed writes elsewhere.
 *  - THE NINE RATING SNAPSHOTS ARE TRAINER-INTERNAL. This is a Trainer surface, so per-dimension
 *    ratings are legitimately visible here as the Trainer's own source check. The management and
 *    parent boundaries are unchanged and proved separately.
 *  - Rating labels are the ratified `Beginning / Developing / Mastering / Mastered` (A-049), read
 *    from the single declared map. Class Grade (`Beginner / Intermediate / Advanced`) is a
 *    DIFFERENT, unchanged vocabulary (A-054) and marks itself `data-vocabulary="class-grade"` so
 *    a token guard classifies it by ACTUAL CONTEXT rather than by keyword.
 *
 * FRAME-VERSUS-GOVERNANCE DIVERGENCES (recorded, not resolved locally):
 *
 *  D1 THE FRAME IS A TERM REPORT — "Term Report — Alicia Gomez · Public Speaking · Term 1, 2035
 *     · Parent copy". End-of-term report GENERATION IS EXPRESSLY OUT OF MVP SCOPE (`CLAUDE.md`
 *     §5, §8; v3 §28): the End-of-Term Performance Report is a SEPARATE instrument on a
 *     different 7-criteria / Excellent-Good-Needs-Improvement scale, its evidence is captured
 *     now but its GENERATOR is not built. The screen is therefore reconstructed as the governed
 *     PER-SESSION AI draft-generation surface it actually is. "Parent copy" is additionally a
 *     false lifecycle claim on a Trainer working version — only management's Approve & Submit
 *     makes a version canonical and parent-visible (A-033).
 *  D2 ✅ RESOLVED — NO LONGER A DEVIATION (OD-4, Operator ruling 2026-08-07; implemented at
 *     P1-T07/T08). The governed four panels are Overview / Strengths / Areas for Development /
 *     Remarks (`REPORT_PANEL_CONFIG`), and the frame agrees on all four but the third.
 *
 *     The struck reasoning was: the frame's headings are not a rename of the governed four,
 *     "Overview" and "Remarks" have no governed counterpart, and inventing a mapping would
 *     silently redefine what each stored field means to a parent — the same treatment as F-09
 *     D2. Correct WHEN WRITTEN, preserved rather than deleted. The adjudication has since been
 *     ISSUED AND WENT THE OTHER WAY: the Operator DEFINED four concepts rather than renaming
 *     four fields, and superseded the old model outright.
 *
 *     ⚠️ This block was left half-migrated by a mechanical substitution and was caught by
 *     adversarial review: it listed FIVE panel names ("… / Areas for Development / Session
 *     Takeaway") because "Session Takeaway" survived the replace, and then still asserted that
 *     Overview has no governed counterpart one line after naming it as one of the four. Rewritten
 *     here rather than patched.
 *
 *     The frame's third heading "Areas to Grow" remains a live divergence: it is the MINORITY
 *     variant and is expressly ruled NOT canonical (Authority Lock §15.1). The ratified label is
 *     "Areas for Development". Here the frame loses and the rule wins.
 *  D3 "Class Video Evidence" with a drag-and-drop uploader ("MP4, MOV · up to 500MB each").
 *     ⚠️ CITATION CORRECTED 2026-08-10. This read "Evidence scope AND the uploading role are
 *     UNRESOLVED (Amendment 002 A-014)". That was true when written and was SUPERSEDED on
 *     2026-08-08: evidence media IS a Final MVP requirement and the Operator — not an agent —
 *     named the TRAINER as the uploader (`FINAL_MVP_AUTHORITY_LOCK.md` §8; `CLAUDE.md` §1.1).
 *     A-014's prohibition on INVENTING an uploader is discharged, because one was RULED.
 *
 *     ~~"THE TREATMENT BELOW IS UNCHANGED … the evidence schema is excluded from the Step 7E
 *     boundary, `PhysicalTestPort` exposes NO upload or evidence-read path … implementation is
 *     Phase B. So the affordance still has no governed backing — it is unbuilt, not undecided.
 *     The region is KEPT with the frame's label and rendered INERT …"~~
 *     ✅ STRUCK 2026-08-12 AT P1-2b AND PRESERVED. Every clause of it was true when written and
 *     is now false: the schema shipped at P1-2, the port carries four evidence members, and the
 *     transport is BUILT. ⛔ THIS IS THE RESTATEMENT DEFECT AT FILE SCOPE — the exact shape the
 *     Operator named on `parent-canonical-report.tsx`, where a comment declared a region omitted
 *     forty lines below the commit that built it. ▶ **A file's own header is the first thing a
 *     later reader trusts, and the last thing an implementer remembers to update.**
 *
 *     WHAT IS UNCHANGED AND STILL BINDING: the frame's "Class Video Evidence" heading and its
 *     "up to 500MB each" are STILL NOT BUILT — G-8 refused CLASS footage and C-16 ruled 100 MiB.
 *     `REGISTERED-OMISSION`: those two never end. What was built is D-5's PER-CHILD clip, under
 *     its own heading, with the ratified ceiling named on the page.
 *  D4 Report Details rows "Lesson" and "Term". ✅ THE LESSON HALF IS DISCHARGED AT HERO
 *     PHASE 6. It recorded that no lesson-number or lesson-title field existed on any
 *     governed Trainer projection — correct when written, and deliberately not invented
 *     around; it was a RECORDED DEPENDENCY, not a ruled omission. Phase 0B added the columns
 *     under G-3 and Phase 4 carried them onto `TrainerSessionSummaryDto`. NULL still means
 *     NOT RECORDED, so the row disappears entirely rather than showing a placeholder.
 *     ⛔ THE TERM HALF IS NOT DISCHARGED AND WILL NOT BE — G-4 rules it out: a display label
 *     is not worth building the substrate an §8-deferred roadmap item (End-of-Term report
 *     GENERATION) requires, and building it "just for a label" would pull a deferred item
 *     into scope by the back door. ⚠️ The on-screen note was rewritten with this: it used to
 *     say these fields were "not carried by any governed Trainer projection", which is now
 *     false for lesson and MISLEADING for term — "we don't have the data" and "we are not
 *     allowed to show this" are different statements, and stating the weaker one invites a
 *     later phase to "fix" a gap that is a decision.
 *  D5 Report Details row "Overall Grade: Mastering". No governed overall or roll-up competency
 *     grade exists — a single headline rating would be a DERIVED ASSESSMENT FACT this frontend
 *     computed, which is exactly the class of claim A-034/A-035 reserve to the governed
 *     assessment. (The 9->7 roll-up and the 4->3 scale map remain PROVISIONAL, `CLAUDE.md` §5,
 *     and belong to the unbuilt term-report generator anyway — D1.) Omitted; the nine governed
 *     snapshots are shown instead.
 *  D6 "PERFORMANCE SUMMARY" draws FOUR tiles (Speech, Tonality, Eye Contact, Audience
 *     Awareness). No governed rule selects four of the nine, and all nine are mandatory (A-017),
 *     so the frame's tile composition is reproduced across ALL NINE governed snapshots rather
 *     than an invented subset.
 *  D7 "Ready to submit? … Confirm & Submit / Save as draft". This CONTRADICTS the ratified
 *     two-stage workflow (A-033, A-036) on three counts: the Trainer action is APPROVE, not
 *     submit; THE TRAINER DOES NOT PUBLISH; and the approve gate is the three-item version-
 *     scoped Quality Checklist, which this frame draws nowhere. The governed action is
 *     implemented instead — the panel routes to Review & Approve and states the gate and the
 *     two-stage sequence plainly. "Save as draft" is OMITTED: the validated draft is already
 *     stored by the governed store path inside generation (RPC-4), so a second, differently
 *     governed save affordance would be an invented mutation.
 *  D8 The frame's "REVIEW & APPROVE" second rail (four count chips + a student list with
 *     per-student lifecycle chips) is the Trainer roster/queue surface, outside this
 *     checkpoint's owned paths. The relationship is carried by the Back to Student Roster
 *     control the frame also draws.
 *  D9 The frame's left rail lists Dashboard / My Classes / Students / Reports / Schedule. That
 *     rail is `components/layout/portal-shell.tsx`, outside this checkpoint's owned paths; its
 *     items are the routes that actually exist.
 *  D10 The frame draws only the settled end state. The governed generation states this screen
 *     must build — drafting/loading, failure-and-retry with the assessment preserved, the
 *     nine-rating validation refusal, empty and disabled — are not drawn anywhere in the frame
 *     and are built from `screen.md` §6 and spec §15.
 */

/**
 * Icon and tint per governed panel, in the frame's order. Presentation only — this carries no
 * lifecycle, polarity or assessment meaning, and every icon is reused from the approved set
 * rather than re-drawn ad hoc (`GLOBAL_UI_RULES` §8). Kept identical to the Trainer review
 * surface so the same governed panel never changes identity between two Trainer screens.
 */
const PANEL_PRESENTATION: Readonly<
  Record<
    (typeof REPORT_PANEL_CONFIG)[number]["key"],
    { readonly icon: IconName; readonly tone: "brand" | "info" | "success" | "warning" }
  >
> = {
  // 🔴 RE-ASSIGNED AT THE P1-T08 REVIEW. These were carried over
  // POSITIONALLY when the keys were renamed, shifting every treatment down
  // one slot: Overview took the success tick and Strengths -- the panel that
  // is by definition positive demonstrated capability -- rendered in the
  // WARNING tone. Both independent reviewers flagged it. A positional
  // carry-over is a relabelling shim in the presentation layer, which is
  // exactly what OD-4 prohibits. Assigned below from what each panel MEANS.
  overview: { icon: "document", tone: "info" },
  strengths: { icon: "check", tone: "success" },
  areasForDevelopment: { icon: "chevronRight", tone: "warning" },
  remarks: { icon: "reports", tone: "brand" },
};

/**
 * The four-step competency ramp, ordinal position 1..4, low to high. Amendment 006 A-049
 * governs the LABELS; this map is level -> ordinal colour pair only. Each pair is a deliberate
 * WCAG 2.2 AA foreground/background pair from the F1 foundation, re-measured in the production
 * DOM by the browser smoke rather than reasoned about. Colour is never the only carrier — every
 * tile states its level in text (`GLOBAL_UI_RULES` §7).
 */
/*
 * ⚠️ MOVED to `@/lib/frontend/fixtures/dimensions` on 2026-08-12, by Operator
 * preference, when screen `19` was authorized to use the same treatment. It
 * was declared IDENTICALLY here and in `trainer-report-review.tsx`, and `19`
 * would have been a third copy. ▶ Two copies of a colour map is how one band
 * silently acquires two colours on two screens showing the same assessment.
 * ⛔ The values did not change; the tokens are the same ones.
 */

type ReportView = {
  readonly report: TrainerWorkingReportDto;
  /** The governed Class Session this report belongs to, or null when the projection omits it. */
  readonly session: TrainerSessionSummaryDto | null;
};

type GenerationState =
  | { readonly kind: "loading" }
  | { readonly kind: "generating"; readonly context: DraftGenerationContextDto }
  | {
      readonly kind: "failed";
      readonly context: DraftGenerationContextDto;
      readonly result: Exclude<UiActionResult<RequestDraftSuccess>, { outcome: "success" }>;
    }
  | {
      readonly kind: "ready";
      readonly context: DraftGenerationContextDto;
      readonly result: RequestDraftSuccess;
      /** Null until the governed working-report projection resolves; never fabricated. */
      readonly view: ReportView | null;
      readonly hydrating: boolean;
    }
  | { readonly kind: "unavailable"; readonly result: FailureResult };

export function TrainerDraftGeneration() {
  const params = useParams<{ reportId: string }>();
  const port = usePhysicalTestPort();
  const [state, setState] = useState<GenerationState>({ kind: "loading" });
  const initialContext = useRef<
    Promise<UiActionResult<DraftGenerationContextDto>> | null
  >(null);
  const evidenceNoteId = useId();

  /**
   * The stored draft is read back through the governed Trainer projection AFTER generation
   * succeeded. It is never assembled from the generation response, and a projection miss leaves
   * `view` null (the empty state below) rather than inventing panels or ratings.
   */
  const hydrate = useCallback(
    async (reportId: string) => {
      const [reportResult, sessionsResult] = await Promise.all([
        port.getTrainerWorkingReport(reportId),
        port.listTrainerSessions(),
      ]);
      const view: ReportView | null =
        reportResult.outcome === "success"
          ? {
              report: reportResult.data,
              session:
                sessionsResult.outcome === "success"
                  ? (sessionsResult.data.find(
                      (item) => item.sessionId === reportResult.data.sessionId,
                    ) ?? null)
                  : null,
            }
          : null;
      setState((previous) =>
        previous.kind === "ready" ? { ...previous, view, hydrating: false } : previous,
      );
    },
    [port],
  );

  const generate = useCallback(
    async (context: DraftGenerationContextDto) => {
      setState({ kind: "generating", context });
      const result = await port.requestDraft({
        reportId: context.reportId,
        observationLockVersion: context.observationLockVersion,
      });
      if (result.outcome !== "success") {
        setState({ kind: "failed", context, result });
        return;
      }
      setState({ kind: "ready", context, result: result.data, view: null, hydrating: true });
      await hydrate(result.data.reportId);
    },
    [hydrate, port],
  );

  useEffect(() => {
    let active = true;
    initialContext.current ??= port.getDraftGenerationContext(params.reportId);
    void initialContext.current.then((result) => {
      if (!active) return;
      if (result.outcome !== "success") {
        setState({ kind: "unavailable", result: asFailure(result) });
        return;
      }
      void generate(result.data);
    });
    return () => {
      active = false;
    };
  }, [generate, params.reportId, port]);

  if (state.kind === "unavailable") return <StatePanel result={state.result} />;
  if (state.kind === "loading") {
    return <LoadingSkeleton label="Preparing the saved assessment for draft generation" rows={3} />;
  }

  if (state.kind === "generating") {
    return (
      <div className="page-grid">
        <PageHeader student={state.context.studentDisplayName} status="drafting" />
        <section
          className="card px-5 py-14 text-center sm:px-6"
          aria-busy="true"
          aria-live="polite"
        >
          <span
            className="mx-auto block size-12 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600"
            aria-hidden="true"
          />
          <h2 className="mt-6">
            <span className="text-[1.125rem] font-bold text-ink-strong">
              {`Drafting ${state.context.studentDisplayName}'s report…`}
            </span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-body leading-7 text-ink">
            Structure, polarity bands and rubric anchors are validated against the saved nine
            ratings before any wording can be stored or shown. Nothing is displayed until that
            check has passed.
          </p>
          <p className="mt-5 text-micro font-extrabold uppercase tracking-[0.12em] text-brand-800">
            Actions disabled while generation is in progress
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button size="large" disabled>
              Review four-panel report
            </Button>
            <Button variant="secondary" size="large" disabled>
              Edit wording
            </Button>
          </div>
        </section>
      </div>
    );
  }

  if (state.kind === "failed") {
    /*
     * Two distinct governed refusals, deliberately not collapsed into one message. A
     * `validation` outcome means the governed nine-rating precondition is unmet, and retrying
     * the same request cannot fix it — so retry is not offered. A `generation_failure` is the
     * grounding rejection: the assessment is intact and a bounded retry is the designed
     * recovery (spec §15).
     */
    const isValidation = state.result.outcome === "validation";
    const retryable =
      state.result.outcome === "generation_failure"
        ? state.result.retryable
        : state.result.outcome === "retryable_failure";
    const message =
      "message" in state.result
        ? state.result.message
        : "The draft is unavailable. No draft content was shown or saved.";
    return (
      <div className="page-grid">
        <PageHeader student={state.context.studentDisplayName} status={state.context.status} />
        <FeedbackBanner
          tone="error"
          title={isValidation ? "Draft generation refused" : "Draft rejected safely"}
        >
          {message}
        </FeedbackBanner>
        <section className="card p-5 sm:p-6">
          <h2>
            <span className="text-[1rem] font-semibold text-ink-strong">
              Your assessment is preserved
            </span>
          </h2>
          <p className="mt-2 max-w-2xl text-body leading-7 text-ink">
            {isValidation
              ? "Nothing was generated and nothing was stored. All nine dimensions are mandatory before a draft can be requested, and the saved observation is untouched — reopen the assessment to complete it."
              : "The report stayed at Observation Saved and the saved ratings, notes and follow-up are untouched. Grounding runs before the trainer sees anything, so this screen never displays the rejected draft."}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {!isValidation && (
              <Button
                size="large"
                disabled={!retryable}
                onClick={() => void generate(state.context)}
              >
                Retry once
              </Button>
            )}
            <Link
              href="/trainer/schedule"
              className="inline-flex min-h-12 items-center justify-center rounded-field border border-line bg-surface px-5 py-3 text-body font-bold text-ink-strong no-underline shadow-raised transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800"
            >
              Return to schedule
            </Link>
          </div>
          {isValidation && (
            <p className="mt-4 text-small leading-6 text-neutral-on">
              The assessment surface is reached through the class session on your schedule. This
              screen is keyed on the report, and no governed projection resolves the session and
              student from a refused generation request.
            </p>
          )}
        </section>
      </div>
    );
  }

  const { context, view, hydrating } = state;
  const report = view?.report ?? null;
  const session = view?.session ?? null;

  /*
   * HERO PHASE 6 — the frame's "Lesson" row, built from whichever of number and
   * title is actually recorded, and `null` when neither is.
   *
   * ⛔ LESSON IDENTITY ONLY (G-3). It is display context on this screen and is
   * never mixed with, derived from, or rendered near an assessment fact: the
   * nine governed rating snapshots below are the assessment, and no roll-up of
   * them exists to sit beside this (G-2).
   */
  const lessonLabel = (() => {
    if (session === null) return null;
    const parts = [
      session.lessonNumber === null ? null : String(session.lessonNumber),
      session.lessonTitle,
    ].filter((part): part is string => part !== null && part.length > 0);
    return parts.length === 0 ? null : parts.join(" · ");
  })();

  return (
    <div className="page-grid">
      <PageHeader
        student={context.studentDisplayName}
        status={report?.status ?? "draft_ready"}
        sessionId={report?.sessionId ?? null}
      />

      <FeedbackBanner tone="success" title="Grounded draft ready">
        Grounding validation passed before this wording was stored or shown. The four
        parent-facing panels are ready for your review — nothing is approved, submitted or
        published, and no parent has been notified.
      </FeedbackBanner>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] xl:items-start">
        <div className="grid gap-5">
          {/* The generated-draft card — the frame's primary surface. D1 / D2. */}
          <section className="card overflow-hidden" aria-labelledby="ai-draft-heading">
            <div className="flex items-center gap-3 border-b border-line px-[26px] py-[22px]">
              <Avatar displayName={context.studentDisplayName} size="large" shape="square" />
              <div className="min-w-0">
                {/*
                 * The heading colour sits on an inner `span`. `app/globals.css` still declares
                 * `h1, h2, h3, h4 { color: #1b2b4b }` UNLAYERED (the defect recorded at F-01b,
                 * in a file outside this checkpoint's owned paths), and an unlayered rule
                 * outranks every rule in `@layer utilities`.
                 */}
                <h2 id="ai-draft-heading">
                  <span className="text-[0.8203125rem] font-extrabold text-brand-800">
                    AI Draft — {context.studentDisplayName}
                  </span>
                </h2>
                {/* D1 — the frame's term-report and "Parent copy" framing is replaced. */}
                <p className="mt-0.5 text-[0.703125rem] font-bold text-neutral-on">
                  {session && (
                    <>
                      <span data-vocabulary="class-grade">{session.classGrade}</span>
                      {" · "}
                      {session.moduleName}
                      {" · "}
                    </>
                  )}
                  {report ? `${formatDate(report.sessionDate)} · ` : ""}
                  Per-session draft · Trainer working version
                </p>
              </div>
            </div>

            {hydrating && (
              <div
                className="px-5 py-8 sm:px-6"
                aria-busy="true"
                aria-label="Loading the stored draft panels"
              >
                <span className="sr-only">Loading the stored draft panels</span>
                <div className="skeleton-shimmer h-5 w-1/3 rounded-md" aria-hidden="true" />
                <div className="skeleton-shimmer mt-4 h-4 w-3/4 rounded-md" aria-hidden="true" />
                <div className="skeleton-shimmer mt-2 h-4 w-1/2 rounded-md" aria-hidden="true" />
              </div>
            )}

            {!hydrating && !report && (
              /*
               * Empty state. Generation reported success but the governed Trainer projection
               * returned no readable working version. Nothing is reconstructed from the
               * generation response, and the message discloses no internal reason.
               */
              <div className="px-5 py-12 text-center sm:px-6">
                <p className="text-body font-bold text-ink-strong">
                  The stored draft is not available to display yet.
                </p>
                <p className="mx-auto mt-2 max-w-lg text-small leading-6 text-ink">
                  The draft was generated and stored. Its panels are read through the governed
                  Trainer projection, which returned nothing to show — so nothing is
                  reconstructed here. Open the review surface to continue.
                </p>
              </div>
            )}

            {report && (
              <div className="divide-y divide-line">
                {REPORT_PANEL_CONFIG.map((panel) => {
                  const presentation = PANEL_PRESENTATION[panel.key];
                  return (
                    <article
                      key={panel.key}
                      data-report-panel={panel.key}
                      className="flex gap-[11px] px-[26px] py-[15px]"
                    >
                      <IconTile tone={presentation.tone} size="small">
                        <Icon name={presentation.icon} size={15} />
                      </IconTile>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <h3>
                            <span className="text-[0.8203125rem] font-extrabold text-ink-strong">
                              {panel.label}
                            </span>
                          </h3>
                          {/*
                           * D2 — the frame's per-panel pencil. The governed trainer edit is one
                           * transaction over all four panels on the edit surface, which resets
                           * the checklist and creates a new immutable version (A-021, A-037).
                           * The affordance therefore routes there rather than editing in place;
                           * no second save path is invented.
                           */}
                          <Link
                            href={`/trainer/reports/${report.reportId}/edit`}
                            aria-label={`Edit the ${panel.label} wording`}
                            className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-field px-2.5 py-1.5 text-small font-bold text-neutral-on no-underline transition hover:bg-brand-50 hover:text-brand-800"
                          >
                            <Icon name="document" size={14} />
                            Edit
                          </Link>
                        </div>
                        <p className="mt-[7px] flex gap-[7px] text-[0.8203125rem] font-semibold leading-[1.55] text-ink">
                          {/* Decorative bullet — the frame's marker. Meaning is carried by text. */}
                          <span
                            aria-hidden="true"
                            className="mt-[9px] block size-1.5 shrink-0 rounded-full bg-brand-600"
                          />
                          <span>{report.panels[panel.key]}</span>
                        </p>
                        <p className="mt-1.5 text-[0.71875rem] leading-5 text-neutral-on">
                          {panel.supporting}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/*
            P1-2 — D-5 per-child video evidence.

            ⛔ THE FRAME'S HEADING IS NOT BUILT AS DRAWN, AND THAT IS THE POINT.
            The `19`-era frame draws "Class Video Evidence · MP4, MOV · up to
            500MB each". G-8 REFUSED class footage; D-5 authorizes PER-CHILD
            evidence only, and C-16 ruled 100 MiB, not the frame's 500 MB.
            Building the heading as drawn would put the refused thing on the
            page with the frame apparently agreeing. `REGISTERED-OMISSION`:
            the class framing and the 500 MB figure NEVER END.

            ⚠️ GOVERNANCE-MANDATED COPY BELOW — cited so a later visual pass
            does not remove it for not matching the frame. The visual ladder
            does not outrank a functional ruling (A-045, A-056).
          */}
          <section className="card p-5 sm:p-6" aria-labelledby="child-video-evidence-heading">
            <h2 id="child-video-evidence-heading">
              <span className="text-[1rem] font-semibold text-ink-strong">
                Video Evidence for This Learner
              </span>
            </h2>
            <p className="mt-1 text-[0.75rem] text-neutral-on">
              One recording of this learner&rsquo;s own presentation turn, attached to this
              session&rsquo;s report. MP4 or MOV, up to 100 MB.
            </p>
            {/*
              ✅ P1-2b — BUILT 2026-08-12. ~~`data-evidence-state="transport-not-built"`,
              an inert button and a note reading "The resumable upload transport
              this control needs is not built yet, so the control is inert rather
              than simulated."~~ ⛔ STRUCK AND PRESERVED: it was TRUE and it was
              the right thing to render while it was true — an inert control with
              a stated reason beats a simulated one. The transport now exists.
            */}
            <EvidenceAttachPanel reportId={context.reportId} noteId={evidenceNoteId} />

            {/*
              ⛔ C-3, MANDATORY UI TEXT, AND PART OF THIS PHASE'S ACCEPTANCE.
              The scan gate was REMOVED because no scanning infrastructure
              exists and none will be built. C-3 requires the absence be stated
              in the instrument AND in the product's own text on every upload
              surface. ▶ An honest absence beats a satisfied-looking gate, and
              a gate removed in an instrument but not surfaced here is neither.
              ⚠️ Permanently visible. NOT behind a disclosure, NOT a tooltip.
            */}
            <p
              data-evidence-notice="unscanned"
              className="mt-4 rounded-field border border-line bg-surface px-4 py-3 text-small leading-6 text-ink"
            >
              <strong className="font-semibold text-ink-strong">Uploaded media is not scanned</strong>{" "}
              for malware or harmful content. A production deployment would require scanning before
              real media is handled.
            </p>

            {/*
              ⛔ D-5's retrievability limitation, stated and never denied. The
              product provides NO download control for any role, including
              Parent — and it does NOT claim technical impossibility. No
              surface may say otherwise.
            */}
            <p
              data-evidence-notice="no-download"
              className="mt-2 text-small leading-6 text-ink-subtle"
            >
              Video is streamed for review only. There is no download control for any role.
              Streamed video remains technically retrievable by a determined user with browser
              tooling; this is a deliberate limitation of the affordance, not a technical
              guarantee.
            </p>
          </section>
        </div>

        {/* Right rail — the frame's Report Details, Performance Summary and action stack. */}
        <aside className="grid content-start gap-5" aria-label="Draft detail">
          <section className="card p-5" aria-labelledby="report-details-heading">
            <h2 id="report-details-heading">
              <span className="text-[0.9375rem] font-semibold text-ink-strong">
                Report Details
              </span>
            </h2>
            <dl className="mt-3 divide-y divide-line text-[0.75rem]">
              <DetailRow label="Name" value={context.studentDisplayName} />
              {session && (
                <DetailRow
                  label="Class"
                  value={
                    <>
                      <span data-vocabulary="class-grade">{session.classGrade}</span>
                      {" · "}
                      {session.moduleName}
                    </>
                  }
                />
              )}
              {/*
                HERO PHASE 6 — the frame's "Lesson" row. D4 is DISCHARGED for the
                lesson half: it recorded that no lesson-number or lesson-title field
                existed on any governed Trainer projection, which was correct and was
                deliberately not invented around. Phase 0B added the columns under G-3
                and Phase 4 carried them onto `TrainerSessionSummaryDto`.

                ⚠️ NULL MEANS NOT RECORDED — the whole row disappears. Never "Lesson 1",
                never "TBC". Built from whichever of number/title is actually present.

                ⛔ D4's TERM half and D5's OVERALL GRADE are NOT discharged and never
                will be — see the note below the list, whose reason changed with them.
              */}
              {session && lessonLabel !== null && (
                <DetailRow label="Lesson" value={lessonLabel} />
              )}
              {report && (
                <DetailRow label="Session date" value={formatDate(report.sessionDate)} />
              )}
              {report && (
                <DetailRow label="Version" value={`Revision ${report.revisionNumber}`} />
              )}
              <DetailRow
                label="Status"
                value={<StatusPill status={report?.status ?? "draft_ready"} />}
              />
            </dl>
            {/*
             * D4 (term half) / D5 — "Term" and "Overall Grade" are drawn in the frame and
             * are omitted here. The reason is stated on screen rather than left as a
             * silent gap.
             *
             * ⚠️ THE REASON CHANGED AT HERO PHASE 6 AND THE COPY CHANGED WITH IT. It read
             * "Lesson number, term and a single overall grade are not carried by any
             * governed Trainer projection". Lesson now IS carried, so leaving that
             * sentence would have made it false about lesson — and, worse, it would have
             * kept attributing the term and overall-grade omissions to a MISSING FIELD
             * when both are now RULED OUT: G-4 (a display label is not worth building the
             * substrate an §8-deferred roadmap item needs) and G-2 (permanently excluded
             * on all four surfaces that draw it — on a Trainer surface a roll-up is a
             * derived assessment fact this frontend would be computing).
             *
             * ▶ "We don't have the data" and "we are not allowed to show this" are
             * different statements, and only one of them is still true here. Saying the
             * weaker one would invite a later phase to "fix" a gap that is a decision.
             */}
            <p className="mt-4 text-small leading-6 text-ink">
              A term and a single overall grade are deliberately not shown. Neither is part
              of this report: the nine governed ratings below are the assessment, and no
              roll-up of them exists.
            </p>
          </section>

          {/* D6 — the frame's tile composition across ALL NINE governed snapshots. */}
          {report && (
            <section className="card p-5" aria-labelledby="performance-summary-heading">
              <h2 id="performance-summary-heading">
                <span className="text-[0.75rem] font-semibold uppercase tracking-[0.04em] text-neutral-on">
                  Performance Summary
                </span>
              </h2>
              <p className="mt-1.5 text-[0.71875rem] leading-5 text-ink">
                The nine governed ratings this draft was grounded against. Internal assessment
                substance — not a parent summary.
              </p>
              <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {report.ratingSnapshots.map((rating) => (
                  <li
                    key={rating.dimensionCode}
                    className={`rounded-card px-3.5 py-3 ${RATING_TILE_STYLE[rating.rating]}`}
                  >
                    <span className="block text-[0.5625rem] font-bold uppercase tracking-[0.06em] text-ink">
                      {rating.displayName}
                    </span>
                    <span
                      data-rating-level={rating.rating}
                      className="mt-1 block text-[0.75rem] font-extrabold uppercase tracking-[0.02em]"
                    >
                      {RATING_DISPLAY_LABELS[rating.rating]}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/*
           * D7 — the frame's "Ready to submit? / Confirm & Submit / Save as draft" panel. The
           * governed Trainer action is APPROVE, gated on the three-item version-scoped Quality
           * Checklist on the review surface, and the Trainer does not publish.
           */}
          <section
            className="rounded-[18px] bg-accent-ink p-5 text-white"
            aria-labelledby="next-step-heading"
          >
            <h2 id="next-step-heading">
              <span className="text-[0.9375rem] font-semibold text-white">
                Ready for your review
              </span>
            </h2>
            <p className="mt-2 text-[0.71875rem] leading-[1.52] text-white/85">
              AI supplied wording only. You review every panel, complete the three-item Quality
              Checklist, then approve — which sends this exact version to management for the
              final quality review. You do not publish, and no parent is notified at this step.
            </p>
            <Link
              href={`/trainer/reports/${state.result.reportId}/review`}
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-[11px] bg-brand-700 px-5 py-3 text-[0.84375rem] font-semibold text-white no-underline transition hover:bg-brand-800"
            >
              Review four-panel report
            </Link>
            {report && (
              <Link
                href={`/trainer/reports/${report.reportId}/edit`}
                className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-[11px] border border-white/25 px-5 py-3 text-[0.78125rem] font-semibold text-white no-underline transition hover:bg-white/10"
              >
                Edit wording first
              </Link>
            )}
            <p className="mt-4 text-[0.71875rem] leading-5 text-white/70">
              The validated draft is already stored as an immutable version by generation, so
              there is no separate save step here.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

function PageHeader({
  student,
  status,
  sessionId = null,
}: {
  readonly student: string;
  readonly status: TrainerWorkingReportDto["status"];
  readonly sessionId?: string | null;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-[1.375rem] font-bold text-ink-strong">
          AI Report Generation
        </h1>
        <nav aria-label="Breadcrumb" className="mt-1">
          <ol className="flex flex-wrap items-center gap-x-2 text-[0.71875rem] font-medium text-neutral-on">
            <li>
              <Link
                href="/trainer/schedule"
                className="font-semibold text-neutral-on underline-offset-4 hover:text-brand-800"
              >
                Schedule
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>{student}</li>
          </ol>
        </nav>
        <Link
          href={sessionId ? `/trainer/sessions/${sessionId}/roster` : "/trainer/schedule"}
          className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-field bg-brand-100 px-4 py-2.5 text-body font-bold text-brand-800 no-underline transition hover:bg-brand-200"
        >
          <Icon name="chevronLeft" size={16} />
          {sessionId ? "Back to Student Roster" : "Back to schedule"}
        </Link>
      </div>
      <div className="shrink-0 sm:pt-2">
        <StatusPill status={status} />
      </div>
    </header>
  );
}

function DetailRow({
  label,
  value,
}: {
  readonly label: string;
  readonly value: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <dt className="text-small text-neutral-on">{label}</dt>
      <dd className="text-right text-body font-bold text-ink-strong">{value}</dd>
    </div>
  );
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-SG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

/**
 * ⛔ P1-2b — THE TRAINER'S ATTACH CONTROL.
 *
 * FOUR STEPS, AND THE SPLIT BETWEEN THEM IS THE GOVERNANCE BOUNDARY:
 *   1. the server mints a ticket — an id and a path, and NOT an authorization;
 *   2. the bytes go DIRECTLY to storage under the one RLS INSERT policy, which
 *      re-derives trainer authority over the report in the path (ADR-4);
 *   3. `confirmEvidenceAttach` is the GOVERNED ACT — it emits
 *      `evidence.attached` in the same transaction as the row;
 *   4. only then does the clip exist for any reader.
 *
 * ⚠️ THE UI NEVER REPORTS SUCCESS BEFORE STEP 3. An uploaded object that was
 * not attached is bytes with a name: no row, no audit event, no read path.
 * Telling the trainer "attached" after step 2 would be the affordance-without-
 * a-backing this project refuses — and here it would also be a claim about an
 * AUDITED act that never happened.
 *
 * ⚠️ THE REFUSAL REASONS ARE SHOWN, DELIBERATELY. The RPC discriminates only
 * AFTER it has proven the caller is the authoring trainer; every authorization
 * failure collapses to one undifferentiated `not_permitted`. Surfacing the
 * rest is the same principle that put the size ceiling on this page: a trainer
 * who cannot tell why an upload failed will retry it, which is the worst
 * outcome on a classroom network.
 */
const ATTACH_REASON_COPY: Readonly<Record<string, string>> = {
  already_attached:
    "This report already has a recording. Remove the existing one before attaching another.",
  too_large: "That file is larger than 100 MB.",
  unsupported_type: "That file is not an MP4 or MOV.",
  object_missing: "The upload did not finish. Try attaching the recording again.",
  object_ambiguous:
    "More than one uploaded file matches this attempt. Try attaching the recording again.",
  not_permitted: "This recording cannot be attached to this report.",
};

function EvidenceAttachPanel({
  reportId,
  noteId,
}: {
  readonly reportId: string;
  readonly noteId: string;
}) {
  const port = usePhysicalTestPort();
  const inputId = useId();
  const [clips, setClips] = useState<readonly ReportEvidenceClipDto[] | null>(null);
  const [busy, setBusy] = useState<"idle" | "uploading" | "attaching" | "removing">("idle");
  const [sent, setSent] = useState(0);
  const [total, setTotal] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const result = await port.listReportEvidence(reportId);
    // ⚠️ Q-7: a rejected read is NOT an empty list. `null` renders as "cannot
    // be shown", never as "no recording attached" — the two are different
    // facts and the second one invites an upload that will then be refused.
    setClips(result.outcome === "success" ? result.data : null);
  }, [port, reportId]);

  // The project's established load pattern: the effect starts the read and an
  // `active` flag discards a late reply, so an unmounted panel never writes
  // state and a stale reply never overwrites a fresher one.
  useEffect(() => {
    let active = true;
    void port.listReportEvidence(reportId).then((result) => {
      if (!active) return;
      setClips(result.outcome === "success" ? result.data : null);
    });
    return () => {
      active = false;
    };
  }, [port, reportId]);

  async function attach(file: File) {
    setMessage(null);
    setBusy("uploading");
    setSent(0);
    setTotal(file.size);

    const ticket = await port.createEvidenceUploadTicket({
      reportId,
      mediaType: file.type,
      byteSize: file.size,
    });
    if (ticket.outcome !== "success") {
      setBusy("idle");
      setMessage("This recording cannot be attached to this report.");
      return;
    }

    const uploaded = await uploadEvidenceResumable(file, ticket.data, (p) => {
      setSent(p.sentBytes);
    });
    if (uploaded.outcome !== "success") {
      setBusy("idle");
      // ⛔ A REFUSAL AND A NETWORK FAILURE READ DIFFERENTLY, because retrying
      // is right for one and wrong for the other.
      setMessage(
        uploaded.outcome === "refused"
          ? "That recording was refused. Check it is an MP4 or MOV under 100 MB."
          : "The upload did not complete. Check your connection and try again.",
      );
      return;
    }

    setBusy("attaching");
    const confirmed = await port.confirmEvidenceAttach({
      reportId,
      evidenceId: ticket.data.evidenceId,
    });
    setBusy("idle");
    if (confirmed.outcome !== "success") {
      setMessage("This recording cannot be attached to this report.");
      return;
    }
    if (!confirmed.data.attached) {
      setMessage(ATTACH_REASON_COPY[confirmed.data.reason] ?? ATTACH_REASON_COPY.not_permitted);
      return;
    }
    await refresh();
  }

  async function remove(evidenceId: string) {
    setMessage(null);
    setBusy("removing");
    const result = await port.removeEvidence(evidenceId);
    setBusy("idle");
    if (result.outcome !== "success") {
      setMessage("This recording could not be removed.");
      return;
    }
    await refresh();
  }

  const working = busy !== "idle";

  return (
    <div
      data-evidence-state={clips === null ? "unavailable" : clips.length > 0 ? "attached" : "empty"}
      className="mt-4 rounded-panel border border-dashed border-line-strong bg-surface-muted px-6 py-8"
    >
      {clips === null ? (
        <p className="text-center text-small leading-6 text-ink">
          Attached recordings cannot be shown right now.
        </p>
      ) : clips.length > 0 ? (
        <ul className="grid gap-3">
          {clips.map((clip) => (
            <li
              key={clip.id}
              data-evidence-clip={clip.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-field border border-line bg-surface px-4 py-3"
            >
              {/*
                ⛔ THE DEFECT THE OPERATOR'S WALKTHROUGH ACTUALLY FOUND.
                This region rendered "Recording attached · MP4 · 1.6 MB" and
                a Remove control — and NO PLAYER. ▶ The one role that
                uploads the clip was the one role that could not watch it,
                while the parent surface had a player from the day P1-5
                shipped. The attach persisted correctly; the surface simply
                had no way to show what it had attached.
              */}
              <EvidenceClipPlayer clip={clip} mint={(id) => port.mintEvidenceViewUrl(id)} />
              {/*
                ⛔ REMOVAL IS TRAINER-ONLY AND IS **NOT** LIMITED TO
                PRE-SUBMITTED (Operator ruling). Removal WITHDRAWS media rather
                than editing an approved artefact — and if a wrong clip has
                reached a parent, the trainer must be able to pull it. Gating
                this control on status would take that away exactly when it
                matters most.
              */}
              <button
                type="button"
                data-evidence-remove={clip.id}
                onClick={() => void remove(clip.id)}
                disabled={working}
                className="inline-flex min-h-11 items-center rounded-field border border-line bg-surface px-4 py-2 text-[0.78125rem] font-semibold text-ink disabled:opacity-60"
              >
                {busy === "removing" ? "Removing…" : "Remove recording"}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center">
          <label
            htmlFor={inputId}
            className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-field border border-line bg-surface px-4 py-2.5 text-[0.78125rem] font-semibold text-ink"
          >
            Attach this learner&rsquo;s recording
            <Icon name="chevronRight" size={16} />
          </label>
          <input
            id={inputId}
            type="file"
            accept="video/mp4,video/quicktime"
            aria-describedby={noteId}
            disabled={working}
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              // The input is cleared so re-selecting the same file re-fires.
              event.target.value = "";
              if (file) void attach(file);
            }}
          />
          <p id={noteId} className="mx-auto mt-3 max-w-md text-small leading-6 text-ink">
            One recording of this learner&rsquo;s own presentation turn. MP4 or MOV, up to 100 MB.
            Large uploads resume automatically if the connection drops.
          </p>
        </div>
      )}

      {working && (
        <p
          data-evidence-progress={busy}
          aria-live="polite"
          className="mt-4 text-center text-small leading-6 text-ink"
        >
          {busy === "uploading"
            ? `Uploading… ${total > 0 ? Math.floor((sent / total) * 100) : 0}%`
            : busy === "attaching"
              ? "Attaching the recording to this report…"
              : "Removing…"}
        </p>
      )}

      {message && (
        <p
          data-evidence-message="refusal"
          role="status"
          className="mt-4 text-center text-small leading-6 text-ink-strong"
        >
          {message}
        </p>
      )}
    </div>
  );
}
