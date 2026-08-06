#!/usr/bin/env node
// =====================================================================
// B.E.S.T Coach -- correction-tracking static scan (T-CT-S1 .. T-CT-S6)
// =====================================================================
// Repository-level properties that no runtime query can prove: what the
// migration FILE contains, that the earlier committed migrations are
// byte-unchanged, and that the server projection reaches the correction
// record ONLY through the governed boundary.
//
// Run: node scripts/tests/correction-tracking/ct-static.mjs
// =====================================================================

import { readFileSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'

const ROOT = process.cwd()
const MIG_DIR = join(ROOT, 'supabase', 'migrations')
const MIG_NAME = '20260806103000_management_correction_tracking.sql'
// The newest migration file in the tree (checkpoint B-V2-1, Amendment 006
// A-053). It is not this suite's subject; it is only what "sorts last" now
// means.
const NEWEST_MIG_NAME = '20260806160000_competency_vocabulary_rename.sql'
const MIG = join(MIG_DIR, MIG_NAME)
const PROJECTIONS = join(ROOT, 'server', 'modules', 'management-view', 'projections.ts')

let failures = 0
const fail = (id, msg) => { failures += 1; console.error(`FAIL ${id}: ${msg}`) }
const pass = (id, msg) => console.log(`PASS ${id}${msg ? ' -- ' + msg : ''}`)

const read = (p) => readFileSync(p, 'utf8').replace(/\r\n/g, '\n')
// Strip `--` comments so a rule DISCUSSED in prose is never mistaken for a
// statement that implements it.
const code = (s) => s.replace(/--[^\n]*/g, '')

const body = read(MIG)
const bodyCode = code(body)

// ---------------------------------------------------------------------
// T-CT-S1 -- the migration file's exact object inventory
// ---------------------------------------------------------------------
{
  const before = failures
  const counts = {
    'CREATE FUNCTION': (bodyCode.match(/CREATE\s+FUNCTION/gi) || []).length,
    'COMMENT ON FUNCTION': (bodyCode.match(/COMMENT\s+ON\s+FUNCTION/gi) || []).length,
    'GRANT EXECUTE': (bodyCode.match(/GRANT\s+EXECUTE/gi) || []).length,
    'REVOKE': (bodyCode.match(/\bREVOKE\b/gi) || []).length,
  }
  if (counts['CREATE FUNCTION'] !== 1) fail('T-CT-S1', `${counts['CREATE FUNCTION']} CREATE FUNCTION statements, expected exactly 1`)
  if (counts['COMMENT ON FUNCTION'] !== 1) fail('T-CT-S1', `${counts['COMMENT ON FUNCTION']} COMMENT ON FUNCTION statements, expected exactly 1`)
  if (counts['GRANT EXECUTE'] !== 1) fail('T-CT-S1', `${counts['GRANT EXECUTE']} GRANT EXECUTE statements, expected exactly 1`)
  if (counts['REVOKE'] !== 1) fail('T-CT-S1', `${counts['REVOKE']} REVOKE statements, expected exactly 1`)

  // Everything the bounded delta forbids.
  const forbidden = [
    [/CREATE\s+TABLE/i, 'creates a table'],
    [/CREATE\s+TYPE/i, 'creates a type'],
    [/ALTER\s+TYPE/i, 'alters a type'],
    [/ADD\s+COLUMN/i, 'adds a column'],
    [/CREATE\s+POLICY/i, 'creates an RLS policy'],
    [/CREATE\s+INDEX|CREATE\s+UNIQUE\s+INDEX/i, 'creates an index'],
    [/CREATE\s+TRIGGER/i, 'creates a trigger'],
    [/CREATE\s+VIEW|CREATE\s+MATERIALIZED/i, 'creates a view'],
    [/CREATE\s+EXTENSION/i, 'installs an extension'],
    [/CREATE\s+SCHEMA/i, 'creates a schema'],
    [/CREATE\s+OR\s+REPLACE/i, 'replaces an existing function'],
    [/GRANT[^;]*ON\s+TABLE/i, 'grants a table privilege'],
    [/GRANT[^;]*TO[^;]*service_role/i, 'grants something to service_role'],
    [/ALTER\s+DEFAULT\s+PRIVILEGES/i, 'alters default privileges'],
    [/FORCE\s+ROW\s+LEVEL\s+SECURITY/i, 'forces row-level security'],
    [/OWNER\s+TO/i, 'changes ownership'],
  ]
  for (const [re, what] of forbidden) {
    if (re.test(bodyCode)) fail('T-CT-S1', `the migration ${what}`)
  }
  if (failures === before) pass('T-CT-S1', '1 function, 1 comment, 1 revoke, 1 grant -- no table, type, column, policy, index, trigger, view, extension, table grant, default-privilege change, ownership change or CREATE OR REPLACE')
}

// ---------------------------------------------------------------------
// T-CT-S2 -- the function's declared contract, read from the file
// ---------------------------------------------------------------------
{
  const before = failures
  if (!/CREATE FUNCTION public\.report_list_management_corrections\(\)/.test(bodyCode)) {
    fail('T-CT-S2', 'the function is not declared as public.report_list_management_corrections() with zero parameters')
  }
  for (const clause of ['LANGUAGE plpgsql', 'STABLE', 'SECURITY DEFINER', "SET search_path = ''"]) {
    if (!bodyCode.includes(clause)) fail('T-CT-S2', `the function does not declare ${clause}`)
  }
  if (/LANGUAGE\s+sql\b/i.test(bodyCode)) fail('T-CT-S2', 'the file contains a LANGUAGE sql body')
  if (/\bBEGIN\s+ATOMIC\b/i.test(bodyCode)) fail('T-CT-S2', 'the file contains a BEGIN ATOMIC body')
  if (/\bVOLATILE\b/i.test(bodyCode)) fail('T-CT-S2', 'the function is declared VOLATILE')
  // Fully schema-qualified: with an empty search_path, an unqualified
  // reference to a project table cannot resolve. `IS [NOT] DISTINCT FROM` is
  // removed first -- it is a comparison operator, not a FROM clause, and
  // scanning for the bare keyword would otherwise flag it.
  const fnBody = (bodyCode.split('$fn$')[1] ?? '').replace(/\bIS\s+(NOT\s+)?DISTINCT\s+FROM\b/gi, ' <> ')
  if (/\bFROM\s+(?!public\.|pg_catalog\.|information_schema\.|LATERAL|\()\w+/i.test(fnBody)) {
    fail('T-CT-S2', 'the function body contains an unqualified FROM target')
  }
  // The four revoked roles, exactly as the committed posture requires.
  for (const role of ['PUBLIC', 'anon', 'service_role', 'authenticator']) {
    if (!new RegExp(`REVOKE ALL ON FUNCTION public\\.report_list_management_corrections\\(\\)[^;]*${role}`).test(bodyCode)) {
      fail('T-CT-S2', `EXECUTE is not revoked from ${role}`)
    }
  }
  if (!/GRANT EXECUTE ON FUNCTION public\.report_list_management_corrections\(\)\s+TO authenticated;/.test(bodyCode)) {
    fail('T-CT-S2', 'EXECUTE is not granted to authenticated')
  }
  if (failures === before) pass('T-CT-S2', 'zero-argument, plpgsql, STABLE, SECURITY DEFINER, empty search_path, schema-qualified, revoked from PUBLIC/anon/service_role/authenticator, granted to authenticated only')
}

// ---------------------------------------------------------------------
// T-CT-S3 -- the projection's field list, read from the file
// ---------------------------------------------------------------------
{
  const before = failures
  const returns = /RETURNS TABLE \(([\s\S]*?)\n\)/.exec(bodyCode)
  if (!returns) {
    fail('T-CT-S3', 'the RETURNS TABLE clause could not be located')
  } else {
    const cols = returns[1].split('\n').map((l) => l.trim().split(/\s+/)[0]).filter(Boolean)
    const expected = [
      'report_id', 'student_id', 'student_display_name', 'class_session_id',
      'session_date', 'report_status', 'correction_request_id', 'issue_scope',
      'correction_reason', 'correction_status', 'returned_at',
      'trainer_correction_submitted', 'tracking_updated_at',
    ]
    if (cols.join(',') !== expected.join(',')) {
      fail('T-CT-S3', `the declared projection is [${cols.join(', ')}]`)
    }
    const forbidden = ['todays_strength', 'next_focus', 'practice_suggestion', 'session_takeaway',
      'content_hash', 'wording_hash', 'revision', 'rating', 'checklist', 'approval',
      'attendance', 'evidence', 'notes', 'version_id', 'prompt', 'response', 'audit']
    for (const f of forbidden) {
      if (cols.some((c) => c.includes(f))) fail('T-CT-S3', `the projection declares a forbidden field matching "${f}"`)
    }
  }
  if (failures === before) pass('T-CT-S3', 'exactly the thirteen bounded tracking columns are declared; no panel, rating, hash, revision, checklist, approval, attendance, evidence, note, version-id, AI or audit field')
}

// ---------------------------------------------------------------------
// T-CT-S4 -- the seven earlier migration files are byte-unchanged
// ---------------------------------------------------------------------
// Checkpoint B-V2-1 added the competency-vocabulary rename, which sorts
// after the correction-tracking migration. The correction-tracking file is
// therefore now an ALREADY-APPLIED file rather than the newest one, so it
// moves from the "sorts last" leg into the byte-identical-to-HEAD leg —
// which is a strictly stronger assertion for it, not a weaker one.
{
  const before = failures
  const all = readdirSync(MIG_DIR).filter((f) => f.endsWith('.sql')).sort()
  if (all.length !== 8) fail('T-CT-S4', `${all.length} migration files exist, expected 8`)
  if (all[all.length - 1] !== NEWEST_MIG_NAME) fail('T-CT-S4', `the newest migration is not the last file (last is ${all[all.length - 1]})`)
  if (!all.includes(MIG_NAME)) fail('T-CT-S4', `${MIG_NAME} is missing`)

  for (const f of all.slice(0, -1)) {
    const rel = `supabase/migrations/${f}`
    const head = spawnSync('git', ['show', `HEAD:${rel}`], { cwd: ROOT, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 })
    if (head.status !== 0) { fail('T-CT-S4', `could not read ${rel} from HEAD`); continue }
    const h1 = createHash('sha256').update(head.stdout.replace(/\r\n/g, '\n')).digest('hex')
    const h2 = createHash('sha256').update(read(join(MIG_DIR, f))).digest('hex')
    if (h1 !== h2) fail('T-CT-S4', `${rel} differs from HEAD -- an applied migration must never be edited`)
  }
  if (failures === before) pass('T-CT-S4', 'eight migration files; the seven already-applied files are byte-identical to HEAD; the new one sorts last')
}

// ---------------------------------------------------------------------
// T-CT-S5 -- the server projection reaches the correction record ONLY
//            through the governed boundary
// ---------------------------------------------------------------------
{
  const before = failures
  const src = read(PROJECTIONS)
  if (!src.includes('report_list_management_corrections')) {
    fail('T-CT-S5', 'the management projection does not call the governed boundary')
  }
  if (/\.from\(\s*["'`]report_correction_requests/.test(src)) {
    fail('T-CT-S5', 'the management projection reads report_correction_requests directly')
  }
  for (const t of ['report_versions', 'report_version_ratings', 'observations', 'observation_ratings',
    'report_version_checklist_progress', 'report_version_approvals', 'audit_events']) {
    if (new RegExp(`\\.from\\(\\s*["'\`]${t}`).test(src)) {
      fail('T-CT-S5', `the management projection reads ${t} directly`)
    }
  }
  // The DTO must not acquire a forbidden field.
  for (const f of ['contentHash', 'revisionNumber', 'ratings', 'checklist', 'trainerNotes', 'observation', 'attendance', 'evidence']) {
    if (new RegExp(`readonly\\s+${f}`).test(src)) fail('T-CT-S5', `the management DTOs declare a forbidden field "${f}"`)
  }
  // The reason is carried on the QUEUE row only, never on the review DTO.
  const reviewDto = /export interface ManagementReviewDto \{[\s\S]*?\n\}/.exec(src)
  if (!reviewDto) fail('T-CT-S5', 'ManagementReviewDto could not be located')
  else if (/reason/i.test(reviewDto[0])) fail('T-CT-S5', 'ManagementReviewDto carries a correction reason')
  if (failures === before) pass('T-CT-S5', 'the projection calls only the governed boundary, reads no report-family table directly, and carries the reason on the queue row alone')
}

// ---------------------------------------------------------------------
// T-CT-S6 -- the earlier read boundaries are untouched in the repository
// ---------------------------------------------------------------------
{
  const before = failures
  const step7i = read(join(MIG_DIR, '20260805090500_step_7i_report_lifecycle.sql'))
  if (!step7i.includes("IF v_r.status = 'trainer_approved' THEN")) {
    fail('T-CT-S6', "RPC-15's trainer_approved branch is missing from the Step 7I file")
  }
  if (!step7i.includes('-- incomplete | observation_saved | drafting | draft_ready | needs_edit --')) {
    fail('T-CT-S6', "RPC-15's five-status zero-row branch comment is missing -- the gate may have been rewritten")
  }
  // No new grant crept into an owner-only function anywhere in the repo.
  for (const f of ['report_store_draft', 'report_content_hash_v1', 'report_wording_hash_v1', 'app_parent_reaches_student']) {
    if (new RegExp(`GRANT[^;]*\\b${f}\\b[^;]*TO`, 'i').test(bodyCode)) {
      fail('T-CT-S6', `the new migration grants EXECUTE on the owner-only ${f}`)
    }
  }
  if (failures === before) pass('T-CT-S6', "RPC-15's status gate is unedited in the Step 7I file, and no owner-only function acquired a grant")
}

console.log('')
if (failures > 0) {
  console.error(`Correction-tracking static scan: ${failures} failure(s).`)
  process.exitCode = 1
} else {
  console.log('Correction-tracking static scan: all static proofs passed.')
}
