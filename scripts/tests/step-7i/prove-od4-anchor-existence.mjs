#!/usr/bin/env node
// =====================================================================
// B.E.S.T Coach -- P1-T05: ANCHOR-EXISTENCE FIRING PROOFS
// =====================================================================
// LOCAL DISPOSABLE DEVELOPMENT DATABASE ONLY.
//
// Cleanup manifest Q-26: "Negative controls must assert their anchor
// exists and fail closed. Never a vacuous PASS."
//
// P1-T04 proved that nine controls fire when a violation is PRESENT. This
// file proves the complementary property, which is the one that actually
// bites in practice: that a control fires when its SUBJECT IS ABSENT.
//
// The distinction matters because the two failure modes look identical
// from the outside. `IS DISTINCT FROM` fails closed on a missing function
// -- NULL is distinct from any string, so the assertion raises. `LIKE`
// does NOT: `NULL LIKE '%content_hash%'` is NULL, `IF NULL` does not
// branch, and a leak check whose subject was deleted therefore reports
// success. Five legs of T7I-39 were that shape. Deleting
// report_get_management_review made all of its leak checks pass.
//
// EXACT EQUALITY IS NEVER WEAKENED TO REACH GREEN. T7I-39's result
// signature and T7I-51's parameter list stay exact-string comparisons --
// T7I-51's arity check is the machine-checkable form of the A-034
// four-column management allow-list, and softening it to a LIKE or a
// substring would convert the project's most load-bearing detector into a
// tenth fail-open guard. What is added is an existence precondition in
// front of them, never a looser comparison.
//
// Run: node scripts/tests/step-7i/prove-od4-anchor-existence.mjs
// =====================================================================

import { readFileSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'

const ROOT = process.cwd()
const CONTAINER = 'supabase_db_best-coach-mvp'

let failures = 0
let fired = 0
const ok = (id, what) => { fired += 1; console.log(`  OK   ${id} -- ${what}`) }
const bad = (id, what) => { failures += 1; console.error(`  FAIL ${id} -- ${what}`) }

const sh = (cmd, args, opts = {}) =>
  spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, ...opts })

const psql = (sql) => sh('docker', ['exec', '-i', CONTAINER, 'psql', '--no-psqlrc',
  '--username=postgres', '--dbname=postgres', '--set=ON_ERROR_STOP=1', '--set=VERBOSITY=terse',
  '--quiet'], { input: sql })

/** Extract the whole shipped `DO $t$ ... END $t$;` block mentioning `marker`. */
function shippedBlock(file, marker) {
  const src = readFileSync(join(ROOT, file), 'utf8')
  const re = /DO \$t\$[\s\S]*?END \$t\$;/g
  let m
  while ((m = re.exec(src)) !== null) if (m[0].includes(marker)) return m[0]
  return null
}

/**
 * Remove the anchor inside a transaction, run the SHIPPED assertion block,
 * require it to raise, and roll back.
 */
function proveAbsence({ id, file, marker, remove, expect }) {
  const block = shippedBlock(file, marker)
  if (!block) {
    bad(id, `the shipped block containing "${marker}" is not in ${file} -- a deleted control must `
      + 'never read as a pass')
    return
  }
  const clean = psql(`BEGIN;\n${block}\nROLLBACK;`)
  if (clean.status !== 0) {
    bad(id, `the shipped block already fails on the CLEAN database, so a failure with the anchor `
      + `removed would prove nothing: ${clean.stderr.trim().split('\n')[0]}`)
    return
  }
  const r = psql(`BEGIN;\n${remove}\n${block}\nROLLBACK;`)
  const out = `${r.stdout}\n${r.stderr}`
  if (r.status === 0) {
    bad(id, 'the shipped block PASSED with its anchor deleted -- this is a vacuous PASS')
  } else if (expect && !out.includes(expect)) {
    bad(id, `the block raised, but not with the expected finding (${expect}): ${out.trim().split('\n')[0]}`)
  } else {
    ok(id, 'the shipped block passes clean and FAILS CLOSED when its anchor is deleted')
  }
}

/** Mutate a file, run a shipped scanner, require failure, restore, verify. */
function proveFileAbsence({ id, file, find, replace, runner, expect }) {
  const abs = join(ROOT, file)
  const original = readFileSync(abs, 'utf8')
  const EOL = original.includes('\r\n') ? '\r\n' : '\n'
  const f = find.replace(/\n/g, EOL)
  const rep = replace.replace(/\n/g, EOL)
  if (!original.includes(f)) {
    bad(id, `the mutation anchor is absent from ${file} -- re-derive it`)
    return
  }
  try {
    writeFileSync(abs,original.replace(f, rep))
    const r = sh('node', [runner])
    const out = `${r.stdout}\n${r.stderr}`
    if (r.status === 0) bad(id, `${runner} PASSED with the anchor removed -- vacuous`)
    else if (expect && !out.includes(expect)) bad(id, `${runner} failed, but not with "${expect}"`)
    else ok(id, `removing the anchor makes ${runner} fail loudly`)
  } finally {
    writeFileSync(abs,original)
  }
  // Restoration is verified against the IN-MEMORY SNAPSHOT, not against
  // git. `git diff` answers "does this file match HEAD", which is a
  // different question: these proofs legitimately run on files carrying
  // uncommitted work, and a git-based check reports a restoration failure
  // that did not happen while staying blind to one that did.
  if (readFileSync(abs, 'utf8') !== original) {
    bad(id, `${file} was NOT restored byte-identically to its pre-proof content`)
  }
}

// =====================================================================
console.log('P1-T05 -- anchor-existence firing proofs')
console.log('')

// ---------------------------------------------------------------------
// 1-4. The four governed read/write boundaries whose absence used to be
//      invisible. Each is deleted in turn; the shipped T7I-39/T7I-51
//      block must FAIL CLOSED naming that function.
// ---------------------------------------------------------------------
for (const fn of ['report_get_canonical', 'report_get_management_review',
                  'report_get_working', 'report_management_edit_wording']) {
  proveAbsence({
    id: `anchor:${fn}`,
    file: 'scripts/tests/step-7i/lifecycle-canonical.sql',
    marker: 'T7I-39/T7I-51 ANCHOR',
    remove: `DROP FUNCTION IF EXISTS public.${fn};`,
    expect: `${fn} resolves to 0 function(s)`,
  })
}

// ---------------------------------------------------------------------
// 5. AN OVERLOAD is also an anchor failure, not only a deletion. Two
//    functions of the same name make pg_get_function_result ambiguous, so
//    the exact-equality leg would compare against an arbitrary one of
//    them and could pass on the wrong function.
// ---------------------------------------------------------------------
proveAbsence({
  id: 'anchor:overload',
  file: 'scripts/tests/step-7i/lifecycle-canonical.sql',
  marker: 'T7I-39/T7I-51 ANCHOR',
  remove: `CREATE FUNCTION public.report_get_canonical(p_a int, p_b int)
           RETURNS TABLE (overview text) LANGUAGE sql STABLE
           AS $probe$ SELECT NULL::text WHERE false $probe$;`,
  expect: 'report_get_canonical resolves to 2 function(s)',
})

// ---------------------------------------------------------------------
// 6. THE SERIALIZER RENAME VACUITY, recorded open by the M14 adversarial
//    review and closed at P1-T05.
//
//    EXPECTED_SERIALIZERS is a COUNT. A count cannot see a rename: a V2
//    serializer renamed to ..._v3 still matches the discovery regex, still
//    totals four, and passes silently -- while every downstream assertion
//    naming V2 goes vacuous. assertAnchors now names all four.
// ---------------------------------------------------------------------
proveFileAbsence({
  id: 'anchor:serializer-rename',
  file: 'supabase/migrations/20260809120000_od4_report_contract.sql',
  find: 'CREATE FUNCTION public.report_content_hash_v2(',
  replace: 'CREATE FUNCTION public.report_content_hash_v3(',
  runner: 'scripts/tests/step-7i/static-scan.mjs',
  expect: 'report_content_hash_v2 was not found in any migration',
})

// ---------------------------------------------------------------------
// 7. T7I-76's OWN anchor. That control scans every migration sorting after
//    M15; if M15 is renamed or deleted, its forward scope becomes empty
//    and it would report PASS over nothing.
// ---------------------------------------------------------------------
proveFileAbsence({
  id: 'anchor:T7I-76-scope',
  file: 'scripts/tests/step-7i/static-scan.mjs',
  find: "const M15 = '20260809180000_od4_content_hash_version_no_default.sql'",
  replace: "const M15 = '29990101000000_this_migration_does_not_exist.sql'",
  runner: 'scripts/tests/step-7i/static-scan.mjs',
  expect: 'this control cannot establish which files are in forward scope',
})

// ---------------------------------------------------------------------
// 8. THE PANEL DERIVATION's anchor. Every re-derived P1-T04 control scans
//    for whatever `derivePanelColumns` returns. A derivation that silently
//    matched nothing would make ALL of them scan an empty set and pass.
// ---------------------------------------------------------------------
proveFileAbsence({
  id: 'anchor:panel-derivation',
  file: 'scripts/tests/step-7i/od4-panel-guard.mjs',
  // Mutating the ROOT derivation, not one of its two consumers: a mutant
  // that empties only derivePanelColumns leaves deriveImmutableVersionColumns
  // healthy, T7I-18 still fires on its own anchor, and the proof would look
  // green for the wrong reason.
  find: 'export function deriveReportVersionColumns(migDir) {',
  replace: 'export function deriveReportVersionColumns(migDir) {\n  if (migDir) return [] // MUTANT: derivation silently yields nothing',
  runner: 'scripts/tests/step-7i/static-scan.mjs',
  expect: 'derivation produced only',
})

// =====================================================================
console.log('')
console.log(`Anchors demonstrated failing closed: ${fired} / 8`)
if (failures > 0) {
  console.error(`\nP1-T05 anchor-existence proofs: ${failures} failure(s). `
    + 'A deleted function, file or object must never produce a vacuous PASS.')
  process.exitCode = 1
} else {
  console.log('\nP1-T05 anchor-existence proofs: 8 / 8 anchors fail closed; exact equality preserved throughout.')
}
