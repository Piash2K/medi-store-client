import Link from "next/link";
import { ChevronRight, PackageCheck, ShoppingBag } from "lucide-react";

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

  return (
    <section className="w-full space-y-5 p-1">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Customer Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Welcome back, {profile?.name || "Customer"}. Here is your order summary.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm">
            <Link href="/shop">Shop Medicines</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/orders">Track Orders</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-semibold">{totalOrders}</p>
              <ShoppingBag className="text-primary h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Delivered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-semibold">{deliveredOrders}</p>
              <PackageCheck className="text-primary h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">BDT {currencyFormatter.format(totalSpent)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Order Status Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statusChartData.map((item) => {
                const percentage = Math.round((item.count / maxStatusCount) * 100);

                return (
                  <div key={item.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.label}</span>
                      <span className="text-muted-foreground">{item.count}</span>
                    </div>
                    <div className="bg-muted h-2.5 w-full overflow-hidden rounded-full">
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Recent Orders</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/orders">
                View all
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="rounded-xl border border-dashed p-6 text-center">
                <p className="font-medium">No orders yet</p>
                <p className="text-muted-foreground mt-1 text-sm">Start shopping to see your recent orders here.</p>
                <Button asChild size="sm" className="mt-4">
                  <Link href="/shop">Browse Medicines</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <article key={order.id} className="rounded-xl border p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">#{order.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-muted-foreground mt-1 text-xs">{formatDate(order.createdAt)}</p>
                      </div>
                      <Badge variant={order.status?.toUpperCase() === "DELIVERED" ? "secondary" : "outline"}>
                        {order.status}
                      </Badge>
                    </div>

                    <div className="text-muted-foreground mt-3 flex items-center justify-between text-sm">
                      <span>{order.items.length} item(s)</span>
                      <span className="font-semibold text-foreground">
                        BDT {currencyFormatter.format(order.totalAmount)}
                      </span>
                    </div>

                    <div className="mt-3 flex justify-end">
                      <Button asChild variant="ghost" size="sm">
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
