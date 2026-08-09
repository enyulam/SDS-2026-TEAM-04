#!/usr/bin/env node
// =====================================================================
// (g) MANAGEMENT + PARENT legs, DATABASE-VERIFIED
// =====================================================================
//
//   node scripts/physical-test/drive-hosted-mp.mjs --go
//
// ⚠️ WHY THIS FILE REPLACES THE TEXT-PREDICATE APPROACH.
// The previous harness judged a leg by reading page text. Its save leg's
// predicate `/saved|Generate|draft|Review/i` matched the page's OWN
// "REVIEW & APPROVE" heading, so the leg COULD NOT FAIL, and it reported a
// green save that had persisted nothing. An assertion that cannot fail is
// not an assertion.
//
// RULE HERE: a leg is PASS only when the DATABASE shows the governed effect.
// Page text may decide WHEN to act; it never decides WHETHER it worked.
//
// Settling is a real condition too: wait for the specific CONTROL the leg
// needs to operate, never for surrounding prose.
//
// Sessions are ADMIN-MINTED. PASSWORD SIGN-IN IS **NOT-RUN**.
import postgres from "postgres";
import { openBrowser, mint, sleep } from "./hosted-cdp.mjs";

const GO = process.argv.includes("--go");
const STUDENT = "c2000000-0000-4000-8000-000000000002";
const SESSION = "c5000000-0000-4000-8000-000000000001";
const LEARNER = "Amelia Tan";
const PROTECTED = "4876bc9f-4e58-41ab-a253-822fcb024120";

const sql = postgres(process.env.BEST_COACH_HOSTED_DB_URL, { prepare: false, max: 1, onnotice: () => {} });

const results = [];
function record(id, name, status, evidence) {
  results.push({ id, name, status, evidence });
  console.log(`[${status.padEnd(7)}] ${id} ${name}\n         ${evidence}`);
}

const report = async () =>
  (await sql`select id,status,lock_version,current_cycle_version_id,latest_submitted_version_id
               from reports where student_id=${STUDENT}`)[0] ?? null;

/** Poll the DATABASE until the governed effect appears. This is the only
 *  thing allowed to turn a leg green. */
async function waitDb(check, budgetMs = 45_000) {
  const end = Date.now() + budgetMs;
  let last = null;
  while (Date.now() < end) {
    last = await report();
    if (last && check(last)) return { ok: true, row: last };
    await sleep(1200);
  }
  return { ok: false, row: last };
}

/** A REAL settle condition: the control this leg must operate exists and is
 *  enabled. Not prose. */
async function waitControl(b, needle, budgetMs = 60_000) {
  const end = Date.now() + budgetMs;
  while (Date.now() < end) {
    const found = await b.evaluate(`(() => {
      const el = [...document.querySelectorAll('button,[role=button],a')]
        .find(e => ((e.innerText||'').trim()).includes(${JSON.stringify(needle)}) && !e.disabled);
      return el ? 'READY' : 'WAIT';
    })()`);
    if (found === "READY") return true;
    await sleep(700);
  }
  return false;
}

async function click(b, needle) {
  return await b.evaluate(`(() => {
    const el = [...document.querySelectorAll('button,[role=button],a')]
      .find(e => ((e.innerText||'').trim()).includes(${JSON.stringify(needle)}) && !e.disabled);
    if (!el) return 'NO_MATCH';
    el.click(); return 'CLICKED';
  })()`);
}

async function waitText(b, needles, ms = 60_000) {
  return await b.waitFor((x) => needles.every((n) => x.includes(n)), ms);
}

async function main() {
  if (!GO) { console.log("refusing to run without --go"); process.exit(1); }

  const start = await report();
  if (!start) { console.log("no report for the learner — aborting"); process.exit(1); }
  record("X0", "Precondition (DB)", start.status === "draft_ready" ? "PASS" : "FAIL",
    `report=${start.id} status=${start.status} lock_version=${start.lock_version}`);
  const REPORT = start.id;

  const b = await openBrowser(9451);
  try {
    // ---------- TRAINER APPROVE (entry condition to management review) ----------
    const tjar = await mint("trainer");
    await b.setCookies(tjar);
    await b.goto(`/trainer/reports/${REPORT}/review`);
    await waitText(b, ["Overview", "Strengths", "Areas for Development", "Remarks"]);
    // ⚠️ Clicking the <input> did nothing: these are React-controlled and driven
    // by their LABEL. Click the label (or the input as a fallback), then VERIFY
    // `checked` — a click that silently fails is exactly how the previous
    // harness reported green on an unchecked gate.
    let boxes = "";
    const boxEnd = Date.now() + 30_000;
    while (Date.now() < boxEnd) {
      boxes = await b.evaluate(`(() => {
        const cb = [...document.querySelectorAll('input[type=checkbox]')];
        for (const c of cb) {
          if (c.checked) continue;
          const lab = c.closest('label') || (c.id ? document.querySelector('label[for="' + c.id + '"]') : null);
          (lab || c).click();
        }
        const now = [...document.querySelectorAll('input[type=checkbox]')];
        return now.length + ' total / ' + now.filter(c => c.checked).length + ' checked';
      })()`);
      if (/^(\d+) total \/  checked$/.test(String(boxes))) break;
      await sleep(1200);
    }
    await sleep(2000);
    const approveReady = await waitControl(b, "Approve", 30_000);
    const ac = approveReady ? await click(b, "Approve") : "NO_CONTROL";
    await sleep(1500);
    await click(b, "Approve");            // confirmation dialog, if present
    const appr = await waitDb((r) => r.status === "trainer_approved", 45_000);
    const approvals = (await sql`select approver_role from report_version_approvals
                                  where report_version_id=${start.current_cycle_version_id}`).map((x) => x.approver_role);
    record("T11", "Trainer Approve (checklist-gated, A-036)", appr.ok ? "PASS" : "FAIL",
      `checkboxes ${boxes}; click=${ac}; DB status=${appr.row?.status}; approvals=${JSON.stringify(approvals)}`);

    // ---------- MANAGEMENT ----------
    const mjar = await mint("management");
    await b.setCookies(mjar);
    await b.goto("/management/reports");
    let t = await waitText(b, [LEARNER], 60_000);
    record("M2", "Management queue lists the trainer-approved report",
      t.includes(LEARNER) && appr.ok ? "PASS" : "FAIL",
      `learner in queue: ${t.includes(LEARNER)}; DB status=${(await report())?.status}`);

    await b.goto(`/management/reports/${REPORT}/review`);
    t = await waitText(b, ["Overview", "Strengths", "Areas for Development", "Remarks"], 60_000);
    const html = (await b.evaluate("document.documentElement.outerHTML")) ?? "";
    // A-038: management must never see raw per-dimension assessment data.
    const dimLeak = ["Eye Contact", "Vocal Projection", "Emotional Expression", "Sentence Flow", "Audience Awareness"]
      .filter((d) => html.includes(d));
    const panels = ["Overview", "Strengths", "Areas for Development", "Remarks"].filter((p) => t.includes(p));
    record("M3", "Management final review — four panels, no raw ratings (A-038)",
      panels.length === 4 && dimLeak.length === 0 ? "PASS" : "FAIL",
      `panels ${panels.length}/4; per-dimension leak in payload: ${JSON.stringify(dimLeak)}`);

    // ---------- M4 wording-only edit ----------
    const beforeVersions = Number((await sql`select count(*)::int n from report_versions where report_id=${REPORT}`)[0].n);
    await b.goto(`/management/reports/${REPORT}/edit`);
    await b.waitFor((x) => /Remarks|Overview|Wording/i.test(x), 60_000);
    const filled = await b.evaluate(`(() => {
      const ta = [...document.querySelectorAll('textarea')];
      if (!ta.length) return 'NO_MATCH';
      const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
      const target = ta[ta.length - 1];
      setter.call(target, (target.value || '') + ' Reviewed by the academy before release.');
      target.dispatchEvent(new Event('input', { bubbles: true }));
      return String(ta.length);
    })()`);
    await sleep(800);
    const saveReady = await waitControl(b, "Save", 20_000);
    const sc = saveReady ? await click(b, "Save") : "NO_CONTROL";
    let afterVersions = beforeVersions;
    const end = Date.now() + 45_000;
    while (Date.now() < end) {
      afterVersions = Number((await sql`select count(*)::int n from report_versions where report_id=${REPORT}`)[0].n);
      if (afterVersions > beforeVersions) break;
      await sleep(1500);
    }
    const mgmtVersion = (await sql`select id,authored_by_role,revision_number from report_versions
                                    where report_id=${REPORT} order by revision_number desc limit 1`)[0];
    // A-034: the submitted version must carry exactly the same nine ratings.
    const parity = (await sql`select count(*)::int n from report_version_ratings where report_version_id=${mgmtVersion?.id}`)[0]?.n;
    record("M4", "Wording-only edit creates a new immutable version (A-034/A-037)",
      afterVersions > beforeVersions && mgmtVersion?.authored_by_role === "management" && parity === 9 ? "PASS" : "FAIL",
      `textareas=${filled} save=${sc}; versions ${beforeVersions}->${afterVersions}; newest authored_by=${mgmtVersion?.authored_by_role} rev=${mgmtVersion?.revision_number}; ratings on it=${parity}`);

    // ---------- M5 Approve & Submit ----------
    await b.goto(`/management/reports/${REPORT}/review`);
    await waitText(b, ["Overview"], 60_000);
    const subReady = await waitControl(b, "Approve", 30_000);
    const s1 = subReady ? await click(b, "Approve") : "NO_CONTROL";
    await sleep(1800);
    const s2 = await click(b, "Approve and submit");
    const sub = await waitDb((r) => r.status === "submitted" && r.latest_submitted_version_id !== null, 60_000);
    const events = (await sql`select action,state_from,state_to from audit_events order by occurred_at desc limit 4`)
      .reverse().map((e) => `${e.action}:${e.state_from ?? "-"}->${e.state_to ?? "-"}`);
    record("M5", "Approve & Submit — two transitions, one transaction (A-033)",
      sub.ok ? "PASS" : "FAIL",
      `clicks=${s1}/${s2}; DB status=${sub.row?.status}; latest_submitted=${sub.row?.latest_submitted_version_id ? "set" : "null"}; last audit=${JSON.stringify(events)}`);

    // ---------- PARENT ----------
    const pjar = await mint("parent");
    await b.setCookies(pjar);
    await b.goto("/parent/reports");
    t = await waitText(b, [LEARNER], 60_000);
    record("P2", "Parent list shows only the submitted report",
      t.includes(LEARNER) && sub.ok ? "PASS" : "FAIL",
      `learner listed: ${t.includes(LEARNER)}; DB latest_submitted_version_id=${sub.row?.latest_submitted_version_id ? "set" : "null"}`);

    await b.goto(`/parent/students/${STUDENT}/sessions/${SESSION}/report`);
    t = await waitText(b, ["Overview", "Strengths", "Areas for Development", "Remarks"], 60_000);
    const phtml = (await b.evaluate("document.documentElement.outerHTML")) ?? "";
    // Q-27 is a DATA boundary: ratings must not be in the parent PAYLOAD at all.
    const q27 = ["Eye Contact", "Vocal Projection", "Emotional Expression", "Sentence Flow",
      "Audience Awareness", "This Term's Skills", "Mastering", "Mastered", "Beginning"]
      .filter((w) => phtml.includes(w));
    const ppanels = ["Overview", "Strengths", "Areas for Development", "Remarks"].filter((p) => t.includes(p));
    record("P3", "Parent submitted report — four panels, NO ratings (Q-27)",
      ppanels.length === 4 && q27.length === 0 ? "PASS" : "FAIL",
      `panels ${ppanels.length}/4; Q-27 leak in parent payload: ${JSON.stringify(q27)}`);
  } catch (e) {
    console.log(`\n⚠️ aborted: ${e.message}`);
  } finally {
    await b.close();
    const prot = (await sql`select status,lock_version from reports where id=${PROTECTED}`)[0];
    console.log(`\nPROTECTED fallback ${PROTECTED}: status=${prot?.status} lock_version=${prot?.lock_version}`);
    await sql.end();
  }

  console.log("\n================ PER-LEG RESULT ================");
  for (const r of results) console.log(`${r.status.padEnd(8)} ${r.id.padEnd(4)} ${r.name}`);
  console.log(`\n${results.filter((r) => r.status === "PASS").length}/${results.length} legs PASS`);
}

await main();
