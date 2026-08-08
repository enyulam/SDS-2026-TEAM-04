import type { ReportPanelsDto } from "@/lib/frontend/contracts/physical-test";

// The SOLE source of the four canonical English panel labels, consumed by the
// Trainer, Management and Parent report surfaces.
//
// OD-4 (Operator ruling, 2026-08-07) ratifies these four panels and their
// meanings. This is a SEMANTIC MODEL CHANGE, NOT A RELABEL: the superseded
// Today's Strength / Next Focus / Practice Suggestion / Session Takeaway
// concepts are not preserved behind new captions. The `supporting` copy below
// is therefore re-authored FROM THE RULING's definitions rather than carried
// across from the old panel it happens to sit in the same position as.
//
// The labels are exact and are not a matter of local preference: the ratified
// third label is "Areas for Development", NOT "Areas to Grow" -- the minority
// variant appears in three reference packs and is expressly ruled out
// (Authority Lock section 15.1).
export const REPORT_PANEL_CONFIG = [
  {
    key: "overview",
    label: "Overview",
    // Deliberately NOT positive-only. The ruling says Overview "may synthesize
    // strengths, overall performance and developmental context" and is "not
    // restricted to positive observations" -- the distinction the G-06
    // grounding design turns on.
    supporting:
      "A general narrative summary of the session, including developmental context where it is grounded.",
  },
  {
    key: "strengths",
    label: "Strengths",
    supporting:
      "Positive capabilities, behaviours or progress the learner actually demonstrated, supported by the trainer's assessment.",
  },
  {
    key: "areasForDevelopment",
    label: "Areas for Development",
    supporting:
      "Specific capabilities or behaviours that would benefit from continued development or support.",
  },
  {
    key: "remarks",
    label: "Remarks",
    // "Not an unrestricted place for unsupported claims -- grounding and
    // governance apply in full."
    supporting:
      "Additional relevant commentary that does not belong in the other three panels, grounded in the same assessment facts.",
  },
] as const satisfies readonly {
  readonly key: keyof ReportPanelsDto;
  readonly label: string;
  readonly supporting: string;
}[];
