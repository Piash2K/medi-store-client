"use client";

import Link from "next/link";
import { Package, ShoppingBag } from "lucide-react";
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
  { key: "ALL", label: "Total Orders" },
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

const getStatusVariant = (status: string) => {
  const normalizedStatus = normalizeStatus(status);

  if (normalizedStatus === "DELIVERED") {
    return "secondary" as const;
  }

  if (normalizedStatus === "CANCELLED") {
    return "destructive" as const;
  }

  return "outline" as const;
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
    <section className="w-full space-y-4 rounded-xl bg-linear-to-b from-emerald-50/25 to-white p-0 sm:space-y-5 sm:p-1">
      <div className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight text-emerald-700 sm:text-2xl md:text-3xl">Order Status</h1>
        <p className="text-sm text-emerald-600">View your orders by status with quick filters.</p>
      </div>

      <Tabs selectedIndex={selectedIndex} onSelect={(index) => setSelectedIndex(index)}>
        <div className="mt-1 overflow-x-auto sm:mt-2">
          <TabList className="mt-0! mb-2! pb-0! flex min-w-max list-none items-center gap-1 border-b border-emerald-200 sm:gap-2">
            {statusConfig.map((statusItem, index) => {
              const count = statusItem.key === "ALL" ? sortedOrders.length : statusCount[statusItem.key];
              const isActive = selectedIndex === index;

              return (
                <Tab
                  key={statusItem.key}
                  className={`bottom-0! cursor-pointer rounded-t-md border border-transparent border-b-0 bg-transparent px-2.5 py-2 text-xs font-medium whitespace-nowrap outline-none transition-colors sm:px-3 sm:text-sm ${
                    isActive
                      ? "text-emerald-700! border-emerald-200! bg-white! border-b-white!"
                      : "text-emerald-500 hover:text-emerald-700"
                  }`}
                >
                  <span>{statusItem.label}</span>
                  <span className="ml-1.5 text-[11px] sm:ml-2 sm:text-xs">{count}</span>
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
            <TabPanel key={statusItem.key} className="m-0! p-0! pt-3 sm:pt-4">
              {isError && (
                <p className="text-destructive text-sm">{errorMessage || "Failed to load orders."}</p>
              )}

              {!isError && panelOrders.length === 0 && (
                <div className="rounded-xl border-2 border-dashed border-emerald-200 bg-white p-4 text-center sm:p-6">
                  <p className="font-medium text-emerald-800">No orders found for this status</p>
                  <p className="mt-1 text-sm text-emerald-600">Try another tab or place a new order.</p>
                  <Button asChild size="sm" className="mt-4 bg-emerald-600 text-white hover:bg-emerald-700">
                    <Link href="/shop">Browse Medicines</Link>
                  </Button>
                </div>
              )}

              {!isError && panelPaginatedOrders.length > 0 && (
                <div className="space-y-4">
                  {panelPaginatedOrders.map((order) => (
                    <Card key={order.id} className="border-2 border-emerald-200 bg-white shadow-sm">
                      <CardHeader className="pb-2 sm:pb-3">
                        <CardTitle className="text-sm text-emerald-800 sm:text-base md:text-lg">#{order.id.slice(0, 8).toUpperCase()}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2.5 sm:space-y-3">
                        <div className="flex flex-wrap items-start justify-between gap-2 text-sm sm:items-center sm:gap-3">
                          <span className="inline-flex items-center gap-1 text-emerald-600">
                            <Package className="h-4 w-4" />
                            {order.items.length} item(s)
                          </span>
                          <Badge variant={getStatusVariant(order.status)}>{normalizeStatus(order.status)}</Badge>
                        </div>

                        <div className="grid gap-2 text-sm sm:grid-cols-2">
                          <p className="text-emerald-600">
                            Date: <span className="text-emerald-800">{formatDate(order.createdAt)}</span>
                          </p>
                          <p className="text-emerald-600 sm:text-right">
                            Total:
                            <span className="ml-1 font-semibold text-emerald-800">
                              BDT {currencyFormatter.format(order.totalAmount)}
                            </span>
                          </p>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
                          <Button asChild variant="outline" size="sm" className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50 sm:w-auto">
                            <Link href={`/orders/${order.id}`}>View Details</Link>
                          </Button>
                          <Button asChild size="sm" className="w-full bg-emerald-600 text-white hover:bg-emerald-700 sm:w-auto">
                            <Link href="/shop" className="inline-flex items-center gap-1">
                              <ShoppingBag className="h-4 w-4" />
                              Shop More
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <div className="flex flex-col gap-3 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-emerald-600">
                      Page {panelCurrentPage} of {panelTotalPages}
                    </p>
                    <div className="flex w-full items-center gap-2 sm:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50 sm:flex-none"
                        disabled={panelCurrentPage <= 1}
                        onClick={() => setPage(statusItem.key, panelCurrentPage - 1)}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50 sm:flex-none"
                        disabled={panelCurrentPage >= panelTotalPages}
                        onClick={() => setPage(statusItem.key, panelCurrentPage + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </TabPanel>
          );
        })}
      </Tabs>
    </section>
  );
}
