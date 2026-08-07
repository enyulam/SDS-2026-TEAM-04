/**
 * Authentication reference-fidelity assertions.
 *
 * The per-step implementation contract in `FRONTEND_RECONSTRUCTION_PLAN.md` §8 requires every
 * screen checkpoint to verify that the frozen `reference.png` it builds against still matches
 * the validated pack byte-for-byte before any comparison is trusted. This module automates
 * that check for the three authentication references so it is re-run mechanically at F3, F10
 * and F13 rather than performed by eye once.
 *
 * It reads the UI reference pack, which lives inside this repository at UI_REFERENCE_FINAL_MVP/
 * (moved in on 2026-08-08 — repository-boundary normalization, CLAUDE.md §9.1). If the
 * pack is not present the module reports that plainly and exits non-zero — it never silently
 * passes on a missing reference.
 *
 * Introduced at FRONTEND RECONSTRUCTION F3 and reused unchanged by F10 and F13.
 */

import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

/**
 * The pack is inside this repository, at the repository root.
 * The previous `"..", ".."` form resolved from a 48H worktree cwd; both worktrees were
 * physically removed on 2026-08-08, so that path had already been broken before the
 * repository-boundary normalization moved the pack in.
 */
const PACK_ROOT =
  process.env.BEST_COACH_UI_PACK ??
  resolve(process.cwd(), "UI_REFERENCE_FINAL_MVP");

/**
 * Values transcribed from `CORE_SCREENSHOT_VALIDATION_REPORT.md` §11 and each screen's
 * `screen.md` §3. These are the validated identities; a mismatch is a stop-and-report
 * condition, never something to work around.
 */
const AUTHENTICATION_REFERENCES = [
  {
    checkpoint: "F3",
    screenId: "AUTH-01",
    folder: "AUTH-01-trainer-login",
    figmaNode: "546:370",
    route: "/login?role=trainer",
    width: 1440,
    height: 1024,
    bytes: 95_496,
    sha256: "b1ad24e4f414ece90d7a1b091e516a44163f28856e7898a60db288f487a56da1",
  },
  {
    checkpoint: "F10",
    screenId: "AUTH-02",
    folder: "AUTH-02-management-login",
    figmaNode: "459:13",
    route: "/login?role=management",
    width: 1440,
    height: 1024,
    bytes: 95_584,
    sha256: "fcc3db9377a1b1175984bc90732c588e58bd05269d767af2ee69ed8d42668483",
  },
  {
    checkpoint: "F13",
    screenId: "AUTH-03",
    folder: "AUTH-03-parent-login",
    figmaNode: "546:413",
    route: "/login?role=parent",
    width: 1440,
    height: 1024,
    bytes: 95_425,
    sha256: "fcd4d4edcebadd20d6ebca43b181538631fe791fab06007a389120f56853b85c",
  },
] as const;

let failures = 0;

function check(condition: boolean, message: string): void {
  if (condition) {
    console.log(`  ok   ${message}`);
    return;
  }
  failures += 1;
  console.error(`  FAIL ${message}`);
}

/** Reads width and height from a PNG IHDR chunk without decoding the image. */
function readPngDimensions(bytes: Buffer): { width: number; height: number } {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (!bytes.subarray(0, 8).equals(signature)) {
    throw new Error("not a PNG: bad signature");
  }
  if (bytes.toString("ascii", 12, 16) !== "IHDR") {
    throw new Error("not a PNG: first chunk is not IHDR");
  }
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

console.log(`Authentication reference fidelity — pack: ${PACK_ROOT}`);

if (!existsSync(PACK_ROOT)) {
  console.error(
    `  FAIL the UI reference pack was not found at ${PACK_ROOT}. ` +
      `Set BEST_COACH_UI_PACK to its location. No reference comparison can be trusted without it.`,
  );
  process.exit(1);
}

for (const reference of AUTHENTICATION_REFERENCES) {
  console.log(
    `\n${reference.checkpoint} — ${reference.screenId} (${reference.figmaNode}) → ${reference.route}`,
  );

  const file = join(PACK_ROOT, reference.folder, "reference.png");
  if (!existsSync(file)) {
    failures += 1;
    console.error(`  FAIL ${reference.folder}/reference.png is missing`);
    continue;
  }

  const bytes = readFileSync(file);
  const sha256 = createHash("sha256").update(bytes).digest("hex");

  check(
    sha256 === reference.sha256,
    `SHA-256 matches the validated pack (${sha256.slice(0, 16)}…)`,
  );
  check(
    statSync(file).size === reference.bytes,
    `file size is ${reference.bytes} bytes`,
  );

  const dimensions = readPngDimensions(bytes);
  check(
    dimensions.width === reference.width && dimensions.height === reference.height,
    `native dimensions are ${reference.width} × ${reference.height} (read ${dimensions.width} × ${dimensions.height})`,
  );
  // A PNG ends with a 12-byte IEND chunk: 4-byte length, 4-byte type, 4-byte CRC.
  check(
    bytes.subarray(bytes.length - 12).toString("ascii", 4, 8) === "IEND",
    "the PNG terminates with a complete IEND chunk",
  );
}

/** The three login frames are distinct nodes and must never collapse into one image. */
console.log("\nThe three login references are distinct frames");
const digests = new Set(AUTHENTICATION_REFERENCES.map((reference) => reference.sha256));
check(
  digests.size === AUTHENTICATION_REFERENCES.length,
  "each authentication reference has a distinct SHA-256",
);
const nodes = new Set(AUTHENTICATION_REFERENCES.map((reference) => reference.figmaNode));
check(
  nodes.size === AUTHENTICATION_REFERENCES.length,
  "each authentication reference has a distinct Figma node",
);

console.log(
  failures === 0
    ? "\nAuthentication reference fidelity assertions passed."
    : `\nAuthentication reference fidelity assertions FAILED (${failures}).`,
);

process.exit(failures === 0 ? 0 : 1);
