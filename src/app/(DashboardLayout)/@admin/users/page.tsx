import { redirect } from "next/navigation";

import AdminUsersPageContent from "@/components/modules/admin/AdminUsersPageContent";
import { getUser } from "@/services/auth";
import { getAdminOrders, getAdminUsers } from "@/services/admin";

export default async function AdminUsersPage() {
  const user = (await getUser()) as { role?: string } | null;

  if (!user) {
    redirect("/login?redirect=/users");
  }

  const role = user.role?.toUpperCase();

  if (role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [usersResponse, ordersResponse] = await Promise.all([getAdminUsers(), getAdminOrders()]);

  const users = usersResponse.success ? usersResponse.data : [];
  const orders = ordersResponse.success ? ordersResponse.data : [];

  const orderCountByCustomerId = new Map<string, number>();

  orders.forEach((order) => {
    const customerId = order.customerId;

    if (!customerId) {
      return;
    }

    orderCountByCustomerId.set(customerId, (orderCountByCustomerId.get(customerId) || 0) + 1);
  });

  const initialUsers = users
    .filter((adminUser) => adminUser.role?.toUpperCase() !== "ADMIN")
    .map((adminUser) => ({
      ...adminUser,
      ordersCount: orderCountByCustomerId.get(adminUser.id) || 0,
    }))
    .sort((a, b) => +new Date(b.createdAt || 0) - +new Date(a.createdAt || 0));

  return <AdminUsersPageContent initialUsers={initialUsers} />;
}
