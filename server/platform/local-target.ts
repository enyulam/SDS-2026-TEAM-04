/**
 * LOCAL TARGET GUARD — the production-side implementation.
 *
 * The application twin of `scripts/fixtures/local-target-guard.mjs`. Same two
 * properties, same order, same prohibition:
 *
 *   1. HARD DENY (unconditional, non-overridable). The frozen demonstration
 *      project below can never be a target of any code in this repository.
 *      There is NO flag, NO environment variable, NO argument and NO code
 *      path that re-enables it. The deny runs against the resolved project id
 *      AND against every derived container name, case-insensitively, before
 *      any other decision is made.
 *
 *   2. POSITIVE PIN (fail-closed). The caller must supply the expected
 *      project id through `BEST_COACH_LOCAL_PROJECT_ID`. Absent, blank or
 *      malformed means REFUSE — never "allow anything", never a default, and
 *      never "whatever container happens to be running".
 *
 * ---------------------------------------------------------------------------
 * WHY THIS EXISTS IN PRODUCTION CODE, NOT ONLY IN SCRIPTS
 * ---------------------------------------------------------------------------
 * `trusted-store.ts` reaches the local database by `docker exec` as `postgres`
 * and writes `report_version` rows through it. It pinned the container name as
 * the literal `supabase_db_best-coach-mvp`.
 *
 * That was safe while one local stack existed. It stopped being safe the
 * moment this development clone took its own project id: the demonstration
 * workspace's stack is STILL RUNNING and still owns those containers, so the
 * literal no longer named this repository's database. It named the FROZEN
 * demonstration database — and a trainer generating a draft in this clone
 * would have written a governed report version into it, with full `postgres`
 * rights, from a repository forbidden to touch it.
 *
 * ⚠️ THE DENY IS ON THE DEMONSTRATION PROJECT IDENTITY, NOT ON A PORT OR A
 * CONTAINER SPELLING. Ports get reassigned and container names are derived;
 * identity is the only thing that is stable enough to guard.
 *
 * ---------------------------------------------------------------------------
 * WHY THERE ARE TWO FILES AND NOT ONE
 * ---------------------------------------------------------------------------
 * Stated plainly rather than papered over. The scripts run under plain Node
 * and cannot import TypeScript; this module ships inside the Next.js server
 * bundle and must not depend on `scripts/`, which is not deployed. So the
 * guard exists once per runtime.
 *
 * They cannot silently diverge: `scripts/fixtures/prove-local-target-guard.mjs`
 * reads both files and asserts the frozen project id and the shape pattern are
 * character-identical. A drift fails that proof.
 *
 * No credential is ever read, printed or returned by this module.
 */

/**
 * ⛔ THE FROZEN DEMONSTRATION LOCAL PROJECT — PERMANENTLY OFF LIMITS.
 *
 * Not configurable. Not overridable. Do not add a bypass, an allow-list, an
 * "unless" flag or an environment escape. If a future task genuinely needs to
 * reach that stack, that is an explicit Operator decision made with a fresh
 * instrument — not a change to this line.
 */
const FROZEN_DEMO_PROJECT_ID = "best-coach-mvp";

/** Docker Compose project name shape: lowercase alnum, hyphen/underscore. */
const PROJECT_ID_SHAPE = /^[a-z0-9][a-z0-9_-]{1,60}$/;

export const VAR_LOCAL_PROJECT_ID = "BEST_COACH_LOCAL_PROJECT_ID";

export class LocalTargetRefused extends Error {}

/**
 * Deny the frozen demonstration project anywhere in a supplied value.
 *
 * Case-insensitive and substring, both on purpose: Docker object names match
 * case-insensitively on Windows, and `supabase_db_…`, `supabase_kong_…` and a
 * bare project id must all be refused — including sibling containers this
 * repository has never heard of.
 */
export function denyFrozenLocal(value: string | null | undefined, what: string): void {
  if (typeof value !== "string") return;
  if (value.toLowerCase().includes(FROZEN_DEMO_PROJECT_ID)) {
    throw new LocalTargetRefused(
      `HARD DENY: ${what} names the FROZEN demonstration local project ` +
        `("${FROZEN_DEMO_PROJECT_ID}"). That stack belongs to the demonstration workspace, ` +
        "is off limits to every code path in this repository, and this refusal cannot be " +
        "disabled. Nothing was read, created, modified or executed.",
    );
  }
}

/**
 * Resolve the expected local project id from the environment. Fail closed.
 *
 * DENY BEFORE SHAPE, deliberately: a caller who aims at the frozen project
 * must be told that, not that their value was well-formed.
 */
export function resolveLocalProjectId(): string {
  const raw = process.env[VAR_LOCAL_PROJECT_ID];
  if (typeof raw !== "string" || raw.trim() === "") {
    throw new LocalTargetRefused(
      `${VAR_LOCAL_PROJECT_ID} must be present and non-blank. There is no default local ` +
        "target — refusing rather than guessing which stack to act on. A guess would reach " +
        "whichever stack happens to be running, which may be the frozen one.",
    );
  }
  const id = raw.trim();
  denyFrozenLocal(id, VAR_LOCAL_PROJECT_ID);
  if (!PROJECT_ID_SHAPE.test(id)) {
    throw new LocalTargetRefused(
      `${VAR_LOCAL_PROJECT_ID} is malformed ("${id}"). A Supabase local project id is ` +
        "lowercase alphanumeric with hyphens or underscores, starting alphanumeric, " +
        "2-61 characters.",
    );
  }
  return id;
}

/**
 * The database container name for a resolved project id.
 *
 * ⚠️ DERIVED, NEVER LITERAL — the whole point. There is exactly one place in
 * production code where a local container name is constructed, and it sits
 * downstream of both the deny and the positive pin, so no caller can obtain a
 * container name without having passed both.
 */
export function localDbContainer(projectId: string): string {
  denyFrozenLocal(projectId, "the resolved local project id");
  const name = `supabase_db_${projectId}`;
  denyFrozenLocal(name, "the derived database container name");
  return name;
}

/**
 * Resolve the local target in one call.
 *
 * ⚠️ CALL THIS LAZILY, AT THE POINT OF USE — never at module scope. The hosted
 * deployment imports the local store's module graph but never executes its
 * docker path, and it has no `BEST_COACH_LOCAL_PROJECT_ID`. Resolving at
 * import would crash production on a variable production does not need.
 */
export function resolveLocalTarget(): { projectId: string; dbContainer: string } {
  const projectId = resolveLocalProjectId();
  return { projectId, dbContainer: localDbContainer(projectId) };
}
