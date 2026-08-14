#!/usr/bin/env node
// =====================================================================
// PORTAL PHASE P2-6R -- THE APPLICATION LAYER OVER THE FIVE LESSON-MATERIAL
// FUNCTIONS, WHICH `P2-6` DID NOT BUILD.
// =====================================================================
// ⛔ WHY THIS SUITE IS SOURCE-LEVEL AND NOT SQL. The database half was already
//    proved end to end: `prove-p2-6-lesson-materials.sql` legs `PLM-5`, `PLM-6`
//    and `PLM-7` insert a real `storage.objects` row, run
//    `material_attach_confirm`, `material_signed_path` and `material_remove`,
//    measure the audit delta in BOTH directions and exercise BOTH roles. ▶ None
//    of that was wrong, and none of it detected the defect — because the defect
//    was that NO APPLICATION CODE REACHED ANY OF IT. Re-proving the SQL here
//    would repeat the exact blind spot.
//
// ⚠️ THE COMPLEMENTARY GATE IS `PDTa-WIRED` in `prove-p2-8-students.mjs`, which
//    fails the build for ANY portal-era RPC no application file calls. This
//    suite proves the SHAPE of the path that gate now requires to exist.
//
// ⛔ EXIT CODE IS THE ONLY VERDICT.
//
// Run: npm run prove:portal-p2-6r
// =====================================================================

import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { rpcsWithoutApplicationCaller } from "./rpc-call-rule.mjs";
import { stripComments } from "./artefact-read-rule.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

let failures = 0;
const check = (ok, msg) => {
  if (!ok) failures += 1;
  console.log(`${ok ? "PASS" : "FAIL"}    ${msg}`);
};

const read = (...parts) => readFileSync(join(ROOT, ...parts), "utf8");

const TRANSPORT = read("server", "modules", "class-session", "material-transport.ts");
const ACTIONS = read("server", "modules", "integration-adapter", "participant-actions.ts");
const PORT = read("lib", "frontend", "physical-test-port.ts");
const REAL = read("lib", "frontend", "adapters", "real-participant-port.ts");
const FIXTURE = read("lib", "frontend", "fixtures", "physical-test-fixture.ts");
const SCREEN = read("features", "management", "management-lesson-plans.tsx");

/*
 * ⛔ NON-VACUITY FIRST. Every leg below is a match against source text, and a
 * scan that read an empty string would report a clean sweep of nothing. ▶ This
 * is the standing rule: aborted or zero-match is NOT-RUN, never PASS.
 */
const SIZES = [TRANSPORT, ACTIONS, PORT, REAL, FIXTURE, SCREEN].map((s) => s.length);
check(
  SIZES.every((n) => n > 2000),
  `PMT-0  NON-VACUITY: all six layers were read and are non-trivial (${SIZES.join(", ")} chars) — a zero-length read would make every leg below vacuously true`,
);

// ---------------------------------------------------------------------
// PMT-1 -- THE DEFECT ITSELF: THE THREE WRITE RPCS ARE REACHED FROM
//          APPLICATION CODE, NOT ONLY FROM A SQL SUITE.
// ---------------------------------------------------------------------
const wiring = rpcsWithoutApplicationCaller(ROOT, () => false, [
  {
    migration: "20260814090000_portal_p2_6_lesson_materials.sql",
    suite: "prove-p2-6-lesson-materials.sql",
  },
]);
/*
 * ⚠️ `() => false` — NO EXEMPTION IS GRANTED TO THE SCAN, deliberately.
 * `PDTa-WIRED` grants a CATALOGUE-PROVEN internal exemption because it sweeps
 * every portal migration; this leg names the three functions the defect was
 * actually about, so no exemption logic sits between the claim and the answer.
 *
 * ⛔ THE FIRST DRAFT OF THIS LEG WAS WRONG AND THE SUITE CAUGHT IT. It excluded
 * only `app_management_may_attach_material` and then asserted "nothing else is
 * unwired" — but this migration ALSO re-declares `audit_action_registry` to
 * extend the registry, and that function is provably internal too. ▶ The leg
 * failed against a correct repair, which is the `PDT-2` shape again: an
 * assertion phrased over the WRONG SET rather than over the property. The
 * property is *these three write paths are reachable from application code*.
 */
const MATERIAL_WRITES = ["material_attach_confirm", "material_signed_path", "material_remove"];
const unwiredWrites = MATERIAL_WRITES.filter((fn) =>
  wiring.unwired.some((entry) => entry.startsWith(`${fn} (`)),
);
check(
  unwiredWrites.length === 0 && wiring.declaredCount >= 5,
  `PMT-1  ⛔ THE REPAIRED DEFECT: the P2-6 migration declares ${wiring.declaredCount} function(s), and ALL THREE governed material writes now have an application caller. Still unwired among them: ${unwiredWrites.join(", ") || "none"}. ▶ P2-6 left all three here, named in the application ONLY INSIDE COMMENTS, behind three permanently disabled buttons`,
);

/*
 * ⛔ THE CONTROL, AND IT IS A REAL ONE. A leg reporting "none unwired" is
 * indistinguishable from a scan that failed to read the migration at all. ▶ The
 * same scan on the same migration must still name the two functions that
 * genuinely have no application caller — the storage policy predicate and the
 * registry function — which proves the scanner CAN produce a non-empty result
 * here, so PMT-1's clean answer is a finding rather than a silence.
 */
check(
  wiring.declaredCount > 0 && wiring.unwired.length === 2,
  `PMT-1c CONTROL: the same unfiltered scan parses ${wiring.declaredCount} declared function(s) and still names exactly ${wiring.unwired.length} with no application caller (${wiring.unwired.join(", ")}) — both provably internal, and both proof that PMT-1's clean result is a MEASUREMENT rather than an unreadable file yielding an empty list`,
);

// ---------------------------------------------------------------------
// PMT-2 -- THE THREE RPCS ARE CALLED FROM THE SERVER, NEVER THE BROWSER.
// ---------------------------------------------------------------------
const RPCS = ["material_attach_confirm", "material_signed_path", "material_remove"];
check(
  RPCS.every((fn) => new RegExp(`\\.rpc\\(\\s*"${fn}"`).test(stripComments(TRANSPORT))),
  `PMT-2  all three governed RPCs (${RPCS.join(", ")}) are invoked from server-only transport code — measured OUTSIDE comments, which is exactly where P2-6's five references all were`,
);
check(
  TRANSPORT.startsWith('import "server-only"'),
  "PMT-2b the transport module is `server-only` — the three governed calls cannot be pulled into a client bundle by an import",
);
check(
  RPCS.every((fn) => !new RegExp(`\\.rpc\\(\\s*["']${fn}["']`).test(stripComments(SCREEN))),
  "PMT-2c ⛔ and the SURFACE calls none of them directly — it goes through the port, so no client component holds a governed RPC name (ADR-3)",
);

// ---------------------------------------------------------------------
// PMT-2d -- THE UPLOAD RUNS ON THE CALLER'S CLIENT. This IS the ruling.
// ---------------------------------------------------------------------
{
  const fn = stripComments(TRANSPORT);
  const upload = fn.slice(fn.indexOf("export async function uploadMaterialCore"));
  const insertAt = upload.indexOf("client.storage.from(MATERIAL_BUCKET).upload");
  const elevatedAt = upload.indexOf("elevated.storage");
  check(
    insertAt > 0 && (elevatedAt === -1 || elevatedAt > insertAt),
    "PMT-2d ⛔ THE UPLOAD INSERT USES `client` — the caller's OWN request-scoped credential — and the elevated client appears only AFTER it, on the cleanup path. ▶ This is the whole reason route (b) needed no T-P44 widening: ADR-3 records that the database role follows the CREDENTIAL, not the code location, so the storage policy gates this INSERT exactly as it would a browser's",
  );
  check(
    !/elevated\.storage\.from\(MATERIAL_BUCKET\)\.upload/.test(upload),
    "PMT-2e ⛔ AND THE ELEVATED CLIENT NEVER UPLOADS. Using it here would BYPASS the one storage policy entirely — a governance defect wearing the costume of an optimisation",
  );
}

// ---------------------------------------------------------------------
// PMT-3 -- `readMaybeRow`, NOT `readRows`. All three are `RETURNS record`.
// ---------------------------------------------------------------------
const body = stripComments(TRANSPORT);
check(
  /readMaybeRow</.test(body) && !/readRows</.test(body),
  "PMT-3  ⛔ every RPC consumer here uses `readMaybeRow` and none uses `readRows` — all three functions are `RETURNS record`, which PostgREST resolves to a BARE OBJECT. P2-7 lost four KPI tiles to exactly this",
);

// ---------------------------------------------------------------------
// PMT-4 -- A REFUSAL IS SURFACED AS A REFUSAL (Q-7).
// ---------------------------------------------------------------------
check(
  /o_attached !== true/.test(body) && /o_removed !== true/.test(body),
  "PMT-4  ⛔ `false` FROM EITHER GOVERNED WRITE IS REPORTED AS `unauthorized`, never swallowed. The RPCs never throw, so a caller ignoring the boolean would report SUCCESS on a REFUSED attach and leave an unreferenced object behind it (Q-7)",
);
check(
  /o_object_path === null \|\| mediaType === null|path === null \|\| mediaType === null/.test(body),
  "PMT-4b a refused `material_signed_path` returns NULLs, and the transport refuses on them rather than signing a guessed path",
);

// ---------------------------------------------------------------------
// PMT-5 -- THE ELEVATED CLIENT SIGNS; IT NEVER AUTHORIZES.
// ---------------------------------------------------------------------
const signedFn = body.slice(body.indexOf("export async function materialViewUrlCore"));
check(
  signedFn.indexOf("material_signed_path") < signedFn.indexOf("createSignedUrl") &&
    signedFn.indexOf("createSignedUrl") > 0,
  "PMT-5  ⛔ THE GOVERNED RPC RUNS FIRST AND THE ELEVATED CLIENT SIGNS SECOND — the elevated client is never reached before the caller's own request-scoped client has been authorized (the P1-5 two-client split)",
);
check(
  !/createElevatedSupabaseClient/.test(TRANSPORT),
  "PMT-5b and the transport never CONSTRUCTS an elevated client — it receives one, so the decision to use elevated privilege is visible at the adapter call site rather than hidden inside a module",
);
check(
  /\.remove\(/.test(body) && body.indexOf("material_remove") < body.lastIndexOf(".remove("),
  "PMT-5c ⛔ ON REMOVAL THE GOVERNED ROW-AND-AUDIT DELETION COMMITS FIRST and the object delete follows — so a failed object delete leaves an ORPHAN in a private bucket rather than a surviving row pointing at nothing",
);

// ---------------------------------------------------------------------
// PMT-6 -- ALL FOUR MEMBERS EXIST ON THE PORT, THE REAL ADAPTER AND THE
//          FIXTURE. A port member with no fixture is a runtime hole.
// ---------------------------------------------------------------------
const MEMBERS = ["uploadMaterial", "readMaterialViewUrl", "removeMaterial"];
for (const member of MEMBERS) {
  check(
    new RegExp(`${member}\\(`).test(PORT) &&
      new RegExp(`${member}\\(`).test(REAL) &&
      new RegExp(`async ${member}\\(`).test(FIXTURE),
    `PMT-6  \`${member}\` is declared on the port, bound in the real adapter AND implemented in the fixture — all three, because a port member missing from either implementation is a runtime hole \`tsc\` would catch only for the class, not for the interface`,
  );
}

/*
 * ⛔ THE FIXTURE REFUSES ALL THREE GOVERNED CALLS, and that is the point rather
 * than an unfinished stub. An attach and a removal each emit an AUDIT EVENT, and
 * the fixture has no database, no bucket and no chain. ▶ A simulated success on
 * an audited write teaches the operator that a transport works on a path that
 * recorded nothing — which is the same class of untruth this whole phase repairs.
 */
const fixtureBlock = FIXTURE.slice(
  FIXTURE.indexOf("async uploadMaterial"),
  FIXTURE.indexOf("async uploadMaterial") + 1200,
);
check(
  (fixtureBlock.match(/outcome: "unavailable"/g) ?? []).length >= 3,
  "PMT-6b ⛔ and the fixture REFUSES all three rather than simulating them — an attach and a removal each emit a governed audit event, and a fixture with no chain must not report one happened",
);

// ---------------------------------------------------------------------
// PMT-7 -- THE SURFACE IS ACTUALLY WIRED, AND WHAT IS STILL INERT SAYS SO.
// ---------------------------------------------------------------------
const screen = stripComments(SCREEN);
check(
  /port\.readMaterialViewUrl\(/.test(screen) && /port\.removeMaterial\(/.test(screen),
  "PMT-7  ⛔ THE TWO REPAIRED CONTROLS CALL THE PORT FROM AN EVENT HANDLER — not from a comment. This is the leg that would have failed at P2-6 and did not exist to",
);
check(
  !/title="Download is not wired in this phase"/.test(SCREEN) &&
    !/title="Remove is not wired in this phase"/.test(SCREEN),
  "PMT-7b and the two `not wired in this phase` tooltips are GONE — a stale message describing a removed limitation is the §12.11 defect, corrected in the same pass as the mechanism",
);
/*
 * ⛔ THE HONESTY LEG, NOW POINTED AT WHAT IS TRUE RATHER THAN AT WHAT WAS.
 *
 * At the first pass this asserted that the ONE inert control disclosed its
 * reason. The Operator then ruled the transport, upload was built, and ▶ **the
 * old leg would still have been GREEN while describing a control that no longer
 * exists** — the §12.11 stale-message family exactly. It is rewritten in the
 * same pass as the mechanism, which is the rule.
 *
 * ⛔ WHAT IT PINS NOW: non-resumability is stated ON THE SURFACE, permanently,
 * in the Operator's words — *"A dropped upload retries from the start, and the
 * copy should not imply otherwise."*
 */
check(
  /Uploads do not resume/.test(SCREEN) && /must be started again from scratch/.test(SCREEN),
  "PMT-7c ⛔ NON-RESUMABILITY IS STATED ON THE SURFACE, permanently and at the control — not surfaced only after a failure, where it would read as an excuse rather than as a property of the transport",
);
check(
  !/not wired in this phase|needs an Operator ruling on its transport/.test(SCREEN),
  "PMT-7d and NO INERT-CONTROL LANGUAGE SURVIVES anywhere on this screen — every control is live, so a message saying otherwise would be false (§12.11)",
);
check(
  /port\.uploadMaterial\(/.test(screen),
  "PMT-7e ⛔ THE UPLOAD CONTROL CALLS THE PORT — the third and last of P2-6's three dead buttons",
);

// ---------------------------------------------------------------------
// PMT-8 -- NO SCHEMA. The Operator authorized the application layer only.
// ---------------------------------------------------------------------
const MIGRATIONS = readdirSync(join(ROOT, "supabase", "migrations")).filter((f) => f.endsWith(".sql"));
check(
  MIGRATIONS.length > 10 && !MIGRATIONS.some((f) => /p2_6r|material_transport/i.test(f)),
  `PMT-8  ⛔ NO MIGRATION WAS ADDED BY THIS REPAIR — ${MIGRATIONS.length} files present and none named for it. The floor guards the leg: an unreadable directory yielding an empty list would otherwise pass the "none named" half trivially`,
);
check(
  !/CREATE (TABLE|FUNCTION|POLICY|TYPE)/i.test(TRANSPORT + ACTIONS),
  "PMT-8b ⛔ NOT ONE DDL STATEMENT IN THE REPAIR. The Operator's authorization was explicit — *\"No schema — the database layer is correct and complete\"* — and the database half was measured correct before a line was written",
);

console.log(`\nRESULT: ${failures === 0 ? "PASS" : "FAIL"}  (${failures} failed check${failures === 1 ? "" : "s"})`);
process.exit(failures === 0 ? 0 : 1);
