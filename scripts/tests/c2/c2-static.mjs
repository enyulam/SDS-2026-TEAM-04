#!/usr/bin/env node
// =====================================================================
// B.E.S.T Coach -- Round C2 Phase C2-A static scan (T-C2-S1 .. T-C2-S5)
// =====================================================================
// Text-only. Touches no database and starts no server.
//
// These five cases pin the properties of R-C2-1 that live in SOURCE
// rather than in the catalogue -- above all the one the behavioural suite
// structurally cannot reach: that the client navigates through the
// identifier the governed backend RETURNED, and constructs none of its
// own.
//
// EVERY case scans CODE, never prose. Both the migration and the two
// server files DOCUMENT the absences they are asserted to have ("no
// CREATE TABLE", "input.reportId remains deliberately unread"), so a scan
// over raw text would match its own subject's comments and assert the
// exact opposite of the intended property. Comments are therefore
// stripped before any forbidden-construct check.
//
// Run: node scripts/tests/c2/c2-static.mjs
// =====================================================================

import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const read = (p) => readFileSync(p, 'utf8').replace(/\r\n/g, '\n')

// Comment strippers. Deliberately conservative: they remove comment text
// and leave everything else, including string literals, untouched.
const stripSql = (s) => s.replace(/--[^\n]*/g, '')
const stripTs = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')

const CORE = join(ROOT, 'server', 'modules', 'observation', 'core.ts')
const ADAPTER = join(ROOT, 'server', 'modules', 'integration-adapter', 'participant-actions.ts')
const CLIENT = join(ROOT, 'features', 'trainer', 'trainer-assessment.tsx')
const ACTION_RESULT = join(ROOT, 'server', 'contracts', 'action-result.ts')
const MIG_DIR = join(ROOT, 'supabase', 'migrations')
const MIG_NAME = '20260806220000_assessment_complete_save_opens_report.sql'

const RPC = 'assessment_save_complete_and_open_report'

let failures = 0
const fail = (id, msg) => { failures += 1; console.error(`FAIL ${id}: ${msg}`) }
const pass = (id, msg) => console.log(`PASS ${id}${msg ? ' -- ' + msg : ''}`)

// Slice a named function out of a source file, comments stripped.
function bodyOf(src, startNeedle, endNeedle) {
  const a = src.indexOf(startNeedle)
  if (a < 0) return null
  const b = endNeedle ? src.indexOf(endNeedle, a) : src.length
  if (b < 0) return null
  return src.slice(a, b)
}

// ---------------------------------------------------------------------
// T-C2-S1  An INCOMPLETE assessment can never reach the RPC, and the save
//          path issues EXACTLY ONE rpc call.
// ---------------------------------------------------------------------
// The structural half of T-C2-1: `saveObservationCore` returns from its
// nine-dimension guard BEFORE the governed call is issued, so the report
// shell is unreachable for an incomplete payload by construction rather
// than by a runtime check that could be reordered later. And atomicity is
// never claimed across two PostgREST round trips (R-C2-1), which is only
// true while the function makes one call.
{
  const before = failures
  const save = bodyOf(stripTs(read(CORE)),
    'export async function saveObservationCore', 'export interface TrainerObservationDto')
  if (!save) {
    fail('T-C2-S1', 'saveObservationCore could not be located in observation/core.ts')
  } else {
    const guard = save.indexOf('"All nine dimensions must be rated."')
    const call = save.indexOf(RPC)
    if (guard < 0) fail('T-C2-S1', 'the nine-dimension validation guard is missing')
    if (call < 0) fail('T-C2-S1', `${RPC} is not called from saveObservationCore`)
    if (guard >= 0 && call >= 0 && guard >= call) {
      fail('T-C2-S1', 'the nine-dimension guard no longer precedes the governed RPC call')
    }
    const rpcCalls = save.match(/db\.rpc\(/g) || []
    if (rpcCalls.length !== 1) {
      fail('T-C2-S1', `saveObservationCore issues ${rpcCalls.length} rpc call(s); atomicity requires exactly 1`)
    }
    if (/"assessment_save_observation"/.test(save)) {
      fail('T-C2-S1', 'saveObservationCore still targets the non-atomic assessment_save_observation RPC')
    }
    // The identifier is READ from the row, never invented.
    if (!/reportId: row\.report_id/.test(save)) {
      fail('T-C2-S1', 'the returned reportId is not taken straight from the governed row')
    }
    if (/reportId:\s*(null|""|`)/.test(save)) {
      fail('T-C2-S1', 'the reportId is defaulted or constructed rather than returned')
    }
  }
  if (failures === before) {
    pass('T-C2-S1', 'the nine-dimension guard precedes a single governed rpc call to the atomic composer, and the reportId is read straight from its row')
  }
}

// ---------------------------------------------------------------------
// T-C2-S2  The migration adds the composer and nothing else.
// ---------------------------------------------------------------------
{
  const before = failures
  const all = readdirSync(MIG_DIR).filter((f) => f.endsWith('.sql')).sort()
  const newest = all[all.length - 1]
  if (newest !== MIG_NAME) {
    fail('T-C2-S2', `the newest migration is ${newest}, not the C2-A composer`)
  } else {
    const raw = read(join(MIG_DIR, newest))
    const body = stripSql(raw)
    // Every DDL/DML check is anchored to a STATEMENT START. The migration's
    // own end-of-run RAISE NOTICE legitimately names the constructs it does
    // not contain ("no CREATE OR REPLACE, and no data written"), and that
    // string is code, not a comment, so an unanchored match would assert the
    // opposite of the intended property.
    const creates = body.match(/^\s*CREATE\s+(OR\s+REPLACE\s+)?FUNCTION\b/gim) || []
    if (creates.length !== 1) fail('T-C2-S2', `${creates.length} CREATE FUNCTION statements, expected exactly 1`)
    for (const [label, re] of [
      ['CREATE OR REPLACE', /^\s*CREATE\s+OR\s+REPLACE\b/im],
      ['CREATE TABLE', /^\s*CREATE\s+TABLE\b/im], ['CREATE TYPE', /^\s*CREATE\s+TYPE\b/im],
      ['ALTER TYPE', /^\s*ALTER\s+TYPE\b/im], ['CREATE POLICY', /^\s*CREATE\s+POLICY\b/im],
      ['CREATE TRIGGER', /^\s*CREATE\s+TRIGGER\b/im], ['CREATE INDEX', /^\s*CREATE\s+(UNIQUE\s+)?INDEX\b/im],
      ['CREATE VIEW', /^\s*CREATE\s+VIEW\b/im], ['CREATE EXTENSION', /^\s*CREATE\s+EXTENSION\b/im],
      ['CREATE SCHEMA', /^\s*CREATE\s+SCHEMA\b/im], ['ALTER TABLE', /^\s*ALTER\s+TABLE\b/im],
      ['GRANT outside a function', /^\s*GRANT\b(?![^;]*ON\s+FUNCTION)/im],
    ]) {
      if (re.test(body)) fail('T-C2-S2', `the migration contains a forbidden ${label}`)
    }
    // Not one DML statement -- this is what keeps the canonical fixture
    // checksum unmoved.
    for (const [label, re] of [
      ['INSERT', /^\s*INSERT\s+INTO\b/im], ['UPDATE', /^\s*UPDATE\s+public\./im],
      ['DELETE', /^\s*DELETE\s+FROM\b/im], ['TRUNCATE', /^\s*TRUNCATE\b/im],
    ]) {
      if (re.test(body)) fail('T-C2-S2', `the migration writes data (${label})`)
    }
    if (!/GRANT EXECUTE ON FUNCTION[\s\S]*?TO authenticated;/.test(body)) {
      fail('T-C2-S2', 'the migration does not grant authenticated EXECUTE on the composer')
    }
    // A REVOKE naming service_role is REQUIRED; a GRANT to it is forbidden.
    if (/\bGRANT\b[\s\S]{0,200}?\bTO\b[^;]*service_role/i.test(body)) {
      fail('T-C2-S2', 'the migration grants something to service_role')
    }
    if (!/REVOKE ALL ON FUNCTION[\s\S]*?FROM PUBLIC, anon, service_role, authenticator;/.test(body)) {
      fail('T-C2-S2', 'the signature-qualified REVOKE of PUBLIC/anon/service_role/authenticator is missing')
    }
    if (!/SET search_path = ''/.test(body)) fail('T-C2-S2', 'the composer does not pin an EMPTY search_path')
    if (!/LANGUAGE plpgsql/.test(body)) fail('T-C2-S2', 'the composer is not plpgsql')
    if (!/SECURITY DEFINER/.test(body)) fail('T-C2-S2', 'the composer is not SECURITY DEFINER')
    // The file must NOT wrap itself: both the Supabase CLI and
    // verify-fresh-apply.mjs wrap it, and a self-wrap breaks the fresh-apply
    // proof.
    if (/^BEGIN;\s*$/m.test(body)) {
      fail('T-C2-S2', 'the migration wraps itself in BEGIN;/COMMIT; the harness already does that')
    }
  }
  if (failures === before) {
    pass('T-C2-S2', 'the migration creates exactly one plpgsql SECURITY DEFINER function, revokes then grants only authenticated EXECUTE, adds no table/enum/policy/constraint/index and writes no data')
  }
}

// ---------------------------------------------------------------------
// T-C2-S3  The authored error mapping is UNMODIFIED.
// ---------------------------------------------------------------------
// `server/contracts/action-result.ts` is deliberately not edited by this
// change. BC112/BC113 must still map to `stale_state` and BC101 must still
// resolve to a BARE `unauthorized`, or the composer's non-disclosure
// property would be lost at the boundary rather than in the database.
{
  const before = failures
  const src = read(ACTION_RESULT)
  for (const code of ['BC101', 'BC014', 'BC112', 'BC113']) {
    if (!src.includes(code)) fail('T-C2-S3', `${code} is no longer mapped`)
  }
  if (!/"BC112"[\s\S]{0,400}?stale_state/.test(src)) {
    fail('T-C2-S3', 'BC112 no longer resolves to a stale_state outcome')
  }
  if (!/"BC113"[\s\S]{0,400}?stale_state/.test(src)) {
    fail('T-C2-S3', 'BC113 no longer resolves to a stale_state outcome')
  }
  if (!/"BC101"[\s\S]{0,400}?unauthorized/.test(src)) {
    fail('T-C2-S3', 'BC101 no longer resolves to an unauthorized outcome')
  }
  if (failures === before) {
    pass('T-C2-S3', 'the authored SQLSTATE mapping is unmodified: BC101 -> unauthorized, BC112/BC113 -> stale_state, BC014 still mapped')
  }
}

// ---------------------------------------------------------------------
// T-C2-S4  The route transition uses the RETURNED identifier ONLY.
// ---------------------------------------------------------------------
// HONEST LIMITATION, recorded deliberately. A live browser proof of the
// screen 07 -> 08 transition would require the F17 runner to perform a
// governed write against the canonical fixture database, which its own
// G-18 gate forbids and which R-C2-2 makes unrepairable. This static
// proof, plus T-C2-2's assertion that the value the server hands back is
// a real committed report id, is the ceiling reachable without a
// disposable full-stack environment. `run-f17.mjs` is NOT modified.
{
  const before = failures
  const raw = read(CLIENT)
  const src = stripTs(raw)

  if (!/import \{[^}]*\buseRouter\b[^}]*\} from "next\/navigation"/.test(raw)) {
    fail('T-C2-S4', 'useRouter is not imported from next/navigation')
  }
  const pushes = src.match(/router\.push\([^)]*\)/g) || []
  if (pushes.length !== 1) {
    fail('T-C2-S4', `${pushes.length} router.push call(s); expected exactly 1`)
  } else if (pushes[0].trim() !== 'router.push(`/trainer/reports/${result.data.reportId}/generate`)') {
    fail('T-C2-S4', `the navigation target is not the returned id: ${pushes[0].trim()}`)
  }

  // Every /trainer/reports/ route template in this file must interpolate a
  // reportId the governed backend returned -- never a session, a student,
  // a route param or a concatenation.
  const templates = src.match(/`\/trainer\/reports\/[^`]*`/g) || []
  if (templates.length === 0) fail('T-C2-S4', 'no /trainer/reports/ route template found')
  for (const t of templates) {
    if (!/\$\{[A-Za-z.]*\breportId\}/.test(t)) {
      fail('T-C2-S4', `a report route is built from something other than a returned reportId: ${t}`)
    }
    if (/sessionId|studentId|params\./.test(t)) {
      fail('T-C2-S4', `a report route interpolates a session/student/route param: ${t}`)
    }
  }

  // No fabrication of any kind around a report identifier.
  if (/reportId[^\n]*\bas string\b/.test(src)) fail('T-C2-S4', 'a reportId is cast with `as string`')
  if (/reportId[^\n]*\?\?\s*""/.test(src)) fail('T-C2-S4', 'a reportId is defaulted with `?? ""`')
  if (/\breportId!/.test(src)) fail('T-C2-S4', 'a reportId carries a non-null assertion')
  if (/`\$\{[^`]*sessionId[^`]*\}-\$\{[^`]*studentId/.test(src)) {
    fail('T-C2-S4', 'a report identifier is constructed from the session and student')
  }
  // The null guard in front of the navigation must survive.
  if (!/result\.data\.reportId !== null/.test(src)) {
    fail('T-C2-S4', 'the navigation no longer guards against a null identifier')
  }

  if (failures === before) {
    pass('T-C2-S4', 'exactly one router.push, null-guarded, targeting the RETURNED report id; no report route is derived, cast, defaulted or concatenated')
  }
}

// ---------------------------------------------------------------------
// T-C2-S5  The adapter never trusts a CLIENT-SUPPLIED report key.
// ---------------------------------------------------------------------
// `AdapterSaveObservationInput.reportId` stays in the contract because the
// deterministic fixture legitimately uses it -- but the REAL path must
// never read it. Reading it would be exactly the client-supplied
// report-key workaround R-C2-1 prohibits.
{
  const before = failures
  const body = bodyOf(stripTs(read(ADAPTER)),
    'export async function adapterSaveObservation', 'export async function adapterRequestDraft')
  if (!body) {
    fail('T-C2-S5', 'adapterSaveObservation could not be located')
  } else {
    if (/input\.reportId/.test(body)) {
      fail('T-C2-S5', 'adapterSaveObservation reads the client-supplied input.reportId')
    }
    if (!/reportId: saved\.data\.reportId/.test(body)) {
      fail('T-C2-S5', "adapterSaveObservation does not return the governed save's own reportId")
    }
    if (/readWorking\(/.test(body)) {
      fail('T-C2-S5', 'adapterSaveObservation still reads the report position back in a second round trip')
    }
    // The CAS asymmetry that makes a concurrent edit lose must survive.
    if (!/expectedLockVersion:\s*input\.observationLockVersion/.test(body)) {
      fail('T-C2-S5', 'the CAS asymmetry (caller-rendered lock version) was removed')
    }
    if (!/getTrainerObservationCore\(/.test(body)) {
      fail('T-C2-S5', 'the chips/term-evidence read-back was removed')
    }
  }
  // No alternative generation route keyed by the untrusted pair (R-C2-1).
  const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)])
  const routes = walk(join(ROOT, 'app')).filter((f) => /generate/.test(f))
  for (const r of routes) {
    if (/\[sessionId\]|\[studentId\]/.test(r)) {
      fail('T-C2-S5', `a generation route keyed by a client-supplied pair exists: ${r}`)
    }
  }
  if (failures === before) {
    pass('T-C2-S5', 'the adapter never reads input.reportId, returns the governed id with no read-back, keeps the CAS asymmetry and the chips read-back, and no pair-keyed generation route exists')
  }
}

console.log('')
if (failures > 0) {
  console.error(`C2-A static scan: ${failures} failure(s).`)
  process.exitCode = 1
} else {
  console.log('C2-A static scan: all five cases passed.')
}
