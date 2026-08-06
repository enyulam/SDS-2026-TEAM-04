import { spawn } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const APP_ORIGIN = process.env.BEST_COACH_APP_ORIGIN ?? "http://127.0.0.1:3000";
const CHROME_PATH =
  process.env.CHROME_PATH ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const DEBUG_PORT = 9332;
const ARTIFACT_DIR = join(tmpdir(), "best-coach-f2-browser-smoke");
const profileDirectory = await mkdtemp(join(tmpdir(), "best-coach-f2-chrome-"));

await mkdir(ARTIFACT_DIR, { recursive: true });

const chrome = spawn(
  CHROME_PATH,
  [
    "--headless=new",
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${profileDirectory}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-background-networking",
    "--disable-component-update",
    "--disable-default-apps",
    "--disable-gpu",
    "--window-size=1440,1100",
    "about:blank",
  ],
  { stdio: "ignore", windowsHide: true },
);
chrome.unref();

let socket;
let messageId = 0;
const pending = new Map();
const eventWaiters = new Map();
const consoleErrors = [];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function retry(operation, timeoutMs = 10_000) {
  const deadline = Date.now() + timeoutMs;
  let lastError;
  while (Date.now() < deadline) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  throw lastError ?? new Error("Operation timed out");
}

function waitForEvent(method, timeoutMs = 10_000) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`Timed out waiting for ${method}`)), timeoutMs);
    const current = eventWaiters.get(method) ?? [];
    current.push((params) => {
      clearTimeout(timeout);
      resolve(params);
    });
    eventWaiters.set(method, current);
  });
}

function command(method, params = {}) {
  const id = ++messageId;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(expression) {
  const response = await command("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (response.exceptionDetails) {
    throw new Error(response.exceptionDetails.exception?.description ?? "Browser evaluation failed");
  }
  return response.result.value;
}

async function waitUntil(expression, description, timeoutMs = 10_000) {
  return retry(async () => {
    const result = await evaluate(expression);
    if (!result) throw new Error(`Waiting for ${description}`);
    return result;
  }, timeoutMs);
}

async function navigate(path) {
  const loaded = waitForEvent("Page.loadEventFired", 15_000);
  await command("Page.navigate", { url: `${APP_ORIGIN}${path}` });
  await loaded;
  await waitUntil("document.readyState === 'complete'", `page load for ${path}`);
}

async function clickExact(selector, text) {
  const count = await evaluate(`
    [...document.querySelectorAll(${JSON.stringify(selector)})]
      .filter((element) => element.textContent.trim() === ${JSON.stringify(text)}).length
  `);
  assert(count === 1, `Expected one ${selector} named ${text}; found ${count}`);
  await evaluate(`
    [...document.querySelectorAll(${JSON.stringify(selector)})]
      .find((element) => element.textContent.trim() === ${JSON.stringify(text)}).click()
  `);
}

async function clickWithin(containerSelector, selector, text) {
  const count = await evaluate(`
    [...document.querySelector(${JSON.stringify(containerSelector)}).querySelectorAll(${JSON.stringify(selector)})]
      .filter((element) => element.textContent.trim() === ${JSON.stringify(text)}).length
  `);
  assert(count === 1, `Expected one ${selector} named ${text} in ${containerSelector}; found ${count}`);
  await evaluate(`
    [...document.querySelector(${JSON.stringify(containerSelector)}).querySelectorAll(${JSON.stringify(selector)})]
      .find((element) => element.textContent.trim() === ${JSON.stringify(text)}).click()
  `);
}

async function bodyIncludes(text) {
  return evaluate(`document.body.innerText.includes(${JSON.stringify(text)})`);
}

async function screenshot(name) {
  const result = await command("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
    fromSurface: true,
  });
  const path = join(ARTIFACT_DIR, name);
  await writeFile(path, Buffer.from(result.data, "base64"));
  return path;
}

async function assertTextAbsent(terms, label) {
  const found = await evaluate(`
    (() => {
      const text = document.body.innerText.toLowerCase();
      return ${JSON.stringify(terms)}.filter((term) => text.includes(term.toLowerCase()));
    })()
  `);
  assert(found.length === 0, `${label} leaked forbidden text: ${found.join(", ")}`);
}

/**
 * Every competency-rating token, in BOTH vocabularies.
 *
 * The four ratified Amendment 006 A-049 labels the frontend contract now declares (F-06 / V3),
 * plus the three superseded labels it no longer declares. The superseded tokens are RETAINED
 * deliberately: A-052 records that an assertion left pinned to labels that no longer exist
 * "continues to pass while checking for values that no longer exist" — so this list checks the
 * live vocabulary AND keeps the old one as a regression guard, rather than swapping one pin for
 * another. A Parent surface must render none of them as a rating, under either vocabulary.
 *
 * `advanced` appears here as a superseded COMPETENCY RATING only. `Advanced` is still a Class
 * Grade (A-054) and is classified by actual context below, never by keyword.
 */
const RATING_TOKENS = [
  "beginning",
  "developing",
  "mastering",
  "mastered",
  "emerging",
  "secure",
  "advanced",
];

/**
 * Load-bearing privacy evidence for operator ruling R-B6 (CLAUDE.md §6; A-021; A-038; A-048;
 * GLOBAL_UI_RULES §5): proves NO rating token renders on a Parent surface.
 *
 * Screen 32's frozen reference draws an aggregate rating chip on every report row. That chip
 * is deliberately not implemented, and this assertion is what proves it stayed unimplemented —
 * on the list, on the Parent home surface and on the canonical report detail.
 *
 * The check is deliberately NOT a bare-word prose regex. Amendment 006 A-052 expressly
 * PROHIBITS `\b(beginning|developing|mastering|mastered)\b`, because "at the beginning of the
 * session" and "has mastered maintaining eye contact" are legal parent-facing prose that a
 * canonical narrative may legitimately contain. What is detected instead is precisely the form
 * A-052 authorises — an ISOLATED raw label presented as a rendered value: any leaf element
 * (chip, badge, pill, cell, span) whose ENTIRE text is one token, and any element carrying a
 * rating-bearing data attribute.
 *
 * Class Grade is a different vocabulary and is unchanged (A-054): `Beginner` / `Intermediate` /
 * `Advanced` are class grades, not ratings. No Parent surface renders a Class Grade today; if
 * one ever does it must mark itself `data-vocabulary="class-grade"`, which this guard skips.
 * Occurrences are classified by actual context, never by keyword.
 */
async function assertNoRatingTokenRendered(label) {
  const offenders = await evaluate(`
    (() => {
      const tokens = ${JSON.stringify(RATING_TOKENS)};
      const found = [];
      for (const element of document.body.querySelectorAll("*")) {
        if (element.closest('[data-vocabulary="class-grade"]')) continue;
        if (element.hasAttribute("data-rating") || element.hasAttribute("data-rating-level")) {
          found.push(element.tagName.toLowerCase() + "[data-rating]");
          continue;
        }
        if (element.children.length > 0) continue;
        const text = (element.textContent || "").trim().toLowerCase().replace(/[.,:;!?·|-]+$/, "").trim();
        if (tokens.includes(text)) {
          found.push(element.tagName.toLowerCase() + '="' + text + '"');
        }
      }
      return found;
    })()
  `);
  assert(
    offenders.length === 0,
    `${label} rendered a raw competency-rating token: ${offenders.join(", ")}`,
  );
}

async function completeTrainerChecklist() {
  const count = await evaluate(`document.querySelectorAll('input[type="checkbox"]').length`);
  assert(count === 3, `Expected three Trainer checklist items; found ${count}`);
  for (let index = 0; index < 3; index += 1) {
    await waitUntil(
      `!document.querySelectorAll('input[type="checkbox"]')[${index}].disabled`,
      `Trainer checklist item ${index + 1} enabled`,
    );
    await evaluate(`document.querySelectorAll('input[type="checkbox"]')[${index}].click()`);
    await waitUntil(
      `document.querySelectorAll('input[type="checkbox"]')[${index}].checked`,
      `Trainer checklist item ${index + 1} checked`,
    );
  }
}

async function approveAsTrainer() {
  await completeTrainerChecklist();
  await clickExact("button", "Approve");
  await waitUntil(
    "document.body.innerText.includes('Approve for management review')",
    "Trainer approval dialog",
  );
  await clickWithin('[role="dialog"]', "button", "Approve for management review");
  await waitUntil(
    "document.body.innerText.includes('Trainer approval saved')",
    "Trainer approval success",
  );
}

try {
  const targets = await retry(async () => {
    const response = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
    if (!response.ok) throw new Error("Chrome debugging endpoint is not ready");
    return response.json();
  });
  const target = targets.find((item) => item.type === "page");
  assert(target?.webSocketDebuggerUrl, "No Chrome page debugging target was found");

  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const request = pending.get(message.id);
      if (!request) return;
      pending.delete(message.id);
      if (message.error) request.reject(new Error(message.error.message));
      else request.resolve(message.result);
      return;
    }
    if (message.method === "Runtime.exceptionThrown") {
      consoleErrors.push(message.params.exceptionDetails.text);
    }
    if (
      message.method === "Runtime.consoleAPICalled" &&
      ["error", "assert"].includes(message.params.type)
    ) {
      consoleErrors.push(
        message.params.args.map((argument) => argument.value ?? argument.description).join(" "),
      );
    }
    if (message.method === "Log.entryAdded" && message.params.entry.level === "error") {
      consoleErrors.push(message.params.entry.text);
    }
    const waiters = eventWaiters.get(message.method);
    const waiter = waiters?.shift();
    if (waiter) waiter(message.params);
  });

  await command("Page.enable");
  await command("Runtime.enable");
  await command("Log.enable");

  await navigate("/login?role=management");
  await waitUntil(
    "document.body.innerText.includes('Frontend Round F2 fixture')",
    "F2 role presentation",
  );
  assert(await bodyIncludes("Selecting a role changes presentation only"), "Role query warning is missing");
  await evaluate("sessionStorage.clear()");

  await navigate("/parent/reports");
  await waitUntil("document.body.innerText.includes('Learner Fern')", "initial Parent report list");
  assert(!(await bodyIncludes("Learner Birch")), "Trainer working content reached the Parent list");
  await assertNoRatingTokenRendered("Parent report list (screen 32, initial)");
  await navigate("/parent");
  await waitUntil("document.body.innerText.includes('Family reports')", "Parent home surface");
  await assertNoRatingTokenRendered("Parent home surface");

  await navigate("/trainer/reports/report-birch/review");
  await waitUntil("document.body.innerText.includes('Quality Checklist')", "Birch Trainer review");
  await approveAsTrainer();

  await navigate("/parent/reports");
  await waitUntil("document.body.innerText.includes('Learner Fern')", "Parent list after Trainer approval");
  assert(!(await bodyIncludes("Learner Birch")), "Trainer approval made Birch parent-visible");

  await navigate("/management/reports/report-birch/review");
  await waitUntil("document.body.innerText.includes('Final quality decision')", "Management safe review");
  await assertTextAbsent(
    [
      "Beginning",
      "Developing",
      "Mastering",
      "Mastered",
      "Emerging",
      "Secure",
      "Observation notes",
      "Attendance",
      "Evidence confirms rating",
      "Quality Checklist",
      "Coach Notes",
      "content hash",
      "revision",
      "AI history",
    ],
    "Management review DOM",
  );
  const managementScreenshot = await screenshot("management-safe-review.png");

  await clickExact("a", "Edit wording");
  await waitUntil("document.querySelectorAll('textarea').length === 4", "Management four-panel editor");
  await evaluate(`
    const element = document.querySelector('textarea');
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(
      element,
      element.value + ' The confident opening was especially clear.'
    );
    element.dispatchEvent(new Event('input', { bubbles: true }));
  `);
  await clickExact("button", "Save wording changes");
  await waitUntil("document.body.innerText.includes('Wording changes saved')", "Management wording save");
  await clickExact("a", "Return to safe review");
  await waitUntil("document.body.innerText.includes('The confident opening was especially clear.')", "saved wording in review");

  await clickExact("button", "Return assessment concern");
  await waitUntil("document.body.innerText.includes('Exact issue scope')", "bounded return dialog");
  assert(
    await bodyIncludes("Grammar, clarity, tone, and presentation belong in the wording editor"),
    "Return dialog does not distinguish wording edits",
  );
  await evaluate(`
    const field = [...document.querySelectorAll('textarea')]
      .find((element) => element.closest('[role="dialog"]'));
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(
      field,
      'Please re-check that the stated strength is supported before reapproval.'
    );
    field.dispatchEvent(new Event('input', { bubbles: true }));
  `);
  await clickWithin('[role="dialog"]', "button", "Return to Trainer");
  await waitUntil("document.body.innerText.includes('Returned to the Trainer')", "Management return success");

  await navigate("/management/reports?status=trainer_approved");
  await waitUntil("document.body.innerText.includes('Pending final review')", "pending queue after return");
  assert(!(await bodyIncludes("Learner Birch")), "Returned Birch remained in pending review");
  await navigate("/management/reports?status=needs_edit");
  await waitUntil("document.body.innerText.includes('Learner Birch')", "correction tracking queue");
  assert(
    await bodyIncludes("Please re-check that the stated strength is supported"),
    "Management correction reason was not tracked",
  );

  await navigate("/parent/reports");
  await waitUntil("document.body.innerText.includes('Learner Fern')", "Parent list after return");
  assert(!(await bodyIncludes("Learner Birch")), "Returned Birch reached the Parent list");

  await navigate("/trainer/reports/report-birch/review");
  await waitUntil("document.body.innerText.includes('Returned for Trainer correction')", "Trainer correction detail");
  assert(
    await bodyIncludes("Please re-check that the stated strength is supported"),
    "Trainer did not receive the bounded reason",
  );
  await clickExact("a", "Correct or reaffirm");
  await waitUntil("document.body.innerText.includes('Correction outcome')", "Trainer correction editor");
  await evaluate(`document.querySelector('input[value="reaffirmed"]').click()`);
  await waitUntil(
    `[...document.querySelectorAll('button')].some((button) => button.textContent.trim() === 'Create reaffirmation version' && !button.disabled)`,
    "explicit reaffirmation enabled",
  );
  await clickExact("button", "Create reaffirmation version");
  await waitUntil("document.body.innerText.includes('Fresh correction version created')", "fresh correction version");
  assert(
    await evaluate(`[...document.querySelectorAll('input[type="checkbox"]')].every((input) => !input.checked)`),
    "Correction checklist was not fresh",
  );
  await approveAsTrainer();

  await navigate("/management/reports?status=trainer_approved");
  await waitUntil("document.body.innerText.includes('Learner Birch')", "Birch returned to Management");
  await navigate("/management/reports/report-birch/review");
  await waitUntil("document.body.innerText.includes('Final quality decision')", "reapproved Management review");
  await clickExact("button", "Approve & Submit");
  await waitUntil("document.body.innerText.includes('Approve & Submit this report?')", "final submission dialog");
  await clickWithin('[role="dialog"]', "button", "Approve & Submit");
  await waitUntil("document.body.innerText.includes('Report submitted')", "Management final submission");

  await navigate("/parent/reports");
  await waitUntil("document.body.innerText.includes('Learner Birch')", "Parent availability after submission");
  assert(
    await evaluate(`[...document.querySelectorAll('h2')].filter((heading) => heading.textContent.trim() === 'Learner Birch').length === 1`),
    "Parent list did not contain exactly one Birch report",
  );
  /*
   * Screen 32 after a real submission — the state the frozen frame draws its aggregate rating
   * chip in. The chip is not implemented (operator ruling R-B6) and this proves it.
   */
  await assertNoRatingTokenRendered("Parent report list (screen 32, after submission)");
  const parentListScreenshot = await screenshot("parent-reports-list.png");
  await navigate("/parent/students/student-birch/sessions/session-storytelling-lab/report");
  await waitUntil("document.body.innerText.includes('The confident opening was especially clear.')", "canonical Birch detail");
  assert(
    (await evaluate(`document.querySelectorAll('[data-testid="parent-canonical-report"] article').length`)) === 4,
    "Parent canonical detail did not contain exactly four panels",
  );
  await assertTextAbsent(
    [
      "Beginning",
      "Developing",
      "Mastering",
      "Mastered",
      "Emerging",
      "Secure",
      "Observation",
      "Trainer note",
      "Correction",
      "content hash",
      "revision",
      "audit",
      "report status",
    ],
    "Parent canonical DOM",
  );
  await assertNoRatingTokenRendered("Parent canonical report detail (screen 33)");
  const parentScreenshot = await screenshot("parent-canonical-report.png");

  await navigate("/parent?preview=none");
  await waitUntil("document.body.innerText.includes('No reports available yet')", "Parent empty state");
  await navigate("/parent?preview=linked_unavailable");
  await waitUntil("document.body.innerText.includes('Family view unavailable')", "linked unavailable state");
  await navigate("/parent/students/missing/sessions/missing/report");
  await waitUntil("document.body.innerText.includes(\"This item isn't available\")", "Parent unavailable state");
  const unavailableCopy = await evaluate(`
    (() => {
      const heading = [...document.querySelectorAll('h1')]
        .find((element) => element.textContent.includes("isn't available"));
      return heading.parentElement.innerText;
    })()
  `);
  await navigate("/parent/students/denied/sessions/denied/report");
  await waitUntil("document.body.innerText.includes(\"This item isn't available\")", "Parent denied state");
  const deniedCopy = await evaluate(`
    (() => {
      const heading = [...document.querySelectorAll('h1')]
        .find((element) => element.textContent.includes("isn't available"));
      return heading.parentElement.innerText;
    })()
  `);
  assert(unavailableCopy === deniedCopy, "Denied and unavailable Parent states disclosed different details");

  await navigate("/management/reports?status=trainer_approved&preview=empty");
  await waitUntil("document.body.innerText.includes('No reports waiting')", "Management empty queue");
  await navigate("/management/reports/missing/review");
  await waitUntil("document.body.innerText.includes(\"This item isn't available\")", "Management unavailable state");
  await navigate("/management/reports/denied/review");
  await waitUntil("document.body.innerText.includes(\"This item isn't available\")", "Management denied state");

  assert(consoleErrors.length === 0, `Browser console/runtime errors: ${consoleErrors.join(" | ")}`);
  console.log(
    JSON.stringify(
      {
        result: "passed",
        checks: [
          "role presentation grants no authority",
          "Trainer approval remains Parent-invisible",
          "Management safe review and four-panel wording edit",
          "bounded return and durable correction tracking",
          "Trainer explicit reaffirmation, fresh checklist, and reapproval",
          "Management final submission and canonical Parent availability",
          "Management and Parent DOM privacy exclusions",
          "no competency-rating token renders on any Parent surface (R-B6)",
          "loading, empty, linked-unavailable, unavailable, and denied states",
          "zero uncaught browser-console/runtime errors",
        ],
        screenshots: [managementScreenshot, parentListScreenshot, parentScreenshot],
      },
      null,
      2,
    ),
  );
} finally {
  socket?.close();
  chrome.kill();
  await new Promise((resolve) => setTimeout(resolve, 500));
  await rm(profileDirectory, { recursive: true, force: true, maxRetries: 4, retryDelay: 250 }).catch(
    () => undefined,
  );
}
