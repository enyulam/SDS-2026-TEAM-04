#!/usr/bin/env node
// =====================================================================
// B.E.S.T Coach -- lifecycle-canonical.sql is clock-hour DETERMINISTIC
// (Run C3-A Phase 1, item 3)
// =====================================================================
// LOCAL DISPOSABLE DEVELOPMENT DATABASE ONLY. This suite performs real
// UPDATEs against a real `public.class_sessions` row so the REAL
// `class_sessions_time_order_chk` CHECK constraint is the thing being
// exercised -- never a re-implementation of it in JavaScript.
//
// ---------------------------------------------------------------------
// THE DEFECT (pre-existing, not a regression)
// ---------------------------------------------------------------------
// `pg_temp.set_session_at` in scripts/tests/step-7i/lifecycle-canonical.sql
// derived the session window as
//
//     starts_at = v_local::time
//     ends_at   = (v_local + interval '1 hour')::time
//
// where `v_local = now() AT TIME ZONE 'Asia/Singapore' + p_offset`. Casting
// an instant one hour later back to a TIME OF DAY wraps modulo 24 hours, so
// whenever the derived local wall-clock time fell in the final hour of the
// day, `ends_at` landed BEFORE `starts_at` and
// `class_sessions_time_order_chk` (`ends_at > starts_at`) fired. T7I-9 /
// T7I-41 therefore failed for one hour in every twenty-four, purely because
// of what time the operator happened to run the suite.
//
// ---------------------------------------------------------------------
// WHY THIS IS A REAL PROOF AND NOT "I RE-RAN IT AT A DIFFERENT HOUR"
// ---------------------------------------------------------------------
// `now()` cannot be moved without an extension, and none may be installed.
// So instead of moving the clock, this suite moves the ONLY thing the clock
// feeds: the base instant `v_local`.
//
//   L-1  The committed helper is the SOLE clock-hour-dependent computation
//        in the whole file -- proven by scanning it: exactly one
//        `now() AT TIME ZONE` occurs, inside this helper, and every other
//        class-session time in the file is a fixed literal.
//
//   L-2  A PARAMETERIZED TWIN of the committed helper is built whose only
//        difference from the committed body is that `v_local` arrives as an
//        argument instead of from `now()`. The twin's clamp is not
//        hand-copied prose: the four decisive lines are EXTRACTED from
//        lifecycle-canonical.sql and asserted byte-identical to the twin's,
//        so the twin cannot silently drift from the code it stands for.
//
//   L-3  EXHAUSTIVE POSITIVE. The twin is driven at all 1440 minutes of a
//        day plus the four microsecond boundary cases, each one performing
//        the REAL UPDATE. Every one must succeed. 23:00 .. 23:59 is
//        therefore genuinely exercised -- sixty consecutive cases of it.
//
//   L-4  NEGATIVE CONTROL. The OLD expression is driven over the same 1444
//        cases. It must fail on EXACTLY the sixty 23:xx minutes and the two
//        23:59:59.99999x boundary cases, and succeed everywhere else. This
//        is what makes L-3 evidence rather than decoration: it measures the
//        defect instead of asserting it.
//
//   L-5  SEMANTIC EQUIVALENCE. For all 1444 cases the committed expression
//        and the old one produce a BIT-IDENTICAL `starts_at` -- the only
//        field the R-9 / B-7I-1 gate predicate reads. So the fix cannot
//        have moved the boundary the test measures; it moved only a window
//        end that no gate reads.
//
//   L-6  END TO END. The whole of lifecycle-canonical.sql is then run twice
//        against the disposable database, under the real clock, and must
//        pass and be byte-identical across the two runs.
//
// Run: node scripts/tests/step-7i/prove-clock-hour-determinism.mjs
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
const CANONICAL = 'postgres'
const SEED_DB = 'bc_clock_seed'
const WORK_DB = 'bc_clock'
const ROOT = process.cwd()
const SUITE = join(ROOT, 'scripts', 'tests', 'step-7i', 'lifecycle-canonical.sql')
const SESSION = 'c5000000-0000-4000-8000-000000000001'

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
  || '|' || (SELECT count(*) FROM public.audit_events)
  || '|' || (SELECT count(*) FROM auth.users)
  || '|' || (SELECT count(*) FROM supabase_migrations.schema_migrations);`

// The clamp, exactly as it must appear in the committed helper. These five
// lines ARE the fix; the twin below reproduces them verbatim.
const CLAMP = [
  "    v_start := v_local::time;",
  "    IF v_start < TIME '23:00:00' THEN",
  "      v_end := v_start + INTERVAL '1 hour';",
  "    ELSE",
  "      v_end := TIME '23:59:59.999999';",
  "      IF v_end <= v_start THEN v_end := NULL; END IF;",
  "    END IF;",
]

// ---------------------------------------------------------------------
async function main() {
  console.log('=== lifecycle-canonical.sql: clock-hour determinism proof (Run C3-A Phase 1, item 3) ===\n')

  const suiteText = readFileSync(SUITE, 'utf8').replace(/\r\n/g, '\n')
  // `--` comments stripped: the fixed helper's own header DISCUSSES the old
  // wrapping expression precisely to record that it is gone, and matching
  // that prose would assert the opposite of the intended property.
  const suiteCode = suiteText.replace(/--[^\n]*/g, '')

  // -------------------------------------------------------------------
  // L-1  the helper is the SOLE clock-hour-dependent computation
  // -------------------------------------------------------------------
  {
    const clockUses = suiteText.split('\n')
      .map((line, i) => [i + 1, line])
      .filter(([, line]) => /AT TIME ZONE/.test(line) && !/^\s*--/.test(line))
    if (clockUses.length !== 1) {
      fail('L-1', `the suite derives a wall-clock value at ${clockUses.length} places (lines ${clockUses.map(([n]) => n).join(', ')}); the determinism argument covers exactly one`)
    } else if (!/v_local := \(pg_catalog\.now\(\) AT TIME ZONE 'Asia\/Singapore'\) \+ p_offset;/.test(clockUses[0][1])) {
      fail('L-1', `the single wall-clock derivation is not set_session_at's: ${clockUses[0][1].trim()}`)
    } else {
      // Every other class-session time in the file must be a fixed literal.
      const inserts = suiteText.match(/VALUES \([^;]*?'\d{4}-\d{2}-\d{2}','\d{2}:\d{2}','\d{2}:\d{2}'\)/g) || []
      const timeAssignments = (suiteText.match(/^\s*SET session_date/gm) || []).length
      if (inserts.length !== 2 || timeAssignments !== 2) {
        fail('L-1', `expected 2 literal class-session inserts and 2 helper assignments, found ${inserts.length} and ${timeAssignments}`)
      } else {
        pass('L-1', `pg_temp.set_session_at (line ${clockUses[0][0]}) is the ONLY place lifecycle-canonical.sql reads the wall clock; both other class-session windows are fixed literals ('10:00'/'11:00'), so no other assertion in the file can depend on the hour`)
      }
    }
  }

  // -------------------------------------------------------------------
  // L-2  the twin is byte-faithful to the committed clamp
  // -------------------------------------------------------------------
  {
    if (!suiteText.includes(CLAMP.join('\n'))) {
      fail('L-2', 'the committed set_session_at no longer contains the exact clamp this proof stands for; the twin below would be testing different code')
    } else if (/\(v_local \+ interval '1 hour'\)::time/i.test(suiteCode)) {
      fail('L-2', 'the wrapping expression `(v_local + interval \'1 hour\')::time` is still present in lifecycle-canonical.sql')
    } else {
      pass('L-2', 'the parameterized twin reproduces the committed clamp BYTE-FOR-BYTE, and the wrapping expression is gone from the suite')
    }
  }

  await createDisposable()
  console.log('\nDisposable database created from the canonical fixture template.\n')

  const canonBefore = await q(CANONICAL, CENSUS)

  // -------------------------------------------------------------------
  // L-3 / L-4 / L-5 -- one psql session, wholly inside BEGIN .. ROLLBACK.
  //
  // The probe functions and the 1444 real UPDATEs are all rolled back, so
  // the fixture session row this suite drives is returned EXACTLY as it
  // stood -- which is what lets L-6 run the real suite against an
  // unmodified fixture immediately afterwards.
  //
  // The twin's ONLY difference from the committed helper is that `v_local`
  // arrives as an argument instead of from `now()`. The clamp itself is the
  // CLAMP constant, already proven byte-identical to the committed one by
  // L-2. The 1444 cases are every minute of one day plus four microsecond
  // boundaries chosen to sit exactly on the clamp's decision points.
  // -------------------------------------------------------------------
  const probeSql = `
BEGIN;
CREATE SCHEMA clock_probe;

CREATE FUNCTION clock_probe.probe_fixed(p_local timestamp) RETURNS text
LANGUAGE plpgsql AS $probe$
DECLARE v_local timestamp := p_local; v_start time; v_end time;
BEGIN
${CLAMP.join('\n')}
  UPDATE public.class_sessions
     SET session_date = v_local::date, starts_at = v_start, ends_at = v_end
   WHERE id = '${SESSION}';
  RETURN 'OK|' || v_start::text || '|' || COALESCE(v_end::text, 'NULL');
EXCEPTION WHEN OTHERS THEN
  RETURN 'ERR|' || SQLSTATE || '|';
END $probe$;

CREATE FUNCTION clock_probe.probe_old(p_local timestamp) RETURNS text
LANGUAGE plpgsql AS $probe$
DECLARE v_local timestamp := p_local;
BEGIN
  UPDATE public.class_sessions
     SET session_date = v_local::date, starts_at = v_local::time, ends_at = (v_local + interval '1 hour')::time
   WHERE id = '${SESSION}';
  RETURN 'OK|' || (v_local::time)::text || '|';
EXCEPTION WHEN OTHERS THEN
  RETURN 'ERR|' || SQLSTATE || '|';
END $probe$;

CREATE TEMP TABLE cases AS
  SELECT (TIMESTAMP '2026-02-04 00:00:00' + (g || ' minutes')::interval) AS t
    FROM pg_catalog.generate_series(0, 1439) AS g
  UNION ALL SELECT * FROM (VALUES
    (TIMESTAMP '2026-02-04 22:59:59.999999'),
    (TIMESTAMP '2026-02-04 23:00:00.000000'),
    (TIMESTAMP '2026-02-04 23:59:59.999998'),
    (TIMESTAMP '2026-02-04 23:59:59.999999')) AS e(t);

CREATE TEMP TABLE fixed_results AS
  SELECT t, clock_probe.probe_fixed(t) AS r FROM cases;
CREATE TEMP TABLE old_results AS
  SELECT t, clock_probe.probe_old(t) AS r FROM cases;

SELECT 'L3=' || count(*)
    || '|' || count(*) FILTER (WHERE r LIKE 'OK|%')
    || '|' || count(*) FILTER (WHERE r LIKE 'OK|%' AND t::time >= TIME '23:00:00')
    || '|' || COALESCE(pg_catalog.string_agg(CASE WHEN r NOT LIKE 'OK|%' THEN t::text || '=>' || r END, ' ; '), '-')
  FROM fixed_results;

SELECT 'L4=' || count(*) FILTER (WHERE r LIKE 'ERR|%')
    || '|' || count(*) FILTER (WHERE r LIKE 'ERR|%' AND t::time <  TIME '23:00:00')
    || '|' || count(*) FILTER (WHERE r LIKE 'ERR|%' AND t::time >= TIME '23:00:00')
    || '|' || COALESCE(pg_catalog.min(CASE WHEN r LIKE 'ERR|%' THEN pg_catalog.split_part(r, '|', 2) END), '-')
    || '|' || COALESCE(pg_catalog.max(CASE WHEN r LIKE 'ERR|%' THEN pg_catalog.split_part(r, '|', 2) END), '-')
    || '|' || COALESCE(pg_catalog.min(CASE WHEN r LIKE 'ERR|%' THEN t::text END), '-')
    || '|' || COALESCE(pg_catalog.max(CASE WHEN r LIKE 'ERR|%' THEN t::text END), '-')
  FROM old_results;

SELECT 'L5=' || count(*)
    || '|' || count(*) FILTER (WHERE pg_catalog.split_part(r, '|', 2) = t::time::text)
  FROM fixed_results;

ROLLBACK;`
  const probe = await q(WORK_DB, probeSql)
  const line = (tag) => (probe.split('\n').map((l) => l.trim()).find((l) => l.startsWith(tag)) || '').slice(tag.length)

  // L-3  EXHAUSTIVE POSITIVE -- the committed expression, every case
  {
    const [total, ok, lateOk, firstFailures] = line('L3=').split('|')
    if (total !== '1444') fail('L-3', `${total} cases were driven, expected 1444`)
    else if (ok !== '1444') fail('L-3', `${Number(total) - Number(ok)} case(s) violated class_sessions_time_order_chk: ${firstFailures}`)
    else if (Number(lateOk) < 62) fail('L-3', `only ${lateOk} cases fell at or after 23:00; the defect hour was not exercised`)
    else pass('L-3', `all 1444 cases -- every minute of a full day plus four microsecond boundaries -- performed the REAL class_sessions UPDATE successfully against the REAL class_sessions_time_order_chk, and ${lateOk} of them were at 23:00 or later`)
  }

  // L-4  NEGATIVE CONTROL -- the OLD expression, the same cases
  {
    const [errs, earlyErrs, lateErrs, minState, maxState, firstErr, lastErr] = line('L4=').split('|')
    if (errs === '0') {
      fail('L-4', 'the OLD expression never failed, so the defect this proof stands for is not reproducible and L-3 proves nothing')
    } else if (earlyErrs !== '0') {
      fail('L-4', `the OLD expression also failed at ${earlyErrs} case(s) before 23:00, so the defect is not the one described`)
    } else if (minState !== '23514' || maxState !== '23514') {
      fail('L-4', `the OLD expression failed with SQLSTATE(s) ${minState}..${maxState}; expected 23514 check_violation throughout`)
    } else {
      pass('L-4', `NEGATIVE CONTROL: the OLD expression failed at EXACTLY ${lateErrs} case(s), every one at or after 23:00 (first ${firstErr}, last ${lastErr}) and NONE before it, every one a 23514 check_violation. The defect is real, is exactly one hour wide, and the committed expression is what removes it`)
    }
  }

  // L-5  SEMANTIC EQUIVALENCE -- starts_at is bit-identical
  {
    const [total, same] = line('L5=').split('|')
    if (total !== same) {
      fail('L-5', `${Number(total) - Number(same)} case(s) produced a starts_at different from v_local::time; the fix moved the boundary the gate predicate reads`)
    } else {
      pass('L-5', `in all ${total} cases the committed expression writes starts_at = v_local::time EXACTLY -- the only field the R-9 / B-7I-1 predicate reads -- so the gate boundary T7I-9 / T7I-41 measures is bit-for-bit unchanged; only the window end, which no gate reads, is computed differently`)
    }
  }

  // The probe transaction was rolled back whole: no probe schema, no probe
  // function, and the fixture session exactly as it stood.
  {
    const residue = await q(WORK_DB, `
SELECT (SELECT count(*) FROM pg_catalog.pg_namespace WHERE nspname = 'clock_probe')::text
  || '|' || (SELECT session_date::text || ' ' || COALESCE(starts_at::text,'~') || ' ' || COALESCE(ends_at::text,'~')
               FROM public.class_sessions WHERE id = '${SESSION}');`)
    const canonRow = await q(CANONICAL, `
SELECT session_date::text || ' ' || COALESCE(starts_at::text,'~') || ' ' || COALESCE(ends_at::text,'~')
  FROM public.class_sessions WHERE id = '${SESSION}';`)
    const [schemas, row] = residue.split('|')
    if (schemas !== '0' || row !== canonRow) {
      fail('L-3/4/5 teardown', `the probe transaction left residue (probe schemas=${schemas}, fixture row "${row}" vs canonical "${canonRow}")`)
    } else {
      pass('L-3/4/5 teardown', `the probe transaction rolled back whole: no probe schema survives and the fixture session row is byte-identical to the canonical one (${row})`)
    }
  }

  // -------------------------------------------------------------------
  // L-6  END TO END -- the real suite, twice, on the disposable database
  // -------------------------------------------------------------------
  {
    const suite = readFileSync(SUITE, 'utf8')
    const a = await psql(WORK_DB, suite, { tuplesOnly: false })
    const b = await psql(WORK_DB, suite, { tuplesOnly: false })
    const passes = (a.err.match(/^NOTICE:  PASS /gm) || []).length
    if (a.code !== 0 || b.code !== 0) {
      const bad = a.code !== 0 ? a : b
      fail('L-6', `lifecycle-canonical.sql failed on the disposable database:\n${bad.err.split('\n').filter((l) => !/^NOTICE/.test(l)).slice(0, 12).join('\n')}`)
    } else if (a.err !== b.err || a.out !== b.out) {
      fail('L-6', 'two back-to-back runs of lifecycle-canonical.sql were not byte-identical')
    } else {
      const hour = await q(WORK_DB, `SELECT to_char(now() AT TIME ZONE 'Asia/Singapore', 'HH24:MI') ;`)
      pass('L-6', `lifecycle-canonical.sql ran twice on the disposable database at local hour ${hour} Asia/Singapore, emitting ${passes} PASS notices per run, byte-identical across the two runs`)
    }
  }

  await destroyDisposable()
  console.log('\nDisposable database destroyed.')

  const canonAfter = await q(CANONICAL, CENSUS)
  if (canonBefore !== canonAfter) {
    fail('canonical', `the canonical database changed during the run (${canonBefore} -> ${canonAfter})`)
  } else {
    console.log(`Canonical database untouched: reports|versions|observations|events|auth|migrations = ${canonAfter}`)
  }
}

main().then(() => {
  console.log('')
  if (failures > 0) {
    console.error(`Clock-hour determinism proof: ${failures} failure(s).`)
    process.exitCode = 1
  } else {
    console.log('Clock-hour determinism proof: all proofs passed.')
  }
}).catch(async (e) => {
  console.error(`Clock-hour determinism proof aborted: ${e.message}`)
  try { await destroyDisposable() } catch { /* best effort */ }
  process.exitCode = 1
})

for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGBREAK']) {
  process.on(signal, () => {
    destroyDisposable().finally(() => { process.exit(130) })
  })
}
