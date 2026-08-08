#!/usr/bin/env node
// =====================================================================
// B.E.S.T Coach -- Step 7I acceptance suite: CANONICAL runner
// =====================================================================
// LOCAL DISPOSABLE DEVELOPMENT DATABASE ONLY.
//
// Runs, in order:
//   1. the static (S) scan;
//   2. the canonical lifecycle suite TWICE back-to-back, asserting both runs
//      are byte-identical (T7I-31 repeatability);
//   3. the reconciled fixture verifier TWICE, asserting both pass and both
//      reproduce the canonical fixture checksum byte-identically (T7I-28,
//      T7I-29, T7I-30).
//
// The four R(C) coordinated proofs are NOT run here -- they run on a
// separate disposable database via run-concurrency.mjs, because their
// committed audit events would be permanently uncleanable here.
//
// Run: node scripts/tests/step-7i/run-canonical.mjs
// =====================================================================

import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join } from 'node:path'

const CONTAINER = 'supabase_db_best-coach-mvp'
const DB = 'postgres'
const ROOT = process.cwd()
const SUITE = join(ROOT, 'scripts', 'tests', 'step-7i', 'lifecycle-canonical.sql')
const VERIFIER = join(ROOT, 'scripts', 'fixtures', 'verify-local-fixtures.sql')

// The accepted POST-AMENDMENT-006 canonical fixture checksum. Step 7I must
// leave it BYTE-IDENTICAL: the migration adds no fixture row, and every test
// is a rolled-back decoy.
//
// The pin moved once, from the Step 7F value
// d6a314b40bb5eb1bc3169097e2a9cb03858791498ca5137a43050cee36b87517, because the
// Amendment 006 vocabulary rename rewrote three observation_ratings labels that
// fall inside the canonical region. The rename is label text only: the canonical
// row count is UNCHANGED at 28, and no fixture row was added or removed.
const EXPECTED_CHECKSUM = '6bdff280e550503d212832c2fd1099ac45880c2bc430bfdff8f92a3b35ffc576'
const CANONICAL_BEGIN = '<<<BEST_COACH_FIXTURE_CANONICAL_BEGIN>>>'
const CANONICAL_END = '<<<BEST_COACH_FIXTURE_CANONICAL_END>>>'

let failures = 0
const fail = (m) => { failures += 1; console.error(`FAIL ${m}`) }

function run(cmd, args, stdin) {
  return new Promise((resolve) => {
    const p = spawn(cmd, args, { stdio: ['pipe', 'pipe', 'pipe'] })
    let out = '', err = ''
    p.stdout.on('data', (d) => { out += d })
    p.stderr.on('data', (d) => { err += d })
    p.on('close', (code) => resolve({ code, out, err }))
    if (stdin !== undefined) p.stdin.end(stdin); else p.stdin.end()
  })
}

const psqlFile = (file) => run('docker',
  ['exec', '-i', CONTAINER, 'psql', '--no-psqlrc', '--username=postgres', `--dbname=${DB}`,
   '--set=ON_ERROR_STOP=1', '--set=VERBOSITY=terse', '--quiet'],
  readFileSync(file, 'utf8'))

function canonicalChecksum(stdout) {
  const lines = stdout.split(/\r?\n/)
  const s = lines.indexOf(CANONICAL_BEGIN)
  const e = lines.indexOf(CANONICAL_END)
  if (s === -1 || e === -1 || e <= s) return null
  const rows = lines.slice(s + 1, e).map((l) => l.trim()).filter((l) => l.length > 0)
  if (rows.length === 0) return null
  return { rows: rows.length, sha256: createHash('sha256').update(rows.join('\n') + '\n', 'utf8').digest('hex') }
}

async function main() {
  console.log('=== Step 7I canonical acceptance run ===\n')

  // 1 -- static scan
  const scan = await run(process.execPath, [join(ROOT, 'scripts', 'tests', 'step-7i', 'static-scan.mjs')])
  process.stdout.write(scan.out)
  if (scan.code !== 0) { process.stderr.write(scan.err); fail('the static scan failed') }

  // 1b -- the OD-4 GRANT guard's FIRING PROOF (operator ruling PD-2).
  // A guard nobody proves can fire is a guard nobody can trust: adversarial
  // review showed the first version of that proof still passed 6/6 against a
  // guard mutated to scan only the newest migration -- exactly the ct-static
  // defect PD-2 exists to eliminate. Running it here is what stops the proof
  // being an orphaned script someone has to remember to type.
  const guardProof = await run(process.execPath,
    [join(ROOT, 'scripts', 'tests', 'step-7i', 'prove-od4-grant-guard.mjs')])
  process.stdout.write(guardProof.out)
  if (guardProof.code !== 0) {
    process.stderr.write(guardProof.err)
    fail('the OD-4 GRANT guard firing proof failed')
  }

  // 1c -- the V1 SERIALIZER FREEZE proof (G-05a items 1-2).
  // Wired in 2026-08-09 by adversarial review, for the same reason as 1b: it
  // was an ORPHAN. Nothing invoked it -- not run-canonical, not package.json --
  // so the only proof covering V1's literal ACL, its COMMENT and its signature
  // ran solely when a human remembered to type it. Those three are exactly what
  // verify-fresh-apply is structurally blind to, because M13 runs on BOTH sides
  // of its comparison and any V1 change appears identically on each.
  const v1Freeze = await run(process.execPath,
    [join(ROOT, 'scripts', 'tests', 'step-7i', 'prove-v1-freeze.mjs')])
  process.stdout.write(v1Freeze.out)
  if (v1Freeze.code !== 0) {
    process.stderr.write(v1Freeze.err)
    fail('the V1 serializer freeze proof failed')
  }

  // 2 -- the lifecycle suite, twice (T7I-31)
  const a = await psqlFile(SUITE)
  if (a.code !== 0) { process.stderr.write(a.err); fail('canonical suite run 1 failed'); return }
  const b = await psqlFile(SUITE)
  if (b.code !== 0) { process.stderr.write(b.err); fail('canonical suite run 2 failed'); return }
  const passes = (a.err.match(/^NOTICE:  PASS /gm) || []).length
  console.log(`\nCanonical lifecycle suite: ${passes} PASS notices per run.`)
  if (a.err !== b.err || a.out !== b.out) {
    fail('T7I-31: the two canonical suite runs are not byte-identical')
  } else {
    console.log('PASS T7I-31 -- two back-to-back runs are byte-identical')
  }
  process.stdout.write(a.err.split('\n').filter((l) => /PASS|RECORDED/.test(l)).join('\n') + '\n')

  // 3 -- the reconciled fixture verifier, twice (T7I-28/29/30)
  const v1 = await psqlFile(VERIFIER)
  const v2 = await psqlFile(VERIFIER)
  for (const [i, v] of [[1, v1], [2, v2]]) {
    if (v.code !== 0) { process.stderr.write(v.err); fail(`the reconciled verifier failed on run ${i}`) }
    for (const marker of ['SECTION A: all positive assertions passed.',
                          'SECTION C: all 7 negative tests were correctly rejected.',
                          'SECTION D: rollback left no residue']) {
      if (!v.err.includes(marker)) fail(`verifier run ${i} did not emit "${marker}"`)
    }
  }
  if (v1.out !== v2.out) fail('the two verifier runs produced different canonical regions')

  const c1 = canonicalChecksum(v1.out)
  const c2 = canonicalChecksum(v2.out)
  if (!c1 || !c2) fail('the canonical region was missing or empty')
  else if (c1.sha256 !== EXPECTED_CHECKSUM || c2.sha256 !== EXPECTED_CHECKSUM) {
    fail(`the canonical fixture checksum is ${c1.sha256}, expected ${EXPECTED_CHECKSUM}`)
  } else {
    console.log(`\nPASS canonical fixture checksum -- ${c1.rows} rows, ${c1.sha256}, reproduced identically on two runs`)
    console.log('PASS the reconciled verifier passes twice')
  }
}

main().then(() => {
  console.log('')
  if (failures > 0) {
    console.error(`Step 7I canonical run: ${failures} failure(s).`)
    process.exitCode = 1
  } else {
    console.log('Step 7I canonical run: all proofs passed and the canonical database is pristine.')
  }
}).catch((e) => {
  console.error(`Step 7I canonical run aborted: ${e.message}`)
  process.exitCode = 1
})
