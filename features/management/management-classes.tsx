"use client";

import { useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { PageHeading } from "@/components/ui/page-heading";
import { StatePanel } from "@/components/ui/state-panel";
import { asFailure, type ResourceState } from "@/features/trainer/resource-state";
import { usePhysicalTestPort } from "@/features/portal/portal-runtime-context";
import type { ManagementClassListDto } from "@/lib/frontend/contracts/physical-test";

/**
 * Screen 12 — Management Classes (PORTAL COMPLETION PLAN phase `P2-1`).
 *
 * Current Final MVP visual authority is `UI_REFERENCE_FINAL_MVP/reference/Management - Classes/`
 * (Amendment 007 A-056, which supersedes the A-045 ordering). This pack carries NO local
 * `reference.png`, and that absence is NOT a missing reference and NOT a reason to re-export
 * from live Figma (`CLAUDE.md` §7.4). The pack's own prohibitions live in
 * `UI_REFERENCE_FINAL_MVP/12-management-classes/screen.md` and `implementation-notes.md`.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⛔ FIVE PLACES THIS SURFACE DEPARTS FROM THE FRAME. EVERY ONE IS RULED, NOT DRIFT
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 *
 * 1. ⛔ THE FRAME'S LEVEL TAB READS `Junior`. IT IS NOT BUILT, AND `Beginner` IS NOT A
 *    RELABEL OF IT. The ratified Class Grade vocabulary is `Beginner` / `Intermediate` /
 *    `Advanced` (`A-016`; `A-026`/`A-054`), fixed by three deterministic seed rows, and
 *    `A-054` expressly prohibits global keyword replacement over this vocabulary — each
 *    occurrence is classified by CONTEXT. This is a Class Grade context, so governance wins.
 *    ⚠️ The tabs below are READ FROM THE DATABASE, never from a literal in this file, so a
 *    fourth value cannot appear here even by editing this component.
 *
 * 2. ⛔ THE FRAME DRAWS `Asst. <name>` ON EVERY CARD. IT IS A TEACHING ASSISTANT FIELD AND IS
 *    PROHIBITED — `A-014` defers the TA persona and `G-7` binds `centre_membership_role`
 *    against extension, so an assistant slot cannot be persisted at all. It is a
 *    `REGISTERED-OMISSION` and IT NEVER ENDS: it is not waiting on data, a design or a phase.
 *    Its absence is `EXPECTED / REQUIRED`, never a visual regression.
 *
 * 3. ⚠️ THE FRAME DRAWS `X / 12 Lessons done`. It needs lesson data that does not exist at
 *    HEAD; it arrives with `D-3`/`D-4` at `P2-2`/`P2-6`. `REGISTERED-OMISSION`, ENDS WHEN
 *    THAT DATA ARRIVES. ⛔ Inventing a denominator now would be schema by inference from a
 *    frame (`A-022`) — and a `0 / 12` rendered from nothing is a fabricated fact, not a
 *    placeholder.
 *
 * 4. ⚠️ ONE TRAINER PER CARD IS NOT A GOVERNED FACT. `A-016` makes trainer assignment
 *    authoritative at CLASS-SESSION level; there is no module-level trainer column and
 *    inventing one is prohibited. The card therefore names the DISTINCT trainers actually
 *    assigned across that module's sessions. Where that is one name it reads as the frame
 *    does; where it is more, all are shown. ⛔ A second name is a second SESSION'S trainer —
 *    never an assistant (see 2).
 *
 * 5. ~~⚠️ THE CARD'S OWN DESTINATION IS INERT, NOT MISSING. A card opens screen `13` Class
 *    Overview (`P2-4`), whose route does not exist at HEAD~~ ✅ **THE CARD IS NOW LIVE —
 *    screen `13` shipped at `P2-4` (2026-08-13)**, at `/management/classes/[classModuleId]`.
 *    ⚠️ REWRITTEN, NOT DELETED: the rule it stated still governs, and it governed correctly
 *    here. A link to a route that 404s would be worse than an inert control with a stated
 *    reason — the same treatment `29`'s "Send Reminder to Trainer" already carries. ▶ The
 *    control went live when its TARGET became real, which is exactly the condition the inert
 *    treatment was chosen for, not a relaxed rule. Second instance after `Add Class` at `P2-2`.
 *
 *    ⛔ **AND STILL NO EDIT AFFORDANCE.** No ratified frame draws one to screen `27`, and the
 *    Operator ruled that a **DESIGN GAP, not a build gap**. Do not add one to this card.
 *
 *    ✅ `Add Class` IS NOW LIVE — screen `26` shipped at `P2-2`. ⚠️ The clause above read
 *    *"`Add Class` AND THE CARD'S OWN DESTINATION ARE INERT"*; it was REWRITTEN rather than
 *    deleted, because the rule it states still governs the card and will govern `Add Class`
 *    again for nothing. ▶ The control became live when its target became real, which is
 *    exactly the condition the original clause named.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⛔ NOTHING ON THIS SURFACE IS AN ASSESSMENT FACT, AND NOTHING MAY BECOME ONE
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * `12` is a LIST surface. `C-9` confines `D-1`'s per-dimension ratings to report DETAIL
 * surfaces, because ratings on a list "invite comparison between children"; `G-2` excludes
 * any roll-up, average or Overall Grade on every surface permanently. `ManagementClassListDto`
 * carries no field that could hold either — the exclusion is at the governed projection, not
 * in this client, because hiding a value the client already holds is not a boundary.
 *
 * ⛔ There is no term chip and no term filter. `D-3` permits terms as SCHEDULING STRUCTURE
 * grouping SESSIONS (`C-6`) and schedules them at `P2-2`; until that phase ships there is no
 * term entity, and an inert chip advertising one would promise a filter that does not exist.
 */

type LevelFilter = string;

export function ManagementClasses() {
  const port = usePhysicalTestPort();
  const filterLabelId = useId();
  const [level, setLevel] = useState<LevelFilter>("");
  const [state, setState] = useState<ResourceState<ManagementClassListDto>>({ kind: "loading" });

  useEffect(() => {
    let active = true;
    void port.listManagementClasses().then((result) => {
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
  }, [port]);

  const data = state.kind === "ready" ? state.data : null;

  /*
   * ⚠️ THE TAB COUNTS ARE DERIVED FROM THE CARDS THIS CALLER ALREADY RECEIVED,
   * never from a separate count query. The same property the `29` class filter
   * relies on: a tab cannot report the existence of a class this management
   * account may not see, so the control can neither disclose nor probe.
   */
  const countsByGrade = useMemo(() => {
    const counts = new Map<string, number>();
    for (const row of data?.classes ?? []) {
      counts.set(row.classGradeCode, (counts.get(row.classGradeCode) ?? 0) + 1);
    }
    return counts;
  }, [data]);

  const visible = useMemo(
    () => (data?.classes ?? []).filter((row) => !level || row.classGradeCode === level),
    [data, level],
  );

  if (state.kind === "loading") {
    return <LoadingSkeleton label="Loading centre classes" rows={3} />;
  }
  if (state.kind === "failed") {
    return (
      <StatePanel
        result={state.result}
        homeHref="/management"
        homeLabel="Return to Management workspace"
      />
    );
  }
  if (!data) return null;

  const total = data.classes.length;
  const narrowed = level !== "";

  return (
    <div className="page-grid">
      <div>
        <PageHeading title="Classes" />
        <p className="mt-0.5 max-w-2xl text-small leading-5 text-ink">
          Every Class Module running at this centre, grouped by Class Grade.
        </p>
      </div>

      <section aria-labelledby={filterLabelId} className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h2 id={filterLabelId} className="text-section-title font-extrabold text-ink-strong">
            All Classes
          </h2>
          <Badge tone="neutral">
            {total} {total === 1 ? "class" : "classes"}
          </Badge>

          {/*
            ✅ `Add Class` IS LIVE AT `P2-2` — screen `26` ships at its canonical route
            `/management/classes/add-class`. It rendered inert until that route existed, which
            is the condition the inert treatment was chosen for, not a rule that was relaxed.
          */}
          <Link
            href="/management/classes/add-class"
            className="inline-flex min-h-11 items-center gap-1 rounded-field border border-transparent bg-brand-700 px-3.5 py-2 text-[0.78125rem] font-semibold text-white hover:bg-brand-800 sm:ms-auto"
          >
            <span aria-hidden="true">+</span> Add Class
          </Link>
        </div>

        {/*
          The frame's level tabs. ⛔ The options come from `class_grades` — the three ratified
          Class Grades (`A-016`) — so this control cannot name a level the academy does not
          have, and the frame's `Junior` is absent because it is not one of them.
        */}
        <div role="group" aria-label="Filter classes by Class Grade" className="flex flex-wrap gap-2">
          <LevelTab
            label="All levels"
            count={total}
            selected={level === ""}
            onSelect={() => setLevel("")}
          />
          {data.grades.map((grade) => (
            <LevelTab
              key={grade.code}
              label={grade.displayName}
              count={countsByGrade.get(grade.code) ?? 0}
              selected={level === grade.code}
              onSelect={() => setLevel(grade.code)}
            />
          ))}
        </div>

        <p id={`${filterLabelId}-note`} className="text-small text-ink">
          The level filter narrows the classes already listed below and reaches no other class.
          Opening a class overview arrives with its own screen; that control stays inert here
          rather than pretending to work.
        </p>
      </section>

      {visible.length === 0 ? (
        <section className="card px-6 py-12 text-center" role="status">
          <h3 className="text-section-title font-extrabold text-ink-strong">
            {narrowed ? "No classes at this level" : "No classes yet"}
          </h3>
          <p className="mt-2 text-body text-ink">
            {narrowed
              ? "Choose All levels to see every class at this centre."
              : "No Class Module has been created for this centre."}
          </p>
        </section>
      ) : (
        <section aria-label="Class modules" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((row) => (
            <article key={row.classModuleId} className="card flex flex-col gap-4 px-5 py-[18px]">
              {/*
                ✅ THE CARD OPENS SCREEN `13`, live since `P2-4`. ⛔ The whole card is NOT a
                link: the frame draws one destination, and wrapping the card would also swallow
                the trainer names into it. One explicit control, one destination.
              */}
              <div className="flex items-start gap-3">
                {/*
                  The frame's `PS` / `SD` chip. It is INITIALS DERIVED FROM THE TITLE by the
                  shared `Avatar` primitive — presentation, not a stored abbreviation. ⛔ There
                  is no "programme" entity and none may be introduced: `C-14` records that
                  programme has no entity, and `A-016` forbids a hidden `classes` entity
                  between Class Grade and Class Module.
                */}
                <Avatar displayName={row.title} size="medium" shape="square" />
                <div className="min-w-0">
                  <h3 className="text-[0.9375rem] font-bold leading-5 text-ink-strong">
                    {row.title}
                  </h3>
                  <p className="mt-1">
                    <Badge tone="info">{row.classGradeLabel}</Badge>
                  </p>
                </div>
              </div>

              {/*
                ⛔ NULL MEANS NOT RECORDED — THE ELEMENT IS OMITTED (hero 0B). A module with no
                readable trainer renders no trainer row at all: never a dash, never "TBC",
                never "Unassigned", because none of those was established.
              */}
              {row.trainerDisplayNames.length > 0 && (
                <ul className="flex flex-col gap-2">
                  {row.trainerDisplayNames.map((name) => (
                    <li key={name} className="flex items-center gap-2.5">
                      <Avatar displayName={name} size="small" />
                      <span className="text-[0.78125rem] font-medium text-ink-strong">{name}</span>
                    </li>
                  ))}
                </ul>
              )}

              <p className="mt-auto border-t border-line pt-3 text-[0.75rem] text-ink">
                <span className="text-[1.0625rem] font-bold text-ink-strong">
                  {row.activeStudentCount}
                </span>{" "}
                {row.activeStudentCount === 1 ? "Student" : "Students"}
                <span className="block text-[0.6875rem] text-neutral-on">
                  Actively enrolled in this Class Module
                </span>
              </p>

              <Link
                href={`/management/classes/${row.classModuleId}`}
                className="inline-flex min-h-11 items-center justify-center rounded-field border border-line px-4 py-2 text-small font-semibold text-brand-700 hover:border-brand-700 hover:bg-brand-50"
              >
                View class overview
                <span className="sr-only"> for {row.title}</span>
              </Link>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

/**
 * One level tab.
 *
 * `aria-pressed` rather than a `tablist`: these are FILTER TOGGLES over one list, not tabs
 * over separate panels, and announcing them as tabs would promise a panel switch that does
 * not happen. The count travels inside the accessible name so a screen-reader user hears the
 * same thing a sighted user reads.
 */
function LevelTab({
  label,
  count,
  selected,
  onSelect,
}: {
  readonly label: string;
  readonly count: number;
  readonly selected: boolean;
  readonly onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-small font-medium ${
        selected
          ? "border-brand-700 bg-brand-700 text-white"
          : "border-line bg-surface text-ink-strong hover:border-brand-700"
      }`}
    >
      {label}
      <span className={selected ? "text-white/80" : "text-neutral-on"}>{count}</span>
      <span className="sr-only">
        {count === 1 ? "class" : "classes"}
      </span>
    </button>
  );
}
