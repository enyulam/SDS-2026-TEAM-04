/**
 * Authentication reconstruction browser smoke.
 *
 * Covers the shared shell (FRONTEND RECONSTRUCTION F2) and the three role checkpoints —
 * F3 AUTH-01 Trainer, F10 AUTH-02 Management, F13 AUTH-03 Parent.
 *
 * These assertions are about presentation, accessibility, non-disclosure and the absolute
 * rule that the `role` query grants nothing. They assert no authentication behaviour,
 * because real Supabase Auth is not wired on this branch.
 *
 * No credential is ever typed, read, stored or captured by this suite.
 */

import { spawn } from "node:child_process";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const APP_ORIGIN = process.env.BEST_COACH_APP_ORIGIN ?? "http://127.0.0.1:3000";
const CHROME_PATH =
  process.env.CHROME_PATH ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const DEBUG_PORT = 9345;
const ARTIFACT_DIR = join(tmpdir(), "best-coach-auth-browser-smoke");
const profileDirectory = await mkdtemp(join(tmpdir(), "best-coach-auth-chrome-"));

/** The viewport the three login references were captured at. */
const VIEWPORT = { width: 1440, height: 1024 };

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
    `--window-size=${VIEWPORT.width},${VIEWPORT.height}`,
    "about:blank",
  ],
  { stdio: "ignore", windowsHide: true },
);
chrome.unref();

let socket;
let messageId = 0;
const pending = new Map();
const consoleErrors = [];
const checks = [];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function record(label) {
  checks.push(label);
}

async function findPageTarget() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
      const targets = await response.json();
      const page = targets.find((target) => target.type === "page");
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {
      // Chrome is not listening yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Chrome did not expose a page target");
}

function send(method, params = {}) {
  messageId += 1;
  const id = messageId;
  return new Promise((resolve) => {
    pending.set(id, resolve);
    socket.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(expression) {
  const response = await send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (response.result?.exceptionDetails) {
    throw new Error(
      `Evaluate failed: ${response.result.exceptionDetails.text} — ${expression}`,
    );
  }
  return response.result?.result?.value;
}

async function navigate(path) {
  await send("Page.navigate", { url: `${APP_ORIGIN}${path}` });
  await new Promise((resolve) => setTimeout(resolve, 900));
}

async function waitUntil(expression, label) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (await evaluate(expression)) return;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Timed out waiting for ${label}`);
}

async function bodyIncludes(text) {
  return evaluate(`document.body.innerText.includes(${JSON.stringify(text)})`);
}

async function screenshot(name) {
  const shot = await send("Page.captureScreenshot", { format: "png" });
  const path = join(ARTIFACT_DIR, name);
  await writeFile(path, Buffer.from(shot.result.data, "base64"));
  return path;
}

const wsUrl = await findPageTarget();
socket = new WebSocket(wsUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    pending.get(message.id)(message);
    pending.delete(message.id);
    return;
  }
  if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") {
    consoleErrors.push(
      message.params.args?.map((arg) => arg.value ?? arg.description ?? "").join(" ") ??
        "console error",
    );
  }
  if (message.method === "Runtime.exceptionThrown") {
    consoleErrors.push(message.params.exceptionDetails?.text ?? "uncaught exception");
  }
  if (message.method === "Log.entryAdded" && message.params.entry.level === "error") {
    consoleErrors.push(message.params.entry.text);
  }
});

await send("Page.enable");
await send("Runtime.enable");
await send("Log.enable");
await send("Emulation.setDeviceMetricsOverride", {
  width: VIEWPORT.width,
  height: VIEWPORT.height,
  deviceScaleFactor: 1,
  mobile: false,
});

const screenshots = [];

/* ---------------------------------------------------------------------------
 * Shared shell — F2
 * ------------------------------------------------------------------------- */

await navigate("/login?role=trainer");
await waitUntil(
  "document.body.innerText.includes('Sign in as')",
  "shared authentication shell",
);

assert(
  await evaluate(`document.querySelectorAll('[data-role-segment]').length === 3`),
  "The Sign in as selector must offer exactly three role segments",
);
assert(
  await bodyIncludes("Sign in"),
  "The shared heading is missing",
);
assert(
  await bodyIncludes("Welcome back — enter your credentials to continue."),
  "The shared supporting copy is missing",
);
assert(
  await evaluate(`!!document.querySelector('input[type="email"]')`),
  "The email field is missing",
);
assert(
  await evaluate(`!!document.querySelector('input[type="password"]')`),
  "The password field is missing",
);
assert(
  await bodyIncludes("Remember me") && (await bodyIncludes("Forgot password?")),
  "The credential options row is missing",
);
assert(
  await bodyIncludes("Need access? Contact your school administrator."),
  "The closing help line is missing",
);
record("shared shell: brand, role selector, heading pair, fields, options row, help line");

// Every field carries a programmatic label.
assert(
  await evaluate(`
    [...document.querySelectorAll('input:not([type="checkbox"])')].every((input) =>
      !!(input.labels && input.labels.length) || !!input.getAttribute('aria-label'))
  `),
  "Every credential input must have an accessible label",
);
assert(
  await evaluate(`
    !!document.querySelector('input[type="checkbox"]')?.labels?.length
  `),
  "The Remember me checkbox must have an accessible label",
);
assert(
  await evaluate(`!!document.querySelector('h1')`),
  "The authentication screen must expose a level-one heading",
);
record("accessibility: labelled fields, labelled checkbox, h1 present");

// The provisional dark authentication presentation is retired.
assert(
  !(await bodyIncludes("Human judgement stays in the loop.")),
  "The provisional dark login panel must be retired",
);
assert(
  !(await bodyIncludes("Trainer-led reporting")),
  "The provisional dark login eyebrow must be retired",
);
const authBackground = await evaluate(
  `getComputedStyle(document.querySelector('main')).backgroundColor`,
);
assert(
  authBackground === "rgb(255, 255, 255)",
  `The authentication page must render on the white reference canvas, got ${authBackground}`,
);
record("F1 provisional dark authentication presentation retired");

// The password reveal control toggles type only.
assert(
  await evaluate(`document.querySelector('input[name="password"]').type === 'password'`),
  "The password field must start masked",
);
await evaluate(
  `[...document.querySelectorAll('button')].find((b) => b.getAttribute('aria-controls'))?.click()`,
);
await new Promise((resolve) => setTimeout(resolve, 200));
assert(
  await evaluate(`document.querySelector('input[name="password"]').type === 'text'`),
  "The reveal control must unmask the password field",
);
assert(
  await evaluate(`document.querySelector('input[name="password"]').value === ''`),
  "The password field must hold no value",
);
await evaluate(
  `[...document.querySelectorAll('button')].find((b) => b.getAttribute('aria-controls'))?.click()`,
);
await new Promise((resolve) => setTimeout(resolve, 200));
assert(
  await evaluate(`document.querySelector('input[name="password"]').type === 'password'`),
  "The reveal control must re-mask the password field",
);
record("password reveal toggles type only and stores no value");

/* ---------------------------------------------------------------------------
 * Per-role selection state — F3, F10, F13
 * ------------------------------------------------------------------------- */

const roleCases = [
  { role: "trainer", label: "Trainer", home: "/trainer", shot: "auth-01-trainer.png" },
  {
    role: "management",
    label: "Management",
    home: "/management",
    shot: "auth-02-management.png",
  },
  { role: "parent", label: "Parent", home: "/parent", shot: "auth-03-parent.png" },
];

for (const testCase of roleCases) {
  await navigate(`/login?role=${testCase.role}`);
  await waitUntil(
    "document.body.innerText.includes('Sign in as')",
    `${testCase.label} login presentation`,
  );

  // Exactly one segment reads as selected, and it is this role.
  assert(
    await evaluate(
      `document.querySelectorAll('[data-role-segment][data-selected="true"]').length === 1`,
    ),
    `${testCase.label}: exactly one role segment must read as selected`,
  );
  assert(
    await evaluate(
      `document.querySelector('[data-role-segment="${testCase.role}"]').dataset.selected === 'true'`,
    ),
    `${testCase.label}: its own segment must be the selected one`,
  );
  assert(
    await evaluate(
      `document.querySelector('[data-role-segment="${testCase.role}"]').getAttribute('aria-current') === 'page'`,
    ),
    `${testCase.label}: the selected segment must expose aria-current="page"`,
  );
  assert(
    await evaluate(
      `[...document.querySelectorAll('[data-role-segment]')].filter((el) => el.dataset.selected !== 'true').every((el) => el.getAttribute('aria-current') === null)`,
    ),
    `${testCase.label}: unselected segments must not claim aria-current`,
  );

  // Selection is presentation only — it grants nothing and mints no session.
  assert(
    await evaluate(
      `Object.keys(window.localStorage).length === 0 && !document.cookie.includes('role')`,
    ),
    `${testCase.label}: selecting a role must not persist a role, session or credential`,
  );
  assert(
    await bodyIncludes("It never authenticates or authorizes."),
    `${testCase.label}: the presentation-only warning is missing`,
  );
  assert(
    await bodyIncludes("grants no authority"),
    `${testCase.label}: the no-authority notice is missing`,
  );

  // Credential entry stays disabled while real authentication is not wired.
  assert(
    await evaluate(`document.querySelector('input[type="email"]').disabled === true`),
    `${testCase.label}: the email field must remain disabled`,
  );
  assert(
    await evaluate(`document.querySelector('input[type="password"]').disabled === true`),
    `${testCase.label}: the password field must remain disabled`,
  );

  // The fixture entry point targets this role's workspace and no other.
  assert(
    await evaluate(
      `new URL(document.querySelector('[data-fixture-entry]').href).pathname === '${testCase.home}'`,
    ),
    `${testCase.label}: the fixture entry must target ${testCase.home}`,
  );

  // Non-disclosure: no roster, report, child or lifecycle datum before authentication.
  const forbidden = [
    "learner",
    "student",
    "report",
    "roster",
    "approve",
    "submitted",
    "trainer_approved",
    "needs_edit",
    "draft_ready",
    "beginning",
    "developing",
    "mastering",
    "mastered",
  ];
  const leaked = await evaluate(`
    (() => {
      const text = document.body.innerText.toLowerCase();
      return ${JSON.stringify(forbidden)}.filter((term) => text.includes(term));
    })()
  `);
  assert(
    Array.isArray(leaked) && leaked.length === 0,
    `${testCase.label}: pre-authentication disclosure of ${JSON.stringify(leaked)}`,
  );

  // No credential is ever pre-filled or suggested. Scoped to credential-bearing inputs —
  // a checkbox reports the HTML default value "on" and carries no credential.
  assert(
    await evaluate(
      `[...document.querySelectorAll('input[type="email"], input[type="password"], input[type="text"]')].every((input) => input.value === '')`,
    ),
    `${testCase.label}: no credential may be pre-filled`,
  );

  // Keyboard reachability: the role segments and the primary action are focusable.
  assert(
    await evaluate(`
      [...document.querySelectorAll('[data-role-segment], [data-fixture-entry]')]
        .every((el) => el.tabIndex >= 0 || el.tagName === 'A')
    `),
    `${testCase.label}: role segments and the primary action must be keyboard reachable`,
  );

  screenshots.push(await screenshot(testCase.shot));
  record(`${testCase.label}: selection state, non-disclosure, disabled credentials, entry target`);
}

/* ---------------------------------------------------------------------------
 * An unknown or absent role must fall back and must grant nothing.
 * ------------------------------------------------------------------------- */

for (const path of ["/login", "/login?role=admin", "/login?role=management%20trainer"]) {
  await navigate(path);
  await waitUntil("document.body.innerText.includes('Sign in as')", `fallback for ${path}`);
  assert(
    await evaluate(
      `document.querySelectorAll('[data-role-segment][data-selected="true"]').length === 1`,
    ),
    `${path}: exactly one segment must read as selected`,
  );
  assert(
    await evaluate(
      `document.querySelector('[data-role-segment="trainer"]').dataset.selected === 'true'`,
    ),
    `${path}: an unrecognised role must fall back to the Trainer presentation`,
  );
  assert(
    await evaluate(
      `new URL(document.querySelector('[data-fixture-entry]').href).pathname === '/trainer'`,
    ),
    `${path}: the fallback must not target another role's workspace`,
  );
}
record("unknown, absent and malformed role queries fall back and grant nothing");

assert(
  consoleErrors.length === 0,
  `Browser console/runtime errors: ${consoleErrors.join(" | ")}`,
);
record("zero uncaught browser-console/runtime errors");

console.log(
  JSON.stringify(
    {
      result: "passed",
      viewport: `${VIEWPORT.width}x${VIEWPORT.height}`,
      checks,
      screenshots,
    },
    null,
    2,
  ),
);

await send("Browser.close");
process.exit(0);
