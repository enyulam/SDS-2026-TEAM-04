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
  if (all.length !== 9) fail('T7I-73', `${all.length} migration files exist, expected 9`) // 5 through Step 7I + the B2 assessment migration + the B2.1 correction-tracking migration + the B-V2-1 competency-vocabulary rename + the C2 report-context resolver

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
// Extract each CREATE FUNCTION body once, for the body-level scans below.
// ---------------------------------------------------------------------
const fnBodies = new Map()
{
  const re = /^CREATE FUNCTION public\.([a-z0-9_]+)\(([\s\S]*?)^\$fn\$;/gm
  let m
  while ((m = re.exec(body2)) !== null) fnBodies.set(m[1], m[0])
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
  const forbiddenCols = ['todays_strength', 'next_focus', 'practice_suggestion', 'session_takeaway',
                         'content_hash', 'content_hash_version', 'revision_number',
                         'derived_from_version_id', 'trainer_approved_source_version_id',
                         'authored_by_membership_id', 'authored_by_role']
  for (const [name, raw] of fnBodies) {
    const fn = stripComments(raw)
    const updates = [...fn.matchAll(/UPDATE\s+public\.report_versions[\s\S]*?(?=;)/gi)].map((m) => m[0])
    for (const u of updates) {
      for (const col of forbiddenCols) {
        if (new RegExp(`\\b${col}\\s*=`).test(u)) {
          fail('T7I-18', `${name} UPDATEs report_versions.${col} after INSERT`)
        }
      }
      // The sole permitted post-approval write is T11's one-time submission
      // metadata, guarded on all three fields being NULL.
      if (!/submitted_at\s*=/.test(u)) {
        fail('T7I-18', `${name} performs an UPDATE on report_versions that is not the write-once submission write`)
      } else if (!/submitted_at IS NULL/.test(u)) {
        fail('T7I-18', `${name}'s submission write is not guarded on submitted_at IS NULL`)
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
  for (const [name, raw] of fnBodies) {
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
  if (failures === before) pass('T7I-62', `${sites} audit label sites, all generic constants; no reason text reaches an append`)
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
    for (const forbiddenCol of ['todays_strength', 'next_focus', 'practice_suggestion',
                                'session_takeaway', 'content_hash', 'wording_hash',
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
  // directory is excluded, `lib/frontend/fixtures/`, and nothing broader:
  // not `lib/`, not any `server/` or `app/` path.
  //
  // WHY THE EXCLUSION IS SOUND. `lib/frontend/fixtures/physical-test-fixture.ts`
  // is a browser-only SIMULATION of the backend for UI development. It touches
  // no database, no RPC and no session. Since F16-C it is also, provably, not
  // on the governed path:
  //   * the portals compose the REAL participant adapter by default --
  //     `features/portal/physical-test-runtime.tsx` is the single composition
  //     root and it constructs `createRealParticipantPhysicalTestPort()`;
  //   * the fixture is selectable ONLY by the build-time development flag
  //     NEXT_PUBLIC_BEST_COACH_FIXTURE_MODE=1, which is OFF BY DEFAULT and
  //     cannot be set from a query parameter, cookie, header or UI control;
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
  const FIXTURE_DIR = 'lib/frontend/fixtures/'
  const isFixtureModule = (rel) => rel.startsWith(FIXTURE_DIR)

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
  const FIXTURE_IMPORT = /from\s+['"][^'"]*lib\/frontend\/fixtures\/physical-test-fixture['"]|import\(\s*['"][^'"]*lib\/frontend\/fixtures\/physical-test-fixture['"]/
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
      fail('T7I-40', 'the portal composition root does not gate the fixture on the build-time flag')
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
