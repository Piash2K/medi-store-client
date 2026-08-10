import { Skeleton } from "@/components/ui/skeleton";

const statusTabs = ["All Orders", "Placed", "Processing", "Shipped", "Delivered", "Cancelled"];

export default function OrderStatusLoading() {
  return (
    <section className="rounded-xl bg-linear-to-b from-emerald-50/25 to-background p-1 dark:from-emerald-950/10">
      <div className="w-full space-y-5 pb-8 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-[#006a63] font-['Manrope',sans-serif] dark:text-teal-300 md:text-4xl">
            Order Status
          </h1>
          <p className="text-sm text-[#3c4947] dark:text-slate-400">
            Track, manage, and view the status of all your orders.
          </p>
        </div>

        {/* Tabs */}
        <div className="overflow-x-auto">
          <div className="flex min-w-max list-none items-center gap-2 border-b border-[#006a63]/20 pb-0! mb-4! mt-0! dark:border-emerald-900/60">
            {statusTabs.map((label, index) => {
              const isActive = index === 0;
              return (
                <div
                  key={label}
                  className={`bottom-[1px] flex items-center cursor-pointer border-b-2 px-3 sm:px-4 py-2.5 text-xs font-semibold whitespace-nowrap sm:text-sm ${
                    isActive
                      ? "border-[#006a63] text-[#006a63] dark:border-teal-300 dark:text-teal-300"
                      : "border-transparent text-[#3c4947] dark:text-slate-400"
                  }`}
                >
                  <span>{label}</span>
                  <Skeleton className="ml-2 h-4 w-6 rounded-full bg-[#006a63]/20 dark:bg-teal-900/40" />
                </div>
              );
            })}
          </div>
        </div>

        {/* 3-Column Card Grid Skeleton */}
        <div className="pt-2 space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <article
                key={i}
                className="flex flex-col justify-between rounded-xl border border-[#006a63]/15 bg-[#f5fbf9] p-4 sm:p-5 shadow-2xs dark:border-emerald-900/50 dark:bg-background/80"
              >
                {/* Header inside card */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-28 rounded-md bg-[#006a63]/20 dark:bg-teal-900/40" />
                    <Skeleton className="h-3 w-36 rounded-md bg-[#3c4947]/15 dark:bg-slate-400/20" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full bg-[#006a63]/15 dark:bg-teal-900/40" />
                </div>

                {/* Items & Total Row */}
                <div className="my-4 flex items-center justify-between border-y border-[#006a63]/10 py-3 dark:border-slate-800">
                  <Skeleton className="h-4 w-20 rounded-md bg-[#3c4947]/15 dark:bg-slate-400/20" />
                  <Skeleton className="h-5 w-24 rounded-md bg-[#006a63]/20 dark:bg-teal-900/40" />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <Skeleton className="h-9 w-full rounded-lg bg-[#006a63]/10 dark:bg-teal-900/30" />
                  <Skeleton className="h-9 w-full rounded-lg bg-[#006a63] dark:bg-teal-600 opacity-60" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
