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
    <section className="w-full px-4 py-8 sm:px-8 lg:px-16 xl:px-20 2xl:px-24">
      <h1 className="text-4xl font-bold tracking-tight">Track Orders</h1>
      <p className="text-muted-foreground mt-2 text-base">
        Track your placed orders and view medicine details.
      </p>

      {!result.success && (
        <p className="text-destructive mt-6 text-sm">
          {result.message || "Failed to load orders. Please try again."}
        </p>
      )}

      {result.success && orders.length === 0 && (
        <div className="mt-8 rounded-2xl border bg-card p-8 text-center">
          <p className="text-lg font-medium">No orders found</p>
          <p className="text-muted-foreground mt-1 text-sm">Place an order from shop to track it here.</p>
          <Link
            href="/shop"
            className="bg-primary text-primary-foreground mt-4 inline-flex rounded-md px-4 py-2 text-sm font-medium"
          >
            Browse Medicines
          </Link>
        </div>
      )}

      {orders.length > 0 && (
        <div className="mt-8 space-y-4">
          {orders.map((order) => (
            <article key={order.id} className="rounded-2xl border bg-card p-5">
              <div className="flex flex-col sm:flex-row flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Order ID</p>
                  <p className="mt-1 text-sm font-semibold max-w-xs sm:max-w-md truncate break-all" title={order.id}>{order.id}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
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

                <div className="sm:text-right mt-4 sm:mt-0 min-w-40">
                  <p className="text-xs font-medium text-muted-foreground">Status</p>
                  <span className="bg-primary/10 text-primary mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold max-w-full truncate">
                    {order.status}
                  </span>
                  <p className="mt-3 text-sm text-muted-foreground">Total</p>
                  <p className="text-xl font-semibold whitespace-nowrap">BDT {currencyFormatter.format(order.totalAmount)}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row flex-wrap items-center justify-between gap-3 border-t pt-4">
                <div className="flex flex-wrap items-center gap-2 min-w-0">
                  <p className="text-sm text-muted-foreground truncate">
                    Payment: <span className="font-medium text-foreground whitespace-nowrap">{order.paymentMethod}</span>
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
                  className="text-primary inline-flex items-center gap-1 text-sm font-medium whitespace-nowrap"
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
