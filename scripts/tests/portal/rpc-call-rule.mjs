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
