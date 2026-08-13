import { redirect } from "next/navigation";

/**
 * `/management` — COMPATIBILITY REDIRECT onto the canonical Management entry route.
 *
 * ⚠️ Operator ruling, 2026-08-14 (`P2-7`, option 2). Screen `11`'s canonical route is
 * `/management/dashboard`; this file is deliberately NOT deleted, because `/management`
 * is the destination several delivered surfaces and the portal shell already link to and
 * must keep working.
 *
 * ⛔ BUILT TO THE RATIFIED PRECEDENT, NOT A NEW PATTERN. `R-B1` made `/trainer` a
 * compatibility redirect onto `/trainer/schedule` in exactly this shape, and the rail
 * there names the DESTINATION rather than the redirect — because a rail item pointing at
 * a route that redirects away would make the "Dashboard" item never be the current one.
 * The Management rail follows suit.
 *
 * ⚠️ `proxy.ts` is UNCHANGED and needs no change: its two `/management` entries are
 * PORTAL-PREFIX matchers that already cover `/management/*`, so the new canonical route
 * was inside the authenticated boundary before it existed.
 */
export default function ManagementEntryRoute() {
  redirect("/management/dashboard");
}
