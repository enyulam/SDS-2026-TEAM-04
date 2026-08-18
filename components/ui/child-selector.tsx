"use client";

import { useId } from "react";

/**
 * ⛔ THE PRODUCT'S ONE CHILD SELECTOR.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⚠️ EXTRACTED, NOT INVENTED — 2026-08-19, under an Operator ruling, and the
 * THIRD TIME THIS RULING HAS BEEN MADE. It is now a standing rule:
 *
 *   ⛔ **WHERE TWO SURFACES PERFORM THE SAME ACT, THEY USE ONE CONTROL, AND
 *   THE FIRST BUILT IS THE ONE REUSED UNLESS A FRAME SAYS OTHERWISE.**
 *
 * The first two instances were the rating tiles and the back links
 * (`components/ui/back-link.tsx`, which carries the same note). This is the
 * third: three parent surfaces performed one act in two languages —
 * `/parent/reports` with a dropdown, `/parent/dashboard` and
 * `/parent/calendar` with a row of pill buttons.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ⚠️ **THE FRAMES WERE MEASURED FIRST, AND THEY SAY NOTHING — WHICH IS ITSELF
 * THE FINDING.** `Parent - Dashboard`, `Parent - Calendar` and `Parent -
 * Report` were each opened: **0 `<select>` elements, no chevron or caret, and
 * no button row, in any of the three.** All three draw a single child as a
 * static identity line (`Alicia Gomez · Junior`). ▶ So NEITHER existing
 * treatment came from a frame — both were implementation inventions, made
 * because a parent may be linked to more than one child while the frames
 * assume exactly one. **No frame says otherwise, so the standing rule applies
 * unmodified and the first-built control wins.**
 *
 * ✅ **AND THE FIRST-BUILT CONTROL WAS ALREADY FRAME-FAITHFUL.** Its
 * single-child branch renders exactly the static identity line the frames
 * draw, so extracting it gives screens `30` and `31` the frame's own shape in
 * the common case, for free. That was not the reason for the ruling, but it
 * is why the ruling costs nothing.
 *
 * ⛔ **AUTHORIZATION IS NOT AFFECTED BY THIS CONTROL AND NEVER WAS.** The list
 * it renders is already resolved: `students_select_parent` filters by
 * `parent_student_links` in the database, so it cannot offer a child the
 * parent has no live link to (`ADR-4`). Changing the widget changes nothing
 * about reach.
 */
export type SelectableChild = {
  readonly studentId: string;
  /** The name as the surface already renders it. */
  readonly label: string;
  /** Appended after a `·` when present — the frames' `Alicia Gomez · Junior`. */
  readonly qualifier?: string | null;
};

export function ChildSelector({
  childrenList,
  value,
  onChange,
  allOption,
}: {
  readonly childrenList: readonly SelectableChild[];
  readonly value: string;
  readonly onChange: (next: string) => void;
  /**
   * An extra leading option, for surfaces where "every linked learner" is a
   * meaningful view. ⚠️ `/parent/reports` passes one because a LIST can show
   * all; `30` and `31` omit it, because a dashboard or a month calendar for
   * "all children" has no meaning — that is a genuine difference between the
   * surfaces, carried as a prop rather than as a second control.
   */
  readonly allOption?: { readonly value: string; readonly label: string };
}) {
  const selectId = useId();

  // ⛔ NOTHING TO CHOOSE, NOTHING TO RENDER. An empty list is not an empty
  // picker — the caller's own no-linked-learner copy is the right surface.
  if (childrenList.length === 0) return null;

  const single = childrenList.length === 1 && allOption === undefined;

  return (
    <div className="shrink-0 rounded-card border border-line bg-surface px-4 py-2.5 shadow-raised">
      {single ? (
        <>
          {/*
            ⚠️ A PICKER WITH ONE OPTION IS FURNITURE — and this branch is also
            the only one the frames actually draw, so it is the faithful case
            rather than the degraded one.
          */}
          <p className="block text-[0.59375rem] font-medium text-ink">Viewing</p>
          <p className="mt-0.5 text-[0.78125rem] font-semibold text-ink-strong">
            {labelOf(childrenList[0])}
          </p>
        </>
      ) : (
        <>
          <label className="block text-[0.59375rem] font-medium text-ink" htmlFor={selectId}>
            Viewing
          </label>
          <select
            id={selectId}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="mt-0.5 block cursor-pointer border-0 bg-transparent p-0 text-[0.78125rem] font-semibold text-ink-strong"
          >
            {allOption !== undefined && <option value={allOption.value}>{allOption.label}</option>}
            {childrenList.map((child) => (
              <option key={child.studentId} value={child.studentId}>
                {child.label}
              </option>
            ))}
          </select>
        </>
      )}
    </div>
  );
}

function labelOf(child: SelectableChild): string {
  return child.qualifier ? `${child.label} · ${child.qualifier}` : child.label;
}
