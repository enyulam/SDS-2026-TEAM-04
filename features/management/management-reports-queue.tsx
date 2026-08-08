"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useMemo, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { PageHeading } from "@/components/ui/page-heading";
import { StatePanel } from "@/components/ui/state-panel";
import { asFailure, type ResourceState } from "@/features/trainer/resource-state";
import { usePhysicalTestPort } from "@/features/portal/portal-runtime-context";
import type { ManagementQueueRowDto } from "@/lib/frontend/contracts/physical-test";

/**
 * Screen 29 — Management Reports queue (FRONTEND RECONSTRUCTION F11).
 *
 * Current Final MVP visual authority is `UI_REFERENCE_FINAL_MVP/reference/Management - Reports/`
 * (Amendment 007 A-056, which supersedes the A-045 ordering). The pack-local
 * `UI_REFERENCE_FINAL_MVP/29-management-reports/reference.png` (node 527:170) is an optional
 * frozen duplicate, SHA-identical to it. Reconstructed here as the frame's filter strip plus
 * a single white card holding one report table. See CLAUDE.md §7.4 and
 * FINAL_MVP_AUTHORITY_LOCK.md §2.4 for the ladder and for governed deviations.
 *
 * Governance boundary — this is the whole point of this screen (CLAUDE.md §6, A-038):
 *
 *   - `trainer_approved` is the ONLY queue status that links to report content, and it
 *     links to the management final-review surface. `submitted` links to the canonical
 *     submitted report, but no submitted row reaches this queue's two projections.
 *   - `needs_edit` and `draft_ready` expose NO report content whatsoever. Their row action
 *     is "Send Reminder to Trainer" and nothing else — never a view-content control.
 *   - `draft_ready` here is correction-tracking METADATA ONLY: a returned report has been
 *     corrected but not yet reapproved. It carries no draft text, no trainer note, no raw
 *     per-dimension rating, no checklist or approval internals and no content hash.
 *   - Each row's action is decided by its own status below. There is deliberately no
 *     shared generic "view report" handler for this table.
 *
 * The frame's status vocabulary ("Approved" / "Needs approval") is Figma mock data and is
 * NOT the ratified lifecycle. The ratified statuses win and the discrepancy is recorded in
 * `implementation-notes.md` (A-045: the rule wins, the divergence is recorded).
 */

/** Row presentation, keyed by governed status. Content exposure is decided here, once. */
const ROW_PRESENTATION = {
  trainer_approved: {
    label: "Awaiting final review",
    tone: "brand",
    /** The management final-review surface — the one permitted pre-submission read. */
    exposesContent: true,
  },
  /*
   * C2C-004 — "Approved", whose governed referent is `submitted`.
   *
   * Under A-036 `approved` is transient-in-transaction: the management
   * Approve & Submit RPC moves trainer_approved -> approved -> submitted
   * inside ONE exception-free transaction, so no reader outside it can ever
   * observe `approved`. A filter over that literal label would be empty
   * forever. `submitted` is what "Approved" means on this page, and it is the
   * ONLY status the governed submitted-list boundary can return.
   *
   * A submitted row links to the CANONICAL SUBMITTED report — the second of
   * the exactly two things A-038 permits Management to read. It never links
   * to a pre-approval draft, and the surface it opens performs no mutation.
   */
  submitted: {
    label: "Approved · published to the linked parent",
    tone: "success",
    exposesContent: true,
  },
  needs_edit: {
    label: "Returned to Trainer",
    tone: "warning",
    exposesContent: false,
  },
  draft_ready: {
    label: "Corrected · awaiting Trainer reapproval",
    tone: "info",
    exposesContent: false,
  },
} as const satisfies Readonly<
  Record<
    ManagementQueueRowDto["status"],
    {
      readonly label: string;
      readonly tone: "brand" | "warning" | "info" | "success";
      readonly exposesContent: boolean;
    }
  >
>;

export function ManagementReportsQueue() {
  const port = usePhysicalTestPort();
  const router = useRouter();
  const searchParams = useSearchParams();
  const reminderNoteId = useId();
  const scopeNoteId = useId();
  const searchId = useId();

  const status = searchParams.get("status") ?? "trainer_approved";
  /*
   * C2C-004 — three in-page filters on ONE route. The two pre-existing
   * `?status=` spellings remain WORKING ratified compatibility aliases
   * (`29-management-reports/screen.md:18`) and `submitted` joins them as the
   * third. No second route and no second rail destination is created (R-C2-3);
   * `portal-navigation.ts` still declares exactly one Reports destination with
   * no query string, and the navigation suite asserts that all three aliases
   * resolve to that one active item.
   */
  const acceptedStatus =
    status === "trainer_approved" || status === "needs_edit" || status === "submitted";
  const mode =
    status === "needs_edit" ? "corrections" : status === "submitted" ? "approved" : "pending";
  const [query, setQuery] = useState("");
  const [state, setState] = useState<ResourceState<readonly ManagementQueueRowDto[]>>({
    kind: "loading",
  });

  useEffect(() => {
    let active = true;
    if (!acceptedStatus) return;
    const request =
      status === "needs_edit"
        ? port.listManagementCorrectionTracking()
        : status === "submitted"
          ? port.listManagementSubmittedReports()
          : port.listManagementPendingReviews();
    void request.then((result) => {
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
  }, [acceptedStatus, port, status]);

  const rows = useMemo(() => {
    if (state.kind !== "ready") return [];
    if (searchParams.get("preview") === "empty") return [];
    return state.data;
  }, [searchParams, state]);

  const visibleRows = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    if (!needle) return rows;
    return rows.filter((row) =>
      row.studentDisplayName.toLocaleLowerCase().includes(needle),
    );
  }, [query, rows]);

  if (!acceptedStatus) {
    return (
      <StatePanel
        result={{ outcome: "unavailable" }}
        homeHref="/management"
        homeLabel="Return to Management workspace"
      />
    );
  }

  if (state.kind === "loading") {
    return <LoadingSkeleton label="Loading Management report queue" rows={4} />;
  }
  if (state.kind === "failed") {
    return (
      <StatePanel
        result={state.result}
        homeHref="/management"
        homeLabel="Return to Management workspace"
      />
    );
  }

  const caption =
    mode === "pending"
      ? "Pending final review"
      : mode === "corrections"
        ? "Correction tracking"
        : "Approved and published";
  const captionNote =
    mode === "pending"
      ? "Trainer-approved reports waiting for Management’s final quality review."
      : mode === "corrections"
        ? "Assessment-fact concerns returned to the Trainer stay visible here until reapproval."
        : "Reports this centre has published. Each row opens the canonical submitted version — the same four parent-facing panels the linked family sees.";
  const emptyTitle =
    mode === "pending"
      ? "No reports waiting"
      : mode === "corrections"
        ? "No corrections in progress"
        : "Nothing published yet";
  const emptyBody =
    mode === "pending"
      ? "The final-review queue is clear in this fixture view."
      : mode === "corrections"
        ? "There are no open returned items in this fixture view."
        : "No report in this centre has completed Approve & Submit.";

  return (
    <div className="page-grid">
      {/*
        The subtitle is rendered here rather than through PageHeading's `description` prop:
        that prop resolves to `text-ink-muted` (#8a93a8), which measures 3.079:1 on the
        canvas — below the 4.5:1 AA floor for normal-size text. `components/ui/page-heading.tsx`
        is outside this checkpoint's owned paths, so the shared primitive is left untouched
        and the failure is recorded for a separate foundation authorization.
      */}
      <div>
        <PageHeading title="Reports" />
        <p className="mt-1 max-w-2xl text-body leading-6 text-ink">
          School-wide report oversight for this centre.
        </p>
      </div>

      <section aria-label="Report filters" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-body font-bold text-ink-strong">Filter:</span>

          {/* Governed: the two ratified `?status=` compatibility aliases of screen 29. */}
          <FilterChip
            id={`${searchId}-status`}
            label="Queue status"
            value={status}
            onChange={(next) => {
              setQuery("");
              router.push(`/management/reports?status=${next}`);
            }}
            options={[
              { value: "trainer_approved", label: "Pending final review" },
              { value: "needs_edit", label: "Correction tracking" },
              { value: "submitted", label: "Approved" },
            ]}
          />

          {/*
            The frame draws "All terms" and "All classes" chips. The governed Management
            queue projection carries neither a term nor a class field, and inventing one is
            prohibited (GLOBAL_UI_RULES §10). They render inert with a stated reason and are
            recorded as a backend dependency rather than faked client-side.
          */}
          <FilterChip
            id={`${searchId}-term`}
            label="Term"
            value=""
            disabled
            describedBy={scopeNoteId}
            options={[{ value: "", label: "All terms" }]}
          />
          <FilterChip
            id={`${searchId}-class`}
            label="Class"
            value=""
            disabled
            describedBy={scopeNoteId}
            options={[{ value: "", label: "All classes" }]}
          />

          <div className="relative w-full sm:ms-auto sm:w-64">
            <label className="sr-only" htmlFor={`${searchId}-search`}>
              Search students in this queue
            </label>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-on"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.2-3.2" />
              </svg>
            </span>
            <input
              id={`${searchId}-search`}
              type="search"
              placeholder="Search students"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-11 w-full rounded-field border border-line bg-surface ps-10 pe-3.5 text-body text-ink-strong placeholder:text-neutral-on"
            />
          </div>
        </div>
        <p id={scopeNoteId} className="text-small text-ink">
          Term and class filters are unavailable: the governed Management queue projection
          carries no term or class field. Search narrows the rows already listed below and
          reaches no other report.
        </p>
      </section>

      {visibleRows.length === 0 ? (
        <section className="card px-6 py-12 text-center" role="status">
          <h2 className="text-section-title font-extrabold text-ink-strong">
            {query.trim() ? "No students match that search" : emptyTitle}
          </h2>
          <p className="mt-2 text-body text-ink">
            {query.trim() ? "Clear the search to see every report in this queue." : emptyBody}
          </p>
        </section>
      ) : (
        <section className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] border-collapse text-left">
              <caption className="px-5 pt-5 text-left text-card-title font-bold text-ink-strong sm:px-6">
                {caption}
                <span className="mt-1 block text-small font-normal text-ink">{captionNote}</span>
              </caption>
              <thead>
                <tr className="border-b border-line">
                  <th
                    scope="col"
                    className="px-5 py-3 text-small font-semibold text-neutral-on sm:px-6"
                  >
                    Student
                  </th>
                  <th scope="col" className="px-5 py-3 text-small font-semibold text-neutral-on">
                    Session
                  </th>
                  <th scope="col" className="px-5 py-3 text-small font-semibold text-neutral-on">
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3 text-right text-small font-semibold text-neutral-on sm:px-6"
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row) => {
                  const presentation = ROW_PRESENTATION[row.status];
                  const correction =
                    !presentation.exposesContent && row.openCorrectionScope
                      ? row
                      : null;
                  return (
                    <RowGroup
                      key={row.reportId}
                      row={row}
                      presentation={presentation}
                      correction={correction}
                      reminderNoteId={reminderNoteId}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
          <p
            id={reminderNoteId}
            className="border-t border-line px-5 py-4 text-small text-ink sm:px-6"
          >
            A report that has not been approved by its Trainer exposes no report content to
            Management. Reminders are not yet deliverable from this build — no governed
            Trainer-reminder path exists, so the control stays inert rather than pretending
            to send one.
          </p>
        </section>
      )}
    </div>
  );
}

/**
 * The frame's rounded filter chip.
 *
 * Built locally from utilities rather than the shared `Select` primitive: `Select` composes
 * the `.form-field` class, whose `background` and `padding` shorthands reset the very
 * background-position / background-repeat / padding utilities that primitive relies on for
 * its chevron and its inset. `components/ui/field.tsx` and `app/globals.css` are outside
 * this checkpoint's owned paths, so the latent defect is recorded in `implementation-notes.md`
 * for the operator rather than fixed here.
 */
function FilterChip({
  id,
  label,
  value,
  options,
  onChange,
  disabled = false,
  describedBy,
}: {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly options: readonly { readonly value: string; readonly label: string }[];
  readonly onChange?: (value: string) => void;
  readonly disabled?: boolean;
  readonly describedBy?: string;
}) {
  return (
    <span className="relative inline-flex">
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        value={value}
        disabled={disabled}
        aria-describedby={describedBy}
        onChange={(event) => onChange?.(event.target.value)}
        className={`h-10 appearance-none rounded-full border border-line ps-4 pe-9 text-body font-semibold ${
          disabled
            ? "cursor-not-allowed bg-surface-muted text-ink-subtle"
            : "cursor-pointer bg-surface text-ink-strong"
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 ${
          disabled ? "text-ink-subtle" : "text-neutral-on"
        }`}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </span>
    </span>
  );
}

function RowGroup({
  row,
  presentation,
  correction,
  reminderNoteId,
}: {
  readonly row: ManagementQueueRowDto;
  readonly presentation: (typeof ROW_PRESENTATION)[ManagementQueueRowDto["status"]];
  readonly correction: ManagementQueueRowDto | null;
  readonly reminderNoteId: string;
}) {
  return (
    <>
      <tr className={correction ? "" : "border-b border-line last:border-0"}>
        <td className="px-5 py-4 sm:px-6">
          <span className="flex items-center gap-3">
            <Avatar displayName={row.studentDisplayName} size="small" />
            <span className="text-body font-bold text-ink-strong">
              {row.studentDisplayName}
            </span>
          </span>
        </td>
        <td className="px-5 py-4 text-body text-ink">
          {formatDate(row.sessionDate)}
          {row.submittedAt && (
            /* Publication metadata, not content: WHEN it was published, never what. */
            <span className="mt-0.5 block text-small text-neutral-on">
              Published {formatDate(row.submittedAt.slice(0, 10))}
            </span>
          )}
        </td>
        <td className="px-5 py-4">
          <Badge tone={presentation.tone}>{presentation.label}</Badge>
        </td>
        <td className="px-5 py-4 text-right sm:px-6">
          {presentation.exposesContent ? (
            <Link
              href={`/management/reports/${row.reportId}/review`}
              className="inline-flex min-h-11 items-center gap-1 rounded-field px-2 py-2 text-body font-bold text-brand-800 hover:text-brand-700"
            >
              {row.status === "submitted" ? "View report" : "Review"}
              <span aria-hidden="true">›</span>
              <span className="sr-only">{row.studentDisplayName}&apos;s report</span>
            </Link>
          ) : (
            <button
              type="button"
              disabled
              aria-describedby={reminderNoteId}
              className="inline-flex min-h-11 cursor-not-allowed items-center rounded-field border border-line bg-surface-muted px-3 py-2 text-body font-bold text-ink-subtle"
            >
              Send Reminder to Trainer
            </button>
          )}
        </td>
      </tr>
      {correction && (
        <tr className="border-b border-line last:border-0">
          <td colSpan={4} className="px-5 pb-4 sm:px-6">
            <div className="rounded-field bg-warning-soft px-4 py-3 text-small text-warning-on">
              <p className="font-extrabold">
                {formatIssueScope(correction.openCorrectionScope)}
                {correction.openCorrectionStatus
                  ? ` · ${correction.openCorrectionStatus}`
                  : ""}
              </p>
              {correction.openCorrectionReason && (
                <p className="mt-1 leading-6">{correction.openCorrectionReason}</p>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-SG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Singapore",
  }).format(new Date(`${value}T00:00:00+08:00`));
}

function formatIssueScope(scope: ManagementQueueRowDto["openCorrectionScope"]) {
  if (!scope) return "Assessment-fact concern";
  return {
    rating: "Rating concern",
    observation: "Observation concern",
    derived_assessment_fact: "Derived assessment fact",
  }[scope];
}
