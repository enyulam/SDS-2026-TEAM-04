// =====================================================================
// LOCAL TARGET GUARD — the single implementation every local tool uses
// =====================================================================
//
// The local twin of `hosted-target-guard.mjs`, with the same two
// independent properties, in the same order:
//
//   1. HARD DENY (unconditional, non-overridable). The frozen demonstration
//      project below can never be a target of any local tool in this
//      repository. There is NO flag, NO environment variable, NO argument
//      and NO code path that re-enables it. The deny runs against the
//      resolved project id AND against every derived container name,
//      case-insensitively, before any other decision is made.
//
//   2. POSITIVE PIN (fail-closed). The caller must supply the expected
//      project id through BEST_COACH_LOCAL_PROJECT_ID. Absent, blank or
//      malformed means REFUSE — never "allow anything", never a default,
//      and never "whatever config.toml happens to say".
//
// ---------------------------------------------------------------------
// WHY THIS EXISTS — AND WHAT IT IS ACTUALLY PROTECTING AGAINST
// ---------------------------------------------------------------------
// Three local tools each pinned `best-coach-mvp` as a literal in their own
// source, together with the container name `supabase_db_best-coach-mvp`.
// That was safe while exactly one local stack existed.
//
// It stopped being safe the moment this development clone took its own
// project id. The demonstration workspace's local stack is STILL RUNNING and
// still owns the `best-coach-mvp` containers — so a hard-coded container
// name in this repository no longer means "my database". It means "the
// FROZEN demonstration database", reached by `docker exec`, with full
// `postgres` rights, from a repository that is forbidden to touch it.
//
// A literal that silently repoints at a frozen project when the environment
// changes around it is not a pin. It is a trapdoor. So the target became
// configuration — which is what it always was — and the prohibition became
// code, stated once rather than three times, so it cannot drift between
// call sites.
//
// ⚠️ THE DENY IS ON THE DEMONSTRATION PROJECT ID, NOT ON A PORT. Ports can
// be reassigned; identity cannot. Guarding the port would have been a guard
// against the symptom that was observed, not against the hazard.
//
// No credential is ever read, printed or returned by this module.
// =====================================================================

/**
 * ⛔ THE FROZEN DEMONSTRATION LOCAL PROJECT — PERMANENTLY OFF LIMITS.
 *
 * Its Docker containers (`supabase_db_best-coach-mvp` and siblings) belong to
 * the demonstration workspace, which is frozen. This repository may never
 * read from, write to, exec into, start or stop any of them.
 *
 * Not configurable. Not overridable. Do not add a bypass, an allow-list, an
 * "unless" flag or an environment escape. If a future task genuinely needs to
 * reach that stack, that is an explicit Operator decision made with a fresh
 * instrument — not a change to this line.
 */
const FROZEN_DEMO_PROJECT_ID = 'best-coach-mvp'

/**
 * A Supabase local project id is used verbatim as a Docker Compose project
 * name, so it is lowercase alphanumeric with hyphens or underscores, starting
 * alphanumeric. Bounded so a malformed value cannot become a long argv.
 */
const PROJECT_ID_SHAPE = /^[a-z0-9][a-z0-9_-]{1,60}$/

export const VAR_LOCAL_PROJECT_ID = 'BEST_COACH_LOCAL_PROJECT_ID'

export class LocalTargetRefused extends Error {}

/**
 * Deny the frozen demonstration project anywhere in a supplied value.
 *
 * Case-insensitive on purpose: Docker object names are matched
 * case-insensitively on Windows, so a mixed-case spelling reaches the same
 * container and must be refused the same way.
 *
 * ⚠️ Substring, not equality. `supabase_db_best-coach-mvp`,
 * `supabase_kong_best-coach-mvp` and a bare `best-coach-mvp` must all be
 * refused, and so must any future sibling container this repository has never
 * heard of.
 */
export function denyFrozenLocal(value, what) {
  if (typeof value !== 'string') return
  if (value.toLowerCase().includes(FROZEN_DEMO_PROJECT_ID)) {
    throw new LocalTargetRefused(
      `HARD DENY: ${what} names the FROZEN demonstration local project ` +
        `("${FROZEN_DEMO_PROJECT_ID}"). That stack belongs to the demonstration workspace, ` +
        'is off limits to every tool in this repository, and this refusal cannot be disabled. ' +
        'Nothing was read, created, modified or executed.',
    )
  }
}

/**
 * Resolve the expected local project id from the environment. Fail closed.
 *
 * Order matters and is deliberate: DENY BEFORE SHAPE. A caller who sets the
 * variable to the frozen project must be told they aimed at the frozen
 * project, not that their value was well-formed.
 */
export function resolveLocalProjectId() {
  const raw = process.env[VAR_LOCAL_PROJECT_ID]
  if (typeof raw !== 'string' || raw.trim() === '') {
    throw new LocalTargetRefused(
      `${VAR_LOCAL_PROJECT_ID} must be present and non-blank in .env.local. ` +
        'There is no default local target — refusing rather than guessing which stack to act on. ' +
        'A guess would reach whichever stack happens to be running, which may be the frozen one.',
    )
  }
  const id = raw.trim()
  denyFrozenLocal(id, VAR_LOCAL_PROJECT_ID)
  if (!PROJECT_ID_SHAPE.test(id)) {
    throw new LocalTargetRefused(
      `${VAR_LOCAL_PROJECT_ID} is malformed ("${id}"). A Supabase local project id is lowercase ` +
        'alphanumeric with hyphens or underscores, starting alphanumeric, 2-61 characters.',
    )
  }
  return id
}

/**
 * The database container name for a resolved project id.
 *
 * ⚠️ DERIVED, NEVER LITERAL. This is the whole point: there is now exactly one
 * place in the repository where a local container name is constructed, and it
 * is downstream of both the deny and the positive pin. A tool cannot acquire a
 * container name without having passed both.
 */
export function localDbContainer(projectId) {
  denyFrozenLocal(projectId, 'the resolved local project id')
  const name = `supabase_db_${projectId}`
  denyFrozenLocal(name, 'the derived database container name')
  return name
}

/**
 * Assert that a project id read from `supabase/config.toml` is the expected
 * one. Denies the frozen project first, then requires an exact match.
 */
export function assertConfigProjectId(configProjectId, expected) {
  denyFrozenLocal(configProjectId, 'supabase/config.toml project_id')
  if (configProjectId !== expected) {
    throw new LocalTargetRefused(
      `supabase/config.toml declares project_id "${configProjectId}", but ` +
        `${VAR_LOCAL_PROJECT_ID} expects "${expected}". Refusing rather than acting on a stack ` +
        'the caller did not name.',
    )
  }
  return configProjectId
}

/**
 * Resolve the local target in one call: the project id and its database
 * container, both guarded.
 */
export function resolveLocalTarget() {
  const projectId = resolveLocalProjectId()
  return { projectId, dbContainer: localDbContainer(projectId) }
}
