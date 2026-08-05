"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { Button } from "@/components/ui/button";
import { FeedbackBanner } from "@/components/ui/feedback-banner";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { PageHeading } from "@/components/ui/page-heading";
import { StatePanel } from "@/components/ui/state-panel";
import {
  DIMENSION_CODES,
  RATING_LEVELS,
  type AssessmentDraftDto,
  type DimensionCode,
  type DimensionDto,
  type RatingLevel,
  type SaveObservationSuccess,
} from "@/lib/frontend/contracts/physical-test";
import type { UiActionResult } from "@/lib/frontend/contracts/result";
import { usePhysicalTestPort } from "./trainer-fixture-runtime";
import { asFailure, type ResourceState } from "./resource-state";

type AssessmentView = {
  readonly draft: AssessmentDraftDto;
  readonly dimensions: readonly DimensionDto[];
};

const ratingLabels: Readonly<Record<RatingLevel, string>> = {
  emerging: "Emerging",
  developing: "Developing",
  secure: "Secure",
  advanced: "Advanced",
};

const ratingStyles: Readonly<Record<RatingLevel, { idle: string; selected: string }>> = {
  emerging: {
    idle: "border-red-200 bg-red-50 text-red-800 hover:border-red-400",
    selected: "border-red-700 bg-red-100 text-red-900 ring-2 ring-red-200",
  },
  developing: {
    idle: "border-amber-200 bg-amber-50 text-amber-800 hover:border-amber-400",
    selected: "border-amber-700 bg-amber-100 text-amber-900 ring-2 ring-amber-200",
  },
  secure: {
    idle: "border-teal-200 bg-teal-50 text-teal-800 hover:border-teal-400",
    selected: "border-teal-700 bg-teal-100 text-teal-900 ring-2 ring-teal-200",
  },
  advanced: {
    idle: "border-green-200 bg-green-50 text-green-800 hover:border-green-400",
    selected: "border-green-700 bg-green-100 text-green-900 ring-2 ring-green-200",
  },
};

export function TrainerAssessment() {
  const params = useParams<{ sessionId: string; studentId: string }>();
  const port = usePhysicalTestPort();
  const [resource, setResource] = useState<ResourceState<AssessmentView>>({ kind: "loading" });
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
  const fieldsets = useRef<Partial<Record<DimensionCode, HTMLFieldSetElement | null>>>({});

  useEffect(() => {
    let active = true;
    void Promise.all([
      port.getAssessmentDraft(params.sessionId, params.studentId),
      port.getDimensions(),
    ]).then(([draftResult, dimensionsResult]) => {
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
      setFollowUp(draftResult.data.followUp);
      setLockVersion(draftResult.data.observationLockVersion);
      setResource({
        kind: "ready",
        data: { draft: draftResult.data, dimensions: dimensionsResult.data },
      });
    });
    return () => {
      active = false;
    };
  }, [params.sessionId, params.studentId, port]);

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
    }
  }

  if (resource.kind === "loading") {
    return <LoadingSkeleton label="Loading nine-dimension assessment" rows={5} />;
  }
  if (resource.kind === "failed") return <StatePanel result={resource.result} />;

  const { draft, dimensions } = resource.data;
  const saveComplete = saveResult?.outcome === "success";

  return (
    <form className="page-grid" onSubmit={handleSubmit} noValidate>
      <nav aria-label="Breadcrumb" className="text-sm font-bold text-ink-muted">
        <Link href="/trainer" className="hover:text-brand-600">Dashboard</Link>
        <span aria-hidden="true" className="px-2">/</span>
        <Link
          href={`/trainer/sessions/${draft.sessionId}/roster`}
          className="hover:text-brand-600"
        >
          Session roster
        </Link>
        <span aria-hidden="true" className="px-2">/</span>
        <span>Assessment</span>
      </nav>

      <PageHeading
        eyebrow="Full B.E.S.T. assessment · all nine required"
        title={draft.studentDisplayName}
        description="Rate every competency and speech-linguistics dimension. The rubric anchor for each selected level stays visible below the choices."
      />

      <section className="card sticky top-3 z-10 flex flex-col gap-3 px-4 py-3 shadow-lg sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-extrabold text-navy-950">
            {ratedCount} of {DIMENSION_CODES.length} dimensions rated
          </p>
          <div className="mt-2 h-2 w-full min-w-56 overflow-hidden rounded-full bg-slate-200 sm:w-80">
            <div
              className="h-full rounded-full bg-brand-600 transition-[width]"
              style={{ width: `${(ratedCount / DIMENSION_CODES.length) * 100}%` }}
            />
          </div>
        </div>
        {!complete && (
          <Button variant="secondary" size="small" onClick={revealValidation}>
            Check required fields
          </Button>
        )}
      </section>

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
      {saveResult?.outcome === "stale_state" && (
        <FeedbackBanner tone="error" title="Reload required">{saveResult.message}</FeedbackBanner>
      )}
      {saveResult?.outcome === "success" && (
        <FeedbackBanner
          tone="success"
          title="Observation saved"
          actions={
            <Link
              href={`/trainer/reports/${saveResult.data.reportId}/generate`}
              className="inline-flex min-h-10 items-center rounded-xl bg-success-700 px-3.5 py-2 text-sm font-bold text-white hover:bg-green-800"
            >
              Continue to AI draft
            </Link>
          }
        >
          All nine ratings and the Trainer&apos;s notes are preserved in this browser-session fixture.
        </FeedbackBanner>
      )}

      <section aria-labelledby="competency-heading">
        <h2 id="competency-heading" className="text-xl font-black text-navy-950">
          B.E.S.T. Competency
        </h2>
        <p className="mt-1 text-sm text-ink-muted">Body, Emotion, Speech, and Tonality</p>
        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          {dimensions
            .filter((dimension) => dimension.group === "competency")
            .map((dimension) => renderDimension(dimension))}
        </div>
      </section>

      <section aria-labelledby="linguistics-heading">
        <h2 id="linguistics-heading" className="text-xl font-black text-navy-950">
          Speech Linguistics Pattern
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Five communication-pattern dimensions complete the governed assessment.
        </p>
        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          {dimensions
            .filter((dimension) => dimension.group === "speech_linguistics")
            .map((dimension) => renderDimension(dimension))}
        </div>
      </section>

      <section className="card p-5 sm:p-6" aria-labelledby="notes-heading">
        <h2 id="notes-heading" className="text-xl font-black text-navy-950">
          Trainer observation
        </h2>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <label className="text-sm font-bold text-navy-900">
            Observation notes
            <textarea
              className="form-field mt-2 min-h-36 resize-y"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Record only what was observed in this Class Session."
              disabled={saveComplete}
            />
          </label>
          <label className="text-sm font-bold text-navy-900">
            Follow-up for Next Session
            <textarea
              className="form-field mt-2 min-h-36 resize-y"
              value={followUp}
              onChange={(event) => setFollowUp(event.target.value)}
              placeholder="What should the next Trainer reinforce?"
              disabled={saveComplete}
            />
            <span className="mt-2 block text-xs font-normal leading-5 text-ink-muted">
              This becomes the learner&apos;s previous focus in the next roster projection.
            </span>
          </label>
        </div>
      </section>

      <section className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-extrabold text-navy-950">Save gate</p>
          <p className="mt-1 text-xs leading-5 text-ink-muted">
            The fixture deliberately returns one retryable save error on the first complete
            submission so recovery can be reviewed without losing this form.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <Button type="submit" size="large" disabled={!complete || saving || saveComplete}>
            {saving ? "Saving observation…" : "Save observation & generate draft"}
          </Button>
          {!complete && (
            <span className="text-xs font-bold text-danger-700" aria-live="polite">
              Disabled until all nine dimensions are rated
            </span>
          )}
        </div>
      </section>
    </form>
  );

  function renderDimension(dimension: DimensionDto) {
    const selected = ratings[dimension.dimensionCode];
    const missing = showValidation && selected === null;
    return (
      <fieldset
        key={dimension.dimensionCode}
        ref={(node) => {
          fieldsets.current[dimension.dimensionCode] = node;
        }}
        tabIndex={-1}
        aria-invalid={missing}
        aria-describedby={`${dimension.dimensionCode}-anchor ${
          missing ? `${dimension.dimensionCode}-error` : ""
        }`}
        className={`card p-5 outline-none transition ${missing ? "border-red-400 ring-2 ring-red-100" : ""}`}
      >
        <legend className="w-full px-0">
          <span className="flex items-start justify-between gap-3">
            <span>
              <span className="block text-lg font-black text-navy-950">
                {dimension.ordinal}. {dimension.displayName}
              </span>
              <span className="mt-0.5 block text-xs font-bold uppercase tracking-[0.1em] text-ink-muted">
                {dimension.focus}
              </span>
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-ink-muted">
              Required
            </span>
          </span>
        </legend>
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {RATING_LEVELS.map((rating) => {
            const active = selected === rating;
            return (
              <button
                key={rating}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setRatings((current) => ({ ...current, [dimension.dimensionCode]: rating }));
                  setSaveResult(null);
                }}
                disabled={saveComplete}
                className={`min-h-10 rounded-full border-2 px-2 py-2 text-xs font-extrabold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  active ? ratingStyles[rating].selected : ratingStyles[rating].idle
                }`}
              >
                {ratingLabels[rating]}
              </button>
            );
          })}
        </div>
        <div
          id={`${dimension.dimensionCode}-anchor`}
          className="mt-4 min-h-20 rounded-2xl bg-surface-muted p-3 text-sm leading-6 text-ink-muted"
        >
          <strong className="text-navy-900">
            {selected ? `${ratingLabels[selected]} anchor:` : "Rubric anchor:"}
          </strong>{" "}
          {selected
            ? dimension.rubricAnchors[selected]
            : "Choose a governed rating to keep its behavioural meaning visible here."}
        </div>
        {missing && (
          <p id={`${dimension.dimensionCode}-error`} className="mt-2 text-sm font-bold text-danger-700">
            Select Emerging, Developing, Secure, or Advanced.
          </p>
        )}
      </fieldset>
    );
  }
}
