#!/usr/bin/env node
// =====================================================================
// B.E.S.T Coach -- Round C2 Phase C2-A runner (R-C2-1)
// =====================================================================
// LOCAL DISPOSABLE DEVELOPMENT DATABASE ONLY.
//
// Order:
//   1. the static scan (c2-static.mjs) -- text only;
//   2. the canonical census is measured BEFORE anything else touches a
//      database, so "the canonical database was never written" is a
//      MEASUREMENT rather than a claim;
//   3. a DISPOSABLE database is cloned from the canonical fixture
//      database;
//   4. c2-suite.sql runs there -- it drives the REAL governed composer and
//      COMMITS, appending real audit events;
//   5. T-C2-4, the two coordinated two-actor concurrency legs, run there
//      too -- they cannot live in the .sql because they need two
//      simultaneous sessions;
//   6. the disposable database is destroyed;
//   7. the canonical census is measured AGAIN and any difference fails
//      the run.
//
// WHY THE DISPOSABLE DATABASE IS NON-NEGOTIABLE. `report_create` emits
// `report.created` and `report_mark_observation_saved` emits
// `report.state_changed`. `audit_events` is UPDATE/DELETE-blocked by
// trigger with no owner exemption and no session-variable bypass, and
// Step 7H forbids repair. ONE stray committed audit event on the
// canonical database is PERMANENT and UNREPAIRABLE, and would break the
// canonical fixture checksum, the 28-row canonical region and the F17
// G-18 pin simultaneously and forever.
//
// Run: node scripts/tests/c2/run-c2.mjs
// =====================================================================

import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { resolveLocalTarget } from "../../fixtures/local-target-guard.mjs"

// ⚠️ NOT A LITERAL. This was `supabase_db_best-coach-mvp` — the FROZEN
// demonstration container — and with both local stacks running that name
// RESOLVED, so this harness reached the demonstration database instead of
// this repository's. Guarded resolution: unconditional non-overridable HARD
// DENY of the frozen project, then a fail-closed pin from
// BEST_COACH_LOCAL_PROJECT_ID. Container name DERIVED, never literal.
const { dbContainer: CONTAINER } = resolveLocalTarget()
const SEED_DB = 'bc_c2_seed'
const WORK_DB = 'bc_c2'
const CANONICAL = 'postgres'
const ROOT = process.cwd()
const SUITE = join(ROOT, 'scripts', 'tests', 'c2', 'c2-suite.sql')
const STATIC = join(ROOT, 'scripts', 'tests', 'c2', 'c2-static.mjs')

// Step 7F fixture constants.
const CENTRE = 'b0000000-0000-4000-8000-000000000001'
const STUDENT = 'c2000000-0000-4000-8000-000000000001'
const MODULE = 'c4000000-0000-4000-8000-000000000001'
const ENROLMENT = 'c6000000-0000-4000-8000-000000000001'
const TRAINER_M = 'c1000000-0000-4000-8000-000000000002'
const TRAINER_JWT = '{"sub":"d0000000-0000-4000-8000-000000000002","role":"authenticated"}'
const FIXTURE_OBS = 'c9000000-0000-4000-8000-000000000001'

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
  || '|' || (SELECT count(*) FROM public.report_correction_requests)
  || '|' || (SELECT count(*) FROM public.observations)
  || '|' || (SELECT count(*) FROM public.observation_ratings)
  || '|' || (SELECT count(*) FROM public.audit_events)
  || '|' || (SELECT count(*) FROM public.audit_chain_heads)
  || '|' || (SELECT count(*) FROM auth.users)
  || '|' || (SELECT count(*) FROM supabase_migrations.schema_migrations);`

// ---------------------------------------------------------------------
// Two-actor coordination -- advisory locks and pg_locks inspection, never
// a wall-clock delay. Copied from the accepted run-concurrency.mjs idiom.
// ---------------------------------------------------------------------
// Both waits are BOUNDED. An unbounded spin would hang the whole run if
// the other actor died before reaching its lock; raising instead makes the
// pairing fail loudly, which is the only honest outcome.
const waitGranted = (gate) => `
DO $wait$ DECLARE i int := 0; BEGIN
  LOOP
    EXIT WHEN EXISTS (SELECT 1 FROM pg_catalog.pg_locks
                       WHERE locktype='advisory' AND objid=${gate} AND granted);
    i := i + 1;
    IF i > 1500 THEN RAISE EXCEPTION 'the advisory gate ${gate} was never granted'; END IF;
    PERFORM pg_catalog.pg_sleep(0.02);
  END LOOP;
END $wait$;`

const waitRowLockQueued = () => `
DO $wait$ DECLARE i int := 0; BEGIN
  LOOP
    EXIT WHEN EXISTS (SELECT 1 FROM pg_catalog.pg_locks
                       WHERE NOT granted AND locktype IN ('transactionid','tuple'));
    i := i + 1;
    IF i > 1500 THEN RAISE EXCEPTION 'the second actor never queued on a row or index lock'; END IF;
    PERFORM pg_catalog.pg_sleep(0.02);
  END LOOP;
END $wait$;`

// A scenario the two-actor legs can race on: a PAST-DATED session with its
// assignment and a `present` attendance row. `withObservation` additionally
// clones the fixture's nine ratings, so the pair is ready for report_create
// without any assessment write.
async function makeScenario(n, withObservation) {
  const session = `c5000000-0000-4000-8000-0000000${String(9200 + n).padStart(5, '0')}`
  const obs = `c9000000-0000-4000-8000-0000000${String(9200 + n).padStart(5, '0')}`
  let sql = `
INSERT INTO public.class_sessions (id, centre_id, class_module_id, session_date, starts_at, ends_at)
VALUES ('${session}','${CENTRE}','${MODULE}', (now() AT TIME ZONE 'Asia/Singapore')::date - 1, '10:00','11:00');
INSERT INTO public.class_session_assignments (centre_id, class_session_id, trainer_membership_id)
VALUES ('${CENTRE}','${session}','${TRAINER_M}');
INSERT INTO public.attendance (centre_id, class_session_id, class_module_id, student_id, enrolment_id, status)
VALUES ('${CENTRE}','${session}','${MODULE}','${STUDENT}','${ENROLMENT}','present');`
  if (withObservation) {
    sql += `
INSERT INTO public.observations (id, centre_id, class_session_id, class_module_id, student_id, enrolment_id, trainer_membership_id)
VALUES ('${obs}','${CENTRE}','${session}','${MODULE}','${STUDENT}','${ENROLMENT}','${TRAINER_M}');
INSERT INTO public.observation_ratings (observation_id, dimension_code, rating)
SELECT '${obs}', orr.dimension_code, orr.rating
  FROM public.observation_ratings orr WHERE orr.observation_id = '${FIXTURE_OBS}';`
  }
  await q(WORK_DB, sql)
  return { session, obs }
}

const composerCall = (session, obsExpr, lockExpr) => `
  public.assessment_save_complete_and_open_report(
    '${session}'::uuid, '${STUDENT}'::uuid, ${obsExpr}, ${lockExpr},
    ARRAY['confident-opening']::text[], ARRAY['pacing']::text[],
    'Concurrent save.', 'Follow up.', '', '${NINE}'::jsonb)`

// ---------------------------------------------------------------------
// T-C2-4  Two-actor concurrency: EXACTLY ONE report, in every outcome.
// ---------------------------------------------------------------------
async function legA() {
  // BOTH actors attempt the SAME complete save simultaneously. Neither is
  // privileged: the barrier only guarantees they overlap, and which one
  // reaches `observations_session_student_key` first is decided by the lock
  // manager, not by this harness.
  //
  // The assertion is therefore INTERLEAVING-INDEPENDENT, which is what makes
  // it a real invariant rather than a lucky ordering: whichever way the race
  // resolves, EXACTLY ONE actor commits a save, EXACTLY ONE report exists for
  // the pair, and the other actor receives an AUTHORED code (or is resolved
  // into the very same report id). An earlier version of this leg asserted
  // that the barrier holder always wins; it does not, and that assumption
  // made the proof flaky rather than making the product wrong.
  //
  // The BC014 report-conflict branch specifically is proven DETERMINISTICALLY
  // by leg B, which forces that exact interleaving.
  const s = await makeScenario(1, false)
  const gate = 7301

  const actor = (label, lead) => `\\set ON_ERROR_STOP on
${lead}
BEGIN;
SET LOCAL request.jwt.claims = '${TRAINER_JWT}';
DO $try$
DECLARE v text; r uuid;
BEGIN
  BEGIN
    SELECT x.report_id INTO r FROM ${composerCall(s.session, 'NULL', 'NULL')} AS x;
    RAISE NOTICE '${label}_RESULT=OK:%', r;
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v = RETURNED_SQLSTATE;
    RAISE NOTICE '${label}_RESULT=%', v;
  END;
END $try$;
COMMIT;`

  // Actor 1 raises the barrier; actor 2 fires the instant it sees it granted.
  const sqlA = actor('A', `SELECT pg_advisory_lock(${gate});`) + `
SELECT pg_advisory_unlock(${gate});`
  const sqlB = actor('B', waitGranted(gate))

  const [ra, rb] = await Promise.all([
    psql(WORK_DB, sqlA, { tuplesOnly: false, stopOnError: false }),
    psql(WORK_DB, sqlB, { tuplesOnly: false, stopOnError: false }),
  ])
  const readResult = (r, label) => {
    const m = new RegExp(`${label}_RESULT=(OK:[0-9a-f-]{36}|[A-Z0-9]+)`).exec(r.err + r.out)
    return m ? m[1] : `NO_RESULT(${(r.err || r.out).slice(0, 300)})`
  }
  const outcomes = [readResult(ra, 'A'), readResult(rb, 'B')]

  const reports = await q(WORK_DB,
    `SELECT count(*) FROM public.reports WHERE class_session_id='${s.session}' AND student_id='${STUDENT}';`)
  if (Number(reports) !== 1) {
    fail('T-C2-4(A)', `${reports} report(s) exist for the raced pair; EXACTLY ONE is the whole property (outcomes: ${outcomes.join(', ')})`)
    return
  }

  const succeeded = outcomes.filter((o) => o.startsWith('OK:'))
  if (succeeded.length !== 1) {
    fail('T-C2-4(A)', `${succeeded.length} of the two concurrent saves succeeded; expected exactly 1 (outcomes: ${outcomes.join(', ')})`)
    return
  }
  const winnerId = succeeded[0].slice(3)
  const committed = await q(WORK_DB,
    `SELECT id FROM public.reports WHERE class_session_id='${s.session}' AND student_id='${STUDENT}';`)
  if (committed !== winnerId) {
    fail('T-C2-4(A)', `the surviving report is ${committed} but the successful actor returned ${winnerId}`)
    return
  }
  const refused = outcomes.find((o) => !o.startsWith('OK:'))
  if (!['BC112', 'BC113', 'BC014'].includes(refused)) {
    fail('T-C2-4(A)', `the refused actor gave ${refused}, which is not an authored stale/duplicate code`)
    return
  }
  const chain = await q(WORK_DB, `SELECT bool_and(ok) FROM public.audit_verify_chain(NULL, NULL, NULL);`)
  if (chain !== 't' && chain !== '') {
    fail('T-C2-4(A)', 'the audit chain does not verify after the race')
    return
  }
  pass('T-C2-4(A)', `two simultaneous complete saves for the same pair: EXACTLY ONE committed and EXACTLY ONE report exists; the other was refused with ${refused} and the chain verifies`)
}

async function legB() {
  // The report-conflict branch, exercised DIRECTLY. Actor A holds an
  // uncommitted `report_create` for a pair whose nine-rating observation
  // already exists; actor B calls the COMPOSER for the same pair, blocks
  // on reports_session_student_key, wakes on A's commit with BC014, and
  // must resolve into A's row rather than failing or duplicating.
  const s = await makeScenario(2, true)
  const gate = 7302

  const winnerSql = `\\set ON_ERROR_STOP on
SELECT pg_advisory_lock(${gate});
BEGIN;
SET LOCAL request.jwt.claims = '${TRAINER_JWT}';
SELECT x.report_id FROM public.report_create('${s.session}','${STUDENT}','${s.obs}') AS x \\gset a_
${waitRowLockQueued()}
COMMIT;
SELECT pg_advisory_unlock(${gate});
SELECT 'A_REPORT=' || :'a_report_id';`

  const loserSql = `\\set ON_ERROR_STOP on
${waitGranted(gate)}
BEGIN;
SET LOCAL request.jwt.claims = '${TRAINER_JWT}';
DO $try$
DECLARE v text; r uuid; c boolean; st public.report_status;
BEGIN
  BEGIN
    SELECT x.report_id, x.report_created, x.report_status INTO r, c, st
      FROM ${composerCall(s.session, `'${s.obs}'::uuid`, '1')} AS x;
    RAISE NOTICE 'B_RESULT=OK:%:%:%', r, c, st;
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v = RETURNED_SQLSTATE;
    RAISE NOTICE 'B_RESULT=%', v;
  END;
END $try$;
COMMIT;`

  const [w, l] = await Promise.all([
    psql(WORK_DB, winnerSql, { tuplesOnly: false, stopOnError: false }),
    psql(WORK_DB, loserSql, { tuplesOnly: false, stopOnError: false }),
  ])
  const wm = /A_REPORT=([0-9a-f-]{36})/.exec(w.out)
  const bm = /B_RESULT=OK:([0-9a-f-]{36}):([tf]):([a-z_]+)/.exec(l.err + l.out)
  if (w.code !== 0 || !wm) {
    fail('T-C2-4(B)', `actor A's report_create failed: ${w.err.slice(0, 600)}`)
    return
  }
  if (!bm) {
    const raw = /B_RESULT=([A-Z0-9]+)/.exec(l.err + l.out)
    fail('T-C2-4(B)', `actor B did not resolve the conflict into a success; it reported ${raw ? raw[1] : (l.err || l.out).slice(0, 400)}`)
    return
  }
  if (bm[1] !== wm[1]) {
    fail('T-C2-4(B)', `actor B returned report ${bm[1]}, not the committed winner ${wm[1]}`)
    return
  }
  if (bm[2] !== 'f') {
    fail('T-C2-4(B)', 'actor B reported report_created=true after resolving an existing row')
    return
  }
  const reports = await q(WORK_DB,
    `SELECT count(*) FROM public.reports WHERE class_session_id='${s.session}' AND student_id='${STUDENT}';`)
  if (Number(reports) !== 1) {
    fail('T-C2-4(B)', `${reports} report(s) exist after the conflict was resolved; expected exactly 1`)
    return
  }
  const chain = await q(WORK_DB, `SELECT bool_and(ok) FROM public.audit_verify_chain(NULL, NULL, NULL);`)
  if (chain !== 't' && chain !== '') {
    fail('T-C2-4(B)', 'the audit chain does not verify after the conflict was resolved')
    return
  }
  pass('T-C2-4(B)', `the BC014 conflict branch resolved into the winner's own report (${bm[3]}), report_created=false, exactly one row, chain intact`)
}

// ---------------------------------------------------------------------
async function main() {
  console.log('=== Round C2 Phase C2-A: atomic complete-save opens the report shell (R-C2-1) ===\n')

  // 1 -- static scan.
  const scan = await run(process.execPath, [STATIC])
  process.stdout.write(scan.out)
  if (scan.code !== 0) { process.stderr.write(scan.err); fail('c2-static', 'the static scan failed') }

  // 2 -- the canonical state BEFORE, so "never touched" is measured.
  const canonBefore = await q(CANONICAL, CENSUS)

  // 3 -- disposable database.
  await createDisposable()
  console.log('\nDisposable database created from the canonical fixture template.\n')

  // 4 -- the behavioural suite.
  const suite = readFileSync(SUITE, 'utf8')
  const s = await psql(WORK_DB, suite, { tuplesOnly: false })
  const notices = s.err.split('\n').filter((l) => /PASS T-C2/.test(l))
  for (const n of notices) console.log(n.replace(/^NOTICE:\s+/, ''))
  if (s.code !== 0 || !s.out.includes('C2_SUITE_COMPLETE')) {
    process.stderr.write(s.err.split('\n').filter((l) => !/^NOTICE/.test(l)).join('\n') + '\n')
    fail('c2-suite', 'the behavioural suite failed')
  }

  // 5 -- the two coordinated concurrency legs, one at a time.
  console.log('')
  await legA()
  await legB()

  const events = await q(WORK_DB, `SELECT count(*) FROM public.audit_events;`)
  console.log(`\nDisposable database: ${events} committed audit event(s) -- the EXPECTED outcome, and the reason this suite never runs on the canonical database.`)

  // 6 -- destroy.
  await destroyDisposable()
  console.log('Disposable database destroyed.')

  // 7 -- prove the canonical database is untouched.
  const canonAfter = await q(CANONICAL, CENSUS)
  if (canonBefore !== canonAfter) {
    fail('canonical', `the canonical database changed during the run (${canonBefore} -> ${canonAfter})`)
  } else {
    console.log(`Canonical database untouched: reports|versions|corrections|observations|ratings|events|heads|auth|migrations = ${canonAfter}`)
  }
}

main().then(() => {
  console.log('')
  if (failures > 0) {
    console.error(`C2-A suite: ${failures} failure(s).`)
    process.exitCode = 1
  } else {
    console.log('C2-A suite: all proofs passed.')
  }
}).catch(async (e) => {
  console.error(`C2-A suite aborted: ${e.message}`)
  try { await destroyDisposable() } catch { /* best effort */ }
  process.exitCode = 1
})
