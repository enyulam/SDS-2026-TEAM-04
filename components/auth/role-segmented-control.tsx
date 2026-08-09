import Link from "next/link";
import type { SessionRole } from "@/lib/frontend/contracts/physical-test";

/**
 * The "Sign in as" selector shared by the three frozen login references
 * (FRONTEND RECONSTRUCTION F2).
 *
 * ## This control carries no authority
 *
 * Each segment is a plain link to `/login?role=<value>`. Amendment 005 A-046 is absolute:
 * the role query **selects presentation only and carries no authority whatsoever**.
 * Authority requires a real authenticated Supabase Auth identity resolved server-side —
 * `auth.uid()` → `accounts.auth_user_id` → an active `centre_memberships` row.
 *
 * Consequently this component:
 *
 * - renders no credential, no session and no permission;
 * - grants nothing by marking a segment selected;
 * - must never be given an `onClick` that mutates session, role or authority.
 *
 * Semantics: these navigate between three URL variants of one screen, so they are links in
 * a labelled navigation group with `aria-current="page"` on the active one — not tabs, which
 * would promise a tabpanel that does not exist.
 */

export const AUTH_ROLES = [
  { value: "trainer", label: "Trainer" },
  { value: "management", label: "Management" },
  { value: "parent", label: "Parent" },
] as const satisfies readonly { value: SessionRole; label: string }[];

export function RoleSegmentedControl({
  activeRole,
  labelId,
}: {
  readonly activeRole: SessionRole;
  readonly labelId: string;
}) {
  return (
    /*
     * PHASE 1 — measured off the frozen export: a 9px gap above the group, a
     * 4px inner gutter between segments (the build had none), 4px track
     * padding, a 12px track radius, 9px segment radius, 9px vertical segment
     * padding and a 12.5px/500 label (the build carried 14px/700 on every
     * segment).
     *
     * The active segment's `shadow-raised` is dropped: the export gives it a
     * white fill on the grey track and no elevation. The current item stays
     * distinguishable without relying on colour — `aria-current="page"` carries
     * it programmatically and the filled block carries it visually, which is
     * the same treatment `portal-shell.tsx` already records for the rail
     * (GLOBAL_UI_RULES §7).
     *
     * The RESTING label moves `ink-muted` -> `neutral-on` and does not follow
     * the frame: #8A93A6 on the #F5F6FA track measures below 4.5:1, and these
     * segments are real links, not disabled controls.
     */
    <nav aria-labelledby={labelId} className="mt-[0.5625rem]">
      <ul className="grid grid-cols-3 gap-1 rounded-nav bg-surface-muted p-1">
        {AUTH_ROLES.map((role) => {
          const selected = role.value === activeRole;
          return (
            <li key={role.value} className="min-w-0">
              <Link
                href={`/login?role=${role.value}`}
                aria-current={selected ? "page" : undefined}
                data-role-segment={role.value}
                data-selected={selected ? "true" : "false"}
                /*
                 * PHASE 2 — THE THREE RATIFIED FRAMES DISAGREE HERE, so this is
                 * recorded rather than silently picked. The active segment is
                 * weight 500 in AUTH-01 and AUTH-03 and weight 600 in AUTH-02.
                 * That is a frame-vs-frame difference, which this plan says is
                 * never "drift" (§3.1) — drift is BUILD vs FRAME only.
                 *
                 * 600 is applied, to all three, for a reason beyond the count:
                 * Phase 1 set both states to 500 and dropped the active
                 * segment's elevation, which left the FILL as the only thing
                 * separating the current segment from its neighbours. Weight
                 * restores a genuine non-colour cue (GLOBAL_UI_RULES §7), and
                 * AUTH-02 ratifies exactly that value. One shared control keeps
                 * one treatment: a per-role weight would encode the role into
                 * presentation, and the role here is presentation only (A-046).
                 */
                className={`flex items-center justify-center rounded-[0.5625rem] px-2 py-[0.5625rem] text-center text-[0.78125rem] no-underline transition ${
                  selected
                    ? "bg-surface font-semibold text-ink-strong"
                    : "font-medium text-neutral-on hover:text-ink-strong"
                }`}
              >
                {role.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
