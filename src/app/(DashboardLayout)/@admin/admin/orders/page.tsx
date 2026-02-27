import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import AdminOrdersPageContent from "@/components/modules/admin/AdminOrdersPageContent";
import { getAdminOrders } from "@/services/admin";
import { getUser } from "@/services/auth";

export default async function AdminOrdersPage() {
  const user = (await getUser()) as { role?: string } | null;

  if (!user) {
    redirect("/login?redirect=/admin/orders");
  }

  const role = user.role?.toUpperCase();

  if (role !== "ADMIN") {
    redirect("/dashboard");
  }

  const ordersResponse = await getAdminOrders();
  const initialOrders = ordersResponse.success ? ordersResponse.data : [];

  const sortedOrders = [...initialOrders].sort((a, b) => +new Date(b.createdAt || 0) - +new Date(a.createdAt || 0));

  return (
    <section className="space-y-6 p-1">
      <div className="space-y-2">
        <Link href="/" className="text-muted-foreground inline-flex items-center gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" />
          Back to Store
        </Link>
        <h1 className="text-4xl font-semibold tracking-tight">All Orders</h1>
      </div>

      <AdminOrdersPageContent initialOrders={sortedOrders} />
    </section>
  );
}
