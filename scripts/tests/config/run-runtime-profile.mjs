#!/usr/bin/env node
// =====================================================================
// B.E.S.T Coach — the Supabase RUNTIME PROFILE contract (R-C2-5)
// =====================================================================
// Run: node scripts/tests/config/run-runtime-profile.mjs
//
// Text and in-process only. It starts no server, touches no database,
// contacts no network and reads no `.env.local`. Every URL and key below
// is a SYNTHETIC LITERAL authored in this file: `sb_publishable_…` values
// here are shape fixtures, not credentials, and no real key, token or
// password is read, written or referenced anywhere in this file.
//
// WHAT IT PINS. Operator ruling R-C2-5 authorizes EXACTLY TWO Supabase
// runtime profiles and no others:
//
//   default        -> this repository own stack, local API port from config.toml
//   f17-disposable -> project bc-f17-disposable, local API port 55421
//
// and requires the disposable port to be acceptable ONLY when the
// disposable profile is set as an explicit SERVER-SIDE CHILD-PROCESS
// ENVIRONMENT input. Each of the ruling's fail-closed cases is a case
// below, asserted by its authored error CODE — not by "it threw".
//
// The behavioural cases run IN THIS PROCESS against the real module, by
// setting `process.env` and calling `getPublicSupabaseConfig()`; the
// module reads its inputs at call time, so each case sees exactly the
// environment the case authored and nothing else.
// =====================================================================

import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..', '..', '..')
const MODULE_PATH = join(ROOT, 'lib', 'supabase', 'public-config.ts')

const { getPublicSupabaseConfig, resolveSupabaseRuntimeProfile } = await import(
  new URL(`file://${MODULE_PATH.replace(/\\/g, '/')}`).href
)

let failures = 0
const fail = (id, message) => {
  failures += 1
  console.error(`FAIL ${id}: ${message}`)
}
const pass = (id, message) => console.log(`PASS ${id}${message ? ' -- ' + message : ''}`)

// ---------------------------------------------------------------------
// Synthetic literals. Nothing here is a credential.
// ---------------------------------------------------------------------

const PUBLISHABLE = 'sb_publishable_synthetic_shape_fixture'
const SECRET_SHAPED = 'sb_secret_synthetic_shape_fixture'

// ---------------------------------------------------------------------
// ⚠️ THE CANONICAL PORT IS READ FROM supabase/config.toml, NOT HARDCODED.
// ---------------------------------------------------------------------
// R-C2-5 names "local API port 54321" by number because exactly one
// workspace existed when it was written. Operator ruling 2026-08-10: THAT
// NUMBER IS WORKSPACE-SCOPED. The ruling's binding content is the PINNING —
// the default profile authorizes this repository's own stack and nothing
// else — not the digits it happened to be pinned to.
//
// So this suite now asserts the intent in any workspace: whatever port this
// repository's own `supabase/config.toml` declares is the canonical one, and
// the closed two-entry allow-list must carry exactly that port plus the
// disposable port. A clone that moves its stack stays conformant; a module
// that drifts away from its own stack still fails.
//
// This is deliberately NOT a relaxation. Reading config.toml is a TIGHTER
// assertion than a literal was: it now fails if `public-config.ts` and the
// stack it is supposed to reach ever disagree — a defect the hardcoded
// number could not detect at all.
const CANONICAL_API_PORT = (() => {
  const toml = readFileSync(join(ROOT, 'supabase', 'config.toml'), 'utf8')
  const api = /^\[api\]$([\s\S]*?)^\[/m.exec(toml)
  const port = api && /^port\s*=\s*(\d{4,5})\s*$/m.exec(api[1])
  if (!port) {
    throw new Error('Could not read the [api] port from supabase/config.toml — refusing to guess it.')
  }
  return port[1]
})()

const CANONICAL_URL = `http://127.0.0.1:${CANONICAL_API_PORT}`
const DISPOSABLE_URL = 'http://127.0.0.1:55421'
const HOSTED_URL = 'https://syntheticprojectref.supabase.co'

const PROFILE_VAR = 'BEST_COACH_SUPABASE_RUNTIME_PROFILE'

/**
 * Run one case with EXACTLY the environment it authors. Every one of the
 * three variables is removed first, so no case can ever inherit a value
 * from the ambient environment or from a previous case.
 */
function withEnv({ profile, url, key }, body) {
  const saved = {
    profile: process.env[PROFILE_VAR],
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  }
  delete process.env[PROFILE_VAR]
  delete process.env.NEXT_PUBLIC_SUPABASE_URL
  delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (profile !== undefined) process.env[PROFILE_VAR] = profile
  if (url !== undefined) process.env.NEXT_PUBLIC_SUPABASE_URL = url
  if (key !== undefined) process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = key
  try {
    return body()
  } finally {
    delete process.env[PROFILE_VAR]
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    if (saved.profile !== undefined) process.env[PROFILE_VAR] = saved.profile
    if (saved.url !== undefined) process.env.NEXT_PUBLIC_SUPABASE_URL = saved.url
    if (saved.key !== undefined) process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = saved.key
  }
}

/** The authored code of a thrown diagnostic, or null when nothing was thrown. */
function codeOf(error) {
  if (!(error instanceof Error)) return null
  const match = /^\[(E_[A-Z0-9_]+)\]/.exec(error.message)
  return match ? match[1] : null
}

/**
 * Assert a case is REJECTED with a specific authored code. A case that is
 * accepted, or rejected with a different code, fails — "it threw" is never
 * accepted as evidence on its own.
 */
function rejects(id, env, expectedCode, note) {
  withEnv(env, () => {
    let thrown = null
    let accepted = false
    try {
      getPublicSupabaseConfig()
      accepted = true
    } catch (error) {
      thrown = error
    }
    if (accepted) {
      fail(id, `the configuration was ACCEPTED; ${expectedCode} was required (${note})`)
      return
    }
    const code = codeOf(thrown)
    if (code !== expectedCode) {
      fail(id, `rejected with ${code ?? 'an uncoded error'}; ${expectedCode} was required (${note})`)
      return
    }
    pass(id, `${expectedCode} -- ${note}`)
  })
}

/** Assert a case is ACCEPTED and classified into the expected environment. */
function accepts(id, env, expectedEnvironment, expectedOrigin, note) {
  withEnv(env, () => {
    let config = null
    try {
      config = getPublicSupabaseConfig()
    } catch (error) {
      fail(id, `the configuration was REJECTED with ${codeOf(error) ?? 'an uncoded error'} (${note})`)
      return
    }
    if (config.environment !== expectedEnvironment) {
      fail(id, `classified as "${config.environment}"; "${expectedEnvironment}" was required (${note})`)
      return
    }
    if (config.url !== expectedOrigin) {
      fail(id, `resolved origin "${config.url}"; "${expectedOrigin}" was required (${note})`)
      return
    }
    pass(id, `accepted as ${expectedEnvironment} -- ${note}`)
  })
}

// =====================================================================
// A. THE TWO AUTHORIZED PROFILES — the only two accepting paths.
// =====================================================================

accepts(
  'T-P1',
  { url: CANONICAL_URL, key: PUBLISHABLE },
  'local',
  CANONICAL_URL,
  `the profile variable is ABSENT, which is the default profile: the canonical local API port ${CANONICAL_API_PORT} is accepted exactly as before`,
)

accepts(
  'T-P2',
  { profile: 'default', url: CANONICAL_URL, key: PUBLISHABLE },
  'local',
  CANONICAL_URL,
  `the default profile named explicitly accepts the canonical local API port ${CANONICAL_API_PORT}`,
)

accepts(
  'T-P3',
  { profile: 'f17-disposable', url: DISPOSABLE_URL, key: PUBLISHABLE },
  'local',
  DISPOSABLE_URL,
  'the f17-disposable profile accepts the disposable local API port 55421 — the ONE new accepting path',
)

accepts(
  'T-P4',
  { profile: 'f17-disposable', url: 'http://localhost:55421', key: PUBLISHABLE },
  'local',
  'http://localhost:55421',
  'the disposable profile accepts the disposable port on the "localhost" loopback spelling',
)

accepts(
  'T-P5',
  { profile: '  f17-disposable  ', url: DISPOSABLE_URL, key: PUBLISHABLE },
  'local',
  DISPOSABLE_URL,
  'surrounding whitespace on the profile value is trimmed and nothing else is normalized',
)

// =====================================================================
// B. THE RULING'S FAIL-CLOSED CASES, one assertion each.
// =====================================================================

// (1) a disposable URL WITHOUT the disposable profile active.
rejects(
  'T-P6',
  { url: DISPOSABLE_URL, key: PUBLISHABLE },
  'E_PUB_DISPOSABLE_PORT_UNAUTHORIZED',
  'the disposable port with NO profile variable set at all',
)
rejects(
  'T-P7',
  { profile: 'default', url: DISPOSABLE_URL, key: PUBLISHABLE },
  'E_PUB_DISPOSABLE_PORT_UNAUTHORIZED',
  'the disposable port with the default profile explicitly named',
)

// (2) a canonical URL WHILE the disposable profile is active.
rejects(
  'T-P8',
  { profile: 'f17-disposable', url: CANONICAL_URL, key: PUBLISHABLE },
  'E_PUB_PROFILE_TARGET_CANONICAL',
  `the canonical port ${CANONICAL_API_PORT} while the disposable profile is active — the disposable harness can never reach the canonical stack`,
)

// (3) any local port other than the canonical one or 55421, under EITHER profile.
rejects(
  'T-P9',
  { url: 'http://127.0.0.1:3000', key: PUBLISHABLE },
  'E_PUB_URL_LOCAL_PORT',
  'an arbitrary loopback port under the default profile',
)
rejects(
  'T-P10',
  { profile: 'f17-disposable', url: 'http://127.0.0.1:3000', key: PUBLISHABLE },
  'E_PUB_URL_LOCAL_PORT',
  'an arbitrary loopback port under the disposable profile',
)
rejects(
  'T-P11',
  { profile: 'f17-disposable', url: 'http://127.0.0.1:55422', key: PUBLISHABLE },
  'E_PUB_URL_LOCAL_PORT',
  "the disposable stack's DATABASE port 55422 is not its API port and is refused",
)
rejects(
  'T-P12',
  { url: 'http://127.0.0.1', key: PUBLISHABLE },
  'E_PUB_URL_LOCAL_PORT',
  'a loopback URL carrying NO port at all',
)
rejects(
  'T-P13',
  { url: 'http://127.0.0.1:54322', key: PUBLISHABLE },
  'E_PUB_URL_LOCAL_PORT',
  'the canonical DATABASE port 54322 under the default profile',
)

// (4) malformed or unknown profile values.
for (const [id, value, note] of [
  ['T-P14', '', 'a present but EMPTY profile value'],
  ['T-P15', '   ', 'a whitespace-only profile value'],
  ['T-P16', 'F17-DISPOSABLE', 'the disposable profile name in the wrong case'],
  ['T-P17', 'disposable', 'an abbreviation of the disposable profile name'],
  ['T-P18', 'f17-disposable-2', 'a profile name with a suffix'],
  ['T-P19', 'default,f17-disposable', 'two profile names in one value'],
  ['T-P20', 'true', 'a boolean-shaped profile value'],
]) {
  rejects('' + id, { profile: value, url: DISPOSABLE_URL, key: PUBLISHABLE }, 'E_PUB_PROFILE_UNKNOWN', note)
}
// A malformed profile is refused even when the TARGET would otherwise be
// perfectly valid, so the refusal is the profile's and not the URL's.
rejects(
  'T-P21',
  { profile: 'bogus', url: CANONICAL_URL, key: PUBLISHABLE },
  'E_PUB_PROFILE_UNKNOWN',
  'a malformed profile refuses even the ordinary canonical target',
)

// (5) any non-loopback hostname while the disposable profile is active.
rejects(
  'T-P22',
  { profile: 'f17-disposable', url: 'http://192.168.1.10:55421', key: PUBLISHABLE },
  'E_PUB_PROFILE_TARGET_NOT_LOCAL',
  'a private-network host on the disposable port while the disposable profile is active',
)
rejects(
  'T-P23',
  { profile: 'f17-disposable', url: 'http://example.test:55421', key: PUBLISHABLE },
  'E_PUB_PROFILE_TARGET_NOT_LOCAL',
  'a named non-loopback host while the disposable profile is active',
)

// (6) hosted Supabase URLs while the disposable profile is active, and
// (7) a linked-project fallback, which is hosted and non-loopback by
//     construction and is refused by the same closed rule.
rejects(
  'T-P24',
  { profile: 'f17-disposable', url: HOSTED_URL, key: PUBLISHABLE },
  'E_PUB_PROFILE_TARGET_NOT_LOCAL',
  'a hosted https://*.supabase.co target while the disposable profile is active',
)
rejects(
  'T-P25',
  { profile: 'f17-disposable', url: 'https://anotherprojectref.supabase.co', key: PUBLISHABLE },
  'E_PUB_PROFILE_TARGET_NOT_LOCAL',
  'a linked-project fallback is a hosted, non-loopback target and is refused by the same rule',
)

// =====================================================================
// C. THE NORMAL CONFIGURATION IS NOT WEAKENED. Every pre-existing
//    behaviour is re-asserted unchanged.
// =====================================================================

accepts(
  'T-P26',
  { url: HOSTED_URL, key: PUBLISHABLE },
  'hosted',
  HOSTED_URL,
  'a hosted target under the default profile is accepted exactly as before',
)
accepts(
  'T-P27',
  { profile: 'default', url: HOSTED_URL, key: PUBLISHABLE },
  'hosted',
  HOSTED_URL,
  'a hosted target with the default profile named explicitly is accepted',
)
rejects(
  'T-P28',
  { url: 'https://not-supabase.example.com', key: PUBLISHABLE },
  'E_PUB_URL_UNSUPPORTED',
  'an unsupported non-loopback, non-Supabase host under the default profile',
)
rejects('T-P29', { key: PUBLISHABLE }, 'E_PUB_URL_MISSING', 'a missing URL')
rejects('T-P30', { url: '   ', key: PUBLISHABLE }, 'E_PUB_URL_MISSING', 'a blank URL')
rejects('T-P31', { url: CANONICAL_URL }, 'E_PUB_KEY_MISSING', 'a missing publishable key')
rejects('T-P32', { url: 'not a url', key: PUBLISHABLE }, 'E_PUB_URL_UNPARSEABLE', 'an unparseable URL')
rejects(
  'T-P33',
  { url: 'ftp://127.0.0.1:54321', key: PUBLISHABLE },
  'E_PUB_URL_PROTOCOL',
  'a non-http(s) protocol on a loopback target',
)
rejects(
  'T-P34',
  { url: CANONICAL_URL, key: SECRET_SHAPED },
  'E_PUB_KEY_IS_SECRET',
  'a secret-shaped key in the browser-visible publishable variable',
)
rejects(
  'T-P35',
  { url: CANONICAL_URL, key: 'not-a-recognised-key-shape' },
  'E_PUB_KEY_SHAPE',
  'a key matching no accepted structural shape',
)

// IPv6 loopback keeps working on both profiles.
accepts(
  'T-P36',
  { url: `http://[::1]:${CANONICAL_API_PORT}`, key: PUBLISHABLE },
  'local',
  `http://[::1]:${CANONICAL_API_PORT}`,
  'the IPv6 loopback spelling on the canonical port under the default profile',
)
accepts(
  'T-P37',
  { profile: 'f17-disposable', url: 'http://[::1]:55421', key: PUBLISHABLE },
  'local',
  'http://[::1]:55421',
  'the IPv6 loopback spelling on the disposable port under the disposable profile',
)

// =====================================================================
// D. THE PROFILE IS A SERVER-SIDE CHILD-PROCESS ENVIRONMENT INPUT ONLY.
//    These cases scan CODE, because the property is structural.
// =====================================================================

const source = readFileSync(MODULE_PATH, 'utf8').replace(/\r\n/g, '\n')
// Comments DOCUMENT the absences asserted below ("no cookie, no header"),
// so a scan over raw text would match its own subject's prose and assert
// the exact opposite of the intended property.
const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')

{
  const id = 'T-P38'
  if (/NEXT_PUBLIC_[A-Z0-9_]*PROFILE/.test(source)) {
    fail(id, 'the profile variable is spelled with a NEXT_PUBLIC_ prefix somewhere in the module')
  } else if (!code.includes('process.env.BEST_COACH_SUPABASE_RUNTIME_PROFILE')) {
    fail(id, 'the module does not read process.env.BEST_COACH_SUPABASE_RUNTIME_PROFILE directly')
  } else {
    pass(
      id,
      'the profile variable carries NO NEXT_PUBLIC_ prefix, so it is never inlined into a browser bundle, and it is read as a direct process.env reference rather than a dynamic lookup',
    )
  }
}

{
  const id = 'T-P39'
  // Nothing a browser or a request can influence may appear in this module.
  const forbidden = [
    'localStorage',
    'sessionStorage',
    'document.',
    'window.',
    'cookies(',
    'headers(',
    'searchParams',
    'URLSearchParams',
    'req.',
    'request.',
    'next/headers',
  ]
  const found = forbidden.filter((term) => code.includes(term))
  if (found.length > 0) {
    fail(id, `the module references browser- or request-controlled input: ${found.join(', ')}`)
  } else {
    pass(
      id,
      'the module references no query parameter, cookie, header, request, form, localStorage, sessionStorage or DOM input — process.env is its only input',
    )
  }
}

{
  const id = 'T-P40'
  // The accepted-port set must be a closed literal pair, not a range, a
  // pattern or an environment-supplied value.
  // The canonical entry is the port this repository's own config.toml
  // declares — read, not assumed. The disposable entry stays a fixed literal
  // because the disposable stack is created by this repository at a pinned
  // port rather than declared in config.toml.
  const ports = [...code.matchAll(/["'](\d{4,5})["']/g)].map((match) => match[1])
  const unexpected = ports.filter((port) => port !== CANONICAL_API_PORT && port !== '55421')
  const hasBoth = ports.includes(CANONICAL_API_PORT) && ports.includes('55421')
  if (!hasBoth) {
    fail(
      id,
      `the module does not carry both authorized port literals (expected the config.toml [api] port ` +
        `${CANONICAL_API_PORT} and the disposable port 55421)`,
    )
  } else if (unexpected.length > 0) {
    fail(id, `the module carries an unexpected port literal: ${[...new Set(unexpected)].join(', ')}`)
  } else {
    pass(
      id,
      `exactly two port literals appear in the module — ${CANONICAL_API_PORT}, read from ` +
        'supabase/config.toml, and 55421 — and no other port is named',
    )
  }
}

{
  const id = 'T-P41'
  // The profile resolver must be total: absent -> default, exact match ->
  // that profile, everything else -> a coded refusal. Proven behaviourally
  // rather than by reading the source.
  const observed = []
  withEnv({}, () => observed.push(resolveSupabaseRuntimeProfile()))
  withEnv({ profile: 'default' }, () => observed.push(resolveSupabaseRuntimeProfile()))
  withEnv({ profile: 'f17-disposable' }, () => observed.push(resolveSupabaseRuntimeProfile()))
  let refusedCode = null
  withEnv({ profile: 'anything-else' }, () => {
    try {
      resolveSupabaseRuntimeProfile()
    } catch (error) {
      refusedCode = codeOf(error)
    }
  })
  const ok =
    observed.length === 3 &&
    observed[0] === 'default' &&
    observed[1] === 'default' &&
    observed[2] === 'f17-disposable' &&
    refusedCode === 'E_PUB_PROFILE_UNKNOWN'
  if (!ok) {
    fail(id, `the resolver produced ${JSON.stringify(observed)} and refused with ${refusedCode ?? 'nothing'}`)
  } else {
    pass(id, 'absent resolves to default, both names resolve to themselves, and every other value is refused E_PUB_PROFILE_UNKNOWN')
  }
}

{
  const id = 'T-P42'
  // No error message may carry an environment VALUE. Every `fail(` call in
  // the module must pass a string literal as its expectation.
  const calls = [...code.matchAll(/fail\(\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,/g)]
  const interpolated = /fail\([^)]*\$\{/.test(code)
  if (calls.length < 10) {
    fail(id, `only ${calls.length} coded refusals were found in the module`)
  } else if (interpolated) {
    fail(id, 'a refusal message interpolates a value')
  } else {
    const codes = [...new Set(calls.map((match) => match[1]))].sort()
    const required = [
      'E_PUB_DISPOSABLE_PORT_UNAUTHORIZED',
      'E_PUB_PROFILE_TARGET_CANONICAL',
      'E_PUB_PROFILE_TARGET_NOT_LOCAL',
      'E_PUB_PROFILE_UNKNOWN',
      'E_PUB_URL_LOCAL_PORT',
    ]
    const missing = required.filter((entry) => !codes.includes(entry))
    if (missing.length > 0) {
      fail(id, `these authored codes are absent from the module: ${missing.join(', ')}`)
    } else {
      pass(
        id,
        `${calls.length} coded refusals, every message a string literal with no interpolation; all five R-C2-5 codes present`,
      )
    }
  }
}

// ---------------------------------------------------------------------
// The application source tree. T-P43 and T-P44 both walk it.
// ---------------------------------------------------------------------
// The old T-P43 scanned a FIXED FOUR-FILE LIST and swallowed a read error
// as "no offender" (the reviewers' LOW finding): renaming, moving or
// deleting any of the four turned a real regression into a silent PASS,
// and a fifth file naming the variable was never looked at. Both cases are
// now failures -- the tree is walked, and every required anchor file must
// be present and readable.
const APP_ROOTS = ['app', 'components', 'features', 'hooks', 'lib', 'server', 'types']
const APP_FILES = ['proxy.ts', 'next.config.ts', 'next.config.mjs', 'middleware.ts']

function walkSourceTree() {
  const found = []
  const visit = (absolute, relative) => {
    let entries
    try {
      entries = readdirSync(absolute, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue
      const nextAbsolute = join(absolute, entry.name)
      const nextRelative = relative ? relative + '/' + entry.name : entry.name
      if (entry.isDirectory()) visit(nextAbsolute, nextRelative)
      else if (/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(entry.name)) found.push({ path: nextAbsolute, relative: nextRelative })
    }
  }
  for (const root of APP_ROOTS) visit(join(ROOT, root), root)
  for (const file of APP_FILES) {
    const absolute = join(ROOT, file)
    try {
      readFileSync(absolute, 'utf8')
      found.push({ path: absolute, relative: file })
    } catch {
      // A root-level file that does not exist in this project is not an
      // omission; the REQUIRED anchors are asserted separately below.
    }
  }
  return found
}

/**
 * Read a file that MUST exist. An unreadable or renamed required file is a
 * FAILURE, never "no offender" -- that is the substance of the LOW finding.
 */
function readRequired(id, relative) {
  try {
    return readFileSync(join(ROOT, relative), 'utf8')
  } catch {
    fail(id, 'the required file ' + relative + ' could not be read; a renamed or deleted anchor is a regression, not an absence of offenders')
    return null
  }
}

const SOURCE_FILES = walkSourceTree()
const DECISION_MODULE = 'lib/supabase/public-config.ts'
const BROWSER_MODULE = 'lib/supabase/browser.ts'

{
  const id = 'T-P43'
  // The profile variable has EXACTLY ONE home: the decision module itself.
  // Anything else in the application tree that names it is an offender.
  const before = failures

  if (SOURCE_FILES.length < 50) {
    fail(id, 'only ' + SOURCE_FILES.length + ' application source files were found; the scan did not reach the application tree')
  }
  const decisionSource = readRequired(id, DECISION_MODULE)
  if (decisionSource !== null && !decisionSource.includes(PROFILE_VAR)) {
    fail(id, DECISION_MODULE + ' no longer names the profile variable, so the decision has no home at all')
  }
  // Every anchor the old fixed list named must still exist, so a rename can
  // never quietly remove a file from the scan.
  for (const anchor of ['proxy.ts', 'server/platform/env.ts', 'server/platform/supabase/request.ts', BROWSER_MODULE]) {
    readRequired(id, anchor)
  }
  const offenders = SOURCE_FILES.filter(
    (entry) => entry.relative !== DECISION_MODULE && readFileSync(entry.path, 'utf8').includes(PROFILE_VAR),
  ).map((entry) => entry.relative)
  if (offenders.length > 0) {
    fail(id, 'the profile variable is referenced outside the single decision point: ' + offenders.join(', '))
  }
  if (failures === before) {
    pass(
      id,
      SOURCE_FILES.length + ' application source files were walked (not a fixed list); ' + DECISION_MODULE + ' is the ONLY one that names the profile variable, and every required anchor file was present and readable',
    )
  }
}

{
  const id = 'T-P44'
  // ---------------------------------------------------------------------
  // NO CLIENT BUNDLE CAN CARRY A SUPABASE TARGET -- pinned, not assumed.
  // ---------------------------------------------------------------------
  // The reviewers' LOW finding: `prove-disposable-app.mjs` A-22 observes
  // that no emitted client bundle references a Supabase target, but that
  // property rests entirely on `lib/supabase/browser.ts` being UNIMPORTED
  // DEAD CODE, and nothing committed pinned it. If a future client
  // component imported it, a disposable build would inline the disposable
  // URL and publishable key straight into a browser bundle -- and A-22
  // only catches that AFTER a full disposable build, inside a runner
  // nobody executes on an ordinary change.
  //
  // Three properties are pinned here, in source, in milliseconds:
  //   1. NEXT_PUBLIC_SUPABASE_* is read in exactly two modules -- the
  //      decision module and the server environment contract;
  //   2. the decision module is imported only by the server environment
  //      contract, the request-scoped server client, `proxy.ts` and the
  //      browser client;
  //   3. the browser client is imported by NOTHING, and its exported
  //      factory is named nowhere else.
  //
  // Together those mean no client component's module graph can reach a
  // Supabase URL or publishable key, so no client bundle can carry one.
  const before = failures
  const ALLOWED_CONFIG_IMPORTERS = new Set([
    'server/platform/env.ts',
    'server/platform/supabase/request.ts',
    'proxy.ts',
    BROWSER_MODULE,
  ])
  const CONFIG_IMPORT = /["'](?:@\/lib\/supabase\/public-config|(?:\.{1,2}\/)+(?:lib\/)?supabase\/public-config|\.\/public-config)["']/
  const BROWSER_IMPORT = /["'](?:@\/lib\/supabase\/browser|(?:\.{1,2}\/)+(?:lib\/)?supabase\/browser|\.\/browser)["']/

  if (readRequired(id, BROWSER_MODULE) === null || readRequired(id, DECISION_MODULE) === null) {
    // readRequired already recorded the failure.
  } else {
    const publicEnvReaders = []
    const configImporters = []
    const browserImporters = []
    for (const entry of SOURCE_FILES) {
      const text = readFileSync(entry.path, 'utf8')
      if (entry.relative !== DECISION_MODULE && /NEXT_PUBLIC_SUPABASE_[A-Z_]+/.test(text)) {
        publicEnvReaders.push(entry.relative)
      }
      if (entry.relative !== DECISION_MODULE && CONFIG_IMPORT.test(text)) {
        configImporters.push(entry.relative)
      }
      if (entry.relative !== BROWSER_MODULE && BROWSER_IMPORT.test(text)) {
        browserImporters.push(entry.relative)
      }
      if (entry.relative !== BROWSER_MODULE && text.includes('createBrowserSupabaseClient')) {
        browserImporters.push(entry.relative + ' (names createBrowserSupabaseClient)')
      }
    }

    const strayEnvReaders = publicEnvReaders.filter((relative) => relative !== 'server/platform/env.ts')
    if (strayEnvReaders.length > 0) {
      fail(id, 'NEXT_PUBLIC_SUPABASE_* is read outside the decision module and the server environment contract: ' + strayEnvReaders.join(', '))
    }
    const strayConfigImporters = configImporters.filter((relative) => !ALLOWED_CONFIG_IMPORTERS.has(relative))
    if (strayConfigImporters.length > 0) {
      fail(id, DECISION_MODULE + ' is imported by a module outside the four permitted ones: ' + strayConfigImporters.join(', '))
    }
    if (browserImporters.length > 0) {
      fail(id, BROWSER_MODULE + ' is no longer unimported: ' + browserImporters.join(', ') + ' -- a disposable build would inline the disposable URL and publishable key into a browser bundle')
    }
    if (failures === before) {
      pass(
        id,
        'no client module graph can reach a Supabase target: NEXT_PUBLIC_SUPABASE_* is read only in ' + DECISION_MODULE + ' and server/platform/env.ts, ' + DECISION_MODULE + ' is imported only by the four permitted modules, and ' + BROWSER_MODULE + ' is imported by nothing at all (' + SOURCE_FILES.length + ' files walked)',
      )
    }
  }
}

console.log('')
if (failures > 0) {
  console.error(`${failures} runtime-profile case(s) FAILED.`)
  process.exit(1)
}
console.log('All Supabase runtime-profile cases passed (R-C2-5).')
