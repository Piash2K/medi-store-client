import OrderDetailsPageContent from "@/components/modules/orders/OrderDetailsPageContent";

type OrderDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const { id } = await params;

  return <OrderDetailsPageContent orderId={id} />;
}
