import { Skeleton } from "@/components/ui/skeleton";

export default function SellerDashboardLoading() {
  return (
    <main className="w-full space-y-6 pb-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64 rounded-lg bg-[#006a63]/10 dark:bg-teal-900/30" />
        <Skeleton className="h-4 w-96 rounded-md bg-[#3c4947]/10 dark:bg-slate-400/20" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 rounded-xl bg-[#006a63]/5 dark:bg-emerald-950/20" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl bg-[#006a63]/5 dark:bg-emerald-950/20" />
    </main>
  );
}
