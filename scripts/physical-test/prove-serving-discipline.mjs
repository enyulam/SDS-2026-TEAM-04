#!/usr/bin/env node
// =====================================================================
// B.E.S.T Coach — S-1 IN ISOLATION
// Proof of the §7.4a MANDATORY SERVING DISCIPLINE
// (HERO V3 EXECUTION OVERLAY §4.5 — S-1 · S-2 · S-3)
// =====================================================================
//
// Run: node scripts/physical-test/prove-serving-discipline.mjs
//      npm run prove:serving-discipline
//
// WHY IT RUNS ALONE, AND BEFORE ANY UI WORK.
//
// S-1 guards a BILLABLE surface. It had never executed. Discovering a
// first-run failure in the middle of Stage 2's browser legs would cost
// time this window does not have — and, worse, the failure mode is silent:
// a served process that quietly resolved the operator's real `LLM_API_KEY`
// would look exactly like a working one right up until it was billed.
// That has already happened once in this project.
//
// ---------------------------------------------------------------------
// WHAT THIS PROVES, AND HOW IT COULD FAIL
// ---------------------------------------------------------------------
// The claim under test is NOT "the assignment executed". It is:
//
//   the three ratified AI provider selectors, OVERWRITTEN (never deleted)
//   in a served child environment, still hold the neutralising literal
//   AFTER `@next/env` has run against this repository's own `.env.local`
//   — which carries a REAL key.
//
// The load-bearing legs are D-6 and D-7: the SAME probe, in the SAME
// modes, with the selectors DELETED instead of overwritten. `@next/env`
// then refills them from `.env.local` and the probe reports
// `PRESENT_DIFFERENT`. That is the hazard, measured live on this machine,
// and it is what makes D-4 and D-5 evidence rather than a tautology
// (overlay §4.6 — an assertion is evidence only if it has been
// demonstrated capable of FAILING).
//
// If D-6/D-7 do NOT observe a refill, this proof FAILS. It does not
// quietly upgrade "the hazard did not reproduce" into "the guard works":
// an undemonstrated assertion is not evidence, and the correct response is
// to stop and find out why, not to serve.
//
// ---------------------------------------------------------------------
// NOTHING SECRET IS EVER SURFACED
// ---------------------------------------------------------------------
// No selector VALUE is read into this process, printed, logged, hashed or
// placed in an error. The probe reports a three-valued STATUS per selector
// and nothing else. `PRESENT_DIFFERENT` — the negative control's expected
// reading — asserts only that a value is NOT the literal, which is exactly
// enough to decide the gate and never enough to disclose the key.
//
// ⚠️ THE STREAM TRADE CHANGED 2026-08-17, BY OPERATOR RULING, AND THE
// DISCIPLINE DID NOT. `stdout` is still ignored outright. `stderr` is now
// captured to a scratch file OUTSIDE the repository, scanned with THE
// EXISTING credential detector (`credential-shapes.mjs`, one definition,
// imported never restated), and rendered ONLY IF CLEAN — otherwise the
// standing `NO EVIDENCE CAPTURED` form with its reason.
//
// ▶ This is not the thing §11 forbids. §11 bars RELYING ON PATTERN-BASED
// REDACTION — deciding what to strip out of a stream and printing the rest.
// Nothing here is stripped: it is one whole-file decision that FAILS
// CLOSED, so a scanner miss suppresses nothing a redactor would have caught.
// ⛔ D-7b/D-7c/D-7d prove both directions before D-8 relies on it.
//
// ⚠️ WHY IT CHANGED: three intermittents across five phases (`D-8`, a child
// that died at startup; `D-10`, a child that survived teardown — opposite
// ends of one child's lifetime) and NOT ONE of them could be explained,
// because the stream that would have said why was never buffered.
//
// ---------------------------------------------------------------------
// THE EXIT-CODE CONTRACT
// ---------------------------------------------------------------------
//   0    every check PASSED. No check may be NOT-RUN.
//   1    any check is not PASS, or main() threw.
//   130  SIGINT / SIGTERM.
// Teardown runs on every exit path.
// =====================================================================

import { createServer } from 'node:net'
import { writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import {
  PROVIDER_NEUTRALISING_LITERAL,
  PROVIDER_SELECTORS,
  REAL_PROVIDER_LEG_VARIABLE,
  SELECTOR_STATUS,
  ServingDisciplineError,
  TELEMETRY_VARIABLE,
  assertNeutralisingLiteralIsUnratified,
  assertRealProviderLegAbsentFromEnvFiles,
  assertRealProviderLegUnset,
  buildServedChildEnv,
  createTripWire,
  processTree,
  readBackThroughNextEnv,
  serveDisciplined,
  stopServed,
  describeServedStderr,
} from './serving-discipline.mjs'

/**
 * A port of this proof's own, deliberately NOT the disposable app port
 * 3418 and not the default dev port 3000 — so this run cannot collide with
 * the disposable harness or with an editor-started dev server.
 */
const PROOF_APP_PORT = 3419

/** How many trip-wire samples are taken while the server is up and answering. */
const TRIPWIRE_SAMPLES = 6
const TRIPWIRE_INTERVAL_MS = 1_000

const CHECK_TITLES = new Map([
  ['D-1', 'The neutralising literal is proven NOT to be a ratified selector, read from application source'],
  ['D-2', 'S-2 — the real-provider leg variable is UNSET here and is declared in no env file'],
  ['D-3', 'S-1 — the served child environment overwrites all three selectors and deletes nothing it must not'],
  ['D-4', 'READ-BACK (dev): after @next/env runs, all three selectors still hold the literal'],
  ['D-5', 'READ-BACK (start): after @next/env runs, all three selectors still hold the literal'],
  ['D-6', 'NEGATIVE CONTROL (dev): DELETING the selectors lets @next/env refill them from .env.local'],
  ['D-7', 'NEGATIVE CONTROL (start): DELETING the selectors lets @next/env refill them from .env.local'],
  ['D-7b', 'POSITIVE CONTROL — a CLEAN stderr capture is rendered in full, so a failure explains itself'],
  ['D-7c', 'NEGATIVE CONTROL — a capture carrying a SHAPED secret is WITHHELD ENTIRELY, refusal names the detector'],
  ['D-7d', 'FAIL-CLOSED — an absent or unreadable capture produces NO EVIDENCE CAPTURED, never silence-as-clean'],
  ['D-8', 'A disciplined server was actually SERVED and answered on its port'],
  ['D-9', 'S-3 — the armed trip-wire measured ZERO non-loopback peers across the whole served process tree'],
  ['D-10', 'Process hygiene — the served tree is gone and the port is released'],
])

const checks = new Map()

const say = (message) => process.stdout.write(`${message}\n`)
const phase = (message) => say(`\n[ ${message} ]`)

function check(id, verdict, reason) {
  if (!CHECK_TITLES.has(id)) throw new ServingDisciplineError(`Unknown check id: ${id}`)
  if (checks.has(id)) throw new ServingDisciplineError(`Check ${id} was decided twice.`)
  if (!['PASS', 'FAIL', 'NOT-RUN'].includes(verdict)) {
    throw new ServingDisciplineError(`Check ${id} was given an unsupported verdict.`)
  }
  checks.set(id, { verdict, reason })
  say(`  ${verdict === 'PASS' ? 'PASS' : verdict === 'FAIL' ? 'FAIL' : '!!  '}  ${id} ${reason}`)
}

const checkFrom = (id, ok, passReason, failReason) =>
  check(id, ok ? 'PASS' : 'FAIL', ok ? passReason : failReason)

/** Nothing is ever defaulted to PASS. */
function closeLedger(reason) {
  for (const id of CHECK_TITLES.keys()) if (!checks.has(id)) checks.set(id, { verdict: 'NOT-RUN', reason })
}

const owned = { server: null, serverPid: null }

function isPortFree(port) {
  const probe = createServer()
  return new Promise((settle) => {
    probe.once('error', () => settle(false))
    probe.once('listening', () => probe.close(() => settle(true)))
    probe.listen(port, '127.0.0.1')
  })
}

function processAlive(pid) {
  if (typeof pid !== 'number') return false
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

/**
 * Build a child environment with the three selectors DELETED rather than
 * overwritten. This is the NEGATIVE CONTROL's environment and exists for
 * no other purpose. It is never handed to a server — only to the read-back
 * probe, which resolves the values and reports a STATUS without reading,
 * returning or printing any of them.
 */
function deletionControlEnv() {
  const childEnv = { ...process.env }
  delete childEnv[REAL_PROVIDER_LEG_VARIABLE]
  childEnv[TELEMETRY_VARIABLE] = '1'
  for (const selector of PROVIDER_SELECTORS) {
    delete childEnv[selector]
    if (selector in childEnv) {
      throw new ServingDisciplineError(`The negative control could not remove ${selector} from its child environment.`)
    }
  }
  return childEnv
}

function summariseSelectors(report) {
  return PROVIDER_SELECTORS.map((selector) => `${selector}=${report.selectors.get(selector)}`).join(' ')
}

// =====================================================================

async function main() {
  say('B.E.S.T Coach — S-1 IN ISOLATION: the §7.4a serving discipline')
  say('REAL PROVIDER CALLS: ZERO AUTHORIZED. This proof activates no provider and calls none.')

  // -------------------------------------------------------------------
  phase('D-1 — the neutralising literal is not a ratified selector')
  // -------------------------------------------------------------------
  const literalCheck = assertNeutralisingLiteralIsUnratified()
  checkFrom(
    'D-1',
    literalCheck.ratifiedSelectorsRead >= 2,
    `${literalCheck.ratifiedSelectorsRead} ratified selectors were READ from ${literalCheck.searched.join(' / ')} ` +
      'and the neutralising literal matches none of them, so a served process fails the provider check by ' +
      'STRICT EQUALITY before any provider object exists',
    'fewer than two ratified selectors could be read, so the literal cannot be proven unratified',
  )

  // -------------------------------------------------------------------
  phase('D-2 — S-2, the real-provider leg variable')
  // -------------------------------------------------------------------
  assertRealProviderLegUnset()
  assertRealProviderLegAbsentFromEnvFiles()
  check(
    'D-2',
    'PASS',
    `${REAL_PROVIDER_LEG_VARIABLE} is UNSET in this process and is declared in no env file, so deleting it ` +
      'from a child environment cannot be silently undone by @next/env. Its presence would be a HALT, never ' +
      'an authorization',
  )

  // -------------------------------------------------------------------
  phase('D-3 — S-1, the disciplined child environment')
  // -------------------------------------------------------------------
  const { env: disciplinedEnv, record } = buildServedChildEnv()
  const allOverwritten =
    record.overwritten.length === PROVIDER_SELECTORS.length &&
    PROVIDER_SELECTORS.every((selector) => disciplinedEnv[selector] === PROVIDER_NEUTRALISING_LITERAL)
  const legRemoved = !(REAL_PROVIDER_LEG_VARIABLE in disciplinedEnv)
  const stillPresent = PROVIDER_SELECTORS.every((selector) => selector in disciplinedEnv)
  checkFrom(
    'D-3',
    allOverwritten && legRemoved && stillPresent && record.telemetryDisabled,
    `all ${record.overwritten.length} selectors are OVERWRITTEN and PRESENT (never deleted — a deleted key is ` +
      `what @next/env refills), ${REAL_PROVIDER_LEG_VARIABLE} is removed, and ${TELEMETRY_VARIABLE} is set so ` +
      'no benign outward request can share the S-3 trip-wire',
    'the disciplined child environment did not satisfy the overwrite / delete / telemetry contract',
  )

  // -------------------------------------------------------------------
  phase('D-4 / D-5 — THE READ-BACK, through the real @next/env loader')
  // -------------------------------------------------------------------
  for (const [id, mode] of [
    ['D-4', 'dev'],
    ['D-5', 'start'],
  ]) {
    const report = readBackThroughNextEnv(disciplinedEnv, mode)
    const allLiteral = PROVIDER_SELECTORS.every(
      (selector) => report.selectors.get(selector) === SELECTOR_STATUS.EQUALS_LITERAL,
    )
    checkFrom(
      id,
      report.loaded === true && allLiteral && report.realProviderLeg === 'ABSENT',
      `@next/env loaded this repository's env files for the ${mode} target and the selectors READ BACK as ` +
        `${summariseSelectors(report)}; ${REAL_PROVIDER_LEG_VARIABLE} read back ABSENT. The overwrite SURVIVES ` +
        'the loader, so a served process resolves the literal and not the operator key',
      `the ${mode} read-back did not return the literal for every selector (loaded=${report.loaded}, ` +
        `reason=${report.reason}, ${summariseSelectors(report)}, leg=${report.realProviderLeg}). ` +
        'A `loaded=false` reading means the loader never ran, so this leg proves NOTHING either way and is a ' +
        'FAIL rather than a pass-by-absence',
    )
  }

  // -------------------------------------------------------------------
  phase('D-6 / D-7 — NEGATIVE CONTROL: the deletion hazard, measured live')
  // -------------------------------------------------------------------
  const controlEnv = deletionControlEnv()
  for (const [id, mode] of [
    ['D-6', 'dev'],
    ['D-7', 'start'],
  ]) {
    const report = readBackThroughNextEnv(controlEnv, mode)
    const allRefilled = PROVIDER_SELECTORS.every(
      (selector) => report.selectors.get(selector) === SELECTOR_STATUS.PRESENT_DIFFERENT,
    )
    checkFrom(
      id,
      report.loaded === true && allRefilled,
      `with the selectors DELETED, @next/env REFILLED all three from this repository's own env files for the ` +
        `${mode} target (${summariseSelectors(report)}). The hazard S-1 names is REAL on this machine and was ` +
        `measured, which is what makes ${id === 'D-6' ? 'D-4' : 'D-5'} evidence rather than a tautology. No ` +
        'refilled value was read, printed or returned — only that it is NOT the literal',
      `DELETING the selectors did NOT produce a refill (loaded=${report.loaded}, reason=${report.reason}, ` +
        `${summariseSelectors(report)}), so the read-back assertion has NOT been demonstrated capable of ` +
        'failing and is not evidence. Refusing to report the discipline as proven',
    )
  }

  // -------------------------------------------------------------------
  phase('D-7b — the stderr capture, and that it fails CLOSED')
  // -------------------------------------------------------------------
  /*
   * ⛔ THE CAPTURE IS PROVEN BEFORE IT IS RELIED ON, and it is proven the way
   * §60 requires — on real text, both directions.
   *
   * ⚠️ THIS EXISTS BECAUSE THE SUITE COULD NOT EXPLAIN ITS OWN FAILURES.
   * Three intermittents across five phases (`D-8` / `D-10`), every one
   * uncapturable, because `stdio` was ignored on all three streams. The
   * Operator ruled the trade changed: capture stderr, scan it with the
   * EXISTING detector, print only if clean.
   *
   * ⛔ A RENDERER THAT HAS NEVER REFUSED IS NOT A GATE. The negative control
   * plants a shaped secret in a capture file and asserts the text is
   * WITHHELD — if that ever passes through, this whole mechanism is a leak
   * wearing the words of a safeguard.
   */
  {
    const probe = join(tmpdir(), `best-coach-stderr-control-${process.pid}.log`)

    writeFileSync(probe, 'Error: listen EADDRINUSE 127.0.0.1:3419\n    at Server.setupListenHandle\n', 'utf8')
    const clean = describeServedStderr({ servedStderrPath: probe })
    checkFrom(
      'D-7b',
      clean.includes('scanned CLEAN') && clean.includes('EADDRINUSE'),
      'POSITIVE CONTROL: a clean capture holding a REAL Node startup error is rendered in full, so a future ' +
        'D-8 failure arrives with the reason attached rather than as a bare exit code',
      'a clean capture was not rendered',
    )

    writeFileSync(probe, `boot failed\nSUPABASE_SECRET_KEY=sb_secret_${'A'.repeat(32)}\n`, 'utf8')
    const dirty = describeServedStderr({ servedStderrPath: probe })
    checkFrom(
      'D-7c',
      dirty.startsWith('⛔ NO EVIDENCE CAPTURED') &&
        dirty.includes('Supabase secret key') &&
        !dirty.includes('sb_secret_'),
      'NEGATIVE CONTROL: a capture carrying a SHAPED secret is WITHHELD ENTIRELY — the refusal names the ' +
        'detector that fired and the matched value never appears in it. ⛔ Whole-file decision, never a redaction',
      'a capture carrying a shaped secret was rendered, or the refusal echoed it',
    )

    rmSync(probe, { force: true })
    checkFrom(
      'D-7d',
      describeServedStderr({}).startsWith('⛔ NO EVIDENCE CAPTURED') &&
        describeServedStderr({ servedStderrPath: probe }).startsWith('⛔ NO EVIDENCE CAPTURED'),
      'FAIL-CLOSED CONTROL: no capture configured, and a capture file that does not exist, both produce the ' +
        'refusal with a reason — silence is never rendered as evidence of a clean stream',
      'an absent or unreadable capture did not fail closed',
    )
  }

  // -------------------------------------------------------------------
  phase('D-8 — actually serving a disciplined child process')
  // -------------------------------------------------------------------
  if (!(await isPortFree(PROOF_APP_PORT))) {
    throw new ServingDisciplineError(
      `Port ${PROOF_APP_PORT} is already held. This proof refuses to attach to a server it did not start and ` +
        'cannot vouch for.',
    )
  }
  const served = await serveDisciplined({ mode: 'dev', port: PROOF_APP_PORT })
  owned.server = served.child
  owned.serverPid = served.child.pid
  const response = await fetch(`${served.origin}/login`, { redirect: 'manual' })
  const document = await response.text()
  checkFrom(
    'D-8',
    response.status < 500 && document.length > 0 && typeof owned.serverPid === 'number',
    `a Next.js server was SERVED from buildServedChildEnv() on 127.0.0.1:${PROOF_APP_PORT} and answered ` +
      `/login with status ${response.status}. The environment it received is the same object D-4 and D-5 read ` +
      'back through the loader — not a second, hand-built one',
    'the disciplined server did not answer',
  )

  // -------------------------------------------------------------------
  phase('D-9 — S-3, the armed outward-call trip-wire')
  // -------------------------------------------------------------------
  const tripWire = createTripWire(owned.serverPid)
  for (let sample = 0; sample < TRIPWIRE_SAMPLES; sample += 1) {
    tripWire.sample()
    // Keep the server doing real work between samples, so the wire is armed
    // over a process that is actually handling requests rather than idling.
    try {
      await fetch(`${served.origin}/`, { redirect: 'manual' }).then((r) => r.text())
    } catch {
      // A refused request is not this check's subject.
    }
    await new Promise((r) => setTimeout(r, TRIPWIRE_INTERVAL_MS))
  }
  const wire = tripWire.result()
  checkFrom(
    'D-9',
    wire.measured === true && wire.foreign === 0,
    `${wire.samples} samples were taken across the served process TREE (up to ${wire.maxTreeSize} processes — a ` +
      'parent-only sample would miss an outward request made by a Next.js worker) and ZERO non-loopback TCP ' +
      'peers were observed. This is a measured zero, not an unmeasured one: an unreadable sample would have ' +
      'made the whole reading unmeasured',
    wire.measured === false
      ? `the trip-wire could not be measured (${wire.samples} readable, ${wire.unreadable} unreadable); ` +
        '"not measured" is not "measured zero" and cannot satisfy this check'
      : `the served process tree held ${wire.foreign} non-loopback TCP peers. Addresses are deliberately not ` +
        'reported; the count is the finding',
  )

  // -------------------------------------------------------------------
  phase('D-10 — teardown and hygiene')
  // -------------------------------------------------------------------
  stopServed(owned.server)
  owned.server = null
  let released = false
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if ((await isPortFree(PROOF_APP_PORT)) && !processAlive(owned.serverPid)) {
      released = true
      break
    }
    await new Promise((r) => setTimeout(r, 500))
  }
  const survivors = processTree(owned.serverPid)
  checkFrom(
    'D-10',
    released && (survivors === null || survivors.size <= 1),
    `the served tree is gone and port ${PROOF_APP_PORT} is released; this proof leaves no server and no held ` +
      'port behind',
    `the served process or port ${PROOF_APP_PORT} survived teardown`,
  )
}

// =====================================================================

let exitCode = 1
try {
  await main()
  closeLedger('the run ended before this check was reached')
  const failed = [...checks.entries()].filter(([, entry]) => entry.verdict !== 'PASS')
  phase('LEDGER')
  for (const [id, entry] of checks) say(`  ${entry.verdict.padEnd(7)} ${id}  ${CHECK_TITLES.get(id)}`)
  if (failed.length === 0) {
    exitCode = 0
    say('\nVERDICT: PASS — S-1, S-2 and S-3 are satisfied, and the read-back assertion was demonstrated')
    say('capable of failing by a live negative control. This is a session evidence verdict, NOT Operator Accepted.')
  } else {
    say(`\nVERDICT: FAIL — ${failed.map(([id]) => id).join(', ')} did not pass.`)
  }
} catch (error) {
  closeLedger('the run aborted before this check was reached')
  phase('LEDGER')
  for (const [id, entry] of checks) say(`  ${entry.verdict.padEnd(7)} ${id}  ${CHECK_TITLES.get(id)}`)
  // Only an authored message is surfaced. An unexpected error's message is
  // replaced, because it can quote a file, a line or an environment value.
  const message =
    error instanceof ServingDisciplineError
      ? error.message
      : 'An unexpected error ended the run. Its message is deliberately not surfaced.'
  say(`\nVERDICT: FAIL — ${message}`)
} finally {
  stopServed(owned.server)
}

process.exit(exitCode)
