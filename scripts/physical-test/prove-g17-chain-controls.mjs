#!/usr/bin/env node
// =====================================================================
// B.E.S.T Coach -- G-17 non-empty-chain POSITIVE and NEGATIVE controls
// (Run C3-A Phase 1, item 4)
// =====================================================================
// LOCAL DISPOSABLE DEVELOPMENT DATABASE ONLY. Every audit event this suite
// writes, and every deliberate corruption it performs, happens on a
// throwaway clone that is destroyed on success, on failure, on exception
// and on SIGINT. `public.audit_events` is UPDATE/DELETE-blocked by trigger
// and Step 7H forbids repair, so ONE stray committed or tampered row on the
// canonical database would be PERMANENT.
//
// THIS RUNNER PERFORMS NO GOVERNED WRITE AGAINST THE CANONICAL DATABASE.
// It reads the canonical census before and after and requires it unmoved.
//
// ---------------------------------------------------------------------
// THE DEFECT UNDER TEST
// ---------------------------------------------------------------------
// `scripts/physical-test/run-f17.mjs` G-17 selected `ok::text` and
// `head_checked::text` from `public.audit_verify_chain()` and computed
//
//     const corrupt = chainRows.filter((row) => row[1] !== 't')
//
// Under `--tuples-only --no-align` psql renders a BARE boolean as `t`/`f`
// but an EXPLICITLY CAST boolean as `true`/`false`. So `row[1]` was always
// `true` or `false`, never `t`, and EVERY HEALTHY CHAIN ROW was classified
// CORRUPT -- a false FAIL. The direction matters: the defect fails CLOSED,
// so it is a correctness defect and not a gate-honesty hole. It was masked
// only because the canonical database holds zero audit events, which sends
// G-17 down its empty-chain FAIL branch before the predicate can matter.
//
// ---------------------------------------------------------------------
// WHAT THIS SUITE PROVES
// ---------------------------------------------------------------------
//   C-1  DRIFT GUARD. The three decisive lines of G-17 are read out of
//        run-f17.mjs and asserted byte-identical to the predicate this
//        suite evaluates, so the controls cannot drift from the gate they
//        stand for. The old wrapping comparison is asserted absent.
//   C-2  EMPTY CHAIN, ON THE REAL CANONICAL DATABASE, READ-ONLY. G-17 must
//        NOT pass. The empty-chain guard is not weakened by this fix.
//   C-3  POSITIVE CONTROL. On a disposable clone carrying a REAL non-empty
//        audit chain -- written by the real governed composer, not
//        hand-inserted -- G-17 PASSES.
//   C-4  THE FALSE FAIL, MEASURED. The OLD predicate is evaluated over the
//        SAME healthy rows and must FAIL them. Without this leg C-3 would
//        prove only that something passed, not that the fix is what makes
//        it pass.
//   C-5  NEGATIVE CONTROL. The chain is DELIBERATELY CORRUPTED on the
//        disposable clone and G-17 FAILS, naming the centre, the sequence
//        number and the failing check.
//   C-6  HEAD COVERAGE. A chain whose head is not included in the
//        verification must not count as verified either.
//
// Run: node scripts/physical-test/prove-g17-chain-controls.mjs
// =====================================================================

import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const CONTAINER = 'supabase_db_best-coach-mvp'
const CANONICAL = 'postgres'
const SEED_DB = 'bc_g17_seed'
const WORK_DB = 'bc_g17'
const ROOT = process.cwd()
const RUNNER = join(ROOT, 'scripts', 'physical-test', 'run-f17.mjs')

const CENTRE = 'b0000000-0000-4000-8000-000000000001'
const STUDENT = 'c2000000-0000-4000-8000-000000000001'
const MODULE = 'c4000000-0000-4000-8000-000000000001'
const ENROLMENT = 'c6000000-0000-4000-8000-000000000001'
const TRAINER_M = 'c1000000-0000-4000-8000-000000000002'
const TRAINER_JWT = '{"sub":"d0000000-0000-4000-8000-000000000002","role":"authenticated"}'
const SESSION = 'c5000000-0000-4000-8000-000000009401'

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

// ---------------------------------------------------------------------
// The G-17 primitives, reproduced EXACTLY as run-f17.mjs holds them. C-1
// asserts these against the runner's own source before anything else runs.
// ---------------------------------------------------------------------
const G17_QUERY =
  'SELECT centre_id::text, ok::text, events_checked::text, ' +
  "COALESCE(first_failed_seq::text, '-'), COALESCE(failed_check, '-'), head_checked::text " +
  'FROM public.audit_verify_chain();'

const G17_READ_BOOLEAN = [
  'function readBoolean(field) {',
  "  if (field === 't' || field === 'true') return true",
  "  if (field === 'f' || field === 'false') return false",
  '  return null',
  '}',
]

const G17_PREDICATE = [
  '  const corrupt = chainRows.filter((row) => readBoolean(row[1]) !== true)',
  '  const headsUnchecked = chainRows.filter((row) => readBoolean(row[5]) !== true)',
  '    chainRows.length > 0 && corrupt.length === 0 && headsUnchecked.length === 0,',
]

function readBoolean(field) {
  if (field === 't' || field === 'true') return true
  if (field === 'f' || field === 'false') return false
  return null
}

/** The committed G-17 verdict, computed from a set of chain rows. */
function g17Verdict(chainRows) {
  const corrupt = chainRows.filter((row) => readBoolean(row[1]) !== true)
  const headsUnchecked = chainRows.filter((row) => readBoolean(row[5]) !== true)
  return {
    passed: chainRows.length > 0 && corrupt.length === 0 && headsUnchecked.length === 0,
    corrupt,
    headsUnchecked,
  }
}

/** The PRE-FIX verdict, kept only so C-4 can measure the false fail. */
function legacyVerdict(chainRows) {
  const corrupt = chainRows.filter((row) => row[1] !== 't')
  return { passed: chainRows.length > 0 && corrupt.length === 0, corrupt }
}

// ---------------------------------------------------------------------
function psql(db, sql, { tuplesOnly = true, stopOnError = true, user = 'postgres' } = {}) {
  return new Promise((resolve) => {
    const args = ['exec', '-i', CONTAINER, 'psql', '--no-psqlrc', `--username=${user}`,
      `--dbname=${db}`, '--quiet']
    if (stopOnError) args.push('--set=ON_ERROR_STOP=1')
    if (tuplesOnly) args.push('--tuples-only', '--no-align', '--field-separator=|')
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

/** Exactly run-f17.mjs's psqlRows() shape: trimmed non-empty lines split on '|'. */
async function chainRowsFrom(db) {
  const out = await q(db, G17_QUERY)
  return out.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0).map((l) => l.split('|'))
}

async function createDisposable() {
  const r = await psql('template1', `
UPDATE pg_database SET datallowconn = false WHERE datname = '${CANONICAL}';
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${CANONICAL}' AND pid <> pg_backend_pid();
SELECT pg_sleep(1);
DROP DATABASE IF EXISTS ${SEED_DB};
CREATE DATABASE ${SEED_DB} TEMPLATE ${CANONICAL};
UPDATE pg_database SET datallowconn = true WHERE datname = '${CANONICAL}';
ALTER DATABASE ${SEED_DB} OWNER TO postgres;`, { tuplesOnly: false, user: 'supabase_admin' })
  if (r.code !== 0) throw new Error(`could not create the disposable seed:\n${r.err}`)
  const w = await psql('template1',
    `DROP DATABASE IF EXISTS ${WORK_DB};
     CREATE DATABASE ${WORK_DB} TEMPLATE ${SEED_DB};
     ALTER DATABASE ${WORK_DB} OWNER TO postgres;`,
    { tuplesOnly: false, user: 'supabase_admin' })
  if (w.code !== 0) throw new Error(`could not create the disposable database:\n${w.err}`)
}

async function destroyDisposable() {
  await psql('template1', `DROP DATABASE IF EXISTS ${WORK_DB};`, { tuplesOnly: false, stopOnError: false, user: 'supabase_admin' })
  await psql('template1', `DROP DATABASE IF EXISTS ${SEED_DB};`, { tuplesOnly: false, stopOnError: false, user: 'supabase_admin' })
}

const CENSUS = `
SELECT (SELECT count(*) FROM public.reports)
  || '|' || (SELECT count(*) FROM public.report_versions)
  || '|' || (SELECT count(*) FROM public.observations)
  || '|' || (SELECT count(*) FROM public.observation_ratings)
  || '|' || (SELECT count(*) FROM public.audit_events)
  || '|' || (SELECT count(*) FROM public.audit_chain_heads)
  || '|' || (SELECT count(*) FROM auth.users)
  || '|' || (SELECT count(*) FROM supabase_migrations.schema_migrations);`

// ---------------------------------------------------------------------
async function main() {
  console.log('=== G-17 non-empty-chain controls (Run C3-A Phase 1, item 4) ===\n')

  // -------------------------------------------------------------------
  // C-1  DRIFT GUARD
  // -------------------------------------------------------------------
  {
    const src = readFileSync(RUNNER, 'utf8').replace(/\r\n/g, '\n')
    const missing = []
    if (!src.includes(G17_QUERY.replace("'SELECT ", ''))) {
      // The query is assembled from three concatenated literals in the
      // runner; each fragment is checked on its own.
      for (const fragment of [
        "'SELECT centre_id::text, ok::text, events_checked::text, '",
        `"COALESCE(first_failed_seq::text, '-'), COALESCE(failed_check, '-'), head_checked::text "`,
        "'FROM public.audit_verify_chain();'",
      ]) {
        if (!src.includes(fragment)) missing.push(fragment)
      }
    }
    for (const line of [...G17_READ_BOOLEAN, ...G17_PREDICATE]) {
      if (!src.includes(line)) missing.push(line)
    }
    // The pre-fix comparison must be GONE from the runner. Comments are
    // stripped first: the fix's own explanation quotes the old predicate
    // precisely to record that it is gone.
    const code = src.split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n')
    if (/row\[1\]\s*!==\s*'t'/.test(code)) missing.push("the pre-fix comparison row[1] !== 't' is still live code in run-f17.mjs")
    if (missing.length > 0) {
      fail('C-1', `run-f17.mjs does not hold the exact G-17 primitives this suite evaluates:\n  ${missing.join('\n  ')}`)
    } else {
      pass('C-1', 'the G-17 query, the strict readBoolean and the three predicate lines in run-f17.mjs are BYTE-IDENTICAL to the ones evaluated below, and the pre-fix single-character comparison is gone from its live code')
    }
  }

  const canonBefore = await q(CANONICAL, CENSUS)

  // -------------------------------------------------------------------
  // C-2  EMPTY CHAIN -- read-only, against the REAL canonical database
  // -------------------------------------------------------------------
  {
    const rows = await chainRowsFrom(CANONICAL)
    const events = await q(CANONICAL, 'SELECT count(*) FROM public.audit_events;')
    const verdict = g17Verdict(rows)
    if (events !== '0') {
      fail('C-2', `the canonical database holds ${events} audit event(s); this leg is only meaningful on the ratified empty chain`)
    } else if (verdict.passed) {
      fail('C-2', 'G-17 PASSED on an empty audit chain -- the empty-chain guard has been weakened')
    } else {
      pass('C-2', `G-17 does NOT pass on the canonical database's ratified EMPTY audit chain (audit_verify_chain() returned ${rows.length} row(s) over 0 events). The guard the fix had to preserve is intact, and this leg wrote nothing`)
    }
  }

  await createDisposable()
  console.log('\nDisposable database created from the canonical fixture template.\n')

  // A real non-empty chain, written by the REAL governed composer.
  // `report_create` emits `report.created` and
  // `report_mark_observation_saved` emits `report.state_changed`, so this
  // is a genuine two-event chain, hash-linked by the ratified code -- never
  // hand-inserted rows shaped to look like one.
  await q(WORK_DB, `
INSERT INTO public.class_sessions (id, centre_id, class_module_id, session_date, starts_at, ends_at)
VALUES ('${SESSION}','${CENTRE}','${MODULE}', (now() AT TIME ZONE 'Asia/Singapore')::date - 1, '10:00','11:00');
INSERT INTO public.class_session_assignments (centre_id, class_session_id, trainer_membership_id)
VALUES ('${CENTRE}','${SESSION}','${TRAINER_M}');
INSERT INTO public.attendance (centre_id, class_session_id, class_module_id, student_id, enrolment_id, status)
VALUES ('${CENTRE}','${SESSION}','${MODULE}','${STUDENT}','${ENROLMENT}','present');
SET request.jwt.claims = '${TRAINER_JWT}';
SELECT x.report_id FROM public.assessment_save_complete_and_open_report(
  '${SESSION}'::uuid, '${STUDENT}'::uuid, NULL, NULL,
  ARRAY['confident-opening']::text[], ARRAY['pacing']::text[],
  'G-17 control save.', 'Follow up.', '', '${NINE}'::jsonb) AS x;`)

  const events = await q(WORK_DB, 'SELECT count(*) FROM public.audit_events;')
  if (Number(events) < 2) {
    fail('setup', `the disposable chain holds ${events} audit event(s); at least 2 are needed for a meaningful control`)
  }

  // -------------------------------------------------------------------
  // C-3  POSITIVE CONTROL -- healthy non-empty chain
  // -------------------------------------------------------------------
  const healthy = await chainRowsFrom(WORK_DB)
  {
    const verdict = g17Verdict(healthy)
    const checked = healthy.reduce((n, row) => n + (Number(row[2]) || 0), 0)
    if (!verdict.passed) {
      fail('C-3', `G-17 did NOT pass on a healthy non-empty chain (${verdict.corrupt.length} row(s) read as not-ok, ${verdict.headsUnchecked.length} head(s) unverified); rows: ${JSON.stringify(healthy)}`)
    } else if (checked !== Number(events)) {
      fail('C-3', `the verifier checked ${checked} event(s) but public.audit_events holds ${events}`)
    } else {
      pass('C-3', `POSITIVE CONTROL: on a REAL non-empty chain of ${events} event(s) written by the governed composer, G-17 PASSES -- ${healthy.length} chain(s) ok, ${checked} event(s) checked, every head included`)
    }
  }

  // -------------------------------------------------------------------
  // C-4  THE FALSE FAIL, MEASURED
  // -------------------------------------------------------------------
  {
    const legacy = legacyVerdict(healthy)
    const rendered = [...new Set(healthy.map((row) => row[1]))].join(', ')
    if (legacy.passed) {
      fail('C-4', `the PRE-FIX predicate also passed these rows (ok rendered as "${rendered}"), so the defect is not reproducible here and C-3 attributes nothing to the fix`)
    } else if (legacy.corrupt.length !== healthy.length) {
      fail('C-4', `the PRE-FIX predicate misclassified ${legacy.corrupt.length} of ${healthy.length} healthy rows; the defect classified ALL of them`)
    } else {
      pass('C-4', `psql renders the EXPLICIT ok::text cast as "${rendered}", so the pre-fix comparison against 't' classified ALL ${healthy.length} healthy chain row(s) as CORRUPT -- a false FAIL on a perfectly good chain. C-3 is therefore attributable to the fix and to nothing else`)
    }
  }

  // -------------------------------------------------------------------
  // C-5  NEGATIVE CONTROL -- a deliberately corrupted chain
  // -------------------------------------------------------------------
  // `audit_events` is UPDATE/DELETE-blocked by trigger with no owner
  // exemption, which is exactly the guarantee under test elsewhere. The
  // trigger is therefore disabled, ONE row is tampered with, and the
  // trigger is immediately re-enabled and re-measured as enabled -- all on
  // a throwaway clone that is destroyed a few statements later.
  {
    await q(WORK_DB, `
ALTER TABLE public.audit_events DISABLE TRIGGER audit_events_block_update_delete_trg;
UPDATE public.audit_events
   SET target_label = COALESCE(target_label, '') || ' TAMPERED'
 WHERE seq_no = (SELECT max(seq_no) FROM public.audit_events);
ALTER TABLE public.audit_events ENABLE TRIGGER audit_events_block_update_delete_trg;`)
    const guard = await q(WORK_DB, `
SELECT t.tgenabled::text FROM pg_catalog.pg_trigger t JOIN pg_catalog.pg_class c ON c.oid = t.tgrelid
 WHERE c.relname = 'audit_events' AND t.tgname = 'audit_events_block_update_delete_trg';`)
    const corruptedRows = await chainRowsFrom(WORK_DB)
    const verdict = g17Verdict(corruptedRows)
    if (guard !== 'O') {
      fail('C-5', `the append-only trigger was left in state "${guard}" after the tamper; it must be re-enabled`)
    } else if (verdict.passed) {
      fail('C-5', `G-17 PASSED on a DELIBERATELY CORRUPTED chain -- the gate does not detect tampering; rows: ${JSON.stringify(corruptedRows)}`)
    } else if (verdict.corrupt.length === 0) {
      fail('C-5', 'G-17 failed for a reason other than chain corruption, so the negative control did not exercise the corruption path')
    } else {
      const detail = verdict.corrupt.map((row) => `${row[0]} at seq ${row[3]} (${row[4]})`).join(', ')
      pass('C-5', `NEGATIVE CONTROL: one committed audit row was tampered with on the disposable clone and G-17 FAILS, naming the chain, the sequence number and the failing check -- ${detail}. The append-only trigger was re-enabled and re-measured enabled`)
    }
  }

  // -------------------------------------------------------------------
  // C-6  HEAD COVERAGE is part of the verdict
  // -------------------------------------------------------------------
  {
    // A bounded verification that stops short of the head reports
    // head_checked = false. The gate must not count that as verified.
    const bounded = await q(WORK_DB,
      "SELECT centre_id::text, ok::text, events_checked::text, " +
      "COALESCE(first_failed_seq::text, '-'), COALESCE(failed_check, '-'), head_checked::text " +
      'FROM public.audit_verify_chain(NULL, 1, 1);')
    const rows = bounded.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0).map((l) => l.split('|'))
    const verdict = g17Verdict(rows)
    const heads = [...new Set(rows.map((row) => row[5]))].join(', ')
    if (rows.length === 0) {
      fail('C-6', 'the bounded verification returned no chain, so head coverage could not be exercised')
    } else if (verdict.passed) {
      fail('C-6', `G-17 passed a verification that reported head_checked = "${heads}"`)
    } else {
      pass('C-6', `a bounded verification that stops short of the head reports head_checked = "${heads}", and G-17 does NOT pass it -- head coverage is part of the verdict, not an unread column`)
    }
  }

  await destroyDisposable()
  console.log('\nDisposable database destroyed.')

  const canonAfter = await q(CANONICAL, CENSUS)
  if (canonBefore !== canonAfter) {
    fail('canonical', `the canonical database changed during the run (${canonBefore} -> ${canonAfter})`)
  } else {
    console.log(`Canonical database untouched: reports|versions|observations|ratings|events|heads|auth|migrations = ${canonAfter}`)
  }
}

main().then(() => {
  console.log('')
  if (failures > 0) {
    console.error(`G-17 chain controls: ${failures} failure(s).`)
    process.exitCode = 1
  } else {
    console.log('G-17 chain controls: all proofs passed.')
  }
}).catch(async (e) => {
  console.error(`G-17 chain controls aborted: ${e.message}`)
  try { await destroyDisposable() } catch { /* best effort */ }
  process.exitCode = 1
})

for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGBREAK']) {
  process.on(signal, () => {
    destroyDisposable().finally(() => { process.exit(130) })
  })
}
