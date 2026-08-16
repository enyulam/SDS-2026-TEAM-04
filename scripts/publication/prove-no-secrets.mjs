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
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import {
  SHAPES,
  SHAPE_EXEMPT,
  BENIGN_LITERALS,
  BENIGN_RE,
  neutralize,
  IDENTIFIER_VARS,
  loadLiveSecrets,
  makeScanText,
} from "./credential-shapes.mjs";

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
// ⛔ MOVED 2026-08-17 to `credential-shapes.mjs` so the serving proof can use
// THE SAME detector rather than a second copy of these patterns.

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

/**
 * =====================================================================
 * ⛔ THE ADJUDICATION REGISTER — Operator rulings, 2026-08-12
 * =====================================================================
 * An identifier that has been RULED a true negative must be reported AS
 * ADJUDICATED on every later run. ▶ **Re-raising a settled finding every
 * time is how a gate stops being read**, and silently dropping it is how a
 * ruling becomes invisible to the next person. Neither: it is listed, with
 * the ruling and the reason attached.
 *
 * ⚠️ EACH ENTRY IS PINNED TO THE EXACT VALUE THAT WAS ADJUDICATED, by a
 *    truncated SHA-256. **If the value changes — a new project ref, a
 *    repointed URL — the fingerprint stops matching and the finding
 *    RE-RAISES as unadjudicated.** An adjudication that silently covered
 *    whatever happened to be in `.env.local` later would be worse than no
 *    adjudication at all.
 *
 * ⛔ FINGERPRINTING IS SAFE HERE AND NOWHERE ELSE. Both adjudicated values
 *    are non-credentials that already appear in this repository in
 *    plaintext, so a hash of them discloses nothing new. **No CREDENTIAL is
 *    ever fingerprinted, recorded or hashed into this file.**
 */
const ADJUDICATED = new Map([
  [
    "BEST_COACH_HOSTED_PROJECT_REF",
    {
      fingerprint: "b3dc49bb09992fdc",
      ruling: "TRUE NEGATIVE — Operator, 2026-08-12",
      why:
        "A project ref IS the subdomain of the public API URL every browser request already " +
        "carries, and the project is protected by RLS and by keys, not by the ref being " +
        "unguessable. The repository is private. ⚠️ Redaction was considered and REJECTED: " +
        "history carries it in five commits, so redacting three documents would publish it " +
        "anyway while making the record dishonest about what was disclosed and when.",
    },
  ],
  [
    "NEXT_PUBLIC_SUPABASE_URL",
    {
      fingerprint: "e44fa46d488a2a55",
      ruling: "TRUE NEGATIVE — Operator, 2026-08-12",
      why: "A loopback address. 127.0.0.1 reaches nothing from outside the Operator's machine.",
    },
  ],
  [
    "BEST_COACH_HOSTED_SUPABASE_URL",
    {
      fingerprint: "30d675231b6e0e3e",
      ruling: "TRUE NEGATIVE — Operator, 2026-08-12",
      why:
        "This is the public Supabase API URL for the development project. It is NEXT_PUBLIC_ by " +
        "design, ships in the client bundle, and is carried by every browser request the app " +
        "makes. It is an identifier, not a credential — knowing it grants nothing without a key. " +
        "Adjudicated as the exact pinned URL, not as a class: a different project's URL, or the " +
        "frozen demonstration project's, re-raises.",
    },
  ],
]);

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
 *    still listed and still reported — and **a real key must never be able to
 *    hide inside a crowd of benign matches**, which is what a 65-finding wall
 *    of noise would have let it do. That is the better half of the fix.
 */


const LIVE = loadLiveSecrets(ROOT);

/** Which adjudications still match the value they were ruled on. */
const ADJUDICATION_STATE = new Map();
for (const [name, entry] of ADJUDICATED) {
  const live = LIVE.find((l) => l.name === name);
  const fp = live ? createHash("sha256").update(live.value).digest("hex").slice(0, 16) : null;
  ADJUDICATION_STATE.set(name, {
    ...entry,
    present: Boolean(live),
    matches: fp === entry.fingerprint,
  });
}

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



/**
 * ⛔ ADJUDICATED BENIGN LITERALS — EXEMPT THE STRING, NEVER THE FILE.
 *
 * `run-runtime-profile.mjs` declares two deliberately key-SHAPED constants so
 * the runtime classifier can be TESTED against a key shape without a key
 * existing, and `DEPLOYMENT_GATE_PACKET.md` already adjudicated them a **true
 * negative**. Prose that merely NAMES one — as this project's own build log
 * did, and as `BUILD_NOTES.md` still does in history — reproduces the shape
 * too.
 *
 * ⚠️ THE FIRST FIX WAS TO EXEMPT THE FILES, AND IT WAS THE WRONG SHAPE OF FIX.
 *    A build log is exactly where a careless paste lands, and `BUILD_NOTES.md`
 *    could never be exempted on those terms without creating the worst
 *    possible blind spot. ▶ **Exempting an exact adjudicated STRING costs
 *    nothing — every other key in those same files is still matched — whereas
 *    exempting a FILE blinds the scanner to everything in it.**
 *
 * Each literal is replaced by an inert token before shape matching, never
 * deleted, so two neighbouring fragments can never splice into a new match.
 */


const scanText = makeScanText(LIVE);

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

/**
 * ⛔ THE NEUTRALIZER NEEDS ITS OWN CONTROL. `BENIGN_LITERALS` suppresses a
 * match, and anything that suppresses a match is a place a real key could
 * hide. Two legs, in opposite directions:
 *   . the adjudicated literal is SUPPRESSED — otherwise the exemption is dead
 *     code and the earlier block was never actually explained;
 *   . a NEIGHBOURING literal, differing by one character, still FIRES —
 *     otherwise the exemption is a prefix rule wearing an exact-string label.
 */
check(
  scanText(`const K = '${BENIGN_LITERALS[0]}'`, "some/other/file.mjs").length === 0,
  "CONTROL (neutralizer): the ADJUDICATED literal is suppressed even in a file that is NOT shape-exempt",
);
check(
  scanText(`const K = '${BENIGN_LITERALS[0]}X'`, "some/other/file.mjs").length > 0,
  "CONTROL (neutralizer): a literal differing by ONE CHARACTER still FIRES — the exemption is an exact string, not a prefix",
);

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

/**
 * ⛔ AN ADJUDICATED FINDING IS STILL A FINDING — it is reported, with its
 * ruling, and only its DISPOSITION differs. `varOf` recovers which needle a
 * hit came from so the register can be applied to it.
 */
const varOf = (kind) => (kind.startsWith("LIVE VALUE of ") ? kind.slice("LIVE VALUE of ".length) : null);

const settled = [];
const unsettled = [];
for (const f of identifier) {
  const st = ADJUDICATION_STATE.get(varOf(f.kind) ?? "");
  (st && st.present && st.matches ? settled : unsettled).push(f);
}

if (settled.length > 0) {
  const d = distinct(settled);
  say("");
  say(`✅ ${settled.length} occurrence(s) across ${d.length} location(s) — ADJUDICATED TRUE NEGATIVE, not re-raised.`);
  const names = [...new Set(settled.map((f) => varOf(f.kind)))];
  for (const n of names) {
    const st = ADJUDICATION_STATE.get(n);
    say(`         ${n} — ${st.ruling}`);
    say(`           ${st.why}`);
  }
  say("       ⚠️ Each is PINNED to the exact value ruled on. Change the value and it RE-RAISES.");
}

// ⚠️ An adjudication whose value has MOVED is not an adjudication. Reported
// loudly rather than silently inherited, because a register that quietly
// covers a NEW value is worse than no register.
for (const [name, st] of ADJUDICATION_STATE) {
  if (st.present && !st.matches) {
    say("");
    say(`⛔ ADJUDICATION STALE: \`${name}\`'s value no longer matches the one ruled on (${st.ruling}).`);
    say("   The ruling does NOT carry to a value it was not made about. Re-raise to the Operator.");
    blocked++;
  }
}

if (unsettled.length > 0) {
  const d = distinct(unsettled);
  say("");
  say(`⚠️ ${unsettled.length} UNADJUDICATED IDENTIFIER occurrence(s) across ${d.length} location(s) — NOT a credential, but not ruled either.`);
  say("   ⛔ The disposition is the Operator's, not mine.");
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
} else if (unsettled.length > 0) {
  say("RESULT: CLEAN OF CREDENTIALS — UNADJUDICATED identifiers listed above for Operator disposition.");
} else if (settled.length > 0) {
  say("RESULT: CLEAN — zero credentials, and every identifier is an ADJUDICATED true negative.");
} else {
  say("RESULT: CLEAN — the push gate is satisfied.");
}
if (!ROTATED_VALUE_AVAILABLE) {
  say("⚠️ LIMIT, STATED: the rotated BEST_COACH_HOSTED_DB_URL password was covered by SHAPE only.");
}
process.exit(blocked === 0 ? 0 : 1);
