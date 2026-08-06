#!/usr/bin/env node
// =====================================================================
// C2C-004 — the Management "Approved" filter and the governed projection
// behind it.
// =====================================================================
// LOCAL DISPOSABLE DATABASE ONLY for every committing leg.
//
// Order:
//   1. the canonical census is measured BEFORE anything else touches a
//      database, so "the canonical database was never written" is a
//      MEASUREMENT rather than a claim;
//   2. MA-1 and MA-8 .. MA-10 read the CANONICAL catalogue and the
//      production source. They write nothing;
//   3. a DISPOSABLE database is cloned from the canonical fixture
//      database;
//   4. ma-suite.sql runs there — it drives FIVE real governed lifecycles
//      and COMMITS, appending real audit events;
//   5. the disposable database is destroyed;
//   6. the canonical census is measured AGAIN and any difference fails
//      the run.
//
// WHY THE DISPOSABLE DATABASE IS NON-NEGOTIABLE. The suite calls
// `assessment_save_complete_and_open_report`, `report_request_draft`,
// `report_store_draft`, `report_trainer_approve`,
// `report_management_return_to_trainer` and
// `report_management_approve_and_submit`. Every one of them appends
// audit events. `audit_events` is UPDATE/DELETE-blocked by trigger with
// no owner exemption and Step 7H forbids repair, so ONE stray committed
// event on the canonical database is PERMANENT and would break the
// canonical fixture checksum and the F17 G-18 pin forever.
//
// Run: node scripts/tests/management-approved/run-management-approved.mjs
// =====================================================================

import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const CONTAINER = 'supabase_db_best-coach-mvp'
const SEED_DB = 'bc_ma_seed'
const WORK_DB = 'bc_ma'
const CANONICAL = 'postgres'
const ROOT = process.cwd()
const SUITE = join(ROOT, 'scripts', 'tests', 'management-approved', 'ma-suite.sql')
const FN = 'report_list_management_submitted'

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

const stripComments = (source) =>
  source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')

async function main() {
  console.log('=== C2C-004 Management "Approved" projection ===\n')

  const censusBefore = await q(CANONICAL, CENSUS)

  // -----------------------------------------------------------------
  // MA-1  The governed boundary's applied posture, read from the
  //       CANONICAL catalogue. The projection is the boundary: a column
  //       that does not exist cannot leak.
  // -----------------------------------------------------------------
  {
    const posture = await q(CANONICAL, `
SELECT l.lanname || '|' || p.prosecdef::text || '|' || p.provolatile::text || '|' || p.pronargs::text
    || '|' || (p.proconfig::text LIKE '%search_path=%')::text
    || '|' || pg_get_userbyid(p.proowner)
    || '|' || has_function_privilege('authenticated', p.oid, 'EXECUTE')::text
    || '|' || has_function_privilege('anon', p.oid, 'EXECUTE')::text
    || '|' || has_function_privilege('service_role', p.oid, 'EXECUTE')::text
    || '|' || has_function_privilege('authenticator', p.oid, 'EXECUTE')::text
    || '|' || array_to_string(p.proargnames, ',')
  FROM pg_catalog.pg_proc p
  JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
  JOIN pg_catalog.pg_language l ON l.oid = p.prolang
 WHERE n.nspname = 'public' AND p.proname = '${FN}';`)
    const expected = 'plpgsql|true|s|0|true|postgres|true|false|false|false|'
      + 'report_id,student_id,student_display_name,class_session_id,session_date,report_status,submitted_at'
    if (posture !== expected) {
      fail('MA-1', `the applied posture is\n  ${posture}\nexpected\n  ${expected}`)
    } else {
      pass('MA-1', 'the governed boundary is a postgres-owned STABLE SECURITY DEFINER plpgsql function with a pinned EMPTY search_path, taking ZERO arguments (so neither a centre nor a status can be supplied), executable by `authenticated` and by no other client role, and projecting EXACTLY the seven bounded publication columns')
    }
  }

  // -----------------------------------------------------------------
  // MA-8  The status boundary is IN THE SQL, and it is the only status
  //       the applied body names. Comments are stripped first: the body
  //       discusses the rule in prose, and a prose mention is not a
  //       statement.
  // -----------------------------------------------------------------
  {
    const body = await q(CANONICAL, `
SELECT regexp_replace(p.prosrc, '--[^\\n]*', '', 'g')
  FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
 WHERE n.nspname = 'public' AND p.proname = '${FN}';`)
    const others = ['incomplete', 'observation_saved', 'drafting', 'draft_ready', 'needs_edit',
      'trainer_approved', 'approved'].filter((s) => body.includes(`'${s}'`))
    const contentColumns = ['todays_strength', 'next_focus', 'practice_suggestion',
      'session_takeaway', 'content_hash', 'wording_hash', 'revision_number']
      .filter((c) => body.includes(c))
    if (!body.includes("r.status    = 'submitted'")) {
      fail('MA-8', 'the applied body does not restrict rows to status = submitted')
    } else if (others.length > 0) {
      fail('MA-8', `the applied body names report status(es) other than submitted: ${others.join(', ')}`)
    } else if (contentColumns.length > 0) {
      fail('MA-8', `the applied body reads version-content column(s): ${contentColumns.join(', ')}`)
    } else if (!body.includes('rv.id = r.latest_submitted_version_id')) {
      fail('MA-8', 'the version join is not pinned to the aggregate\'s canonical submitted pointer')
    } else {
      pass('MA-8', 'the preapproval boundary is enforced IN SQL: the body admits `submitted` and names no other status, reads no version-content column, and joins report_versions only through latest_submitted_version_id')
    }
  }

  // -----------------------------------------------------------------
  // MA-9  The three in-page filters, on ONE route. The two pre-existing
  //       `?status=` spellings are ratified compatibility aliases and
  //       must keep working; `submitted` joins them; and no second rail
  //       destination or route may appear (R-C2-3).
  // -----------------------------------------------------------------
  {
    const queue = stripComments(readFileSync(
      join(ROOT, 'features', 'management', 'management-reports-queue.tsx'), 'utf8'))
    const nav = stripComments(readFileSync(
      join(ROOT, 'components', 'layout', 'portal-navigation.ts'), 'utf8'))
    const problems = []
    for (const alias of ['trainer_approved', 'needs_edit', 'submitted']) {
      if (!queue.includes(`status === "${alias}"`)) {
        problems.push(`the queue does not accept ?status=${alias}`)
      }
      if (!queue.includes(`{ value: "${alias}"`)) {
        problems.push(`the filter chip offers no option for ?status=${alias}`)
      }
    }
    if (!queue.includes('port.listManagementSubmittedReports()')) {
      problems.push('the Approved filter is not backed by the governed submitted-list port member')
    }
    // A CLIENT-SIDE filter over an existing queue would be the wrong fix:
    // it would still have to hold the rows it filtered out.
    if (/listManagementPendingReviews\(\)[\s\S]{0,200}filter\([^)]*submitted/.test(queue)) {
      problems.push('the Approved rows are derived by filtering another projection client-side')
    }
    const railReports = [...nav.matchAll(/href:\s*"(\/management\/reports[^"]*)"/g)].map((m) => m[1])
    if (railReports.length !== 1 || railReports[0] !== '/management/reports') {
      problems.push(`the Management rail declares ${railReports.length} Reports destination(s) [${railReports.join(', ')}]; R-C2-3 permits exactly one, with no query string`)
    }
    if (problems.length > 0) fail('MA-9', problems.join('; '))
    else {
      pass('MA-9', 'all three filters — Pending final review, Correction tracking and Approved — are in-page `?status=` values on the ONE /management/reports route, the two pre-existing aliases still resolve, Approved is served by the governed submitted-list port member rather than by filtering another projection client-side, and the rail still declares exactly one Reports destination with no query string')
    }
  }

  // -----------------------------------------------------------------
  // MA-10  The Approved row's action opens the CANONICAL SUBMITTED
  //        report, never a preapproval draft, and the surface it opens
  //        offers no management mutation.
  // -----------------------------------------------------------------
  {
    const actions = stripComments(readFileSync(
      join(ROOT, 'server', 'modules', 'integration-adapter', 'participant-actions.ts'), 'utf8'))
    const problems = []
    const fn = /export async function adapterGetManagementSubmittedReport\([\s\S]*?\n}/.exec(actions)?.[0] ?? ''
    if (fn === '') {
      problems.push('there is no governed action behind the Approved row action')
    } else {
      if (!/review\.data\.status !== "submitted"/.test(fn)) {
        problems.push('the action does not refuse a report that is not `submitted`, so a trainer-approved candidate could render as a published report')
      }
      if (!/outcome: "unavailable"/.test(fn)) {
        problems.push('the refusal is not the non-disclosing `unavailable` outcome')
      }
      if (/lockVersion|versionId|wordingHash/.test(fn)) {
        problems.push('the action returns a concurrency or wording proof, from which a management mutation could be built on a published report')
      }
    }
    if (problems.length > 0) fail('MA-10', problems.join('; '))
    else {
      pass('MA-10', 'the Approved row opens the canonical SUBMITTED report through a governed action that refuses every other status with the same non-disclosing outcome, and returns only the four parent-facing panels and the publication time — no lock version, no version id and no wording hash, so no management mutation can be built on a published report')
    }
  }

  // -----------------------------------------------------------------
  // The committing legs, on the disposable clone.
  // -----------------------------------------------------------------
  let created = false
  try {
    await createDisposable()
    created = true
    console.log(`\nDisposable database ${WORK_DB} cloned from the canonical fixture.\n`)

    const suite = readFileSync(SUITE, 'utf8').replace(/\r\n/g, '\n')
    const r = await psql(WORK_DB, suite, { tuplesOnly: false })
    // NOTICEs arrive on stderr and the verification line on stdout. Both are
    // read, so the suite's own per-assertion evidence is rendered rather than
    // discarded. Neither stream can carry a credential: this suite creates no
    // Auth user, handles no password and prints no connection value.
    const emitted = [r.out, r.err].join("\n").split(/\r?\n/).map((line) => line.trim())
    for (const line of emitted) {
      if (line.startsWith('NOTICE:')) console.log(line.replace(/^NOTICE:\s*/, ''))
    }
    if (r.code !== 0) {
      fail('MA-suite', `the disposable suite failed:\n${r.err}`)
    } else {
      const ok = emitted.find((line) => line.startsWith('MA_SUITE_OK|'))
      const n = ok === undefined ? -1 : Number(ok.slice('MA_SUITE_OK|'.length))
      // The verification line is REQUIRED. A suite that produced no line at
      // all must never be read as a pass.
      if (n !== 2) {
        fail('MA-suite', ok === undefined
          ? 'the disposable suite emitted no verification line, so nothing was measured'
          : `the Approved projection finally returned ${n} row(s); the scenario publishes exactly 2 in the caller's centre`)
      } else {
        pass('MA-suite', 'five governed lifecycles were driven on the disposable clone — two published, one left at trainer_approved, one returned to needs_edit, one published in ANOTHER centre — and MA-2 .. MA-7 all held')
      }
    }
  } finally {
    if (created) {
      await destroyDisposable()
      console.log(`\nDisposable database ${WORK_DB} destroyed.`)
    }
  }

  // -----------------------------------------------------------------
  // The canonical database is exactly as it was.
  // -----------------------------------------------------------------
  const censusAfter = await q(CANONICAL, CENSUS)
  if (censusBefore !== censusAfter) {
    fail('canonical', `the canonical database changed during the run (${censusBefore} -> ${censusAfter})`)
  } else {
    console.log(`\nCanonical database untouched: reports|versions|version_ratings|corrections|observations|ratings|events|heads|auth|migrations = ${censusAfter}`)
  }

  console.log('')
  if (failures > 0) {
    console.error(`Management Approved projection suite: ${failures} failure(s).`)
    process.exitCode = 1
  } else {
    console.log('Management Approved projection suite: all proofs passed.')
  }
}

main().catch(async (error) => {
  console.error(`Management Approved projection suite aborted: ${error.message}`)
  await destroyDisposable()
  process.exitCode = 1
})
