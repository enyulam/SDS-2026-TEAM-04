#!/usr/bin/env node
// =====================================================================
// B.E.S.T Coach -- Run C3-A Phase 1 static scan (T-C3-S1 .. T-C3-S4)
// =====================================================================
// Repository-level properties that no runtime query can prove: what the
// new migration FILE contains, that every already-applied migration is
// byte-unchanged, and that no application source reaches the old
// assessment RPC.
//
// Run: node scripts/tests/c3/c3-static.mjs
// =====================================================================

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'

const ROOT = process.cwd()
const MIG_DIR = join(ROOT, 'supabase', 'migrations')
const MIG_NAME = '20260807090000_assessment_complete_save_single_entry_point.sql'
const NEWEST_MIG_NAME = '20260809160000_od4_reopen_envelope_version_fix.sql'
const COMPOSER_MIG = '20260806220000_assessment_complete_save_opens_report.sql'
const ASSESSMENT_MIG = '20260806090000_assessment_governed_persistence.sql'

let failures = 0
const fail = (id, msg) => { failures += 1; console.error(`FAIL ${id}: ${msg}`) }
const pass = (id, msg) => console.log(`PASS ${id}${msg ? ' -- ' + msg : ''}`)

const read = (p) => readFileSync(p, 'utf8').replace(/\r\n/g, '\n')
// Strip `--` comments so a rule DISCUSSED in prose is never mistaken for a
// statement that implements it. This migration's header discusses GRANT,
// CREATE FUNCTION and DML at length precisely to record that it contains
// none of them, so an uncommented scan would assert the opposite.
const code = (s) => s.replace(/--[^\n]*/g, '')

const raw = read(join(MIG_DIR, MIG_NAME))
const body = code(raw)

// ---------------------------------------------------------------------
// T-C3-S1 -- the migration moves EXACTLY ONE privilege, in one direction
// ---------------------------------------------------------------------
{
  const before = failures
  const revokes = body.match(/^\s*REVOKE\b/gim) || []
  if (revokes.length !== 1) fail('T-C3-S1', `${revokes.length} REVOKE statements, expected exactly 1`)
  if (!/^\s*REVOKE ALL ON FUNCTION public\.assessment_save_observation\(uuid, uuid, uuid, integer, text\[\], text\[\], text, text, text, jsonb\) FROM authenticated, PUBLIC, anon, service_role, authenticator;/m.test(body)) {
    fail('T-C3-S1', 'the single REVOKE is not the signature-qualified removal of client EXECUTE from assessment_save_observation')
  }
  // NOTHING is granted, created, replaced, dropped or written.
  for (const [label, re] of [
    ['GRANT', /^\s*GRANT\b/im],
    ['CREATE FUNCTION', /^\s*CREATE\s+(OR\s+REPLACE\s+)?FUNCTION\b/im],
    ['CREATE OR REPLACE', /^\s*CREATE\s+OR\s+REPLACE\b/im],
    ['DROP', /^\s*DROP\b/im],
    ['CREATE TABLE', /^\s*CREATE\s+TABLE\b/im],
    ['CREATE TYPE', /^\s*CREATE\s+TYPE\b/im],
    ['ALTER TYPE', /^\s*ALTER\s+TYPE\b/im],
    ['ALTER TABLE', /^\s*ALTER\s+TABLE\b/im],
    ['ALTER FUNCTION', /^\s*ALTER\s+FUNCTION\b/im],
    ['CREATE POLICY', /^\s*CREATE\s+POLICY\b/im],
    ['CREATE TRIGGER', /^\s*CREATE\s+TRIGGER\b/im],
    ['CREATE INDEX', /^\s*CREATE\s+(UNIQUE\s+)?INDEX\b/im],
    ['CREATE VIEW', /^\s*CREATE\s+(MATERIALIZED\s+)?VIEW\b/im],
    ['CREATE EXTENSION', /^\s*CREATE\s+EXTENSION\b/im],
    ['CREATE SCHEMA', /^\s*CREATE\s+SCHEMA\b/im],
    ['ALTER DEFAULT PRIVILEGES', /^\s*ALTER\s+DEFAULT\s+PRIVILEGES\b/im],
    ['OWNER TO', /\bOWNER\s+TO\b/i],
    ['COMMENT ON', /^\s*COMMENT\s+ON\b/im],
    ['INSERT', /^\s*INSERT\s+INTO\b/im],
    ['UPDATE', /^\s*UPDATE\s+public\./im],
    ['DELETE', /^\s*DELETE\s+FROM\b/im],
    ['TRUNCATE', /^\s*TRUNCATE\b/im],
  ]) {
    if (re.test(body)) fail('T-C3-S1', `the migration contains a forbidden ${label}`)
  }
  if (!/current_user <> 'postgres'/.test(body)) fail('T-C3-S1', 'the migration has no P-1 postgres guard')
  if (failures === before) {
    pass('T-C3-S1', 'exactly 1 REVOKE and nothing else -- no GRANT, no CREATE, no CREATE OR REPLACE, no DROP, no table, type, column, policy, index, trigger, view, extension, schema, ownership or default-privilege change, and not one DML statement; the P-1 postgres guard is present')
  }
}

// ---------------------------------------------------------------------
// T-C3-S2 -- the migration ledger, and the byte-immutability of history
// ---------------------------------------------------------------------
{
  const before = failures
  const all = readdirSync(MIG_DIR).filter((f) => f.endsWith('.sql')).sort()
  if (all.length !== 14) fail('T-C3-S2', `${all.length} migration files exist, expected 14`)
  // Run C3-A Phase 2b added the Management submitted-report list (C2C-004),
  // which sorts AFTER the single-entry-point closure. The closure is
  // therefore an ALREADY-APPLIED file and sits in the byte-identical-to-HEAD
  // leg below -- a strictly stronger assertion for it, not a weaker one.
  if (!all.includes(MIG_NAME)) {
    fail('T-C3-S2', 'the C3-A single-entry-point closure migration is missing')
  }
  if (all[all.length - 1] !== NEWEST_MIG_NAME) {
    fail('T-C3-S2', `the newest migration is ${all[all.length - 1]}, not ${NEWEST_MIG_NAME}`)
  }
  // Every file EXCEPT the new one must be byte-identical to HEAD. An
  // already-applied migration is never edited (T-ASM-33 / T-CT-S4).
  for (const f of all.slice(0, -1)) {
    const rel = `supabase/migrations/${f}`
    const head = spawnSync('git', ['show', `HEAD:${rel}`], { cwd: ROOT, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 })
    if (head.status !== 0) { fail('T-C3-S2', `could not read ${rel} from HEAD`); continue }
    const h1 = createHash('sha256').update(head.stdout.replace(/\r\n/g, '\n')).digest('hex')
    const h2 = createHash('sha256').update(read(join(MIG_DIR, f))).digest('hex')
    if (h1 !== h2) fail('T-C3-S2', `${rel} differs from HEAD -- an applied migration must never be edited`)
  }
  if (failures === before) {
    // (Run C3-A correction cycle: this string narrated the superseded
    //  eleven-file census and became FALSE when the twelfth migration
    //  landed. The assertions above have always read `all.length !== 12`
    //  and compared `all.slice(0, -1)`; the prose now says what they
    //  measure, and the newest file is the C2C-004 Management
    //  submitted-report list, not the single-entry-point closure.)
    // Narration DERIVED from what was measured. It read "twelve/eleven"
    // against a 13- and then 14-file ledger -- the assertion was right and
    // the evidence line shipped into the run record was false.
    pass('T-C3-S2', `${all.length} migration files; the ${all.length - 1} already-applied files are byte-identical to HEAD; ${MIG_NAME} is present and ${NEWEST_MIG_NAME} sorts last`)
  }
}

// ---------------------------------------------------------------------
// T-C3-S3 -- no application source reaches the old assessment RPC
// ---------------------------------------------------------------------
// The generated database types legitimately DESCRIBE every function in the
// schema, including one no client may execute, so they are excluded: a type
// declaration is not a call.
{
  const before = failures
  const roots = ['app', 'server', 'lib', 'features']
  const skip = new Set(['node_modules', '.next', '.git'])
  const walk = (d) => {
    let files = []
    let entries
    try { entries = readdirSync(d, { withFileTypes: true }) } catch { return files }
    for (const e of entries) {
      if (skip.has(e.name)) continue
      const p = join(d, e.name)
      if (e.isDirectory()) files = files.concat(walk(p))
      else if (/\.(ts|tsx|mts|mjs|js)$/.test(e.name)) files.push(p)
    }
    return files
  }
  const generated = join(ROOT, 'server', 'db', 'database.types.ts')
  let scanned = 0
  for (const rootName of roots) {
    const dir = join(ROOT, rootName)
    try { statSync(dir) } catch { continue }
    for (const f of walk(dir)) {
      if (f === generated) continue
      scanned += 1
      const src = read(f)
      if (/\.rpc\(\s*["'`]assessment_save_observation/.test(src)) {
        fail('T-C3-S3', `${f} calls the old assessment_save_observation RPC directly`)
      }
      if (/\.from\(\s*["'`](observations|observation_ratings|reports)["'`]\s*\)\s*\.\s*(insert|update|delete|upsert)/.test(src)) {
        fail('T-C3-S3', `${f} performs direct client DML on an observation or report table`)
      }
    }
  }
  if (scanned === 0) fail('T-C3-S3', 'no application source files were scanned')
  if (failures === before) {
    pass('T-C3-S3', `${scanned} application source file(s) scanned: none calls assessment_save_observation and none performs direct DML on observations, observation_ratings or reports`)
  }
}

// ---------------------------------------------------------------------
// T-C3-S4 -- the two files this closure reasons about are untouched
// ---------------------------------------------------------------------
// The closure's whole argument is that (a) the delegate accepts ONLY a
// complete nine-rating payload, and (b) the composer pairs the observation
// write with the report shell. Both are read out of the committed files
// here, so a silent edit to either would fail this scan rather than quietly
// invalidate the reasoning in the migration header.
{
  const before = failures
  const assessment = code(read(join(MIG_DIR, ASSESSMENT_MIG)))
  if (!/jsonb_array_length\(p_ratings\) <> 9/.test(assessment) || !/'BC106'/.test(assessment)) {
    fail('T-C3-S4', 'the assessment migration no longer refuses any payload that is not exactly nine ratings')
  }
  const composer = code(read(join(MIG_DIR, COMPOSER_MIG)))
  for (const needle of ['public.assessment_save_observation(', 'public.report_create(', 'public.report_mark_observation_saved(']) {
    if (!composer.includes(needle)) fail('T-C3-S4', `the composer migration no longer calls ${needle}`)
  }
  if (!/GRANT EXECUTE ON FUNCTION public\.assessment_save_complete_and_open_report\([^)]*\) TO authenticated;/.test(composer)) {
    fail('T-C3-S4', 'the composer no longer holds the authenticated EXECUTE that makes it the client entry point')
  }
  if (failures === before) {
    pass('T-C3-S4', "the delegate's BC106 nine-rating gate and the composer's three-call pairing plus its authenticated grant are present in the committed migration files")
  }
}

console.log('')
if (failures > 0) {
  console.error(`C3-A static scan: ${failures} failure(s).`)
  process.exitCode = 1
} else {
  console.log('C3-A static scan: all static proofs passed.')
}
