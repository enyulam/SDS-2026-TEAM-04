"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageHeading } from "@/components/ui/page-heading";
import { BackLink } from "@/components/ui/back-link";
import { Card } from "@/components/ui/surface";
import { StatePanel } from "@/components/ui/state-panel";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { asFailure, type ResourceState } from "@/features/trainer/resource-state";
import { usePhysicalTestPort } from "@/features/portal/portal-runtime-context";
import type { LessonStatisticsDto } from "@/lib/frontend/contracts/physical-test";

/**
 * Screen `15` — Management Lesson Statistics. Phase `P2-15`.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ARTEFACTS OPENED (`CLAUDE.md` §7.4.1 — every claim names one)
 * ═══════════════════════════════════════════════════════════════════════════
 *   · `reference/Management - Lesson Statistics/….png`   — geometry, and what
 *     the frame actually draws
 *   · `reference/Management - Lesson Statistics/….html`  — measured values
 *   · `UI_REFERENCE_FINAL_MVP/15-management-lesson-statistics/` — `screen.md`
 *     and `implementation-notes.md`, which is where `GC-6` lives
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⛔ FIVE OF THE FRAME'S SIX CARDS ARE PROHIBITED. THIS IS THE SMALLEST
 *    SURVIVING SCREEN IN THE PORTAL, AND THAT IS THE CORRECT OUTCOME.
 * ═══════════════════════════════════════════════════════════════════════════
 * `GC-6` on this pack, with its grounds re-attributed under `C-18`, ends: *"do
 * not add a rating badge, bar, column, tile or chip, and do not read `D-1` as
 * permitting one here."* Two independent grounds carry it, either sufficient:
 * **`C-9`** — `D-1` reaches report DETAIL surfaces only, and a statistics
 * surface *"invites comparison between children"* — and **`G-2`**, which
 * permanently excludes roll-ups on every surface.
 *
 * 1. ⛔ **Skill Averages** — nine labelled percentage bars, one per dimension.
 *    The per-dimension rating surface `GC-6` names by description.
 * 2. ⛔ **Status Distribution** — a donut whose legend reads `Mastering 15`,
 *    `Mastered 8`, `Developing 6`, `Beginning 3`. ▶ **The four ratified rating
 *    labels rendered as values.** A count *of a rating* is not the "count of
 *    assessments" the Operator permitted — it discloses the distribution of the
 *    ratings themselves, which is the comparison shape `C-9` bars.
 * 3. ⛔ **`Class Average 82%`** — a roll-up (`G-2`), and separately barred by
 *    `D-2`: *"the number is never rendered as a number on any surface, to any
 *    role."*
 * 4. ⛔ **Student Breakdown's `Strongest` / `Focus area` / `Overall`** — `G-2`
 *    names those exact limbs. `Overall` additionally renders a rating label per
 *    child in a comparison table, which is `C-9`'s stated harm verbatim.
 * 5. ⛔ **`Trainer & Assistant · This Lesson`** — the Assistant half is
 *    `A-014`/`G-7`, a deferred persona. ▶ And the Trainer half's fields are
 *    **invented concepts with no columns**: `Session delivered`, `Sent to
 *    parents`, `On time`, `Materials prepped`, `Learner check-ins`. A frame is
 *    never schema (`A-022`).
 *
 * ⚠️ **`Student ID 2025-113` has no column either** — the same finding as
 * screens `18` and `24`.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ✅ WHAT SURVIVES, AND WHY IT IS A SURFACE RATHER THAN A REMNANT
 * ═══════════════════════════════════════════════════════════════════════════
 * Who taught the lesson · how many are enrolled · how many were present · how
 * many were assessed · how many reports are submitted, and how many are still
 * awaited. ▶ **Every one is a COUNT**, on the Operator's own ground: *"a count
 * of assessments is not an assessment"*, and *"attendance is not a rating."*
 * That answers the question a manager actually opens this screen with — *did
 * this lesson get taught, attended, assessed and written up?* — without
 * disclosing a single rating.
 *
 * ⛔ **THE STANDING TEST:** if any of these ever becomes derived from rating
 * VALUES rather than counted, that is a stop-and-ask.
 *
 * ✅ **AND NO SCHEMA WAS ADDED.** §12.10 for the fifth phase running: the
 * governed `report_list_management_class_status` already returns per-session
 * rows carrying `report_id` and `report_state`, so "assessed" and "submitted"
 * are read from the same governed definition screen `13` uses — the two can
 * never drift apart.
 *
 * MEASURED VALUES (from the `.html`): page title `22px/700` · breadcrumb
 * `12px/400` · the lesson strip `13.50px/600` on `#FDEEF5` · KPI label
 * `12px/400`, KPI value `26px/700` · card titles `16px/600` · card radius
 * `18px`.
 */

export function ManagementLessonStatisticsScreen({
  classModuleId,
  classSessionId,
}: {
  readonly classModuleId: string;
  readonly classSessionId: string;
}) {
  const port = usePhysicalTestPort();
  const [state, setState] = useState<ResourceState<LessonStatisticsDto>>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    void port.readLessonStatistics(classSessionId).then((result) => {
      if (cancelled) return;
      setState(
        result.outcome === "success"
          ? { kind: "ready" as const, data: result.data }
          : { kind: "failed" as const, result: asFailure(result) },
      );
    });
    return () => {
      cancelled = true;
    };
  }, [port, classSessionId]);

  const data = state.kind === "ready" ? state.data : null;
  const overviewHref = `/management/classes/${classModuleId}`;

  return (
    <div className="page-grid">
      <div>
        <PageHeading
          breadcrumb={
            <>
              <Link href="/management/classes" className="underline hover:text-brand-700">
                Classes
              </Link>
              {data !== null && ` / ${data.classLabel}`}
              {data?.lessonNumber !== null && data !== null && ` / Lesson ${data.lessonNumber}`}
            </>
          }
          title="Lesson Statistics"
          actions={<BackLink href={overviewHref} label="Class Overview" />}
        />
      </div>

      {state.kind === "failed" ? <StatePanel result={state.result} homeHref={overviewHref} homeLabel="Return to Class Overview" /> : null}
      {state.kind === "loading" ? <LoadingSkeleton rows={3} label="Loading lesson statistics" /> : null}

      {data !== null && (
        <>
          {/*
            ⚠️ EVERY ELEMENT OF THE STRIP IS OMITTED WHEN NULL rather than shown
            empty (hero `0B`): NULL means NOT RECORDED, and a placeholder would
            assert the lesson has no title or no room when the truth is that
            nobody entered one.
          */}
          <div className="rounded-[12px] bg-[#FDEEF5] px-4 py-3 text-[13.5px] font-semibold text-brand-800">
            {[
              data.lessonNumber === null ? null : `Lesson ${data.lessonNumber}`,
              data.lessonTitle,
              data.sessionDate,
              data.startsAt === null || data.endsAt === null
                ? null
                : `${data.startsAt.slice(0, 5)}–${data.endsAt.slice(0, 5)}`,
              data.room,
            ]
              .filter((v) => v !== null && v !== "")
              .join("  ·  ")}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi label="Enrolled" value={String(data.enrolledCount)} />
            {/*
              ⚠️ `n / m` WHERE `m` IS ATTENDANCE RECORDED, NOT ENROLLED. A roster
              that was never opened has recorded nothing, and dividing by the
              enrolment would report every learner absent — a lie about the
              lesson rather than a gap in the data.
            */}
            <Kpi
              label="Present"
              value={
                data.attendanceRecorded === 0 ? "—" : `${data.presentCount} / ${data.attendanceRecorded}`
              }
              hint={data.attendanceRecorded === 0 ? "Attendance not taken yet" : undefined}
            />
            <Kpi label="Assessed" value={`${data.assessedCount} / ${data.enrolledCount}`} />
            <Kpi
              label="Reports submitted"
              value={`${data.submittedCount} / ${data.assessedCount}`}
              hint={data.awaitingCount > 0 ? `${data.awaitingCount} still with the trainer` : undefined}
            />
          </div>

          <Card className="p-5">
            <h2 className="text-[16px] font-semibold text-ink-strong">Delivery</h2>
            <dl className="mt-3 flex flex-col gap-2.5 text-[12.5px]">
              {/*
                ⛔ ONE TRAINER ROW. The frame draws a second card for an
                Assistant; `A-014`/`G-7` make the persona deferred and the DTO
                carries no field for one.
              */}
              <Row label="Trainer" value={data.trainerName} />
              <Row label="Room" value={data.room} />
            </dl>
          </Card>

          {/*
            ⛔ THE FIVE PROHIBITED CARDS ARE DISCLOSED HERE, NOT IN A COMMENT
            (§12.12). A screen that quietly drops five of six cards looks
            unfinished; one that says which and why is honestly complete.
            ▶ `Q-27`'s precedent: nothing fills the vacated space.
          */}
          <Card className="p-5">
            <h2 className="text-[16px] font-semibold text-ink-strong">
              Five of this design&rsquo;s panels are not built
            </h2>
            <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5 text-[12.5px] leading-5 text-ink">
              <li>
                <strong>Skill averages</strong>, the <strong>status distribution</strong> chart, the{" "}
                <strong>class average</strong>, and each learner&rsquo;s{" "}
                <strong>strongest / focus area / overall</strong> — assessment ratings are shown on a
                report, never aggregated across a class or compared between learners.
              </li>
              <li>
                <strong>Assistant trainer</strong> — the academy has one trainer role in this system.
              </li>
              <li>
                Session-delivery, materials-prepped, sent-to-parents and on-time flags are not
                recorded anywhere yet.
              </li>
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}

function Kpi({
  label,
  value,
  hint,
}: {
  readonly label: string;
  readonly value: string;
  readonly hint?: string;
}) {
  return (
    <Card className="p-5">
      <p className="text-[12px] text-ink">{label}</p>
      <p className="mt-1 text-[26px] font-bold text-ink-strong">{value}</p>
      {hint !== undefined && <p className="mt-0.5 text-[11.5px] text-ink">{hint}</p>}
    </Card>
  );
}

function Row({ label, value }: { readonly label: string; readonly value: string | null }) {
  // ⛔ NULL OMITS THE ROW (hero `0B`).
  if (value === null || value === "") return null;
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-ink">{label}</dt>
      <dd className="font-semibold text-ink-strong">{value}</dd>
    </div>
  );
}
