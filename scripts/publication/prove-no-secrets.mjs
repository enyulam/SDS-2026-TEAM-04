#!/usr/bin/env node
/**
 * PRE-PUBLICATION SECRET SCAN — the gate on `git push`.
 * =====================================================================
 * ⛔ ANY FINDING BLOCKS THE PUSH. There is no severity ladder here and no
 *    "probably fine": a credential in a pushed commit is unrecallable, and
 *    deleting the branch afterwards does not unpublish it.
 *
 * ⚠️ THIS SCANNER HAS NEVER EXISTED IN THIS REPOSITORY. The one used for
 *    the demonstration push lived in the other workspace, so there is no
 *    prior instrument to re-run and nothing to inherit confidence from.
 *    ▶ **The control therefore carries the whole weight.**
 *
 * =====================================================================
 * WHY IT IS SHAPED LIKE THIS — the false-CLEAN failure, in this project
 * =====================================================================
 * A history search here once DIED UNNOTICED and its silence was read as
 * "no match". ▶ **A scan that cannot distinguish "found nothing" from
 * "did not run" is not a scan.** So:
 *
 *   . EVERY git invocation's exit code is interpreted, not ignored. For a
 *     search, exit 1 means NO MATCH and exit 0 means MATCH; ⛔ **anything
 *     else means DID NOT RUN and blocks**, exactly as a finding would.
 *   . The COMMIT COUNT and the BLOB COUNT are reported. A scan that dies
 *     halfway cannot report clean, because the counts would not add up and
 *     a zero count is itself a failure.
 *   . THE DETECTOR IS PROVEN TO FIRE, twice, on both passes:
 *       - a planted secret in the WORKING TREE must be found, then removed;
 *       - a planted secret in a SCRATCH COMMIT must be found, then the
 *         commit discarded.
 *     ⛔ **A detector never seen to fire is not a detector.**
 *
 * ⚠️ THE SCRATCH COMMIT NEVER TOUCHES `develop`. It is built with
 *    plumbing (`hash-object` / `commit-tree`) under a TEMPORARY REF and
 *    the ref is deleted afterwards, so the branch is never moved and no
 *    `reset` is needed. `CLAUDE.md` §12 bars history-touching operations
 *    on a working tree that holds work; creating and deleting a temp ref
 *    touches neither the tree nor the branch.
 *
 * =====================================================================
 * ⛔ NO CREDENTIAL IS EVER PRINTED, BY ANY PATH
 * =====================================================================
 * Live values are read from `.env.local` INTO PROCESS MEMORY ONLY. They
 * are never echoed, never written to a file, never interpolated into an
 * error and never included in a finding. A finding names the FILE, the
 * COMMIT and the KIND of match — never the matched text.
 * ⚠️ This project has already had one filtering-after-the-fact failure;
 *    the discipline is that the credential-bearing string never reaches a
 *    stream in the first place.
 *
 * Run: npm run prove:no-secrets
 */

import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, unlinkSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const BRANCH = "develop";

let blocked = 0;
const findings = [];
const say = (m) => process.stdout.write(`${m}\n`);
const check = (ok, msg) => {
  if (!ok) blocked++;
  say(`${ok ? "PASS  " : "BLOCK "} ${msg}`);
};

/**
 * ⛔ EXIT CODES ARE INTERPRETED, NEVER ASSUMED. `status === null` means the
 * process never started or was killed by a signal — the exact shape of the
 * failure that once read as "clean".
 */
function git(args, opts = {}) {
  const r = spawnSync("git", args, {
    cwd: ROOT, encoding: "latin1", shell: false, windowsHide: true,
    maxBuffer: 512 * 1024 * 1024, ...opts,
  });
  if (r.error || r.status === null) {
    say(`BLOCK  git ${args[0]} DID NOT RUN (${r.error?.code ?? "killed"}) — a scan that did not run is not a clean scan`);
    process.exit(2);
  }
  return r;
}

// =====================================================================
// 1. THE NEEDLES.
// =====================================================================

/**
 * Live values, read into memory only. Anything shorter than 20 characters
 * is dropped: a short value produces false positives on ordinary text, and
 * a false positive that blocks a push teaches people to bypass the gate.
 */
function loadLiveSecrets() {
  const p = join(ROOT, ".env.local");
  if (!existsSync(p)) return [];
  const out = [];
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = /^([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line.trim());
    if (!m) continue;
    const name = m[1];
    const value = m[2].replace(/^["']|["']$/g, "");
    if (value.length >= 20) out.push({ name, value });
  }
  return out;
}

/**
 * ⛔ NOT EVERY VALUE IN `.env.local` IS A CREDENTIAL, AND TREATING THEM ALIKE
 *    MAKES THE GATE USELESS.
 *
 * The first run of this scanner blocked on 65 exact-containment findings and
 * EVERY ONE was a Supabase PROJECT REF or a LOOPBACK URL — values that are
 * public by construction: a project ref IS the subdomain of the API URL every
 * browser request already carries, and `NEXT_PUBLIC_*` is browser-visible by
 * definition. ▶ **A gate that is permanently red is a gate people learn to
 * bypass**, which is strictly worse than no gate at all.
 *
 * ⚠️ SO THEY ARE CLASSIFIED, NOT DROPPED. An IDENTIFIER hit is still counted,
 *    still listed and still reported — it is the Operator's call, not mine —
 *    but it is reported as what it is, separately from a credential, so a
 *    real key can never hide inside a crowd of benign matches.
 */
const IDENTIFIER_VARS = new Set([
  "BEST_COACH_HOSTED_PROJECT_REF", // 20-char ref; the subdomain of a public URL
  "NEXT_PUBLIC_SUPABASE_URL", // NEXT_PUBLIC_* is browser-visible by design
  "BEST_COACH_HOSTED_SUPABASE_URL", // likewise a public https://<ref>.supabase.co
]);

const LIVE = loadLiveSecrets();

/**
 * ⛔ NAMED, NOT DEMONSTRATED: the ROTATED value.
 *
 * `BEST_COACH_HOSTED_DB_URL`'s password was rotated after an exposure. The
 * PREVIOUS value is not in my record and is not derivable — it exists only
 * wherever the Operator holds it. ▶ **So this scan covers the CURRENT
 * secrets exactly and the OLD one only by SHAPE** (the `postgres://user:pass@`
 * pattern below, which matches any password, old or new).
 * ⚠️ Stated rather than implied: exact-containment coverage of the rotated
 * value is NOT claimed, and a `CLEAN` result must be read with that limit.
 */
const ROTATED_VALUE_AVAILABLE = false;

const SHAPES = [
  ["JWT (three dot-separated base64url segments)", /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/],
  ["Supabase secret key", /\bsb_secret_[A-Za-z0-9_-]{20,}/],
  ["Supabase publishable key", /\bsb_publishable_[A-Za-z0-9_-]{20,}/],
  ["OpenAI / Anthropic style key", /\bsk-(ant-)?[A-Za-z0-9_-]{24,}/],
  ["GitHub personal access token", /\b(ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{22,})/],
  ["AWS access key id", /\bAKIA[0-9A-Z]{16}\b/],
  ["Postgres URL carrying a password", /\bpostgres(ql)?:\/\/[^\s:/@]+:[^\s@]{6,}@/],
  ["PEM private key block", /-----BEGIN (?:[A-Z ]+ )?PRIVATE KEY-----/],
  ["Supabase legacy service_role key literal", /"?service_role"?\s*[:=]\s*["'][A-Za-z0-9._-]{30,}["']/],
];

/**
 * ⚠️ `.env.example` is TRACKED ON PURPOSE and holds placeholders. It is
 * excluded from SHAPE matching only — exact-containment against the live
 * values still runs on it, because a real value pasted into the example
 * file is precisely the mistake this gate exists to catch.
 */
/**
 * ⚠️ TWO MORE FILES HOLD DELIBERATE KEY-SHAPED LITERALS, and they were already
 * adjudicated a TRUE NEGATIVE by `docs/plan/DEPLOYMENT_GATE_PACKET.md`:
 * `run-runtime-profile.mjs` declares `sb_publishable_synthetic_shape_fixture`
 * and a matching `SECRET_SHAPED` constant so the runtime classifier can be
 * TESTED against a key shape without a key existing. Exempting them from SHAPE
 * matching is not a weakening — exact containment against the live values still
 * runs on them, and that is the check which would catch a real key pasted in.
 */
const SHAPE_EXEMPT = new Set([
  ".env.example",
  "scripts/publication/prove-no-secrets.mjs",
  "scripts/tests/config/run-runtime-profile.mjs",
  "docs/plan/DEPLOYMENT_GATE_PACKET.md",
]);

function scanText(text, path) {
  const hits = [];
  for (const { name, value } of LIVE) {
    if (text.includes(value)) {
      hits.push({
        kind: `LIVE VALUE of ${name}`,
        cls: IDENTIFIER_VARS.has(name) ? "IDENTIFIER" : "CREDENTIAL",
      });
    }
  }
  if (!SHAPE_EXEMPT.has(path)) {
    for (const [label, re] of SHAPES) if (re.test(text)) hits.push({ kind: label, cls: "CREDENTIAL" });
  }
  return hits;
}

say(`Live values loaded into memory for exact containment: ${LIVE.length} (names only: ${LIVE.map((l) => l.name).join(", ")})`);
say(`Shape patterns: ${SHAPES.length}`);
say(
  ROTATED_VALUE_AVAILABLE
    ? "Rotated BEST_COACH_HOSTED_DB_URL password: covered by exact containment."
    : "⚠️ Rotated BEST_COACH_HOSTED_DB_URL password: NOT held by this session. Covered by SHAPE only — exact-containment coverage is NOT claimed.",
);
say("");

// =====================================================================
// 2. WORKING TREE — tracked files, because those are what a push carries.
// =====================================================================
const lsFiles = git(["ls-files", "-z"]);
check(lsFiles.status === 0, `git ls-files exited 0 (${lsFiles.status})`);
const tracked = lsFiles.stdout.split("\0").filter(Boolean);
check(tracked.length > 0, `the working tree enumerated ${tracked.length} tracked files — a zero count would itself be a failure`);

check(
  !tracked.some((f) => /(^|\/)\.env($|\.)/.test(f) && f !== ".env.example"),
  "no `.env` file is tracked except `.env.example`",
);
const ignored = git(["check-ignore", "-q", ".env.local"]);
check(ignored.status === 0, `.env.local is still gitignored (check-ignore exit ${ignored.status}; 0 = ignored)`);

let treeBytes = 0;
for (const f of tracked) {
  const full = join(ROOT, f);
  if (!existsSync(full)) continue;
  const buf = readFileSync(full);
  treeBytes += buf.length;
  const hits = scanText(buf.toString("latin1"), f.replace(/\\/g, "/"));
  for (const h of hits) findings.push({ where: `working tree: ${f}`, kind: h.kind, cls: h.cls });
}
check(treeBytes > 0, `working-tree pass read ${tracked.length} files / ${Math.round(treeBytes / 1024)} KB`);

// =====================================================================
// 3. HISTORY — every blob reachable from `develop`.
// =====================================================================
const revList = git(["rev-list", BRANCH]);
check(revList.status === 0, `git rev-list ${BRANCH} exited 0 (${revList.status})`);
const commits = revList.stdout.split(/\r?\n/).filter(Boolean);
check(commits.length > 0, `history enumerated ${commits.length} commits reachable from ${BRANCH}`);

const objects = git(["rev-list", "--objects", BRANCH]);
check(objects.status === 0, `git rev-list --objects exited 0 (${objects.status})`);
const shaList = objects.stdout.split(/\r?\n/).filter(Boolean).map((l) => l.split(" ")[0]);

const typeCheck = git(["cat-file", "--batch-check=%(objectname) %(objecttype)"], {
  input: shaList.join("\n") + "\n",
});
check(typeCheck.status === 0, `git cat-file --batch-check exited 0 (${typeCheck.status})`);
const blobs = typeCheck.stdout.split(/\r?\n/).filter((l) => l.endsWith(" blob")).map((l) => l.split(" ")[0]);
check(blobs.length > 0, `history enumerated ${blobs.length} blobs — a zero count would mean the pass DID NOT RUN`);

/**
 * ⛔ THE INSTRUMENT DEFECT THE FIRST RUN EXPOSED, FIXED HERE.
 *
 * `scanBlobs` called `scanText(content, "")`, so `SHAPE_EXEMPT` could NEVER
 * match during the history pass: the two files whose entire purpose is to hold
 * a key SHAPE were exempt in the working tree and scanned in history, and they
 * duly appeared as 13 "findings". ▶ **A rule applied on one pass and not the
 * other is not a rule** — it is the same family as a leg whose name and
 * measurement disagree. The path now travels with the blob, taken from
 * `rev-list --objects`, which already emits `<sha> <path>`.
 */
const BLOB_PATHS = new Map();
for (const line of objects.stdout.split(/\r?\n/).filter(Boolean)) {
  const sp = line.indexOf(" ");
  if (sp > 0) BLOB_PATHS.set(line.slice(0, sp), line.slice(sp + 1).replace(/\\/g, "/"));
}
check(
  BLOB_PATHS.size > 0 && [...BLOB_PATHS.values()].some((p) => p === "scripts/tests/config/run-runtime-profile.mjs"),
  `blob→path map built for ${BLOB_PATHS.size} objects, and it resolves a known path — so SHAPE_EXEMPT can actually match in the history pass`,
);

/** Stream blob contents in batches; a short read is a failure, not a clean. */
function scanBlobs(shas, label) {
  let bytes = 0;
  let seen = 0;
  const BATCH = 400;
  for (let i = 0; i < shas.length; i += BATCH) {
    const slice = shas.slice(i, i + BATCH);
    const r = git(["cat-file", "--batch"], { input: slice.join("\n") + "\n" });
    if (r.status !== 0) {
      say(`BLOCK  git cat-file --batch exited ${r.status} on batch ${i} — DID NOT RUN`);
      process.exit(2);
    }
    const out = r.stdout;
    let pos = 0;
    while (pos < out.length) {
      const nl = out.indexOf("\n", pos);
      if (nl < 0) break;
      const header = out.slice(pos, nl);
      const parts = header.split(" ");
      if (parts.length < 3) break;
      const size = Number(parts[2]);
      const start = nl + 1;
      const content = out.slice(start, start + size);
      bytes += content.length;
      seen += 1;
      const blobPath = BLOB_PATHS.get(parts[0]) ?? "";
      for (const h of scanText(content, blobPath)) {
        findings.push({
          where: `${label}: ${blobPath || `blob ${parts[0].slice(0, 12)}`}`,
          kind: h.kind,
          cls: h.cls,
        });
      }
      pos = start + size + 1;
    }
  }
  return { bytes, seen };
}

const hist = scanBlobs(blobs, "history");
check(
  hist.seen === blobs.length,
  `history pass read ALL ${blobs.length} blobs (${hist.seen} parsed, ${Math.round(hist.bytes / 1024 / 1024)} MB) — a short read blocks rather than reporting clean`,
);

// =====================================================================
// 4. ⛔ THE CONTROLS. A detector never seen to fire is not a detector.
// =====================================================================
say("");
const PLANT = "sb_secret_ZZPLANTEDCONTROLVALUEONLY0123456789";

// 4a. WORKING TREE.
const probeFile = join(ROOT, "_secret_scan_control.tmp.txt");
writeFileSync(probeFile, `token = ${PLANT}\n`, "utf8");
const treeControl = scanText(readFileSync(probeFile, "latin1"), "_secret_scan_control.tmp.txt");
unlinkSync(probeFile);
check(
  treeControl.length > 0,
  `CONTROL (working tree): the detector FIRED on a planted secret (${treeControl.map((h) => h.kind).join(", ")}), and the probe file was removed`,
);
check(!existsSync(probeFile), "the working-tree probe file no longer exists");

// 4b. HISTORY — a scratch commit under a TEMPORARY REF. `develop` never moves.
const TMP_REF = "refs/heads/_secret_scan_control";
const blobSha = git(["hash-object", "-w", "--stdin"], { input: `password = ${PLANT}\n` }).stdout.trim();
const mkTree = git(["mktree"], { input: `100644 blob ${blobSha}\tplanted.txt\n` });
check(mkTree.status === 0, `git mktree exited 0 (${mkTree.status})`);
const treeSha = mkTree.stdout.trim();
const commitSha = git(["commit-tree", treeSha, "-m", "scan control (temporary, never on develop)"]).stdout.trim();
git(["update-ref", TMP_REF, commitSha]);

const ctrlObjects = git(["rev-list", "--objects", TMP_REF]);
const ctrlShas = ctrlObjects.stdout.split(/\r?\n/).filter(Boolean).map((l) => l.split(" ")[0]);
const ctrlTypes = git(["cat-file", "--batch-check=%(objectname) %(objecttype)"], { input: ctrlShas.join("\n") + "\n" });
const ctrlBlobs = ctrlTypes.stdout.split(/\r?\n/).filter((l) => l.endsWith(" blob")).map((l) => l.split(" ")[0]);

const controlFindings = [];
{
  const before = findings.length;
  scanBlobs(ctrlBlobs, "CONTROL");
  while (findings.length > before) controlFindings.push(findings.pop());
}
git(["update-ref", "-d", TMP_REF]);

check(
  controlFindings.length > 0,
  `CONTROL (history): the SAME history pass FIRED on a planted secret in a scratch commit (${controlFindings[0]?.kind ?? "—"})`,
);
check(
  git(["rev-parse", "--verify", "--quiet", TMP_REF]).status !== 0,
  "the scratch ref was DELETED — `develop` was never moved and no reset was needed",
);
check(
  git(["rev-parse", BRANCH]).stdout.trim() === git(["rev-parse", "HEAD"]).stdout.trim(),
  "`develop` still points at HEAD — the controls moved no branch",
);

// =====================================================================
// 5. VERDICT.
// =====================================================================
say("");
say(`Commits scanned: ${commits.length}`);
say(`Blobs scanned  : ${blobs.length} (${Math.round(hist.bytes / 1024 / 1024)} MB)`);
say(`Tracked files  : ${tracked.length} (${Math.round(treeBytes / 1024)} KB)`);
say("");

const credential = findings.filter((f) => f.cls === "CREDENTIAL");
const identifier = findings.filter((f) => f.cls === "IDENTIFIER");

const distinct = (list) => {
  const seen = new Map();
  for (const f of list) {
    const key = `${f.where}|${f.kind}`;
    if (!seen.has(key)) seen.set(key, f);
  }
  return [...seen.values()];
};

if (credential.length > 0) {
  say(`BLOCK  ${credential.length} CREDENTIAL FINDING(S) — HARD BLOCK. Matched text is NEVER printed.`);
  for (const f of distinct(credential)) say(`         ${f.where} — ${f.kind}`);
  blocked++;
} else {
  say("PASS   ZERO CREDENTIAL findings — no secret key, publishable key, API key, JWT, DB password,");
  say("       PEM block, PAT or AWS key id, in the working tree or in ANY blob reachable from develop");
}

if (identifier.length > 0) {
  const d = distinct(identifier);
  say("");
  say(`⚠️ ${identifier.length} IDENTIFIER occurrence(s) across ${d.length} distinct location(s) — REPORTED, NOT a credential.`);
  say("   A Supabase project ref IS the subdomain of a public API URL, and a NEXT_PUBLIC_* value is");
  say("   browser-visible by design. ⛔ Listed because the disposition is the Operator's, not mine.");
  const byKind = new Map();
  for (const f of d) byKind.set(f.kind, (byKind.get(f.kind) ?? 0) + 1);
  for (const [k, n] of [...byKind]) say(`         ${k} — ${n} distinct location(s)`);
  // ⚠️ THE PATH IS NAMED, THE VALUE NEVER IS. A location the Operator cannot
  // see is a finding they cannot disposition, and "9 locations" with no names
  // is exactly the shape of a report that gets waved through.
  say("       locations:");
  for (const f of d) say(`         · ${f.where}`);
}

say("");
if (blocked > 0) {
  say("RESULT: BLOCKED — the push does not proceed.");
} else if (identifier.length > 0) {
  say("RESULT: CLEAN OF CREDENTIALS — identifiers present and listed above for Operator disposition.");
} else {
  say("RESULT: CLEAN — the push gate is satisfied.");
}
if (!ROTATED_VALUE_AVAILABLE) {
  say("⚠️ LIMIT, STATED: the rotated BEST_COACH_HOSTED_DB_URL password was covered by SHAPE only.");
}
process.exit(blocked === 0 ? 0 : 1);
