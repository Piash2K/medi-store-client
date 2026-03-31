import CustomerOrderStatusTabs from "@/components/modules/orders/CustomerOrderStatusTabs";
import { getUser } from "@/services/auth";
import { getOrders } from "@/services/order";
import { redirect } from "next/navigation";
export default async function CustomerOrderStatusPage() {
  const user = (await getUser()) as { role?: string } | null;

  if (!user || user.role?.toUpperCase() !== "CUSTOMER") {
    redirect("/login?redirect=/orders-status");
  }

  const ordersResult = await getOrders();
  // Only show error if the API call itself failed, not just if there are no orders
  const isError = !ordersResult.success && ordersResult.data === undefined;

  return (
    <section className="rounded-xl bg-linear-to-b from-emerald-50/25 to-background p-1 dark:from-emerald-950/10">
      <CustomerOrderStatusTabs
        orders={ordersResult.success ? ordersResult.data : []}
        isError={isError}
        errorMessage={ordersResult.message}
      />
    </section>
  );
}
