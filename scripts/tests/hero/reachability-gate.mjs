// =====================================================================
// THE REACHABILITY GATE — a suite that passes while `tsc` fails is a
// FAILURE of that suite
// =====================================================================
// ⛔ WHY THIS EXISTS. `prove:hero-13` passed all seventeen legs against a
// file `tsc` rejected with six errors: an explanatory comment had been placed
// as `{/* … */}` directly inside a `? :` branch, where JSX permits a single
// expression and not a children-position comment. The strings it asserted
// were present WERE present — in a file that could not compile.
//
// ▶ **A PROOF THAT READS TEXT CANNOT TELL YOU THE TEXT IS REACHABLE.**
//
// ⚠️ It is the same family as the template-literal defect, and together they
// define it: THE INSTRUMENT AGREED WITH ITSELF WHILE THE THING UNDER TEST WAS
// INERT. There the harness never parsed; here the subject never compiled.
// Neither could be caught by looking harder at the text.
//
// Every source-reading suite must call `assertReachable()` FIRST, so its own
// verdict is conditioned on the code being real.
// =====================================================================

import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * `tsc --noEmit` over the project, plus evidence that a SUCCESSFUL build
 * post-dates the newest source file.
 *
 * ⚠️ `tsc` is run live because it is the exact check hero-13 evaded and it is
 * cheap. **Build is verified by ARTEFACT FRESHNESS rather than by re-running
 * it**, and the reason is not only cost: `next build` writes `.next/BUILD_ID`
 * only on SUCCESSFUL completion, so an artefact newer than every source file
 * is positive evidence a build succeeded after the last edit. A failed build
 * leaves the old `BUILD_ID` behind, which is then OLDER than the edit and
 * fails this check — the fail-closed direction.
 *
 * Returns a list of check results; the caller reports them as its own first
 * legs so a reachability failure is visible as a failure of THAT suite.
 */
export function assertReachable(root) {
  const results = [];

  const tsc = spawnSync("npx", ["tsc", "--noEmit"], {
    cwd: root,
    encoding: "utf8",
    shell: true,
  });
  const tscOk = tsc.status === 0;
  results.push([
    tscOk,
    `R-0a: REACHABILITY — \`tsc --noEmit\` passes, so the code this suite reads actually COMPILES${
      tscOk ? "" : `\n         ${String(tsc.stdout || tsc.stderr).split(/\r?\n/).filter(Boolean).slice(0, 4).join("\n         ")}`
    }`,
  ]);

  const buildId = join(root, ".next", "BUILD_ID");
  if (!existsSync(buildId)) {
    results.push([false, "R-0b: REACHABILITY — no `.next/BUILD_ID`: no successful build exists to attest to this source"]);
    return results;
  }

  // Newest mtime across the source trees this project actually ships.
  let newest = 0;
  let newestFile = "";
  const walk = (dir) => {
    if (!existsSync(dir)) return;
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(ts|tsx|css)$/.test(e.name)) {
        const m = statSync(p).mtimeMs;
        if (m > newest) {
          newest = m;
          newestFile = p.slice(root.length + 1);
        }
      }
    }
  };
  for (const d of ["app", "features", "lib", "server", "components"]) walk(join(root, d));

  const built = statSync(buildId).mtimeMs;
  results.push([
    built >= newest,
    `R-0b: REACHABILITY — a SUCCESSFUL build post-dates the newest source (\`${newestFile}\`); \`.next/BUILD_ID\` is written only on success, so a failed build would leave a STALE id and fail here`,
  ]);

  return results;
}
