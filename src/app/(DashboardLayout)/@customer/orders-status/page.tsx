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
  return <CustomerOrderStatusTabs orders={ordersResult.success ? ordersResult.data : []} isError={!ordersResult.success} errorMessage={ordersResult.message} />;
}
