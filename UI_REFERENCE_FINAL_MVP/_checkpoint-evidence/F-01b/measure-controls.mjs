/**
 * F-01b diagnostic: measure rendered contrast of every form control across the three
 * portal surfaces in a PRODUCTION build. Runs entirely outside Git.
 *
 * Usage: node measure-controls.mjs <outputJsonPath>
 * Requires the production server already listening on BEST_COACH_APP_ORIGIN.
 */
import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const OUT = process.argv[2];
if (!OUT) throw new Error("Output path required");

const APP_ORIGIN = process.env.BEST_COACH_APP_ORIGIN ?? "http://127.0.0.1:3000";
const CHROME_PATH =
  process.env.CHROME_PATH ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const DEBUG_PORT = Number(process.env.F01B_PORT ?? 9341);
const profileDirectory = await mkdtemp(join(tmpdir(), "best-coach-f01b-chrome-"));

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

async function retry(operation, timeoutMs = 20_000) {
  const deadline = Date.now() + timeoutMs;
  let lastError;
  while (Date.now() < deadline) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 120));
    }
  }
  throw lastError ?? new Error("Operation timed out");
}

function waitForEvent(method, timeoutMs = 20_000) {
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

async function waitUntil(expression, description, timeoutMs = 20_000) {
  return retry(async () => {
    const result = await evaluate(expression);
    if (!result) throw new Error(`Waiting for ${description}`);
    return result;
  }, timeoutMs);
}

async function navigate(path) {
  const loaded = waitForEvent("Page.loadEventFired", 25_000);
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
  await evaluate(`
    [...document.querySelector(${JSON.stringify(containerSelector)}).querySelectorAll(${JSON.stringify(selector)})]
      .find((element) => element.textContent.trim() === ${JSON.stringify(text)}).click()
  `);
}

/** Injected page-side measurement. Pure DOM/computed-style; no assumptions from the token table. */
const MEASURE = String.raw`
(() => {
  // Parse ANY computed CSS colour (rgb, oklch, oklab, color(), color-mix) exactly, by
  // letting the browser rasterize it onto a transparent canvas and reading back the
  // un-premultiplied RGBA. No string-format assumptions.
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const parse = (value) => {
    if (!value || value === "transparent" || value === "none") {
      return { r: 0, g: 0, b: 0, a: 0 };
    }
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = "#000000";
    ctx.fillStyle = value;
    if (ctx.fillStyle === "#000000" && !/^(#000000|black|rgb\(0, 0, 0\))$/i.test(value.trim())) {
      // fillStyle rejected the value and kept the sentinel — unparseable.
      return null;
    }
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    return { r, g, b, a: a / 255 };
  };
  const over = (fg, bg) => ({
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1,
  });
  const lum = (c) => {
    const f = (v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };
  const ratio = (a, b) => {
    const l1 = lum(a), l2 = lum(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };
  const hex = (c) =>
    "#" + [c.r, c.g, c.b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

  // Effective background: composite the element's own background over its ancestors'.
  const effectiveBackground = (element) => {
    const stack = [];
    let node = element;
    while (node && node.nodeType === 1) {
      const raw = getComputedStyle(node).backgroundColor;
      const bg = parse(raw);
      if (bg === null) throw new Error("Unparseable background-color: " + raw);
      if (bg.a > 0) stack.push(bg);
      node = node.parentElement;
    }
    let base = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = stack.length - 1; i >= 0; i -= 1) base = over(stack[i], base);
    return base;
  };

  const results = [];
  for (const element of document.querySelectorAll("button, input, textarea, select")) {
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;
    const style = getComputedStyle(element);
    const type = element.getAttribute("type");
    const isTextInput =
      element.tagName !== "INPUT" || !["checkbox", "radio", "hidden", "range", "file"].includes(type ?? "");
    const label = (element.tagName === "INPUT" || element.tagName === "TEXTAREA")
      ? (element.value || element.placeholder || element.getAttribute("aria-label") || "")
      : (element.textContent || "").trim();
    if (!isTextInput && !label) {
      // Non-text control (checkbox/radio): record but do not treat as text contrast.
    }
    const bg = effectiveBackground(element);
    const fgRaw = parse(style.color);
    if (!fgRaw) {
      results.push({ tag: element.tagName.toLowerCase(), unparseableColor: style.color });
      continue;
    }
    const fg = over(fgRaw, bg);
    const size = parseFloat(style.fontSize);
    const weight = Number(style.fontWeight) || 400;
    const largeText = size >= 24 || (size >= 18.66 && weight >= 700);
    const r = ratio(fg, bg);
    results.push({
      tag: element.tagName.toLowerCase(),
      type: type ?? null,
      label: label.slice(0, 60),
      disabled: Boolean(element.disabled),
      color: hex(fg),
      background: hex(bg),
      fontSizePx: size,
      fontWeight: weight,
      largeText,
      textBearing: isTextInput && label.length > 0,
      ratio: Math.round(r * 1000) / 1000,
      required: largeText ? 3 : 4.5,
      passes: r >= (largeText ? 3 : 4.5),
      classes: (element.getAttribute("class") || "").slice(0, 200),
    });
  }
  return results;
})()
`;

const surfaces = [];

async function capture(name, path) {
  // Buttons carry `transition`; background-color animates. Let every transition settle
  // before reading computed styles, otherwise a mid-transition colour is measured.
  await new Promise((resolve) => setTimeout(resolve, 900));
  const controls = await evaluate(MEASURE);
  surfaces.push({ surface: name, route: path, controls });
  return controls;
}

async function findControl(name, matcher) {
  const surface = surfaces.find((item) => item.surface === name);
  return surface.controls.find(matcher);
}

const ratingSelections = [
  "Secure",
  "Developing",
  "Secure",
  "Emerging",
  "Developing",
  "Emerging",
  "Secure",
  "Advanced",
  "Developing",
];

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

  /* ---- static surfaces ---- */
  const staticRoutes = [
    ["login-trainer", "/login?role=trainer"],
    ["login-management", "/login?role=management"],
    ["login-parent", "/login?role=parent"],
    ["trainer-dashboard", "/trainer"],
    ["trainer-roster", "/trainer/sessions/session-storytelling-lab/roster"],
    ["trainer-reports", "/trainer/reports"],
    ["management-dashboard", "/management"],
    ["management-reports", "/management/reports"],
    ["parent-dashboard", "/parent"],
    ["parent-reports", "/parent/reports"],
  ];
  for (const [name, route] of staticRoutes) {
    await navigate(route);
    await waitUntil("document.readyState === 'complete'", route);
    await new Promise((resolve) => setTimeout(resolve, 400));
    await capture(name, route);
  }

  /* ---- Surface 1: Trainer "Save observation & generate draft", ENABLED ---- */
  await navigate("/trainer/sessions/session-storytelling-lab/students/student-aster/assess");
  await waitUntil("document.body.innerText.includes('0 of 9 dimensions rated')", "assessment form");
  await capture("trainer-assess-initial", "/trainer/.../assess (before rating)");
  await evaluate(`
    ${JSON.stringify(ratingSelections)}.forEach((rating, index) => {
      const button = [...document.querySelectorAll('fieldset')[index].querySelectorAll('button')]
        .find((candidate) => candidate.textContent.trim() === rating);
      button.click();
    })
  `);
  await waitUntil("document.body.innerText.includes('9 of 9 dimensions rated')", "complete assessment");
  await waitUntil(
    `[...document.querySelectorAll('button')].some((b) => b.textContent.trim() === 'Save observation & generate draft' && !b.disabled)`,
    "enabled trainer save",
  );
  await capture("trainer-assess-complete", "/trainer/.../assess (9 of 9 rated)");

  /* ---- Surface 2: Management "Approve & Submit", ENABLED ---- */
  await navigate("/trainer/reports/report-birch/review");
  await waitUntil("document.body.innerText.includes('Quality Checklist')", "Birch Trainer review");
  for (let index = 0; index < 3; index += 1) {
    await waitUntil(
      `!document.querySelectorAll('input[type="checkbox"]')[${index}].disabled`,
      `checklist ${index + 1} enabled`,
    );
    await evaluate(`document.querySelectorAll('input[type="checkbox"]')[${index}].click()`);
    await waitUntil(
      `document.querySelectorAll('input[type="checkbox"]')[${index}].checked`,
      `checklist ${index + 1} checked`,
    );
  }
  await capture("trainer-review-checklist-complete", "/trainer/reports/report-birch/review");
  await clickExact("button", "Approve");
  await waitUntil(
    "document.body.innerText.includes('Approve for management review')",
    "Trainer approval dialog",
  );
  await capture("trainer-approval-dialog", "/trainer/reports/report-birch/review (dialog)");
  await clickWithin('[role="dialog"]', "button", "Approve for management review");
  await waitUntil(
    "document.body.innerText.includes('Trainer approval saved')",
    "Trainer approval success",
  );

  await navigate("/management/reports/report-birch/review");
  await waitUntil("document.body.innerText.includes('Final quality decision')", "Management review");
  await waitUntil(
    `[...document.querySelectorAll('button')].some((b) => b.textContent.trim() === 'Approve & Submit')`,
    "Approve & Submit present",
  );
  await capture("management-final-review", "/management/reports/report-birch/review");

  await clickExact("a", "Edit wording");
  await waitUntil("document.querySelectorAll('textarea').length === 4", "Management wording editor");
  await capture("management-wording-editor", "/management/reports/report-birch/edit");

  const named = {
    "management Approve & Submit": await findControl(
      "management-final-review",
      (c) => c.label === "Approve & Submit",
    ),
    "trainer Save observation & generate draft (enabled)": await findControl(
      "trainer-assess-complete",
      (c) => c.label === "Save observation & generate draft" && !c.disabled,
    ),
  };

  const failures = surfaces.flatMap((surface) =>
    surface.controls
      .filter((c) => c.textBearing && !c.disabled && !c.passes)
      .map((c) => ({ surface: surface.surface, ...c })),
  );

  await writeFile(
    OUT,
    JSON.stringify({ origin: APP_ORIGIN, named, failures, surfaces, consoleErrors }, null, 2),
  );
  console.log(
    JSON.stringify(
      {
        result: "measured",
        surfaces: surfaces.length,
        controlsMeasured: surfaces.reduce((total, s) => total + s.controls.length, 0),
        named: Object.fromEntries(
          Object.entries(named).map(([k, v]) => [
            k,
            v ? { color: v.color, background: v.background, ratio: v.ratio, passes: v.passes, fontSizePx: v.fontSizePx, fontWeight: v.fontWeight } : "NOT FOUND",
          ]),
        ),
        enabledTextFailures: failures.length,
        consoleErrors: consoleErrors.length,
        output: OUT,
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
