"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon, IconTile } from "@/components/ui/icon";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { PageHeading } from "@/components/ui/page-heading";
import { StatePanel } from "@/components/ui/state-panel";
import { REPORT_PANEL_CONFIG } from "@/features/trainer/report-panel-config";
import { asFailure, type ResourceState } from "@/features/trainer/resource-state";
import { usePhysicalTestPort } from "@/features/portal/portal-runtime-context";
import type { CanonicalReportDto, ReportPanelsDto } from "@/lib/frontend/contracts/physical-test";

/**
 * Screen 33 — Parent Class Report (FRONTEND RECONSTRUCTION F15 / operator checkpoint F-15).
 *
 * Current Final MVP visual authority is `UI_REFERENCE_FINAL_MVP/reference/Parent - Class Report/`
 * (Amendment 007 A-056, which supersedes the A-045 ordering). The pack-local
 * `UI_REFERENCE_FINAL_MVP/33-parent-class-report/reference.png` (node `627:9`) is an optional
 * frozen duplicate, SHA-identical to it. See CLAUDE.md §7.4 and FINAL_MVP_AUTHORITY_LOCK.md
 * §2.4 for the ladder and for governed deviations. Reconstructed here as the frame's
 * page title and meta line, one white report card carrying a titled header row, and a vertical
 * stack of sections — each a soft tinted icon tile, a bold section heading and one bullet of
 * narrative prose.
 *
 * GOVERNANCE OVERRIDES THE FROZEN SCREENSHOT — operator ruling R-B6. A Parent receives the
 * SUBMITTED CANONICAL NARRATIVE ONLY: the four governed parent-facing panels (spec §8), from the
 * version `reports.latest_submitted_version_id` names, for a linked student only, VIEW ONLY.
 * This reconstruction therefore DELIBERATELY OMITS FOUR THINGS THE FRAME DRAWS. Each is
 * recorded — in `implementation-notes.md`, in `docs/workstreams/48H_FRONTEND_PROGRESS.md` and in
 * the checkpoint report — never silently resolved, and never quietly reinstated:
 *
 *  1. THE "PERFORMANCE SUMMARY" PER-DIMENSION GRID. The frame draws a four-cell grid of raw
 *     dimension:rating pairs (Speech / Tonality / Eye Contact / Audience Awareness). This is the
 *     ALREADY-CAUGHT LEAK `CLAUDE.md` §6 names by name: "No per-dimension rating grid on the
 *     Parent Feedback Report, in any form or wording — this is a caught leak, fix it." It is not
 *     recreated here in any form, including softened wording, and F-15 is explicitly not allowed
 *     to reintroduce it. The screen's "simplified performance summary" requirement is satisfied
 *     by the four prose panels below and by nothing else.
 *  2. "OVERALL GRADE: MASTERING". An aggregate competency grade is a rating value; a Parent
 *     surface renders no rating token, in either vocabulary (A-021; A-048; GLOBAL_UI_RULES §5).
 *     It is omitted. (Class Grade — Beginner / Intermediate / Advanced — is a DIFFERENT and
 *     unchanged vocabulary (A-054); no Class Grade is rendered here either, because the governed
 *     `CanonicalReportDto` carries none.)
 *  3. THE PROSE RATING ATTRIBUTIONS. The frame's body copy reads "Assessed as Mastered in eye
 *     contact ... and Mastering in body language", "currently assessed as Developing", "to
 *     progress these skills to the Mastering band". That is explicit rating attribution and
 *     taxonomy disclosure — precisely what A-052 authorises detecting and what must not leak
 *     into parent-facing prose. The frame's copy is NOT ported. The panels render the governed
 *     submitted narrative the port returns, and nothing is written over it.
 *  4. THE "WATCH TOGETHER" EVIDENCE VIDEO. Parent evidence access is gated on ALL of: the report
 *     having reached `submitted`, the `evidence_media` consent scope, and a short-TTL,
 *     server-minted signed URL scoped to the requesting parent's `parent_student_links` row
 *     (Amendment 001 A-001; `CLAUDE.md` §6).
 *     ⚠️ CITATION CORRECTED 2026-08-10. This read "Beyond that, evidence scope and the uploader
 *     are UNRESOLVED (Amendment 002 A-014)". True when written, SUPERSEDED 2026-08-08 — and the
 *     correction makes this omission STRONGER, not weaker. Evidence media IS a Final MVP
 *     requirement with the TRAINER as the ruled uploader, but Authority Lock §8.1 rules the
 *     PARENT EVIDENCE PROJECTION *OUT* of the Final MVP outright. A-001 is therefore ratified
 *     but ARMED AND UNACTIVATED: its three gates stay binding the moment any parent evidence
 *     surface is ever activated, and A-003/A-004's REFUSAL legs remain mandatory meanwhile.
 *     So this region is not merely unbuilt here — it is DESCOPED, and adding any parent-facing
 *     evidence surface is a `CLAUDE.md` §12 stop-and-ask (see also `F-EVIDENCE-SCOPE-1`).
 *     No such governed path exists, so the region is omitted
 *     rather than faked — an affordance no governed port method backs is never invented
 *     (GLOBAL_UI_RULES §10), and no media element is rendered on this surface at all.
 *
 * The frame's "Report Details" sidebar is likewise not reconstructed. Its "Overall Grade" row is
 * prohibited outright (2 above), and its Name / Class / Lesson / Term rows have no governed
 * source: `CanonicalReportDto` carries exactly `panels` and `submittedAt`. Those fields are
 * OMITTED and recorded as a dependency rather than fabricated or back-derived from a route
 * parameter — a missing field is recorded, never invented (GLOBAL_UI_RULES §10). The frame is
 * used for shell, spacing, typography, hierarchy and section treatment, and for nothing else.
 *
 * Reachability and version resolution are the governed read RPC's, not this component's:
 * `getCanonicalReport` resolves through `app_parent_reaches_student` and returns only the
 * canonical submitted version. This component adds no condition that grants access, and offers
 * no edit affordance of any kind.
 */

/** Section treatment per governed panel, in the frame's own order and tint rhythm. */
const PANEL_PRESENTATION: Readonly<
  Record<keyof ReportPanelsDto, { readonly tone: "brand" | "info" | "success" | "warning"; readonly icon: PanelIconName }>
> = {
  // 🔴 RE-ASSIGNED AT THE P1-T08 REVIEW. These four entries were carried
  // over POSITIONALLY when the keys were renamed, which shifted every
  // treatment down one slot and inverted the visual semantics on a
  // PARENT-FACING surface: Overview rendered with the `star` in the
  // `warning` tone, and Strengths — the panel that is by definition
  // positive demonstrated capability — got a neutral arrow. Both
  // independent reviewers flagged it.
  //
  // A positional carry-over is a relabelling shim in the presentation
  // layer, which is exactly what OD-4 prohibits. The treatments below are
  // assigned from what each panel MEANS:
  // The icon vocabulary here is the screen-33 local union (star, arrowUp,
  // target, heart) and is NOT widened for this fix -- adding an icon is a
  // visual-authority change, not a governance one. Within those four:
  // arrowUp = overall trajectory (Overview), star = demonstrated positive
  // (Strengths), target = what to aim at next (Areas for Development),
  // heart = warm closing commentary (Remarks).
  overview: { tone: "info", icon: "arrowUp" },
  strengths: { tone: "success", icon: "star" },
  areasForDevelopment: { tone: "warning", icon: "target" },
  remarks: { tone: "brand", icon: "heart" },
};

export function ParentCanonicalReport() {
  const params = useParams<{ sessionId: string; studentId: string }>();
  const port = usePhysicalTestPort();
  const [state, setState] = useState<ResourceState<CanonicalReportDto>>({ kind: "loading" });

  useEffect(() => {
    let active = true;
    void port.getCanonicalReport(params.sessionId, params.studentId).then((result) => {
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
  }, [params.sessionId, params.studentId, port]);

  if (state.kind === "loading") {
    return <LoadingSkeleton label="Loading family report" rows={5} />;
  }
  if (state.kind === "failed") {
    /*
     * Unavailable and denied render the same non-disclosing panel: neither may reveal whether a
     * student, report or link exists (GLOBAL_UI_RULES §5; screen.md §14). The smoke asserts the
     * two copies are byte-identical.
     */
    return (
      <StatePanel
        result={state.result}
        homeHref="/parent"
        homeLabel="Return to Parent workspace"
      />
    );
  }

  const received = formatDate(state.data.submittedAt);

  return (
    <div className="page-grid" data-testid="parent-canonical-report">
      {/*
        The subtitle is rendered here rather than through PageHeading's `description` prop: that
        prop resolves to `text-ink-muted` (#8a93a8), below the 4.5:1 AA floor for normal-size
        text on this canvas. `components/ui/page-heading.tsx` is outside this checkpoint's owned
        paths, so the shared primitive is left untouched and the failure stays recorded for a
        separate foundation authorization (as at F-11 and F-14).
      */}
      <div className="max-w-3xl">
        <PageHeading title="Class Report" />
        <p className="mt-0.5 text-small leading-5 text-ink">Received {received}</p>
      </div>

      <section
        className="card overflow-hidden p-0"
        aria-label="Submitted class report"
      >
        <div className="flex items-center gap-[11px] border-b border-line px-[26px] py-[22px]">
          <IconTile tone="brand" size="large">
            <Icon name="document" size={20} />
          </IconTile>
          <div className="min-w-0">
            <h2 className="text-[0.8203125rem] font-extrabold text-ink-strong">Class Report</h2>
            <p className="mt-0.5 text-[0.703125rem] font-bold text-neutral-on">
              Submitted {received} · Parent report
            </p>
          </div>
        </div>

        <div className="grid gap-5 px-[26px] py-6">
          {REPORT_PANEL_CONFIG.map((panel) => {
            const presentation = PANEL_PRESENTATION[panel.key];
            return (
              <article key={panel.key} className="flex items-start gap-[11px]">
                <IconTile tone={presentation.tone} size="medium">
                  <PanelIcon name={presentation.icon} />
                </IconTile>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[0.8203125rem] font-extrabold text-ink-strong">{panel.label}</h3>
                  <div className="mt-[7px] flex gap-[7px]">
                    <span
                      aria-hidden="true"
                      className="mt-[9px] size-1.5 shrink-0 rounded-full bg-brand-700"
                    />
                    <p className="text-[0.8203125rem] leading-[1.55] text-ink">{state.data.panels[panel.key]}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

type PanelIconName = "star" | "arrowUp" | "target" | "heart";

/**
 * Screen-33 section icons, inline and local to this checkpoint.
 *
 * `components/ui/icon.tsx` deliberately defines only the icons the shared shell needs and
 * records that "screen-specific icons belong to their own reconstruction checkpoint" — and it is
 * outside this checkpoint's owned paths, so it is not extended here. These four match the frame's
 * section marks (star, rising arrow, target, heart) in the shared stroked line style.
 */
function PanelIcon({ name }: { readonly name: PanelIconName }) {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className="shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {name === "star" && (
        <path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9Z" />
      )}
      {name === "arrowUp" && (
        <>
          <path d="M12 20V5" />
          <path d="m5.5 11.5 6.5-6.5 6.5 6.5" />
        </>
      )}
      {name === "target" && (
        <>
          <circle cx="12" cy="12" r="8.5" />
          <circle cx="12" cy="12" r="3.5" />
        </>
      )}
      {name === "heart" && (
        <path d="M12 20s-7.5-4.6-7.5-9.4A4.1 4.1 0 0 1 12 8a4.1 4.1 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z" />
      )}
    </svg>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-SG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Singapore",
  }).format(new Date(value));
}
