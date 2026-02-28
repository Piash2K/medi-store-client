import Link from "next/link";
import { ArrowLeft, Package, PackageCheck, Pill, Users, Wallet, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  const activeMedicines = medicines.filter((medicine) => (medicine.stock ?? 0) > 0);
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

  const recentUsers = [...users]
    .sort((a, b) => +(getDateValue(b.createdAt) || 0) - +(getDateValue(a.createdAt) || 0))
    .slice(0, 5);

  return (
    <section className="space-y-5 p-1 sm:space-y-6">
      <div className="space-y-2">
        <Link href="/" className="text-muted-foreground inline-flex items-center gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" />
          Back to Store
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Admin Dashboard</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold sm:text-4xl">{users.length}</p>
            <p className="mt-1 text-sm text-primary">{formatDelta(userDelta)} this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold sm:text-4xl">{orders.length}</p>
            <p className="mt-1 text-sm text-primary">{formatDelta(orderDelta)} this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Medicines</CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold sm:text-4xl">{activeMedicines.length}</p>
            <p className="mt-1 text-sm text-primary">{formatDelta(medicineDelta)} this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold sm:text-3xl xl:text-4xl">BDT {currencyFormatter.format(totalRevenue)}</p>
            <p className="mt-1 text-sm text-primary">{formatRevenueDelta(revenueDelta)} this month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{totalCustomers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Seller</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{totalSellers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Delivered Orders</CardTitle>
            <PackageCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{totalDeliveredOrders}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Cancel Orders</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{totalCancelledOrders}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">Recent Users</CardTitle>
        </CardHeader>
        <CardContent>
          {recentUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-170 w-full border-collapse text-left">
                <thead>
                  <tr className="border-b">
                    <th className="px-3 py-2 text-xs font-medium whitespace-nowrap text-muted-foreground sm:text-sm">Name</th>
                    <th className="px-3 py-2 text-xs font-medium whitespace-nowrap text-muted-foreground sm:text-sm">Email</th>
                    <th className="px-3 py-2 text-xs font-medium whitespace-nowrap text-muted-foreground sm:text-sm">Role</th>
                    <th className="px-3 py-2 text-xs font-medium whitespace-nowrap text-muted-foreground sm:text-sm">Status</th>
                    <th className="px-3 py-2 text-xs font-medium whitespace-nowrap text-muted-foreground sm:text-sm">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((user, index) => (
                    <tr key={`${user.id || user.email || "user"}-${index}`} className="border-b last:border-0">
                      <td className="px-3 py-3 text-sm font-medium whitespace-nowrap sm:text-base">{getDisplayName(user)}</td>
                      <td className="px-3 py-3 text-sm text-muted-foreground whitespace-nowrap sm:text-base">{user.email || "N/A"}</td>
                      <td className="px-3 py-3">
                        <Badge variant="secondary">{normalizeText(user.role)}</Badge>
                      </td>
                      <td className="px-3 py-3">
                        <Badge variant={getStatusVariant(user.status)}>{normalizeText(user.status)}</Badge>
                      </td>
                      <td className="px-3 py-3 text-sm text-muted-foreground whitespace-nowrap sm:text-base">{formatDate(user.createdAt)}</td>
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
