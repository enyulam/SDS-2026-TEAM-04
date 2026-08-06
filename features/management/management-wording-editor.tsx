"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { FeedbackBanner } from "@/components/ui/feedback-banner";
import { Icon } from "@/components/ui/icon";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { StatePanel } from "@/components/ui/state-panel";
import { REPORT_PANEL_CONFIG } from "@/features/trainer/report-panel-config";
import { asFailure, type ResourceState } from "@/features/trainer/resource-state";
import { usePhysicalTestPort } from "@/features/trainer/trainer-fixture-runtime";
import type {
  ManagementReviewDto,
  ReportPanelsDto,
} from "@/lib/frontend/contracts/physical-test";
import type { UiActionResult } from "@/lib/frontend/contracts/result";

/**
 * The Management wording-only editor — the `/edit` sub-surface of screen 19.
 *
 * NO FRAME COVERS THIS SURFACE, AND NONE WAS INVENTED. Reference 19 (node `648:330`) draws the
 * review surface only; its per-section pencil affordance is the entry point to this editor. This
 * file is therefore RESTYLED onto the shared F1 foundation its sibling already uses — tokens,
 * card surfaces, field treatment, button primitives — and is deliberately NOT proposed visually
 * accepted, exactly as F-09 handled the Trainer `/edit` surface. This is one of the eight
 * families the Figma matrix §0.1 records as `Blocked — new design required`; a mockup was not
 * fabricated to fill the gap (GLOBAL_UI_RULES §8 stop-and-ask).
 *
 * THE BOUNDARY THIS SURFACE IS (Amendment 004 A-034):
 *
 *  - The FOUR parent-facing wording panels are the entire editable set. Grammar, clarity, tone
 *    and presentation only. There is no fifth field here, and there is no affordance anywhere on
 *    this surface that reaches a rating, an observation, an attendance record, an evidence item,
 *    a Trainer note or any underlying assessment fact.
 *  - Hiding a control is not the boundary. The server rejects any Management write outside these
 *    four fields even when the call bypasses this UI entirely (A-021), and it re-verifies the
 *    version, the lock and the wording proof carried below.
 *  - Every accepted change creates a NEW IMMUTABLE VERSION (A-037); nothing is overwritten in
 *    place, and a wording-only edit does NOT require Trainer reapproval — but an assessment-level
 *    concern ALWAYS does, and that path is the review surface's "Return assessment concern",
 *    never this form.
 *  - `wordingHash` is the SEPARATE, domain-separated proof over these four panels only. It is
 *    carried to the server and is never rendered. The report CONTENT hash — which covers the
 *    panels PLUS the nine ratings — never reaches any Management surface at all (A-038).
 *
 * No behaviour, field, label, validation rule or governed call was changed by the restyle.
 */

type ActionFailure = Exclude<UiActionResult<unknown>, { outcome: "success" }>;

export function ManagementWordingEditor() {
  const params = useParams<{ reportId: string }>();
  const port = usePhysicalTestPort();
  const [resource, setResource] = useState<ResourceState<ManagementReviewDto>>({ kind: "loading" });
  const [panels, setPanels] = useState<ReportPanelsDto | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [failure, setFailure] = useState<ActionFailure | null>(null);

  useEffect(() => {
    let active = true;
    void port.getManagementReview(params.reportId).then((result) => {
      if (!active) return;
      if (result.outcome === "success") {
        setResource({ kind: "ready", data: result.data });
        setPanels(result.data.panels);
      } else {
        setResource({ kind: "failed", result: asFailure(result) });
      }
    });
    return () => {
      active = false;
    };
  }, [params.reportId, port]);

  const changed = useMemo(
    () =>
      resource.kind === "ready" &&
      panels !== null &&
      JSON.stringify(resource.data.panels) !== JSON.stringify(panels),
    [panels, resource],
  );

  if (resource.kind === "failed") {
    return (
      <StatePanel
        result={resource.result}
        homeHref="/management"
        homeLabel="Return to Management workspace"
      />
    );
  }
  if (resource.kind === "loading" || !panels) {
    return <LoadingSkeleton label="Loading wording editor" rows={5} />;
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (resource.kind !== "ready" || !panels) return;
    setSaving(true);
    setFailure(null);
    const result = await port.managementEditWording({
      reportId: params.reportId,
      expectedLockVersion: resource.data.lockVersion,
      expectedVersionId: resource.data.versionId,
      expectedWordingHash: resource.data.wordingHash,
      panels,
    });
    setSaving(false);
    if (result.outcome === "success") setSaved(true);
    else setFailure(result);
  }

  if (saved) {
    return (
      <div className="page-grid">
        <FeedbackBanner tone="success" title="Wording changes saved">
          A new immutable final-review candidate was created from the four parent-facing panels.
          Nothing was published and the report is still awaiting your final decision.
        </FeedbackBanner>
        <div>
          <Link
            href={`/management/reports/${params.reportId}/review`}
            className="inline-flex min-h-11 items-center justify-center rounded-field bg-brand-700 px-4 py-2.5 text-body font-bold text-white no-underline hover:bg-brand-800"
          >
            Return to safe review
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form className="page-grid" onSubmit={save} noValidate>
      <header>
        <h1 className="text-page-title font-extrabold tracking-[-0.02em] text-ink-strong">
          Refine parent-facing wording
        </h1>
        <p className="mt-1 max-w-2xl text-body leading-6 text-ink">
          Edit grammar, clarity, tone, or presentation only. Any assessment-fact concern belongs in
          the bounded return path on the review surface, not here.
        </p>
        <Link
          href={`/management/reports/${params.reportId}/review`}
          className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-field bg-brand-100 px-4 py-2.5 text-body font-bold text-brand-800 no-underline transition hover:bg-brand-200"
        >
          <Icon name="chevronLeft" size={16} />
          Back
        </Link>
      </header>

      {failure && (
        <FeedbackBanner
          tone="error"
          title={failure.outcome === "stale_state" ? "This review changed" : "Wording not saved"}
        >
          {"message" in failure
            ? failure.message
            : "This item isn't available. No additional details can be shown."}
        </FeedbackBanner>
      )}

      <section className="grid gap-5 lg:grid-cols-2" aria-label="Four-panel wording editor">
        {REPORT_PANEL_CONFIG.map((panel) => (
          <label key={panel.key} className="card block p-5 sm:p-6">
            <span className="block text-body font-extrabold text-ink-strong">{panel.label}</span>
            <span className="mt-1 block text-small leading-6 text-neutral-on">
              {panel.supporting}
            </span>
            <textarea
              className="form-field mt-3 min-h-40 resize-y"
              value={panels[panel.key]}
              onChange={(event) =>
                setPanels((current) =>
                  current ? { ...current, [panel.key]: event.target.value } : current,
                )
              }
              required
            />
          </label>
        ))}
      </section>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-small leading-6 text-ink">
          These four panels are the entire Management editable set. Saving creates a new immutable
          version and publishes nothing.
        </p>
        <div className="flex flex-wrap justify-end gap-2">
          <Link
            href={`/management/reports/${params.reportId}/review`}
            className="inline-flex min-h-12 items-center justify-center rounded-field border border-line bg-surface px-5 py-3 text-body font-bold text-ink-strong no-underline shadow-raised transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800"
          >
            Cancel
          </Link>
          <Button type="submit" size="large" disabled={!changed || saving}>
            {saving ? "Saving wording…" : "Save wording changes"}
          </Button>
        </div>
      </div>
    </form>
  );
}
