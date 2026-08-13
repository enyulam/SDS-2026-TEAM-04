"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { PageHeading } from "@/components/ui/page-heading";
import { StatePanel } from "@/components/ui/state-panel";
import { asFailure, type ResourceState } from "@/features/trainer/resource-state";
import { usePhysicalTestPort } from "@/features/portal/portal-runtime-context";
import type { ManagementClassListDto } from "@/lib/frontend/contracts/physical-test";

/**
 * Screen 12 — Management Classes (PORTAL COMPLETION PLAN phase `P2-1`;
 * REBUILT 2026-08-13 under Operator AUTHORIZATION A).
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⛔ WHY THIS FILE WAS REBUILT — THE METHOD DEFECT, NOT A TASTE CHANGE
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * The first build derived its layout from `reference/Management - Classes/…​.md` — a PROSE
 * NOTE. The `.png` and the `.html` were never opened. `PORTAL_COMPLETION_PLAN.md` §3 already
 * required all three artefacts; nothing measured that requirement, so it went unnoticed for
 * four consecutive phases (`CLAUDE.md` §7.4.1, plan §12). ▶ Two symptoms in this one file: a
 * `View class overview` BUTTON that the frame does not draw, and a reported finding that
 * another screen's Edit control "did not exist" — both `grep`s over prose.
 *
 * ⚠️ EVERY GEOMETRIC VALUE BELOW IS CITED FROM `Management - Classes.html` and is verified by
 * `prove:artefact-read`, which fails if a cited value is absent from that file or unused here.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⚠️ WHAT THE `.png` DRAWS (artefact: `Management - Classes.png`)
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * One `space-between` toolbar row — `All Classes` + a count pill on the left, the four level
 * pills and `+ Add Class` on the RIGHT OF THE SAME ROW. Then a 3-column card grid. Each card:
 * a square programme chip + title + grade, a `···` overflow glyph top-right, a trainer row, a
 * 1px divider, and a two-slot footer (`32 / Students` · `8 / 12 / Lessons done`).
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⛔ FIVE DEPARTURES FROM THE FRAME. EVERY ONE IS RULED, NOT DRIFT
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 *
 * 1. ⛔ THE FRAME'S LEVEL TAB READS `Junior`. IT IS NOT BUILT, AND `Beginner` IS NOT A
 *    RELABEL OF IT. The ratified Class Grade vocabulary is `Beginner` / `Intermediate` /
 *    `Advanced` (`A-016`; `A-026`/`A-054`), fixed by three deterministic seed rows, and
 *    `A-054` expressly prohibits global keyword replacement over this vocabulary — each
 *    occurrence is classified by CONTEXT. This is a Class Grade context, so governance wins.
 *    ⚠️ The tabs are READ FROM THE DATABASE, never from a literal in this file, so a fourth
 *    value cannot appear here even by editing this component.
 *
 * 2. ⛔ THE FRAME DRAWS `Asst. <name>` ON THE RIGHT OF EVERY CARD'S TRAINER ROW. IT IS A
 *    TEACHING ASSISTANT FIELD AND IS PROHIBITED — `A-014` defers the TA persona and `G-7`
 *    binds `centre_membership_role` against extension, so an assistant slot cannot be
 *    persisted at all. `REGISTERED-OMISSION`, and IT NEVER ENDS: it waits on no data, no
 *    design and no phase. Its absence is `EXPECTED / REQUIRED`, never a visual regression.
 *
 * 3. ⚠️ THE FRAME'S FOOTER HAS TWO SLOTS; ONLY THE LEFT ONE IS BUILT. `8 / 12 Lessons done`
 *    needs lesson-completion data that does not exist at HEAD; it arrives with its own phase
 *    (Operator AUTHORIZATION B). `REGISTERED-OMISSION`, ENDS WHEN THAT DATA ARRIVES. ⛔ A
 *    `0 / 12` rendered from nothing is a fabricated fact, not a placeholder, and inventing a
 *    denominator would be schema by inference from a frame (`A-022`). ▶ The `Students` stat
 *    keeps the frame's FOOTER POSITION — below the divider, value over caption.
 *
 * 4. ⚠️ ONE TRAINER PER CARD IS NOT A GOVERNED FACT. `A-016` makes trainer assignment
 *    authoritative at CLASS-SESSION level; there is no module-level trainer column and
 *    inventing one is prohibited. The card names the DISTINCT trainers actually assigned
 *    across that module's sessions. Where that is one name it reads as the frame does; where
 *    it is more, all are shown. ⛔ A second name is a second SESSION'S trainer — never an
 *    assistant (see 2).
 *
 * 5. ⛔ THE `···` MENU OPENS TO NOTHING, DELIBERATELY. The frame draws the GLYPH and defines
 *    NO ITEMS — no labels, no targets, no states. Operator ruling: *"build the affordance,
 *    and if its contents are undefined by the frame, it opens to nothing rather than to
 *    invented items."* So the control is real and operable, and it says plainly that the
 *    frame defines no actions. ⚠️ It is NOT the inbound route to screen `27` Edit Class:
 *    `13`'s header card carries that control, per `13`'s own frame.
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
 * grouping SESSIONS (`C-6`); until a term surface ships, an inert chip would advertise a
 * filter that does not exist.
 */

export function ManagementClasses() {
  const port = usePhysicalTestPort();
  const filterLabelId = useId();
  const [level, setLevel] = useState<string>("");
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
   * never from a separate count query. A tab cannot report the existence of a
   * class this management account may not see, so the control can neither
   * disclose nor probe.
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
        homeHref="/management/dashboard"
        homeLabel="Return to Management workspace"
      />
    );
  }
  if (!data) return null;

  const total = data.classes.length;
  const narrowed = level !== "";

  return (
    <div className="page-grid">
      {/*
        ⛔ THE BREADCRUMB WAS MISSING ENTIRELY, and the Operator ruled it TRUE-DRIFT:
        *"My acceptance of `12` was a walkthrough, not a measurement, and your measurement
        supersedes it."* `Management - Classes.html` draws `Management / Classes` at
        `font-size: 11.50px` with `gap: 3px` ABOVE the `22px` title.
        ⚠️ NO BACK LINK HERE — `12` is the top of this branch; there is nothing above it.
      */}
      <PageHeading breadcrumb={<>Management / Classes</>} title="Classes" />

      {/*
        The frame's ONE toolbar row: heading + count pill on the left, level pills and
        `Add Class` on the right of the same row (`justify-content: space-between`).
        It wraps on narrow viewports rather than overflowing — the frame is drawn at one
        width and defines no small-viewport variant, so wrapping is the honest degradation.
      */}
      <section
        aria-labelledby={filterLabelId}
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <div className="flex items-center gap-[10px]">
          <h2 id={filterLabelId} className="text-[17px] font-bold leading-6 text-ink-strong">
            All Classes
          </h2>
          <span className="rounded-full bg-brand-100 px-[10px] py-1 text-[11px] font-semibold text-brand-800">
            {total} {total === 1 ? "class" : "classes"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-[10px]">
          {/*
            ⛔ The options come from `class_grades` — the three ratified Class Grades
            (`A-016`) — so this control cannot name a level the academy does not have, and the
            frame's `Junior` is absent because it is not one of them.
          */}
          <div role="group" aria-label="Filter classes by Class Grade" className="flex flex-wrap items-center gap-[10px]">
            <LevelTab label="All levels" count={total} selected={level === ""} onSelect={() => setLevel("")} />
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

          {/* ✅ LIVE since `P2-2` — screen `26` exists at this canonical route. */}
          <Link
            href="/management/classes/add-class"
            className="inline-flex min-h-11 items-center gap-[7px] rounded-[11px] bg-brand-700 px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-brand-800"
          >
            <span aria-hidden="true">+</span> Add Class
          </Link>
        </div>
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
        <section aria-label="Class modules" className="grid gap-[20px] sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((row) => (
            <ClassCard
              key={row.classModuleId}
              classModuleId={row.classModuleId}
              title={row.title}
              gradeLabel={row.classGradeLabel}
              trainerDisplayNames={row.trainerDisplayNames}
              activeStudentCount={row.activeStudentCount}
            />
          ))}
        </section>
      )}
    </div>
  );
}

/**
 * One class card, built to `Management - Classes.html`.
 *
 * ⚠️ THE WHOLE CARD IS THE AFFORDANCE — the frame draws no button, and the note's own
 * behaviour line is *"Selecting a class card opens `Management - Class Overview`"*. It is
 * implemented as a STRETCHED LINK on the title rather than by wrapping the card in an `<a>`:
 * the `···` control must remain independently operable, and a `<button>` nested inside an
 * `<a>` is invalid HTML and unusable by keyboard.
 */
function ClassCard({
  classModuleId,
  title,
  gradeLabel,
  trainerDisplayNames,
  activeStudentCount,
}: {
  readonly classModuleId: string;
  readonly title: string;
  readonly gradeLabel: string;
  readonly trainerDisplayNames: readonly string[];
  readonly activeStudentCount: number;
}) {
  return (
    <article className="relative flex flex-col gap-[13px] rounded-[16px] border border-line bg-surface px-[18px] py-4 shadow-[var(--shadow-card)] focus-within:border-brand-700 hover:border-brand-700">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-[11px]">
          {/*
            The frame's `PS` / `SD` chip — INITIALS DERIVED FROM THE TITLE by the shared
            `Avatar` primitive, presentation only. ⛔ There is no "programme" entity and none
            may be introduced: `C-14` records that programme has no entity, and `A-016`
            forbids a hidden `classes` entity between Class Grade and Class Module.
          */}
          <Avatar displayName={title} size="tile" shape="tile" />
          <div className="min-w-0">
            <h3 className="truncate text-[14px] font-semibold leading-5 text-ink-strong">
              <Link
                href={`/management/classes/${classModuleId}`}
                className="after:absolute after:inset-0 after:content-[''] focus:outline-none"
              >
                {title}
              </Link>
            </h3>
            <p className="mt-[2px] text-[11px] text-ink-subtle">{gradeLabel}</p>
          </div>
        </div>
        <OverflowMenu label={title} />
      </div>

      {/*
        ⛔ NULL MEANS NOT RECORDED — THE ELEMENT IS OMITTED (hero 0B). A module with no
        readable trainer renders no trainer row at all: never a dash, never "TBC", never
        "Unassigned", because none of those was established.
        ⛔ The frame's right-hand `Asst. <name>` slot is absent by ruling — see departure 2.
      */}
      {trainerDisplayNames.length > 0 && (
        <ul className="flex flex-col gap-2">
          {trainerDisplayNames.map((name) => (
            <li key={name} className="flex items-center gap-2">
              <Avatar displayName={name} size="mini" />
              <span className="text-[12px] font-medium text-ink-muted">{name}</span>
            </li>
          ))}
        </ul>
      )}

      {/* The frame's 1px hairline, `background: var(--border-subtle, #EDEFF4)`. */}
      <div className="mt-auto h-px bg-line" />

      <div className="flex items-start justify-between">
        <p className="flex flex-col gap-[2px]">
          <span className="text-[15px] font-bold leading-none text-ink-strong">
            {activeStudentCount}
          </span>
          <span className="text-[10px] font-medium text-ink-subtle">Students</span>
          <span className="sr-only">actively enrolled in this Class Module</span>
        </p>
        {/* ⛔ The frame's second footer slot (`Lessons done`) is a REGISTERED-OMISSION — departure 3. */}
      </div>
    </article>
  );
}

/**
 * The frame's `···` glyph — three `2.40px` dots in an `18px` box.
 *
 * ⛔ IT OPENS TO NOTHING, AND THAT IS THE POINT. The frame draws the glyph and defines no
 * items; inventing one would be exactly the error this rebuild exists to correct. The menu is
 * real, focusable and dismissible, and states plainly that the ratified frame defines no
 * actions for it.
 */
function OverflowMenu({ label }: { readonly label: string }) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative z-10 shrink-0">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`More options for ${label}`}
        onClick={() => setOpen((value) => !value)}
        className="grid size-11 place-items-center rounded-full text-ink-subtle hover:bg-surface-muted"
      >
        <span aria-hidden="true" className="flex w-[18px] items-center justify-center gap-[2.4px]">
          <span className="size-[2.4px] rounded-full bg-current" />
          <span className="size-[2.4px] rounded-full bg-current" />
          <span className="size-[2.4px] rounded-full bg-current" />
        </span>
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={`More options for ${label}`}
          className="absolute end-0 z-20 mt-1 w-64 rounded-[11px] border border-line bg-surface p-3 text-[11px] leading-4 text-ink shadow-[var(--shadow-card)]"
        >
          The ratified frame defines no actions for this menu, so none is offered.
        </div>
      )}
    </div>
  );
}

/**
 * One level tab, at the frame's pill geometry (`padding: 9px 14px`, `border-radius: 999px`,
 * `outline: 1.30px #EDEFF4`, `font-size: 12px`).
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
      className={`inline-flex min-h-11 items-center gap-2 rounded-full border-[1.3px] px-3.5 py-2 text-[12px] font-semibold ${
        selected
          ? "border-brand-700 bg-brand-700 text-white"
          : "border-line bg-surface text-ink-muted hover:border-brand-700"
      }`}
    >
      {label}
      <span className={selected ? "text-white/80" : "text-neutral-on"}>{count}</span>
      <span className="sr-only">{count === 1 ? "class" : "classes"}</span>
    </button>
  );
}
