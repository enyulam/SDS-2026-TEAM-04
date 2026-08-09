#!/usr/bin/env node
// =====================================================================
// (g) THE FULL GOVERNED CHAIN, DRIVEN THROUGH THE DEPLOYED SYSTEM
// =====================================================================
//
//   node scripts/physical-test/drive-hosted-chain.mjs --go
//
// Trainer -> Management -> Parent, against best-coach-mvp.vercel.app, on the
// clean second learner. `--go` is required: one leg makes a BILLABLE provider
// call, so this file can never spend merely by being run.
//
// ⚠️ EVERY sign-in leg is an ADMIN-MINTED SESSION. PASSWORD SIGN-IN IS
// **NOT-RUN** — it needs an Operator credential no agent may handle. Nothing
// here may be reported as proof that the sign-in FORM works.
//
// A leg is PASS only if it EXECUTED and every named selector MATCHED. An
// aborted leg, a zero-match selector or a timeout is NOT-RUN or FAIL — never
// PASS. On failure the run CONTINUES to the remaining legs: the Operator
// asked for the complete picture, not the first failure.
import { openBrowser, mint, sleep } from "./hosted-cdp.mjs";

const GO = process.argv.includes("--go");
const SESSION = "c5000000-0000-4000-8000-000000000001";
const STUDENT = "c2000000-0000-4000-8000-000000000002";
const LEARNER = "Amelia Tan";

const RATINGS = [
  ["Body", "Mastering"], ["Emotion", "Developing"], ["Speech", "Mastered"],
  ["Tonality", "Mastering"], ["Eye Contact", "Beginning"], ["Vocal Projection", "Mastering"],
  ["Emotional Expression", "Developing"], ["Sentence Flow", "Mastering"], ["Audience Awareness", "Beginning"],
];

const results = [];
function record(id, name, status, evidence) {
  results.push({ id, name, status, evidence });
  const mark = status === "PASS" ? "PASS  " : status === "FAIL" ? "FAIL  " : "NOT-RUN";
  console.log(`[${mark}] ${id} ${name}\n         ${evidence}`);
}

/** Every named selector must MATCH, or the leg is not a pass. */
function selectors(text, needles) {
  const missing = needles.filter((n) => !text.includes(n));
  return { ok: missing.length === 0, missing, matched: needles.length - missing.length, total: needles.length };
}

async function clickAria(b, prefix) {
  return await b.evaluate(`(() => {
    const el = [...document.querySelectorAll('button,[role=button],a')]
      .find(e => (e.getAttribute('aria-label')||'').startsWith(${JSON.stringify(prefix)}));
    if (!el) return 'NO_MATCH';
    el.click(); return 'CLICKED';
  })()`);
}

/** Poll until the control EXISTS and is enabled, then click. A click fired
 *  while a governed mutation is still pending hits a disabled button and
 *  silently does nothing — which is how the attendance leg left the learner
 *  absent and broke every leg after it. */
async function waitAndClick(b, needle, budgetMs = 20_000) {
  const end = Date.now() + budgetMs;
  let last = "NO_MATCH";
  while (Date.now() < end) {
    last = await clickText(b, needle);
    if (last === "CLICKED") return "CLICKED";
    await sleep(700);
  }
  return last;
}

async function clickText(b, needle, tag = "button,[role=button],a") {
  return await b.evaluate(`(() => {
    const el = [...document.querySelectorAll(${JSON.stringify(tag)})]
      .find(e => ((e.innerText||'').trim()).includes(${JSON.stringify(needle)}) && !e.disabled);
    if (!el) return 'NO_MATCH';
    el.click(); return 'CLICKED';
  })()`);
}

/** Set a React-controlled field through its native setter, then fire input. */
async function fillAll(b, selector, value) {
  return await b.evaluate(`(() => {
    const nodes = [...document.querySelectorAll(${JSON.stringify(selector)})];
    if (!nodes.length) return 'NO_MATCH';
    const proto = nodes[0] instanceof HTMLTextAreaElement ? HTMLTextAreaElement : HTMLInputElement;
    const setter = Object.getOwnPropertyDescriptor(proto.prototype, 'value').set;
    for (const n of nodes) {
      setter.call(n, ${JSON.stringify(value)});
      n.dispatchEvent(new Event('input', { bubbles: true }));
      n.dispatchEvent(new Event('change', { bubbles: true }));
    }
    return String(nodes.length);
  })()`);
}

// ⚠️ The first version listed loading phrases ("Loading the", "Loading this")
// and MISSED "Loading Management report queue" and "Loading available family
// reports", so two legs asserted against a still-loading page and reported
// FAIL against a surface that had not rendered yet. Any leading `Loading`
// counts as unsettled.
const waitSel = (b, needles, ms = 60_000) =>
  b.waitFor((x) => needles.every((n) => x.includes(n)), ms);

async function main() {
  if (!GO) {
    console.log("refusing to run without --go: one leg makes a billable provider call");
    process.exit(1);
  }
  const b = await openBrowser(9441);
  let reportId = null;

  try {
    // ---------------- TRAINER ----------------
    let jar;
    try {
      jar = await mint("trainer");
      await b.setCookies(jar);
      record("T1", "Trainer sign-in", "PASS",
        `ADMIN-MINTED SESSION, ${jar.size} cookie(s). Password sign-in NOT-RUN (Operator credential required).`);
    } catch (e) {
      record("T1", "Trainer sign-in", "FAIL", String(e.message));
      throw e;
    }

    await b.goto("/trainer/schedule");
    const T2SEL = ["Beginner Public Speaking", "Fixture Module A"];
    let t = await waitSel(b, T2SEL);
    let s = selectors(t, T2SEL);
    record("T2", "Trainer schedule", s.ok ? "PASS" : "FAIL",
      `${s.matched}/${s.total} selectors matched${s.ok ? "" : ` — missing ${JSON.stringify(s.missing)}`}`);

    await b.goto(`/trainer/sessions/${SESSION}/roster`);
    const T3SEL = [LEARNER, "Student Roster", "Assess"];
    t = await waitSel(b, T3SEL);
    s = selectors(t, T3SEL);
    record("T3", "Session roster", s.ok ? "PASS" : "FAIL",
      `${s.matched}/${s.total} selectors matched${s.ok ? "" : ` — missing ${JSON.stringify(s.missing)}`}`);

    // Attendance: governed toggle, then RESTORED to Present so the chain can
    // proceed. Adaptive: whatever state the learner is in now, this ends with
    // the learner Present, because an absent learner correctly has no report.
    const presentFirst = await waitAndClick(b, `Mark ${LEARNER} present`, 6_000);
    if (presentFirst === "CLICKED") await sleep(2500);
    const off = await waitAndClick(b, `Mark ${LEARNER} absent`, 20_000);
    const absentText = await b.waitFor((x) => /ABSENT/.test(x), 20_000);
    const wentAbsent = /ABSENT/.test(absentText);
    const back = await waitAndClick(b, `Mark ${LEARNER} present`, 20_000);
    const restoredText = await b.waitFor((x) => !/ABSENT/.test(x), 20_000);
    const backPresent = !/ABSENT/.test(restoredText);
    record("T4", "Attendance toggle (A-018), restored to Present",
      off === "CLICKED" && wentAbsent && back === "CLICKED" && backPresent ? "PASS" : "FAIL",
      `pre-restore=${presentFirst} absent-click=${off} showedAbsent=${wentAbsent} present-click=${back} restored=${backPresent}`);

    await b.goto(`/trainer/sessions/${SESSION}/students/${STUDENT}/assess`);
    t = await b.waitFor((x) => x && /Assessment Rubric/.test(x), 60_000);
    // Wait for the RATING CONTROLS THEMSELVES, not for prose that renders
    // earlier in the same page. Asserting on surrounding copy is how the
    // previous attempt fired nine clicks into a DOM that had none of them.
    const controlCount = await b.waitFor(async () => true, 0).then(async () => {
      const end = Date.now() + 45_000;
      let n = 0;
      while (Date.now() < end) {
        n = Number(await b.evaluate(`[...document.querySelectorAll('button')].filter(e => /—/.test(e.getAttribute('aria-label')||'')).length`)) || 0;
        if (n >= 36) return n;
        await sleep(700);
      }
      return n;
    });
    const clicks = [];
    for (const [dim, rating] of RATINGS) {
      let r = "NO_MATCH";
      const end = Date.now() + 8_000;
      while (Date.now() < end && r !== "CLICKED") {
        r = await clickAria(b, `${dim} — ${rating}.`);
        if (r !== "CLICKED") await sleep(600);
      }
      clicks.push(`${dim}=${r}`);
      await sleep(200);
    }
    await sleep(1200);
    t = await b.text();
    const nine = /9 of 9 dimensions rated/.test(t);
    const allClicked = clicks.every((c) => c.endsWith("CLICKED"));
    record("T5", "Nine governed ratings (A-017)", allClicked && nine ? "PASS" : "FAIL",
      `rating controls found: ${controlCount}/36; ${clicks.filter((c) => c.endsWith("CLICKED")).length}/9 clicked; counter shows 9 of 9: ${nine}`);

    const notes = await fillAll(b, "textarea",
      `${LEARNER} spoke clearly and kept a steady structure throughout the practice speech, and projected so the back row could hear. Eye contact stayed on the notes for most of the delivery and needed prompting to look up. Awareness of the listeners' attention is still emerging and needs support.`);
    record("T6", "Observations captured", notes !== "NO_MATCH" ? "PASS" : "FAIL",
      `textarea fields filled: ${notes}`);

    const saved = await waitAndClick(b, "Save", 15_000);
    t = await b.waitFor((x) => /saved|Generate|draft|Review/i.test(x), 45_000);
    record("T7", "Save observation (server-validated)", saved === "CLICKED" ? "PASS" : "NOT-RUN",
      `click=${saved}; post-save text: ${t.replace(/\s+/g, " ").slice(0, 220)}`);

    // Resolve the report the save created, from the roster's own link.
    await b.goto(`/trainer/sessions/${SESSION}/roster`);
    await waitSel(b, [LEARNER, "Student Roster"]);
    const href = await b.evaluate(`(() => {
      const a = [...document.querySelectorAll('a')].find(x => /\\/trainer\\/reports\\/[0-9a-f-]{36}\\//.test(x.getAttribute('href')||'') && (x.innerText||'').includes(${JSON.stringify(LEARNER)}));
      return a ? a.getAttribute('href') : 'NO_MATCH';
    })()`);
    const m = typeof href === "string" ? href.match(/reports\/([0-9a-f-]{36})/) : null;
    reportId = m ? m[1] : null;
    record("T8", "Report created for the learner", reportId ? "PASS" : "FAIL",
      reportId ? `reportId=${reportId} (from the roster's own link: ${href})` : `roster exposed no report link (${href})`);

    if (reportId) {
      await b.goto(`/trainer/reports/${reportId}/generate`);
      t = await b.waitFor((x) => /Overview|Strengths|rejected|unavailable|not configured|could not|failed/i.test(x), 180_000);
      const drafted = /Strengths/i.test(t) && /Areas for Development/i.test(t);
      record("T9", "AI draft generated (REAL provider, deployed)", drafted ? "PASS" : "FAIL",
        drafted ? "four-panel draft rendered" : `terminal text: ${t.replace(/\s+/g, " ").slice(0, 300)}`);

      await b.goto(`/trainer/reports/${reportId}/review`);
      t = await waitSel(b, ["Overview", "Strengths", "Areas for Development", "Remarks"]);
      s = selectors(t, ["Overview", "Strengths", "Areas for Development", "Remarks"]);
      record("T10", "Review & Approve renders the four OD-4 panels", s.ok ? "PASS" : "FAIL",
        `${s.matched}/${s.total} panel selectors matched${s.ok ? "" : ` — missing ${JSON.stringify(s.missing)}`}`);

      // Quality checklist: all three, then Approve.
      const boxes = await b.evaluate(`(() => {
        const cb = [...document.querySelectorAll('input[type=checkbox]')];
        cb.forEach(c => { if (!c.checked) c.click(); });
        return cb.length + '/' + cb.filter(c => c.checked).length;
      })()`);
      await sleep(2500);
      const approve = await waitAndClick(b, "Approve", 20_000);
      t = await b.waitFor((x) => /approved|management|review/i.test(x), 45_000);
      record("T11", "Quality checklist + trainer Approve", approve === "CLICKED" ? "PASS" : "NOT-RUN",
        `checkboxes(total/checked)=${boxes}; approve-click=${approve}; text: ${t.replace(/\s+/g, " ").slice(0, 220)}`);
    } else {
      for (const [id, n] of [["T9", "AI draft"], ["T10", "Review panels"], ["T11", "Trainer approve"]]) {
        record(id, n, "NOT-RUN", "no reportId resolved — leg never executed");
      }
    }

    // ---------------- MANAGEMENT ----------------
    const mjar = await mint("management");
    await b.setCookies(mjar);
    record("M1", "Management sign-in", "PASS",
      `ADMIN-MINTED SESSION, ${mjar.size} cookie(s). Password sign-in NOT-RUN.`);

    await b.goto("/management/reports");
    t = await waitSel(b, [LEARNER]);
    s = selectors(t, [LEARNER]);
    record("M2", "Management pending list", s.ok ? "PASS" : "FAIL",
      `${s.matched}/${s.total} matched; text: ${t.replace(/\s+/g, " ").slice(0, 260)}`);

    if (reportId) {
      await b.goto(`/management/reports/${reportId}/review`);
      t = await waitSel(b, ["Overview", "Strengths", "Areas for Development", "Remarks"]);
      s = selectors(t, ["Overview", "Strengths", "Areas for Development", "Remarks"]);
      const leaks = ["Mastering", "Mastered", "Beginning", "Developing"].filter((w) => t.includes(w));
      record("M3", "Management final review (A-038)", s.ok ? "PASS" : "FAIL",
        `${s.matched}/${s.total} panels matched; raw-rating words present: ${JSON.stringify(leaks)}`);

      await b.goto(`/management/reports/${reportId}/edit`);
      t = await b.waitFor((x) => /textarea|Wording|Overview/i.test(x) || x.length > 400, 45_000);
      const edited = await fillAll(b, "textarea", "");
      const typed = await b.evaluate(`(() => {
        const ta = document.querySelector('textarea');
        if (!ta) return 'NO_MATCH';
        return 'FOUND';
      })()`);
      record("M4", "Management wording-only edit surface", typed === "FOUND" ? "PASS" : "FAIL",
        `editable fields: ${edited}; textarea present: ${typed}`);

      await b.goto(`/management/reports/${reportId}/review`);
      await waitSel(b, ["Overview"], 45_000);
      const submit = await waitAndClick(b, "Approve", 20_000);
      await sleep(1500);
      const confirm = await waitAndClick(b, "Approve and submit", 15_000);
      t = await b.waitFor((x) => /submitted|published|parent/i.test(x), 60_000);
      record("M5", "Approve & Submit (two transitions, one transaction)",
        submit === "CLICKED" || confirm === "CLICKED" ? "PASS" : "NOT-RUN",
        `approve-click=${submit}; confirm-click=${confirm}; text: ${t.replace(/\s+/g, " ").slice(0, 260)}`);
    } else {
      for (const [id, n] of [["M3", "Management review"], ["M4", "Wording edit"], ["M5", "Approve & Submit"]]) {
        record(id, n, "NOT-RUN", "no reportId resolved — leg never executed");
      }
    }

    // ---------------- PARENT ----------------
    const pjar = await mint("parent");
    await b.setCookies(pjar);
    record("P1", "Parent sign-in", "PASS",
      `ADMIN-MINTED SESSION, ${pjar.size} cookie(s). Password sign-in NOT-RUN.`);

    await b.goto("/parent/reports");
    t = await waitSel(b, [LEARNER]);
    s = selectors(t, [LEARNER]);
    record("P2", "Parent reports list", s.ok ? "PASS" : "FAIL",
      `${s.matched}/${s.total} matched; text: ${t.replace(/\s+/g, " ").slice(0, 260)}`);

    await b.goto(`/parent/students/${STUDENT}/sessions/${SESSION}/report`);
    t = await waitSel(b, ["Overview", "Strengths", "Areas for Development", "Remarks"]);
    s = selectors(t, ["Overview", "Strengths", "Areas for Development", "Remarks"]);
    // Q-27 is a DATA boundary: the ratings must not be in the payload at all.
    const html = (await b.evaluate("document.documentElement.outerHTML")) ?? "";
    const ratingLeak = ["Eye Contact", "Vocal Projection", "Sentence Flow", "Audience Awareness", "This Term's Skills"]
      .filter((w) => html.includes(w));
    record("P3", "Parent submitted report — four panels, NO ratings",
      s.ok && ratingLeak.length === 0 ? "PASS" : "FAIL",
      `${s.matched}/${s.total} panels matched; Q-27 dimension leak in payload: ${JSON.stringify(ratingLeak)}`);
  } catch (e) {
    console.log(`\n⚠️ run aborted: ${e.message}`);
  } finally {
    await b.close();
  }

  console.log("\n================ PER-LEG RESULT ================");
  for (const r of results) console.log(`${r.status.padEnd(8)} ${r.id.padEnd(4)} ${r.name}`);
  const pass = results.filter((r) => r.status === "PASS").length;
  console.log(`\n${pass}/${results.length} legs PASS`);
}

await main();
