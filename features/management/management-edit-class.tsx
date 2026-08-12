"use client";

import { useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FeedbackBanner } from "@/components/ui/feedback-banner";
import { Field, Select, TextInput } from "@/components/ui/field";
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
 * Screen 27 — Management Edit Class (PORTAL COMPLETION PLAN phase `P2-3`).
 *
 * Current Final MVP visual authority is `UI_REFERENCE_FINAL_MVP/reference/Management - Edit Class/`
 * (Amendment 007 A-056). No pack-local `reference.png`, which is not a gap (`CLAUDE.md` §7.4).
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
 *
 * 2. ⛔ **NO UNASSIGN.** The frame's `-` beside the trainer would leave a session with nobody,
 *    which is a different action with no ratified string. Choosing a DIFFERENT trainer is
 *    reassignment and works, through the `P2-2b` RPC.
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
        <PageHeading title="Edit Class" />
        {/*
          ⛔ The frame's breadcrumb reads `Classes / Junior Public Speaking / Edit`. `Junior`
          is a CLASS CODE and `C-14` omits it, so the module title stands alone.
        */}
        <p className="mt-0.5 text-small text-ink">
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

      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        <section className="card flex flex-col gap-5 px-6 py-6">
          <div>
            <h2 className="text-section-title font-extrabold text-ink-strong">Class Details</h2>
            <p className="mt-0.5 text-small text-ink">Basic information about this class.</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
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
        </section>

        <section className="card flex flex-col gap-5 px-6 py-6">
          <div>
            <h2 className="text-section-title font-extrabold text-ink-strong">Schedule</h2>
            <p className="mt-0.5 text-small text-ink">
              Times apply to every session. The dates themselves are shown below and are not
              editable here.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
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

          {/*
            ⛔ THE FRAME'S Sun–Sat DAY STRIP IS ABSENT, NOT DISABLED, AND THAT IS THE POINT.
            Changing which weekdays a class meets DESTROYS sessions, and no cancel or delete
            audit string exists. A greyed chip would read as "not wired yet"; an absent control
            with the dates listed read-only reads as what it is. The reason is stated on the
            surface rather than left as a silent hole.
          */}
          <div>
            <h3 className="text-small font-bold text-ink-strong">
              Sessions ({data.editing.sessions.length})
            </h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {data.editing.sessions.map((session) => (
                <li
                  key={session.classSessionId}
                  className="rounded-field border border-line bg-surface-muted px-3 py-1.5 text-small text-ink-strong"
                >
                  {session.sessionDate}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-small text-ink">
              Adding or removing sessions is not available on this screen. Removing one would
              discard any attendance, observation or report already recorded against it.
            </p>
          </div>
        </section>

        <section className="card flex flex-col gap-5 px-6 py-6">
          <div>
            <h2 className="text-section-title font-extrabold text-ink-strong">Assigned Trainer</h2>
            <p className="mt-0.5 text-small text-ink">
              Choosing a different trainer reassigns every session of this class.
            </p>
          </div>

          <Field id={`${formId}-trainer-search`} label="Search trainer">
            <TextInput
              id={`${formId}-trainer-search`}
              type="search"
              value={trainerQuery}
              autoComplete="off"
              onChange={(event) => setTrainerQuery(event.target.value)}
            />
          </Field>

          <ul aria-label="Trainers" className="flex flex-col gap-2">
            {visibleTrainers.map((trainer) => {
              const selected = trainerId === trainer.trainerMembershipId;
              return (
                <li key={trainer.trainerMembershipId}>
                  {/*
                    ⛔ SELECT ONLY — THERE IS NO DESELECT HERE, unlike screen `26`. On `26`
                    deselecting means "create it unassigned"; here it would mean UNASSIGNING a
                    session that already has a trainer, which is a different governed action
                    with no ratified string.
                  */}
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setTrainerId(trainer.trainerMembershipId)}
                    className={`flex w-full min-h-11 items-center gap-3 rounded-card border px-4 py-3 text-left ${
                      selected
                        ? "border-brand-700 bg-brand-50"
                        : "border-line bg-surface-muted hover:border-brand-700"
                    }`}
                  >
                    <Avatar displayName={trainer.displayName} size="small" />
                    <span className="text-[0.8125rem] font-semibold text-ink-strong">
                      {trainer.displayName}
                    </span>
                    <span className="ms-auto text-small text-ink">
                      {selected ? "Assigned" : "Assign"}
                    </span>
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
        </section>

        <div className="flex flex-wrap justify-end gap-3">
          <Link
            href="/management/classes"
            className="inline-flex min-h-11 items-center rounded-field border border-line bg-surface px-4 py-2.5 text-body font-semibold text-ink-strong hover:border-brand-200 hover:bg-brand-50"
          >
            Cancel
          </Link>
          <Button type="submit" disabled={blocked || submit.kind === "saving"}>
            {submit.kind === "saving" ? "Saving…" : "Save Class"}
          </Button>
        </div>
      </form>
    </div>
  );
}
