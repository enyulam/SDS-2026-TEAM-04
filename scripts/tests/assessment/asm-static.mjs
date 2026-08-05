#!/usr/bin/env node
// =====================================================================
// B.E.S.T Coach -- assessment acceptance suite: static (S) legs
// =====================================================================
// File-level proofs over the committed sources. No database connection.
// Covers: T-ASM-11 (signature allow-list), the static legs of T-ASM-32
// (no report/audit reference in either body), T-ASM-33 (the Step 7H
// migration file is byte-unchanged in the worktree), T-ASM-38/39 (the read
// shape is exactly the eleven ratified columns), T-ASM-40 (exact object
// inventory of the migration file) and T-ASM-41 (contract keywords).
//
// Run: node scripts/tests/assessment/asm-static.mjs
// =====================================================================

import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { join } from 'node:path'

const ROOT = process.cwd()
const MIG = join(ROOT, 'supabase', 'migrations', '20260806090000_assessment_governed_persistence.sql')
const MIG_7H = 'supabase/migrations/20260804213000_step_7h_audit_chain.sql'

let failures = 0
const fail = (id, msg) => { failures += 1; console.error(`FAIL ${id}: ${msg}`) }
const pass = (id, msg) => console.log(`PASS ${id}${msg ? ' -- ' + msg : ''}`)

const raw = readFileSync(MIG, 'utf8')
// Strip `--` comments before scanning for statements: prose that DISCUSSES a
// rule is not a statement (the Step 7I static-scan discipline).
const src = raw.replace(/--[^\n]*/g, '')

// ---------------------------------------------------------------------
// T-ASM-40 (static leg) -- exact object inventory of the migration file.
// ---------------------------------------------------------------------
{
  const count = (re) => (src.match(re) || []).length
  const checks = [
    ['CREATE FUNCTION', /\bCREATE\s+FUNCTION\b/gi, 2],
    ['CREATE OR REPLACE', /\bCREATE\s+OR\s+REPLACE\b/gi, 0],
    ['CREATE TABLE', /\bCREATE\s+TABLE\b/gi, 0],
    ['CREATE TYPE / ALTER TYPE', /\b(CREATE|ALTER)\s+TYPE\b/gi, 0],
    ['CREATE POLICY', /\bCREATE\s+POLICY\b/gi, 0],
    ['CREATE INDEX', /\bCREATE\s+(UNIQUE\s+)?INDEX\b/gi, 0],
    ['CREATE TRIGGER', /\bCREATE\s+(CONSTRAINT\s+)?TRIGGER\b/gi, 0],
    ['CREATE VIEW', /\bCREATE\s+(MATERIALIZED\s+)?VIEW\b/gi, 0],
    ['CREATE EXTENSION / SCHEMA', /\bCREATE\s+(EXTENSION|SCHEMA)\b/gi, 0],
    ['ALTER TABLE', /\bALTER\s+TABLE\b/gi, 0],
    ['ALTER DEFAULT PRIVILEGES', /\bALTER\s+DEFAULT\s+PRIVILEGES\b/gi, 0],
    ['OWNER TO', /\bOWNER\s+TO\b/gi, 0],
    ['GRANT EXECUTE', /\bGRANT\s+EXECUTE\b/gi, 2],
    ['table GRANT (SELECT/INSERT/UPDATE/DELETE/ALL ON TABLE)', /\bGRANT\s+(SELECT|INSERT|UPDATE|DELETE|ALL)\b(?![^;]*\bFUNCTION\b)/gi, 0],
    ['REVOKE', /\bREVOKE\b/gi, 2],
    ['COMMENT ON FUNCTION', /\bCOMMENT\s+ON\s+FUNCTION\b/gi, 2],
    ['DROP', /\bDROP\s+(TABLE|FUNCTION|TYPE|POLICY|INDEX|TRIGGER|VIEW)\b/gi, 0],
  ]
  let ok = true
  for (const [label, re, expected] of checks) {
    const n = count(re)
    if (n !== expected) { fail('T-ASM-40', `${label}: found ${n}, expected ${expected}`); ok = false }
  }
  if (ok) pass('T-ASM-40', 'the migration file contains exactly 2 functions, 2 comments, 2 revokes, 2 grants and its assertions -- nothing else')
}

// ---------------------------------------------------------------------
// T-ASM-11 (S) -- the allow-list IS the signature. No parameter exists for
// any structural, governance or metadata value.
// ---------------------------------------------------------------------
{
  const sigMatch = raw.match(/CREATE FUNCTION public\.assessment_save_observation\(([\s\S]*?)\)\s*RETURNS/i)
  if (!sigMatch) fail('T-ASM-11', 'could not extract the assessment_save_observation signature')
  else {
    const params = [...sigMatch[1].matchAll(/(?:^|\n)\s*(?:OUT\s+)?(p_\w+|\w+)\s/g)].map((m) => m[1])
    const inputs = sigMatch[1].split('\n').filter((l) => /^\s*p_/.test(l)).map((l) => l.trim().split(/\s+/)[0])
    const expected = ['p_class_session_id', 'p_student_id', 'p_expected_observation_id',
      'p_expected_lock_version', 'p_strength_chips', 'p_focus_chips', 'p_observation_notes',
      'p_follow_up_notes', 'p_term_evidence_notes', 'p_ratings']
    const forbidden = /centre|module|enrolment|membership|trainer_role|group|label|sort|report|status|version_id_to_write|checklist|approval|attendance|evidence_id|correction/i
    if (JSON.stringify(inputs) !== JSON.stringify(expected)) {
      fail('T-ASM-11', `input parameters are ${inputs.join(', ')}; expected the ten ratified names`)
    } else if (inputs.some((p) => forbidden.test(p))) {
      fail('T-ASM-11', 'a forbidden structural/metadata parameter exists in the signature')
    } else {
      pass('T-ASM-11', 'exactly the ten ratified input parameters; no structural or metadata value is suppliable')
    }
    void params
  }
  // group_code / display_name are read only from assessment_dimensions.
  const fnBody = src.match(/CREATE FUNCTION public\.assessment_get_trainer_observation[\s\S]*?\$fn\$;/i)
  if (!fnBody) fail('T-ASM-11', 'could not extract the read function body')
  else if (!/JOIN public\.assessment_dimensions/i.test(fnBody[0])) {
    fail('T-ASM-11', 'display_name/group_code are not derived from public.assessment_dimensions')
  }
}

// ---------------------------------------------------------------------
// T-ASM-32 (static leg) -- neither function body references a report table
// or the audit append path.
// ---------------------------------------------------------------------
{
  const bodies = [...src.matchAll(/AS \$fn\$([\s\S]*?)\$fn\$;/g)].map((m) => m[1])
  if (bodies.length !== 2) fail('T-ASM-32', `expected 2 function bodies, found ${bodies.length}`)
  else {
    const banned = /(public\.reports\b|public\.report_versions|public\.report_version_ratings|public\.report_version_checklist_progress|public\.report_version_approvals|public\.report_correction_requests|audit_append_event|public\.audit_)/
    const hits = bodies.filter((b) => banned.test(b))
    if (hits.length !== 0) fail('T-ASM-32', 'a function body references a report table or an audit object')
    else pass('T-ASM-32', 'static leg -- neither body references any report table or audit object')
  }
}

// ---------------------------------------------------------------------
// T-ASM-33 (static leg) -- the Step 7H migration file is byte-unchanged:
// the worktree copy hashes identically to the committed HEAD copy.
// ---------------------------------------------------------------------
{
  try {
    // Normalize CRLF -> LF on both sides: core.autocrlf leaves the worktree
    // copy CRLF while `git show` emits the stored LF bytes. Byte-unchanged
    // means unchanged CONTENT, not unchanged line-ending convention.
    const norm = (b) => b.toString('utf8').replaceAll('\r\n', '\n')
    const head = norm(execFileSync('git', ['show', `HEAD:${MIG_7H}`], { cwd: ROOT }))
    const work = norm(readFileSync(join(ROOT, MIG_7H)))
    const h1 = createHash('sha256').update(head, 'utf8').digest('hex')
    const h2 = createHash('sha256').update(work, 'utf8').digest('hex')
    if (h1 !== h2) fail('T-ASM-33', 'the Step 7H migration file differs from HEAD')
    else pass('T-ASM-33', `static leg -- the Step 7H migration file is byte-unchanged (${h1.slice(0, 12)}…)`)
  } catch (e) {
    fail('T-ASM-33', `could not compare the Step 7H migration file: ${e.message}`)
  }
}

// ---------------------------------------------------------------------
// T-ASM-38 / T-ASM-39 (S) -- the read RETURNS TABLE is exactly the eleven
// ratified columns, in order, with no correction/report/hash/name field.
// ---------------------------------------------------------------------
{
  const m = raw.match(/assessment_get_trainer_observation\(\s*p_class_session_id uuid,\s*p_student_id\s+uuid\s*\)\s*RETURNS TABLE \(([\s\S]*?)\)/i)
  if (!m) fail('T-ASM-39', 'could not extract the read RETURNS TABLE shape')
  else {
    const cols = m[1].split(',').map((c) => c.trim().split(/\s+/)[0]).filter(Boolean)
    const expected = ['observation_exists', 'observation_id', 'lock_version', 'strength_chips',
      'focus_chips', 'observation_notes', 'follow_up_notes', 'term_evidence_notes',
      'ratings', 'dimension_count', 'is_complete']
    if (JSON.stringify(cols) !== JSON.stringify(expected)) {
      fail('T-ASM-39', `read shape is ${cols.join(', ')}; expected the eleven ratified columns`)
    } else {
      // The exact-list equality above IS the exclusion proof: a report,
      // version, status, hash, checklist, approval, correction, audit or
      // name/email/phone field cannot exist in a list proven equal to the
      // ratified eleven.
      pass('T-ASM-39', 'the read shape is exactly the eleven ratified columns and no others')
      pass('T-ASM-38', 'static leg -- no correction issue_scope, dimension, status or reason column exists in the read shape')
    }
  }
}

// ---------------------------------------------------------------------
// T-ASM-41 (static leg) -- contract keywords in the file. The catalogue
// halves run in asm-suite.sql.
// ---------------------------------------------------------------------
{
  // Count contract keywords ONLY inside the two function headers (RETURNS ..
  // AS $fn$), where they are modifiers -- never in prose or assertion text.
  const headers = [...raw.matchAll(/RETURNS [\s\S]*?AS \$fn\$/g)].map((m) => m[0])
  const inHeaders = (re) => headers.reduce((n, h) => n + (h.match(re) || []).length, 0)
  const checks = [
    ['exactly two function headers', headers.length === 2],
    ['SECURITY DEFINER x2', inHeaders(/SECURITY DEFINER/g) === 2],
    ["SET search_path = '' x2", inHeaders(/SET search_path = ''/g) === 2],
    ['LANGUAGE plpgsql x2', inHeaders(/LANGUAGE plpgsql/g) === 2],
    // STRICT must not appear as a function modifier -- i.e. between RETURNS
    // and the body opener of either function. (The word appears in prose and
    // in the catalogue assertion's proisstrict check, which do not count.)
    ['no STRICT modifier', [...raw.matchAll(/RETURNS [\s\S]*?AS \$fn\$/g)].every((m) => !/\bSTRICT\b/.test(m[0]))],
    ['VOLATILE on the save', /assessment_save_observation[\s\S]{0,900}\bVOLATILE\b/.test(src)],
    ['STABLE on the read', /assessment_get_trainer_observation\(\s*p_class_session_id[\s\S]{0,1200}\bSTABLE\b/.test(src)],
    ['pinned Asia/Singapore literal', src.includes("AT TIME ZONE 'Asia/Singapore'")],
    ['no dynamic SQL', !/\bEXECUTE\s+(format|'|"|\$|v_|p_)/i.test(src)],
  ]
  let ok = true
  for (const [label, held] of checks) if (!held) { fail('T-ASM-41', `static contract violated: ${label}`); ok = false }
  if (ok) pass('T-ASM-41', 'static leg -- definer, pinned empty search_path, plpgsql, non-STRICT, VOLATILE/STABLE, pinned timezone, no dynamic SQL')
}

console.log('')
if (failures > 0) {
  console.error(`Assessment static scan: ${failures} failure(s).`)
  process.exitCode = 1
} else {
  console.log('Assessment static scan: all static proofs passed.')
}
