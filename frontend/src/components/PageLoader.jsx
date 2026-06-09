export function PageLoader({ label = "Loading…" }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4">
      <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-slate-200 border-t-bbc-red dark:border-slate-700 dark:border-t-bbc-red" />
      <p className="text-sm font-medium text-slate-500">{label}</p>
    </div>
  );
}

export function HomeSkeleton() {
  return (
    <div className="mx-auto max-w-7xl animate-fade-up px-4 py-8 sm:px-6">
      <div className="skeleton mb-8 h-72 w-full rounded-2xl sm:h-96" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="skeleton h-8 w-48" />
          <div className="grid gap-5 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="skeleton h-44" />
                <div className="space-y-2 p-4">
                  <div className="skeleton h-3 w-16" />
                  <div className="skeleton h-5 w-full" />
                  <div className="skeleton h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="sidebar-card space-y-3">
            <div className="skeleton h-6 w-32" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
