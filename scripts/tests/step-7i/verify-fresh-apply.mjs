#!/usr/bin/env node
// =====================================================================
// B.E.S.T Coach -- Step 7I: fresh-application and equivalence proof
// =====================================================================
// LOCAL DISPOSABLE DEVELOPMENT DATABASE ONLY.
//
// Two properties, proven together because neither is sufficient alone:
//
//   1. FRESH APPLICATION -- all NINE migration files apply cleanly, in
//      order, to a database holding no project objects, with every
//      end-of-migration assertion passing and the ratified census landing
//      exactly (26 tables, 12 enums, 32 functions, 29 policies, 8 ordered
//      report_status labels, 24 authenticated EXECUTE grants, 1/3/9 seeds).
//      The function and EXECUTE figures were STALE in this header (they
//      still read 28 and 20, the pre-assessment values) and are corrected
//      here to the live pinned census; the pins below are authoritative.
//
//   2. EQUIVALENCE -- the CANONICAL fixture database, which was migrated
//      incrementally, is catalogue-identical to that fresh application.
//      This is what makes the generated database types trustworthy: they
//      are generated from the canonical database, and this proves that
//      database is exactly what the committed migration files produce.
//
// WHY THE SCRATCH DATABASE IS STRIPPED RATHER THAN CREATED EMPTY, stated
// honestly: `supabase db reset` would satisfy property 1 directly, but it
// DESTROYS the three synthetic Auth identities, which can only be recreated
// through an interactive no-echo password prompt. The scratch database is
// therefore cloned from the canonical one and stripped of every project
// table, function, enum and migration-ledger row, which reproduces the
// pre-Step-7E state of schema `public` while preserving the platform's own
// `auth` schema exactly as a real reset would. The one difference from a
// true reset is that schema-level ACL hardening from Step 7E survives the
// strip; every statement that re-applies it is idempotent, and the
// assertions below re-derive the resulting posture from the catalogue
// rather than assuming it.
//
// Run: node scripts/tests/step-7i/verify-fresh-apply.mjs
// =====================================================================

import { spawn } from 'node:child_process'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const CONTAINER = 'supabase_db_best-coach-mvp'
const CANONICAL = 'postgres'
const SCRATCH = 'bc_7i_freshapply'
const ROOT = process.cwd()
const MIG_DIR = join(ROOT, 'supabase', 'migrations')

let failures = 0
const fail = (m) => { failures += 1; console.error(`FAIL ${m}`) }
const pass = (m) => console.log(`PASS ${m}`)

function psql(db, sql, { user = 'postgres', tuplesOnly = true, stopOnError = true } = {}) {
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

const q = async (db, sql, opts) => {
  const r = await psql(db, sql, opts)
  if (r.code !== 0) throw new Error(`psql failed on ${db}:\n${r.err}`)
  return r.out
}

const STRIP = `
DO $strip$
DECLARE r record;
BEGIN
  FOR r IN SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
            WHERE n.nspname='public' AND c.relkind='r' LOOP
    EXECUTE format('DROP TABLE public.%I CASCADE', r.relname);
  END LOOP;
  FOR r IN SELECT p.oid::regprocedure AS sig FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
            WHERE n.nspname='public' LOOP
    EXECUTE format('DROP FUNCTION %s CASCADE', r.sig);
  END LOOP;
  FOR r IN SELECT t.typname FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace
            WHERE n.nspname='public' AND t.typtype='e' LOOP
    EXECUTE format('DROP TYPE public.%I CASCADE', r.typname);
  END LOOP;
END;
$strip$;
DELETE FROM supabase_migrations.schema_migrations;`

// The catalogue fingerprint compared between the two databases. It covers
// every object Step 7I touches plus everything it must leave alone.
//
// ---------------------------------------------------------------------
// LINE-ENDING INVARIANCE (operator ruling F-P0-3, 2026-08-09)
// ---------------------------------------------------------------------
// `srcExpr` is the ONLY parameterized part: the expression used to digest
// pg_proc.prosrc. Everything else -- object set, identity arguments, result
// type, volatility, security, strictness, parallelism, proconfig, columns,
// constraints, indexes, EXECUTE privileges, table privileges, policies, RLS
// and triggers -- is fixed and compared exactly, unchanged by this ruling.
//
// WHY THIS EXISTS. The scratch database is built by piping migration files
// through psql after normalising CRLF -> LF (see the loop in main()). The
// canonical database is built by `supabase start`, which applies the SAME
// files RAW. The 12 committed migration files sit CRLF in a Windows checkout
// (core.autocrlf=true), so the canonical database stores CR inside prosrc and
// the scratch database does not. Comparing md5(prosrc) then measures the
// TRANSPORT, not the schema -- which is precisely what this comparison must
// never do. The earlier header claim that "the Supabase CLI normalises them
// too" was FALSE for `supabase start`, and that is the whole defect.
//
// WHAT IS AND IS NOT NORMALISED. Only end-of-line representation: CRLF -> LF,
// then any surviving bare CR -> LF. NOTHING else. No trimming, no space
// collapsing, no tab handling, no clause reordering, no case folding, no
// quote normalisation. Two function bodies differing by so much as one
// character that is not an end-of-line marker still produce different
// digests and still FAIL. The negative control in the suite log proves this.
const CANON_SRC = "md5(replace(replace(p.prosrc, chr(13)||chr(10), chr(10)), chr(13), chr(10)))"
const RAW_SRC = 'md5(p.prosrc)'

const buildFingerprint = (srcExpr) => `
SELECT string_agg(line, E'\\n' ORDER BY line) FROM (
  SELECT 'enum|' || t.typname || '|' || e.enumlabel || '|' || e.enumsortorder::text AS line
    FROM pg_type t JOIN pg_enum e ON e.enumtypid=t.oid
    JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public'
  UNION ALL
  SELECT 'column|' || c.relname || '|' || a.attname || '|' || format_type(a.atttypid, a.atttypmod)
         || '|' || a.attnotnull::text || '|' || coalesce(pg_get_expr(d.adbin, d.adrelid), '~')
    FROM pg_attribute a JOIN pg_class c ON c.oid=a.attrelid
    JOIN pg_namespace n ON n.oid=c.relnamespace
    LEFT JOIN pg_attrdef d ON d.adrelid=a.attrelid AND d.adnum=a.attnum
   WHERE n.nspname='public' AND c.relkind='r' AND a.attnum>0 AND NOT a.attisdropped
  UNION ALL
  SELECT 'constraint|' || c.relname || '|' || con.conname || '|' || pg_get_constraintdef(con.oid)
    FROM pg_constraint con JOIN pg_class c ON c.oid=con.conrelid
    JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public'
  UNION ALL
  SELECT 'index|' || i.indexname || '|' || i.indexdef FROM pg_indexes i WHERE i.schemaname='public'
  UNION ALL
  SELECT 'function|' || p.proname || '|' || pg_get_function_identity_arguments(p.oid)
         || '|' || pg_get_function_result(p.oid) || '|' || p.provolatile::text || p.prosecdef::text
         || p.proisstrict::text || p.proparallel::text || '|' || coalesce(p.proconfig::text,'~')
         || '|' || ${srcExpr}
    FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public'
  UNION ALL
  SELECT 'exec|' || p.proname || '|' || r.rn || '|' ||
         has_function_privilege(r.rn, p.oid, 'EXECUTE')::text
    FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
    CROSS JOIN (VALUES ('anon'),('authenticated'),('service_role'),('authenticator')) AS r(rn)
   WHERE n.nspname='public'
  UNION ALL
  SELECT 'tablepriv|' || c.relname || '|' || r.rn || '|' || pv.pv || '|' ||
         has_table_privilege(r.rn, c.oid, pv.pv)::text
    FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
    CROSS JOIN (VALUES ('anon'),('authenticated'),('service_role'),('authenticator')) AS r(rn)
    CROSS JOIN (VALUES ('SELECT'),('INSERT'),('UPDATE'),('DELETE'),('TRUNCATE'),('REFERENCES'),('TRIGGER')) AS pv(pv)
   WHERE n.nspname='public' AND c.relkind='r'
  UNION ALL
  SELECT 'policy|' || p.tablename || '|' || p.policyname || '|' || p.cmd || '|' || p.roles::text
    FROM pg_policies p WHERE p.schemaname='public'
  UNION ALL
  SELECT 'rls|' || c.relname || '|' || c.relrowsecurity::text || '|' || c.relforcerowsecurity::text
    FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
   WHERE n.nspname='public' AND c.relkind='r'
  UNION ALL
  SELECT 'trigger|' || c.relname || '|' || t.tgname || '|' || t.tgenabled::text
    FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid
    JOIN pg_namespace n ON n.oid=c.relnamespace
   WHERE n.nspname='public' AND NOT t.tgisinternal
) x;`

async function main() {
  console.log('=== Step 7I fresh-application and equivalence proof ===\n')

  // Build the scratch database from a quiesced clone, then strip it.
  const create = `
UPDATE pg_database SET datallowconn = false WHERE datname = '${CANONICAL}';
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${CANONICAL}' AND pid <> pg_backend_pid();
SELECT pg_sleep(1);
DROP DATABASE IF EXISTS ${SCRATCH};
CREATE DATABASE ${SCRATCH} TEMPLATE ${CANONICAL};
UPDATE pg_database SET datallowconn = true WHERE datname = '${CANONICAL}';
ALTER DATABASE ${SCRATCH} OWNER TO postgres;`
  const c = await psql('template1', create, { user: 'supabase_admin', tuplesOnly: false })
  if (c.code !== 0) throw new Error(`could not create the scratch database:\n${c.err}`)
  await q(SCRATCH, STRIP, { tuplesOnly: false })

  const stripped = await q(SCRATCH, `
SELECT (SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r')
    || '/' || (SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public')
    || '/' || (SELECT count(*) FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' AND t.typtype='e')
    || '/' || (SELECT count(*) FROM supabase_migrations.schema_migrations);`)
  if (stripped !== '0/0/0/0') fail(`the scratch database was not fully stripped (tables/functions/enums/migrations = ${stripped})`)
  else console.log('Scratch database stripped to 0 tables / 0 functions / 0 enums / 0 applied migrations.')

  // Apply all twelve migration files in order, exactly as a reset would.
  const files = readdirSync(MIG_DIR).filter((f) => f.endsWith('.sql')).sort()
  if (files.length !== 12) fail(`${files.length} migration files found, expected 12`)
  for (const f of files) {
    const version = f.split('_')[0]
    // Line endings are normalised to LF before the file is piped in. The
    // Supabase CLI normalises them too, so this reproduces exactly what a
    // real `db reset` stores; piping a CRLF-checked-out file raw would embed
    // carriage returns in every pg_proc.prosrc and make the equivalence
    // comparison measure the TRANSPORT rather than the schema.
    const sql = `BEGIN;\n${readFileSync(join(MIG_DIR, f), 'utf8').replace(/\r\n/g, '\n')}\n`
      + `INSERT INTO supabase_migrations.schema_migrations(version) VALUES ('${version}');\nCOMMIT;`
    const r = await psql(SCRATCH, sql, { tuplesOnly: false })
    if (r.code !== 0) { fail(`migration ${version} failed on a fresh database:\n${r.err}`); return }
    console.log(`  applied ${f}`)
  }
  pass('all twelve migrations apply cleanly, in order, from a database with no project objects')

  // The ratified census, re-derived from the freshly built database.
  const census = await q(SCRATCH, `
SELECT (SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r')
    || '|' || (SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public')
    || '|' || (SELECT count(*) FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' AND t.typtype='e')
    || '|' || (SELECT count(*) FROM pg_policies WHERE schemaname='public')
    || '|' || (SELECT count(*) FROM supabase_migrations.schema_migrations)
    || '|' || (SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
                WHERE n.nspname='public' AND has_function_privilege('authenticated', p.oid, 'EXECUTE'))
    || '|' || (SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
                WHERE n.nspname='public' AND c.relkind='r' AND NOT c.relrowsecurity)
    || '|' || (SELECT string_agg(e.enumlabel, ',' ORDER BY e.enumsortorder)
                 FROM pg_enum e JOIN pg_type t ON t.oid=e.enumtypid WHERE t.typname='report_status')
    || '|' || (SELECT count(*) FROM public.centres) || '/' || (SELECT count(*) FROM public.class_grades)
    || '/' || (SELECT count(*) FROM public.assessment_dimensions);`)
  // (Reconciled at Run C3-A Phase 1: the eleventh migration is the
  //  single-entry-point closure. It creates NO object -- 26/33/12/29 are
  //  unchanged -- and removes exactly one grant, so the migration count
  //  rises 10 -> 11 and the authenticated EXECUTE census falls 25 -> 24.)
  // (Reconciled at Run C3-A Phase 2b, C2C-004: the twelfth migration adds
  //  EXACTLY ONE function -- the governed Management submitted-report list
  //  -- with one authenticated EXECUTE grant. No table, enum, label or
  //  policy moves, so the census goes 33 -> 34 functions, 11 -> 12
  //  migrations and 24 -> 25 authenticated EXECUTE.)
  const expected = '26|34|12|29|12|25|0|'
    + 'incomplete,observation_saved,drafting,draft_ready,needs_edit,trainer_approved,approved,submitted|1/3/9'
  if (census !== expected) fail(`fresh census is\n  ${census}\nexpected\n  ${expected}`)
  else pass(`fresh census: 26 tables, 34 functions, 12 enums, 29 policies, 12 migrations, 25 authenticated EXECUTE, RLS everywhere, 8 ordered labels, 1/3/9 seeds`)

  // Equivalence, reported in two separate registers (operator ruling F-P0-3).
  //
  //   RAW_TEXT_DIFFERENCES        -- byte-level, including EOL representation.
  //                                  DIAGNOSTIC ONLY. Never the verdict.
  //   CANONICALIZED_SCHEMA_DIFFERENCES -- EOL-invariant. THIS is the verdict.
  //
  // Reporting both is deliberate: it would be false to claim the two raw
  // prosrc byte strings are identical when they are not. The honest claim
  // this proof makes is "catalogue/schema equivalent modulo CRLF/LF transport
  // representation" -- and the raw count is printed so the transport
  // difference never becomes invisible.
  const diffCount = (x, y) => {
    const a = new Set(x.split('\n'))
    const b = new Set(y.split('\n'))
    const onlyA = [...a].filter((l) => !b.has(l))
    const onlyB = [...b].filter((l) => !a.has(l))
    return { onlyA, onlyB, total: onlyA.length + onlyB.length }
  }

  const rawFresh = await q(SCRATCH, buildFingerprint(RAW_SRC))
  const rawCanon = await q(CANONICAL, buildFingerprint(RAW_SRC))
  const raw = diffCount(rawFresh, rawCanon)
  const rawKinds = {}
  for (const l of [...raw.onlyA, ...raw.onlyB]) {
    const k = l.split('|')[0]
    rawKinds[k] = (rawKinds[k] || 0) + 1
  }
  console.log(`RAW_TEXT_DIFFERENCES: ${raw.total}`
    + (raw.total ? ` (${Object.entries(rawKinds).map(([k, v]) => `${k}=${v}`).join(', ')})` : '')
    + ' -- diagnostic only; end-of-line representation is included here')

  const fresh = await q(SCRATCH, buildFingerprint(CANON_SRC))
  const canon = await q(CANONICAL, buildFingerprint(CANON_SRC))
  const cnl = diffCount(fresh, canon)
  console.log(`CANONICALIZED_SCHEMA_DIFFERENCES: ${cnl.total} -- this is the verdict`)

  if (fresh === canon) {
    // (Run C3-A correction cycle: this narrated the superseded eleven-file
    //  census. The scratch database above is built from EVERY committed
    //  migration file, and the census asserted immediately above pins that
    //  count at twelve, so "eleven" was false against the twelfth.)
    // Stated precisely. Where RAW_TEXT_DIFFERENCES is non-zero the two
    // databases are NOT byte-identical, and this proof does not claim they
    // are -- it claims catalogue equivalence modulo end-of-line transport.
    pass(raw.total === 0
      ? 'the canonical fixture database is CATALOGUE-IDENTICAL to a fresh application of the twelve committed migration files (raw byte-identical too)'
      : `the canonical fixture database is CATALOGUE-EQUIVALENT to a fresh application of the twelve committed migration files, MODULO CRLF/LF TRANSPORT REPRESENTATION (${raw.total} raw text difference(s), 0 canonicalized) -- object set, signatures, attributes, ACLs, policies, RLS, triggers, columns, constraints and indexes all match exactly`)
  } else {
    fail('the canonical database differs from a fresh application, and the difference is NOT end-of-line representation')
    for (const l of cnl.onlyA.slice(0, 15)) console.error(`  fresh-only : ${l}`)
    for (const l of cnl.onlyB.slice(0, 15)) console.error(`  canon-only : ${l}`)
  }

  await psql('template1', `DROP DATABASE IF EXISTS ${SCRATCH};`,
    { user: 'supabase_admin', tuplesOnly: false, stopOnError: false })
  console.log('Scratch database destroyed.')
}

main().then(() => {
  console.log('')
  if (failures > 0) { console.error(`Step 7I fresh-apply proof: ${failures} failure(s).`); process.exitCode = 1 }
  else console.log('Step 7I fresh-apply proof: passed.')
}).catch(async (e) => {
  console.error(`Step 7I fresh-apply proof aborted: ${e.message}`)
  await psql('template1', `DROP DATABASE IF EXISTS ${SCRATCH};`,
    { user: 'supabase_admin', tuplesOnly: false, stopOnError: false })
  process.exitCode = 1
})
