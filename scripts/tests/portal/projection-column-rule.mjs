// =====================================================================
// ⛔ DOES EVERY COLUMN A PROJECTION NAMES ACTUALLY EXIST?
// =====================================================================
// Screen `23` shipped a query naming `class_session_assignments.membership_id`
// when the column is `trainer_membership_id`. PostgREST answered `42703`, the
// projection returned `{ok:false}`, and the Trainers list rendered empty. It
// was found by the Operator walking the page.
//
// ⛔ THREE THINGS FAILED, AND THE TYPED CLIENT ONLY CLOSES TWO OF THEM:
//
//   1. `database.types.ts` was STALE — closed by `prove:types-current`.
//   2. No client carried `<Database>` — closed by the 2026-08-16 codemod.
//   3. ⚠️ AND `tsc` STILL CANNOT SEE A SELECT-ONLY MISTAKE. Measured with a
//      four-arm control: a wrong column in a FILTER (`.in`/`.eq`) fails
//      `tsc`; the same wrong column in `.select()` ALONE does not, because
//      `PromiseLike.then` is a METHOD and its parameter is therefore compared
//      BIVARIANTLY, so `SelectQueryError<…>[]` slips through the seam.
//
// ▶ THIS RULE CLOSES (3). It reads the projection SOURCE and checks each
//   column against the LIVE CATALOGUE — no hand-copied query, so it cannot
//   drift from the code it is checking, and no reliance on a generated file
//   that has already been stale once.
//
// ⚠️ `tsc` and this rule are complementary, not redundant: neither covers the
//   other's half.
// =====================================================================

/**
 * Every `.from("table").select("a, b, c")` in a source file, with the filter
 * columns applied to that same builder chain.
 *
 * ⚠️ Embedded resources (`class_modules(title)`) and aliases (`x:y`) are
 * REPORTED SEPARATELY rather than checked — a nested select is a different
 * grammar, and checking it with this parser would produce false reds, which
 * is how a gate stops being read (§12.13).
 */
export function extractQueries(rawSource) {
  /*
   * ⛔ COMMENTS ARE STRIPPED FIRST, AND THIS IS NOT TIDINESS. The first draft
   * scanned the raw text with a bounded chain window, and the moment a call
   * site gained an explanatory comment between `.in(…)` and `.eq(…)` the
   * window overran and the query VANISHED from the sweep — `PT-3e` reported
   * `NONE EXTRACTED` and went red.
   * ▶ **A parser that stops seeing code when the code is documented would push
   * exactly the wrong behaviour onto whoever wants to keep it green.**
   */
  const source = rawSource
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/^\s*\/\/[^\n]*$/gm, " ");
  const out = [];
  const RE = /\.from\(\s*"(\w+)"\s*\)([\s\S]{0,900}?)(?=\n\s*\)|\n\s*;|\.from\(\s*")/g;
  for (const m of source.matchAll(RE)) {
    const table = m[1];
    const chain = m[2];
    const sel = chain.match(/\.select\(\s*"([^"]*)"/);
    if (sel === null) continue;
    const raw = sel[1];
    const nested = /[()]/.test(raw);
    const columns = nested
      ? []
      : raw
          .split(",")
          .map((c) => c.trim().split(":").pop().trim())
          .filter((c) => c !== "" && c !== "*");
    const filters = [];
    for (const f of chain.matchAll(/\.(eq|neq|in|gt|gte|lt|lte|like|ilike|is|order|contains)\(\s*"(\w+)"/g)) {
      filters.push(f[2]);
    }
    out.push({ table, columns, filters, nested, raw });
  }
  return out;
}

/**
 * @param queries  from `extractQueries`
 * @param catalogue Map<table, Set<column>> read from the LIVE database
 * @returns the unknown references, each naming where it came from
 */
export function unknownColumns(queries, catalogue) {
  const bad = [];
  for (const q of queries) {
    const cols = catalogue.get(q.table);
    if (cols === undefined) {
      bad.push({ table: q.table, column: "(TABLE DOES NOT EXIST)", where: "from" });
      continue;
    }
    for (const c of q.columns) if (!cols.has(c)) bad.push({ table: q.table, column: c, where: "select" });
    for (const c of q.filters) if (!cols.has(c)) bad.push({ table: q.table, column: c, where: "filter" });
  }
  return bad;
}
