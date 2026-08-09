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
  RatingLevel,
  RequestDraftSuccess,
  TrainerSessionSummaryDto,
  TrainerWorkingReportDto,
} from "@/lib/frontend/contracts/physical-test";
import type { UiActionResult } from "@/lib/frontend/contracts/result";
import { RATING_DISPLAY_LABELS } from "@/lib/frontend/fixtures/dimensions";
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
 *     THE TREATMENT BELOW IS UNCHANGED, and the reason it survives is now the accurate one:
 *     the evidence schema is excluded from the Step 7E boundary, `PhysicalTestPort` exposes NO
 *     upload or evidence-read path, `Evidence Pending` is deliberately not a stored status
 *     (A-036), and implementation is Phase B. So the affordance still has no governed backing —
 *     it is unbuilt, not undecided.
 *     The region is KEPT with the frame's label and rendered INERT with a visible,
 *     programmatically associated reason — the F-04 D1 / F-11 "Send Reminder to Trainer"
 *     treatment. NO UPLOADER IS INVENTED and the frame's format/size limits are omitted rather
 *     than fabricated, because they would be an unratified policy.
 *  D4 Report Details rows "Lesson" and "Term". No lesson-number, lesson-title or term field
 *     exists on any governed Trainer projection; `DraftGenerationContextDto` carries only
 *     `reportId`, `studentDisplayName`, `observationLockVersion` and `status`. Omitted rather
 *     than fabricated, and recorded as a dependency.
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
const RATING_TILE_STYLE: Readonly<Record<RatingLevel, string>> = {
  beginning: "bg-rating-1-soft text-rating-1-on-soft",
  developing: "bg-rating-2-soft text-rating-2-on-soft",
  mastering: "bg-rating-3-soft text-rating-3-on-soft",
  mastered: "bg-rating-4-soft text-rating-4-on-soft",
};

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
            <span className="text-section-title font-extrabold text-ink-strong">
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
            <span className="text-card-title font-extrabold text-ink-strong">
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

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,21rem)] xl:items-start">
        <div className="grid gap-5">
          {/* The generated-draft card — the frame's primary surface. D1 / D2. */}
          <section className="card overflow-hidden" aria-labelledby="ai-draft-heading">
            <div className="flex items-center gap-3.5 border-b border-line px-5 py-5 sm:px-6">
              <Avatar displayName={context.studentDisplayName} size="large" shape="square" />
              <div className="min-w-0">
                {/*
                 * The heading colour sits on an inner `span`. `app/globals.css` still declares
                 * `h1, h2, h3, h4 { color: #1b2b4b }` UNLAYERED (the defect recorded at F-01b,
                 * in a file outside this checkpoint's owned paths), and an unlayered rule
                 * outranks every rule in `@layer utilities`.
                 */}
                <h2 id="ai-draft-heading">
                  <span className="text-card-title font-extrabold text-brand-800">
                    AI Draft — {context.studentDisplayName}
                  </span>
                </h2>
                {/* D1 — the frame's term-report and "Parent copy" framing is replaced. */}
                <p className="mt-0.5 text-small font-semibold text-neutral-on">
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
                      className="flex gap-4 px-5 py-5 sm:px-6"
                    >
                      <IconTile tone={presentation.tone} size="small">
                        <Icon name={presentation.icon} size={15} />
                      </IconTile>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <h3>
                            <span className="text-body font-extrabold text-ink-strong">
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
                        <p className="mt-2 flex gap-2.5 text-body font-semibold leading-7 text-ink">
                          {/* Decorative bullet — the frame's marker. Meaning is carried by text. */}
                          <span
                            aria-hidden="true"
                            className="mt-2.5 block size-1.5 shrink-0 rounded-full bg-brand-600"
                          />
                          <span>{report.panels[panel.key]}</span>
                        </p>
                        <p className="mt-1.5 text-small leading-6 text-neutral-on">
                          {panel.supporting}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* D3 — frame region kept, rendered inert. No uploader and no limits invented. */}
          <section className="card p-5 sm:p-6" aria-labelledby="class-video-evidence-heading">
            <h2 id="class-video-evidence-heading">
              <span className="text-card-title font-extrabold text-ink-strong">
                Class Video Evidence
              </span>
            </h2>
            <p className="mt-1 text-small text-neutral-on">
              Recordings from this session to support the report
            </p>
            <div
              data-evidence-state="unavailable"
              className="mt-4 grid min-h-44 place-items-center rounded-panel border border-dashed border-line-strong bg-surface-muted px-6 py-10 text-center"
            >
              <div>
                <button
                  type="button"
                  disabled
                  aria-describedby={evidenceNoteId}
                  className="inline-flex min-h-11 cursor-not-allowed items-center gap-2 rounded-field border border-line bg-surface px-4 py-2.5 text-body font-bold text-ink-subtle"
                >
                  Attach class recording
                  <Icon name="chevronRight" size={16} />
                </button>
                <p
                  id={evidenceNoteId}
                  className="mx-auto mt-3 max-w-md text-small leading-6 text-ink"
                >
                  Evidence upload is inactive in this workspace. Evidence capture is a required
                  part of the final product and the Trainer is the person who will upload it, but
                  the evidence schema and its governed upload path are not built yet — so this
                  control is inert rather than simulated.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Right rail — the frame's Report Details, Performance Summary and action stack. */}
        <aside className="grid content-start gap-5" aria-label="Draft detail">
          <section className="card p-5" aria-labelledby="report-details-heading">
            <h2 id="report-details-heading">
              <span className="text-card-title font-extrabold text-ink-strong">
                Report Details
              </span>
            </h2>
            <dl className="mt-3 divide-y divide-line text-body">
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
             * D4 / D5 — "Lesson", "Term" and "Overall Grade" are drawn in the frame and are
             * omitted here. The reason is stated on screen rather than left as a silent gap.
             */}
            <p className="mt-4 text-small leading-6 text-ink">
              Lesson number, term and a single overall grade are not carried by any governed
              Trainer projection, so they are omitted rather than estimated.
            </p>
          </section>

          {/* D6 — the frame's tile composition across ALL NINE governed snapshots. */}
          {report && (
            <section className="card p-5" aria-labelledby="performance-summary-heading">
              <h2 id="performance-summary-heading">
                <span className="text-micro font-extrabold uppercase tracking-[0.12em] text-neutral-on">
                  Performance Summary
                </span>
              </h2>
              <p className="mt-1.5 text-small leading-6 text-ink">
                The nine governed ratings this draft was grounded against. Internal assessment
                substance — not a parent summary.
              </p>
              <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {report.ratingSnapshots.map((rating) => (
                  <li
                    key={rating.dimensionCode}
                    className={`rounded-card px-3.5 py-3 ${RATING_TILE_STYLE[rating.rating]}`}
                  >
                    <span className="block text-micro font-bold uppercase tracking-[0.1em] text-ink">
                      {rating.displayName}
                    </span>
                    <span
                      data-rating-level={rating.rating}
                      className="mt-1 block text-body font-extrabold uppercase tracking-[0.04em]"
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
            className="rounded-panel bg-accent-ink p-5 text-white"
            aria-labelledby="next-step-heading"
          >
            <h2 id="next-step-heading">
              <span className="text-card-title font-extrabold text-white">
                Ready for your review
              </span>
            </h2>
            <p className="mt-2 text-small leading-6 text-white/85">
              AI supplied wording only. You review every panel, complete the three-item Quality
              Checklist, then approve — which sends this exact version to management for the
              final quality review. You do not publish, and no parent is notified at this step.
            </p>
            <Link
              href={`/trainer/reports/${state.result.reportId}/review`}
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-field bg-brand-700 px-5 py-3 text-body font-extrabold text-white no-underline transition hover:bg-brand-800"
            >
              Review four-panel report
            </Link>
            {report && (
              <Link
                href={`/trainer/reports/${report.reportId}/edit`}
                className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-field border border-white/25 px-5 py-3 text-body font-bold text-white no-underline transition hover:bg-white/10"
              >
                Edit wording first
              </Link>
            )}
            <p className="mt-4 text-small leading-6 text-white/70">
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
        <h1 className="text-page-title font-extrabold tracking-[-0.02em] text-ink-strong">
          AI Report Generation
        </h1>
        <nav aria-label="Breadcrumb" className="mt-1">
          <ol className="flex flex-wrap items-center gap-x-2 text-small text-neutral-on">
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
