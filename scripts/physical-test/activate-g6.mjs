#!/usr/bin/env node
// =====================================================================
// B.E.S.T Coach — the ONE sanctioned G-6 activation harness (Run C3-C)
// =====================================================================
// Operator ruling R-C2-4 requires G-6 to be decided from a REAL, verified
// call to the already-ratified provider (openai / gpt-5.6-terra), and
// forbids PASS on fixture text, a cached value, a replayed panel or an
// unverified assumption that a call succeeded. Run C3-B's read-only audit
// found no existing runner could satisfy that evidence contract:
// `run-f17-disposable.mjs` and `prove-disposable-app.mjs` are both
// structurally incapable of a real call, and `run-integration.mjs`'s
// INT-L2b leg can call the provider but calls it DIRECTLY (bypassing
// `requestDraftCore`) and never assembles the differential/inequality/
// audit evidence a PASS requires — see docs, §12/§13/§14 of
// `UI_REFERENCE_FINAL_MVP/AUTONOMOUS_48H_EXECUTION_TRACKER.md`.
//
// THIS FILE is the single, bounded replacement for "a deliberate G-6
// activation still needs it" — the one place the real provider may be
// exercised for gate evidence. No other file gains that capability by
// this change: `run-integration.mjs`'s INT-L2b leg is UNCHANGED and
// UNWIDENED (regression coverage only, never G-6 evidence);
// `run-f17-disposable.mjs` keeps its unconditional G-6 NOT-RUN;
// `prove-disposable-app.mjs` keeps its invalid-provider overwrite.
// `scripts/tests/g6-harness/census-provider-constructors.mjs` asserts,
// on every verification run, that no fourth `new OpenAiDraftProvider(`
// call site exists anywhere in the repository.
//
// ---------------------------------------------------------------------
// WHAT THIS FILE WILL NEVER DO
// ---------------------------------------------------------------------
//  * Make a real provider call without the OPERATOR typing an exact
//    confirmation phrase, on an interactive TTY, immediately before the
//    first billable request — checked freshly for EACH of the two reports
//    this run drives, not once for the whole process. Each confirmation
//    covers UP TO TWO real requests for that one report: requestDraftCore's
//    own bounded-retry loop may re-call the provider once if the first
//    attempt is rejected or fails retryably, so one typed confirmation can
//    authorize up to two calls, and the run as a whole up to four — this is
//    disclosed to the operator at each confirmation prompt, not hidden
//    behind "two calls" language that would undercount what can happen.
//  * Accept an approximate activation flag (`=1`, `=true`, `=yes`, or any
//    token that is not byte-identical to `--activate-real-provider`) as
//    authorization. Argument parsing is exact-set-membership; an unknown
//    token aborts before anything runs (the same discipline as
//    `run-f17-disposable.mjs`'s `parseArgs`).
//  * Read a password, token or key from anywhere but the operator's own
//    already-exported shell environment (`LLM_API_KEY`, inherited — never
//    a file, never an argument, never a default).
//  * Print, log, hash-visibly or persist `LLM_API_KEY`'s value, an
//    Authorization header, a cookie, a JWT, or a complete provider
//    request/response body. Evidence carries only: the ratified provider
//    and model literals, a provider-echoed model string, a request id,
//    token-usage counts, and SHA-256 content hashes of generated prose —
//    never the prose itself in full, never a header.
//  * Write to any GOVERNED table on the canonical `postgres` database —
//    reports, report_versions, observations, audit_events, accounts, or
//    anything else the application or its governance rules own. The two
//    real assessments are driven on freshly cloned DISPOSABLE logical
//    databases (`bc_g6_seed` / `bc_g6`) inside the same local Supabase
//    Postgres container — not a second Auth-bearing stack (no Auth session
//    is needed: the governed RPCs are invoked through a psql-backed caller
//    bound to a fixture identity's `sub`, exactly like `PsqlRpc` in
//    `run-integration.mjs` Part 3, which established this pattern).
//    DISCLOSED, NOT HIDDEN: cloning a database (`CREATE DATABASE ...
//    TEMPLATE postgres`) requires Postgres itself to briefly disallow new
//    connections to, and terminate other backends on, the TEMPLATE
//    database being cloned FROM — the same catalog-level mechanics
//    `run-integration.mjs` Part 3 already uses and restores a moment
//    later. This is system-catalog housekeeping the database engine
//    requires to take the clone, not a write to any governed table, and it
//    is reverted before the clone step even begins.
//  * Let a non-loopback network request leave this process to any host
//    but `api.openai.com`, and even that only after activation is
//    confirmed. An outward-fetch trip-wire is armed for the ENTIRE run;
//    it is narrowed (never removed) around the two real generation calls.
//  * Replay, cache, or hand-construct a panel and feed it back into
//    `requestDraftCore` as a substitute for a live `provider.generate()`
//    call. Every `draft_ready` this harness can claim as G-6 evidence
//    is reached by `requestDraftCore` calling the REAL
//    `OpenAiDraftProvider.generate()` itself — this file constructs the
//    provider and hands it to the real orchestration function; it never
//    calls `.generate()` directly as a substitute path.
//  * Stamp G-6 PASS on partial, missing, or unmeasured evidence. Every
//    one of the sixteen contract items in §3 of the operator's brief is
//    its own ledger line, default NOT-RUN, and G-6 itself PASSes only if
//    every one of them does.
//
// ---------------------------------------------------------------------
// USAGE
// ---------------------------------------------------------------------
//   node --import ./scripts/tests/integration/alias-loader.mjs \
//     scripts/physical-test/activate-g6.mjs --help
//
//   node --import ./scripts/tests/integration/alias-loader.mjs \
//     scripts/physical-test/activate-g6.mjs --dry-run
//
//   node --import ./scripts/tests/integration/alias-loader.mjs \
//     scripts/physical-test/activate-g6.mjs --activate-real-provider
//
// The `--import` alias loader is the same one `run-integration.mjs` uses
// to resolve this repository's `@/` TypeScript path alias under plain
// Node; it is not duplicated here (Option B duplication is for
// SECURITY-REVIEWED runner primitives with diverging literals — this is
// shared, unmodified, non-diverging plumbing, so reuse is correct).
//
// Bare invocation (no flags) behaves exactly like `--dry-run`: the
// default is always non-billable. `--activate-real-provider` is the ONLY
// flag capable of authorizing a real call, and only in combination with
// an interactive TTY and the typed confirmation phrase below.
// =====================================================================

import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { requireRatifiedLlmConfig } from "@/server/platform/llm-config.ts";
import {
  DeterministicFixtureDraftProvider,
  OpenAiDraftProvider,
  validatePanelShape,
  PANEL_KEYS,
} from "@/server/modules/ai-drafting/provider.ts";
import { requestDraftCore } from "@/server/modules/ai-drafting/request-draft-core.ts";
import { LocalTrustedDraftStore } from "@/server/modules/ai-drafting/trusted-store.ts";
import { saveObservationCore, getTrainerObservationCore } from "@/server/modules/observation/core.ts";
import { validateGrounding } from "@/server/modules/ai-drafting/grounding.ts";
import { POLARITY_BANDS } from "@/server/modules/framework/dimensions.ts";

import { resolveLocalTarget } from "../fixtures/local-target-guard.mjs";

// =====================================================================
// SafeError — every message here is AUTHORED in this repository. Nothing
// derived from captured child output, a provider response, or an
// environment VALUE is ever wrapped in one.
// =====================================================================
export class SafeError extends Error {}

export const say = (message) => process.stdout.write(`${message}\n`);
export const warn = (message) => process.stdout.write(`  [!] ${message}\n`);
export const pass = (message) => process.stdout.write(`  [ok] ${message}\n`);
export const phase = (title) => process.stdout.write(`\n== ${title} ==\n`);

// =====================================================================
// Argument parsing — EXACT set membership only. An approximate flag
// (`--activate-real-provider=1`, `=true`, `=yes`, a trailing bareword
// `true`/`yes` token, anything not byte-identical to one of the four
// accepted tokens) is rejected before anything runs. This mirrors
// `run-f17-disposable.mjs`'s `parseArgs`, which is the established,
// reviewed pattern in this repository for "no approximate authorization".
// =====================================================================
export const ACTIVATE_FLAG = "--activate-real-provider";
export const DRY_RUN_FLAG = "--dry-run";
export const HELP_FLAGS = new Set(["--help", "-h"]);
const KNOWN_FLAGS = new Set([ACTIVATE_FLAG, DRY_RUN_FLAG, ...HELP_FLAGS]);

export function parseArgs(argv) {
  const args = argv.slice(2);
  if (args.length === 0) return { mode: "dry-run" };
  for (const arg of args) {
    if (!KNOWN_FLAGS.has(arg)) {
      throw new SafeError(
        `Unsupported argument '${arg}'. This harness accepts only --help, --dry-run and ${ACTIVATE_FLAG} — ` +
          "byte-identical tokens only. There is no '=1', '=true', '=yes' or any other approximate form of the " +
          "activation flag, and there never will be: a flag that merely LOOKS like activation must never BE " +
          "activation.",
      );
    }
  }
  if (args.some((a) => HELP_FLAGS.has(a))) return { mode: "help" };
  const activate = args.includes(ACTIVATE_FLAG);
  const dryRun = args.includes(DRY_RUN_FLAG);
  if (activate && dryRun) {
    throw new SafeError(`${ACTIVATE_FLAG} and ${DRY_RUN_FLAG} are mutually exclusive. Choose exactly one.`);
  }
  return { mode: activate ? "activate" : "dry-run" };
}

const HELP = `
B.E.S.T Coach — the sanctioned G-6 activation harness (Run C3-C)

  node --import ./scripts/tests/integration/alias-loader.mjs \\
    scripts/physical-test/activate-g6.mjs --help
  node --import ./scripts/tests/integration/alias-loader.mjs \\
    scripts/physical-test/activate-g6.mjs --dry-run
  node --import ./scripts/tests/integration/alias-loader.mjs \\
    scripts/physical-test/activate-g6.mjs --activate-real-provider

WHAT IT DOES
  Provisions a DISPOSABLE logical database inside the local Supabase
  Postgres container (never the canonical database), drives TWO real,
  materially different Trainer assessments (all nine governed dimensions,
  distinct ratings and notes) through the REAL governed report lifecycle
  (assessment_save_complete_and_open_report -> requestDraftCore), proves
  the deterministic contradiction-rejection path is live on THIS run, and
  — ONLY in --activate-real-provider mode, only after an interactive
  TTY confirmation typed immediately before the first billable request —
  lets requestDraftCore call the REAL, ratified OpenAiDraftProvider for
  each of the two assessments. It then evaluates the complete sixteen-item
  G-6 evidence contract and writes a redacted ledger. Disposable resources
  are torn down on every exit path, including Ctrl+C and an unhandled
  exception. The canonical database is read (never written) before and
  after, to prove it stayed byte-identical.

MODES
  --help                print this and exit. Decides nothing, calls nothing.
  --dry-run (default)   NON-BILLABLE. Exercises every step above except the
                         real provider call: provisioning, the two real
                         assessments, request construction, selector-
                         posture reporting, the deterministic contradiction
                         proof, the fixture-inequality check machinery, the
                         fail-closed ledger, and teardown. G-6 is stamped
                         NOT-RUN unconditionally. Zero external requests —
                         the outward-fetch trip-wire is armed for loopback
                         only.
  --activate-real-provider
                         Requires an interactive TTY. Requires the ratified
                         LLM_PROVIDER/LLM_MODEL/LLM_API_KEY selectors to be
                         present and exactly correct (checked through the
                         SAME requireRatifiedLlmConfig() production uses —
                         never a looser presence-only test). Immediately
                         before EACH of the two real generation attempts,
                         prints exactly what is about to happen and REQUIRES
                         the operator to type the literal phrase
                         "ACTIVATE G-6 <n>/2" (n = 1 or 2) at a visible
                         (non-hidden — it is a confirmation, not a secret)
                         prompt. Anything else aborts the run. The outward-
                         fetch trip-wire narrows, for the duration of each
                         confirmed call only, to allow exactly one host:
                         api.openai.com. EACH confirmation covers UP TO TWO
                         real requests for that one report (requestDraftCore's
                         own bounded-retry loop may re-call the provider once
                         on a rejected or retryable-failed first attempt) —
                         so this run makes at minimum 2 and at most 4 real,
                         billable requests in total, never more.

G-6 EVIDENCE CONTRACT
  G-6 PASSes only when all sixteen operator-specified conditions hold —
  see the ledger this run writes, and the Run C3-C report, for the full
  enumerated list and which check proves each one. Any unproved or failed
  condition stamps G-6 NOT-RUN or FAIL, never PASS.

EXIT CODES
  0   dry-run: every non-billable step completed. activate: G-6 PASS.
  1   a step failed, or the run aborted (including a rejected confirmation).
  2   activate mode completed with no failure but G-6 did not reach PASS
      (e.g. a real call failed or a differential/inequality check did not
      hold) — recorded, never invented as success.
  130 interrupted (Ctrl+C). Teardown still runs; the ledger still writes.
`;

// =====================================================================
// Disposable-database plumbing — the SAME accepted pattern
// `run-integration.mjs` Part 3 uses (clone a logical database from the
// `postgres` template inside the ALREADY-RUNNING local Supabase Postgres
// container). Distinct database names (`bc_g6_seed` / `bc_g6`) so this
// harness can never collide with `run-integration.mjs`'s own
// `bc_b2_seed` / `bc_b2` disposable databases.
// =====================================================================
// ⚠️ NOT A LITERAL. This was `supabase_db_best-coach-mvp` — the FROZEN
// demonstration container — and with both local stacks running that name
// RESOLVED, so this harness reached the demonstration database instead of
// this repository's. Guarded resolution: unconditional non-overridable HARD
// DENY of the frozen project, then a fail-closed pin from
// BEST_COACH_LOCAL_PROJECT_ID. Container name DERIVED, never literal.
const { dbContainer: CONTAINER } = resolveLocalTarget();
const SEED_DB = "bc_g6_seed";
const WORK_DB = "bc_g6";

function psql(db, sql, { tuplesOnly = true, stopOnError = true, user = "postgres" } = {}) {
  return new Promise((resolvePromise) => {
    const args = [
      "exec", "-i", CONTAINER, "psql", "--no-psqlrc", `--username=${user}`,
      `--dbname=${db}`, "--quiet", "--set=VERBOSITY=verbose",
    ];
    if (stopOnError) args.push("--set=ON_ERROR_STOP=1");
    if (tuplesOnly) args.push("-t", "-A", "-F|");
    const p = spawn("docker", args, { stdio: ["pipe", "pipe", "pipe"] });
    let out = "", err = "";
    p.stdout.on("data", (d) => { out += d; });
    p.stderr.on("data", (d) => { err += d; });
    p.on("close", (code) => resolvePromise({ code, out: out.trim(), err: err.trim() }));
    p.stdin.end(sql);
  });
}

async function q(db, sql) {
  const r = await psql(db, sql);
  if (r.code !== 0) throw new SafeError(`A disposable-database SQL step failed on ${db}.`);
  return r.out;
}

export async function createDisposable() {
  const sql = `
UPDATE pg_database SET datallowconn = false WHERE datname = 'postgres';
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'postgres' AND pid <> pg_backend_pid();
SELECT pg_sleep(1);
DROP DATABASE IF EXISTS ${SEED_DB};
CREATE DATABASE ${SEED_DB} TEMPLATE postgres;
UPDATE pg_database SET datallowconn = true WHERE datname = 'postgres';
ALTER DATABASE ${SEED_DB} OWNER TO postgres;`;
  const r = await psql("template1", sql, { tuplesOnly: false, user: "supabase_admin" });
  if (r.code !== 0) throw new SafeError("Could not create the disposable seed database.");
  const w = await psql(
    "template1",
    `DROP DATABASE IF EXISTS ${WORK_DB};
     CREATE DATABASE ${WORK_DB} TEMPLATE ${SEED_DB};
     ALTER DATABASE ${WORK_DB} OWNER TO postgres;`,
    { tuplesOnly: false, user: "supabase_admin" },
  );
  if (w.code !== 0) throw new SafeError("Could not create the disposable working database.");
}

export async function destroyDisposable() {
  await psql("template1", `DROP DATABASE IF EXISTS ${WORK_DB};`, { tuplesOnly: false, stopOnError: false, user: "supabase_admin" });
  await psql("template1", `DROP DATABASE IF EXISTS ${SEED_DB};`, { tuplesOnly: false, stopOnError: false, user: "supabase_admin" });
}

/** Positive measurement, not an assumption: neither disposable database exists after teardown. */
export async function disposableDatabasesPresent() {
  const out = await q(
    "template1",
    `SELECT datname FROM pg_database WHERE datname IN ('${SEED_DB}', '${WORK_DB}') ORDER BY datname;`,
  );
  return out === "" ? [] : out.split("\n").filter(Boolean);
}

function sqlLiteral(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "NULL";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (Array.isArray(value)) {
    if (value.every((v) => typeof v === "string")) {
      return `ARRAY[${value.map((v) => `'${v.replaceAll("'", "''")}'`).join(",")}]::text[]`;
    }
    return `'${JSON.stringify(value).replaceAll("'", "''")}'::jsonb`;
  }
  if (typeof value === "object") return `'${JSON.stringify(value).replaceAll("'", "''")}'::jsonb`;
  return `'${String(value).replaceAll("'", "''")}'`;
}

/** A psql-backed RpcCaller bound to one fixture identity's sub, on the DISPOSABLE working database. */
export class PsqlRpc {
  constructor(sub) { this.sub = sub; }
  async rpc(fn, args = {}) {
    const named = Object.entries(args).map(([k, v]) => `${k} => ${sqlLiteral(v)}`).join(", ");
    const claims = this.sub ? `{"sub":"${this.sub}","role":"authenticated"}` : "";
    const sql = `SET request.jwt.claims = '${claims}';
SELECT COALESCE(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(x)), '[]'::jsonb) FROM public.${fn}(${named}) x;`;
    const r = await psql(WORK_DB, sql);
    if (r.code !== 0) {
      const m = /ERROR: {2}([0-9A-Z]{5}):/.exec(r.err);
      return { data: null, error: { code: m ? m[1] : undefined, message: "rpc failed" } };
    }
    try {
      return { data: JSON.parse(r.out.split("\n").pop()), error: null };
    } catch {
      return { data: null, error: { code: undefined, message: "unparseable rpc result" } };
    }
  }
}

// =====================================================================
// Fixture identities and centre — the SAME committed Step 7F literals
// `run-integration.mjs` uses; this harness creates no new identity.
// =====================================================================
const CENTRE = "b0000000-0000-4000-8000-000000000001";
const STUDENT = "c2000000-0000-4000-8000-000000000001";
const MODULE = "c4000000-0000-4000-8000-000000000001";
const ENROLMENT = "c6000000-0000-4000-8000-000000000001";
const TRAINER_M = "c1000000-0000-4000-8000-000000000002";
const SUB_TRAINER = "d0000000-0000-4000-8000-000000000002";

/** Distinct from run-integration.mjs's ab000000... session literal. */
const SESSION_A = "ac000000-0000-4000-8000-000000000001";
const SESSION_B = "ac000000-0000-4000-8000-000000000002";

// =====================================================================
// Two materially different real assessment profiles — all nine
// dimensions, deliberately distinct ratings AND distinct trainer/
// follow-up notes, so a real generation from each has every reason to
// diverge and no reason to coincide.
// =====================================================================
export const PROFILE_A = {
  session: SESSION_A,
  label: "Profile A — positive-leaning",
  ratings: [
    { dimensionCode: "body", rating: "mastered" },
    { dimensionCode: "emotion", rating: "mastering" },
    { dimensionCode: "speech", rating: "mastered" },
    { dimensionCode: "tonality", rating: "mastering" },
    { dimensionCode: "eye_contact", rating: "developing" },
    { dimensionCode: "vocal_projection", rating: "mastered" },
    { dimensionCode: "emotional_expression", rating: "mastering" },
    { dimensionCode: "sentence_flow", rating: "developing" },
    { dimensionCode: "audience_awareness", rating: "mastering" },
  ],
  strengthChips: ["confident-opening", "strong-posture"],
  focusChips: ["eye-contact-transitions"],
  observationNotes:
    "Delivered a well-organized three-minute persuasive speech about recycling at school, maintaining strong " +
    "posture and using purposeful hand gestures to emphasize the main argument.",
  followUpNotes: "Continue building consistency in eye contact during transitions between speech sections.",
  termEvidenceNotes: "",
};

export const PROFILE_B = {
  session: SESSION_B,
  label: "Profile B — needs-support-leaning",
  ratings: [
    { dimensionCode: "body", rating: "beginning" },
    { dimensionCode: "emotion", rating: "developing" },
    { dimensionCode: "speech", rating: "beginning" },
    { dimensionCode: "tonality", rating: "developing" },
    { dimensionCode: "eye_contact", rating: "beginning" },
    { dimensionCode: "vocal_projection", rating: "developing" },
    { dimensionCode: "emotional_expression", rating: "beginning" },
    { dimensionCode: "sentence_flow", rating: "developing" },
    { dimensionCode: "audience_awareness", rating: "beginning" },
  ],
  strengthChips: ["willing-to-try"],
  focusChips: ["reading-from-notes", "audience-engagement"],
  observationNotes:
    "Read from prepared notes for most of the session and needed frequent prompts to look up and re-engage the " +
    "audience during a short unscripted introduction exercise.",
  followUpNotes: "Practise a thirty-second unscripted introduction at home, looking up between sentences.",
  termEvidenceNotes: "",
};

/** ContradictoryProvider — the deterministic, non-billable rejection proof (never a G-6 PASS input). */
class ContradictoryProvider {
  async generate() {
    return {
      kind: "ok",
      panels: {
        overview: "A remarkable, exceptional session with no difficulty anywhere.",
        strengths: "Excellent eye contact throughout — truly outstanding and clearly mastered.",
        areasForDevelopment: "Nothing to develop; every skill is already perfect.",
        remarks: "Flawless facial expressions throughout, with effortless delivery.",
      },
    };
  }
}

// =====================================================================
// Outward-fetch trip-wire — ARMED FOR THE WHOLE PROCESS LIFETIME. Its
// allow-list starts and ends at loopback-only; it is narrowed to include
// exactly `api.openai.com` for the duration of a single confirmed real
// call, then restored. This is the load-bearing structural guarantee
// behind "no non-loopback connection" in dry-run mode and "only the
// ratified host was contacted" in activate mode — never a convention.
// =====================================================================
const LOOPBACK = new Set(["127.0.0.1", "localhost", "::1", "[::1]", "0.0.0.0"]);
export const tripwire = {
  allowedHost: null, // null = loopback only
  refusedAttempts: [],
};

function hostOf(input) {
  try {
    const raw = typeof input === "string" ? input
      : input instanceof URL ? input.href
      : (input && typeof input.url === "string" ? input.url : "");
    return raw ? new URL(raw).hostname : "";
  } catch {
    return "";
  }
}

export function armTripwire() {
  if (typeof globalThis.fetch !== "function") return;
  const passthrough = globalThis.fetch;
  globalThis.fetch = function guardedFetch(input, init) {
    const host = hostOf(input);
    const allowed = host && (LOOPBACK.has(host) || host === tripwire.allowedHost);
    if (host && !allowed) {
      tripwire.refusedAttempts.push(host);
      throw new SafeError(
        `An outward request to host '${host}' was refused: this run is not authorized to contact it. Only ` +
          `${tripwire.allowedHost ?? "loopback hosts"} may currently be reached.`,
      );
    }
    return passthrough(input, init);
  };
}

// =====================================================================
// The G-6 evidence ledger — sixteen conditions, each its own line,
// default NOT-RUN. G-6 itself is a SEPARATE, final line computed ONLY
// from the sixteen — never asserted independently of them.
// =====================================================================
export const G6_CONDITIONS = [
  ["1", "Provider is exactly openai"],
  ["2", "Model is exactly the ratified model"],
  ["3", "Both requests originate from real disposable Trainer assessments"],
  ["4", "All nine ratings and Trainer notes are represented in each grounded request"],
  ["5", "Structured output parses and passes schema validation"],
  ["6", "Grounding validation ran on each real generation"],
  ["7", "The two generated drafts materially differ"],
  ["8", "Neither generated draft equals any pinned fixture-provider panel"],
  ["9", "Neither generated draft is cached, replayed or hard-coded"],
  ["10", "Both reports reach draft_ready through requestDraftCore"],
  ["11", "Persisted panels correspond to the generated, validated panels"],
  ["12", "Contradictory/ungrounded output is rejected and not stored (this run)"],
  ["13", "Provider timeout/invalid-JSON/failure leave no false draft_ready (static proof)"],
  ["14", "Exactly the expected audit transitions occur"],
  ["15", "Canonical Supabase remains byte-identical"],
  ["16", "All disposable resources are removed"],
];

export function newLedger() {
  const ledger = new Map();
  for (const [id] of G6_CONDITIONS) ledger.set(id, { verdict: "NOT-RUN", reason: "not reached" });
  return ledger;
}

function setVerdict(ledger, id, verdict, reason) {
  ledger.set(id, { verdict, reason });
}

/** Pure — unit-testable without a database or a provider. */
export function evaluateG6(ledger) {
  const entries = G6_CONDITIONS.map(([id]) => ledger.get(id) ?? { verdict: "NOT-RUN", reason: "not reached" });
  const allPass = entries.every((e) => e.verdict === "PASS");
  const anyFail = entries.some((e) => e.verdict === "FAIL");
  if (allPass) return { verdict: "PASS", reason: "all sixteen G-6 evidence conditions PASS" };
  if (anyFail) {
    const failed = G6_CONDITIONS.filter(([id]) => ledger.get(id)?.verdict === "FAIL").map(([id]) => id);
    return { verdict: "FAIL", reason: `condition(s) ${failed.join(", ")} FAILED` };
  }
  const unproved = G6_CONDITIONS.filter(([id]) => ledger.get(id)?.verdict !== "PASS").map(([id]) => id);
  return { verdict: "NOT-RUN", reason: `condition(s) ${unproved.join(", ")} were not proved` };
}

/**
 * Dry-run's structural guarantee, callable from EVERY exit path — the
 * success path AND the catch block. Conditions 7/8/9/10/11/14 must never
 * be left PASS off deterministic-fixture content in dry-run mode, and an
 * exception thrown between computing them and the ORIGINAL single call
 * site (removed) could previously skip that downgrade entirely if the
 * exception landed after conditions 7/8/11 were set but before this ran.
 * Calling this from both `main()`'s success path and its catch block closes
 * that gap: it is idempotent (safe to call more than once, safe to call on
 * conditions that were never set) and is the ONLY place that downgrade
 * logic lives, so there is no second copy to drift out of sync.
 */
function downgradeDryRunLedger(mode, ledger) {
  if (mode !== "dry-run") return;
  for (const id of ["1", "2", "7", "8", "9", "10", "11", "14"]) {
    const entry = ledger.get(id) ?? { verdict: "NOT-RUN", reason: "not reached" };
    if (entry.verdict === "NOT-RUN" && entry.reason.startsWith("dry-run:")) continue; // already downgraded
    setVerdict(ledger, id, "NOT-RUN", `dry-run: no real provider call was made (informational only — ${entry.reason})`);
  }
}

// =====================================================================
// Fixture-inequality and differential — pure comparison helpers,
// unit-testable directly.
// =====================================================================
// 🔴 P1-T08: DERIVED FROM THE SHIPPED CONTRACT, no longer a second copy.
//
// This was a hand-maintained duplicate of the panel key list, and it is a
// FAIL-OPEN of the worst kind: `panelsEqual` reduces over these names, so a
// stale list compares four `undefined === undefined` pairs and returns TRUE
// for ANY two panel objects. The G-6 differential proof -- "two materially
// different assessments produce two materially different drafts" -- would
// have gone silently vacuous at the OD-4 rename while still reporting PASS.
//
// Importing PANEL_KEYS makes that structurally impossible: there is now one
// definition, and the next rename cannot desynchronise it.
const PANEL_FIELDS = [...PANEL_KEYS];

export function panelsEqual(a, b) {
  return PANEL_FIELDS.every((f) => a[f] === b[f]);
}

export function panelsMateriallyDiffer(a, b) {
  // Strict: every one of the four panel fields must differ, not merely one.
  return PANEL_FIELDS.every((f) => a[f] !== b[f]);
}

export function sha256Hex(text) {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

// =====================================================================
// TTY confirmation — a VISIBLE phrase, not a hidden password. It is a
// confirmation of intent, never a credential, so hiding it would only
// make mistakes harder to catch.
// =====================================================================
function requireInteractiveTty() {
  if (!process.stdin.isTTY) {
    throw new SafeError(
      "An interactive terminal is required to activate the real provider. This flag has no non-interactive " +
        "path: not an environment variable, not a piped answer, not a CI runner. Re-run it directly in a terminal.",
    );
  }
}

function askLine(promptText) {
  return new Promise((resolvePromise) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl.question(promptText, (answer) => {
      rl.close();
      resolvePromise(answer);
    });
  });
}

async function confirmRealCall(n, profile, llmConfig) {
  say("");
  say(`  ABOUT TO MAKE REAL CALL ${n}/2 — this is a live, billable OpenAI request.`);
  say(`  Provider: ${llmConfig.provider}   Model: ${llmConfig.model}`);
  say(`  Profile: ${profile.label} (session ${profile.session}), all nine ratings, real trainer notes.`);
  // requestDraftCore's own bounded-retry loop (request-draft-core.ts) may
  // call provider.generate() a SECOND time for this SAME profile if the
  // first attempt is rejected by schema/grounding or fails retryably — this
  // one confirmation authorizes BOTH attempts of the bounded pair, not one
  // request. Disclosed here so the operator's consent covers what can
  // actually happen, not an undercount of it.
  say("  This may result in up to TWO real requests for this profile: requestDraftCore retries once, internally,");
  say("  on a rejected or retryable-failed first attempt, before giving up. This one confirmation covers both.");
  say("  No API key value, header or full request/response body will ever be printed or written to evidence.");
  const expected = `ACTIVATE G-6 ${n}/2`;
  const answer = await askLine(`  Type exactly "${expected}" to proceed, or press Enter/anything else to abort: `);
  if (answer !== expected) {
    throw new SafeError(`Confirmation phrase for call ${n}/2 did not match. Aborting before any request was made.`);
  }
}

// =====================================================================
// Evidence directory — redacted by construction, written OUTSIDE the
// repository, matching `run-f17-disposable.mjs`'s convention.
// =====================================================================
function evidenceDirectory() {
  const configured = process.env.BEST_COACH_G6_EVIDENCE_DIR;
  const HERE = fileURLToPath(new URL(".", import.meta.url));
  const REPO_ROOT = resolve(HERE, "..", "..");
  const target = configured && configured.length > 0 ? resolve(configured) : resolve(REPO_ROOT, "..", "_g6-activation-evidence");
  mkdirSync(target, { recursive: true });
  return target;
}

function writeLedger(mode, ledger, verdict, extra) {
  const lines = [];
  lines.push("# G-6 activation harness — evidence ledger");
  lines.push("");
  lines.push("REDACTED BY CONSTRUCTION: no key, header, cookie, JWT, or complete request/response body.");
  lines.push("Generated prose is represented only by its SHA-256 content hash, never in full.");
  lines.push("");
  lines.push(`- Mode: ${mode}`);
  lines.push(`- Completed: ${new Date().toISOString()}`);
  lines.push(`- G-6 verdict: **${verdict.verdict}** — ${verdict.reason}`);
  if (extra) for (const line of extra) lines.push(`- ${line}`);
  lines.push("");
  lines.push("| # | Condition | Verdict | Reason |");
  lines.push("|---|---|---|---|");
  for (const [id, title] of G6_CONDITIONS) {
    const entry = ledger.get(id) ?? { verdict: "NOT-RUN", reason: "not reached" };
    lines.push(`| ${id} | ${title} | ${entry.verdict} | ${entry.reason.replace(/\|/g, "/")} |`);
  }
  lines.push("");
  try {
    const dir = evidenceDirectory();
    writeFileSync(join(dir, "g6-ledger.md"), `${lines.join("\n")}\n`, "utf8");
    say(`\nRedacted evidence ledger written to ${dir}`);
  } catch {
    say("\nThe evidence ledger could not be written outside the repository.");
  }
}

// =====================================================================
// The failure-safety static proof (condition 13) — run as a subprocess,
// zero network, so a live run never has to inject failure into a real
// call to prove the provider's own error handling.
// =====================================================================
function runFailureSafetyProof() {
  const HERE = fileURLToPath(new URL(".", import.meta.url));
  const REPO_ROOT = resolve(HERE, "..", "..");
  const target = join(REPO_ROOT, "scripts", "tests", "g6-harness", "failure-safety.mjs");
  if (!existsSync(target)) return { ok: false, reason: "the failure-safety proof script is missing" };
  const loader = join(REPO_ROOT, "scripts", "tests", "integration", "alias-loader.mjs");
  // `--import` requires a file:// URL on Windows -- a bare drive-letter path
  // (`C:\...`) is misparsed as a URL with scheme "c:" and fails to load.
  const result = spawnSync(process.execPath, [
    "--import", pathToFileURL(loader).href, target,
  ], { cwd: REPO_ROOT, stdio: ["ignore", "pipe", "pipe"] });
  return { ok: result.status === 0, reason: result.status === 0 ? "exit 0" : `exit ${result.status}` };
}

// =====================================================================
// One assessment cycle: real observation write, contradiction proof (if
// requested), then requestDraftCore — either against the DeterministicFixtureDraftProvider
// (dry-run) or the real ratified OpenAiDraftProvider (activate, after
// confirmation). Returns the facts the ledger needs; never the full panels.
// =====================================================================
async function seedSession(sessionId) {
  await q(WORK_DB, `
INSERT INTO public.class_sessions (id, centre_id, class_module_id, session_date, starts_at, ends_at)
VALUES ('${sessionId}','${CENTRE}','${MODULE}', (now() AT TIME ZONE 'Asia/Singapore')::date - 1, '10:00','11:00');
INSERT INTO public.class_session_assignments (centre_id, class_session_id, trainer_membership_id)
VALUES ('${CENTRE}','${sessionId}','${TRAINER_M}');
INSERT INTO public.attendance (centre_id, class_session_id, class_module_id, student_id, enrolment_id, status)
VALUES ('${CENTRE}','${sessionId}','${MODULE}','${STUDENT}','${ENROLMENT}','present');`);
}

async function readStudentDisplayName() {
  return q(WORK_DB, `SELECT full_name FROM public.students WHERE id='${STUDENT}';`);
}

/** Wraps a real provider, counting invocations and capturing the last validated outcome — never mutates behaviour. */
function countingDecorator(realProvider) {
  const calls = { count: 0, lastPanels: null, lastMetadata: null };
  return {
    calls,
    async generate(request) {
      calls.count += 1;
      const outcome = await realProvider.generate(request);
      if (outcome.kind === "ok") {
        calls.lastPanels = outcome.panels;
        calls.lastMetadata = outcome.metadata ?? null;
      }
      return outcome;
    },
  };
}

async function runProfile(trainerDb, trustedStore, profile, provider) {
  const saved = await saveObservationCore(trainerDb, {
    sessionId: profile.session,
    studentId: STUDENT,
    strengthChips: profile.strengthChips,
    focusChips: profile.focusChips,
    observationNotes: profile.observationNotes,
    followUpNotes: profile.followUpNotes,
    termEvidenceNotes: profile.termEvidenceNotes,
    ratings: profile.ratings,
  });
  if (saved.outcome !== "success") {
    return { realAssessment: false, reason: `saveObservationCore gave ${saved.outcome}` };
  }
  const observation = await getTrainerObservationCore(trainerDb, profile.session, STUDENT);
  // A per-DIMENSION comparison, not just a count: nine ratings could exist
  // while one dimension's VALUE was silently corrupted between the write
  // and the read, and a bare `.length === 9` check would never catch that.
  const readBackRatings = observation.outcome === "success" ? observation.data.ratings : [];
  const ratingsMatchExactly =
    readBackRatings.length === profile.ratings.length &&
    profile.ratings.every((expected) =>
      readBackRatings.some((actual) => actual.dimensionCode === expected.dimensionCode && actual.rating === expected.rating),
    );
  const nineRatingsAndNotes =
    observation.outcome === "success" &&
    observation.data.isComplete &&
    observation.data.ratings.length === 9 &&
    ratingsMatchExactly &&
    observation.data.observationNotes === profile.observationNotes &&
    observation.data.followUpNotes === profile.followUpNotes;

  const drafted = await requestDraftCore(
    { db: trainerDb, provider, trustedStore, authUserSub: SUB_TRAINER, readStudentDisplayName },
    { sessionId: profile.session, studentId: STUDENT },
  );

  return {
    realAssessment: true,
    nineRatingsAndNotes,
    readBackRatings,
    reportId: saved.data.reportId,
    drafted,
  };
}

async function readWorking(trainerDb, sessionId) {
  const r = await trainerDb.rpc("report_get_working", { p_class_session_id: sessionId, p_student_id: STUDENT });
  return Array.isArray(r.data) && r.data.length === 1 ? r.data[0] : null;
}

/**
 * Every audit event related to ONE report, identified by a real join
 * against `audit_event_targets` rather than positional slicing — this
 * harness runs a THIRD, deterministic session (the contradiction proof)
 * on the same centre before the two real generations, so events for
 * different reports are legitimately interleaved in seq_no order and a
 * naive `events[0:5]` / `events[5:10]` split would silently misattribute
 * events across reports the moment the contradiction proof's own event
 * count ever changed.
 */
async function auditEventsForReport(reportId) {
  // EXISTS (never a JOIN) so no row can duplicate -- no DISTINCT is needed,
  // which matters because `SELECT DISTINCT ... ORDER BY e.seq_no` (a bigint)
  // is rejected by Postgres when the select list only carries `seq_no::text`
  // (42P10: ORDER BY expressions must appear in the select list under
  // DISTINCT) -- and sorting by the TEXT cast instead would sort "10" before
  // "2", which is simply wrong once a centre's audit trail passes nine events.
  const out = await q(
    WORK_DB,
    "SELECT e.seq_no::text, e.action, COALESCE(e.state_domain,'-'), COALESCE(e.state_from,'-'), " +
      "COALESCE(e.state_to,'-'), e.target_type FROM public.audit_events e WHERE e.centre_id='" + CENTRE + "' AND ( " +
      `(e.target_type='report' AND e.target_id='${reportId}') OR EXISTS ( ` +
      "SELECT 1 FROM public.audit_event_targets t WHERE t.event_id = e.id AND t.target_type='report' " +
      `AND t.target_id='${reportId}')) ORDER BY e.seq_no;`,
  );
  if (out === "") return [];
  return out.split("\n").map((line) => {
    const [seq, action, domain, from, to, targetType] = line.split("|");
    return { seq: Number(seq), action, domain, from, to, targetType };
  });
}

async function totalAuditEventsForCentre() {
  const out = await q(WORK_DB, `SELECT count(*) FROM public.audit_events WHERE centre_id='${CENTRE}';`);
  return Number(out);
}

function expectedReportEventPattern(events) {
  // report.created, state_changed->observation_saved, state_changed->drafting,
  // report_version.created, state_changed->draft_ready — in order, for one report.
  if (events.length !== 5) return false;
  const [e1, e2, e3, e4, e5] = events;
  return (
    e1.action === "report.created" &&
    e2.action === "report.state_changed" && e2.from === "incomplete" && e2.to === "observation_saved" &&
    e3.action === "report.state_changed" && e3.from === "observation_saved" && e3.to === "drafting" &&
    e4.action === "report_version.created" &&
    e5.action === "report.state_changed" && e5.from === "drafting" && e5.to === "draft_ready"
  );
}

async function verifyChain() {
  const rows = await q(
    WORK_DB,
    "SELECT ok::text, events_checked::text, mode, head_checked::text FROM public.audit_verify_chain() " +
      `WHERE centre_id='${CENTRE}';`,
  );
  if (rows === "") return { ok: false, eventsChecked: 0, mode: null, headChecked: false };
  const [ok, checked, mode, head] = rows.split("|");
  return { ok: ok === "true", eventsChecked: Number(checked), mode, headChecked: head === "true" };
}

// =====================================================================
// Canonical read-only proof (condition 15). This harness never opens a
// governed WRITE against the canonical `postgres` database on the
// canonical container — the two real assessments run entirely on the
// disposable clone databases above. This check independently CONFIRMS
// that, rather than assuming it from the harness's own code: it reads
// residue counts across every table a report-lifecycle write, an
// observation write, or an audit append could plausibly move, before and
// after, on the CANONICAL container. A byte-for-byte checksum of the full
// fixture (as `run-f17-disposable.mjs`'s disposable-stack.mjs computes) is
// a stronger, broader statement than this harness needs to make and is
// that module's own, separately security-reviewed primitive (Option B
// duplication discipline) — this harness makes the narrower claim that
// EVERY table this harness's own governed RPCs could conceivably touch is
// unchanged and, where expected, zero — an insert-then-delete round trip
// on any ONE of these tables would move the row's internal state (and,
// for the append-only audit tables, is structurally impossible to net
// back to zero at all, since audit_events forbids UPDATE/DELETE).
// =====================================================================
// NOTE: `psql()`'s first argument is a DATABASE NAME, not a container — the
// container is the single fixed `CONTAINER` constant this whole file uses
// (the one local Supabase Postgres container). The canonical database is
// reached with database name "postgres" on that SAME container; there is
// no separate "canonical container" to select.
// These must be EXACTLY ZERO, both before and after: no report has ever
// been created, drafted, approved or audited on the CANONICAL database —
// ever, per the accepted Step 7F fixture baseline and every prior physical-
// test run's own recorded canonical checksum (docs/progress/STATUS.md,
// docs/progress/BUILD_NOTES.md).
const CANONICAL_RESIDUE_ZERO_TABLES = [
  "reports", "report_versions", "report_version_ratings",
  "report_version_checklist_progress", "report_version_approvals",
  "audit_events", "audit_event_targets",
];
// These must only be UNCHANGED, never asserted zero: the accepted Step 7F
// fixture baseline legitimately seeds exactly one observation with all
// nine ratings (CLAUDE.md §11's Step 7F baseline) — asserting zero here
// would be a WRONG assumption about the canonical database's own steady
// state, not evidence of anything this harness did. The invariant this
// harness actually needs is narrower and correct either way: these counts
// must not MOVE during this run, whatever their starting value is.
const CANONICAL_RESIDUE_UNCHANGED_TABLES = ["observations", "observation_ratings"];
const CANONICAL_RESIDUE_TABLES = [...CANONICAL_RESIDUE_ZERO_TABLES, ...CANONICAL_RESIDUE_UNCHANGED_TABLES];

async function readCanonicalResidue() {
  const select = CANONICAL_RESIDUE_TABLES.map((t) => `(SELECT count(*) FROM public.${t})`).join(" || '|' || ");
  const residue = await psql("postgres", `SELECT ${select};`, { user: "postgres", tuplesOnly: true });
  if (residue.code !== 0) throw new SafeError("The canonical residue could not be read.");
  return residue.out;
}

// =====================================================================
// Main
// =====================================================================
async function main() {
  const options = parseArgs(process.argv);
  if (options.mode === "help") {
    say(HELP.trim());
    return;
  }

  const mode = options.mode; // 'dry-run' | 'activate'
  armTripwire();

  say(`B.E.S.T Coach — G-6 activation harness (Run C3-C), mode: ${mode.toUpperCase()}`);
  if (mode === "dry-run") {
    say("Non-billable. No external provider call will be made. The outward-fetch trip-wire allows loopback only.");
  }

  let llmConfig = null;
  if (mode === "activate") {
    requireInteractiveTty();
    try {
      llmConfig = requireRatifiedLlmConfig();
    } catch (error) {
      throw new SafeError(
        `The ratified provider configuration is not present in this shell (${error instanceof Error ? error.message.split(" ")[0] : "unknown"}). ` +
          "Export the exact ratified LLM_PROVIDER, LLM_MODEL and LLM_API_KEY before re-running with --activate-real-provider.",
      );
    }
    say(`Ratified selectors confirmed via requireRatifiedLlmConfig(): ${llmConfig.provider} / ${llmConfig.model}.`);
  }

  const ledger = newLedger();
  let residueBefore = null;
  let residueAfter = null;

  try {
    phase("Canonical residue (before) — read-only");
    residueBefore = await readCanonicalResidue();
    pass(`canonical residue across ${CANONICAL_RESIDUE_TABLES.join(", ")}: ${residueBefore}`);

    phase("Disposable provisioning");
    await createDisposable();
    pass(`disposable databases '${SEED_DB}' / '${WORK_DB}' cloned from the local Postgres 'postgres' template`);

    phase("Two real, materially different Trainer assessments");
    await seedSession(SESSION_A);
    await seedSession(SESSION_B);
    const trainerDb = new PsqlRpc(SUB_TRAINER);
    const trustedStore = new LocalTrustedDraftStore(WORK_DB);

    phase("Deterministic contradiction-rejection proof (non-billable, this run)");
    const contradictionSession = "ac000000-0000-4000-8000-000000000009";
    await seedSession(contradictionSession);
    const contraSave = await saveObservationCore(trainerDb, {
      sessionId: contradictionSession, studentId: STUDENT,
      strengthChips: [], focusChips: [],
      observationNotes: "contradiction-proof fixture", followUpNotes: "", termEvidenceNotes: "",
      ratings: PROFILE_B.ratings,
    });
    let contradictionRejected = false;
    if (contraSave.outcome === "success") {
      const contraDraft = await requestDraftCore(
        { db: trainerDb, provider: new ContradictoryProvider(), trustedStore, authUserSub: SUB_TRAINER, readStudentDisplayName },
        { sessionId: contradictionSession, studentId: STUDENT },
      );
      if (contraDraft.outcome === "generation_failure") {
        const state = await readWorking(trainerDb, contradictionSession);
        contradictionRejected = state === null || state.status === "observation_saved";
      }
    }
    setVerdict(ledger, "12", contradictionRejected ? "PASS" : "FAIL",
      contradictionRejected
        ? "a deliberately contradictory generation was rejected by grounding and left no draft_ready, on this run"
        : "the contradiction-rejection proof did not observe rejection on this run");
    if (contradictionRejected) pass("contradiction-rejection path is live on this run"); else warn("contradiction-rejection proof failed");

    phase("Failure-safety static proof (condition 13, zero network)");
    const failureSafety = runFailureSafetyProof();
    setVerdict(ledger, "13", failureSafety.ok ? "PASS" : "FAIL",
      failureSafety.ok
        ? "scripts/tests/g6-harness/failure-safety.mjs proved timeout/invalid-JSON/failure outcomes leave no false ok, exit 0"
        : `scripts/tests/g6-harness/failure-safety.mjs did not pass (${failureSafety.reason})`);
    if (failureSafety.ok) pass("failure-safety static proof passed"); else warn("failure-safety static proof did not pass");

    // -------------------------------------------------------------
    // The two real (or, in dry-run, deterministic-fixture) generations.
    // -------------------------------------------------------------
    phase(mode === "activate" ? "Real generation — Profile A" : "Preparation generation — Profile A (deterministic, non-billable)");
    let providerA, decoratorA;
    if (mode === "activate") {
      await confirmRealCall(1, PROFILE_A, llmConfig);
      tripwire.allowedHost = "api.openai.com";
      const real = new OpenAiDraftProvider({ apiKey: llmConfig.apiKey, model: llmConfig.model, timeoutMs: 90_000 });
      decoratorA = countingDecorator(real);
      providerA = decoratorA;
    } else {
      decoratorA = countingDecorator(new DeterministicFixtureDraftProvider());
      providerA = decoratorA;
    }
    const resultA = await runProfile(trainerDb, trustedStore, PROFILE_A, providerA);
    if (mode === "activate") tripwire.allowedHost = null;

    phase(mode === "activate" ? "Real generation — Profile B" : "Preparation generation — Profile B (deterministic, non-billable)");
    let providerB, decoratorB;
    if (mode === "activate") {
      await confirmRealCall(2, PROFILE_B, llmConfig);
      tripwire.allowedHost = "api.openai.com";
      const real = new OpenAiDraftProvider({ apiKey: llmConfig.apiKey, model: llmConfig.model, timeoutMs: 90_000 });
      decoratorB = countingDecorator(real);
      providerB = decoratorB;
    } else {
      decoratorB = countingDecorator(new DeterministicFixtureDraftProvider());
      providerB = decoratorB;
    }
    const resultB = await runProfile(trainerDb, trustedStore, PROFILE_B, providerB);
    if (mode === "activate") tripwire.allowedHost = null;

    // -------------------------------------------------------------
    // Evidence conditions 1-2 (selectors), 3-4 (real assessments), 9
    // (call-count — never zero, never cached).
    // -------------------------------------------------------------
    if (mode === "activate") {
      setVerdict(ledger, "1", llmConfig.provider === "openai" ? "PASS" : "FAIL", `provider selector: ${llmConfig.provider}`);
      setVerdict(ledger, "2", llmConfig.model === "gpt-5.6-terra" ? "PASS" : "FAIL", `model selector: ${llmConfig.model}`);
    } else {
      setVerdict(ledger, "1", "NOT-RUN", "dry-run: no real provider was constructed");
      setVerdict(ledger, "2", "NOT-RUN", "dry-run: no real provider was constructed");
    }

    setVerdict(ledger, "3",
      resultA.realAssessment && resultB.realAssessment ? "PASS" : "FAIL",
      resultA.realAssessment && resultB.realAssessment
        ? "both requests originated from real, governed saveObservationCore writes on the disposable database"
        : "at least one profile's real assessment write did not succeed");

    setVerdict(ledger, "4",
      resultA.nineRatingsAndNotes && resultB.nineRatingsAndNotes ? "PASS" : "FAIL",
      resultA.nineRatingsAndNotes && resultB.nineRatingsAndNotes
        ? "both real requests carry all nine ratings — checked PER DIMENSION against what was saved, not just a count — " +
          "and the exact saved Trainer/follow-up notes, read back from the governed observation read"
        : "the read-back observation did not confirm nine per-dimension-matching ratings and matching notes for both profiles");

    setVerdict(ledger, "9",
      decoratorA.calls.count >= 1 && decoratorB.calls.count >= 1 ? "PASS" : "FAIL",
      `provider.generate() was invoked ${decoratorA.calls.count} time(s) for A and ${decoratorB.calls.count} time(s) for B ` +
        "by requestDraftCore itself, never by this harness directly. This alone proves a call happened, not that its " +
        "content survived unaltered — that is what condition 7 (differential), condition 8 (fixture inequality) and " +
        "condition 11 (persisted-panel correspondence) independently establish. This harness contains no code path " +
        "that captures a panel and feeds it back into a SECOND requestDraftCore call (unlike run-integration.mjs's " +
        "regression-only INT-L2b -> INT-L3 replay, which this harness never does) — that is a structural property of " +
        "this file, verifiable by reading it, not something a runtime counter alone could prove from the outside.");

    const draftOkA = resultA.drafted?.outcome === "success" && resultA.drafted.data.status === "draft_ready";
    const draftOkB = resultB.drafted?.outcome === "success" && resultB.drafted.data.status === "draft_ready";
    setVerdict(ledger, "10", draftOkA && draftOkB ? "PASS" : "FAIL",
      draftOkA && draftOkB
        ? "both reports reached draft_ready through requestDraftCore's own governed trusted-store transition"
        : `requestDraftCore outcomes were A=${resultA.drafted?.outcome ?? "n/a"}, B=${resultB.drafted?.outcome ?? "n/a"}`);

    // Schema validation (condition 5) — GATED on draftOkA/draftOkB, same as
    // condition 6 below it. `decoratorA.calls.lastPanels` is set whenever
    // ANY attempt returns outcome.kind === "ok", INCLUDING an attempt that
    // passed schema but was then rejected by grounding and never persisted
    // (requestDraftCore's bounded-retry loop). Without this gate, condition
    // 5 could show PASS from a panel that was never the one actually used —
    // schema validation must be proven about the content that reached
    // draft_ready, not about an intermediate, discarded attempt.
    const schemaA = draftOkA && decoratorA.calls.lastPanels ? validatePanelShape(decoratorA.calls.lastPanels) !== null : false;
    const schemaB = draftOkB && decoratorB.calls.lastPanels ? validatePanelShape(decoratorB.calls.lastPanels) !== null : false;
    setVerdict(ledger, "5", schemaA && schemaB ? "PASS" : "FAIL",
      schemaA && schemaB
        ? "both PERSISTED panels (gated on draft_ready) independently re-pass validatePanelShape (also enforced inside the provider before 'ok')"
        : "at least one profile did not reach draft_ready with a captured panel that re-passes the redundant schema re-check");

    // The real student display name, read back from the disposable database
    // — the SAME value requestDraftCore itself used (readStudentDisplayName)
    // when building each real request. Used below for the fixture-inequality
    // comparison, which MUST use the identical name the real call used:
    // DeterministicFixtureDraftProvider embeds the name literally in every
    // sentence, so comparing against a different, hardcoded name would make
    // the two panels differ for a trivial reason (a name mismatch) rather
    // than because they are substantively different provider outputs.
    const realStudentName = (await readStudentDisplayName()) || "the student";

    // Grounding (condition 6) — requestDraftCore calls validateGrounding on
    // every 'ok' outcome unconditionally; reaching draft_ready is proof it
    // ran and passed. Re-run here directly against the captured panels for
    // an independent confirmation, never trusting the internal call alone.
    const groundingA = draftOkA && decoratorA.calls.lastPanels
      ? validateGrounding(decoratorA.calls.lastPanels, {
          studentDisplayName: realStudentName,
          ratings: PROFILE_A.ratings.map((r) => ({ dimensionCode: r.dimensionCode, displayName: r.dimensionCode, rating: r.rating })),
        }).ok
      : false;
    const groundingB = draftOkB && decoratorB.calls.lastPanels
      ? validateGrounding(decoratorB.calls.lastPanels, {
          studentDisplayName: realStudentName,
          ratings: PROFILE_B.ratings.map((r) => ({ dimensionCode: r.dimensionCode, displayName: r.dimensionCode, rating: r.rating })),
        }).ok
      : false;
    setVerdict(ledger, "6", groundingA && groundingB ? "PASS" : "FAIL",
      groundingA && groundingB
        ? "both real generations independently re-pass validateGrounding against their own saved ratings"
        : "at least one generation did not independently re-pass grounding");

    // Differential and fixture-inequality (conditions 7, 8, 11).
    let differential = false, fixtureInequality = false, correspondence = false;
    if (draftOkA && draftOkB && decoratorA.calls.lastPanels && decoratorB.calls.lastPanels) {
      differential = panelsMateriallyDiffer(decoratorA.calls.lastPanels, decoratorB.calls.lastPanels);
      const fixtureA = await new DeterministicFixtureDraftProvider().generate(
        { studentDisplayName: realStudentName, ratings: PROFILE_A.ratings.map((r) => ({ ...r, displayName: r.dimensionCode, anchorText: "", polarityBand: POLARITY_BANDS[r.rating] })), strengthChips: [], focusChips: [], trainerNotes: "", followUpNotes: "" },
      );
      const fixtureB = await new DeterministicFixtureDraftProvider().generate(
        { studentDisplayName: realStudentName, ratings: PROFILE_B.ratings.map((r) => ({ ...r, displayName: r.dimensionCode, anchorText: "", polarityBand: POLARITY_BANDS[r.rating] })), strengthChips: [], focusChips: [], trainerNotes: "", followUpNotes: "" },
      );
      fixtureInequality =
        !panelsEqual(decoratorA.calls.lastPanels, fixtureA.panels) &&
        !panelsEqual(decoratorB.calls.lastPanels, fixtureB.panels);

      const workingA = await readWorking(trainerDb, SESSION_A);
      const workingB = await readWorking(trainerDb, SESSION_B);
      const persistedA = workingA
        ? { overview: workingA.overview, strengths: workingA.strengths, areasForDevelopment: workingA.areas_for_development, remarks: workingA.remarks }
        : null;
      const persistedB = workingB
        ? { overview: workingB.overview, strengths: workingB.strengths, areasForDevelopment: workingB.areas_for_development, remarks: workingB.remarks }
        : null;
      correspondence =
        persistedA !== null && persistedB !== null &&
        panelsEqual(persistedA, decoratorA.calls.lastPanels) &&
        panelsEqual(persistedB, decoratorB.calls.lastPanels);
    }
    setVerdict(ledger, "7", differential ? "PASS" : (draftOkA && draftOkB ? "FAIL" : "NOT-RUN"),
      differential ? "every one of the four panel fields differs between the two generated drafts"
        : "the two drafts did not materially differ on every panel field, or could not be compared");
    setVerdict(ledger, "8", fixtureInequality ? "PASS" : (draftOkA && draftOkB ? "FAIL" : "NOT-RUN"),
      fixtureInequality ? "neither generated draft equals the deterministic fixture provider's panel for its own profile"
        : "at least one generated draft equalled a pinned fixture panel, or could not be compared");
    setVerdict(ledger, "11", correspondence ? "PASS" : (draftOkA && draftOkB ? "FAIL" : "NOT-RUN"),
      correspondence ? "the panels read back from report_get_working byte-match the panels captured directly from the provider call"
        : "the persisted panels did not byte-match the captured, validated panels, or could not be compared");

    // Audit transitions (condition 14) — filtered PER REPORT via the real
    // audit_event_targets join (auditEventsForReport), never by position:
    // the contradiction-proof session above writes its own audit events to
    // the same centre, so seq_no order alone cannot tell reports apart.
    let auditOk = false;
    if (draftOkA && draftOkB) {
      const eventsA = await auditEventsForReport(resultA.reportId);
      const eventsB = await auditEventsForReport(resultB.reportId);
      const patternOk = expectedReportEventPattern(eventsA) && expectedReportEventPattern(eventsB);
      const chain = await verifyChain();
      const totalEvents = await totalAuditEventsForCentre();
      auditOk = patternOk && chain.ok && chain.mode === "complete" && chain.headChecked && chain.eventsChecked === totalEvents;
      setVerdict(ledger, "14", auditOk ? "PASS" : "FAIL",
        auditOk
          ? `exactly the expected 5-event pattern occurred for each of the two reports (${eventsA.length + eventsB.length} events), ` +
            `and audit_verify_chain() reports ok, complete mode, head checked, covering all ${totalEvents} centre events`
          : `report A had ${eventsA.length} matching event(s), report B had ${eventsB.length}; pattern-match=${patternOk}; ` +
            `chain ok=${chain.ok} mode=${chain.mode} head=${chain.headChecked} checked=${chain.eventsChecked}/${totalEvents}`);
    } else {
      setVerdict(ledger, "14", "NOT-RUN", "both reports did not reach draft_ready, so no audit pattern could be evaluated");
    }
    if (auditOk) pass("audit transitions matched exactly"); else if (draftOkA && draftOkB) warn("audit transitions did not match");

    downgradeDryRunLedger(mode, ledger);

    phase("Teardown");
    await destroyDisposable();
    const remaining = await disposableDatabasesPresent();
    setVerdict(ledger, "16", remaining.length === 0 ? "PASS" : "FAIL",
      remaining.length === 0
        ? `MEASURED after DROP DATABASE: neither '${SEED_DB}' nor '${WORK_DB}' exists`
        : `still present: ${remaining.join(", ")}`);
    if (remaining.length === 0) pass("disposable databases removed"); else warn("disposable databases still present");

    phase("Canonical residue (after) — read-only, independent re-read");
    residueAfter = await readCanonicalResidue();
    const beforeCounts = residueBefore.split("|");
    const afterCounts = residueAfter.split("|");
    const unchanged = residueBefore === residueAfter;
    const zeroTablesZero = CANONICAL_RESIDUE_ZERO_TABLES.every(
      (_, i) => beforeCounts[i] === "0" && afterCounts[i] === "0",
    );
    const canonicalPristine = unchanged && zeroTablesZero;
    setVerdict(ledger, "15", canonicalPristine ? "PASS" : "FAIL",
      canonicalPristine
        ? `canonical residue unchanged across all ${CANONICAL_RESIDUE_TABLES.length} tables, and the report/audit tables ` +
          `(${CANONICAL_RESIDUE_ZERO_TABLES.join(", ")}) are zero both before and after: before=${residueBefore} after=${residueAfter}`
        : `canonical residue before=${residueBefore} after=${residueAfter} across ${CANONICAL_RESIDUE_TABLES.join(", ")} ` +
          `(expected: unchanged throughout, and ${CANONICAL_RESIDUE_ZERO_TABLES.join(", ")} exactly zero)`);
    if (canonicalPristine) pass("canonical database residue unchanged and zero"); else warn("canonical residue changed or non-zero");

  } catch (error) {
    // Defense in depth: an exception between "confirmation accepted" and
    // "provider call returned" must never leave the trip-wire narrowed to
    // api.openai.com for any LATER, unconfirmed code path to inherit.
    tripwire.allowedHost = null;
    // Same reason as the success path: an exception must never leave a
    // dry-run ledger with 7/8/9/10/11/14 sitting at whatever they happened
    // to reach before the exception interrupted the normal downgrade call.
    downgradeDryRunLedger(mode, ledger);
    await destroyDisposable().catch(() => {});
    const message = error instanceof SafeError ? error.message : "The G-6 activation harness failed.";
    say(`\nFAILED: ${message}`);
    const verdict = evaluateG6(ledger);
    writeLedger(mode, ledger, verdict, [`Aborted: ${message}`]);
    process.exitCode = 1;
    return;
  }

  const verdict = evaluateG6(ledger);
  phase("G-6 evidence ledger");
  for (const [id, title] of G6_CONDITIONS) {
    const entry = ledger.get(id);
    say(`  ${entry.verdict.padEnd(8)} ${id.padStart(2)}  ${title}`);
    say(`           ${entry.reason}`);
  }
  say("");
  say(`  G-6: ${verdict.verdict} — ${verdict.reason}`);
  writeLedger(mode, ledger, verdict, [
    `Provider calls made this run: A=${mode === "activate" ? "real" : "deterministic-fixture (non-billable)"}, ` +
      `B=${mode === "activate" ? "real" : "deterministic-fixture (non-billable)"}`,
    `Outward requests refused by the trip-wire: ${tripwire.refusedAttempts.length}`,
  ]);

  if (mode === "dry-run") {
    process.exitCode = 0;
  } else {
    process.exitCode = verdict.verdict === "PASS" ? 0 : 2;
  }
}

// =====================================================================
// Signals — teardown and the ledger still run on Ctrl+C.
// =====================================================================
let interrupted = false;
const onSignal = () => {
  if (interrupted) return;
  interrupted = true;
  // Same defense-in-depth reset as the catch block: Ctrl+C between
  // "confirmation accepted" and "provider call returned" must not leave a
  // narrowed trip-wire in a module-level variable that outlives this run.
  tripwire.allowedHost = null;
  process.stdout.write("\nAborting. Removing disposable databases.\n");
  process.exitCode = 130;
  void (async () => {
    try {
      await destroyDisposable();
    } catch {
      // Teardown must never mask the interrupt.
    }
    process.exit(130);
  })();
};
process.on("SIGINT", onSignal);
process.on("SIGTERM", onSignal);

const isMain = (() => {
  try {
    return import.meta.url === pathToFileURL(process.argv[1] ?? "").href;
  } catch {
    return false;
  }
})();

if (isMain) {
  main().catch((error) => {
    process.stderr.write(`\nFAILED: ${error instanceof SafeError ? error.message : "unexpected error"}\n`);
    process.exitCode = 1;
  });
}
