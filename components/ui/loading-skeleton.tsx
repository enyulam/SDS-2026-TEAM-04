export function LoadingSkeleton({
  label = "Loading Trainer workspace",
  rows = 3,
}: {
  readonly label?: string;
  readonly rows?: number;
}) {
  return (
    <section className="space-y-4" aria-busy="true" aria-label={label}>
      <span className="sr-only">{label}</span>
      <div className="skeleton-shimmer h-8 w-52 rounded-lg" />
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="card overflow-hidden p-5 shadow-none"
          aria-hidden="true"
        >
          <div className="skeleton-shimmer h-5 w-1/3 rounded-md" />
          <div className="skeleton-shimmer mt-4 h-4 w-3/4 rounded-md" />
          <div className="skeleton-shimmer mt-2 h-4 w-1/2 rounded-md" />
        </div>
      ))}
    </section>
  );
}
