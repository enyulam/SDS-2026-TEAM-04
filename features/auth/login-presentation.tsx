"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BrandMark } from "@/components/brand/brand-mark";
import type { SessionRole } from "@/lib/frontend/contracts/physical-test";

const roles = [
  { value: "trainer", label: "Trainer", supporting: "Assess and review" },
  { value: "management", label: "Management", supporting: "Final quality review" },
  { value: "parent", label: "Parent", supporting: "View submitted reports" },
] as const satisfies readonly {
  value: SessionRole;
  label: string;
  supporting: string;
}[];

function presentationRole(value: string | null): SessionRole {
  return roles.some((role) => role.value === value)
    ? (value as SessionRole)
    : "trainer";
}

export function LoginPresentation() {
  const searchParams = useSearchParams();
  const activeRole = presentationRole(searchParams.get("role"));
  const active = roles.find((role) => role.value === activeRole) ?? roles[0];

  return (
    <div className="grid w-full overflow-hidden rounded-[1.75rem] border border-white/10 bg-white shadow-2xl shadow-black/30 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="bg-navy-900 p-7 sm:p-10 lg:p-12">
        <BrandMark />
        <div className="mt-16 max-w-md">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-blue-200">
            Trainer-led reporting
          </p>
          <h1 className="mt-4 text-4xl font-black leading-tight tracking-[-0.035em] text-white sm:text-5xl">
            Human judgement stays in the loop.
          </h1>
          <p className="mt-5 text-base leading-7 text-blue-100">
            Capture all nine B.E.S.T. dimensions, review grounded wording, and
            approve work for management&apos;s final quality review.
          </p>
        </div>
        <div className="mt-12 rounded-2xl border border-blue-300/20 bg-white/5 p-4 text-sm leading-6 text-blue-100">
          <strong className="block text-white">Frontend Round F1 fixture</strong>
          This presentation performs no sign-in and grants no authority. The role query
          parameter changes this card only.
        </div>
      </section>

      <section className="p-6 text-ink sm:p-10 lg:p-12" aria-labelledby="login-heading">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-600">
          Portal presentation
        </p>
        <h2 id="login-heading" className="mt-2 text-3xl font-black tracking-tight text-navy-950">
          Continue as {active.label}
        </h2>
        <p className="mt-2 text-sm leading-6 text-ink-muted">{active.supporting}</p>

        <div className="mt-7 grid grid-cols-3 gap-2" role="tablist" aria-label="Portal role presentation">
          {roles.map((role) => (
            <Link
              key={role.value}
              href={`/login?role=${role.value}`}
              role="tab"
              aria-selected={role.value === activeRole}
              className={`rounded-xl border px-2 py-3 text-center text-sm font-extrabold transition ${
                role.value === activeRole
                  ? "border-brand-600 bg-brand-100 text-brand-600"
                  : "border-line bg-white text-ink-muted hover:border-brand-500 hover:text-navy-900"
              }`}
            >
              {role.label}
            </Link>
          ))}
        </div>

        <div className="mt-7 space-y-5" aria-describedby="auth-disabled-note">
          <label className="block text-sm font-bold text-navy-900">
            Email address
            <input
              className="form-field mt-2"
              type="email"
              placeholder={`${activeRole}@fixture.invalid`}
              disabled
            />
          </label>
          <label className="block text-sm font-bold text-navy-900">
            Password
            <input className="form-field mt-2" type="password" value="" disabled readOnly />
          </label>
          <p id="auth-disabled-note" className="rounded-xl bg-slate-100 px-3 py-2.5 text-xs leading-5 text-ink-muted">
            Credential entry is disabled because real authentication is deliberately not
            implemented in Frontend Round F1.
          </p>
        </div>

        {activeRole === "trainer" ? (
          <Link
            href="/trainer"
            className="mt-7 flex min-h-12 w-full items-center justify-center rounded-xl bg-brand-600 px-5 py-3 text-base font-extrabold text-white transition hover:bg-brand-500"
          >
            Open Trainer fixture workspace
          </Link>
        ) : (
          <button
            className="mt-7 min-h-12 w-full cursor-not-allowed rounded-xl bg-slate-200 px-5 py-3 text-base font-extrabold text-slate-500"
            disabled
          >
            {active.label} flow arrives after Round F1
          </button>
        )}
        <p className="mt-4 text-center text-xs leading-5 text-ink-muted">
          Selecting a role changes presentation only. It never authenticates or authorizes.
        </p>
      </section>
    </div>
  );
}
