"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { SearchInput, Select } from "@/components/ui/field";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { PageHeading } from "@/components/ui/page-heading";
import { StatePanel } from "@/components/ui/state-panel";
import { asFailure, type ResourceState } from "@/features/trainer/resource-state";
import { usePhysicalTestPort } from "@/features/portal/portal-runtime-context";
import type { ManagementStudentListDto } from "@/lib/frontend/contracts/physical-test";

/**
 * Screen `17` — Management Students (PORTAL COMPLETION PLAN phase `P2-8`).
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ARTEFACTS OPENED FOR THIS BUILD (`CLAUDE.md` §7.4.1 — every claim below names one)
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 *   · `reference/Management - Students/Management - Students.png`   — geometry and visual truth
 *   · `reference/Management - Students/Management - Students.html`  — every measured value below
 *   · `UI_REFERENCE_FINAL_MVP/17-management-students/screen.md`     — governance and provenance
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⚠️ WHAT THE `.png` DRAWS
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * `Students` + `All learners enrolled at the academy`. A row carrying `All Students`, a
 * `248 enrolled` pill, a `Search students` field, an `All grades` select, an `Add Parent`
 * button and a pink `Register Student` button. Then one card holding a table with four column
 * headings — `Student` · `Class` · `Guardian` · `Overall` — and ten learner rows: initials
 * avatar, name, `ID 2025-113`, `Junior · Public Speaking`, a guardian name, a RATING CHIP, and
 * `View more ›`.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⛔⛔ THE `Overall` COLUMN IS NOT BUILT, AND IT NEVER WILL BE
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * The `.html` carries all four ratified labels as literal chip text and the pack note names the
 * column *"current B.E.S.T. Rating"*, using *"Beginning, Developing, Mastering, and Mastered"*.
 *
 * ⛔ **BOTH AVAILABLE READINGS PROHIBIT IT**, which is the strongest form. Read as a
 * per-dimension rating, **`C-9`** confines the nine to report **DETAIL** surfaces because
 * ratings on a list *"invite comparison between children"* — and `C-9`'s own register row names
 * **`P2-8`** explicitly. Read as a single band summarising the nine, **`G-2`** bars every
 * roll-up on every surface, permanently — and this column is **labelled `Overall`**, a roll-up
 * by name.
 *
 * ⚠️ **THE COLUMN IS ABSENT, NOT EMPTY.** No heading, no cell, no placeholder dash. An empty
 * `Overall` column reads *"not wired yet"* and invites a later phase to fill it; an absent one
 * reads *"not permitted"*. The `P2-3` day-strip ruling drew exactly this distinction and it
 * applies unchanged. **`REGISTERED-OMISSION`, and it NEVER ENDS.**
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⛔ THREE MORE FRAME ELEMENTS NOT BUILT AS DRAWN
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * 1. **`ID 2025-113`** (every row). ⛔ `public.students` carries `id, centre_id, full_name,
 *    is_active, created_at, updated_at, deactivated_at` and **NO code column**, measured against
 *    `information_schema.columns` at HEAD. A student code inferred from a frame is schema
 *    inferred from a frame (`A-022`), and the row's UUID is not that format and is not an
 *    identifier to show a human. **`REGISTERED-OMISSION`** — it ends only if a code is ratified
 *    AND given a column, which is two decisions, not one.
 * 2. **`Junior · Public Speaking`** (7 occurrences in the `.html`). ⛔ `Junior` is **not** a
 *    ratified Class Grade — the vocabulary is `Beginner`/`Intermediate`/`Advanced` (`A-016`;
 *    `A-026`/`A-054`, which also bars global keyword replacement over it). Every grade label
 *    here is **READ from `class_grades.display_name`**; none is a literal in this file.
 * 3. **`Add Parent` and `Register Student`.** ⏸ Their destinations are screens `21` and `20`,
 *    scheduled at **`P2-13`** and **`P2-12`**, and **neither is built** — `/management/students`
 *    is the only management student route that exists at HEAD. ⛔ A control that points nowhere
 *    is the defect the Operator named at `P2-3` (*"what stops a later phase building the control
 *    and quietly not wiring it"*), so they are **omitted rather than rendered inert**.
 *    **`REGISTERED-OMISSION` that ENDS when `P2-12`/`P2-13` land.**
 * 4. **`View more ›`** on every row. ⏸ Its destination is screen `18` Student Profile, phase
 *    **`P2-9`**, and `/management/students/[studentId]` does not exist at HEAD. Same rule as
 *    (3), same ending condition — it arrives with `P2-9`. ⚠️ Recorded separately because it is
 *    a PER-ROW control rather than a header action, and a later phase restoring the header
 *    buttons would not necessarily notice this one.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⛔ NO SCHEMA. NO MIGRATION. NO RPC.
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * Every table behind this screen carries a management `SELECT` **policy** AND its matching
 * **grant**, measured at HEAD. ⚠️ The guardian name in particular needed **no column**: the plan
 * records *"guardian name and contact need columns"* — true of `parent_profiles`, which carries
 * neither — but the NAME lives on `accounts.display_name`, reachable through the link chain
 * management can already read. **That is §12.10 applied on the phase immediately after it was
 * written.** The columns question is **not** discharged for `P2-12`/`P2-13`, which create a
 * parent and need contact fields this screen never shows.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * MEASURED FROM THE `.html` — values, never markup
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * MEASURED PER ELEMENT, and the component is built to these rather than to a guess:
 *   · `All Students`            `17px` / 700
 *   · `248 enrolled` pill       `11px` / 600, radius `999px`
 *   · search placeholder        `12.50px` / 400
 *   · `All grades` select       `12.50px` / 600
 *   · column headings           `11px` / 600
 *   · learner name              `13px` / 600
 *   · class cell                `12.50px` / 500
 *   · guardian cell             `12.50px` / 400
 *   · table card radius         `18px`
 *   · row avatar                `36px` square, `12px` text, radius `999px`
 *
 * ⚠️ THE FIRST DRAFT GUESSED `13.5px` FOR THE LEARNER NAME AND `13px` FOR THE CELLS. Both were
 * wrong and inverted: the frame puts `13px` on the NAME and `12.50px` on the cells. ▶ Measured
 * afterwards, which is the whole reason §7.4.1 requires the `.html` to be opened — a plausible
 * type scale is not a measured one.
 *
 * ⛔ `13.50px` AND `10.50px` BELONG TO THE SHARED PORTAL SHELL — the sidebar nav items and
 * `Management Portal` — and `13.50px`'s only other use is the unbuilt `Add Parent`. Neither is
 * this screen's to cite.
 */

/*
 * ⛔ NO LOCAL AVATAR, NO LOCAL SEARCH FIELD, NO LOCAL SELECT. `Avatar`,
 * `SearchInput` and `Select` are the shared controls, and this screen uses them
 * rather than restating their geometry — `prove:shared-controls` exists because
 * a second copy of a control is how one of them silently stops matching.
 *
 * ⚠️ THE FIRST DRAFT OF THIS FILE REINVENTED ALL THREE, and the avatar version
 * carried a real defect: it picked its tint by ROW INDEX, so a learner changed
 * colour when the search or grade filter reordered the table. The shared
 * `Avatar` tints DETERMINISTICALLY from the name — order-independent, and it
 * carries no meaning and no status. ▶ The control had already solved a problem
 * the copy reintroduced.
 */

export function ManagementStudentsScreen() {
  const port = usePhysicalTestPort();
  const [state, setState] = useState<ResourceState<ManagementStudentListDto>>({ kind: "loading" });
  const [search, setSearch] = useState("");
  const [gradeLabel, setGradeLabel] = useState("");

  useEffect(() => {
    let cancelled = false;
    void port.readManagementStudents().then((result) => {
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
   * ⚠️ SEARCH AND FILTER ARE PRESENTATION ONLY — they narrow a list the server already
   * decided this caller may see. ⛔ Neither is authorization: nothing here can widen the
   * roll, because RLS produced it before this component existed (`A-046`'s reading of a
   * query parameter as presentation-only, applied to a local control).
   */
  const visible = useMemo(() => {
    if (data === null) return [];
    const needle = search.trim().toLowerCase();
    return data.students.filter((row) => {
      const matchesSearch =
        needle === "" ||
        row.fullName.toLowerCase().includes(needle) ||
        row.classes.some((label) => label.toLowerCase().includes(needle)) ||
        (row.guardianName ?? "").toLowerCase().includes(needle);
      const matchesGrade =
        gradeLabel === "" || row.classes.some((label) => label.startsWith(`${gradeLabel} · `));
      return matchesSearch && matchesGrade;
    });
  }, [data, search, gradeLabel]);

  return (
    <div className="flex flex-col gap-5">
      <PageHeading title="Students" description="All learners enrolled at the academy" />

      {state.kind === "failed" ? <StatePanel result={state.result} /> : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-[17px] font-bold text-ink">All Students</h2>
          {/*
            ⚠️ BUILT FROM THE LIST IT SITS ON, like `P2-7`'s `n awaiting approval` pill. The
            frame's `248 enrolled` over ten drawn rows is a mock number; a pill and its table
            must never be able to disagree.
          */}
          {data === null ? null : (
            <span className="rounded-full bg-[#FCE7F0] px-3 py-[5px] text-[12px] font-semibold text-[#C0246F]">
              {data.enrolledCount} enrolled
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search students"
            aria-label="Search students"
            className="w-full sm:w-[14.375rem]"
          />

          {/*
            The `All grades` select. ⛔ Its options are READ from `class_grades` — the frame's
            `Junior` is not a ratified grade and no grade label is written here.
          */}
          <label className="flex items-center">
            <span className="sr-only">Filter by class grade</span>
            <Select value={gradeLabel} onChange={(event) => setGradeLabel(event.target.value)}>
              <option value="">All grades</option>
              {(data?.grades ?? []).map((grade) => (
                <option key={grade.id} value={grade.label}>
                  {grade.label}
                </option>
              ))}
            </Select>
          </label>

          {/*
            ✅ `Register Student` IS NOW RENDERED — its omission's stated end
            condition arrived. `P2-12` shipped `/management/students/register`,
            so the reason for omitting it ("points nowhere") has lapsed and
            §12.11 requires the correction in the same pass.

            ⚠️ IT WAS THE PROOF THAT NOTICED, NOT A READER. `PDTa-ACTIONS` went
            red on the run that shipped the route, naming `register=true,
            parent=false`. ▶ That is a lift condition written to FIRE rather
            than to be remembered — the same discipline `AR-1b` now applies to
            the artefact register.

            ✅ `Add Parent` IS NOW RENDERED TOO — `P2-13` shipped screen `21`
            at `/management/students/create-parent-account`.

            ⚠️ ITS LIFT WAS ALMOST MISSED. `PDTa-ACTIONS` probed
            `app/(portals)/management/parents/page.tsx` — not the ratified
            route — so it stayed GREEN while the condition had already arrived.
            ▶ The probe now DERIVES the path from the route inventory.
          */}
          <Link
            href="/management/students/create-parent-account"
            className="inline-flex min-h-11 items-center rounded-[10px] border border-line bg-surface px-4 text-[13.5px] font-semibold text-ink-strong no-underline"
          >
            Add Parent
          </Link>
          <Link
            href="/management/students/register"
            className="inline-flex min-h-11 items-center rounded-[10px] bg-brand-600 px-4 text-[13.5px] font-semibold text-white no-underline"
          >
            Register Student
          </Link>
        </div>
      </div>

      <section className="overflow-hidden rounded-[18px] border border-line bg-surface">
        {state.kind === "loading" ? (
          <div className="p-5">
            <LoadingSkeleton rows={6} label="Loading students" />
          </div>
        ) : null}

        {data !== null && data.students.length === 0 ? (
          <p className="p-5 text-[12.50px] text-ink-muted">No learners are enrolled at this centre yet.</p>
        ) : null}

        {data !== null && data.students.length > 0 && visible.length === 0 ? (
          <p className="p-5 text-[12.50px] text-ink-muted">
            No learners match this search or grade filter.
          </p>
        ) : null}

        {visible.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line">
                  {/*
                    ⛔⛔ THREE HEADINGS, NOT FOUR. The frame draws `Student · Class · Guardian ·
                    Overall`; `Overall` is a rating roll-up and is ABSENT — no heading, no cell,
                    no placeholder. C-9 (its register row names P2-8) and G-2, both permanent.
                    ⚠️ ITS ABSENCE IS EXPECTED / REQUIRED at visual acceptance, never a
                    regression — and it is absent rather than empty so it never reads as
                    "not wired yet".
                  */}
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">
                    Student
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">
                    Class
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">
                    Guardian
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => (
                  <tr key={row.studentId} className="border-b border-line last:border-b-0">
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-3">
                        <Avatar displayName={row.fullName} size="small" />
                        {/*
                          ⛔ NAME ONLY. The frame prints `ID 2025-113` beneath it; `students`
                          has no code column, so there is nothing to print and nothing is
                          invented (`A-022`).
                        */}
                        <span className="text-[13px] font-semibold text-ink">{row.fullName}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[12.50px] text-ink-muted">
                      {/* Every ACTIVE enrolment — the note says "Class or Classes". */}
                      {row.classes.length === 0 ? (
                        <span className="text-ink-subtle">Not enrolled</span>
                      ) : (
                        row.classes.map((label) => (
                          <span key={label} className="block">
                            {label}
                          </span>
                        ))
                      )}
                    </td>
                    <td className="px-5 py-3 text-[12.50px] text-ink-muted">
                      {/*
                        ⛔ hero `0B`: an unlinked learner's guardian cell is EMPTY. Not
                        `Unknown`, not `—`, not an invented name. A fabricated fact about a
                        child's family is not a display convenience.
                      */}
                      {row.guardianName ?? ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
}
