#!/usr/bin/env node
// =====================================================================
// P2-6R -- THE UPLOAD, PROVED END TO END. NOT "THE ACTION EXISTS".
// =====================================================================
// ⛔ WHAT THE OPERATOR ASKED FOR, VERBATIM: *"Prove the upload end to end, not
//    just that the action exists — a file reaching the bucket, the row written,
//    the audit event fired, and removal working."* Every one of those four is a
//    separate measured leg below.
//
// ⚠️ IT RUNS ON AN ADMIN-MINTED MANAGEMENT SESSION, WHICH IS **NOT A SIGN-IN
//    PROOF** (`G06` hero-first ruling). ▶ That is not a weaker substitute here,
//    it is the RIGHT principal: the ruled transport is a SERVER-ACTION RELAY
//    that uploads with the CALLER'S OWN request-scoped client, so the bytes hit
//    `storage.objects` as the `authenticated` role carrying a real management
//    JWT — exactly what this script holds. The one storage INSERT policy and
//    `app_management_may_attach_material` therefore run against the same
//    principal in this proof as in production.
//
// ⛔ WHAT THIS DOES **NOT** PROVE, STATED SO IT IS NEVER READ AS MORE: it does
//    not exercise Next's Server Action body pipeline, so `bodySizeLimit` is
//    NOT verified here. That is a browser leg and is `NOT-RUN` until `:3000`
//    is clear. The FIGURE is derived and recorded in `next.config.ts`.
//
// ⛔ EXIT CODE IS THE ONLY VERDICT.
//
// Run: npm run prove:portal-p2-6r-e2e
// =====================================================================

import { createClient } from "@supabase/supabase-js";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { assertConfigProjectId, resolveLocalTarget } from "../../fixtures/local-target-guard.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const { projectId: PROJECT_ID, dbContainer: DB_CONTAINER } = resolveLocalTarget();
assertConfigProjectId(
  (readFileSync(join(ROOT, "supabase", "config.toml"), "utf8").match(/^\s*project_id\s*=\s*"([^"]+)"/m) ?? [])[1] ?? "",
  PROJECT_ID,
);

let failures = 0;
const check = (ok, msg) => {
  if (!ok) failures += 1;
  console.log(`${ok ? "PASS" : "FAIL"}    ${msg}`);
};

function psql(sql) {
  const r = spawnSync(
    "docker",
    ["exec", "-i", DB_CONTAINER, "psql", "-U", "postgres", "-d", "postgres", "-tAX", "-c", sql],
    { encoding: "utf8" },
  );
  return (r.stdout ?? "").trim();
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const PUBLISHABLE = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const SERVICE_KEY = process.env.SUPABASE_SECRET_KEY;
if (!SUPABASE_URL || !PUBLISHABLE || !SERVICE_KEY) {
  console.log("FAIL    local Supabase env values are absent — the legs could not run");
  console.log("\nRESULT: FAIL  (environment)");
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

async function mint(email) {
  const link = await admin.auth.admin.generateLink({ type: "magiclink", email });
  if (link.error || !link.data?.properties?.hashed_token) return null;
  const c = createClient(SUPABASE_URL, PUBLISHABLE, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const v = await c.auth.verifyOtp({ type: "magiclink", token_hash: link.data.properties.hashed_token });
  if (v.error || !v.data?.session) return null;
  return c;
}

// ---------------------------------------------------------------------
// E-0 -- NON-VACUITY. A session to act as, and a real session row to act on.
// ---------------------------------------------------------------------
const management = await mint("management.fixture@example.test");
const trainer = await mint("trainer.fixture@example.test");
check(
  management !== null && trainer !== null,
  "E-0   ADMIN-MINTED sessions established for the ratified management and trainer identities (NOT a sign-in proof)",
);
if (!management || !trainer) {
  console.log("\nRESULT: FAIL  (no session)");
  process.exit(1);
}

const SESSION_ID = psql("SELECT id FROM public.class_sessions ORDER BY session_date LIMIT 1;");
check(
  /^[0-9a-f-]{36}$/.test(SESSION_ID),
  `E-0b  a real class session was resolved to act on (${SESSION_ID || "NONE"}) — an empty id would make every leg below vacuous`,
);
if (!/^[0-9a-f-]{36}$/.test(SESSION_ID)) {
  console.log("\nRESULT: FAIL  (no session row)");
  process.exit(1);
}

const before = {
  rows: Number(psql("SELECT count(*) FROM public.class_session_materials;")),
  audit: Number(psql("SELECT count(*) FROM public.audit_events;")),
  objects: Number(psql("SELECT count(*) FROM storage.objects WHERE bucket_id='lesson-materials';")),
};

// The exact path shape the storage policy admits, derived the same way the
// transport derives it: `<class_session_id>/<material_id>.<ext>`.
const MATERIAL_ID = globalThis.crypto.randomUUID();
const OBJECT_PATH = `${SESSION_ID}/${MATERIAL_ID}.pdf`;
const BYTES = new TextEncoder().encode("%PDF-1.4\n% P2-6R end-to-end proof artefact\n%%EOF\n");

// ---------------------------------------------------------------------
// E-1 -- A FILE REACHES THE BUCKET, as the MANAGEMENT principal.
// ---------------------------------------------------------------------
const up = await management.storage
  .from("lesson-materials")
  .upload(OBJECT_PATH, BYTES, { contentType: "application/pdf", upsert: false });
check(
  !up.error,
  `E-1   ⛔ THE FILE REACHED THE BUCKET as the MANAGEMENT principal via the one INSERT policy${up.error ? ` — ${up.error.message}` : ""}. ▶ No elevated client was used, which is exactly why the ruled relay needed no T-P44 widening`,
);
const objectsAfterUpload = Number(
  psql("SELECT count(*) FROM storage.objects WHERE bucket_id='lesson-materials';"),
);
check(
  objectsAfterUpload === before.objects + 1,
  `E-1b  and the OBJECT IS ACTUALLY THERE — storage.objects moved ${before.objects} -> ${objectsAfterUpload}, measured in the catalogue rather than inferred from a 200`,
);

/*
 * ⛔ THE CONTROL FOR E-1. A leg saying "management could upload" proves nothing
 * about the policy unless somebody who should NOT be able to is refused. ▶ The
 * TRAINER holds a real session and must be refused by the same policy.
 */
const trainerAttempt = await trainer.storage
  .from("lesson-materials")
  .upload(`${SESSION_ID}/${globalThis.crypto.randomUUID()}.pdf`, BYTES, {
    contentType: "application/pdf",
    upsert: false,
  });
check(
  trainerAttempt.error !== null,
  "E-1c  CONTROL: the TRAINER — holding a real authenticated session — is REFUSED by the same INSERT policy. ▶ Without this, E-1 would be equally true of a bucket with no policy at all",
);

// ---------------------------------------------------------------------
// E-2 -- THE ROW IS WRITTEN, and E-3 -- THE AUDIT EVENT FIRES.
// ---------------------------------------------------------------------
const attach = await management.rpc("material_attach_confirm", {
  p_class_session_id: SESSION_ID,
  p_material_id: MATERIAL_ID,
  p_display_name: "P2-6R proof deck.pdf",
});
check(
  !attach.error && attach.data?.o_attached === true,
  `E-2   ⛔ THE GOVERNED ATTACH SUCCEEDED (o_attached = ${JSON.stringify(attach.data?.o_attached)})${attach.error ? ` — ${attach.error.message}` : ""}. ⚠️ Read off a BARE OBJECT, not rows[0]: the RPC is RETURNS record`,
);
const rowsAfter = Number(psql("SELECT count(*) FROM public.class_session_materials;"));
check(
  rowsAfter === before.rows + 1,
  `E-2b  and THE ROW EXISTS — class_session_materials moved ${before.rows} -> ${rowsAfter}`,
);
const storedType = psql(
  `SELECT media_type || '|' || byte_size FROM public.class_session_materials WHERE id = '${MATERIAL_ID}';`,
);
check(
  storedType === `application/pdf|${BYTES.byteLength}`,
  `E-2c  ⛔ AND THE TYPE AND SIZE WERE READ OFF THE STORED OBJECT, not taken from the caller: the row carries "${storedType}" against an actual ${BYTES.byteLength}-byte upload`,
);

const auditAfterAttach = Number(psql("SELECT count(*) FROM public.audit_events;"));
check(
  auditAfterAttach === before.audit + 1,
  `E-3   ⛔ EXACTLY ONE AUDIT EVENT FIRED (${before.audit} -> ${auditAfterAttach}) — one governed action, one event (A-029)`,
);
const attachAction = psql(
  "SELECT action FROM public.audit_events ORDER BY occurred_at DESC, id DESC LIMIT 1;",
);
check(
  attachAction === "material.attached",
  `E-3b  and it is the RATIFIED STRING — "${attachAction}", not a name invented at the call site`,
);

// ---------------------------------------------------------------------
// E-4 -- THE READ PATH: a server-minted signed URL that actually fetches.
// ---------------------------------------------------------------------
const signed = await management.rpc("material_signed_path", { p_material_id: MATERIAL_ID });
check(
  !signed.error && signed.data?.o_object_path === OBJECT_PATH,
  `E-4   the governed read resolved the object path for the attached material${signed.error ? ` — ${signed.error.message}` : ""}`,
);
const url = await admin.storage.from("lesson-materials").createSignedUrl(OBJECT_PATH, 120);
const fetched = url.data?.signedUrl ? await fetch(url.data.signedUrl) : null;
check(
  fetched?.ok === true && (await fetched.arrayBuffer()).byteLength === BYTES.byteLength,
  `E-4b  ⛔ AND THE SIGNED URL ACTUALLY RETURNS THE BYTES (${fetched?.status}) — the round trip is proved, not assumed from a URL being produced`,
);
const auditAfterRead = Number(psql("SELECT count(*) FROM public.audit_events;"));
check(
  auditAfterRead === auditAfterAttach,
  `E-4c  ⛔ AND THE READ EMITTED NOTHING (${auditAfterAttach} -> ${auditAfterRead}) — a read is not a governed action (A-029, the PLM-7 precedent)`,
);

// ---------------------------------------------------------------------
// E-5 -- REMOVAL WORKS: row gone, audit fired, object deletable.
// ---------------------------------------------------------------------
const removed = await management.rpc("material_remove", { p_material_id: MATERIAL_ID });
check(
  !removed.error && removed.data?.o_removed === true && removed.data?.o_object_path === OBJECT_PATH,
  `E-5   ⛔ THE GOVERNED REMOVAL SUCCEEDED and RETURNED THE OBJECT PATH${removed.error ? ` — ${removed.error.message}` : ""} — the row-and-audit deletion commits FIRST, and the path is what lets the object be cleaned up after`,
);
const rowsAfterRemove = Number(psql("SELECT count(*) FROM public.class_session_materials;"));
const auditAfterRemove = Number(psql("SELECT count(*) FROM public.audit_events;"));
check(
  rowsAfterRemove === before.rows,
  `E-5b  the row is GONE — class_session_materials back to ${rowsAfterRemove}`,
);
check(
  auditAfterRemove === auditAfterAttach + 1 &&
    psql("SELECT action FROM public.audit_events ORDER BY occurred_at DESC, id DESC LIMIT 1;") ===
      "material.removed",
  `E-5c  and a SECOND audit event fired carrying the ratified "material.removed" (${auditAfterAttach} -> ${auditAfterRemove})`,
);

const cleanup = await admin.storage.from("lesson-materials").remove([OBJECT_PATH]);
const objectsFinal = Number(
  psql("SELECT count(*) FROM storage.objects WHERE bucket_id='lesson-materials';"),
);
check(
  !cleanup.error && objectsFinal === before.objects,
  `E-5d  ⛔ AND THE OBJECT IS DELETABLE BY THE ELEVATED CLIENT — the bucket carries an INSERT policy and NO DELETE policy, so this is the only path, and it is exactly what the transport does after a successful remove. storage.objects back to ${objectsFinal}`,
);

// ---------------------------------------------------------------------
// E-6 -- THE DATABASE IS LEFT EXACTLY AS IT WAS FOUND.
// ---------------------------------------------------------------------
check(
  rowsAfterRemove === before.rows && objectsFinal === before.objects,
  `E-6   ⛔ THE FIXTURE IS UNMOVED on rows and objects (${before.rows}/${before.objects}). ⚠️ audit_events is DELIBERATELY NOT restored — it is append-only and hash-chained, and a proof that could unwind it would be a proof that the chain does not hold (${before.audit} -> ${auditAfterRemove}, +2 for two real governed actions)`,
);

console.log(`\nRESULT: ${failures === 0 ? "PASS" : "FAIL"}  (${failures} failed check${failures === 1 ? "" : "s"})`);
process.exit(failures === 0 ? 0 : 1);
