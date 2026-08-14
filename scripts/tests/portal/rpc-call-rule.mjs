// =====================================================================
// THE RPC-CALL RULE -- one implementation, used by every portal runner.
// =====================================================================
// ⛔ THE STANDING RULE (Operator, 2026-08-13), set after a migration applied
//    CLEANLY WITH ALL NINE OF ITS ASSERTIONS GREEN while both of its RPCs
//    raised at their first statement:
//
//        "A STRUCTURAL ASSERTION CANNOT PROVE A FUNCTION RUNS. Every RPC
//         migration from here carries a leg that CALLS the function, not
//         one that inspects it."
//
// ▶ THE DEFECT IT CLOSES, stated once so it is not re-derived: PL/pgSQL
//   resolves identifiers at CALL time, not at `CREATE FUNCTION`. A catalogue
//   read therefore proves a function EXISTS, is `SECURITY DEFINER`, has its
//   `search_path` pinned and holds exactly one grant -- and proves NOTHING
//   about whether it can execute a single statement.
//
// ⚠️ IT LIVES HERE, NOT COPIED INTO EACH RUNNER, for the reason the rating
//    colour map was extracted at screen `19`: two copies of a rule is how one
//    of them silently stops enforcing it.
//
// ⚠️ AND THE REGISTRY BELOW IS THE POINT OF FAILURE TO WATCH. A migration
//    that adds an RPC and is never added to `RPC_MIGRATIONS` is invisible to
//    this rule. `assertEveryMigrationPaired` is the guard: it walks the
//    migrations directory and fails if any file declaring a function is
//    absent from the pairing -- so forgetting to register one is caught by
//    the same run that forgets it.
// =====================================================================

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const CREATE_FN = /CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+public\.([a-z0-9_]+)\s*\(/gi;

/**
 * Every migration that declares a `public.` function, paired with the SQL
 * proof suite that must CALL what it declares.
 *
 * ⚠️ `terms` is in the list although it declares NO function. The rule must
 * be satisfiable by *"there is nothing to call"* as well as by *"everything
 * is called"*, or it would push a future phase toward adding a function just
 * to have one.
 */
export const RPC_MIGRATIONS = [
  { migration: "20260812230000_portal_d3_terms_substrate.sql", suite: "prove-p2-2-terms-substrate.sql" },
  { migration: "20260813090000_portal_p2_2_class_creation.sql", suite: "prove-p2-2-class-creation.sql" },
  { migration: "20260813120000_portal_p2_2b_trainer_assignment.sql", suite: "prove-p2-2b-trainer-assignment.sql" },
  { migration: "20260813150000_portal_p2_3_class_edit.sql", suite: "prove-p2-3-class-edit.sql" },
  { migration: "20260813180000_portal_p2_4_class_overview.sql", suite: "prove-p2-4-class-overview.sql" },
  { migration: "20260814090000_portal_p2_6_lesson_materials.sql", suite: "prove-p2-6-lesson-materials.sql" },
  { migration: "20260814140000_portal_p2_7_dashboard_summary.sql", suite: "prove-p2-7-dashboard.sql" },
  // The R-1 forward comment correction. It declares NO function, and the rule
  // must be satisfiable by "there is nothing to call" as well as by
  // "everything is called" -- otherwise a correction like this one would be
  // pushed toward inventing a function just to have one.
  { migration: "20260814141000_portal_p2_7_comment_fix.sql", suite: "prove-p2-7-dashboard.sql" },
];

/** Every `public.<name>` a migration declares, in file order. */
export function declaredFunctions(sql) {
  return [...sql.matchAll(CREATE_FN)].map((match) => match[1]);
}

/**
 * Which declared functions the paired suite never calls.
 *
 * A CALL is the schema-qualified name followed by an open paren, anywhere in
 * the suite — `SELECT … FROM public.f(`, `PERFORM public.f(`.
 */
export function uncalledFunctions(root, pairs = RPC_MIGRATIONS) {
  const uncalled = [];
  let declared = 0;
  for (const { migration, suite } of pairs) {
    const sql = readFileSync(join(root, "supabase", "migrations", migration), "utf8");
    const proof = readFileSync(join(root, "scripts", "tests", "portal", suite), "utf8");
    for (const name of declaredFunctions(sql)) {
      declared += 1;
      if (!new RegExp(`public\\.${name}\\s*\\(`).test(proof)) uncalled.push(`${migration}:${name}`);
    }
  }
  return { declared, uncalled };
}

/**
 * ⛔ THE GUARD ON THE REGISTRY ITSELF.
 *
 * Walks the migrations directory from the first portal-phase migration
 * onward and reports any file that declares a `public.` function but is not
 * paired above. ▶ Without this, the rule quietly stops covering new work: a
 * phase adds an RPC, forgets the pairing, and every existing leg still
 * passes.
 *
 * ⚠️ Scoped to migrations at or after `PORTAL_ERA`, because the pre-portal
 * migrations were written before this rule existed and pairing them
 * retroactively is a separate piece of work, not something to smuggle in
 * behind a helper.
 */
const PORTAL_ERA = "20260812230000";

/**
 * ⛔ THE SECOND STANDING RULE, ADDED 2026-08-14 AFTER A MEASURED DEFECT.
 *
 * The rule above closes *"a structural assertion cannot prove a function
 * RUNS"*. This one closes the next gap out: **A SQL LEG THAT CALLS A FUNCTION
 * CANNOT PROVE THE CLIENT RECEIVES THE SHAPE IT EXPECTS.**
 *
 * ▶ THE DEFECT IT CLOSES, stated once so it is not re-derived. PostgREST
 * resolves a `RETURNS record` function (`proretset = false`) to a BARE OBJECT
 * and a `RETURNS SETOF` / `RETURNS TABLE` function to an ARRAY. `readRows`
 * types its payload `TRow[]`, so a consumer reading `rows[0]` off a bare object
 * gets `undefined` on EVERY call. ⚠️ It then FAILS CLOSED, which is the trap:
 * the surface renders its refusal state and looks deliberate.
 *
 * ⚠️ AND NO SQL LEG CAN SEE IT. In SQL, `SELECT … FROM f()` reads both shapes
 * identically — `P2-7`'s seven SQL legs were all green while all four of its
 * KPI tiles rendered the refusal glyph in the browser.
 *
 * `readMaybeRow` accepts EITHER shape and is the correct helper for a
 * single-record RPC; `readRows` is correct only for a set-returning one.
 *
 * @param root repository root
 * @param isSetReturning `(fnName) => boolean | undefined` — supplied by the
 *   caller from `pg_proc.proretset`. ⛔ Read from the DATABASE, never parsed
 *   out of the migration text: the catalogue is what PostgREST itself reads.
 */
export function rpcShapeMismatches(root, isSetReturning) {
  const mismatches = [];
  let inspected = 0;
  const dir = join(root, "server", "modules");
  const walk = (path) => {
    for (const entry of readdirSync(path, { withFileTypes: true })) {
      const full = join(path, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".ts")) {
        const source = readFileSync(full, "utf8");
        /*
         * The helper and the RPC name sit in one expression:
         *   readRows<T>("ctx", () => client.rpc("fn", …))
         * so one pattern spanning them is enough, and it cannot pair a helper
         * with an RPC from a different statement.
         */
        const CALL = /\b(readRows|readMaybeRow)\s*<[^>]*>\s*\(\s*"[^"]*"\s*,\s*\(\)\s*=>\s*[a-zA-Z_$][\w$]*\s*\.rpc\(\s*"([a-z0-9_]+)"/g;
        for (const [, helper, fn] of source.matchAll(CALL)) {
          const setReturning = isSetReturning(fn);
          if (setReturning === undefined) continue; // not a function this run can see
          inspected += 1;
          if (!setReturning && helper === "readRows") {
            mismatches.push(`${entry.name}:${fn} is RETURNS record (a bare object) but is read with readRows`);
          }
        }
      }
    }
  };
  walk(dir);
  return { inspected, mismatches };
}

export function unpairedMigrations(root, pairs = RPC_MIGRATIONS) {
  const dir = join(root, "supabase", "migrations");
  const paired = new Set(pairs.map((pair) => pair.migration));
  const missing = [];
  for (const file of readdirSync(dir).filter((name) => name.endsWith(".sql")).sort()) {
    if (file < PORTAL_ERA || paired.has(file)) continue;
    if (declaredFunctions(readFileSync(join(dir, file), "utf8")).length > 0) missing.push(file);
  }
  return missing;
}

/**
 * ⛔ THE THIRD STANDING RULE, ADDED 2026-08-14 BY OPERATOR RULING AFTER `P2-6`
 *    SHIPPED A SURFACE OVER AN UNWIRED WRITE PATH AND REPORTED COMPLETE.
 *
 * > *"rpc-call-rule proves a function runs in SQL. It cannot prove any
 * >  application path reaches it. Extend it: every RPC declared in a migration
 * >  must be called from APPLICATION code — a port method, adapter action or
 * >  server action — not only from its SQL suite. A function reachable only
 * >  from a test is an unwired write path."*
 *
 * ▶ THE DEFECT IT CLOSES. `P2-6` shipped `class_session_materials`, a private
 *   bucket, a storage policy and five functions — all correct, all granted,
 *   all CALLED BY THEIR SQL SUITE, so both existing rules passed. The screen
 *   rendered three DISABLED controls. **Nothing in the application ever called
 *   `material_attach_confirm`, `material_signed_path` or `material_remove`:
 *   every mention was inside a comment.**
 *
 * ⛔ SOME FUNCTIONS ARE LEGITIMATELY UNCALLED FROM THE APPLICATION, and the
 *   exemption is PROVEN, NEVER DECLARED. An allow-list would let the next
 *   unwired path be waved through by adding a name to it. Instead a function
 *   with no application caller must be shown to be INTERNAL — referenced by an
 *   RLS policy expression or by another function's body, read from the live
 *   catalogue:
 *     · `app_management_may_attach_material` — the predicate of the
 *       lesson-materials storage policy (policy=1)
 *     · `audit_action_registry` — read by two other function bodies
 *   Neither is reachable from a client, and neither should be.
 *
 * ⚠️ AND THE FIRST DRAFT OF THAT PROOF WAS WRONG, which is kept because the
 *    trap is subtle: it matched with `LIKE '%name%'`, and in SQL `LIKE` the
 *    UNDERSCORE IS A SINGLE-CHARACTER WILDCARD. `'%material_remove%'` therefore
 *    matched the audit string `material.removed`, and `material_remove` — a
 *    genuinely unwired write path — was reported as internally referenced and
 *    would have been EXEMPTED BY ITS OWN DETECTOR. ▶ Use `strpos`, which has no
 *    pattern language. **A detector whose matcher silently wildcards is worse
 *    than no detector, because it fails toward "fine".**
 *
 * @param root repository root
 * @param isInternal `(fnName) => boolean` — supplied by the caller from the
 *   live catalogue (policy expressions + other function bodies, matched with
 *   `strpos`). ⛔ Never a hard-coded list.
 */
export function rpcsWithoutApplicationCaller(root, isInternal, pairs = RPC_MIGRATIONS) {
  const roots = ["server", "lib", "features", "app"];
  const sources = [];
  const walk = (path) => {
    let entries;
    try {
      entries = readdirSync(path, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = join(path, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== "node_modules") walk(full);
      } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
        sources.push(stripSourceComments(readFileSync(full, "utf8")));
      }
    }
  };
  for (const dir of roots) walk(join(root, dir));
  const application = sources.join("\n");

  const unwired = [];
  const internal = [];
  let declaredCount = 0;
  const seen = new Set();
  for (const { migration } of pairs) {
    const sql = readFileSync(join(root, "supabase", "migrations", migration), "utf8");
    for (const name of declaredFunctions(sql)) {
      if (seen.has(name)) continue;
      seen.add(name);
      declaredCount += 1;
      // A CALL is `.rpc("name"` — the only way application code reaches one.
      if (new RegExp(`\\.rpc\\(\\s*["']${name}["']`).test(application)) continue;
      if (isInternal(name)) internal.push(name);
      else unwired.push(`${name} (${migration})`);
    }
  }
  return { declaredCount, unwired, internal };
}

/** Comment-stripper, local so this rule never depends on a suite's copy. */
function stripSourceComments(src) {
  return src
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
}
