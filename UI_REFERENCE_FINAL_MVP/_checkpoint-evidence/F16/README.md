# F16 — evidence index (Run C1 Phase C4, 2026-08-06)

This folder is **outside the Git repository**. It indexes where the F16 evidence
actually lives. **No credential appears in this folder or in anything it points at.**

---

## Why there are no screenshots here

Every other `_checkpoint-evidence/<id>/` folder in this pack holds browser
screenshots from a checkpoint that rendered a portal surface. **F16 could not
produce those, and the reason is the checkpoint's own achievement.**

Before F16, every portal route was reachable without identity, so a headless
browser could screenshot any of them. After F16, all fifteen portal routes deny
an unauthenticated caller — so the only surfaces this run could legitimately
render are `/login` and the `/` redirect. **A portal screenshot now requires a
valid session, which requires a fixture password, which may only be entered at a
no-echo prompt on an operator-controlled terminal.**

That evidence belongs to the operator-assisted F17 run, and it is deferred there
rather than faked here.

---

## What the evidence is instead, and where it lives

| Evidence | Location |
|---|---|
| The 25-assertion route-security suite, and its full per-assertion output | `SDS Project Final (BEST Coach)/tests/frontend/integrated-route-security.mjs` — run it yourself, see below |
| Per-subcheckpoint independent verification verdicts (A, B, C) | `AUTONOMOUS_48H_RUN_C1_REPORT.md` §8-§13 |
| Commit-by-commit record | `AUTONOMOUS_48H_RUN_C1_REPORT.md` §8, §21 |
| Frontend workstream record | in-repository, `docs/workstreams/48H_FRONTEND_PROGRESS.md`, entry dated 2026-08-06 |
| Continuity record | in-repository, `docs/progress/STATUS.md` |
| F17 runner instructions and gate ledger | `../F17/README.md`, `../F17/gate-ledger.md` |

## Reproducing the F16 evidence yourself

From `SDS Project Final (BEST Coach)`, with the local Supabase stack up and the
fixture loaded:

```
npm run build
npx next start -p 3418
```

then, in a second terminal:

```
BEST_COACH_APP_ORIGIN=http://127.0.0.1:3418 node tests/frontend/integrated-route-security.mjs
```

It exits 0 and prints one line per assertion. **It needs no credential** — it
proves denial and structure, never a successful sign-in. Its own summary reports
`"credentialUsed": false`.

Last run by the orchestrator at commit `629965d`: **exit 0, 25/25 assertions,
65 HTTP responses inspected, 17 canonical routes, 15 guarded portal routes,
10 legs recorded as F17-deferred.**

---

## What F16 does NOT prove

Ten legs need a valid session and are printed by the suite on every run as
`F17-X01 … F17-X10`. They are **not written, not faked and not claimed**:

- Trainer blocked from Management and Parent; Management blocked from Trainer and
  Parent; Parent blocked from Trainer and Management — each with a live session
- A valid session routing to its own portal
- `/login` while authenticated bouncing to the caller's own portal
- Session-cookie refresh replay through `proxy.ts`
- The authorized `/trainer` → `/trainer/schedule` chain (the unauthenticated leg
  denies first, correctly)
- Management and Parent DOM exclusions on **authenticated** surfaces
- The success paths of all 23 `PhysicalTestPort` members

**F16 status: `Implementation complete — operator-assisted valid-login proof
pending`. It is not fully accepted.**
