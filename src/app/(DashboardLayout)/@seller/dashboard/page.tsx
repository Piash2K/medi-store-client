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
    <section className="space-y-5 p-1">
      <div className="space-y-2">
        <Link href="/" className="text-muted-foreground inline-flex items-center gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" />
          Back to Store
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Seller Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold">BDT {currencyFormatter.format(totalRevenue)}</p>
            <p className="mt-1 text-sm text-primary">{formatGrowth(revenueGrowth)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold">{totalOrders}</p>
            <p className="mt-1 text-sm text-primary">{formatGrowth(ordersGrowth)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Products</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold">{activeProducts}</p>
            <p className="mt-1 text-sm text-primary">{formatGrowth(productsGrowth)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Delivered</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold">{deliveredOrders}</p>
            <p className="mt-1 text-sm text-primary">{formatGrowth(deliveredGrowth)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Recent Orders</CardTitle>
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
