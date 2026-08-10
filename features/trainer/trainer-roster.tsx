"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useId, useMemo, useState } from "react";
import { Avatar, initialsFrom } from "@/components/ui/avatar";
import { FeedbackBanner } from "@/components/ui/feedback-banner";
import { Icon } from "@/components/ui/icon";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { StatePanel } from "@/components/ui/state-panel";
import { StatusPill } from "@/components/ui/status-pill";
import type {
  RosterEntryDto,
  TrainerSessionSummaryDto,
} from "@/lib/frontend/contracts/physical-test";
import type { UiActionResult } from "@/lib/frontend/contracts/result";
import { usePhysicalTestPort, usePortalRuntime } from "@/features/portal/portal-runtime-context";
import { asFailure, type ResourceState } from "./resource-state";

/**
 * Screen 06 — Trainer Student Roster (FRONTEND RECONSTRUCTION F5 / operator checkpoint F-05).
 *
 * Route: `/trainer/sessions/[sessionId]/roster` — the PINNED implemented path. The canonical
 * route recorded for this screen is `/trainer/schedule/[sessionId]/student-roster` and its
 * treatment is `Replace after integration` (inventory §7.2; `screen.md` §1). That move is a
 * separately-authorized route-migration checkpoint, so NO route is created, moved, renamed or
 * redirected here (`screen.md` §6 "Prohibited invention"). The breadcrumb and the back control
 * point at `/trainer/schedule`, the canonical Trainer entry route created by F-04 under
 * operator ruling R-B1.
 *
 * Current Final MVP visual authority is `UI_REFERENCE_FINAL_MVP/reference/Trainer - Student Roster/`
 * (Amendment 007 A-056, which supersedes the A-045 ordering). The pack-local
 * `UI_REFERENCE_FINAL_MVP/06-trainer-student-roster/reference.png` (node `487:9`) is an
 * optional frozen duplicate, SHA-identical to it. See CLAUDE.md §7.4 and
 * FINAL_MVP_AUTHORITY_LOCK.md §2.4 for the ladder and for governed deviations.
 * Figma never bypasses governance (A-045, preserved by A-056): where the
 * frame and a ratified rule disagree the RULE WINS, the prohibited thing is OMITTED, and the
 * divergence is RECORDED in this screen's `implementation-notes.md` — never silently resolved.
 *
 * GOVERNANCE BOUNDARIES HELD HERE:
 *
 *  - ATTENDANCE (A-018, `CLAUDE.md` §6). Attendance is resolved SERVER-SIDE and arrives on the
 *    governed roster projection. Nothing here computes or infers it, and no enrolment
 *    eligibility is computed client-side. Present-by-default is the server's initialization
 *    rule, not a default this component manufactures when a field is missing.
 *
 *    STAGE 2 ADDED THE TRAINER'S TOGGLE, and only the toggle. A-018 gives the trainer the
 *    right to mark an individual learner Absent, and until Stage 2 no surface exercised it —
 *    `attendance` carried three SELECT policies and no INSERT/UPDATE policy at all, so the
 *    table was writable by nobody and the lifecycle's first governed write was being satisfied
 *    by a hand-seeded harness row. The control here DECIDES NOTHING: it sends a
 *    compare-and-set to `attendance_set_status`, the one governed write path, and renders the
 *    status THE DATABASE REPORTS BACK. It never assumes its own write succeeded, never retries
 *    a refusal, and never re-derives authorization — management (A-034 forbids management
 *    touching attendance) and parent are closed server-side by the same predicate that
 *    authorizes the trainer.
 *
 *    THE EXPECTED-STATE ARGUMENT IS DERIVED, NOT ASSUMED. `expectedStatus` is omitted exactly
 *    when the projection reports `attendanceRecorded: false` — "no row exists yet" — because
 *    A-018's Present default is materialized lazily and "no record" is a different committed
 *    state from "record says present". There is no force mode: a stale expectation is refused
 *    and surfaced, never papered over with a re-read-and-retry.
 *  - ABSENCE EXPOSES NOTHING. `resolveAction` gates on attendance BEFORE it ever looks at a
 *    report status, so an absent learner's card offers no assessment path and no report path —
 *    not a link, not a route, not a status pill. Absence must never create or expose a
 *    fabricated assessment or report, so an absent card carries no lifecycle status at all.
 *  - THE ACTION GATES ON THE STUDENT'S ACTUAL REPORT STATUS. There is deliberately no single
 *    generic handler shared across the cards: `resolveAction` is an exhaustive switch over the
 *    per-student `reportState`, and each branch resolves its own destination
 *    (`CLAUDE.md` §6, generalized from the management row rule). A state carrying no reachable
 *    report renders an inert control with a stated, non-disclosing reason rather than a guess.
 *  - CONTINUITY THREADS THROUGH THE LIVE ROSTER (persona §3.8, Phase 1 exit condition (c)).
 *    The previous session's follow-up note is carried on every present learner's card AND
 *    summarised across the session in the focus strip, so the trainer meets it while teaching —
 *    not only in the database.
 *  - Only students the governed projection returned can appear; the trainer's reach is proved
 *    server-side through the live class-session assignment (ADR-4). Filter and sort NARROW what
 *    that projection returned and can never widen it.
 *  - NOT RATING-BEARING (`screen.md` §8). No competency-rating vocabulary is rendered — that
 *    vocabulary belongs to F6 / Amendment 006 V3, which has not landed. The Class Grade this
 *    screen does render (Beginner / Intermediate / Advanced) is a DIFFERENT, unchanged
 *    vocabulary (A-054) and marks itself `data-vocabulary="class-grade"` so a rating-token
 *    guard classifies it by ACTUAL CONTEXT rather than by keyword.
 *
 * FRAME-VERSUS-GOVERNANCE DIVERGENCES (recorded, not resolved locally):
 *
 *  D1 "CLASS IN SESSION" — the frame's banner eyebrow asserts a session LIFECYCLE state. The
 *     session-lifecycle enum is deferred and unratified, and `CLAUDE.md` §6.1 / A-026 say
 *     plainly "do not invent a placeholder enum". A banner claiming a state no governed field
 *     carries would be a false claim, so the eyebrow names the governed entity — "CLASS
 *     SESSION" — and the frame's live dot is dropped with it. Same adjudication as F-04's D2.
 *  D2 "Lesson 3 · Voice & Projection" and its date/room line — no lesson number, lesson title
 *     or room field exists on `TrainerSessionSummaryDto`. Omitted rather than fabricated; the
 *     strip shows the governed Class Module, Class Grade, date and time instead.
 *  D3 "KEY FOCUS" chips — the frame's chips are lesson-plan tags with no governed backing. The
 *     region is kept but is filled from the ONLY governed focus data on this screen, the
 *     roster's carried-over previous-session focus, and is labelled for what it actually is.
 *  D4 "SLIDES" chips (KEY / PPTX attachments) — no governed material, attachment or lesson-plan
 *     field exists. The chips are omitted rather than faked, and "View lesson plan" keeps the
 *     frame's label but is rendered DISABLED with a visible, programmatically associated
 *     reason — the F-04 D1 / F-11 treatment for an affordance with no governed backing.
 *  D5 "Trainer: <name>" — the projection carries no assignment-name field (the same dependency
 *     F-04 recorded), so no staff identity is rendered.
 *  D6 The frame draws EIGHT synthetic learner cards. Figma mock data is never ported
 *     (`GLOBAL_UI_RULES` §8): the grid renders exactly what the governed roster projection
 *     returns, in the frame's four-column composition.
 *  D7 The frame highlights "Schedule" in the left rail. That rail is
 *     `components/layout/portal-shell.tsx`, outside this checkpoint's owned paths, and its
 *     Schedule item matches `/trainer/schedule` exactly — this screen still sits on the pinned
 *     `/trainer/sessions/...` path, so the highlight follows the separately-authorized route
 *     move, not this checkpoint. The relationship is carried instead by the breadcrumb and the
 *     "Back to Schedule" control the frame also draws.
 */

/** Report states that mean this present learner's assessment has been captured. */
const ASSESSED_STATES: ReadonlySet<RosterEntryDto["reportState"]> = new Set([
  "observation_saved",
  "drafting",
  "draft_ready",
  "needs_edit",
  "trainer_approved",
  "approved",
  "submitted",
]);

const ATTENDANCE_FILTERS = ["all", "present", "absent"] as const;
type AttendanceFilter = (typeof ATTENDANCE_FILTERS)[number];

const ATTENDANCE_FILTER_LABEL: Readonly<Record<AttendanceFilter, string>> = {
  all: "All learners",
  present: "Present only",
  absent: "Absent only",
};

const SORT_MODES = ["name", "progress"] as const;
type SortMode = (typeof SORT_MODES)[number];

const SORT_LABEL: Readonly<Record<SortMode, string>> = {
  name: "Name (A–Z)",
  progress: "Assessment progress",
};

/** Sort weight per report state — presentation ordering only, no lifecycle meaning. */
const PROGRESS_ORDER: Readonly<Record<RosterEntryDto["reportState"], number>> = {
  no_report: 0,
  incomplete: 1,
  observation_saved: 2,
  drafting: 3,
  draft_ready: 4,
  needs_edit: 5,
  trainer_approved: 6,
  approved: 7,
  submitted: 8,
};

type RosterView = {
  readonly session: TrainerSessionSummaryDto;
  readonly roster: readonly RosterEntryDto[];
};

export function TrainerRoster() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = params.sessionId;
  const port = usePhysicalTestPort();
  const { dataRevision } = usePortalRuntime();
  const [state, setState] = useState<ResourceState<RosterView>>({ kind: "loading" });
  const [attendanceFilter, setAttendanceFilter] = useState<AttendanceFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("name");
  /** The learner whose governed attendance write is in flight, if any. */
  const [attendanceBusy, setAttendanceBusy] = useState<string | null>(null);
  /** The last governed attendance refusal, surfaced verbatim rather than retried. */
  const [attendanceRefusal, setAttendanceRefusal] = useState<UiActionResult<never> | null>(null);
  const filterId = useId();
  const sortId = useId();
  const lessonPlanNoteId = useId();

  useEffect(() => {
    let active = true;
    void Promise.all([port.listTrainerSessions(), port.getSessionRoster(sessionId)]).then(
      ([sessionsResult, rosterResult]) => {
        if (!active) return;
        if (sessionsResult.outcome !== "success") {
          setState({ kind: "failed", result: asFailure(sessionsResult) });
          return;
        }
        if (rosterResult.outcome !== "success") {
          setState({ kind: "failed", result: asFailure(rosterResult) });
          return;
        }
        const session = sessionsResult.data.find((item) => item.sessionId === sessionId);
        if (!session) {
          setState({ kind: "failed", result: { outcome: "unavailable" } });
          return;
        }
        setState({ kind: "ready", data: { session, roster: rosterResult.data } });
      },
    );
    return () => {
      active = false;
    };
  }, [dataRevision, port, sessionId]);

  const roster = useMemo(
    () => (state.kind === "ready" ? state.data.roster : []),
    [state],
  );

  /**
   * A-018's governed Present/Absent toggle.
   *
   * The whole of the governance lives on the other side of `setAttendance`.
   * What this function is responsible for is narrower and worth stating,
   * because each part is a place a surface can quietly lie:
   *
   *  1. the expected state is DERIVED from what the projection actually
   *     reported — `undefined` when no row exists yet — never defaulted;
   *  2. the rendered result is the status THE DATABASE REPORTED, never the
   *     status this function asked for. An optimistic update would show a
   *     learner as absent on a call the database refused;
   *  3. a refusal is SURFACED, never retried. Re-reading and re-sending on
   *     `stale_state` would be a force mode reintroduced client-side, and the
   *     governed RPC deliberately offers none;
   *  4. `changed: false` is a confirmed no-op — authorized, answered and
   *     deliberately unaudited — so it must not be reported as "saved".
   */
  async function toggleAttendance(entry: RosterEntryDto): Promise<void> {
    if (attendanceBusy !== null) return;
    setAttendanceBusy(entry.studentId);
    setAttendanceRefusal(null);

    const result = await port.setAttendance({
      sessionId,
      studentId: entry.studentId,
      /* Omitted exactly when the projection says no record exists yet. */
      ...(entry.attendanceRecorded ? { expectedStatus: entry.attendanceState } : {}),
      newStatus: entry.attendanceState === "absent" ? "present" : "absent",
    });

    setAttendanceBusy(null);
    if (result.outcome !== "success") {
      setAttendanceRefusal(result);
      return;
    }

    const committed = result.data.status;
    setState((previous) =>
      previous.kind === "ready"
        ? {
            kind: "ready",
            data: {
              ...previous.data,
              roster: previous.data.roster.map((item) =>
                item.studentId === entry.studentId
                  ? { ...item, attendanceState: committed, attendanceRecorded: true }
                  : item,
              ),
            },
          }
        : previous,
    );
  }

  /* Filter and sort NARROW the governed projection; neither can widen it. */
  const visible = useMemo(() => {
    const filtered =
      attendanceFilter === "all"
        ? [...roster]
        : roster.filter((entry) => entry.attendanceState === attendanceFilter);
    return filtered.sort((left, right) =>
      sortMode === "name"
        ? left.displayName.localeCompare(right.displayName, "en")
        : PROGRESS_ORDER[right.reportState] - PROGRESS_ORDER[left.reportState] ||
          left.displayName.localeCompare(right.displayName, "en"),
    );
  }, [attendanceFilter, roster, sortMode]);

  /* Continuity summary — distinct carried-over focus notes across the live roster. */
  const carriedFocus = useMemo(
    () => [
      ...new Set(
        roster
          .map((entry) => entry.previousSessionFocus)
          .filter((focus): focus is string => Boolean(focus)),
      ),
    ],
    [roster],
  );

  if (state.kind === "loading") {
    return <LoadingSkeleton label="Loading the Class Session roster" rows={4} />;
  }
  if (state.kind === "failed") return <StatePanel result={state.result} />;

  const { session } = state.data;
  const present = roster.filter((entry) => entry.attendanceState === "present");
  const assessed = present.filter((entry) => ASSESSED_STATES.has(entry.reportState));
  const progressPercent =
    present.length === 0 ? 0 : Math.round((assessed.length / present.length) * 100);

  return (
    <div className="page-grid">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-x-2 text-[0.71875rem] font-medium text-neutral-on">
              <li>
                <Link
                  href="/trainer/schedule"
                  className="font-semibold text-neutral-on underline-offset-4 hover:text-brand-800"
                >
                  Schedule
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <span data-vocabulary="class-grade">{session.classGrade}</span>
                {" · "}
                {session.moduleName}
              </li>
            </ol>
          </nav>
          {/* PHASE 4/5 — `tracking-[-0.02em]` removed here and everywhere in this file:
              `h1..h4 { letter-spacing: -0.015em }` is UNLAYERED, so the utility was
              emitted, matched and silently discarded. See the Batch 3 adjudication §0.2. */}
          <h1 className="mt-[3px] text-[1.375rem] font-bold text-ink-strong">
            Student Roster
          </h1>
        </div>
        <Link
          href="/trainer/schedule"
          className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-[11px] bg-brand-100 px-4 py-2.5 text-[0.84375rem] font-semibold text-brand-800 no-underline transition hover:bg-brand-200"
        >
          <Icon name="chevronLeft" size={16} />
          Back to Schedule
        </Link>
      </header>

      {/* Class Session banner — the frame's dark accent surface (D1: eyebrow relabelled). */}
      <section
        aria-labelledby="class-session-heading"
        className="rounded-[18px] bg-accent-ink px-6 py-5 text-white lg:flex lg:items-center lg:justify-between lg:gap-8"
      >
        <div className="min-w-0">
          {/* D1 — the frame's eyebrow reads "CLASS IN SESSION" beside a live green dot,
              which asserts a lifecycle state no governed field carries. The LABEL stays
              "Class Session" and there is still no dot; only the frame's type (10.5px/600)
              is followed. */}
          <p className="text-[0.65625rem] font-semibold uppercase tracking-[0.1em] text-brand-200">
            Class Session
          </p>
          {/*
            * The heading's colour is carried on an inner `span`, not on the `h2` itself.
            * `app/globals.css` still declares `h1, h2, h3, h4 { color: #1b2b4b }` UNLAYERED
            * (the defect recorded at F-01b, in a file outside this checkpoint's owned
            * paths), and an unlayered declaration outranks every rule in `@layer
            * utilities` — so `text-white` on the `h2` is generated, matches, and silently
            * loses the cascade, rendering near-black heading text on this dark accent
            * surface at 1.11:1. Colouring a `span` the unlayered selector does not match
            * fixes the live AA failure without editing an unowned file and without an
            * `!important` escape hatch.
            */}
          <h2 id="class-session-heading" className="mt-1.5">
            <span className="text-[1.125rem] font-bold text-white">
              <span data-vocabulary="class-grade">{session.classGrade}</span>
              {" · "}
              {session.moduleName}
            </span>
          </h2>
          <p className="mt-1 text-[0.75rem] text-white/80">
            {formatDate(session.date)} · {session.startTime}–{session.endTime}
          </p>
        </div>
        <div className="mt-5 w-full max-w-[15rem] lg:mt-0">
          <p className="text-[0.75rem] font-medium text-white lg:text-right">
            {assessed.length} of {present.length} present{" "}
            {present.length === 1 ? "learner" : "learners"} assessed
          </p>
          <span
            aria-hidden="true"
            className="mt-2 block h-[7px] w-full overflow-hidden rounded-full bg-white/20"
          >
            <span
              className="block h-full rounded-full bg-brand-600"
              style={{ width: `${progressPercent}%` }}
            />
          </span>
        </div>
      </section>

      {/* Session strip — governed session facts, carried-over focus, lesson-plan dependency. */}
      <section
        aria-label="Class Session detail"
        /*
         * ⚠️ NOT `card` — deliberately. The frame gives this strip a 1.5px PINK
         * hairline (`#F6C9DD`), and `.card` in globals.css is an UNLAYERED rule
         * declaring the `border` shorthand: a `border-brand-200` utility written on a
         * `.card` element is emitted, matched, and loses the cascade. The surface is
         * therefore composed from utilities the cascade actually reaches, at the same
         * radius and elevation `.card` would have given it. Verified in the compiled
         * stylesheet, not inferred.
         */
        className="grid gap-5 rounded-card border-[1.5px] border-brand-200 bg-surface px-[22px] py-[18px] shadow-card lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)_minmax(0,17rem)] lg:gap-6"
      >
        <div className="lg:border-r lg:border-line lg:pr-6">
          <StripLabel>This session</StripLabel>
          <p className="mt-1.5 text-[0.875rem] font-semibold text-ink-strong">
            {session.moduleName}
          </p>
          <p className="mt-1 text-[0.6875rem] text-ink">
            <span data-vocabulary="class-grade">{session.classGrade}</span> ·{" "}
            {formatDate(session.date)}
          </p>
        </div>

        <div className="lg:border-r lg:border-line lg:pr-6">
          <StripLabel>Focus carried over from the previous session</StripLabel>
          {carriedFocus.length === 0 ? (
            <p className="mt-2 text-small leading-6 text-ink">
              No previous-session focus is recorded for this roster yet.
            </p>
          ) : (
            <ul className="mt-2.5 flex flex-wrap gap-2">
              {carriedFocus.map((focus) => (
                <li
                  key={focus}
                  className="rounded-full bg-brand-100 px-[11px] py-1.5 text-[0.6875rem] font-medium text-brand-800"
                >
                  {focus}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <StripLabel>Lesson plan</StripLabel>
          {/* D4 — frame affordance, no governed backing. Label kept, behaviour not invented. */}
          <button
            type="button"
            disabled
            aria-describedby={lessonPlanNoteId}
            className="mt-2.5 inline-flex min-h-11 w-full cursor-not-allowed items-center justify-between gap-2 rounded-full border border-line bg-surface-muted px-4 py-[11px] text-small font-semibold text-ink-subtle"
          >
            View lesson plan
            <Icon name="chevronRight" size={16} />
          </button>
          <p id={lessonPlanNoteId} className="mt-2 text-small leading-6 text-ink">
            No governed lesson-plan or session-material record exists, so this control is
            inactive rather than simulated.
          </p>
        </div>
      </section>

      <section aria-labelledby="roster-heading" className="grid gap-4">
        {attendanceRefusal !== null && (
          /*
           * A governed refusal, stated and left standing. There is deliberately
           * no "try again" control: the refusals this write produces are
           * `stale_state` (this roster no longer describes the committed
           * record) and the non-disclosing authorization outcomes, and a retry
           * affordance on either would invite the trainer to do the one thing
           * the governed RPC refuses to do for them. Reloading the roster is
           * the honest recovery, and it is what the message asks for.
           */
          <FeedbackBanner title="Attendance was not changed" tone="error">
            {attendanceRefusalMessage(attendanceRefusal)}
          </FeedbackBanner>
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2
            id="roster-heading"
            className="text-[1.125rem] font-bold text-ink-strong"
          >
            Student Roster{" "}
            <span className="ml-1 inline-flex align-middle rounded-full bg-surface-muted px-2.5 py-1 text-[0.6875rem] font-semibold text-neutral-on">
              {roster.length} total
            </span>
          </h2>
          <div className="flex flex-wrap gap-3">
            <div>
              <label
                htmlFor={filterId}
                className="mb-1 block text-small font-medium text-neutral-on"
              >
                Filter
              </label>
              <select
                id={filterId}
                value={attendanceFilter}
                onChange={(event) =>
                  setAttendanceFilter(event.target.value as AttendanceFilter)
                }
                className="min-h-11 rounded-field border border-line bg-surface px-3.5 py-[9px] text-[0.78125rem] font-semibold text-ink-strong"
              >
                {ATTENDANCE_FILTERS.map((value) => (
                  <option key={value} value={value}>
                    {ATTENDANCE_FILTER_LABEL[value]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor={sortId}
                className="mb-1 block text-small font-medium text-neutral-on"
              >
                Sort
              </label>
              <select
                id={sortId}
                value={sortMode}
                onChange={(event) => setSortMode(event.target.value as SortMode)}
                className="min-h-11 rounded-field border border-line bg-surface px-3.5 py-[9px] text-[0.78125rem] font-semibold text-ink-strong"
              >
                {SORT_MODES.map((value) => (
                  <option key={value} value={value}>
                    {SORT_LABEL[value]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {roster.length === 0 ? (
          <div className="card px-6 py-12 text-center" role="status">
            <p className="text-card-title font-extrabold text-ink-strong">
              No learners are enrolled in this Class Session
            </p>
            <p className="mx-auto mt-2 max-w-md text-body leading-6 text-ink">
              The governed roster projection returned no enrolled learner for this session.
            </p>
          </div>
        ) : visible.length === 0 ? (
          <div className="card px-6 py-12 text-center" role="status">
            <p className="text-card-title font-extrabold text-ink-strong">
              No learner matches this filter
            </p>
            <p className="mx-auto mt-2 max-w-md text-body leading-6 text-ink">
              Choose &ldquo;{ATTENDANCE_FILTER_LABEL.all}&rdquo; to show the whole roster
              again.
            </p>
          </div>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {visible.map((entry) => (
              <li key={entry.studentId}>
                <RosterCard
                  entry={entry}
                  sessionId={sessionId}
                  busy={attendanceBusy === entry.studentId}
                  /* Any in-flight governed write disables every other toggle:
                     one write at a time keeps each card's expected state the
                     one the projection actually reported. */
                  disabled={attendanceBusy !== null && attendanceBusy !== entry.studentId}
                  onToggleAttendance={toggleAttendance}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/**
 * The message for a refused attendance write.
 *
 * `unauthorized` and `unavailable` are the governed NON-DISCLOSING outcomes and
 * are deliberately given ONE shared sentence: the server answers "you may not"
 * and "there is no such pair" identically on purpose, and a surface that split
 * them back apart would rebuild the existence oracle the RPC exists to prevent.
 */
function attendanceRefusalMessage(result: UiActionResult<never>): string {
  switch (result.outcome) {
    case "stale_state":
    case "validation":
    case "retryable_failure":
    case "unexpected_failure":
      return result.message;
    case "generation_failure":
      return result.message;
    case "unauthenticated":
      return "Your session has ended. Sign in again to continue.";
    default:
      return "Attendance for this learner is not available to change.";
  }
}

/**
 * Small uppercase region label inside the session strip. The colour sits on a `span`
 * because the unlayered `h1, h2, h3, h4` colour rule in `app/globals.css` outranks any
 * `text-*` utility placed on the heading element itself — see the banner heading note.
 */
function StripLabel({ children }: { readonly children: string }) {
  return (
    <h2 className="text-[0.625rem] font-semibold uppercase tracking-[0.06em]">
      <span className="text-neutral-on">{children}</span>
    </h2>
  );
}

function RosterCard({
  entry,
  sessionId,
  busy,
  disabled,
  onToggleAttendance,
}: {
  readonly entry: RosterEntryDto;
  readonly sessionId: string;
  readonly busy: boolean;
  readonly disabled: boolean;
  readonly onToggleAttendance: (entry: RosterEntryDto) => void | Promise<void>;
}) {
  const absent = entry.attendanceState === "absent";
  const action = resolveAction(sessionId, entry);

  return (
    <article
      data-roster-card={entry.studentId}
      data-attendance={entry.attendanceState}
      data-roster-action={action.kind}
      className={`card flex h-full flex-col p-4 ${absent ? "bg-surface-subtle" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        {absent ? (
          /*
           * The shared `Avatar`'s `muted` variant renders `text-ink-subtle` on
           * `bg-neutral-soft` — 2.004:1, measured in the production DOM. `components/ui/
           * avatar.tsx` is outside this checkpoint's owned paths, so the inert treatment
           * the frame draws is reproduced here at the AA floor instead: same family, same
           * hue, luminance moved (A-045, persona §3.5). The initials stay decorative — the
           * learner's name is rendered in full immediately below.
           */
          <span
            aria-hidden="true"
            className="grid size-12 shrink-0 place-items-center rounded-xl bg-neutral-soft text-body font-bold text-neutral-on"
          >
            {initialsFrom(entry.displayName)}
          </span>
        ) : (
          <Avatar displayName={entry.displayName} size="large" shape="square" />
        )}
        <span
          className={`inline-flex items-center gap-1 text-[0.59375rem] font-semibold uppercase tracking-[0.04em] ${
            absent ? "text-neutral-on" : "text-success-on"
          }`}
        >
          <Icon name={absent ? "close" : "check"} size={11} />
          {absent ? "Absent" : "Present"}
        </span>
      </div>

      {/* Colour on an inner `span` — see the banner heading note above. */}
      <h3 className="mt-3">
        <span
          className={`text-[0.9375rem] font-semibold ${
            absent ? "text-neutral-on" : "text-ink-strong"
          }`}
        >
          {entry.displayName}
        </span>
      </h3>

      {absent ? (
        /*
         * An absent learner's card carries NO lifecycle status and NO report affordance.
         * Absence must never create or expose a fabricated assessment or report (A-018).
         */
        <p className="mt-1.5 text-[0.75rem] font-medium leading-[1.45] text-neutral-on">
          Not available for assessment today.
        </p>
      ) : (
        <>
          {/* D3 — filled ONLY from the governed carried-over previous-session focus,
              and still labelled for what it is. Never a free-text line. */}
          <p className="mt-1.5 text-[0.75rem] font-medium leading-[1.45] text-ink">
            {entry.previousSessionFocus ?? "No previous-session focus is recorded yet."}
          </p>
          <p className="mt-3">
            <StatusPill status={entry.reportState} />
          </p>
        </>
      )}

      <div className="mt-auto pt-4">
        <RosterAction action={action} displayName={entry.displayName} />
        {/*
         * A-018's governed control. Placed BELOW the assessment action because
         * marking a learner absent removes that action — the trainer should
         * meet the consequence after the thing it affects, not before it.
         *
         * The label states the DESTINATION state, not the current one, so the
         * control never reads as a status display the trainer might mistake
         * for the governed value rendered at the top of the card.
         */}
        <button
          type="button"
          data-attendance-toggle={entry.studentId}
          onClick={() => void onToggleAttendance(entry)}
          disabled={busy || disabled}
          /*
           * ⚠️ `rounded-control` and `border-hairline` were UNDEFINED TOKENS. Neither
           * exists in `@theme inline`, so Tailwind emitted NOTHING for either and this
           * control had been rendering square-cornered and borderless since it was
           * written — while the source read as though both applied. They were the only
           * two uses in the repository. Replaced with real tokens; both are now grepped
           * out of the compiled stylesheet rather than trusted.
           */
          className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-field border border-line px-3 py-2 text-[0.75rem] font-semibold text-ink transition-colors hover:bg-surface-subtle disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Icon name={absent ? "check" : "close"} size={13} />
          {busy
            ? "Saving…"
            : absent
              ? `Mark ${entry.displayName} present`
              : `Mark ${entry.displayName} absent`}
        </button>
      </div>
    </article>
  );
}

/**
 * The per-student action, resolved from THIS student's attendance and THIS student's actual
 * report status. Deliberately not one generic handler shared across every card.
 */
type ResolvedAction =
  | {
      readonly kind: "assess" | "continue" | "review" | "view_report";
      readonly label: string;
      readonly href: string;
      readonly tone: "primary" | "soft";
    }
  | { readonly kind: "inert"; readonly label: string; readonly reason: string };

function resolveAction(sessionId: string, entry: RosterEntryDto): ResolvedAction {
  /* Attendance is the FIRST gate: an absent learner reaches no assessment and no report. */
  if (entry.attendanceState === "absent") {
    return {
      kind: "inert",
      label: "Assess",
      reason: "Assessment is unavailable while this learner is marked absent.",
    };
  }

  switch (entry.reportState) {
    case "no_report":
    case "incomplete":
      return {
        kind: "assess",
        label: "Assess",
        href: `/trainer/sessions/${sessionId}/students/${entry.studentId}/assess`,
        tone: "primary",
      };
    case "observation_saved":
    case "drafting":
      return entry.reportId
        ? {
            kind: "continue",
            label: "Continue",
            href: `/trainer/reports/${entry.reportId}/generate`,
            tone: "primary",
          }
        : unreachableReport();
    case "draft_ready":
    case "needs_edit":
      return entry.reportId
        ? {
            kind: "review",
            label: "Review",
            href: `/trainer/reports/${entry.reportId}/review`,
            tone: "primary",
          }
        : unreachableReport();
    case "trainer_approved":
    case "approved":
    case "submitted":
      return entry.reportId
        ? {
            kind: "view_report",
            label: "View report",
            href: `/trainer/reports/${entry.reportId}/review`,
            tone: "soft",
          }
        : unreachableReport();
    default: {
      const exhaustive: never = entry.reportState;
      return exhaustive;
    }
  }
}

/** Non-disclosing fallback: a state that names no reachable report gets no invented path. */
function unreachableReport(): ResolvedAction {
  return {
    kind: "inert",
    label: "Open report",
    reason: "This report isn't available in this workspace.",
  };
}

function RosterAction({
  action,
  displayName,
}: {
  readonly action: ResolvedAction;
  readonly displayName: string;
}) {
  if (action.kind === "inert") {
    return (
      <>
        <button
          type="button"
          disabled
          className="inline-flex min-h-11 w-full cursor-not-allowed items-center justify-center rounded-field border border-line bg-surface-muted px-4 py-[11px] text-[0.78125rem] font-semibold text-ink-subtle"
        >
          {action.label}
          <span className="sr-only"> {displayName} — unavailable</span>
        </button>
        <p className="mt-2 text-small leading-6 text-ink">{action.reason}</p>
      </>
    );
  }

  return (
    <Link
      href={action.href}
      className={`inline-flex min-h-11 w-full items-center justify-center rounded-field px-4 py-[11px] text-[0.78125rem] font-semibold no-underline transition ${
        action.tone === "primary"
          ? "bg-brand-700 text-white shadow-raised hover:bg-brand-800"
          : "bg-brand-50 text-brand-800 hover:bg-brand-100"
      }`}
    >
      {action.label}
      <span className="sr-only"> {displayName}</span>
    </Link>
  );
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-SG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
