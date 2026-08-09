// =====================================================================
// Shared CDP + admin-minted-session plumbing for the DEPLOYED system.
// =====================================================================
//
// ⚠️ EVERY session here is an ADMIN-MINTED SESSION
//   (`admin.auth.admin.generateLink` -> `client.auth.verifyOtp`).
// PASSWORD SIGN-IN IS **NOT-RUN** and no result from this file may ever be
// reported as proof that the sign-in form works.
//
// Cookies are written by `@supabase/ssr`'s own `createServerClient` into an
// in-memory jar, so their names, values and chunk boundaries are the
// library's, not this file's guess.
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import { join } from "node:path";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

export const APP = "https://best-coach-mvp.vercel.app";
export const HOST = "best-coach-mvp.vercel.app";
const CHROME = process.env.CHROME_PATH ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

export const IDENTITIES = {
  trainer: { email: "trainer.fixture@example.test", sub: "d0000000-0000-4000-8000-000000000002" },
  management: { email: "management.fixture@example.test", sub: "d0000000-0000-4000-8000-000000000001" },
  parent: { email: "parent.fixture@example.test", sub: "d0000000-0000-4000-8000-000000000003" },
};

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function mint(role) {
  const url = process.env.BEST_COACH_HOSTED_SUPABASE_URL;
  const secret = process.env.BEST_COACH_HOSTED_SECRET_KEY;
  const publishable = process.env.BEST_COACH_HOSTED_PUBLISHABLE_KEY;
  if (!url || !secret || !publishable) throw new Error("hosted env vars missing");
  const id = IDENTITIES[role];
  const admin = createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const link = await admin.auth.admin.generateLink({ type: "magiclink", email: id.email });
  if (link.error || !link.data?.properties?.hashed_token) throw new Error(`mint failed for ${role}`);
  const jar = new Map();
  const ssr = createServerClient(url, publishable, {
    cookies: {
      getAll: () => [...jar.entries()].map(([name, value]) => ({ name, value })),
      setAll: (list) => {
        for (const { name, value } of list) {
          if (value === "") jar.delete(name);
          else jar.set(name, value);
        }
      },
    },
  });
  const v = await ssr.auth.verifyOtp({ type: "magiclink", token_hash: link.data.properties.hashed_token });
  if (v.error || v.data?.user?.id !== id.sub) throw new Error(`${role} session did not resolve to the expected user`);
  return jar;
}

export async function openBrowser(port) {
  const profile = mkdtempSync(join(os.tmpdir(), "bc-chain-"));
  const chrome = spawn(
    CHROME,
    [
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profile}`,
      "--headless=new",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-gpu",
      "about:blank",
    ],
    { stdio: "ignore" },
  );

  let ws = null;
  let nextId = 1;
  const waiters = new Map();
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline && !ws) {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      const page = targets.find((t) => t.type === "page" && t.webSocketDebuggerUrl);
      if (page) {
        await new Promise((resolve, reject) => {
          const sock = new WebSocket(page.webSocketDebuggerUrl);
          sock.addEventListener("open", () => { ws = sock; resolve(); });
          sock.addEventListener("error", () => reject(new Error("CDP socket failed")));
          sock.addEventListener("message", (ev) => {
            const m = JSON.parse(ev.data);
            const w = waiters.get(m.id);
            if (w) { waiters.delete(m.id); w(m); }
          });
        });
      }
    } catch { /* not up yet */ }
    if (!ws) await sleep(300);
  }
  if (!ws) throw new Error("Chrome did not expose a page target");

  const send = (method, params = {}) =>
    new Promise((resolve) => {
      const id = nextId++;
      waiters.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });

  const evaluate = async (expression) => {
    const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (r.result?.exceptionDetails) return { __cdpError: String(r.result.exceptionDetails.text ?? "evaluation threw") };
    return r.result?.result?.value;
  };

  return {
    send,
    evaluate,
    async setCookies(jar) {
      for (const [name, value] of jar) {
        await send("Network.setCookie", { name, value, domain: HOST, path: "/", secure: true });
      }
    },
    async goto(path, { settle = 1200 } = {}) {
      await send("Page.navigate", { url: `${APP}${path}` });
      await sleep(settle);
    },
    async text() {
      return (await evaluate('document.body ? document.body.innerText : ""')) ?? "";
    },
    /** Wait until `predicate(text)` holds, or time out. Returns the final text. */
    async waitFor(predicate, budgetMs = 30_000) {
      const end = Date.now() + budgetMs;
      let t = "";
      while (Date.now() < end) {
        t = (await evaluate('document.body ? document.body.innerText : ""')) ?? "";
        if (predicate(t)) return t;
        await sleep(600);
      }
      return t;
    },
    async controls() {
      const raw = await evaluate(`JSON.stringify([...document.querySelectorAll('button,[role=button],a,input,select,textarea')]
        .map(e => ({ tag: e.tagName, type: e.type||null, name: e.name||null, id: e.id||null,
                     text: (e.innerText||e.value||'').trim().slice(0,60),
                     aria: e.getAttribute('aria-label')||null,
                     pressed: e.getAttribute('aria-pressed'),
                     checked: e.checked===true, disabled: e.disabled===true,
                     href: e.getAttribute('href')||null })))`);
      try { return JSON.parse(raw); } catch { return []; }
    },
    async close() {
      try { ws.close(); } catch { /* gone */ }
      try { chrome.kill(); } catch { /* gone */ }
      try { rmSync(profile, { recursive: true, force: true }); } catch { /* best effort */ }
    },
  };
}
