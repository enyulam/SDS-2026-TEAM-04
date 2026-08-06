import { spawn } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const APP_ORIGIN = process.env.BEST_COACH_APP_ORIGIN ?? "http://127.0.0.1:3000";
const CHROME_PATH =
  process.env.CHROME_PATH ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const DEBUG_PORT = 9331;
const ARTIFACT_DIR = join(tmpdir(), "best-coach-f1-browser-smoke");
const profileDirectory = await mkdtemp(join(tmpdir(), "best-coach-f1-chrome-"));

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

/**
 * THE FIXTURE'S THREE ELIGIBILITY ARMS, DERIVED HERE INDEPENDENTLY.
 *
 * The deterministic fixture no longer carries absolute session dates: it
 * expresses each session as an offset from the current Asia/Singapore date, so
 * "today", "tomorrow" and "yesterday" keep their meaning at every wall-clock
 * time (C2C-010). This test therefore derives the same three dates rather than
 * pinning literals — and it derives them from `Intl` directly rather than by
 * importing the production module, so the two derivations are INDEPENDENT and a
 * fault in either one shows up as a disagreement instead of cancelling out.
 */
const SGT_DATE = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Singapore",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const SGT_MONTH = new Intl.DateTimeFormat("en-SG", {
  timeZone: "Asia/Singapore",
  month: "long",
  year: "numeric",
});
function singaporeDayOffset(days) {
  const [year, month, day] = SGT_DATE.format(new Date()).split("-").map(Number);
  return SGT_DATE.format(new Date(Date.UTC(year, month - 1, day + days, 12)));
}
const TODAY_ISO = singaporeDayOffset(0);
const TOMORROW_ISO = singaporeDayOffset(1);
const CURRENT_MONTH_LABEL = SGT_MONTH.format(new Date());

async function bodyIncludes(text) {
  return evaluate(`document.body.innerText.includes(${JSON.stringify(text)})`);
}

/**
 * The rasterising contrast core, shared by the rating-chip reading below and by F-09's
 * per-dimension rating-tile reading. Tailwind v4 resolves these tokens to `oklab()` / `lab()`,
 * whose components can be NEGATIVE — a naive numeric scrape silently drops the minus sign and
 * reports a plausible but wrong ratio. Painting the computed value into a 1x1 canvas asks the
 * browser for the sRGB bytes it actually paints, which is the thing SC 1.4.3 is about.
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
 * Label-text contrast of one rating chip, measured from the LIVE computed styles of the
 * production build (SC 1.4.3).
 *
 * The computed values are rasterised through a 1x1 canvas before the ratio is taken. Tailwind
 * v4 resolves these tokens to `oklab()` / `lab()`, whose components can be NEGATIVE — a naive
 * numeric scrape silently drops the minus sign and reports a plausible but wrong ratio.
 * Rasterising asks the browser for the sRGB bytes it actually paints, which is the thing
 * SC 1.4.3 is about.
 */
async function ratingChipContrast(fieldsetIndex, label) {
  const contrast = await evaluate(`
    (() => {
      ${CONTRAST_CORE}
      const chip = [...document.querySelectorAll('fieldset')[${fieldsetIndex}].querySelectorAll('button[data-rating-level]')]
        .find((candidate) => candidate.textContent.trim() === ${JSON.stringify(label)});
      return contrastOf(chip);
    })()
  `);
  assert(
    typeof contrast === "number" && Number.isFinite(contrast),
    `Contrast for the ${label} chip could not be measured (got ${JSON.stringify(contrast)})`,
  );
  return contrast;
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

  /*
   * F-07 — MEASUREMENT DETERMINISM. `getComputedStyle` returns the CURRENTLY INTERPOLATED
   * value while a CSS transition is running, so a contrast reading taken immediately after a
   * class change measures the state the control is transitioning OUT OF, not the state it is
   * in. Every rating chip carries `transition`, and the reading below fires as soon as the
   * anchor text repaints — well inside the 150 ms window. Emulating `prefers-reduced-motion:
   * reduce` makes `app/globals.css`'s reduced-motion block collapse every transition to
   * 0.01 ms, so the measured value is the SETTLED value. This is also a condition the product
   * must work under, so nothing is being measured in an unrealistic mode.
   */
  await command("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });

  await navigate("/login?role=trainer");
  await waitUntil(
    "document.body.innerText.includes('Role selection is presentation only')",
    "fixture login presentation",
  );
  assert(await bodyIncludes("Selecting a role changes presentation only"), "Role presentation warning is missing");
  const loginScreenshot = await screenshot("login-trainer.png");

  await navigate("/trainer");
  await waitUntil(
    "document.body.innerText.includes('Deterministic fixture mode')",
    "permanent fixture-mode banner",
  );
  assert(
    await bodyIncludes("Simulated Trainer data and browser-session actions only"),
    "Fixture separation copy is missing",
  );

  /* -------------------------------------------------------------------------
   * Screen 05 Trainer Schedule — F-04.
   *
   * R-B1: `/trainer/schedule` is the canonical Trainer entry route and `/trainer` is
   * PRESERVED as a compatibility redirect onto it. Both facts are asserted here, because
   * "the old route still works" is the half of the ruling a passing new route would hide.
   * ----------------------------------------------------------------------- */

  assert(
    await evaluate("window.location.pathname === '/trainer/schedule'"),
    "/trainer must redirect to the canonical /trainer/schedule, not 404 or dead-end",
  );
  await waitUntil(
    "document.body.innerText.includes('Your classes, sessions and meetings')",
    "trainer schedule surface reached through the /trainer compatibility redirect",
  );

  await navigate("/trainer/schedule");
  await waitUntil(
    "document.body.innerText.includes('Your classes, sessions and meetings')",
    "canonical trainer schedule route",
  );

  // The projection is over the SAME governed class-session rows the roster surface uses.
  assert(
    await bodyIncludes("Storytelling Foundations"),
    "The schedule must project the assigned class sessions",
  );
  assert(
    await bodyIncludes(CURRENT_MONTH_LABEL),
    "The schedule must focus the month carrying the assigned sessions",
  );
  assert(
    (await evaluate(
      "document.querySelectorAll('[data-schedule-day]').length >= 28",
    )),
    "The month grid must render its day cells",
  );

  // "Add Agenda" carries the frame's label and is inactive — no create-session path exists.
  assert(
    await evaluate(`
      (() => {
        const button = [...document.querySelectorAll('button')]
          .find((candidate) => candidate.textContent.trim().endsWith('Add Agenda'));
        return Boolean(button && button.disabled && button.getAttribute('aria-describedby'));
      })()
    `),
    "Add Agenda must be disabled with a programmatically associated reason",
  );

  // Selecting a day opens Schedule Details for that day and nothing else.
  assert(
    !(await bodyIncludes("Open Class Roster")),
    "Schedule Details must start with no day selected",
  );
  await evaluate(
    `document.querySelector('[data-schedule-day="${TODAY_ISO}"]').click()`,
  );
  await waitUntil(
    "document.body.innerText.includes('Open Class Roster')",
    "schedule details for the selected day",
  );
  const detailsText = await evaluate(
    `document.querySelector('aside[aria-labelledby="schedule-details-heading"]').innerText`,
  );
  assert(
    detailsText.includes("Storytelling Foundations"),
    "Schedule Details must name the session on the selected day",
  );
  assert(
    !detailsText.includes("Speech Showcase"),
    "Schedule Details must show only the selected day's sessions",
  );

  /* -------------------------------------------------------------------------
   * C2C-010 — SESSION-START ELIGIBILITY, IN THE DOM.
   *
   * Before this checkpoint every SessionCard rendered an identically enabled
   * roster link, so a trainer could open a session that had not started,
   * complete all nine ratings, and only then be refused by BC104 at save time.
   *
   * The selected day is TODAY, whose fixture session has already begun.
   * ----------------------------------------------------------------------- */
  assert(
    await evaluate(`
      (() => {
        const card = document.querySelector('aside[aria-labelledby="schedule-details-heading"] article[data-session-eligibility]');
        if (!card) return false;
        const link = card.querySelector('[data-roster-entry="enabled"]');
        return card.dataset.sessionEligibility === 'eligible' &&
          Boolean(link) && link.tagName === 'A' &&
          new URL(link.href).pathname === '/trainer/sessions/session-storytelling-lab/roster';
      })()
    `),
    "A session that has already started today must render as eligible with an ENABLED roster link",
  );
  assert(
    await evaluate(`
      (() => {
        const card = document.querySelector('aside[aria-labelledby="schedule-details-heading"] article[data-session-eligibility]');
        const chip = card && card.querySelector('[data-session-state-label]');
        return Boolean(chip) && chip.textContent.includes('In session today');
      })()
    `),
    "The derived state must be carried in TEXT, not by colour alone",
  );

  // TOMORROW's session: inert, with a governed reason and NO enabled path.
  await evaluate(
    `document.querySelector('[data-schedule-day="${TOMORROW_ISO}"]').click()`,
  );
  await waitUntil(
    `(() => {
       const card = document.querySelector('aside[aria-labelledby="schedule-details-heading"] article[data-session-eligibility]');
       return Boolean(card) && card.dataset.sessionEligibility === 'future';
     })()`,
    "the future session's card",
  );
  assert(
    await evaluate(`
      (() => {
        const panel = document.querySelector('aside[aria-labelledby="schedule-details-heading"]');
        const card = panel.querySelector('article[data-session-eligibility="future"]');
        if (!card) return false;
        const inert = card.querySelector('[data-roster-entry="inert"]');
        const described = inert && document.getElementById(inert.getAttribute('aria-describedby'));
        // NO enabled path of ANY kind: not an enabled control, and not an
        // anchor either — a link would still be followable by keyboard, by
        // middle-click and through the address bar.
        const anchors = [...card.querySelectorAll('a')];
        const enabled = card.querySelector('[data-roster-entry="enabled"]');
        return Boolean(inert) && inert.tagName === 'BUTTON' && inert.disabled === true &&
          Boolean(described) && described.textContent.includes('has not started yet') &&
          anchors.length === 0 && !enabled &&
          card.querySelector('[data-session-state-label]').textContent.includes('Not started yet');
      })()
    `),
    "A session whose scheduled start has not been reached must render INERT with a governed reason and no enabled roster or assess path",
  );

  // The Day / Week / Month switch is a real projection of the same rows.
  await clickExact("button", "Day");
  await waitUntil(
    `document.querySelector('[data-schedule-view="day"]').dataset.selected === 'true'`,
    "day view selected",
  );
  await clickExact("button", "Month");
  await waitUntil(
    `document.querySelector('[data-schedule-view="month"]').dataset.selected === 'true'`,
    "month view restored",
  );

  /* -------------------------------------------------------------------------
   * C2C-011 — THE DIRECT ASSESS URL IS REFUSED, and the rubric is not rendered.
   *
   * Both arms are DEEP LINKS: the surface is entered by URL, exactly as the
   * finding describes, with no navigation through the schedule or the roster.
   * ----------------------------------------------------------------------- */
  const assertNoRubric = async (label) => {
    assert(
      await evaluate(`
        (() => {
          const chips = document.querySelectorAll('button[aria-pressed]');
          const fieldsets = document.querySelectorAll('fieldset');
          const notes = document.getElementById('observation-notes');
          return chips.length === 0 && fieldsets.length === 0 && !notes;
        })()
      `),
      `${label}: the rubric must not be rendered at all — no rating control may exist to focus`,
    );
  };

  // (a) an ABSENT learner in a session that HAS started.
  await navigate("/trainer/sessions/session-storytelling-lab/students/student-delta/assess");
  await waitUntil(
    "document.body.innerText.includes('The student is not recorded present for this session.')",
    "the governed ineligible state for an absent learner",
  );
  assert(
    await bodyIncludes("This assessment is not open"),
    "The absent-learner refusal must be a designed state, not a generic error",
  );
  await assertNoRubric("absent learner");

  // (b) a PRESENT learner in a session whose scheduled start has NOT been reached.
  await navigate("/trainer/sessions/session-presentation-practice/students/student-gale/assess");
  await waitUntil(
    "document.body.innerText.includes('The scheduled session start has not been reached.')",
    "the governed ineligible state for a session that has not started",
  );
  await assertNoRubric("future session");

  // Empty projection state.
  await navigate("/trainer/schedule?preview=empty");
  await waitUntil(
    "document.body.innerText.includes('No Class Sessions are assigned to this Trainer.')",
    "empty schedule state",
  );

  await navigate("/trainer/sessions/session-storytelling-lab/roster");
  await waitUntil("document.body.innerText.includes('Learner Aster')", "session roster");
  assert(await bodyIncludes("Learner Delta"), "Full synthetic roster was not rendered");

  /* -------------------------------------------------------------------------
   * Screen 06 Trainer Student Roster — F-05.
   *
   * The load-bearing assertions here are the two governance rules the frame cannot
   * demonstrate itself: an ABSENT learner's card offers no assessment or report path at
   * all, and the per-student action is resolved from THAT student's actual report status
   * rather than by one generic handler shared across every card.
   * ----------------------------------------------------------------------- */

  // The breadcrumb and the back control both reach the canonical Trainer entry route (F-04).
  assert(
    await evaluate(`
      (() => {
        const links = [...document.querySelectorAll('a')]
          .filter((anchor) => new URL(anchor.href).pathname === '/trainer/schedule');
        const back = links.find((anchor) => anchor.textContent.trim() === 'Back to Schedule');
        const crumb = document.querySelector('nav[aria-label="Breadcrumb"] a');
        return Boolean(back) && Boolean(crumb) &&
          new URL(crumb.href).pathname === '/trainer/schedule';
      })()
    `),
    "Breadcrumb and Back to Schedule must link to the canonical /trainer/schedule route",
  );

  // Class Session banner progress, computed over PRESENT learners only.
  assert(
    await bodyIncludes("2 of 3 present learners assessed"),
    "The Class Session banner must report assessment progress across present learners",
  );

  // Continuity (persona §3.8): previous-session focus threads through the live roster.
  assert(
    // The region heading renders `uppercase`, and `innerText` reflects text-transform.
    await evaluate(
      `/focus carried over from the previous session/i.test(document.body.innerText)`,
    ),
    "Carried-over previous-session focus must be surfaced on the roster",
  );
  assert(
    await evaluate(`
      document.querySelector('[data-roster-card="student-aster"]').innerText
        .includes('Pause after each main idea and reconnect with the listener.')
    `),
    "Each present learner's card must carry that learner's previous-session focus",
  );

  // The per-student action is gated on that student's ACTUAL report status.
  const rosterActions = await evaluate(`
    Object.fromEntries(
      [...document.querySelectorAll('[data-roster-card]')].map((card) => [
        card.dataset.rosterCard,
        {
          action: card.dataset.rosterAction,
          attendance: card.dataset.attendance,
          href: card.querySelector('a') ? new URL(card.querySelector('a').href).pathname : null,
          text: card.innerText,
        },
      ]),
    )
  `);
  assert(
    Object.keys(rosterActions).length === 4,
    `Expected the four governed roster entries; found ${Object.keys(rosterActions).length}`,
  );
  assert(
    rosterActions["student-aster"].action === "assess" &&
      rosterActions["student-aster"].href ===
        "/trainer/sessions/session-storytelling-lab/students/student-aster/assess",
    "An unstarted present learner must resolve to the assessment path",
  );
  assert(
    rosterActions["student-birch"].action === "review" &&
      rosterActions["student-birch"].href === "/trainer/reports/report-birch/review",
    "A draft_ready learner must resolve to that report's review path",
  );
  assert(
    rosterActions["student-cedar"].action === "review" &&
      rosterActions["student-cedar"].href === "/trainer/reports/report-cedar/review",
    "A returned (needs_edit) learner must resolve to that report's review path",
  );
  assert(
    new Set(
      Object.values(rosterActions).map((entry) => entry.action),
    ).size >= 3,
    "Roster actions must differ by report status, not share one generic handler",
  );

  // ABSENCE EXPOSES NOTHING: no link, no route, no lifecycle status on an absent card.
  const absentCard = rosterActions["student-delta"];
  assert(
    absentCard.attendance === "absent" && absentCard.action === "inert",
    "The absent learner's card must offer no assessment or report path",
  );
  assert(absentCard.href === null, "An absent learner's card must contain no link");
  assert(
    absentCard.text.includes("Not available for assessment today."),
    "The absent card must state why no assessment is available",
  );
  assert(
    !/No report|Assessment needed|Observation saved|Ready to review|Returned|With management|Submitted/.test(
      absentCard.text,
    ),
    "An absent learner's card must expose no report lifecycle status",
  );
  assert(
    await evaluate(`
      [...document.querySelectorAll('[data-roster-card="student-delta"] button')]
        .every((button) => button.disabled)
    `),
    "Every control on an absent learner's card must be inert",
  );

  // Filter and sort NARROW the governed projection; they can never widen it.
  await evaluate(`
    (() => {
      const select = [...document.querySelectorAll('select')]
        .find((candidate) => candidate.value === 'all');
      const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
      setter.call(select, 'absent');
      select.dispatchEvent(new Event('change', { bubbles: true }));
    })()
  `);
  await waitUntil(
    `document.querySelectorAll('[data-roster-card]').length === 1`,
    "attendance filter narrowing the roster projection",
  );
  assert(
    await evaluate(
      `document.querySelector('[data-roster-card]').dataset.rosterCard === 'student-delta'`,
    ),
    "The absent filter must show only the absent learner",
  );
  await evaluate(`
    (() => {
      const select = [...document.querySelectorAll('select')]
        .find((candidate) => candidate.value === 'absent');
      const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
      setter.call(select, 'all');
      select.dispatchEvent(new Event('change', { bubbles: true }));
    })()
  `);
  await waitUntil(
    `document.querySelectorAll('[data-roster-card]').length === 4`,
    "roster projection restored",
  );

  // "View lesson plan" keeps the frame's label with no governed backing, so it is inert.
  assert(
    await evaluate(`
      (() => {
        const button = [...document.querySelectorAll('button')]
          .find((candidate) => candidate.textContent.trim().startsWith('View lesson plan'));
        return Boolean(button && button.disabled && button.getAttribute('aria-describedby'));
      })()
    `),
    "View lesson plan must be disabled with a programmatically associated reason",
  );

  // Token convergence: this surface uses project tokens, not the Tailwind default palette.
  assert(
    await evaluate(`
      [...document.querySelectorAll('main *')].every((element) =>
        !/(^|\\s)(bg|text|border)-(slate|gray|zinc|indigo)-/.test(element.className.baseVal ?? element.className ?? ''))
    `),
    "The roster surface must use project tokens, not Tailwind default-palette classes",
  );
  const rosterScreenshot = await screenshot("trainer-student-roster.png");

  await navigate(
    "/trainer/sessions/session-storytelling-lab/students/student-aster/assess",
  );
  await waitUntil("document.body.innerText.includes('0 of 9 dimensions rated')", "assessment form");
  assert(
    await evaluate(`
      [...document.querySelectorAll('button')]
        .find((button) => button.textContent.trim() === 'Save & Generate').disabled
    `),
    "Observation save should be disabled before all nine ratings",
  );
  await clickExact("button", "Check required fields");
  await waitUntil(
    "document.body.innerText.includes('All nine ratings are required')",
    "all-nine validation",
  );

  /* -------------------------------------------------------------------------
   * Screen 07 Trainer Grade Student — F-07. THE ASSESSMENT INSTRUMENT.
   *
   * The load-bearing assertions are the governance rules a static frame cannot demonstrate:
   * there is exactly ONE capture mode and it is the full nine (A-017); the nine render in the
   * RATIFIED order rather than the frame's interleaved order; every dimension surfaces its
   * behavioural anchor; the shared `observations.follow_up_notes` value is LOADED rather than
   * blanked; and an ABSENT learner appears in the REVIEW & APPROVE rail with no lifecycle
   * status, no path and no place in any counter.
   * ----------------------------------------------------------------------- */

  // A-017: ONE capture mode. No Quick/Full toggle, no four-dimension path, no `mode` control.
  assert(
    !(await evaluate(
      `/quick mode|full mode|quick assessment|4 dimensions|four-dimension/i.test(document.body.innerText)`,
    )),
    "A Quick/Full capture mode must not exist on the assessment instrument (A-017)",
  );
  assert(
    await evaluate(`
      [...document.querySelectorAll('button, input, select, a')]
        .every((element) => !/^(quick|full)$/i.test(element.textContent.trim()))
    `),
    "No Quick/Full mode control may exist (A-017)",
  );

  // The nine dimensions render in the RATIFIED order, not the frame's interleaved order (D1).
  const RATIFIED_DIMENSION_ORDER = [
    "body",
    "emotion",
    "speech",
    "tonality",
    "eye_contact",
    "vocal_projection",
    "emotional_expression",
    "sentence_flow",
    "audience_awareness",
  ];
  const renderedDimensions = await evaluate(
    `[...document.querySelectorAll('fieldset[data-dimension]')].map((node) => node.dataset.dimension)`,
  );
  assert(
    JSON.stringify(renderedDimensions) === JSON.stringify(RATIFIED_DIMENSION_ORDER),
    `The nine dimensions must render in the ratified order; found ${renderedDimensions.join(", ")}`,
  );

  // Every dimension carries a behavioural anchor region (D2 — the frame draws none).
  assert(
    await evaluate(`
      [...document.querySelectorAll('fieldset[data-dimension]')].every((node) => {
        const anchor = node.querySelector('#' + node.dataset.dimension + '-anchor');
        return Boolean(anchor) && anchor.textContent.includes('Rubric anchor:');
      })
    `),
    "Every one of the nine dimensions must surface a behavioural anchor region",
  );

  /*
   * All four rating states are measured in the IDLE treatment here; the selected treatment is
   * measured, one state at a time, in the F-06 block below. The frame paints the selected
   * segment in the saturated ramp colour with white label text, which measures 3.70 / 2.03 /
   * 2.34 / 2.51 : 1 and fails SC 1.4.3 on all four — the fill therefore moves to the same
   * hue's deeper step (D5), and BOTH treatments of all four states are proved in the DOM
   * rather than reasoned about.
   */
  for (const idleLabel of ["Beginning", "Developing", "Mastering", "Mastered"]) {
    const idleContrast = await ratingChipContrast(0, idleLabel);
    assert(
      idleContrast >= 4.5,
      `Idle ${idleLabel} chip label text measured ${idleContrast}:1; SC 1.4.3 requires 4.5:1`,
    );
    console.log(`  · ${idleLabel} chip label contrast ${idleContrast}:1 (idle, production DOM)`);
  }

  // The frame's "Back to Student Roster" control reaches this Class Session's roster.
  assert(
    await evaluate(`
      (() => {
        const back = [...document.querySelectorAll('a')]
          .find((anchor) => anchor.textContent.trim() === 'Back to Student Roster');
        return Boolean(back) &&
          new URL(back.href).pathname === '/trainer/sessions/session-storytelling-lab/roster';
      })()
    `),
    "Back to Student Roster must reach this Class Session's roster",
  );

  assert(
    await bodyIncludes("Coach Notes (Internal Only)"),
    "The Follow-up field must state that it is the same governed note as Coach Notes",
  );

  /*
   * REVIEW & APPROVE rail. The four counters are presentation grouping over the governed
   * report states, and the ABSENT learner is in none of them and reaches nothing (D7, A-018).
   */
  const railBuckets = await evaluate(`
    Object.fromEntries([...document.querySelectorAll('[data-review-bucket]')]
      .map((node) => [node.dataset.reviewBucket, Number(node.dataset.reviewCount)]))
  `);
  assert(
    railBuckets.not_started === 1 &&
      railBuckets.in_progress === 2 &&
      railBuckets.pending_approval === 0 &&
      railBuckets.approved === 0,
    `REVIEW & APPROVE counters must project the governed report states; found ${JSON.stringify(railBuckets)}`,
  );
  const railEntries = await evaluate(`
    Object.fromEntries([...document.querySelectorAll('[data-rail-student]')].map((node) => [
      node.dataset.railStudent,
      { action: node.dataset.railAction, tag: node.tagName, text: node.innerText },
    ]))
  `);
  assert(
    Object.keys(railEntries).length === 4,
    `Expected the four governed roster entries in the rail; found ${Object.keys(railEntries).length}`,
  );
  assert(
    railEntries["student-delta"].action === "inert" &&
      railEntries["student-delta"].tag !== "A",
    "The absent learner must have no path from the REVIEW & APPROVE rail",
  );
  assert(
    !/No report|Assessment needed|Observation saved|Ready to review|Returned|With management|Submitted/.test(
      railEntries["student-delta"].text,
    ),
    "The absent learner must expose no report lifecycle status in the rail",
  );
  assert(
    new Set(
      Object.values(railEntries).map((entry) => entry.action),
    ).size >= 3,
    "Rail destinations must differ by report status, not share one generic handler",
  );

  // Token convergence: this surface uses project tokens, not the Tailwind default palette.
  assert(
    await evaluate(`
      [...document.querySelectorAll('main *')].every((element) =>
        !/(^|\\s)(bg|text|border)-(slate|gray|zinc|indigo|red|amber|teal|green)-/.test(element.className.baseVal ?? element.className ?? ''))
    `),
    "The assessment surface must use project tokens, not Tailwind default-palette classes",
  );

  /*
   * `observations.follow_up_notes` is ONE field surfaced on TWO screens (`CLAUDE.md` §6): the
   * B.E.S.T Form's "Follow-up for Next Session" and Review & Approve's "Coach Notes (Internal
   * Only)". It must be LOADED with its current value, never rendered blank — otherwise a save
   * from this screen silently overwrites the trainer's earlier note. Screen 07's frame draws
   * no such field at all (D3); governance requires it, so it is here and it is proved LOADED
   * against a learner that already carries one. Learner Aster's is legitimately empty — that
   * observation has no earlier note — so the proof runs on Learner Cedar's returned report,
   * which also exercises the correction banner state.
   */
  await navigate(
    "/trainer/sessions/session-storytelling-lab/students/student-cedar/assess",
  );
  await waitUntil("document.querySelector('#follow-up-notes') !== null", "Cedar assessment form");
  assert(
    (await evaluate("document.querySelector('#follow-up-notes').value")) ===
      "Use facial expression to make the story change clear.",
    "Follow-up for Next Session must load the current governed value, never render blank",
  );
  assert(
    await bodyIncludes("Returned assessment concern"),
    "A returned report must surface its open correction on the assessment instrument",
  );
  const assessmentScreenshot = await screenshot("trainer-grade-student.png");

  await navigate(
    "/trainer/sessions/session-storytelling-lab/students/student-aster/assess",
  );
  await waitUntil(
    "document.body.innerText.includes('0 of 9 dimensions rated')",
    "assessment form restored",
  );

  /*
   * The nine selections are made in the RATIFIED Amendment 006 A-049 vocabulary and between
   * them exercise ALL FOUR rating states — Beginning, Developing, Mastering and Mastered.
   * A set that only touched three levels would leave one chip, one anchor and one polarity
   * band unproven in the rendered DOM.
   */
  const ratingSelections = [
    "Mastering",
    "Developing",
    "Mastering",
    "Beginning",
    "Developing",
    "Beginning",
    "Mastering",
    "Mastered",
    "Developing",
  ];
  assert(
    new Set(ratingSelections).size === 4,
    "The assessment walkthrough must exercise all four rating states",
  );
  const ratingCount = await evaluate(`document.querySelectorAll('fieldset').length`);
  assert(ratingCount === 9, `Expected nine dimension fieldsets; found ${ratingCount}`);

  /* -------------------------------------------------------------------------
   * F-06 — the ratified competency vocabulary, proven in the rendered DOM
   * ---------------------------------------------------------------------- */

  /*
   * Amendment 006 A-049: arity 4, ordered LOW to HIGH, applied to all nine dimensions, all
   * nine mandatory (A-017). `developing` is unchanged in value and ordinal position. There is
   * no fifth level. Both the display label and the STORAGE value are asserted, because a UI
   * relabel that left the stored value behind would still read correctly on screen.
   */
  const RATIFIED_RATING_LABELS = ["Beginning", "Developing", "Mastering", "Mastered"];
  const RATIFIED_RATING_VALUES = ["beginning", "developing", "mastering", "mastered"];

  /*
   * Amendment 006 A-050 — the four behavioural anchors, VERBATIM. These four strings are the
   * backend's `RUBRIC_ANCHORS` character-for-character; A-050 requires the backend and frontend
   * copies to be byte-identical, so asserting them here proves the shipped frontend copy did not
   * drift during the relabel. The anchor TEXT did not change; only the label it is keyed to did.
   */
  const RATIFIED_ANCHORS = {
    Beginning:
      "Requires frequent prompting, modelling, and support to demonstrate the skill consistently.",
    Developing:
      "Demonstrates the skill with some guidance and increasing confidence, but consistency may still vary.",
    Mastering:
      "Demonstrates the skill independently and consistently across most classroom activities and presentations.",
    Mastered:
      "Exceeds the expected level: strong confidence, natural expression, independent application, consistent across different contexts.",
  };

  const chipReport = await evaluate(`
    (() => {
      const labels = ${JSON.stringify(RATIFIED_RATING_LABELS)};
      const values = ${JSON.stringify(RATIFIED_RATING_VALUES)};
      const problems = [];
      const fieldsets = [...document.querySelectorAll('fieldset')];
      for (const fieldset of fieldsets) {
        const chips = [...fieldset.querySelectorAll('button[data-rating-level]')];
        if (chips.length !== 4) {
          problems.push('arity ' + chips.length);
          continue;
        }
        chips.forEach((chip, index) => {
          if (chip.textContent.trim() !== labels[index]) {
            problems.push('label ' + chip.textContent.trim() + ' at ' + index);
          }
          if (chip.getAttribute('data-rating-level') !== values[index]) {
            problems.push('value ' + chip.getAttribute('data-rating-level') + ' at ' + index);
          }
        });
      }
      return problems;
    })()
  `);
  assert(
    chipReport.length === 0,
    `Rating chips must be exactly Beginning/Developing/Mastering/Mastered, low to high, on all nine dimensions: ${chipReport.join(", ")}`,
  );

  /*
   * F-07 — a REAL accessible name per control, carrying that level's ratified anchor VERBATIM.
   * All 36 chips would otherwise expose only four distinct names ("Beginning" … "Mastered")
   * repeated nine times, which is not a usable name in a nine-row instrument, and the
   * behavioural meaning would reach a screen-reader user only AFTER the choice was made.
   */
  const namingReport = await evaluate(`
    (() => {
      const anchors = ${JSON.stringify(RATIFIED_ANCHORS)};
      const problems = [];
      for (const fieldset of document.querySelectorAll('fieldset[data-dimension]')) {
        const dimension = fieldset.querySelector('p span').textContent.trim().replace(/^\\d+\\.\\s*/, '');
        for (const chip of fieldset.querySelectorAll('button[data-rating-level]')) {
          const label = chip.textContent.trim();
          const name = chip.getAttribute('aria-label') ?? '';
          if (!name.includes(dimension)) problems.push('no dimension in name: ' + name);
          if (!name.includes(label)) problems.push('no level in name: ' + name);
          if (!name.includes(anchors[label])) problems.push('anchor not verbatim in name: ' + name);
        }
      }
      return problems.slice(0, 5);
    })()
  `);
  assert(
    namingReport.length === 0,
    `Every rating control must carry a real accessible name with its verbatim anchor: ${namingReport.join(" | ")}`,
  );
  assert(
    (await evaluate(`
      new Set([...document.querySelectorAll('button[data-rating-level]')]
        .map((chip) => chip.getAttribute('aria-label'))).size
    `)) === 36,
    "All 36 rating controls must have distinct accessible names",
  );

  /*
   * The three superseded competency labels must not render anywhere on the assessment surface.
   * This is an EXACT-TEXT leaf check, not a bare-word prose regex — A-052 prohibits the latter.
   * `Advanced` is checked as a competency chip only: the Class Grade vocabulary is a different,
   * unchanged vocabulary (A-054) and marks itself `data-vocabulary="class-grade"`.
   */
  const supersededChips = await evaluate(`
    (() => {
      const superseded = ["Emerging", "Secure", "Advanced"];
      return [...document.querySelectorAll('button, [data-rating-level]')]
        .filter((element) => !element.closest('[data-vocabulary="class-grade"]'))
        .filter((element) => superseded.includes(element.textContent.trim()))
        .map((element) => element.textContent.trim());
    })()
  `);
  assert(
    supersededChips.length === 0,
    `A superseded competency rating still renders as a control: ${supersededChips.join(", ")}`,
  );

  /*
   * All four rating states, one at a time, on the first dimension: selecting a level must
   * surface THAT level's ratified behavioural anchor verbatim, and the polarity-keyed chip
   * treatment must meet 4.5:1 for its own label text in the selected state (SC 1.4.3).
   * `Mastering` is a POSITIVE band (A-051) and is asserted alongside `Mastered`.
   */
  for (const label of RATIFIED_RATING_LABELS) {
    await evaluate(`
      [...document.querySelectorAll('fieldset')[0].querySelectorAll('button[data-rating-level]')]
        .find((candidate) => candidate.textContent.trim() === ${JSON.stringify(label)}).click()
    `);
    await waitUntil(
      `document.body.innerText.includes(${JSON.stringify(label + " anchor:")})`,
      `${label} anchor heading`,
    );
    /*
     * Belt and braces alongside the reduced-motion emulation above: the selected chip carries a
     * SOLID fill, so a still-transparent computed background proves the transition has not
     * settled and the reading that follows would be measuring the idle state.
     */
    await waitUntil(
      `(() => {
        const chip = [...document.querySelectorAll('fieldset')[0].querySelectorAll('button[data-rating-level]')]
          .find((candidate) => candidate.textContent.trim() === ${JSON.stringify(label)});
        const background = getComputedStyle(chip).backgroundColor;
        return chip.getAttribute('aria-pressed') === 'true' &&
          background !== 'rgba(0, 0, 0, 0)' && background !== 'transparent';
      })()`,
      `${label} chip fill settled`,
    );
    assert(
      await bodyIncludes(RATIFIED_ANCHORS[label]),
      `The ${label} behavioural anchor did not render verbatim`,
    );
    const contrast = await ratingChipContrast(0, label);
    assert(
      contrast >= 4.5,
      `Selected ${label} chip label text measured ${contrast}:1 in the production DOM; SC 1.4.3 requires 4.5:1`,
    );
    console.log(`  · ${label} chip label contrast ${contrast}:1 (rendered production DOM)`);
  }
  await evaluate(`
    ${JSON.stringify(ratingSelections)}.forEach((rating, index) => {
      const button = [...document.querySelectorAll('fieldset')[index].querySelectorAll('button')]
        .find((candidate) => candidate.textContent.trim() === rating);
      button.click();
    })
  `);
  await waitUntil("document.body.innerText.includes('9 of 9 dimensions rated')", "complete assessment");
  await evaluate(`
    const values = [
      'Learner Aster used a clear opening and recovered calmly after one prompt.',
      'Rehearse vocal projection while preserving the same structured opening.'
    ];
    [...document.querySelectorAll('textarea')].forEach((element, index) => {
      Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(element, values[index]);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    });
  `);
  await clickExact("button", "Save & Generate");
  await waitUntil(
    "document.body.innerText.includes('Observation was not saved')",
    "deterministic save failure",
  );
  assert(await bodyIncludes("9 of 9 dimensions rated"), "Ratings were lost after retryable failure");
  await clickExact("button", "Save & Generate");
  await waitUntil("document.body.innerText.includes('Observation saved')", "observation save success");

  await clickExact("a", "Continue to AI draft");
  await waitUntil(
    "document.body.innerText.includes('Draft rejected safely')",
    "deterministic generation failure",
    15_000,
  );
  assert(await bodyIncludes("never displays the rejected draft"), "Failure containment copy is missing");
  /* -------------------------------------------------------------------------
   * Screen 08 Trainer AI Report Generation — F-08.
   *
   * The load-bearing assertions are the governance rules the frozen frame cannot demonstrate,
   * and in four places actively contradicts: the frame is a TERM REPORT marked "Parent copy"
   * (D1 — term generation is out of MVP scope and no Trainer working version is a parent copy),
   * it draws a working drag-and-drop evidence UPLOADER (D3 — evidence scope and uploader are
   * unresolved and no governed upload path exists), it draws "Lesson / Term / Overall Grade"
   * rows no governed DTO carries (D4/D5), and it makes "Confirm & Submit" a TRAINER primary
   * control with no Quality Checklist (D7 — the Trainer action is Approve, gated on the
   * three-item version-scoped checklist, and the Trainer never publishes).
   * ----------------------------------------------------------------------- */

  /* Spec §15 — the failure state is a designed recovery, and the assessment survives it. */
  assert(
    await bodyIncludes("Your assessment is preserved"),
    "The generation failure state must state that the saved assessment is preserved",
  );
  assert(
    (await evaluate(`document.querySelectorAll('[data-report-panel]').length`)) === 0,
    "No draft panel may render while grounding has rejected the draft",
  );
  assert(
    (await evaluate(`document.querySelectorAll('[data-rating-level]').length`)) === 0,
    "No rating snapshot may render before a validated draft exists",
  );
  const failureScreenshot = await screenshot("generation-first-failure.png");
  await clickExact("button", "Retry once");
  await waitUntil("document.body.innerText.includes('Grounded draft ready')", "draft retry success", 15_000);
  await waitUntil(
    "document.querySelectorAll('[data-report-panel]').length === 4",
    "generated draft panels hydrated",
    15_000,
  );

  /* D2 — the four GOVERNED panels, in order, not the frame's Overview/Strengths/Areas/Remarks. */
  const generatedPanels = await evaluate(
    `[...document.querySelectorAll('[data-report-panel]')].map((node) => node.dataset.reportPanel)`,
  );
  assert(
    JSON.stringify(generatedPanels) ===
      JSON.stringify(["todaysStrength", "nextFocus", "practiceSuggestion", "sessionTakeaway"]),
    `The four GOVERNED parent-facing panels must render in order; found ${generatedPanels.join(", ")}`,
  );

  /*
   * D1 — the frame's term-report identity. End-of-term report GENERATION is expressly out of
   * MVP scope, and "Parent copy" is a lifecycle claim only management's Approve & Submit can
   * make (A-033). Neither may appear on this governed per-session Trainer surface.
   */
  assert(
    !(await evaluate(`/term report|parent copy/i.test(document.body.innerText)`)),
    "The generation surface must not present itself as a term report or a parent copy",
  );

  /*
   * D7 — the frame's "Confirm & Submit" / "Save as draft" Trainer controls. The Trainer action
   * is APPROVE, gated on the three-item version-scoped Quality Checklist, and the Trainer does
   * not publish. Neither control may exist here, and nothing may claim publication.
   */
  assert(
    !(await evaluate(`/confirm & submit|confirm and submit|save as draft/i.test(document.body.innerText)`)),
    "The Trainer generation surface must not carry an ungoverned submit or save-as-draft control",
  );
  assert(
    await bodyIncludes("You do not publish, and no parent is notified at this step"),
    "The generation surface must state the two-stage boundary plainly",
  );
  assert(
    await bodyIncludes("complete the three-item Quality Checklist"),
    "The governed approve gate must be named on the hand-off to review",
  );

  /* D4 / D5 — no ungoverned Report Details field, and no invented overall grade. */
  const generationDetailTerms = await evaluate(
    `[...document.querySelectorAll('dt')].map((node) => node.textContent.trim())`,
  );
  assert(
    !generationDetailTerms.some((term) => /^(overall grade|lesson|term)$/i.test(term)),
    `Report Details must not carry an ungoverned field; found ${generationDetailTerms.join(", ")}`,
  );
  assert(
    generationDetailTerms.includes("Name") && generationDetailTerms.includes("Class"),
    `Report Details must carry the governed Name and Class rows; found ${generationDetailTerms.join(", ")}`,
  );

  /* D3 — the evidence region is kept, inert, reasoned, and carries no uploader. */
  assert(
    await evaluate(`
      (() => {
        const region = document.querySelector('[data-evidence-state="unavailable"]');
        if (!region) return false;
        const control = region.querySelector('button');
        return Boolean(control && control.disabled && control.getAttribute('aria-describedby')) &&
          region.querySelectorAll('a, input, video, iframe, form').length === 0;
      })()
    `),
    "Class Video Evidence must be inert with a stated reason and no uploader or media path",
  );
  assert(
    !(await evaluate(`/drag & drop|drag and drop|MP4|500MB/i.test(document.body.innerText)`)),
    "No upload affordance or unratified media policy may be simulated",
  );

  /* A-038 — the content hash covers the four panels PLUS the nine ratings and is never shown. */
  assert(
    !(await evaluate(`/content hash|contentHash|[0-9a-f]{32,}/i.test(document.body.innerText)`)),
    "The report content hash must never be rendered on the generation surface",
  );

  /*
   * D6 + A-049 — the frame draws four tiles; all nine dimensions are mandatory (A-017) and no
   * governed rule selects a subset, so all nine governed snapshots render, in the ratified
   * vocabulary, and every label clears SC 1.4.3 in the production DOM.
   */
  const generationTiles = await evaluate(`
    (() => {
      ${CONTRAST_CORE}
      return [...document.querySelectorAll('[data-rating-level]')].map((node) => ({
        level: node.getAttribute('data-rating-level'),
        label: node.textContent.trim(),
        contrast: contrastOf(node),
      }));
    })()
  `);
  assert(
    generationTiles.length === 9,
    `Expected nine governed rating snapshots on the generation surface; found ${generationTiles.length}`,
  );
  const ratifiedGenerationPairs = {
    beginning: "Beginning",
    developing: "Developing",
    mastering: "Mastering",
    mastered: "Mastered",
  };
  const strayGenerationTiles = generationTiles.filter(
    (tile) => ratifiedGenerationPairs[tile.level] !== tile.label,
  );
  assert(
    strayGenerationTiles.length === 0,
    `A rating snapshot rendered outside the ratified vocabulary: ${strayGenerationTiles
      .map((tile) => `${tile.level}=${tile.label}`)
      .join(", ")}`,
  );
  for (const level of Object.keys(ratifiedGenerationPairs)) {
    const tile = generationTiles.find((candidate) => candidate.level === level);
    assert(tile, `The ${level} rating state never reached the generation surface`);
    assert(
      tile.contrast >= 4.5,
      `The ${level} rating label measured ${tile.contrast}:1 on screen 08; SC 1.4.3 requires 4.5:1`,
    );
    console.log(
      `  · ${tile.label} rating-tile label contrast ${tile.contrast}:1 (rendered production DOM, screen 08)`,
    );
  }

  /* Token convergence: this surface uses project tokens, not the Tailwind default palette. */
  assert(
    await evaluate(`
      [...document.querySelectorAll('main *')].every((element) =>
        !/(^|\\s)(bg|text|border|divide|accent)-(slate|gray|zinc|indigo|red|amber|teal|green|navy)-/.test(element.className.baseVal ?? element.className ?? ''))
    `),
    "The generation surface must use project tokens, not Tailwind default-palette classes",
  );

  const generationScreenshot = await screenshot("ai-report-generation.png");

  await clickExact("a", "Review four-panel report");
  /*
   * The wait is keyed on the three real checklist inputs, not on the words "Quality Checklist".
   * Screen 08 now NAMES the governed gate in its hand-off copy (F-08 D7), so a text-only wait
   * would settle on the generation surface and every following screen-10 assertion would run
   * against the wrong page.
   */
  await waitUntil(
    `document.querySelectorAll('input[type="checkbox"]').length === 3 &&
      document.body.innerText.includes('Quality Checklist')`,
    "four-panel report review",
  );
  /* -------------------------------------------------------------------------
   * Screen 10 Trainer Student Report — F-09.
   *
   * The load-bearing assertions are the governance rules the frozen frame cannot demonstrate,
   * because the frame draws only the already-approved end state: the four GOVERNED panels
   * (not the frame's Overview/Strengths/Areas/Remarks headings — D2), the real three-item
   * approve gate, the non-publishing approval copy, the inert Class Video Evidence region
   * (D3), the omitted Overall Grade (D5), and AA contrast on all four rating states.
   * ----------------------------------------------------------------------- */

  const reportPanels = await evaluate(
    `[...document.querySelectorAll('[data-report-panel]')].map((node) => node.dataset.reportPanel)`,
  );
  assert(
    JSON.stringify(reportPanels) ===
      JSON.stringify(["todaysStrength", "nextFocus", "practiceSuggestion", "sessionTakeaway"]),
    `The four GOVERNED parent-facing panels must render in order; found ${reportPanels.join(", ")}`,
  );
  assert(
    await bodyIncludes("Coach Notes (Internal Only)"),
    "The internal Coach Notes panel must render on the Trainer review surface",
  );
  assert(
    (await evaluate(`document.querySelectorAll('input[type="checkbox"]').length`)) === 3,
    "The quality checklist must have exactly three items",
  );

  /*
   * D1 — the frame's "Official report" claim is a lifecycle claim only management's Approve &
   * Submit can make (A-033), so it must not appear on this Trainer working surface.
   */
  assert(
    !(await bodyIncludes("Official report")),
    "The Trainer working version must not be presented as an official/published report",
  );

  /*
   * D5 — no governed overall or roll-up competency grade exists. A single headline rating here
   * would be a derived assessment fact this frontend computed.
   */
  const detailTerms = await evaluate(
    `[...document.querySelectorAll('dt')].map((node) => node.textContent.trim())`,
  );
  assert(
    !detailTerms.some((term) => /^(overall grade|lesson|term)$/i.test(term)),
    `Report Details must not carry an ungoverned field; found ${detailTerms.join(", ")}`,
  );
  assert(
    detailTerms.includes("Name") && detailTerms.includes("Class"),
    `Report Details must carry the governed Name and Class rows; found ${detailTerms.join(", ")}`,
  );

  /*
   * A-038 — the content hash covers the four panels PLUS the nine ratings and is never
   * rendered. It is carried to the server as a concurrency proof only.
   */
  assert(
    !(await evaluate(
      `/content hash|contentHash|[0-9a-f]{32,}/i.test(document.body.innerText)`,
    )),
    "The report content hash must never be rendered",
  );

  /* D3 — Class Video Evidence: frame region kept, rendered inert with a stated reason. */
  assert(
    await evaluate(`
      (() => {
        const region = document.querySelector('[data-evidence-state="unavailable"]');
        if (!region) return false;
        const control = region.querySelector('button');
        return Boolean(control && control.disabled && control.getAttribute('aria-describedby')) &&
          region.querySelectorAll('a, video, iframe').length === 0;
      })()
    `),
    "Class Video Evidence must be inert with a programmatically associated reason and no media path",
  );
  assert(
    await bodyIncludes("unresolved governance decision"),
    "The evidence region must state why it is inactive rather than simulating an uploader",
  );

  /* The approve gate renders visually disabled until all three attestations are checked. */
  assert(
    await evaluate(`
      (() => {
        const approve = [...document.querySelectorAll('button')]
          .find((candidate) => candidate.textContent.trim() === 'Approve');
        return Boolean(approve && approve.disabled);
      })()
    `),
    "Approve must render disabled until all three checklist items are checked",
  );
  assert(
    await bodyIncludes("The server re-checks all three attestations for this exact version"),
    "The copy must state that the server re-verifies the gate for the exact version",
  );
  assert(
    await bodyIncludes("It does not make the report parent-visible"),
    "Trainer approval must not be presented as publication",
  );

  /* Token convergence: this surface uses project tokens, not the Tailwind default palette. */
  assert(
    await evaluate(`
      [...document.querySelectorAll('main *')].every((element) =>
        !/(^|\\s)(bg|text|border|divide|accent)-(slate|gray|zinc|indigo|red|amber|teal|green|navy)-/.test(element.className.baseVal ?? element.className ?? ''))
    `),
    "The report surface must use project tokens, not Tailwind default-palette classes",
  );

  /*
   * F-06 — the Trainer-internal nine-rating source check renders the ratified A-049 vocabulary,
   * and every one of the four states the walkthrough actually saved appears. This is a
   * Trainer-only surface; the parent and management guards elsewhere prove the same tokens
   * never reach those audiences.
   */
  const reviewSnapshots = await evaluate(`
    (() => {
      const nodes = [...document.querySelectorAll('[data-rating-level]')];
      return {
        count: nodes.length,
        pairs: nodes.map((node) => node.getAttribute('data-rating-level') + '=' + node.textContent.trim()),
      };
    })()
  `);
  assert(
    reviewSnapshots.count === 9,
    `Expected nine rating snapshots on the Trainer review surface; found ${reviewSnapshots.count}`,
  );
  const expectedPairs = {
    beginning: "beginning=Beginning",
    developing: "developing=Developing",
    mastering: "mastering=Mastering",
    mastered: "mastered=Mastered",
  };
  const mislabelled = reviewSnapshots.pairs.filter(
    (pair) => !Object.values(expectedPairs).includes(pair),
  );
  assert(
    mislabelled.length === 0,
    `A rating snapshot rendered outside the ratified vocabulary: ${mislabelled.join(", ")}`,
  );
  for (const value of Object.keys(expectedPairs)) {
    assert(
      reviewSnapshots.pairs.includes(expectedPairs[value]),
      `The ${value} rating state never reached the Trainer review surface`,
    );
  }

  /*
   * F-09 — THE CARRY-OVER DEFECT, RE-MEASURED. The F-06 verifier found these nine per-dimension
   * rating labels rendering `text-brand-600`: one brand pink for all four states, measuring
   * 3.53:1 on white in the production DOM and failing SC 1.4.3. They now carry the
   * ordinal-keyed `rating-N-on-soft` foreground on the matching `rating-N-soft` fill. ALL FOUR
   * states are measured here — a fix proved on only the states that happen to be on screen is
   * not proved — and colour is never the only carrier, because each tile states its level in
   * text.
   */
  const ratingTileContrast = await evaluate(`
    (() => {
      ${CONTRAST_CORE}
      return [...document.querySelectorAll('[data-rating-level]')].map((node) => ({
        level: node.getAttribute('data-rating-level'),
        label: node.textContent.trim(),
        contrast: contrastOf(node),
      }));
    })()
  `);
  assert(
    ratingTileContrast.length === 9,
    `Expected nine rating tiles to measure; found ${ratingTileContrast.length}`,
  );
  const measuredLevels = new Set(ratingTileContrast.map((tile) => tile.level));
  assert(
    measuredLevels.size === 4,
    `All four rating states must be measured on this surface; found ${[...measuredLevels].join(", ")}`,
  );
  for (const level of ["beginning", "developing", "mastering", "mastered"]) {
    const tile = ratingTileContrast.find((candidate) => candidate.level === level);
    assert(tile, `The ${level} rating state never reached the Trainer report surface`);
    assert(
      tile.contrast >= 4.5,
      `The ${level} rating label measured ${tile.contrast}:1 in the production DOM; SC 1.4.3 requires 4.5:1`,
    );
    console.log(
      `  · ${tile.label} rating-tile label contrast ${tile.contrast}:1 (rendered production DOM, screen 10)`,
    );
  }

  const reviewScreenshot = await screenshot("report-review.png");

  await clickExact("a", "Edit wording");
  await waitUntil(
    "document.querySelectorAll('textarea').length === 4",
    "four-panel wording editor",
  );
  await evaluate(`
    const element = document.querySelector('textarea');
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(
      element,
      element.value + ' The next step is to repeat this strength with steadier projection.'
    );
    element.dispatchEvent(new Event('input', { bubbles: true }));
  `);
  await waitUntil(
    `[...document.querySelectorAll('button')].some((button) => button.textContent.trim() === 'Save changes & return to review' && !button.disabled)`,
    "enabled wording save",
  );
  await clickExact("button", "Save changes & return to review");
  await waitUntil("document.body.innerText.includes('Wording changes saved')", "saved wording banner");
  assert(
    await evaluate(`
      document.querySelectorAll('input[type="checkbox"]').length === 3 &&
      [...document.querySelectorAll('input[type="checkbox"]')].every((input) => !input.checked)
    `),
    "Checklist was not reset after the wording edit",
  );

  for (let index = 0; index < 3; index += 1) {
    await waitUntil(
      `!document.querySelectorAll('input[type="checkbox"]')[${index}].disabled`,
      `checklist item ${index + 1} enabled`,
    );
    await evaluate(`document.querySelectorAll('input[type="checkbox"]')[${index}].click()`);
    await waitUntil(
      `document.querySelectorAll('input[type="checkbox"]')[${index}].checked`,
      `checklist item ${index + 1} checked`,
    );
  }
  await waitUntil(
    `[...document.querySelectorAll('button')].some((button) => button.textContent.trim() === 'Approve' && !button.disabled)`,
    "Trainer approval enabled",
  );
  await clickExact("button", "Approve");
  await waitUntil("document.body.innerText.includes('Approve Learner Aster')", "approval dialog");
  assert(await bodyIncludes("It does not publish the report"), "Approval dialog over-promises publication");
  assert(await bodyIncludes("does not notify a parent"), "Approval dialog over-promises parent notification");
  await clickExact("button", "Approve for management review");
  await waitUntil(
    "document.body.innerText.includes('Trainer approval saved')",
    "Trainer approval success",
  );
  assert(await bodyIncludes("Parent visibility is unchanged"), "Approval success privacy copy is missing");

  /*
   * F-09 — `trainer_approved` is the state the frozen frame actually draws, and its banner is
   * correct and expected: the report has gone to MANAGEMENT, not to a parent. The three
   * assertions below are the whole point of A-033 on this screen.
   */
  assert(
    await bodyIncludes("Report sent to management for approval"),
    "The trainer_approved state must render the frame's management-approval banner",
  );
  assert(
    !(await evaluate(
      `/parent (has been |will be )?notified|notify the parent|sent to the parent|published to/i.test(document.body.innerText)`,
    )),
    "The approved state must never claim publication or a parent notification",
  );
  assert(
    await evaluate(`
      [...document.querySelectorAll('input[type="checkbox"]')].every((input) => input.disabled)
    `),
    "The checklist must be inert once this version carries a Trainer approval",
  );
  const approvalScreenshot = await screenshot("trainer-approved.png");

  await navigate("/trainer/reports?status=needs_edit");
  await waitUntil("document.body.innerText.includes('Trainer correction queue')", "returned-report queue");
  await clickExact("a", "Open correction detail");
  await waitUntil(
    "document.body.innerText.includes('Returned for Trainer correction')",
    "returned-report correction banner",
  );
  assert(await bodyIncludes("fresh correction or explicit reaffirmation version"), "Returned-work versioning copy is missing");

  await navigate("/trainer/reports?status=needs_edit&preview=empty");
  await waitUntil("document.body.innerText.includes('No returned reports')", "empty returned queue");
  await navigate("/trainer/reports?status=unknown");
  await waitUntil("document.body.innerText.includes(\"This item isn't available\")", "unavailable state");

  assert(consoleErrors.length === 0, `Browser console/runtime errors: ${consoleErrors.join(" | ")}`);
  console.log(
    JSON.stringify(
      {
        result: "passed",
        checks: [
          "fixture role presentation and permanent fixture banner",
          "canonical /trainer/schedule route, /trainer compatibility redirect, month projection, inactive Add Agenda, day selection, view switch and empty state",
          "screen 06 roster: canonical Schedule links, present-only progress, carried-over focus, per-status actions, absent card exposing no assessment or report path, filter narrowing, inert lesson plan, and project-token convergence",
          "roster and all-nine validation",
          "screen 07 grade student: one capture mode (no Quick/Full), the nine dimensions in ratified order, a behavioural anchor on every dimension, a distinct accessible name carrying the verbatim anchor on all 36 rating controls, the loaded Follow-up/Coach-Notes value, the REVIEW & APPROVE counters, the absent learner exposing no status and no path, per-status rail destinations, project-token convergence, and idle + selected AA contrast for all four rating states",
          "retryable observation save failure and recovery",
          "deterministic generation failure, bounded retry, and success",
          "screen 08 AI report generation: assessment preserved across the grounding rejection with no panel or rating rendered, the four GOVERNED panels after a validated draft, no term-report or 'Parent copy' framing, no Confirm & Submit or Save as draft control, the two-stage and Quality-Checklist hand-off copy, no invented Lesson/Term/Overall Grade row, inert Class Video Evidence with no uploader or media policy, no rendered content hash, all nine ratified rating snapshots at AA contrast, and project-token convergence",
          "screen 10 trainer student report: the four GOVERNED panels in order, internal Coach Notes, no 'Official report' claim, no invented overall grade, no rendered content hash, inert Class Video Evidence with a stated reason, the disabled-until-complete approve gate with its server re-verification copy, project-token convergence, AA contrast on all four rating states in the nine tiles, and the trainer_approved banner claiming management review and never a parent notification",
          "four-panel review, wording edit, checklist reset, and approval",
          "returned correction, empty, and unavailable states",
          "zero uncaught browser-console/runtime errors",
        ],
        screenshots: [
          loginScreenshot,
          rosterScreenshot,
          assessmentScreenshot,
          failureScreenshot,
          generationScreenshot,
          reviewScreenshot,
          approvalScreenshot,
        ],
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
