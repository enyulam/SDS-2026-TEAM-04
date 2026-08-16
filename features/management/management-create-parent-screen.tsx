"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";

import { usePhysicalTestPort } from "@/features/portal/portal-runtime-context";
import type { ManagementStudentListDto } from "@/lib/frontend/contracts/physical-test";
import { PageHeading } from "@/components/ui/page-heading";
import { Card } from "@/components/ui/surface";
import { Field, TextInput, SearchInput } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { FeedbackBanner } from "@/components/ui/feedback-banner";
import { StatePanel } from "@/components/ui/state-panel";
import { BackLink } from "@/components/ui/back-link";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { asFailure, type FailureResult } from "@/features/trainer/resource-state";

/**
 * Screen `21` — Create Parent Account. Phase `P2-13`.
 *
 * Reference pack: `UI_REFERENCE_FINAL_MVP/reference/Management - Create Parents Account/`
 * (visual rank 1, `A-056`), read as the `.png`, the `.html` and the numbered
 * pack's `screen.md` — §7.4.1.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⛔ ~~THREE~~ **TWO** OMISSIONS, ~~THREE~~ **TWO** DIFFERENT REASONS. NEITHER
 *    OF THEM IS "LATER".
 * ═══════════════════════════════════════════════════════════════════════════
 * ✅ **NARROWED 2026-08-16 BY OPERATOR RULING `C-14`**, which answered omission
 * 2's open question directly. Struck text preserved per annotate-never-delete.
 * 1. **`Relationship: Mother`** — no column. It would be one enum plus one
 *    column on `parent_student_links`, and the **vocabulary is a product
 *    decision nobody has taken**.
 *
 *    ⚠️ **AND THE COLUMN THAT LOOKS LIKE THE ANSWER IS A DECOY** —
 *    `parent_student_links.parent_role`, entry 1 of the living register (plan
 *    §37.1). Its name reads exactly like this field; its `CHECK` pins it to
 *    the literal `'parent'`, because it is a **composite-FK component** that
 *    lets the database assert *"this membership really is a parent of this
 *    centre"*. ▶ Writing `Mother` into it **fails the CHECK**. The register was
 *    consulted before the write path was written, which is what it is for.
 *
 * 2. ~~**`Phone`** — no column, and the open part is **where it would live**:
 *    `accounts` (one number per person, shared across roles) or the profile
 *    table (one per role). ⏸ Already open from `P2-11`, unchanged here.~~
 *    ✅ **RULED AND BUILT.** `C-14` placed it on **`accounts`** — one number per
 *    person, shared across roles — added at `20260816220000`. ▶ The open part
 *    was never whether to build it; it was WHERE, and that is what was ruled.
 *
 *    ⛔ **A CONTACT DETAIL, NEVER A CREDENTIAL** and never an authentication
 *    factor (`A-027`). No sign-in path reads it, and `accounts` still holds no
 *    column capable of storing an authentication secret.
 *
 * 3. **The `Send email invite` toggle** — ⛔ **NOT BUILT, AND NOT BECAUSE IT
 *    IS UNIMPLEMENTED.** External delivery is deferred, so **nothing sends
 *    either way**. A switch offering a choice between two identical outcomes
 *    is a control that lies about what it does; drawn ON, it additionally
 *    asserts a link *was* sent. The invitation row is always created, and the
 *    banner below says plainly that nothing has left this system.
 *
 * ⚠️ **TWO FRAME ARTEFACTS, NOT REQUIREMENTS.** The Linked Student card's
 * search box is captioned **`Search Trainer`** — a defect in the frame, not a
 * trainer picker on a parent screen. And the student row draws
 * `Junior · Public Speaking · ID 2025-113`: **`Junior` is not a ratified Class
 * Grade** (`A-016`, `A-054`) and **`students` has no code column**, so neither
 * is rendered. Grade labels are read from data; no literal appears here.
 *
 * MEASURED (`.html`), cited only where this component builds to it: section
 * titles `16px` · field labels `12px` · inputs `13px` · the linked-student
 * name `14px` · section gap `20px`, field gap `16px`, tight pairs `2px` and
 * `3px`.
 */
export function ManagementCreateParentScreen() {
  const port = usePhysicalTestPort();
  const [status, setStatus] = useState<
    | { readonly kind: "loading" }
    | { readonly kind: "ready"; readonly data: ManagementStudentListDto }
    | { readonly kind: "failed"; readonly result: FailureResult }
    | { readonly kind: "sent"; readonly data: ManagementStudentListDto }
  >({ kind: "loading" });
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<readonly string[]>([]);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void port.readManagementStudents().then((result) => {
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

  const matches = useMemo(() => {
    if (data === null) return [];
    const needle = query.trim().toLowerCase();
    if (needle === "") return data.students.slice(0, 8);
    return data.students.filter((s) => s.fullName.toLowerCase().includes(needle)).slice(0, 8);
  }, [data, query]);

  const chosen = useMemo(
    () => (data?.students ?? []).filter((s) => selected.includes(s.studentId)),
    [data, selected],
  );

  /* ⚠️ UX ONLY (ADR-3): the RPC refuses `invalid_name`, `invalid_email`,
     `no_students` and `unknown_student` on its own. */
  const ready = fullName.trim().length > 0 && email.trim().length > 2 && selected.length > 0;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!ready || busy || data === null) return;
    setBusy(true);
    setProblem(null);
    const result = await port.createParentAccount({
      fullName: fullName.trim(),
      email: email.trim(),
      studentIds: [...selected],
      // ⚠️ EMPTY BECOMES `null`, NEVER `""` — hero `0B`. An empty string would
      // record a guardian as having a blank phone rather than none.
      phone: phone.trim().length === 0 ? null : phone.trim(),
    });
    setBusy(false);
    if (result.outcome === "success") {
      setStatus({ kind: "sent", data });
      setFullName("");
      setEmail("");
      setPhone("");
      setSelected([]);
      setQuery("");
      return;
    }
    setProblem(
      "The account could not be created. Nothing was saved — check the email is not already in use.",
    );
  }

  return (
    <div className="page-grid">
      <div>
        <PageHeading
          title="Create Parent Account"
          breadcrumb={
            <>
              <Link href="/management/students" className="underline hover:text-brand-700">
                Students
              </Link>{" "}
              / Create Parent Account
            </>
          }
          actions={<BackLink href="/management/students" label="Students" />}
        />
      </div>

      {status.kind === "failed" ? <StatePanel result={status.result} /> : null}
      {status.kind === "loading" ? <LoadingSkeleton rows={3} label="Loading students" /> : null}

      {status.kind === "sent" ? (
        /*
          ⛔ EVERY CLAUSE IS LOAD-BEARING, and the last one most of all. The
          membership is PENDING; the guardian sets their OWN password; and
          NOTHING WAS SENT, because external delivery is deferred. A success
          message implying an email went out leaves an academy waiting for one.
        */
        <FeedbackBanner title="Parent account created — pending activation" tone="success">
          The account and its student link(s) are recorded, and the membership is{" "}
          <strong>pending</strong>: this guardian cannot sign in yet. They establish their own
          password when they activate — no password is generated, shown or stored here. Sending the
          invitation email is not built yet, so <strong>nothing has left this system</strong>.
        </FeedbackBanner>
      ) : null}

      {data !== null && (
        <form className="flex flex-col gap-[20px]" onSubmit={submit} noValidate>
          <Card className="p-6">
            <h2 className="text-[16px] font-semibold text-ink-strong">Parent / Guardian Details</h2>
            <p className="mt-[3px] text-[12px] text-ink">
              The account holder who will sign in to view the student&rsquo;s progress
            </p>
            <div className="mt-[16px] grid gap-[16px] sm:grid-cols-2">
              <Field id="parent-name" label="Full name">
                <TextInput
                  id="parent-name"
                  name="fullName"
                  autoComplete="off"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </Field>
              <Field id="parent-email" label="Email address">
                <TextInput
                  id="parent-email"
                  name="email"
                  type="email"
                  autoComplete="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              {/*
                ⚠️ THE FRAME PLACES `Phone` IN THE RIGHT COLUMN BESIDE
                `Email address`, under a `Relationship` select that is REFUSED.
                It takes that cell; the vacated `Relationship` cell is NOT
                back-filled — a refused field leaves a gap rather than licensing
                a re-flow.

                ⛔ `type="tel"`, NEVER `type="password"` or anything treating
                this as a secret: `A-027`. It is a contact detail and no sign-in
                path reads it.
              */}
              <Field id="parent-phone" label="Phone">
                <TextInput
                  id="parent-phone"
                  name="phone"
                  type="tel"
                  autoComplete="off"
                  maxLength={40}
                  placeholder="+65 8123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </Field>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-[16px] font-semibold text-ink-strong">Linked Student</h2>
            <p className="mt-[3px] text-[12px] text-ink">
              Search for the child or children this guardian will see
            </p>
            <div className="mt-[16px] max-w-sm">
              <label className="sr-only" htmlFor="student-search">
                Search students
              </label>
              {/*
                ⚠️ CAPTIONED `Search students`. The frame says `Search Trainer`
                — an artefact of the frame, not a trainer picker on a parent
                screen. Reproducing it would be copying a defect.
              */}
              <SearchInput
                id="student-search"
                value={query}
                placeholder="Search students"
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <ul className="mt-3 flex flex-col">
              {matches.map((student) => {
                const on = selected.includes(student.studentId);
                return (
                  <li key={student.studentId} className="border-t border-line first:border-t-0">
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() =>
                        setSelected((current) =>
                          current.includes(student.studentId)
                            ? current.filter((x) => x !== student.studentId)
                            : [...current, student.studentId],
                        )
                      }
                      className="flex w-full items-center justify-between gap-3 px-1 py-3 text-left"
                    >
                      {/*
                        ⛔ NAME AND CLASS ONLY. No `ID 2025-113` — `students`
                        has no code column — and no `Junior`, which is not a
                        ratified Class Grade.
                      */}
                      <span className="min-w-0">
                        <span className="block truncate text-[14px] font-semibold text-ink-strong">
                          {student.fullName}
                        </span>
                        <span className="mt-[2px] block text-[12px] text-ink">
                          {student.classes.join(" · ")}
                        </span>
                      </span>
                      <span className="shrink-0 text-[13px] font-semibold text-brand-700">
                        {on ? "Remove" : "Link"}
                      </span>
                    </button>
                  </li>
                );
              })}
              {matches.length === 0 && (
                <li className="py-3 text-[12px] text-ink">No students match that search.</li>
              )}
            </ul>

            <p className="mt-3 text-[12px] text-ink">
              {chosen.length === 0
                ? "No student linked yet — at least one is required."
                : `Linked: ${chosen.map((s) => s.fullName).join(", ")}`}
            </p>
          </Card>

          {problem !== null && (
            <p role="alert" className="text-[12px] font-medium text-ink-strong">
              {problem}
            </p>
          )}

          <div className="flex flex-wrap justify-end gap-3">
            <Button type="submit" disabled={!ready || busy}>
              {busy ? "Creating…" : "Create Account"}
            </Button>
          </div>

          {/*
            ⛔ THE TWO REMAINING OMISSIONS, STATED WHERE THE OPERATOR READS
            (§12.12). ⚠️ NARROWED FROM THREE BY `C-14`: the phone is BUILT
            above, so continuing to say the system does not hold it would be a
            stale claim printed beside a working field.
          */}
          <p className="text-[12px] leading-5 text-ink">
            This design also collects a relationship to the child, and offers a switch to send the
            invitation email. This system holds no relationship field, and no email is sent — the
            invitation is recorded here and the guardian activates it in person, so a switch would
            offer a choice between two identical outcomes.
          </p>
        </form>
      )}
    </div>
  );
}
