"use client";

import { useEffect, useMemo, useState } from "react";

import { PageHeading } from "@/components/ui/page-heading";
import { Card } from "@/components/ui/surface";
import { StatePanel } from "@/components/ui/state-panel";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { asFailure, type ResourceState } from "@/features/trainer/resource-state";
import { usePhysicalTestPort } from "@/features/portal/portal-runtime-context";
import type { TrainerStudentsDto } from "@/lib/frontend/contracts/physical-test";

/**
 * Screen `04` — Trainer Students. Phase `P2-20`.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ARTEFACTS OPENED (`CLAUDE.md` §7.4.1 — every claim names one)
 * ═══════════════════════════════════════════════════════════════════════════
 *   · `reference/Trainer - Students/Trainer - Students.png`   — geometry
 *   · `reference/Trainer - Students/Trainer - Students.html`  — measured values
 *   · `UI_REFERENCE_FINAL_MVP/04-trainer-students/screen.md`  — §8, and its
 *     `implementation-notes.md`, where `GC-7` lives
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⛔ ONE OF THE FOUR COLUMNS IS REFUSED, AND ONE FIELD HAS NO COLUMN
 * ═══════════════════════════════════════════════════════════════════════════
 * 1. ⛔ **THE `Level` COLUMN.** The `.png` draws per-student chips —
 *    `Mastering`, `Developing`, `Mastered`, `Beginning`. Refused twice:
 *      · `GC-7`, in this pack's own notes — *"screen.md section 8 declares
 *        this screen 'Not rating-bearing' … DO NOT BUILD the rating column"*;
 *      · `G-2` independently — one chip for a learner's whole assessment
 *        history is a **roll-up**, barred on every surface **regardless of
 *        audience**. The trainer authored these ratings, so this is not a
 *        disclosure question: **no roll-up exists to render.**
 *    ▶ **ABSENT, NOT EMPTY** — no heading, no cell, no dash, and no softened
 *    replacement. `P2-8` set that precedent for screen `17`'s `Overall`.
 *
 * 2. ⚠️ **`ID 2025-113` HAS NO COLUMN.** `students` carries `id`, `centre_id`,
 *    `full_name`, `is_active` and three timestamps — **no external code**.
 *    ▶ **CITED, NOT DISABLED**: the line is omitted rather than rendered from
 *    the UUID, which would put a governed internal identifier on a page where
 *    the frame intends a human-readable roll number, and would look correct.
 *
 * ⚠️ **A NEAR-MISS WORTH NAMING (living decoy register, plan §37):**
 * `class_grades.code` holds `beginner`/`intermediate`/`advanced` and the
 * refused chips read `Beginning`/`Developing`/`Mastering`/`Mastered`.
 * **`Beginner` and `Beginning` are one letter apart and are different
 * vocabularies** (`A-054`). Sourcing the refused column from it would ship a
 * Class Grade dressed as a competency rating.
 *
 * MEASURED (`.html`): `My Students` heading `17px` · row name and the filter
 * pill `13px` · column headers and the secondary line `11px` · class cell and
 * the search field `12.50px` · avatar initials `11.50px` · the filter pill
 * `border-radius: 999px` · header gap `18px`, control gap `10px`.
 */
export function TrainerStudentsScreen() {
  const port = usePhysicalTestPort();
  const [state, setState] = useState<ResourceState<TrainerStudentsDto>>({ kind: "loading" });
  const [moduleId, setModuleId] = useState<string>("");
  const [query, setQuery] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    void port.readTrainerStudents().then((result) => {
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
  }, [port]);

  const data = state.kind === "ready" ? state.data : null;

  /*
   * ⚠️ FILTER AND SEARCH ARE CLIENT-SIDE OVER AN ALREADY-AUTHORIZED LIST, and
   * that is deliberate rather than lazy: the governed read has already decided
   * WHICH learners this trainer may see. Narrowing that list cannot widen it,
   * so no filter here is an authorization decision — which is exactly why it
   * is safe to run in the browser.
   */
  const visible = useMemo(() => {
    if (data === null) return [];
    const needle = query.trim().toLowerCase();
    return data.rows.filter(
      (row) =>
        (moduleId === "" || row.classModuleId === moduleId) &&
        (needle === "" || row.studentName.toLowerCase().includes(needle)),
    );
  }, [data, moduleId, query]);

  return (
    <div className="page-grid">
      <PageHeading title="Students" description="Your learners across all classes" />

      {state.kind === "failed" ? (
        <StatePanel result={state.result} homeHref="/trainer/schedule" homeLabel="Go to Schedule" />
      ) : null}
      {state.kind === "loading" ? <LoadingSkeleton rows={4} label="Loading your students" /> : null}

      {data !== null && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-[18px]">
            <div className="flex items-center gap-[10px]">
              <h2 className="text-[17px] font-semibold text-ink-strong">My Students</h2>
              <span className="rounded-[999px] bg-brand-100 px-2.5 py-0.5 text-[11.5px] font-semibold text-brand-700">
                {data.studentCount}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-[10px]">
              <label className="sr-only" htmlFor="trainer-students-class">
                Filter by class
              </label>
              <select
                id="trainer-students-class"
                value={moduleId}
                onChange={(event) => setModuleId(event.target.value)}
                className="min-h-11 rounded-[999px] border border-line bg-surface px-4 text-[13px] font-medium text-ink-strong"
              >
                <option value="">All classes</option>
                {data.classes.map((option) => (
                  <option key={option.classModuleId} value={option.classModuleId}>
                    {option.classLabel}
                  </option>
                ))}
              </select>
              <label className="sr-only" htmlFor="trainer-students-search">
                Search students
              </label>
              <input
                id="trainer-students-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search students"
                className="min-h-11 w-full max-w-[240px] rounded-[12px] border border-line bg-surface px-3 text-[12.5px] text-ink-strong"
              />
            </div>
          </div>

          <Card className="p-0">
            {visible.length === 0 ? (
              <p className="p-5 text-[12.5px] text-ink">
                {data.rows.length === 0
                  ? "No learners are enrolled in your classes yet."
                  : "No learners match this filter."}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-left">
                  <thead>
                    {/*
                      ⛔ THREE COLUMNS, NOT FOUR. The frame's fourth is `Level`
                      and it is refused — absent, with no placeholder heading.
                    */}
                    <tr className="border-b border-line">
                      <th scope="col" className="px-5 py-3 text-[11px] font-medium text-ink-muted">
                        Student
                      </th>
                      <th scope="col" className="px-5 py-3 text-[11px] font-medium text-ink-muted">
                        Class
                      </th>
                      <th scope="col" className="px-5 py-3 text-[11px] font-medium text-ink-muted">
                        Last assessed
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((row) => (
                      <tr key={`${row.studentId}:${row.classModuleId}`} className="border-b border-line last:border-b-0">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-[10px]">
                            <span
                              aria-hidden="true"
                              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[11.5px] font-semibold text-brand-700"
                            >
                              {row.initials}
                            </span>
                            <span className="text-[13px] font-semibold text-ink-strong">{row.studentName}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-[12.5px] text-ink">{row.classLabel}</td>
                        {/*
                          ⚠️ THE FRAME'S OWN `—`. Its note: "A dash is shown
                          when no recent assessment date is available." NULL
                          means NOT ASSESSED, never zero and never blank.
                        */}
                        <td className="px-5 py-3 text-[12.5px] text-ink">{row.lastAssessed ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/*
            ⛔ THE TWO OMISSIONS, STATED WHERE THE OPERATOR READS (§12.12).
            A refusal nobody can see on the page is indistinguishable from an
            oversight.
          */}
          <p className="text-[11.5px] leading-5 text-ink">
            This design shows a performance level for each learner. Assessment ratings are recorded
            against a session and are shown on that session&rsquo;s report, not summarised per learner.
            It also shows a learner reference number, which this system does not hold.
          </p>
        </>
      )}
    </div>
  );
}
