import Link from "next/link";
import { ChevronRight, PackageCheck, ShoppingBag, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMyProfile } from "@/services/auth";
import { getOrders } from "@/services/order";

const currencyFormatter = new Intl.NumberFormat("en-BD", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatDate = (isoDate?: string) => {
  if (!isoDate) {
    return "N/A";
  }

  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleDateString("en-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const orderStatusChartConfig = [
  { key: "PLACED", label: "Placed", barClass: "bg-[#00a69c]" },
  { key: "PROCESSING", label: "Processing", barClass: "bg-[#006a63]" },
  { key: "SHIPPED", label: "Shipped", barClass: "bg-[#5bdacf]" },
  { key: "DELIVERED", label: "Delivered", barClass: "bg-teal-700" },
  { key: "CANCELLED", label: "Cancelled", barClass: "bg-[#ba1a1a]" },
] as const;

type OrderStatusKey = (typeof orderStatusChartConfig)[number]["key"];

const normalizeOrderStatus = (status?: string): OrderStatusKey => {
  const normalizedStatus = status?.toUpperCase() || "PLACED";

  if (["CANCELLED", "CANCELED"].includes(normalizedStatus)) {
    return "CANCELLED";
  }

  if (["DELIVERED", "COMPLETED"].includes(normalizedStatus)) {
    return "DELIVERED";
  }

  if (["SHIPPED", "OUT_FOR_DELIVERY"].includes(normalizedStatus)) {
    return "SHIPPED";
  }

  if (["PROCESSING", "CONFIRMED", "APPROVED"].includes(normalizedStatus)) {
    return "PROCESSING";
  }

  return "PLACED";
};

const getRecentMonthRanges = (monthCount: number) => {
  const now = new Date();

  return Array.from({ length: monthCount }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (monthCount - index - 1), 1);
    const nextDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);

    return {
      label: date.toLocaleDateString("en-BD", { month: "short" }),
      start: date,
      end: nextDate,
    };
  });
};

const getLinePath = (values: number[]) => {
  const maxValue = Math.max(...values, 1);

  return values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * 100;
      const y = 40 - (value / maxValue) * 34;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
};

export default async function DashboardPage() {
  const [profileResult, ordersResult] = await Promise.all([getMyProfile(), getOrders()]);

  const profile = profileResult.success ? profileResult.data : null;
  const orders = ordersResult.success ? ordersResult.data : [];
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const recentOrders = [...orders].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 3);

  const statusOrderCountMap = new Map<OrderStatusKey, number>();

  orders.forEach((order) => {
    const statusKey = normalizeOrderStatus(order.status);
    statusOrderCountMap.set(statusKey, (statusOrderCountMap.get(statusKey) || 0) + 1);
  });

  const statusChartData = orderStatusChartConfig.map((statusItem) => ({
    ...statusItem,
    count: statusOrderCountMap.get(statusItem.key) || 0,
  }));

  const deliveredOrders = statusOrderCountMap.get("DELIVERED") || 0;

  const maxStatusCount = Math.max(...statusChartData.map((item) => item.count), 1);

  const monthlyRanges = getRecentMonthRanges(6);
  const monthlySpending = monthlyRanges.map((range) => {
    const amount = orders
      .filter((order) => {
        const createdAt = new Date(order.createdAt);
        return !Number.isNaN(createdAt.getTime()) && createdAt >= range.start && createdAt < range.end;
      })
      .reduce((sum, order) => sum + order.totalAmount, 0);

    return {
      label: range.label,
      amount,
    };
  });

  const spendingValues = monthlySpending.map((item) => item.amount);
  const monthlyLinePath = getLinePath(spendingValues);
  const maxMonthlySpending = Math.max(...spendingValues, 1);

  const totalOrdersForPie = statusChartData.reduce((sum, item) => sum + item.count, 0);
  const piePalette = ["#00a69c", "#006a63", "#5bdacf", "#047857", "#ba1a1a"];

  const pieGradient =
    totalOrdersForPie === 0
      ? "conic-gradient(#d1d5db 0deg 360deg)"
      : (() => {
          let startAngle = 0;

          return `conic-gradient(${statusChartData
            .map((item, index) => {
              const segmentSize = (item.count / totalOrdersForPie) * 360;
              const endAngle = startAngle + segmentSize;
              const segment = `${piePalette[index]} ${startAngle.toFixed(2)}deg ${endAngle.toFixed(2)}deg`;
              startAngle = endAngle;
              return segment;
            })
            .join(", ")})`;
        })();

  return (
    <section className="w-full space-y-6 pb-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#006a63] font-['Manrope',sans-serif] dark:text-teal-300 md:text-4xl">
            Customer Dashboard
          </h1>
          <p className="mt-1 text-sm text-[#3c4947] dark:text-slate-400">
            Welcome back, <span className="font-semibold text-[#171d1c] dark:text-slate-200">{profile?.name || "Customer"}</span>. Here is your order overview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild size="sm" className="rounded-lg bg-[#006a63] px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#5bdacf] hover:text-[#00201d] dark:bg-teal-600 dark:hover:bg-teal-700 dark:hover:text-white">
            <Link href="/shop">Shop Medicines</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-lg border border-[#006a63] px-5 py-2.5 text-xs font-bold text-[#006a63] transition-colors hover:bg-[#006a63]/5 dark:border-teal-500 dark:text-teal-300 dark:hover:bg-teal-950/30">
            <Link href="/orders">Track Orders</Link>
          </Button>
        </div>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card className="overflow-hidden border border-[#006a63]/20 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-emerald-900/70 dark:bg-background/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#3c4947] dark:text-slate-400">
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-extrabold text-[#006a63] dark:text-teal-300">{totalOrders}</p>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#006a63]/10 text-[#006a63] dark:bg-teal-900/40 dark:text-teal-300">
                <ShoppingBag className="h-5 w-5" />
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border border-[#006a63]/20 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-emerald-900/70 dark:bg-background/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#3c4947] dark:text-slate-400">
              Delivered Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-extrabold text-[#00a69c] dark:text-teal-200">{deliveredOrders}</p>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#00a69c]/10 text-[#00a69c] dark:bg-teal-900/40 dark:text-teal-200">
                <PackageCheck className="h-5 w-5" />
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border border-[#006a63]/20 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-emerald-900/70 dark:bg-background/80 sm:col-span-2 xl:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#3c4947] dark:text-slate-400">
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-3">
              <p className="text-3xl font-extrabold text-[#006a63] dark:text-teal-300">
                BDT {currencyFormatter.format(totalSpent)}
              </p>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#006a63]/10 text-[#006a63] dark:bg-teal-900/40 dark:text-teal-300">
                <Wallet className="h-5 w-5" />
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Order Status Bar Chart */}
        <Card className="border border-[#006a63]/20 bg-white shadow-sm dark:border-emerald-900/70 dark:bg-background/80">
          <CardHeader>
            <CardTitle className="font-['Manrope',sans-serif] text-lg font-bold text-[#006a63] dark:text-teal-300">
              Order Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statusChartData.map((item) => {
                const percentage = Math.round((item.count / maxStatusCount) * 100);

                return (
                  <div key={item.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-[#171d1c] dark:text-slate-200">{item.label}</span>
                      <span className="text-[#006a63] dark:text-teal-300">{item.count}</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#006a63]/10 dark:bg-slate-800">
                      <div
                        className={`h-full rounded-full transition-all ${item.barClass}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Spending Line Chart */}
        <Card className="border border-[#006a63]/20 bg-white shadow-sm dark:border-emerald-900/70 dark:bg-background/80">
          <CardHeader>
            <CardTitle className="font-['Manrope',sans-serif] text-lg font-bold text-[#006a63] dark:text-teal-300">
              Monthly Spending Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="rounded-xl border border-[#006a63]/15 bg-[#006a63]/5 p-3 dark:border-emerald-900/50 dark:bg-teal-950/20">
                <svg viewBox="0 0 100 40" className="h-36 w-full" role="img" aria-label="Monthly spending trend">
                  <path d={monthlyLinePath} fill="none" stroke="#006a63" strokeWidth="2.5" strokeLinecap="round" />
                  {monthlySpending.map((item, index) => {
                    const x = (index / Math.max(monthlySpending.length - 1, 1)) * 100;
                    const y = 40 - (item.amount / maxMonthlySpending) * 34;

                    return <circle key={item.label} cx={x} cy={y} r="1.6" fill="#006a63" />;
                  })}
                </svg>
                <div className="mt-2 flex items-center justify-between text-xs font-semibold text-[#006a63] dark:text-teal-300">
                  {monthlySpending.map((item) => (
                    <span key={item.label}>{item.label}</span>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                {monthlySpending.map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-xs">
                    <span className="text-[#3c4947] dark:text-slate-400">{item.label}</span>
                    <span className="font-bold text-[#006a63] dark:text-teal-300">
                      BDT {currencyFormatter.format(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Distribution Pie Chart */}
        <Card className="border border-[#006a63]/20 bg-white shadow-sm dark:border-emerald-900/70 dark:bg-background/80">
          <CardHeader>
            <CardTitle className="font-['Manrope',sans-serif] text-lg font-bold text-[#006a63] dark:text-teal-300">
              Order Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-6">
              <div className="h-36 w-36 rounded-full shadow-inner" style={{ background: pieGradient }} />

              <div className="w-full space-y-2">
                {statusChartData.map((item, index) => {
                  const percentage = totalOrdersForPie === 0 ? 0 : (item.count / totalOrdersForPie) * 100;

                  return (
                    <div key={item.key} className="flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: piePalette[index] }} />
                        <span className="font-semibold text-[#171d1c] dark:text-slate-200">{item.label}</span>
                      </div>
                      <span className="font-semibold text-[#006a63] dark:text-teal-300">
                        {item.count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders Section */}
        <Card className="border border-[#006a63]/20 bg-white shadow-sm dark:border-emerald-900/70 dark:bg-background/80 xl:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between border-b border-[#006a63]/15 pb-4 dark:border-emerald-900/50">
            <CardTitle className="font-['Manrope',sans-serif] text-lg font-bold text-[#006a63] dark:text-teal-300">
              Recent Orders
            </CardTitle>
            <Button asChild variant="ghost" size="sm" className="text-xs font-semibold text-[#006a63] hover:bg-[#006a63]/5 hover:text-[#00504b] dark:text-teal-300 dark:hover:bg-teal-950/30 dark:hover:text-teal-200">
              <Link href="/orders" className="inline-flex items-center gap-1">
                View all
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>

          <CardContent className="pt-6">
            {recentOrders.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#006a63]/30 bg-[#006a63]/5 p-8 text-center dark:border-emerald-900 dark:bg-emerald-950/20">
                <p className="font-semibold text-[#171d1c] dark:text-slate-100">No orders placed yet</p>
                <p className="mt-1 text-xs text-[#3c4947] dark:text-slate-400">Start shopping to see your recent orders here.</p>
                <Button asChild size="sm" className="mt-4 rounded-lg bg-[#006a63] px-6 text-xs font-bold text-white hover:bg-[#5bdacf] hover:text-[#00201d] dark:bg-teal-600 dark:hover:bg-teal-700">
                  <Link href="/shop">Browse Medicines</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {recentOrders.map((order) => (
                  <article
                    key={order.id}
                    className="flex flex-col justify-between rounded-xl border border-[#006a63]/15 bg-[#f5fbf9] p-4 shadow-2xs transition-all hover:bg-white hover:shadow-sm dark:border-emerald-900/50 dark:bg-background/80 dark:hover:bg-emerald-950/20"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-xs font-bold text-[#171d1c] dark:text-slate-100">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="mt-1 text-xs text-[#3c4947] dark:text-slate-400">{formatDate(order.createdAt)}</p>
                      </div>
                      <Badge className="rounded-full bg-[#00a69c]/20 px-2.5 py-0.5 text-[10px] font-semibold text-[#006a63] dark:bg-teal-900/40 dark:text-teal-300">
                        {order.status}
                      </Badge>
                    </div>

                    <div className="my-3 flex items-center justify-between border-t border-[#006a63]/10 pt-3 text-xs text-[#3c4947] dark:border-slate-800 dark:text-slate-400">
                      <span>{order.items.length} item(s)</span>
                      <span className="font-bold text-[#006a63] dark:text-teal-300">
                        BDT {currencyFormatter.format(order.totalAmount)}
                      </span>
                    </div>

                    <div className="flex justify-end pt-1">
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-xs font-bold text-[#006a63] hover:underline dark:text-teal-300"
                      >
                        Order details →
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
