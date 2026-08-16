"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { MonthCalendar } from "@/components/ui/month-calendar";
import { PageHeading } from "@/components/ui/page-heading";
import { StatePanel } from "@/components/ui/state-panel";
import { asFailure, type ResourceState } from "@/features/trainer/resource-state";
import { usePhysicalTestPort } from "@/features/portal/portal-runtime-context";
import type {
  ManagementDashboardSummaryDto,
  ManagementQueueRowDto,
  ScheduleSessionSummaryDto,
} from "@/lib/frontend/contracts/physical-test";

/**
 * Screen `11` — Management Dashboard (PORTAL COMPLETION PLAN phase `P2-7`).
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ARTEFACTS OPENED FOR THIS BUILD (`CLAUDE.md` §7.4.1 — every claim below names one)
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 *   · `reference/Management - Dashboard/Management - Dashboard.png`   — geometry and visual truth
 *   · `reference/Management - Dashboard/Management - Dashboard.html`  — every measured value below
 *   · `UI_REFERENCE_FINAL_MVP/11-management-dashboard/screen.md`      — governance and provenance
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⚠️ WHAT THE `.png` DRAWS
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * `Dashboard` + `Overview of student assessments`, then a row of four KPI tiles (`Total
 * Students 1,245` · `Assessed 1,088` · `Pending Approval 96` · `Approved 9`), each with a
 * tinted square icon. Below left, a pink-bordered card `Reports waiting for approval` with a
 * `4 awaiting approval` pill and a `View all` link, holding eight learner rows — avatar,
 * name, a one-line description, a RATING CHIP, a relative time and `Review ›`. Down the right,
 * a `March 2035` month calendar with chevrons and dotted dates, and a `Today's Events` card
 * listing five identical `Grade 8 Speaking Assessments · 09:00 AM · Hall A` entries.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⛔⛔ ONE LEAK WITH TWO RENDERINGS — CITED TOGETHER, BY OPERATOR RULING, AT ONE SITE
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⚠️ **READ BOTH HALVES BEFORE CHANGING ANYTHING IN THE APPROVAL LIST.** The Operator ruled
 * these as **ONE ruling, not two**, and required them cited together *"so a later phase cannot
 * remove one and believe the panel is clean."*
 *
 * **(a) THE RATING CHIP ON EVERY ROW.** The `.html` carries all four ratified labels as
 * literal text — **8 chips for 8 rows** (`Beginning`×2, `Developing`×3, `Mastering`×2,
 * `Mastered`×1). ⛔ **BOTH AVAILABLE READINGS PROHIBIT IT**, which is the strongest form: read
 * as a per-dimension rating, `C-9` confines the nine to report **DETAIL** surfaces because
 * ratings on a list *"invite comparison between children"*; read as a single roll-up of the
 * nine, `G-2` bars every roll-up on every surface, permanently.
 *
 * **(b) THE ONE-LINE ROW DESCRIPTION.** ⚠️ **THE FRAME'S ROW DESCRIPTIONS ARE ASSESSMENT
 * SUBSTANCE. THIS IS NOT A COPY PREFERENCE.** The `.html` gives all eight verbatim, and they
 * carry the ratified vocabulary **in running prose**: *"**Mastered** eye contact, clear
 * projection"*, *"**Beginning** on sentence flow & pace"*, *"Improving tone and body
 * language"*. ▶ **Removing the chips and keeping the descriptions would leave the leak in
 * place AND LOOK COMPLETE**, which the Operator ruled *"worse than not fixing it"*. They also
 * have **no substrate**: `A-038` gives management the four parent-facing panels at
 * `trainer_approved` and nothing else — no ratified field supplies a per-row précis.
 *
 * ⛔ **THE RULE THIS PHASE BUILDS TO:** the row identifies the **learner, the class, the
 * session and the status — and nothing about how the child performed.** No chip, no band name,
 * no paraphrase of a band in prose. `REGISTERED-OMISSION`, and it **NEVER ENDS**.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⛔ THE `Approved` KPI TILE READS `Submitted` — AN OPERATOR RULING, NOT DRIFT
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * Under `A-036` `approved` is **transient-in-transaction** and **no operation ever commits with
 * it**, so the frame's tile counts a status that never exists at rest and would read **zero
 * forever**. ▶ Operator: *"a KPI that can only ever read zero is worse than absent — it asserts
 * a measurement that does not exist."* **THIRD SIGHTING of the Step 7I1D-R2 defect**, after
 * Class Health Summary and Management Insight, where *"approved reports"* was struck for
 * **submitted** for exactly this reason. ⛔ Migration assertion `W-5` **fails the build** if
 * anybody "restores fidelity" by counting the transient status.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⛔ THREE MORE FRAME STRINGS NOT BUILT AS DRAWN
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * 1. **`Grade 8`** (Today's Events, ×5). Not a ratified Class Grade — the vocabulary is
 *    `Beginner`/`Intermediate`/`Advanced` (`A-016`; `A-026`/`A-054`), and `A-054` bars global
 *    keyword replacement over it. Every label is **read** from `class_grades.display_name`.
 * 2. **`Hall A`** (×5). `class_sessions.room` EXISTS — not a `C-14` refusal — but is **NULL on
 *    all 17 live sessions**, so hero `0B` **omits the element** rather than inventing a room.
 * 3. **`4 awaiting approval`** over **8 drawn rows**. ⚠️ **The frame contradicts itself.** The
 *    pill is built from the actual pending count, so the two can never disagree in the product.
 *
 * ⚠️ **`Today's Events` IS NOT A SECOND EVENT ENTITY.** `GC-13` bars one and `A-016` fixes
 * calendars as **projections of class-session records** with no duplicated event store, so it
 * is `readManagementSchedule` — delivered at `P2-5` — filtered to today. No new entity.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * MEASURED FROM THE `.html` — values, never markup
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * Page title `24px`; subtitle and KPI captions `13px`; KPI values `26px`; card radius `16px`;
 * the approval card's pink border `1.50px #EC4B96`; chips `999px`; calendar day cells `32px`;
 * event card radius `10px`; `10px`/`11px`/`12px` supporting text.
 */

/** `1,245` — the frame's thousands separator, and the only formatting it applies. */
function kpiValue(value: number): string {
  return value.toLocaleString("en-SG");
}

/**
 * ⚠️ LOCAL TIME, never `toISOString()` — the same defect `P2-5` had to fix on the calendar
 * grid, where a UTC round-trip shifted every date by a day for anyone east of Greenwich.
 */
function isoDate(value: Date): string {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const MONTH_SHORT = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

/** The frame's `2h ago` / `Yesterday` / `3d ago` column, from a date alone. */
function relativeDay(sessionDate: string, today: string): string {
  const days = Math.round(
    (new Date(`${today}T00:00:00`).getTime() - new Date(`${sessionDate}T00:00:00`).getTime()) / 86_400_000,
  );
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter((word) => /[A-Za-z]/.test(word))
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

function KpiTile({
  caption,
  value,
  icon,
  tone,
}: {
  readonly caption: string;
  readonly value: number | null;
  /*
   * ⚠️ EXISTING GLYPHS ONLY. The frame draws a people icon, a clipboard-check, a warning
   * triangle and a target. The first two exist; the last two do not, and rather than add
   * two entries for decoration this uses `clock` for PENDING (it is waiting) and
   * `document` for SUBMITTED (it is a report) — both semantically honest. ▶ The shared
   * icon set is therefore left untouched, which also means NO ACCEPTED SCREEN is affected.
   */
  readonly icon: "user" | "check" | "clock" | "document";
  readonly tone: string;
}) {
  return (
    <article className="flex flex-1 items-start justify-between gap-3 rounded-[16px] border border-line bg-surface p-4">
      <div>
        <p className="text-[12px] text-ink-muted">{caption}</p>
        {/* ⚠️ A refused read renders an em dash, never `0` — a zero here would be a positive
            claim about the centre that nobody measured (`Q-7`). */}
        <p className="mt-1 text-[23px] font-bold leading-none text-ink">
          {value === null ? "—" : kpiValue(value)}
        </p>
      </div>
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] ${tone}`}>
        <Icon name={icon} size={18} />
      </span>
    </article>
  );
}

export function ManagementDashboardScreen() {
  const port = usePhysicalTestPort();
  const [summary, setSummary] = useState<ResourceState<ManagementDashboardSummaryDto>>({ kind: "loading" });
  const [queue, setQueue] = useState<ResourceState<readonly ManagementQueueRowDto[]>>({ kind: "loading" });
  const [schedule, setSchedule] = useState<ResourceState<readonly ScheduleSessionSummaryDto[]>>({
    kind: "loading",
  });
  /*
   * ⛔ THE APPROVAL ROW'S CLASS NEEDS NO READ OF ITS OWN. The Operator's ruling
   * enumerates what the row identifies — **learner, CLASS, session, status** — so
   * the class is one of the four identifying facts, not decoration.
   *
   * ⚠️ IT ALREADY ARRIVES ON THE ROW. `listManagementPendingReviewCore` ends by
   * calling `decorateQueueRows`, which attaches `classModuleTitle` to a queue that
   * has ALREADY passed its governed gate — the contract records these as *"session
   * IDENTITY and SCHEDULING facts only"*, explicitly cleared against the exclusion
   * list. So the field is read straight off `row`.
   *
   * ⛔ RECORDED BECAUSE THE FIRST ATTEMPT GOT IT WRONG: this screen briefly fetched
   * the class through the schedule boundary, keyed to the queue's date range, and
   * held it in a second piece of state. That worked at the database and STILL
   * rendered nothing — and it was solving a problem that did not exist. ▶ **Before
   * adding a read for a field, check whether the row already carries it.** The
   * rendered leg `S3-M8-class` is what exposed the difference.
   */

  const today = useMemo(() => isoDate(new Date()), []);
  const [focus, setFocus] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  useEffect(() => {
    let cancelled = false;
    void port.readManagementDashboardSummary().then((result) => {
      if (cancelled) return;
      setSummary(
        result.outcome === "success"
          ? { kind: "ready" as const, data: result.data }
          : { kind: "failed" as const, result: asFailure(result) },
      );
    });
    void port.listManagementPendingReviews().then((result) => {
      if (cancelled) return;
      setQueue(
        result.outcome === "success"
          ? { kind: "ready" as const, data: result.data }
          : { kind: "failed" as const, result: asFailure(result) },
      );
    });
    return () => {
      cancelled = true;
    };
  }, [port]);

  /*
   * ⛔ `focus` STAYS ON THIS SCREEN because it is not presentation here: the
   * schedule is REFETCHED for the focused month, so the month is a query
   * parameter that the calendar happens to display. ▶ `MonthCalendar` is
   * therefore CONTROLLED from here, and the trainer dashboard — whose read
   * takes no month — uses it uncontrolled and gets no chevrons.
   */
  const monthStart = `${focus.year}-${`${focus.month + 1}`.padStart(2, "0")}-01`;
  const monthEnd = isoDate(new Date(focus.year, focus.month + 1, 0));

  useEffect(() => {
    let cancelled = false;
    void port.readManagementSchedule(monthStart, monthEnd).then((result) => {
      if (cancelled) return;
      setSchedule(
        result.outcome === "success"
          ? { kind: "ready" as const, data: result.data.sessions }
          : { kind: "failed" as const, result: asFailure(result) },
      );
    });
    return () => {
      cancelled = true;
    };
  }, [port, monthStart, monthEnd]);

  const kpis = summary.kind === "ready" ? summary.data : null;
  const pending = queue.kind === "ready" ? queue.data : [];

  /*
   * ⚠️ MEMOISED, and the lint rule that demanded it was RIGHT. A fresh `[]` on every
   * render makes both `useMemo`s below recompute every time, which quietly defeats the
   * point of memoising them at all.
   */
  const sessions = useMemo(
    () => (schedule.kind === "ready" ? schedule.data : []),
    [schedule],
  );

  const todaysSessions = useMemo(
    () => sessions.filter((session) => session.sessionDate === today),
    [sessions, today],
  );


  return (
    <div className="flex flex-col gap-5">
      <PageHeading title="Dashboard" description="Overview of student assessments" />

      {summary.kind === "failed" ? <StatePanel result={summary.result} /> : null}

      <section className="flex flex-wrap gap-4">
        {/*
          ⛔ `Total Students` COUNTS ENROLLED LEARNERS, NOT CENTRE-RESIDENT ROWS — `Ruling A`,
          Operator, 2026-08-15: *"use ENROLLED, not centre-resident. A withdrawn learner should
          not count, and the fixture coinciding today is exactly why this needs deciding now
          rather than when it splits."* ⚠️ **Both readings were 13 at HEAD**, so nothing here
          would have looked wrong until the first withdrawal — the tile would simply have started
          overstating the roster, on a screen nobody was re-checking.
        */}
        <KpiTile caption="Total Students" value={kpis?.totalStudents ?? null} icon="user" tone="bg-brand-100 text-brand-700" />
        {/*
          ⛔ THE `Assessed` TILE IS REMOVED, AND SO IS THE PARAMETER BEHIND IT. `Ruling A`:
          *"drop the parameter properly. A forward migration under `R-1`, not an edit. Leaving it
          unread is the option that rots."* ▶ Deleting only the tile would have left the RPC
          returning a fourth integer nothing consumed, which is how a dropped requirement comes
          back later as a feature somebody assumes was wanted.
          ⚠️ ITS ABSENCE IS EXPECTED AT VISUAL ACCEPTANCE, never a regression — the frame draws
          four tiles and this build renders three.
        */}
        <KpiTile caption="Pending Approval" value={kpis?.pendingApproval ?? null} icon="clock" tone="bg-[#FBE9D2] text-[#8A5A1E]" />
        {/*
          ⛔ `Submitted`, NOT the frame's `Approved`. See the header block: `A-036` makes
          `approved` transient-in-transaction, so that tile would read zero forever.
        */}
        <KpiTile caption="Submitted" value={kpis?.submittedReports ?? null} icon="document" tone="bg-[#E4F3E4] text-[#2F6B37]" />
      </section>

      <div className="flex flex-col gap-5 xl:flex-row xl:items-start">
        <section className="min-w-0 flex-1 rounded-[16px] border-[1.5px] border-brand-500 bg-surface p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-[16px] font-bold text-ink">Reports waiting for approval</h2>
              {/*
                ⚠️ BUILT FROM THE ACTUAL COUNT. The frame draws `4 awaiting approval` above
                EIGHT rows — it contradicts itself — so the pill reads the list it sits on.
              */}
              <span className="rounded-full bg-[#FDF3D6] px-3 py-[6px] text-[11px] font-semibold text-[#8A5A1E]">
                {pending.length} awaiting approval
              </span>
            </div>
            <Link
              href="/management/reports"
              className="text-[13px] font-semibold text-brand-500 no-underline transition hover:text-brand-700"
            >
              View all
            </Link>
          </div>

          {queue.kind === "loading" ? <LoadingSkeleton rows={5} label="Loading reports waiting for approval" /> : null}
          {queue.kind === "failed" ? <StatePanel result={queue.result} /> : null}

          {queue.kind === "ready" && pending.length === 0 ? (
            // ⚠️ A POSITIVE CLAIM, reachable only on a SUCCESSFUL read.
            <p className="mt-3 text-[13px] text-ink-muted">No reports are waiting for approval.</p>
          ) : null}

          {pending.length > 0 ? (
            <ul className="mt-3 flex list-none flex-col p-0">
              {pending.map((row) => (
                <li
                  key={row.reportId}
                  className="flex flex-wrap items-center gap-3 border-b border-line py-3 last:border-b-0"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[11px] font-bold text-brand-700">
                    {initialsOf(row.studentDisplayName)}
                  </span>
                  {/*
                    ⛔⛔ THE ROW CARRIES IDENTITY AND LIFECYCLE ONLY — learner, CLASS, session
                    date, status. NOTHING ABOUT HOW THE CHILD PERFORMED.
                    ⚠️ THE FRAME DRAWS TWO MORE THINGS HERE AND NEITHER MAY BE BUILT, EVER:
                      (a) a RATING CHIP (`C-9` as a per-dimension rating on a list surface;
                          `G-2` as a roll-up — both readings prohibit it), and
                      (b) a ONE-LINE DESCRIPTION, which carries the same vocabulary in prose
                          (*"Mastered eye contact"*).
                    ⛔ THE FRAME'S ROW DESCRIPTIONS ARE ASSESSMENT SUBSTANCE. ⛔ THIS IS NOT A
                    COPY PREFERENCE. Stating that explicitly is the point: a later phase reading
                    this must not mistake the omission for a wording choice it may revisit, or
                    for a sentence that could be softened and kept. There is no rewording of a
                    rating band that is permitted here — the BAND ITSELF is the disclosure.
                    ⛔ THEY ARE ONE LEAK WITH TWO RENDERINGS. Removing either alone leaves the
                    leak in place and makes the panel LOOK clean — which is worse than not
                    fixing it, because it looks complete. BOTH are cited HERE, at ONE site, so
                    neither can be removed while believing the panel is clean.
                    Operator ruling, 2026-08-14.
                  */}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-semibold text-ink">
                      {row.studentDisplayName}
                    </span>
                    <span className="block truncate text-[11px] text-ink-subtle">
                      {/* hero 0B: the class is OMITTED when absent, never a placeholder. */}
                      {row.classModuleTitle
                        ? `${row.classModuleTitle} · Session ${row.sessionDate}`
                        : `Session ${row.sessionDate}`}
                    </span>
                  </span>
                  <span className="text-[11px] text-ink-subtle">{relativeDay(row.sessionDate, today)}</span>
                  <Link
                    href={`/management/reports/${row.reportId}/review`}
                    className="text-[13px] font-semibold text-brand-500 no-underline transition hover:text-brand-700"
                  >
                    Review ›
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        <div className="flex w-full shrink-0 flex-col gap-5 xl:w-[340px]">
          {/*
            ⛔ ONE CONSTRUCTION, SHARED WITH THE TRAINER DASHBOARD (Operator ruling,
            2026-08-16). This screen's calendar was already correct — a month
            initialised to today, decorated by sessions — and the trainer's was built
            the other way round and rendered nothing at all when a month was empty.
            ▶ Extracting rather than copying is the point: two calendars that merely
            LOOK alike is how the two diverged in the first place.
            ⚠️ One behaviour changed here, deliberately — the shared component scopes
            marked days to the FOCUSED MONTH. This screen keyed the Set on
            day-of-month alone, which was safe only while its query happened to be
            month-scoped: a correctness dependency living outside the component that
            draws it.
          */}
          <section className="rounded-[16px] border border-line bg-surface p-4">
            <MonthCalendar
              sessionDates={sessions.map((session) => session.sessionDate)}
              today={today}
              label="Centre schedule"
              focus={focus}
              onFocusChange={setFocus}
            />
          </section>


          <section className="rounded-[16px] border border-line bg-surface p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-[16px] font-bold text-ink">Today&rsquo;s Events</h2>
              <Link
                href="/management/schedule"
                className="text-[13px] font-semibold text-brand-500 no-underline transition hover:text-brand-700"
              >
                View all
              </Link>
            </div>
            {schedule.kind === "failed" ? <StatePanel result={schedule.result} /> : null}
            {schedule.kind === "ready" && todaysSessions.length === 0 ? (
              <p className="mt-3 text-[13px] text-ink-muted">Nothing is scheduled today.</p>
            ) : null}
            <ul className="mt-3 flex list-none flex-col gap-2 p-0">
              {todaysSessions.map((session) => (
                <li
                  key={session.classSessionId}
                  className="flex items-center gap-3 rounded-[10px] bg-[#FDEFF5] p-3"
                >
                  <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-[8px] bg-surface">
                    <span className="text-[9.5px] font-bold text-brand-500">
                      {MONTH_SHORT[Number(session.sessionDate.slice(5, 7)) - 1]}
                    </span>
                    <span className="text-[13px] font-bold leading-none text-ink">
                      {session.sessionDate.slice(8, 10)}
                    </span>
                  </span>
                  <span className="min-w-0">
                    {/* ⚠️ The grade is READ, never a literal — the frame's `Grade 8` is not
                        a ratified Class Grade (`A-016`, `A-026`/`A-054`). */}
                    <span className="block truncate text-[12.5px] font-semibold text-ink">
                      {[session.classGradeLabel, session.moduleTitle].filter(Boolean).join(" · ")}
                    </span>
                    {/* ⚠️ `room` is omitted when NULL, never rendered as a dangling separator
                        (hero `0B`) — the frame's `Hall A` has no value behind it. */}
                    <span className="block text-[11px] text-ink-subtle">
                      {[session.startTime, session.room].filter((part): part is string => !!part).join(" · ")}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
