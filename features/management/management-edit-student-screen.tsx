"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { usePhysicalTestPort } from "@/features/portal/portal-runtime-context";
import type {
  ManagementClassListDto,
  ManagementStudentProfileDto,
} from "@/lib/frontend/contracts/physical-test";
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
 * Screen `22` — Edit Student. Phase `P2-14`.
 *
 * Reference pack: `UI_REFERENCE_FINAL_MVP/reference/Management - Edit Student/`
 * (visual rank 1, `A-056`), read as the `.png`, the `.html` and the numbered
 * pack's `screen.md` — §7.4.1.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⛔ ~~THE SAME SEVEN FIELDS HAVE NO COLUMN~~ **FOUR DO** — AND ONE SENTENCE IS
 *    DROPPED BY RULING
 * ═══════════════════════════════════════════════════════════════════════════
 * ✅ **NARROWED 2026-08-16 BY `C-14`**, struck text preserved per
 * annotate-never-delete. ~~Date of birth ·~~ Gender · Student ID ·
 * ~~Guardian name, contact,~~ email and home address · the photo. Each
 * remaining one is **cited, not disabled**, for the reasons stated once at
 * screen `20`.
 *
 * ⛔ **THIS SCREEN CARRIES THE HALF OF `C-14` THAT SCREEN `20` CANNOT: THE
 *    PRECEDENCE RULE AT EDIT TIME.** The guardian pair is a PRE-LINK capture,
 *    so once `parent_student_links` holds a live row the account wins and the
 *    fields are **not rendered at all** — not disabled, not blank.
 *    `admin_update_student` independently REFUSES a guardian write in that
 *    state (`guardian_locked`), so the screen and the server agree.
 *
 * ⚠️ **AND THE LOAD IS A DATA-LOSS GUARD.** The three fields are a FULL
 *    REPLACEMENT, like the name and the class set. Rendering them blank would
 *    send `null` and **wipe a child's date of birth on a rename**, silently,
 *    while reporting success.
 *
 * ⛔ **AND THE WITHDRAWAL CARD'S *"Can be undone within 30 days"* IS DROPPED.**
 * Operator ruling, 2026-08-16: **build the withdrawal, drop the sentence** —
 * *"a retention promise with no mechanism is a lie with a deadline."*
 * ▶ `is_active`, `deactivated_at` and `withdrawn_at` all exist, so withdrawal
 * is buildable today; the 30-day WINDOW needs a recorded deadline **and
 * something that acts on it**, and retention is Phase 4 (`CLAUDE.md` §10).
 *
 * ⚠️ **WHAT REPLACES IT IS TRUE AND CARRIES NO DEADLINE:** nothing is deleted,
 * and re-enrolling the learner is a management action. That is a statement
 * about the data, not a promise about time.
 *
 * ⚠️ **NO NEW READ** (§12.10, tenth consecutive phase): the form prefills from
 * `readManagementStudentProfile` and the class picker from
 * `listManagementClasses`, both of which already existed.
 *
 * MEASURED (`.html`), cited only where this component builds to it: section
 * titles `15px` · field labels `12px` · inputs `13px` · the withdrawal card
 * `12.50px` with its heading `13.50px` · the omission note `11.50px` · section
 * gap `22px`, field gap `16px`.
 */
export function ManagementEditStudentScreen({ studentId }: { readonly studentId: string }) {
  const port = usePhysicalTestPort();
  const router = useRouter();
  const [status, setStatus] = useState<
    | { readonly kind: "loading" }
    | { readonly kind: "ready" }
    | { readonly kind: "failed"; readonly result: FailureResult }
    | { readonly kind: "saved" }
    | { readonly kind: "withdrawn" }
  >({ kind: "loading" });
  const [profile, setProfile] = useState<ManagementStudentProfileDto | null>(null);
  const [allClasses, setAllClasses] = useState<ManagementClassListDto | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianContact, setGuardianContact] = useState("");
  const [selected, setSelected] = useState<readonly string[]>([]);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([port.readManagementStudentProfile(studentId), port.listManagementClasses()]).then(
      ([one, list]) => {
        if (cancelled) return;
        /*
         * ⚠️ THE FAILING ONE IS NARROWED BEFORE IT IS REPORTED. Passing the
         * union straight to `asFailure` type-errors, and the temptation is to
         * cast — which would let a `success` reach a failure renderer.
         */
        if (one.outcome !== "success") {
          setStatus({ kind: "failed", result: asFailure(one) });
          return;
        }
        if (list.outcome !== "success") {
          setStatus({ kind: "failed", result: asFailure(list) });
          return;
        }
        setProfile(one.data);
        setAllClasses(list.data);
        /*
         * ⚠️ THE NAME IS SPLIT ON THE LAST SPACE, and that is a LOSSY GUESS the
         * schema forces: `students` stores ONE `full_name`, and the frame draws
         * two boxes. ▶ Split on the last space so a multi-part given name
         * survives ("Mary Anne Tan" → "Mary Anne" + "Tan"), which is the
         * failure mode that would otherwise silently rename a child on save.
         */
        const parts = one.data.fullName.trim().split(/\s+/);
        setLastName(parts.length > 1 ? parts[parts.length - 1] : "");
        setFirstName(parts.length > 1 ? parts.slice(0, -1).join(" ") : parts[0] ?? "");
        /*
         * ⛔ LOADED, NOT LEFT BLANK — AND THIS IS A DATA-LOSS GUARD, NOT
         *    CONVENIENCE. `admin_update_student` takes the three `C-14` fields
         *    as a FULL REPLACEMENT, exactly like the name and the class set. A
         *    form that rendered them empty would send `null` for all three and
         *    ▶ **WIPE A CHILD'S DATE OF BIRTH ON A RENAME**, silently, with the
         *    save reporting success.
         *
         * ⚠️ The guardian pair loads only when NOT linked. Once linked the
         *    projection already returns `guardianContact: null` and a
         *    `guardianName` belonging to the ACCOUNT — loading that account's
         *    name into an editable box would invite an edit the server refuses
         *    (`guardian_locked`), and would look like the account had been
         *    renamed if it appeared to save.
         */
        setDateOfBirth(one.data.dateOfBirth ?? "");
        setGuardianName(one.data.guardianLinked ? "" : one.data.guardianName ?? "");
        setGuardianContact(one.data.guardianLinked ? "" : one.data.guardianContact ?? "");
        setSelected(one.data.classes.map((c) => c.classModuleId));
        setStatus({ kind: "ready" });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [port, studentId]);

  /* ⚠️ UX ONLY (ADR-3): the RPC refuses `invalid_name`, `no_classes`,
     `unknown_class` and `unknown_student` on its own. */
  const ready = firstName.trim().length > 0 && lastName.trim().length > 0 && selected.length > 0;

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!ready || busy) return;
    setBusy(true);
    setProblem(null);
    const result = await port.updateStudent({
      studentId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      classModuleIds: [...selected],
      dateOfBirth: dateOfBirth.trim().length === 0 ? null : dateOfBirth.trim(),
      /*
       * ⛔ `null` FOR BOTH WHEN LINKED. Sending a value would be REFUSED
       * outright with `guardian_locked` — the RPC refuses rather than silently
       * ignoring, so this is not belt-and-braces: sending anything here would
       * fail the whole save, including the name change.
       */
      guardianName:
        profile?.guardianLinked || guardianName.trim().length === 0 ? null : guardianName.trim(),
      guardianContact:
        profile?.guardianLinked || guardianContact.trim().length === 0
          ? null
          : guardianContact.trim(),
    });
    setBusy(false);
    if (result.outcome === "success") {
      setStatus({ kind: "saved" });
      return;
    }
    setProblem("The changes could not be saved. Nothing was altered.");
  }

  async function withdraw() {
    setBusy(true);
    setProblem(null);
    const result = await port.withdrawStudent(studentId);
    setBusy(false);
    setConfirming(false);
    if (result.outcome === "success") {
      setStatus({ kind: "withdrawn" });
      return;
    }
    setProblem("The learner could not be withdrawn. Nothing was altered.");
  }

  return (
    <div className="page-grid">
      <div>
        <PageHeading
          title="Edit Student"
          breadcrumb={
            <>
              <Link href="/management/students" className="underline hover:text-brand-700">
                Students
              </Link>{" "}
              / {profile?.fullName ?? "Student"} / Edit
            </>
          }
          actions={<BackLink href={`/management/students/${studentId}`} label="Profile" />}
        />
      </div>

      {status.kind === "failed" ? <StatePanel result={status.result} /> : null}
      {status.kind === "loading" ? <LoadingSkeleton rows={4} label="Loading student" /> : null}

      {status.kind === "saved" ? (
        <FeedbackBanner title="Changes saved" tone="success">
          The learner&rsquo;s details and class enrolments are updated.
        </FeedbackBanner>
      ) : null}

      {status.kind === "withdrawn" ? (
        /*
          ⛔ NO DEADLINE IN THIS COPY. It states what is TRUE of the data —
          nothing was deleted — and names re-enrolment as a management action,
          rather than promising a 30-day window nothing enforces.
        */
        <FeedbackBanner title="Learner withdrawn" tone="success">
          The learner is removed from their active classes and no longer appears on a roster.{" "}
          <strong>Nothing has been deleted</strong> — past sessions, assessments and reports are
          unchanged. Re-enrolling this learner is a management action.
        </FeedbackBanner>
      ) : null}

      {profile !== null && allClasses !== null && status.kind !== "withdrawn" && (
        <form className="flex flex-col gap-[22px]" onSubmit={save} noValidate>
          <Card className="p-6">
            <h2 className="text-[15px] font-semibold text-ink-strong">Student Profile</h2>
            <p className="mt-0.5 text-[12px] text-ink">
              Update name, date of birth and guardian contact
            </p>

            <div className="mt-[16px] grid gap-[16px] sm:grid-cols-2">
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
              <Field id="date-of-birth" label="Date of birth">
                <TextInput
                  id="date-of-birth"
                  name="dateOfBirth"
                  type="date"
                  max={new Date().toISOString().slice(0, 10)}
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </Field>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-[15px] font-semibold text-ink-strong">Guardian</h2>
            {/*
              ⛔ THE LINKED CASE IS NOT A DISABLED FORM, IT IS A DIFFERENT
                 ANSWER. `P2-10` established the rule on these screens: DISABLED
                 means "not yet", ABSENT means "not a thing". A linked guardian
                 is not a pending edit — the account IS the record, and the
                 fields have no writable counterpart at all, which is why the
                 server refuses (`guardian_locked`) rather than ignoring.
            */}
            {profile.guardianLinked ? (
              <p className="mt-0.5 text-[12px] leading-5 text-ink">
                This learner is linked to a parent account
                {profile.guardianName === null ? "" : ` (${profile.guardianName})`}. That
                account&rsquo;s name and phone number are the guardian record now, and are changed
                on the parent&rsquo;s own account rather than here.
              </p>
            ) : (
              <>
                <p className="mt-0.5 text-[12px] text-ink">
                  Captured at registration. Once a parent account is created and linked, that
                  account takes over and these stop being editable.
                </p>
                <div className="mt-[16px] grid gap-[16px] sm:grid-cols-2">
                  <Field id="guardian-name" label="Guardian name">
                    <TextInput
                      id="guardian-name"
                      name="guardianName"
                      autoComplete="off"
                      maxLength={120}
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                    />
                  </Field>
                  <Field id="guardian-contact" label="Guardian contact">
                    <TextInput
                      id="guardian-contact"
                      name="guardianContact"
                      autoComplete="off"
                      inputMode="tel"
                      maxLength={40}
                      value={guardianContact}
                      onChange={(e) => setGuardianContact(e.target.value)}
                    />
                  </Field>
                </div>
              </>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-[15px] font-semibold text-ink-strong">Classes</h2>
            <p className="mt-0.5 text-[12px] text-ink">Classes this student is enrolled in</p>
            {/* ⛔ From data. No grade or class label is a literal here. */}
            <div className="mt-3 flex flex-wrap gap-2">
              {allClasses.classes.map((option) => {
                const on = selected.includes(option.classModuleId);
                return (
                  <button
                    key={option.classModuleId}
                    type="button"
                    aria-pressed={on}
                    onClick={() =>
                      setSelected((current) =>
                        current.includes(option.classModuleId)
                          ? current.filter((x) => x !== option.classModuleId)
                          : [...current, option.classModuleId],
                      )
                    }
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
          </Card>

          <Card className="border border-line p-6">
            <h2 className="text-[13.5px] font-semibold text-ink-strong">Withdraw student</h2>
            {/*
              ⛔ THE FRAME'S SENTENCE ENDS *"Can be undone within 30 days."*
              IT IS DROPPED BY RULING. What stands here is true of the data and
              carries no deadline.
            */}
            <p className="mt-1 text-[12.5px] leading-5 text-ink">
              Removes this learner from their active classes so they no longer appear on a roster.
              Nothing is deleted — past sessions, assessments and reports are unchanged — and
              re-enrolling them is a management action.
            </p>
            {confirming ? (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="text-[12.5px] font-medium text-ink-strong">
                  Withdraw {profile.fullName} from all active classes?
                </span>
                <Button type="button" onClick={() => void withdraw()} disabled={busy}>
                  {busy ? "Withdrawing…" : "Yes, withdraw"}
                </Button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="min-h-11 text-[12.5px] font-semibold text-brand-700 underline"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                disabled={busy}
                className="mt-3 inline-flex min-h-11 items-center rounded-[10px] border border-line bg-surface px-4 text-[12.5px] font-semibold text-ink-strong"
              >
                Withdraw student
              </button>
            )}
          </Card>

          {problem !== null && (
            <p role="alert" className="text-[12.5px] font-medium text-ink-strong">
              {problem}
            </p>
          )}

          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push(`/management/students/${studentId}`)}
              className="min-h-11 rounded-[10px] border border-line bg-surface px-4 text-[13px] font-semibold text-ink-strong"
            >
              Cancel
            </button>
            <Button type="submit" disabled={!ready || busy}>
              {busy ? "Saving…" : "Save changes"}
            </Button>
          </div>

          {/* ⛔ THE SEVEN OMISSIONS, ON THE PAGE (§12.12). */}
          <p className="text-[11.5px] leading-5 text-ink">
            This design also edits a gender, a student reference number, a photograph, and a
            guardian email and home address. This system holds none of those. The guardian&rsquo;s
            email belongs to their own account, which is linked to this learner, so one guardian
            record serves every child rather than a separate copy stored against each student.
          </p>
        </form>
      )}
    </div>
  );
}
