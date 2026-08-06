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
    <nav aria-labelledby={labelId} className="mt-2.5">
      <ul className="grid grid-cols-3 gap-0 rounded-nav bg-neutral-soft p-1">
        {AUTH_ROLES.map((role) => {
          const selected = role.value === activeRole;
          return (
            <li key={role.value} className="min-w-0">
              <Link
                href={`/login?role=${role.value}`}
                aria-current={selected ? "page" : undefined}
                data-role-segment={role.value}
                data-selected={selected ? "true" : "false"}
                className={`flex min-h-10 items-center justify-center rounded-[0.5rem] px-2 text-center text-body font-bold no-underline transition ${
                  selected
                    ? "bg-surface text-ink-strong shadow-raised"
                    : "text-ink-muted hover:text-ink-strong"
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
