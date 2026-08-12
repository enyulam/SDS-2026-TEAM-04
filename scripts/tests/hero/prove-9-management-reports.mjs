#!/usr/bin/env node
// =====================================================================
// HERO PHASE 9 -- runner for prove-9-management-reports.sql, plus the
// surface half, which has no SQL equivalent.
// =====================================================================
// The SQL suite proves the READ was chosen correctly and that nothing was
// weakened to make it work. This half proves three things the database
// cannot see:
//
//   * ⛔ THE `29` "All terms" FILTER IS GONE. G-4 ruled it "not built", and
//     `REGISTERED-OMISSION` means ruled out, preserved in the record, NEVER
//     BUILT. It stood on this screen as a DISABLED chip -- an honest
//     reconciliation-era choice whose stated reason ("the projection carries
//     no term field") became false in the way that matters: it implies the
//     filter would exist if the data did. It never will.
//   * the class filter NARROWS an authorized list and cannot widen it,
//     because its options are derived from rows the caller already received.
//   * §5.5's exclusion list is re-checked FIELD BY FIELD against the DTO as
//     shipped -- which the plan requires at this phase's exit, and which a
//     summary sentence would not discharge.
//
// The suite ends in ROLLBACK; this runner makes "nothing was committed" part
// of the PROOF by measuring the governed counts before and after.
//
// Run: npm run prove:hero-9
// =====================================================================

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

const SUITE = join(ROOT, "scripts", "tests", "hero", "prove-9-management-reports.sql");
// ⛔ The pair is MINTED, not borrowed (Operator ruling 2026-08-11). The
// prelude is CONCATENATED rather than `\i`-included: the SQL is piped to
// psql over `docker exec -i`, so the container cannot see this repository.
const PRELUDE = join(ROOT, "scripts", "tests", "hero", "_isolated-fixture.sql");
const SCREEN = join(ROOT, "features", "management", "management-reports-queue.tsx");
const CONTRACT = join(ROOT, "lib", "frontend", "contracts", "physical-test.ts");

const COUNTS = `SELECT (SELECT count(*) FROM public.reports)
  || '|' || (SELECT count(*) FROM public.report_versions)
  || '|' || (SELECT count(*) FROM public.audit_events)
  || '|' || (SELECT count(*) FROM public.audit_chain_heads)
  || '|' || (SELECT count(*) FROM public.class_sessions WHERE lesson_number IS NOT NULL)
  || '|' || (SELECT count(*) FROM public.parent_student_links WHERE is_active)
  || '|' || (SELECT count(*) FROM public.students)
  || '|' || (SELECT count(*) FROM public.enrolments)
  || '|' || (SELECT count(*) FROM public.observations);`;

function psql(args, input) {
  return spawnSync("docker", ["exec", "-i", DB_CONTAINER, "psql", "--no-psqlrc", "-U", "postgres",
    "-d", "postgres", "-At", ...args], { input, encoding: "utf8", shell: false });
}

const before = psql(["-c", COUNTS]).stdout.trim();
console.log(`governed counts BEFORE: ${before}`);

const run = psql([], `${readFileSync(PRELUDE, "utf8")}
${readFileSync(SUITE, "utf8")}`);
const out = `${run.stdout}\n${run.stderr}`;
for (const line of out.split(/\r?\n/)) {
  if (/^(NOTICE|WARNING|ERROR)/.test(line.trim())) console.log(`  ${line.trim()}`);
}

const after = psql(["-c", COUNTS]).stdout.trim();
console.log(`governed counts AFTER : ${after}`);

// ---------------------------------------------------------------------
// THE SURFACE HALF
// ---------------------------------------------------------------------
// ⚠️ Comments are stripped first. This screen DOCUMENTS the G-4 omission at
// length, and a scan over the raw text would match the paragraph explaining
// why the term filter is gone rather than the code that removed it. Fifth
// time this precaution has been needed in this batch, and it has produced a
// false verdict every time it was skipped.
const raw = readFileSync(SCREEN, "utf8");
const code = raw.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
// ⚠️ AND THE CONTRACT TOO -- the omission that made this suite fail on its
// first run. The Phase 9 DTO block carries a comment that RECITES §5.5's
// exclusion list ("no rating, observation, attendance value, evidence
// reference..."), so eight of the ten scans below matched the sentence
// promising the fields are absent instead of the fields. FIFTH instance in
// this batch of one root: A SCAN OVER SOURCE READS THE PROSE THAT DOCUMENTS
// THE CODE. Stripping is not a tidiness measure -- it is what makes the scan
// measure the thing it names.
const contract = readFileSync(CONTRACT, "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/^\s*\/\/.*$/gm, "");

let bad = 0;
const check = (ok, msg) => {
  if (!ok) bad++;
  console.log(`${ok ? "PASS   " : "FAIL   "} ${msg}`);
};

const passes = (out.match(/PASS P9-/g) ?? []).length;
const fails = (out.match(/FAIL P9-/g) ?? []).length;

console.log("");
check(!/^ERROR/m.test(out), "the suite ran to completion without a SQL error");
check(fails === 0, `no failing leg (${fails} FAIL)`);
check(passes === 6, `all SIX SQL legs EXECUTED (${passes}/6) -- an unrun leg is NOT-RUN, never PASS`);
check(before === after, `the canonical database is UNMOVED (${before} -> ${after})`);
/*
 * ⛔ THE LEG THAT STOPS THE ONE ABOVE BEING A TAUTOLOGY. `before === after`
 * is also what a counting query that observes NOTHING returns. The suite
 * emits the SAME counts mid-transaction, while its minted rows exist; if
 * that reading is not different, the query is blind and the byte-unmoved
 * claim measured nothing.
 */
const during = (out.match(/DURING-COUNTS ([0-9|]+)/) ?? [])[1] ?? "";
check(
  during !== "" && during !== before,
  `DISCRIMINATING -- the count query MOVED inside the transaction (${before} -> ${during} -> ${after}), so "unmoved" is a restoration actually measured`,
);

// --- G-4: the term filter is gone, and the check is proven discriminating ---
const termChip = /label="Term"|All terms|searchId}-term/.test(code);
const classChip = /label="Class"/.test(code);
check(!termChip, "P9-7: ⛔ G-4 -- no Term chip, no `All terms` option and no term filter id survives on screen 29");
check(
  classChip,
  "P9-7b: DISCRIMINATING -- the SAME matcher shape finds the Class chip, which IS rendered, so P9-7 measures absence rather than a broken pattern",
);

// --- the class filter narrows an authorized list; it cannot widen one ---
const optionsFromRows = /const classOptions = useMemo\(\(\) => \{[\s\S]*?\}, \[rows\]\);/.test(code);
check(
  optionsFromRows,
  "P9-8: the class filter's options are DERIVED FROM `rows` -- it cannot name a class this caller's queue does not already contain, so it can neither disclose nor probe for an unreachable class",
);
const portCalls = [...code.matchAll(/port\.(\w+)\(/g)].map((m) => m[1]);
check(
  !portCalls.some((name) => /class|module|grade|term/i.test(name)),
  `P9-8b: and it fetches NOTHING to populate itself -- no new port call was added (${[...new Set(portCalls)].join(", ")})`,
);

// --- the three frame columns are rendered ---
for (const column of ["Class", "Lesson", "Trainer"]) {
  check(
    new RegExp(`>\\s*${column}\\s*<`).test(code),
    `P9-9: the frame's ${column} column header is rendered`,
  );
}
check(
  /row\.classGradeLabel/.test(code) && /row\.lessonNumber/.test(code) && /row\.trainerDisplayName/.test(code),
  "P9-9b: and each column reads its own governed field rather than a shared placeholder",
);

// --- §5.5, field by field against the DTO as shipped ---
// ⚠️ The plan requires this re-checked field by field at this phase's exit.
// It is done against the CONTRACT the client actually receives, not against
// the server-side interface, because the contract is the last boundary the
// data crosses.
const dto = contract.slice(
  contract.indexOf("export type ManagementQueueRowDto = {"),
  contract.indexOf("};", contract.indexOf("export type ManagementQueueRowDto = {")),
);
const EXCLUDED = {
  ratings: /rating|dimension|competency|beginning|developing|mastering|mastered/i,
  observations: /observation|trainerNote|coachNote|followUp/i,
  attendance: /attendance|present|absent/i,
  evidence: /evidence|mediaUrl|signedUrl/i,
  "checklist values": /checklist/i,
  "content hashes": /contentHash|entryHash|\bhash\b/i,
  "revision counts": /revision|lockVersion|versionCount/i,
  "AI history": /generation|aiDraft|prompt|idempotency/i,
  "term (G-4)": /\bterm\b/i,
  "overall grade (G-2)": /overallGrade|overall_grade/i,
};
check(dto.length > 200, "P9-10a: NON-VACUOUS -- the shipped DTO text was located and is real, so the ten scans below have something to scan");
for (const [label, pattern] of Object.entries(EXCLUDED)) {
  check(!pattern.test(dto), `P9-10: §5.5 field by field -- the shipped DTO carries no ${label}`);
}
check(
  /classGradeLabel|classModuleTitle|lessonNumber|trainerDisplayName/.test(dto),
  "P9-10b: DISCRIMINATING -- the same slice DOES contain the Phase 9 fields, so the ten scans above ran against real content",
);

console.log(
  bad === 0
    ? "\nRESULT: PASS -- `29` carries Class, Lesson and Trainer and a live class filter; the RPC's gate was chosen around, not weakened; and the term SUBSTRATE now exists under D-3 while screen 29's All-terms FILTER is still not built and no term REPORT substrate exists -- G-4 was reversed for the entity, never for the report."
    : `\nRESULT: FAIL -- ${bad} check(s) failed.`,
);
process.exit(bad === 0 ? 0 : 1);
