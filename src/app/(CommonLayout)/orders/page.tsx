import OrdersPageContent from "@/components/modules/orders/OrdersPageContent";
import { getUser } from "@/services/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const user = (await getUser()) as { role?: string } | null;

  if (!user || user.role?.toUpperCase() !== "CUSTOMER") {
    redirect("/login?redirect=/orders");
  }

  return <OrdersPageContent />;
}
