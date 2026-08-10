#!/usr/bin/env node
// =====================================================================
// B.E.S.T Coach -- Backend Round B2 integration suite
// =====================================================================
// LOCAL STACK ONLY. Three parts:
//
//   Part 1 -- GROUNDING (pure, no database): deterministic schema and
//     grounding validation, including the mandated contradiction case (a
//     `beginning` rating described in achievement language MUST be rejected)
//     and the rating-attribution leak case.
//
//   Part 2 -- REAL AUTHENTICATION (canonical database, STRICTLY READ-ONLY):
//     three real local Auth sessions are established WITHOUT any password
//     (admin magiclink -> verifyOtp -- the accepted identities are never
//     destroyed or altered), then role resolution, role isolation, privacy
//     boundaries and non-disclosing denials are proven under REAL JWTs
//     through the REAL API stack. No write of any kind is issued against
//     the canonical database.
//
//   Part 3 -- FULL LIFECYCLE (DISPOSABLE database): the complete
//     Trainer -> Management -> Parent backend lifecycle driven through the
//     REAL SERVER-ACTION CORES (saveObservationCore, requestDraftCore with
//     grounding, saveTrainerEditCore, updateTrainerChecklistCore,
//     trainerApproveCore, managementEditWordingCore,
//     managementReturnToTrainerCore, managementApproveAndSubmitCore) over a
//     psql-backed RpcCaller bound to fixture identities, plus the trusted
//     draft-store channel pointed at the disposable database. Committing
//     work runs here and only here (U-7I-21). Round B2.1 extends it with
//     the five-step correction-tracking proof (INT-C1 .. INT-C5): after a
//     management return, management DISCOVERS the report through the real
//     governed projection, the trainer corrects and reapproves, management
//     sees the tracking state change at each step, submission removes it
//     from unresolved correction work, and parent visibility stays off
//     until submission.
//
//   A bounded REAL-PROVIDER leg (INT-L2b) exists inside Part 3, and it is
//   OFF BY DEFAULT. It is the only outward-facing, billable call this suite
//   can make, so it fires ONLY on an explicit, single-purpose, per-run
//   opt-in — never merely because a key happens to be configured:
//
//     --run-real-provider-leg                 (argument, preferred)
//     BEST_COACH_RUN_REAL_PROVIDER_LEG=1      (environment, for CI/operators)
//
//   Without one of those two the leg is RECORDED AS SKIPPED BY DEFAULT with
//   its reason, the LLM selectors are not even read out of `.env.local`, no
//   `OpenAiDraftProvider` is constructed, and no request leaves this machine.
//   A skipped leg is NEVER reported as passed, and the leg is NEVER deleted:
//   a deliberate G-6 activation still needs it. (Run C3-A correction cycle —
//   an earlier run made a real provider call under the standing operator
//   directive not to invoke any external provider, because presence of a key
//   was treated as consent. Presence of a key is not consent.)
//
//   Its absence or failure is RECORDED, never invented as success.
//
// T7I-33 is claimed from Parts 2+3 jointly: Part 2 proves the real
// credential path (local JWT -> auth.uid() -> governed RPC), Part 3 proves
// the server-action cores produce verifiable hash-chained audit rows for
// that same identity. The cookie-transport UI leg belongs to the post-merge
// three-role dry run (contract SS12 step 13).
//
// Run: node --import ./scripts/tests/integration/alias-loader.mjs scripts/tests/integration/run-integration.mjs
// =====================================================================

import { spawn } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

import { validateGrounding } from "@/server/modules/ai-drafting/grounding.ts";
import { POLARITY_BANDS } from "@/server/modules/framework/dimensions.ts";
import { validatePanelShape, DeterministicFixtureDraftProvider, OpenAiDraftProvider } from "@/server/modules/ai-drafting/provider.ts";
import { requestDraftCore } from "@/server/modules/ai-drafting/request-draft-core.ts";
import { LocalTrustedDraftStore } from "@/server/modules/ai-drafting/trusted-store.ts";
import { saveObservationCore, getTrainerObservationCore } from "@/server/modules/observation/core.ts";
import { setAttendanceStatusCore } from "@/server/modules/attendance/core.ts";
import { getSourceMapCore } from "@/server/modules/report-workflow/source-map-core.ts";
import { deriveSourceMap, GROUNDING_ANCHORS } from "@/server/modules/ai-drafting/grounding.ts";
import {
  saveTrainerEditCore, updateTrainerChecklistCore, trainerApproveCore,
  managementEditWordingCore, managementReturnToTrainerCore, managementApproveAndSubmitCore,
} from "@/server/modules/report-workflow/core.ts";
import { resolveSessionIdentity } from "@/server/modules/identity-access/session-core.ts";
import { listManagementCorrectionsFromRpc } from "@/server/modules/management-view/projections.ts";
import { resolveReportContextCore } from "@/server/modules/report-workflow/context-resolver.ts";
import { getCanonicalReportCore } from "@/server/modules/parent-view/projections.ts";

import { resolveLocalTarget } from "../../fixtures/local-target-guard.mjs";

const ROOT = process.cwd();
// ⚠️ NOT A LITERAL. This was `supabase_db_best-coach-mvp` — the FROZEN
// demonstration container — and with both local stacks running that name
// RESOLVED, so this harness reached the demonstration database instead of
// this repository's. Guarded resolution: unconditional non-overridable HARD
// DENY of the frozen project, then a fail-closed pin from
// BEST_COACH_LOCAL_PROJECT_ID. Container name DERIVED, never literal.
const { dbContainer: CONTAINER } = resolveLocalTarget();
const SEED_DB = "bc_b2_seed";
const WORK_DB = "bc_b2";

const CENTRE = "b0000000-0000-4000-8000-000000000001";
const STUDENT = "c2000000-0000-4000-8000-000000000001";
const MODULE = "c4000000-0000-4000-8000-000000000001";
// (The fixture enrolment id used to be needed for the hand-inserted
// attendance row that INT-AT1 replaced. `attendance_set_status` RESOLVES the
// active enrolment itself and refuses a supplied one, so this harness no
// longer knows or passes it — which is the point: the id is the database's to
// resolve, not the caller's to assert.)
const TRAINER_M = "c1000000-0000-4000-8000-000000000002";
const FIXTURE_SESSION = "c5000000-0000-4000-8000-000000000001";
const SUB = {
  management: "d0000000-0000-4000-8000-000000000001",
  trainer: "d0000000-0000-4000-8000-000000000002",
  parent: "d0000000-0000-4000-8000-000000000003",
};
const EMAIL = {
  management: "management.fixture@example.test",
  trainer: "trainer.fixture@example.test",
  parent: "parent.fixture@example.test",
};

// ---------------------------------------------------------------------
// THE REAL-PROVIDER OPT-IN. Default: OFF.
//
// One flag, one environment variable, one purpose: authorize the single
// bounded outward provider call in INT-L2b. It is deliberately NOT satisfied
// by LLM_API_KEY / LLM_MODEL being configured — a configured key is a
// capability, not a decision, and treating it as a decision is exactly the
// defect this constant closes.
//
// The key is never read, printed, logged or persisted anywhere; only the
// PRESENCE of the selectors is tested, and only after the opt-in is given.
// ---------------------------------------------------------------------
const REAL_PROVIDER_FLAG = "--run-real-provider-leg";
const REAL_PROVIDER_ENV = "BEST_COACH_RUN_REAL_PROVIDER_LEG";
const REAL_PROVIDER_OPT_IN =
  process.argv.slice(2).includes(REAL_PROVIDER_FLAG) ||
  process.env[REAL_PROVIDER_ENV] === "1";

const REAL_PROVIDER_SKIP_REASON =
  `SKIPPED BY DEFAULT — NOT PASSED. The bounded real-provider leg is off unless it is explicitly ` +
  `authorized for this run (${REAL_PROVIDER_FLAG}, or ${REAL_PROVIDER_ENV}=1), and neither was given. ` +
  `No OpenAiDraftProvider was constructed and NO outward request was attempted, so this run made ZERO ` +
  `external provider calls. A configured LLM_API_KEY deliberately does NOT enable this leg: a key is a ` +
  `capability, not an authorization. The leg is retained, unweakened, for a deliberate G-6 activation; ` +
  `the deterministic fixture provider carries the lifecycle in INT-L3 onwards, and nothing downstream ` +
  `depends on a live provider.`;

let failures = 0;
const fail = (id, msg) => { failures += 1; console.error(`FAIL ${id}: ${msg}`); };
const pass = (id, msg) => console.log(`PASS ${id}${msg ? " -- " + msg : ""}`);
const record = (id, msg) => console.log(`RECORDED ${id}: ${msg}`);

// ---------------------------------------------------------------------
// INT-PG -- THE OUTWARD-CALL TRIP-WIRE (armed on every default run).
//
// The INT-L2b guard closes the one known provider path. This closes the
// CLASS: while the leg is not authorized, ANY non-loopback fetch from this
// process is refused and FAILS the suite loudly. It exists so "zero external
// calls" is a MEASURED property of the run rather than an argument from the
// absence of evidence -- and so a future edit that reintroduces an outward
// call cannot pass this suite quietly. Only the request HOST is examined;
// no URL, header, body or credential is ever read or printed.
// ---------------------------------------------------------------------
const LOOPBACK = new Set(["127.0.0.1", "localhost", "::1", "[::1]", "0.0.0.0"]);
let outwardFetchAttempts = 0;
if (!REAL_PROVIDER_OPT_IN && typeof globalThis.fetch === "function") {
  const passthrough = globalThis.fetch;
  globalThis.fetch = function guardedFetch(input, init) {
    let host = "";
    try {
      const raw = typeof input === "string" ? input
        : input instanceof URL ? input.href
        : (input && typeof input.url === "string" ? input.url : "");
      host = raw ? new URL(raw).hostname : "";
    } catch { host = ""; }
    if (host && !LOOPBACK.has(host)) {
      outwardFetchAttempts += 1;
      fail("INT-PG", `an OUTWARD network request to host '${host}' was attempted while no provider authorization was given; it was REFUSED, not performed`);
      throw new Error(`outward request to '${host}' refused: this run is not authorized to contact any external service`);
    }
    return passthrough(input, init);
  };
}

// ---------------------------------------------------------------------
// Environment: load ONLY the named variables from .env.local into process
// memory. Values are never logged, echoed or interpolated into any output.
// ---------------------------------------------------------------------
function loadEnv() {
  // DEFENCE IN DEPTH FOR THE OPT-IN: without the explicit authorization the
  // LLM selectors are not loaded into this process AT ALL. The INT-L2b guard
  // alone already makes the call impossible; declining to load the key means
  // the key is not even in memory to be misused by a later edit.
  if (!REAL_PROVIDER_OPT_IN) return;
  // ONLY the LLM selectors/key are taken from `.env.local` (main worktree —
  // it is untracked, so it does not follow worktrees). Its Supabase values
  // are DELIBERATELY IGNORED: they may point at the hosted project, and this
  // suite must never touch hosted Supabase. Values enter process memory only
  // and are never rendered anywhere.
  const candidates = [
    join(ROOT, ".env.local"),
    join(ROOT, "..", "..", "SDS Project Final (BEST Coach)", ".env.local"),
  ];
  const path = candidates.find((p) => existsSync(p));
  if (!path) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (!m) continue;
    const [, name, value] = m;
    if (["LLM_PROVIDER", "LLM_MODEL", "LLM_API_KEY"].includes(name)) {
      if (process.env[name] === undefined) process.env[name] = value;
    }
  }
}

// The LOCAL stack's connection values, captured from project-local CLI
// structured output into process memory only — the exact channel the
// fixture-credential rules permit (CLAUDE.md §11). Never echoed, never
// serialized, never interpolated into an error.
function loadLocalStack() {
  return new Promise((resolve) => {
    const p = spawn("npx", ["--no-install", "supabase", "status", "--output", "json"], {
      cwd: ROOT, stdio: ["ignore", "pipe", "pipe"], shell: process.platform === "win32",
    });
    let out = "";
    p.stdout.on("data", (d) => { out += d; });
    p.on("close", () => {
      try {
        const jsonStart = out.indexOf("{");
        const status = JSON.parse(out.slice(jsonStart));
        const url = status.API_URL;
        const publishable = status.PUBLISHABLE_KEY || status.ANON_KEY;
        const secret = status.SECRET_KEY || status.SERVICE_ROLE_KEY;
        const host = url ? new URL(url).hostname : "";
        if (!["127.0.0.1", "localhost", "::1"].includes(host)) {
          resolve(null); // refuse anything that is not the local stack
          return;
        }
        resolve(url && publishable && secret ? { url, publishable, secret } : null);
      } catch {
        resolve(null);
      }
    });
  });
}

// ---------------------------------------------------------------------
// psql plumbing (the accepted disposable-database pattern)
// ---------------------------------------------------------------------
function psql(db, sql, { tuplesOnly = true, stopOnError = true, user = "postgres" } = {}) {
  return new Promise((resolve) => {
    const args = ["exec", "-i", CONTAINER, "psql", "--no-psqlrc", `--username=${user}`,
      `--dbname=${db}`, "--quiet", "--set=VERBOSITY=verbose"];
    if (stopOnError) args.push("--set=ON_ERROR_STOP=1");
    if (tuplesOnly) args.push("-t", "-A", "-F|");
    const p = spawn("docker", args, { stdio: ["pipe", "pipe", "pipe"] });
    let out = "", err = "";
    p.stdout.on("data", (d) => { out += d; });
    p.stderr.on("data", (d) => { err += d; });
    p.on("close", (code) => resolve({ code, out: out.trim(), err: err.trim() }));
    p.stdin.end(sql);
  });
}

const q = async (db, sql) => {
  const r = await psql(db, sql);
  if (r.code !== 0) throw new Error(`psql failed on ${db}:\n${r.err}`);
  return r.out;
};

async function createDisposable() {
  const sql = `
UPDATE pg_database SET datallowconn = false WHERE datname = 'postgres';
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'postgres' AND pid <> pg_backend_pid();
SELECT pg_sleep(1);
DROP DATABASE IF EXISTS ${SEED_DB};
CREATE DATABASE ${SEED_DB} TEMPLATE postgres;
UPDATE pg_database SET datallowconn = true WHERE datname = 'postgres';
ALTER DATABASE ${SEED_DB} OWNER TO postgres;`;
  const r = await psql("template1", sql, { tuplesOnly: false, user: "supabase_admin" });
  if (r.code !== 0) throw new Error(`could not create the disposable seed:\n${r.err}`);
  const w = await psql("template1",
    `DROP DATABASE IF EXISTS ${WORK_DB};
     CREATE DATABASE ${WORK_DB} TEMPLATE ${SEED_DB};
     ALTER DATABASE ${WORK_DB} OWNER TO postgres;`,
    { tuplesOnly: false, user: "supabase_admin" });
  if (w.code !== 0) throw new Error(`could not create the disposable database:\n${w.err}`);
}

async function destroyDisposable() {
  await psql("template1", `DROP DATABASE IF EXISTS ${WORK_DB};`, { tuplesOnly: false, stopOnError: false, user: "supabase_admin" });
  await psql("template1", `DROP DATABASE IF EXISTS ${SEED_DB};`, { tuplesOnly: false, stopOnError: false, user: "supabase_admin" });
}

// A psql-backed RpcCaller (the cores' minimal dependency) bound to one
// fixture identity on the DISPOSABLE database. SQL literals are escaped by
// quote-doubling; argument kinds are derived from JS types.
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

class PsqlRpc {
  constructor(sub) { this.sub = sub; }
  async rpc(fn, args = {}) {
    const named = Object.entries(args)
      .map(([k, v]) => `${k} => ${sqlLiteral(v)}`)
      .join(", ");
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
// Part 1 -- grounding (pure)
// =====================================================================
function partGrounding() {
  console.log("--- Part 1: deterministic schema + grounding validation ---");
  // Amendment 006 A-049 ratified vocabulary. These MUST be members of
  // RatingLevel: POLARITY_BANDS is keyed by it, and a stale label would make
  // POLARITY_BANDS[r.rating] `undefined`, which grounding rule 3 SKIPS —
  // the gate would stop rejecting instead of erroring, a fail-open
  // degradation of CLAUDE.md §4 non-negotiable 1. The mix is positionally
  // unchanged; eye_contact stays the needs_support dimension INT-G3 targets.
  const ratings = [
    { dimensionCode: "body", displayName: "Body", rating: "mastered" },
    { dimensionCode: "emotion", displayName: "Emotion", rating: "beginning" },
    { dimensionCode: "speech", displayName: "Speech", rating: "mastering" },
    { dimensionCode: "tonality", displayName: "Tonality", rating: "developing" },
    { dimensionCode: "eye_contact", displayName: "Eye Contact", rating: "beginning" },
    { dimensionCode: "vocal_projection", displayName: "Vocal Projection", rating: "mastered" },
    { dimensionCode: "emotional_expression", displayName: "Emotional Expression", rating: "developing" },
    { dimensionCode: "sentence_flow", displayName: "Sentence Flow", rating: "mastering" },
    { dimensionCode: "audience_awareness", displayName: "Audience Awareness", rating: "mastering" },
  ];
  // Fail-closed precondition: prove every fixture rating is a live
  // RatingLevel BEFORE the grounding proofs run. Without this, INT-G3 and
  // INT-G5 could report green while rule 3 was silently inert.
  {
    const unknown = ratings.filter((r) => POLARITY_BANDS[r.rating] === undefined);
    if (unknown.length > 0) {
      fail("INT-G0", `${unknown.length} fixture rating label(s) are not members of RatingLevel: ${unknown.map((r) => r.rating).join(", ")} — grounding would fail OPEN`);
    } else pass("INT-G0", "every fixture rating resolves to a ratified polarity band (the grounding gate cannot fail open)");
  }
  const input = { studentDisplayName: "Fixture Student One", ratings };
  // RE-AUTHORED AT P1-T08 for the OD-4 panel roles, not relabelled: each
  // sentence is written for the panel it now sits in. `overview` deliberately
  // carries BOTH a positive observation and a developmental one, because the
  // ruling says Overview is not restricted to positive observations -- and
  // that is the case the G-06 design must keep accepting.
  const goodPanels = {
    overview: "The student used posture and gesture confidently and independently across today's activities. Eye contact continued to need frequent prompting and support.",
    strengths: "The student used posture and gesture confidently and independently across today's activities.",
    areasForDevelopment: "Eye contact needs frequent prompting and support to become more consistent, and facial expressions will benefit from gentle guidance.",
    remarks: "A steady session overall, with clear engagement and consistent participation throughout.",
  };

  // 1a -- schema validation rejects malformed shapes.
  if (validatePanelShape({ ...goodPanels, extra: "x" }) !== null) fail("INT-G1", "an extra key passed schema validation");
  else if (validatePanelShape({ ...goodPanels, strengths: "" }) !== null) fail("INT-G1", "an empty panel passed schema validation");
  else if (validatePanelShape(goodPanels) === null) fail("INT-G1", "a valid shape was rejected");
  else pass("INT-G1", "structured-output schema validation accepts the valid shape and rejects malformed ones");

  // 1b -- a compliant draft passes grounding.
  const ok = validateGrounding(goodPanels, input);
  if (!ok.ok) fail("INT-G2", `a compliant draft was rejected: ${ok.reasons.join("; ")}`);
  else pass("INT-G2", "a polarity-compliant draft passes grounding");

  // 1c -- THE mandated contradiction: `eye_contact` is BEGINNING
  // (needs_support under A-051), and the draft calls it excellent. Grounding
  // must reject — not a human. The rejection is required to come from the
  // POLARITY rule, so a green here can never be an attribution-rule accident.
  const contradictory = {
    ...goodPanels,
    strengths: "Excellent eye contact throughout — the student has clearly mastered holding the audience's gaze.",
  };
  const verdict = validateGrounding(contradictory, input);
  if (verdict.ok) fail("INT-G3", "achievement language about a `beginning` dimension was NOT rejected");
  else if (!verdict.reasons.some((r) => r.includes("needs_support") && r.includes("eye_contact"))) {
    fail("INT-G3", `the draft was rejected, but not by the polarity rule: ${verdict.reasons.join("; ")}`);
  } else pass("INT-G3", "a `beginning` rating described as achievement is rejected by the system, by the polarity rule");

  // 1d -- rating ATTRIBUTION never reaches parent prose (A-052). Re-keyed at
  // Backend V2 to the RATIFIED vocabulary: the superseded wording ("rated
  // Emerging") certified a guarantee that no longer holds, because
  // `emerging` is no longer a value this system can assign.
  const leaking = { ...goodPanels, remarks: "The student is currently rated Mastering in sentence flow." };
  const leakVerdict = validateGrounding(leaking, input);
  if (leakVerdict.ok) fail("INT-G4", "a ratified rating label was attributed to the student in parent-facing prose and was NOT rejected");
  else if (!leakVerdict.reasons.some((r) => r.includes("attributed to the student"))) {
    fail("INT-G4", `rejected, but not by the attribution rule: ${leakVerdict.reasons.join("; ")}`);
  } else pass("INT-G4", "attributing a ratified rating label to the student is rejected by the attribution rule");

  // 1d(ii) -- A-052's other half: ORDINARY PROSE using the same words stays
  // LEGAL. A bare-word regex is expressly prohibited, and this is the proof
  // that none was reintroduced. `body` is `mastered` and `sentence_flow` is
  // `mastering`, so neither sentence contradicts a rating either.
  const ordinary = {
    ...goodPanels,
    overview: "Right from the beginning of the session, the student has mastered a confident, upright posture and used gesture naturally.",
    areasForDevelopment: "The student is mastering sentence flow, so short daily practice will keep that progress steady.",
  };
  const ordinaryVerdict = validateGrounding(ordinary, input);
  if (!ordinaryVerdict.ok) fail("INT-G6", `ordinary prose using the label words was rejected — a bare-word guard has regressed: ${ordinaryVerdict.reasons.join("; ")}`);
  else pass("INT-G6", "ordinary prose (\"at the beginning of the session\", \"has mastered … posture\", \"is mastering sentence flow\") remains legal");

  // 1e -- a needs_support dimension presented as a demonstrated strength is
  // rejected. Under OD-4 this MUST target `strengths`: that is the panel the
  // rule now reads, and it is the only one of the four whose role is
  // "positive demonstrated capability". Pointing it at `overview` would test
  // nothing, because Overview may legitimately carry developmental context.
  const wrongStrength = { ...goodPanels, strengths: "Eye contact was the highlight of the session." };
  const strengthVerdict = validateGrounding(wrongStrength, input);
  if (strengthVerdict.ok) fail("INT-G5", "a needs_support dimension passed as the strength without support framing");
  else pass("INT-G5", "a needs_support dimension cannot be presented as the strength");
}

// =====================================================================
// Part 2 -- real authentication (canonical, READ-ONLY)
// =====================================================================
async function partRealAuth() {
  console.log("\n--- Part 2: real local authentication and role isolation (canonical, read-only) ---");
  const stack = await loadLocalStack();
  if (!stack) {
    fail("INT-A0", "the LOCAL Supabase stack's connection values could not be captured from the CLI");
    return null;
  }
  const { url, publishable, secret } = stack;

  const admin = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  const clients = {};
  for (const role of ["trainer", "management", "parent"]) {
    // A real local sign-in WITHOUT handling any password: the Auth admin API
    // mints a one-time magiclink token, and verifying it yields an ordinary
    // session for the accepted synthetic identity. Nothing is created,
    // reset or destroyed.
    const { data, error } = await admin.auth.admin.generateLink({ type: "magiclink", email: EMAIL[role] });
    if (error || !data?.properties?.hashed_token) {
      fail("INT-A0", `could not establish a real session for the ${role} identity`);
      return null;
    }
    const client = createClient(url, publishable, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
    const verified = await client.auth.verifyOtp({ type: "magiclink", token_hash: data.properties.hashed_token });
    if (verified.error || !verified.data?.user) {
      fail("INT-A0", `could not verify the ${role} session token`);
      return null;
    }
    if (verified.data.user.id !== SUB[role]) {
      fail("INT-A0", `the ${role} session resolved to an unexpected auth user`);
      return null;
    }
    clients[role] = client;
  }
  pass("INT-A0", "three real local Auth sessions established (no password handled; identities untouched)");

  // A1 -- server-derived role resolution through the session core.
  for (const role of ["trainer", "management", "parent"]) {
    const identity = await resolveSessionIdentity(clients[role]);
    if (identity.outcome !== "success" || identity.data.role !== role) {
      fail("INT-A1", `${role}: session core resolved ${identity.outcome === "success" ? identity.data.role : identity.outcome}`);
    }
  }
  pass("INT-A1", "resolveSessionIdentity derives each role from live account/membership rows under a real JWT");

  // A2 -- the trainer's real-JWT governed read works end-to-end.
  const observation = await getTrainerObservationCore(clients.trainer, FIXTURE_SESSION, STUDENT);
  if (observation.outcome !== "success" || !observation.data.observationExists || !observation.data.isComplete) {
    fail("INT-A2", `trainer read gave ${observation.outcome}`);
  } else pass("INT-A2", "real trainer JWT -> auth.uid() -> governed assessment read returns the nine-rating observation");

  // A3 -- role isolation: management and parent are denied the rating grid.
  for (const role of ["management", "parent"]) {
    const denied = await getTrainerObservationCore(clients[role], FIXTURE_SESSION, STUDENT);
    if (denied.outcome !== "unauthorized") fail("INT-A3", `${role} observation read gave ${denied.outcome}`);
  }
  pass("INT-A3", "management and the LINKED parent are both denied the assessment read under real JWTs");

  // A4 -- non-disclosing: the denial for a nonexistent session is identical.
  {
    const real = await clients.management.rpc("assessment_get_trainer_observation", { p_class_session_id: FIXTURE_SESSION, p_student_id: STUDENT });
    const ghost = await clients.management.rpc("assessment_get_trainer_observation", { p_class_session_id: "aaaaaaaa-0000-4000-8000-000000000001", p_student_id: STUDENT });
    if (!real.error || !ghost.error || real.error.code !== "BC101" || ghost.error.code !== "BC101" || real.error.message !== ghost.error.message) {
      fail("INT-A4", "denials disclose whether the target exists");
    } else pass("INT-A4", "denials are byte-identical for an existing and a nonexistent target (BC101)");
  }

  // A5 -- no parent visibility before submission; management review gated.
  {
    /*
     * ⛔ THIS BLOCK USED TO PRINT `FAIL` TWICE AND THEN `PASS`, FOR THE SAME
     * LEG ID. Its two checks are bare `if (…) fail(…)` statements with no
     * `return`, and the `pass(…)` beneath them was UNCONDITIONAL — so the
     * summary asserted the leg held while the leg's own output said it did
     * not. Anyone scanning for `PASS` read it as green.
     *
     * ⚠️ It is the instrument-defect family one level down: the SUITE
     * agreeing with itself about a leg that failed. The exit code held at 1
     * throughout, which is exactly why the ratified discipline is to read the
     * EXIT CODE and never the stdout.
     *
     * ▶ Every OTHER leg in this file guards its `pass` with an `if/else`
     * chain (see `INT-Q27`, which failed in the same run and correctly
     * printed no `PASS`). This was the single divergent block, not a pattern.
     */
    const failuresBefore = failures;
    const canonical = await clients.parent.rpc("report_get_canonical", { p_class_session_id: FIXTURE_SESSION, p_student_id: STUDENT });
    if (canonical.error || (Array.isArray(canonical.data) && canonical.data.length !== 0)) {
      fail("INT-A5", "the parent canonical read did not return the zero-row unavailable outcome");
    }
    const review = await clients.management.rpc("report_get_management_review", { p_class_session_id: FIXTURE_SESSION, p_student_id: STUDENT });
    if (review.error || (Array.isArray(review.data) && review.data.length !== 0)) {
      fail("INT-A5", "the management review read returned content with no trainer-approved report");
    }
    if (failures === failuresBefore) {
      pass("INT-A5", "zero-row outcomes: nothing is parent-visible or management-readable before approval/submission");
    }
  }

  // A6 -- direct table access is privilege-denied under every real JWT.
  for (const role of ["trainer", "management", "parent"]) {
    const direct = await clients[role].from("observations").select("id").limit(1);
    if (!direct.error || direct.error.code !== "42501") {
      fail("INT-A6", `${role} direct observations SELECT gave ${direct.error ? direct.error.code : "rows"}`);
    }
  }
  pass("INT-A6", "direct table access to assessment data is permission-denied (42501) for all three real JWTs");

  // A7 -- wrong-role WRITES are denied without residue (BC101/BC001 are
  // raised before any write, so nothing commits and nothing needs cleanup).
  {
    // (Retargeted at Run C3-A Phase 1, and STRENGTHENED rather than
    // narrowed. `assessment_save_observation` no longer holds
    // `authenticated` EXECUTE -- keeping it left a direct PostgREST route
    // by which any authenticated caller could commit a COMPLETE nine-rating
    // assessment with no report shell. The wrong-role write assertion moves
    // to the composer, which IS the client entry point and still raises the
    // authored BC101; and the old RPC's UNREACHABILITY is asserted as a
    // second, additional leg rather than dropped.)
    const parentWrite = await clients.parent.rpc("assessment_save_complete_and_open_report", {
      p_class_session_id: FIXTURE_SESSION, p_student_id: STUDENT,
      p_expected_observation_id: null, p_expected_lock_version: null,
      p_strength_chips: [], p_focus_chips: [], p_observation_notes: null,
      p_follow_up_notes: null, p_term_evidence_notes: null,
      p_ratings: [],
    });
    const trainerLegacy = await clients.trainer.rpc("assessment_save_observation", {
      p_class_session_id: FIXTURE_SESSION, p_student_id: STUDENT,
      p_expected_observation_id: null, p_expected_lock_version: null,
      p_strength_chips: [], p_focus_chips: [], p_observation_notes: null,
      p_follow_up_notes: null, p_term_evidence_notes: null,
      p_ratings: [],
    });
    const managementWrite = await clients.management.rpc("report_create", {
      p_class_session_id: FIXTURE_SESSION, p_student_id: STUDENT,
      p_observation_id: "c9000000-0000-4000-8000-000000000001",
    });
    if (!parentWrite.error || parentWrite.error.code !== "BC101") fail("INT-A7", "the parent write was not denied BC101");
    else if (!trainerLegacy.error || trainerLegacy.error.code !== "42501") {
      fail("INT-A7", `the old assessment_save_observation RPC is still reachable over PostgREST (${trainerLegacy.error ? trainerLegacy.error.code : "it succeeded"})`);
    }
    else if (!managementWrite.error || managementWrite.error.code !== "BC001") fail("INT-A7", "the management report_create was not denied BC001");
    else pass("INT-A7", "wrong-role governed writes are denied by the authored role predicates before anything is written, and the pre-C3-A direct observation-write RPC is no longer reachable over PostgREST at all (42501)");
  }

  // A8 -- R-22: the governed report-context resolver is NON-DISCLOSING about
  // an unknown report id, under every real JWT. The canonical database holds
  // ZERO reports, so every identifier tried here is genuinely unknown — which
  // is exactly the case that must be indistinguishable from "exists but you
  // may not have it". The INT-A4 idiom is applied to a ZERO-ROW boundary
  // rather than a raising one: the answer must be no error AND no rows, and
  // it must be byte-identical across the three roles and across two distinct
  // ghost identifiers. Any divergence — an error code, a message, a row count
  // — would make this an existence oracle over report ids.
  {
    const GHOST_A = "eeeeeeee-0000-4000-8000-000000000001";
    const GHOST_B = "eeeeeeee-0000-4000-8000-000000000002";
    const answers = [];
    for (const role of ["trainer", "management", "parent"]) {
      for (const id of [GHOST_A, GHOST_B]) {
        const r = await clients[role].rpc("report_resolve_context", { p_report_id: id });
        answers.push(JSON.stringify({ error: r.error, data: r.data }));
      }
    }
    const distinct = new Set(answers);
    if (distinct.size !== 1) {
      fail("INT-R0", `the resolver's unknown-id answer differs across roles or identifiers (${distinct.size} distinct answers)`);
    } else if (answers[0] !== JSON.stringify({ error: null, data: [] })) {
      fail("INT-R0", `an unknown report id did not resolve to zero rows with no error (${answers[0]})`);
    } else {
      // The server core must collapse that one zero-row answer into the one
      // non-disclosing result, identically for all three roles.
      const outcomes = [];
      for (const role of ["trainer", "management", "parent"]) {
        const resolved = await resolveReportContextCore(clients[role], GHOST_A);
        outcomes.push(resolved.outcome);
      }
      if (outcomes.some((o) => o !== "unauthorized")) {
        fail("INT-R0", `the resolver core gave ${outcomes.join("/")} for an unknown id, expected unauthorized for all three roles`);
      } else pass("INT-R0", "an UNKNOWN report id resolves to zero rows and NO error, byte-identically for trainer, management and parent and across two ghost identifiers; the core reports the one non-disclosing outcome");
    }
  }

  for (const role of ["trainer", "management", "parent"]) await clients[role].auth.signOut();
  return true;
}

// =====================================================================
// Part 3 -- the full lifecycle on the DISPOSABLE database
// =====================================================================
class ContradictoryProvider {
  async generate() {
    return {
      kind: "ok",
      panels: {
        overview: "Excellent eye contact throughout — truly outstanding and clearly mastered.",
        strengths: "Keep up the flawless facial expressions.",
        areasForDevelopment: "Nothing to practise; every skill is perfect.",
        remarks: "A remarkable, exceptional session with no difficulty anywhere.",
      },
    };
  }
}

async function partLifecycle() {
  console.log("\n--- Part 3: full Trainer -> Management -> Parent lifecycle (disposable database) ---");
  await createDisposable();

  const SESSION = "ab000000-0000-4000-8000-000000000001";
  await q(WORK_DB, `
INSERT INTO public.class_sessions (id, centre_id, class_module_id, session_date, starts_at, ends_at)
VALUES ('${SESSION}','${CENTRE}','${MODULE}', (now() AT TIME ZONE 'Asia/Singapore')::date - 1, '10:00','11:00');
INSERT INTO public.class_session_assignments (centre_id, class_session_id, trainer_membership_id)
VALUES ('${CENTRE}','${SESSION}','${TRAINER_M}');`);
  // 🔴 THE ATTENDANCE ROW IS NO LONGER HAND-INSERTED HERE.
  // It used to be seeded by the fixture INSERT that stood on this spot,
  // which meant the FIRST governed write of the whole report lifecycle --
  // report_create fails closed on a MISSING attendance row (BC015) -- was
  // satisfied by the harness rather than by a governed action. The entry
  // condition of every leg below is now established by the real write path
  // in INT-AT1, so if attendance_set_status is broken the whole lifecycle
  // fails here rather than running on a seeded row.

  const trainerDb = new PsqlRpc(SUB.trainer);
  const managementDb = new PsqlRpc(SUB.management);
  const parentDb = new PsqlRpc(SUB.parent);
  const trustedStore = new LocalTrustedDraftStore(WORK_DB);
  const readStudentDisplayName = async () =>
    q(WORK_DB, `SELECT full_name FROM public.students WHERE id='${STUDENT}';`);

  // =====================================================================
  // THE ATTENDANCE WRITE PATH (A-018, A-026; G-04 item 3)
  // =====================================================================
  // NOTE ON WHAT THIS CHANNEL PROVES. PsqlRpc runs as the OWNER with
  // request.jwt.claims set, so these legs prove the AUTHORED predicates,
  // not the client ACL. The ACL is asserted by the migration's own A3/A4/A11
  // and over real PostgREST in Part 2's INT-A7 idiom.
  const attendanceEvents = async () => Number(await q(WORK_DB,
    `SELECT count(*) FROM public.audit_events WHERE action='attendance.changed';`));
  const attendanceRows = async () => Number(await q(WORK_DB,
    `SELECT count(*) FROM public.attendance WHERE class_session_id='${SESSION}' AND student_id='${STUDENT}';`));

  // AT1 -- no record exists. The call materializes A-018's Present default
  // and appends exactly one event whose state_from is NULL.
  {
    const before = await attendanceEvents();
    const init = await setAttendanceStatusCore(trainerDb, {
      sessionId: SESSION, studentId: STUDENT, newStatus: "present",
    });
    const ev = await q(WORK_DB, `
SELECT COALESCE(e.state_domain,'-') || '|' || COALESCE(e.state_from,'NULL') || '>' || COALESCE(e.state_to,'-')
       || '|' || (e.payload_canonical::jsonb ->> 'initialized')
  FROM public.audit_events e
 WHERE e.action='attendance.changed' ORDER BY e.seq_no DESC LIMIT 1;`);
    if (init.outcome !== "success") {
      fail("INT-AT1", `setAttendanceStatusCore gave ${init.outcome}`); await destroyDisposable(); return;
    }
    if (init.data.status !== "present" || init.data.initialized !== true || init.data.changed !== true) {
      fail("INT-AT1", `the initializing call reported status=${init.data.status} initialized=${init.data.initialized} changed=${init.data.changed}`);
    } else if ((await attendanceEvents()) - before !== 1) {
      fail("INT-AT1", "the initializing call did not append exactly one attendance.changed event");
    } else if (ev !== "attendance|NULL>present|true") {
      fail("INT-AT1", `the event reads '${ev}', expected 'attendance|NULL>present|true'`);
    } else if ((await attendanceRows()) !== 1) {
      fail("INT-AT1", "the pair does not hold exactly one attendance record");
    } else pass("INT-AT1", "the governed write path materialized A-018's Present default for a pair with NO record, in one action, with exactly ONE attendance.changed event whose state_from is NULL — the whole lifecycle below now rests on a governed write, not a seeded row");
  }

  // AT2 -- compare-and-set answers a drifted belief in BOTH directions,
  // including existence, with the SAME stale answer and no side effect.
  {
    const before = await attendanceEvents();
    const omitted = await setAttendanceStatusCore(trainerDb, {
      sessionId: SESSION, studentId: STUDENT, newStatus: "absent",
    });
    const wrong = await setAttendanceStatusCore(trainerDb, {
      sessionId: SESSION, studentId: STUDENT, expectedStatus: "absent", newStatus: "present",
    });
    const status = await q(WORK_DB,
      `SELECT status FROM public.attendance WHERE class_session_id='${SESSION}' AND student_id='${STUDENT}';`);
    if (omitted.outcome !== "stale_state") {
      fail("INT-AT2", `omitting expectedStatus against an EXISTING record gave ${omitted.outcome}, expected stale_state`);
    } else if (wrong.outcome !== "stale_state") {
      fail("INT-AT2", `a wrong expectedStatus gave ${wrong.outcome}, expected stale_state`);
    } else if (status !== "present") {
      fail("INT-AT2", `a refused call changed the committed status to '${status}'`);
    } else if ((await attendanceEvents()) !== before) {
      fail("INT-AT2", "a refused call appended an audit event");
    } else pass("INT-AT2", "CAS refuses BOTH a missing expectation against an existing record AND a wrong one, with the same stale answer, no status change and no audit event — there is no force mode");
  }

  // AT3 -- management (A-034) and parent are closed by the SAME predicate
  // that authorizes the trainer, and their answer is byte-identical to a
  // non-existent session's.
  {
    const before = await attendanceEvents();
    const asManagement = await setAttendanceStatusCore(managementDb, {
      sessionId: SESSION, studentId: STUDENT, expectedStatus: "present", newStatus: "absent",
    });
    const asParent = await setAttendanceStatusCore(parentDb, {
      sessionId: SESSION, studentId: STUDENT, expectedStatus: "present", newStatus: "absent",
    });
    const asNobody = await setAttendanceStatusCore(new PsqlRpc(null), {
      sessionId: SESSION, studentId: STUDENT, expectedStatus: "present", newStatus: "absent",
    });
    const ghost = await setAttendanceStatusCore(trainerDb, {
      sessionId: "aaaaaaaa-0000-4000-8000-000000000001", studentId: STUDENT, newStatus: "absent",
    });
    const same = JSON.stringify(asManagement) === JSON.stringify(ghost)
              && JSON.stringify(asParent) === JSON.stringify(ghost)
              && JSON.stringify(asNobody) === JSON.stringify(ghost);
    const status = await q(WORK_DB,
      `SELECT status FROM public.attendance WHERE class_session_id='${SESSION}' AND student_id='${STUDENT}';`);
    if (asManagement.outcome !== "unauthorized") {
      fail("INT-AT3", `MANAGEMENT reached the attendance write and got ${asManagement.outcome} (A-034 forbids management touching attendance)`);
    } else if (asParent.outcome !== "unauthorized" || asNobody.outcome !== "unauthorized") {
      fail("INT-AT3", `parent gave ${asParent.outcome} and unauthenticated gave ${asNobody.outcome}, expected unauthorized for both`);
    } else if (!same) {
      fail("INT-AT3", "a denied caller's answer differs from a non-existent session's — the error discriminates");
    } else if (status !== "present" || (await attendanceEvents()) !== before) {
      fail("INT-AT3", "a denied call changed the record or appended an event");
    } else pass("INT-AT3", "management, parent and an unauthenticated caller are all refused with the answer a NON-EXISTENT session gets — byte-identical, so nothing discriminates — and no record or event moved");
  }

  // AT4 -- a confirmed no-op is authorized, answered, and NOT audited.
  {
    const before = await attendanceEvents();
    const noop = await setAttendanceStatusCore(trainerDb, {
      sessionId: SESSION, studentId: STUDENT, expectedStatus: "present", newStatus: "present",
    });
    if (noop.outcome !== "success") {
      fail("INT-AT4", `the no-op gave ${noop.outcome}, expected success`);
    } else if (noop.data.changed !== false || noop.data.initialized !== false) {
      fail("INT-AT4", `the no-op reported changed=${noop.data.changed} initialized=${noop.data.initialized}`);
    } else if ((await attendanceEvents()) !== before) {
      fail("INT-AT4", "the no-op appended an audit event; A-029 records governed ACTIONS and a no-op is not one");
    } else pass("INT-AT4", "setting the status it already holds succeeds, reports changed=false, and appends NO event — the audit trail records decisions, not confirmations");
  }

  // L1 -- saveObservation core (trainer): all nine, mixed, eye_contact
  // `beginning` (A-049) -- the needs_support dimension L2's contradictory
  // provider is then caught against.
  const saved = await saveObservationCore(trainerDb, {
    sessionId: SESSION, studentId: STUDENT,
    strengthChips: ["confident-opening"], focusChips: ["pacing"],
    observationNotes: "Worked on a short prepared speech; strong posture.",
    followUpNotes: "Reinforce eye contact drills next session.",
    termEvidenceNotes: "",
    ratings: [
      { dimensionCode: "body", rating: "mastered" },
      { dimensionCode: "emotion", rating: "developing" },
      { dimensionCode: "speech", rating: "mastering" },
      { dimensionCode: "tonality", rating: "developing" },
      { dimensionCode: "eye_contact", rating: "beginning" },
      { dimensionCode: "vocal_projection", rating: "mastered" },
      { dimensionCode: "emotional_expression", rating: "developing" },
      { dimensionCode: "sentence_flow", rating: "mastering" },
      { dimensionCode: "audience_awareness", rating: "mastering" },
    ],
  });
  if (saved.outcome !== "success") { fail("INT-L1", `saveObservationCore gave ${saved.outcome}`); await destroyDisposable(); return; }
  // R-C2-1 (Round C2 Phase C2-A): the complete save is now ATOMIC and opens
  // the report shell in the SAME transaction, so this leg's old claim of
  // "no audit event, no report" is no longer true and has been corrected
  // rather than left standing. The shell it opens is asserted here, and the
  // boundary itself is proven in scripts/tests/c2.
  if (typeof saved.data.reportId !== "string" || saved.data.reportId.length !== 36) {
    fail("INT-L1", "the complete save did not return a real report identifier");
  } else if (saved.data.reportStatus !== "observation_saved") {
    fail("INT-L1", `the shell landed at ${saved.data.reportStatus}, expected observation_saved`);
  } else {
    pass("INT-L1", "saveObservationCore persisted the nine-rating observation AND atomically opened exactly one report shell at observation_saved, returning its real id (R-C2-1)");
  }

  // AT5 -- A-026's "mid-cycle absence RETAINS EXISTING WORK but blocks
  // progression". Real work now exists, which is what makes this leg
  // meaningful: the trainer's observation and its nine ratings must survive
  // being marked absent, and the block must come from the report gate rather
  // than from anything being deleted.
  {
    const countWork = async () => q(WORK_DB, `
SELECT (SELECT count(*) FROM public.observations o WHERE o.class_session_id='${SESSION}' AND o.student_id='${STUDENT}')
    || '/' || (SELECT count(*) FROM public.observation_ratings r
                 JOIN public.observations o ON o.id = r.observation_id
                WHERE o.class_session_id='${SESSION}' AND o.student_id='${STUDENT}')
    || '/' || (SELECT count(*) FROM public.reports rp WHERE rp.class_session_id='${SESSION}' AND rp.student_id='${STUDENT}');`);
    const workBefore = await countWork();
    const absent = await setAttendanceStatusCore(trainerDb, {
      sessionId: SESSION, studentId: STUDENT, expectedStatus: "present", newStatus: "absent",
    });
    const workAfter = await countWork();
    const rows = await attendanceRows();
    const restored = await setAttendanceStatusCore(trainerDb, {
      sessionId: SESSION, studentId: STUDENT, expectedStatus: "absent", newStatus: "present",
    });
    const lastTwo = await q(WORK_DB, `
SELECT pg_catalog.string_agg(x.f || '>' || x.t, ',' ORDER BY x.s)
  FROM (SELECT e.seq_no s, COALESCE(e.state_from,'NULL') f, COALESCE(e.state_to,'-') t
          FROM public.audit_events e WHERE e.action='attendance.changed'
         ORDER BY e.seq_no DESC LIMIT 2) x;`);
    if (absent.outcome !== "success" || absent.data.status !== "absent" || absent.data.initialized !== false) {
      fail("INT-AT5", `marking absent mid-cycle gave ${absent.outcome}`);
    } else if (workAfter !== workBefore || workBefore !== "1/9/1") {
      fail("INT-AT5", `the trainer's work changed across the absence: ${workBefore} -> ${workAfter} (observations/ratings/reports)`);
    } else if (rows !== 1) {
      fail("INT-AT5", `the toggle created a second attendance record (${rows} rows) instead of updating the one`);
    } else if (restored.outcome !== "success" || restored.data.status !== "present") {
      fail("INT-AT5", `restoring present gave ${restored.outcome} — un-marking an accidental absence must never need a governed correction`);
    } else if (lastTwo !== "present>absent,absent>present") {
      fail("INT-AT5", `the two events read '${lastTwo}', expected 'present>absent,absent>present'`);
    } else pass("INT-AT5", "mid-cycle absence RETAINED the observation and all nine ratings and the report row (1/9/1 unchanged), updated the ONE record rather than creating a second, audited both directions, and restoring present was accepted without a governed correction");
  }

  // L2 -- requestDraft with a provider whose output CONTRADICTS the
  // `beginning` rating: grounding must reject twice (one bounded retry) and cancel, so
  // no false draft_ready exists and the assessment is preserved.
  const rejected = await requestDraftCore({
    db: trainerDb, provider: new ContradictoryProvider(), trustedStore,
    authUserSub: SUB.trainer, readStudentDisplayName,
  }, { sessionId: SESSION, studentId: STUDENT });
  if (rejected.outcome !== "generation_failure") fail("INT-L2", `the contradictory draft gave ${rejected.outcome}`);
  else {
    const state = await q(WORK_DB, `SELECT status FROM public.reports WHERE class_session_id='${SESSION}';`);
    const versions = await q(WORK_DB, `SELECT count(*) FROM public.report_versions rv JOIN public.reports r ON r.id=rv.report_id WHERE r.class_session_id='${SESSION}';`);
    if (state !== "observation_saved" || versions !== "0") {
      fail("INT-L2", `after rejection the report is '${state}' with ${versions} version(s); expected observation_saved with 0`);
    } else pass("INT-L2", "grounding rejected the contradictory draft twice; cancel left observation_saved and NO false draft_ready");
  }

  // L2b -- ONE bounded real-provider attempt, ONLY when explicitly
  // authorized for this run. The opt-in is checked FIRST and on its own: the
  // key/model presence test below is reached only after authorization, so a
  // configured key can never, by itself, cause an outward call.
  let realProviderPanels = null;
  if (!REAL_PROVIDER_OPT_IN) {
    record("INT-L2b", REAL_PROVIDER_SKIP_REASON);
  } else if (process.env.LLM_API_KEY && process.env.LLM_MODEL) {
    const real = new OpenAiDraftProvider({ apiKey: process.env.LLM_API_KEY, model: process.env.LLM_MODEL, timeoutMs: 90_000 });
    const observation = await getTrainerObservationCore(trainerDb, SESSION, STUDENT);
    if (observation.outcome === "success") {
      const attempt = await real.generate({
        reportId: "00000000-0000-4000-8000-000000000000",
        observationLockVersion: observation.data.observationLockVersion ?? 1,
        studentDisplayName: "Fixture Student One",
        ratings: observation.data.ratings.map((r) => ({
          dimensionCode: r.dimensionCode, displayName: r.displayName, rating: r.rating,
          // A-051: derived from the ratified constant, not re-hardcoded here,
          // so this harness can never drift from the backend mapping.
          anchorText: "", polarityBand: POLARITY_BANDS[r.rating],
        })),
        strengthChips: observation.data.strengthChips,
        focusChips: observation.data.focusChips,
        trainerNotes: observation.data.observationNotes,
        followUpNotes: observation.data.followUpNotes,
      });
      if (attempt.kind === "ok") {
        const verdict = validateGrounding(attempt.panels, {
          studentDisplayName: "Fixture Student One",
          ratings: observation.data.ratings.map((r) => ({ dimensionCode: r.dimensionCode, displayName: r.displayName, rating: r.rating })),
        });
        if (verdict.ok) { realProviderPanels = attempt.panels; pass("INT-L2b", "one bounded REAL-provider generation succeeded and passed deterministic grounding"); }
        else record("INT-L2b", `the real provider's draft was REJECTED by grounding (${verdict.reasons.length} reason(s)) — the gate works against live output; the deterministic provider carries the lifecycle`);
      } else {
        record("INT-L2b", `the real provider call did not complete (${attempt.kind}${attempt.kind === "provider_failure" ? `, retryable=${attempt.retryable}` : ""}) — recorded, not invented`);
      }
    }
  } else {
    record("INT-L2b", "NOT RUN — NOT PASSED. The real-provider leg was explicitly authorized for this run, but LLM_MODEL and LLM_API_KEY are not both present in this environment (presence-tested only; no value is read). No provider was constructed and no request was attempted.");
  }

  // L3 -- requestDraft with a compliant provider -> draft_ready through the
  // trusted store; then an idempotent repeat.
  const provider = realProviderPanels
    ? { generate: async () => ({ kind: "ok", panels: realProviderPanels }) }
    : new DeterministicFixtureDraftProvider();
  const drafted = await requestDraftCore({
    db: trainerDb, provider, trustedStore, authUserSub: SUB.trainer, readStudentDisplayName,
  }, { sessionId: SESSION, studentId: STUDENT });
  if (drafted.outcome !== "success" || drafted.data.status !== "draft_ready") {
    fail("INT-L3", `requestDraftCore gave ${drafted.outcome}`); await destroyDisposable(); return;
  }
  const repeat = await requestDraftCore({
    db: trainerDb, provider, trustedStore, authUserSub: SUB.trainer, readStudentDisplayName,
  }, { sessionId: SESSION, studentId: STUDENT });
  if (repeat.outcome !== "success" || repeat.data.versionId !== drafted.data.versionId) {
    fail("INT-L3", "a repeated completion attempt was not idempotent");
  } else pass("INT-L3", `validated draft stored through the trusted channel (${realProviderPanels ? "real-provider content" : "deterministic content"}); repeated completion is idempotent`);

  const reportId = drafted.data.reportId;

  // =====================================================================
  // THE SPEC §20 SOURCE TRACE (`report_source_map` [KEY]; G-04 item 1)
  // =====================================================================
  const draftVersionId = drafted.data.versionId;
  const mapRowsFor = async (versionId) => Number(await q(WORK_DB,
    `SELECT count(*) FROM public.report_source_map WHERE report_version_id='${versionId}';`));

  // SM1 -- the trace was written in the SAME transaction as the version,
  // and it is RE-DERIVED from the version's COMMITTED panels rather than
  // compared against a hand-transcribed expectation.
  {
    const committed = await q(WORK_DB, `
SELECT pg_catalog.json_build_object(
         'overview', v.overview, 'strengths', v.strengths,
         'areasForDevelopment', v.areas_for_development, 'remarks', v.remarks)::text
  FROM public.report_versions v WHERE v.id='${draftVersionId}';`);
    const expected = deriveSourceMap(JSON.parse(committed))
      .map((e) => `${e.outputSection}|${e.dimensionCode}`).sort();
    const stored = (await q(WORK_DB, `
SELECT COALESCE(pg_catalog.string_agg(m.output_section || '|' || m.source_dimension_code, ',' ORDER BY m.output_section, m.source_dimension_code), '')
  FROM public.report_source_map m WHERE m.report_version_id='${draftVersionId}';`))
      .split(",").filter((s) => s.length > 0).sort();
    if (expected.length === 0) {
      fail("INT-SM1", "the accepted panels derive an EMPTY trace, so this leg would assert nothing — the fixture must name at least one dimension");
    } else if (stored.length !== expected.length || stored.join(",") !== expected.join(",")) {
      fail("INT-SM1", `the stored trace (${stored.length} row(s)) is not the trace re-derived from the committed panels (${expected.length} row(s))`);
    } else pass("INT-SM1", `the source trace was written in the draft's OWN transaction and is byte-equal to the trace RE-DERIVED from the version's committed panels — ${stored.length} (panel, dimension) assertions, compared against the live source rather than a transcribed literal`);
  }

  // SM2 -- non-vacuity of SM1. Degrade the lexicon and prove the derivation
  // can produce NOTHING. An assertion that has never been demonstrated
  // capable of failing is not evidence.
  {
    const emptied = deriveSourceMap(
      { overview: "x", strengths: "x", areasForDevelopment: "x", remarks: "x" },
      { ...GROUNDING_ANCHORS, dimensionTerms: {} },
    );
    const noPanels = deriveSourceMap(
      { overview: "", strengths: "", areasForDevelopment: "", remarks: "" },
    );
    if (emptied.length !== 0) fail("INT-SM2", "an EMPTIED dimension lexicon still derived trace rows");
    else if (noPanels.length !== 0) fail("INT-SM2", "empty panels still derived trace rows");
    else pass("INT-SM2", "the derivation is demonstrated CAPABLE of producing nothing — an emptied lexicon and empty panels both yield zero rows, so SM1's non-empty result is a real measurement rather than a shape that cannot fail");
  }

  // SM3 -- TRAINER-ONLY. A trace row names a DIMENSION CODE, so A-038
  // (management) and Q-27 (parent) are both closed here, and every denial is
  // the same zero rows a non-existent report gets.
  {
    const asTrainer = await getSourceMapCore(trainerDb, reportId);
    const asManagement = await getSourceMapCore(managementDb, reportId);
    const asParent = await getSourceMapCore(parentDb, reportId);
    const asNobody = await getSourceMapCore(new PsqlRpc(null), reportId);
    const ghost = await getSourceMapCore(trainerDb, "aaaaaaaa-0000-4000-8000-000000000009");
    const denials = [asManagement, asParent, asNobody, ghost];
    if (asTrainer.outcome !== "success" || asTrainer.data.entries.length === 0) {
      fail("INT-SM3", `the assigned trainer got ${asTrainer.outcome} with ${asTrainer.data?.entries?.length ?? "no"} entries`);
    } else if (asTrainer.data.versionId !== draftVersionId) {
      fail("INT-SM3", "the trainer's trace does not name the current cycle version");
    } else if (denials.some((d) => d.outcome !== "success" || d.data.entries.length !== 0 || d.data.versionId !== null)) {
      fail("INT-SM3", `a non-trainer caller received trace rows: ${denials.map((d) => `${d.outcome}/${d.data?.entries?.length ?? "?"}`).join(", ")}`);
    } else if (new Set(denials.map((d) => JSON.stringify(d))).size !== 1) {
      fail("INT-SM3", "the four denial answers are not byte-identical to each other");
    } else pass("INT-SM3", "the assigned trainer reads the trace for the current cycle version; MANAGEMENT (A-038), the linked PARENT (Q-27), an unauthenticated caller and a non-existent report id all receive the IDENTICAL empty answer — no dimension code reaches any of them and nothing discriminates between the four");
  }

  // SM4 -- write-once. A frozen version can never acquire a second,
  // divergent trace. Run through the OWNER channel because the writer holds
  // ZERO client EXECUTE.
  {
    const before = await mapRowsFor(draftVersionId);
    const retry = await psql(WORK_DB,
      `SELECT public.report_store_source_map('${draftVersionId}'::uuid, '[{"output_section":"overview","dimension_code":"body"}]'::jsonb);`,
      { stopOnError: false });
    const after = await mapRowsFor(draftVersionId);
    if (!/BC302/.test(retry.err)) {
      fail("INT-SM4", `a second source-map write did not raise BC302 (stderr: ${retry.err.slice(0, 200)})`);
    } else if (after !== before) {
      fail("INT-SM4", `the refused write changed the row count from ${before} to ${after}`);
    } else pass("INT-SM4", "a second source-map write against the same version is refused BC302 and appends nothing — a frozen version's trace cannot be amended or diverged");
  }

  const working = async () => {
    const r = await trainerDb.rpc("report_get_working", { p_class_session_id: SESSION, p_student_id: STUDENT });
    return Array.isArray(r.data) ? r.data[0] : null;
  };
  let state = await working();
  const edited = await saveTrainerEditCore(trainerDb, {
    reportId, expectedStatus: "draft_ready", expectedLockVersion: state.lock_version,
    expectedVersionId: state.current_version_id,
    panels: {
      overview: state.overview,
      strengths: state.strengths,
      areasForDevelopment: state.areas_for_development,
      remarks: "Edited by the trainer: steady engagement with support for eye contact ahead.",
    },
  });
  if (edited.outcome !== "success") { fail("INT-L4", `saveTrainerEditCore gave ${edited.outcome}`); await destroyDisposable(); return; }
  state = await working();
  if (state.evidence_confirmed !== false) fail("INT-L4", "the edit did not reset the checklist");

  // SM5 -- a HUMAN-AUTHORED derived version inherits NO trace. Copying the
  // AI's trace onto prose a trainer wrote would assert a derivation that did
  // not happen; lineage is derived_from_version_id, so the draft's trace
  // stays reachable by walking back. Zero rows is the CORRECT answer here.
  {
    const editedVersionId = state.current_version_id;
    const onEdited = await mapRowsFor(editedVersionId);
    const onDraft = await mapRowsFor(draftVersionId);
    const lineage = await q(WORK_DB,
      `SELECT COALESCE(derived_from_version_id::text,'NULL') FROM public.report_versions WHERE id='${editedVersionId}';`);
    if (editedVersionId === draftVersionId) {
      fail("INT-SM5", "the trainer edit did not create a new version, so this leg cannot distinguish inheritance");
    } else if (onEdited !== 0) {
      fail("INT-SM5", `the human-authored version carries ${onEdited} trace row(s); it must carry none`);
    } else if (onDraft === 0) {
      fail("INT-SM5", "the draft version's trace was destroyed by the edit");
    } else if (lineage !== draftVersionId) {
      fail("INT-SM5", `the edited version's lineage points at ${lineage}, not the draft it descends from`);
    } else pass("INT-SM5", `the trainer's edit created a NEW version with ZERO trace rows — no derivation is asserted for prose a human wrote — while the draft version's ${onDraft} trace rows survive intact and remain reachable through derived_from_version_id`);
  }
  const ticked = await updateTrainerChecklistCore(trainerDb, {
    reportId, expectedLockVersion: state.lock_version, expectedVersionId: state.current_version_id,
    evidenceConfirmed: true, aiDraftReviewed: true, privacyChecked: true,
  });
  if (ticked.outcome !== "success") fail("INT-L4", `updateTrainerChecklistCore gave ${ticked.outcome}`);
  state = await working();
  const approved = await trainerApproveCore(trainerDb, {
    reportId, expectedStatus: "draft_ready", expectedLockVersion: state.lock_version,
    expectedVersionId: state.current_version_id, expectedContentHash: state.content_hash,
  });
  if (approved.outcome !== "success" || approved.data.status !== "trainer_approved" || approved.data.published !== false) {
    fail("INT-L4", `trainerApproveCore gave ${approved.outcome}`); await destroyDisposable(); return;
  }
  const parentPeek1 = await parentDb.rpc("report_get_canonical", { p_class_session_id: SESSION, p_student_id: STUDENT });
  if (parentPeek1.error || parentPeek1.data.length !== 0) fail("INT-L4", "a trainer-approved (unsubmitted) report became parent-visible");
  else pass("INT-L4", "edit resets checklist; approve freezes and publishes NOTHING; the parent still sees zero rows");

  // --- R-22: the governed report-context resolver ----------------------
  // A REAL report now exists and is UNSUBMITTED, which is the state that
  // makes every one of these legs meaningful. The resolver translates the
  // report id the frontend port is keyed by into the
  // (class_session_id, student_id) pair the governed reads are keyed by,
  // under the CALLER'S OWN authority — so the adapter never has to fabricate
  // or accept a key from the client.
  {
    // R1 -- the assigned trainer resolves the CORRECT pair, and the shape
    //       carries EXACTLY two columns and nothing else.
    const raw = await trainerDb.rpc("report_resolve_context", { p_report_id: reportId });
    const rawRow = Array.isArray(raw.data) && raw.data.length === 1 ? raw.data[0] : null;
    const resolved = await resolveReportContextCore(trainerDb, reportId);
    if (!rawRow) {
      fail("INT-R1", "the assigned trainer could not resolve the report context");
    } else {
      const keys = Object.keys(rawRow).sort().join(",");
      if (keys !== "class_session_id,student_id") {
        fail("INT-R1", `the resolver shape carries unexpected fields: ${keys}`);
      } else if (rawRow.class_session_id !== SESSION || rawRow.student_id !== STUDENT) {
        fail("INT-R1", "the resolver returned the wrong (class_session_id, student_id) pair");
      } else if (resolved.outcome !== "success" || resolved.data.sessionId !== SESSION || resolved.data.studentId !== STUDENT) {
        fail("INT-R1", `the resolver core gave ${resolved.outcome} for the assigned trainer`);
      } else pass("INT-R1", "the assigned trainer resolves the correct pair through the real core; the shape is EXACTLY class_session_id + student_id — no status, lock_version, version id, hash, rating, correction field or centre id exists to leak");
    }

    // R2 -- management of the SAME centre resolves it, with NO status gate:
    //       correction tracking legitimately surfaces reports at draft_ready
    //       and needs_edit, and their ids must stay resolvable. This does not
    //       widen RPC-15 — the CONTENT gate is proven still shut right here.
    const mgmtResolved = await resolveReportContextCore(managementDb, reportId);
    const gatedContent = await managementDb.rpc("report_get_management_review", {
      p_class_session_id: SESSION, p_student_id: STUDENT,
    });
    if (mgmtResolved.outcome !== "success" || mgmtResolved.data.sessionId !== SESSION || mgmtResolved.data.studentId !== STUDENT) {
      fail("INT-R2", `management of the report's own centre gave ${mgmtResolved.outcome}`);
    } else if (gatedContent.error) {
      fail("INT-R2", "the status-gated management content read errored instead of answering");
    } else pass("INT-R2", "management of the report's centre resolves the pair with no status gate, while report_get_management_review's own gate is untouched");

    // R3 -- the LINKED parent gets ZERO rows BEFORE submission. The parent
    //       relationship passes; the missing latest_submitted_version_id is
    //       what denies. Nothing about an unsubmitted report is parent-facing,
    //       not even its session and student.
    const parentBefore = await parentDb.rpc("report_resolve_context", { p_report_id: reportId });
    const parentCore = await resolveReportContextCore(parentDb, reportId);
    if (parentBefore.error || parentBefore.data.length !== 0) {
      fail("INT-R3", "the LINKED parent resolved an unsubmitted report's context");
    } else if (parentCore.outcome !== "unauthorized") {
      fail("INT-R3", `the resolver core gave ${parentCore.outcome} for the pre-submission parent, expected unauthorized`);
    } else pass("INT-R3", "the linked parent — the wrong role for an unsubmitted report — gets ZERO rows and the one non-disclosing outcome before submission");

    // R4 -- an unauthenticated caller, and a trainer whose assignment has
    //       been withdrawn (the wrong-role/no-reach case inside the trainer
    //       branch), both get zero rows.
    const nobody = await new PsqlRpc(null).rpc("report_resolve_context", { p_report_id: reportId });
    await q(WORK_DB, `UPDATE public.class_session_assignments SET is_active=false, unassigned_at=now() WHERE class_session_id='${SESSION}';`);
    const unassigned = await trainerDb.rpc("report_resolve_context", { p_report_id: reportId });
    await q(WORK_DB, `UPDATE public.class_session_assignments SET is_active=true, unassigned_at=NULL WHERE class_session_id='${SESSION}';`);
    const restored = await trainerDb.rpc("report_resolve_context", { p_report_id: reportId });
    if (nobody.error || nobody.data.length !== 0) fail("INT-R4", "an UNAUTHENTICATED caller resolved the report context");
    else if (unassigned.error || unassigned.data.length !== 0) fail("INT-R4", "an UNASSIGNED trainer resolved the report context");
    else if (restored.data.length !== 1) fail("INT-R4", "the trainer's reach was not restored after the assignment was reinstated");
    else pass("INT-R4", "an unauthenticated caller and a trainer without live session reach both get zero rows; reach is re-derived per call, not cached");

    // R5 -- WRONG-CENTRE management gets zero rows. The T7I-26 idiom, adapted
    //       to the disposable database: move the management account's ONLY
    //       active membership to a decoy centre, so the report's centre has
    //       no management membership for this caller at all.
    const DECOY = "b0000000-0000-4000-8000-0000000000ff";
    const MGMT_MEMBERSHIP = "c1000000-0000-4000-8000-000000000001";
    await q(WORK_DB, `
INSERT INTO public.centres (id, code, display_name) VALUES ('${DECOY}','decoy','Decoy Centre');
UPDATE public.centre_memberships SET status='deactivated', deactivated_at=now() WHERE id='${MGMT_MEMBERSHIP}';
INSERT INTO public.centre_memberships (centre_id, account_id, role, status, activated_at)
VALUES ('${DECOY}','c0000000-0000-4000-8000-000000000001','management','active', now());`);
    const wrongCentre = await managementDb.rpc("report_resolve_context", { p_report_id: reportId });
    const wrongCentreCore = await resolveReportContextCore(managementDb, reportId);
    await q(WORK_DB, `
DELETE FROM public.centre_memberships WHERE centre_id='${DECOY}';
DELETE FROM public.centres WHERE id='${DECOY}';
UPDATE public.centre_memberships SET status='active', deactivated_at=NULL WHERE id='${MGMT_MEMBERSHIP}';`);
    const centreRestored = await managementDb.rpc("report_resolve_context", { p_report_id: reportId });
    if (wrongCentre.error || wrongCentre.data.length !== 0) {
      fail("INT-R5", "WRONG-CENTRE management resolved the report context");
    } else if (wrongCentreCore.outcome !== "unauthorized") {
      fail("INT-R5", `the resolver core gave ${wrongCentreCore.outcome} for wrong-centre management`);
    } else if (centreRestored.data.length !== 1) {
      fail("INT-R5", "management's own-centre reach was not restored");
    } else pass("INT-R5", "wrong-centre management gets zero rows: the centre comes from the REPORT row, never from the caller's request");
  }

  // L5 -- management wording edit, then return-to-trainer; management
  // cannot touch substance; returned report stays parent-invisible.
  const review = async () => {
    const r = await managementDb.rpc("report_get_management_review", { p_class_session_id: SESSION, p_student_id: STUDENT });
    return Array.isArray(r.data) && r.data.length > 0 ? r.data[0] : null;
  };
  let candidate = await review();
  if (!candidate) { fail("INT-L5", "management cannot see the trainer-approved candidate"); await destroyDisposable(); return; }
  const worded = await managementEditWordingCore(managementDb, {
    reportId, expectedLockVersion: candidate.lock_version, expectedVersionId: candidate.current_version_id,
    expectedWordingHash: candidate.wording_hash,
    panels: {
      overview: candidate.overview,
      strengths: candidate.strengths,
      areasForDevelopment: candidate.areas_for_development,
      remarks: "Polished by management for clarity: steady engagement, with supported eye-contact practice ahead.",
    },
  });
  if (worded.outcome !== "success") { fail("INT-L5", `managementEditWordingCore gave ${worded.outcome}`); await destroyDisposable(); return; }

  // Substance is unreachable for management: the wording-edited version's
  // nine snapshots are verbatim the trainer-approved source's, and the
  // management identity is denied every substance-bearing entry point.
  const parity = await q(WORK_DB, `
SELECT count(*) FROM public.report_version_ratings a
  JOIN public.report_version_ratings b ON b.dimension_code = a.dimension_code
 WHERE a.report_version_id='${worded.data.versionId}'
   AND b.report_version_id='${candidate.current_version_id}'
   AND a.rating = b.rating;`);
  if (parity !== "9") fail("INT-L5", `only ${parity}/9 snapshots match the trainer-approved source after the wording edit`);
  // p_ratings is passed as an object-array so the psql channel serializes it
  // as jsonb; the role gate (step 4) fires long before ratings validation.
  // (Retargeted at Run C3-A Phase 1 to the composer -- the client entry
  // point for a complete save. This channel is a psql-backed RpcCaller
  // running as the OWNER, so it is not constrained by the client ACL at
  // all; what it proves is the AUTHORED role predicate, unchanged, and the
  // ACL closure is proven separately by INT-A7 over the real PostgREST
  // channel and exhaustively by scripts/tests/c3/run-c3-bypass.mjs.)
  const mgmtAssess = await managementDb.rpc("assessment_save_complete_and_open_report", {
    p_class_session_id: SESSION, p_student_id: STUDENT, p_expected_observation_id: null,
    p_expected_lock_version: null, p_strength_chips: [], p_focus_chips: [],
    p_observation_notes: null, p_follow_up_notes: null, p_term_evidence_notes: null,
    p_ratings: [{ dimension_code: "body", rating: "mastering" }],
  });
  const mgmtEdit = await managementDb.rpc("report_save_edit", {
    p_report_id: reportId, p_expected_status: "draft_ready", p_expected_lock_version: 1,
    p_expected_version_id: candidate.current_version_id,
    p_overview: "x", p_strengths: "x", p_areas_for_development: "x", p_remarks: "x",
  });
  if (!mgmtAssess.error || mgmtAssess.error.code !== "BC101") fail("INT-L5", "management reached the assessment write");
  if (!mgmtEdit.error || !["BC001", "BC004", "BC003"].includes(mgmtEdit.error.code)) fail("INT-L5", "management reached the trainer save path");

  candidate = await review();
  const returned = await managementReturnToTrainerCore(managementDb, {
    reportId, expectedLockVersion: candidate.lock_version, expectedVersionId: candidate.current_version_id,
    issueScope: "rating", dimensionCode: "eye_contact",
    reason: "Please re-verify the eye contact rating against the observed behaviour.",
  });
  if (returned.outcome !== "success" || returned.data.status !== "needs_edit") {
    fail("INT-L5", `managementReturnToTrainerCore gave ${returned.outcome}`); await destroyDisposable(); return;
  }
  const parentPeek2 = await parentDb.rpc("report_get_canonical", { p_class_session_id: SESSION, p_student_id: STUDENT });
  const mgmtPeek = await review();
  if (parentPeek2.error || parentPeek2.data.length !== 0) fail("INT-L5", "a RETURNED report became parent-visible");
  else if (mgmtPeek !== null) fail("INT-L5", "management can still read the candidate after its own return (needs_edit must be zero rows)");
  else pass("INT-L5", "wording edit preserved all nine snapshots; substance writes denied; the returned report is invisible to parent AND management");

  // --- The correction-tracking lifecycle proof (U-B2-1) ----------------
  // Step 1: management DISCOVERS the report it just returned, through the
  // real governed projection. Before Round B2.1 this step was impossible --
  // a returned report left every management-reachable surface entirely.
  const trackAfterReturn = await listManagementCorrectionsFromRpc(managementDb);
  if (trackAfterReturn.outcome !== "success" || trackAfterReturn.data.length !== 1) {
    fail("INT-C1", `the correction-tracking projection gave ${trackAfterReturn.outcome} with ${trackAfterReturn.data?.length ?? "no"} row(s), expected exactly 1`);
  } else {
    const t1 = trackAfterReturn.data[0];
    const expectedName = await readStudentDisplayName();
    const keys = Object.keys(t1).sort().join(",");
    if (keys !== "openCorrectionReason,openCorrectionScope,openCorrectionStatus,reportId,sessionDate,sessionId,status,studentDisplayName,studentId") {
      fail("INT-C1", `the tracking DTO carries unexpected fields: ${keys}`);
    } else if (t1.reportId !== reportId || t1.sessionId !== SESSION || t1.studentId !== STUDENT) {
      fail("INT-C1", "the tracking row does not identify the returned report");
    } else if (t1.status !== "needs_edit" || t1.openCorrectionStatus !== "open" || t1.openCorrectionScope !== "rating") {
      fail("INT-C1", `the tracking row reads ${t1.status}/${t1.openCorrectionStatus}/${t1.openCorrectionScope}`);
    } else if (t1.studentDisplayName !== expectedName) {
      fail("INT-C1", "the tracking row does not carry the authorized student display label");
    } else if (t1.openCorrectionReason !== "Please re-verify the eye contact rating against the observed behaviour.") {
      fail("INT-C1", "the tracking row does not carry the management-authored reason");
    } else pass("INT-C1", "after the return, management DISCOVERS the report through the real governed projection -- needs_edit, open, rating scope, its own bounded reason, and exactly the nine contract DTO fields");
  }

  // Step 1b: the same projection denies every other caller, and the report
  // under correction is still not parent-visible.
  {
    const asTrainer = await listManagementCorrectionsFromRpc(trainerDb);
    const asParent = await listManagementCorrectionsFromRpc(parentDb);
    const asNobody = await listManagementCorrectionsFromRpc(new PsqlRpc(null));
    const parentPeek3 = await parentDb.rpc("report_get_canonical", { p_class_session_id: SESSION, p_student_id: STUDENT });
    if (asTrainer.data?.length !== 0 || asParent.data?.length !== 0 || asNobody.data?.length !== 0) {
      fail("INT-C2", "the governed projection returned rows to a trainer, a parent or an unauthenticated caller");
    } else if (parentPeek3.error || parentPeek3.data.length !== 0) {
      fail("INT-C2", "the report under correction became parent-visible");
    } else pass("INT-C2", "the same projection is empty for trainer, parent and unauthenticated callers, and parent visibility stays off during the correction cycle");
  }

  // L6 -- trainer correction -> fresh checklist -> reapproval.
  state = await working();
  if (!state.open_correction_request_id) fail("INT-L6", "the trainer working read does not carry the open correction");
  const corrected = await saveTrainerEditCore(trainerDb, {
    reportId, expectedStatus: "needs_edit", expectedLockVersion: state.lock_version,
    expectedVersionId: state.current_version_id,
    // 🔴 RE-TARGETED AT THE P1-T08 REVIEW. The corrected sentence used to be
    // written into `strengths` -- it is the OLD `nextFocus` prose, carried
    // over verbatim when the keys were renamed. That is a relabelling shim,
    // and it put a needs_support dimension (`eye_contact` is `beginning` in
    // this lifecycle) into the ONE panel OD-4 defines as positive
    // demonstrated capability only. It then became the shipped acceptance
    // evidence for INT-L9. It escaped detection only because a trainer edit
    // does not re-run validateGrounding.
    //
    // The developmental sentence now goes to Areas for Development, which is
    // where it belongs and where the panel is EXPECTED to name a dimension
    // needing support; `strengths` is left as the trainer's own text.
    panels: {
      overview: state.overview,
      strengths: state.strengths,
      areasForDevelopment: "Our next focus is eye contact, which still needs frequent prompting and support to become consistent.",
      remarks: state.remarks,
    },
  });
  if (corrected.outcome !== "success" || corrected.data.status !== "draft_ready") {
    fail("INT-L6", `the correction save gave ${corrected.outcome}`); await destroyDisposable(); return;
  }
  // Step 2: the trainer has corrected but NOT reapproved. Management must
  // still see the item, and must see that the correction has arrived.
  {
    const midCycle = await listManagementCorrectionsFromRpc(managementDb);
    const t2 = midCycle.outcome === "success" && midCycle.data.length === 1 ? midCycle.data[0] : null;
    if (!t2) {
      fail("INT-C3", `mid-cycle tracking gave ${midCycle.outcome} with ${midCycle.data?.length ?? "no"} row(s), expected exactly 1 -- the item must not vanish before reapproval`);
    } else if (t2.status !== "draft_ready" || t2.openCorrectionStatus !== "open") {
      fail("INT-C3", `mid-cycle tracking reads ${t2.status}/${t2.openCorrectionStatus}, expected draft_ready/open`);
    } else if ((await review()) !== null) {
      fail("INT-C3", "management could read the corrected candidate CONTENT before reapproval");
    } else pass("INT-C3", "correction saved but not reapproved: still tracked, now draft_ready with the request still open, and the content still unreadable by management");
  }

  state = await working();
  await updateTrainerChecklistCore(trainerDb, {
    reportId, expectedLockVersion: state.lock_version, expectedVersionId: state.current_version_id,
    evidenceConfirmed: true, aiDraftReviewed: true, privacyChecked: true,
  });
  state = await working();
  const reapproved = await trainerApproveCore(trainerDb, {
    reportId, expectedStatus: "draft_ready", expectedLockVersion: state.lock_version,
    expectedVersionId: state.current_version_id, expectedContentHash: state.content_hash,
  });
  if (reapproved.outcome !== "success") { fail("INT-L6", `reapproval gave ${reapproved.outcome}`); await destroyDisposable(); return; }
  const resolvedCorrection = await q(WORK_DB, `SELECT status FROM public.report_correction_requests WHERE report_id='${reportId}';`);
  if (resolvedCorrection !== "resolved") fail("INT-L6", `the correction request is '${resolvedCorrection}', expected resolved`);
  else pass("INT-L6", "trainer corrected through a NEW immutable version, re-attested the checklist, reapproved; the request resolved");

  // Step 3: reapproval removes the item from unresolved correction work and
  // moves it to the pending-review queue. Nothing is lost.
  {
    const afterReapproval = await listManagementCorrectionsFromRpc(managementDb);
    if (afterReapproval.outcome !== "success" || afterReapproval.data.length !== 0) {
      fail("INT-C4", `${afterReapproval.data?.length ?? "?"} tracking row(s) after reapproval, expected 0`);
    } else if ((await review()) === null) {
      fail("INT-C4", "the reapproved report is not visible as pending review either -- it vanished");
    } else pass("INT-C4", "reapproval resolves the request and clears the item from correction tracking; it reappears as pending-review work");
  }

  // L7 -- management Approve & Submit: the only publication.
  candidate = await review();
  const chainBefore = Number(await q(WORK_DB, "SELECT count(*) FROM public.audit_events;"));
  const submitted = await managementApproveAndSubmitCore(managementDb, {
    reportId, expectedLockVersion: candidate.lock_version, expectedVersionId: candidate.current_version_id,
    expectedWordingHash: candidate.wording_hash,
  });
  if (submitted.outcome !== "success" || submitted.data.status !== "submitted") {
    fail("INT-L7", `managementApproveAndSubmitCore gave ${submitted.outcome}`); await destroyDisposable(); return;
  }
  // Exactly two ordered state-change events, no committed `approved` residue.
  const lastTwo = await q(WORK_DB, `
SELECT string_agg(state_from || '>' || state_to, ',' ORDER BY seq_no)
  FROM (SELECT e.seq_no, e.state_from, e.state_to FROM public.audit_events e
         WHERE e.action = 'report.state_changed' ORDER BY e.seq_no DESC LIMIT 2) x;`);
  const added = Number(await q(WORK_DB, "SELECT count(*) FROM public.audit_events;")) - chainBefore;
  const residue = await q(WORK_DB, "SELECT count(*) FROM public.reports WHERE status = 'approved';");
  if (lastTwo !== "trainer_approved>approved,approved>submitted") {
    fail("INT-L7", `the final two state-change events are '${lastTwo}'`);
  } else if (added !== 2) {
    fail("INT-L7", `the submission appended ${added} events, expected exactly 2`);
  } else if (residue !== "0") {
    fail("INT-L7", "a committed approved-status report exists");
  } else pass("INT-L7", "Approve & Submit appended exactly two ordered state-change events with no approved residue");

  // Step 4/5: final submission leaves unresolved correction tracking empty,
  // while the resolved request survives as history.
  {
    const afterSubmission = await listManagementCorrectionsFromRpc(managementDb);
    const resolvedRows = await q(WORK_DB, `SELECT count(*) FROM public.report_correction_requests WHERE report_id='${reportId}' AND status='resolved';`);
    if (afterSubmission.outcome !== "success" || afterSubmission.data.length !== 0) {
      fail("INT-C5", `${afterSubmission.data?.length ?? "?"} tracking row(s) after submission, expected 0`);
    } else if (resolvedRows !== "1") {
      fail("INT-C5", `${resolvedRows} resolved correction request(s) survive, expected 1`);
    } else pass("INT-C5", "final submission removes the report from unresolved correction tracking; the resolved request survives as history");
  }

  // AT6 -- A-026's ONE governed refusal, now that a version is SUBMITTED.
  // Directional: absent is refused, present is not, and the refusal carries
  // its own authored message rather than a generic "reload" — nothing has
  // drifted and reloading changes nothing.
  {
    const before = await attendanceEvents();
    const refused = await setAttendanceStatusCore(trainerDb, {
      sessionId: SESSION, studentId: STUDENT, expectedStatus: "present", newStatus: "absent",
    });
    const stillPresent = await setAttendanceStatusCore(trainerDb, {
      sessionId: SESSION, studentId: STUDENT, expectedStatus: "present", newStatus: "present",
    });
    const status = await q(WORK_DB,
      `SELECT status FROM public.attendance WHERE class_session_id='${SESSION}' AND student_id='${STUDENT}';`);
    const submittedIntact = await q(WORK_DB,
      `SELECT (latest_submitted_version_id IS NOT NULL)::text FROM public.reports WHERE id='${reportId}';`);
    if (refused.outcome !== "validation") {
      fail("INT-AT6", `marking a SUBMITTED report's student absent gave ${refused.outcome}, expected validation`);
    } else if (!/governed correction/.test(refused.message)) {
      fail("INT-AT6", `the refusal message does not name the governed correction path: '${refused.message}'`);
    } else if (status !== "present" || submittedIntact !== "true") {
      fail("INT-AT6", "the refused call altered the attendance record or the submitted report");
    } else if ((await attendanceEvents()) !== before) {
      fail("INT-AT6", "the refused call appended an audit event");
    } else if (stillPresent.outcome !== "success") {
      fail("INT-AT6", `the refusal is not directional — confirming present after submission gave ${stillPresent.outcome}`);
    } else pass("INT-AT6", "after submission, moving the student to ABSENT is refused with its own authored governed-correction message, the record and the submitted report are untouched, no event is appended — and the refusal is DIRECTIONAL: confirming present is still accepted");
  }

  // L8 -- the audit chain verifies end-to-end after the complete lifecycle.
  const broken = await q(WORK_DB, "SELECT count(*) FROM public.audit_verify_chain(NULL, NULL, NULL) x WHERE NOT x.ok;");
  if (broken !== "0") fail("INT-L8", `${broken} audit row(s) fail verification`);
  else pass("INT-L8", "the hash chain verifies across the complete lifecycle (T7I-33's audit-evidence leg)");

  // L9 -- the parent now sees EXACTLY the submitted canonical panels.
  const canonical = await parentDb.rpc("report_get_canonical", { p_class_session_id: SESSION, p_student_id: STUDENT });
  const row = Array.isArray(canonical.data) && canonical.data.length === 1 ? canonical.data[0] : null;
  if (!row) fail("INT-L9", "the parent cannot read the submitted canonical report");
  else {
    const keys = Object.keys(row).sort().join(",");
    // Sorted, so this list is in OD-4 ALPHABETICAL order, not panel order.
    if (keys !== "areas_for_development,overview,remarks,strengths,submitted_at") {
      fail("INT-L9", `the canonical read carries unexpected fields: ${keys}`);
    } else if (row.areas_for_development !== "Our next focus is eye contact, which still needs frequent prompting and support to become consistent.") {
      fail("INT-L9", "the canonical panels are not the submitted version's");
    } else pass("INT-L9", "the parent reads exactly the four submitted panels + submitted_at — nothing else exists in the shape");
  }

  // =====================================================================
  // Q-27 AT THE PROJECTION LAYER, not at the RPC shape
  // =====================================================================
  // INT-L9 above proves the RPC returns five columns. This leg proves the
  // thing Q-27 actually rules: the nine dimension RATINGS do not reach a
  // Parent session ANYWHERE in the governed projection's payload. The
  // exclusion must happen at this layer, never by fetching values into a
  // client and hiding them.
  //
  // ⚠️ THE TEST IS STRUCTURAL, AND DELIBERATELY NOT A BARE-WORD SCAN.
  // A-052 expressly PROHIBITS a bare-word rating-label regex, because
  // ordinary parent-facing English legitimately contains "has mastered
  // maintaining eye contact" and "at the beginning of the session". So this
  // asserts three structural properties instead: the exact key set; that no
  // KEY anywhere is a dimension code or mentions a rating; and that no LEAF
  // VALUE is EXACTLY a rating label. Prose containing a label is legal; a
  // field whose value IS a label is a rating.
  {
    const dto = await getCanonicalReportCore(parentDb, SESSION, STUDENT);
    const RATINGS = ["beginning", "developing", "mastering", "mastered"];
    const DIMS = GROUNDING_ANCHORS.dimensionCodes;
    const badKeys = [];
    const badValues = [];
    const walk = (node, path) => {
      if (node === null || node === undefined) return;
      if (Array.isArray(node)) { node.forEach((v, i) => walk(v, `${path}[${i}]`)); return; }
      if (typeof node === "object") {
        for (const [k, v] of Object.entries(node)) {
          const norm = k.toLowerCase();
          if (DIMS.includes(norm) || norm.includes("rating") || norm.includes("dimension")) {
            badKeys.push(`${path}.${k}`);
          }
          walk(v, `${path}.${k}`);
        }
        return;
      }
      if (typeof node === "string" && RATINGS.includes(node.trim().toLowerCase())) {
        badValues.push(path);
      }
    };
    if (dto.outcome !== "success") {
      fail("INT-Q27", `the linked parent's governed projection gave ${dto.outcome} for a SUBMITTED report`);
    } else {
      walk(dto.data, "$");
      const topKeys = Object.keys(dto.data).sort().join(",");
      const panelKeys = Object.keys(dto.data.panels).sort().join(",");
      if (topKeys !== "panels,submittedAt") {
        fail("INT-Q27", `the Parent DTO's top-level keys are '${topKeys}', expected exactly 'panels,submittedAt'`);
      } else if (panelKeys !== "areasForDevelopment,overview,remarks,strengths") {
        fail("INT-Q27", `the Parent DTO's panel keys are '${panelKeys}', expected exactly the four OD-4 panels`);
      } else if (badKeys.length > 0) {
        fail("INT-Q27", `the Parent payload carries rating-bearing key(s): ${badKeys.join(", ")}`);
      } else if (badValues.length > 0) {
        fail("INT-Q27", `the Parent payload carries a leaf whose value IS a rating label: ${badValues.join(", ")}`);
      } else pass("INT-Q27", "the governed Parent projection's payload carries exactly {panels, submittedAt} with the four OD-4 panels, NO key anywhere named for a dimension or a rating, and NO leaf whose value is a rating label — the nine ratings are excluded at the PROJECTION layer, and the test is structural rather than the bare-word scan A-052 prohibits");
    }
  }

  // R6 -- the SAME parent, the SAME report id, AFTER management submitted:
  // now the pair resolves. This is the exact half that proves R3 was a live
  // predicate on latest_submitted_version_id rather than a blanket
  // parent denial — the only thing that changed is submission.
  {
    const parentAfter = await resolveReportContextCore(parentDb, reportId);
    const rawAfter = await parentDb.rpc("report_resolve_context", { p_report_id: reportId });
    const rowAfter = Array.isArray(rawAfter.data) && rawAfter.data.length === 1 ? rawAfter.data[0] : null;
    if (parentAfter.outcome !== "success" || parentAfter.data.sessionId !== SESSION || parentAfter.data.studentId !== STUDENT) {
      fail("INT-R6", `the linked parent gave ${parentAfter.outcome} AFTER submission, expected the resolved pair`);
    } else if (!rowAfter || Object.keys(rowAfter).sort().join(",") !== "class_session_id,student_id") {
      fail("INT-R6", "the post-submission parent shape is not exactly the two identifiers");
    } else pass("INT-R6", "after management submits, the linked parent resolves the SAME report id to the correct pair — R3's denial was the live latest_submitted_version_id predicate, not a blanket role rule");
  }

  const events = await q(WORK_DB, "SELECT count(*) FROM public.audit_events;");
  console.log(`\nDisposable database: ${events} committed audit event(s); destroyed next.`);
  await destroyDisposable();
  console.log("Disposable database destroyed.");

  record("T7I-33", "proven as the real-credential path (Part 2) plus the server-action cores producing verifiable hash-chained audit rows (Part 3); the cookie-transport UI leg belongs to the post-merge three-role dry run (contract SS12 step 13).");
  record("T7I-34", "the server halves are proven here (checklist gate, session gates, role denials, status-gated reads) and in the B1 suites; the UI halves belong to later UI checkpoints.");
}

async function main() {
  console.log("=== Backend Round B2 integration suite ===");
  // Announced BEFORE anything runs, so "no provider leg ran" can never be
  // read as "the provider leg passed".
  console.log(
    REAL_PROVIDER_OPT_IN
      ? `REAL-PROVIDER LEG (INT-L2b): EXPLICITLY AUTHORIZED for this run — ONE bounded outward call may be attempted.`
      : `REAL-PROVIDER LEG (INT-L2b): OFF BY DEFAULT — NO external provider call will be made by this run. ` +
        `Enable deliberately with ${REAL_PROVIDER_FLAG} or ${REAL_PROVIDER_ENV}=1.`,
  );
  console.log("");
  loadEnv();
  partGrounding();
  const auth = await partRealAuth();
  if (auth) await partLifecycle();
  else record("Part 3", "skipped because Part 2 could not establish real sessions");
}

main().then(() => {
  console.log("");
  if (!REAL_PROVIDER_OPT_IN) {
    if (outwardFetchAttempts === 0) {
      pass("INT-PG", "the outward-call trip-wire was armed for the whole run and observed ZERO non-loopback requests: every network call this suite made went to the local stack, and no external provider was contacted");
    } else {
      console.error(`FAIL INT-PG: ${outwardFetchAttempts} outward request(s) were attempted and refused.`);
    }
  }
  if (failures > 0) {
    console.error(`B2 integration suite: ${failures} failure(s).`);
    process.exitCode = 1;
  } else {
    console.log("B2 integration suite: all proofs passed; the canonical database was touched read-only.");
    if (!REAL_PROVIDER_OPT_IN) {
      console.log("B2 integration suite: INT-L2b was SKIPPED BY DEFAULT, not passed — this run made ZERO external provider calls.");
    }
  }
}).catch(async (e) => {
  console.error(`B2 integration suite aborted: ${e.message}`);
  try { await destroyDisposable(); } catch { /* best effort */ }
  process.exitCode = 1;
});
