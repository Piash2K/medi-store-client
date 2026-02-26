import { redirect } from "next/navigation";


import { getUser } from "@/services/auth";
import { getSellerOrders } from "@/services/order";
import SellerOrdersPageContent from "@/components/modules/seller/SellerOrdersPageContent";

export default async function SellerOrdersPage() {
  const user = (await getUser()) as { role?: string } | null;

  if (!user) {
    redirect("/login?redirect=/seller/orders");
  }

  const role = user.role?.toUpperCase();

  if (role !== "SELLER" && role !== "ADMIN") {
    redirect("/dashboard");
  }

  const ordersResult = await getSellerOrders();
  const initialOrders = ordersResult.success ? ordersResult.data : [];

  return <SellerOrdersPageContent initialOrders={initialOrders} />;
}
