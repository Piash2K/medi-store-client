import { Suspense } from "react";

import ShopPageContent from "@/components/modules/shop/ShopPageContent";

export const dynamic = "force-static";

function ShopPageSkeleton() {
  return (
    <div className="home-shell py-8">
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar skeleton */}
        <div className="w-full shrink-0 space-y-4 lg:w-64">
          {[90, 160, 120].map((h) => (
            <div
              key={h}
              style={{ height: h }}
              className="animate-pulse rounded-xl border border-slate-200 bg-slate-100 dark:border-emerald-900/70 dark:bg-slate-800/80"
            />
          ))}
        </div>
        {/* Cards skeleton */}
        <div className="flex-1">
          <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex min-h-112 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-emerald-900/70 dark:bg-background/80"
              >
                <div className="h-44 w-full animate-pulse bg-slate-200/80 dark:bg-slate-800/80" />
                <div className="flex flex-1 flex-col space-y-3 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="h-6 w-3/5 animate-pulse rounded bg-slate-200/80 dark:bg-slate-800/80" />
                    <div className="h-6 w-1/4 animate-pulse rounded bg-slate-200/80 dark:bg-slate-800/80" />
                  </div>
                  <div className="h-4 w-2/5 animate-pulse rounded bg-slate-200/80 dark:bg-slate-800/80" />
                  <div className="space-y-1.5 pt-1">
                    <div className="h-3.5 w-full animate-pulse rounded bg-slate-200/80 dark:bg-slate-800/80" />
                    <div className="h-3.5 w-4/5 animate-pulse rounded bg-slate-200/80 dark:bg-slate-800/80" />
                  </div>
                  <div className="mt-auto flex items-center gap-2 pt-4">
                    <div className="h-10 flex-1 animate-pulse rounded-lg bg-slate-200/80 dark:bg-slate-800/80" />
                    <div className="h-10 flex-1 animate-pulse rounded-lg bg-slate-200/80 dark:bg-slate-800/80" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopPageSkeleton />}>
      <ShopPageContent />
    </Suspense>
  );
}
