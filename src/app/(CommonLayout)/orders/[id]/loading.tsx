import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Pill } from "lucide-react";

export default function OrderDetailsLoading() {
  return (
    <main className="min-h-screen bg-[#f5fbf9] transition-colors duration-200 dark:bg-background">
      <div className="home-shell py-8 sm:py-10">
        {/* Back Navigation */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#006a63] opacity-60 dark:text-teal-300">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Orders</span>
          </div>
        </div>

        {/* Main Order Details Card Skeleton */}
        <div className="overflow-hidden rounded-xl border border-[#006a63]/20 bg-white shadow-sm dark:border-emerald-900/70 dark:bg-background/80">
          {/* Card Header */}
          <div className="flex flex-col gap-4 border-b border-[#006a63]/15 p-6 sm:p-8 dark:border-emerald-900/50 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="mb-1.5 text-2xl font-bold tracking-tight text-[#006a63] font-['Manrope',sans-serif] dark:text-teal-300 sm:text-3xl">
                Order Details
              </h1>
              <div className="flex items-center gap-2 text-sm text-[#3c4947] dark:text-slate-400">
                Order ID: <Skeleton className="h-4 w-48 rounded-md bg-[#006a63]/20 dark:bg-teal-900/40" />
              </div>
            </div>

            <div className="flex items-center gap-3 self-start">
              <Skeleton className="h-7 w-20 rounded-full bg-[#006a63]/15 dark:bg-teal-900/40" />
            </div>
          </div>

          {/* Information Grid */}
          <div className="border-b border-[#006a63]/15 bg-[#006a63]/5 p-6 sm:p-8 dark:border-emerald-900/50 dark:bg-teal-950/20">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                "Created At",
                "Payment Method",
                "Shipping Address",
                "Total Amount",
              ].map((label) => (
                <div
                  key={label}
                  className="rounded-lg border border-[#006a63]/15 bg-white p-4 shadow-2xs dark:border-emerald-900/50 dark:bg-background/80"
                >
                  <p className="mb-1 text-xs font-semibold text-[#3c4947] dark:text-slate-400">
                    {label}
                  </p>
                  <Skeleton className="h-5 w-3/4 rounded-md bg-[#006a63]/15 dark:bg-teal-900/30" />
                </div>
              ))}
            </div>
          </div>

          {/* Ordered Medicines Section */}
          <div className="p-6 sm:p-8">
            <h2 className="mb-6 text-xl font-semibold text-[#006a63] font-['Manrope',sans-serif] dark:text-teal-300">
              Ordered Medicines
            </h2>

            <div className="overflow-hidden rounded-lg border border-[#006a63]/15 dark:border-emerald-900/50">
              <div className="divide-y divide-[#006a63]/10 dark:divide-slate-800">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center justify-between"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#006a63]/10 text-[#006a63] dark:bg-teal-900/40 dark:text-teal-300">
                        <Pill className="h-6 w-6 opacity-70" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-36 rounded-md bg-[#171d1c]/15 dark:bg-slate-100/15" />
                        <Skeleton className="h-3 w-28 rounded-md bg-[#3c4947]/15 dark:bg-slate-400/20" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 sm:flex-col sm:items-end sm:justify-center">
                      <Skeleton className="h-3.5 w-14 rounded-md bg-[#3c4947]/15 dark:bg-slate-400/20" />
                      <Skeleton className="h-5 w-24 rounded-md bg-[#006a63]/20 dark:bg-teal-900/40" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
