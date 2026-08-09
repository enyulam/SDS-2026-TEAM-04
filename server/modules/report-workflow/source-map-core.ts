/**
 * The Trainer's Compare-with-Notes source trace — spec §20's
 * `report_source_map` [KEY] capability, built under Operator ruling G-04
 * item 1 to current OD-4 semantics.
 *
 * A trace row says "this panel of the current version draws on your
 * assessment of this dimension". It exists so a trainer reviewing an AI draft
 * can see WHICH of their own ratings each panel rests on, rather than being
 * asked to trust prose against nine ratings held in their head.
 *
 * ⚠️ TRAINER-ONLY, AND THAT IS A DATA BOUNDARY, NOT A UI PREFERENCE.
 * A row names a DIMENSION CODE. A-038 bars management from raw per-dimension
 * assessment data, and Q-27 makes the parent rating boundary a DATA boundary
 * enforced at the governed projection layer — never by fetching values into a
 * client and hiding them. `report_get_source_map` therefore resolves only a
 * single active `trainer` membership in the report's own centre with live
 * session reach, and answers every other caller with ZERO ROWS. This module
 * adds no role check of its own: duplicating that authority here would create
 * a second place for it to drift, and the database's answer is the
 * authoritative one.
 *
 * ZERO ROWS IS AMBIGUOUS ON PURPOSE, AND THIS MODULE PRESERVES THAT.
 * The RPC returns the same empty result for a wrong-role caller, a trainer
 * without reach, a wrong-centre trainer, an unauthenticated caller, an absent
 * report, a report with no current version, AND a legitimately empty trace
 * (accepted prose that named none of the nine dimensions in the frozen
 * lexicon's terms). This core does NOT try to tell those apart — inferring
 * "not permitted" from emptiness would rebuild the disclosure channel the
 * RPC exists to close. An empty `entries` array is returned as an ordinary
 * success, and a caller must render it as "no trace available", never as an
 * error and never as "you may not see this".
 */

import type { ActionResult } from "@/server/contracts/action-result";
import { mapSqlErrorToResult } from "@/server/contracts/action-result";
import type { RpcCaller } from "@/server/modules/report-workflow/rpc-types";
import { isDimensionCode, type DimensionCode } from "@/server/modules/framework/dimensions";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The four OD-4 canonical panels, in stored (snake_case) form. */
export const SOURCE_MAP_SECTIONS = [
  "overview",
  "strengths",
  "areas_for_development",
  "remarks",
] as const;
export type SourceMapSection = (typeof SOURCE_MAP_SECTIONS)[number];

export interface SourceMapEntryDto {
  readonly outputSection: SourceMapSection;
  readonly dimensionCode: DimensionCode;
}

export interface SourceMapDto {
  /** The version the trace describes; null exactly when `entries` is empty. */
  readonly versionId: string | null;
  readonly entries: readonly SourceMapEntryDto[];
}

interface SourceMapRow {
  readonly report_version_id: string;
  readonly output_section: string;
  readonly source_dimension_code: string;
}

function isSection(value: unknown): value is SourceMapSection {
  return typeof value === "string" && (SOURCE_MAP_SECTIONS as readonly string[]).includes(value);
}

export async function getSourceMapCore(
  db: RpcCaller,
  reportId: string,
): Promise<ActionResult<SourceMapDto>> {
  if (!UUID_RE.test(reportId)) {
    return { outcome: "validation", message: "The request was not valid.", fields: [] };
  }

  const { data, error } = await db.rpc("report_get_source_map", { p_report_id: reportId });
  if (error) return mapSqlErrorToResult(error.code, error.message);

  const rows = Array.isArray(data) ? (data as unknown[]) : [];
  const entries: SourceMapEntryDto[] = [];
  let versionId: string | null = null;

  for (const raw of rows) {
    const row = raw as SourceMapRow;
    // A row whose section or dimension is not a governed value is an
    // integrity incident. It is REFUSED WHOLE rather than filtered away: a
    // silently shortened trace would tell the trainer their draft rests on
    // fewer of their ratings than it does, which is worse than no trace.
    if (!isSection(row.output_section) || !isDimensionCode(row.source_dimension_code)) {
      return { outcome: "unexpected_failure", message: "The operation could not be completed." };
    }
    if (versionId === null) versionId = row.report_version_id;
    else if (versionId !== row.report_version_id) {
      // The RPC reads exactly one version. Two version ids in one result
      // would mean it no longer does.
      return { outcome: "unexpected_failure", message: "The operation could not be completed." };
    }
    entries.push({ outputSection: row.output_section, dimensionCode: row.source_dimension_code });
  }

  return { outcome: "success", data: { versionId, entries } };
}
