"use client";

import Link from "next/link";
import { ChevronRight, Package, ShoppingBag } from "lucide-react";
import { useMemo, useState } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import "react-tabs/style/react-tabs.css";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Order } from "@/types/order";

type StatusKey = "ALL" | "PLACED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

const PER_PAGE = 8;

const statusConfig: { key: StatusKey; label: string }[] = [
  { key: "ALL", label: "All Orders" },
  { key: "PLACED", label: "Placed" },
  { key: "PROCESSING", label: "Processing" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "DELIVERED", label: "Delivered" },
  { key: "CANCELLED", label: "Cancelled" },
];

const currencyFormatter = new Intl.NumberFormat("en-BD", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const normalizeStatus = (status?: string): Exclude<StatusKey, "ALL"> => {
  const normalizedStatus = status?.toUpperCase() || "PLACED";

  if (["CANCELLED", "CANCELED"].includes(normalizedStatus)) {
    return "CANCELLED";
  }

  if (["DELIVERED", "COMPLETED"].includes(normalizedStatus)) {
    return "DELIVERED";
  }

  if (["SHIPPED", "OUT_FOR_DELIVERY"].includes(normalizedStatus)) {
    return "SHIPPED";
  }

  if (["PROCESSING", "CONFIRMED", "APPROVED"].includes(normalizedStatus)) {
    return "PROCESSING";
  }

  return "PLACED";
};

const formatDate = (isoDate?: string) => {
  if (!isoDate) {
    return "N/A";
  }

  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleDateString("en-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getStatusBadgeClasses = (status: string) => {
  const normalizedStatus = normalizeStatus(status);

  if (normalizedStatus === "DELIVERED") {
    return "bg-[#00a69c]/20 text-[#006a63] dark:bg-teal-900/40 dark:text-teal-300";
  }

  if (normalizedStatus === "CANCELLED") {
    return "bg-[#ba1a1a]/10 text-[#ba1a1a] dark:bg-[#ba1a1a]/20 dark:text-[#ffb4ab]";
  }

  return "bg-[#006a63]/10 text-[#006a63] dark:bg-teal-900/30 dark:text-teal-300";
};

type CustomerOrderStatusTabsProps = {
  orders: Order[];
  isError: boolean;
  errorMessage?: string;
};

export default function CustomerOrderStatusTabs({
  orders,
  isError,
  errorMessage,
}: CustomerOrderStatusTabsProps) {
  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [orders],
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [currentPageByStatus, setCurrentPageByStatus] = useState<Record<StatusKey, number>>({
    ALL: 1,
    PLACED: 1,
    PROCESSING: 1,
    SHIPPED: 1,
    DELIVERED: 1,
    CANCELLED: 1,
  });

  const statusCount = useMemo(
    () =>
      sortedOrders.reduce<Record<Exclude<StatusKey, "ALL">, number>>(
        (acc, order) => {
          const normalized = normalizeStatus(order.status);
          acc[normalized] += 1;
          return acc;
        },
        {
          PLACED: 0,
          PROCESSING: 0,
          SHIPPED: 0,
          DELIVERED: 0,
          CANCELLED: 0,
        },
      ),
    [sortedOrders],
  );

  const setPage = (status: StatusKey, page: number) => {
    setCurrentPageByStatus((prev) => ({
      ...prev,
      [status]: Math.max(1, page),
    }));
  };

  return (
    <section className="w-full space-y-5 pb-8 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-[#006a63] font-['Manrope',sans-serif] dark:text-teal-300 md:text-4xl">
          Order Status
        </h1>
        <p className="text-sm text-[#3c4947] dark:text-slate-400">
          Track, manage, and view the status of all your orders.
        </p>
      </div>

      <Tabs selectedIndex={selectedIndex} onSelect={(index) => setSelectedIndex(index)}>
        <div className="overflow-x-auto">
          <TabList className="flex min-w-max list-none items-center gap-2 border-b border-[#006a63]/20 pb-0! mb-4! mt-0! dark:border-emerald-900/60">
            {statusConfig.map((statusItem, index) => {
              const count = statusItem.key === "ALL" ? sortedOrders.length : statusCount[statusItem.key];
              const isActive = selectedIndex === index;

              return (
                <Tab
                  key={statusItem.key}
                  className={`bottom-[1px]! cursor-pointer border-b-2 px-3 sm:px-4 py-2.5 text-xs font-semibold whitespace-nowrap outline-none transition-colors sm:text-sm ${
                    isActive
                      ? "border-[#006a63] text-[#006a63] dark:border-teal-300 dark:text-teal-300"
                      : "border-transparent text-[#3c4947] hover:border-[#006a63]/30 hover:text-[#006a63] dark:text-slate-400 dark:hover:text-teal-300"
                  }`}
                >
                  <span>{statusItem.label}</span>
                  <Badge
                    variant="secondary"
                    className={`ml-2 rounded-full px-1.5 py-0 text-[10px] sm:text-[11px] ${
                      isActive 
                        ? "bg-[#006a63] text-white dark:bg-teal-700" 
                        : "bg-[#006a63]/10 text-[#006a63] dark:bg-teal-950/40 dark:text-teal-300"
                    }`}
                  >
                    {count}
                  </Badge>
                </Tab>
              );
            })}
          </TabList>
        </div>

        {statusConfig.map((statusItem) => {
          const panelOrders =
            statusItem.key === "ALL"
              ? sortedOrders
              : sortedOrders.filter((order) => normalizeStatus(order.status) === statusItem.key);

          const panelTotalPages = Math.max(1, Math.ceil(panelOrders.length / PER_PAGE));
          const panelCurrentPage = Math.min(currentPageByStatus[statusItem.key] || 1, panelTotalPages);
          const panelPaginatedOrders = panelOrders.slice(
            (panelCurrentPage - 1) * PER_PAGE,
            panelCurrentPage * PER_PAGE,
          );

          return (
            <TabPanel key={statusItem.key} className="m-0! p-0! pt-2">
              {isError && (
                <div className="rounded-xl border border-[#ba1a1a]/30 bg-[#ba1a1a]/5 p-4 text-center dark:border-[#ba1a1a]/50">
                  <p className="text-sm font-semibold text-[#ba1a1a] dark:text-[#ffb4ab]">
                    {errorMessage || "Failed to load orders."}
                  </p>
                </div>
              )}

              {!isError && panelOrders.length === 0 && (
                <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-[#006a63]/30 bg-[#006a63]/5 p-8 text-center dark:border-emerald-900 dark:bg-emerald-950/20">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#006a63]/10 text-[#006a63] dark:bg-teal-900/40 dark:text-teal-300">
                    <Package className="h-8 w-8" />
                  </div>
                  <p className="text-lg font-bold text-[#171d1c] font-['Manrope',sans-serif] dark:text-slate-100">No Orders Found</p>
                  <p className="mt-2 text-sm text-[#3c4947] dark:text-slate-400 max-w-sm mx-auto">
                    There are currently no orders in the {statusItem.label.toLowerCase()} status.
                  </p>
                  <Button asChild size="sm" className="mt-6 rounded-lg bg-[#006a63] px-6 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#5bdacf] hover:text-[#00201d] dark:bg-teal-600 dark:hover:bg-teal-700">
                    <Link href="/shop">Browse Medicines</Link>
                  </Button>
                </div>
              )}

              {!isError && panelPaginatedOrders.length > 0 && (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {panelPaginatedOrders.map((order) => (
                      <article
                        key={order.id}
                        className="flex flex-col justify-between rounded-xl border border-[#006a63]/15 bg-[#f5fbf9] p-4 sm:p-5 shadow-2xs transition-all hover:bg-white hover:shadow-sm dark:border-emerald-900/50 dark:bg-background/80 dark:hover:bg-emerald-950/20"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-mono text-sm font-bold text-[#171d1c] dark:text-slate-100">
                              #{order.id.slice(0, 8).toUpperCase()}
                            </p>
                            <p className="mt-1.5 text-xs text-[#3c4947] dark:text-slate-400">
                              Placed on {formatDate(order.createdAt)}
                            </p>
                          </div>
                          <Badge className={`rounded-full px-2.5 py-1 text-[10px] font-semibold border-none hover:bg-transparent tracking-wide ${getStatusBadgeClasses(order.status)}`}>
                            {normalizeStatus(order.status)}
                          </Badge>
                        </div>

                        <div className="my-4 flex items-center justify-between border-y border-[#006a63]/10 py-3 text-sm text-[#3c4947] dark:border-slate-800 dark:text-slate-400">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Package className="h-4 w-4 opacity-70" />
                            {order.items.length} Item(s)
                          </span>
                          <span className="font-bold text-[#006a63] dark:text-teal-300">
                            BDT {currencyFormatter.format(order.totalAmount)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-3 pt-1">
                          <Button asChild variant="outline" size="sm" className="w-full rounded-lg border border-[#006a63] text-xs font-bold text-[#006a63] transition-colors hover:bg-[#006a63]/5 dark:border-teal-500 dark:text-teal-300 dark:hover:bg-teal-950/30">
                            <Link href={`/orders/${order.id}`}>View Details</Link>
                          </Button>
                          <Button asChild size="sm" className="w-full rounded-lg bg-[#006a63] text-xs font-bold text-white transition-colors hover:bg-[#5bdacf] hover:text-[#00201d] dark:bg-teal-600 dark:hover:bg-teal-700">
                            <Link href="/shop" className="inline-flex items-center gap-1.5">
                              Shop More <ChevronRight className="h-3 w-3" />
                            </Link>
                          </Button>
                        </div>
                      </article>
                    ))}
                  </div>

                  {panelTotalPages > 1 && (
                    <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-xl border border-[#006a63]/15 bg-white p-4 sm:flex-row dark:border-emerald-900/50 dark:bg-background/80">
                      <p className="text-sm font-medium text-[#3c4947] dark:text-slate-400">
                        Showing page <span className="font-bold text-[#171d1c] dark:text-slate-200">{panelCurrentPage}</span> of {panelTotalPages}
                      </p>
                      <div className="flex w-full items-center gap-2 sm:w-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 rounded-lg border-[#006a63]/20 text-xs font-bold text-[#006a63] hover:bg-[#006a63]/5 disabled:opacity-50 dark:border-emerald-800 dark:text-teal-300 dark:hover:bg-teal-950/30 sm:flex-none"
                          disabled={panelCurrentPage <= 1}
                          onClick={() => setPage(statusItem.key, panelCurrentPage - 1)}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 rounded-lg border-[#006a63]/20 text-xs font-bold text-[#006a63] hover:bg-[#006a63]/5 disabled:opacity-50 dark:border-emerald-800 dark:text-teal-300 dark:hover:bg-teal-950/30 sm:flex-none"
                          disabled={panelCurrentPage >= panelTotalPages}
                          onClick={() => setPage(statusItem.key, panelCurrentPage + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabPanel>
          );
        })}
      </Tabs>
    </section>
  );
}
