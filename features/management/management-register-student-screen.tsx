"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";

import { usePhysicalTestPort } from "@/features/portal/portal-runtime-context";
import type { ManagementClassListDto } from "@/lib/frontend/contracts/physical-test";
import { PageHeading } from "@/components/ui/page-heading";
import { Card } from "@/components/ui/surface";
import { Field, TextInput } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { FeedbackBanner } from "@/components/ui/feedback-banner";
import { StatePanel } from "@/components/ui/state-panel";
import { BackLink } from "@/components/ui/back-link";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { asFailure, type FailureResult } from "@/features/trainer/resource-state";

/**
 * Screen `20` — Register New Student. Phase `P2-12`.
 *
 * Reference pack: `UI_REFERENCE_FINAL_MVP/reference/Management - Register Student/`
 * (visual rank 1, `A-056`), read as the `.png`, the `.html` and the numbered
 * pack's `screen.md` — §7.4.1.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⛔ THE FRAME DRAWS NINE PROFILE FIELDS AND A PHOTO. THIS BUILDS TWO.
 *    SEVEN OMISSIONS, AND THEY ARE NOT ONE REASON REPEATED.
 * ═══════════════════════════════════════════════════════════════════════════
 * `students` holds, measured: `id · centre_id · full_name · is_active ·
 * created_at · updated_at · deactivated_at`. **Nothing else.** Operator ruling
 * 2026-08-16: every field with no column **stays out and is CITED, NOT
 * DISABLED** — a greyed input implies the field is coming; an absent one with
 * a stated reason says what is true.
 *
 *   · **Date of birth** — one column, and a child's DOB is personal data. Not
 *     a decision this phase may take.
 *   · **Gender** — an enum whose value set is a product decision nobody has
 *     made (`A-026`: a closed, non-runtime-editable vocabulary is an enum).
 *   · **Student ID `2025-113`** — a column, a unique index, **and a generation
 *     rule**: who mints it and in what format is the whole question. Drawn on
 *     six screens, which is why leaving it undecided keeps costing.
 *   · **Guardian name · contact · email · home address** — ⛔ **REFUSED BY
 *     RULING**, and not over four columns. Screen `21` already creates the
 *     guardian properly, as an `accounts` row linked through
 *     `parent_student_links`. Four columns here would be **a second, unlinked
 *     copy of the guardian that nothing keeps in step** — *"a data defect, not
 *     four columns."*
 *   · **Photo** — deferred by `C-15`: a bucket, its policies, an upload
 *     transport and a column.
 *
 * ✅ **BUILT:** first and last name — **joined into `full_name` SERVER-SIDE**,
 * in `admin_create_student`, so the two halves cannot be stored apart and
 * re-joined differently by a later caller — and `Assign Classes`, which is
 * `enrolments` and already exists.
 *
 * ⚠️ **THE CLASS LIST IS `listManagementClasses()`, NOT A NEW READ** (§12.10,
 * ninth consecutive phase). The row already carried it.
 *
 * ⚠️ **THE CHIPS COME FROM DATA, NEVER FROM LITERALS.** The frame draws
 * `Advanced · Public Speaking` **twice** and a `Junior · Public Speaking` —
 * `Junior` is not a Class Grade (`A-016`, `A-054`; the `P2-1` registered
 * omission). Rendering the frame's chip list verbatim would invent a grade.
 *
 * MEASURED (`.html`), and CITED ONLY WHERE THIS COMPONENT BUILDS TO IT:
 * section titles `15px` · field labels and hints `12px` · chips `13px` at
 * `border-radius: 999px` · the selection count `12.50px` · the omission note
 * `11.50px` · section gap `22px`, field gap `16px`.
 *
 * ⚠️ THE FRAME'S INPUT `10px` RADIUS AND ITS `13.50px` SUBMIT ARE **NOT CITED**,
 * because this screen renders the shared `TextInput` and `Button` rather than
 * its own — and `AR-5` correctly went red when they were cited anyway. ▶ A
 * value quoted but not built to is exactly what that leg exists to catch, and
 * the fix is to cite less, never to restyle a shared control to match a
 * citation.
 */
export function ManagementRegisterStudentScreen() {
  const port = usePhysicalTestPort();
  const [status, setStatus] = useState<
    | { readonly kind: "loading" }
    | { readonly kind: "ready"; readonly data: ManagementClassListDto }
    | { readonly kind: "failed"; readonly result: FailureResult }
    | { readonly kind: "sent"; readonly data: ManagementClassListDto }
  >({ kind: "loading" });
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selected, setSelected] = useState<readonly string[]>([]);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void port.listManagementClasses().then((result) => {
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

  const data = status.kind === "ready" || status.kind === "sent" ? status.data : null;
  const toggle = (id: string) =>
    setSelected((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));

  /*
   * ⚠️ UX ONLY (ADR-3). `admin_create_student` re-validates the name and
   * refuses `no_classes` and `unknown_class` on its own — this button being
   * disabled proves nothing about a caller who bypasses the UI, which is why
   * the server carries all four refusals independently.
   */
  const ready = firstName.trim().length > 0 && lastName.trim().length > 0 && selected.length > 0;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!ready || busy || data === null) return;
    setBusy(true);
    setProblem(null);
    const result = await port.registerStudent({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      classModuleIds: [...selected],
    });
    setBusy(false);
    if (result.outcome === "success") {
      setStatus({ kind: "sent", data });
      setFirstName("");
      setLastName("");
      setSelected([]);
      return;
    }
    setProblem("The registration could not be completed. No student was created.");
  }

  return (
    <div className="page-grid">
      {/*
        ⚠️ BREADCRUMB BELOW THE TITLE, as this frame draws it — the `24` case,
        measured rather than copied: the `.png` puts `Register New Student`
        under a muted `Students / Register`.
      */}
      <div>
        <PageHeading
          title="Register New Student"
          breadcrumb={
            <>
              <Link href="/management/students" className="underline hover:text-brand-700">
                Students
              </Link>{" "}
              / Register
            </>
          }
          actions={<BackLink href="/management/students" label="Students" />}
        />
      </div>

      {status.kind === "failed" ? <StatePanel result={status.result} /> : null}
      {status.kind === "loading" ? <LoadingSkeleton rows={3} label="Loading classes" /> : null}

      {status.kind === "sent" ? (
        <FeedbackBanner title="Student registered" tone="success">
          The student record and its enrolments are created. A student has <strong>no login</strong>
          {" "}
          — a learner never signs in to this system. To give a guardian access, create their account
          on <strong>Create Parent Account</strong> and link this child there.
        </FeedbackBanner>
      ) : null}

      {data !== null && (
        <Card className="p-6">
          <form className="flex flex-col gap-[22px]" onSubmit={submit} noValidate>
            <div>
              <h2 className="text-[15px] font-semibold text-ink-strong">Student Profile</h2>
              <p className="mt-0.5 text-[12px] text-ink">Name and class enrolment</p>
            </div>

            <div className="grid gap-[16px] sm:grid-cols-2">
              <Field id="first-name" label="First name">
                <TextInput
                  id="first-name"
                  name="firstName"
                  autoComplete="off"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </Field>
              <Field id="last-name" label="Last name">
                <TextInput
                  id="last-name"
                  name="lastName"
                  autoComplete="off"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </Field>
            </div>

            <div>
              <h2 className="text-[15px] font-semibold text-ink-strong">Assign Classes</h2>
              <p className="mt-0.5 text-[12px] text-ink">
                Select the classes this student will be enrolled in
              </p>
              {/*
                ⛔ RENDERED FROM `data.classes`. No grade or class label is
                written literally here, so a fourth grade cannot appear by
                editing this component — the structural rule `P21a-4` holds on
                screen `12`, applied to a picker.
              */}
              <div className="mt-3 flex flex-wrap gap-2">
                {data.classes.map((option) => {
                  const on = selected.includes(option.classModuleId);
                  return (
                    <button
                      key={option.classModuleId}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggle(option.classModuleId)}
                      className={
                        on
                          ? "min-h-11 rounded-[999px] bg-brand-600 px-4 text-[13px] font-semibold text-white"
                          : "min-h-11 rounded-[999px] border border-line bg-surface px-4 text-[13px] font-medium text-ink-strong"
                      }
                    >
                      {`${on ? "✓" : "+"} ${option.classGradeLabel} · ${option.title}`}
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-[12.5px] text-ink">
                {selected.length} {selected.length === 1 ? "class" : "classes"} selected
              </p>
            </div>

            {problem !== null && (
              <p role="alert" className="text-[12.5px] font-medium text-ink-strong">
                {problem}
              </p>
            )}

            <div className="flex flex-wrap justify-end gap-3">
              <Button type="submit" disabled={!ready || busy}>
                {busy ? "Registering…" : "Register Student"}
              </Button>
            </div>

            {/*
              ⛔ THE SEVEN OMISSIONS, STATED WHERE THE OPERATOR READS (§12.12).
              Absent with a reason — never a disabled input implying it is
              coming, which is what "cited, not disabled" rules out.
            */}
            <p className="text-[11.5px] leading-5 text-ink">
              This design also collects a date of birth, gender, student reference number,
              photograph, and guardian name, contact, email and home address. This system holds none
              of those. A guardian is created and linked on the Create Parent Account screen, so one
              guardian record serves every child rather than a separate copy stored against each
              student.
            </p>
          </form>
        </Card>
      )}
    </div>
  );
}
