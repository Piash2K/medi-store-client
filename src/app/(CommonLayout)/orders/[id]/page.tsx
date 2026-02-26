import OrderDetailsPageContent from "@/components/modules/orders/OrderDetailsPageContent";
import { getUser } from "@/services/auth";
import { redirect } from "next/navigation";

type OrderDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const user = (await getUser()) as { role?: string } | null;

  if (!user || user.role?.toUpperCase() !== "CUSTOMER") {
    redirect("/login?redirect=/orders");
  }

  const { id } = await params;

  return <OrderDetailsPageContent orderId={id} />;
}
