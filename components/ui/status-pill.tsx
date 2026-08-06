import type { ReportStatus, RosterEntryDto } from "@/lib/frontend/contracts/physical-test";

type DisplayStatus = RosterEntryDto["reportState"];

const labels: Readonly<Record<DisplayStatus, string>> = {
  no_report: "No report",
  incomplete: "Assessment needed",
  observation_saved: "Observation saved",
  drafting: "Generating",
  draft_ready: "Ready to review",
  needs_edit: "Returned",
  trainer_approved: "With management",
  approved: "Finalising",
  submitted: "Submitted",
};

/**
 * Status tints reconciled to the shared foundation at F1. The label map above is
 * unchanged — F1 restyles lifecycle presentation and renames no governed status.
 */
const styles: Readonly<Record<DisplayStatus, string>> = {
  no_report: "bg-neutral-soft text-neutral-on",
  incomplete: "bg-warning-soft text-warning-on",
  observation_saved: "bg-info-soft text-info-on",
  drafting: "bg-brand-100 text-brand-800",
  draft_ready: "bg-info-soft text-info-on",
  needs_edit: "bg-warning-soft text-warning-on",
  trainer_approved: "bg-brand-100 text-brand-800",
  approved: "bg-success-soft text-success-on",
  submitted: "bg-success-soft text-success-on",
};

export function StatusPill({ status }: { readonly status: DisplayStatus }) {
  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-full px-2.5 py-1 text-small font-bold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

export function reportStatusLabel(status: ReportStatus): string {
  return labels[status];
}
