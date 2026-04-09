import Link from "next/link";
import { ArrowLeft, Package, PackageCheck, Pill, Store, UserRound, Users, Wallet, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminRecentUsersTable from "@/components/modules/dashboard/AdminRecentUsersTable";
import { AdminOrder, AdminUser, getAdminOrders, getAdminUsers } from "@/services/admin";
import { getMedicines } from "@/services/medicine";
import { Medicine } from "@/types/medicine";

type MedicineWithDate = Medicine & {
  createdAt?: string;
};

const currencyFormatter = new Intl.NumberFormat("en-BD", {
  maximumFractionDigits: 0,
});

const getMonthStartDates = () => {
  const now = new Date();

  return {
    currentMonthStart: new Date(now.getFullYear(), now.getMonth(), 1),
    previousMonthStart: new Date(now.getFullYear(), now.getMonth() - 1, 1),
  };
};

const getDateValue = (value?: string) => {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const isBetweenDates = (value: Date | null, start: Date, end?: Date) => {
  if (!value) {
    return false;
  }

  if (end) {
    return value >= start && value < end;
  }

  return value >= start;
};

const formatDelta = (value: number) => {
  const prefix = value >= 0 ? "+" : "";
  return `${prefix}${value}`;
};

const formatRevenueDelta = (value: number) => {
  const prefix = value >= 0 ? "+" : "-";
  return `${prefix}BDT ${currencyFormatter.format(Math.abs(value))}`;
};

const formatDate = (value?: string) => {
  const date = getDateValue(value);

  if (!date) {
    return "N/A";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const normalizeText = (value?: string) => {
  if (!value) {
    return "N/A";
  }

  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const getDisplayName = (user: AdminUser) => {
  if (user.name) {
    return user.name;
  }

  if (user.email) {
    return user.email.split("@")[0];
  }

  return "Unknown User";
};

const getStatusVariant = (status?: string) => {
  const normalizedStatus = status?.toUpperCase();

  if (normalizedStatus === "ACTIVE") {
    return "default" as const;
  }

  if (normalizedStatus === "BANNED" || normalizedStatus === "SUSPENDED") {
    return "destructive" as const;
  }

  return "outline" as const;
};

const countUsersByRole = (users: AdminUser[]) => {
  return users.reduce(
    (acc, user) => {
      const role = user.role?.toUpperCase();

      if (role === "CUSTOMER") {
        acc.customers += 1;
      }

      if (role === "SELLER") {
        acc.sellers += 1;
      }

      return acc;
    },
    { customers: 0, sellers: 0 },
  );
};

const countOrdersByStatus = (orders: AdminOrder[]) => {
  return orders.reduce(
    (acc, order) => {
      const normalizedStatus = order.status?.toUpperCase();

      if (normalizedStatus === "DELIVERED" || normalizedStatus === "COMPLETED") {
        acc.delivered += 1;
      }

      if (normalizedStatus === "CANCELLED" || normalizedStatus === "CANCELED") {
        acc.cancelled += 1;
      }

      return acc;
    },
    { delivered: 0, cancelled: 0 },
  );
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

const getNormalizedOrderStatus = (status?: string) => {
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
  const [usersResponse, ordersResponse, medicinesResponse] = await Promise.all([
    getAdminUsers(),
    getAdminOrders(),
    getMedicines({ page: 1, limit: 1000 }),
  ]);

  const users = usersResponse.success ? usersResponse.data : [];
  const orders = ordersResponse.success ? ordersResponse.data : [];
  const medicines = medicinesResponse.success ? (medicinesResponse.data as MedicineWithDate[]) : [];

  const { currentMonthStart, previousMonthStart } = getMonthStartDates();

  const currentMonthUsers = users.filter((user) =>
    isBetweenDates(getDateValue(user.createdAt), currentMonthStart),
  );
  const previousMonthUsers = users.filter((user) =>
    isBetweenDates(getDateValue(user.createdAt), previousMonthStart, currentMonthStart),
  );

  const currentMonthOrders = orders.filter((order) =>
    isBetweenDates(getDateValue(order.createdAt), currentMonthStart),
  );
  const previousMonthOrders = orders.filter((order) =>
    isBetweenDates(getDateValue(order.createdAt), previousMonthStart, currentMonthStart),
  );

  const activeMedicines = medicines.filter(
    (medicine) => !medicine.isDeleted && (medicine.stock ?? 0) > 0,
  );
  const currentMonthMedicines = activeMedicines.filter((medicine) =>
    isBetweenDates(getDateValue(medicine.createdAt), currentMonthStart),
  );
  const previousMonthMedicines = activeMedicines.filter((medicine) =>
    isBetweenDates(getDateValue(medicine.createdAt), previousMonthStart, currentMonthStart),
  );

  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const currentMonthRevenue = currentMonthOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const previousMonthRevenue = previousMonthOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

  const userDelta = currentMonthUsers.length - previousMonthUsers.length;
  const orderDelta = currentMonthOrders.length - previousMonthOrders.length;
  const medicineDelta = currentMonthMedicines.length - previousMonthMedicines.length;
  const revenueDelta = currentMonthRevenue - previousMonthRevenue;

  const { customers: totalCustomers, sellers: totalSellers } = countUsersByRole(users);
  const { delivered: totalDeliveredOrders, cancelled: totalCancelledOrders } = countOrdersByStatus(orders);

  const monthlyRanges = getRecentMonthRanges(6);
  const monthlyOrderData = monthlyRanges.map((range) => {
    const orderCount = orders.filter((order) =>
      isBetweenDates(getDateValue(order.createdAt), range.start, range.end),
    ).length;

    return {
      label: range.label,
      count: orderCount,
    };
  });

  const maxMonthlyOrderCount = Math.max(...monthlyOrderData.map((item) => item.count), 1);

  const orderStatusData = [
    { key: "PLACED", label: "Placed", count: 0, color: "#64748b" },
    { key: "PROCESSING", label: "Processing", count: 0, color: "#0891b2" },
    { key: "SHIPPED", label: "Shipped", count: 0, color: "#2563eb" },
    { key: "DELIVERED", label: "Delivered", count: 0, color: "#059669" },
    { key: "CANCELLED", label: "Cancelled", count: 0, color: "#ef4444" },
  ];

  orders.forEach((order) => {
    const normalizedStatus = getNormalizedOrderStatus(order.status);
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

  const recentUsers = [...users]
    .sort((a, b) => +(getDateValue(b.createdAt) || 0) - +(getDateValue(a.createdAt) || 0))
    .slice(0, 5);

  return (
    <section className="space-y-5 rounded-xl bg-linear-to-b from-emerald-50/25 to-background p-1 dark:from-emerald-950/10 sm:space-y-6">
      <div className="space-y-2">
        <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200">
          <ArrowLeft className="h-4 w-4" />
          Back to Store
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-emerald-700 dark:text-emerald-300 sm:text-3xl">Admin Dashboard</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="group overflow-hidden border border-border/70 bg-linear-to-br from-emerald-500/10 via-background to-background shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:from-emerald-400/15">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground sm:text-4xl">{users.length}</p>
            <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">{formatDelta(userDelta)} this month</p>
          </CardContent>
        </Card>

        <Card className="group overflow-hidden border border-border/70 bg-linear-to-br from-cyan-500/10 via-background to-background shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:from-cyan-400/15">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-cyan-600 dark:text-cyan-300" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground sm:text-4xl">{orders.length}</p>
            <p className="mt-1 text-sm text-cyan-600 dark:text-cyan-400">{formatDelta(orderDelta)} this month</p>
          </CardContent>
        </Card>

        <Card className="group overflow-hidden border border-border/70 bg-linear-to-br from-lime-500/10 via-background to-background shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:from-lime-400/15">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Medicines</CardTitle>
            <Pill className="h-4 w-4 text-lime-600 dark:text-lime-300" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground sm:text-4xl">{activeMedicines.length}</p>
            <p className="mt-1 text-sm text-lime-600 dark:text-lime-400">{formatDelta(medicineDelta)} this month</p>
          </CardContent>
        </Card>

        <Card className="group overflow-hidden border border-border/70 bg-linear-to-br from-teal-500/10 via-background to-background shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:from-teal-400/15">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <Wallet className="h-4 w-4 text-teal-600 dark:text-teal-300" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground sm:text-3xl xl:text-4xl">BDT {currencyFormatter.format(totalRevenue)}</p>
            <p className="mt-1 text-sm text-teal-600 dark:text-teal-400">{formatRevenueDelta(revenueDelta)} this month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="group overflow-hidden border border-border/70 bg-linear-to-br from-indigo-500/10 via-background to-background shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:from-indigo-400/15">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Customer</CardTitle>
            <UserRound className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">{totalCustomers}</p>
          </CardContent>
        </Card>

        <Card className="group overflow-hidden border border-border/70 bg-linear-to-br from-amber-500/10 via-background to-background shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:from-amber-400/15">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Seller</CardTitle>
            <Store className="h-4 w-4 text-amber-600 dark:text-amber-300" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">{totalSellers}</p>
          </CardContent>
        </Card>

        <Card className="group overflow-hidden border border-border/70 bg-linear-to-br from-emerald-500/10 via-background to-background shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:from-emerald-400/15">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Delivered Orders</CardTitle>
            <PackageCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">{totalDeliveredOrders}</p>
          </CardContent>
        </Card>

        <Card className="group overflow-hidden border border-border/70 bg-linear-to-br from-rose-500/10 via-background to-background shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:from-rose-400/15">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Cancel Orders</CardTitle>
            <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-300" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">{totalCancelledOrders}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="border border-border/70 bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-emerald-700 dark:text-emerald-300">Orders Per Month (Bar)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid h-52 grid-cols-6 items-end gap-2 rounded-lg border border-emerald-100/80 bg-emerald-50/20 p-3 dark:border-emerald-900/50 dark:bg-emerald-900/10">
                {monthlyOrderData.map((item) => {
                  const barHeight = Math.max((item.count / maxMonthlyOrderCount) * 100, item.count > 0 ? 8 : 3);

                  return (
                    <div key={item.label} className="flex h-full flex-col items-center justify-end gap-2">
                      <span className="text-xs text-emerald-700 dark:text-emerald-300">{item.count}</span>
                      <div className="w-full rounded-md bg-emerald-500/85" style={{ height: `${barHeight}%` }} />
                      <span className="text-xs text-emerald-700 dark:text-emerald-300">{item.label}</span>
                    </div>
                  );
                })}
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
          <CardTitle className="text-xl text-emerald-700 dark:text-emerald-300 sm:text-2xl">Recent Users</CardTitle>
        </CardHeader>
        <CardContent>
          {recentUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users found.</p>
          ) : (
            <AdminRecentUsersTable users={recentUsers} />
          )}
        </CardContent>
      </Card>
    </section>
  );
}
