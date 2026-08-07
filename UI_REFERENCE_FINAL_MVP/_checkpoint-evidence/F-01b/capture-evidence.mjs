/** F-01b diagnostic renders of the two named surfaces plus collateral checks. Outside Git. */
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const OUT_DIR = process.argv[2];
const LABEL = process.argv[3] ?? "after";
await mkdir(OUT_DIR, { recursive: true });

const APP_ORIGIN = process.env.BEST_COACH_APP_ORIGIN ?? "http://127.0.0.1:3000";
const CHROME_PATH =
  process.env.CHROME_PATH ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const DEBUG_PORT = 9361;
const profileDirectory = await mkdtemp(join(tmpdir(), "best-coach-f01b-shot-"));
const chrome = spawn(
  CHROME_PATH,
  [
    "--headless=new",
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${profileDirectory}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-gpu",
    "--window-size=1440,1024",
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

async function retry(op, ms = 25000) {
  const deadline = Date.now() + ms;
  let last;
  while (Date.now() < deadline) {
    try {
      return await op();
    } catch (e) {
      last = e;
      await new Promise((r) => setTimeout(r, 120));
    }
  }
  throw last;
}
function waitForEvent(method, ms = 25000) {
  return new Promise((res, rej) => {
    const t = setTimeout(() => rej(new Error("timeout " + method)), ms);
    const cur = eventWaiters.get(method) ?? [];
    cur.push((p) => {
      clearTimeout(t);
      res(p);
    });
    eventWaiters.set(method, cur);
  });
}
function command(method, params = {}) {
  const id = ++messageId;
  return new Promise((res, rej) => {
    pending.set(id, { resolve: res, reject: rej });
    socket.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression) {
  const r = await command("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? "eval failed");
  return r.result.value;
}
async function waitUntil(e, d, ms = 25000) {
  return retry(async () => {
    const v = await evaluate(e);
    if (!v) throw new Error("waiting " + d);
    return v;
  }, ms);
}
async function navigate(path) {
  const loaded = waitForEvent("Page.loadEventFired", 25000);
  await command("Page.navigate", { url: `${APP_ORIGIN}${path}` });
  await loaded;
  await waitUntil("document.readyState === 'complete'", path);
}
async function shot(name) {
  await new Promise((r) => setTimeout(r, 900));
  const result = await command("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
    fromSurface: true,
  });
  const path = join(OUT_DIR, `${LABEL}-${name}.png`);
  await writeFile(path, Buffer.from(result.data, "base64"));
  return path;
}
async function clickExact(selector, text) {
  await evaluate(`
    [...document.querySelectorAll(${JSON.stringify(selector)})]
      .find((e) => e.textContent.trim() === ${JSON.stringify(text)}).click()
  `);
}
async function clickWithin(container, selector, text) {
  await evaluate(`
    [...document.querySelector(${JSON.stringify(container)}).querySelectorAll(${JSON.stringify(selector)})]
      .find((e) => e.textContent.trim() === ${JSON.stringify(text)}).click()
  `);
}

const written = [];
try {
  const targets = await retry(async () => {
    const r = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
    if (!r.ok) throw new Error("not ready");
    return r.json();
  });
  socket = new WebSocket(targets.find((t) => t.type === "page").webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    socket.addEventListener("open", res, { once: true });
    socket.addEventListener("error", rej, { once: true });
  });
  socket.addEventListener("message", (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id) {
      const req = pending.get(m.id);
      if (!req) return;
      pending.delete(m.id);
      if (m.error) req.reject(new Error(m.error.message));
      else req.resolve(m.result);
      return;
    }
    if (m.method === "Runtime.exceptionThrown") consoleErrors.push(m.params.exceptionDetails.text);
    if (m.method === "Runtime.consoleAPICalled" && ["error", "assert"].includes(m.params.type))
      consoleErrors.push(m.params.args.map((a) => a.value ?? a.description).join(" "));
    if (m.method === "Log.entryAdded" && m.params.entry.level === "error")
      consoleErrors.push(m.params.entry.text);
    const w = eventWaiters.get(m.method);
    const f = w?.shift();
    if (f) f(m.params);
  });
  await command("Page.enable");
  await command("Runtime.enable");
  await command("Log.enable");

  await navigate("/login?role=trainer");
  written.push(await shot("auth-01-trainer-login"));

  // Surface A — Trainer "Save observation & generate draft", enabled
  await navigate("/trainer/sessions/session-storytelling-lab/students/student-aster/assess");
  await waitUntil("document.body.innerText.includes('0 of 9 dimensions rated')", "form");
  written.push(await shot("trainer-assess-disabled-primary"));
  const ratings = ["Secure","Developing","Secure","Emerging","Developing","Emerging","Secure","Advanced","Developing"];
  await evaluate(`
    ${JSON.stringify(ratings)}.forEach((rating, index) => {
      [...document.querySelectorAll('fieldset')[index].querySelectorAll('button')]
        .find((c) => c.textContent.trim() === rating).click();
    })
  `);
  await waitUntil("document.body.innerText.includes('9 of 9 dimensions rated')", "complete");
  await waitUntil(
    `[...document.querySelectorAll('button')].some((b) => b.textContent.trim() === 'Save observation & generate draft' && !b.disabled)`,
    "enabled save",
  );
  written.push(await shot("trainer-assess-enabled-primary"));

  // Surface B — Management "Approve & Submit", enabled
  await navigate("/trainer/reports/report-birch/review");
  await waitUntil("document.body.innerText.includes('Quality Checklist')", "trainer review");
  for (let i = 0; i < 3; i += 1) {
    await waitUntil(`!document.querySelectorAll('input[type="checkbox"]')[${i}].disabled`, `cb${i}`);
    await evaluate(`document.querySelectorAll('input[type="checkbox"]')[${i}].click()`);
    await waitUntil(`document.querySelectorAll('input[type="checkbox"]')[${i}].checked`, `cb${i}chk`);
  }
  written.push(await shot("trainer-review-approve-enabled"));
  await clickExact("button", "Approve");
  await waitUntil("document.body.innerText.includes('Approve for management review')", "dialog");
  written.push(await shot("trainer-approval-dialog"));
  await clickWithin('[role="dialog"]', "button", "Approve for management review");
  await waitUntil("document.body.innerText.includes('Trainer approval saved')", "approved");

  await navigate("/management/reports/report-birch/review");
  await waitUntil("document.body.innerText.includes('Final quality decision')", "mgmt review");
  written.push(await shot("management-final-review-approve-submit"));

  await navigate("/trainer/sessions/session-storytelling-lab/roster");
  await waitUntil("document.body.innerText.includes('Learner Aster')", "roster");
  written.push(await shot("trainer-roster"));

  await navigate("/parent/reports");
  await waitUntil("document.readyState === 'complete'", "parent reports");
  written.push(await shot("parent-reports"));

  console.log(JSON.stringify({ result: "captured", label: LABEL, files: written, consoleErrors }, null, 2));
  if (consoleErrors.length > 0) process.exitCode = 1;
} finally {
  socket?.close();
  chrome.kill();
  await new Promise((r) => setTimeout(r, 400));
  await rm(profileDirectory, { recursive: true, force: true, maxRetries: 4, retryDelay: 250 }).catch(() => undefined);
}
