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
/**
 * ⛔ THE PROVABLY-INTERNAL FUNCTIONS — declared, granted narrowly or not at
 * all, and CORRECTLY unreachable from application code.
 *
 * ⚠️ THIS LIST LIVES HERE, ONCE, AND THAT IS THE POINT. It was previously an
 * inline regex COPIED INTO FOUR SUITES, so adding an entry meant editing four
 * files and forgetting one meant a suite that disagreed with its siblings
 * about what the rule permits. ▶ Same discipline the `D-2` mapping is held to,
 * applied to a test rule: **one definition, or it drifts.**
 *
 * ⛔ AN ENTRY HERE IS A CLAIM THAT NO CLIENT SHOULD EVER CALL IT, and each one
 * states why. This is a narrowing of a safety rule, so it is never a place to
 * park something merely not wired up YET.
 */
export const PROVABLY_INTERNAL = [
  // Called only from inside a policy; never a client entry point.
  "app_management_may_attach_material",
  // The governed action registry itself — read by triggers, not by callers.
  "audit_action_registry",
  /*
   * `D-2`'s band → percentage mapping, and THE ONE PLACE it is held.
   * ⛔ It carries NO GRANT, so no client could call it even if one wanted to,
   * and it is invoked only from inside `SECURITY DEFINER` bodies which run as
   * owner. ▶ Granting it to satisfy a wiring rule would widen the client
   * surface for no caller — the rule pushing a build the wrong way.
   */
  "competency_score",
];

/** True when `name` is one of the provably-internal functions above. */
export function isProvablyInternal(name) {
  return PROVABLY_INTERNAL.some((n) => name === n || name.startsWith(`${n}(`) || name.startsWith(`${n} `));
}

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
  /*
   * `Ruling A` (2026-08-15) -- the same function, DROPPED and recreated with
   * one fewer OUT parameter and a different definition of "total students".
   *
   * ⚠️ IT PAIRS TO THE SAME SUITE, and that is not a shortcut: the rule asks
   * *"is what this migration declares actually CALLED by a suite"*, and
   * `prove-p2-7-dashboard.sql` calls `report_centre_dashboard_summary` in five
   * places -- ▶ and it had to be REWRITTEN for this migration, because the
   * dropped OUT parameter made the old `SELECT ... INTO` fail to compile.
   * A dropped OUT parameter cannot be silently ignored by a SQL consumer the
   * way an unused field can be by a TypeScript one, which is exactly why the
   * Operator ruled *"drop the parameter properly ... leaving it unread is the
   * option that rots."*
   */
  { migration: "20260815090000_portal_ruling_a_dashboard_enrolled.sql", suite: "prove-p2-7-dashboard.sql" },
  /*
   * `P2-11` — the trainer invitation. ⚠️ ITS SUITE IS `.mjs`, NOT `.sql`, and
   * that is the first time this rule has paired to one. ▶ The rule asks *"is
   * what this migration declares actually CALLED by its proof"*, and the answer
   * has to be able to come from a JavaScript harness: this function's
   * governed behaviour is only observable ACROSS role changes and rolled-back
   * transactions, which a plain `.sql` file cannot orchestrate and assert on.
   */
  { migration: "20260815120000_portal_p2_11_admin_create_trainer.sql", suite: "prove-p2-11-add-trainer.mjs" },
  /*
   * The `R-1` forward correction: `coalesce` is SQL GRAMMAR and cannot be
   * schema-qualified, so the shipped body raised on its FIRST statement while
   * all nine of its structural assertions passed. ⚠️ Same function, same
   * suite — and the suite is what CAUGHT it, because it is the only proof that
   * ever executes the function as a real caller.
   */
  { migration: "20260815130000_portal_p2_11_coalesce_fix.sql", suite: "prove-p2-11-add-trainer.mjs" },
  /*
   * `P2-9` — the two student-profile reads, and their own `R-1` forward
   * correction. ⚠️ The second exists because `class_grades.label` does not:
   * the first migration passed TEN assertions, including the new
   * execute-at-apply-time leg, and still shipped a query that raises — because
   * an owner-probe returns at the FIRST gate and this body sits behind three.
   * ▶ **The suite is what reached it**, by calling as a real management caller.
   */
  { migration: "20260815150000_portal_p2_9_student_profile_reads.sql", suite: "prove-p2-9-student-profile.mjs" },
  { migration: "20260815160000_portal_p2_9_class_label_fix.sql", suite: "prove-p2-9-student-profile.mjs" },
  /*
   * `P2-16` slot 2 — the most-improved dimension, and the shared `D-2` helper.
   *
   * ⚠️ ONE OF THE TWO FUNCTIONS THIS MIGRATION DECLARES HAS NO APPLICATION
   * CALLER AND NEVER WILL. `competency_score(competency_rating)` is the single
   * place `D-2`'s band → percentage mapping is held, and it is called ONLY
   * from inside `SECURITY DEFINER` bodies, which run as owner. ▶ It carries
   * no grant, so no client could call it even if one wanted to — and granting
   * it to satisfy a pairing rule would widen the client surface for no caller,
   * which is the rule pushing a build in the wrong direction.
   *
   * ⛔ THE PAIRING IS SATISFIED BY THE MIGRATION'S OTHER FUNCTION,
   * `report_class_improved_dimension`, which the suite executes as a real
   * management caller — including a CONSTRUCTED two-session case, because
   * every fixture module has fewer than two submitted sessions and the
   * computation would otherwise never be reached (§12.15).
   */
  { migration: "20260816090000_portal_p2_16_improved_dimension.sql", suite: "prove-p2-16-class-statistics.mjs" },
  /*
   * The `R-1` forward correction, and it is §26.1's ceiling proving itself a
   * SECOND time — in the phase where the Operator ruled on it.
   *
   * ⛔ The first migration applied with SEVEN PASS notices, one of which
   * EXECUTED the function, and it still could not run for any real caller:
   * `CREATE TABLE AS is not allowed in a non-volatile function`. ▶ As
   * `postgres` there is no application account, so the body returned at its
   * FIRST GATE — twenty lines above the offending statement. **The suite is
   * the only leg that reaches the body.**
   */
  { migration: "20260816093000_portal_p2_16_improved_dimension_fix.sql", suite: "prove-p2-16-class-statistics.mjs" },
  /*
   * `P2-19` — screen `01` Trainer Dashboard. ONE function,
   * `report_list_trainer_reports`, and one `EXECUTE` grant.
   *
   * ⚠️ THE PAIRING MATTERS PARTICULARLY HERE. The apply-time leg `PK-6`
   * executes the function as `postgres`, where `app_current_account_id()` is
   * NULL, so it returns at the FIRST of two gates and proves resolution over
   * roughly a tenth of the body. ▶ The join onto `class_session_assignments`,
   * the `students`/`class_modules`/`class_grades` joins and the whole result
   * projection are reached only by the suite, calling as a real trainer.
   */
  { migration: "20260816120000_portal_p2_19_trainer_reports.sql", suite: "prove-p2-19-trainer-dashboard.mjs" },
  /*
   * `P2-20` — screen `04` Trainer Students. ONE function, ONE grant.
   * ⚠️ Its apply-time leg returns ZERO rows at gate 1; the suite is the only
   * leg that reaches the rating-EXISTENCE semi-join, which is the one piece
   * of this body a mistake would silently turn into a rating VALUE.
   */
  { migration: "20260816140000_portal_p2_20_trainer_students.sql", suite: "prove-p2-20-trainer-students.mjs" },
  /*
   * ⚠️ `P2-21` DECLARED NO FUNCTION AND THEREFORE HAS NO ENTRY HERE — the
   * register pairs MIGRATIONS to suites, and that phase shipped none.
   */
  { migration: "20260817090000_portal_p2_22_parent_child_trainer.sql", suite: "prove-p2-22-parent-dashboard.mjs" },
  /*
   * P2-12 — the first governed WRITE of Part 2 that adds no audit string.
   * Its apply-time leg exercises the REFUSAL path only (not_permitted at gate
   * 1); the suite is the only leg that reaches the inserts, the two audit
   * emissions and the hash chain, as a real management caller.
   */
  { migration: "20260816160000_portal_p2_12_admin_create_student.sql", suite: "prove-p2-12-register-student.mjs" },
  /*
   * `P2-13` — the parent account. Its apply-time leg exercises the REFUSAL
   * path only; the suite reaches five inserts, four audit emissions and the
   * hash chain, as a real management caller.
   */
  { migration: "20260816180000_portal_p2_13_admin_create_parent.sql", suite: "prove-p2-13-create-parent.mjs" },
  /*
   * `P2-14` — the edit and withdrawal paths, and the AUTHORIZED registry
   * extension 23 -> 24. ⚠️ Its apply-time legs exercise the refusal path only;
   * the suite reaches both bodies, the audit emissions and the hash chain.
   */
  { migration: "20260816200000_portal_p2_14_admin_update_student.sql", suite: "prove-p2-14-edit-student.mjs" },
  /*
   * `C-14` WRITE PATH — four functions DROPPED and recreated with wider
   * parameter lists (2026-08-16).
   *
   * ⚠️ IT PAIRS TO FOUR SUITES' WORTH OF CALLERS, and the pairing names the
   * one that exercises the RULED behaviour: `prove-c14-guardian.mjs` calls
   * `admin_update_student` as a real management caller and asserts BOTH
   * directions of the guardian precedence rule. The other three functions are
   * called by `prove-p2-11/12/13`, which were REWRITTEN in the same pass —
   * their positional SQL calls carried the OLD ARITY and broke the moment the
   * signatures changed.
   *
   * ⛔ THAT BREAKAGE IS THE POINT AND IT WAS NOT CAUGHT BY THE NEW
   *   `prove:rpc-arguments` GATE. That gate scans `server/**` for `.rpc()`
   *   call sites; these are POSITIONAL SQL calls inside test suites, a
   *   population it does not see. ▶ The full-sweep run caught them instead,
   *   which is why the sweep is every suite and not the ones expected to be
   *   affected (plan §48.1).
   */
  { migration: "20260816230000_portal_c14_write_path.sql", suite: "prove-c14-guardian.mjs" },
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
        /*
         * ⚠️ `readRpcRows` JOINED THIS SET ON 2026-08-16, AND THE CONTROL IS
         * WHAT NOTICED. When the five `readRows`-over-`.rpc()` sites moved to
         * the new helper, this pattern matched none of them and
         * `PDSa-SHAPEc` went red — ▶ **the rule had no subject left, and the
         * control said so instead of the rule passing over an empty set.**
         * That is the `parentRoute` lesson from `P2-8`: a check whose subject
         * moved is worse than one that fails.
         * ⛔ `readRpcRows` returns an ARRAY, so it carries the same obligation
         * as `readRows`: a `RETURNS record` function resolves to a BARE OBJECT
         * and must be read with `readMaybeRow`.
         */
        const CALL = /\b(readRows|readRpcRows|readMaybeRow)\s*<[^>]*>\s*\(\s*"[^"]*"\s*,\s*\(\)\s*=>\s*[a-zA-Z_$][\w$]*\s*\.rpc\(\s*"([a-z0-9_]+)"/g;
        for (const [, helper, fn] of source.matchAll(CALL)) {
          const setReturning = isSetReturning(fn);
          if (setReturning === undefined) continue; // not a function this run can see
          inspected += 1;
          if (!setReturning && (helper === "readRows" || helper === "readRpcRows")) {
            mismatches.push(`${entry.name}:${fn} is RETURNS record (a bare object) but is read with ${helper}`);
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
