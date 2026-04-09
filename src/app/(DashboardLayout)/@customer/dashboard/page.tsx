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
  { key: "PLACED", label: "Placed", barClass: "bg-chart-1" },
  { key: "PROCESSING", label: "Processing", barClass: "bg-chart-2" },
  { key: "SHIPPED", label: "Shipped", barClass: "bg-chart-3" },
  { key: "DELIVERED", label: "Delivered", barClass: "bg-chart-4" },
  { key: "CANCELLED", label: "Cancelled", barClass: "bg-chart-5" },
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
  const recentOrders = [...orders].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 2);

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
  const piePalette = ["#059669", "#0891b2", "#2563eb", "#7c3aed", "#ef4444"];

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
    <section className="w-full space-y-5 rounded-xl bg-linear-to-b from-emerald-50/25 to-background p-1 dark:from-emerald-950/10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-emerald-700 dark:text-emerald-300">Customer Dashboard</h1>
          <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">
            Welcome back, {profile?.name || "Customer"}. Here is your order summary.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700">
            <Link href="/shop">Shop Medicines</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-900/30">
            <Link href="/orders">Track Orders</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card className="group overflow-hidden border border-border/70 bg-linear-to-br from-emerald-500/10 via-background to-background shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:from-emerald-400/15">
          <CardHeader className="relative pb-2">
            <div className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-emerald-500/15 blur-2xl dark:bg-emerald-300/10" />
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold tracking-tight text-foreground">{totalOrders}</p>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/70 bg-background/70 shadow-inner">
                <ShoppingBag className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="group overflow-hidden border border-border/70 bg-linear-to-br from-cyan-500/10 via-background to-background shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:from-cyan-400/15">
          <CardHeader className="relative pb-2">
            <div className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-cyan-500/15 blur-2xl dark:bg-cyan-300/10" />
            <CardTitle className="text-sm font-medium text-muted-foreground">Delivered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold tracking-tight text-foreground">{deliveredOrders}</p>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/70 bg-background/70 shadow-inner">
                <PackageCheck className="h-5 w-5 text-cyan-600 dark:text-cyan-300" />
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="group overflow-hidden border border-border/70 bg-linear-to-br from-lime-500/10 via-background to-background shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:from-lime-400/15 sm:col-span-2 xl:col-span-1">
          <CardHeader className="relative pb-2">
            <div className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-lime-500/15 blur-2xl dark:bg-lime-300/10" />
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-3">
              <p className="text-3xl font-bold tracking-tight text-foreground">BDT {currencyFormatter.format(totalSpent)}</p>
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-background/70 shadow-inner">
                <Wallet className="h-5 w-5 text-lime-600 dark:text-lime-300" />
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="border border-border/70 bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-emerald-700 dark:text-emerald-300">Order Status (Bar)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statusChartData.map((item) => {
                const percentage = Math.round((item.count / maxStatusCount) * 100);

                return (
                  <div key={item.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-emerald-800 dark:text-emerald-200">{item.label}</span>
                      <span className="text-emerald-600 dark:text-emerald-400">{item.count}</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-emerald-100/80 dark:bg-emerald-900/30">
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

        <Card className="border border-border/70 bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-emerald-700 dark:text-emerald-300">Monthly Spending (Line)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="rounded-lg border border-emerald-100/80 bg-emerald-50/25 p-3 dark:border-emerald-900/50 dark:bg-emerald-900/10">
                <svg viewBox="0 0 100 40" className="h-36 w-full" role="img" aria-label="Monthly spending trend">
                  <path d={monthlyLinePath} fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
                  {monthlySpending.map((item, index) => {
                    const x = (index / Math.max(monthlySpending.length - 1, 1)) * 100;
                    const y = 40 - (item.amount / maxMonthlySpending) * 34;

                    return <circle key={item.label} cx={x} cy={y} r="1.2" fill="#059669" />;
                  })}
                </svg>
                <div className="mt-2 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300">
                  {monthlySpending.map((item) => (
                    <span key={item.label}>{item.label}</span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {monthlySpending.map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <span className="text-emerald-800 dark:text-emerald-200">{item.label}</span>
                    <span className="font-medium text-emerald-700 dark:text-emerald-300">
                      BDT {currencyFormatter.format(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card shadow-sm xl:col-span-3">
          <CardHeader>
            <CardTitle className="text-xl text-emerald-700 dark:text-emerald-300">Order Distribution (Pie)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-[220px_1fr] md:items-center">
              <div className="mx-auto h-40 w-40 rounded-full" style={{ background: pieGradient }} />

              <div className="space-y-2">
                {statusChartData.map((item, index) => {
                  const percentage = totalOrdersForPie === 0 ? 0 : (item.count / totalOrdersForPie) * 100;

                  return (
                    <div key={item.key} className="flex items-center justify-between gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: piePalette[index] }} />
                        <span className="font-medium text-emerald-800 dark:text-emerald-200">{item.label}</span>
                      </div>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {item.count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card shadow-sm xl:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl text-emerald-700 dark:text-emerald-300">Recent Orders</CardTitle>
            <Button asChild variant="ghost" size="sm" className="text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-200">
              <Link href="/orders">
                View all
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="rounded-xl border border-dashed border-emerald-200/80 bg-emerald-50/30 p-6 text-center dark:border-emerald-800 dark:bg-emerald-900/10">
                <p className="font-medium text-emerald-800 dark:text-emerald-200">No orders yet</p>
                <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">Start shopping to see your recent orders here.</p>
                <Button asChild size="sm" className="mt-4 bg-emerald-600 text-white hover:bg-emerald-700">
                  <Link href="/shop">Browse Medicines</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <article key={order.id} className="rounded-xl border border-emerald-200/80 bg-emerald-50/20 p-4 dark:border-emerald-800 dark:bg-emerald-900/10">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">#{order.id.slice(0, 8).toUpperCase()}</p>
                        <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">{formatDate(order.createdAt)}</p>
                      </div>
                      <Badge variant={order.status?.toUpperCase() === "DELIVERED" ? "secondary" : "outline"}>
                        {order.status}
                      </Badge>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-sm text-emerald-600 dark:text-emerald-400">
                      <span>{order.items.length} item(s)</span>
                      <span className="font-semibold text-emerald-800 dark:text-emerald-200">
                        BDT {currencyFormatter.format(order.totalAmount)}
                      </span>
                    </div>

                    <div className="mt-3 flex justify-end">
                      <Button asChild variant="ghost" size="sm" className="text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-200">
                        <Link href={`/orders/${order.id}`}>Order details</Link>
                      </Button>
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
