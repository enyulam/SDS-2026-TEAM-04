#!/usr/bin/env node
// =====================================================================
// B.E.S.T Coach -- FIRING PROOF for the OD-4 owner-only GRANT guard
// =====================================================================
// Operator ruling PD-2 (2026-08-09): "Do not claim static coverage without
// this proof."
//
// It imports THE SHIPPED PREDICATES from od4-grant-guard.mjs -- the same
// functions static-scan.mjs calls -- and NEVER modifies a canonical
// migration. Every planted violation lives in an in-memory disposable corpus.
//
// ---------------------------------------------------------------------
// STRENGTHENED 2026-08-09 after adversarial review defeated version 1
// ---------------------------------------------------------------------
// Version 1 could not distinguish a working guard from a broken one. Mutating
// the guard to `for (const f of files.slice(-1))` -- scanning only the newest
// migration, i.e. PRECISELY the ct-static.mjs defect PD-2 exists to fix --
// left the proof passing 6/6 and exiting 0. Two reasons:
//
//   * every planted violation went into a file APPENDED to the end of the
//     corpus, so "scan only the last file" still saw all of them;
//   * `const EXPECTED = serializers.length` was computed from the corpus, so
//     the shipped EXPECTED_SERIALIZERS pin -- the thing the whole
//     anti-vacuity design rests on -- was never validated.
//
// Both are fixed: section 2 plants into an EXISTING, NON-LAST migration, and
// section 0 asserts the shipped pin against the real corpus.
//
// Run: node scripts/tests/step-7i/prove-od4-grant-guard.mjs
// =====================================================================

import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import {
  discoverSerializers, assertAnchors, guardedFunctions, findForbiddenGrants,
  findMissingRevokes, CLIENT_ROLES, EXPECTED_SERIALIZERS,
} from './od4-grant-guard.mjs'

const ROOT = process.cwd()
const MIG_DIR = join(ROOT, 'supabase', 'migrations')

let failures = 0
const ok = (m) => console.log(`  OK   ${m}`)
const bad = (m) => { failures += 1; console.error(`  BAD  ${m}`) }

const realFiles = readdirSync(MIG_DIR)
  .filter((f) => f.endsWith('.sql'))
  .sort()
  .map((name) => ({ name, sql: readFileSync(join(MIG_DIR, name), 'utf8') }))

const clone = () => realFiles.map((f) => ({ name: f.name, sql: f.sql }))
const serializers = discoverSerializers(realFiles)

const V2_DEFS = `
CREATE OR REPLACE FUNCTION public.report_content_hash_v2(a text) RETURNS text
  LANGUAGE plpgsql IMMUTABLE AS $f$ BEGIN RETURN a; END; $f$;
CREATE OR REPLACE FUNCTION public.report_wording_hash_v2(a text) RETURNS text
  LANGUAGE plpgsql IMMUTABLE AS $f$ BEGIN RETURN a; END; $f$;
REVOKE ALL ON FUNCTION public.report_content_hash_v2(text) FROM PUBLIC, anon, authenticated, service_role, authenticator;
REVOKE ALL ON FUNCTION public.report_wording_hash_v2(text) FROM PUBLIC, anon, authenticated, service_role, authenticator;
`

/** Plant text into an EXISTING, deliberately NON-LAST migration. */
const plantIntoExisting = (text) => {
  const files = clone()
  const idx = 4 // 20260805090500_step_7i_report_lifecycle.sql -- mid-corpus
  files[idx] = { name: files[idx].name, sql: `${files[idx].sql}\n${text}\n` }
  return { files, target: files[idx].name }
}

console.log('=== OD-4 owner-only GRANT guard: firing proof ===\n')
console.log(`Corpus: ${realFiles.length} file(s). Serializers: ${serializers.join(', ')}`)
console.log(`Guarded: ${guardedFunctions(realFiles).join(', ')}\n`)

// ---------------------------------------------------------------------
// 0. The SHIPPED pin is validated against the real corpus.
// ---------------------------------------------------------------------
{
  if (serializers.length === EXPECTED_SERIALIZERS) {
    ok(`0. shipped EXPECTED_SERIALIZERS (${EXPECTED_SERIALIZERS}) matches the real corpus`)
  } else {
    bad(`0. shipped EXPECTED_SERIALIZERS is ${EXPECTED_SERIALIZERS} but the corpus has ${serializers.length}`
      + ' -- re-pin it in the same commit that added the serializer')
  }
}

// ---------------------------------------------------------------------
// 1. CLEAN CORPUS -> PASS
// ---------------------------------------------------------------------
{
  const v = findForbiddenGrants(realFiles, guardedFunctions(realFiles))
  const a = assertAnchors(serializers, EXPECTED_SERIALIZERS)
  const m = findMissingRevokes(realFiles, serializers)
  if (v.length === 0 && a.length === 0 && m.length === 0) ok('1. clean current corpus -> PASS')
  else bad(`1. clean corpus: ${v.length} violation(s), ${a.length} anchor problem(s), ${m.length} missing REVOKE(s)`)
}

// ---------------------------------------------------------------------
// 2. WHOLE-CORPUS COVERAGE -- planted into an EXISTING, NON-LAST migration.
//    This is what kills a "scan only the newest file" regression.
// ---------------------------------------------------------------------
{
  const { files, target } = plantIntoExisting(
    'GRANT EXECUTE ON FUNCTION public.report_content_hash_v1(text) TO authenticated;')
  const v = findForbiddenGrants(files, guardedFunctions(files))
  if (v.some((x) => x.file === target)) {
    ok(`2. violation planted mid-corpus in ${target} IS caught -- the guard reads every file, not just the newest`)
  } else {
    bad('2. a violation planted in an EXISTING mid-corpus migration was NOT caught')
  }
}

// ---------------------------------------------------------------------
// 3. EVERY GUARDED FUNCTION x EVERY CLIENT ROLE.
// ---------------------------------------------------------------------
{
  const targets = [
    'report_content_hash_v2', 'report_wording_hash_v2',
    'report_content_hash_v1', 'report_wording_hash_v1',
    'report_store_draft', 'app_parent_reaches_student',
  ]
  let misses = 0
  for (const fn of targets) {
    for (const role of CLIENT_ROLES) {
      const files = clone()
      files.push({ name: '99999999999999_planted.sql', sql: `${V2_DEFS}\nGRANT EXECUTE ON FUNCTION public.${fn}(text) TO ${role};\n` })
      const v = findForbiddenGrants(files, guardedFunctions(files))
      if (!v.some((x) => x.fn === fn && x.role === role)) { misses += 1; bad(`3. GRANT ${fn} TO ${role} NOT caught`) }
    }
  }
  if (misses === 0) ok(`3. all ${targets.length * CLIENT_ROLES.length} (function x client role) grants caught`)
}

// ---------------------------------------------------------------------
// 4. THE NINE BYPASSES adversarial review found against version 1.
//    Every one of these passed green before the hardening.
// ---------------------------------------------------------------------
{
  const bypasses = [
    ['B1  ON ALL FUNCTIONS IN SCHEMA', 'GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;'],
    ['B1a ON ALL ROUTINES / PUBLIC', 'GRANT EXECUTE ON ALL ROUTINES IN SCHEMA public TO PUBLIC;'],
    ['B1b ON ALL FUNCTIONS / anon', 'GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon;'],
    ['B1c ON ALL FUNCTIONS / service_role', 'GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;'],
    ['B2  ALTER DEFAULT PRIVILEGES', 'ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO authenticated;'],
    ['B3  dynamic SQL in DO block', "DO $do$ BEGIN EXECUTE 'GRANT EXECUTE ON FUNCTION public.report_content_hash_v2(text) TO authenticated'; END $do$;"],
    ['B3a dynamic SQL via format()', "DO $do$ BEGIN EXECUTE format('GRANT EXECUTE ON FUNCTION %I.%I(text) TO %I','public','report_content_hash_v2','anon'); END $do$;"],
    ['B5  -- inside a string literal', "COMMENT ON FUNCTION public.report_content_hash_v2(text) IS 'OD-4 V2 -- parallel envelope'; GRANT EXECUTE ON FUNCTION public.report_content_hash_v2(text) TO authenticated;"],
    ['B8  helper function grants', "CREATE OR REPLACE FUNCTION public.apply_v2_grants() RETURNS void LANGUAGE plpgsql AS $b$ BEGIN EXECUTE 'GRANT EXECUTE ON FUNCTION public.report_content_hash_v2(text) TO authenticated'; END; $b$;"],
    ['B9  TO CURRENT_USER', 'GRANT EXECUTE ON FUNCTION public.report_content_hash_v2(text) TO PUBLIC;'],
    ['B4  role chaining', 'GRANT report_hash_reader TO authenticated;'],
  ]
  let misses = 0
  for (const [label, stmt] of bypasses) {
    const files = clone()
    files.push({ name: '99999999999999_bypass.sql', sql: `${V2_DEFS}\n${stmt}\n` })
    const v = findForbiddenGrants(files, guardedFunctions(files))
    if (v.length === 0) { misses += 1; bad(`4. BYPASS STILL OPEN: ${label} -> ${stmt.slice(0, 90)}`) }
  }
  if (misses === 0) ok(`4. all ${bypasses.length} known bypass form(s) now caught (blanket, default-privileges, dynamic SQL, string-literal comment, role chaining)`)
}

// ---------------------------------------------------------------------
// 5. MISSING REVOKE -- the hazard no GRANT scan can see.
// ---------------------------------------------------------------------
{
  const files = clone()
  files.push({
    name: '99999999999999_norevoke.sql',
    sql: `CREATE OR REPLACE FUNCTION public.report_content_hash_v2(a text) RETURNS text
  LANGUAGE plpgsql IMMUTABLE AS $f$ BEGIN RETURN a; END; $f$;\n`,
  })
  const s = discoverSerializers(files)
  const m = findMissingRevokes(files, s)
  const g = findForbiddenGrants(files, guardedFunctions(files))
  if (m.length > 0 && g.length === 0) {
    ok('5. serializer created with NO REVOKE is caught by findMissingRevokes -- and note the GRANT scan alone reports nothing, which is exactly why this check exists')
  } else {
    bad(`5. missing-REVOKE not caught (missing=${m.length}, grants=${g.length})`)
  }

  const okFiles = clone()
  okFiles.push({ name: '99999999999999_withrevoke.sql', sql: V2_DEFS })
  if (findMissingRevokes(okFiles, discoverSerializers(okFiles)).length === 0) {
    ok('5b. serializer created WITH an explicit REVOKE ... FROM PUBLIC passes')
  } else {
    bad('5b. false positive: a properly revoked serializer was reported as missing its REVOKE')
  }
}

// ---------------------------------------------------------------------
// 6. NO FALSE POSITIVES on legitimate text.
// ---------------------------------------------------------------------
{
  const legitimate = [
    ['REVOKE from every client role', 'REVOKE ALL ON FUNCTION public.report_content_hash_v2(text) FROM PUBLIC, anon, authenticated, service_role, authenticator;'],
    ['GRANT on a NON-guarded function', 'GRANT EXECUTE ON FUNCTION public.report_get_working(uuid, uuid) TO authenticated;'],
    ['GRANT to postgres (the corpus pattern)', 'GRANT EXECUTE ON FUNCTION public.report_content_hash_v2(text) TO postgres;'],
    ['guarded name inside a -- comment', '-- GRANT EXECUTE ON FUNCTION public.report_content_hash_v2(text) TO authenticated;'],
    ['guarded name inside a /* */ comment', '/* historical, do not re-enable;\nGRANT EXECUTE ON FUNCTION public.report_content_hash_v2(text) TO authenticated;\n*/'],
    ['role name embedding a client role', 'GRANT EXECUTE ON FUNCTION public.report_get_working(uuid, uuid) TO best_authenticated_relay;'],
  ]
  let fps = 0
  for (const [label, stmt] of legitimate) {
    const files = clone()
    files.push({ name: '99999999999999_legit.sql', sql: `${V2_DEFS}\n${stmt}\n` })
    const v = findForbiddenGrants(files, guardedFunctions(files))
    if (v.length !== 0) { fps += 1; bad(`6. FALSE POSITIVE: ${label} -> ${JSON.stringify(v[0])}`) }
  }
  if (fps === 0) ok(`6. no false positive on ${legitimate.length} legitimate construct(s), incl. REVOKE, block comments and postgres grants`)
}

// ---------------------------------------------------------------------
// 7. ANTI-VACUITY.
// ---------------------------------------------------------------------
{
  const stripped = realFiles.map((f) => ({ name: f.name, sql: f.sql.replace(/report_(content|wording)_hash_v\d+/gi, 'renamed_serializer') }))
  const s = discoverSerializers(stripped)
  if (s.length === 0 && assertAnchors(s, EXPECTED_SERIALIZERS).length > 0) {
    ok('7. anchor removed -> guard FAILS loudly instead of passing vacuously')
  } else bad('7. anchor removal not detected')

  const half = realFiles.map((f) => ({ name: f.name, sql: f.sql.replace(/report_wording_hash_v1/gi, 'renamed_one') }))
  if (assertAnchors(discoverSerializers(half), EXPECTED_SERIALIZERS).length > 0) {
    ok('7b. ONE of two V1 serializers missing -> guard FAILS')
  } else bad('7b. single-anchor loss not detected')

  if (assertAnchors(serializers, EXPECTED_SERIALIZERS + 2).length > 0) {
    ok('7c. serializer count drift -> guard FAILS (re-pin required in the same commit)')
  } else bad('7c. count drift not detected')
}

// ---------------------------------------------------------------------
// 8. The real corpus is byte-identical after all of the above.
// ---------------------------------------------------------------------
{
  const after = readdirSync(MIG_DIR).filter((f) => f.endsWith('.sql')).sort()
    .map((name) => ({ name, sql: readFileSync(join(MIG_DIR, name), 'utf8') }))
  const identical = after.length === realFiles.length
    && after.every((f, i) => f.name === realFiles[i].name && f.sql === realFiles[i].sql)
  if (identical) ok('8. real migration corpus byte-identical after the proof')
  else bad('8. THE REAL MIGRATION CORPUS CHANGED during this proof')
}

console.log('')
if (failures > 0) {
  console.error(`OD-4 GRANT guard firing proof: ${failures} failure(s).`)
  process.exitCode = 1
} else {
  console.log('OD-4 GRANT guard firing proof: PASSED.')
  console.log('Coverage proven: whole corpus (not just the newest file) - every guarded function x every')
  console.log('client role - blanket and default-privilege grants - dynamic SQL - string-literal comment')
  console.log('evasion - role chaining - missing REVOKE - anchor loss - and no false positives.')
}
