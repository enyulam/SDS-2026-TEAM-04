#!/usr/bin/env node
// =====================================================================
// B.E.S.T Coach -- Backend Round B2 integration suite
// =====================================================================
// LOCAL STACK ONLY. Three parts:
//
//   Part 1 -- GROUNDING (pure, no database): deterministic schema and
//     grounding validation, including the mandated contradiction case (an
//     `emerging` rating described in achievement language MUST be rejected)
//     and the raw-rating-label leak case.
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
//     work runs here and only here (U-7I-21).
//
//   An optional bounded REAL-PROVIDER leg runs once inside Part 3 when
//   LLM_API_KEY is configured; its absence or failure is RECORDED, never
//   invented as success.
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
import { validatePanelShape, DeterministicFixtureDraftProvider, OpenAiDraftProvider } from "@/server/modules/ai-drafting/provider.ts";
import { requestDraftCore } from "@/server/modules/ai-drafting/request-draft-core.ts";
import { LocalTrustedDraftStore } from "@/server/modules/ai-drafting/trusted-store.ts";
import { saveObservationCore, getTrainerObservationCore } from "@/server/modules/observation/core.ts";
import {
  saveTrainerEditCore, updateTrainerChecklistCore, trainerApproveCore,
  managementEditWordingCore, managementReturnToTrainerCore, managementApproveAndSubmitCore,
} from "@/server/modules/report-workflow/core.ts";
import { resolveSessionIdentity } from "@/server/modules/identity-access/session-core.ts";

const ROOT = process.cwd();
const CONTAINER = "supabase_db_best-coach-mvp";
const SEED_DB = "bc_b2_seed";
const WORK_DB = "bc_b2";

const CENTRE = "b0000000-0000-4000-8000-000000000001";
const STUDENT = "c2000000-0000-4000-8000-000000000001";
const MODULE = "c4000000-0000-4000-8000-000000000001";
const ENROLMENT = "c6000000-0000-4000-8000-000000000001";
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

let failures = 0;
const fail = (id, msg) => { failures += 1; console.error(`FAIL ${id}: ${msg}`); };
const pass = (id, msg) => console.log(`PASS ${id}${msg ? " -- " + msg : ""}`);
const record = (id, msg) => console.log(`RECORDED ${id}: ${msg}`);

// ---------------------------------------------------------------------
// Environment: load ONLY the named variables from .env.local into process
// memory. Values are never logged, echoed or interpolated into any output.
// ---------------------------------------------------------------------
function loadEnv() {
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
  const ratings = [
    { dimensionCode: "body", displayName: "Body", rating: "advanced" },
    { dimensionCode: "emotion", displayName: "Emotion", rating: "emerging" },
    { dimensionCode: "speech", displayName: "Speech", rating: "secure" },
    { dimensionCode: "tonality", displayName: "Tonality", rating: "developing" },
    { dimensionCode: "eye_contact", displayName: "Eye Contact", rating: "emerging" },
    { dimensionCode: "vocal_projection", displayName: "Vocal Projection", rating: "advanced" },
    { dimensionCode: "emotional_expression", displayName: "Emotional Expression", rating: "developing" },
    { dimensionCode: "sentence_flow", displayName: "Sentence Flow", rating: "secure" },
    { dimensionCode: "audience_awareness", displayName: "Audience Awareness", rating: "secure" },
  ];
  const input = { studentDisplayName: "Fixture Student One", ratings };
  const goodPanels = {
    todaysStrength: "The student used posture and gesture confidently and independently across today's activities.",
    nextFocus: "Our next focus is eye contact, where frequent prompting and support will help the skill grow more consistent.",
    practiceSuggestion: "Short daily practice with gentle guidance on facial expressions will reinforce this week's work.",
    sessionTakeaway: "A strong session overall, with clear engagement and steady progress.",
  };

  // 1a -- schema validation rejects malformed shapes.
  if (validatePanelShape({ ...goodPanels, extra: "x" }) !== null) fail("INT-G1", "an extra key passed schema validation");
  else if (validatePanelShape({ ...goodPanels, nextFocus: "" }) !== null) fail("INT-G1", "an empty panel passed schema validation");
  else if (validatePanelShape(goodPanels) === null) fail("INT-G1", "a valid shape was rejected");
  else pass("INT-G1", "structured-output schema validation accepts the valid shape and rejects malformed ones");

  // 1b -- a compliant draft passes grounding.
  const ok = validateGrounding(goodPanels, input);
  if (!ok.ok) fail("INT-G2", `a compliant draft was rejected: ${ok.reasons.join("; ")}`);
  else pass("INT-G2", "a polarity-compliant draft passes grounding");

  // 1c -- THE mandated contradiction: `eye_contact` is EMERGING, and the
  // draft calls it excellent. Grounding must reject — not a human.
  const contradictory = {
    ...goodPanels,
    todaysStrength: "Excellent eye contact throughout — the student has clearly mastered holding the audience's gaze.",
  };
  const verdict = validateGrounding(contradictory, input);
  if (verdict.ok) fail("INT-G3", "achievement language about an emerging dimension was NOT rejected");
  else pass("INT-G3", "an emerging rating described as achievement is rejected by the system");

  // 1d -- raw rating labels never reach parent prose.
  const leaking = { ...goodPanels, sessionTakeaway: "The student is currently rated Emerging in eye contact." };
  const leakVerdict = validateGrounding(leaking, input);
  if (leakVerdict.ok) fail("INT-G4", "a raw rating label leaked into parent-facing prose");
  else pass("INT-G4", "raw rating vocabulary in parent prose is rejected");

  // 1e -- a needs_support dimension presented as the strength is rejected.
  const wrongStrength = { ...goodPanels, todaysStrength: "Eye contact was the highlight of the session." };
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
    const canonical = await clients.parent.rpc("report_get_canonical", { p_class_session_id: FIXTURE_SESSION, p_student_id: STUDENT });
    if (canonical.error || (Array.isArray(canonical.data) && canonical.data.length !== 0)) {
      fail("INT-A5", "the parent canonical read did not return the zero-row unavailable outcome");
    }
    const review = await clients.management.rpc("report_get_management_review", { p_class_session_id: FIXTURE_SESSION, p_student_id: STUDENT });
    if (review.error || (Array.isArray(review.data) && review.data.length !== 0)) {
      fail("INT-A5", "the management review read returned content with no trainer-approved report");
    }
    pass("INT-A5", "zero-row outcomes: nothing is parent-visible or management-readable before approval/submission");
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
    const parentWrite = await clients.parent.rpc("assessment_save_observation", {
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
    else if (!managementWrite.error || managementWrite.error.code !== "BC001") fail("INT-A7", "the management report_create was not denied BC001");
    else pass("INT-A7", "wrong-role governed writes are denied by the authored role predicates before anything is written");
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
        todaysStrength: "Excellent eye contact throughout — truly outstanding and clearly mastered.",
        nextFocus: "Keep up the flawless facial expressions.",
        practiceSuggestion: "Nothing to practise; every skill is perfect.",
        sessionTakeaway: "A remarkable, exceptional session with no difficulty anywhere.",
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
VALUES ('${CENTRE}','${SESSION}','${TRAINER_M}');
INSERT INTO public.attendance (centre_id, class_session_id, class_module_id, student_id, enrolment_id, status)
VALUES ('${CENTRE}','${SESSION}','${MODULE}','${STUDENT}','${ENROLMENT}','present');`);

  const trainerDb = new PsqlRpc(SUB.trainer);
  const managementDb = new PsqlRpc(SUB.management);
  const parentDb = new PsqlRpc(SUB.parent);
  const trustedStore = new LocalTrustedDraftStore(WORK_DB);
  const readStudentDisplayName = async () =>
    q(WORK_DB, `SELECT full_name FROM public.students WHERE id='${STUDENT}';`);

  // L1 -- saveObservation core (trainer): all nine, mixed, eye_contact emerging.
  const saved = await saveObservationCore(trainerDb, {
    sessionId: SESSION, studentId: STUDENT,
    strengthChips: ["confident-opening"], focusChips: ["pacing"],
    observationNotes: "Worked on a short prepared speech; strong posture.",
    followUpNotes: "Reinforce eye contact drills next session.",
    termEvidenceNotes: "",
    ratings: [
      { dimensionCode: "body", rating: "advanced" },
      { dimensionCode: "emotion", rating: "developing" },
      { dimensionCode: "speech", rating: "secure" },
      { dimensionCode: "tonality", rating: "developing" },
      { dimensionCode: "eye_contact", rating: "emerging" },
      { dimensionCode: "vocal_projection", rating: "advanced" },
      { dimensionCode: "emotional_expression", rating: "developing" },
      { dimensionCode: "sentence_flow", rating: "secure" },
      { dimensionCode: "audience_awareness", rating: "secure" },
    ],
  });
  if (saved.outcome !== "success") { fail("INT-L1", `saveObservationCore gave ${saved.outcome}`); await destroyDisposable(); return; }
  pass("INT-L1", "saveObservationCore persisted the nine-rating observation (no audit event, no report)");

  // L2 -- requestDraft with a provider whose output CONTRADICTS the emerging
  // rating: grounding must reject twice (one bounded retry) and cancel, so
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

  // L2b -- ONE bounded real-provider attempt, when configured.
  let realProviderPanels = null;
  if (process.env.LLM_API_KEY && process.env.LLM_MODEL) {
    const real = new OpenAiDraftProvider({ apiKey: process.env.LLM_API_KEY, model: process.env.LLM_MODEL, timeoutMs: 90_000 });
    const observation = await getTrainerObservationCore(trainerDb, SESSION, STUDENT);
    if (observation.outcome === "success") {
      const attempt = await real.generate({
        reportId: "00000000-0000-4000-8000-000000000000",
        observationLockVersion: observation.data.observationLockVersion ?? 1,
        studentDisplayName: "Fixture Student One",
        ratings: observation.data.ratings.map((r) => ({
          dimensionCode: r.dimensionCode, displayName: r.displayName, rating: r.rating,
          anchorText: "", polarityBand: r.rating === "emerging" ? "needs_support" : r.rating === "developing" ? "developing" : "positive",
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
    record("INT-L2b", "LLM_API_KEY is not configured in this environment; the bounded real-provider leg was not run");
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

  // L4 -- trainer edit -> checklist -> approve (publishes nothing).
  const working = async () => {
    const r = await trainerDb.rpc("report_get_working", { p_class_session_id: SESSION, p_student_id: STUDENT });
    return Array.isArray(r.data) ? r.data[0] : null;
  };
  let state = await working();
  const edited = await saveTrainerEditCore(trainerDb, {
    reportId, expectedStatus: "draft_ready", expectedLockVersion: state.lock_version,
    expectedVersionId: state.current_version_id,
    panels: {
      todaysStrength: state.todays_strength,
      nextFocus: state.next_focus,
      practiceSuggestion: state.practice_suggestion,
      sessionTakeaway: "Edited by the trainer: steady engagement with support for eye contact ahead.",
    },
  });
  if (edited.outcome !== "success") { fail("INT-L4", `saveTrainerEditCore gave ${edited.outcome}`); await destroyDisposable(); return; }
  state = await working();
  if (state.evidence_confirmed !== false) fail("INT-L4", "the edit did not reset the checklist");
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
      todaysStrength: candidate.todays_strength,
      nextFocus: candidate.next_focus,
      practiceSuggestion: candidate.practice_suggestion,
      sessionTakeaway: "Polished by management for clarity: steady engagement, with supported eye-contact practice ahead.",
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
  const mgmtAssess = await managementDb.rpc("assessment_save_observation", {
    p_class_session_id: SESSION, p_student_id: STUDENT, p_expected_observation_id: null,
    p_expected_lock_version: null, p_strength_chips: [], p_focus_chips: [],
    p_observation_notes: null, p_follow_up_notes: null, p_term_evidence_notes: null,
    p_ratings: [{ dimension_code: "body", rating: "secure" }],
  });
  const mgmtEdit = await managementDb.rpc("report_save_edit", {
    p_report_id: reportId, p_expected_status: "draft_ready", p_expected_lock_version: 1,
    p_expected_version_id: candidate.current_version_id,
    p_todays_strength: "x", p_next_focus: "x", p_practice_suggestion: "x", p_session_takeaway: "x",
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

  // L6 -- trainer correction -> fresh checklist -> reapproval.
  state = await working();
  if (!state.open_correction_request_id) fail("INT-L6", "the trainer working read does not carry the open correction");
  const corrected = await saveTrainerEditCore(trainerDb, {
    reportId, expectedStatus: "needs_edit", expectedLockVersion: state.lock_version,
    expectedVersionId: state.current_version_id,
    panels: {
      todaysStrength: state.todays_strength,
      nextFocus: "Our next focus is eye contact, which still needs frequent prompting and support to become consistent.",
      practiceSuggestion: state.practice_suggestion,
      sessionTakeaway: state.session_takeaway,
    },
  });
  if (corrected.outcome !== "success" || corrected.data.status !== "draft_ready") {
    fail("INT-L6", `the correction save gave ${corrected.outcome}`); await destroyDisposable(); return;
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
    if (keys !== "next_focus,practice_suggestion,session_takeaway,submitted_at,todays_strength") {
      fail("INT-L9", `the canonical read carries unexpected fields: ${keys}`);
    } else if (row.next_focus !== "Our next focus is eye contact, which still needs frequent prompting and support to become consistent.") {
      fail("INT-L9", "the canonical panels are not the submitted version's");
    } else pass("INT-L9", "the parent reads exactly the four submitted panels + submitted_at — nothing else exists in the shape");
  }

  const events = await q(WORK_DB, "SELECT count(*) FROM public.audit_events;");
  console.log(`\nDisposable database: ${events} committed audit event(s); destroyed next.`);
  await destroyDisposable();
  console.log("Disposable database destroyed.");

  record("T7I-33", "proven as the real-credential path (Part 2) plus the server-action cores producing verifiable hash-chained audit rows (Part 3); the cookie-transport UI leg belongs to the post-merge three-role dry run (contract SS12 step 13).");
  record("T7I-34", "the server halves are proven here (checklist gate, session gates, role denials, status-gated reads) and in the B1 suites; the UI halves belong to later UI checkpoints.");
}

async function main() {
  console.log("=== Backend Round B2 integration suite ===\n");
  loadEnv();
  partGrounding();
  const auth = await partRealAuth();
  if (auth) await partLifecycle();
  else record("Part 3", "skipped because Part 2 could not establish real sessions");
}

main().then(() => {
  console.log("");
  if (failures > 0) {
    console.error(`B2 integration suite: ${failures} failure(s).`);
    process.exitCode = 1;
  } else {
    console.log("B2 integration suite: all proofs passed; the canonical database was touched read-only.");
  }
}).catch(async (e) => {
  console.error(`B2 integration suite aborted: ${e.message}`);
  try { await destroyDisposable(); } catch { /* best effort */ }
  process.exitCode = 1;
});
