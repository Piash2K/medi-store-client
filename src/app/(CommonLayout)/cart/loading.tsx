export default function CartLoading() {
  return (
    <main className="min-h-screen bg-[#f2fbf9] transition-colors duration-200 dark:bg-emerald-950/10">
      <div className="home-shell py-8 sm:py-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          {/* Cart Items Column Skeleton */}
          <div className="grow space-y-6">
            <div className="flex items-center justify-between">
              <div className="h-9 w-48 animate-pulse rounded-lg bg-slate-200/80 dark:bg-slate-800/80" />
              <div className="h-5 w-20 animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800/80" />
            </div>

            {/* Select All Control Skeleton */}
            <div className="h-14 w-full animate-pulse rounded-xl border border-[#bbc9c7] bg-white shadow-sm dark:border-emerald-900 dark:bg-background/80" />

            {/* Cart Item Cards Skeleton */}
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-36 w-full animate-pulse rounded-xl border border-[#bbc9c7] bg-white p-6 shadow-sm dark:border-emerald-900 dark:bg-background/80"
                />
              ))}
            </div>
          </div>

          {/* Order Summary Sidebar Skeleton */}
          <div className="w-full shrink-0 space-y-6 lg:w-96">
            <div className="h-96 w-full animate-pulse rounded-2xl border border-[#bbc9c7] bg-white shadow-sm dark:border-emerald-900 dark:bg-background/80" />
          </div>
        </div>
      </div>
    </main>
  );
}
