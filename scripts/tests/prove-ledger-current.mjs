/*
 * ⛔ DOES THE MIGRATION LEDGER MATCH THE MIGRATION FILES?
 *
 * Operator authorization, 2026-08-16: *"a ledger-vs-files check alongside
 * prove:types-current, failing on any divergence in either direction. Prove it
 * fires by planting a gap and by planting an orphan — the two directions are
 * different faults and a check that only catches one is half a gate."*
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⚠️ WHY IT EXISTS — MEASURED, AND IT RAN EIGHT TIMES UNNOTICED
 * ═══════════════════════════════════════════════════════════════════════════
 * `supabase_migrations.schema_migrations` held **38** rows against **46**
 * files. Every 2026-08-16 migration was applied by `docker exec … psql -f`
 * under `R-1` — and ⛔ **`psql` does not know that table exists.** The files
 * and the database agreed; the HISTORY silently diverged, and
 * `supabase migration up` re-ran eight live migrations and died.
 *
 * ⛔ **NOTHING IN THIS PROJECT READ THE LEDGER.** Every census assertion, every
 * suite and every gate measures the CATALOGUE. The database was right, all 24
 * portal suites were green, and the divergence was invisible to all of them.
 * ▶ **A RECORD NOTHING READS IS A RECORD THAT ROTS IN SILENCE** — the same
 * shape as the stale `database.types.ts`, one layer over. **Both were
 * authoritative artefacts consulted by nothing.**
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⛔ TWO DIRECTIONS, TWO DIFFERENT FAULTS
 * ═══════════════════════════════════════════════════════════════════════════
 *   GAP    file with no ledger row  -> applied outside the CLI, or not applied
 *                                      at all. `migration up` will re-run it.
 *   ORPHAN ledger row with no file  -> a migration was RECORDED that no longer
 *                                      exists. ⚠️ Strictly worse: it asserts a
 *                                      history that cannot be replayed, and a
 *                                      rebuild would silently skip it.
 * ▶ **A check that catches only one is half a gate**, so both are asserted
 * separately and each has its own planted control.
 *
 * ⛔ Exit code is the only verdict. An unreachable stack is NOT-RUN (exit 2),
 *    never a pass — an absent ledger cannot prove agreement.
 */
import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { resolveLocalTarget } from "../fixtures/local-target-guard.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const { dbContainer: DB_CONTAINER } = resolveLocalTarget();

let bad = 0;
const check = (ok, msg) => {
  if (!ok) bad += 1;
  console.log(`${ok ? "PASS" : "FAIL"}    ${msg}`);
};

const psql = (sql) =>
  (
    spawnSync(
      "docker",
      ["exec", "-i", DB_CONTAINER, "psql", "--no-psqlrc", "-U", "postgres", "-d", "postgres", "-tAX", "-c", sql],
      { encoding: "utf8" },
    ).stdout ?? ""
  ).trim();

const ledger = psql("SELECT version FROM supabase_migrations.schema_migrations ORDER BY version;")
  .split("\n")
  .map((s) => s.trim())
  .filter(Boolean);

const files = readdirSync(join(ROOT, "supabase", "migrations"))
  .filter((f) => f.endsWith(".sql"))
  .map((f) => (f.match(/^(\d+)_/) ?? [])[1])
  .filter(Boolean)
  .sort();

if (ledger.length === 0 || files.length === 0) {
  console.log(`NOT-RUN  ledger=${ledger.length} rows, files=${files.length} — the stack is unreachable or the tree is empty`);
  console.log("         ⛔ NOT A PASS: an absent ledger cannot prove agreement");
  process.exit(2);
}

/** The comparison, in both directions. Exported shape so the controls reuse it. */
const divergence = (ledgerSet, fileSet) => ({
  gaps: fileSet.filter((v) => !ledgerSet.includes(v)),
  orphans: ledgerSet.filter((v) => !fileSet.includes(v)),
});

// ---------------------------------------------------------------------
// PL-1 -- NON-VACUITY FIRST.
// ---------------------------------------------------------------------
check(
  ledger.length >= 20 && files.length >= 20,
  `PL-1  ⚠️ NON-VACUITY FIRST: ${ledger.length} ledger row(s) and ${files.length} migration file(s) — ▶ if either collapsed, PL-3/PL-4 would compare EMPTY SETS and report a green meaning "nothing exists to disagree"`,
);

// ---------------------------------------------------------------------
// PL-2 -- THE DETECTOR MUST FIRE IN BOTH DIRECTIONS. Two synthetic
//         controls, because a gap and an orphan are different faults.
// ---------------------------------------------------------------------
/*
 * ⛔ FIXED SYNTHETIC SETS, NOT SLICES OF THE LIVE ONES — and this was learned
 * the hard way in the same pass. The first draft built the controls from
 * `ledger`/`files` and used `29990101000000` as its orphan sentinel; planting a
 * REAL gap under that exact version made both controls go red alongside the
 * real finding. ▶ **A control derived from live state is polluted by the very
 * fault it exists to detect**, and a sentinel that can occur in reality is not
 * synthetic. These two sets are literals and cannot collide with anything.
 */
const CTRL_LEDGER = ["00000000000001", "00000000000002"];
const CTRL_FILES = ["00000000000001", "00000000000002"];
const gapControl = divergence(CTRL_LEDGER.slice(1), CTRL_FILES);
const orphanControl = divergence([...CTRL_LEDGER, "00000000000009"], CTRL_FILES);
check(
  gapControl.gaps.length === 1 && gapControl.orphans.length === 0,
  `PL-2a ⛔ CONTROL — GAP DIRECTION: removing one ledger row yields ${gapControl.gaps.length} gap and ${gapControl.orphans.length} orphan(s) — ▶ the detector can SEE a file with no ledger row`,
);
check(
  orphanControl.orphans.length === 1 && orphanControl.gaps.length === 0,
  `PL-2b ⛔ CONTROL — ORPHAN DIRECTION: adding one unbacked ledger row yields ${orphanControl.orphans.length} orphan and ${orphanControl.gaps.length} gap(s) — ▶ and it can SEE a recorded migration whose file is gone, which is the WORSE of the two: it asserts a history that cannot be replayed`,
);

// ---------------------------------------------------------------------
// PL-3 / PL-4 -- THE MEASUREMENT.
// ---------------------------------------------------------------------
const { gaps, orphans } = divergence(ledger, files);
check(
  gaps.length === 0,
  `PL-3  every migration FILE has a ledger row (${gaps.length} gap(s)${gaps.length ? ": " + gaps.join(", ") : ""}) — ⛔ a gap means it was applied outside the CLI (R-1 by \`psql\`) or not applied at all`,
);
check(
  orphans.length === 0,
  `PL-4  every LEDGER ROW has a migration file (${orphans.length} orphan(s)${orphans.length ? ": " + orphans.join(", ") : ""}) — ⛔ an orphan asserts a history that cannot be replayed`,
);

check(
  ledger.length === files.length,
  `PL-5  the two agree on COUNT as well as membership: ${ledger.length} ledger rows, ${files.length} files`,
);

console.log(
  `INFO    PL-6  ⚠️ STATED LIMIT: this compares VERSIONS, not CONTENT. A file edited after it was applied has a ledger row and a stale effect, and nothing here would see it — the migration's own apply-time assertions and \`prove:projection-columns\` cover that ground, not this gate.`,
);

console.log(`\nRESULT: ${bad === 0 ? "PASS" : "FAIL"}  (${bad} failed checks)`);
process.exit(bad === 0 ? 0 : 1);
