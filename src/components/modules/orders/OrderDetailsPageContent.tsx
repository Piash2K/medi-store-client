import Link from "next/link";
import { ArrowLeft, Pill } from "lucide-react";

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
      <main className="min-h-screen bg-[#f5fbf9] transition-colors duration-200 dark:bg-background">
        <div className="home-shell py-8 sm:py-10">
          <div className="mb-6">
            <Link
              href="/orders"
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-[#006a63] transition-colors hover:text-[#00a69c] dark:text-teal-300 dark:hover:text-teal-200"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to Orders</span>
            </Link>
          </div>

          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-600 dark:border-red-800/50 dark:bg-red-950/40 dark:text-red-300">
            {result.message || "Order details could not be loaded."}
          </div>
        </div>
      </main>
    );
  }

  const order = result.data;
  const isDeliveredOrder = ["DELIVERED", "COMPLETED"].includes(order.status?.toUpperCase() || "");

  return (
    <main className="min-h-screen bg-[#f5fbf9] transition-colors duration-200 dark:bg-background">
      <div className="home-shell py-8 sm:py-10">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link
            href="/orders"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-[#006a63] transition-colors hover:text-[#00a69c] dark:text-teal-300 dark:hover:text-teal-200"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Orders</span>
          </Link>
        </div>

        {/* Main Order Details Card */}
        <div className="overflow-hidden rounded-xl border border-[#006a63]/20 bg-white shadow-sm dark:border-emerald-900/70 dark:bg-background/80">
          {/* Card Header */}
          <div className="flex flex-col gap-4 border-b border-[#006a63]/15 p-6 sm:p-8 dark:border-emerald-900/50 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="mb-1.5 text-2xl font-bold tracking-tight text-[#006a63] font-['Manrope',sans-serif] dark:text-teal-300 sm:text-3xl">
                Order Details
              </h1>
              <p className="flex items-center gap-2 text-sm text-[#3c4947] dark:text-slate-400">
                Order ID: <span className="font-mono font-medium text-[#171d1c] dark:text-slate-200">{order.id}</span>
              </p>
            </div>

            <div className="flex items-center gap-3 self-start">
              <span className="inline-flex items-center rounded-full bg-[#006a63]/10 px-3.5 py-1 text-xs font-semibold text-[#006a63] dark:bg-teal-900/40 dark:text-teal-300">
                {order.status}
              </span>
              {isCustomerCancelableStatus(order.status) ? (
                <CancelOrderButton
                  orderId={order.id}
                  className="inline-flex items-center justify-center rounded-md border border-[#ba1a1a]/40 bg-white px-4 py-2 text-xs font-semibold text-[#ba1a1a] transition-colors hover:bg-[#ffdad6] hover:text-[#93000a] dark:border-red-500/60 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/50 dark:hover:text-red-200"
                />
              ) : null}
            </div>
          </div>

          {/* Information Grid */}
          <div className="border-b border-[#006a63]/15 bg-[#006a63]/5 p-6 sm:p-8 dark:border-emerald-900/50 dark:bg-teal-950/20">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-[#006a63]/15 bg-white p-4 shadow-2xs dark:border-emerald-900/50 dark:bg-background/80">
                <p className="mb-1 text-xs font-semibold text-[#3c4947] dark:text-slate-400">Created At</p>
                <p className="text-sm font-medium text-[#171d1c] dark:text-slate-100">{formatDate(order.createdAt)}</p>
              </div>

              <div className="rounded-lg border border-[#006a63]/15 bg-white p-4 shadow-2xs dark:border-emerald-900/50 dark:bg-background/80">
                <p className="mb-1 text-xs font-semibold text-[#3c4947] dark:text-slate-400">Payment Method</p>
                <p className="text-sm font-medium text-[#171d1c] dark:text-slate-100">
                  {order.paymentMethod === "COD" ? "Cash on Delivery" : order.paymentMethod}
                </p>
              </div>

              <div className="rounded-lg border border-[#006a63]/15 bg-white p-4 shadow-2xs dark:border-emerald-900/50 dark:bg-background/80">
                <p className="mb-1 text-xs font-semibold text-[#3c4947] dark:text-slate-400">Shipping Address</p>
                <p className="text-sm font-medium text-[#171d1c] dark:text-slate-100">{order.shippingAddress}</p>
              </div>

              <div className="rounded-lg border border-[#006a63]/15 bg-white p-4 shadow-2xs dark:border-emerald-900/50 dark:bg-background/80">
                <p className="mb-1 text-xs font-semibold text-[#3c4947] dark:text-slate-400">Total Amount</p>
                <p className="text-sm font-bold text-[#006a63] dark:text-teal-300">BDT {currencyFormatter.format(order.totalAmount)}</p>
              </div>
            </div>
          </div>

          {/* Ordered Medicines Section */}
          <div className="p-6 sm:p-8">
            <h2 className="mb-6 text-xl font-semibold text-[#006a63] font-['Manrope',sans-serif] dark:text-teal-300">
              Ordered Medicines
            </h2>

            <div className="overflow-hidden rounded-lg border border-[#006a63]/15 dark:border-emerald-900/50">
              <div className="divide-y divide-[#006a63]/10 dark:divide-slate-800">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 p-4 transition-colors hover:bg-[#006a63]/5 dark:hover:bg-emerald-950/20 sm:flex-row sm:items-center justify-between"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#006a63]/10 text-[#006a63] dark:bg-teal-900/40 dark:text-teal-300">
                        <Pill className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#171d1c] dark:text-slate-100">
                          {item.medicine?.name || "Medicine"}
                        </p>
                        <p className="text-xs text-[#3c4947] dark:text-slate-400">
                          {item.medicine?.manufacturer || "Unknown manufacturer"}
                        </p>
                        {isDeliveredOrder && (item.medicineId || item.medicine?.id) ? (
                          <Link
                            href={`/shop/${item.medicineId || item.medicine?.id}?review=1#review-section`}
                            className="mt-1 inline-flex text-xs font-semibold text-[#006a63] hover:underline dark:text-teal-300"
                          >
                            Leave review now
                          </Link>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 sm:flex-col sm:items-end sm:justify-center">
                      <p className="text-xs text-[#3c4947] dark:text-slate-400">
                        Qty: <span className="font-semibold text-[#171d1c] dark:text-slate-100">{item.quantity}</span>
                      </p>
                      <p className="text-sm font-bold text-[#006a63] dark:text-teal-300">
                        BDT {currencyFormatter.format(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
