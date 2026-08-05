#!/usr/bin/env node
// =====================================================================
// B.E.S.T Coach -- assessment acceptance runner (T-ASM-1 .. T-ASM-45)
// =====================================================================
// LOCAL DISPOSABLE DEVELOPMENT DATABASE ONLY.
//
// Order:
//   1. the static (S) scan (asm-static.mjs);
//   2. a DISPOSABLE database is cloned from the canonical fixture database;
//   3. asm-suite.sql runs there -- every R and R(D) proof, including the
//      T-ASM-34 integration leg whose committed audit events are the reason
//      this never runs on the canonical database;
//   4. the two R(C) coordinated races run there:
//        T-ASM-25  stale lock-version race  -- exactly one success,
//                  exactly one authored BC112, final lock_version +1 not +2
//        T-ASM-26  concurrent create race   -- exactly one row, the loser
//                  fails BC113 with constraint observations_session_student_key
//   5. the disposable database is destroyed.
//
// The canonical database is NEVER touched by this runner.
//
// Run: node scripts/tests/assessment/run-assessment.mjs
// =====================================================================

import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const CONTAINER = 'supabase_db_best-coach-mvp'
const SEED_DB = 'bc_asm_seed'
const WORK_DB = 'bc_asm'
const ROOT = process.cwd()

const CENTRE = 'b0000000-0000-4000-8000-000000000001'
const STUDENT = 'c2000000-0000-4000-8000-000000000001'
const MODULE = 'c4000000-0000-4000-8000-000000000001'
const ENROLMENT = 'c6000000-0000-4000-8000-000000000001'
const TRAINER_M = 'c1000000-0000-4000-8000-000000000002'
const TRAINER_JWT = '{"sub":"d0000000-0000-4000-8000-000000000002","role":"authenticated"}'

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
// Deterministic two-session coordination (the run-concurrency.mjs gate)
// ---------------------------------------------------------------------
const waitGranted = (gate) => `
DO $wait$ BEGIN
  LOOP
    EXIT WHEN EXISTS (SELECT 1 FROM pg_catalog.pg_locks
                       WHERE locktype='advisory' AND objid=${gate} AND granted);
    PERFORM pg_catalog.pg_sleep(0.02);
  END LOOP;
END $wait$;`

const waitQueued = (gate) => `
DO $wait$ BEGIN
  LOOP
    EXIT WHEN EXISTS (SELECT 1 FROM pg_catalog.pg_locks
                       WHERE locktype='advisory' AND objid=${gate} AND NOT granted);
    PERFORM pg_catalog.pg_sleep(0.02);
  END LOOP;
END $wait$;`

// Reports both the SQLSTATE and the CONSTRAINT diagnostic of the loser.
const catching = (sql) => `
DO $try$
DECLARE v text; c text;
BEGIN
  BEGIN
    ${sql}
    RAISE NOTICE 'LOSER_RESULT=OK CONSTRAINT= END';
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v = RETURNED_SQLSTATE, c = CONSTRAINT_NAME;
    RAISE NOTICE 'LOSER_RESULT=% CONSTRAINT=% END', v, COALESCE(c, '');
  END;
END $try$;`

async function coordinated({ gate, winner, loser }) {
  const winnerSql = `\\set ON_ERROR_STOP on
SELECT pg_advisory_lock(${gate});
${waitQueued(gate)}
BEGIN;
${winner}
COMMIT;
SELECT pg_advisory_unlock(${gate});`
  const loserSql = `\\set ON_ERROR_STOP on
${waitGranted(gate)}
BEGIN;
SELECT pg_advisory_lock(${gate});
${loser}
ROLLBACK;`
  const [w, l] = await Promise.all([
    psql(WORK_DB, winnerSql, { tuplesOnly: false, stopOnError: false }),
    psql(WORK_DB, loserSql, { tuplesOnly: false, stopOnError: false }),
  ])
  const m = /LOSER_RESULT=([A-Z0-9]+|OK) CONSTRAINT=(\S*) END/.exec(l.err + l.out)
  return {
    winner: w,
    loser: l,
    loserCode: m ? m[1] : `NO_RESULT(${l.err || l.out})`,
    loserConstraint: m ? m[2] : '',
  }
}

// ---------------------------------------------------------------------
// Disposable lifecycle (identical to the accepted run-concurrency pattern)
// ---------------------------------------------------------------------
async function createDisposable() {
  const sql = `
UPDATE pg_database SET datallowconn = false WHERE datname = 'postgres';
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'postgres' AND pid <> pg_backend_pid();
SELECT pg_sleep(1);
DROP DATABASE IF EXISTS ${SEED_DB};
CREATE DATABASE ${SEED_DB} TEMPLATE postgres;
UPDATE pg_database SET datallowconn = true WHERE datname = 'postgres';
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

const NINE = JSON.stringify([
  { dimension_code: 'body', rating: 'advanced' },
  { dimension_code: 'emotion', rating: 'emerging' },
  { dimension_code: 'speech', rating: 'secure' },
  { dimension_code: 'tonality', rating: 'developing' },
  { dimension_code: 'eye_contact', rating: 'secure' },
  { dimension_code: 'vocal_projection', rating: 'advanced' },
  { dimension_code: 'emotional_expression', rating: 'emerging' },
  { dimension_code: 'sentence_flow', rating: 'developing' },
  { dimension_code: 'audience_awareness', rating: 'secure' },
])

const saveCall = (session, obs, lock) => `PERFORM public.assessment_save_observation(
  '${session}', '${STUDENT}', ${obs ? `'${obs}'` : 'NULL'}, ${lock ?? 'NULL'},
  ARRAY['race-chip']::text[], ARRAY[]::text[], 'race notes', 'race follow-up', NULL,
  '${NINE}'::jsonb);`

async function main() {
  console.log('=== Assessment acceptance run (T-ASM-1 .. T-ASM-45) ===\n')

  // 1 -- static scan
  const scan = await run(process.execPath, [join(ROOT, 'scripts', 'tests', 'assessment', 'asm-static.mjs')])
  process.stdout.write(scan.out)
  if (scan.code !== 0) { process.stderr.write(scan.err); fail('static', 'the static scan failed') }

  // 2 -- disposable database
  await createDisposable()
  console.log('\nDisposable database created from the canonical fixture template.\n')

  // 3 -- the R / R(D) suite
  const suite = readFileSync(join(ROOT, 'scripts', 'tests', 'assessment', 'asm-suite.sql'), 'utf8')
  const s = await psql(WORK_DB, suite, { tuplesOnly: false })
  const notices = s.err.split('\n').filter((l) => /PASS T-ASM/.test(l))
  for (const n of notices) console.log(n.replace(/^NOTICE:\s+/, ''))
  if (s.code !== 0 || !s.out.includes('ASM_SUITE_COMPLETE')) {
    process.stderr.write(s.err.split('\n').filter((l) => !/^NOTICE/.test(l)).join('\n'))
    fail('asm-suite', 'the runtime suite failed')
  } else {
    console.log(`\nRuntime suite complete: ${notices.length} PASS notices.`)
  }

  if (failures === 0) {
    // 4 -- T-ASM-25: stale lock-version race on the fixture observation.
    {
      const [obs, lock] = (await q(WORK_DB, `
SELECT o.id, o.lock_version FROM public.observations o
 WHERE o.class_session_id = 'c5000000-0000-4000-8000-000000000001';`)).split('|')
      const res = await coordinated({
        gate: 8101,
        winner: `SET LOCAL request.jwt.claims = '${TRAINER_JWT}';
DO $w$ BEGIN ${saveCall('c5000000-0000-4000-8000-000000000001', obs, lock)} END $w$;`,
        loser: `SET LOCAL request.jwt.claims = '${TRAINER_JWT}';
${catching(saveCall('c5000000-0000-4000-8000-000000000001', obs, lock))}`,
      })
      if (res.winner.code !== 0) fail('T-ASM-25', `the winning save failed: ${res.winner.err}`)
      else if (res.loserCode !== 'BC112') fail('T-ASM-25', `the loser gave ${res.loserCode}, expected BC112`)
      else {
        const after = Number(await q(WORK_DB, `SELECT lock_version FROM public.observations WHERE id='${obs}';`))
        const n = Number(await q(WORK_DB, `SELECT count(*) FROM public.observation_ratings WHERE observation_id='${obs}';`))
        if (after !== Number(lock) + 1) fail('T-ASM-25', `lock_version is ${after}, expected ${Number(lock) + 1} -- more than one writer committed`)
        else if (n !== 9) fail('T-ASM-25', `${n} rating rows, expected 9`)
        else pass('T-ASM-25', `exactly one success; the loser failed BC112 having written nothing; lock_version ${lock} -> ${after}`)
      }
    }

    // 5 -- T-ASM-26: concurrent create race on a fresh scaffold session.
    {
      await q(WORK_DB, `
INSERT INTO public.class_sessions (id, centre_id, class_module_id, session_date, starts_at, ends_at)
VALUES ('aa000000-0000-4000-8000-000000000026','${CENTRE}','${MODULE}',
        (now() AT TIME ZONE 'Asia/Singapore')::date - 1, '10:00', NULL);
INSERT INTO public.class_session_assignments (centre_id, class_session_id, trainer_membership_id)
VALUES ('${CENTRE}','aa000000-0000-4000-8000-000000000026','${TRAINER_M}');
INSERT INTO public.attendance (centre_id, class_session_id, class_module_id, student_id, enrolment_id, status)
VALUES ('${CENTRE}','aa000000-0000-4000-8000-000000000026','${MODULE}','${STUDENT}','${ENROLMENT}','present');`)
      const res = await coordinated({
        gate: 8102,
        winner: `SET LOCAL request.jwt.claims = '${TRAINER_JWT}';
DO $w$ BEGIN ${saveCall('aa000000-0000-4000-8000-000000000026', null, null)} END $w$;`,
        loser: `SET LOCAL request.jwt.claims = '${TRAINER_JWT}';
${catching(saveCall('aa000000-0000-4000-8000-000000000026', null, null))}`,
      })
      if (res.winner.code !== 0) fail('T-ASM-26', `the winning create failed: ${res.winner.err}`)
      else if (res.loserCode !== 'BC113') fail('T-ASM-26', `the loser gave ${res.loserCode}, expected BC113`)
      else if (res.loserConstraint !== 'observations_session_student_key') {
        fail('T-ASM-26', `the loser's constraint diagnostic is "${res.loserConstraint}", expected observations_session_student_key`)
      } else {
        const n = Number(await q(WORK_DB, `
SELECT count(*) FROM public.observations
 WHERE class_session_id='aa000000-0000-4000-8000-000000000026';`))
        if (n !== 1) fail('T-ASM-26', `${n} observation rows exist, expected exactly 1`)
        else pass('T-ASM-26', 'exactly one row; the loser failed BC113 naming observations_session_student_key')
      }
    }
  }

  const events = await q(WORK_DB, `SELECT count(*) FROM public.audit_events;`)
  console.log(`\nDisposable database: ${events} committed audit event(s) from the T-ASM-34/37 integration legs -- the reason this suite never runs on the canonical database.`)
  await destroyDisposable()
  console.log('Disposable database destroyed.')
}

main().then(() => {
  console.log('')
  if (failures > 0) {
    console.error(`Assessment suite: ${failures} failure(s).`)
    process.exitCode = 1
  } else {
    console.log('Assessment suite: all 45 T-ASM proofs passed.')
  }
}).catch(async (e) => {
  console.error(`Assessment suite aborted: ${e.message}`)
  try { await destroyDisposable() } catch { /* best effort */ }
  process.exitCode = 1
})
