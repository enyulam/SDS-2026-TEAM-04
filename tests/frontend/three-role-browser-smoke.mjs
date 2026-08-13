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
 * The rasterising contrast core (F-01c), identical to `trainer-browser-smoke.mjs`'s.
 *
 * Tailwind v4 resolves these tokens to `oklab()` / `lab()`, whose components can be NEGATIVE —
 * a naive numeric scrape silently drops the minus sign and reports a plausible but wrong ratio.
 * Painting the computed value into a 1x1 canvas asks the browser for the sRGB bytes it actually
 * paints, which is the thing SC 1.4.3 is about.
 */
const CONTRAST_CORE = `
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  const toSrgb = (value) => {
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = '#000000';
    context.fillStyle = value;
    context.fillRect(0, 0, 1, 1);
    const data = context.getImageData(0, 0, 1, 1).data;
    return [data[0], data[1], data[2]];
  };
  const channel = (raw) => {
    const c = raw / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const luminance = ([r, g, b]) =>
    0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  const contrastOf = (element) => {
    const style = getComputedStyle(element);
    let background = style.backgroundColor;
    let node = element;
    while (!background || background === 'rgba(0, 0, 0, 0)' || background === 'transparent') {
      node = node.parentElement;
      if (!node) { background = 'rgb(255, 255, 255)'; break; }
      background = getComputedStyle(node).backgroundColor;
    }
    const a = luminance(toSrgb(style.color));
    const b = luminance(toSrgb(background));
    return Math.round(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)) * 1000) / 1000;
  };
`;

/**
 * F-01c — CROSS-ROLE NAVIGATION. The brand mark is the FIRST keyboard tab stop in the portal
 * shell, and one component renders it on all three portals. Before F-01c its destination and
 * accessible name were hardcoded to `/trainer` / "B.E.S.T. Coach Trainer home", so on
 * `/parent/reports` and `/management/reports` the first tab stop announced itself to assistive
 * technology as "Trainer home" and navigated a Parent or Management user into the Trainer
 * portal. It granted no authority (no auth exists yet) but it was a real navigation and
 * assistive-technology defect that would become authorization-adjacent once F-16 wires guards.
 *
 * This asserts the mark belongs to the portal it is rendered in, AND that it is the first
 * focusable element — so the check keeps testing the thing that actually failed.
 */
async function assertBrandMarkBelongsToPortal(portal, expectedHref) {
  const mark = await evaluate(`
    (() => {
      const link = document.querySelector('a[aria-label^="B.E.S.T. Coach"]');
      if (!link) return null;
      const firstFocusable = [...document.querySelectorAll('a[href], button:not([disabled]), input, select, textarea')]
        .find((element) => element.offsetParent !== null || element === document.activeElement);
      return {
        href: link.getAttribute('href'),
        ariaLabel: link.getAttribute('aria-label'),
        isFirstFocusable: link === firstFocusable,
      };
    })()
  `);
  assert(mark, `No brand-mark link was found in the ${portal} shell`);
  assert(
    mark.href === expectedHref,
    `The ${portal} shell brand mark points at ${mark.href}; it must point at its own portal (${expectedHref})`,
  );
  assert(
    mark.ariaLabel === `B.E.S.T. Coach ${portal} home`,
    `The ${portal} shell brand mark is announced as "${mark.ariaLabel}"; it must name its own portal`,
  );
  assert(
    mark.isFirstFocusable,
    `The ${portal} shell brand mark is no longer the first focusable element — re-verify this assertion still covers the first tab stop`,
  );
}

/**
 * F-01c — SC 1.4.3 on the shared portal shell, measured in the RENDERED PRODUCTION DOM.
 *
 * A declared Tailwind class is not evidence it applied: F-01b shipped exactly that mistake when
 * an unlayered CSS rule silently voided `.text-white` on every button. So this reads the live
 * computed colour of every visible, non-disabled text-bearing leaf in the shell chrome — the
 * sidebar, the identity strip and the footer — and rasterises it before taking the ratio.
 *
 * Scope is the SHELL, not feature content: this file owns the shell regression, and page-level
 * copy belongs to its own screen checkpoint.
 */
async function assertShellChromeContrast(label) {
  const rows = await evaluate(`
    (() => {
      ${CONTRAST_CORE}
      const roots = [
        ...document.querySelectorAll('aside'),
        ...document.querySelectorAll('main > div:first-child'),
        ...document.querySelectorAll('main > footer'),
      ];
      const seen = new Set();
      const measured = [];
      for (const root of roots) {
        for (const node of [root, ...root.querySelectorAll('*')]) {
          if (seen.has(node)) continue;
          seen.add(node);
          if (node.closest('[aria-hidden="true"]')) continue;
          if (node.disabled || node.getAttribute('aria-disabled') === 'true') continue;
          const own = [...node.childNodes]
            .filter((child) => child.nodeType === 3)
            .map((child) => child.textContent.trim())
            .join(' ')
            .trim();
          if (!own) continue;
          const style = getComputedStyle(node);
          if (style.visibility === 'hidden' || style.display === 'none') continue;
          const rect = node.getBoundingClientRect();
          if (rect.width === 0 && rect.height === 0) continue;
          const px = parseFloat(style.fontSize);
          const bold = Number(style.fontWeight) >= 700;
          measured.push({
            text: own.slice(0, 48),
            color: style.color,
            contrast: contrastOf(node),
            threshold: px >= 24 || (px >= 18.66 && bold) ? 3 : 4.5,
          });
        }
      }
      return measured;
    })()
  `);
  assert(rows.length > 0, `${label}: no shell text node could be measured`);
  const failures = rows.filter((row) => row.contrast < row.threshold);
  assert(
    failures.length === 0,
    `${label} — SC 1.4.3 failures in the production DOM: ${failures
      .map((row) => `"${row.text}" ${row.color} ${row.contrast}:1 (needs ${row.threshold})`)
      .join(" | ")}`,
  );
  return Math.min(...rows.map((row) => row.contrast));
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

/**
 * The nine governed dimension display names, exactly as `lib/frontend/fixtures/dimensions.ts`
 * renders them. Used ONLY for the structural check below — never as a prose substring match.
 */
const DIMENSION_DISPLAY_NAMES = [
  "Body",
  "Emotion",
  "Speech",
  "Tonality",
  "Eye Contact",
  "Vocal Projection",
  "Emotional Expression",
  "Sentence Flow",
  "Audience Awareness",
];

/**
 * REQUIRED NEGATIVE ASSERTION for operator ruling R-B5 (screen 19 / checkpoint F-12).
 *
 * The frozen reference 19 draws a "Performance Summary" grid of raw per-dimension ratings, an
 * "Overall Grade" row, a "Class Video Evidence" region, a "Report for: Parent / Management"
 * audience toggle and a "Save as draft" control. Every one of those is PROHIBITED on a
 * Management surface (Amendment 004 A-034 / A-038; `CLAUDE.md` §6; GLOBAL_UI_RULES §4). They are
 * deliberately not implemented, and this is what proves they stayed unimplemented — structurally,
 * in the rendered production DOM, not by reading the source.
 *
 * The rating check is NOT a bare-word prose regex — Amendment 006 A-052 expressly prohibits one,
 * because "at the beginning of the session" and "has mastered maintaining eye contact" are legal
 * parent-facing prose that these four panels may legitimately contain, and the panels are exactly
 * what Management is supposed to read. What is detected instead is the form A-052 authorises: an
 * ISOLATED raw label or dimension name presented as a rendered value — any leaf element whose
 * ENTIRE text is one token — plus any rating-bearing or evidence-bearing data attribute, and any
 * embedded media element.
 *
 * Call this with the return dialog CLOSED. That dialog legitimately renders the nine dimension
 * names as `<option>`s: naming the affected dimension is part of the governed return-to-trainer
 * input (`ManagementReturnToTrainerInput.dimensionCode`), and a return is the ONLY way an
 * assessment-level concern may be raised. Reading a rating is prohibited; naming the dimension a
 * concern is about is required.
 */
async function assertManagementSurfaceClean(label) {
  await assertNoRatingTokenRendered(label);

  const offenders = await evaluate(`
    (() => {
      const tokens = ${JSON.stringify(DIMENSION_DISPLAY_NAMES)}.map((name) => name.toLowerCase());
      const found = [];
      for (const element of document.body.querySelectorAll("*")) {
        const tag = element.tagName.toLowerCase();
        if (["video", "iframe", "audio", "source", "track"].includes(tag)) {
          found.push("media:" + tag);
          continue;
        }
        for (const attribute of ["data-rating", "data-rating-level", "data-evidence-state"]) {
          if (element.hasAttribute(attribute)) found.push(tag + "[" + attribute + "]");
        }
        if (element.children.length > 0) continue;
        const text = (element.textContent || "").trim().toLowerCase();
        if (tokens.includes(text)) found.push("dimension-cell:" + tag + '="' + text + '"');
      }
      return found;
    })()
  `);
  assert(
    offenders.length === 0,
    `${label} rendered a prohibited internal element: ${offenders.join(", ")}`,
  );

  await assertTextAbsent(
    [
      "Performance Summary",
      "Overall Grade",
      "Overall grade:",
      "Class Video Evidence",
      "Session recording",
      "Report for",
      "Save as draft",
      "Save as Draft",
      "Trainer note",
      "Coach Notes",
      "Internal Only",
      "Quality Checklist",
      "Evidence confirms rating",
      "Observation notes",
      "Attendance",
      "Present by default",
      "content hash",
      "Content hash",
      "AI draft",
      "AI history",
      "AI generation",
      "audit",
      "revision",
    ],
    label,
  );
}

/**
 * REQUIRED NEGATIVE ASSERTION for operator ruling R-B6 (screen 33 / checkpoint F-15).
 *
 * The frozen reference 33 draws FOUR things a Parent may never receive, and the whole point of
 * the F-15 reconstruction is that it reproduces the frame's shell without reproducing any of
 * them. This assertion is what proves they stayed unimplemented — structurally, in the rendered
 * production DOM, not by reading the source:
 *
 *  1. a "PERFORMANCE SUMMARY" grid of per-dimension ratings — the leak `CLAUDE.md` §6 names as
 *     already caught, prohibited "in any form or wording", softened wording included;
 *  2. "OVERALL GRADE: MASTERING" — an aggregate competency grade;
 *  3. PROSE RATING ATTRIBUTION / taxonomy disclosure ("Assessed as Mastered in ...", "to the
 *     Mastering band");
 *  4. the "WATCH TOGETHER" evidence video — no governed parent evidence path exists (A-001
 *     gating; A-014 scope and uploader UNRESOLVED), so no media element may render at all.
 *
 * It additionally proves the standing parent-boundary exclusions: no correction history, no
 * content hash, no revision or version metadata, and no audit internal (A-021; A-038; A-048;
 * GLOBAL_UI_RULES §5). Applied to EVERY Parent surface, not only the report detail.
 *
 * The rating check is NOT a bare-word prose regex — Amendment 006 A-052 expressly prohibits one,
 * because "at the beginning of the session" and "has mastered maintaining eye contact" are legal
 * parent-facing prose that the governed canonical narrative may legitimately contain. What is
 * detected instead is the form A-052 authorises: an ISOLATED raw label or dimension name
 * presented as a rendered value — any leaf element whose ENTIRE text is one token — plus any
 * rating-, evidence-, hash- or version-bearing data attribute, and any embedded media element.
 */
async function assertParentSurfaceClean(label) {
  await assertNoRatingTokenRendered(label);

  const offenders = await evaluate(`
    (() => {
      const dimensions = ${JSON.stringify(DIMENSION_DISPLAY_NAMES)}.map((name) => name.toLowerCase());
      const attributes = [
        "data-rating",
        "data-rating-level",
        "data-dimension",
        "data-dimension-code",
        "data-evidence-state",
        "data-evidence-url",
        "data-content-hash",
        "data-version-id",
        "data-revision",
        "data-report-status",
        "data-correction",
      ];
      const found = [];
      for (const element of document.body.querySelectorAll("*")) {
        const tag = element.tagName.toLowerCase();
        if (["video", "iframe", "audio", "source", "track", "embed", "object"].includes(tag)) {
          found.push("media:" + tag);
          continue;
        }
        for (const attribute of attributes) {
          if (element.hasAttribute(attribute)) found.push(tag + "[" + attribute + "]");
        }
        if (element.children.length > 0) continue;
        const text = (element.textContent || "").trim().toLowerCase().replace(/[.,:;!?·|-]+$/, "").trim();
        if (dimensions.includes(text)) found.push("dimension-cell:" + tag + '="' + text + '"');
      }
      return found;
    })()
  `);
  assert(
    offenders.length === 0,
    `${label} rendered a prohibited internal element: ${offenders.join(", ")}`,
  );

  await assertTextAbsent(
    [
      "Performance Summary",
      "Overall Grade",
      "Overall grade:",
      "Watch Together",
      "Class Video Evidence",
      "Session recording",
      "Re-watch",
      "Assessed as",
      "assessed as",
      "band.",
      "Observation",
      "Trainer note",
      "Coach Notes",
      "Internal Only",
      "Quality Checklist",
      "Correction",
      "Returned",
      "Needs edit",
      "content hash",
      "Content hash",
      "revision",
      "version",
      "audit",
      "report status",
      "AI draft",
      "AI history",
      "AI generation",
      "draft",
    ],
    label,
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
    "document.body.innerText.includes('Role selection is presentation only')",
    "F2 role presentation",
  );
  assert(await bodyIncludes("Selecting a role changes presentation only"), "Role query warning is missing");

  /*
   * F-01c — the pre-authentication brand mark must remain NON-INTERACTIVE (set at F3 and
   * PRESERVED here): a pre-authentication screen offers no route into any workspace, so the
   * mark is a `role="img"` span with no `href` and no nested link, on all three login variants.
   */
  for (const loginRole of ["trainer", "management", "parent"]) {
    await navigate(`/login?role=${loginRole}`);
    const authMark = await evaluate(`
      (() => {
        const mark = document.querySelector('[role="img"][aria-label="B.E.S.T. Coach"]');
        return {
          present: Boolean(mark),
          tag: mark ? mark.tagName.toLowerCase() : null,
          href: mark ? mark.getAttribute('href') : null,
          nestedLink: mark ? Boolean(mark.querySelector('a')) : false,
          anyBrandLink: Boolean(document.querySelector('a[aria-label^="B.E.S.T. Coach"]')),
        };
      })()
    `);
    assert(authMark.present, `The ${loginRole} login brand mark is missing`);
    assert(
      authMark.tag === "span" && authMark.href === null && !authMark.nestedLink && !authMark.anyBrandLink,
      `The ${loginRole} login brand mark became a route into a workspace: ${JSON.stringify(authMark)}`,
    );
  }
  await navigate("/login?role=management");
  await evaluate("sessionStorage.clear()");

  /*
   * F-01c — cross-role brand navigation and shared-shell SC 1.4.3, on all three portals.
   * Both readings come from the rendered production DOM, never from a declared class.
   */
  const shellContrast = [];
  for (const [portal, home, probe] of [
    ["Trainer", "/trainer/schedule", "/trainer/reports?status=needs_edit"],
    ["Management", "/management/dashboard", "/management/reports?status=trainer_approved"],
    ["Parent", "/parent", "/parent/reports"],
  ]) {
    for (const path of [home, probe]) {
      await navigate(path);
      await waitUntil("Boolean(document.querySelector('aside'))", `${portal} shell at ${path}`);
      await assertBrandMarkBelongsToPortal(portal, home);
      shellContrast.push(await assertShellChromeContrast(`${portal} shell at ${path}`));
    }
  }
  console.log(`  · portal-shell chrome worst measured contrast ${Math.min(...shellContrast)}:1 (rendered production DOM, all three portals)`);

  await navigate("/parent/reports");
  await waitUntil("document.body.innerText.includes('Learner Fern')", "initial Parent report list");
  assert(!(await bodyIncludes("Learner Birch")), "Trainer working content reached the Parent list");
  await assertParentSurfaceClean("Parent report list (screen 32, initial)");
  await navigate("/parent");
  await waitUntil("document.body.innerText.includes('Family reports')", "Parent home surface");
  await assertParentSurfaceClean("Parent home surface");

  await navigate("/trainer/reports/report-birch/review");
  await waitUntil("document.body.innerText.includes('Quality Checklist')", "Birch Trainer review");
  await approveAsTrainer();

  await navigate("/parent/reports");
  await waitUntil("document.body.innerText.includes('Learner Fern')", "Parent list after Trainer approval");
  assert(!(await bodyIncludes("Learner Birch")), "Trainer approval made Birch parent-visible");

  await navigate("/management/reports/report-birch/review");
  await waitUntil("document.body.innerText.includes('Ready to approve?')", "Management safe review");
  assert(
    (await evaluate(
      `document.querySelectorAll('[data-testid="management-safe-review"] [data-report-panel]').length`,
    )) === 4,
    "Management final review did not contain exactly four parent-facing panels",
  );
  await assertTextAbsent(
    [
      "Beginning",
      "Developing",
      "Mastering",
      "Mastered",
      "Emerging",
      "Secure",
    ],
    "Management review DOM",
  );
  /* Screen 19 / R-B5 — the prohibited elements of the frozen frame, proved absent. */
  await assertManagementSurfaceClean("Management final review (screen 19)");
  const managementScreenshot = await screenshot("management-safe-review.png");

  await clickExact("a", "Edit wording");
  await waitUntil("document.querySelectorAll('textarea').length === 4", "Management four-panel editor");
  /*
   * The wording-only boundary, proved by counting: FOUR editable fields and no fifth. The same
   * cleanliness assertion runs here, because the editor is the one Management surface that can
   * write content at all (A-034).
   */
  assert(
    (await evaluate(
      `document.querySelectorAll('input:not([type="hidden"]), textarea, select, [contenteditable="true"]').length`,
    )) === 4,
    "Management wording editor exposed a field outside the four parent-facing panels",
  );
  await assertManagementSurfaceClean("Management wording editor");
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
  await assertManagementSurfaceClean("Management pending queue (screen 29)");
  await navigate("/management/reports?status=needs_edit");
  await waitUntil("document.body.innerText.includes('Learner Birch')", "correction tracking queue");
  assert(
    await bodyIncludes("Please re-check that the stated strength is supported"),
    "Management correction reason was not tracked",
  );
  await assertManagementSurfaceClean("Management correction tracking (screen 29)");

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
  await waitUntil("document.body.innerText.includes('Ready to approve?')", "reapproved Management review");
  await assertManagementSurfaceClean("Management final review (screen 19, after reapproval)");
  await clickExact("button", "Approve & Submit");
  /*
   * The ratified confirmation copy (A-033; `CLAUDE.md` §6). No dedicated mockup exists for this
   * dialog and none may be invented beyond this description, so the exact sentence is pinned.
   */
  await waitUntil(
    "document.body.innerText.includes(\"Approve and submit Learner Birch's report?\")",
    "final submission dialog",
  );
  assert(
    await bodyIncludes(
      "This will publish the final report, notify the linked parent, and update the student record.",
    ),
    "Approve & Submit confirmation did not carry the ratified description",
  );
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
  await assertParentSurfaceClean("Parent report list (screen 32, after submission)");
  const parentListScreenshot = await screenshot("parent-reports-list.png");
  await navigate("/parent/students/student-birch/sessions/session-storytelling-lab/report");
  await waitUntil("document.body.innerText.includes('The confident opening was especially clear.')", "canonical Birch detail");
  assert(
    (await evaluate(`document.querySelectorAll('[data-testid="parent-canonical-report"] article').length`)) === 4,
    "Parent canonical detail did not contain exactly four panels",
  );
  /*
   * The four governed panels (spec §8) are the ENTIRE parent-facing payload — exactly four
   * sections, each carrying its governed heading, and nothing beside them.
   */
  const parentPanelHeadings = await evaluate(`
    [...document.querySelectorAll('[data-testid="parent-canonical-report"] article h3')]
      .map((element) => element.textContent.trim())
  `);
  // ⚠️ MIGRATED TO OD-4. These are the ratified canonical panel LABELS
  // (features/trainer/report-panel-config.ts), which the parent surface renders directly.
  // The four names previously asserted here are superseded by the OD-4 ruling.
  assert(
    JSON.stringify(parentPanelHeadings) ===
      JSON.stringify(["Overview", "Strengths", "Areas for Development", "Remarks"]),
    `Parent canonical detail did not render exactly the four governed panels: ${parentPanelHeadings.join(" | ")}`,
  );
  await assertTextAbsent(
    ["Beginning", "Developing", "Mastering", "Mastered", "Emerging", "Secure"],
    "Parent canonical DOM",
  );
  /*
   * Screen 33 after a real submission — the state the frozen frame draws its per-dimension
   * "Performance Summary" grid, its "Overall Grade: Mastering" row, its prose rating
   * attributions and its "Watch Together" evidence video in. None of the four is implemented
   * (operator ruling R-B6) and this proves it.
   */
  await assertParentSurfaceClean("Parent canonical report detail (screen 33)");
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
          "the brand mark is the first tab stop and belongs to the portal it renders in — Trainer -> /trainer/schedule, Management -> /management, Parent -> /parent — and stays non-interactive on all three logins (F-01c)",
          "portal-shell chrome meets WCAG 2.2 AA SC 1.4.3 on all three portals, measured in the rendered production DOM (F-01c)",
          "Trainer approval remains Parent-invisible",
          "Management safe review and four-panel wording edit",
          "bounded return and durable correction tracking",
          "Trainer explicit reaffirmation, fresh checklist, and reapproval",
          "Management final submission and canonical Parent availability",
          "Management and Parent DOM privacy exclusions",
          "no competency-rating token renders on any Parent surface (R-B6)",
          "screen 33 renders exactly the four governed panels, and no per-dimension grid, overall grade, rating attribution, evidence media, correction history, content hash or version metadata reaches any Parent surface (R-B6)",
          "no per-dimension rating and no prohibited internal element renders on any Management surface (R-B5)",
          "screen 19 exposes exactly four parent-facing panels and the editor exactly four fields",
          "Approve & Submit carries the ratified confirmation copy",
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
