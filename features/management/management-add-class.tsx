"use client";

import { useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { BackLink } from "@/components/ui/back-link";
import { Button } from "@/components/ui/button";
import { FeedbackBanner } from "@/components/ui/feedback-banner";
import { Field, SearchInput, Select, TextInput } from "@/components/ui/field";
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
 * Screen 26 — Management Add Class (`P2-2`; REBUILT 2026-08-13 under Operator AUTHORIZATION A).
 *
 * Current Final MVP visual authority is `UI_REFERENCE_FINAL_MVP/reference/Management - Add Class/`
 * (Amendment 007 A-056). This pack carries NO local `reference.png`, and that absence is NOT a
 * missing reference and NOT a reason to re-export from live Figma (`CLAUDE.md` §7.4).
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⛔ WHY IT WAS REBUILT, AND WHAT THE `.png` ACTUALLY DRAWS
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * The first build derived its layout from the pack's PROSE NOTE; the `.png` and `.html` were
 * never opened (`CLAUDE.md` §7.4.1, plan §12). ▶ It drew THREE separate cards with the actions
 * floating below them. The frame draws **ONE card** — `padding: 24px 26px`,
 * `border-radius: 18px`, `gap: 20px` — with its three sections separated by **1px hairlines**,
 * and **`Cancel` / `Save Class` INSIDE that card**, right-aligned below a final hairline.
 *
 * Row structure, measured: `Class name | Class code` · `Program | Level | Capacity` ·
 * `Room | Term` · the day strip inline · `Start time | End time` · the search box · the
 * selected-trainer row. Fields sit in a `16px` row gap with a `7px` label-to-control gap.
 *
 * ⚠️ EVERY GEOMETRIC VALUE HERE IS CITED FROM `Management - Add Class.html` and verified by
 * `prove:artefact-read`, which fails if a cited value is absent from that file or unused here.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⛔ WHAT THIS SCREEN CREATES, IN THE GOVERNED VOCABULARY
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * The control is labelled `Add Class`, and the entity it creates is a **Class Module under a
 * selected Class Grade** (`A-016`, `A-047`) — plus one dated **Class Session** per occurrence.
 * ⛔ There is NO `classes` entity between the two and none may be introduced.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⛔ SIX NOTES ON THE FRAME. FOUR ARE RULED OMISSIONS; ONE IS NOW BUILT; ONE IS A RECORDED
 * ⛔ CONTROL-TYPE DIVERGENCE
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 *
 * 1. ✅ `Assigned Trainer` IS BUILT (`P2-2b`). ~~IT IS A STOP, NOT AN OMISSION-BY-OVERSIGHT…
 *    a THIRD audit string…~~ ⚠️ **STRUCK, AND THE CORRECTION IS RECORDED RATHER THAN TIDIED
 *    AWAY.** The Operator required the registry be CHECKED rather than asked about, and
 *    `admin.trainer_assigned` **was already in it** — 19 strings, ratified at Step 7H, never
 *    written. ▶ The error was reading an enumeration of two as NARROWING an already-ratified
 *    three. **A stop is only as good as the fact it rests on.**
 *
 *    ⚠️ ONE TRAINER ACROSS N DATES IS N ASSIGNMENTS, each its own governed transaction and
 *    audit event — `A-016` makes assignment authoritative at CLASS-SESSION level, so there is
 *    no module-level assignment to make.
 *
 *    ⛔ CHOOSING NO TRAINER IS LEGITIMATE, not an incomplete form. A session with no
 *    assignment is a REAL GOVERNED STATE — `staff-projections.ts` documents it and `12`
 *    already renders a module with no trainer name.
 *
 *    ⛔ UNASSIGNMENT IS STILL NOT BUILT and `26` needs none: at creation time there is nothing
 *    to unassign, and the frame's `-` control removes the trainer from the FORM before it is
 *    saved — client state, not a governed act. ✅ It is BUILT as `Remove`, in the frame's
 *    position at the end of the selected-trainer row.
 *
 *    ⛔ THE TRAINER ROW'S SUBTITLE IS OMITTED, AND THIS IS A REPORTED DIVERGENCE FROM THE
 *    REBUILD BRIEF. The frame's subtitle reads `Public Speaking · Employee T-1001` — the first
 *    half is PROGRAMME, which `C-14` records as having no entity, and the second is the
 *    EMPLOYEE ID, a registered omission in its own right. ▶ Both halves are ruled out, so the
 *    subtitle has NO buildable content at HEAD and hero 0B omits the element rather than
 *    filling it. `TrainerChoiceDto` carries exactly `trainerMembershipId` and `displayName`,
 *    so this component could not render one if it tried.
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
  const [trainerId, setTrainerId] = useState("");
  const [trainerQuery, setTrainerQuery] = useState("");

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

  /*
   * ⚠️ CLIENT-SIDE FILTERING OVER ROWS THE CALLER ALREADY RECEIVED. No query
   * is issued, so the control cannot disclose or probe for a trainer outside
   * this centre.
   */
  const visibleTrainers = useMemo(() => {
    const needle = trainerQuery.trim().toLowerCase();
    const all = options?.trainers ?? [];
    return needle === ""
      ? all
      : all.filter((trainer) => trainer.displayName.toLowerCase().includes(needle));
  }, [options, trainerQuery]);

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
      trainerMembershipId: trainerId === "" ? null : trainerId,
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
          setTrainerId("");
          setTrainerQuery("");
        }}
      />
    );
  }

  return (
    <div className="page-grid">
      {/*
        ⚠️ THE BREADCRUMB STAYS BELOW THE TITLE, AS THE FRAME DRAWS IT (`12.50px`), and is
        NOT duplicated by the back link. `13` was the only order defect; this screen matches.
      */}
      <div>
        <PageHeading
          title="Add Class"
          actions={<BackLink href="/management/classes" label="Classes" />}
        />
        <p className="mt-0.5 text-[12.5px] text-ink-muted">
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

      {/*
        ⛔ ONE CARD, NOT THREE. `padding: 24px 26px`, `border-radius: 18px`, `gap: 20px`, with
        the frame's own 1px hairlines between sections and the actions INSIDE it.
      */}
      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-[20px] rounded-[18px] border border-line bg-surface px-[26px] py-6 shadow-[var(--shadow-card)]"
      >
        <SectionHeading title="Class Details" subtitle="Basic information about this class" />

        {/*
          ⛔ THE FRAME'S FIRST ROW IS `Class name | Class code` AND ITS SECOND IS
          `Program | Level | Capacity`. `Class code`, `Program` and `Capacity` are all ruled
          out by `C-14`/`A-016`, so the surviving controls close up rather than leaving three
          gaps: an empty column would read as a field that failed to load.
        */}
        <div className="grid gap-[16px] sm:grid-cols-2">
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

        <Hairline />

        <SectionHeading title="Schedule" subtitle="Which days and times this class meets" />

        {/* The frame's inline strip: `gap: 8px`, chips at `padding: 9px 15px`, radius `10px`. */}
        <fieldset className="flex flex-col gap-2">
          <legend className="sr-only">Days this class meets</legend>
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
                  className={`inline-flex min-h-11 items-center justify-center rounded-[10px] border px-[15px] py-2 text-[12.5px] font-semibold ${
                    selected
                      ? "border-brand-700 bg-brand-700 text-white"
                      : "border-line bg-surface-muted text-ink-muted hover:border-brand-700 hover:text-ink-strong"
                  }`}
                >
                  {day.short}
                  <span className="sr-only">{day.full}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="grid gap-[16px] sm:grid-cols-2">
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
          governed record with its own permanent audit event. ⛔ NOT IN THE FRAME, and kept:
          a form that can create dozens of permanent records must say how many before it does.
        */}
        <p className="rounded-[10px] bg-surface-muted px-4 py-3 text-small text-ink" role="status">
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

        <Hairline />

        <SectionHeading title="Assigned Trainer" />

        {/*
          ⚠️ THE SEARCH FILTERS A LIST THIS CALLER ALREADY HOLDS. It issues no query, so it
          can neither disclose the existence of a trainer outside this centre nor be used to
          probe for one — the same property the `12` level tabs and the `29` class filter rely
          on. ⛔ The list is ACTIVE `trainer` memberships only; a deactivated one would be
          refused by the server, and offering it would be a control that looks like it works.
        */}
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
            aria-describedby={`${formId}-trainer-hint`}
            onChange={(event) => setTrainerQuery(event.target.value)}
          />
          <p id={`${formId}-trainer-hint`} className="text-[11.5px] text-ink-muted">
            {options.trainers.length === 0
              ? "No trainer is available to assign."
              : `${options.trainers.length} trainer${options.trainers.length === 1 ? "" : "s"} at this centre.`}
          </p>
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
                  ⛔ NO SUBTITLE. The frame's `Public Speaking · Employee T-1001` is programme
                  (`C-14`: no entity) plus the employee ID (a registered omission). Both halves
                  are ruled out, so hero 0B omits the element rather than inventing a filler —
                  and `TrainerChoiceDto` carries no field that could hold one.
                */}
                <span className="flex-1 truncate text-[13.5px] font-semibold text-ink-strong">
                  {trainer.displayName}
                </span>
                {/*
                  The frame's trailing `-` control, built as a labelled button. ⛔ It removes
                  the trainer from THIS FORM before it is saved — client state, never a
                  governed unassignment, which has no ratified audit string.
                */}
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setTrainerId(selected ? "" : trainer.trainerMembershipId)}
                  className="inline-flex min-h-11 items-center rounded-[10px] border-[1.3px] border-line bg-surface px-[14px] py-2 text-[12.5px] font-semibold text-ink-muted hover:border-brand-700 hover:text-ink-strong"
                >
                  {selected ? "Remove" : "Select"}
                  <span className="sr-only"> {trainer.displayName}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {/*
          ⛔ NO ASSISTANT / TA ROW, EVER. `A-014` defers the TA persona and `G-7` binds
          `centre_membership_role` against extension, so a second staff slot cannot be
          persisted at all — and the schema agrees: `class_session_assignments` pins
          `trainer_role` to `trainer` by CHECK and by composite FK. `REGISTERED-OMISSION`,
          and it NEVER ENDS.
        */}
        <p className="text-small text-ink" role="status">
          {trainerId === ""
            ? "No trainer selected. The class and its sessions are created unassigned, which is a valid state — a trainer can be assigned later."
            : "This trainer is assigned to each session created above, one governed assignment per session."}
        </p>

        <Hairline />

        {/* The frame's footer: right-aligned, `gap: 12px`, both buttons at `border-radius: 11px`. */}
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
        {outcome.sessionsAssigned > 0 ? (
          <p className="mt-1">
            A trainer is assigned to {outcome.sessionsAssigned} of them.
          </p>
        ) : outcome.sessionsCreated > 0 ? (
          /*
           * ⚠️ TWO DIFFERENT FACTS, AND THEY ARE NOT MERGED. "You chose nobody"
           * and "the assignment refused" are different governed outcomes, and a
           * single sentence covering both would hide a refusal behind a choice.
           */
          <p className="mt-1">
            {outcome.reason === "created"
              ? "No trainer is assigned to these sessions yet."
              : "The sessions were created, but the trainer assignment did not complete. Assign a trainer from the class record."}
          </p>
        ) : null}
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
