// Resolves the repository's `@/` TypeScript path alias for plain Node so the
// integration suite can execute the server-module CORES directly under
// Node's erasable-syntax type stripping. Registered via:
//   node --import ./scripts/tests/integration/alias-loader.mjs <script>
import { registerHooks } from "node:module";
import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { join } from "node:path";

const ROOT = process.cwd();

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      const bare = join(ROOT, specifier.slice(2));
      for (const candidate of [bare, `${bare}.ts`, `${bare}.tsx`, join(bare, "index.ts")]) {
        if (existsSync(candidate)) {
          return { url: pathToFileURL(candidate).href, shortCircuit: true };
        }
      }
    }
    return nextResolve(specifier, context);
  },
});
