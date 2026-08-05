#!/usr/bin/env node
// =====================================================================
// B.E.S.T Coach -- Step 7I acceptance suite: the four R(C) proofs
// =====================================================================
// LOCAL DISPOSABLE DEVELOPMENT DATABASE ONLY.
//
// Runs T7I-15, T7I-16, T7I-46 and T7I-61 -- the coordinated two-session
// tests -- on a SEPARATE DISPOSABLE DATABASE that is created here, dirtied
// deliberately, and destroyed afterwards.
//
// WHY THE SPLIT IS MANDATORY (U-7I-21). An R(C) test's whole property is
// "exactly one writer commits; the loser fails CAS having written nothing".
// Under READ COMMITTED the loser can only observe the winner's row version
// AFTER THE WINNER COMMITS -- an uncommitted winner that rolls back lets the
// "loser" succeed, proving the opposite of the intended property. So every
// R(C) test MUST commit a governed mutation, every such mutation appends an
// audit event in the same transaction, and those events are then
// PERMANENTLY UNCLEANABLE: audit_block_mutation() raises unconditionally on
// UPDATE or DELETE with no owner exemption and no session-variable bypass,
// and Step 7H forbids repair "ever". Run on the canonical database these
// four tests would leave T7I-28, T7I-30 and T7I-31 permanently red after the
// FIRST execution, in a state no operation in the system can clean.
//
// COORDINATION IS DETERMINISTIC AND SLEEP-FREE AT THE SHELL LEVEL. The two
// sessions synchronise on a PostgreSQL advisory lock and on pg_locks
// inspection, never on a wall-clock delay:
//   * the WINNER takes the gate, then waits until it can SEE the loser
//     queued behind it (an ungranted lock request);
//   * the LOSER waits until it can SEE the gate granted, then reads its
//     expectations, then queues on the gate;
//   * the winner commits and releases; the loser wakes with stale
//     expectations and must fail CAS having written nothing.
// The ordering therefore holds regardless of which process starts first.
//
// This database is NEVER the subject of a preservation assertion.
// =====================================================================

import { spawn } from 'node:child_process'

const CONTAINER = 'supabase_db_best-coach-mvp'
const SEED_DB = 'bc_7i_conc_seed'
const WORK_DB = 'bc_7i_conc'

const CENTRE = 'b0000000-0000-4000-8000-000000000001'
const STUDENT = 'c2000000-0000-4000-8000-000000000001'
const MODULE = 'c4000000-0000-4000-8000-000000000001'
const ENROLMENT = 'c6000000-0000-4000-8000-000000000001'
const TRAINER_M = 'c1000000-0000-4000-8000-000000000002'
const TRAINER_JWT = '{"sub":"d0000000-0000-4000-8000-000000000002","role":"authenticated"}'
const MGMT_JWT = '{"sub":"d0000000-0000-4000-8000-000000000001","role":"authenticated"}'

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

// ---------------------------------------------------------------------
// Gate boilerplate
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

const waitRowLockQueued = () => `
DO $wait$ BEGIN
  LOOP
    EXIT WHEN EXISTS (SELECT 1 FROM pg_catalog.pg_locks
                       WHERE NOT granted AND locktype IN ('transactionid','tuple'));
    PERFORM pg_catalog.pg_sleep(0.02);
  END LOOP;
END $wait$;`

// The loser reports the SQLSTATE it received, so the driver can assert the
// authored error rather than merely "it failed".
const catching = (sql) => `
DO $try$
DECLARE v text;
BEGIN
  BEGIN
    ${sql}
    RAISE NOTICE 'LOSER_RESULT=OK';
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v = RETURNED_SQLSTATE;
    RAISE NOTICE 'LOSER_RESULT=%', v;
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

  // The loser opens its transaction FIRST -- its expectations were captured
  // by the driver before either session started -- and then QUEUES on the
  // gate. That queued request is what the winner waits to see, so the
  // ordering is settled by the lock manager rather than by a timer.
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
  const m = /LOSER_RESULT=([A-Z0-9]+|OK)/.exec(l.err + l.out)
  return { winner: w, loser: l, loserCode: m ? m[1] : `NO_RESULT(${l.err || l.out})` }
}

// ---------------------------------------------------------------------
// Disposable database lifecycle
// ---------------------------------------------------------------------
async function createDisposable() {
  // Clone the canonical database while it is quiesced. datallowconn is
  // always restored, whatever happens.
  const sql = `
UPDATE pg_database SET datallowconn = false WHERE datname = 'postgres';
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'postgres' AND pid <> pg_backend_pid();
SELECT pg_sleep(1);
DROP DATABASE IF EXISTS ${SEED_DB};
CREATE DATABASE ${SEED_DB} TEMPLATE postgres;
UPDATE pg_database SET datallowconn = true WHERE datname = 'postgres';
ALTER DATABASE ${SEED_DB} OWNER TO postgres;`
  // Quiescing the template and creating a database both require SUPERUSER;
  // `postgres` in this Supabase image is not one, and a silent failure here
  // surfaces much later as "template database does not exist".
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

// Each coordinated pairing needs its own report, and reports are unique per
// (class_session, student). A fresh PAST-DATED class session per pairing --
// with its attendance row and its nine-rating observation cloned from the
// fixture observation -- is ordinary scaffolding on a deliberately dirty
// database, and it keeps every pairing independent.
async function makeScenario(n) {
  const session = `c5000000-0000-4000-8000-0000000${String(100 + n).padStart(5, '0')}`
  const obs = `c9000000-0000-4000-8000-0000000${String(100 + n).padStart(5, '0')}`
  const att = `c8000000-0000-4000-8000-0000000${String(100 + n).padStart(5, '0')}`
  await q(WORK_DB, `
INSERT INTO public.class_sessions (id, centre_id, class_module_id, session_date, starts_at, ends_at)
VALUES ('${session}','${CENTRE}','${MODULE}', (now() AT TIME ZONE 'Asia/Singapore')::date - 1, '10:00','11:00');
INSERT INTO public.class_session_assignments (centre_id, class_session_id, trainer_membership_id)
VALUES ('${CENTRE}','${session}','${TRAINER_M}');
INSERT INTO public.attendance (id, centre_id, class_session_id, class_module_id, student_id, enrolment_id, status)
VALUES ('${att}','${CENTRE}','${session}','${MODULE}','${STUDENT}','${ENROLMENT}','present');
INSERT INTO public.observations (id, centre_id, class_session_id, class_module_id, student_id, enrolment_id, trainer_membership_id)
VALUES ('${obs}','${CENTRE}','${session}','${MODULE}','${STUDENT}','${ENROLMENT}','${TRAINER_M}');
INSERT INTO public.observation_ratings (observation_id, dimension_code, rating)
SELECT '${obs}', orr.dimension_code, orr.rating
  FROM public.observation_ratings orr
 WHERE orr.observation_id = 'c9000000-0000-4000-8000-000000000001';`)
  return { session, obs }
}

// Drive a scenario to a named stop, committing as it goes.
async function drive(session, obs, stop) {
  const sql = `
SET request.jwt.claims = '${TRAINER_JWT}';
DO $d$
DECLARE
  v_report uuid; v_lv int; v_st public.report_status; v_ver uuid; v_rev int;
  v_hash text; v_obs int; v_wh text; v_at timestamptz;
BEGIN
  SELECT x.report_id, x.status, x.lock_version INTO v_report, v_st, v_lv
    FROM public.report_create('${session}','${STUDENT}','${obs}') x;
  SELECT x.status, x.lock_version INTO v_st, v_lv FROM public.report_mark_observation_saved(v_report, v_lv) x;
  SELECT x.status, x.lock_version, x.observation_lock_version INTO v_st, v_lv, v_obs
    FROM public.report_request_draft(v_report, v_lv) x;
  SELECT x.status, x.lock_version, x.report_version_id, x.revision_number, x.content_hash
    INTO v_st, v_lv, v_ver, v_rev, v_hash
    FROM public.report_store_draft(v_report, v_lv, v_obs, 'Panel one','Panel two','Panel three','Panel four') x;
  IF '${stop}' = 'draft_ready' THEN RETURN; END IF;

  PERFORM public.report_update_checklist(v_report, v_lv, v_ver, true, true, true);
  IF '${stop}' = 'draft_ready_checked' THEN RETURN; END IF;

  SELECT x.status, x.lock_version INTO v_st, v_lv
    FROM public.report_trainer_approve(v_report, v_st, v_lv, v_ver, v_hash) x;
  IF '${stop}' = 'trainer_approved' THEN RETURN; END IF;

  PERFORM pg_catalog.set_config('request.jwt.claims', '${MGMT_JWT}', false);
  v_wh := public.report_wording_hash_v1(
    (SELECT rv.todays_strength FROM public.report_versions rv WHERE rv.id=v_ver),
    (SELECT rv.next_focus FROM public.report_versions rv WHERE rv.id=v_ver),
    (SELECT rv.practice_suggestion FROM public.report_versions rv WHERE rv.id=v_ver),
    (SELECT rv.session_takeaway FROM public.report_versions rv WHERE rv.id=v_ver));
  SELECT x.status, x.lock_version, x.submitted_version_id, x.submitted_at INTO v_st, v_lv, v_ver, v_at
    FROM public.report_management_approve_and_submit(v_report, v_lv, v_ver, v_wh) x;
  IF '${stop}' = 'submitted' THEN RETURN; END IF;

  RAISE EXCEPTION 'unknown stop %', '${stop}';
END $d$;`
  await q(WORK_DB, sql)
  const row = await q(WORK_DB, `
SELECT r.id, r.status, r.lock_version, coalesce(r.current_cycle_version_id::text,''),
       coalesce((SELECT rv.content_hash FROM public.report_versions rv WHERE rv.id=r.current_cycle_version_id),''),
       coalesce((SELECT public.report_wording_hash_v1(rv.todays_strength, rv.next_focus,
                        rv.practice_suggestion, rv.session_takeaway)
                   FROM public.report_versions rv WHERE rv.id=r.current_cycle_version_id),'')
  FROM public.reports r WHERE r.class_session_id='${session}';`)
  const [id, status, lock, ver, hash, whash] = row.split('|')
  return { id, status, lock: Number(lock), ver, hash, whash }
}

const jwt = (who) => `SET LOCAL request.jwt.claims = '${who === 'trainer' ? TRAINER_JWT : MGMT_JWT}';`

async function chainOk() {
  const out = await q(WORK_DB, `SELECT bool_and(ok) FROM public.audit_verify_chain(NULL, NULL, NULL);`)
  return out === 't' || out === ''
}

// ---------------------------------------------------------------------
// The pairings
// ---------------------------------------------------------------------
async function run() {
  console.log('--- Step 7I R(C) coordinated proofs (DISPOSABLE database) ---')
  await createDisposable()

  let n = 0
  const nextGate = () => 7000 + (n += 1)

  // -------------------------------------------------------------------
  // T7I-15  Concurrent trainer SAVE vs trainer APPROVE.
  //         The save wins; the approve loses on the bumped lock_version.
  // -------------------------------------------------------------------
  {
    const s = await makeScenario(1)
    const r = await drive(s.session, s.obs, 'draft_ready_checked')
    const gate = nextGate()
    const res = await coordinated({
      gate,
      winner: `${jwt('trainer')}
SELECT public.report_save_edit('${r.id}','draft_ready'::public.report_status,${r.lock},'${r.ver}',
  'winning save','Panel two','Panel three','Panel four');`,
      loser: `${jwt('trainer')}
${catching(`PERFORM public.report_trainer_approve('${r.id}','draft_ready'::public.report_status,${r.lock},'${r.ver}','${r.hash}');`)}`,
    })
    if (res.winner.code !== 0) fail('T7I-15', `the winning save failed: ${res.winner.err}`)
    else if (res.loserCode !== 'BC003') fail('T7I-15', `the loser gave ${res.loserCode}, expected BC003`)
    else {
      const after = await q(WORK_DB, `
SELECT r.status, r.lock_version,
       (SELECT count(*) FROM public.report_version_approvals a WHERE a.report_id=r.id)
  FROM public.reports r WHERE r.id='${r.id}';`)
      const [st, lv, aps] = after.split('|')
      if (st !== 'draft_ready' || Number(lv) !== r.lock + 1 || Number(aps) !== 0) {
        fail('T7I-15', `post-state ${st}/${lv}/${aps} shows the loser wrote something`)
      } else if (!(await chainOk())) fail('T7I-15', 'the audit chain does not verify afterwards')
      else pass('T7I-15', 'exactly one writer committed; the approve failed CAS having written nothing')
    }
  }

  // -------------------------------------------------------------------
  // T7I-16  Concurrent REGENERATE vs trainer APPROVE -- spec 13's named
  //         hazard, run in the OPPOSITE order to T7I-15 so both winners are
  //         covered. Regeneration reaches draft_ready through RPC-6
  //         (U-7I-10: 13 provides no needs_edit -> drafting arc).
  // -------------------------------------------------------------------
  {
    const s = await makeScenario(2)
    const r = await drive(s.session, s.obs, 'draft_ready_checked')
    const gate = nextGate()
    const res = await coordinated({
      gate,
      winner: `${jwt('trainer')}
SELECT public.report_trainer_approve('${r.id}','draft_ready'::public.report_status,${r.lock},'${r.ver}','${r.hash}');`,
      loser: `${jwt('trainer')}
${catching(`PERFORM public.report_save_edit('${r.id}','draft_ready'::public.report_status,${r.lock},'${r.ver}',
  'regenerated text','Panel two','Panel three','Panel four');`)}`,
    })
    if (res.winner.code !== 0) fail('T7I-16', `the winning approve failed: ${res.winner.err}`)
    else if (res.loserCode !== 'BC003' && res.loserCode !== 'BC004') {
      fail('T7I-16', `the loser gave ${res.loserCode}, expected BC003 or BC004`)
    } else {
      const after = await q(WORK_DB, `
SELECT r.status, r.lock_version, (SELECT count(*) FROM public.report_versions v WHERE v.report_id=r.id)
  FROM public.reports r WHERE r.id='${r.id}';`)
      const [st, lv, vs] = after.split('|')
      if (st !== 'trainer_approved' || Number(vs) !== 1) {
        fail('T7I-16', `post-state ${st} with ${vs} version(s) shows the regenerate leaked through`)
      } else if (Number(lv) !== r.lock + 1) {
        fail('T7I-16', `lock_version is ${lv}, expected ${r.lock + 1} -- more than one writer committed`)
      } else if (!(await chainOk())) fail('T7I-16', 'the audit chain does not verify afterwards')
      else pass('T7I-16', 'the approve committed; the concurrent regenerate created no version')
    }
  }

  // -------------------------------------------------------------------
  // T7I-46  CHECKLIST-TOGGLE vs SAVE -- the CLAUDE.md section 6 invariant.
  //         Here the loser must genuinely BLOCK on the aggregate ROW LOCK,
  //         which is the property "locking is the fix, bumping is not"
  //         actually asserts. IN NO INTERLEAVING does a version end with an
  //         all-true checklist attesting to text written after the toggle.
  // -------------------------------------------------------------------
  {
    const s = await makeScenario(3)
    const r = await drive(s.session, s.obs, 'draft_ready')
    const gate = nextGate()
    const winnerSql = `\\set ON_ERROR_STOP on
SELECT pg_advisory_lock(${gate});
BEGIN;
${jwt('trainer')}
SELECT 1 FROM public.reports WHERE id='${r.id}' FOR UPDATE;
${waitRowLockQueued()}
SELECT public.report_save_edit('${r.id}','draft_ready'::public.report_status,${r.lock},'${r.ver}',
  'text written AFTER the toggle','Panel two','Panel three','Panel four');
COMMIT;
SELECT pg_advisory_unlock(${gate});`
    const loserSql = `\\set ON_ERROR_STOP on
${waitGranted(gate)}
BEGIN;
${jwt('trainer')}
${catching(`PERFORM public.report_update_checklist('${r.id}',${r.lock},'${r.ver}',true,true,true);`)}
ROLLBACK;`
    const [w, l] = await Promise.all([
      psql(WORK_DB, winnerSql, { tuplesOnly: false, stopOnError: false }),
      psql(WORK_DB, loserSql, { tuplesOnly: false, stopOnError: false }),
    ])
    const m = /LOSER_RESULT=([A-Z0-9]+|OK)/.exec(l.err + l.out)
    const code = m ? m[1] : `NO_RESULT(${l.err})`
    if (w.code !== 0) fail('T7I-46', `the winning save failed: ${w.err}`)
    else if (code !== 'BC003') fail('T7I-46', `the checklist write gave ${code}, expected BC003 after blocking on the row lock`)
    else {
      const bad = await q(WORK_DB, `
SELECT count(*) FROM public.report_version_checklist_progress cp
  JOIN public.report_versions rv ON rv.id = cp.report_version_id
 WHERE rv.report_id='${r.id}' AND cp.evidence_confirmed AND cp.ai_draft_reviewed AND cp.privacy_checked;`)
      if (Number(bad) !== 0) {
        fail('T7I-46', `${bad} version(s) hold an all-true checklist attesting to text written after the toggle`)
      } else if (!(await chainOk())) fail('T7I-46', 'the audit chain does not verify afterwards')
      else pass('T7I-46', 'the toggle blocked on the row lock, then failed the stale lock_version; no false attestation exists')
    }
  }

  // -------------------------------------------------------------------
  // T7I-61  The SIX two-actor pairings -- now exhaustive over the pairs of
  //         operations that share a legal origin.
  // -------------------------------------------------------------------
  const pairings = [
    {
      label: '(a) management return vs trainer save',
      stop: 'draft_ready_checked',
      // The trainer holds draft_ready; management requires trainer_approved,
      // so AT MOST ONE IS LEGAL AT ANY INSTANT.
      winner: (r) => `${jwt('trainer')}
SELECT public.report_save_edit('${r.id}','draft_ready'::public.report_status,${r.lock},'${r.ver}','a','b','c','d');`,
      loser: (r) => `${jwt('management')}
${catching(`PERFORM public.report_management_return_to_trainer('${r.id}',${r.lock},'${r.ver}','observation'::public.correction_issue_scope,NULL,'return');`)}`,
      expect: ['BC003', 'BC004'],
      bump: 1,
    },
    {
      label: '(b) management submit vs management return',
      stop: 'trainer_approved',
      winner: (r) => `${jwt('management')}
SELECT public.report_management_approve_and_submit('${r.id}',${r.lock},'${r.ver}','${'{whash}'}');`,
      loser: (r) => `${jwt('management')}
${catching(`PERFORM public.report_management_return_to_trainer('${r.id}',${r.lock},'${r.ver}','rating'::public.correction_issue_scope,'body'::public.dimension_code,'return');`)}`,
      expect: ['BC003', 'BC004'],
      bump: 2,
    },
    {
      label: '(c) management wording edit vs management submit',
      stop: 'trainer_approved',
      winner: (r) => `${jwt('management')}
SELECT public.report_management_edit_wording('${r.id}',${r.lock},'${r.ver}','${'{whash}'}','w1','w2','w3','w4');`,
      loser: (r) => `${jwt('management')}
${catching(`PERFORM public.report_management_approve_and_submit('${r.id}',${r.lock},'${r.ver}','${'{whash}'}');`)}`,
      expect: ['BC003'],
      bump: 1,
    },
    {
      label: '(d) management submit vs trainer reopen',
      stop: 'trainer_approved',
      // Different origin statuses, mutually exclusive: the reopen requires
      // `submitted`, which the submit only produces by committing.
      winner: (r) => `${jwt('management')}
SELECT public.report_management_approve_and_submit('${r.id}',${r.lock},'${r.ver}','${'{whash}'}');`,
      loser: (r) => `${jwt('trainer')}
${catching(`PERFORM public.report_reopen_submitted('${r.id}',${r.lock});`)}`,
      // Either authored error is correct here, and which one fires is a
      // consequence of the winner, not a looseness in the test: once the
      // submit COMMITS, `submitted` becomes a legal origin for the reopen, so
      // the reopen fails on its STALE lock_version (BC003) rather than on an
      // illegal transition (BC004). Before the commit it would be BC004.
      expect: ['BC003', 'BC004'],
      bump: 2,
    },
    {
      label: '(e) two management sessions double-submitting',
      stop: 'trainer_approved',
      winner: (r) => `${jwt('management')}
SELECT public.report_management_approve_and_submit('${r.id}',${r.lock},'${r.ver}','${'{whash}'}');`,
      loser: (r) => `${jwt('management')}
${catching(`PERFORM public.report_management_approve_and_submit('${r.id}',${r.lock},'${r.ver}','${'{whash}'}');`)}`,
      expect: ['BC004'],
      bump: 2,
    },
    {
      label: '(f) management wording edit vs management return',
      stop: 'trainer_approved',
      // The sixth and final pairing: T9 and T10 are the two management
      // operations sharing the single origin `trainer_approved`, so two
      // management sessions can legally attempt them at the same instant.
      winner: (r) => `${jwt('management')}
SELECT public.report_management_edit_wording('${r.id}',${r.lock},'${r.ver}','${'{whash}'}','x1','x2','x3','x4');`,
      loser: (r) => `${jwt('management')}
${catching(`PERFORM public.report_management_return_to_trainer('${r.id}',${r.lock},'${r.ver}','assessment_fact'::public.correction_issue_scope,NULL,'return');`)}`,
      expect: ['BC003'],
      bump: 1,
    },
  ]

  let idx = 3
  let allOk = true
  for (const p of pairings) {
    idx += 1
    const s = await makeScenario(idx)
    const r = await drive(s.session, s.obs, p.stop)
    const gate = nextGate()
    const res = await coordinated({
      gate,
      winner: p.winner(r).replaceAll('{whash}', r.whash),
      loser: p.loser(r).replaceAll('{whash}', r.whash),
    })
    if (res.winner.code !== 0) { fail('T7I-61', `${p.label}: the winner failed: ${res.winner.err}`); allOk = false; continue }
    if (!p.expect.includes(res.loserCode)) {
      fail('T7I-61', `${p.label}: the loser gave ${res.loserCode}, expected one of ${p.expect.join('/')}`)
      allOk = false
      continue
    }
    if (!(await chainOk())) { fail('T7I-61', `${p.label}: the chain does not verify`); allOk = false; continue }
    // EXACTLY ONE writer committed: lock_version advanced by precisely the
    // winner's own bump, so the loser wrote nothing.
    const after = Number(await q(WORK_DB, `SELECT lock_version FROM public.reports WHERE id='${r.id}';`))
    if (after !== r.lock + p.bump) {
      fail('T7I-61', `${p.label}: lock_version is ${after}, expected ${r.lock + p.bump} -- more than one writer committed`)
      allOk = false
      continue
    }
    console.log(`  ok ${p.label} -- loser ${res.loserCode}, lock_version ${r.lock} -> ${after}`)
  }
  if (allOk) pass('T7I-61', 'all six two-actor pairings: exactly one writer commits, the loser writes nothing')

  const events = await q(WORK_DB, `SELECT count(*) FROM public.audit_events;`)
  console.log(`\nDisposable database: ${events} committed audit event(s) -- the EXPECTED outcome, and the reason this suite never runs on the canonical database.`)

  await destroyDisposable()
  console.log('Disposable database destroyed.')
}

run()
  .then(() => {
    if (failures > 0) {
      console.error(`\nStep 7I R(C) suite: ${failures} failure(s).`)
      process.exitCode = 1
    } else {
      console.log('\nStep 7I R(C) suite: all coordinated proofs passed.')
    }
  })
  .catch(async (e) => {
    console.error(`\nStep 7I R(C) suite aborted: ${e.message}`)
    try { await destroyDisposable() } catch {}
    process.exitCode = 1
  })
