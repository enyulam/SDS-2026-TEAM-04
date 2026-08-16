/*
 * ⛔ ARE THE GENERATED DATABASE TYPES CURRENT?
 *
 * Operator ruling, 2026-08-16: *"Add a check that the generated types are
 * current: regenerate, diff, fail on drift. A stale authoritative artefact is
 * worse than none."*
 *
 * ⚠️ WHY IT EXISTS, MEASURED NOT SUPPOSED. `server/db/database.types.ts` is
 * named by `ADR-8` as *"authoritative for application data types"*, and on
 * 2026-08-16 it did not know the `terms` table, `class_sessions.lesson_title`,
 * `.room` or `.lesson_number` — all added at `P2-2`/`P2-6`, three phases and
 * two months earlier. ▶ Nothing regenerated it and nothing checked it, so the
 * artefact the contract calls authoritative was silently describing a schema
 * that no longer existed.
 *
 * ⛔ EVERY VERDICT FROM AN EXIT CODE. A stack that is unreachable is `NOT-RUN`
 * (exit 2), never a pass — an absent generator cannot prove agreement.
 */
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";

const TARGET = "server/db/database.types.ts";

function run(cmd, args) {
  return new Promise((done) => {
    const p = spawn(cmd, args, {
      stdio: ["ignore", "pipe", "pipe"],
      shell: process.platform === "win32",
    });
    let out = "";
    let err = "";
    p.stdout.on("data", (d) => (out += d));
    p.stderr.on("data", (d) => (err += d));
    p.on("close", (code) => done({ code, out, err }));
  });
}

const gen = await run("npx", ["supabase", "gen", "types", "typescript", "--local"]);

if (gen.code !== 0 || gen.out.length < 2000) {
  console.log("NOT-RUN  the local stack did not produce types");
  console.log(`         exit ${gen.code}, ${gen.out.length} bytes`);
  console.log("         ⛔ NOT A PASS — an absent generator cannot prove agreement");
  process.exit(2);
}

/*
 * ⚠️ NON-VACUITY BEFORE COMPARISON. If either side collapsed to nothing, an
 * "identical" verdict would mean "two empty things matched".
 */
const onDisk = readFileSync(TARGET, "utf8");
if (onDisk.length < 2000) {
  console.log(`NOT-RUN  ${TARGET} is ${onDisk.length} bytes — too small to compare`);
  process.exit(2);
}

/* Line endings are a checkout artefact on Windows, not schema drift. */
const norm = (s) => s.split("\r\n").join("\n").replace(/\s+$/, "");
const a = norm(onDisk);
const b = norm(gen.out);

/*
 * ⛔ THE DETECTOR MUST BE ABLE TO FIRE. A comparison that cannot come out
 * unequal is not a check — the same rule `PT-3b` was repaired under.
 */
if (norm(onDisk + "\nexport type __Drift = true;\n") === a) {
  console.log("NOT-RUN  the comparison cannot distinguish differing inputs");
  process.exit(2);
}

if (a === b) {
  console.log(`PASS     ${TARGET} matches the live schema (${a.length} chars compared)`);
  process.exit(0);
}

const al = a.split("\n");
const bl = b.split("\n");
let first = 0;
while (first < al.length && first < bl.length && al[first] === bl[first]) first += 1;

console.log(`FAIL     ${TARGET} IS STALE — regenerate it`);
console.log(`         on disk ${al.length} lines · live ${bl.length} lines`);
console.log(`         first difference at line ${first + 1}:`);
console.log(`           on disk: ${JSON.stringify(al[first] ?? "(end of file)")}`);
console.log(`           live   : ${JSON.stringify(bl[first] ?? "(end of file)")}`);
console.log("         ⛔ `ADR-8` calls this artefact authoritative; a stale one is worse than none");
process.exit(1);
