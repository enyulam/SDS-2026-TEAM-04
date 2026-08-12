"use client";

import { useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
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
  ClassCreationOutcomeDto,
} from "@/lib/frontend/contracts/physical-test";

/**
 * Screen 26 — Management Add Class (PORTAL COMPLETION PLAN phase `P2-2`).
 *
 * Current Final MVP visual authority is `UI_REFERENCE_FINAL_MVP/reference/Management - Add Class/`
 * (Amendment 007 A-056). This pack carries NO local `reference.png`, and that absence is NOT a
 * missing reference and NOT a reason to re-export from live Figma (`CLAUDE.md` §7.4).
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⛔ WHAT THIS SCREEN CREATES, IN THE GOVERNED VOCABULARY
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * The control is labelled `Add Class`, and the entity it creates is a **Class Module under a
 * selected Class Grade** (`A-016`, `A-047`) — plus one dated **Class Session** per occurrence.
 * ⛔ There is NO `classes` entity between the two and none may be introduced.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⛔ SIX DEPARTURES FROM THE FRAME. FIVE ARE RULED; ONE IS A RECORDED CONTROL-TYPE DIVERGENCE
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 *
 * 1. ⛔ `Assigned Trainer` IS NOT BUILT, AND IT IS A STOP, NOT AN OMISSION-BY-OVERSIGHT.
 *    Assigning a trainer emits `admin.trainer_assigned` — a THIRD audit string. The Operator
 *    authorized this phase on exactly two, `admin.module_created` and `admin.session_created`,
 *    and said: *"If class creation needs anything beyond those two strings and the existing
 *    tables, state it and stop."* ▶ It does, so it is STATED AND STOPPED. The migration
 *    carries assertion `C-8`, which FAILS THE BUILD if either RPC ever reaches
 *    `class_session_assignments`, so the stop is structural rather than a comment.
 *    ⚠️ A session created without an assignment is a REAL GOVERNED STATE — `staff-projections.ts`
 *    already documents it and `12` already renders a module with no trainer name.
 *
 * 2. ⛔ THE `.md`'s `Trainer Assistant (TA)` SLOT IS PROHIBITED — `A-014` defers the TA
 *    persona and `G-7` binds `centre_membership_role` against extension. `REGISTERED-OMISSION`,
 *    and IT NEVER ENDS: not waiting on data, a design or a phase.
 *
 * 3. ⛔ `Class code` AND `Capacity` ARE OMITTED BY `C-14`. No column exists and none is
 *    proposed. Rendering either as a disabled input would advertise a field the product does
 *    not have.
 *
 * 4. ⛔ `Program` IS NOT BUILT. "Programme" has NO ENTITY (`C-14`), and creating one would be
 *    exactly the hidden `classes` entity `A-016` forbids. ▶ The class's name IS the Class
 *    Module title — which is why the frame's `Class name` and `Program` both read
 *    `Public Speaking` in the same render.
 *
 * 5. ⛔ THE FRAME'S `Level` READS `Intermediate` AND ITS `Class code` READS `Junior`.
 *    `Junior` is NOT a Class Grade (`A-016` fixes three: Beginner / Intermediate / Advanced)
 *    and `A-054` prohibits treating it as a synonym for one. The Level options below are READ
 *    FROM `class_grades`, so a fourth value cannot appear here even by editing this file.
 *
 * 6. ⚠️ `Room`, `Start time` AND `End time` ARE DRAWN AS DROPDOWNS AND ARE BUILT AS FREE
 *    INPUTS. RECORDED DIVERGENCE, NOT DRIFT. The frame is a static render: it shows one value
 *    in each and enumerates no options, and no ruling, table or seed establishes a room
 *    inventory or a time-slot vocabulary anywhere. ▶ A `<select>` would require INVENTING one,
 *    which is schema-by-inference-from-a-frame (`A-022`). A text input and two time inputs
 *    preserve the field and invent nothing. ⚠️ `Term` and `Level` ARE selects, because both
 *    are backed by real rows.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⚠️ THE DAY STRIP IS A GENERATOR, NOT A STORED SCHEDULE (`C-14`)
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * Choosing Tue and Thu expands across the selected term into one dated Class Session per
 * occurrence — each its own governed transaction with its own audit event. ⛔ NO RECURRENCE
 * RULE IS STORED, and no duplicated calendar or event record is created (`A-047`): the
 * management and trainer calendars are PROJECTIONS of these session rows.
 *
 * ⚠️ WITHOUT A TERM THERE IS NOTHING TO EXPAND ACROSS, so the class is created with no
 * sessions. That is a legitimate state, not an error, and the form says so before submit
 * rather than after.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⛔ NOTHING HERE IS AN ASSESSMENT FACT
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * No rating (`C-9`), no roll-up or Overall Grade (`G-2`), no observation, attendance value,
 * evidence reference, trainer note or report status. There is no field one could arrive in —
 * the create RPCs carry assertion `C-9`, which fails the build if either ever mentions a
 * report, a rating or an observation.
 */

/** Sun-first, matching the frame's own strip order. */
const WEEKDAYS: readonly { readonly index: number; readonly short: string; readonly full: string }[] = [
  { index: 0, short: "Sun", full: "Sunday" },
  { index: 1, short: "Mon", full: "Monday" },
  { index: 2, short: "Tue", full: "Tuesday" },
  { index: 3, short: "Wed", full: "Wednesday" },
  { index: 4, short: "Thu", full: "Thursday" },
  { index: 5, short: "Fri", full: "Friday" },
  { index: 6, short: "Sat", full: "Saturday" },
];

type SubmitState =
  | { readonly kind: "idle" }
  | { readonly kind: "saving" }
  | { readonly kind: "created"; readonly data: ClassCreationOutcomeDto }
  | { readonly kind: "refused"; readonly result: FailureResult };

export function ManagementAddClass() {
  const port = usePhysicalTestPort();
  const formId = useId();
  const [state, setState] = useState<ResourceState<AddClassOptionsDto>>({ kind: "loading" });
  const [submit, setSubmit] = useState<SubmitState>({ kind: "idle" });

  const [title, setTitle] = useState("");
  const [gradeId, setGradeId] = useState("");
  const [termId, setTermId] = useState("");
  const [room, setRoom] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [days, setDays] = useState<readonly number[]>([]);

  useEffect(() => {
    let active = true;
    void port.readAddClassOptions().then((result) => {
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
  }, [port]);

  const options = state.kind === "ready" ? state.data : null;
  const term = useMemo(
    () => options?.terms.find((item) => item.termId === termId) ?? null,
    [options, termId],
  );

  /*
   * ⚠️ THE OCCURRENCE COUNT IS SHOWN BEFORE SUBMIT, and it is computed the same way the server
   * computes it. This form can create dozens of governed session records in one click, each
   * with its own permanent audit event — so the number of records about to be created is not
   * a detail to discover afterwards.
   *
   * ⛔ IT IS A PREVIEW, NOT AN AUTHORITY. The server re-reads the term's own range from the
   * database and never takes a date range from this form.
   */
  const occurrences = useMemo(() => {
    if (!term || days.length === 0) return 0;
    const wanted = new Set(days);
    let count = 0;
    const cursor = new Date(`${term.startsOn}T00:00:00Z`);
    const end = new Date(`${term.endsOn}T00:00:00Z`);
    if (Number.isNaN(cursor.getTime()) || Number.isNaN(end.getTime())) return 0;
    while (cursor.getTime() <= end.getTime()) {
      if (wanted.has(cursor.getUTCDay())) count += 1;
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    return count;
  }, [term, days]);

  if (state.kind === "loading") {
    return <LoadingSkeleton label="Loading class options" rows={4} />;
  }
  if (state.kind === "failed") {
    return (
      <StatePanel
        result={state.result}
        homeHref="/management/classes"
        homeLabel="Return to Classes"
      />
    );
  }
  if (!options) return null;

  const timesInverted =
    startTime !== "" && endTime !== "" && endTime <= startTime;
  // ⚠️ A UX CONVENIENCE ONLY. The RPC independently re-checks the title and the
  // time order and refuses on its own account (ADR-3).
  const blocked = title.trim() === "" || gradeId === "" || timesInverted;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (blocked || submit.kind === "saving") return;
    setSubmit({ kind: "saving" });
    const result = await port.createManagementClass({
      classGradeId: gradeId,
      title,
      termId: termId === "" ? null : termId,
      room: room.trim() === "" ? null : room,
      startTime: startTime === "" ? null : startTime,
      endTime: endTime === "" ? null : endTime,
      weekdays: days,
    });
    setSubmit(
      result.outcome === "success"
        ? { kind: "created", data: result.data }
        : { kind: "refused", result: asFailure(result) },
    );
  }

  if (submit.kind === "created") {
    return (
      <ClassCreated
        outcome={submit.data}
        title={title.trim()}
        onAddAnother={() => {
          setSubmit({ kind: "idle" });
          setTitle("");
          setDays([]);
        }}
      />
    );
  }

  return (
    <div className="page-grid">
      <div>
        <PageHeading title="Add Class" />
        <p className="mt-0.5 text-small text-ink">
          <Link href="/management/classes" className="underline hover:text-brand-700">
            Classes
          </Link>{" "}
          / Add Class
        </p>
      </div>

      {submit.kind === "refused" && (
        <StatePanel
          result={submit.result}
          homeHref="/management/classes"
          homeLabel="Return to Classes"
        />
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        <section className="card flex flex-col gap-5 px-6 py-6">
          <div>
            <h2 className="text-section-title font-extrabold text-ink-strong">Class Details</h2>
            <p className="mt-0.5 text-small text-ink">Basic information about this class.</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id={`${formId}-title`}
              label="Class name"
              required
              hint="This is the Class Module's name."
            >
              <TextInput
                id={`${formId}-title`}
                value={title}
                maxLength={120}
                autoComplete="off"
                onChange={(event) => setTitle(event.target.value)}
              />
            </Field>

            {/*
              ⛔ The Level options are the three ratified Class Grades, read from the database.
              The frame's `Junior` is not among them and is not a synonym for one (`A-054`).
            */}
            <Field id={`${formId}-grade`} label="Level" required>
              <Select
                id={`${formId}-grade`}
                value={gradeId}
                onChange={(event) => setGradeId(event.target.value)}
              >
                <option value="">Choose a Class Grade</option>
                {options.grades.map((grade) => (
                  <option key={grade.classGradeId} value={grade.classGradeId}>
                    {grade.displayName}
                  </option>
                ))}
              </Select>
            </Field>

            {/*
              ⚠️ A FREE TEXT INPUT, and the frame draws a dropdown. No room inventory exists in
              any table, seed or ruling, so a select would have to invent one.
            */}
            <Field
              id={`${formId}-room`}
              label="Room"
              hint="Optional. Left empty, no room is recorded for these sessions."
            >
              <TextInput
                id={`${formId}-room`}
                value={room}
                maxLength={80}
                autoComplete="off"
                onChange={(event) => setRoom(event.target.value)}
              />
            </Field>

            <Field
              id={`${formId}-term`}
              label="Term"
              hint="The term the sessions are scheduled across."
            >
              <Select
                id={`${formId}-term`}
                value={termId}
                onChange={(event) => setTermId(event.target.value)}
              >
                <option value="">No term</option>
                {options.terms.map((item) => (
                  <option key={item.termId} value={item.termId}>
                    {item.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </section>

        <section className="card flex flex-col gap-5 px-6 py-6">
          <div>
            <h2 className="text-section-title font-extrabold text-ink-strong">Schedule</h2>
            <p className="mt-0.5 text-small text-ink">Which days and times this class meets.</p>
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-small font-bold text-ink-strong">Days</legend>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((day) => {
                const selected = days.includes(day.index);
                return (
                  <button
                    key={day.index}
                    type="button"
                    aria-pressed={selected}
                    onClick={() =>
                      setDays((current) =>
                        current.includes(day.index)
                          ? current.filter((value) => value !== day.index)
                          : [...current, day.index].sort((a, b) => a - b),
                      )
                    }
                    className={`inline-flex min-h-11 min-w-[3.75rem] items-center justify-center rounded-field border px-3 py-2 text-small font-semibold ${
                      selected
                        ? "border-brand-700 bg-brand-700 text-white"
                        : "border-line bg-surface-muted text-ink-subtle hover:border-brand-700 hover:text-ink-strong"
                    }`}
                  >
                    {day.short}
                    <span className="sr-only">{day.full}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="grid gap-5 sm:grid-cols-2">
            {/*
              ⚠️ Native time inputs, where the frame draws dropdowns. Same reason as Room: no
              slot vocabulary exists to enumerate, and inventing one would be a fabricated rule
              about when this academy teaches.
            */}
            <Field id={`${formId}-start`} label="Start time" hint="Optional.">
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
              hint="Optional."
              error={timesInverted ? "The end time must be after the start time." : undefined}
            >
              <TextInput
                id={`${formId}-end`}
                type="time"
                value={endTime}
                invalid={timesInverted}
                aria-describedby={timesInverted ? `${formId}-end-error` : undefined}
                onChange={(event) => setEndTime(event.target.value)}
              />
            </Field>
          </div>

          {/*
            ⚠️ THE COUNT IS SHOWN BEFORE THE CLICK, NOT AFTER. Each occurrence is a separate
            governed record with its own permanent audit event.
          */}
          <p className="rounded-card bg-surface-muted px-4 py-3 text-small text-ink" role="status">
            {occurrences > 0 ? (
              <>
                <span className="font-bold text-ink-strong">
                  {occurrences} class {occurrences === 1 ? "session" : "sessions"}
                </span>{" "}
                will be created across {term?.label}. Each one is a separate record.
              </>
            ) : days.length > 0 && !term ? (
              <>Choose a term to schedule these days into. Without one, the class is created with no sessions yet.</>
            ) : (
              <>No days selected. The class is created with no sessions yet — you can add them later.</>
            )}
          </p>
        </section>

        {/*
          ⛔ THE FRAME'S `Assigned Trainer` SECTION IS ABSENT, AND ITS ABSENCE IS EXPECTED.
          It is named on the surface rather than left as a silent hole, because a management
          user who remembers the design needs to know the class really was created and really
          has no trainer yet — not wonder whether the form lost their input.
        */}
        <FeedbackBanner title="Trainer assignment is not part of this step" tone="info">
          A class created here has no trainer assigned yet. Assigning one is a separate governed
          action and is not available on this screen.
        </FeedbackBanner>

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

/**
 * The success surface.
 *
 * ⚠️ IT REPORTS WHAT ACTUALLY COMMITTED, INCLUDING A PARTIAL RESULT. One call creates one
 * dated session, so a class whose eleventh session refused still really has ten. Rendering
 * that as a flat "created" would overstate it; rendering it as a failure would deny ten
 * committed governed records.
 */
function ClassCreated({
  outcome,
  title,
  onAddAnother,
}: {
  readonly outcome: ClassCreationOutcomeDto;
  readonly title: string;
  readonly onAddAnother: () => void;
}) {
  const partial = outcome.sessionsCreated < outcome.sessionsRequested;
  return (
    <div className="page-grid">
      <PageHeading title="Add Class" />
      <FeedbackBanner
        title={partial ? "Class created, with some sessions outstanding" : "Class created"}
        tone={partial ? "warning" : "success"}
      >
        <p>
          <span className="font-semibold">{title}</span> was created
          {outcome.sessionsRequested === 0
            ? " with no sessions scheduled yet."
            : ` with ${outcome.sessionsCreated} of ${outcome.sessionsRequested} class ${
                outcome.sessionsRequested === 1 ? "session" : "sessions"
              }.`}
        </p>
        {partial && (
          <p className="mt-1">
            The sessions that were created are saved. Add the remaining dates again from this
            screen.
          </p>
        )}
        <p className="mt-1">No trainer is assigned to these sessions yet.</p>
      </FeedbackBanner>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/management/classes"
          className="inline-flex min-h-11 items-center rounded-field bg-brand-700 px-4 py-2.5 text-body font-semibold text-white hover:bg-brand-800"
        >
          Back to Classes
        </Link>
        <Button type="button" variant="secondary" onClick={onAddAnother}>
          Add another class
        </Button>
      </div>
    </div>
  );
}
