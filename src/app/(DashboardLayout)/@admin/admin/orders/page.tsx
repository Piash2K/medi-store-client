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
    <section className="space-y-6 rounded-xl bg-linear-to-b from-emerald-50/25 to-background p-1 dark:from-emerald-950/10">
      <div className="space-y-2">
        <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200">
          <ArrowLeft className="h-4 w-4" />
          Back to Store
        </Link>
        <h1 className="text-4xl font-semibold tracking-tight text-emerald-700 dark:text-emerald-300">All Orders</h1>
      </div>

      <AdminOrdersPageContent initialOrders={sortedOrders} />
    </section>
  );
}
