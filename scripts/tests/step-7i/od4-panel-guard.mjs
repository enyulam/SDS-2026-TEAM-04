// =====================================================================
// B.E.S.T Coach -- OD-4 PANEL GUARD (shared, pure predicates)
// =====================================================================
//
// P1-T04. The single derivation point for "which report_versions columns
// are narrative panels" and "which columns no governed path may mutate or
// project", used by every CURRENT REUSABLE control that previously carried
// a hand-written literal deny-list.
//
// WHY THIS EXISTS
// ---------------
// Five current-layer controls named the four SUPERSEDED panel columns
// literally, for the sole purpose of proving report content does not leak
// and that a committed version is not mutated. M13 renamed those columns.
// A renamed column with a stale literal list leaves every one of those
// assertions PASSING GREEN WHILE DETECTING NOTHING -- an `UPDATE
// public.report_versions SET overview = ...` sailed straight through
// T7I-18. That is the exact failure this project was already bitten by at
// the A-053 rename, where POLARITY_BANDS[rating] became `undefined` and the
// polarity rule was silently skipped while the suite reported green.
//
// Cleanup manifest Q-7 requires "catalog-derived detection preferred",
// because a fresh literal list re-creates the identical fail-open at the
// NEXT rename. So nothing here names a panel column.
//
// HOW THE DERIVATION WORKS
// ------------------------
// `supabase/migrations/*.sql` is the schema source of truth (ADR-8). This
// module replays every CREATE TABLE / ADD COLUMN / DROP COLUMN against
// public.report_versions in ledger order and reports the resulting column
// set. Panels are then derived BY SUBTRACTION: every column that is not
// structural is a narrative panel.
//
// Subtraction, not enumeration, is the load-bearing choice. Renaming a
// panel changes which names come out and the guard follows automatically.
// Adding a NEW structural column fails LOUD rather than silent: it is
// classified as a panel, the panel count moves off four, and
// `assertPanelAnchor` raises -- which is the correct direction for a
// control to be wrong in.
//
// THIS IS A TEXT DERIVATION, NOT A CATALOGUE READ, so it is checked
// against the live catalogue by `assertPanelAnchor`. That check runs in
// `prove-od4-fail-open-controls.mjs`, which is the one place in the suite
// holding BOTH the text derivation and a live connection, and which
// `run-canonical.mjs` invokes. If the two ever disagree, the derivation is
// wrong and every consumer is told loudly instead of quietly scanning for
// names that no longer exist.
// =====================================================================

import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Columns of public.report_versions that are NOT narrative panels.
 *
 * This is the ONLY enumerated list in this module, and it is deliberately
 * the stable half: identity, lineage, authorship, submission metadata and
 * integrity metadata. None of it was touched by OD-4, and a change to it
 * is a schema event that must be noticed, not absorbed.
 */
export const STRUCTURAL_VERSION_COLUMNS = Object.freeze([
  'id', 'report_id', 'centre_id', 'revision_number',
  'authored_by_membership_id', 'authored_by_role', 'derived_from_version_id',
  'submitted_at', 'submitted_by_membership_id', 'submitted_by_role',
  'created_at', 'updated_at',
  'content_hash', 'content_hash_version', 'trainer_approved_source_version_id',
])

/**
 * The ONLY columns a governed path may write on an ALREADY-INSERTED
 * version row: T11's write-once submission metadata, plus the row's own
 * updated_at.
 *
 * T7I-18's forbidden set is derived as "every current column except
 * these", which is strictly stronger than the eleven names it used to
 * carry: it covers columns that did not exist when that list was written.
 */
export const POST_INSERT_WRITABLE_COLUMNS = Object.freeze([
  'submitted_at', 'submitted_by_membership_id', 'submitted_by_role', 'updated_at',
])

/**
 * Panel-shaped identifiers from the SUPERSEDED model.
 *
 * Kept ONLY so a control can assert they are ABSENT. Never used as a
 * deny-list: detecting the old names is worthless once they are gone --
 * that is precisely how these controls went vacuous.
 */
export const SUPERSEDED_PANEL_COLUMNS = Object.freeze([
  'todays_strength', 'next_focus', 'practice_suggestion', 'session_takeaway',
])

const IDENT = String.raw`"?([a-z_][a-z0-9_]*)"?`

/**
 * Replay the migration corpus and return public.report_versions' current
 * column set, in ledger order.
 *
 * @param {string} migDir absolute path to supabase/migrations
 * @returns {string[]} column names
 */
export function deriveReportVersionColumns(migDir) {
  const files = readdirSync(migDir).filter((f) => f.endsWith('.sql')).sort()
  const cols = []
  const add = (c) => { if (c && !cols.includes(c)) cols.push(c) }
  const drop = (c) => { const i = cols.indexOf(c); if (i >= 0) cols.splice(i, 1) }

  for (const f of files) {
    // Comments are stripped so prose describing a column is never mistaken
    // for DDL -- this corpus discusses its own schema at length.
    const sql = readFileSync(join(migDir, f), 'utf8').replace(/--[^\n]*/g, '')

    // CREATE TABLE public.report_versions ( ... )
    const create = new RegExp(
      String.raw`CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\s*\.\s*)?report_versions\s*\(`, 'i',
    ).exec(sql)
    if (create) {
      // Walk to the matching close paren so a nested type/constraint paren
      // does not truncate the column list.
      let depth = 0, i = create.index + create[0].length - 1, end = -1
      for (; i < sql.length; i += 1) {
        if (sql[i] === '(') depth += 1
        else if (sql[i] === ')') { depth -= 1; if (depth === 0) { end = i; break } }
      }
      if (end > 0) {
        const inner = sql.slice(create.index + create[0].length, end)
        // Split on top-level commas only.
        let d = 0, cur = ''
        const parts = []
        for (const ch of inner) {
          if (ch === '(') d += 1
          else if (ch === ')') d -= 1
          if (ch === ',' && d === 0) { parts.push(cur); cur = '' } else cur += ch
        }
        parts.push(cur)
        for (const part of parts) {
          const t = part.trim()
          if (!t) continue
          // Skip table-level constraint clauses -- they are not columns.
          if (/^(CONSTRAINT|PRIMARY\s+KEY|UNIQUE|FOREIGN\s+KEY|CHECK|EXCLUDE|LIKE)\b/i.test(t)) continue
          const m = new RegExp(String.raw`^${IDENT}\s`, 'i').exec(t)
          if (m) add(m[1].toLowerCase())
        }
      }
    }

    // ALTER TABLE ... report_versions ... ADD / DROP / RENAME COLUMN.
    // Matched per ALTER statement so a statement touching a DIFFERENT table
    // can never contribute a column here.
    const alters = sql.match(
      new RegExp(String.raw`ALTER\s+TABLE\s+(?:ONLY\s+)?(?:public\s*\.\s*)?report_versions\b[\s\S]*?;`, 'gi'),
    ) || []
    for (const stmt of alters) {
      for (const m of stmt.matchAll(
        new RegExp(String.raw`\bADD\s+COLUMN\s+(?:IF\s+NOT\s+EXISTS\s+)?${IDENT}`, 'gi'))) {
        add(m[1].toLowerCase())
      }
      for (const m of stmt.matchAll(
        new RegExp(String.raw`\bDROP\s+COLUMN\s+(?:IF\s+EXISTS\s+)?${IDENT}`, 'gi'))) {
        drop(m[1].toLowerCase())
      }
      // RENAME COLUMN, handled IN PLACE so ordinal position is preserved.
      //
      // ⚠️ Added after this module's first draft omitted it, which was a
      // FAIL-OPEN and not a cosmetic gap: OD-4 renamed four columns, so a
      // future rename is the single most likely schema event here. Without
      // this branch the derivation keeps the OLD name and never learns the
      // new one, every consumer scans for a column that no longer exists,
      // and the per-consumer anchors do NOT catch it -- the count is still
      // four and none of the names is a SUPERSEDED one. It would be green
      // and blind, which is the exact defect this module exists to end.
      //
      // `ALTER COLUMN ... SET/DROP ...` is deliberately NOT matched: it
      // changes a property, not the column set.
      for (const m of stmt.matchAll(
        new RegExp(String.raw`\bRENAME\s+(?:COLUMN\s+)?${IDENT}\s+TO\s+${IDENT}`, 'gi'))) {
        const from = m[1].toLowerCase()
        const to = m[2].toLowerCase()
        const i = cols.indexOf(from)
        if (i >= 0) cols[i] = to
        else add(to)
      }
    }
  }
  return cols
}

/** Narrative panel columns = current columns MINUS the structural set. */
export function derivePanelColumns(migDir) {
  return deriveReportVersionColumns(migDir)
    .filter((c) => !STRUCTURAL_VERSION_COLUMNS.includes(c))
}

/** Columns no governed path may write after a version row is INSERTed. */
export function deriveImmutableVersionColumns(migDir) {
  return deriveReportVersionColumns(migDir)
    .filter((c) => !POST_INSERT_WRITABLE_COLUMNS.includes(c))
}

/**
 * ANCHOR CHECK. Compare the text derivation against the LIVE catalogue.
 *
 * Without this the derivation is unfalsifiable: a regex that silently
 * matched nothing would yield an empty panel list, every consumer would
 * scan for nothing, and every one of them would report PASS. Q-26 --
 * "negative controls must assert their anchor exists and fail closed;
 * never a vacuous PASS."
 *
 * @param {string[]} derived from derivePanelColumns()
 * @param {string[]} live from pg_attribute, structural columns already removed
 * @returns {string[]} problems; empty means the anchor holds
 */
export function assertPanelAnchor(derived, live) {
  const problems = []
  if (derived.length === 0) {
    problems.push('the panel derivation produced ZERO columns -- every consumer would scan for '
      + 'nothing and pass vacuously')
  }
  if (derived.length !== 4) {
    problems.push(`the panel derivation produced ${derived.length} column(s) (${derived.join(', ') || 'none'}); `
      + 'OD-4 ratifies EXACTLY FOUR narrative panels, so either a panel was added/removed or a new '
      + 'STRUCTURAL column is being misclassified as a panel')
  }
  const d = [...derived].sort().join(',')
  const l = [...live].sort().join(',')
  if (d !== l) {
    problems.push(`the text derivation [${d}] disagrees with the live catalogue [${l}] -- `
      + 'the derivation is wrong and every consumer is scanning for the wrong names')
  }
  for (const old of SUPERSEDED_PANEL_COLUMNS) {
    if (live.includes(old)) {
      problems.push(`the superseded panel column "${old}" still exists in the live catalogue`)
    }
  }
  return problems
}
