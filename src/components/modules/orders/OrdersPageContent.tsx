import Link from "next/link";
import { CalendarDays, ChevronRight, Package } from "lucide-react";

import CancelOrderButton from "@/components/modules/orders/CancelOrderButton";
import { getOrders } from "@/services/order";

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

export default async function OrdersPageContent() {
  const result = await getOrders();
  const orders = result.success ? result.data : [];

  return (
    <section className="w-full bg-linear-to-b from-emerald-50/30 to-white px-4 py-8 sm:px-8 lg:px-16 xl:px-20 2xl:px-24">
      <h1 className="text-4xl font-bold tracking-tight text-emerald-700">Track Orders</h1>
      <p className="mt-2 text-base text-emerald-600">
        Track your placed orders and view medicine details.
      </p>

      {!result.success && (
        <p className="text-destructive mt-6 text-sm">
          {result.message || "Failed to load orders. Please try again."}
        </p>
      )}

      {result.success && orders.length === 0 && (
        <div className="mt-8 rounded-2xl border-2 border-emerald-200 bg-linear-to-br from-emerald-50 to-white p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-emerald-800">No orders found</p>
          <p className="mt-1 text-sm text-emerald-600">Place an order from shop to track it here.</p>
          <Link
            href="/shop"
            className="mt-4 inline-flex rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Browse Medicines
          </Link>
        </div>
      )}

      {orders.length > 0 && (
        <div className="mt-8 space-y-4">
          {orders.map((order) => (
            <article key={order.id} className="rounded-2xl border-2 border-emerald-200 bg-white p-5 shadow-sm transition hover:shadow-md">
              <div className="flex flex-col sm:flex-row flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-emerald-600">Order ID</p>
                  <p className="mt-1 max-w-xs truncate break-all text-sm font-semibold text-emerald-900 sm:max-w-md" title={order.id}>{order.id}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-emerald-700">
                    <span className="inline-flex items-center gap-1 whitespace-nowrap">
                      <CalendarDays className="h-4 w-4" />
                      {formatDate(order.createdAt)}
                    </span>
                    <span className="inline-flex items-center gap-1 whitespace-nowrap">
                      <Package className="h-4 w-4" />
                      {order.items.length} item(s)
                    </span>
                  </div>
                </div>

                <div className="mt-4 min-w-40 sm:mt-0 sm:text-right">
                  <p className="text-xs font-medium text-emerald-600">Status</p>
                  <span className="mt-1 inline-flex max-w-full truncate rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {order.status}
                  </span>
                  <p className="mt-3 text-sm text-emerald-600">Total</p>
                  <p className="text-xl font-bold whitespace-nowrap text-emerald-700">BDT {currencyFormatter.format(order.totalAmount)}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row flex-wrap items-center justify-between gap-3 border-t border-emerald-100 pt-4">
                <div className="flex flex-wrap items-center gap-2 min-w-0">
                  <p className="text-sm text-emerald-700 truncate">
                    Payment: <span className="font-medium text-emerald-900 whitespace-nowrap">{order.paymentMethod}</span>
                  </p>

                  {isCustomerCancelableStatus(order.status) ? (
                    <CancelOrderButton
                      orderId={order.id}
                      className="rounded-md border border-destructive px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10"
                    />
                  ) : null}
                </div>

                <Link
                  href={`/orders/${order.id}`}
                  className="inline-flex items-center gap-1 whitespace-nowrap text-sm font-medium text-emerald-700 hover:text-emerald-800"
                >
                  View details
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
