export function PageLoader({ label = "Loading…" }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 px-4">
      <div className="w-full max-w-md space-y-4">
        <div className="skeleton h-8 w-3/4" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-5/6" />
        <div className="skeleton mt-6 h-48 w-full" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-4/5" />
      </div>
      <p className="text-meta sr-only">{label}</p>
    </div>
  );
}

export function HomeSkeleton() {
  return (
    <div className="animate-fade-up">
      <div className="skeleton h-12 w-full rounded-none" />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-0 lg:grid-cols-12">
          <div className="skeleton aspect-[16/10] lg:col-span-7" />
          <div className="space-y-4 border-t border-slate-200 p-4 dark:border-slate-800 lg:col-span-5 lg:border-l lg:border-t-0">
            <div className="skeleton h-3 w-24" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-4 border-t border-slate-100 pt-4 dark:border-slate-800">
                <div className="skeleton h-16 w-20 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-3 w-16" />
                  <div className="skeleton h-4 w-full" />
                  <div className="skeleton h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10">
          <div className="skeleton mb-6 h-7 w-40" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="news-card overflow-hidden">
                <div className="skeleton aspect-[16/10]" />
                <div className="space-y-2 p-4">
                  <div className="skeleton h-3 w-16" />
                  <div className="skeleton h-5 w-full" />
                  <div className="skeleton h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="skeleton h-7 w-36" />
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2].map((i) => (
                <div key={i} className="news-card overflow-hidden">
                  <div className="skeleton aspect-[16/10]" />
                  <div className="space-y-2 p-4">
                    <div className="skeleton h-4 w-full" />
                    <div className="skeleton h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="sidebar-card space-y-3">
            <div className="skeleton h-6 w-28" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-10 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ArticleSkeleton() {
  return (
    <div className="mx-auto max-w-7xl animate-fade-up px-4 py-8 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="skeleton h-4 w-32" />
          <div className="skeleton h-12 w-full max-w-2xl" />
          <div className="skeleton h-4 w-48" />
          <div className="skeleton mt-6 aspect-video w-full" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton h-4 w-full" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="skeleton h-40 w-full" />
          <div className="skeleton h-32 w-full" />
        </div>
      </div>
    </div>
  );
}
