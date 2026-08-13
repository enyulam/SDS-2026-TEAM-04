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
