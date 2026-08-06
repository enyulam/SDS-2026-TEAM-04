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

async function bodyIncludes(text) {
  return evaluate(`document.body.innerText.includes(${JSON.stringify(text)})`);
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

  await navigate("/login?role=trainer");
  await waitUntil(
    "document.body.innerText.includes('Frontend Round F2 fixture')",
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
    await bodyIncludes("August 2026"),
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
    "document.querySelector('[data-schedule-day=\"2026-08-05\"]').click()",
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
        .find((button) => button.textContent.trim() === 'Save observation & generate draft').disabled
    `),
    "Observation save should be disabled before all nine ratings",
  );
  await clickExact("button", "Check required fields");
  await waitUntil(
    "document.body.innerText.includes('All nine ratings are required')",
    "all-nine validation",
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
    assert(
      await bodyIncludes(RATIFIED_ANCHORS[label]),
      `The ${label} behavioural anchor did not render verbatim`,
    );
    /*
     * Contrast is measured from the LIVE computed styles of the production build, and the
     * computed values are rasterised through a 1x1 canvas before the ratio is taken. Tailwind v4
     * resolves these tokens to `oklab()` / `lab()`, whose components can be NEGATIVE — a naive
     * numeric scrape silently drops the minus sign and reports a plausible but wrong ratio.
     * Rasterising asks the browser for the sRGB bytes it actually paints, which is the thing
     * SC 1.4.3 is about.
     */
    const contrast = await evaluate(`
      (() => {
        const chip = [...document.querySelectorAll('fieldset')[0].querySelectorAll('button[data-rating-level]')]
          .find((candidate) => candidate.textContent.trim() === ${JSON.stringify(label)});
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
        const style = getComputedStyle(chip);
        let background = style.backgroundColor;
        let node = chip;
        while (!background || background === 'rgba(0, 0, 0, 0)' || background === 'transparent') {
          node = node.parentElement;
          if (!node) { background = 'rgb(255, 255, 255)'; break; }
          background = getComputedStyle(node).backgroundColor;
        }
        const a = luminance(toSrgb(style.color));
        const b = luminance(toSrgb(background));
        const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
        return Math.round(ratio * 1000) / 1000;
      })()
    `);
    assert(
      typeof contrast === "number" && Number.isFinite(contrast),
      `Contrast for the selected ${label} chip could not be measured (got ${JSON.stringify(contrast)})`,
    );
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
  await clickExact("button", "Save observation & generate draft");
  await waitUntil(
    "document.body.innerText.includes('Observation was not saved')",
    "deterministic save failure",
  );
  assert(await bodyIncludes("9 of 9 dimensions rated"), "Ratings were lost after retryable failure");
  await clickExact("button", "Save observation & generate draft");
  await waitUntil("document.body.innerText.includes('Observation saved')", "observation save success");

  await clickExact("a", "Continue to AI draft");
  await waitUntil(
    "document.body.innerText.includes('Draft rejected safely')",
    "deterministic generation failure",
    15_000,
  );
  assert(await bodyIncludes("never displays the rejected draft"), "Failure containment copy is missing");
  const failureScreenshot = await screenshot("generation-first-failure.png");
  await clickExact("button", "Retry once");
  await waitUntil("document.body.innerText.includes('Grounded draft ready')", "draft retry success", 15_000);
  await clickExact("a", "Review four-panel report");
  await waitUntil("document.body.innerText.includes('Quality Checklist')", "four-panel report review");
  assert(
    (await evaluate(`document.querySelectorAll('article').length`)) >= 5,
    "The four report panels and internal note panel were not rendered",
  );
  assert(
    (await evaluate(`document.querySelectorAll('input[type="checkbox"]').length`)) === 3,
    "The quality checklist must have exactly three items",
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
          "retryable observation save failure and recovery",
          "deterministic generation failure, bounded retry, and success",
          "four-panel review, wording edit, checklist reset, and approval",
          "returned correction, empty, and unavailable states",
          "zero uncaught browser-console/runtime errors",
        ],
        screenshots: [
          loginScreenshot,
          rosterScreenshot,
          failureScreenshot,
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
