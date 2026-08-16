"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

import { usePhysicalTestPort } from "@/features/portal/portal-runtime-context";
import type { TrainerInvitationOutcomeDto } from "@/lib/frontend/contracts/physical-test";
import { PageHeading } from "@/components/ui/page-heading";
import { Card } from "@/components/ui/surface";
import { Field, TextInput } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { FeedbackBanner } from "@/components/ui/feedback-banner";
import { StatePanel } from "@/components/ui/state-panel";
import { BackLink } from "@/components/ui/back-link";
import { asFailure, type FailureResult } from "@/features/trainer/resource-state";

/**
 * Screen `24` — Management Add Trainer. Phase `P2-11`.
 *
 * Reference pack: `UI_REFERENCE_FINAL_MVP/reference/Management - Add Trainer/`
 * (visual rank 1, `A-056`), read as the `.png`, the `.html` and the numbered
 * pack's `screen.md` — §7.4.1.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⛔ THE FRAME DRAWS SIX FIELDS, A PHOTO AND A CLASS PICKER. THIS BUILDS THREE.
 *    FIVE REFUSALS, FIVE DIFFERENT REASONS, AND NOT ONE OF THEM IS "LATER".
 * ═══════════════════════════════════════════════════════════════════════════
 * The full reasoning lives once, at
 * `server/modules/identity-access/trainer-invitation.ts`, and is summarised
 * here only so a reader of this file is not left guessing:
 *
 * 1. **`Role` — `GC-11`** (pack `24`, ruling `Q-24`). `Assistant Trainer` is
 *    not a member of `centre_membership_role`, so the option is UNPERSISTABLE,
 *    not merely unbuilt. TA is a deferred persona (`A-014`, `G-7`).
 * 2. ~~**`Phone`** and~~ 3. **`Employee ID`** — ⛔ NO COLUMN EXISTS, measured
 *    in the catalogue. ~~▶ **THE ONE OPEN OPERATOR DECISION ON THIS SCREEN**~~,
 *    and it is disclosed ON THE PAGE rather than only in a source comment
 *    (§12.12).
 *
 *    ✅ **`Phone` IS RULED AND BUILT** (`C-14`, 2026-08-16): `accounts.phone`,
 *    one number per person shared across roles, added at `20260816220000`. ▶
 *    **The open decision this file named is CLOSED**; `Employee ID` alone
 *    remains, and it is a column, a unique index AND a minting rule, not one
 *    column.
 *
 *    ⛔ **A CONTACT DETAIL, NEVER A CREDENTIAL** (`A-027`). No sign-in path
 *    reads it, and `accounts` still holds no column able to store an
 *    authentication secret.
 * 4. **`Upload photo`** — no column, no bucket, no policy; `C-15` is the
 *    adjacent precedent.
 * 5. **`Assign Classes`** — `A-016` puts assignment at CLASS SESSION level and
 *    the chips are class MODULES, aimed at a `pending` membership. Assignment
 *    has its own governed path (`admin_assign_session_trainer`, `P2-2b`).
 *
 * ⚠️ §12.12 IS WHY THE NOTICE IS RENDERED AND NOT COMMENTED. A screen that
 * silently drops four of its drawn fields looks finished; the same screen with
 * a stated omission is honestly partial. **The Operator reads the page, not
 * this header.**
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⛔ WHAT SUCCESS ACTUALLY MEANS HERE, SAID IN THE COPY
 * ═══════════════════════════════════════════════════════════════════════════
 * The trainer is created **`pending`**, with **no login**. `A-020`/`A-025`: a
 * profile is not a login, and `accounts.auth_user_id` is NULL until the
 * recipient activates. ⛔ **No password is generated, shown, emailed or
 * stored** (`A-020`, `A-027`) — the success copy says the invitation was
 * recorded, and must never imply a credential was issued or sent.
 *
 * ⚠️ AND IT SAYS THE DELIVERY IS NOT BUILT. External email delivery is
 * separately deferred, so the invitation EXISTS as a governed record and no
 * message has left the building. Claiming "we emailed them" would be the same
 * class of lie as a fixture reporting a creation that never happened.
 *
 * ⛔ NO RATING VOCABULARY AND NOTHING RATING-SHAPED. The pack's own §8 says
 * this screen is not rating-bearing; there is no field one could arrive in.
 *
 * MEASURED VALUES (from the `.html`): page title `22px/700` · section titles
 * `Trainer Profile` and `Assign Classes` `15px/600` · the `Contact details`
 * subtitle `12px/400` · field labels `12px/600` · input text and placeholder
 * `13px/400` · `Cancel` `13.50px/600` · class chips `12.50px/600` · card radius
 * `18px`, input radius `10px`, chip radius `999px` · input fill `#F5F6FA` with
 * a `#EDEFF4` hairline, padding `12px 14px`.
 */

type Status =
  | { readonly kind: "idle" }
  | { readonly kind: "saving" }
  | { readonly kind: "sent"; readonly outcome: TrainerInvitationOutcomeDto }
  | { readonly kind: "failed"; readonly result: FailureResult };

export function ManagementAddTrainerScreen() {
  const port = usePhysicalTestPort();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  /*
   * ⚠️ A UX GATE, NOT A SECURITY GATE (`ADR-3`, and the same rule that governs
   * the trainer Approve button). The RPC re-validates both values over what
   * the DATABASE receives, and the `CHECK` constraints refuse anything it
   * misses. Deleting this line would change a message and let nothing through.
   */
  const submittable =
    (firstName.trim().length > 0 || lastName.trim().length > 0) && email.trim().includes("@");

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!submittable || status.kind === "saving") return;
    setStatus({ kind: "saving" });
    // ⚠️ EMPTY BECOMES `null`, NEVER `""` — hero `0B`.
    const result = await port.createTrainer({
      firstName,
      lastName,
      email,
      phone: phone.trim().length === 0 ? null : phone.trim(),
    });
    if (result.outcome === "success") {
      setStatus({ kind: "sent", outcome: result.data });
      setFirstName("");
      setLastName("");
      setEmail("");
      return;
    }
    setStatus({ kind: "failed", result: asFailure(result) });
  }

  const fieldError = (path: string) =>
    status.kind === "failed" && status.result.outcome === "validation"
      ? status.result.fields.find((f) => f.path === path)?.message
      : undefined;

  return (
    <div className="page-grid">
      {/*
        ⚠️ THE BREADCRUMB SITS BELOW THE TITLE, as this frame draws it — the
        `26`/`27` case, not the `13` one, and measured rather than copied from a
        neighbour: the `.png` puts `Add Trainer` first and `Trainers / Add`
        beneath it.
      */}
      <div>
        <PageHeading
          title="Add Trainer"
          actions={<BackLink href="/management/trainers" label="Trainers" />}
        />
        <p className="mt-0.5 text-[12.5px] text-ink">
          <Link href="/management/trainers" className="underline hover:text-brand-700">
            Trainers
          </Link>{" "}
          / Add
        </p>
      </div>

      {status.kind === "failed" ? <StatePanel result={status.result} /> : null}

      {status.kind === "sent" ? (
        /*
         * ⛔ EVERY CLAUSE OF THIS BANNER IS LOAD-BEARING. It says the profile is
         * PENDING (not staff yet), that the person sets their OWN password
         * (never one we made), and that NOTHING WAS SENT — because external
         * delivery is deferred and a success message implying otherwise would
         * leave an academy waiting for an email that does not exist.
         */
        <FeedbackBanner title="Trainer profile created — pending activation" tone="success">
          The invitation is recorded and the membership is <strong>pending</strong>: this person is
          not yet active staff and cannot sign in. They establish their own password when they
          activate — no password is generated, shown or stored here. Sending the invitation email is
          not built yet, so nothing has left this system.
        </FeedbackBanner>
      ) : null}

      <Card className="p-6">
        <form className="flex flex-col gap-6" onSubmit={submit} noValidate>
          <div>
            <h2 className="text-[15px] font-semibold text-ink-strong">Trainer Profile</h2>
            <p className="mt-0.5 text-[12px] text-ink">Contact details</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="first-name" label="First name" error={fieldError("firstName")}>
              <TextInput
                id="first-name"
                name="firstName"
                autoComplete="off"
                value={firstName}
                invalid={fieldError("firstName") !== undefined}
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
            <Field
              id="email"
              label="Email"
              error={fieldError("email")}
              hint="Where the activation invitation will be addressed."
            >
              <TextInput
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="off"
                placeholder="name@sds.edu"
                value={email}
                invalid={fieldError("email") !== undefined}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            {/*
              ⚠️ THE FRAME PAIRS `Phone` WITH `Email` ON ONE ROW, so `Email`
              gives up the two-column span it held while `Phone` had no column
              to write to. ⛔ The `Employee ID`/`Role` row below it is still
              REFUSED and is NOT back-filled — a refused field leaves a gap.

              ⛔ `type="tel"`, never anything treating this as a secret
              (`A-027`).
            */}
            <Field id="phone" label="Phone">
              <TextInput
                id="phone"
                name="phone"
                type="tel"
                autoComplete="off"
                maxLength={40}
                placeholder="+65"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </Field>
          </div>

          {/*
            ⛔ THE OMISSIONS, DISCLOSED WHERE THE OPERATOR READS (§12.12).
            Rendering the four controls disabled would be the opposite mistake —
            `P2-10` established it on this very pair of screens: DISABLED means
            "not yet", ABSENT means "not a thing", and only ONE of these four is
            a "not yet".
          */}
          <section className="rounded-[12px] border border-line bg-surface-muted px-4 py-3.5">
            <h3 className="text-[12px] font-semibold text-ink-strong">
              Three fields on the design are not collected
            </h3>
            <ul className="mt-1.5 flex list-disc flex-col gap-1 pl-5 text-[12px] leading-5 text-ink">
              <li>
                <strong>Role</strong> — the academy has one trainer role. An assistant-trainer role
                does not exist in this system.
              </li>
              <li>
                <strong>Employee ID</strong> — there is nowhere to store it yet, and it needs a
                format and someone to issue it. This one is a pending decision, not a rule.
              </li>
              <li>
                <strong>Photo</strong> — deferred with the student photo.
              </li>
              <li>
                <strong>Assign classes</strong> — a trainer is assigned to individual sessions from
                the class screens, after they activate.
              </li>
            </ul>
          </section>

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-line pt-5">
            <Link
              href="/management/trainers"
              className="inline-flex min-h-11 items-center rounded-[10px] px-4 text-[13.5px] font-semibold text-ink hover:bg-surface-muted"
            >
              Cancel
            </Link>
            <Button type="submit" disabled={!submittable || status.kind === "saving"}>
              {status.kind === "saving" ? "Creating…" : "Add Trainer"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
