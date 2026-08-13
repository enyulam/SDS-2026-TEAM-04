/**
 * Authentication reconstruction browser smoke.
 *
 * Covers the shared shell (FRONTEND RECONSTRUCTION F2) and the three role checkpoints —
 * F3 AUTH-01 Trainer, F10 AUTH-02 Management, F13 AUTH-03 Parent.
 *
 * These assertions are about presentation, accessibility, non-disclosure and the absolute
 * rule that the `role` query grants nothing.
 *
 * Updated at F16-A, where the credential fields became enabled and the primary action became
 * a real submit control inside a real form bound to `signInFormAction`. The suite therefore
 * now asserts the SHAPE of that form — a real `<form>`, a real submit button, no hidden role
 * input, no destination anywhere in the markup — and asserts that nothing on the page can
 * pick a post-sign-in destination from the `role` query.
 *
 * NO CREDENTIAL IS EVER TYPED, READ, STORED OR CAPTURED BY THIS SUITE, and none is needed:
 * every assertion here holds WITHOUT a valid password. The suite never attempts a sign-in,
 * because a successful sign-in is not what is under test — non-disclosure is.
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

/**
 * Terms that must not appear on any pre-authentication screen.
 *
 * `shared` covers roster, report and lifecycle vocabulary for every role. The per-role
 * lists add that role's own governed powers and data, so a Management login cannot hint at
 * the review queue or its approval powers, and a Parent login cannot hint at a linked child.
 */
const SHARED_FORBIDDEN = [
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

const roleCases = [
  {
    role: "trainer",
    label: "Trainer",
    home: "/trainer",
    shot: "auth-01-trainer.png",
    // A Trainer login must not hint at assessment work or its nine dimensions.
    forbidden: ["assessment", "observation", "session", "dimension", "checklist"],
  },
  {
    role: "management",
    label: "Management",
    home: "/management/dashboard",
    shot: "auth-02-management.png",
    // A Management login must not hint at the review queue or any governed Management power.
    forbidden: [
      "queue",
      "pending review",
      "final review",
      "wording",
      "correction",
      "return to trainer",
      "publish",
      "submit",
    ],
  },
  {
    role: "parent",
    label: "Parent",
    home: "/parent",
    shot: "auth-03-parent.png",
    // A Parent login must not hint at a linked child or any published content.
    forbidden: ["child", "linked", "your children", "progress", "attendance", "evidence"],
  },
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

  // Credential entry is enabled and posts to the real server action (F16-A).
  assert(
    await evaluate(`document.querySelector('input[type="email"]').disabled === false`),
    `${testCase.label}: the email field must be enabled`,
  );
  assert(
    await evaluate(`document.querySelector('input[type="password"]').disabled === false`),
    `${testCase.label}: the password field must be enabled`,
  );
  assert(
    await evaluate(`
      (() => {
        const form = document.querySelector('form[data-auth-form="sign-in"]');
        if (!form) return false;
        const submit = form.querySelector('[data-auth-submit]');
        return !!submit && submit.tagName === 'BUTTON' && submit.type === 'submit';
      })()
    `),
    `${testCase.label}: the primary action must be a real submit control inside a real form`,
  );
  assert(
    await evaluate(
      `document.querySelector('[data-auth-submit]').innerText.trim() === 'Sign in'`,
    ),
    `${testCase.label}: the primary action must read "Sign in", matching the frozen frame`,
  );

  // The form carries no destination and no role: the server chooses where a successful
  // sign-in lands, from the membership row it derived (A-046).
  assert(
    await evaluate(`
      (() => {
        const form = document.querySelector('form[data-auth-form="sign-in"]');
        const names = [...form.elements].map((el) => el.name).filter(Boolean).sort();
        return JSON.stringify(names) === JSON.stringify(['email', 'password']);
      })()
    `),
    `${testCase.label}: the sign-in form must submit exactly email and password`,
  );
  assert(
    await evaluate(`!document.querySelector('form[data-auth-form="sign-in"] input[type="hidden"]')`),
    `${testCase.label}: the sign-in form must carry no hidden field`,
  );
  assert(
    await evaluate(`!document.querySelector('[data-fixture-entry]')`),
    `${testCase.label}: the fixture entry point must be gone — sign-in is real`,
  );
  assert(
    await evaluate(`
      (() => {
        const targets = [...document.querySelectorAll('a[href]')].map((a) => new URL(a.href).pathname);
        return ['/trainer', '/management', '/parent'].every((home) => !targets.includes(home));
      })()
    `),
    `${testCase.label}: no portal destination may be reachable before authentication`,
  );

  // Non-disclosure: no roster, report, child, lifecycle or role-power datum before
  // authentication — shared vocabulary plus this role's own governed powers and data.
  const forbidden = [...SHARED_FORBIDDEN, ...testCase.forbidden];
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

  // No shared, demo or pre-supplied credential is offered (A-015, A-046).
  const credentialHints = await evaluate(`
    (() => {
      const text = document.body.innerText.toLowerCase();
      return ["demo", "shared login", "shared credential", "test account", "sample password", "default password"]
        .filter((term) => text.includes(term));
    })()
  `);
  assert(
    Array.isArray(credentialHints) && credentialHints.length === 0,
    `${testCase.label}: a shared or demo credential was suggested — ${JSON.stringify(credentialHints)}`,
  );

  // Measured geometry against the frozen frames: the content column is 400 px wide and
  // horizontally centred at the 1440 px reference viewport. Vertical offsets are NOT
  // asserted because this reconstruction carries an additional governance notice the frames
  // do not, which shifts everything below it; vertical ORDER is asserted instead.
  const geometry = await evaluate(`
    (() => {
      const selector = document.querySelector('[data-role-segment]').closest('ul').getBoundingClientRect();
      return { left: Math.round(selector.left), width: Math.round(selector.width) };
    })()
  `);
  assert(
    Math.abs(geometry.width - 400) <= 2,
    `${testCase.label}: content column must be 400px wide, measured ${geometry.width}`,
  );
  assert(
    Math.abs(geometry.left - 520) <= 2,
    `${testCase.label}: content column must start at x=520, measured ${geometry.left}`,
  );

  const ordered = await evaluate(`
    (() => {
      const top = (selector) => {
        const el = document.querySelector(selector);
        return el ? el.getBoundingClientRect().top : Number.NaN;
      };
      const marks = [
        top('[role="img"]'),
        top('[data-role-segment]'),
        top('h1'),
        top('input[type="email"]'),
        top('input[type="password"]'),
        top('input[type="checkbox"]'),
        top('[data-auth-submit]'),
      ];
      return marks.every((value, index) => index === 0 || value > marks[index - 1]);
    })()
  `);
  assert(
    ordered,
    `${testCase.label}: brand, role selector, heading, email, password, options and action must appear in the reference order`,
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
      [...document.querySelectorAll('[data-role-segment], [data-auth-submit]')]
        .every((el) => el.tabIndex >= 0 || el.tagName === 'A')
    `),
    `${testCase.label}: role segments and the primary action must be keyboard reachable`,
  );

  // "Remember me" claims no behaviour: it is disabled and contributes nothing to the form.
  // Session lifetime belongs to the approved @supabase/ssr session (A-045).
  assert(
    await evaluate(`
      (() => {
        const box = document.querySelector('input[type="checkbox"]');
        return !!box && box.disabled === true && box.name === '';
      })()
    `),
    `${testCase.label}: Remember me must stay non-interactive and unsubmitted`,
  );
  // "Forgot password?" is inert text — no recovery workflow exists to link to.
  assert(
    await evaluate(`
      [...document.querySelectorAll('a[href]')]
        .every((a) => !a.innerText.toLowerCase().includes('forgot password'))
    `),
    `${testCase.label}: Forgot password? must not be a link — no recovery workflow exists`,
  );

  // No error state is rendered before any attempt is made.
  assert(
    await evaluate(`!document.querySelector('[data-auth-error]')`),
    `${testCase.label}: no failure message may render before an attempt`,
  );

  // The region carries a role-specific accessible name, so the three variants are
  // distinguishable to assistive technology despite sharing one visible heading.
  assert(
    await evaluate(
      `document.querySelector('[data-role-presentation="${testCase.role}"]')?.getAttribute('aria-label') === ${JSON.stringify(
        `Sign in — ${testCase.label} portal presentation`,
      )}`,
    ),
    `${testCase.label}: the login region must carry its role-specific accessible name`,
  );

  // No other role's workspace is reachable from this presentation.
  const otherHomes = roleCases
    .filter((other) => other.role !== testCase.role)
    .map((other) => other.home);
  assert(
    await evaluate(`
      (() => {
        const targets = [...document.querySelectorAll('a[href]')]
          .map((a) => new URL(a.href).pathname);
        return ${JSON.stringify(otherHomes)}.every((home) => !targets.includes(home));
      })()
    `),
    `${testCase.label}: another role's workspace must not be reachable from this presentation`,
  );

  screenshots.push(await screenshot(testCase.shot));
  record(
    `${testCase.label}: selection state, non-disclosure, enabled credentials, real sign-in form, no destination in the DOM`,
  );
}

/* ---------------------------------------------------------------------------
 * Keyboard operability of the shared shell — F3
 * ------------------------------------------------------------------------- */

await navigate("/login?role=trainer");
await waitUntil("document.body.innerText.includes('Sign in as')", "Trainer login for keyboard checks");

// Tabbing reaches every interactive affordance; nothing is mouse-only.
assert(
  await evaluate(`
    (() => {
      const focusable = [...document.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )];
      return focusable.length > 0 && focusable.every((el) => el.tabIndex >= 0);
    })()
  `),
  "Every enabled affordance must be keyboard reachable",
);

// The reveal control is a real button, so Enter and Space operate it natively.
assert(
  await evaluate(`
    document.querySelector('button[aria-controls]')?.tagName === 'BUTTON' &&
    document.querySelector('button[aria-controls]')?.getAttribute('type') === 'button'
  `),
  "The password reveal must be a real non-submitting button",
);

// Focus-visible is never suppressed.
assert(
  await evaluate(`
    (() => {
      const el = document.querySelector('[data-auth-submit]');
      el.focus();
      const style = getComputedStyle(el, ':focus-visible');
      return document.activeElement === el && style.outlineStyle !== 'none';
    })()
  `),
  "The primary action must show a visible focus indicator",
);
record("keyboard operability, real reveal button, visible focus indicator");

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
    await evaluate(`
      (() => {
        const targets = [...document.querySelectorAll('a[href]')].map((a) => new URL(a.href).pathname);
        return ['/trainer', '/management', '/parent'].every((home) => !targets.includes(home));
      })()
    `),
    `${path}: a malformed role query must not expose any portal destination`,
  );
}
record("unknown, absent and malformed role queries fall back and grant nothing");

/* ---------------------------------------------------------------------------
 * Role-query switching never escalates or carries state — F13
 *
 * The sharpest form of A-046: walking the role query must not accumulate authority, leak
 * one role's state into another, or leave any persisted trace behind.
 * ------------------------------------------------------------------------- */

await evaluate("localStorage.clear(); sessionStorage.clear()");

for (const role of ["parent", "trainer", "management", "parent"]) {
  await navigate(`/login?role=${role}`);
  await waitUntil(
    "document.body.innerText.includes('Sign in as')",
    `role switch to ${role}`,
  );

  assert(
    await evaluate(
      `document.querySelector('[data-role-segment="${role}"]').dataset.selected === 'true'`,
    ),
    `role switch: ${role} must be the selected presentation`,
  );
  assert(
    await evaluate(
      `document.querySelectorAll('[data-role-segment][data-selected="true"]').length === 1`,
    ),
    `role switch: switching to ${role} must not leave a second role selected`,
  );
  // The sharpest F16-A form of A-046: the role query changes the presentation but can no
  // longer change any destination, because the page holds no destination at all.
  assert(
    await evaluate(`
      (() => {
        const form = document.querySelector('form[data-auth-form="sign-in"]');
        const names = [...form.elements].map((el) => el.name).filter(Boolean).sort();
        const links = [...document.querySelectorAll('a[href]')].map((a) => new URL(a.href).pathname);
        return JSON.stringify(names) === JSON.stringify(['email', 'password']) &&
          ['/trainer', '/management', '/parent'].every((home) => !links.includes(home));
      })()
    `),
    `role switch: /login?role=${role} must expose no destination and submit no role`,
  );
  // Nothing is persisted by walking the query — no session, role, credential or grant.
  assert(
    await evaluate(
      `localStorage.length === 0 && sessionStorage.length === 0 && document.cookie === ''`,
    ),
    `role switch: visiting /login?role=${role} must persist nothing`,
  );
}
record("walking the role query escalates nothing, carries no state and persists nothing");

/* ---------------------------------------------------------------------------
 * Responsive usability — F13
 * ------------------------------------------------------------------------- */

for (const width of [1440, 1024, 900, 480]) {
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await navigate("/login?role=parent");
  await waitUntil(
    "document.body.innerText.includes('Sign in as')",
    `Parent login at ${width}px`,
  );

  assert(
    await evaluate(
      `document.documentElement.scrollWidth <= window.innerWidth + 1`,
    ),
    `${width}px: the authentication page must not scroll horizontally`,
  );
  assert(
    await evaluate(`
      (() => {
        const el = document.querySelector('[data-auth-submit]');
        const box = el.getBoundingClientRect();
        return box.height >= 44 && box.left >= 0 && box.right <= window.innerWidth + 1;
      })()
    `),
    `${width}px: the primary action must stay on-screen with an adequate touch target`,
  );
  assert(
    await evaluate(`
      [...document.querySelectorAll('[data-role-segment]')].every((el) => {
        const box = el.getBoundingClientRect();
        return box.width > 0 && box.left >= 0 && box.right <= window.innerWidth + 1;
      })
    `),
    `${width}px: every role segment must remain visible and on-screen`,
  );
}
record("responsive usability at 1440, 1024, 900 and 480 px");

await send("Emulation.setDeviceMetricsOverride", {
  width: VIEWPORT.width,
  height: VIEWPORT.height,
  deviceScaleFactor: 1,
  mobile: false,
});

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
