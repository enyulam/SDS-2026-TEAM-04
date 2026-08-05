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

const styles: Readonly<Record<DisplayStatus, string>> = {
  no_report: "bg-slate-100 text-slate-600",
  incomplete: "bg-amber-100 text-amber-800",
  observation_saved: "bg-blue-100 text-blue-800",
  drafting: "bg-violet-100 text-violet-800",
  draft_ready: "bg-cyan-100 text-cyan-800",
  needs_edit: "bg-orange-100 text-orange-900",
  trainer_approved: "bg-indigo-100 text-indigo-800",
  approved: "bg-emerald-100 text-emerald-800",
  submitted: "bg-green-100 text-green-800",
};

export function StatusPill({ status }: { readonly status: DisplayStatus }) {
  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-full px-2.5 py-1 text-xs font-extrabold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

export function reportStatusLabel(status: ReportStatus): string {
  return labels[status];
}
