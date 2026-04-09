import Link from "next/link";
import { ArrowLeft, Box, ShoppingBag, TrendingUp, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSellerOrders } from "@/services/order";
import { Order } from "@/types/order";

type SellerOrder = Order & {
  customer?: {
    id?: string;
    name?: string;
    email?: string;
  };
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const getMonthStartDates = () => {
  const now = new Date();
  return {
    currentMonthStart: new Date(now.getFullYear(), now.getMonth(), 1),
    previousMonthStart: new Date(now.getFullYear(), now.getMonth() - 1, 1),
  };
};

const calculateGrowth = (currentValue: number, previousValue: number) => {
  if (previousValue <= 0) {
    return currentValue > 0 ? 100 : 0;
  }

  return ((currentValue - previousValue) / previousValue) * 100;
};

const formatGrowth = (value: number) => {
  const prefix = value >= 0 ? "+" : "";
  return `${prefix}${value.toFixed(1)}% from last month`;
};

const getStatusVariant = (status?: string) => {
  const normalized = status?.toUpperCase() || "PLACED";

  if (normalized === "DELIVERED" || normalized === "SHIPPED") {
    return "default" as const;
  }

  if (normalized === "PLACED") {
    return "secondary" as const;
  }

  return "outline" as const;
};

const getCustomerName = (order: SellerOrder) => {
  return order.customer?.name || order.customer?.email || order.customerId || "Customer";
};

const getOrderItemsLabel = (order: SellerOrder) => {
  if (!order.items?.length) {
    return "No items";
  }

  return order.items.map((item) => `${item.medicine?.name || "Medicine"} x${item.quantity}`).join(", ");
};

const getOrderCode = (index: number) => {
  return `ORD-${String(index + 1).padStart(3, "0")}`;
};

const countUniqueProducts = (orders: SellerOrder[]) => {
  const medicineIds = new Set<string>();

  orders.forEach((order) => {
    order.items?.forEach((item) => {
      medicineIds.add(item.medicineId || item.id);
    });
  });

  return medicineIds.size;
};

const parseOrders = (data: unknown): SellerOrder[] => {
  if (Array.isArray(data)) {
    return data as SellerOrder[];
  }

  if (data && typeof data === "object") {
    const payload = data as Record<string, unknown>;

    if (Array.isArray(payload.orders)) {
      return payload.orders as SellerOrder[];
    }

    if (typeof payload.id === "string" && Array.isArray(payload.items)) {
      return [payload as unknown as SellerOrder];
    }
  }

  return [];
};

const getRecentMonthRanges = (monthCount: number) => {
  const now = new Date();

  return Array.from({ length: monthCount }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (monthCount - index - 1), 1);
    const nextDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);

    return {
      label: date.toLocaleDateString("en-US", { month: "short" }),
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

const normalizeOrderStatus = (status?: string) => {
  const normalized = status?.toUpperCase() || "PLACED";

  if (["CANCELLED", "CANCELED"].includes(normalized)) {
    return "CANCELLED";
  }

  if (["DELIVERED", "COMPLETED"].includes(normalized)) {
    return "DELIVERED";
  }

  if (["SHIPPED", "OUT_FOR_DELIVERY"].includes(normalized)) {
    return "SHIPPED";
  }

  if (["PROCESSING", "CONFIRMED", "APPROVED"].includes(normalized)) {
    return "PROCESSING";
  }

  return "PLACED";
};

export default async function DashboardPage() {
  const ordersResponse = await getSellerOrders();
  const orders = ordersResponse.success ? parseOrders(ordersResponse.data) : [];

  const { currentMonthStart, previousMonthStart } = getMonthStartDates();

  const currentMonthOrders = orders.filter((order) => {
    const createdAt = new Date(order.createdAt);
    return !Number.isNaN(createdAt.getTime()) && createdAt >= currentMonthStart;
  });

  const previousMonthOrders = orders.filter((order) => {
    const createdAt = new Date(order.createdAt);
    return (
      !Number.isNaN(createdAt.getTime()) &&
      createdAt >= previousMonthStart &&
      createdAt < currentMonthStart
    );
  });

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const currentRevenue = currentMonthOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const previousRevenue = previousMonthOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const revenueGrowth = calculateGrowth(currentRevenue, previousRevenue);

  const totalOrders = orders.length;
  const ordersGrowth = calculateGrowth(currentMonthOrders.length, previousMonthOrders.length);

  const activeProducts = countUniqueProducts(orders);
  const currentProducts = countUniqueProducts(currentMonthOrders);
  const previousProducts = countUniqueProducts(previousMonthOrders);
  const productsGrowth = calculateGrowth(currentProducts, previousProducts);

  const deliveredOrders = orders.filter((order) => order.status?.toUpperCase() === "DELIVERED").length;

  const currentDelivered = currentMonthOrders.filter(
    (order) => order.status?.toUpperCase() === "DELIVERED",
  ).length;
  const previousDelivered = previousMonthOrders.filter(
    (order) => order.status?.toUpperCase() === "DELIVERED",
  ).length;

  const deliveredGrowth = calculateGrowth(currentDelivered, previousDelivered);

  const monthlyRanges = getRecentMonthRanges(6);
  const monthlyRevenueData = monthlyRanges.map((range) => {
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

  const revenueValues = monthlyRevenueData.map((item) => item.amount);
  const monthlyRevenuePath = getLinePath(revenueValues);
  const maxMonthlyRevenue = Math.max(...revenueValues, 1);

  const orderStatusData = [
    { key: "PLACED", label: "Placed", count: 0, color: "#64748b" },
    { key: "PROCESSING", label: "Processing", count: 0, color: "#0891b2" },
    { key: "SHIPPED", label: "Shipped", count: 0, color: "#2563eb" },
    { key: "DELIVERED", label: "Delivered", count: 0, color: "#059669" },
    { key: "CANCELLED", label: "Cancelled", count: 0, color: "#ef4444" },
  ];

  orders.forEach((order) => {
    const normalizedStatus = normalizeOrderStatus(order.status);
    const statusItem = orderStatusData.find((item) => item.key === normalizedStatus);

    if (statusItem) {
      statusItem.count += 1;
    }
  });

  const totalStatusCount = orderStatusData.reduce((sum, item) => sum + item.count, 0);
  const orderStatusPieGradient =
    totalStatusCount === 0
      ? "conic-gradient(#d1d5db 0deg 360deg)"
      : (() => {
          let startAngle = 0;

          return `conic-gradient(${orderStatusData
            .map((item) => {
              const segmentSize = (item.count / totalStatusCount) * 360;
              const endAngle = startAngle + segmentSize;
              const segment = `${item.color} ${startAngle.toFixed(2)}deg ${endAngle.toFixed(2)}deg`;
              startAngle = endAngle;
              return segment;
            })
            .join(", ")})`;
        })();

  const recentOrders = [...orders]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 5);

  return (
    <section className="space-y-5 rounded-xl bg-linear-to-b from-emerald-50/25 to-background p-1 dark:from-emerald-950/10">
      <div className="space-y-2">
        <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200">
          <ArrowLeft className="h-4 w-4" />
          Back to Store
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-emerald-700 dark:text-emerald-300 sm:text-3xl">Seller Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="group overflow-hidden border border-border/70 bg-linear-to-br from-teal-500/10 via-background to-background shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:from-teal-400/15">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <Wallet className="h-4 w-4 text-teal-600 dark:text-teal-300" />
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold text-foreground">BDT {currencyFormatter.format(totalRevenue)}</p>
            <p className="mt-1 text-sm text-teal-600 dark:text-teal-400">{formatGrowth(revenueGrowth)}</p>
          </CardContent>
        </Card>

        <Card className="group overflow-hidden border border-border/70 bg-linear-to-br from-cyan-500/10 via-background to-background shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:from-cyan-400/15">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-cyan-600 dark:text-cyan-300" />
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold text-foreground">{totalOrders}</p>
            <p className="mt-1 text-sm text-cyan-600 dark:text-cyan-400">{formatGrowth(ordersGrowth)}</p>
          </CardContent>
        </Card>

        <Card className="group overflow-hidden border border-border/70 bg-linear-to-br from-lime-500/10 via-background to-background shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:from-lime-400/15">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Products</CardTitle>
            <Box className="h-4 w-4 text-lime-600 dark:text-lime-300" />
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold text-foreground">{activeProducts}</p>
            <p className="mt-1 text-sm text-lime-600 dark:text-lime-400">{formatGrowth(productsGrowth)}</p>
          </CardContent>
        </Card>

        <Card className="group overflow-hidden border border-border/70 bg-linear-to-br from-emerald-500/10 via-background to-background shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:from-emerald-400/15">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Delivered</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold text-foreground">{deliveredOrders}</p>
            <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">{formatGrowth(deliveredGrowth)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="border border-border/70 bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-emerald-700 dark:text-emerald-300">Monthly Revenue (Line)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="rounded-lg border border-emerald-100/80 bg-emerald-50/20 p-3 dark:border-emerald-900/50 dark:bg-emerald-900/10">
                <svg viewBox="0 0 100 40" className="h-36 w-full" role="img" aria-label="Seller monthly revenue trend">
                  <path d={monthlyRevenuePath} fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
                  {monthlyRevenueData.map((item, index) => {
                    const x = (index / Math.max(monthlyRevenueData.length - 1, 1)) * 100;
                    const y = 40 - (item.amount / maxMonthlyRevenue) * 34;

                    return <circle key={item.label} cx={x} cy={y} r="1.2" fill="#059669" />;
                  })}
                </svg>
                <div className="mt-2 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300">
                  {monthlyRevenueData.map((item) => (
                    <span key={item.label}>{item.label}</span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {monthlyRevenueData.map((item) => (
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

        <Card className="border border-border/70 bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-emerald-700 dark:text-emerald-300">Order Status Mix (Pie)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-[220px_1fr] md:items-center">
              <div className="mx-auto h-40 w-40 rounded-full" style={{ background: orderStatusPieGradient }} />

              <div className="space-y-2">
                {orderStatusData.map((item) => {
                  const percentage = totalStatusCount === 0 ? 0 : (item.count / totalStatusCount) * 100;

                  return (
                    <div key={item.key} className="flex items-center justify-between gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
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
      </div>

      <Card className="border border-border/70 bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-3xl text-emerald-700 dark:text-emerald-300">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent orders available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b">
                    <th className="px-3 py-2 text-sm font-medium text-muted-foreground">Order ID</th>
                    <th className="px-3 py-2 text-sm font-medium text-muted-foreground">Customer</th>
                    <th className="px-3 py-2 text-sm font-medium text-muted-foreground">Items</th>
                    <th className="px-3 py-2 text-sm font-medium text-muted-foreground">Total</th>
                    <th className="px-3 py-2 text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, index) => (
                    <tr key={order.id} className={index === recentOrders.length - 1 ? "" : "border-b"}>
                      <td className="px-3 py-3 text-base font-medium whitespace-nowrap">{getOrderCode(index)}</td>
                      <td className="px-3 py-3 text-base whitespace-nowrap max-w-40 truncate">{getCustomerName(order)}</td>
                      <td className="px-3 py-3 text-base max-w-56 truncate whitespace-nowrap md:whitespace-normal md:max-w-xs">{getOrderItemsLabel(order)}</td>
                      <td className="px-3 py-3 text-base font-medium whitespace-nowrap">BDT {currencyFormatter.format(order.totalAmount)}</td>
                      <td className="px-3 py-3 whitespace-nowrap"><Badge variant={getStatusVariant(order.status)}>{order.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
