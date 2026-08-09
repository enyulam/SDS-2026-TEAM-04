#!/usr/bin/env node
// =====================================================================
// CLAUDE.md §10 PHASE 1 EXIT CONDITION (b) -- RUNNER
//
//   "an approved report's exact content is recoverable from its audit
//    trail by hash"
// =====================================================================
// Runs scripts/tests/step-7i/exit-condition-b.sql on a DISPOSABLE clone
// of the canonical fixture database, then destroys it and re-proves the
// canonical database untouched.
//
// WHY A DISPOSABLE CLONE IS MANDATORY HERE, not merely tidy: this suite
// COMMITS a full report lifecycle, which means it commits report_versions
// rows and audit_events rows. The canonical fixture's ratified baseline is
// zero of each, and several accepted proofs -- T7I-30's empty-chain proof
// and assertCanonicalPristine among them -- depend on that staying true.
// Running this against `postgres` would permanently destroy those, and the
// audit table is append-only by trigger, so it could not be undone.
//
// The clone chain (seed -> work) mirrors the accepted pattern already used
// by run-management-approved.mjs, run-c2.mjs and run-c3-bypass.mjs.
//
// LOCAL ONLY. No provider is constructed, no network call is made, and no
// credential is read, prompted for or written.
//
// Run: node scripts/tests/step-7i/run-exit-condition-b.mjs
// =====================================================================

import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const CONTAINER = 'supabase_db_best-coach-mvp'
const CANONICAL = 'postgres'
const SEED_DB = 'bc_xb_seed'
const WORK_DB = 'bc_xb'
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
const SUITE = join(ROOT, 'scripts', 'tests', 'step-7i', 'exit-condition-b.sql')

let failures = 0
const fail = (id, msg) => { failures += 1; console.error(`FAIL ${id}: ${msg}`) }
const pass = (id, msg) => console.log(`PASS ${id}${msg ? ' -- ' + msg : ''}`)

// SQL always arrives on STDIN, never via `-c`. Two reasons, both learned
// the hard way while building this runner: `-c` sends its whole argument
// as ONE query string, which the server wraps in an implicit transaction
// (so DROP/CREATE DATABASE fails with "cannot run inside a transaction
// block"); and stdin keeps the statements out of the process argument
// list. Same channel the accepted harnesses use.
function psql(db, sql, { user = 'postgres', stopOnError = true } = {}) {
  return new Promise((resolve) => {
    const args = ['exec', '-i', CONTAINER, 'psql', '--no-psqlrc', `--username=${user}`,
      `--dbname=${db}`, '--quiet']
    if (stopOnError) args.push('--set=ON_ERROR_STOP=1')
    const p = spawn('docker', args, { stdio: ['pipe', 'pipe', 'pipe'], shell: false })
    let out = '', err = ''
    p.stdout.on('data', (d) => { out += d })
    p.stderr.on('data', (d) => { err += d })
    p.on('close', (code) => resolve({ code, out, err }))
    p.stdin.write(sql)
    p.stdin.end()
  })
}

async function main() {
  // -------------------------------------------------------------------
  // Pre-flight: the canonical database must be pristine BEFORE we start.
  // If it already holds report or audit rows, nothing this run does could
  // prove they were not this run's fault -- so stop rather than start.
  // -------------------------------------------------------------------
  const before = await psql(CANONICAL,
    'SELECT (SELECT count(*) FROM public.report_versions) || \'|\' || ' +
    '(SELECT count(*) FROM public.audit_events) || \'|\' || ' +
    '(SELECT count(*) FROM public.reports);')
  const beforeCounts = (before.out.match(/\d+\|\d+\|\d+/) || [''])[0]
  if (beforeCounts !== '0|0|0') {
    fail('XB-PRE', `the canonical database is not pristine (report_versions|audit_events|reports = ${beforeCounts || 'unreadable'}). Nothing was provisioned.`)
    process.exit(1)
  }
  pass('XB-PRE', 'the canonical database is pristine before the run (0 report_versions, 0 audit_events, 0 reports)')

  let cloned = false
  try {
    // THE ACCEPTED CLONE PATTERN, adopted verbatim from
    // run-management-approved.mjs / run-c2.mjs rather than reinvented.
    // PostgreSQL refuses to use a template database that has any other
    // connection, and the Supabase stack (PostgREST, realtime, storage,
    // pooler) holds several to `postgres` permanently -- so the template
    // must be briefly closed to new connections and its existing backends
    // terminated. `datallowconn` is restored in the SAME batch, and again
    // unconditionally in the finally block below: leaving it false would
    // make the canonical database unreachable to the whole stack.
    const create = await psql('template1', `
UPDATE pg_database SET datallowconn = false WHERE datname = '${CANONICAL}';
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${CANONICAL}' AND pid <> pg_backend_pid();
SELECT pg_sleep(1);
DROP DATABASE IF EXISTS ${WORK_DB};
DROP DATABASE IF EXISTS ${SEED_DB};
CREATE DATABASE ${SEED_DB} TEMPLATE ${CANONICAL};
CREATE DATABASE ${WORK_DB} TEMPLATE ${SEED_DB};
UPDATE pg_database SET datallowconn = true WHERE datname = '${CANONICAL}';
ALTER DATABASE ${SEED_DB} OWNER TO postgres;
ALTER DATABASE ${WORK_DB} OWNER TO postgres;`, { user: 'supabase_admin' })
    if (create.code !== 0) {
      // NOT `return` -- an early return here would skip the exit-code check
      // at the end of main() and this harness would EXIT 0 ON FAILURE,
      // which is the silent-green class this project keeps auditing for.
      fail('XB-CLONE', `could not create the disposable databases: ${create.err.trim()}`)
      throw new Error('clone failed')
    }
    cloned = true
    pass('XB-CLONE', `disposable clone ${WORK_DB} created from the canonical fixture`)

    const run = await psql(WORK_DB, readFileSync(SUITE, 'utf8'))
    process.stdout.write(run.out)
    // psql RAISE NOTICE goes to stderr; that is where the PASS lines are.
    process.stdout.write(run.err)
    if (run.code !== 0) {
      fail('XB', 'the exit-condition-(b) suite failed -- see the output above')
    } else {
      const notices = (run.err.match(/^NOTICE:  PASS XB-/gm) || []).length
      if (notices !== 7) {
        fail('XB', `expected 7 XB PASS notices, saw ${notices} -- a leg was skipped rather than proven`)
      } else {
        pass('XB', 'all 7 legs proven (XB-1 lifecycle, XB-2 audit records the digest, XB-3 exact recomputation, XB-4 chain verifies, XB-5 four panels bound, XB-6 nine ratings bound, XB-7 envelope provenance)')
      }
    }
  } catch (e) {
    // Swallowed deliberately: the failure is ALREADY recorded via fail(),
    // and the post-flight checks below must still run so a partially
    // created clone cannot be left behind unreported. The exit code is
    // decided at the end of main() from `failures`, never from here.
    if (!cloned) { /* the fail() above already named it */ }
    else fail('XB', `the run aborted: ${e.message}`)
  } finally {
    // Always destroy the disposable databases, even on failure. A leaked
    // bc_* database is itself a finding in this project.
    //
    // datallowconn is restored here UNCONDITIONALLY as well as inside the
    // clone batch. If the batch died between disabling connections and
    // re-enabling them, the canonical database would otherwise be left
    // unreachable to the entire Supabase stack -- a far worse outcome than
    // the failure that caused it.
    await psql('template1',
      `UPDATE pg_database SET datallowconn = true WHERE datname = '${CANONICAL}';
       DROP DATABASE IF EXISTS ${WORK_DB};
       DROP DATABASE IF EXISTS ${SEED_DB};`,
      { user: 'supabase_admin', stopOnError: false })
  }

  // -------------------------------------------------------------------
  // Post-flight: the canonical database must be UNCHANGED, and no
  // disposable database may survive.
  // -------------------------------------------------------------------
  const after = await psql(CANONICAL,
    'SELECT (SELECT count(*) FROM public.report_versions) || \'|\' || ' +
    '(SELECT count(*) FROM public.audit_events) || \'|\' || ' +
    '(SELECT count(*) FROM public.reports);')
  const afterCounts = (after.out.match(/\d+\|\d+\|\d+/) || [''])[0]
  if (afterCounts !== '0|0|0') {
    fail('XB-POST', `the canonical database was mutated by this run (${afterCounts})`)
  } else {
    pass('XB-POST', 'the canonical database is still pristine after the run')
  }

  const leaked = await psql(CANONICAL,
    "SELECT count(*) FROM pg_database WHERE datname LIKE 'bc\\_%';")
  const n = (leaked.out.match(/\d+/) || ['?'])[0]
  if (n !== '0') fail('XB-POST', `${n} disposable bc_* database(s) leaked`)
  else pass('XB-POST', '0 leftover bc_* databases')

  if (failures > 0) {
    console.error(`\nEXIT CONDITION (b): ${failures} failure(s). RESULT: FAIL`)
    process.exit(1)
  }
  console.log('\nRESULT: PASS -- CLAUDE.md §10 Phase 1 exit condition (b) is DEMONSTRATED.')
}

await main()
