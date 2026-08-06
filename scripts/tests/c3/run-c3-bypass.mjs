#!/usr/bin/env node
// =====================================================================
// B.E.S.T Coach -- Run C3-A Phase 1: the direct complete-save bypass is
// closed (item 1)
// =====================================================================
// LOCAL DISPOSABLE DEVELOPMENT DATABASE ONLY for every committing leg.
//
// THE DEFECT UNDER TEST. `assessment_save_complete_and_open_report`
// (R-C2-1) writes the observation and opens the report shell in ONE
// transaction. But `assessment_save_observation` -- the function it
// delegates to -- kept its own `authenticated` EXECUTE, so PostgREST
// published it and ANY authenticated caller could commit a COMPLETE
// nine-rating assessment with NO report shell, using nothing but their own
// valid session. The atomicity was a property of one route, not of the
// database.
//
// WHAT THIS SUITE PROVES, IN ORDER:
//   T-C3-1  the privilege posture on a real database: the old RPC is
//           reachable by NO client role; the composer still is.
//   T-C3-2  a DIRECT call to the old RPC, as the `authenticated` role with
//           a real trainer JWT and a COMPLETE nine-rating payload, is
//           REFUSED -- and NOTHING commits: no observation, no rating, no
//           report, no audit event.
//   T-C3-3  THE NEGATIVE CONTROL. On the disposable clone only, the grant
//           is put back and the IDENTICAL call COMMITS the whole
//           assessment with ZERO reports -- the exact bypass. The grant is
//           then removed again. Without this leg T-C3-2 would prove only
//           that something refused, not that the closure is what refuses.
//   T-C3-4  the COMPOSER path still works end to end for the same caller:
//           one observation, nine ratings, EXACTLY ONE report at
//           `observation_saved`, and the audit chain verifies.
//   T-C3-5  an INCOMPLETE payload is unaffected by the closure. It was
//           never accepted by either function (BC106, Amendment 002
//           A-017), it is still answered with the same authored BC106
//           through the composer, and -- proven with the grant restored on
//           the disposable clone -- the delegate answered it with BC106
//           too. No incomplete-save capability existed and none was
//           removed.
//   T-C3-6  the refusal is NON-DISCLOSING: identical SQLSTATE and
//           identical MESSAGE for the trainer, the management and the
//           parent identity.
//   T-C3-7  the closure is EXHAUSTIVE: of every function a client may
//           execute, exactly one reaches the observation write, and no
//           client role holds INSERT/UPDATE/DELETE on the observation or
//           report tables.
//   T-C3-8  the REAL PostgREST channel, over HTTP, under a REAL local Auth
//           session: the old RPC is no longer reachable and the composer
//           is. This leg is READ-ONLY BY CONSTRUCTION -- it runs only
//           AFTER the privilege has been measured absent on the canonical
//           database, so the request cannot enter the function body, and
//           the canonical census is re-measured afterwards.
//
// WHY A DISPOSABLE DATABASE IS NON-NEGOTIABLE. T-C3-3 and T-C3-4 COMMIT.
// `report_create` and `report_mark_observation_saved` append audit events,
// and `audit_events` is UPDATE/DELETE-blocked by trigger with no owner
// exemption. ONE stray committed audit event on the canonical database is
// PERMANENT and would break the canonical fixture checksum, the 28-row
// canonical region and the F17 G-18 pin simultaneously and forever.
//
// NO PASSWORD IS HANDLED ANYWHERE IN THIS FILE. The real sessions in
// T-C3-8 come from the Auth admin magiclink -> verifyOtp channel already
// accepted in run-integration.mjs; nothing is created, reset or destroyed,
// and no key, token or connection string is ever printed.
//
// Run: node scripts/tests/c3/run-c3-bypass.mjs
// =====================================================================

import { spawn } from 'node:child_process'
import { join } from 'node:path'
import { createClient } from '@supabase/supabase-js'

const CONTAINER = 'supabase_db_best-coach-mvp'
const SEED_DB = 'bc_c3_seed'
const WORK_DB = 'bc_c3'
const CANONICAL = 'postgres'
const ROOT = process.cwd()
const STATIC = join(ROOT, 'scripts', 'tests', 'c3', 'c3-static.mjs')

const DELEGATE_SIG = 'public.assessment_save_observation(uuid, uuid, uuid, integer, text[], text[], text, text, text, jsonb)'

// Step 7F fixture constants.
const CENTRE = 'b0000000-0000-4000-8000-000000000001'
const STUDENT = 'c2000000-0000-4000-8000-000000000001'
const MODULE = 'c4000000-0000-4000-8000-000000000001'
const ENROLMENT = 'c6000000-0000-4000-8000-000000000001'
const TRAINER_M = 'c1000000-0000-4000-8000-000000000002'
const SUB = {
  management: 'd0000000-0000-4000-8000-000000000001',
  trainer: 'd0000000-0000-4000-8000-000000000002',
  parent: 'd0000000-0000-4000-8000-000000000003',
}
const EMAIL = {
  management: 'management.fixture@example.test',
  trainer: 'trainer.fixture@example.test',
  parent: 'parent.fixture@example.test',
}
const claims = (who) => `{"sub":"${SUB[who]}","role":"authenticated"}`

const NINE = JSON.stringify([
  { dimension_code: 'body', rating: 'mastered' },
  { dimension_code: 'emotion', rating: 'developing' },
  { dimension_code: 'speech', rating: 'mastering' },
  { dimension_code: 'tonality', rating: 'developing' },
  { dimension_code: 'eye_contact', rating: 'beginning' },
  { dimension_code: 'vocal_projection', rating: 'mastered' },
  { dimension_code: 'emotional_expression', rating: 'developing' },
  { dimension_code: 'sentence_flow', rating: 'mastering' },
  { dimension_code: 'audience_awareness', rating: 'mastering' },
])
const FOUR = JSON.stringify([
  { dimension_code: 'body', rating: 'mastered' },
  { dimension_code: 'emotion', rating: 'developing' },
  { dimension_code: 'speech', rating: 'mastering' },
  { dimension_code: 'tonality', rating: 'developing' },
])

let failures = 0
const fail = (id, msg) => { failures += 1; console.error(`FAIL ${id}: ${msg}`) }
const pass = (id, msg) => console.log(`PASS ${id}${msg ? ' -- ' + msg : ''}`)

function psql(db, sql, { tuplesOnly = true, stopOnError = true, user = 'postgres' } = {}) {
  return new Promise((resolve) => {
    const args = ['exec', '-i', CONTAINER, 'psql', '--no-psqlrc', `--username=${user}`,
      `--dbname=${db}`, '--quiet']
    if (stopOnError) args.push('--set=ON_ERROR_STOP=1')
    if (tuplesOnly) args.push('-t', '-A', '-F|')
    const p = spawn('docker', args, { stdio: ['pipe', 'pipe', 'pipe'] })
    let out = '', err = ''
    p.stdout.on('data', (d) => { out += d })
    p.stderr.on('data', (d) => { err += d })
    p.on('close', (code) => resolve({ code, out: out.trim(), err: err.trim() }))
    p.stdin.end(sql)
  })
}

const q = async (db, sql) => {
  const r = await psql(db, sql)
  if (r.code !== 0) throw new Error(`psql failed on ${db}:\n${r.err}`)
  return r.out
}

function run(cmd, args) {
  return new Promise((resolve) => {
    const p = spawn(cmd, args, { stdio: ['pipe', 'pipe', 'pipe'] })
    let out = '', err = ''
    p.stdout.on('data', (d) => { out += d })
    p.stderr.on('data', (d) => { err += d })
    p.on('close', (code) => resolve({ code, out, err }))
    p.stdin.end()
  })
}

// ---------------------------------------------------------------------
// Disposable database lifecycle -- the accepted project pattern.
// ---------------------------------------------------------------------
async function createDisposable() {
  const sql = `
UPDATE pg_database SET datallowconn = false WHERE datname = '${CANONICAL}';
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${CANONICAL}' AND pid <> pg_backend_pid();
SELECT pg_sleep(1);
DROP DATABASE IF EXISTS ${SEED_DB};
CREATE DATABASE ${SEED_DB} TEMPLATE ${CANONICAL};
UPDATE pg_database SET datallowconn = true WHERE datname = '${CANONICAL}';
ALTER DATABASE ${SEED_DB} OWNER TO postgres;`
  const r = await psql('template1', sql, { tuplesOnly: false, user: 'supabase_admin' })
  if (r.code !== 0) throw new Error(`could not create the disposable seed:\n${r.err}`)
  const w = await psql('template1',
    `DROP DATABASE IF EXISTS ${WORK_DB};
     CREATE DATABASE ${WORK_DB} TEMPLATE ${SEED_DB};
     ALTER DATABASE ${WORK_DB} OWNER TO postgres;`,
    { tuplesOnly: false, user: 'supabase_admin' })
  if (w.code !== 0) throw new Error(`could not create the disposable database:\n${w.err}`)
}

async function destroyDisposable() {
  await psql('template1', `DROP DATABASE IF EXISTS ${WORK_DB};`,
    { tuplesOnly: false, stopOnError: false, user: 'supabase_admin' })
  await psql('template1', `DROP DATABASE IF EXISTS ${SEED_DB};`,
    { tuplesOnly: false, stopOnError: false, user: 'supabase_admin' })
}

const CENSUS = `
SELECT (SELECT count(*) FROM public.reports)
  || '|' || (SELECT count(*) FROM public.report_versions)
  || '|' || (SELECT count(*) FROM public.report_version_ratings)
  || '|' || (SELECT count(*) FROM public.report_correction_requests)
  || '|' || (SELECT count(*) FROM public.observations)
  || '|' || (SELECT count(*) FROM public.observation_ratings)
  || '|' || (SELECT count(*) FROM public.audit_events)
  || '|' || (SELECT count(*) FROM public.audit_chain_heads)
  || '|' || (SELECT count(*) FROM auth.users)
  || '|' || (SELECT count(*) FROM supabase_migrations.schema_migrations);`

// A past-dated session with its assignment and a `present` attendance row,
// so every ratified write gate is SATISFIED. That matters: a refusal must
// be attributable to the missing privilege and to nothing else.
async function makeScenario(n) {
  const session = `c5000000-0000-4000-8000-0000000${String(9300 + n).padStart(5, '0')}`
  await q(WORK_DB, `
INSERT INTO public.class_sessions (id, centre_id, class_module_id, session_date, starts_at, ends_at)
VALUES ('${session}','${CENTRE}','${MODULE}', (now() AT TIME ZONE 'Asia/Singapore')::date - 1, '10:00','11:00');
INSERT INTO public.class_session_assignments (centre_id, class_session_id, trainer_membership_id)
VALUES ('${CENTRE}','${session}','${TRAINER_M}');
INSERT INTO public.attendance (centre_id, class_session_id, class_module_id, student_id, enrolment_id, status)
VALUES ('${CENTRE}','${session}','${MODULE}','${STUDENT}','${ENROLMENT}','present');`)
  return session
}

const delegateCall = (session, ratings) => `
  public.assessment_save_observation(
    '${session}'::uuid, '${STUDENT}'::uuid, NULL, NULL,
    ARRAY['confident-opening']::text[], ARRAY['pacing']::text[],
    'Direct-call probe.', 'Follow up.', '', '${ratings}'::jsonb)`

const composerCall = (session, ratings) => `
  public.assessment_save_complete_and_open_report(
    '${session}'::uuid, '${STUDENT}'::uuid, NULL, NULL,
    ARRAY['confident-opening']::text[], ARRAY['pacing']::text[],
    'Governed save.', 'Follow up.', '', '${ratings}'::jsonb)`

// Execute one call AS THE `authenticated` DATABASE ROLE, under a real
// fixture JWT claim, and report the SQLSTATE and MESSAGE verbatim. The role
// switch is what makes this a genuine client-channel probe rather than an
// owner-side call that would never consult the ACL at all.
async function asAuthenticated(who, call, { commit = true } = {}) {
  const sql = `
SET request.jwt.claims = '${claims(who)}';
SET ROLE authenticated;
DO $probe$
DECLARE v_state text; v_msg text; v_id uuid;
BEGIN
  BEGIN
    SELECT x.observation_id INTO v_id FROM ${call} AS x;
    RAISE NOTICE 'PROBE=OK:%', v_id;
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_state = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    RAISE NOTICE 'PROBE=ERR:%:%', v_state, v_msg;
  END;
END $probe$;
RESET ROLE;`
  const r = await psql(WORK_DB, commit ? sql : sql, { tuplesOnly: false, stopOnError: false })
  const stream = `${r.err}\n${r.out}`
  const ok = /PROBE=OK:([0-9a-f-]{36})/.exec(stream)
  if (ok) return { ok: true, id: ok[1] }
  const err = /PROBE=ERR:([0-9A-Za-z]{5}):(.*)/.exec(stream)
  if (err) return { ok: false, state: err[1], message: err[2].trim() }
  return { ok: false, state: 'NO_RESULT', message: stream.slice(0, 400) }
}

const rowsFor = (session) => `
SELECT (SELECT count(*) FROM public.observations WHERE class_session_id='${session}')
  || '|' || (SELECT count(*) FROM public.observation_ratings r
               JOIN public.observations o ON o.id = r.observation_id
              WHERE o.class_session_id='${session}')
  || '|' || (SELECT count(*) FROM public.reports WHERE class_session_id='${session}');`

// ---------------------------------------------------------------------
async function main() {
  console.log('=== Run C3-A Phase 1: the direct complete-save bypass is closed ===\n')

  // 1 -- static scan.
  const scan = await run(process.execPath, [STATIC])
  process.stdout.write(scan.out)
  if (scan.code !== 0) { process.stderr.write(scan.err); fail('c3-static', 'the static scan failed') }

  // 2 -- the canonical state BEFORE, so "never written" is MEASURED.
  const canonBefore = await q(CANONICAL, CENSUS)

  // 3 -- disposable database.
  await createDisposable()
  console.log('\nDisposable database created from the canonical fixture template.\n')

  // -----------------------------------------------------------------
  // T-C3-1  the privilege posture, read from the catalogue
  // -----------------------------------------------------------------
  {
    const posture = await q(WORK_DB, `
SELECT p.proname || '=' ||
       has_function_privilege('authenticated', p.oid, 'EXECUTE')::text || ',' ||
       has_function_privilege('anon', p.oid, 'EXECUTE')::text || ',' ||
       has_function_privilege('service_role', p.oid, 'EXECUTE')::text || ',' ||
       has_function_privilege('authenticator', p.oid, 'EXECUTE')::text
  FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
 WHERE n.nspname = 'public'
   AND p.proname IN ('assessment_save_observation','assessment_save_complete_and_open_report')
 ORDER BY p.proname;`)
    const total = await q(WORK_DB, `
SELECT count(*) FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
 WHERE n.nspname='public' AND has_function_privilege('authenticated', p.oid, 'EXECUTE');`)
    const expected = [
      'assessment_save_complete_and_open_report=true,false,false,false',
      'assessment_save_observation=false,false,false,false',
    ].join('\n')
    if (posture !== expected) fail('T-C3-1', `the EXECUTE posture is\n${posture}\nexpected\n${expected}`)
    else if (total !== '24') fail('T-C3-1', `${total} functions hold authenticated EXECUTE, expected 24`)
    else pass('T-C3-1', 'assessment_save_observation is reachable by NO client role; the R-C2-1 composer holds authenticated EXECUTE exclusively; 24 functions hold authenticated EXECUTE (was 25)')
  }

  // -----------------------------------------------------------------
  // T-C3-2  the direct complete-save bypass is REFUSED, with no residue
  // -----------------------------------------------------------------
  const s2 = await makeScenario(2)
  {
    const before = await q(WORK_DB, rowsFor(s2))
    const r = await asAuthenticated('trainer', delegateCall(s2, NINE))
    const after = await q(WORK_DB, rowsFor(s2))
    if (r.ok) {
      fail('T-C3-2', `the direct nine-rating call SUCCEEDED and returned observation ${r.id} -- the bypass is OPEN`)
    } else if (r.state !== '42501') {
      fail('T-C3-2', `the direct nine-rating call gave SQLSTATE ${r.state} (${r.message}); expected 42501 insufficient_privilege`)
    } else if (before !== '0|0|0' || after !== '0|0|0') {
      fail('T-C3-2', `residue: observations|ratings|reports were ${before} before and ${after} after the refusal; expected 0|0|0 both times`)
    } else {
      pass('T-C3-2', `a COMPLETE nine-rating payload sent DIRECTLY to assessment_save_observation, as the authenticated role under a real trainer JWT with every write gate satisfied, was refused with SQLSTATE 42501 -- and committed no observation, no rating and no report`)
    }
  }

  // -----------------------------------------------------------------
  // T-C3-3  THE NEGATIVE CONTROL -- the bypass is real, and the revoke
  //         is what closes it. DISPOSABLE DATABASE ONLY.
  // -----------------------------------------------------------------
  // This leg deliberately puts the grant back on the THROWAWAY clone and
  // shows the identical call committing a complete assessment with ZERO
  // reports. It is not a product change: the canonical database and every
  // committed migration are untouched, the grant is removed again
  // immediately, and the posture is re-measured afterwards.
  const s3 = await makeScenario(3)
  {
    await q(WORK_DB, `GRANT EXECUTE ON FUNCTION ${DELEGATE_SIG} TO authenticated;`)
    const r = await asAuthenticated('trainer', delegateCall(s3, NINE))
    const after = await q(WORK_DB, rowsFor(s3))
    await q(WORK_DB, `REVOKE ALL ON FUNCTION ${DELEGATE_SIG} FROM authenticated;`)
    const restored = await q(WORK_DB,
      `SELECT has_function_privilege('authenticated', '${DELEGATE_SIG}'::regprocedure, 'EXECUTE')::text;`)
    if (!r.ok) {
      fail('T-C3-3', `with the grant restored the direct call still failed (${r.state} ${r.message}); the negative control cannot demonstrate the bypass`)
    } else if (after !== '1|9|0') {
      fail('T-C3-3', `with the grant restored the direct call left observations|ratings|reports = ${after}; expected 1|9|0 (the bypass shape)`)
    } else if (restored !== 'false') {
      fail('T-C3-3', 'the negative control did not remove the grant it restored')
    } else {
      pass('T-C3-3', 'NEGATIVE CONTROL on the disposable clone: with authenticated EXECUTE restored, the IDENTICAL direct call COMMITTED a complete nine-rating assessment with ZERO reports -- the exact bypass. The grant was then removed again and re-measured absent, so T-C3-2 is attributable to the closure and to nothing else')
    }
  }

  // -----------------------------------------------------------------
  // T-C3-4  the governed composer path still works end to end
  // -----------------------------------------------------------------
  const s4 = await makeScenario(4)
  {
    const r = await asAuthenticated('trainer', composerCall(s4, NINE))
    const after = await q(WORK_DB, rowsFor(s4))
    const shell = await q(WORK_DB,
      `SELECT status::text || '|' || lock_version::text FROM public.reports WHERE class_session_id='${s4}';`)
    const chain = await q(WORK_DB, `SELECT bool_and(ok) FROM public.audit_verify_chain(NULL, NULL, NULL);`)
    if (!r.ok) {
      fail('T-C3-4', `the composer call failed with ${r.state}: ${r.message}`)
    } else if (after !== '1|9|1') {
      fail('T-C3-4', `the composer left observations|ratings|reports = ${after}; expected 1|9|1`)
    } else if (shell !== 'observation_saved|2') {
      fail('T-C3-4', `the report shell is ${shell}; expected observation_saved|2`)
    } else if (chain !== 't' && chain !== '') {
      fail('T-C3-4', 'the audit chain does not verify after the governed save')
    } else {
      pass('T-C3-4', 'the SAME authenticated caller, through the composer, committed one observation, nine ratings and EXACTLY ONE report shell at observation_saved (lock_version 2) in one transaction, and the audit chain verifies')
    }
  }

  // -----------------------------------------------------------------
  // T-C3-5  incomplete payloads are unaffected -- none was ever accepted
  // -----------------------------------------------------------------
  const s5 = await makeScenario(5)
  {
    const viaComposer = await asAuthenticated('trainer', composerCall(s5, FOUR))
    const afterComposer = await q(WORK_DB, rowsFor(s5))
    // With the grant restored on the throwaway clone, the DELEGATE's own
    // answer to the same incomplete payload is measured rather than assumed.
    await q(WORK_DB, `GRANT EXECUTE ON FUNCTION ${DELEGATE_SIG} TO authenticated;`)
    const viaDelegate = await asAuthenticated('trainer', delegateCall(s5, FOUR))
    await q(WORK_DB, `REVOKE ALL ON FUNCTION ${DELEGATE_SIG} FROM authenticated;`)
    const afterDelegate = await q(WORK_DB, rowsFor(s5))
    if (viaComposer.ok || viaComposer.state !== 'BC106') {
      fail('T-C3-5', `an incomplete payload through the composer gave ${viaComposer.ok ? 'success' : viaComposer.state}; expected the authored BC106`)
    } else if (viaDelegate.ok || viaDelegate.state !== 'BC106') {
      fail('T-C3-5', `an incomplete payload through the delegate gave ${viaDelegate.ok ? 'success' : viaDelegate.state}; expected the authored BC106`)
    } else if (afterComposer !== '0|0|0' || afterDelegate !== '0|0|0') {
      fail('T-C3-5', `an incomplete payload left residue (${afterComposer} / ${afterDelegate}); expected 0|0|0`)
    } else {
      pass('T-C3-5', 'an incomplete four-rating payload is refused with the SAME authored BC106 by BOTH functions and commits nothing -- Amendment 002 A-017 means no incomplete-save capability ever existed, so the closure removed none')
    }
  }

  // -----------------------------------------------------------------
  // T-C3-6  the refusal is NON-DISCLOSING across every role
  // -----------------------------------------------------------------
  const s6 = await makeScenario(6)
  {
    const answers = []
    for (const who of ['trainer', 'management', 'parent']) {
      const r = await asAuthenticated(who, delegateCall(s6, NINE))
      answers.push({ who, state: r.ok ? 'SUCCESS' : r.state, message: r.ok ? '' : r.message })
    }
    const after = await q(WORK_DB, rowsFor(s6))
    const states = new Set(answers.map((a) => a.state))
    const messages = new Set(answers.map((a) => a.message))
    if (states.size !== 1 || !states.has('42501')) {
      fail('T-C3-6', `the three roles received different or unexpected SQLSTATEs: ${answers.map((a) => `${a.who}=${a.state}`).join(', ')}`)
    } else if (messages.size !== 1) {
      fail('T-C3-6', 'the three roles received DIFFERENT messages, so the denial discloses which caller asked')
    } else if (after !== '0|0|0') {
      fail('T-C3-6', `the three refused calls left residue ${after}; expected 0|0|0`)
    } else {
      pass('T-C3-6', 'the trainer, management and parent identities each receive SQLSTATE 42501 with a BYTE-IDENTICAL message, so the denial distinguishes neither the caller nor the object')
    }
  }

  // -----------------------------------------------------------------
  // T-C3-7  the closure is EXHAUSTIVE over the client-reachable surface
  // -----------------------------------------------------------------
  {
    const reachers = await q(WORK_DB, `
SELECT COALESCE(string_agg(p.proname, ',' ORDER BY p.proname), '')
  FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
 WHERE n.nspname='public'
   AND has_function_privilege('authenticated', p.oid, 'EXECUTE')
   AND p.prosrc LIKE '%assessment_save_observation%';`)
    const dml = await q(WORK_DB, `
SELECT count(*) FROM (VALUES ('anon'),('authenticated'),('service_role'),('public')) r(rn)
 CROSS JOIN (VALUES ('public.observations'),('public.observation_ratings'),('public.reports')) t(tn)
 CROSS JOIN (VALUES ('INSERT'),('UPDATE'),('DELETE'),('TRUNCATE')) pv(pn)
 WHERE has_table_privilege(r.rn, t.tn::regclass, pv.pn);`)
    if (reachers !== 'assessment_save_complete_and_open_report') {
      fail('T-C3-7', `the client-reachable functions that reach the observation write are [${reachers}]; expected exactly the composer`)
    } else if (dml !== '0') {
      fail('T-C3-7', `${dml} client DML privilege(s) exist on observations/observation_ratings/reports; expected 0`)
    } else {
      pass('T-C3-7', 'of the 24 client-executable functions EXACTLY ONE reaches the observation write -- the composer, which opens the report shell in the same transaction -- and no client role holds INSERT, UPDATE, DELETE or TRUNCATE on observations, observation_ratings or reports')
    }
  }

  const events = await q(WORK_DB, `SELECT count(*) FROM public.audit_events;`)
  console.log(`\nDisposable database: ${events} committed audit event(s) -- the EXPECTED outcome, and the reason the committing legs never run on the canonical database.`)

  // 4 -- destroy.
  await destroyDisposable()
  console.log('Disposable database destroyed.')

  // -----------------------------------------------------------------
  // T-C3-8  the REAL PostgREST channel, over HTTP, under a real session
  // -----------------------------------------------------------------
  // ORDERING IS THE SAFETY ARGUMENT. The privilege is measured ABSENT on the
  // canonical database FIRST; only then is the request issued. A caller
  // without EXECUTE never enters the function body, so this leg cannot
  // commit anything even in principle -- and the canonical census is
  // re-measured immediately afterwards to prove it did not.
  await postgrestLeg()

  // 5 -- prove the canonical database is untouched.
  const canonAfter = await q(CANONICAL, CENSUS)
  if (canonBefore !== canonAfter) {
    fail('canonical', `the canonical database changed during the run (${canonBefore} -> ${canonAfter})`)
  } else {
    console.log(`\nCanonical database untouched: reports|versions|version_ratings|corrections|observations|ratings|events|heads|auth|migrations = ${canonAfter}`)
  }
}

// ---------------------------------------------------------------------
// The local stack's connection values, captured from project-local CLI
// structured output into process memory only (CLAUDE.md §11). Never
// echoed, never serialized, never interpolated into an error.
// ---------------------------------------------------------------------
function loadLocalStack() {
  return new Promise((resolve) => {
    const p = spawn('npx', ['--no-install', 'supabase', 'status', '--output', 'json'], {
      cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'], shell: process.platform === 'win32',
    })
    let out = ''
    p.stdout.on('data', (d) => { out += d })
    p.on('close', () => {
      try {
        const status = JSON.parse(out.slice(out.indexOf('{')))
        const url = status.API_URL
        const publishable = status.PUBLISHABLE_KEY || status.ANON_KEY
        const secret = status.SECRET_KEY || status.SERVICE_ROLE_KEY
        const host = url ? new URL(url).hostname : ''
        if (!['127.0.0.1', 'localhost', '::1'].includes(host)) { resolve(null); return }
        resolve(url && publishable && secret ? { url, publishable, secret } : null)
      } catch { resolve(null) }
    })
  })
}

async function postgrestLeg() {
  // The privilege must already be absent on the CANONICAL database before a
  // single request is sent. If it is not, this leg refuses to run rather
  // than risking a committed write against the canonical fixture.
  const priv = await q(CANONICAL,
    `SELECT has_function_privilege('authenticated', '${DELEGATE_SIG}'::regprocedure, 'EXECUTE')::text;`)
  if (priv !== 'false') {
    fail('T-C3-8', 'the canonical database still grants authenticated EXECUTE on assessment_save_observation; the HTTP leg was NOT run, because issuing it could commit a real observation')
    return
  }

  const stack = await loadLocalStack()
  if (!stack) {
    fail('T-C3-8', 'the local stack connection values could not be read from the project-local CLI; the HTTP leg did not run')
    return
  }
  const { url, publishable, secret } = stack
  const admin = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })

  const before = await q(CANONICAL, CENSUS)
  const results = []
  for (const who of ['trainer', 'management', 'parent']) {
    // A real local sign-in WITHOUT handling any password: the Auth admin API
    // mints a one-time magiclink token, and verifying it yields an ordinary
    // session. Nothing is created, reset or destroyed.
    const link = await admin.auth.admin.generateLink({ type: 'magiclink', email: EMAIL[who] })
    if (link.error || !link.data?.properties?.hashed_token) {
      fail('T-C3-8', `could not establish a real session for the ${who} identity`)
      return
    }
    const client = createClient(url, publishable, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
    const verified = await client.auth.verifyOtp({ type: 'magiclink', token_hash: link.data.properties.hashed_token })
    if (verified.error || verified.data?.user?.id !== SUB[who]) {
      fail('T-C3-8', `could not verify the ${who} session`)
      return
    }
    const direct = await client.rpc('assessment_save_observation', {
      p_class_session_id: 'c5000000-0000-4000-8000-000000000001',
      p_student_id: STUDENT,
      p_expected_observation_id: null, p_expected_lock_version: null,
      p_strength_chips: [], p_focus_chips: [],
      p_observation_notes: null, p_follow_up_notes: null, p_term_evidence_notes: null,
      p_ratings: JSON.parse(NINE),
    })
    results.push({ who, code: direct.error ? direct.error.code : 'SUCCESS', message: direct.error ? direct.error.message : '' })
    if (who === 'trainer') {
      // The GOVERNED entry point must still be published to the same
      // caller, or the closure would have removed the capability instead of
      // narrowing it. A ratified authored code proves the request reached
      // the function body; only a schema-cache miss would not.
      const composer = await client.rpc('assessment_save_complete_and_open_report', {
        p_class_session_id: '00000000-0000-4000-8000-000000000000',
        p_student_id: STUDENT,
        p_expected_observation_id: null, p_expected_lock_version: null,
        p_strength_chips: [], p_focus_chips: [],
        p_observation_notes: null, p_follow_up_notes: null, p_term_evidence_notes: null,
        p_ratings: JSON.parse(NINE),
      })
      if (!composer.error || composer.error.code !== 'BC101') {
        fail('T-C3-8', `the composer is not reachable over HTTP with its authored denial (got ${composer.error ? composer.error.code : 'success'})`)
      }
    }
  }
  const after = await q(CANONICAL, CENSUS)

  const succeeded = results.filter((r) => r.code === 'SUCCESS')
  const codes = new Set(results.map((r) => r.code))
  const messages = new Set(results.map((r) => r.message))
  if (succeeded.length > 0) {
    fail('T-C3-8', `the old RPC is STILL reachable over HTTP for: ${succeeded.map((r) => r.who).join(', ')}`)
  } else if (codes.size !== 1 || messages.size !== 1) {
    fail('T-C3-8', `the three roles received different HTTP answers (${results.map((r) => `${r.who}=${r.code}`).join(', ')}), so the denial discloses the caller`)
  } else if (before !== after) {
    fail('T-C3-8', `the canonical census moved across the HTTP leg (${before} -> ${after})`)
  } else {
    pass('T-C3-8', `over the REAL PostgREST channel, under REAL local Auth sessions, a COMPLETE nine-rating POST to /rest/v1/rpc/assessment_save_observation is refused identically for the trainer, management and parent identities (${[...codes][0]}); the composer remains published to the same trainer session and answers with its authored BC101; the canonical census is byte-unchanged across the leg`)
  }
}

main().then(() => {
  console.log('')
  if (failures > 0) {
    console.error(`C3-A bypass-closure suite: ${failures} failure(s).`)
    process.exitCode = 1
  } else {
    console.log('C3-A bypass-closure suite: all proofs passed.')
  }
}).catch(async (e) => {
  console.error(`C3-A bypass-closure suite aborted: ${e.message}`)
  try { await destroyDisposable() } catch { /* best effort */ }
  process.exitCode = 1
})

// Teardown on interrupt: a disposable database must never survive the run.
for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGBREAK']) {
  process.on(signal, () => {
    destroyDisposable().finally(() => { process.exit(130) })
  })
}
