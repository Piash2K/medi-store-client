export default function OrdersLoading() {
  return (
    <main className="min-h-screen font-['Inter',sans-serif] text-[#171d1c] dark:bg-emerald-950/10 dark:text-slate-100">
      <div className="home-shell py-8 sm:py-10">
        {/* Header Skeleton */}
        <div className="mb-8 space-y-2">
          <div className="h-8 w-56 animate-pulse rounded-lg bg-slate-200/80 dark:bg-slate-800/80" />
          <div className="h-4 w-80 animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800/80" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Sidebar Skeleton */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-5 rounded-xl border border-[#bbc9c7] bg-white p-5 shadow-sm dark:border-emerald-900 dark:bg-background/80">
              <div className="h-6 w-32 animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800/80" />
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex h-11 w-full items-center justify-between rounded-lg bg-slate-100 p-3 animate-pulse dark:bg-slate-800/60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded bg-slate-200/80 dark:bg-slate-700/80" />
                      <div className="h-4 w-24 rounded bg-slate-200/80 dark:bg-slate-700/80" />
                    </div>
                    <div className="h-4 w-6 rounded-full bg-slate-200/80 dark:bg-slate-700/80" />
                  </div>
                ))}
              </div>

              {/* Need Help Box Skeleton */}
              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800">
                <div className="rounded-xl bg-[#d2e6ef]/60 p-4 animate-pulse dark:bg-emerald-950/30">
                  <div className="mb-2 h-5 w-5 rounded bg-slate-300/80 dark:bg-slate-700/80" />
                  <div className="mb-1 h-4 w-24 rounded bg-slate-300/80 dark:bg-slate-700/80" />
                  <div className="mb-3 h-3 w-40 rounded bg-slate-300/80 dark:bg-slate-700/80" />
                  <div className="h-4 w-28 rounded bg-slate-300/80 dark:bg-slate-700/80" />
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Table & Mobile Cards Skeleton */}
          <div className="lg:col-span-3">
            {/* Desktop Table Skeleton */}
            <div className="hidden lg:block overflow-hidden rounded-xl border border-[#bbc9c7] bg-white shadow-sm dark:border-emerald-900 dark:bg-background/80">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-slate-800">
                      <th className="px-6 py-3.5 text-left text-sm font-semibold text-[#6c7a78]">Order ID</th>
                      <th className="px-6 py-3.5 text-left text-sm font-semibold text-[#6c7a78]">Date</th>
                      <th className="px-6 py-3.5 text-left text-sm font-semibold text-[#6c7a78]">Total</th>
                      <th className="px-6 py-3.5 text-left text-sm font-semibold text-[#6c7a78]">Payment</th>
                      <th className="px-6 py-3.5 text-left text-sm font-semibold text-[#6c7a78]">Status</th>
                      <th className="px-6 py-3.5 text-left text-sm font-semibold text-[#6c7a78]">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4">
                          <div className="h-4 w-20 rounded bg-slate-200/80 dark:bg-slate-800/80" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-32 rounded bg-slate-200/80 dark:bg-slate-800/80" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-24 rounded bg-slate-200/80 dark:bg-slate-800/80" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded bg-slate-200/80 dark:bg-slate-800/80" />
                            <div className="h-4 w-28 rounded bg-slate-200/80 dark:bg-slate-800/80" />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-6 w-20 rounded-full bg-slate-200/80 dark:bg-slate-800/80" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-12 rounded bg-slate-200/80 dark:bg-slate-800/80" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards Skeleton */}
            <div className="space-y-4 lg:hidden">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="space-y-3 rounded-xl border border-[#bbc9c7] bg-white p-5 shadow-sm animate-pulse dark:border-emerald-900 dark:bg-background/80"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="h-3 w-16 rounded bg-slate-200/80 dark:bg-slate-800/80" />
                      <div className="h-4 w-24 rounded bg-slate-200/80 dark:bg-slate-800/80" />
                    </div>
                    <div className="h-6 w-20 rounded-full bg-slate-200/80 dark:bg-slate-800/80" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-32 rounded bg-slate-200/80 dark:bg-slate-800/80" />
                    <div className="h-4 w-24 rounded bg-slate-200/80 dark:bg-slate-800/80" />
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-slate-800">
                    <div className="space-y-1">
                      <div className="h-3 w-12 rounded bg-slate-200/80 dark:bg-slate-800/80" />
                      <div className="h-5 w-28 rounded bg-slate-200/80 dark:bg-slate-800/80" />
                    </div>
                    <div className="h-4 w-24 rounded bg-slate-200/80 dark:bg-slate-800/80" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
