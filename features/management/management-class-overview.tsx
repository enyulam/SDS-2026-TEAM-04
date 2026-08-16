"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { BackLink } from "@/components/ui/back-link";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { PageHeading } from "@/components/ui/page-heading";
import { StatePanel } from "@/components/ui/state-panel";
import { asFailure, type ResourceState } from "@/features/trainer/resource-state";
import { usePhysicalTestPort } from "@/features/portal/portal-runtime-context";
import type {
  ClassHeaderDto,
  ClassOverviewDto,
  ClassOverviewRowDto,
  ClassOverviewSessionDto,
} from "@/lib/frontend/contracts/physical-test";

/**
 * Screen 13 — Management Class Overview (`P2-4`; REBUILT 2026-08-13 under
 * Operator AUTHORIZATION A).
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⛔ A WITHDRAWN FINDING, RECORDED HERE BECAUSE IT ORIGINATED IN THIS FILE
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * The first build reported that *"this frame draws NO Edit control"* and the Operator ruled a
 * DESIGN GAP on that premise. ⛔ **THE PREMISE WAS FALSE.** `Management - Class Overview.png`
 * draws **`✎ Edit class`** in the header card, top-right, beside `ASSIGNED TRAINER` and
 * `ASSISTANT`. The claim was a `grep` over the pack's PROSE NOTE — whose "Buttons and
 * navigation" section lists only `Manage lesson plans` and `View Overall Class Statistics` —
 * and a note cannot support *"the frame draws no X"* (`CLAUDE.md` §7.4.1). ▶ The control is
 * built here now, wired to `27` at its canonical route. **`TRUE-DRIFT`, never a design gap.**
 *
 * ⚠️ THE SAME CORRECTION APPLIES TO THE RATINGS CLAIM. The earlier note said *"the frame's own
 * note lists B.E.S.T. Ratings and a rubric focus-area list"* — true of the NOTE. Measured
 * against the `.png`, **this frame draws no rating anywhere**: what it draws is a per-lesson
 * `FOCUS` chip column. The bar below is unchanged and still absolute; only its stated ground
 * moves from *"governance overrides a frame that draws ratings"* to *"the frame draws none, and
 * none may be added"*.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⚠️ WHAT THE `.png` DRAWS, TOP TO BOTTOM
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 *   1. HEADER CARD — `PS` tile chip · `Public Speaking · Intermediate` · `Active` badge · a
 *      meta line (`Junior · Tue & Thu · 3:00–4:00 PM · Studio 2 · 12 learners`) · then
 *      `ASSIGNED TRAINER`, `ASSISTANT` and the `✎ Edit class` button.
 *   2. TWO STAT TILES — `LEARNERS 12` and `ATTENDANCE 94%` (teal), side by side.
 *   3. LESSON TABLE — one card, column headers `DATE · LESSON · FOCUS · REPORT STATUS` and an
 *      unlabelled `Stats ›` column, rows on `#F7F8FB` at `12px` radius.
 *   4. FOOTER — `Manage lesson plans ›` and `View Overall Class Statistics ›`, as CONTROLS
 *      inside the same card, not prose.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⛔ NOTHING HERE IS AN ASSESSMENT FACT, AND THE ABSENCE IS STRUCTURAL
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * `C-9` confines `D-1`'s nine per-dimension ratings to report **DETAIL** surfaces because
 * ratings on an overview *"invite comparison between children"*; `G-2` bars every roll-up on
 * every surface, permanently. ▶ Enforced three deep and not by this component's good behaviour:
 * migration assertion `V-4` **fails the build** if either RPC so much as names a rating (bare
 * substring, so it catches the next rating column nobody has written yet); `P26-7` re-asserts
 * it on the returned shape; the contract declares no field that could hold one.
 *
 * ⚠️ What legitimately survives is the single **most frequent improvement-focus tag**, which
 * `CLAUDE.md` §6 mandates by name — computed **server-side**, arriving as **one string**, never
 * as the underlying tags (Operator ruling, `P2-4`).
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⛔ TWO GOVERNANCE-MANDATED ADDITIONS THE FRAME OMITS. NEITHER IS AN INVENTION
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * 1. **Student Report Status** — `CLAUDE.md` §6 names *"Management Class Overview's 'Student
 *    Report Status' table"* directly and gates its per-row buttons under `A-038`. The
 *    inventory adds that it *"must be built to that rule, not inferred from the frame"*.
 *    ⚠️ It is NOT the frame's `REPORT STATUS` column: that column is **per LESSON**, this table
 *    is **per LEARNER**. Different axes, so both exist.
 * 2. **Class Health Summary** — `C-17`; `CLAUDE.md` §6 fixes it exhaustively at four
 *    conditions, first match wins. The verdict comes from `lib/shared/class-health.ts`, one
 *    copy shared with the fixture, and the sentences are **verbatim**. ⛔ Never AI-authored:
 *    generating this prose would pull the §8-deferred Weekly Class Health Brief into scope.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⚠️ REGISTERED OMISSIONS
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * 1. ⛔ **`ASSISTANT`** in the header card — `A-014` defers the TA persona and `G-7` binds
 *    `centre_membership_role` against extension. **PROHIBITED, NEVER ENDS**, and there is no
 *    DTO field that could carry one.
 * 2. ⚠️ **The `FOCUS` chip column** — lesson-plan focus, `D-4`/`P2-6`, with no substrate at
 *    HEAD. Operator AUTHORIZATION B. ⛔ `G-3` additionally bars it from any surface presenting
 *    a governed focus; it arrives with its own phase, in its own labelled position.
 * 3. ⚠️ **The per-row `Stats ›` link** — screen `16`, `P2-16`. AUTHORIZATION B.
 * 4. ✅ **`Manage lesson plans` IS NOW LIVE** (`P2-6`, 2026-08-14) — screen `14` exists, so the
 *    stated inert reason LAPSED and keeping it would have made that reason false.
 *    ~~built as a CONTROL, INERT with a stated reason~~. **`View Overall Class Statistics`**
 *    (screen `16`, `P2-16`) remains INERT with a stated reason. ⚠️ This is the INERT treatment (target not yet built), **not** the
 *    ABSENT treatment (capability refused) — standing prohibition 17 keeps the two apart, and
 *    screen `27`'s absent day strip is the other side of it.
 * 5. ⚠️ **Lesson name and number** render only where recorded. **NULL means NOT RECORDED**
 *    (hero 0B) — never "Lesson 1", never "TBC", never a dash. Same for room, times and the
 *    ATTENDANCE tile, which is **omitted entirely** rather than shown as `0%`.
 */

/*
 * ⛔ OPERATOR ADDITION ON USABILITY GROUNDS — NOT A FRAME MATCH. 2026-08-13.
 *
 * **The frame draws NO back affordance**, measured from the `.png` and corroborated against
 * the `.html` (the string `Back` occurs in neither). The Operator authorized it anyway:
 * *"a screen a user cannot leave is a usability defect and the design set not catching it does
 * not make it correct."*
 *
 * ⛔ **DO NOT REMOVE THIS FOR VISUAL FIDELITY.** A later visual pass comparing this surface
 * to its frame will find an element the frame lacks; that is EXPECTED and RULED, exactly as a
 * `REGISTERED-OMISSION` is expected in the other direction.
 *
 * ⚠️ The control is the product's EXISTING one — `components/ui/back-link.tsx`, extracted
 * from `trainer-roster` and `trainer-assessment`, whose class strings were byte-identical.
 * A second treatment for the same act is the divergence the Operator keeps ruling against.
 */

const REPORT_LABEL: Record<string, string> = {
  incomplete: "Not started",
  observation_saved: "Assessment saved",
  drafting: "Draft generating",
  draft_ready: "Awaiting trainer review",
  needs_edit: "Returned for correction",
  trainer_approved: "Awaiting final review",
  submitted: "Submitted",
};

export function ManagementClassOverview({ classModuleId }: { readonly classModuleId: string }) {
  const port = usePhysicalTestPort();
  const [state, setState] = useState<ResourceState<ClassOverviewDto>>({ kind: "loading" });

  useEffect(() => {
    let active = true;
    void port.readClassOverview(classModuleId).then((result) => {
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
  }, [port, classModuleId]);

  if (state.kind === "loading") return <LoadingSkeleton label="Loading class overview" rows={4} />;
  if (state.kind === "failed") {
    return (
      <StatePanel
        result={state.result}
        homeHref="/management/classes"
        homeLabel="Return to Classes"
      />
    );
  }

  const { header, rows, sessions, health } = state.data;

  return (
    <div className="page-grid">
      {/*
        ⚠️ THE BREADCRUMB MOVED ABOVE THE TITLE — TRUE-DRIFT, measured and ruled.
        `Management - Class Overview.html` draws it at `font-size: 11.50px` FIRST, then the
        `22px` title, at `gap: 3px`. This build had it below. ⛔ `26` and `27` are NOT the same
        case: their frames genuinely draw the breadcrumb BELOW the title, at `12.50px`.
        ⛔ It is NOT duplicated and NOT replaced by the back link — both are present, per ruling.
      */}
      <PageHeading
        breadcrumb={
          <>
            <Link href="/management/classes" className="underline hover:text-brand-700">
              Classes
            </Link>
            {header !== null && ` / ${header.title}`}
          </>
        }
        title="Class Overview"
        actions={<BackLink href="/management/classes" label="Classes" />}
      />

      {header !== null && <HeaderCard header={header} />}
      {header !== null && <StatTiles header={header} />}

      <LessonTable sessions={sessions} classModuleId={classModuleId} />

      {/*
        ⛔ THE CLASS HEALTH SUMMARY — `C-17`, mandated by `CLAUDE.md` §6 and absent from the
        frame. Exactly TWO computed fields, as §6 specifies: Status and Main follow-up area.
      */}
      {health !== null && (
        <section className="card flex flex-col gap-3 px-6 py-5" aria-label="Class Health Summary">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-section-title font-extrabold text-ink-strong">
              Class Health Summary
            </h2>
            <span
              className={`rounded-full px-[10px] py-[5px] text-[11px] font-semibold ${
                health.status === "On Track"
                  ? "bg-success-soft text-success-on"
                  : "bg-warning-soft text-warning-on"
              }`}
            >
              {health.status}
            </span>
          </div>
          <p className="text-body text-ink-strong">{health.action}</p>
          {/*
            ⚠️ OMITTED WHEN NULL, never rendered as "None" or "—". NULL means NOT RECORDED
            (hero 0B): with no submitted report carrying an improvement-focus tag there is no
            follow-up area, and inventing a label would fabricate an assessment fact.
          */}
          {health.mainFollowUpArea !== null && (
            <p className="text-small text-ink">
              Main follow-up area:{" "}
              <span className="font-semibold text-ink-strong">
                {health.mainFollowUpArea.replace(/_/g, " ")}
              </span>
            </p>
          )}
          <p className="text-small text-ink">
            {health.submittedReports} of {health.totalReports} reports submitted
            {health.evidenceMissing > 0 ? ` · ${health.evidenceMissing} missing evidence` : ""}
          </p>
        </section>
      )}

      <StudentReportStatus rows={rows} />
    </div>
  );
}

/**
 * The frame's header card — `padding: 20px 22px`, `border-radius: 18px`, `gap: 18px`, with a
 * `58px` tile chip at `border-radius: 15px`.
 *
 * ⛔ THE `ASSISTANT` COLUMN THE FRAME DRAWS BESIDE `ASSIGNED TRAINER` IS ABSENT — `A-014`,
 * `G-7`. There is no DTO field for it, so this component could not render one if it tried.
 */
function HeaderCard({ header }: { readonly header: ClassHeaderDto }) {
  /*
   * ⛔ EVERY SEGMENT IS OMITTED WHERE NOT RECORDED (hero 0B). The frame's meta line reads
   * `Junior · Tue & Thu · 3:00–4:00 PM · Studio 2 · 12 learners`; a class with no agreed room
   * simply has no room segment, never "Studio —" and never an invented default.
   * ⚠️ `Junior` is the frame's CLASS CODE, which `C-14` omits — the Class Grade label stands
   * in its place, and that is a recorded divergence rather than a relabel.
   */
  const meta = [
    header.classGradeLabel,
    header.meetingDays.length > 0 ? header.meetingDays.join(" & ") : null,
    header.startTime && header.endTime ? `${header.startTime}–${header.endTime}` : null,
    header.room,
    `${header.learnerCount} ${header.learnerCount === 1 ? "learner" : "learners"}`,
  ].filter((part): part is string => part !== null);

  return (
    <section
      aria-label="Class summary"
      className="flex flex-wrap items-center gap-[18px] rounded-[18px] border border-line bg-surface px-[22px] py-5 shadow-[var(--shadow-card)]"
    >
      <Avatar displayName={header.title} size="banner" shape="banner" />

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-[10px]">
          <h2 className="text-[20px] font-bold leading-7 text-ink-strong">{header.title}</h2>
          {/* The frame's teal `Active` pill. Drawn only where the module IS active. */}
          {header.isActive && (
            <span className="rounded-full bg-info-soft px-[10px] py-[5px] text-[11px] font-semibold text-info-on">
              Active
            </span>
          )}
        </div>
        <p className="text-[12.5px] text-ink-muted">{meta.join(" · ")}</p>
      </div>

      {/*
        ⛔ NULL MEANS NOT RECORDED — the whole labelled block is omitted when no trainer
        resolves, never "Unassigned" and never a placeholder avatar.
        ⚠️ ALL distinct trainers, not one: `A-016` makes assignment authoritative at CLASS
        SESSION level, so a module may legitimately carry more than one.
      */}
      {header.trainerDisplayNames.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-[9.5px] font-semibold uppercase tracking-[0.6px] text-ink-subtle">
            {header.trainerDisplayNames.length === 1 ? "Assigned trainer" : "Assigned trainers"}
          </span>
          {header.trainerDisplayNames.map((name) => (
            <span key={name} className="flex items-center gap-[9px]">
              <Avatar displayName={name} size="small" />
              <span className="text-[13px] font-semibold text-ink-strong">{name}</span>
            </span>
          ))}
        </div>
      )}

      {/*
        ✅ `Edit class` — IN THE FRAME'S HEADER CARD, where the `.png` draws it, wired to
        screen `27` at its canonical route. This control is the correction of the withdrawn
        "no inbound affordance" finding recorded at the top of this file.
      */}
      <Link
        href={`/management/classes/${header.classModuleId}/edit`}
        className="inline-flex min-h-11 items-center gap-[7px] rounded-full border border-line-strong bg-surface px-4 py-[9px] text-[13px] font-semibold text-ink-strong hover:border-brand-700"
      >
        <span aria-hidden="true">✎</span> Edit class
      </Link>
    </section>
  );
}

/**
 * The frame's two stat tiles — `flex: 1 1 0`, `padding: 20px 22px`, `border-radius: 16px`,
 * label `10px` at `letter-spacing: 0.60px`, value `24px`.
 *
 * ⛔ THE ATTENDANCE TILE IS OMITTED WHEN NOTHING WAS RECORDED. `0%` is a measured claim that a
 * class met and nobody came; `null` means no attendance row exists at all (hero 0B).
 */
function StatTiles({ header }: { readonly header: ClassHeaderDto }) {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex flex-1 basis-56 flex-col gap-1.5 rounded-[16px] border border-line bg-surface px-[22px] py-5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.6px] text-ink-subtle">
          Learners
        </span>
        <span className="text-[24px] font-bold leading-8 text-ink-strong">
          {header.learnerCount}
        </span>
      </div>
      {header.attendancePercent !== null && (
        <div className="flex flex-1 basis-56 flex-col gap-1.5 rounded-[16px] border border-line bg-surface px-[22px] py-5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.6px] text-ink-subtle">
            Attendance
          </span>
          <span className="text-[24px] font-bold leading-8 text-info-on">
            {header.attendancePercent}%
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * The frame's lesson TABLE — a real `<table>`, not the `<ul>` the first build drew.
 *
 * Columns `DATE · LESSON · REPORT STATUS` at the frame's `10px` /
 * `letter-spacing: 0.40px` header scale, rows at `12px` radius on the frame's `#F7F8FB`.
 *
 * ⛔ TWO OF THE FRAME'S FIVE COLUMNS ARE ABSENT AND BOTH ARE REGISTERED: `FOCUS` is
 * lesson-plan focus (`D-4`/`P2-6`, and `G-3` bars it from any governed-focus surface) and
 * `Stats ›` is screen `16` (`P2-16`). Operator AUTHORIZATION B — they arrive with their
 * phases, and a placeholder now would advertise data that does not exist.
 */
function LessonTable({
  sessions,
  classModuleId,
}: {
  readonly sessions: readonly ClassOverviewSessionDto[];
  /** ⚠️ Threaded in at `P2-6` solely so the footer control can address screen `14`. */
  readonly classModuleId: string;
}) {
  return (
    <section
      aria-label="Lessons"
      className="flex flex-col gap-[14px] rounded-[16px] border border-line bg-surface px-[22px] py-5 shadow-[var(--shadow-card)]"
    >
      {sessions.length === 0 ? (
        <p className="text-small text-ink" role="status">
          No class sessions have been created for this class yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-1.5 text-left">
            <caption className="sr-only">Lessons in this class, with report progress</caption>
            <thead>
              <tr>
                <th
                  scope="col"
                  className="w-[110px] px-[14px] pb-0.5 text-[10px] font-semibold uppercase tracking-[0.4px] text-ink-subtle"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-[14px] pb-0.5 text-[10px] font-semibold uppercase tracking-[0.4px] text-ink-subtle"
                >
                  Lesson
                </th>
                <th
                  scope="col"
                  className="px-[14px] pb-0.5 text-[10px] font-semibold uppercase tracking-[0.4px] text-ink-subtle"
                >
                  Report status
                </th>
                {/*
                  ⛔ THE FRAME'S UNLABELLED `Stats ›` COLUMN — BUILT, AND ITS TARGET IS
                  RULED. Operator, 2026-08-16: *"a lesson row points at LESSON statistics,
                  so it targets 15."* ▶ `P2-4`'s record attributed it to screen `16` and
                  is SUPERSEDED; the correction is at plan §30.5.
                  ⚠️ AND IT WAS THE ONLY INBOUND ROUTE SCREEN `15` COULD HAVE. The
                  Operator's walk found `15` reachable only by typing a URL, and reported
                  the affordance as belonging on screen `14` — measured against that
                  frame's `.png`, screen `14` DRAWS NO STATS CONTROL AT ALL, so building
                  it there would have been an invention. It is drawn HERE.
                  ⚠️ The header is deliberately unlabelled, exactly as the frame draws it.
                */}
                <th scope="col" className="px-[14px] pb-0.5">
                  <span className="sr-only">Lesson statistics</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.classSessionId} className="bg-surface-subtle">
                  <td className="rounded-s-[12px] px-[14px] py-3 text-[13px] font-medium text-ink-strong">
                    {session.sessionDate}
                  </td>
                  <td className="px-[14px] py-3">
                    {/*
                      ⛔ NULL MEANS NOT RECORDED (hero 0B). A session with no lesson number and
                      no title renders NOTHING in this cell — never "Lesson 1", never a dash.
                    */}
                    {session.lessonTitle !== null && (
                      <span className="block text-[13px] font-semibold text-ink-strong">
                        {session.lessonTitle}
                      </span>
                    )}
                    {session.lessonNumber !== null && (
                      <span className="block text-[11px] text-ink-muted">
                        Lesson {session.lessonNumber}
                      </span>
                    )}
                  </td>
                  <td className="px-[14px] py-3">
                    <ReportProgressChip
                      submitted={session.submittedCount}
                      learners={session.learnerCount}
                    />
                  </td>
                  <td className="rounded-e-[12px] px-[14px] py-3 text-right">
                    {/*
                      ⛔ NAVIGATION, NEVER PERMISSION. Screen `15` re-authorizes on its
                      own — RLS plus the reads it already uses — so this link grants
                      nothing (`A-022`: a frame authorizes no access).
                    */}
                    <Link
                      href={`/management/classes/${classModuleId}/sessions/${session.classSessionId}/lesson-statistics`}
                      className="whitespace-nowrap text-[12px] font-semibold text-brand-700 underline"
                    >
                      Stats ›
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/*
        ⚠️ THE FRAME'S FOOTER, AS CONTROLS RATHER THAN PROSE — a `space-between` row inside the
        same card, exactly where the `.png` draws it. ⛔ Both are INERT with a stated reason:
        their targets are real screens later phases build, and a link that 404s is worse than a
        control that says why. This is NOT the ABSENT treatment; nothing forbids either
        capability (standing prohibition 17).
      */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        {/*
          ✅ ACTIVATED AT `P2-6`, 2026-08-14. ⚠️ This is NOT a new control and NOT a visual
          change: `P2-4` built it here as INERT with the stated reason *"Lesson plans arrive
          with screen 14."* ▶ **THAT REASON HAS LAPSED** — screen `14` now exists at this exact
          route — so leaving it inert would have made the stated reason FALSE, which is worse
          than either treatment. ⛔ The inert-versus-absent distinction is untouched (standing
          prohibition 17); this control simply moved from one side of INERT to live.
          ⚠️ Screen `14` has no other inbound route, and this is the control the `.html` draws
          for it (`Manage lesson plans`, `#EC4B96`, `13px`, weight `600`) — so this is restored
          fidelity, not an addition.
        */}
        {/*
          ⚠️ THE SAME TREATMENT `InertControl` RENDERS — `min-h-11`, `gap-[5px]`, `13px`,
          `font-semibold`, a text `›`. Only the COLOUR differs, and it differs toward the
          frame: the `.html` draws this control at `#EC4B96`, which is the brand token.
          ▶ Building it as a `Link` with its own spacing would have made two visually
          different footer controls out of a row the frame draws as a matched pair.
        */}
        <Link
          href={`/management/classes/${classModuleId}/lesson-plans`}
          className="inline-flex min-h-11 items-center gap-[5px] text-[13px] font-semibold text-brand-500 no-underline transition hover:text-brand-700"
        >
          Manage lesson plans <span aria-hidden="true">›</span>
        </Link>
        {/*
          ✅ ACTIVATED AT `P2-16`, 2026-08-16 — the SECOND time this exact
          correction has been made in this footer, and for the same reason.
          ⚠️ `P2-4` built this INERT with the stated reason *"Class statistics
          arrive with screen 16."* ▶ **THAT REASON HAS NOW LAPSED** — screen
          `16` exists at this exact route — and §12.11 requires a stale
          disclosure to be corrected in the same pass as the change that made
          it stale. ⛔ Leaving it inert would have made its own stated reason
          FALSE, which is worse than either treatment.

          ⚠️ Screen `16` HAS NO OTHER INBOUND ROUTE. The frame's per-row
          `Stats ›` column remains AUTHORIZATION B and unbuilt, so without this
          control the screen would be reachable only by typing its URL.

          ⚠️ Matched to `Manage lesson plans` above — same `min-h-11`,
          `gap-[5px]`, `13px`, `font-semibold`, text `›` and `#EC4B96`, because
          the `.html` draws the two as a matched pair.
        */}
        <Link
          href={`/management/classes/${classModuleId}/class-statistics`}
          className="inline-flex min-h-11 items-center gap-[5px] text-[13px] font-semibold text-brand-500 no-underline transition hover:text-brand-700"
        >
          View Overall Class Statistics <span aria-hidden="true">›</span>
        </Link>
      </div>
    </section>
  );
}

/** The frame's `Reports sent` / `10 / 12 sent` / `Not started` chip, at its three tones. */
function ReportProgressChip({
  submitted,
  learners,
}: {
  readonly submitted: number;
  readonly learners: number;
}) {
  if (submitted === 0) {
    return (
      <span className="rounded-full bg-neutral-soft px-[10px] py-[5px] text-[11px] font-medium text-ink-muted">
        Not started
      </span>
    );
  }
  if (submitted >= learners) {
    return (
      <span className="rounded-full bg-success-soft px-[10px] py-[5px] text-[11px] font-medium text-success-on">
        Reports sent
      </span>
    );
  }
  return (
    <span className="rounded-full bg-warning-soft px-[10px] py-[5px] text-[11px] font-medium text-warning-on">
      {submitted} / {learners} sent
    </span>
  );
}

/*
 * ⚠️ `InertControl` WAS DEFINED HERE AND IS REMOVED AT `P2-16`, 2026-08-16 —
 * because BOTH of this footer's inert controls have now been activated by the
 * phases that built their targets: `Manage lesson plans` at `P2-6` (screen
 * `14`) and `View Overall Class Statistics` at `P2-16` (screen `16`).
 *
 * ▶ **The lint warning is what caught it**, on the same run that activated the
 * second one, and it is worth recording as the useful kind: the component
 * became dead the instant its last user did, and leaving it would have left a
 * helper on this screen whose entire purpose — *"a frame control whose target
 * is not built yet"* — no longer described anything on it.
 *
 * ⛔ STANDING PROHIBITION 17 IS UNTOUCHED. The inert-versus-absent distinction
 * is a RULE, not this function: a control whose target genuinely does not
 * exist is still rendered present-and-disabled with its reason stated. Screen
 * `18`'s `Edit` and screen `13`'s reminder button both do exactly that today.
 * ▶ Removing the helper removes a helper, not the discipline — and if another
 * screen on this surface needs one again, it is six lines.
 */

/**
 * ⛔ A GOVERNANCE-MANDATED ADDITION THE FRAME OMITS — `CLAUDE.md` §6 names this table directly
 * and the inventory says it *"must be built to that rule, not inferred from the frame"*.
 *
 * ⚠️ It is NOT the frame's `REPORT STATUS` column, which is per LESSON. This is per LEARNER.
 */
function StudentReportStatus({ rows }: { readonly rows: readonly ClassOverviewRowDto[] }) {
  return (
    <section className="card flex flex-col gap-4 px-6 py-5" aria-label="Student Report Status">
      <h2 className="text-section-title font-extrabold text-ink-strong">Student Report Status</h2>
      {rows.length === 0 ? (
        <p className="text-small text-ink" role="status">
          No learners are enrolled in this class yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">
              Report status for every enrolled learner, by class session
            </caption>
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className="py-2 pe-4 text-small font-bold text-ink-strong">
                  Student
                </th>
                <th scope="col" className="py-2 pe-4 text-small font-bold text-ink-strong">
                  Session
                </th>
                <th scope="col" className="py-2 pe-4 text-small font-bold text-ink-strong">
                  Report
                </th>
                <th scope="col" className="py-2 text-small font-bold text-ink-strong">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={`${row.classSessionId}-${row.studentId}`}
                  className="border-b border-line last:border-0"
                >
                  <td className="py-2.5 pe-4 text-[0.8125rem] font-semibold text-ink-strong">
                    {row.studentDisplayName}
                  </td>
                  <td className="py-2.5 pe-4 text-small text-ink">{row.sessionDate}</td>
                  <td className="py-2.5 pe-4 text-small text-ink">
                    {row.reportState === null
                      ? "No Report"
                      : REPORT_LABEL[row.reportState] ?? row.reportState}
                  </td>
                  <td className="py-2.5">
                    <RowAction row={row} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/**
 * ⛔ `A-038`'s PER-ROW GATE. Four outcomes, checked independently for every row.
 *
 * ⚠️ NOT ONE GENERIC "view report" HANDLER. `CLAUDE.md` §6 names that specifically: *"Do not
 * implement this as one generic 'view report' handler shared across all rows/screens regardless
 * of status; every such handler must check status first, independently."*
 */
function RowAction({ row }: { readonly row: ClassOverviewRowDto }) {
  // ⛔ NO REPORT → NO BUTTON AT ALL. "Send Reminder to Trainer" does not apply when no report
  // was ever started, and §6 says a plain "—" is the correct treatment.
  if (row.reportState === null || row.reportId === null) {
    return (
      <span className="text-small text-ink" aria-label="No action available">
        —
      </span>
    );
  }

  if (row.reportState === "submitted") {
    return (
      <Link
        href={`/management/reports?status=submitted`}
        className="inline-flex min-h-11 items-center text-small font-semibold text-brand-700 underline"
      >
        View submitted report
      </Link>
    );
  }

  if (row.reportState === "trainer_approved") {
    return (
      <Link
        href={`/management/reports/${row.reportId}/review`}
        className="inline-flex min-h-11 items-center text-small font-semibold text-brand-700 underline"
      >
        Open final review
      </Link>
    );
  }

  /*
   * ⛔ EVERY EARLIER STATUS EXPOSES NO REPORT CONTENT AT ALL — not a panel, not a draft, not a
   * note. The row-level action is a reminder, and `CLAUDE.md` §6 is explicit that it is a
   * row-level control rather than a page-level Quick Action.
   *
   * ⚠️ It is rendered DISABLED rather than absent, and that is the correct side of standing
   * prohibition 17: sending a reminder is a capability nothing forbids — it simply has no
   * notification substrate yet (`G-04` places notifications OUT of scope).
   */
  return (
    <button
      type="button"
      disabled
      title="Reminders are not available yet — no notification path is in scope."
      className="inline-flex min-h-11 cursor-not-allowed items-center rounded-field border border-line px-3 py-1.5 text-small font-semibold text-neutral-on"
    >
      Send Reminder to Trainer
    </button>
  );
}
