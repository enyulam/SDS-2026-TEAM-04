import type { ReportPanelsDto } from "@/lib/frontend/contracts/physical-test";

export const REPORT_PANEL_CONFIG = [
  {
    key: "todaysStrength",
    label: "Today's Strength",
    supporting: "The clearest positive behaviour observed in this session.",
  },
  {
    key: "nextFocus",
    label: "Next Focus",
    supporting: "One supported, practical area for continued development.",
  },
  {
    key: "practiceSuggestion",
    label: "Practice Suggestion",
    supporting: "A specific activity the learner can practise next.",
  },
  {
    key: "sessionTakeaway",
    label: "Session Takeaway",
    supporting: "A concise, encouraging close grounded in today's observation.",
  },
] as const satisfies readonly {
  readonly key: keyof ReportPanelsDto;
  readonly label: string;
  readonly supporting: string;
}[];
