"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { Avatar, initialsFrom } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FeedbackBanner } from "@/components/ui/feedback-banner";
import { Icon, IconTile } from "@/components/ui/icon";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { StatePanel } from "@/components/ui/state-panel";
import { StatusPill } from "@/components/ui/status-pill";
import {
  DIMENSION_CODES,
  RATING_LEVELS,
  type AssessmentDraftDto,
  type CorrectionRequestDto,
  type DimensionCode,
  type DimensionDto,
  type RatingLevel,
  type RosterEntryDto,
  type SaveObservationSuccess,
  type TrainerSessionSummaryDto,
} from "@/lib/frontend/contracts/physical-test";
import { RATING_DISPLAY_LABELS } from "@/lib/frontend/fixtures/dimensions";
import type { UiActionResult } from "@/lib/frontend/contracts/result";
import { usePhysicalTestPort, usePortalRuntime } from "@/features/portal/portal-runtime-context";
import { asFailure, type ResourceState } from "./resource-state";

/**
 * Screen 07 — Trainer Grade Student (FRONTEND RECONSTRUCTION F7 / operator checkpoint F-07).
 *
 * Route: `/trainer/sessions/[sessionId]/students/[studentId]/assess` — the PINNED implemented
 * path. The canonical route recorded for this screen is
 * `/trainer/schedule/[sessionId]/student-roster/[studentId]/grade-student` and its treatment is
 * `Replace after integration; pinned path preserved as a redirect` (inventory §7.2,
 * `screen.md` §1). That move is a separately-authorized route-migration checkpoint, so NO route
 * is created, moved, renamed or redirected here.
 *
 * Visual authority (Amendment 005 A-045): the frozen
 * `UI_REFERENCE_FINAL_MVP/07-trainer-grade-student/reference.png` (node `784:679`) ->
 * node-specific Figma -> existing implementation. Figma never bypasses governance: where the
 * frame and a ratified rule disagree the RULE WINS, the prohibited thing is OMITTED, and the
 * divergence is RECORDED in this screen's `implementation-notes.md` and in the workstream log —
 * never silently resolved.
 *
 * THIS IS THE ASSESSMENT INSTRUMENT. The governance density is the point:
 *
 *  - ALL NINE DIMENSIONS ARE MANDATORY (A-017). There is exactly ONE capture mode: the full
 *    nine. Quick mode is REMOVED COMPLETELY — there is no four-dimension path, no mode toggle,
 *    no `observations.mode`, no `mode` prop and no `mode` branch anywhere in this file or the
 *    port it calls. The nine are rendered from `DIMENSION_CODES`, which IS the ratified order:
 *    Body · Emotion · Speech · Tonality (competency) then Eye Contact · Vocal Projection ·
 *    Emotional Expression · Sentence Flow · Audience Awareness (speech linguistics).
 *  - EVERY DIMENSION SURFACES ITS BEHAVIOURAL ANCHOR ALONGSIDE THE RATING (`CLAUDE.md` §5).
 *    The anchors are byte-identical to the backend (A-050, proven by digest at F-06) and are
 *    rendered VERBATIM — never reworded, re-wrapped or paraphrased. Each chip additionally
 *    carries its own level's anchor in its accessible name, so the behavioural meaning reaches
 *    a screen-reader user BEFORE the selection is made, not only after.
 *  - COMPLETION IS VALIDATED SERVER-SIDE (ADR-3, `screen.md` §7). `complete` here gates a
 *    button and reveals a banner; it is UX convenience only and the copy says so. The governed
 *    save re-validates all nine independently, and nothing on this screen implies otherwise.
 *  - "FOLLOW-UP FOR NEXT SESSION" AND REVIEW & APPROVE'S "COACH NOTES (INTERNAL ONLY)" ARE THE
 *    SAME `observations.follow_up_notes` COLUMN (`CLAUDE.md` §6). The current value is LOADED
 *    into the field — never rendered blank — so the trainer edits their earlier note rather
 *    than silently overwriting it.
 *  - RATINGS ARE LEGITIMATELY VISIBLE HERE. This is a Trainer surface, not a Parent or
 *    Management surface. The per-dimension grid that is a caught leak on a parent surface is
 *    the actual instrument on this one.
 *  - SELECTION IS NEVER CARRIED BY COLOUR ALONE (`GLOBAL_UI_RULES` §7). A selected level
 *    carries `aria-pressed="true"`, a check glyph, ", selected" inside its accessible name, a
 *    2px border that survives forced-colours mode, and the visible anchor line naming the
 *    chosen level in words.
 *
 * FRAME-VERSUS-GOVERNANCE DIVERGENCES (recorded, not resolved locally):
 *
 *  D1 ROW ORDER. The frame lists the nine rows as Body · Eye contact · Emotion · Speech ·
 *     Tonality · Vocal projection · Emotional expression · Sentence flow · Audience awareness —
 *     the two governed groups INTERLEAVED. The ratified order is the four B.E.S.T Competency
 *     dimensions followed by the five Speech Linguistics Pattern dimensions (`CLAUDE.md` §5,
 *     spec §3). Governance wins: the rows render in ratified order, and the two groups are
 *     captioned so the framework structure the frame's order obscures stays legible.
 *  D2 NO ANCHOR IS DRAWN IN THE FRAME. The frame shows a bare four-segment track with no
 *     behavioural anchor anywhere. `CLAUDE.md` §5 requires the anchor to be carried alongside
 *     the rating. Governance wins: the anchor line is ADDED beneath every row. This is a
 *     required addition, not a liberty.
 *  D3 NO "FOLLOW-UP FOR NEXT SESSION" FIELD IS DRAWN. The frame shows only "Observation
 *     Notes". `observations.follow_up_notes` is one field surfaced on two screens and must be
 *     loaded, not blanked (`CLAUDE.md` §6). Governance wins: the field is ADDED to the
 *     Observation Notes card and its loaded value is preserved.
 *  D4 "Junior · Student ID 2025-113 · Public Speaking". "Junior" is not a governed Class Grade
 *     — the only Class Grade values are Beginner / Intermediate / Advanced (A-016, A-054) — and
 *     no governed learner-facing student number exists on any DTO. Rendering the internal
 *     `studentId` as a "Student ID" would manufacture a user-facing identifier. Both are
 *     OMITTED; the identity card carries the governed Class Grade, Class Module and session
 *     date instead.
 *  D5 SELECTED-CHIP FILLS. The frame paints the selected segment in the saturated ramp colour
 *     with white label text. Measured, those four pairs are 3.70 / 2.03 / 2.34 / 2.51 : 1 —
 *     all four fail SC 1.4.3 for normal-size text. The ratified accessibility requirement wins
 *     (`GLOBAL_UI_RULES` §7, persona §3.5): the fill moves to the same hue's deeper step from
 *     the F1 ramp — hue preserved, luminance moved, exactly the adjudication F1 recorded for
 *     the status tints and F-04 recorded for the primary action.
 *  D6 THE FRAME DRAWS EIGHT SYNTHETIC LEARNERS IN THE REVIEW & APPROVE RAIL. Figma mock data
 *     is never ported (`GLOBAL_UI_RULES` §8): the rail renders exactly what the governed roster
 *     projection returns for this Class Session, in the frame's composition.
 *  D7 THE FRAME GIVES EVERY RAIL LEARNER A LIFECYCLE STATUS. An ABSENT learner gets none here,
 *     and no path — absence must never create or expose a fabricated assessment or report
 *     (A-018), the same rule F-05 holds on the roster. Absent learners are also excluded from
 *     the four counters, which count report states only.
 *  D8 The frame highlights "Schedule" in the left rail and draws a "Students" and "Reports"
 *     nav item this build does not carry. That rail is `components/layout/portal-shell.tsx`,
 *     outside this checkpoint's owned paths — the same adjudication F-05 recorded as its D7.
 */

/**
 * Amendment 006 A-049 display labels, treated by the A-051 POLARITY BAND each level carries —
 * never by the grammatical form of the label. `mastering` is `positive`, so it keeps a positive
 * treatment; only `beginning` reads as needs-support. The two positive levels are distinguished
 * by HUE (teal / green), never by one of them reading negative.
 *
 * The selected fill is the deeper step of the SAME hue the frame paints (D5): white label text
 * on the frame's own fills measures 2.03–3.70:1 and fails SC 1.4.3, so luminance moves and hue
 * does not. Idle segments carry `text-ink` on the muted track, measured well clear of 4.5:1.
 *
 * These are COMPETENCY ratings. The Class Grade vocabulary rendered elsewhere in the Trainer
 * flow (`Beginner` / `Intermediate` / `Advanced`) is a different, unchanged vocabulary (A-054)
 * and is not styled from this table.
 */
const ratingStyles: Readonly<Record<RatingLevel, { idle: string; selected: string }>> = {
  beginning: {
    idle: "border-transparent text-ink hover:bg-rating-1-soft hover:text-rating-1-on-soft",
    selected: "border-rating-1-on-soft bg-rating-1-on-soft text-white",
  },
  developing: {
    idle: "border-transparent text-ink hover:bg-rating-2-soft hover:text-rating-2-on-soft",
    selected: "border-rating-2-on-soft bg-rating-2-on-soft text-white",
  },
  mastering: {
    idle: "border-transparent text-ink hover:bg-rating-3-soft hover:text-rating-3-on-soft",
    selected: "border-rating-3-on-soft bg-rating-3-on-soft text-white",
  },
  mastered: {
    idle: "border-transparent text-ink hover:bg-rating-4-soft hover:text-rating-4-on-soft",
    selected: "border-rating-4-on-soft bg-rating-4-on-soft text-white",
  },
};

/**
 * The frame's four REVIEW & APPROVE counters, mapped onto the governed report states.
 *
 * This is PRESENTATION GROUPING over statuses the server already resolved — it adds no status
 * to the ratified eight (A-036), creates no transition, and is never read as authority. An
 * absent learner is counted in none of them (D7).
 */
const REVIEW_BUCKETS = [
  {
    key: "not_started",
    label: "Not started",
    tone: "bg-brand-50 text-brand-800",
    states: ["no_report", "incomplete"],
  },
  {
    key: "in_progress",
    label: "In progress",
    tone: "bg-warning-soft text-warning-on",
    states: ["observation_saved", "drafting", "draft_ready", "needs_edit"],
  },
  {
    key: "pending_approval",
    label: "Pending approval",
    tone: "bg-info-soft text-info-on",
    states: ["trainer_approved"],
  },
  {
    key: "approved",
    label: "Approved",
    tone: "bg-success-soft text-success-on",
    states: ["approved", "submitted"],
  },
] as const satisfies readonly {
  readonly key: string;
  readonly label: string;
  readonly tone: string;
  readonly states: readonly RosterEntryDto["reportState"][];
}[];

type AssessmentView = {
  readonly draft: AssessmentDraftDto;
  readonly dimensions: readonly DimensionDto[];
};

export function TrainerAssessment() {
  const params = useParams<{ sessionId: string; studentId: string }>();
  const router = useRouter();
  const port = usePhysicalTestPort();
  const { dataRevision } = usePortalRuntime();
  const [resource, setResource] = useState<ResourceState<AssessmentView>>({ kind: "loading" });
  const [roster, setRoster] = useState<readonly RosterEntryDto[] | null>(null);
  const [session, setSession] = useState<TrainerSessionSummaryDto | null>(null);
  const [ratings, setRatings] = useState<Record<DimensionCode, RatingLevel | null>>(
    () => Object.fromEntries(DIMENSION_CODES.map((code) => [code, null])) as Record<
      DimensionCode,
      RatingLevel | null
    >,
  );
  const [notes, setNotes] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [lockVersion, setLockVersion] = useState(0);
  const [showValidation, setShowValidation] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<UiActionResult<SaveObservationSuccess> | null>(null);
  const [correction, setCorrection] = useState<CorrectionRequestDto | null>(null);
  const fieldsets = useRef<Partial<Record<DimensionCode, HTMLFieldSetElement | null>>>({});

  useEffect(() => {
    let active = true;
    void Promise.all([
      port.getAssessmentDraft(params.sessionId, params.studentId),
      port.getDimensions(),
    ]).then(async ([draftResult, dimensionsResult]) => {
      if (!active) return;
      if (draftResult.outcome !== "success") {
        setResource({ kind: "failed", result: asFailure(draftResult) });
        return;
      }
      if (dimensionsResult.outcome !== "success") {
        setResource({ kind: "failed", result: asFailure(dimensionsResult) });
        return;
      }
      const loadedRatings = Object.fromEntries(
        draftResult.data.ratings.map((item) => [item.dimensionCode, item.rating]),
      ) as Record<DimensionCode, RatingLevel | null>;
      setRatings(loadedRatings);
      setNotes(draftResult.data.notes);
      /*
       * `observations.follow_up_notes` is ONE field surfaced on TWO screens (`CLAUDE.md` §6).
       * The loaded value is put into the field so the trainer edits their earlier note; it is
       * never rendered blank, which would let a save silently discard it.
       */
      setFollowUp(draftResult.data.followUp);
      setLockVersion(draftResult.data.observationLockVersion);
      /*
       * F16-C — `reportId` is null until the governed backend creates the report
       * (report creation is owned by `requestDraft`/RPC-1). No report id means
       * there is no working report to read and therefore no open correction; we
       * do not invent an identifier to ask about.
       */
      const workingResult =
        draftResult.data.reportId === null
          ? null
          : await port.getTrainerWorkingReport(draftResult.data.reportId);
      if (!active) return;
      if (
        workingResult !== null &&
        workingResult.outcome === "success" &&
        workingResult.data.status === "needs_edit" &&
        workingResult.data.openCorrection?.status === "open"
      ) {
        setCorrection(workingResult.data.openCorrection);
      }
      setResource({
        kind: "ready",
        data: { draft: draftResult.data, dimensions: dimensionsResult.data },
      });
    });
    return () => {
      active = false;
    };
  }, [params.sessionId, params.studentId, port, dataRevision]);

  /*
   * Session context for the identity card and the REVIEW & APPROVE rail. Both are secondary
   * context: a failure here must not take down the assessment instrument, so each resolves to
   * a non-disclosing empty rail rather than to a failed screen.
   */
  useEffect(() => {
    let active = true;
    void Promise.all([
      port.getSessionRoster(params.sessionId),
      port.listTrainerSessions(),
    ]).then(([rosterResult, sessionsResult]) => {
      if (!active) return;
      setRoster(rosterResult.outcome === "success" ? rosterResult.data : []);
      setSession(
        sessionsResult.outcome === "success"
          ? (sessionsResult.data.find((item) => item.sessionId === params.sessionId) ?? null)
          : null,
      );
    });
    return () => {
      active = false;
    };
  }, [params.sessionId, port, dataRevision]);

  const ratedCount = useMemo(
    () => DIMENSION_CODES.filter((code) => ratings[code] !== null).length,
    [ratings],
  );
  const complete = ratedCount === DIMENSION_CODES.length;
  const firstMissing = DIMENSION_CODES.find((code) => ratings[code] === null);

  function revealValidation() {
    setShowValidation(true);
    if (firstMissing) {
      fieldsets.current[firstMissing]?.scrollIntoView({ behavior: "smooth", block: "center" });
      fieldsets.current[firstMissing]?.focus({ preventScroll: true });
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (resource.kind !== "ready") return;
    if (!complete) {
      revealValidation();
      return;
    }
    setSaving(true);
    setSaveResult(null);
    const result = await port.saveObservation({
      reportId: resource.data.draft.reportId,
      sessionId: resource.data.draft.sessionId,
      studentId: resource.data.draft.studentId,
      ratings: DIMENSION_CODES.map((dimensionCode) => ({
        dimensionCode,
        rating: ratings[dimensionCode],
      })),
      notes,
      followUp,
      observationLockVersion: lockVersion,
    });
    setSaving(false);
    setSaveResult(result);
    if (result.outcome === "success") {
      setLockVersion(result.data.observationLockVersion);
      /*
       * R-C2-1 — the governed save now opens the report shell ATOMICALLY and
       * returns its REAL identifier. We navigate through THAT value and only
       * that value: it is never constructed, concatenated from the session and
       * student, cast, defaulted or guessed here. The null branch is retained
       * because the port contract still types the field nullable (the
       * deterministic fixture shares this surface); a null id renders the
       * existing success banner rather than a link to a fabricated route.
       *
       * A correction save deliberately does NOT auto-navigate: the correction
       * flow's next step is the trainer edit surface, which the banner offers
       * explicitly.
       */
      if (!correction && result.data.reportId !== null) {
        router.push(`/trainer/reports/${result.data.reportId}/generate`);
        return;
      }
    }
  }

  if (resource.kind === "loading") {
    return <LoadingSkeleton label="Loading the nine-dimension Assessment Rubric" rows={5} />;
  }
  if (resource.kind === "failed") return <StatePanel result={resource.result} />;

  const { draft, dimensions } = resource.data;
  const saveComplete = saveResult?.outcome === "success";
  const competency = dimensions.filter((item) => item.group === "competency");
  const linguistics = dimensions.filter((item) => item.group === "speech_linguistics");

  return (
    <div className="page-grid">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-page-title font-extrabold tracking-[-0.02em] text-ink-strong">
            Grade Student
          </h1>
          <p className="mt-1 max-w-2xl text-body leading-6 text-ink">
            All nine governed dimensions are required. Each level&rsquo;s behavioural anchor
            stays visible beside the choices.
          </p>
        </div>
        <Link
          href={`/trainer/sessions/${draft.sessionId}/roster`}
          className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-field bg-brand-100 px-4 py-2.5 text-body font-bold text-brand-800 no-underline transition hover:bg-brand-200"
        >
          <Icon name="chevronLeft" size={16} />
          Back to Student Roster
        </Link>
      </header>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,15.5rem)_minmax(0,1fr)]">
        <ReviewApproveRail
          roster={roster}
          sessionId={draft.sessionId}
          currentStudentId={draft.studentId}
        />

        <form className="page-grid min-w-0" onSubmit={handleSubmit} noValidate>
          {/* Student identity card (D4: no fabricated year label, no invented student number). */}
          <section className="card flex flex-wrap items-center gap-4 p-5" aria-label="Learner">
            <Avatar displayName={draft.studentDisplayName} size="large" />
            <div className="min-w-0">
              <h2 className="text-section-title font-extrabold">
                <span className="text-ink-strong">{draft.studentDisplayName}</span>
              </h2>
              <p className="mt-0.5 text-body text-ink">
                {session ? (
                  <>
                    <span data-vocabulary="class-grade">{session.classGrade}</span>
                    {" · "}
                    {session.moduleName}
                    {" · "}
                    {formatDate(session.date)}
                  </>
                ) : (
                  "Class Session detail is unavailable in this workspace."
                )}
              </p>
            </div>
          </section>

          {correction && (
            <FeedbackBanner tone="warning" title="Returned assessment concern">
              <strong>{formatIssueScope(correction.issueScope)}</strong>
              {correction.dimensionCode ? ` · ${formatDimension(correction.dimensionCode)}` : ""}
              <span className="mt-1 block">{correction.reason}</span>
              <span className="mt-1 block font-bold">
                Save any required assessment change here, then create a fresh correction version.
              </span>
            </FeedbackBanner>
          )}

          {showValidation && !complete && (
            <FeedbackBanner tone="error" title="All nine ratings are required">
              {DIMENSION_CODES.length - ratedCount} dimension
              {DIMENSION_CODES.length - ratedCount === 1 ? " is" : "s are"} still missing.
              The first missing dimension is focused below.
            </FeedbackBanner>
          )}

          {saveResult?.outcome === "retryable_failure" && (
            <FeedbackBanner tone="error" title="Observation was not saved">
              {saveResult.message}
            </FeedbackBanner>
          )}
          {saveResult?.outcome === "validation" && (
            <FeedbackBanner tone="error" title="The governed save rejected this observation">
              {saveResult.message}
            </FeedbackBanner>
          )}
          {saveResult?.outcome === "stale_state" && (
            <FeedbackBanner tone="error" title="Reload required">{saveResult.message}</FeedbackBanner>
          )}
          {saveResult?.outcome === "success" && (
            <FeedbackBanner
              tone="success"
              title={correction ? "Assessment correction saved" : "Observation saved"}
              /*
               * F16-C — the follow-on link is rendered ONLY when the governed
               * backend actually holds a report identifier. Saving an assessment
               * does not create a report (RPC-1 belongs to `requestDraft`), so a
               * first save legitimately has none. A link to a fabricated or empty
               * id would be a broken promise dressed as a working control.
               */
              actions={
                saveResult.data.reportId !== null ? (
                  <Link
                    href={
                      correction
                        ? `/trainer/reports/${saveResult.data.reportId}/edit`
                        : `/trainer/reports/${saveResult.data.reportId}/generate`
                    }
                    className="inline-flex min-h-10 items-center rounded-field bg-success-on px-3.5 py-2 text-small font-bold text-white no-underline hover:bg-[#215a39]"
                  >
                    {correction ? "Create correction version" : "Continue to AI draft"}
                  </Link>
                ) : undefined
              }
            >
              {correction
                ? "The governed assessment changes are saved. The frozen returned version remains unchanged until a fresh correction version is created."
                : saveResult.data.reportId !== null
                  ? "All nine ratings and the Trainer's notes are saved."
                  : "All nine ratings and the Trainer's notes are saved. This learner has no report yet — the report is created when AI drafting is requested."}
            </FeedbackBanner>
          )}

          {/* ---------------------------------------------------------------
           * Assessment Rubric — the frame's single card, all NINE rows, in the
           * RATIFIED order rather than the frame's interleaved order (D1).
           * ------------------------------------------------------------- */}
          <section className="card p-5 sm:p-6" aria-labelledby="rubric-heading">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id="rubric-heading" className="text-section-title font-extrabold">
                  <span className="text-ink-strong">Assessment Rubric</span>
                </h2>
                <p className="mt-1 text-body text-ink">Select a level for each speaking skill</p>
              </div>
              <p
                className="text-small font-bold text-ink"
                data-rated-count={ratedCount}
                aria-live="polite"
              >
                {ratedCount} of {DIMENSION_CODES.length} dimensions rated
              </p>
            </div>

            <RubricGroup
              caption="B.E.S.T. Competency"
              detail="Body, Emotion, Speech and Tonality"
            />
            <div className="mt-3 grid gap-2.5">
              {competency.map((dimension) => renderDimension(dimension))}
            </div>

            <RubricGroup
              caption="Speech Linguistics Pattern"
              detail="Eye Contact, Vocal Projection, Emotional Expression, Sentence Flow and Audience Awareness"
              className="mt-7"
            />
            <div className="mt-3 grid gap-2.5">
              {linguistics.map((dimension) => renderDimension(dimension))}
            </div>
          </section>

          {/* ---------------------------------------------------------------
           * Observation Notes — the frame's card, plus the governed Follow-up
           * field the frame does not draw (D3).
           * ------------------------------------------------------------- */}
          <section className="card p-5 sm:p-6" aria-labelledby="notes-heading">
            <div className="flex items-center gap-3">
              <IconTile tone="brand">
                <EyeGlyph />
              </IconTile>
              <h2 id="notes-heading" className="text-card-title font-extrabold">
                <span className="text-ink-strong">Observation Notes</span>
              </h2>
            </div>
            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <div>
                <label
                  htmlFor="observation-notes"
                  className="block text-small font-bold text-ink-strong"
                >
                  What was observed in this Class Session
                </label>
                <textarea
                  id="observation-notes"
                  className="form-field mt-2 min-h-40 resize-y leading-6"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Write your observations about this student..."
                  disabled={saveComplete}
                />
              </div>
              <div>
                <label
                  htmlFor="follow-up-notes"
                  className="block text-small font-bold text-ink-strong"
                >
                  Follow-up for Next Session
                </label>
                <textarea
                  id="follow-up-notes"
                  className="form-field mt-2 min-h-40 resize-y leading-6"
                  value={followUp}
                  onChange={(event) => setFollowUp(event.target.value)}
                  aria-describedby="follow-up-notes-hint"
                  placeholder="What should the next Trainer reinforce?"
                  disabled={saveComplete}
                />
                <p id="follow-up-notes-hint" className="mt-2 text-small leading-6 text-ink">
                  The same governed note appears as &ldquo;Coach Notes (Internal Only)&rdquo; on
                  Review &amp; Approve, and becomes this learner&rsquo;s previous focus in the
                  next roster projection.
                </p>
              </div>
            </div>
          </section>

          {/* Save gate — the frame's bottom-right primary action. */}
          <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-small leading-6 text-ink">
              {correction
                ? "Saving here updates the Trainer-owned assessment; the correction version and fresh checklist are created in the next step."
                : "Completion is re-validated by the governed save against all nine dimensions — the check on this form is a convenience only. This fixture deliberately returns one retryable save error on the first complete submission so recovery can be reviewed without losing the form."}
            </p>
            <div className="flex flex-col gap-2 sm:items-end">
              <div className="flex flex-wrap gap-2.5 sm:justify-end">
                {/*
                 * The primary action renders visually DISABLED until all nine are rated, so the
                 * validation state needs its own trigger — otherwise the banner and the
                 * jump-to-first-missing-field behaviour §7.3 requires would be unreachable.
                 */}
                {!complete && (
                  <Button variant="secondary" size="large" onClick={revealValidation}>
                    Check required fields
                  </Button>
                )}
                <Button type="submit" size="large" disabled={!complete || saving || saveComplete}>
                  {saving
                    ? "Saving…"
                    : correction
                      ? "Save assessment correction"
                      : "Save & Generate"}
                  {!saving && <Icon name="chevronRight" size={16} />}
                </Button>
              </div>
              {!complete && (
                <span className="text-small font-bold text-danger-on" aria-live="polite">
                  Disabled until all nine dimensions are rated
                </span>
              )}
            </div>
          </section>
        </form>
      </div>
    </div>
  );

  function renderDimension(dimension: DimensionDto) {
    const selected = ratings[dimension.dimensionCode];
    const missing = showValidation && selected === null;
    const anchorId = `${dimension.dimensionCode}-anchor`;
    const errorId = `${dimension.dimensionCode}-error`;
    return (
      <fieldset
        key={dimension.dimensionCode}
        ref={(node) => {
          fieldsets.current[dimension.dimensionCode] = node;
        }}
        tabIndex={-1}
        data-dimension={dimension.dimensionCode}
        data-selected-rating={selected ?? ""}
        aria-invalid={missing}
        aria-describedby={missing ? `${anchorId} ${errorId}` : anchorId}
        className={`rounded-card border p-3 outline-none transition ${
          missing ? "border-danger-on bg-danger-soft" : "border-transparent"
        }`}
      >
        {/*
         * The legend is the fieldset's accessible name and must be its FIRST child, so the
         * visible label is rendered separately inside the row grid. Both carry the same words.
         */}
        <legend className="sr-only">
          {dimension.displayName} — {dimension.focus} (required)
        </legend>

        <div className="grid gap-2.5 md:grid-cols-[minmax(0,12rem)_minmax(0,1fr)] md:items-center md:gap-4">
          <p className="min-w-0">
            <span className="block text-body font-extrabold text-ink-strong">
              {dimension.ordinal}. {dimension.displayName}
            </span>
            <span className="mt-0.5 block text-micro font-bold uppercase tracking-[0.1em] text-neutral-on">
              {dimension.focus}
            </span>
          </p>

          <div className="grid grid-cols-2 gap-1 rounded-field bg-surface-muted p-1 sm:grid-cols-4">
            {RATING_LEVELS.map((rating) => {
              const active = selected === rating;
              const label = RATING_DISPLAY_LABELS[rating];
              return (
                <button
                  key={rating}
                  type="button"
                  data-rating-level={rating}
                  aria-pressed={active}
                  /*
                   * A REAL accessible name per control (nine identical chip sets otherwise),
                   * carrying THIS level's behavioural anchor VERBATIM so the behavioural
                   * meaning reaches assistive technology before the choice is made.
                   */
                  aria-label={`${dimension.displayName} — ${label}${
                    active ? ", selected" : ""
                  }. ${dimension.rubricAnchors[rating]}`}
                  onClick={() => {
                    setRatings((current) => ({
                      ...current,
                      [dimension.dimensionCode]: rating,
                    }));
                    setSaveResult(null);
                  }}
                  disabled={saveComplete}
                  className={`inline-flex min-h-10 items-center justify-center gap-1.5 rounded-[0.5rem] border-2 px-2 py-2 text-small font-extrabold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    active ? ratingStyles[rating].selected : ratingStyles[rating].idle
                  }`}
                >
                  {/*
                   * Selection is carried by SHAPE (this glyph), by STATE (`aria-pressed`), by
                   * the accessible name (", selected") and by the visible anchor line naming
                   * the chosen level — never by colour alone (`GLOBAL_UI_RULES` §7). The chip's
                   * textContent stays exactly the ratified label so a label/value assertion
                   * reads the vocabulary and nothing else.
                   */}
                  {active && <Icon name="check" size={13} />}
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/*
         * D2 — the behavioural anchor the frame does not draw. Rendered VERBATIM; A-050 makes
         * the wording byte-identical to the backend and it must never be reworded or re-wrapped.
         */}
        <p
          id={anchorId}
          className="mt-2 text-small leading-6 text-ink md:pl-[13rem]"
        >
          <strong className="font-bold text-ink-strong">
            {selected ? `${RATING_DISPLAY_LABELS[selected]} anchor:` : "Rubric anchor:"}
          </strong>{" "}
          {selected
            ? dimension.rubricAnchors[selected]
            : "Choose a governed rating to keep its behavioural meaning visible here."}
        </p>
        {missing && (
          <p id={errorId} className="mt-1.5 text-small font-bold text-danger-on md:pl-[13rem]">
            Select Beginning, Developing, Mastering, or Mastered.
          </p>
        )}
      </fieldset>
    );
  }
}

function RubricGroup({
  caption,
  detail,
  className = "",
}: {
  readonly caption: string;
  readonly detail: string;
  readonly className?: string;
}) {
  return (
    <div className={`border-t border-line pt-4 ${className || "mt-5"}`}>
      <h3 className="text-micro font-extrabold uppercase tracking-[0.14em]">
        <span className="text-neutral-on">{caption}</span>
      </h3>
      <p className="mt-1 text-small text-ink">{detail}</p>
    </div>
  );
}

/**
 * The frame's REVIEW & APPROVE rail — four counters over the governed report states plus the
 * Class Session's learner list.
 *
 * The per-learner destination is resolved from THAT learner's own attendance and report status
 * (D7), deliberately not by one generic handler shared across the list — the same discipline
 * F-05 holds on the roster and `CLAUDE.md` §6 requires of every per-student control.
 */
function ReviewApproveRail({
  roster,
  sessionId,
  currentStudentId,
}: {
  readonly roster: readonly RosterEntryDto[] | null;
  readonly sessionId: string;
  readonly currentStudentId: string;
}) {
  const counts = useMemo(() => {
    const source = roster ?? [];
    return REVIEW_BUCKETS.map((bucket) => ({
      ...bucket,
      /* Absent learners are counted in NO bucket — absence exposes no report state (A-018). */
      count: source.filter(
        (entry) =>
          entry.attendanceState === "present" &&
          (bucket.states as readonly string[]).includes(entry.reportState),
      ).length,
    }));
  }, [roster]);

  return (
    <aside
      aria-labelledby="review-approve-heading"
      className="card p-4 xl:sticky xl:top-4"
      data-review-rail={roster ? "ready" : "loading"}
    >
      <h2
        id="review-approve-heading"
        className="text-micro font-extrabold uppercase tracking-[0.14em]"
      >
        <span className="text-brand-800">Review &amp; Approve</span>
      </h2>

      <ul className="mt-3 grid grid-cols-2 gap-2">
        {counts.map((bucket) => (
          <li
            key={bucket.key}
            data-review-bucket={bucket.key}
            data-review-count={bucket.count}
            className={`rounded-card px-3 py-2.5 text-center ${bucket.tone}`}
          >
            <span className="block text-section-title font-extrabold leading-tight">
              {bucket.count}
            </span>
            <span className="mt-0.5 block text-micro font-extrabold uppercase tracking-[0.1em]">
              {bucket.label}
            </span>
          </li>
        ))}
      </ul>

      {roster === null ? (
        <p className="mt-4 text-small leading-6 text-ink" role="status">
          Loading this Class Session&rsquo;s learners…
        </p>
      ) : roster.length === 0 ? (
        <p className="mt-4 text-small leading-6 text-ink" role="status">
          No learner list is available for this Class Session in this workspace.
        </p>
      ) : (
        <ul className="mt-4 grid gap-1">
          {roster.map((entry) => (
            <li key={entry.studentId}>
              <RailEntry
                entry={entry}
                sessionId={sessionId}
                current={entry.studentId === currentStudentId}
              />
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}

function RailEntry({
  entry,
  sessionId,
  current,
}: {
  readonly entry: RosterEntryDto;
  readonly sessionId: string;
  readonly current: boolean;
}) {
  const destination = resolveRailDestination(sessionId, entry);
  const body = (
    <>
      {entry.attendanceState === "absent" ? (
        /*
         * The shared `Avatar`'s `muted` variant renders `text-ink-subtle` on `bg-neutral-soft`
         * — 2.004:1, measured in the production DOM. `components/ui/avatar.tsx` is outside this
         * checkpoint's owned paths, so the inert treatment is reproduced here at the AA floor
         * instead: same family, same hue, luminance moved. This is the same local adjudication
         * F-05 recorded as its D8. The initials stay decorative — the learner's name is
         * rendered in full immediately beside them.
         */
        <span
          aria-hidden="true"
          className="grid size-8 shrink-0 place-items-center rounded-full bg-neutral-soft text-micro font-bold text-neutral-on"
        >
          {initialsFrom(entry.displayName)}
        </span>
      ) : (
        <Avatar displayName={entry.displayName} size="small" />
      )}
      <span className="min-w-0 flex-1">
        <span
          className={`block truncate text-small font-bold ${
            current ? "text-brand-800" : "text-ink-strong"
          }`}
        >
          {entry.displayName}
        </span>
        {entry.attendanceState === "absent" ? (
          /* D7 — an absent learner carries NO lifecycle status and no path (A-018). */
          <span className="mt-0.5 block text-micro text-neutral-on">
            Not available for assessment today.
          </span>
        ) : (
          <span className="mt-1 block">
            <StatusPill status={entry.reportState} />
          </span>
        )}
      </span>
    </>
  );

  if (!destination) {
    return (
      <span
        data-rail-student={entry.studentId}
        data-rail-action="inert"
        className="flex items-start gap-2.5 rounded-nav bg-surface-subtle px-2.5 py-2"
      >
        {body}
      </span>
    );
  }

  return (
    <Link
      href={destination.href}
      aria-current={current ? "page" : undefined}
      data-rail-student={entry.studentId}
      data-rail-action={destination.kind}
      className={`flex items-start gap-2.5 rounded-nav px-2.5 py-2 no-underline transition ${
        current ? "bg-brand-50" : "hover:bg-surface-muted"
      }`}
    >
      {body}
      <span className="sr-only">— {destination.label}</span>
    </Link>
  );
}

/**
 * Exhaustive, per-learner resolution. Attendance is the FIRST gate, so an absent learner
 * reaches no assessment and no report; every remaining branch resolves its own destination
 * from that learner's ACTUAL report status, and a status naming no reachable report gets an
 * inert row rather than a guessed path.
 */
function resolveRailDestination(
  sessionId: string,
  entry: RosterEntryDto,
): { readonly kind: string; readonly label: string; readonly href: string } | null {
  if (entry.attendanceState === "absent") return null;

  switch (entry.reportState) {
    case "no_report":
    case "incomplete":
      return {
        kind: "assess",
        label: "Grade student",
        href: `/trainer/sessions/${sessionId}/students/${entry.studentId}/assess`,
      };
    case "observation_saved":
    case "drafting":
      return entry.reportId
        ? {
            kind: "continue",
            label: "Continue to the AI draft",
            href: `/trainer/reports/${entry.reportId}/generate`,
          }
        : null;
    case "draft_ready":
    case "needs_edit":
      return entry.reportId
        ? {
            kind: "review",
            label: "Review this report",
            href: `/trainer/reports/${entry.reportId}/review`,
          }
        : null;
    case "trainer_approved":
    case "approved":
    case "submitted":
      return entry.reportId
        ? {
            kind: "view_report",
            label: "View this report",
            href: `/trainer/reports/${entry.reportId}/review`,
          }
        : null;
    default: {
      const exhaustive: never = entry.reportState;
      return exhaustive;
    }
  }
}

/** The frame's Observation Notes glyph. Inline SVG — this project loads no icon package. */
function EyeGlyph() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function formatIssueScope(scope: CorrectionRequestDto["issueScope"]) {
  return {
    rating: "Rating review",
    observation: "Observation review",
    derived_assessment_fact: "Assessment-fact review",
  }[scope];
}

function formatDimension(dimension: DimensionCode) {
  return dimension
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-SG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
