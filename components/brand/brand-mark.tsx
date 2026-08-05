import Link from "next/link";

export function BrandMark({ compact = false }: { readonly compact?: boolean }) {
  return (
    <Link
      href="/trainer"
      className="inline-flex items-center gap-3 rounded-lg text-white no-underline"
      aria-label="B.E.S.T. Coach Trainer home"
    >
      <span
        aria-hidden="true"
        className="grid size-10 place-items-center rounded-xl bg-brand-500 text-sm font-black tracking-[0.08em] shadow-lg shadow-blue-950/30"
      >
        B.
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block text-[0.68rem] font-bold uppercase tracking-[0.2em] text-blue-200">
            iSpeak Academy
          </span>
          <span className="block text-lg font-extrabold tracking-tight">
            B.E.S.T. Coach
          </span>
        </span>
      )}
    </Link>
  );
}
