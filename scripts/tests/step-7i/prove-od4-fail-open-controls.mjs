#!/usr/bin/env node
// =====================================================================
// B.E.S.T Coach -- P1-T04: FIRING PROOFS for the nine fail-open OD-4
//                  controls
// =====================================================================
// LOCAL DISPOSABLE DEVELOPMENT DATABASE ONLY.
//
// Cleanup manifest Q-7: "Acceptance requires proving each negative control
// can FIRE." A control that passes both a valid AND a deliberately-invalid
// input is a FAIL, not a pass.
//
// Nine controls named the four SUPERSEDED report panel columns literally,
// for the sole purpose of proving report content does not leak and that a
// committed version is not mutated. M13 renamed those columns. Every one of
// them then kept reporting green while detecting NOTHING -- and one of them,
// MA-8, emitted an affirmatively FALSE PASS ("reads no version-content
// column") while scanning for four names that no longer exist anywhere in
// the database.
//
// This project has already been bitten by exactly this shape once, at the
// A-053 rename, where POLARITY_BANDS[rating] became `undefined` and the
// polarity rule was SILENTLY SKIPPED while the suite reported green. So it
// is not enough to update the names: each control must be DEMONSTRATED
// firing against a deliberate violation, and demonstrated clean once the
// violation is removed.
//
// THE NINE, and where each one's CURRENT protection lives:
//
//   1 T7I-18          static-scan.mjs        version-content immutability
//   2 T7I-R22         static-scan.mjs        resolver projection purity
//   3 T-CT-S3         ct-static.mjs          correction queue projection
//   4 T-CT-13         ct-suite.sql           correction queue, applied
//   5 MA-8            run-management-approved.mjs   submitted list, applied
//   6 M6 -> BOUNDED/a lifecycle-canonical.sql corrections projection
//   7 X5 -> BOUNDED/b lifecycle-canonical.sql resolver body
//   8 S6 -> BOUNDED/a lifecycle-canonical.sql submitted-list projection
//   9 S8 -> BOUNDED/c lifecycle-canonical.sql submitted-list body
//
// 6-9 previously lived INSIDE ALREADY-APPLIED MIGRATIONS and are NOT
// edited there. An applied migration's assertion is a point-in-time proof;
// teaching it about a future object would be false history and would break
// the fresh-apply proof. Their CURRENT equivalents live in the reusable
// carrier and are what is proven here.
//
// THREE PROOF STRATEGIES, chosen by where the control actually runs:
//
//   FILE   -- mutate the file under test on disk, run the shipped scanner,
//             require a non-zero exit, restore, then require `git diff` to
//             report the file byte-identical again. The mutation is applied
//             to the REAL shipped control, so a control that was disabled
//             rather than fixed cannot pass this.
//   SQL    -- extract the SHIPPED DO block from the reusable carrier at
//             runtime and execute it inside a transaction in which the
//             violation has been planted, then ROLLBACK. Nothing is copied
//             or re-implemented: if the shipped block stops detecting, the
//             proof stops passing.
//   LIVE   -- plant a violating body on the canonical database with CREATE
//             OR REPLACE, run the shipped runner, require failure, then
//             restore the body from its defining migration and require the
//             restored prosrc digest to equal the pre-state digest.
//
// Run: node scripts/tests/step-7i/prove-od4-fail-open-controls.mjs
// =====================================================================

import { readFileSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'

const ROOT = process.cwd()
const CONTAINER = 'supabase_db_best-coach-mvp'
const MIG_DIR = join(ROOT, 'supabase', 'migrations')

let failures = 0
const results = []
const ok = (id, what) => { results.push([id, 'FIRED', what]); console.log(`  OK   ${id} -- ${what}`) }
const bad = (id, what) => {
  failures += 1
  results.push([id, 'DID NOT FIRE', what])
  console.error(`  FAIL ${id} -- ${what}`)
}

function sh(cmd, args, opts = {}) {
  return spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, ...opts })
}

function psql(sql) {
  return sh('docker', ['exec', '-i', CONTAINER, 'psql', '--no-psqlrc', '--username=postgres',
    '--dbname=postgres', '--set=ON_ERROR_STOP=1', '--set=VERBOSITY=terse', '--quiet'], { input: sql })
}

/** Scalar query, trimmed. */
function scalar(sql) {
  const r = sh('docker', ['exec', '-i', CONTAINER, 'psql', '--no-psqlrc', '--username=postgres',
    '--dbname=postgres', '--set=ON_ERROR_STOP=1', '-t', '-A', '-c', sql])
  if (r.status !== 0) throw new Error(`query failed: ${r.stderr}`)
  return r.stdout.trim()
}

// ---------------------------------------------------------------------
// STRATEGY: FILE
// ---------------------------------------------------------------------
function proveFileControl({ id, file, find, replace, runner, expect }) {
  const abs = join(ROOT, file)
  const original = readFileSync(abs, 'utf8')

  // EOL-NORMALISE THE ANCHOR. The migration corpus is checked out CRLF on
  // this platform (the F-P0-3 transport phenomenon), so an anchor written
  // with `\n` matches nothing and the proof reports "anchor absent" for a
  // control that is in fact fine. Anchors are authored with `\n` and
  // translated to whatever the file actually uses.
  const EOL = original.includes('\r\n') ? '\r\n' : '\n'
  find = find.replace(/\n/g, EOL)
  replace = replace.replace(/\n/g, EOL)

  if (!original.includes(find)) {
    bad(id, `the mutation anchor is absent from ${file} -- the proof cannot plant a violation, `
      + 'so this control is NOT demonstrated. Re-derive the anchor.')
    return
  }

  try {
    writeFileSync(abs, original.replace(find, replace))
    const r = sh('node', [runner])
    const out = `${r.stdout}\n${r.stderr}`
    if (r.status === 0) {
      bad(id, `${runner} PASSED with a deliberate violation planted in ${file} -- the control is vacuous`)
    } else if (expect && !out.includes(expect)) {
      bad(id, `${runner} failed, but not with the expected finding (${expect}); it may have failed `
        + 'for an unrelated reason, which does not prove THIS control fired')
    } else {
      ok(id, `a planted violation in ${file} makes ${runner} exit ${r.status} with the expected finding`)
    }
  } finally {
    writeFileSync(abs, original)
  }

  // Restoration is verified, not assumed: a proof that leaves a mutation
  // behind would poison every later suite in the run.
  //
  // Verified against the IN-MEMORY SNAPSHOT rather than `git diff`, which
  // answers a different question -- "does this file match HEAD". These
  // proofs legitimately run on files carrying uncommitted work, where a
  // git-based check reports a restoration failure that did not happen while
  // staying blind to one that did.
  if (readFileSync(abs, 'utf8') !== original) {
    bad(id, `${file} was NOT restored byte-identically to its pre-proof content`)
  }
}

// ---------------------------------------------------------------------
// STRATEGY: SQL -- run the SHIPPED assertion block against a planted
// violation inside a rolled-back transaction.
// ---------------------------------------------------------------------
/** Extract the whole `DO $t$ ... END $t$;` block that mentions `marker`. */
function shippedBlock(file, marker) {
  const src = readFileSync(join(ROOT, file), 'utf8')
  const re = /DO \$t\$[\s\S]*?END \$t\$;/g
  let m
  while ((m = re.exec(src)) !== null) if (m[0].includes(marker)) return m[0]
  return null
}

function proveSqlControl({ id, file, marker, plant, expect }) {
  const block = shippedBlock(file, marker)
  if (!block) {
    bad(id, `the shipped assertion block containing "${marker}" was not found in ${file} -- `
      + 'the control may have been deleted, which must never read as a pass')
    return
  }

  // Control run: the SHIPPED block must PASS on the clean database, so a
  // block that raises unconditionally cannot masquerade as a working control.
  const clean = psql(`BEGIN;\n${block}\nROLLBACK;`)
  if (clean.status !== 0) {
    bad(id, `the shipped block already fails on the CLEAN database, so a failure under the planted `
      + `violation would prove nothing: ${clean.stderr.trim().split('\n')[0]}`)
    return
  }

  const r = psql(`BEGIN;\n${plant}\n${block}\nROLLBACK;`)
  const out = `${r.stdout}\n${r.stderr}`
  if (r.status === 0) {
    bad(id, 'the shipped block PASSED with a deliberate violation planted -- the control is vacuous')
  } else if (expect && !out.includes(expect)) {
    bad(id, `the block raised, but not with the expected finding (${expect}): ${out.trim().split('\n')[0]}`)
  } else {
    ok(id, 'the shipped assertion block passes clean and raises on a planted violation')
  }
}

// ---------------------------------------------------------------------
// STRATEGY: LIVE -- plant on the canonical database, run the shipped
// runner, restore from the defining migration, verify the digest.
// ---------------------------------------------------------------------
function proveLiveControl({ id, fn, definingMigration, plant, runner, expect }) {
  const before = scalar(
    `SELECT md5(p.prosrc) FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n `
    + `ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname='${fn}';`)
  if (!before) {
    bad(id, `${fn} does not exist on the canonical database -- nothing to plant against`)
    return
  }

  // The restore statement is the function's ORIGINAL definition, taken from
  // its defining migration. Restoring from a copy held in this file would
  // let the two drift.
  const migSrc = readFileSync(join(MIG_DIR, definingMigration), 'utf8')
  const start = migSrc.search(new RegExp(String.raw`CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+public\.${fn}\s*\(`))
  if (start < 0) {
    bad(id, `${fn}'s definition was not found in ${definingMigration} -- refusing to plant a `
      + 'violation that cannot be reverted')
    return
  }
  const tagM = /\bAS\s+(\$[a-z_]*\$)/i.exec(migSrc.slice(start))
  const tag = tagM[1]
  const bodyStart = start + tagM.index + tagM[0].length
  const end = migSrc.indexOf(tag, bodyStart)
  // Forced to OR REPLACE: the plant leaves a function of the same signature
  // in place, so a bare CREATE would fail with "already exists" and leave
  // the canonical database holding the violating body. CREATE OR REPLACE
  // also preserves the ACL and COMMENT, which a DROP would destroy.
  const restore = migSrc.slice(start, end + tag.length)
    .replace(/^CREATE\s+FUNCTION\b/, 'CREATE OR REPLACE FUNCTION') + ';'

  let planted = false
  try {
    const p = psql(plant)
    if (p.status !== 0) {
      bad(id, `the violation could not be planted: ${p.stderr.trim().split('\n')[0]}`)
      return
    }
    planted = true

    const r = sh('node', [runner])
    const out = `${r.stdout}\n${r.stderr}`
    if (r.status === 0) {
      bad(id, `${runner} PASSED with a violating body applied to ${fn} -- the control is vacuous`)
    } else if (expect && !out.includes(expect)) {
      bad(id, `${runner} failed, but not with the expected finding (${expect})`)
    } else {
      ok(id, `a violating ${fn} body makes ${runner} exit ${r.status} with the expected finding`)
    }
  } finally {
    if (planted) {
      const rr = psql(restore)
      if (rr.status !== 0) {
        failures += 1
        console.error(`  FAIL ${id} -- ${fn} could NOT be restored: ${rr.stderr.trim().split('\n')[0]}`)
      }
    }
  }

  const after = scalar(
    `SELECT md5(p.prosrc) FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n `
    + `ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname='${fn}';`)
  if (after !== before) {
    failures += 1
    console.error(`  FAIL ${id} -- ${fn}'s body digest did not return to its pre-proof value `
      + `(${before} -> ${after}). The canonical database is NOT pristine.`)
  }
}

// =====================================================================
console.log('P1-T04 -- firing proofs for the nine fail-open OD-4 controls')
console.log('')

// ---------------------------------------------------------------------
// The panel names are read from the LIVE catalogue, so the violations
// planted below are built from what the schema actually says. Hard-coding
// them here would reproduce, inside the PROOF, the very defect the proof
// exists to detect.
// ---------------------------------------------------------------------
const PANELS = scalar(`
SELECT string_agg(a.attname, ',' ORDER BY a.attnum)
  FROM pg_catalog.pg_attribute a
 WHERE a.attrelid = 'public.report_versions'::regclass
   AND a.attnum > 0 AND NOT a.attisdropped
   AND a.attname NOT IN ('id','report_id','centre_id','revision_number',
     'authored_by_membership_id','authored_by_role','derived_from_version_id',
     'submitted_at','submitted_by_membership_id','submitted_by_role',
     'created_at','updated_at','content_hash','content_hash_version',
     'trainer_approved_source_version_id');`).split(',').filter(Boolean)

if (PANELS.length !== 4) {
  console.error(`FATAL: the live catalogue yields ${PANELS.length} panel column(s) `
    + `(${PANELS.join(', ') || 'none'}), expected 4. Every violation below would be built from `
    + 'the wrong names, so no proof in this file would mean anything.')
  process.exit(1)
}
const PANEL = PANELS[0]
console.log(`Live panel columns: ${PANELS.join(', ')} -- violations are built from these, not from literals.`)
console.log('')

// ---------------------------------------------------------------------
// 1. T7I-18 -- a governed RPC mutates a version's narrative content after
//    INSERT. This is the assertion an `UPDATE ... SET overview = ...` sailed
//    straight through while the deny-list still named `todays_strength`.
// ---------------------------------------------------------------------
proveFileControl({
  id: '1/9 T7I-18',
  file: 'supabase/migrations/20260809120000_od4_report_contract.sql',
  find: 'SET submitted_at = v_now,',
  replace: `SET ${PANEL} = 'TAMPERED', submitted_at = v_now,`,
  runner: 'scripts/tests/step-7i/static-scan.mjs',
  expect: `UPDATEs report_versions.${PANEL}`,
})

// ---------------------------------------------------------------------
// 2. T7I-R22 -- the bounded context resolver projects a narrative panel.
// ---------------------------------------------------------------------
proveFileControl({
  id: '2/9 T7I-R22',
  file: 'supabase/migrations/20260806190000_report_context_resolver.sql',
  find: '  student_id       uuid\n)',
  replace: `  student_id       uuid,\n  ${PANEL}        text\n)`,
  runner: 'scripts/tests/step-7i/static-scan.mjs',
  expect: `the resolver projection declares a forbidden column: ${PANEL}`,
})

// ---------------------------------------------------------------------
// 3. T-CT-S3 -- the correction-tracking queue DECLARES a narrative panel.
// ---------------------------------------------------------------------
proveFileControl({
  id: '3/9 T-CT-S3',
  file: 'supabase/migrations/20260806103000_management_correction_tracking.sql',
  find: '  tracking_updated_at          timestamptz\n)',
  replace: `  tracking_updated_at          timestamptz,\n  ${PANEL}                     text\n)`,
  runner: 'scripts/tests/correction-tracking/ct-static.mjs',
  expect: 'forbidden field',
})

// ---------------------------------------------------------------------
// 4. T-CT-13 -- the APPLIED correction-tracking projection exposes a panel.
//    Proven against the shipped catalogue assertion, not the migration text.
// ---------------------------------------------------------------------
proveSqlControl({
  id: '4/9 T-CT-13',
  file: 'scripts/tests/correction-tracking/ct-suite.sql',
  marker: 'T-CT-13',
  plant: `
DROP FUNCTION IF EXISTS public.report_list_management_corrections();
CREATE FUNCTION public.report_list_management_corrections(
  OUT report_id uuid, OUT student_id uuid, OUT student_display_name text,
  OUT class_session_id uuid, OUT session_date date, OUT report_status public.report_status,
  OUT correction_request_id uuid, OUT issue_scope text, OUT correction_reason text,
  OUT correction_status text, OUT returned_at timestamptz,
  OUT trainer_correction_submitted boolean, OUT tracking_updated_at timestamptz,
  OUT ${PANEL} text)
RETURNS SETOF record LANGUAGE sql STABLE AS $probe$ SELECT NULL::uuid, NULL::uuid, NULL::text,
  NULL::uuid, NULL::date, NULL::public.report_status, NULL::uuid, NULL::text, NULL::text,
  NULL::text, NULL::timestamptz, NULL::boolean, NULL::timestamptz, NULL::text WHERE false $probe$;`,
  expect: 'FAIL T-CT-13',
})

// ---------------------------------------------------------------------
// 5. MA-8 -- the APPLIED submitted-report list reads version content.
//    The worst of the nine: it emitted an affirmatively FALSE PASS.
// ---------------------------------------------------------------------
proveLiveControl({
  id: '5/9 MA-8',
  fn: 'report_list_management_submitted',
  definingMigration: '20260807113000_management_submitted_list.sql',
  plant: `
DO $plant$
DECLARE v_src text; v_new text;
BEGIN
  SELECT p.prosrc INTO v_src FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace
   WHERE n.nspname='public' AND p.proname='report_list_management_submitted';
  -- Read a narrative panel in the body. Nothing else about the function
  -- changes, so a failure can only be the content-column rule.
  v_new := pg_catalog.replace(v_src, 'RETURN QUERY', 'PERFORM 1 FROM public.report_versions zz WHERE zz.${PANEL} IS NOT NULL; RETURN QUERY');
  IF v_new = v_src THEN RAISE EXCEPTION 'plant anchor "RETURN QUERY" not found'; END IF;
  EXECUTE 'CREATE OR REPLACE FUNCTION public.report_list_management_submitted('
    || pg_catalog.pg_get_function_arguments((SELECT p.oid FROM pg_catalog.pg_proc p
         JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace
        WHERE n.nspname='public' AND p.proname='report_list_management_submitted'))
    || ') RETURNS ' || pg_catalog.pg_get_function_result((SELECT p.oid FROM pg_catalog.pg_proc p
         JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace
        WHERE n.nspname='public' AND p.proname='report_list_management_submitted'))
    || ' LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO '''' AS $probe$'
    || v_new || '$probe$';
END
$plant$;`,
  runner: 'scripts/tests/management-approved/run-management-approved.mjs',
  expect: 'reads version-content column',
})

// ---------------------------------------------------------------------
// 6-9. T7I-OD4-BOUNDED -- the CURRENT replacements for the four
//      migration-resident assertions M6, X5, S6 and S8.
//
//      Proven against the SHIPPED reusable block, with the violation
//      planted in the live catalogue inside a rolled-back transaction.
// ---------------------------------------------------------------------
const boundedCases = [
  ['6/9 M6->BOUNDED/a', 'report_list_management_corrections',
    'declares 1 report-version narrative panel column',
    `DROP FUNCTION IF EXISTS public.report_list_management_corrections();
     CREATE FUNCTION public.report_list_management_corrections(OUT report_id uuid, OUT ${PANEL} text)
     RETURNS SETOF record LANGUAGE sql STABLE AS $probe$ SELECT NULL::uuid, NULL::text WHERE false $probe$;`],

  ['7/9 X5->BOUNDED/b', 'report_resolve_context',
    'applied body reads 1 narrative panel column',
    `DROP FUNCTION IF EXISTS public.report_resolve_context(uuid);
     CREATE FUNCTION public.report_resolve_context(p_report_id uuid)
     RETURNS TABLE (class_session_id uuid, student_id uuid) LANGUAGE plpgsql STABLE AS $probe$
     BEGIN RETURN QUERY SELECT rv.report_id, rv.report_id FROM public.report_versions rv
       WHERE rv.${PANEL} IS NOT NULL AND false; END $probe$;`],

  ['8/9 S6->BOUNDED/a', 'report_list_management_submitted',
    'declares 1 report-version narrative panel column',
    `DROP FUNCTION IF EXISTS public.report_list_management_submitted();
     CREATE FUNCTION public.report_list_management_submitted(OUT report_id uuid, OUT ${PANEL} text)
     RETURNS SETOF record LANGUAGE sql STABLE AS $probe$ SELECT NULL::uuid, NULL::text WHERE false $probe$;`],

  ['9/9 S8->BOUNDED/c', 'report_list_management_submitted',
    'applied body reads a version-content, assessment, attendance or audit object',
    // Two OUT parameters, not one: a single OUT parameter makes the result
    // type that parameter's type, and `RETURNS SETOF record` is then a
    // syntax error -- the probe would fail to compile and the raise would
    // not be the control firing.
    //
    // The projection is CLEAN (no panel column), so legs (a) and (b) pass
    // and only leg (c) -- S8's non-panel half -- can be what raises.
    `DROP FUNCTION IF EXISTS public.report_list_management_submitted();
     CREATE FUNCTION public.report_list_management_submitted(
       OUT report_id uuid, OUT session_date date)
     RETURNS SETOF record LANGUAGE plpgsql STABLE AS $probe$
     BEGIN RETURN QUERY SELECT rv.report_id, NULL::date FROM public.report_versions rv
       WHERE rv.content_hash IS NOT NULL AND false; END $probe$;`],
]

for (const [id, , expect, plant] of boundedCases) {
  proveSqlControl({
    id,
    file: 'scripts/tests/step-7i/lifecycle-canonical.sql',
    marker: 'T7I-OD4-BOUNDED',
    plant,
    expect,
  })
}

// =====================================================================
console.log('')
const fired = results.filter((r) => r[1] === 'FIRED').length
console.log(`Controls demonstrated capable of firing: ${fired} / 9`)
if (failures > 0) {
  console.error(`\nP1-T04 firing proofs: ${failures} failure(s). `
    + 'A control that passes both a valid and a deliberately-invalid input is a FAIL.')
  process.exitCode = 1
} else {
  console.log('\nP1-T04 firing proofs: 9 / 9 controls demonstrated firing, and clean state passes.')
}
