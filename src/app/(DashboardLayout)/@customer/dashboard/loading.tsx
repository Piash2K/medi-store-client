export default function CustomerDashboardLoading() {
  return (
    <main className="w-full space-y-6 pb-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-64 rounded-lg bg-slate-200/80 dark:bg-slate-800/80" />
          <div className="h-4 w-96 rounded-md bg-slate-200/80 dark:bg-slate-800/80" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-32 rounded-lg bg-slate-200/80 dark:bg-slate-800/80" />
          <div className="h-9 w-32 rounded-lg bg-slate-200/80 dark:bg-slate-800/80" />
        </div>
      </div>

      {/* Top 3 KPI Cards Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-28 rounded-xl border border-[#bbc9c7] bg-white p-6 shadow-sm dark:border-emerald-900 dark:bg-background/80"
          />
        ))}
      </div>

      {/* Charts Grid Skeleton */}
      <div className="grid gap-6 xl:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-64 rounded-xl border border-[#bbc9c7] bg-white p-6 shadow-sm dark:border-emerald-900 dark:bg-background/80"
          />
        ))}
        <div className="h-56 rounded-xl border border-[#bbc9c7] bg-white p-6 shadow-sm dark:border-emerald-900 dark:bg-background/80 xl:col-span-3" />
      </div>
    </main>
  );
}
