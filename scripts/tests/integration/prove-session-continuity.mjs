#!/usr/bin/env node
// =====================================================================
// P1-T09a / P1-T11 -- CLAUDE.md §10 PHASE 1 EXIT CONDITION (c)
//
//   "a session's follow-up note appears as the next session's previous
//    focus"
// =====================================================================
// This is one of the three exit conditions §10 requires be DEMONSTRATED
// before Phase 1 is met, and FINAL_MVP_EXECUTION_PLAN.md P1-T11 step 6
// records that it "has no other owner in this plan and requires
// P1-T09a's fixture". This file is that demonstration.
//
// WHY IT COULD NOT BE PROVEN BEFORE. The ratified Step 7F fixture holds
// ONE class session, and its single observation carries
// `follow_up_notes = NULL`. Continuity is a relationship BETWEEN two
// sessions of the same module, so a one-session fixture cannot exhibit
// it either way -- a green result would have been vacuous. P1-T09a's
// expansion adds the second session and a real follow-up note, which is
// precisely what CLAUDE.md §11 said the expansion was for.
//
// WHAT IS PROVEN, AND HOW HONESTLY:
//   1. POSITIVE -- reading the roster for the LATER session surfaces the
//      EARLIER session's follow-up note as `previousSessionFocus`, byte
//      for byte, for the student it belongs to.
//   2. NOT VACUOUS -- the note is read back from the database first, so
//      the expected value is derived rather than hard-coded, and the
//      comparison is exact equality on a non-empty string.
//   3. SCOPED -- the OTHER students in the same session, who have no
//      prior observation, carry `previousSessionFocus === null`. A
//      projection that leaked one student's note onto the whole roster
//      would pass check 1 and fail this one.
//   4. DIRECTIONAL -- reading the roster for the EARLIER session yields
//      no previous focus for anyone. Continuity must flow forwards only;
//      a symmetric implementation would pass 1-3 and fail this.
//
// AUTHENTICATION: ADMIN-MINTED SESSION -- password sign-in NOT-RUN
// (Operator credential required). Per the standing ruling in
// FINAL_MVP_G06_GROUNDING_RULING.md §H-6, the magiclink admin path is
// authorized for automated legs and proves POST-AUTHENTICATION behaviour
// ONLY. It is never a sign-in proof, a login proof, or evidence that
// authentication works.
//
// READ-ONLY. This file creates, updates and deletes nothing. No
// provider is constructed and no outward request is made.
//
// Run: node --import ./scripts/tests/integration/alias-loader.mjs \
//        scripts/tests/integration/prove-session-continuity.mjs
// =====================================================================

import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

import { getSessionRosterCore } from "@/server/modules/report-workflow/trainer-projections.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

const TRAINER_EMAIL = "trainer.fixture@example.test";
const DB_CONTAINER = "supabase_db_best-coach-mvp";

// The P1-T09a expansion's continuity pair. Fixed literals, exactly as the
// fixture defines them.
const EARLIER_SESSION = "e5000000-0000-4000-8000-000000000001"; // 2026-02-10
const LATER_SESSION = "e5000000-0000-4000-8000-000000000002"; // 2026-02-17
const OBSERVED_STUDENT = "e2000000-0000-4000-8000-000000000001";

let failures = 0;
const pass = (id, msg) => console.log(`PASS ${id} -- ${msg}`);
const fail = (id, msg) => {
  failures += 1;
  console.log(`FAIL ${id} -- ${msg}`);
};

function psql(sql) {
  const r = spawnSync(
    "docker",
    ["exec", "-i", DB_CONTAINER, "psql", "--no-psqlrc", "-U", "postgres", "-d", "postgres", "-At", "-c", sql],
    { encoding: "utf8", shell: false },
  );
  if (r.status !== 0) throw new Error(`psql failed: ${r.stderr}`);
  return r.stdout.replace(/\n$/, "");
}

function loadLocalStack() {
  return new Promise((resolve) => {
    const p = spawn("npx", ["--no-install", "supabase", "status", "--output", "json"], {
      cwd: ROOT,
      stdio: ["ignore", "pipe", "pipe"],
      shell: process.platform === "win32",
    });
    let out = "";
    p.stdout.on("data", (d) => {
      out += d;
    });
    p.on("close", () => {
      try {
        const status = JSON.parse(out.slice(out.indexOf("{")));
        const url = status.API_URL;
        const publishable = status.PUBLISHABLE_KEY || status.ANON_KEY;
        const secret = status.SECRET_KEY || status.SERVICE_ROLE_KEY;
        const host = url ? new URL(url).hostname : "";
        // Refuse anything that is not the local stack. A continuity proof
        // must never reach a hosted project.
        if (!["127.0.0.1", "localhost", "::1"].includes(host)) return resolve(null);
        resolve(url && publishable && secret ? { url, publishable, secret } : null);
      } catch {
        resolve(null);
      }
    });
  });
}

console.log("PHASE 1 EXIT CONDITION (c) -- SESSION-TO-SESSION CONTINUITY");
console.log("AUTH: ADMIN-MINTED SESSION -- password sign-in NOT-RUN (Operator credential required)\n");

// ---------------------------------------------------------------------
// Derive the expected note FROM THE DATABASE. Hard-coding it here would
// make the proof self-confirming: it would compare the projection with a
// constant rather than with the trainer's actual saved fact.
// ---------------------------------------------------------------------
const expectedNote = psql(
  `SELECT follow_up_notes FROM public.observations
    WHERE class_session_id = '${EARLIER_SESSION}' AND student_id = '${OBSERVED_STUDENT}';`,
);

if (!expectedNote || expectedNote.trim().length === 0) {
  fail("CONT-0", "the earlier session's observation carries no follow-up note; the fixture cannot prove continuity");
  console.log("\nRESULT: FAIL");
  process.exit(1);
}
pass("CONT-0", `the earlier session's observation carries a non-empty follow-up note (${expectedNote.length} chars)`);

const stack = await loadLocalStack();
if (!stack) {
  fail("CONT-A0", "the LOCAL Supabase stack's connection values could not be captured, or the stack is not local");
  console.log("\nRESULT: FAIL");
  process.exit(1);
}

const admin = createClient(stack.url, stack.secret, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});
const link = await admin.auth.admin.generateLink({ type: "magiclink", email: TRAINER_EMAIL });
if (link.error || !link.data?.properties?.hashed_token) {
  fail("CONT-A0", "could not mint a session for the ratified trainer identity");
  console.log("\nRESULT: FAIL");
  process.exit(1);
}
const trainer = createClient(stack.url, stack.publishable, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});
const verified = await trainer.auth.verifyOtp({
  type: "magiclink",
  token_hash: link.data.properties.hashed_token,
});
if (verified.error || !verified.data?.user) {
  fail("CONT-A0", "could not verify the minted trainer session");
  console.log("\nRESULT: FAIL");
  process.exit(1);
}
pass("CONT-A0", "an ADMIN-MINTED trainer session was established (NOT a sign-in proof)");

// ---------------------------------------------------------------------
// 1 + 3 -- the LATER session's roster
// ---------------------------------------------------------------------
const later = await getSessionRosterCore(trainer, LATER_SESSION);
if (later.outcome !== "success") {
  fail("CONT-1", `the trainer could not read the later session's roster (${later.outcome})`);
} else {
  const observed = later.data.find((r) => r.studentId === OBSERVED_STUDENT);
  if (!observed) {
    fail("CONT-1", "the observed student is absent from the later session's roster");
  } else if (observed.previousSessionFocus !== expectedNote) {
    fail(
      "CONT-1",
      `previousSessionFocus does not match the saved follow-up note.\n` +
        `       expected: ${JSON.stringify(expectedNote)}\n` +
        `       actual  : ${JSON.stringify(observed.previousSessionFocus)}`,
    );
  } else {
    pass("CONT-1", "the earlier session's follow-up note surfaces EXACTLY as the later session's previous focus");
  }

  // 3 -- scoping. Students with no prior observation must carry null. A
  // projection that broadcast one student's note across the roster would
  // satisfy CONT-1 and fail here.
  const others = later.data.filter((r) => r.studentId !== OBSERVED_STUDENT);
  if (others.length === 0) {
    fail("CONT-3", "the later session has only one student, so the scoping check would be vacuous");
  } else {
    const leaked = others.filter((r) => r.previousSessionFocus !== null);
    if (leaked.length > 0) {
      fail("CONT-3", `${leaked.length} student(s) with no prior observation carry a previous focus -- the note leaked`);
    } else {
      pass("CONT-3", `all ${others.length} student(s) without a prior observation carry previousSessionFocus = null`);
    }
  }
}

// ---------------------------------------------------------------------
// 4 -- direction. Continuity flows FORWARDS only.
// ---------------------------------------------------------------------
const earlier = await getSessionRosterCore(trainer, EARLIER_SESSION);
if (earlier.outcome !== "success") {
  fail("CONT-4", `the trainer could not read the earlier session's roster (${earlier.outcome})`);
} else {
  const carried = earlier.data.filter((r) => r.previousSessionFocus !== null);
  if (carried.length > 0) {
    fail("CONT-4", `the EARLIER session already shows a previous focus for ${carried.length} student(s); continuity is not directional`);
  } else {
    pass("CONT-4", "the earlier session carries no previous focus -- continuity flows forwards only");
  }
}

console.log("\n---------------------------------------------------------------");
if (failures > 0) {
  console.log(`Session continuity: ${failures} failure(s).`);
  console.log("RESULT: FAIL");
  process.exit(1);
}
console.log("Session continuity: 0 failures.");
console.log("RESULT: PASS -- CLAUDE.md §10 Phase 1 exit condition (c) is DEMONSTRATED.");
console.log("        Authentication leg recorded as ADMIN-MINTED SESSION; password");
console.log("        sign-in remains NOT-RUN and belongs to the Operator's rehearsal.");
