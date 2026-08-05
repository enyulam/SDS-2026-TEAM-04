"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { FeedbackBanner } from "@/components/ui/feedback-banner";
import { StatePanel } from "@/components/ui/state-panel";
import type {
  DraftGenerationContextDto,
  RequestDraftSuccess,
} from "@/lib/frontend/contracts/physical-test";
import type { UiActionResult } from "@/lib/frontend/contracts/result";
import { usePhysicalTestPort } from "./trainer-fixture-runtime";
import { asFailure, type FailureResult } from "./resource-state";

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
    }
  | { readonly kind: "unavailable"; readonly result: FailureResult };

export function TrainerDraftGeneration() {
  const params = useParams<{ reportId: string }>();
  const port = usePhysicalTestPort();
  const [state, setState] = useState<GenerationState>({ kind: "loading" });
  const initialContext = useRef<
    Promise<UiActionResult<DraftGenerationContextDto>> | null
  >(null);

  const generate = useCallback(
    async (context: DraftGenerationContextDto) => {
      setState({ kind: "generating", context });
      const result = await port.requestDraft({
        reportId: context.reportId,
        observationLockVersion: context.observationLockVersion,
      });
      setState(
        result.outcome === "success"
          ? { kind: "ready", context, result: result.data }
          : { kind: "failed", context, result },
      );
    },
    [port],
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
  if (state.kind === "loading") return <GeneratingCard title="Preparing saved assessment…" />;
  if (state.kind === "generating") {
    return (
      <GeneratingCard
        title={`Generating ${state.context.studentDisplayName}'s draft…`}
        description="The fixture is validating structure, polarity bands, and rubric anchors before any wording can appear in review."
      />
    );
  }

  if (state.kind === "failed") {
    const retryable =
      state.result.outcome === "generation_failure"
        ? state.result.retryable
        : state.result.outcome === "retryable_failure";
    const message =
      "message" in state.result
        ? state.result.message
        : "The draft is unavailable. No draft content was shown or saved.";
    return (
      <div className="mx-auto max-w-3xl space-y-5">
        <PageIntro student={state.context.studentDisplayName} />
        <FeedbackBanner tone="error" title="Draft rejected safely">
          {message}
        </FeedbackBanner>
        <section className="card p-6 sm:p-8">
          <h2 className="text-xl font-black text-navy-950">Your assessment is preserved</h2>
          <p className="mt-2 text-sm leading-6 text-ink-muted">
            The report returned to Observation Saved. The deterministic fixture offers one
            bounded retry; it does not loop and it never displays the rejected draft.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              size="large"
              disabled={!retryable}
              onClick={() => void generate(state.context)}
            >
              Retry once
            </Button>
            <Link
              href="/trainer"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-line bg-white px-5 py-3 text-base font-bold text-navy-800 hover:border-brand-500 hover:bg-brand-100"
            >
              Return to dashboard
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageIntro student={state.context.studentDisplayName} />
      <FeedbackBanner tone="success" title="Grounded draft ready">
        Structure and polarity checks passed. The four report panels are ready for Trainer
        review; nothing is approved or published.
      </FeedbackBanner>
      <section className="card p-6 sm:p-8">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-success-100 text-xl font-black text-success-700" aria-hidden="true">
          ✓
        </div>
        <h2 className="mt-5 text-2xl font-black text-navy-950">Continue to human review</h2>
        <p className="mt-2 text-sm leading-6 text-ink-muted">
          AI has supplied wording only. The Trainer remains responsible for reviewing and
          editing every panel before the quality checklist can be completed.
        </p>
        <Link
          href={`/trainer/reports/${state.result.reportId}/review`}
          className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-brand-700 px-5 py-3 text-base font-extrabold text-white hover:bg-brand-800"
        >
          Review four-panel report
        </Link>
      </section>
    </div>
  );
}

function GeneratingCard({
  title,
  description = "Loading the saved observation and preparing the governed draft request.",
}: {
  readonly title: string;
  readonly description?: string;
}) {
  return (
    <section className="card mx-auto max-w-3xl px-6 py-16 text-center" aria-busy="true">
      <span className="mx-auto block size-12 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600" aria-hidden="true" />
      <h1 className="mt-6 text-2xl font-black text-navy-950">{title}</h1>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-ink-muted">{description}</p>
      <p className="mt-5 text-xs font-bold uppercase tracking-[0.12em] text-brand-600">
        Actions disabled while generation is in progress
      </p>
    </section>
  );
}

function PageIntro({ student }: { readonly student: string }) {
  return (
    <header>
      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-600">
        AI Feedback Draft Assistant
      </p>
      <h1 className="mt-1 text-3xl font-black tracking-tight text-navy-950">
        {student}
      </h1>
    </header>
  );
}
