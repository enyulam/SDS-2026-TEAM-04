#!/usr/bin/env node
// =====================================================================
// B.E.S.T Coach — §7.4a MANDATORY SERVING DISCIPLINE
// (HERO V3 EXECUTION OVERLAY §4.5 — S-1 · S-2 · S-3)
// =====================================================================
//
// WHY THIS FILE EXISTS AS A MODULE OF ITS OWN.
//
// The overlay's S-1 says the three AI provider selectors must be
// OVERWRITTEN — never deleted — in EVERY SERVED CHILD PROCESS, and then
// READ BACK. "Every" is a structural claim, and a structural claim cannot
// be kept by remembering to do the right thing at each call site. Stage 2
// serves `next dev`; Stage 3 serves `next start`; the disposable-app proof
// serves its own. If each of those constructs its own child environment,
// then "every served child process is disciplined" is an intention, not a
// property.
//
// So the environment is constructed HERE, once, and every serving path in
// this repository is expected to obtain its child environment from
// `buildServedChildEnv()`. This module deliberately imports NOTHING but
// Node built-ins — no disposable stack, no Docker, no Supabase — so that
// an ordinary local `next dev` can be disciplined without dragging in the
// canonical-stack harness.
//
// ---------------------------------------------------------------------
// WHAT "READ THEM BACK" HAS TO MEAN
// ---------------------------------------------------------------------
// Checking the object you just wrote proves the assignment executed. It
// does NOT prove the served process resolves that value, because `next`
// runs `@next/env`'s `loadEnvConfig()` at startup against the repository's
// own `.env.local` — which on this machine carries a REAL `LLM_API_KEY`.
// An earlier run of this project DELETED the selectors, `@next/env`
// refilled them from `.env.local`, the real provider became reachable and
// the run was billed.
//
// The read-back here therefore runs `loadEnvConfig()` FOR REAL, in a
// separate child, with the same cwd `next` uses and the same child
// environment `spawn` would receive, and reads the three selectors back
// AFTERWARDS. `prove-serving-discipline.mjs` additionally runs the
// DELETION case as a negative control, so the read-back assertion is
// demonstrated CAPABLE OF FAILING rather than merely passing (overlay
// §4.6).
//
// ---------------------------------------------------------------------
// NOTHING SECRET IS EVER SURFACED
// ---------------------------------------------------------------------
// No selector VALUE is printed, returned, logged, hashed, written to a
// file, or interpolated into any error or probe line anywhere in this
// module. The probe emits a three-valued STATUS per selector
// (`EQUALS_LITERAL` / `PRESENT_DIFFERENT` / `ABSENT`) and nothing else,
// which is exactly enough to decide the gate and never enough to disclose
// the operator's key. `PRESENT_DIFFERENT` is the negative control's
// expected reading and is the closest this file ever comes to observing
// the real key — it observes only that the key is not the literal.
// =====================================================================

import { spawn, spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
export const REPO_ROOT = resolve(HERE, '..', '..')

/** The three ratified AI provider selectors. Overwritten together, always. */
export const PROVIDER_SELECTORS = Object.freeze(['LLM_PROVIDER', 'LLM_MODEL', 'LLM_API_KEY'])

/**
 * The non-credential literal every selector is overwritten with.
 *
 * It is authored in this repository, matches NEITHER ratified selector
 * (proven at run time, not asserted here), and is not a credential of any
 * kind. `requireRatifiedLlmConfig()` compares `LLM_PROVIDER` by STRICT
 * EQUALITY against `"openai"`, so this value makes the provider check fail
 * with `E_SRV_LLM_PROVIDER` BEFORE any provider object is constructed and
 * before `LLM_API_KEY` is even read.
 */
export const PROVIDER_NEUTRALISING_LITERAL = 'disabled-by-best-coach-serving-discipline-s1'

/** S-2's variable. Its PRESENCE is a HALT, never an authorization. */
export const REAL_PROVIDER_LEG_VARIABLE = 'BEST_COACH_RUN_REAL_PROVIDER_LEG'

/**
 * Next.js telemetry is an OUTWARD REQUEST from the served child process.
 *
 * S-3 arms a trip-wire on non-loopback peers held by the served process
 * tree. Telemetry would trip it — and a trip-wire that is expected to fire
 * for a benign reason is a trip-wire that gets ignored. It is disabled in
 * the served environment so that ANY non-loopback peer is a real finding.
 */
export const TELEMETRY_VARIABLE = 'NEXT_TELEMETRY_DISABLED'

/**
 * Where the ratified selectors are declared. BOTH are searched and their
 * results combined, because Run C3-C moved `ACCEPTED_LLM_PROVIDER` /
 * `ACCEPTED_LLM_MODEL` out of `env.ts` into `llm-config.ts` and a guard
 * pinned to one path found zero selectors and refused to serve. That
 * fail-closed refusal was the control working; pinning one path again
 * would re-arm the same trap for the next refactor.
 */
const RATIFIED_SELECTOR_SOURCES = [
  ['server', 'platform', 'llm-config.ts'],
  ['server', 'platform', 'env.ts'],
]

/** The minimum number of ratified selectors that must actually be READ. */
const MINIMUM_RATIFIED_SELECTORS = 2

export class ServingDisciplineError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ServingDisciplineError'
  }
}

// ---------------------------------------------------------------------
// S-1, part 1 — the neutralising literal must not BE a ratified selector
// ---------------------------------------------------------------------

/**
 * Read the ratified provider and model literals out of the application's
 * own source and prove the neutralising literal is neither of them.
 *
 * Fails closed three ways: fewer than two selectors read (the contract
 * moved and this guard can no longer prove anything), the literal is one
 * of them, or no source file exists at all.
 */
export function assertNeutralisingLiteralIsUnratified() {
  const accepted = []
  const searched = []
  for (const segments of RATIFIED_SELECTOR_SOURCES) {
    const path = join(REPO_ROOT, ...segments)
    searched.push(segments.join('/'))
    if (!existsSync(path)) continue
    const source = readFileSync(path, 'utf8')
    for (const match of source.matchAll(/const ACCEPTED_LLM_(?:PROVIDER|MODEL)\s*=\s*"([^"]+)"/g)) {
      accepted.push(match[1])
    }
  }
  if (accepted.length < MINIMUM_RATIFIED_SELECTORS) {
    throw new ServingDisciplineError(
      `The ratified AI provider and model selectors could not be read from any of ${searched.join(' or ')} ` +
        `(${accepted.length} found, ${MINIMUM_RATIFIED_SELECTORS} required), so this run cannot prove its ` +
        'neutralising literal is not one of them. Refusing to serve.',
    )
  }
  if (accepted.includes(PROVIDER_NEUTRALISING_LITERAL)) {
    throw new ServingDisciplineError(
      'The literal the serving discipline overwrites the AI provider selectors with is now a RATIFIED selector. ' +
        'Refusing to serve: a served process would be capable of activating a real provider.',
    )
  }
  return { ratifiedSelectorsRead: accepted.length, searched }
}

// ---------------------------------------------------------------------
// S-2 — the real-provider leg variable must be UNSET
// ---------------------------------------------------------------------

/**
 * Assert `BEST_COACH_RUN_REAL_PROVIDER_LEG` is unset in THIS process.
 *
 * Its presence is a HALT. It is not an authorization and no code path in
 * this repository may treat it as one; `REAL PROVIDER CALLS: ZERO
 * AUTHORIZED` (overlay §4.4) is not something an environment variable can
 * change.
 */
export function assertRealProviderLegUnset(env = process.env) {
  if (REAL_PROVIDER_LEG_VARIABLE in env) {
    throw new ServingDisciplineError(
      `${REAL_PROVIDER_LEG_VARIABLE} is SET. Under overlay §4.5 S-2 its presence is a HALT, not an ` +
        'authorization. Nothing was served and nothing was run.',
    )
  }
  return true
}

/**
 * Assert the real-provider leg variable is not declared in `.env.local`
 * either.
 *
 * S-2 deletes it from the child environment — and unlike the three
 * selectors, deletion is the CORRECT treatment here, because the variable
 * must be absent rather than neutralised. But `@next/env` refills any
 * absent key from `.env.local`, so deletion is only safe while the file
 * does not declare it. This checks that precondition instead of assuming
 * it. Only KEY NAMES are read; no value is parsed, stored or returned.
 */
export function assertRealProviderLegAbsentFromEnvFiles() {
  const declaredIn = []
  for (const name of ['.env.local', '.env.development.local', '.env.production.local', '.env', '.env.development', '.env.production']) {
    const path = join(REPO_ROOT, name)
    if (!existsSync(path)) continue
    for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
      const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/)
      if (match && match[1] === REAL_PROVIDER_LEG_VARIABLE) declaredIn.push(name)
    }
  }
  if (declaredIn.length > 0) {
    throw new ServingDisciplineError(
      `${REAL_PROVIDER_LEG_VARIABLE} is declared in ${declaredIn.join(', ')}. Deleting it from the child ` +
        'environment would be silently undone by @next/env. Refusing to serve.',
    )
  }
  return { filesChecked: true }
}

// ---------------------------------------------------------------------
// S-1, part 2 — build the disciplined child environment
// ---------------------------------------------------------------------

/**
 * Build the environment for a served child process.
 *
 * THE THREE SELECTORS ARE OVERWRITTEN, NEVER DELETED. That distinction is
 * the entire point of S-1 and is measured, not assumed: `@next/env` fills
 * any key the child environment does not already carry from the
 * application's own `.env.local`, so a DELETED selector is silently
 * restored and the real provider becomes reachable again. Overwriting also
 * means the operator's real `LLM_API_KEY` never enters the served process
 * at all — its value is never read, assigned, printed or hashed here.
 *
 * Returns the environment AND a record of what was done, so a caller's
 * ledger can be written from what actually happened rather than from what
 * this function was supposed to do.
 */
export function buildServedChildEnv(overrides = {}, base = process.env) {
  const literalCheck = assertNeutralisingLiteralIsUnratified()
  assertRealProviderLegUnset(base)
  assertRealProviderLegAbsentFromEnvFiles()

  const childEnv = { ...base }

  // S-2: absent in, absent out. Verified, not assumed.
  delete childEnv[REAL_PROVIDER_LEG_VARIABLE]
  if (REAL_PROVIDER_LEG_VARIABLE in childEnv) {
    throw new ServingDisciplineError(
      `${REAL_PROVIDER_LEG_VARIABLE} could not be removed from the served child environment.`,
    )
  }

  // S-3 precondition: no benign outward request may share the trip-wire.
  childEnv[TELEMETRY_VARIABLE] = '1'

  const overwritten = []
  for (const selector of PROVIDER_SELECTORS) {
    childEnv[selector] = PROVIDER_NEUTRALISING_LITERAL
    if (childEnv[selector] !== PROVIDER_NEUTRALISING_LITERAL) {
      throw new ServingDisciplineError(
        `The AI provider selector ${selector} could not be neutralised in the served child environment. ` +
          'Refusing to serve: this run must be structurally incapable of activating a real provider.',
      )
    }
    overwritten.push(selector)
  }

  for (const [key, value] of Object.entries(overrides)) {
    if (PROVIDER_SELECTORS.includes(key) || key === REAL_PROVIDER_LEG_VARIABLE) {
      throw new ServingDisciplineError(
        `A caller attempted to override the governed variable ${key} in a served child environment. ` +
          'The serving discipline owns these and they are not overridable.',
      )
    }
    childEnv[key] = value
  }

  return {
    env: childEnv,
    record: {
      overwritten,
      deleted: [REAL_PROVIDER_LEG_VARIABLE],
      telemetryDisabled: childEnv[TELEMETRY_VARIABLE] === '1',
      ratifiedSelectorsRead: literalCheck.ratifiedSelectorsRead,
      literalIsUnratified: true,
    },
  }
}

// ---------------------------------------------------------------------
// S-1, part 3 — THE READ-BACK, through the real `@next/env` loader
// ---------------------------------------------------------------------

/** The three-valued status a probe reports for one selector. */
export const SELECTOR_STATUS = Object.freeze({
  EQUALS_LITERAL: 'EQUALS_LITERAL',
  PRESENT_DIFFERENT: 'PRESENT_DIFFERENT',
  ABSENT: 'ABSENT',
})

function statusOf(value) {
  if (value === undefined) return SELECTOR_STATUS.ABSENT
  return value === PROVIDER_NEUTRALISING_LITERAL
    ? SELECTOR_STATUS.EQUALS_LITERAL
    : SELECTOR_STATUS.PRESENT_DIFFERENT
}

/**
 * Run `@next/env`'s `loadEnvConfig()` against the repository exactly as
 * `next` does, then report each selector's STATUS — never its value.
 *
 * This runs in a CHILD, invoked as `node serving-discipline.mjs --probe=<mode>`,
 * because `loadEnvConfig()` mutates `process.env` and caches; two modes in
 * one process would contaminate each other.
 */
async function runProbe(mode) {
  const lines = []
  let loaded = false
  /*
   * An AUTHORED reason code, never the caught error's own message.
   *
   * The first run of this probe reported only `LOADED|false` and was
   * undiagnosable: the read-back had not happened, the negative control
   * correctly refused to claim a demonstration, and nothing said WHY. A
   * fail-closed check that cannot be diagnosed gets worked around instead
   * of fixed, which is how a guard quietly dies. The codes below are
   * literals authored here — @next/env can echo file contents in a parse
   * failure, so its message is still never surfaced.
   */
  let reason = 'NONE'
  try {
    /*
     * `@next/env` is CommonJS and assigns `module.exports` to a value built
     * at run time, so Node's CJS named-export detection cannot see
     * `loadEnvConfig` and the ESM named binding is `undefined`. MEASURED,
     * not assumed: the first run of this probe failed exactly here. The
     * namespace's `default` is the real `module.exports`, so both shapes
     * are accepted and a missing function is reported as its own code
     * rather than thrown as a generic TypeError.
     */
    const namespace = await import('@next/env')
    const loadEnvConfig = namespace.loadEnvConfig ?? namespace.default?.loadEnvConfig
    if (typeof loadEnvConfig !== 'function') {
      reason = 'LOADER_EXPORT_MISSING'
    } else {
      loadEnvConfig(REPO_ROOT, mode === 'dev', { info: () => {}, error: () => {} }, true)
      loaded = true
    }
  } catch {
    reason = 'LOADER_THREW'
  }
  lines.push(`MODE|${mode}`)
  lines.push(`LOADED|${loaded}`)
  lines.push(`REASON|${reason}`)
  for (const selector of PROVIDER_SELECTORS) {
    lines.push(`SELECTOR|${selector}|${statusOf(process.env[selector])}`)
  }
  lines.push(
    `REALPROVIDERLEG|${REAL_PROVIDER_LEG_VARIABLE in process.env ? 'PRESENT' : 'ABSENT'}`,
  )
  process.stdout.write(`PROBE_BEGIN\n${lines.join('\n')}\nPROBE_END\n`)
}

/**
 * Spawn the read-back probe with a given child environment and parse its
 * report. Fails closed: an unparseable or truncated report is an error,
 * never a default.
 */
export function readBackThroughNextEnv(childEnv, mode) {
  if (mode !== 'dev' && mode !== 'start') {
    throw new ServingDisciplineError(`Unknown read-back mode: ${mode}`)
  }
  const result = spawnSync(process.execPath, [fileURLToPath(import.meta.url), `--probe=${mode}`], {
    cwd: REPO_ROOT,
    env: childEnv,
    encoding: 'utf8',
    windowsHide: true,
    shell: false,
    timeout: 60_000,
  })
  if (result.error || typeof result.stdout !== 'string') {
    throw new ServingDisciplineError(`The ${mode} read-back probe could not be run.`)
  }
  const body = result.stdout
  const begin = body.indexOf('PROBE_BEGIN')
  const end = body.indexOf('PROBE_END')
  if (begin === -1 || end === -1 || end < begin) {
    throw new ServingDisciplineError(`The ${mode} read-back probe produced no complete report.`)
  }
  const report = { mode: null, loaded: null, reason: null, selectors: new Map(), realProviderLeg: null }
  for (const line of body.slice(begin, end).split(/\r?\n/)) {
    const parts = line.split('|')
    if (parts[0] === 'MODE') report.mode = parts[1]
    else if (parts[0] === 'LOADED') report.loaded = parts[1] === 'true'
    else if (parts[0] === 'REASON') report.reason = parts[1]
    else if (parts[0] === 'SELECTOR') report.selectors.set(parts[1], parts[2])
    else if (parts[0] === 'REALPROVIDERLEG') report.realProviderLeg = parts[1]
  }
  if (report.mode !== mode || report.loaded === null || report.reason === null || report.realProviderLeg === null) {
    throw new ServingDisciplineError(`The ${mode} read-back probe report is incomplete.`)
  }
  for (const selector of PROVIDER_SELECTORS) {
    if (!report.selectors.has(selector)) {
      throw new ServingDisciplineError(`The ${mode} read-back probe did not report ${selector}.`)
    }
  }
  return report
}

// ---------------------------------------------------------------------
// S-3 — the outward-call trip-wire
// ---------------------------------------------------------------------

const LOOPBACK_HOSTS = new Set(['127.0.0.1', 'localhost', '::1', '[::1]', '0.0.0.0', '::', '[::]', '*'])

/**
 * Every descendant PID of `rootPid`, inclusive.
 *
 * `next` spawns worker children, and an outward request made by a WORKER
 * would be invisible to a sample taken against the parent PID alone —
 * which is how the existing single-PID sample in
 * `prove-disposable-app.mjs` could read "measured zero" while a child held
 * a live peer. Returns `null` when the tree could not be enumerated, so an
 * unreadable sample is never mistaken for an empty one.
 */
export function processTree(rootPid) {
  if (typeof rootPid !== 'number') return null
  const result = spawnSync(
    'powershell.exe',
    [
      '-NoProfile',
      '-NonInteractive',
      '-Command',
      'Get-CimInstance Win32_Process | ForEach-Object { "$($_.ProcessId),$($_.ParentProcessId)" }',
    ],
    { encoding: 'utf8', windowsHide: true, shell: false, maxBuffer: 8 * 1024 * 1024, timeout: 60_000 },
  )
  if (result.error || typeof result.stdout !== 'string' || result.stdout.trim().length === 0) return null
  const children = new Map()
  for (const line of result.stdout.split(/\r?\n/)) {
    const [pid, parent] = line.trim().split(',').map(Number)
    if (!Number.isInteger(pid) || !Number.isInteger(parent)) continue
    if (!children.has(parent)) children.set(parent, [])
    children.get(parent).push(pid)
  }
  const tree = new Set([rootPid])
  const queue = [rootPid]
  while (queue.length > 0) {
    const pid = queue.pop()
    for (const child of children.get(pid) ?? []) {
      if (!tree.has(child)) {
        tree.add(child)
        queue.push(child)
      }
    }
  }
  return tree
}

/**
 * Count non-loopback TCP peers held by a set of PIDs.
 *
 * Returns `{ foreign, rows }` or `null` when the sample could not be
 * taken. "Measured zero" and "not measured" are different states and only
 * the first can satisfy a gate. NO ADDRESS IS EVER RETURNED OR PRINTED —
 * only counts leave this function.
 */
export function sampleNonLoopbackPeers(pids) {
  if (!(pids instanceof Set) || pids.size === 0) return null
  const result = spawnSync('netstat', ['-ano', '-p', 'TCP'], {
    encoding: 'utf8',
    windowsHide: true,
    shell: false,
    maxBuffer: 16 * 1024 * 1024,
    timeout: 60_000,
  })
  if (result.error || typeof result.stdout !== 'string' || result.stdout.length === 0) return null
  let foreign = 0
  let rows = 0
  for (const line of result.stdout.split(/\r?\n/)) {
    const parts = line.trim().split(/\s+/)
    if (parts.length < 5 || parts[0].toUpperCase() !== 'TCP') continue
    const pid = Number(parts[parts.length - 1])
    if (!pids.has(pid)) continue
    rows += 1
    const remote = parts[2]
    const host = remote.startsWith('[')
      ? remote.slice(0, remote.lastIndexOf(']') + 1)
      : remote.slice(0, remote.lastIndexOf(':'))
    if (!LOOPBACK_HOSTS.has(host)) foreign += 1
  }
  return { foreign, rows }
}

/**
 * The armed trip-wire: sample the served process tree repeatedly and
 * accumulate. Any single unreadable sample makes the whole reading
 * unmeasured — it does not silently reduce to the readable ones.
 */
export function createTripWire(rootPid) {
  const samples = []
  let unreadable = 0
  return {
    sample() {
      const tree = processTree(rootPid)
      if (tree === null) {
        unreadable += 1
        return null
      }
      const reading = sampleNonLoopbackPeers(tree)
      if (reading === null) {
        unreadable += 1
        return null
      }
      samples.push({ treeSize: tree.size, foreign: reading.foreign, rows: reading.rows })
      return samples[samples.length - 1]
    },
    result() {
      if (samples.length === 0 || unreadable > 0) {
        return { measured: false, samples: samples.length, unreadable, foreign: null, maxTreeSize: null }
      }
      return {
        measured: true,
        samples: samples.length,
        unreadable,
        foreign: samples.reduce((total, one) => total + one.foreign, 0),
        maxTreeSize: Math.max(...samples.map((one) => one.treeSize)),
      }
    },
  }
}

// ---------------------------------------------------------------------
// Serving. Every served child in this repository should come from here.
// ---------------------------------------------------------------------

export function nextBinary() {
  const nextBin = join(REPO_ROOT, 'node_modules', 'next', 'dist', 'bin', 'next')
  if (!existsSync(nextBin)) {
    throw new ServingDisciplineError('The project-local Next.js binary could not be resolved.')
  }
  return nextBin
}

/**
 * Spawn a disciplined Next.js server and wait for it to answer.
 *
 * `stdio` is ignored outright on all three streams: nothing the server
 * prints is ever rendered, and there is no buffer for a credential-bearing
 * line to leak out of (`CLAUDE.md` §11 — never rely on pattern-based
 * redaction; ensure no credential-bearing stream is rendered at all).
 */
export async function serveDisciplined({ mode, port, host = '127.0.0.1', overrides = {}, readyPath = '/login', timeoutMs = 180_000 }) {
  if (mode !== 'dev' && mode !== 'start') {
    throw new ServingDisciplineError(`Unknown serving mode: ${mode}`)
  }
  const { env, record } = buildServedChildEnv(overrides)
  const child = spawn(process.execPath, [nextBinary(), mode, '-H', host, '-p', String(port)], {
    cwd: REPO_ROOT,
    env,
    stdio: ['ignore', 'ignore', 'ignore'],
    windowsHide: true,
    shell: false,
  })
  const origin = `http://${host}:${port}`
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new ServingDisciplineError(`The served application exited during startup (code ${child.exitCode}).`)
    }
    try {
      const response = await fetch(`${origin}${readyPath}`, { redirect: 'manual' })
      await response.text()
      if (response.status < 500) return { child, origin, env, record }
    } catch {
      // Not listening yet.
    }
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new ServingDisciplineError(`The served application did not answer on port ${port} in time.`)
}

/** Stop a served child and its whole worker tree, on every exit path. */
export function stopServed(child) {
  if (!child) return
  try {
    if (child.exitCode === null && child.signalCode === null) {
      if (process.platform === 'win32') {
        spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], {
          stdio: ['ignore', 'ignore', 'ignore'],
          windowsHide: true,
          shell: false,
        })
      } else {
        child.kill('SIGTERM')
      }
    }
  } catch {
    // Already gone; that is the desired end state anyway.
  }
  try {
    child.kill()
  } catch {
    // Already exited.
  }
}

// ---------------------------------------------------------------------
// Probe entry point. Reached only as `node serving-discipline.mjs --probe=<mode>`.
// ---------------------------------------------------------------------

const probeArgument = process.argv.slice(2).find((argument) => argument.startsWith('--probe='))
if (probeArgument !== undefined) {
  await runProbe(probeArgument.slice('--probe='.length))
}
