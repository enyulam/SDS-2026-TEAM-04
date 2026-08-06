#!/usr/bin/env node
// =====================================================================
// B.E.S.T Coach -- correction-tracking runner (T-CT-1 .. T-CT-20 + statics)
// =====================================================================
// LOCAL DISPOSABLE DEVELOPMENT DATABASE ONLY.
//
// Order:
//   1. the static scan (ct-static.mjs);
//   2. a DISPOSABLE database is cloned from the canonical fixture database;
//   3. ct-suite.sql runs there -- it drives the REAL governed lifecycle and
//      COMMITS, which appends real audit events, so it can never run on the
//      canonical database whose accepted state is zero events;
//   4. the disposable database is destroyed.
//
// The canonical database is NEVER touched by this runner. It is re-checked
// afterwards to prove exactly that.
//
// Run: node scripts/tests/correction-tracking/run-correction-tracking.mjs
// =====================================================================

import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const CONTAINER = 'supabase_db_best-coach-mvp'
const SEED_DB = 'bc_ct_seed'
const WORK_DB = 'bc_ct'
const CANONICAL = 'postgres'
const ROOT = process.cwd()
const SUITE = join(ROOT, 'scripts', 'tests', 'correction-tracking', 'ct-suite.sql')
const STATIC = join(ROOT, 'scripts', 'tests', 'correction-tracking', 'ct-static.mjs')

let failures = 0
const fail = (id, msg) => { failures += 1; console.error(`FAIL ${id}: ${msg}`) }

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

// Disposable lifecycle -- the accepted run-assessment / run-concurrency pattern.
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
  || '|' || (SELECT count(*) FROM public.audit_events)
  || '|' || (SELECT count(*) FROM public.audit_chain_heads)
  || '|' || (SELECT count(*) FROM auth.users)
  || '|' || (SELECT count(*) FROM supabase_migrations.schema_migrations);`

async function main() {
  console.log('=== Management correction-tracking run (T-CT-1 .. T-CT-20) ===\n')

  // 1 -- static scan
  const scan = await run(process.execPath, [STATIC])
  process.stdout.write(scan.out)
  if (scan.code !== 0) { process.stderr.write(scan.err); fail('static', 'the static scan failed') }

  // The canonical state BEFORE, so "never touched" is measured, not asserted.
  const canonBefore = await q(CANONICAL, CENSUS)

  // 2 -- disposable database
  await createDisposable()
  console.log('\nDisposable database created from the canonical fixture template.\n')

  // 3 -- the runtime suite
  const suite = readFileSync(SUITE, 'utf8')
  const s = await psql(WORK_DB, suite, { tuplesOnly: false })
  const notices = s.err.split('\n').filter((l) => /PASS T-CT/.test(l))
  for (const n of notices) console.log(n.replace(/^NOTICE:\s+/, ''))
  if (s.code !== 0 || !s.out.includes('CT_SUITE_COMPLETE')) {
    process.stderr.write(s.err.split('\n').filter((l) => !/^NOTICE/.test(l)).join('\n'))
    fail('ct-suite', 'the runtime suite failed')
  } else {
    console.log(`\nRuntime suite complete: ${notices.length} PASS notices.`)
  }

  const events = await q(WORK_DB, `SELECT count(*) FROM public.audit_events;`)
  console.log(`\nDisposable database: ${events} committed audit event(s) from the two full correction cycles -- the reason this suite never runs on the canonical database.`)

  // 4 -- destroy, then prove the canonical database is untouched.
  await destroyDisposable()
  console.log('Disposable database destroyed.')

  const canonAfter = await q(CANONICAL, CENSUS)
  if (canonBefore !== canonAfter) {
    fail('canonical', `the canonical database changed during the run (${canonBefore} -> ${canonAfter})`)
  } else {
    console.log(`Canonical database untouched: reports|versions|corrections|events|heads|auth|migrations = ${canonAfter}`)
  }
}

main().then(() => {
  console.log('')
  if (failures > 0) {
    console.error(`Correction-tracking suite: ${failures} failure(s).`)
    process.exitCode = 1
  } else {
    console.log('Correction-tracking suite: all proofs passed.')
  }
}).catch(async (e) => {
  console.error(`Correction-tracking suite aborted: ${e.message}`)
  try { await destroyDisposable() } catch { /* best effort */ }
  process.exitCode = 1
})
