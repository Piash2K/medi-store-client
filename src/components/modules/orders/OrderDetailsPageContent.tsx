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
      <section className="mx-auto w-full max-w-screen-2xl bg-linear-to-b from-emerald-50/30 to-background px-4 py-6 dark:from-emerald-950/10 sm:px-6 sm:py-8 lg:px-8">
        <Link href="/orders" className="inline-flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200">
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
    <section className="mx-auto w-full max-w-screen-2xl bg-linear-to-b from-emerald-50/30 to-background px-4 py-6 dark:from-emerald-950/10 sm:px-6 sm:py-8 lg:px-8">
      <Link href="/orders" className="inline-flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200">
        <ArrowLeft className="h-4 w-4" />
        Back to Orders
      </Link>

      <div className="mt-6 rounded-2xl border-2 border-emerald-200 bg-white p-6 shadow-sm dark:border-emerald-800/60 dark:bg-emerald-950/20">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-emerald-700 dark:text-emerald-300">Order Details</h1>
            <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">Order ID: {order.id}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/45 dark:text-emerald-300">
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
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3 dark:border-emerald-800/60 dark:bg-emerald-950/25">
            <p className="text-xs text-emerald-600 dark:text-emerald-400">Created At</p>
            <p className="mt-1 text-sm font-medium text-emerald-900 dark:text-emerald-200">{formatDate(order.createdAt)}</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3 dark:border-emerald-800/60 dark:bg-emerald-950/25">
            <p className="text-xs text-emerald-600 dark:text-emerald-400">Payment Method</p>
            <p className="mt-1 text-sm font-medium text-emerald-900 dark:text-emerald-200">{order.paymentMethod}</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3 dark:border-emerald-800/60 dark:bg-emerald-950/25">
            <p className="text-xs text-emerald-600 dark:text-emerald-400">Shipping Address</p>
            <p className="mt-1 text-sm font-medium text-emerald-900 dark:text-emerald-200">{order.shippingAddress}</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3 dark:border-emerald-800/60 dark:bg-emerald-950/25">
            <p className="text-xs text-emerald-600 dark:text-emerald-400">Total Amount</p>
            <p className="mt-1 text-sm font-semibold text-emerald-700 dark:text-emerald-300">BDT {currencyFormatter.format(order.totalAmount)}</p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-emerald-200 bg-white dark:border-emerald-800/60 dark:bg-emerald-950/20">
          <div className="border-b border-emerald-100 p-4 dark:border-emerald-800/60">
            <h2 className="text-base font-semibold text-emerald-700 dark:text-emerald-300">Ordered Medicines</h2>
          </div>

          <div className="divide-y divide-emerald-100 dark:divide-emerald-800/60">
            {order.items.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">{item.medicine?.name || "Medicine"}</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    {item.medicine?.manufacturer || "Unknown manufacturer"}
                  </p>
                  {isDeliveredOrder && (item.medicineId || item.medicine?.id) ? (
                    <Link
                      href={`/shop/${item.medicineId || item.medicine?.id}?review=1#review-section`}
                      className="mt-1 inline-flex text-xs font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200"
                    >
                      Leave review now
                    </Link>
                  ) : null}
                </div>

                <div className="text-right text-sm">
                  <p className="text-emerald-600 dark:text-emerald-400">Qty: {item.quantity}</p>
                  <p className="font-semibold text-emerald-700 dark:text-emerald-300">BDT {currencyFormatter.format(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
