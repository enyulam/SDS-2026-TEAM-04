// =====================================================================
// HOSTED TARGET GUARD — the single implementation every hosted tool uses
// =====================================================================
//
// Two independent properties, in this order:
//
//   1. HARD DENY (unconditional, non-overridable). The frozen demonstration
//      project below can never be a target of any hosted tool in this
//      repository. There is NO flag, NO environment variable, NO argument
//      and NO code path that re-enables it. The deny runs against the
//      resolved ref AND against every supplied URL, case-insensitively,
//      before any other decision is made.
//
//   2. POSITIVE PIN (fail-closed). The caller must supply the expected
//      project ref through BEST_COACH_HOSTED_PROJECT_REF. Absent, blank or
//      malformed means REFUSE — never "allow anything", never a default.
//      Every supplied target must then positively carry that exact ref.
//
// ---------------------------------------------------------------------
// WHY THIS REPLACED A HARD-CODED CONSTANT
// ---------------------------------------------------------------------
// Each hosted tool used to pin the ref as a literal in its own source. That
// had two faults. It bound this repository to ONE project, so a second
// environment could not be stood up without editing five files; and the
// protection was a single string that an edit could silently repoint at any
// project at all, including the frozen one.
//
// Splitting the two concerns fixes both. The target became configuration,
// which is what it always was. The prohibition became code, which is what it
// always should have been — and it is now stated once, not five times, so it
// cannot drift between call sites.
//
// No credential is ever read, printed or returned by this module.
// =====================================================================

/**
 * ⛔ THE FROZEN DEMONSTRATION PROJECT — PERMANENTLY OFF LIMITS.
 *
 * Not configurable. Not overridable. Do not add a bypass, an allow-list, an
 * "unless" flag or an environment escape. If a future task genuinely needs to
 * reach this project, that is an explicit Operator decision made with a fresh
 * instrument — not a change to this line.
 */
const FROZEN_DEMO_REF = 'zjukuffiuzkbiblmnuwl'

/** Supabase project refs are 20 lowercase alphanumeric characters. */
const REF_SHAPE = /^[a-z0-9]{20}$/

export const VAR_PROJECT_REF = 'BEST_COACH_HOSTED_PROJECT_REF'

export class TargetRefused extends Error {}

/**
 * Deny the frozen ref anywhere in a supplied value.
 *
 * Case-insensitive on purpose: hostnames are case-insensitive in DNS, so an
 * upper- or mixed-case spelling reaches the same project and must be refused
 * the same way.
 *
 * The value itself is NEVER included in the message — a connection string
 * carries a password.
 */
export function denyFrozen(value, what) {
  if (typeof value !== 'string') return
  if (value.toLowerCase().includes(FROZEN_DEMO_REF)) {
    throw new TargetRefused(
      `HARD DENY: ${what} carries the FROZEN demonstration project ref. ` +
        'That project is off limits to every tool in this repository and this refusal ' +
        'cannot be disabled. Nothing was read, created or pushed.',
    )
  }
}

/**
 * Resolve the expected project ref from the environment. Fail closed.
 */
export function resolveHostedProjectRef() {
  const raw = process.env[VAR_PROJECT_REF]
  if (typeof raw !== 'string' || raw.trim() === '') {
    throw new TargetRefused(
      `${VAR_PROJECT_REF} must be present and non-blank in .env.local. ` +
        'There is no default target — refusing rather than guessing which project to act on.',
    )
  }
  const ref = raw.trim()
  denyFrozen(ref, VAR_PROJECT_REF)
  if (!REF_SHAPE.test(ref)) {
    throw new TargetRefused(
      `${VAR_PROJECT_REF} is malformed. A Supabase project ref is 20 lowercase alphanumeric characters.`,
    )
  }
  return ref
}

/** Reject a loopback target. The local database has its own loader and guards. */
function denyLoopback(hostname, varName) {
  if (/^(127\.|localhost|\[?::1\]?$)/.test(hostname)) {
    throw new TargetRefused(`${varName} points at LOOPBACK. Refused — the local database has its own loader.`)
  }
}

/**
 * The API URL must be exactly `https://<ref>.supabase.co`.
 */
export function assertHostedApiUrl(raw, ref, varName) {
  denyFrozen(raw, varName)
  let url
  try {
    url = new URL(raw)
  } catch {
    throw new TargetRefused(`${varName} is not a valid URL.`)
  }
  if (url.protocol !== 'https:') throw new TargetRefused(`${varName} must be https.`)
  denyLoopback(url.hostname, varName)
  const expected = `${ref}.supabase.co`
  if (url.hostname.toLowerCase() !== expected) {
    throw new TargetRefused(
      `REFUSED: ${varName} resolves to "${url.hostname}", not the expected project "${expected}". Nothing was created.`,
    )
  }
  return url.origin
}

/**
 * The connection string must carry the expected ref. Supabase pooled strings
 * carry it in the USERNAME (`postgres.<ref>`); direct strings carry it in the
 * HOST (`db.<ref>.supabase.co`). Both forms are accepted; anything else is not.
 *
 * The string itself is never printed — only the decision.
 */
export function assertHostedDbUrl(raw, ref, varName) {
  denyFrozen(raw, varName)
  let url
  try {
    url = new URL(raw)
  } catch {
    throw new TargetRefused(`${varName} is not a valid connection URL.`)
  }
  if (!/^postgres(ql)?:$/.test(url.protocol)) {
    throw new TargetRefused(`${varName} must be a postgres:// connection string.`)
  }
  denyLoopback(url.hostname, varName)
  const inUser = decodeURIComponent(url.username).toLowerCase().includes(ref)
  const inHost = url.hostname.toLowerCase().includes(ref)
  if (!inUser && !inHost) {
    throw new TargetRefused(
      `REFUSED: ${varName} does not carry the expected project ref "${ref}" ` +
        'in either its username or its host. Nothing was created.',
    )
  }
  return { url, pooled: url.port === '6543', where: inUser ? 'username' : 'host', port: url.port || '5432' }
}

/** Read a required environment variable, or refuse. Never prints the value. */
export function requireVar(name) {
  const raw = process.env[name]
  if (typeof raw !== 'string' || raw.trim() === '') {
    throw new TargetRefused(
      `${name} must be present and non-blank. Set it in .env.local (never committed, never NEXT_PUBLIC_).`,
    )
  }
  return raw.trim()
}
