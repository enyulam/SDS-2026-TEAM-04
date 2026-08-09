#!/usr/bin/env node
// =====================================================================
// B.E.S.T Coach -- Step 7I acceptance suite: STATIC (S) proofs
// =====================================================================
// The file-level and repository-level legs of the Step 7I acceptance
// contract -- the ones that cannot be asserted from the database catalogue
// because they are properties of the migration TEXT or of the repository.
//
// Covers: T7I-40 in full, and the static legs of T7I-2, T7I-6, T7I-18,
// T7I-20(c), T7I-44, T7I-51, T7I-62, T7I-73 and T7I-74.
//
// Run: node scripts/tests/step-7i/static-scan.mjs
// =====================================================================

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { discoverSerializers, assertAnchors, guardedFunctions, findForbiddenGrants,
  findMissingRevokes, EXPECTED_SERIALIZERS } from './od4-grant-guard.mjs'
import { derivePanelColumns, deriveImmutableVersionColumns, deriveReportVersionColumns,
  POST_INSERT_WRITABLE_COLUMNS, SUPERSEDED_PANEL_COLUMNS } from './od4-panel-guard.mjs'

const ROOT = process.cwd()
const MIG_DIR = join(ROOT, 'supabase', 'migrations')
const FILE_1 = '20260805090000_step_7i_report_status_trainer_approved.sql'
const FILE_2 = '20260805090500_step_7i_report_lifecycle.sql'

let failures = 0
const fail = (id, message) => { failures += 1; console.error(`FAIL ${id}: ${message}`) }
const pass = (id, message) => console.log(`PASS ${id}${message ? ' -- ' + message : ''}`)

// `--` comments carry prose that legitimately contains SQL keywords, so every
// keyword scan below runs against a comment-stripped copy. A scan that
// flagged a comment would be a false positive, not a finding.
const stripComments = (sql) => sql.replace(/--[^\n]*/g, '')

const file1 = readFileSync(join(MIG_DIR, FILE_1), 'utf8')
const file2 = readFileSync(join(MIG_DIR, FILE_2), 'utf8')
const body1 = stripComments(file1)
const body2 = stripComments(file2)

// ---------------------------------------------------------------------
// T7I-73 -- migration split and enum label position (static legs)
// ---------------------------------------------------------------------
{
  const step7i = readdirSync(MIG_DIR).filter((f) => f.startsWith('20260805'))
  if (step7i.length !== 2) {
    fail('T7I-73', `${step7i.length} Step 7I migration files exist, expected exactly 2`)
  }
  const all = readdirSync(MIG_DIR).filter((f) => f.endsWith('.sql'))
  if (all.length !== 17) fail('T7I-73', `${all.length} migration files exist, expected 17`) // + the STAGE 1 attendance write path + the STAGE 1 report_source_map // 5 through Step 7I + the B2 assessment migration + the B2.1 correction-tracking migration + the B-V2-1 competency-vocabulary rename + the C2 report-context resolver + the C2-A atomic complete-save composer + the C3-A single-entry-point closure + the C3-A Phase 2b Management submitted-report list + the P1-T03 OD-4 report contract + the P1-T03 OD-4 reopen envelope-version forward fix + the M15 content_hash_version default removal

  // File 1 contains ONLY the ALTER TYPE statement and the P-1 guard.
  const adds1 = body1.match(/ALTER TYPE[\s\S]*?ADD VALUE/gi) || []
  if (adds1.length !== 1) fail('T7I-73', `file 1 has ${adds1.length} ADD VALUE statements, expected 1`)
  if (!/ADD VALUE 'trainer_approved' AFTER 'needs_edit'/.test(body1)) {
    fail('T7I-73', "file 1 does not add 'trainer_approved' AFTER 'needs_edit'")
  }
  for (const forbidden of ['CREATE TABLE', 'CREATE TYPE', 'CREATE FUNCTION', 'CREATE INDEX',
                           'ALTER TABLE', 'GRANT ', 'REVOKE ', 'CREATE POLICY']) {
    if (body1.toUpperCase().includes(forbidden.toUpperCase())) {
      fail('T7I-73', `file 1 contains a forbidden statement: ${forbidden.trim()}`)
    }
  }
  if (!/current_user <> 'postgres'/.test(body1)) fail('T7I-73', 'file 1 has no P-1 guard')

  // File 2 contains NO ALTER TYPE ... ADD VALUE.
  if (/ALTER TYPE[\s\S]{0,200}?ADD VALUE/i.test(body2)) {
    fail('T7I-73', 'file 2 contains an ALTER TYPE ... ADD VALUE')
  }

  // No LANGUAGE sql and no SQL-standard BEGIN ATOMIC body anywhere in
  // Step 7I -- the second, independent route to "unsafe use of new value".
  for (const [name, body] of [[FILE_1, body1], [FILE_2, body2]]) {
    if (/LANGUAGE\s+sql\b/i.test(body)) fail('T7I-73', `${name} contains a LANGUAGE sql body`)
    if (/\bBEGIN\s+ATOMIC\b/i.test(body)) fail('T7I-73', `${name} contains a BEGIN ATOMIC body`)
  }
  if (failures === 0) pass('T7I-73', 'two files, label position, no sql/BEGIN ATOMIC body')
}

// ---------------------------------------------------------------------
// T7I-OD4-GRANT -- no owner-only function is granted to a client role,
// anywhere in the COMPLETE current migration corpus (operator ruling PD-2).
//
// This is the authoring-time counterpart to the runtime zero-EXECUTE
// assertions. It reads EVERY .sql file in supabase/migrations, including
// whichever migration is being authored right now, so a stray
// `GRANT EXECUTE ON FUNCTION public.report_content_hash_v2(...) TO
// authenticated;` is rejected before the migration is ever applied.
//
// It replaces a false claim in the execution plan: ct-static.mjs:214 pins one
// already-applied migration by name and can never see a new one.
//
// EXPECTED_SERIALIZERS is pinned deliberately. Serializer DISCOVERY is
// automatic, so V2 is guarded the moment M13 creates it with no second edit
// to remember -- but an unpinned discovery scan would also pass vacuously if
// the naming convention drifted and the regex stopped matching. The pin is
// what converts silence into a loud failure. RE-PIN IT IN THE SAME COMMIT
// that legitimately adds a serializer: 2 today, 4 once M13 lands.
// ---------------------------------------------------------------------
{
  const files = readdirSync(MIG_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort()
    .map((name) => ({ name, sql: readFileSync(join(MIG_DIR, name), 'utf8') }))

  const serializers = discoverSerializers(files)
  const anchorProblems = assertAnchors(serializers, EXPECTED_SERIALIZERS)
  for (const p of anchorProblems) fail('T7I-OD4-GRANT', p)

  const guarded = guardedFunctions(files)
  const violations = findForbiddenGrants(files, guarded)
  for (const v of violations) {
    fail('T7I-OD4-GRANT',
      `${v.file} [${v.kind}] hands ${v.fn} to ${v.role}: ${v.statement}`)
  }

  // A guarded function created (or DROPped and re-created) without an
  // explicit REVOKE after it can ship client-executable with no GRANT
  // statement anywhere for the scan above to find.
  //
  // ⚠️ This passed `serializers` until 2026-08-09, which silently exempted
  // the two NON-serializer owner-only functions -- `report_store_draft` and
  // `app_parent_reaches_student` -- while the PASS message below claimed
  // all six were guarded. M13 DROPs and re-creates `report_store_draft`, so
  // deleting its single REVOKE left this guard fully green. It now takes
  // `guarded`, which is the same set the message names.
  const missing = findMissingRevokes(files, guarded)
  for (const m of missing) fail('T7I-OD4-GRANT', m)

  if (anchorProblems.length === 0 && violations.length === 0 && missing.length === 0) {
    pass('T7I-OD4-GRANT',
      `${files.length} migration file(s) scanned; ${guarded.length} owner-only function(s) guarded `
      + `(${guarded.join(', ')}); no client GRANT, no blanket/default-privilege grant, no dynamic-SQL `
      + `grant, and all ${guarded.length} carry an explicit REVOKE after their most recent `
      + 'CREATE or DROP+CREATE')
  }
}

// ---------------------------------------------------------------------
// T7I-76 -- no migration AFTER M15 restores a DEFAULT on
//           report_versions.content_hash_version
// ---------------------------------------------------------------------
// THE AUTHORING-TIME HALF of the default-removal control. Its runtime
// sibling is T7I-77 in lifecycle-canonical.sql.
//
// Why both are needed, and why neither alone is sufficient:
//
//   * T7I-77 reads the LIVE catalogue, so it catches a restored default
//     only AFTER someone has applied the migration that restored it.
//   * This scan reads the migration TEXT, including the file currently
//     being authored, so it refuses the change BEFORE it is applied --
//     the same reason T7I-OD4-GRANT exists as a text scan alongside the
//     runtime ACL assertions.
//   * M15's own end-of-migration assertion is point-in-time and cannot
//     see a LATER migration at all.
//
// SCOPE IS FORWARD-ONLY, BY DESIGN. Migrations at or before M15 are
// EXEMPT, because 20260805090500_step_7i_report_lifecycle.sql legitimately
// contains `ADD COLUMN content_hash_version smallint NOT NULL DEFAULT 1`
// and M15 itself contains a deliberate `SET DEFAULT 1` inside its C8
// firing probe (restored and rolled back inside a subtransaction to prove
// the detector works). Those are correct history, not violations -- and
// scanning them would make this control unpassable, which is how a
// well-meant guard gets deleted.
//
// HONEST LIMIT: this is a text scan, not a SQL parser. It cannot see a
// default set through dynamic SQL (`EXECUTE format(...)`), so it is a
// NECESSARY, not sufficient, control -- T7I-77 remains the authority on
// the live catalogue, and it reads pg_attrdef, which no authoring trick
// can hide from.
{
  const before = failures
  const M15 = '20260809180000_od4_content_hash_version_no_default.sql'
  const all = readdirSync(MIG_DIR).filter((f) => f.endsWith('.sql')).sort()

  // ANCHOR EXISTENCE. If M15 is renamed or deleted, every later file
  // becomes un-scanned and this control would pass on an empty set --
  // exactly the vacuous-PASS shape Q-26 prohibits.
  if (!all.includes(M15)) {
    fail('T7I-76', `the default-removal migration ${M15} is missing from the tree -- `
      + 'this control cannot establish which files are in forward scope')
  } else {
    const later = all.slice(all.indexOf(M15) + 1)

    // The `SET DEFAULT` form and the `ALTER COLUMN ... DEFAULT` spelling,
    // matched against comment-stripped text so a prose mention of the
    // ruling is not a false positive.
    // The identifier may be quoted (`"content_hash_version"`), and the
    // COLUMN keyword is optional in both forms -- review found the first
    // draft evadable by either. Both are now accepted.
    const COL = String.raw`"?content_hash_version"?`
    const re = new RegExp(String.raw`ALTER\s+(?:COLUMN\s+)?${COL}\b[\s\S]{0,120}?\bSET\s+DEFAULT\b`, 'i')
    const reAdd = new RegExp(String.raw`\bADD\s+(?:COLUMN\s+)?(?:IF\s+NOT\s+EXISTS\s+)?${COL}\b[\s\S]{0,160}?\bDEFAULT\b`, 'i')

    for (const f of later) {
      const body = stripComments(readFileSync(join(MIG_DIR, f), 'utf8'))
      if (re.test(body) || reAdd.test(body)) {
        fail('T7I-76', `${f} sets a DEFAULT on report_versions.content_hash_version. `
          + 'The Operator ruled (2026-08-09) that this column MUST HAVE NO DEFAULT: both 1 and 2 '
          + 'are valid provenance, so an implicit value is the database guessing which serializer '
          + 'produced a stored digest. Restoring a default -- 1 OR 2 -- requires a NEW explicit '
          + 'Operator ruling, not a migration.')
      }
    }

    if (failures === before) {
      pass('T7I-76', `${later.length} migration file(s) sort after ${M15}; none restores a DEFAULT on `
        + 'report_versions.content_hash_version (the runtime authority is T7I-77)')
    }
  }
}

// ---------------------------------------------------------------------
// T7I-2 -- exact object inventory, counted from the migration text
// ---------------------------------------------------------------------
{
  const before = failures
  const types = (body2.match(/^CREATE TYPE public\./gm) || []).length
  if (types !== 2) fail('T7I-2', `file 2 creates ${types} enum types, expected exactly 2`)

  const tables = (body2.match(/^CREATE TABLE public\./gm) || []).length
  if (tables !== 1) fail('T7I-2', `file 2 creates ${tables} tables, expected exactly 1`)

  const fns = (body2.match(/^CREATE FUNCTION public\./gm) || []).length
  if (fns !== 18) fail('T7I-2', `file 2 creates ${fns} functions, expected exactly 18`)

  const idx = (body2.match(/^CREATE (UNIQUE )?INDEX/gm) || []).length
  if (idx !== 1) fail('T7I-2', `file 2 creates ${idx} indexes, expected exactly 1 (the ratified open-correction partial unique index)`)

  const addCols = (body2.match(/ADD COLUMN /g) || []).length
  if (addCols !== 3) fail('T7I-2', `file 2 adds ${addCols} columns, expected exactly 3`)

  // Four constraint replacements and one default drop, and no others.
  const dropped = (body2.match(/DROP CONSTRAINT /g) || []).length
  if (dropped !== 4) fail('T7I-2', `file 2 drops ${dropped} constraints, expected exactly 4`)
  const dropDefaults = (body2.match(/DROP DEFAULT/g) || []).length
  if (dropDefaults !== 1) fail('T7I-2', `file 2 drops ${dropDefaults} column defaults, expected exactly 1`)

  // No policy, no table grant, no service_role grant anywhere.
  if (/CREATE POLICY/i.test(body2)) fail('T7I-2', 'file 2 creates an RLS policy')
  if (/GRANT[^;]*ON TABLE/i.test(body2)) fail('T7I-2', 'file 2 grants a table privilege')
  if (/GRANT[^;]*TO[^;]*service_role/i.test(body2)) fail('T7I-2', 'file 2 grants something to service_role')
  if (/CREATE TRIGGER/i.test(body2)) fail('T7I-2', 'file 2 creates a trigger (U-7I-9 forbids guard triggers)')
  // Scoped to an actual ALTER TABLE: the migration's own posture assertion
  // legitimately mentions the phrase inside a RAISE message.
  if (/ALTER TABLE[^;]*FORCE ROW LEVEL SECURITY/i.test(body2)) fail('T7I-2', 'file 2 forces row-level security')
  if (/CREATE EXTENSION/i.test(body2)) fail('T7I-2', 'file 2 installs an extension')

  // Exactly 14 authenticated grants.
  const grants = (body2.match(/^GRANT EXECUTE ON FUNCTION[\s\S]*?TO authenticated;$/gm) || []).length
  if (grants !== 14) fail('T7I-2', `file 2 has ${grants} authenticated EXECUTE grants, expected exactly 14`)

  if (failures === before) pass('T7I-2', '2 enums, 1 table, 18 functions, 3 columns, 4 constraint replacements, 1 default drop, 14 grants')
}

// ---------------------------------------------------------------------
// T7I-44 -- the emptiness precondition runs BEFORE any NOT NULL column or
// constraint replacement
// ---------------------------------------------------------------------
{
  const before = failures
  const precondition = body2.indexOf('Step 7I migration 2 aborted before any change: public.%')
  const firstAddColumn = body2.indexOf('ADD COLUMN')
  const firstDropConstraint = body2.indexOf('DROP CONSTRAINT')
  if (precondition < 0) fail('T7I-44', 'no emptiness precondition exists')
  if (firstAddColumn >= 0 && precondition > firstAddColumn) {
    fail('T7I-44', 'the emptiness precondition runs AFTER the first ADD COLUMN')
  }
  if (firstDropConstraint >= 0 && precondition > firstDropConstraint) {
    fail('T7I-44', 'the emptiness precondition runs AFTER the first constraint replacement')
  }
  for (const t of ['reports', 'report_versions', 'report_version_ratings',
                   'report_version_checklist_progress', 'report_version_approvals']) {
    if (!body2.includes(`'${t}'`)) fail('T7I-44', `the emptiness precondition does not cover ${t}`)
  }
  if (failures === before) pass('T7I-44', 'emptiness asserted first, over all five report tables')
}

// ---------------------------------------------------------------------
// Extract each function's CURRENT body once, for the body-level scans
// below.
// ---------------------------------------------------------------------
// 🔴 REBUILT AT P1-T04. This map was previously derived from `body2` --
// `20260805090500_step_7i_report_lifecycle.sql` ALONE -- so every
// body-level leg below asserted properties of SUPERSEDED text. M13
// replaced ELEVEN function bodies and M14 a twelfth; a guard that reads
// only the original file cannot see what the database actually runs, and
// would keep reporting PASS however the current body changed. Adversarial
// review found this at P1-T03 (finding 5) and registered it here.
//
// The corpus is now replayed in LEDGER ORDER and a later definition
// OVERWRITES an earlier one, so what is scanned is what is applied. Both
// authoring styles are handled: `CREATE FUNCTION` with an `AS $fn$` body
// (Step 7E-7I) and `CREATE OR REPLACE FUNCTION` with `AS $function$`
// (M13/M14). Keying on one tag was itself a silent-miss risk -- the
// eleven M13 bodies use the other one.
const fnBodies = new Map()
{
  const files = readdirSync(MIG_DIR).filter((f) => f.endsWith('.sql')).sort()
  const re = /^CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+public\.([a-z0-9_]+)\s*\(/gm
  for (const f of files) {
    const src = readFileSync(join(MIG_DIR, f), 'utf8')
    let m
    re.lastIndex = 0
    while ((m = re.exec(src)) !== null) {
      // Find this definition's body tag, then its matching terminator, so a
      // `$fn$` appearing inside a `$function$` body cannot end it early.
      const tagMatch = /\bAS\s+(\$[a-z_]*\$)/i.exec(src.slice(m.index))
      if (!tagMatch) continue
      const tag = tagMatch[1]
      const bodyStart = m.index + tagMatch.index + tagMatch[0].length
      const end = src.indexOf(tag, bodyStart)
      if (end < 0) continue
      fnBodies.set(m[1], src.slice(m.index, end + tag.length + 1))
    }
  }
}

// ---------------------------------------------------------------------
// T7I-20(c) -- RPC-11's approval INSERT and its two transitions occupy ONE
// uninterrupted transaction
// ---------------------------------------------------------------------
{
  const before = failures
  const fn = fnBodies.get('report_management_approve_and_submit')
  if (!fn) fail('T7I-20', 'report_management_approve_and_submit was not found')
  else {
    const stripped = stripComments(fn)
    if (/\bCOMMIT\b/i.test(stripped)) fail('T7I-20', 'RPC-11 contains a COMMIT')
    if (/\bSAVEPOINT\b/i.test(stripped)) fail('T7I-20', 'RPC-11 contains a SAVEPOINT')
    if (/\bROLLBACK\b/i.test(stripped)) fail('T7I-20', 'RPC-11 contains a ROLLBACK')
    if (/\bEXCEPTION\s+WHEN\b/i.test(stripped)) {
      fail('T7I-20', 'RPC-11 contains an exception handler, which would open an implicit savepoint across the two transitions')
    }
    if (/SET\s+(LOCAL\s+)?TRANSACTION/i.test(stripped)) fail('T7I-20', 'RPC-11 sets transaction state')
    // The approval INSERT precedes both transitions, and both transitions
    // precede the function's end.
    const ins = stripped.indexOf('INSERT INTO public.report_version_approvals')
    const t1 = stripped.indexOf("SET status = 'approved'")
    const t2 = stripped.indexOf("SET status = 'submitted'")
    if (!(ins >= 0 && t1 > ins && t2 > t1)) {
      fail('T7I-20', 'the approval INSERT and the two transitions are not in the ratified order')
    }
    if (failures === before) pass('T7I-20', 'steps 9-11 are one uninterrupted transaction, in order')
  }
}

// ---------------------------------------------------------------------
// T7I-51 / T7I-18 -- RPC-9 writes only reports and the new version rows
// ---------------------------------------------------------------------
{
  const before = failures
  const fn = stripComments(fnBodies.get('report_management_edit_wording') || '')
  if (!fn) fail('T7I-51', 'report_management_edit_wording was not found')
  else {
    const writes = [...fn.matchAll(/\b(INSERT INTO|UPDATE|DELETE FROM)\s+public\.([a-z_]+)/gi)]
      .map((m) => m[2])
    const allowed = new Set(['reports', 'report_versions', 'report_version_ratings'])
    for (const w of writes) {
      if (!allowed.has(w)) fail('T7I-51', `RPC-9 writes public.${w}, which is outside the allow-list`)
    }
    for (const forbidden of ['observations', 'observation_ratings', 'attendance',
                             'report_version_checklist_progress', 'report_version_approvals']) {
      if (writes.includes(forbidden)) fail('T7I-51', `RPC-9 writes public.${forbidden}`)
    }
    if (failures === before) pass('T7I-51', `RPC-9 writes only ${[...new Set(writes)].join(', ')}`)
  }
}

// ---------------------------------------------------------------------
// T7I-18 -- no RPC mutates a version's content, hashes, lineage or
// authorship after INSERT
// ---------------------------------------------------------------------
{
  const before = failures

  // 🔴 RE-DERIVED AT P1-T04, Q-7 ("catalog-derived detection preferred").
  //
  // This list used to name the four SUPERSEDED panel columns literally. M13
  // renamed them, and the assertion then passed green while detecting
  // nothing: `UPDATE public.report_versions SET overview = ...` was invisible
  // to it. The list also had to be maintained by hand, so it could only ever
  // cover columns that existed when it was written.
  //
  // The set is now derived by SUBTRACTION from the corpus: every current
  // report_versions column EXCEPT T11's write-once submission metadata and
  // updated_at. That covers content_hash_version and
  // trainer_approved_source_version_id for the same reason it covers a
  // column added tomorrow, and it survives the NEXT rename without an edit.
  const forbiddenCols = deriveImmutableVersionColumns(MIG_DIR)

  // ANCHOR (Q-26) -- an EQUALITY, not a magnitude floor.
  //
  // 🔴 This was `length < 12` against an actual 15, which left THREE columns
  // of silent slack: a derivation bug that lost up to three columns satisfied
  // the anchor and silently stopped scanning them. Adversarial review flagged
  // it, and it is the same "the check is satisfied but detects less" shape
  // this whole task exists to remove.
  const allCols = deriveReportVersionColumns(MIG_DIR)
  const expectedForbidden = allCols.length - POST_INSERT_WRITABLE_COLUMNS.length
  if (allCols.length === 0 || forbiddenCols.length !== expectedForbidden) {
    fail('T7I-18', `the immutable-column derivation produced ${forbiddenCols.length} column(s) from a `
      + `${allCols.length}-column table, expected exactly ${expectedForbidden} -- the derivation is `
      + 'broken and this leg would scan an incomplete set')
  }
  // The columns whose immutability is the POINT of this leg must be present
  // by name. A derivation that silently dropped them would still satisfy a
  // count check if it also invented others.
  for (const required of [...derivePanelColumns(MIG_DIR), 'content_hash', 'content_hash_version',
                          'revision_number', 'derived_from_version_id']) {
    if (!forbiddenCols.includes(required)) {
      fail('T7I-18', `the derivation lost the immutable column "${required}" -- it would not be scanned`)
    }
  }
  for (const old of SUPERSEDED_PANEL_COLUMNS) {
    if (forbiddenCols.includes(old)) {
      fail('T7I-18', `the derivation still yields the superseded panel column "${old}" -- the corpus `
        + 'replay is reading pre-OD-4 DDL as current')
    }
  }

  // 🔴 REWRITTEN after adversarial review DISPROVED the previous version's
  // claim to be "strictly stronger".
  //
  // The previous version took the SET clause as `/\bSET\b(.*?)(?:\bWHERE\b|$)/`
  // and then tested `\bcol\s*=` against it, while testing the write-once
  // GUARD against the whole statement. Four demonstrated bypasses:
  //
  //   1. `SET (overview, remarks) = (v_a, v_b)` -- the multi-column
  //      assignment form assigns no `col =` token, so NOTHING matched.
  //   2. `SET updated_at = (SELECT ... WHERE ...), overview = 'T'` -- a
  //      subquery's WHERE truncated the SET clause before `overview`.
  //   3. `SET remarks = 'see the WHERE clause', overview = 'T'` -- a WHERE
  //      inside a STRING LITERAL truncated it the same way.
  //   4. `SET overview='T' WHERE rv.submitted_at = v_now AND
  //      rv.submitted_at IS NULL` -- the guard was tested against the whole
  //      statement, so a WHERE-clause mention satisfied both of its legs.
  //
  // Combined, (1)+(4) was a COMPLETE bypass of T7I-18 on the one table whose
  // committed content must never be mutated.
  //
  // The rewrite: blank string literals first, split at the TOP-LEVEL WHERE
  // (paren depth 0), match BOTH assignment forms, and evaluate the guard's
  // two legs against the clause each actually belongs to.
  const blankLiterals = (s) => s.replace(/'(?:[^']|'')*'/g, (m) => "'" + ' '.repeat(Math.max(0, m.length - 2)) + "'")

  const splitAtTopLevelWhere = (s) => {
    let depth = 0
    for (let i = 0; i < s.length; i += 1) {
      const c = s[i]
      if (c === '(') depth += 1
      else if (c === ')') depth -= 1
      else if (depth === 0 && /\s/.test(c) && /^where\b/i.test(s.slice(i + 1))) {
        return [s.slice(0, i), s.slice(i + 1)]
      }
    }
    return [s, '']
  }

  for (const [name, raw] of fnBodies) {
    const fn = stripComments(raw)
    const updates = [...fn.matchAll(/UPDATE\s+public\.report_versions[\s\S]*?(?=;)/gi)].map((m) => m[0])
    for (const u of updates) {
      const safe = blankLiterals(u)
      const setIdx = safe.search(/\bSET\b/i)
      if (setIdx < 0) {
        fail('T7I-18', `${name} has an UPDATE on report_versions with no SET clause this scan can read`)
        continue
      }
      const [setClause, whereClause] = splitAtTopLevelWhere(safe.slice(setIdx + 3))

      // (a) single-column assignments: `col = ...`
      for (const col of forbiddenCols) {
        if (new RegExp(`\\b${col}\\s*=`).test(setClause)) {
          fail('T7I-18', `${name} UPDATEs report_versions.${col} after INSERT`)
        }
      }
      // (b) MULTI-COLUMN assignment: `(a, b) = (x, y)`. Every identifier
      //     inside a parenthesised group that is followed by `=` is assigned.
      for (const m of setClause.matchAll(/\(([^()]*)\)\s*=/g)) {
        for (const ident of m[1].split(',').map((x) => x.trim().replace(/^"|"$/g, '').toLowerCase())) {
          if (forbiddenCols.includes(ident)) {
            fail('T7I-18', `${name} UPDATEs report_versions.${ident} after INSERT (multi-column assignment)`)
          }
        }
      }

      // The sole permitted post-approval write is T11's one-time submission
      // metadata. The ASSIGNMENT must be in the SET clause and the write-once
      // GUARD must be in the WHERE clause -- testing either against the whole
      // statement is what bypass (4) exploited.
      if (!/\bsubmitted_at\s*=/i.test(setClause)) {
        fail('T7I-18', `${name} performs an UPDATE on report_versions that is not the write-once submission write`)
      } else if (!/\bsubmitted_at\s+IS\s+NULL\b/i.test(whereClause)) {
        fail('T7I-18', `${name}'s submission write is not guarded on submitted_at IS NULL in its WHERE clause`)
      }
    }
  }
  if (failures === before) pass('T7I-18', 'the only report_versions UPDATE is T11\'s guarded write-once submission write')
}

// ---------------------------------------------------------------------
// T7I-6 -- no (from, to) pair outside the fourteen legal ones is expressible
// ---------------------------------------------------------------------
{
  const before = failures
  const LEGAL = new Set([
    'incomplete->observation_saved', 'observation_saved->drafting', 'drafting->draft_ready',
    'drafting->observation_saved', 'draft_ready->draft_ready', 'needs_edit->draft_ready',
    'draft_ready->trainer_approved', 'needs_edit->trainer_approved',
    'trainer_approved->trainer_approved', 'trainer_approved->needs_edit',
    'trainer_approved->approved', 'approved->submitted', 'submitted->needs_edit',
  ])
  const emitted = new Set()
  for (const [, raw] of fnBodies) {
    const fn = stripComments(raw)
    // Every state-change append writes its triple as three adjacent literals
    // in the same call: 'report.state_changed', 'report', <from>, <to>.
    const re = /'report\.state_changed',\s*'report',\s*([^,]+),\s*'([a-z_]+)'/g
    let m
    while ((m = re.exec(fn)) !== null) {
      const from = m[1].trim()
      const to = m[2]
      if (/^'[a-z_]+'$/.test(from)) emitted.add(`${from.slice(1, -1)}->${to}`)
      else emitted.add(`<dynamic>->${to}`)
    }
  }
  for (const pair of emitted) {
    if (pair.startsWith('<dynamic>')) {
      // RPC-8's from-status is the report's own status, already constrained
      // by the domain check to {draft_ready, needs_edit}.
      const to = pair.split('->')[1]
      if (to !== 'trainer_approved') fail('T7I-6', `a dynamic from-status emits an unexpected target: ${pair}`)
      continue
    }
    if (!LEGAL.has(pair)) fail('T7I-6', `an illegal (from, to) pair is expressible: ${pair}`)
  }
  if (failures === before) pass('T7I-6', `${emitted.size} distinct emitted transitions, all inside the fourteen legal pairs`)
}

// ---------------------------------------------------------------------
// T7I-62 -- every audit call site uses one of the six generic labels
// ---------------------------------------------------------------------
{
  const before = failures
  const LABELS = new Set(['Report', 'Report version', 'Student', 'Class session',
                          'Observation', 'Correction request'])
  let sites = 0

  // SCOPE: audit CALL SITES, never the audit IMPLEMENTATION.
  //
  // T7I-62's rule is that a governed RPC labels its audit targets from a
  // fixed generic vocabulary. `audit_append_event` and its siblings are the
  // CALLEE that defines the event schema: their bodies name `target_type`
  // and `payload_canonical` as JSONB KEYS, not as labels, so asserting the
  // label vocabulary against them is a category error and reports three
  // findings that are not defects.
  //
  // Before P1-T04 this leg read only the Step 7I file, so the audit
  // implementation was out of scope by ACCIDENT. Now that the corpus is
  // complete the exclusion has to be STATED -- and it is anchored below, so
  // excluding too much cannot quietly empty the scan.
  const IMPLEMENTATION = /^audit_/
  let callSiteFns = 0

  for (const [name, raw] of fnBodies) {
    if (IMPLEMENTATION.test(name)) continue
    callSiteFns += 1
    const fn = stripComments(raw)
    for (const m of fn.matchAll(/'target_label',\s*'([^']*)'/g)) {
      sites += 1
      if (!LABELS.has(m[1])) fail('T7I-62', `${name} emits a non-generic related target_label: "${m[1]}"`)
    }
    // The primary target triple is `'<type>', <id expression>, '<Label>',`
    // followed by the related-targets argument. Anchoring on that following
    // argument is what distinguishes it from the STATE triple, whose middle
    // element is itself a quoted literal.
    for (const m of fn.matchAll(/'(report|report_version)',\s*([A-Za-z_][A-Za-z0-9_.]*),\s*'([^']+)',\s*(?:NULL|pg_catalog\.jsonb_build_array)/g)) {
      sites += 1
      if (!LABELS.has(m[3])) fail('T7I-62', `${name} emits a non-generic primary target_label: "${m[3]}"`)
    }
    // The correction reason parameter must never reach an audit call.
    const appendCalls = [...fn.matchAll(/audit_append_event\([\s\S]*?\n  \);/g)].map((m) => m[0])
    for (const call of appendCalls) {
      if (/p_reason/.test(call)) fail('T7I-62', `${name} passes the correction reason into an audit event`)
    }
  }
  if (sites === 0) fail('T7I-62', 'no audit target labels were found to scan')
  if (callSiteFns < 20) {
    fail('T7I-62', `only ${callSiteFns} non-audit function bodies were in scope -- the implementation `
      + 'exclusion is over-broad and this leg is scanning a fraction of the corpus')
  }
  if (failures === before) pass('T7I-62', `${sites} audit label sites across ${callSiteFns} call-site function bodies, all generic constants; no reason text reaches an append`)
}

// ---------------------------------------------------------------------
// T7I-74 -- both approval-writing RPCs supply approver_role LITERALLY
// ---------------------------------------------------------------------
{
  const before = failures
  for (const name of ['report_trainer_approve', 'report_management_approve_and_submit']) {
    const fn = stripComments(fnBodies.get(name) || '')
    const ins = fn.match(/INSERT INTO public\.report_version_approvals[\s\S]*?;/)
    if (!ins) { fail('T7I-74', `${name} has no approvals INSERT`); continue }
    if (!/approver_role/.test(ins[0])) fail('T7I-74', `${name} omits approver_role from its approvals INSERT`)
    const role = name === 'report_trainer_approve' ? "'trainer'" : "'management'"
    if (!ins[0].includes(role)) fail('T7I-74', `${name} does not supply ${role} literally`)
  }
  if (/ALTER COLUMN approver_role SET DEFAULT/i.test(body2)) {
    fail('T7I-74', 'file 2 restores a DEFAULT on approver_role')
  }
  if (failures === before) pass('T7I-74', 'both approval RPCs supply approver_role literally; no default is restored')
}

// ---------------------------------------------------------------------
// T7I-R22 -- the report-context resolver migration's static posture
// ---------------------------------------------------------------------
// The file-level legs of the R-22 boundary: exactly ONE function and no
// other object, SECURITY DEFINER with a pinned EMPTY search_path, EXECUTE
// granted to `authenticated` ONLY through a signature-qualified
// REVOKE-then-GRANT pair, and a projection of exactly two identifiers.
// These are properties of the migration TEXT; the catalogue legs live in
// the migration's own assertions and in the canonical fixture verifier.
{
  const before = failures
  const FILE_R = '20260806190000_report_context_resolver.sql'
  const SIG = 'public.report_resolve_context(uuid)'
  if (!existsSync(join(MIG_DIR, FILE_R))) {
    fail('T7I-R22', `${FILE_R} does not exist`)
  } else {
    const raw = readFileSync(join(MIG_DIR, FILE_R), 'utf8')
    const src = stripComments(raw)

    // (a) EXACTLY ONE function, and no other object of any kind.
    const fns = (src.match(/^CREATE FUNCTION public\./gm) || []).length
    if (fns !== 1) fail('T7I-R22', `the resolver migration creates ${fns} functions, expected exactly 1`)
    if (/CREATE OR REPLACE/i.test(src)) fail('T7I-R22', 'the resolver migration replaces an existing function')
    for (const forbidden of ['CREATE TABLE', 'CREATE TYPE', 'ALTER TYPE', 'ADD COLUMN',
                             'DROP COLUMN', 'ADD CONSTRAINT', 'DROP CONSTRAINT',
                             'CREATE INDEX', 'CREATE UNIQUE INDEX', 'CREATE POLICY',
                             'CREATE TRIGGER', 'CREATE VIEW', 'CREATE EXTENSION',
                             'CREATE SCHEMA', 'ALTER DEFAULT PRIVILEGES', 'OWNER TO']) {
      if (src.toUpperCase().includes(forbidden)) {
        fail('T7I-R22', `the resolver migration contains a forbidden statement: ${forbidden}`)
      }
    }
    if (/GRANT[^;]*ON TABLE/i.test(src)) fail('T7I-R22', 'the resolver migration grants a table privilege')

    // (b) SECURITY DEFINER, STABLE, plpgsql, pinned EMPTY search_path.
    if (!/LANGUAGE\s+plpgsql/i.test(src)) fail('T7I-R22', 'the resolver is not plpgsql')
    if (/LANGUAGE\s+sql\b/i.test(src)) fail('T7I-R22', 'the resolver migration contains a LANGUAGE sql body')
    if (!/\bSECURITY DEFINER\b/.test(src)) fail('T7I-R22', 'the resolver is not SECURITY DEFINER')
    if (!/^STABLE$/m.test(src)) fail('T7I-R22', 'the resolver is not declared STABLE')
    if (!/SET search_path = ''/.test(src)) fail('T7I-R22', "the resolver does not pin SET search_path = ''")

    // (c) the signature-qualified REVOKE-then-GRANT pair, in that order,
    //     revoking from all four non-client grantees and granting to
    //     `authenticated` and NOBODY else.
    const revoke = src.indexOf(`REVOKE ALL ON FUNCTION ${SIG} FROM PUBLIC, anon, service_role, authenticator;`)
    const grant = src.indexOf(`GRANT EXECUTE ON FUNCTION ${SIG} TO authenticated;`)
    if (revoke < 0) fail('T7I-R22', 'the signature-qualified REVOKE from PUBLIC, anon, service_role, authenticator is missing')
    if (grant < 0) fail('T7I-R22', 'the signature-qualified GRANT EXECUTE TO authenticated is missing')
    if (revoke >= 0 && grant >= 0 && revoke > grant) fail('T7I-R22', 'the GRANT precedes the REVOKE')
    const grants = (src.match(/^GRANT\b[\s\S]*?;$/gm) || [])
    if (grants.length !== 1) fail('T7I-R22', `the resolver migration issues ${grants.length} GRANT statements, expected exactly 1`)
    for (const g of grants) {
      if (/\b(anon|service_role|authenticator|PUBLIC)\b/.test(g)) {
        fail('T7I-R22', 'a GRANT names anon, service_role, authenticator or PUBLIC')
      }
    }

    // (d) the projection is exactly two uuid identifiers, and the ONLY
    //     parameter is the governed report identifier.
    const sig = /CREATE FUNCTION public\.report_resolve_context\(\s*p_report_id uuid\s*\)\s*RETURNS TABLE \(\s*class_session_id uuid,\s*student_id\s+uuid\s*\)/m.test(src)
    if (!sig) fail('T7I-R22', 'the resolver signature is not (p_report_id uuid) -> TABLE(class_session_id uuid, student_id uuid)')
    // 🔴 RE-DERIVED AT P1-T04. The four superseded panel names were hard-coded
    // here and went vacuous at the M13 rename: a resolver that projected
    // `overview` would have passed. The panel half is now derived from the
    // corpus; the non-panel half is the resolver's OWN bounded contract
    // (hashes, revision, lock, centre) and is genuinely fixed vocabulary
    // rather than a copy of the panel list.
    // ANCHOR (Q-26), added after review: this leg consumed derivePanelColumns
    // with NO anchor of its own. If the derivation returned [], the loop
    // still iterated the five hard-coded non-panel names and the leg
    // reported PASS -- and the proof that claimed to cover this actually
    // exercised T7I-18's anchor, never this one.
    const r22Panels = derivePanelColumns(MIG_DIR)
    if (r22Panels.length !== 4) {
      fail('T7I-R22', `the panel derivation produced ${r22Panels.length} column(s) `
        + `(${r22Panels.join(', ') || 'none'}), expected the four OD-4 panels -- this leg would `
        + 'scan for the wrong names')
    }
    for (const forbiddenCol of [...r22Panels, 'content_hash', 'wording_hash',
                                'revision_number', 'lock_version', 'centre_id']) {
      const body = src.slice(src.indexOf('CREATE FUNCTION public.report_resolve_context'))
      const header = body.slice(0, body.indexOf('AS $fn$'))
      if (header.includes(forbiddenCol)) {
        fail('T7I-R22', `the resolver projection declares a forbidden column: ${forbiddenCol}`)
      }
    }

    // (e) every denial is a bare RETURN: the body never RAISEs, so an
    //     unknown id and a forbidden id are byte-identical.
    const fnBody = src.slice(src.indexOf('AS $fn$'), src.indexOf('$fn$;') + 5)
    if (/\bRAISE\b/i.test(fnBody)) fail('T7I-R22', 'the resolver body raises instead of returning zero rows')
    if (/\b(INSERT INTO|UPDATE\s+public\.|DELETE FROM|TRUNCATE)\b/i.test(fnBody)) {
      fail('T7I-R22', 'the resolver body contains a mutating statement')
    }

    if (failures === before) pass('T7I-R22', 'the resolver migration creates exactly one SECURITY DEFINER, STABLE, empty-search_path function, grants EXECUTE to authenticated only via a signature-qualified REVOKE-then-GRANT pair, projects exactly two identifiers, and never raises')
  }
}

// ---------------------------------------------------------------------
// T7I-40 -- server-action scope
// ---------------------------------------------------------------------
{
  const before = failures
  const walk = (dir, out = []) => {
    if (!existsSync(dir)) return out
    for (const entry of readdirSync(dir)) {
      const p = join(dir, entry)
      if (statSync(p).isDirectory()) {
        if (entry === 'node_modules' || entry === '.next' || entry === '.git') continue
        walk(p, out)
      } else if (/\.(ts|tsx|mts|cts)$/.test(entry)) out.push(p)
    }
    return out
  }

  // RECONCILED AT BACKEND ROUND B2 (the earlier RECORDED note said exactly
  // this reconciliation would happen when the server module landed). The
  // repository now carries the CONTRACT-MANDATED action set (48h contract
  // §5.1: saveObservation, requestDraft, saveTrainerEdit,
  // updateTrainerChecklist, trainerApprove, managementEditWording,
  // managementReturnToTrainer, managementApproveAndSubmit, plus the read
  // wrappers), so "at most one action" no longer describes the accepted
  // design. T7I-40's RATIFIED PROPERTY is unchanged and still scanned in
  // full: PostgreSQL owns every transition, guard and gate — TypeScript
  // holds NO status/lock_version authority, performs NO direct report-table
  // access, and never touches the elevated client. TS may ROUTE on
  // RPC-returned state (choosing which governed RPC to call next); it may
  // not decide a transition's legality — every RPC re-verifies everything.
  const serverFiles = walk(join(ROOT, 'server'))
  const relOf = (f) => relative(ROOT, f).replace(/\\/g, '/')

  // ------------------------------------------------------------------
  // SCOPE OF (a)/(b)/(c): THE GOVERNED PATH ONLY -- RECONCILED AT F16-C
  // ------------------------------------------------------------------
  // T7I-40's ratified property is that PostgreSQL owns every transition and
  // TypeScript holds NO status authority ON THE GOVERNED PATH. Exactly one
  // MODULE is excluded, `lib/frontend/fixtures/physical-test-fixture`, and
  // nothing broader: not the rest of `lib/frontend/fixtures/`, not `lib/`, not
  // any `server/` or `app/` path.
  //
  // NARROWED AT F16-C1. The exclusion used to cover the whole
  // `lib/frontend/fixtures/` DIRECTORY while the compensating leg (d) covered
  // only the one fixture module, so the sibling `dimensions.ts` was exempt
  // from (c) but not carried by (d) -- a status literal added there would have
  // been invisible. The two sets now COINCIDE on the single fixture module.
  // The narrowing (rather than widening leg (d) to the directory) is the
  // correct direction because `lib/frontend/fixtures/dimensions.ts` holds the
  // ratified display labels and polarity bands and is LEGITIMATELY imported by
  // three participant-path surfaces (`features/trainer/trainer-assessment`,
  // `-report-review`, `-draft-generation`); widening (d) would have failed
  // those three imports. It carries no status assignment, no lock_version
  // mutation and no table access, so it passes (a)/(b)/(c) on its merits --
  // and from now on it is REQUIRED to.
  //
  // WHY THE REMAINING EXCLUSION IS SOUND. `lib/frontend/fixtures/physical-test-fixture.ts`
  // is a browser-only SIMULATION of the backend for UI development. It touches
  // no database, no RPC and no session. Since F16-C it is also, provably, not
  // on the governed path:
  //   * the portals compose the REAL participant adapter by default --
  //     `features/portal/physical-test-runtime.tsx` is the single composition
  //     root and it constructs `createRealParticipantPhysicalTestPort()`;
  //   * the fixture is selectable ONLY by NEXT_PUBLIC_BEST_COACH_FIXTURE_MODE=1
  //     set in the SERVER ENVIRONMENT the app is started in. It is OFF unless
  //     the deploying operator sets it, and cannot be set from a query
  //     parameter, cookie, header or UI control. (The read is a RUNTIME
  //     `process.env` read, not a build-time fold, so no rebuild is needed to
  //     change it -- see `lib/frontend/adapters/adapter-mode.ts`.);
  //   * when it IS composed it is VISIBLY IDENTIFIED -- `PortalShell` renders a
  //     persistent "Deterministic fixture mode" banner on every portal surface,
  //     keyed off the port's own `identity.kind`, which the real adapter can
  //     never report;
  //   * real-auth navigation cannot reach it: `proxy.ts` and each layout's
  //     `requirePortalAccess` gate the portals, and neither the layouts nor any
  //     surface imports the fixture.
  //
  // THE PRICE OF THE EXCLUSION IS LEG (d) BELOW, which makes the scan STRONGER:
  // the exclusion cannot silently become a hole, because a single participant
  // -path import of the fixture module now FAILS this scan.
  //
  // The isolation itself is proved end-to-end by the F16-D test
  // `tests/frontend/fixture-isolation-browser-smoke.mjs` (participant-mode
  // navigation reaches no fixture surface, and the fixture banner is present
  // on every portal surface in a fixture-mode build).
  // The excluded set and leg (d)'s asserted set are the SAME single module.
  const FIXTURE_MODULE = 'lib/frontend/fixtures/physical-test-fixture'
  const isFixtureModule = (rel) => rel === `${FIXTURE_MODULE}.ts` || rel === `${FIXTURE_MODULE}.tsx`

  const allAppFiles = [...serverFiles, ...walk(join(ROOT, 'app')), ...walk(join(ROOT, 'lib'))]
    .filter((f) => !isFixtureModule(relOf(f)))
  for (const f of serverFiles) {
    const text = readFileSync(f, 'utf8')
    const rel = relative(ROOT, f).replace(/\\/g, '/')
    if (rel === 'server/platform/supabase/elevated.ts') continue
    if (/from\s+['"][^'"]*platform\/supabase\/elevated['"]/.test(text)) {
      fail('T7I-40', `${rel} imports the elevated (service_role) client`)
    }
  }

  for (const f of allAppFiles) {
    const text = readFileSync(f, 'utf8')
    const rel = relative(ROOT, f).replace(/\\/g, '/')
    // (a) lock_version is never mutated in TypeScript.
    if (/\block_version\s*(\+\+|--|\+=|-=|=[^=])/.test(text)) {
      fail('T7I-40', `${rel} mutates lock_version in TypeScript`)
    }
    // (b) no direct table access to ANY report-family or assessment table:
    // reads and writes alike go through the governed RPCs.
    if (/\.from\(\s*['"](reports|report_versions|report_version_ratings|report_version_checklist_progress|report_version_approvals|report_correction_requests|observations|observation_ratings|audit_events|audit_event_targets|audit_chain_heads)['"]/.test(text)) {
      fail('T7I-40', `${rel} accesses a governed table directly instead of through an RPC`)
    }
    // (c) no TypeScript writes a report status VALUE anywhere except as an
    // expected-state RPC argument (p_expected_status) or a returned-state
    // check. A status literal on the left of an assignment would be TS
    // deciding a transition — forbidden.
    if (/status\s*=\s*['"](draft_ready|needs_edit|trainer_approved|approved|submitted|incomplete|observation_saved|drafting)['"]/.test(text.replace(/status\s*===|status\s*!==/g, ''))) {
      fail('T7I-40', `${rel} assigns a report status in TypeScript`)
    }
  }
  // ------------------------------------------------------------------
  // (d) FIXTURE CONTAINMENT -- the price of the (a)/(b)/(c) exclusion.
  // ------------------------------------------------------------------
  // No participant-path file may import the deterministic fixture. Only three
  // places may: the fixture directory itself, the ONE flag-gated dev
  // composition module, and the test harnesses. Anything else -- a layout, a
  // portal shell, a feature surface, the composition root, a server module --
  // is a governance failure, because it would put simulated data (and the
  // TypeScript status assignments the exclusion above tolerates) back on the
  // path a real participant can reach.
  //
  // The module named here is EXACTLY the module `isFixtureModule` exempts
  // above: the exclusion and this compensating assertion cover the same set,
  // so nothing can be exempt from (c) without being contained by (d).
  const FIXTURE_IMPORT = new RegExp(
    `from\\s+['"][^'"]*${FIXTURE_MODULE}['"]|import\\(\\s*['"][^'"]*${FIXTURE_MODULE}['"]`,
  )
  const FIXTURE_IMPORT_ALLOWED = [
    'lib/frontend/fixtures/',                    // the fixture's own modules
    'features/dev-fixture/',                     // the flag-gated dev composition, off by default
    'tests/',                                    // the harnesses that exist to exercise it
  ]
  const containmentRoots = ['app', 'features', 'components', 'lib', 'server', 'tests']
  for (const root of containmentRoots) {
    for (const f of walk(join(ROOT, root))) {
      const rel = relOf(f)
      if (FIXTURE_IMPORT_ALLOWED.some((prefix) => rel.startsWith(prefix))) continue
      if (FIXTURE_IMPORT.test(readFileSync(f, 'utf8'))) {
        fail('T7I-40', `${rel} imports the deterministic fixture on a participant path`)
      }
    }
  }

  // The exclusion is worthless if the flag-gated composition module is gone,
  // or if the composition root ever stops defaulting to the real adapter.
  const RUNTIME = join(ROOT, 'features', 'portal', 'physical-test-runtime.tsx')
  if (!existsSync(RUNTIME)) {
    fail('T7I-40', 'features/portal/physical-test-runtime.tsx is missing -- the fixture exclusion is unproven')
  } else {
    const runtime = readFileSync(RUNTIME, 'utf8')
    if (!/createRealParticipantPhysicalTestPort\s*\(/.test(runtime)) {
      fail('T7I-40', 'the portal composition root does not construct the real participant adapter')
    }
    if (!/NEXT_PUBLIC_BEST_COACH_FIXTURE_MODE|FIXTURE_MODE_ENABLED/.test(runtime)) {
      fail('T7I-40', 'the portal composition root does not gate the fixture on the environment flag')
    }
    if (FIXTURE_IMPORT.test(runtime.replace(/import\([\s\S]*?\)/g, ''))) {
      fail('T7I-40', 'the portal composition root imports the fixture statically')
    }
  }

  if (failures === before) pass('T7I-40', 'no elevated-client import, no direct governed-table access, no TypeScript status/lock_version authority on the governed path; the deterministic fixture is excluded from (c) AND contained -- no participant-path file imports it')
}

console.log('')
if (failures > 0) {
  console.error(`Step 7I static scan: ${failures} failure(s).`)
  process.exitCode = 1
} else {
  console.log('Step 7I static scan: all static proofs passed.')
}
