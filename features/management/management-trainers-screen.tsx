"use client";

import { useEffect, useMemo, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { PageHeading } from "@/components/ui/page-heading";
import { SearchInput } from "@/components/ui/field";
import { StatePanel } from "@/components/ui/state-panel";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { asFailure, type ResourceState } from "@/features/trainer/resource-state";
import { usePhysicalTestPort } from "@/features/portal/portal-runtime-context";
import type { ManagementTrainerListDto } from "@/lib/frontend/contracts/physical-test";

/**
 * Screen `23` — Management Trainers (PORTAL COMPLETION PLAN phase `P2-10`).
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ARTEFACTS OPENED FOR THIS BUILD (`CLAUDE.md` §7.4.1 — every claim below names one)
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 *   · `reference/Management - Trainers/Management - Trainers.png`   — geometry and visual truth
 *   · `reference/Management - Trainers/Management - Trainers.html`  — every measured value below
 *   · `UI_REFERENCE_FINAL_MVP/23-management-trainers/screen.md`     — governance and provenance
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⚠️ WHAT THE `.png` DRAWS
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * `Trainers` over `Manage teaching staff and their classes`. Below it `All Trainers` with a pink
 * `16 staff` pill, a `Search trainers` field and a pink `+ Add Trainer` button. Then one card
 * holding a table: `Trainer` (circular initials avatar, name, and an EMAIL beneath it) ·
 * `Classes` · `Students` · `Status` · an unheaded `Edit` column. Status renders a green `Active`
 * chip on seven rows and an amber `On leave` chip on one.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⛔ NO SCHEMA. MEASURED AT HEAD BEFORE A LINE WAS WRITTEN, NOT INHERITED FROM `P2-8`
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * The pack's dependency section says *"**Missing** — no trainer-list projection."* ▶ That is
 * true of a PROJECTION and false of the DATA: all seven tables this needs
 * (`centre_memberships`, `accounts`, `trainer_profiles`, `class_session_assignments`,
 * `class_sessions`, `class_modules`, `enrolments`) already carry an `authenticated` SELECT grant
 * AND a permissive SELECT policy. ⚠️ **§12.10 for the third consecutive phase** — the note a
 * later reader would have trusted named a gap that was not there.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⛔ THREE THINGS THE FRAME DRAWS THAT ARE NOT BUILT. EVERY ONE HAS ITS OWN REASON
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 *
 * 1. ⛔ THE `On leave` CHIP — `GC-12`, and the schema agrees. `centre_membership_status` has
 *    EXACTLY THREE members: `pending`, `active`, `deactivated`. **There is no leave state**, and
 *    adding one would be an enum invented from a frame (`A-022`) that also carries governed
 *    meaning — a trainer "on leave" is still an active membership, so the value would change what
 *    assignment and authorization mean. ▶ `REGISTERED-OMISSION`. It ends only if the academy
 *    ratifies a leave concept, which is a schema authorization of its own.
 *
 * 2. ⛔ THE EMAIL UNDER EACH NAME — **RAISED, NOT SILENTLY DROPPED.** `accounts.normalized_email`
 *    EXISTS and is readable; nothing about this is a missing column. ▶ The pack's
 *    prohibited-invention clause reads *"Do not expose authentication details"*, and an email IS
 *    the Supabase Auth login identifier for that person. ⚠️ **Fail-closed while it is ambiguous:**
 *    the argument FOR showing it is strong — management SUPPLIES it when inviting the trainer
 *    (`A-020`), so it discloses nothing management does not already hold, and a directory with two
 *    identically-named trainers is materially worse without it. **It is reported to the Operator
 *    with that recommendation rather than decided here**, and the refusal lives in the DTO, which
 *    has no field to put one in — stronger than a component that chooses not to render it.
 *
 * 3. ⛔ THE `Edit` CONTROL — **no Edit-Trainer screen exists in the ratified 36.** `P2-11` builds
 *    `24` Add Trainer; there is no `Edit Trainer` frame, node or ID. ▶ Rendering a control that
 *    leads nowhere is the `P2-6` defect exactly — a surface over an unbuilt path — and §12.12 now
 *    makes that a PARTIAL phase rather than a complete one. **Omitted, and the screen is complete
 *    without it.** ⚠️ `Add Trainer` is drawn as **disabled with a stated reason**, because it has
 *    a known destination (`P2-11`) and will become live; `Edit` has no destination at all.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⚠️ TWO NUMBERS THE FRAME DRAWS THAT ARE COUNTS, NOT RATINGS — AND WHY THAT MATTERS HERE
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * `Classes 5` and `Students 142` are per-trainer aggregates, and `G-2` bars roll-ups. ▶ **They are
 * COUNTS of rows, and the Operator's `P2-9` ruling states the ground exactly: *"a count of
 * assessments is not an assessment"*.** Neither number consults a rating, and neither could —
 * this projection reads no rating table. ⛔ **The standing test applies here too: if either ever
 * becomes derived from rating VALUES rather than counted, that is a stop-and-ask.**
 *
 * ⚠️ `16 staff` OVER EIGHT DRAWN ROWS is a mock inconsistency. The pill is built from the list it
 * sits on — the same rule `P2-7` and `P2-8` hold, because a pill and its table must never be able
 * to disagree.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⛔ NO RATING VOCABULARY, ANYWHERE. `C-9`'s register row names `P2-8` and the surrounding
 * phases; this surface has no field a rating could arrive in.
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 *
 * MEASURED VALUES (all from the `.html`): page title `22px` · `All Trainers` `17px` · pill,
 * column headings and status chip `11px` · trainer name and `Add Trainer` `13px` · the two counts
 * `12.50px` · `Edit` `12px` · avatar initials `11.50px` · card radius `18px` · chip/pill radius
 * `999px` · brand `#EC4B96`, pill fill `#FCE7F0`, row rule `#F3F5F9`.
 */

/**
 * ⛔ TWO CHIPS, NOT THREE. The third the frame draws (`On leave`) has no value in the
 * ratified enum — see the header. `pending` never reaches this list: an invited
 * trainer who has not activated is not a member of staff (`A-027`).
 */
const STATUS_CHIP: Readonly<Record<"active" | "deactivated", { label: string; className: string }>> = {
  active: { label: "Active", className: "bg-[#E4F3E4] text-[#2F6B37]" },
  deactivated: { label: "Deactivated", className: "bg-[#F3F5F9] text-ink-muted" },
};

export function ManagementTrainersScreen() {
  const port = usePhysicalTestPort();
  const [state, setState] = useState<ResourceState<ManagementTrainerListDto>>({ kind: "loading" });
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    void port.readManagementTrainers().then((result) => {
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
  }, [port]);

  const data = state.kind === "ready" ? state.data : null;

  const rows = useMemo(() => {
    if (data === null) return [];
    const needle = search.trim().toLowerCase();
    // ⚠️ NAME ONLY. The frame's field also matches the email it draws; this one
    // has no email to match, and searching a field the user cannot see would be
    // a hidden behaviour.
    return needle === ""
      ? data.trainers
      : data.trainers.filter((row) => row.fullName.toLowerCase().includes(needle));
  }, [data, search]);

  return (
    <div className="flex flex-col gap-5">
      <PageHeading title="Trainers" description="Manage teaching staff and their classes" />

      {state.kind === "failed" ? <StatePanel result={state.result} /> : null}
      {state.kind === "loading" ? <LoadingSkeleton rows={4} label="Loading trainers" /> : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-[17px] font-bold text-ink">All Trainers</h2>
          {data === null ? null : (
            <span className="rounded-full bg-[#FCE7F0] px-3 py-[5px] text-[11px] font-semibold text-[#C0246F]">
              {data.staffCount} {data.staffCount === 1 ? "staff" : "staff"}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            type="search"
            value={search}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)}
            placeholder="Search trainers"
            aria-label="Search trainers"
            className="w-full sm:w-[14.375rem]"
          />
          {/*
            ⚠️ DISABLED WITH A STATED REASON, and §12.12 is why the distinction matters:
            `Add Trainer` has a KNOWN destination (`24`, phase `P2-11`) and will become live, so
            it is drawn and disclosed. ⛔ `Edit` has NO destination in the ratified 36 and is
            therefore ABSENT, not disabled — a control that can never become live is not a
            pending feature.
          */}
          <button
            type="button"
            disabled
            title="Adding a trainer arrives with screen 24"
            className="inline-flex min-h-11 items-center gap-2 rounded-[10px] bg-brand-500 px-4 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"
          >
            + Add Trainer
          </button>
        </div>
      </div>

      {data !== null ? (
        <section className="overflow-hidden rounded-[18px] border border-line bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[38rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#F3F5F9]">
                  {/*
                    ⛔ FOUR HEADINGS. The frame draws a fifth, unlabelled column for `Edit`;
                    with the control omitted there is no column to head.
                  */}
                  <th scope="col" className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">
                    Trainer
                  </th>
                  <th scope="col" className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">
                    Classes
                  </th>
                  <th scope="col" className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">
                    Students
                  </th>
                  <th scope="col" className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const chip = STATUS_CHIP[row.status];
                  return (
                    <tr key={row.membershipId} className="border-b border-[#F3F5F9] last:border-b-0">
                      <td className="px-5 py-3.5">
                        <span className="flex items-center gap-3">
                          {/*
                            ⚠️ THE SHARED `Avatar`, which tints DETERMINISTICALLY FROM THE NAME.
                            `P2-8`'s first draft tinted by row index and a learner changed colour
                            when the filter reordered the table — the same defect would arrive
                            here for free by re-implementing it.
                          */}
                          <Avatar displayName={row.fullName} size="small" />
                          {/* ⛔ NO EMAIL LINE. See the header — reported, not silently dropped. */}
                          <span className="text-[13px] font-semibold text-ink">{row.fullName}</span>
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[12.5px] text-ink-muted">{row.classCount}</td>
                      <td className="px-5 py-3.5 text-[12.5px] text-ink-muted">{row.studentCount}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex rounded-full px-3 py-[5px] text-[11px] font-semibold ${chip.className}`}>
                          {chip.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/*
            ⚠️ AN EMPTY SEARCH AND AN EMPTY CENTRE ARE DIFFERENT ANSWERS (`Q-7`), and they say
            different things. Collapsing them would tell management the academy has no trainers
            when they had simply mistyped a name.
          */}
          {rows.length === 0 ? (
            <p className="px-5 py-6 text-[13px] text-ink-muted">
              {data.trainers.length === 0
                ? "No trainers are recorded at this centre yet."
                : "No trainer matches that search."}
            </p>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
