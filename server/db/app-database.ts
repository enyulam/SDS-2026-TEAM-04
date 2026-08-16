import type { Database } from "@/server/db/database.types";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ⛔ THE CLIENT GENERIC — TABLES TYPED, `Functions` DELIBERATELY NOT
 * ═══════════════════════════════════════════════════════════════════════════
 * Operator ruling, 2026-08-16: *"type Tables, drop Functions from the client
 * generic. It keeps the guarantee that caught the defect and removes the
 * entire false class."*
 *
 * ⚠️ **DO NOT "TIGHTEN" THIS BY RE-ADDING `Functions`. IT TIGHTENS NOTHING,
 * AND THE MEASUREMENT IS RECORDED HERE SO THE NEXT READER DOES NOT HAVE TO
 * REPEAT IT.** Typing `Functions` from the generated file produced **12 errors
 * across 2 shapes, and every one was FALSE**:
 *
 * 1. **`Args` are rendered NON-NULLABLE, and SQL parameters are not.**
 *    `admin_create_class_session(p_starts_at time, p_room text, p_term_id uuid)`
 *    accepts `NULL` in all three — a PostgreSQL parameter is nullable unless
 *    the body guards it — while the generator emits `p_starts_at: string`.
 *    ▶ Eight errors on CORRECT code, in `class-creation.ts` and `class-edit.ts`.
 * 2. **`OUT`-parameter functions are typed `Returns: Record<string, unknown>`.**
 *    Any hand-declared row shape is narrower than that, so every `readMaybeRow`
 *    over an RPC went red. ▶ Four errors, in `dashboard.ts` and
 *    `material-transport.ts`.
 *
 * ⛔ **A GATE THAT IS RED FOR FALSE REASONS IS A GATE THAT GETS IGNORED**
 * (§12.13, three recorded instances). Twelve false reds on the build would
 * have bought exactly nothing and cost the signal.
 *
 * ▶ **RPC CORRECTNESS IS COVERED, AND MORE STRONGLY, BY TWO LEGS THE GENERATOR
 * CANNOT MATCH** — §26.1, both required and neither substituting for the other:
 * every migration **executes** its function at apply time, and the paired suite
 * **calls it as a real authorized caller** past every gate. A generator that
 * cannot express argument nullability was never going to be the thing that
 * caught an RPC defect.
 *
 * ✅ **WHAT THIS TYPE STILL GUARANTEES, AND IT IS THE PART THAT MATTERED:**
 * `Tables`, `Views` and `Enums` are fully typed, so `.from("t")` on an unknown
 * table and a wrong column named in a FILTER both fail `tsc` — which is exactly
 * the defect screen `23` shipped.
 *
 * ⚠️ **AND THE HALF `tsc` PROVABLY CANNOT COVER IS COVERED ELSEWHERE.** A wrong
 * column in `.select()` ALONE does not fail, because `PromiseLike.then` is a
 * METHOD and its parameter is therefore compared BIVARIANTLY, so
 * `SelectQueryError<…>[]` slips through the seam. `npm run prove:projection-columns`
 * closes that half by reading the projection SOURCE against the LIVE CATALOGUE.
 * ⛔ **The two cover DIFFERENT halves and neither covers the other's — do not
 * retire either believing the other subsumes it.**
 */
export type AppDatabase = {
  public: Omit<Database["public"], "Functions"> & {
    /**
     * ⛔ Permissive BY DESIGN — see the header. Narrowing this re-introduces
     * twelve false errors and improves nothing.
     */
    Functions: {
      [name: string]: { Args: Record<string, unknown>; Returns: unknown };
    };
  };
};
