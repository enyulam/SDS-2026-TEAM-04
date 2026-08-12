"use client";

import { useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { BackLink } from "@/components/ui/back-link";
import { FeedbackBanner } from "@/components/ui/feedback-banner";
import { Field, SearchInput, Select, TextInput } from "@/components/ui/field";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { PageHeading } from "@/components/ui/page-heading";
import { StatePanel } from "@/components/ui/state-panel";
import { asFailure, type FailureResult, type ResourceState } from "@/features/trainer/resource-state";
import { usePhysicalTestPort } from "@/features/portal/portal-runtime-context";
import type {
  AddClassOptionsDto,
  ClassEditDto,
  ClassUpdateOutcomeDto,
} from "@/lib/frontend/contracts/physical-test";

/**
 * Screen 27 — Management Edit Class (`P2-3`; REBUILT 2026-08-13 under Operator AUTHORIZATION A).
 *
 * Current Final MVP visual authority is `UI_REFERENCE_FINAL_MVP/reference/Management - Edit Class/`
 * (Amendment 007 A-056). No pack-local `reference.png`, which is not a gap (`CLAUDE.md` §7.4).
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⛔ WHY IT WAS REBUILT, AND WHAT THE `.png` ACTUALLY DRAWS
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * The first build derived its layout from the pack's PROSE NOTE; the `.png` and `.html` were
 * never opened (`CLAUDE.md` §7.4.1, plan §12). ▶ It drew THREE cards with the actions floating
 * below them. **This frame is layout-identical to screen `26`**: ONE card at
 * `padding: 24px 26px`, `border-radius: 18px`, `gap: 20px`, three sections divided by 1px
 * hairlines, and `Cancel` / `Save Class` INSIDE the card below a final hairline. Only the
 * title and breadcrumb differ (`Edit Class` · `Classes / Junior Public Speaking / Edit`).
 *
 * ⚠️ MEASURING THE FRAME CHANGED NOTHING ABOUT THE THREE REFUSALS BELOW — it changed where the
 * surviving controls SIT. Each refusal was, and remains, a fact about the audit registry.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⛔ `27` CAN CHANGE A CLASS. IT CANNOT DESTROY ONE — AND THAT IS THE AUDIT REGISTRY'S SHAPE,
 * ⛔ NOT A UI DECISION
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * The Operator ratified exactly two new audit strings for this phase — `admin.module_updated`
 * and `admin.session_updated`, registry 19 → 21 — with the count stated in advance. Three
 * neighbouring actions were deliberately NOT ratified, and each absence removes a control:
 *
 * 1. ⛔ **THE DAY STRIP IS NOT BUILT ON THIS SCREEN.** Changing which weekdays a class meets
 *    means REMOVING sessions, and there is **no cancel or delete string**. A session may
 *    already carry attendance, an observation or a submitted report, so destroying one is a
 *    governed act that must be recorded — and nothing can record it yet.
 *    ▶ **ABSENT rather than PRESENT-AND-DISABLED**, deliberately: a greyed day chip on an Edit
 *    form reads as *"not wired yet"*, and this is *"not permitted"*. The two must not look
 *    alike. The dates that exist are shown read-only instead, so the schedule is still legible.
 *    ⚠️ **MEASURED AT THE REBUILD: the `.png` DOES draw the strip, Tue and Thu active.** Its
 *    absence here is therefore a real divergence from the frame and is `EXPECTED / REQUIRED`,
 *    never a visual regression — the previous record asserted this from the note, which cannot
 *    support a claim about what a frame draws either way.
 *
 * 2. ⛔ **NO UNASSIGN.** The frame's `-` beside the trainer would leave a session with nobody,
 *    which is a different action with no ratified string. Choosing a DIFFERENT trainer is
 *    reassignment and works, through the `P2-2b` RPC. ⚠️ Measured at the rebuild: the `.png`
 *    DOES draw that trailing control, so its absence is a real divergence, `EXPECTED /
 *    REQUIRED`. ▶ Screen `26` builds the same glyph as `Remove` because there it clears a FORM
 *    CHOICE before anything is saved; here it would clear a PERSISTED assignment. Same glyph,
 *    different act — which is exactly why one is built and the other is absent.
 *
 * 4. ⛔ **NO TRAINER-ROW SUBTITLE.** The frame's `Public Speaking · Employee T-1001` is
 *    programme (`C-14`: no entity) plus the employee ID (Authorization B). Both halves are
 *    ruled out, so hero 0B omits the element; `TrainerChoiceDto` carries no field for it.
 *
 * 3. ⛔ **NO `Class code`, `Capacity` OR `Program`** — `C-14` omits all three, and "programme"
 *    has no entity (`A-016` forbids a hidden `classes` entity between Class Grade and Class
 *    Module).
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⚠️ OTHER RECORDED DIVERGENCES
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * - The frame's breadcrumb reads `Classes / Junior Public Speaking / Edit`. **`Junior` is a
 *   CLASS CODE**, which `C-14` omits, so the breadcrumb carries the Class Module title alone.
 * - `Room`, `Start time` and `End time` are drawn as dropdowns and built as free inputs, for
 *   the reason recorded on screen `26`: the frame enumerates no options, and no ruling, table
 *   or seed establishes a room inventory or a slot vocabulary. A `<select>` would invent one
 *   (`A-022`). `Term` and `Level` ARE selects — both are backed by real rows.
 * - **Room, times and term apply across EVERY session of the module.** Each session keeps its
 *   own DATE: rewriting them all to one date would collapse a term into a single day.
 *
 * ⛔ Nothing here is an assessment fact. No rating (`C-9`), no roll-up (`G-2`), no observation,
 * attendance value, evidence reference, trainer note or report status — the update RPCs carry
 * assertion `U-6`, which fails the build if either ever mentions one.
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

type SubmitState =
  | { readonly kind: "idle" }
  | { readonly kind: "saving" }
  | { readonly kind: "saved"; readonly data: ClassUpdateOutcomeDto }
  | { readonly kind: "refused"; readonly result: FailureResult };

type Loaded = { readonly editing: ClassEditDto; readonly options: AddClassOptionsDto };

export function ManagementEditClass({ classModuleId }: { readonly classModuleId: string }) {
  const port = usePhysicalTestPort();
  const formId = useId();
  const [state, setState] = useState<ResourceState<Loaded>>({ kind: "loading" });
  const [submit, setSubmit] = useState<SubmitState>({ kind: "idle" });

  const [title, setTitle] = useState("");
  const [gradeId, setGradeId] = useState("");
  const [termId, setTermId] = useState("");
  const [room, setRoom] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [trainerId, setTrainerId] = useState("");
  const [trainerQuery, setTrainerQuery] = useState("");

  useEffect(() => {
    let active = true;
    void Promise.all([port.readClassForEdit(classModuleId), port.readAddClassOptions()]).then(
      ([editing, options]) => {
        if (!active) return;
        if (editing.outcome !== "success") {
          setState({ kind: "failed", result: asFailure(editing) });
          return;
        }
        if (options.outcome !== "success") {
          setState({ kind: "failed", result: asFailure(options) });
          return;
        }
        /*
         * ⚠️ THE FORM IS SEEDED FROM THE FIRST SESSION'S SHARED PROPERTIES, and
         * only where every session agrees. A module whose sessions differ shows
         * the fields EMPTY rather than proposing one session's value for all —
         * otherwise saving would silently flatten an arrangement the form never
         * displayed.
         */
        const sessions = editing.data.sessions;
        const shared = <T,>(pick: (s: (typeof sessions)[number]) => T): T | null => {
          if (sessions.length === 0) return null;
          const first = pick(sessions[0]);
          return sessions.every((s) => pick(s) === first) ? first : null;
        };
        setTitle(editing.data.title);
        setGradeId(editing.data.classGradeId);
        setTermId(shared((s) => s.termId) ?? "");
        setRoom(shared((s) => s.room) ?? "");
        setStartTime(shared((s) => s.startTime) ?? "");
        setEndTime(shared((s) => s.endTime) ?? "");
        setTrainerId(editing.data.trainerMembershipId ?? "");
        setState({ kind: "ready", data: { editing: editing.data, options: options.data } });
      },
    );
    return () => {
      active = false;
    };
  }, [port, classModuleId]);

  const data = state.kind === "ready" ? state.data : null;

  const visibleTrainers = useMemo(() => {
    const needle = trainerQuery.trim().toLowerCase();
    const all = data?.options.trainers ?? [];
    return needle === ""
      ? all
      : all.filter((trainer) => trainer.displayName.toLowerCase().includes(needle));
  }, [data, trainerQuery]);

  if (state.kind === "loading") return <LoadingSkeleton label="Loading class" rows={4} />;
  if (state.kind === "failed") {
    return (
      <StatePanel
        result={state.result}
        homeHref="/management/classes"
        homeLabel="Return to Classes"
      />
    );
  }
  if (!data) return null;

  const timesInverted = startTime !== "" && endTime !== "" && endTime <= startTime;
  const blocked = title.trim() === "" || gradeId === "" || timesInverted;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (blocked || submit.kind === "saving") return;
    setSubmit({ kind: "saving" });
    const result = await port.updateManagementClass({
      classModuleId,
      classGradeId: gradeId,
      title,
      termId: termId === "" ? null : termId,
      room: room.trim() === "" ? null : room,
      startTime: startTime === "" ? null : startTime,
      endTime: endTime === "" ? null : endTime,
      trainerMembershipId: trainerId === "" ? null : trainerId,
    });
    setSubmit(
      result.outcome === "success"
        ? { kind: "saved", data: result.data }
        : { kind: "refused", result: asFailure(result) },
    );
  }

  return (
    <div className="page-grid">
      <div>
        {/*
          ⚠️ THE BACK TARGET IS SCREEN `13`, NOT `12` — Operator ruling. `27` is entered from
          the class it edits, and returning to the class list would drop the reader a level
          further out than they came from. ⛔ `13` is also the ONLY inbound route to `27`.
        */}
        <PageHeading
          title="Edit Class"
          actions={
            <BackLink href={`/management/classes/${classModuleId}`} label="Class Overview" />
          }
        />
        {/*
          ⛔ The frame's breadcrumb reads `Classes / Junior Public Speaking / Edit`. `Junior`
          is a CLASS CODE and `C-14` omits it, so the module title stands alone.
          ⚠️ It stays BELOW the title, as this frame draws it (`12.50px`), and the back link
          does not replace it.
        */}
        <p className="mt-0.5 text-[12.5px] text-ink-muted">
          <Link href="/management/classes" className="underline hover:text-brand-700">
            Classes
          </Link>{" "}
          / {data.editing.title} / Edit
        </p>
      </div>

      {submit.kind === "refused" && (
        <StatePanel
          result={submit.result}
          homeHref="/management/classes"
          homeLabel="Return to Classes"
        />
      )}

      {submit.kind === "saved" && (
        <FeedbackBanner
          title={submit.data.reason === "unchanged" ? "Nothing to save" : "Class updated"}
          tone={submit.data.reason === "unchanged" ? "info" : "success"}
        >
          {/*
            ⚠️ `unchanged` IS REPORTED AS ITSELF. Claiming "saved" over a no-op would tell
            management an edit was recorded when the audit trail deliberately holds nothing —
            a governed no-op emits no event (`A-029`).
          */}
          {submit.data.reason === "unchanged" ? (
            <p>No field changed, so nothing was recorded.</p>
          ) : (
            <p>
              {submit.data.moduleChanged ? "The class details were updated. " : ""}
              {submit.data.sessionsChanged > 0
                ? `${submit.data.sessionsChanged} of ${submit.data.sessionsTotal} sessions were updated. `
                : ""}
              {submit.data.trainerChanged ? "The trainer was reassigned." : ""}
            </p>
          )}
        </FeedbackBanner>
      )}

      {/*
        ⛔ ONE CARD, NOT THREE — the frame's `padding: 24px 26px`, `border-radius: 18px`,
        `gap: 20px`, with its own 1px hairlines and the actions INSIDE it.
      */}
      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-[20px] rounded-[18px] border border-line bg-surface px-[26px] py-6 shadow-[var(--shadow-card)]"
      >
        <SectionHeading title="Class Details" subtitle="Basic information about this class" />

        {/* ⛔ `Class code`, `Program` and `Capacity` are omitted by `C-14`; the rest close up. */}
        <div className="grid gap-[16px] sm:grid-cols-2">
          <Field id={`${formId}-title`} label="Class name" required>
            <TextInput
              id={`${formId}-title`}
              value={title}
              maxLength={120}
              autoComplete="off"
              onChange={(event) => setTitle(event.target.value)}
            />
          </Field>

          <Field id={`${formId}-grade`} label="Level" required>
            <Select
              id={`${formId}-grade`}
              value={gradeId}
              onChange={(event) => setGradeId(event.target.value)}
            >
              {data.options.grades.map((grade) => (
                <option key={grade.classGradeId} value={grade.classGradeId}>
                  {grade.displayName}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            id={`${formId}-room`}
            label="Room"
            hint="Applies to every session of this class."
          >
            <TextInput
              id={`${formId}-room`}
              value={room}
              maxLength={80}
              autoComplete="off"
              onChange={(event) => setRoom(event.target.value)}
            />
          </Field>

          <Field id={`${formId}-term`} label="Term" hint="Applies to every session.">
            <Select
              id={`${formId}-term`}
              value={termId}
              onChange={(event) => setTermId(event.target.value)}
            >
              <option value="">No term</option>
              {data.options.terms.map((term) => (
                <option key={term.termId} value={term.termId}>
                  {term.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Hairline />

        <SectionHeading
          title="Schedule"
          subtitle="Times apply to every session. The dates themselves are not editable here."
        />

        {/*
          ⛔ THE FRAME'S Sun–Sat DAY STRIP IS ABSENT, NOT DISABLED, AND THAT IS THE POINT.
          Measured at the rebuild: the `.png` DOES draw it, with Tue and Thu active. Changing
          which weekdays a class meets DESTROYS sessions, and no cancel or delete audit string
          exists. A greyed chip would read as "not wired yet"; this is "not permitted", and the
          two must not look alike. ▶ The dates that exist are listed read-only in its place, so
          the schedule stays legible, and the reason is stated on the surface.
        */}
        <div className="flex flex-col gap-2">
          <h3 className="text-[12px] font-semibold text-ink-strong">
            Sessions ({data.editing.sessions.length})
          </h3>
          <ul className="flex flex-wrap gap-2">
            {data.editing.sessions.map((session) => (
              <li
                key={session.classSessionId}
                className="rounded-[10px] border border-line bg-surface-muted px-[15px] py-2 text-[12.5px] font-semibold text-ink-muted"
              >
                {session.sessionDate}
              </li>
            ))}
          </ul>
          <p className="text-[11.5px] text-ink-muted">
            Adding or removing sessions is not available on this screen. Removing one would
            discard any attendance, observation or report already recorded against it.
          </p>
        </div>

        <div className="grid gap-[16px] sm:grid-cols-2">
          {/*
            ⚠️ Native time inputs where the frame draws dropdowns — the screen `26` reason: no
            slot vocabulary exists to enumerate, and inventing one would be a fabricated rule
            about when this academy teaches (`A-022`).
          */}
          <Field id={`${formId}-start`} label="Start time">
            <TextInput
              id={`${formId}-start`}
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
            />
          </Field>
          <Field
            id={`${formId}-end`}
            label="End time"
            error={timesInverted ? "The end time must be after the start time." : undefined}
          >
            <TextInput
              id={`${formId}-end`}
              type="time"
              value={endTime}
              invalid={timesInverted}
              onChange={(event) => setEndTime(event.target.value)}
            />
          </Field>
        </div>

        <Hairline />

        <SectionHeading title="Assigned Trainer" />

        <div className="flex flex-col gap-[7px]">
          <label
            htmlFor={`${formId}-trainer-search`}
            className="text-[12px] font-semibold text-ink-strong"
          >
            Search Trainer
          </label>
          <SearchInput
            id={`${formId}-trainer-search`}
            className="max-w-[230px]"
            value={trainerQuery}
            autoComplete="off"
            onChange={(event) => setTrainerQuery(event.target.value)}
          />
        </div>

        <ul aria-label="Trainers" className="flex flex-col gap-2">
          {visibleTrainers.map((trainer) => {
            const selected = trainerId === trainer.trainerMembershipId;
            return (
              <li
                key={trainer.trainerMembershipId}
                className={`flex items-center gap-[13px] rounded-[12px] border px-[14px] py-3 ${
                  selected ? "border-brand-700 bg-brand-50" : "border-transparent bg-surface-muted"
                }`}
              >
                <Avatar displayName={trainer.displayName} size="medium" />
                {/*
                  ⛔ NO SUBTITLE — the frame's `Public Speaking · Employee T-1001` is programme
                  (`C-14`: no entity) plus the employee ID (Authorization B). Both are ruled
                  out, so hero 0B omits the element instead of inventing a filler.
                */}
                <span className="flex-1 truncate text-[13.5px] font-semibold text-ink-strong">
                  {trainer.displayName}
                </span>
                {/*
                  ⛔ ASSIGN ONLY — THERE IS NO DESELECT HERE, unlike screen `26`, and the
                  frame's trailing `-` is ABSENT for the same reason. On `26` deselecting means
                  "create it unassigned"; here it would UNASSIGN a session that already has a
                  trainer, which is a different governed action with no ratified string.
                */}
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setTrainerId(trainer.trainerMembershipId)}
                  className="inline-flex min-h-11 items-center rounded-[10px] border-[1.3px] border-line bg-surface px-[14px] py-2 text-[12.5px] font-semibold text-ink-muted hover:border-brand-700 hover:text-ink-strong"
                >
                  {selected ? "Assigned" : "Assign"}
                  <span className="sr-only"> {trainer.displayName}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <p className="text-small text-ink" role="status">
          {trainerId === ""
            ? "No single trainer covers every session of this class. Choosing one assigns all of them."
            : "Removing a trainer entirely is not available on this screen."}
        </p>

        <Hairline />

        {/* The frame's footer: right-aligned, both buttons at `border-radius: 11px`. */}
        <div className="flex flex-wrap justify-end gap-3">
          <Link
            href="/management/classes"
            className="inline-flex min-h-11 items-center rounded-[11px] border-[1.3px] border-line bg-surface px-[22px] py-3 text-[13.5px] font-semibold text-ink-muted hover:border-brand-700 hover:text-ink-strong"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={blocked || submit.kind === "saving"}
            className="inline-flex min-h-11 items-center gap-2 rounded-[11px] bg-brand-700 px-[24px] py-3 text-[13.5px] font-semibold text-white hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span aria-hidden="true">✓</span>
            {submit.kind === "saving" ? "Saving…" : "Save Class"}
          </button>
        </div>
      </form>
    </div>
  );
}

/** The frame's section heading: `15px` semibold over a `12px` subtitle, `gap: 3px`. */
function SectionHeading({
  title,
  subtitle,
}: {
  readonly title: string;
  readonly subtitle?: string;
}) {
  return (
    <div className="flex flex-col gap-[3px]">
      <h2 className="text-[15px] font-semibold text-ink-strong">{title}</h2>
      {subtitle && <p className="text-[12px] text-ink-muted">{subtitle}</p>}
    </div>
  );
}

/** The frame's `height: 1px` section divider inside the one card. */
function Hairline() {
  return <div className="h-px bg-line" />;
}
