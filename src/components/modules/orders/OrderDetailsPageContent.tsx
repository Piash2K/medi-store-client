import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import CancelOrderButton from "@/components/modules/orders/CancelOrderButton";
import { getOrderById } from "@/services/order";

const currencyFormatter = new Intl.NumberFormat("en-BD", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  return date.toLocaleString("en-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const isCustomerCancelableStatus = (status?: string) => {
  return (status || "").toUpperCase() === "PLACED";
};

type OrderDetailsPageContentProps = {
  orderId: string;
};

export default async function OrderDetailsPageContent({ orderId }: OrderDetailsPageContentProps) {
  const result = await getOrderById(orderId);

  if (!result.success || !result.data) {
    return (
      <section className="w-full px-4 py-8 sm:px-8 lg:px-16 xl:px-20 2xl:px-24">
        <Link href="/orders" className="text-muted-foreground inline-flex items-center gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>

        <p className="text-destructive mt-6 text-sm">
          {result.message || "Order details could not be loaded."}
        </p>
      </section>
    );
  }

  const order = result.data;
  const isDeliveredOrder = ["DELIVERED", "COMPLETED"].includes(order.status?.toUpperCase() || "");

  return (
    <section className="w-full px-4 py-8 sm:px-8 lg:px-16 xl:px-20 2xl:px-24">
      <Link href="/orders" className="text-muted-foreground inline-flex items-center gap-2 text-sm">
        <ArrowLeft className="h-4 w-4" />
        Back to Orders
      </Link>

      <div className="mt-6 rounded-2xl border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Order Details</h1>
            <p className="text-muted-foreground mt-1 text-sm">Order ID: {order.id}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-primary/10 text-primary inline-flex rounded-full px-3 py-1 text-xs font-semibold">
              {order.status}
            </span>
            {isCustomerCancelableStatus(order.status) ? (
              <CancelOrderButton
                orderId={order.id}
                className="rounded-md border border-destructive px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10"
              />
            ) : null}
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border p-3">
            <p className="text-xs text-muted-foreground">Created At</p>
            <p className="mt-1 text-sm font-medium">{formatDate(order.createdAt)}</p>
          </div>
          <div className="rounded-xl border p-3">
            <p className="text-xs text-muted-foreground">Payment Method</p>
            <p className="mt-1 text-sm font-medium">{order.paymentMethod}</p>
          </div>
          <div className="rounded-xl border p-3">
            <p className="text-xs text-muted-foreground">Shipping Address</p>
            <p className="mt-1 text-sm font-medium">{order.shippingAddress}</p>
          </div>
          <div className="rounded-xl border p-3">
            <p className="text-xs text-muted-foreground">Total Amount</p>
            <p className="mt-1 text-sm font-semibold">BDT {currencyFormatter.format(order.totalAmount)}</p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border">
          <div className="border-b p-4">
            <h2 className="text-base font-semibold">Ordered Medicines</h2>
          </div>

          <div className="divide-y">
            {order.items.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-semibold">{item.medicine?.name || "Medicine"}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.medicine?.manufacturer || "Unknown manufacturer"}
                  </p>
                  {isDeliveredOrder && (item.medicineId || item.medicine?.id) ? (
                    <Link
                      href={`/shop/${item.medicineId || item.medicine?.id}?review=1#review-section`}
                      className="text-primary mt-1 inline-flex text-xs font-medium"
                    >
                      Leave review now
                    </Link>
                  ) : null}
                </div>

                <div className="text-right text-sm">
                  <p className="text-muted-foreground">Qty: {item.quantity}</p>
                  <p className="font-medium">BDT {currencyFormatter.format(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
