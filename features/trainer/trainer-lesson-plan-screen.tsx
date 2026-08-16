"use client";

import { useEffect, useState } from "react";

import { BackLink } from "@/components/ui/back-link";
import { Card } from "@/components/ui/surface";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { PageHeading } from "@/components/ui/page-heading";
import { StatePanel } from "@/components/ui/state-panel";
import { usePhysicalTestPort } from "@/features/portal/portal-runtime-context";
import { asFailure, type ResourceState } from "@/features/trainer/resource-state";
import type { LessonPlanEntryDto, TrainerLessonPlanDto } from "@/lib/frontend/contracts/physical-test";

/**
 * Screen `03` — Trainer Lesson Plan. Phase `P2-18`.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ARTEFACTS OPENED (`CLAUDE.md` §7.4.1 — every claim below names one)
 * ═══════════════════════════════════════════════════════════════════════════
 *   · `reference/Trainer - Lesson Plan/….png`   — geometry
 *   · `reference/Trainer - Lesson Plan/….html`  — measured values
 *   · `UI_REFERENCE_FINAL_MVP/03-trainer-lesson-plan/` — `screen.md`
 *
 * MEASURED VALUES, from the `.html` and never from the picture:
 *   page title `22px/700` · breadcrumb `11.50px/500 #AEB6C4` (both already the
 *   `PageHeading` treatment) · module title `20px/700 #1B2A4A` · schedule line
 *   `12px/400 #8A93A6` · term `13px/500 #1B2A4A` · section heading
 *   `16px/600 #1B2A4A` · legend label `11px/500 #8A93A6` with dots `#67B26F`,
 *   `#EC4B96`, `#AEB6C4` · `LESSON n` pill `#EC4B96` / white `11px/600`,
 *   `radius 8px` · lesson title `16px/600 #1B2A4A` · date line
 *   `12px/400 #8A93A6` · timing badges `radius 999px`, `11px/600` —
 *   `#E4F3E4`/`#67B26F`, `#FCE7F0`/`#EC4B96`, `#EEF1F5`/`#8A93A6` ·
 *   panel captions `10px/600 #AEB6C4`.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⛔ THE KEY FOCUS CHIPS ARE RULED IN SCOPE AND ARE NOT BUILT — CITATION 1 OF 3
 * ═══════════════════════════════════════════════════════════════════════════
 * ⚠️ A LATER READER SEEING A LESSON SURFACE WILL CHECK `G-3` AND FIND A
 * PROHIBITION. It is qualified, and the qualification is recorded here, in the
 * DTO, and in the plan (§62), so no one re-derives it from the prohibition
 * alone.
 *
 * **Operator ruling, 2026-08-17:** *"BUILD THE KEY FOCUS CHIPS … the surviving
 * prohibition is about POSITION, and it protects §10 Phase 1 exit (c) — the
 * governed carried-over previous-session focus. Screen 03 is the lesson-plan
 * surface. It is not the roster and carries no governed focus line, so there is
 * nothing there for the chips to displace or be mistaken for. `D-4` permitted
 * them 'in a distinct visual position with a distinct label'. On 03 that
 * condition is satisfied trivially, because the position they would have
 * contended for does not exist on this screen."*
 *
 * ▶ **THE CHIPS ARE THEREFORE IN SCOPE. THEY ARE STILL NOT BUILT**, because the
 * same ruling made the schema a separate authorization — *"If they need a
 * column, STOP and state it. This ruling authorizes the chips, not the
 * schema."* They need one. Measured at HEAD: an exhaustive catalogue sweep for
 * `%focus%`, `%chip%`, `%objective%`, `%topic%`, `%plan%`, `%tag%`, `%outcome%`
 * across all 30 tables returns **exactly two columns** — `observations.focus_chips`
 * and `observations.strength_chips` — and both are the trainer's post-session
 * governed ASSESSMENT data, which is precisely what `G-3` bars as the source.
 *
 * ⚠️ **AND THE FRAME ITSELF SHOWS WHY THE PROHIBITION WAS WRITTEN THIS WAY.**
 * The `.html`'s own chip values are `Audience awareness`, `Sentence flow`,
 * `Eye contact`, `Vocal projection`, `Tonality`, `Emotional expression` — **six
 * of the nine B.E.S.T dimension names, verbatim.** ▶ The chips are drawn in the
 * assessment vocabulary, so an implementer sourcing them reaches for the
 * assessment table by the shortest honest-looking path. That is not a plumbing
 * detail; it is the conflation `G-3` exists to prevent, and it is why the
 * column question is a governance question.
 *
 * ⛔ **THE SCREEN CARRIES NO GOVERNED PREVIOUS-SESSION-FOCUS LINE, AND MUST NOT
 * ACQUIRE ONE.** The ruling's third constraint: if a phase ever adds one, the
 * chips move or go. Nothing on this page presents the trainer's carried-over
 * focus — the roster (screen `06`) does, and that is the surface `G-3` protects.
 */
export function TrainerLessonPlanScreen({
  classModuleId,
}: {
  readonly classModuleId: string | null;
}) {
  const port = usePhysicalTestPort();
  const [state, setState] = useState<ResourceState<TrainerLessonPlanDto | null>>({ kind: "loading" });

  useEffect(() => {
    let live = true;
    setState({ kind: "loading" });
    void port
      .readTrainerLessonPlan(classModuleId)
      .then((result) => {
        if (!live) return;
        setState(
          result.outcome === "success"
            ? { kind: "ready", data: result.data }
            : { kind: "failed", result: asFailure(result) },
        );
      })
      .catch(() => {
        if (live) setState({ kind: "failed", result: { outcome: "unavailable" } });
      });
    return () => {
      live = false;
    };
  }, [port, classModuleId]);

  const plan = state.kind === "ready" ? state.data : null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        breadcrumb={<>My Classes {plan === null ? "" : `/ ${plan.displayLabel}`}</>}
        title="Lesson Plan"
        actions={<BackLink href="/trainer/my-classes" label="My Classes" />}
      />

      {state.kind === "loading" ? (
        <LoadingSkeleton rows={4} label="Loading the lesson plan" />
      ) : null}

      {state.kind === "failed" ? (
        <StatePanel
          result={state.result}
          homeHref="/trainer/my-classes"
          homeLabel="Return to My Classes"
        />
      ) : null}

      {/*
        ⛔ `C-4d` CLIENT-SIDE. A null plan is "you are assigned to no class
        module", NOT "this module has no lessons" — a rejected or empty read
        must not resolve to a governed claim about a module the trainer may not
        even reach.
      */}
      {state.kind === "ready" && plan === null && (
        <Card className="p-5">
          <p className="text-[13px] text-ink">
            Lesson plans open from a class module you are assigned to teach. You are not currently
            assigned to one.
          </p>
        </Card>
      )}

      {plan !== null && (
        <>
          <ModuleHeader plan={plan} />

          <section className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-[16px] font-semibold text-ink-strong">Weekly Lessons</h2>
              <TimingLegend />
            </div>

            {plan.lessons.length === 0 ? (
              <Card className="p-5">
                {/*
                  ⛔ AN EMPTY MODULE IS A FACT, NOT AN ERROR — and it names the
                  module it is empty FOR, because "no lessons" without the module
                  is indistinguishable from a failed read (`Q-7`).
                */}
                <p className="text-[13px] text-ink">
                  No sessions are scheduled for {plan.displayLabel} yet.
                </p>
              </Card>
            ) : (
              <ol className="flex list-none flex-col gap-3 p-0">
                {plan.lessons.map((lesson) => (
                  <li key={lesson.sessionId}>
                    <LessonCard lesson={lesson} />
                  </li>
                ))}
              </ol>
            )}
          </section>

          <OmittedPanelsDisclosure />
        </>
      )}
    </div>
  );
}

function ModuleHeader({ plan }: { readonly plan: TrainerLessonPlanDto }) {
  return (
    <Card className="flex flex-col gap-[14px] rounded-[16px] px-5 py-[18px] sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div
          aria-hidden="true"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[13px] text-[16px] font-bold"
          style={{ background: "#FCE7F0", color: "#EC4B96" }}
        >
          {initialsOf(plan.moduleTitle)}
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-[20px] font-bold text-ink-strong">{plan.displayLabel}</p>
          {/*
            ⛔ EACH LINE IS OMITTED WHEN NOT RECORDED (hero `0B`). NULL means
            nobody entered it — a placeholder would assert a fact about the
            module that no one stated.
          */}
          <p className="text-[12px] text-ink">
            {[
              plan.scheduleSummary,
              `${plan.learnerCount} ${plan.learnerCount === 1 ? "learner" : "learners"}`,
            ]
              .filter((part): part is string => part !== null)
              .join(" · ")}
          </p>
        </div>
      </div>
      {plan.termLabel !== null && (
        <p className="shrink-0 text-[13px] font-medium text-ink-strong">{plan.termLabel}</p>
      )}
    </Card>
  );
}

const TIMING: Record<
  LessonPlanEntryDto["timing"],
  { readonly label: string; readonly bg: string; readonly fg: string; readonly dot: string }
> = {
  completed: { label: "Completed", bg: "#E4F3E4", fg: "#67B26F", dot: "#67B26F" },
  this_week: { label: "This week", bg: "#FCE7F0", fg: "#EC4B96", dot: "#EC4B96" },
  upcoming: { label: "Upcoming", bg: "#EEF1F5", fg: "#8A93A6", dot: "#AEB6C4" },
};

/**
 * ⛔ THE LEGEND IS NOT THE ONLY CARRIER, AND THAT IS SC 1.4.1.
 *
 * Each badge states its timing IN WORDS on the card it belongs to; the legend
 * explains the dots but is never the only place the fact appears. ▶ Colour is a
 * third carrier here, never the sole one — the same shape `P2-23` used for the
 * calendar day marks.
 */
function TimingLegend() {
  return (
    <ul className="flex list-none flex-wrap items-center gap-4 p-0">
      {(["completed", "this_week", "upcoming"] as const).map((key) => (
        <li key={key} className="flex items-center gap-1.5 text-[11px] font-medium text-ink">
          <span
            aria-hidden="true"
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: TIMING[key].dot }}
          />
          {TIMING[key].label}
        </li>
      ))}
    </ul>
  );
}

function LessonCard({ lesson }: { readonly lesson: LessonPlanEntryDto }) {
  const timing = TIMING[lesson.timing];
  return (
    <Card className="flex flex-col gap-3 rounded-[16px] px-5 py-[18px]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1.5">
          {/*
            ⛔ THE `LESSON n` PILL IS OMITTED WHEN THE NUMBER IS NOT RECORDED.
            Numbering by array index would manufacture a lesson number the
            module never had, and it would silently renumber every later lesson
            when an earlier session is added.
          */}
          {lesson.lessonNumber !== null && (
            <span
              className="inline-flex w-fit items-center rounded-[8px] px-2 py-1 text-[11px] font-semibold text-white"
              style={{ background: "#EC4B96" }}
            >
              LESSON {lesson.lessonNumber}
            </span>
          )}
          <p className="text-[16px] font-semibold text-ink-strong">
            {lesson.lessonTitle ?? "Untitled lesson"}
          </p>
          <p className="text-[12px] text-ink">
            {[lesson.sessionDate, lesson.room].filter((p): p is string => p !== null).join(" · ")}
          </p>
        </div>
        <span
          className="inline-flex shrink-0 items-center rounded-full px-3 py-1 text-[11px] font-semibold"
          style={{ background: timing.bg, color: timing.fg }}
        >
          {timing.label}
        </span>
      </div>
    </Card>
  );
}

/**
 * ⛔ TWO PANELS THE FRAME DRAWS ARE NOT BUILT, AND THE PAGE SAYS SO.
 *
 * §12.12 — an omission a user can see is disclosed on the surface, not only in
 * a plan file. Both are BLOCKED ON SCHEMA THIS PHASE WAS NOT AUTHORIZED TO ADD,
 * and neither is a design gap:
 *
 *   · **KEY FOCUS POINTS** — ruled in scope 2026-08-17 and blocked on a column.
 *     See the file header for the full ruling and its four constraints.
 *     `PLMa-KEYFOCUS` additionally records that the Operator declined this panel
 *     at `P2-6` because *"`D-4` names no author, no authoring surface exists,
 *     and a read for a field nobody can write is a permanently empty panel"* —
 *     so a column alone would not be enough either.
 *   · **SLIDES & MATERIALS** — `class_session_materials` EXISTS (`P2-6` built
 *     the management upload side) but returns `permission denied for table` for
 *     a trainer and holds 0 rows. It needs a trainer policy and matching grant,
 *     or a read RPC. Measured at HEAD, not assumed.
 *
 * ⚠️ The frame's own empty state for the second panel reads *"Slides not
 * uploaded yet"*. That copy is NOT used here, because it would be false: it
 * says the materials are absent when the truth is that this screen cannot read
 * them. `P2-10`'s rule, one layer along — "not yet" and "cannot see" are
 * different facts and only one of them is true.
 */
function OmittedPanelsDisclosure() {
  return (
    <Card className="p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-subtle">
        Not available yet
      </p>
      <p className="mt-2 text-[13px] text-ink">
        Key focus points and slides &amp; materials are part of this screen&rsquo;s design but are
        not built. Both need governed data this screen cannot read yet, and neither is available
        elsewhere in the portal.
      </p>
    </Card>
  );
}

function initialsOf(title: string): string {
  const words = title.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  return words
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
