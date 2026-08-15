"use client";

import { useEffect, useState } from "react";

import { PageHeading } from "@/components/ui/page-heading";
import { Card } from "@/components/ui/surface";
import { StatePanel } from "@/components/ui/state-panel";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { asFailure, type ResourceState } from "@/features/trainer/resource-state";
import { usePhysicalTestPort } from "@/features/portal/portal-runtime-context";
import type { TrainerMyClassesDto, TrainerClassCardDto } from "@/lib/frontend/contracts/physical-test";

/**
 * Screen `02` — Trainer My Classes. Phase `P2-17`.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ARTEFACTS OPENED (`CLAUDE.md` §7.4.1 — every claim names one)
 * ═══════════════════════════════════════════════════════════════════════════
 *   · `reference/Trainer -  My Classes/….png`   — geometry (⚠️ TWO spaces in
 *     the folder name; the mapping is read from `SCREEN_INDEX.md`, not guessed)
 *   · `reference/Trainer -  My Classes/….html`  — measured values
 *   · `UI_REFERENCE_FINAL_MVP/02-trainer-my-classes/` — `screen.md`
 *
 * MEASURED VALUES, from the `.html` and not from the picture:
 *   card `padding 20/18px`, `radius 16px`, `1px #EDEFF4` outline, `gap 14px` ·
 *   avatar `48×48`, `radius 13px`, `#FCE7F0`/`#EC4B96` and `#DCF2F3`/`#3FBAC2`,
 *   `16px/700` · title `15px/600 #1B2A4A` · `12 students` `11.50px/500
 *   #8A93A6` · schedule line `11.50px/500 #8A93A6` · `Next session:`
 *   `11.50px/500 #EC4B96` · `Lesson plan` `#1B2A4A`, `radius 10px`, `10px`
 *   vertical padding, white `12.50px/600`.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⛔ THE `Lesson plan` BUTTON IS DISABLED-WITH-A-REASON, NOT ABSENT
 * ═══════════════════════════════════════════════════════════════════════════
 * ⚠️ **It is NOT `G-3`'s prohibited "View lesson plan".** Its destination —
 * **screen `03` Trainer Lesson Plan** — is one of the ratified 36 and lands at
 * **`P2-18`**. ▶ That makes it screen `18`'s `Edit` case rather than screen
 * `23`'s: **a destination that exists but is not built yet.** Absent would say
 * *"not a thing"*; disabled says *"not yet"*, and only one of those is true.
 *
 * ⛔ **NO `Assist.` / TA** (`A-014`/`G-7`) — and the frame draws none here
 * either: measured, the `.html` contains `Assist` **0** times.
 *
 * ⚠️ **`Junior` is not a ratified Class Grade.** The frame writes `Junior ·
 * Public Speaking`; the ratified grades are `Beginner` / `Intermediate` /
 * `Advanced` (`A-016`). The grade rendered here is **whatever
 * `class_grades.display_name` holds**, never the frame's literal — same
 * finding as `P2-8`.
 */

export function TrainerMyClassesScreen() {
  const port = usePhysicalTestPort();
  const [termId, setTermId] = useState<string | null>(null);
  const [state, setState] = useState<ResourceState<TrainerMyClassesDto>>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    void port.readTrainerMyClasses(termId).then((result) => {
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
  }, [port, termId]);

  const data = state.kind === "ready" ? state.data : null;

  return (
    <div className="page-grid">
      <div>
        <PageHeading title="My Classes" description="Classes you teach this term" />
      </div>

      {state.kind === "failed" ? (
        <StatePanel result={state.result} homeHref="/trainer/dashboard" homeLabel="Return to Dashboard" />
      ) : null}
      {state.kind === "loading" ? <LoadingSkeleton rows={2} label="Loading your classes" /> : null}

      {data !== null && (
        <>
          {data.terms.length > 0 && (
            <div>
              <label htmlFor="term" className="sr-only">
                Term
              </label>
              <select
                id="term"
                value={data.selectedTermId ?? ""}
                onChange={(event) => setTermId(event.target.value)}
                className="min-h-11 rounded-[11px] border border-line bg-white px-3 text-[13px] font-semibold text-ink-strong"
              >
                {data.terms.map((t) => (
                  <option key={t.termId} value={t.termId}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {data.cards.length === 0 ? (
            <Card className="p-5">
              {/*
                ⛔ AN EMPTY TERM IS A FACT, NOT AN ERROR — and it says which
                term it is empty FOR, because "no classes" without the term is
                indistinguishable from a failed read (`Q-7`).
              */}
              <p className="text-[13px] text-ink">
                You have no assigned classes in{" "}
                {data.terms.find((t) => t.termId === data.selectedTermId)?.label ?? "this term"}.
              </p>
            </Card>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {data.cards.map((card) => (
                <ClassCard key={card.classModuleId} card={card} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/**
 * ⛔ THE TINT IS KEYED BY THE MODULE TITLE, NEVER BY ROW INDEX.
 *
 * ⚠️ `P2-8` shipped exactly that defect — an avatar tinted by index, so a
 * learner changed colour when the filter reordered the table. ▶ The frame tints
 * by SUBJECT (both Public Speaking cards pink, both Speech and Drama teal), and
 * keying off the title reproduces that while staying stable under any ordering
 * or term change. The two measured pairs are `#FCE7F0`/`#EC4B96` and
 * `#DCF2F3`/`#3FBAC2`.
 */
const TINTS = [
  { bg: "#FCE7F0", fg: "#EC4B96" },
  { bg: "#DCF2F3", fg: "#3FBAC2" },
] as const;

function tintFor(title: string): { readonly bg: string; readonly fg: string } {
  let hash = 0;
  for (const ch of title) hash = (hash * 31 + ch.charCodeAt(0)) % 9973;
  return TINTS[hash % TINTS.length];
}

function ClassCard({ card }: { readonly card: TrainerClassCardDto }) {
  const tint = tintFor(card.title);
  return (
    <Card className="flex flex-col gap-[14px] rounded-[16px] px-5 py-[18px]">
      <div className="flex items-center gap-3">
        <div
          aria-hidden="true"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[13px] text-[16px] font-bold"
          style={{ background: tint.bg, color: tint.fg }}
        >
          {card.initials}
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="truncate text-[15px] font-semibold text-ink-strong">{card.displayLabel}</p>
          <p className="text-[11.5px] font-medium text-ink">
            {card.studentCount} {card.studentCount === 1 ? "student" : "students"}
          </p>
        </div>
      </div>

      {/*
        ⛔ EACH LINE IS OMITTED WHEN NOT RECORDED (hero `0B`). NULL means the
        schedule was never set or there is no upcoming session — a placeholder
        would assert a fact about the class that nobody entered.
      */}
      <div className="flex flex-col gap-1.5">
        {card.scheduleSummary !== null && (
          <p className="text-[11.5px] font-medium text-ink">{card.scheduleSummary}</p>
        )}
        {card.nextSessionDate !== null && (
          <p className="text-[11.5px] font-medium text-brand-500">
            Next session: {card.nextSessionDate}
          </p>
        )}
      </div>

      {/*
        ⛔ DISABLED WITH A REASON, NOT ABSENT — screen `03` Trainer Lesson Plan
        is one of the ratified 36 and arrives at `P2-18`. Absent would say
        "not a thing"; only "not yet" is true.
      */}
      <button
        type="button"
        disabled
        title="Lesson plans open with the Trainer Lesson Plan screen, which is not built yet."
        className="mt-auto inline-flex min-h-11 w-full cursor-not-allowed items-center justify-center rounded-[10px] bg-neutral-soft py-2.5 text-[12.5px] font-semibold text-neutral-on"
      >
        Lesson plan
        <span className="sr-only">
          {" "}
          — not available yet; the Trainer Lesson Plan screen is not built.
        </span>
      </button>
    </Card>
  );
}
