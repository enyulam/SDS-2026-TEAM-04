"use client";

import { useEffect, useMemo, useState } from "react";

import { usePhysicalTestPort } from "@/features/portal/portal-runtime-context";
import type { ParentChildDto, ParentDashboardDto } from "@/lib/frontend/contracts/physical-test";
import { PageHeading } from "@/components/ui/page-heading";
import { Card } from "@/components/ui/surface";
import { StatePanel } from "@/components/ui/state-panel";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { asFailure, type FailureResult } from "@/features/trainer/resource-state";

/**
 * Screen `30` — Parent Dashboard. Phase `P2-22`.
 *
 * Reference pack: `UI_REFERENCE_FINAL_MVP/reference/Parent - Dashboard/`
 * (visual rank 1, `A-056`), read as the `.png`, the `.html` and the numbered
 * pack's `screen.md` — §7.4.1.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⛔ THE FRAME'S LARGEST CARD IS ABSENT, BY OPERATOR RULING
 * ═══════════════════════════════════════════════════════════════════════════
 * **`Q-27`** rules the **"This Term's Skills"** card — nine B.E.S.T dimensions
 * with rating bars — `DO_NOT_IMPLEMENT` **in full**: the title, all nine
 * labels, all bars, all rating-derived state, and **any equivalent replacement
 * visualization**. *"Hiding the labels, obscuring the values, rendering empty
 * bars, collapsing the values while keeping the container, renaming the card,
 * or substituting another ratings visualization are all non-compliance."*
 *
 * ✅ **AND ITS ABSENCE IS `EXPECTED / REQUIRED`**, never `MISSING
 * IMPLEMENTATION` and never a `VISUAL REGRESSION`.
 *
 * ⚠️ **PROFILE DETAILS PROMOTES UPWARD INTO THE VACATED SPACE — required, not
 * incidental.** It is the first card in the main column here. **No blank
 * rectangle and no invented filler card.** The right-hand Calendar / Upcoming
 * structure is unchanged.
 *
 * ⛔ **THE REFUSAL IS NOT HELD HERE.** It is held in the projection and in the
 * DTO, which carry no rating field — and the database refuses a parent at the
 * GRANT layer besides. A component that merely declined to render one would be
 * one line away from carrying it.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⛔ FOUR MORE THINGS THE FRAME DRAWS AND THIS SCREEN DOES NOT BUILD
 * ═══════════════════════════════════════════════════════════════════════════
 * 1. **`Parent–Teacher Meeting`** in *Upcoming* — `GC-13`'s family: a second
 *    event entity beside the class session. Upcoming renders **real
 *    `class_sessions`** and nothing else (`A-016`).
 * 2. **`Grade 7 Speaking Assessment`** — `Grade 7` is a school-year label the
 *    model does not hold.
 * 3. **`Junior`** — not a ratified Class Grade (`A-016`, `A-054`). The label
 *    rendered is `class_grades.display_name`.
 * 4. **The notification bell** in the header — notifications are ruled **OUT**
 *    (`G-04`). ⚠️ Absent, not disabled: `P2-10`'s rule is that DISABLED says
 *    "not yet" and ABSENT says "not a thing", and only one of those is true.
 *
 * ⚠️ **NO TA ROW, AND THAT IS AGREEMENT RATHER THAN REFUSAL.** The pack's prose
 * note claims Profile Details shows *"assigned Trainer, Trainer Assistant (TA),
 * and enrolment date"*. The `.png` and the `.html` draw **no TA row** —
 * measured `Assist` ×0. §7.4.1: a note lists content, it does not enumerate
 * what a frame encodes.
 *
 * MEASURED (`.html`), cited only where this component builds to it:
 * `12.50px` · `12px` · `11px` · `22px` · `16px` · `999px` · `18px` · `14px`.
 */

/** ⚠️ Rendered ONLY when a value exists. A null row is omitted — hero `0B`. */
function DetailRow({ label, value }: { readonly label: string; readonly value: string | null }) {
  if (value === null || value.trim().length === 0) return null;
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-3.5 last:border-0">
      <dt className="text-[12.5px] text-ink">{label}</dt>
      <dd className="text-right text-[12.5px] font-semibold text-ink-strong">{value}</dd>
    </div>
  );
}

function formatDay(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  return `${MONTHS[m - 1]} ${String(d).padStart(2, "0")}`;
}

function formatLongDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

export function ParentDashboardScreen() {
  const port = usePhysicalTestPort();
  const [status, setStatus] = useState<
    | { readonly kind: "loading" }
    | { readonly kind: "ready"; readonly data: ParentDashboardDto }
    | { readonly kind: "failed"; readonly result: FailureResult }
  >({ kind: "loading" });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void port.readParentDashboard().then((result) => {
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
   * ⛔ THE SELECTED CHILD IS RESOLVED FROM THE GOVERNED LIST, NEVER FROM THE
   * STORED ID ALONE. `find` returns `undefined` for an id not in the list, and
   * this falls back to the first child rather than rendering nothing — so a
   * stale selection cannot make the screen claim a child the parent no longer
   * has a live link to (`screen.md` §14: only linked children are selectable).
   */
  const selected: ParentChildDto | null = useMemo(() => {
    if (data === null || data.children.length === 0) return null;
    return data.children.find((c) => c.studentId === selectedId) ?? data.children[0];
  }, [data, selectedId]);

  return (
    <div className="page-grid">
      <PageHeading
        title={selected === null ? "Progress" : `${selected.studentName}'s Progress`}
        breadcrumb="A summary of your child at school"
      />

      {status.kind === "failed" ? <StatePanel result={status.result} /> : null}
      {status.kind === "loading" ? <LoadingSkeleton rows={4} label="Loading dashboard" /> : null}

      {data !== null && data.children.length === 0 && (
        <Card className="rounded-[18px] p-6">
          <p className="text-[12.5px] text-ink">No learner is linked to this account yet.</p>
        </Card>
      )}

      {data !== null && selected !== null && (
        <>
          {/*
            ⛔ THE CHILD SELECTOR IS A PRESENTATION CONTROL OVER ROWS RLS
            ALREADY RESOLVED. `students_select_parent` filters by
            `parent_student_links` in the database, so this list cannot offer a
            child the parent has no live link to — the control never widens
            anything (`ADR-4`, `screen.md` §5).
            ⚠️ Rendered only when there is a choice to make: one linked child
            means no selector, because a picker with one option is furniture.
          */}
          {data.children.length > 1 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[12.5px] text-ink">Viewing:</span>
              {data.children.map((c) => (
                <button
                  key={c.studentId}
                  type="button"
                  aria-pressed={c.studentId === selected.studentId}
                  onClick={() => setSelectedId(c.studentId)}
                  className={
                    c.studentId === selected.studentId
                      ? "min-h-11 rounded-[999px] bg-brand-700 px-4 text-[12.5px] font-semibold text-white"
                      : "min-h-11 rounded-[999px] border border-line bg-surface px-4 text-[12.5px] font-medium text-ink-strong"
                  }
                >
                  {c.classLabel === null ? c.studentName : `${c.studentName} · ${c.classLabel}`}
                </button>
              ))}
            </div>
          )}

          <div className="grid gap-[22px] lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="flex flex-col gap-[22px]">
              {/*
                ⚠️ PROFILE DETAILS IS THE FIRST CARD IN THIS COLUMN, AND THAT
                POSITION IS THE RULING. `Q-27` requires it to promote upward
                into the space "This Term's Skills" occupied; leaving a gap
                above it, or filling that gap, are both non-compliance.
              */}
              <Card className="rounded-[18px] p-6">
                <h2 className="text-[16px] font-bold text-ink-strong">Profile Details</h2>
                <dl className="mt-4">
                  <DetailRow label="Date of birth" value={selected.dateOfBirth === null ? null : formatLongDate(selected.dateOfBirth)} />
                  <DetailRow label="Guardian" value={selected.guardianName} />
                  <DetailRow label="Contact" value={selected.guardianContact} />
                  <DetailRow label="Class" value={selected.classLabel} />
                  <DetailRow label="Trainer" value={selected.trainerDisplayName} />
                  <DetailRow
                    label="Enrolled"
                    value={selected.enrolledAt === null ? null : formatLongDate(selected.enrolledAt.slice(0, 10))}
                  />
                </dl>
                <p className="mt-4 text-[11px] leading-5 text-ink">
                  To update any of these details, please contact the Admin Office.
                </p>
              </Card>
            </div>

            <div className="flex flex-col gap-[22px]">
              {/*
                ⛔ UPCOMING IS A PROJECTION OF `class_sessions`, WHICH IS THE
                WHOLE RULE. `A-016`: calendars are projections of class-session
                records and no duplicated event table exists. The frame's
                `Parent–Teacher Meeting` is a second event entity — `GC-13`'s
                family, refused — and its `Grade 7 Speaking Assessment` names a
                school year the model does not hold.
              */}
              <Card className="rounded-[18px] p-6">
                <h2 className="text-[16px] font-bold text-ink-strong">
                  {`Upcoming for ${selected.studentName.split(" ")[0]}`}
                </h2>
                {selected.sessions.length === 0 ? (
                  <p className="mt-4 text-[12.5px] text-ink">No scheduled classes.</p>
                ) : (
                  <ul className="mt-4 flex flex-col gap-[14px]">
                    {selected.sessions.map((s) => (
                      <li key={s.sessionId} className="flex items-start gap-[14px] rounded-[14px] bg-surface-muted p-4">
                        <span className="flex min-w-[46px] flex-col items-center rounded-[12px] bg-surface px-2 py-1">
                          <span className="text-[11px] font-semibold text-ink">{formatDay(s.sessionDate).split(" ")[0]}</span>
                          <span className="text-[16px] font-bold text-ink-strong">{formatDay(s.sessionDate).split(" ")[1]}</span>
                        </span>
                        <span className="flex flex-col">
                          {/*
                            ⚠️ THE LESSON LINE IS OMITTED WHEN THE SESSION
                            CARRIES NONE — hero `0B`. Measured 2026-08-17:
                            0 of 17 sessions carry lesson data, so every card
                            shows the class label today. Never "Lesson —".
                          */}
                          <span className="text-[12.5px] font-semibold text-ink-strong">
                            {s.lessonNumber === null && s.lessonTitle === null
                              ? (selected.classLabel ?? "Class")
                              : [s.lessonNumber === null ? null : `Lesson ${s.lessonNumber}`, s.lessonTitle]
                                  .filter(Boolean)
                                  .join(" · ")}
                          </span>
                          <span className="text-[11px] text-ink">{formatLongDate(s.sessionDate)}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          </div>

          {/*
            ⛔ THE REFUSALS, DISCLOSED WHERE THE OPERATOR READS (§12.12).
            ⚠️ AND THE WORDING IS DELIBERATE: it says the school does not share
            skill ratings through this portal. It does NOT name the nine
            dimensions, list them, or gloss the rating vocabulary — `A-052`
            makes taxonomy disclosure to a parent the thing `GC-2` was written
            against, so a disclosure that explained the omission in detail
            would leak exactly what the omission protects.
          */}
          <p className="text-[11px] leading-5 text-ink">
            This design also shows a skills chart and two calendar events that are not part of this
            portal. Skill ratings are shared with you by your trainer rather than through this page,
            and the schedule above lists your child&rsquo;s classes only.
          </p>
        </>
      )}
    </div>
  );
}
