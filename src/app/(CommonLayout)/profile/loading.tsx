export default function ProfileLoading() {
  return (
    <main className="min-h-screen bg-[#f5fbf9] transition-colors duration-200 dark:bg-background">
      <div className="home-shell py-8 sm:py-10">
        {/* Header Skeleton */}
        <div className="mb-8 space-y-2">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200/80 dark:bg-slate-800/80" />
          <div className="h-4 w-80 animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800/80" />
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[320px_1fr]">
          {/* Left Column Skeleton */}
          <div className="space-y-6 rounded-xl border border-[#bbc9c7] bg-white p-6 shadow-sm dark:border-emerald-900 dark:bg-background/80">
            <div className="flex flex-col items-center text-center">
              <div className="h-24 w-24 animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-800/80" />
              <div className="mt-4 h-6 w-32 animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800/80" />
              <div className="mt-2 h-4 w-40 animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800/80" />
              <div className="mt-3 h-5 w-20 animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-800/80" />
            </div>

            <div className="my-6 border-t border-slate-100 dark:border-slate-800" />

            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded bg-slate-200/80 dark:bg-slate-800/80" />
                  <div className="h-4 w-3/4 rounded bg-slate-200/80 dark:bg-slate-800/80" />
                </div>
              ))}
            </div>

            <div className="my-6 border-t border-slate-100 dark:border-slate-800" />

            <div className="grid grid-cols-2 gap-3">
              <div className="h-20 animate-pulse rounded-xl bg-slate-200/80 dark:bg-slate-800/80" />
              <div className="h-20 animate-pulse rounded-xl bg-slate-200/80 dark:bg-slate-800/80" />
            </div>
          </div>

          {/* Right Column Form Skeleton */}
          <div className="space-y-6 rounded-xl border border-[#bbc9c7] bg-white p-6 shadow-sm dark:border-emerald-900 dark:bg-background/80 sm:p-8">
            <div className="space-y-2">
              <div className="h-7 w-44 animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800/80" />
              <div className="h-4 w-72 animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800/80" />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 rounded bg-slate-200/80 dark:bg-slate-800/80" />
                  <div className="h-10 w-full animate-pulse rounded-lg bg-slate-200/80 dark:bg-slate-800/80" />
                </div>
              ))}
              <div className="space-y-2 md:col-span-2">
                <div className="h-4 w-36 rounded bg-slate-200/80 dark:bg-slate-800/80" />
                <div className="h-10 w-full animate-pulse rounded-lg bg-slate-200/80 dark:bg-slate-800/80" />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <div className="h-11 w-36 animate-pulse rounded-lg bg-slate-200/80 dark:bg-slate-800/80" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
