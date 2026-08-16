"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { usePhysicalTestPort } from "@/features/portal/portal-runtime-context";
import type { TrainerReportsDto } from "@/lib/frontend/contracts/physical-test";
import { PageHeading } from "@/components/ui/page-heading";
import { Card } from "@/components/ui/surface";
import { SearchInput } from "@/components/ui/field";
import { StatePanel } from "@/components/ui/state-panel";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { asFailure, type FailureResult } from "@/features/trainer/resource-state";

/**
 * Screen `09` — Trainer Reports. Phase `P2-21`.
 *
 * Reference pack: `UI_REFERENCE_FINAL_MVP/reference/Trainer - Reports/`
 * (visual rank 1, `A-056`), read as the `.png`, the `.html` and the numbered
 * pack's `screen.md` — §7.4.1.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⛔ TWO COLUMNS THE FRAME DRAWS ARE REFUSED BY THIS PACK'S OWN REGISTER
 * ═══════════════════════════════════════════════════════════════════════════
 * 1. ⛔ **`Level`** — `Mastering` / `Developing` / `Mastered` / `Beginning`,
 *    one per row. **`GC-7`**, verbatim: *"Ratings shown in a 'Level'/chips
 *    column although screen.md section 8 declares the screen 'Not
 *    rating-bearing'. GOVERNANCE WINS. **DO NOT BUILD.**"* ▶ The refusal lives
 *    in the DTO, which has no rating field to render.
 *
 * 2. ⛔ **The `In session` and `Draft` status chips** — **`GC-8`**: *"Only
 *    `submitted` is among the eight authorized `report_status` values
 *    (`A-036`). A status must never be added to encode UI presence. **DO NOT
 *    BUILD the extra chips.**"* ▶ What renders is the REAL `report_state`.
 *    Measured in the fixture: `submitted` · `draft_ready` · `trainer_approved`
 *    — so the frame's three-chip vocabulary is not even a renaming of what
 *    exists.
 *
 * ⚠️ **THE REFUSED COLUMN LEAVES A GAP.** The remaining columns are not
 * stretched to reclaim its width — the `20`/`24` rule.
 *
 * ⚠️ **THE `Lesson` COLUMN IS BUILT AND WILL BE EMPTY.** Measured 2026-08-16:
 * **0 of 17 sessions in the fixture carry a `lesson_number` or `lesson_title`**,
 * so every row omits the lesson line today. ▶ That is a FIXTURE fact, not a
 * defect — the column is permitted, the schema has it, the trainer can read it,
 * and screens `13`, `15` and `25` read the same two columns. Hero `0B`: omitted,
 * never invented.
 *
 * ⚠️ **THE COUNT AND THE CHIPS ARE DERIVED FROM THE ROWS.** The frame shows
 * `All Reports 42` and per-class chip counts; both come from the same array the
 * table renders, so a chip can never disagree with the table it filters.
 *
 * MEASURED (`.html`), cited only where this component builds to it:
 * `12.50px` · `12px` · `13px` · `11px` · `999px` · `12px` radius on the card ·
 * `14px` gap.
 */
export function TrainerReportsScreen() {
  const port = usePhysicalTestPort();
  const [status, setStatus] = useState<
    | { readonly kind: "loading" }
    | { readonly kind: "ready"; readonly data: TrainerReportsDto }
    | { readonly kind: "failed"; readonly result: FailureResult }
  >({ kind: "loading" });
  const [query, setQuery] = useState("");
  const [classFilter, setClassFilter] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void port.readTrainerReports().then((result) => {
      if (cancelled) return;
      setStatus(
        result.outcome === "success"
          ? { kind: "ready" as const, data: result.data }
          : { kind: "failed" as const, result: asFailure(result) },
      );
    });
    return () => {
      cancelled = true;
    };
  }, [port]);

  const data = status.kind === "ready" ? status.data : null;

  /*
   * ⚠️ SEARCH AND FILTER ARE CLIENT-SIDE OVER AN ALREADY-AUTHORIZED LIST, and
   * that is not a shortcut: the rows arrived through a governed read that
   * resolved this trainer's reach in the database. Narrowing what is already
   * permitted is presentation; it never widens anything (ADR-3).
   */
  const visible = useMemo(() => {
    if (data === null) return [];
    const needle = query.trim().toLowerCase();
    return data.reports.filter(
      (r) =>
        (classFilter === null || r.classLabel === classFilter) &&
        (needle.length === 0 || r.studentName.toLowerCase().includes(needle)),
    );
  }, [data, query, classFilter]);

  return (
    <div className="page-grid">
      <PageHeading
        title="Reports"
        breadcrumb="Student reports you have created and submitted"
        actions={
          <SearchInput
            aria-label="Search reports by student name"
            placeholder="Search by name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full sm:w-[280px]"
          />
        }
      />

      {status.kind === "failed" ? <StatePanel result={status.result} /> : null}
      {status.kind === "loading" ? <LoadingSkeleton rows={4} label="Loading reports" /> : null}

      {data !== null && (
        <>
          <div className="flex flex-wrap items-center gap-[14px]">
            <h2 className="text-[17px] font-bold text-ink-strong">All Reports</h2>
            <span className="text-[12.5px] text-ink">{data.total}</span>
          </div>

          {/*
            ⛔ CHIPS FROM DATA, NEVER FROM LITERALS. The frame draws
            `Junior · Public Speaking · 18` and two more; `Junior` is not a
            ratified Class Grade (`A-016`, `A-054`), so rendering the frame's
            chip list verbatim would invent a grade. These labels and counts
            come from the rows.
          */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[12.5px] text-ink">Filter by class:</span>
            <button
              type="button"
              aria-pressed={classFilter === null}
              onClick={() => setClassFilter(null)}
              className={
                classFilter === null
                  ? "min-h-11 rounded-[999px] bg-brand-600 px-4 text-[12.5px] font-semibold text-white"
                  : "min-h-11 rounded-[999px] border border-line bg-surface px-4 text-[12.5px] font-medium text-ink-strong"
              }
            >
              All classes
            </button>
            {data.classes.map((c) => (
              <button
                key={c.label}
                type="button"
                aria-pressed={classFilter === c.label}
                onClick={() => setClassFilter(classFilter === c.label ? null : c.label)}
                className={
                  classFilter === c.label
                    ? "min-h-11 rounded-[999px] bg-brand-600 px-4 text-[12.5px] font-semibold text-white"
                    : "min-h-11 rounded-[999px] border border-line bg-surface px-4 text-[12.5px] font-medium text-ink-strong"
                }
              >
                {`${c.label} · ${c.count}`}
              </button>
            ))}
          </div>

          <Card className="overflow-x-auto rounded-[12px] p-0">
            <table className="w-full min-w-[720px] border-collapse">
              <thead>
                <tr className="border-b border-line text-left">
                  <th scope="col" className="px-5 py-3 text-[11px] font-medium text-ink">Student</th>
                  <th scope="col" className="px-5 py-3 text-[11px] font-medium text-ink">Class</th>
                  <th scope="col" className="px-5 py-3 text-[11px] font-medium text-ink">Lesson</th>
                  {/*
                    ⛔ NO `Level` HEADER. `GC-7`. The column is absent rather
                    than empty, and the widths of the others are unchanged.
                  */}
                  <th scope="col" className="px-5 py-3 text-[11px] font-medium text-ink">Status</th>
                  <th scope="col" className="px-5 py-3 text-[11px] font-medium text-ink">
                    <span className="sr-only">Open report</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => (
                  <tr key={r.reportId} className="border-b border-line last:border-0">
                    <td className="px-5 py-3.5 text-[13px] font-semibold text-ink-strong">{r.studentName}</td>
                    <td className="px-5 py-3.5 text-[12.5px] text-ink">{r.classLabel}</td>
                    <td className="px-5 py-3.5 text-[12.5px] text-ink">
                      {/*
                        ⚠️ OMITTED WHEN THE SESSION CARRIES NO LESSON — hero
                        `0B`. Never `Lesson —` and never a fabricated number.
                      */}
                      {r.lessonNumber === null && r.lessonTitle === null
                        ? ""
                        : [r.lessonNumber === null ? null : `Lesson ${r.lessonNumber}`, r.lessonTitle]
                            .filter(Boolean)
                            .join(" · ")}
                    </td>
                    <td className="px-5 py-3.5">
                      {/*
                        ⛔ THE REAL `report_status` (`A-036`), rendered as
                        written. `GC-8` bars the frame's `In session`/`Draft`,
                        and inventing a friendlier label here would reintroduce
                        them under another name.
                      */}
                      <span className="inline-flex items-center rounded-[999px] bg-surface-muted px-3 py-1 text-[12px] font-semibold text-ink-strong">
                        {r.reportState}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {/*
                        ⛔ THE TARGET IS `/review`, NOT THE BARE `[reportId]`,
                        AND THAT IS MEASURED RATHER THAN PREFERRED. The frame's
                        `View ›` points at screen `10` Trainer Student Report,
                        whose canonical route IS `/trainer/reports/[reportId]` —
                        and the ratified inventory records that **no bare index
                        route exists**: *"review and edit sub-routes carry the
                        function"*. ▶ Linking to the canonical route would have
                        shipped a 404, which is the SAME DEFECT CLASS as
                        `C2C-007` that this phase exists to fix.
                        ⚠️ Building the index route would be building screen
                        `10`, which is not this phase. Recorded, not invented.
                      */}
                      <Link
                        href={`/trainer/reports/${r.reportId}/review`}
                        className="text-[12.5px] font-semibold text-brand-700 underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
                {visible.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-6 text-center text-[12.5px] text-ink">
                      {data.total === 0
                        ? "No reports yet. A report appears here once you save an assessment for a learner."
                        : "No reports match that search or filter."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>

          {/*
            ⛔ THE TWO REFUSALS, DISCLOSED WHERE THE OPERATOR READS (§12.12).
          */}
          <p className="text-[11px] leading-5 text-ink">
            This design also shows a <strong>Level</strong> column of competency ratings and the status
            labels <strong>In session</strong> and <strong>Draft</strong>. Neither is built: this screen
            does not carry competency ratings, and the statuses shown above are the report&rsquo;s real
            workflow states rather than display-only labels.
          </p>
        </>
      )}
    </div>
  );
}
