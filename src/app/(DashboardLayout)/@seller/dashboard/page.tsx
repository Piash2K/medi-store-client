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
