#!/usr/bin/env node
// =====================================================================
// B.E.S.T Coach — the disposable-stack ISOLATION AND TEARDOWN PROOF
// =====================================================================
// Run: node scripts/physical-test/prove-disposable-isolation.mjs
//
// This proof REQUIRES NO PASSWORD AND NO INTERACTIVE TERMINAL. It can be
// run autonomously, and it is the evidence that operator ruling R-C2-2 is
// satisfiable: it REALLY provisions the disposable Supabase stack, REALLY
// asserts isolation against the running canonical stack, then REALLY tears
// the disposable stack down and proves the canonical database is unchanged
// and that no disposable container, volume or port remains.
//
// A proof that merely asserted intentions would be worthless. Every check
// below is a MEASUREMENT taken from Docker, from a port bind, or from a
// read-only query against the canonical container's own psql.
//
// It performs NO governed write anywhere — not on the canonical database
// (which R-C2-2 protects) and not even on the disposable one (which the
// writable walkthrough owns). Its subject is the ENVIRONMENT, not the
// lifecycle.
//
// TEARDOWN RUNS ON EVERY EXIT PATH — success, failure, Ctrl+C and an
// unexpected exception. A proof that could leave a stack behind would be a
// worse hazard than the thing it proves.
// =====================================================================

import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import os from 'node:os'
import { join, resolve } from 'node:path'

import {
  CANONICAL_API_PORT,
  CANONICAL_CONTAINERS,
  CANONICAL_DB_PORT,
  CANONICAL_INBUCKET_PORT,
  CANONICAL_PROJECT_ID,
  CANONICAL_STUDIO_PORT,
  DISPOSABLE_API_PORT,
  DISPOSABLE_APP_PORT,
  DISPOSABLE_DB_CONTAINER,
  DISPOSABLE_DB_PORT,
  DISPOSABLE_DEBUG_PORT,
  DISPOSABLE_INBUCKET_PORT,
  DISPOSABLE_PROJECT_ID,
  DISPOSABLE_PUBLISHED_PORTS,
  DISPOSABLE_STUDIO_PORT,
  EXPECTED_CANONICAL_MIGRATIONS,
  REPO_ROOT,
  SafeError,
  assertCanonicalConfigUntouched,
  assertCanonicalPristine,
  assertNoCollision,
  assertPortFree,
  assertPortStillHeld,
  captureDisposableStatus,
  containerHealth,
  createDisposableWorkdir,
  destroyDisposableWorkdir,
  diffCanonical,
  disposableContainersPresent,
  disposableVolumesPresent,
  info,
  isPortFree,
  pass,
  portAnswers,
  phase,
  readCanonical,
  readDisposableCensus,
  resolveLocalCli,
  runningContainers,
  say,
  startDisposableStack,
  stopDisposableStack,
  waitForPortReleased,
  waitForPortSilent,
  warn,
} from './disposable-stack.mjs'

// ---------------------------------------------------------------------
// The proof ledger. Every check gets its own line and FAILS CLOSED: a
// check that is never reached is NOT-RUN, never PASS, and the process
// exits non-zero unless every check PASSED.
// ---------------------------------------------------------------------

const CHECK_TITLES = new Map([
  ['I-1', 'Canonical config.toml is unmodified and still pins the canonical project id and ports'],
  ['I-2', 'No disposable identifier collides with a canonical identifier'],
  ['I-3', 'The canonical stack is running and its fixture database is pristine BEFORE provisioning'],
  ['I-4', 'No disposable container, volume or port exists before provisioning'],
  ['I-5', 'The disposable workdir replays the ten committed migrations byte-identically, outside the repository'],
  ['I-6', 'The disposable stack started under its own DISTINCT project id'],
  ['I-7', 'The disposable containers are distinct from every canonical container'],
  ['I-8', 'The disposable published ports are distinct from every canonical published port'],
  ['I-9', 'The disposable API URL is loopback, on the disposable port, and is NOT the canonical API'],
  ['I-10', 'All ten committed migrations applied on the disposable database, with the expected schema census'],
  ['I-11', 'The disposable database is its own empty database — no canonical row was inherited'],
  ['I-12', 'Every canonical container is STILL running and healthy while the disposable stack is up'],
  ['I-13', 'Every canonical published port is STILL served while the disposable stack is up'],
  ['I-14', 'The canonical fixture database is UNCHANGED while the disposable stack is up'],
  ['I-15', 'Teardown removed every disposable container'],
  ['I-16', 'Teardown removed every disposable data volume'],
  ['I-17', 'Teardown released every disposable port (refuses connections AND re-bindable)'],
  ['I-18', 'Teardown removed the disposable workdir'],
  ['I-19', 'The canonical fixture database is byte-identical AFTER teardown (independent re-read)'],
  ['I-20', 'The canonical stack is STILL running after teardown'],
])

const ledger = new Map()

function check(id, verdict, reason) {
  if (!CHECK_TITLES.has(id)) throw new SafeError(`Unknown check id: ${id}`)
  if (ledger.has(id)) throw new SafeError(`Check ${id} was decided twice.`)
  if (!['PASS', 'FAIL', 'NOT-RUN'].includes(verdict)) {
    throw new SafeError(`Check ${id} was given an unsupported verdict.`)
  }
  ledger.set(id, { verdict, reason })
  if (verdict === 'PASS') pass(`${id} ${reason}`)
  else warn(`${id} ${verdict} — ${reason}`)
}

function checkFrom(id, ok, passReason, failReason) {
  check(id, ok ? 'PASS' : 'FAIL', ok ? passReason : failReason)
}

/** Nothing is ever defaulted to PASS. */
function closeLedger(defaultReason) {
  for (const id of CHECK_TITLES.keys()) {
    if (!ledger.has(id)) ledger.set(id, { verdict: 'NOT-RUN', reason: defaultReason })
  }
}

// ---------------------------------------------------------------------
// Arguments. There is deliberately NO argument that carries, names or
// points at a credential, and an unknown argument aborts before anything.
// ---------------------------------------------------------------------

const HELP = `
B.E.S.T Coach — disposable-stack isolation and teardown proof

  node scripts/physical-test/prove-disposable-isolation.mjs
  node scripts/physical-test/prove-disposable-isolation.mjs --help

WHAT IT DOES
  Really provisions the disposable Supabase stack "${DISPOSABLE_PROJECT_ID}",
  really asserts it is isolated from the canonical stack "${CANONICAL_PROJECT_ID}",
  really tears it down, and really re-reads the canonical database to prove
  it is unchanged. It needs no password and no terminal, and it performs no
  governed write on any database.

WHAT IT WILL NEVER DO
  * Prompt for, accept, read, print or persist any credential.
  * Modify supabase/config.toml, any committed migration, or any canonical
    container, database, volume or port.
  * Call "supabase stop --all", which would stop the canonical stack.

OPTIONS
  --help  print this and exit 0.
`

function parseArgs(argv) {
  const args = argv.slice(2)
  let help = false
  for (const arg of args) {
    if (arg === '--help' || arg === '-h') help = true
    else {
      // The argument is NOT echoed back. An operator who mistyped a secret
      // onto the command line must not see it repeated to the terminal.
      throw new SafeError(
        'Unsupported argument. This proof accepts only --help. It takes no credential of any kind, ' +
          'from any source, and there is no argument that supplies one.',
      )
    }
  }
  return { help }
}

// ---------------------------------------------------------------------
// Teardown state. Populated AS THINGS ARE ACQUIRED, so a failure or a
// signal at any point can still name exactly what has to be removed.
// ---------------------------------------------------------------------

const acquired = { cli: null, workdir: null, stackStarted: false }
const readings = { canonicalBefore: null, canonicalAfter: null }

let teardownPromise = null
function teardown() {
  if (teardownPromise === null) teardownPromise = runTeardown()
  return teardownPromise
}

/**
 * Stop and remove ONLY the disposable stack, then MEASURE the removal. The
 * measurements populate I-15..I-18; nothing here is assumed from the exit
 * code of the stop command alone, because a stop that reported success and
 * left a container behind is precisely the failure this proof exists to
 * catch.
 */
async function runTeardown() {
  if (!acquired.stackStarted && acquired.workdir === null) return

  phase('Teardown — the disposable stack only')

  if (acquired.stackStarted && acquired.cli !== null) {
    const status = stopDisposableStack(acquired.cli, acquired.workdir)
    info(`supabase stop --project-id ${DISPOSABLE_PROJECT_ID} --no-backup exit ${status}`)
  } else {
    info('no disposable stack was started; nothing to stop')
  }

  if (acquired.stackStarted) {
    const containers = disposableContainersPresent()
    if (!ledger.has('I-15')) {
      checkFrom(
        'I-15',
        containers.length === 0,
        `docker ps -a lists 0 containers whose name ends in "_${DISPOSABLE_PROJECT_ID}"`,
        `${containers.length} disposable container(s) survived teardown: ${containers.join(', ')}`,
      )
    }

    const volumes = disposableVolumesPresent()
    if (!ledger.has('I-16')) {
      checkFrom(
        'I-16',
        volumes.length === 0,
        `docker volume ls lists 0 volumes naming "${DISPOSABLE_PROJECT_ID}"`,
        `${volumes.length} disposable volume(s) survived teardown: ${volumes.join(', ')}`,
      )
    }

    const released = []
    for (const port of DISPOSABLE_PUBLISHED_PORTS) {
      // Silence FIRST: a released port is one no listener answers on. That is
      // the portable claim. Bindability is then confirmed as a second,
      // independent instrument, because on Windows a specific-address bind can
      // succeed against a Docker-published 0.0.0.0 port and so cannot by
      // itself prove a port is free.
      const silent = await waitForPortSilent(port)
      released.push({ port, silent, bindable: await waitForPortReleased(port, 5_000) })
    }
    if (!ledger.has('I-17')) {
      const held = released.filter((entry) => !entry.silent || !entry.bindable)
      checkFrom(
        'I-17',
        held.length === 0,
        `ports ${DISPOSABLE_PUBLISHED_PORTS.join(', ')} each REFUSE a TCP connection and are each re-bindable — two ` +
          'independent instruments agreeing that no disposable listener remains',
        `still serving or unbindable: ${held.map((entry) => `${entry.port} (silent=${entry.silent}, bindable=${entry.bindable})`).join(', ')}`,
      )
    }
  }

  const workdirRemoved = destroyDisposableWorkdir()
  if (!ledger.has('I-18')) {
    checkFrom(
      'I-18',
      workdirRemoved && !existsSync(acquired.workdir ?? ''),
      'the temporary disposable workdir was deleted; nothing it contained was ever inside the repository',
      'the temporary disposable workdir could not be deleted',
    )
  }
}

// ---------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------

async function main() {
  const options = parseArgs(process.argv)
  if (options.help) {
    say(HELP.trim())
    return
  }

  say('B.E.S.T Coach — disposable-stack isolation and teardown proof (R-C2-2)')
  say('No password. No terminal. No governed write. Every verdict below is a measurement.')

  /* ------------------------------------------------------------------
   * I-1 / I-2 — refuse before provisioning anything.
   * ----------------------------------------------------------------- */
  phase('Before anything is provisioned')

  const config = assertCanonicalConfigUntouched()
  check(
    'I-1',
    'PASS',
    `supabase/config.toml (${config.bytes} bytes, sha256 ${config.sha256.slice(0, 16)}…) still pins project id ` +
      `"${CANONICAL_PROJECT_ID}", [api] ${CANONICAL_API_PORT}, [db] ${CANONICAL_DB_PORT}, and no project reference exists`,
  )

  const distinct = assertNoCollision()
  check(
    'I-2',
    'PASS',
    `disposable project id "${distinct.projectId}" differs from "${CANONICAL_PROJECT_ID}"; ports ` +
      `${distinct.ports.join(', ')} collide with none of ${CANONICAL_API_PORT}/${CANONICAL_DB_PORT}/` +
      `${CANONICAL_STUDIO_PORT}/${CANONICAL_INBUCKET_PORT}/3000/3417/9417; ${distinct.emails} identity addresses ` +
      'are distinct from all three canonical fixture addresses',
  )

  const running = runningContainers()
  const canonicalMissing = CANONICAL_CONTAINERS.filter((name) => !running.has(name))
  if (canonicalMissing.length > 0) {
    throw new SafeError(
      `${canonicalMissing.length} canonical container(s) are not running: ${canonicalMissing.join(', ')}. ` +
        'This proof reads the canonical database and refuses to start it, stop it or repair it.',
    )
  }

  readings.canonicalBefore = readCanonical()
  assertCanonicalPristine(readings.canonicalBefore, 'before provisioning')
  check(
    'I-3',
    'PASS',
    `all ${CANONICAL_CONTAINERS.length} canonical containers are running; the fixture checksum is ` +
      `${readings.canonicalBefore.checksum.sha256} over ${readings.canonicalBefore.checksum.rows} rows and the census ` +
      `(reports|versions|version_ratings|corrections|observations|obs_ratings|events|heads|users|migrations|fn|tbl|pol) ` +
      `is ${readings.canonicalBefore.census}`,
  )

  const strayContainers = disposableContainersPresent()
  const strayVolumes = disposableVolumesPresent()
  const busyPorts = []
  for (const port of DISPOSABLE_PUBLISHED_PORTS) {
    // BOTH instruments: a port that answers a connect is in use even where a
    // specific-address bind would still succeed, and vice versa.
    if (!(await isPortFree(port)) || (await portAnswers(port))) busyPorts.push(port)
  }
  checkFrom(
    'I-4',
    strayContainers.length === 0 && strayVolumes.length === 0 && busyPorts.length === 0,
    `0 containers, 0 volumes and 0 held ports named or numbered for "${DISPOSABLE_PROJECT_ID}" existed beforehand`,
    `stray containers: ${strayContainers.join(', ') || 'none'}; stray volumes: ${strayVolumes.join(', ') || 'none'}; ` +
      `held ports: ${busyPorts.join(', ') || 'none'}`,
  )
  if (strayContainers.length > 0 || strayVolumes.length > 0 || busyPorts.length > 0) {
    throw new SafeError('Disposable residue already exists. Refusing to provision on top of it.')
  }

  for (const port of DISPOSABLE_PUBLISHED_PORTS) await assertPortFree(port, 'disposable stack')

  /* ------------------------------------------------------------------
   * I-5 — the workdir, synthesized outside the repository.
   * ----------------------------------------------------------------- */
  phase('Disposable workdir (outside the repository)')
  const cli = resolveLocalCli()
  acquired.cli = cli
  info(`CLI resolved as: ${cli.form}`)

  const { workdir, migrations } = createDisposableWorkdir()
  acquired.workdir = workdir
  const insideRepo = resolve(workdir).toLowerCase().startsWith(resolve(REPO_ROOT).toLowerCase())
  checkFrom(
    'I-5',
    migrations.length === EXPECTED_CANONICAL_MIGRATIONS && !insideRepo,
    `${migrations.length} committed migrations copied under ${os.tmpdir()} and each verified byte-identical to its ` +
      'source by SHA-256; the workdir is outside the repository so nothing it holds can be committed',
    `${migrations.length} migration(s) copied; workdir inside repository = ${insideRepo}`,
  )

  /* ------------------------------------------------------------------
   * I-6 .. I-11 — provision, then measure.
   * ----------------------------------------------------------------- */
  phase('Provisioning the disposable stack (this really starts containers)')
  info('CLI stdout and stderr are captured and DISCARDED: the CLI prints local keys on success')
  const started = startDisposableStack(cli, workdir)
  acquired.stackStarted = true
  check('I-6', 'PASS', `the disposable stack started in ${Math.round(started.elapsedMs / 1000)}s under project id "${DISPOSABLE_PROJECT_ID}"`)

  const nowRunning = runningContainers()
  const disposableRunning = [...nowRunning].filter((name) => name.endsWith(`_${DISPOSABLE_PROJECT_ID}`)).sort()
  const overlap = disposableRunning.filter((name) => CANONICAL_CONTAINERS.includes(name))
  checkFrom(
    'I-7',
    disposableRunning.length > 0 && overlap.length === 0 && disposableRunning.includes(DISPOSABLE_DB_CONTAINER),
    `${disposableRunning.length} disposable containers are running (${disposableRunning.join(', ')}) and NOT ONE of ` +
      'them is a canonical container name',
    overlap.length > 0
      ? `these container names are shared with the canonical stack: ${overlap.join(', ')}`
      : `${disposableRunning.length} disposable containers are running; the disposable database container was not among them`,
  )

  const canonicalPortSet = new Set([
    CANONICAL_API_PORT,
    CANONICAL_DB_PORT,
    CANONICAL_STUDIO_PORT,
    CANONICAL_INBUCKET_PORT,
  ])
  const shared = DISPOSABLE_PUBLISHED_PORTS.filter((port) => canonicalPortSet.has(port))
  checkFrom(
    'I-8',
    shared.length === 0,
    `the disposable stack publishes API ${DISPOSABLE_API_PORT}, DB ${DISPOSABLE_DB_PORT}, Studio ` +
      `${DISPOSABLE_STUDIO_PORT} and Inbucket ${DISPOSABLE_INBUCKET_PORT}; the canonical stack keeps ` +
      `${CANONICAL_API_PORT}/${CANONICAL_DB_PORT}/${CANONICAL_STUDIO_PORT}/${CANONICAL_INBUCKET_PORT} and the two sets ` +
      `are disjoint (app port ${DISPOSABLE_APP_PORT} avoids 3000 and 3417; CDP port ${DISPOSABLE_DEBUG_PORT} avoids 9417)`,
    `these ports are shared with the canonical stack: ${shared.join(', ')}`,
  )

  // Captured into process memory only. Nothing below prints or stores it.
  const connection = captureDisposableStatus(cli, workdir)
  const apiPortIsDisposable = new URL(connection.apiUrl).port === String(DISPOSABLE_API_PORT)
  check(
    'I-9',
    apiPortIsDisposable ? 'PASS' : 'FAIL',
    apiPortIsDisposable
      ? `the disposable API URL is loopback on port ${DISPOSABLE_API_PORT}, captured into process memory only from the ` +
        "DISPOSABLE stack's own status output — .env.local was never read and no key was printed, written or serialized"
      : 'the disposable API URL did not carry the disposable API port',
  )

  const disposableCensus = readDisposableCensus()
  checkFrom(
    'I-10',
    disposableCensus.appliedMigrations === EXPECTED_CANONICAL_MIGRATIONS &&
      disposableCensus.migrations === readings.canonicalBefore.migrations,
    `all ${disposableCensus.appliedMigrations} committed migrations applied, in the same order and with the same ` +
      `versions as the canonical database; the disposable schema census is ${disposableCensus.publicFunctions} public ` +
      `functions, ${disposableCensus.publicTables} tables, ${disposableCensus.publicPolicies} policies`,
    `applied migrations ${disposableCensus.appliedMigrations} (expected ${EXPECTED_CANONICAL_MIGRATIONS}); ` +
      `migration list identical to canonical = ${disposableCensus.migrations === readings.canonicalBefore.migrations}`,
  )

  checkFrom(
    'I-11',
    disposableCensus.reports === 0 && disposableCensus.auditEvents === 0 && disposableCensus.authUsers === 0,
    'the disposable database holds 0 reports, 0 audit events and 0 Auth users — it is a fresh schema built from the ' +
      'committed migrations, NOT a copy or a share of the canonical data',
    `disposable reports=${disposableCensus.reports}, audit_events=${disposableCensus.auditEvents}, ` +
      `auth.users=${disposableCensus.authUsers}; a non-zero value means canonical state leaked in`,
  )

  /* ------------------------------------------------------------------
   * I-12 .. I-14 — the canonical stack, WHILE the disposable stack is up.
   * ----------------------------------------------------------------- */
  phase('Canonical stack, while the disposable stack is running')

  const unhealthy = []
  for (const name of CANONICAL_CONTAINERS) {
    const state = containerHealth(name)
    if (state === null || state.state !== 'running') {
      unhealthy.push(`${name}=${state === null ? 'unreadable' : state.state}`)
    } else if (state.health !== 'none' && state.health !== 'healthy') {
      unhealthy.push(`${name}=${state.health}`)
    }
  }
  checkFrom(
    'I-12',
    unhealthy.length === 0,
    `all ${CANONICAL_CONTAINERS.length} canonical containers report state=running and (where a healthcheck exists) ` +
      'health=healthy, with the disposable stack up alongside them',
    `not running or not healthy: ${unhealthy.join(', ')}`,
  )

  const canonicalPortsHeld = []
  for (const [port, what] of [
    [CANONICAL_API_PORT, 'API'],
    [CANONICAL_DB_PORT, 'database'],
    [CANONICAL_STUDIO_PORT, 'Studio'],
    [CANONICAL_INBUCKET_PORT, 'Inbucket'],
  ]) {
    try {
      await assertPortStillHeld(port, what)
      canonicalPortsHeld.push(port)
    } catch {
      // Recorded by the check below; never thrown past it.
    }
  }
  checkFrom(
    'I-13',
    canonicalPortsHeld.length === 4,
    `canonical ports ${canonicalPortsHeld.join(', ')} each still ACCEPT a TCP connection — the canonical services are ` +
      'still listening on all four and the disposable stack took none of them',
    `only ${canonicalPortsHeld.length}/4 canonical ports accepted a connection`,
  )

  const canonicalDuring = readCanonical()
  const duringDiff = diffCanonical(readings.canonicalBefore, canonicalDuring)
  checkFrom(
    'I-14',
    duringDiff.length === 0,
    'with the disposable stack fully up, the canonical fixture checksum, census, migration list and Auth user id set ' +
      'are all identical to the reading taken before provisioning',
    duringDiff.join(' | '),
  )

  /* ------------------------------------------------------------------
   * Teardown, then the independent canonical re-read.
   * ----------------------------------------------------------------- */
  await teardown()

  phase('Canonical stack, after teardown (independent re-read)')
  readings.canonicalAfter = readCanonical()
  const afterDiff = diffCanonical(readings.canonicalBefore, readings.canonicalAfter)
  const residueOk =
    readings.canonicalAfter.counts.reports === 0 &&
    readings.canonicalAfter.counts.reportVersions === 0 &&
    readings.canonicalAfter.counts.reportVersionRatings === 0 &&
    readings.canonicalAfter.counts.auditEvents === 0 &&
    readings.canonicalAfter.counts.chainHeads === 0 &&
    readings.canonicalAfter.counts.authUsers === 3
  checkFrom(
    'I-19',
    afterDiff.length === 0 && residueOk,
    `re-read independently after teardown: checksum ${readings.canonicalAfter.checksum.sha256} over ` +
      `${readings.canonicalAfter.checksum.rows} rows (unchanged); reports=0, report_versions=0, ` +
      'report_version_ratings=0, audit_events=0, audit_chain_heads=0, auth.users=3; the applied-migration list and ' +
      'the Auth user id set are unchanged',
    afterDiff.length > 0 ? afterDiff.join(' | ') : `residue is non-zero: ${readings.canonicalAfter.census}`,
  )

  const stillRunning = runningContainers()
  const goneAfter = CANONICAL_CONTAINERS.filter((name) => !stillRunning.has(name))
  checkFrom(
    'I-20',
    goneAfter.length === 0,
    `all ${CANONICAL_CONTAINERS.length} canonical containers are still running after the disposable stack was removed`,
    `these canonical containers are no longer running: ${goneAfter.join(', ')}`,
  )
}

// ---------------------------------------------------------------------
// Evidence. Written OUTSIDE Git. Redacted by construction: only check ids,
// verdicts, authored reasons, counts, port numbers, container names and
// PUBLIC checksums. There is no field here a credential could occupy.
// ---------------------------------------------------------------------

function evidenceDirectory() {
  const configured = process.env.BEST_COACH_F17_DISPOSABLE_EVIDENCE_DIR
  // The default is a SIBLING of the repository, so the ledger lives outside
  // Git as required. It is deliberately NOT the F17 checkpoint-evidence pack:
  // that pack is the canonical runner's, and this proof must not overwrite,
  // interleave with or be mistaken for `run-f17.mjs`'s own gate ledger.
  const target =
    configured && configured.length > 0
      ? resolve(configured)
      : resolve(REPO_ROOT, '..', '_f17-disposable-evidence')
  mkdirSync(target, { recursive: true })
  return target
}

function writeProofLedger() {
  const lines = []
  lines.push('# F17 — disposable-stack isolation and teardown proof')
  lines.push('')
  lines.push('Produced by `node scripts/physical-test/prove-disposable-isolation.mjs`.')
  lines.push('REDACTED BY CONSTRUCTION: check ids, verdicts, authored reasons, counts, port numbers,')
  lines.push('container names and public checksums only. No password, token, key or connection string.')
  lines.push('')
  lines.push(`- Completed: ${new Date().toISOString()}`)
  lines.push(`- Canonical project: ${CANONICAL_PROJECT_ID} (left running and untouched)`)
  lines.push(`- Disposable project: ${DISPOSABLE_PROJECT_ID} (provisioned, then removed)`)
  lines.push(`- Canonical checksum before: ${readings.canonicalBefore?.checksum.sha256 ?? 'not read'}`)
  lines.push(`- Canonical checksum after:  ${readings.canonicalAfter?.checksum.sha256 ?? 'not read'}`)
  lines.push('')
  lines.push('| Check | Verdict | Reason |')
  lines.push('|---|---|---|')
  for (const [id, title] of CHECK_TITLES) {
    const entry = ledger.get(id) ?? { verdict: 'NOT-RUN', reason: 'not reached' }
    lines.push(`| **${id}** ${title} | ${entry.verdict} | ${entry.reason.replace(/\|/g, '/')} |`)
  }
  lines.push('')
  try {
    const directory = evidenceDirectory()
    writeFileSync(join(directory, 'disposable-isolation-proof.md'), `${lines.join('\n')}\n`, 'utf8')
    say('')
    say(`Redacted proof ledger written to ${directory}`)
  } catch {
    say('')
    say('The proof ledger could not be written to the external evidence pack.')
  }
}

function printLedger() {
  phase('Proof ledger')
  for (const [id, title] of CHECK_TITLES) {
    const entry = ledger.get(id) ?? { verdict: 'NOT-RUN', reason: 'not reached' }
    say(`  ${entry.verdict.padEnd(7)} ${id.padEnd(5)} ${title}`)
    say(`          ${entry.reason}`)
  }
}

let finished = false
async function finish() {
  if (finished) return
  finished = true
  if (ledger.size === 0) return
  closeLedger('not reached: the proof ended before this check could be decided')
  printLedger()
  writeProofLedger()
}

let interrupted = false
const onSignal = () => {
  if (interrupted) return
  interrupted = true
  process.stdout.write('\nAborting. Removing the disposable stack, then writing the ledger.\n')
  process.exitCode = 130
  const hardStop = setTimeout(() => process.exit(130), 300_000)
  if (typeof hardStop.unref === 'function') hardStop.unref()
  void (async () => {
    try {
      await teardown()
    } catch {
      // Teardown must never mask the abort, and never surfaces captured output.
    }
    try {
      await finish()
    } catch {
      // Neither must the ledger.
    }
    process.exit(130)
  })()
}
process.on('SIGINT', onSignal)
process.on('SIGTERM', onSignal)

main()
  .catch((error) => {
    const message = error instanceof SafeError ? error.message : 'The disposable isolation proof failed.'
    process.stderr.write(`\nFAILED: ${message}\n`)
    process.exitCode = 1
  })
  .then(async () => {
    // Teardown runs whether main resolved, threw, or was never reached.
    try {
      await teardown()
    } catch {
      // Never surfaces captured output.
    }
    await finish()
    const bad = [...ledger.values()].filter((entry) => entry.verdict !== 'PASS').length
    if (bad > 0 && process.exitCode !== 130) process.exitCode = 1
  })
