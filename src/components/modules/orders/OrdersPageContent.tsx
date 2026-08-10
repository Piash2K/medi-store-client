"use client";

import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { CalendarDays, ChevronRight, Package, Inbox, RefreshCw, Truck, CheckCircle, HelpCircle, CreditCard, Wallet } from "lucide-react";

import CancelOrderButton from "@/components/modules/orders/CancelOrderButton";
import { getOrders } from "@/services/order";


import type { Order } from "@/types/order";

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

const getStatusStyle = (status: string) => {
  const upperStatus = status.toUpperCase();
  if (upperStatus === "DELIVERED") {
    return "bg-green-100 text-green-700";
  }
  if (upperStatus === "PROCESSING" || upperStatus === "PLACED") {
    return "bg-gray-100 text-gray-600";
  }
  if (upperStatus === "CANCELLED") {
    return "bg-red-50 text-red-600";
  }
  if (upperStatus === "SHIPPED" || upperStatus === "IN_TRANSIT") {
    return "bg-blue-100 text-blue-700";
  }
  return "bg-gray-100 text-gray-600";
};

const getPaymentIcon = (method: string) => {
  const lowerMethod = method.toLowerCase();
  if (lowerMethod.includes("visa") || lowerMethod.includes("master") || lowerMethod.includes("card")) {
    return <CreditCard className="h-4 w-4" />;
  }
  if (lowerMethod.includes("apple") || lowerMethod.includes("google") || lowerMethod.includes("pay")) {
    return <Wallet className="h-4 w-4" />;
  }
  return <CreditCard className="h-4 w-4" />;
};

type FilterType = "all" | "processing" | "in-transit" | "delivered";

export default function OrdersPageContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 6;

  useEffect(() => {
    const fetchOrders = async () => {
      const result = await getOrders();
      if (result.success) {
        setOrders(result.data);
      } else {
        setError(result.message || "Failed to load orders");
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    if (activeFilter === "all") {
      return orders;
    }
    
    if (activeFilter === "processing") {
      return orders.filter(o => ["PLACED", "PROCESSING"].includes((o.status || "").toUpperCase()));
    }
    
    if (activeFilter === "in-transit") {
      return orders.filter(o => ["SHIPPED", "IN_TRANSIT"].includes((o.status || "").toUpperCase()));
    }
    
    if (activeFilter === "delivered") {
      return orders.filter(o => (o.status || "").toUpperCase() === "DELIVERED");
    }
    
    return orders;
  }, [orders, activeFilter]);

  const totalOrders = orders.length;
  const processingCount = orders.filter(o => ["PLACED", "PROCESSING"].includes((o.status || "").toUpperCase())).length;
  const inTransitCount = orders.filter(o => ["SHIPPED", "IN_TRANSIT"].includes((o.status || "").toUpperCase())).length;
  const deliveredCount = orders.filter(o => (o.status || "").toUpperCase() === "DELIVERED").length;

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <main className="min-h-screen font-['Inter',sans-serif] text-[#171d1c] dark:bg-emerald-950/10 dark:text-slate-100">
        <div className="home-shell py-8 sm:py-10">
          {/* Header Skeleton */}
          <div className="mb-8 space-y-2">
            <div className="h-8 w-56 animate-pulse rounded-lg bg-slate-200/80 dark:bg-slate-800/80" />
            <div className="h-4 w-80 animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800/80" />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            {/* Sidebar Skeleton */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-5 rounded-xl border border-[#bbc9c7] bg-white p-5 shadow-sm dark:border-emerald-900 dark:bg-background/80">
                <div className="h-6 w-32 animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800/80" />
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="flex h-11 w-full items-center justify-between rounded-lg bg-slate-100 p-3 animate-pulse dark:bg-slate-800/60"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-5 w-5 rounded bg-slate-200/80 dark:bg-slate-700/80" />
                        <div className="h-4 w-24 rounded bg-slate-200/80 dark:bg-slate-700/80" />
                      </div>
                      <div className="h-4 w-6 rounded-full bg-slate-200/80 dark:bg-slate-700/80" />
                    </div>
                  ))}
                </div>

                {/* Need Help Box Skeleton */}
                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800">
                  <div className="rounded-xl bg-[#d2e6ef]/60 p-4 animate-pulse dark:bg-emerald-950/30">
                    <div className="mb-2 h-5 w-5 rounded bg-slate-300/80 dark:bg-slate-700/80" />
                    <div className="mb-1 h-4 w-24 rounded bg-slate-300/80 dark:bg-slate-700/80" />
                    <div className="mb-3 h-3 w-40 rounded bg-slate-300/80 dark:bg-slate-700/80" />
                    <div className="h-4 w-28 rounded bg-slate-300/80 dark:bg-slate-700/80" />
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Table & Mobile Cards Skeleton */}
            <div className="lg:col-span-3">
              {/* Desktop Table Skeleton */}
              <div className="hidden lg:block overflow-hidden rounded-xl border border-[#bbc9c7] bg-white shadow-sm dark:border-emerald-900 dark:bg-background/80">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-slate-800">
                        <th className="px-6 py-3.5 text-left text-sm font-semibold text-[#6c7a78]">Order ID</th>
                        <th className="px-6 py-3.5 text-left text-sm font-semibold text-[#6c7a78]">Date</th>
                        <th className="px-6 py-3.5 text-left text-sm font-semibold text-[#6c7a78]">Total</th>
                        <th className="px-6 py-3.5 text-left text-sm font-semibold text-[#6c7a78]">Payment</th>
                        <th className="px-6 py-3.5 text-left text-sm font-semibold text-[#6c7a78]">Status</th>
                        <th className="px-6 py-3.5 text-left text-sm font-semibold text-[#6c7a78]">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-6 py-4">
                            <div className="h-4 w-20 rounded bg-slate-200/80 dark:bg-slate-800/80" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 w-32 rounded bg-slate-200/80 dark:bg-slate-800/80" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 w-24 rounded bg-slate-200/80 dark:bg-slate-800/80" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="h-4 w-4 rounded bg-slate-200/80 dark:bg-slate-800/80" />
                              <div className="h-4 w-28 rounded bg-slate-200/80 dark:bg-slate-800/80" />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-6 w-20 rounded-full bg-slate-200/80 dark:bg-slate-800/80" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 w-12 rounded bg-slate-200/80 dark:bg-slate-800/80" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Cards Skeleton */}
              <div className="space-y-4 lg:hidden">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="space-y-3 rounded-xl border border-[#bbc9c7] bg-white p-5 shadow-sm animate-pulse dark:border-emerald-900 dark:bg-background/80"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="h-3 w-16 rounded bg-slate-200/80 dark:bg-slate-800/80" />
                        <div className="h-4 w-24 rounded bg-slate-200/80 dark:bg-slate-800/80" />
                      </div>
                      <div className="h-6 w-20 rounded-full bg-slate-200/80 dark:bg-slate-800/80" />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-32 rounded bg-slate-200/80 dark:bg-slate-800/80" />
                      <div className="h-4 w-24 rounded bg-slate-200/80 dark:bg-slate-800/80" />
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-slate-800">
                      <div className="space-y-1">
                        <div className="h-3 w-12 rounded bg-slate-200/80 dark:bg-slate-800/80" />
                        <div className="h-5 w-28 rounded bg-slate-200/80 dark:bg-slate-800/80" />
                      </div>
                      <div className="h-4 w-24 rounded bg-slate-200/80 dark:bg-slate-800/80" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className=" dark:bg-emerald-950/10 min-h-screen font-['Inter',sans-serif] text-[#171d1c] dark:text-slate-100">
      <div className="home-shell py-8 sm:py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold  mb-2">
            Track Your Orders
          </h1>
          <p className="text-[#4f6169] text-base">
            Manage your prescriptions and healthcare essentials in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className=" dark:bg-background/80 rounded-xl p-5 shadow-sm sticky top-24 border border-[#bbc9c7] dark:border-emerald-900">
              <h3 className="text-lg font-semibold  mb-5">
                Filter Orders
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleFilterChange("all")}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    activeFilter === "all"
                      ? "bg-teal-50 text-[#006a63] font-semibold"
                      : "text-[#4f6169] hover:bg-[#e9efed]"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Inbox className="h-5 w-5" />
                    <span>All Orders</span>
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    activeFilter === "all" ? "bg-[#006a63] text-white" : "bg-gray-100 text-[#4f6169]"
                  }`}>
                    {totalOrders}
                  </span>
                </button>
                
                <button
                  onClick={() => handleFilterChange("processing")}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    activeFilter === "processing"
                      ? "bg-teal-50 text-[#006a63] font-semibold"
                      : "text-[#4f6169] hover:bg-[#e9efed]"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <RefreshCw className="h-5 w-5" />
                    <span>Processing</span>
                  </span>
                  <span className="text-xs font-semibold">{processingCount}</span>
                </button>
                
                <button
                  onClick={() => handleFilterChange("in-transit")}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    activeFilter === "in-transit"
                      ? "bg-teal-50 text-[#006a63] font-semibold"
                      : "text-[#4f6169] hover:bg-[#e9efed]"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Truck className="h-5 w-5" />
                    <span>In Transit</span>
                  </span>
                  <span className="text-xs font-semibold">{inTransitCount}</span>
                </button>
                
                <button
                  onClick={() => handleFilterChange("delivered")}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    activeFilter === "delivered"
                      ? "bg-teal-50 text-[#006a63] font-semibold"
                      : "text-[#4f6169] hover:bg-[#e9efed]"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5" />
                    <span>Delivered</span>
                  </span>
                  <span className="text-xs font-semibold">{deliveredCount}</span>
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="bg-[#d2e6ef] dark:bg-emerald-950/30 rounded-xl p-4">
                  <HelpCircle className="h-5 w-5 mb-2 text-[#006a63]" />
                  <p className="text-sm font-semibold mb-1">Need Help?</p>
                  <p className="text-xs opacity-80 mb-3">Our support team is available 24/7.</p>
                  <Link href="/contact" className="text-[#006a63] font-semibold text-sm hover:underline">
                    Contact Support →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="lg:col-span-3">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">
                {error}
              </div>
            )}

            {!error && filteredOrders.length === 0 && (
              <div className=" dark:bg-background/80 rounded-xl p-12 text-center shadow-sm border border-[#bbc9c7] dark:border-emerald-900">
                <Package className="w-16 h-16 text-[#006a63]/40 mx-auto mb-4" />
                <p className="text-lg font-semibold text-[#171d1c]">
                  {activeFilter === "all" ? "No orders found" : `No ${activeFilter} orders`}
                </p>
                <p className="mt-1 text-sm text-[#4f6169]">
                  {activeFilter === "all" 
                    ? "Place an order from shop to track it here." 
                    : `You don't have any ${activeFilter} orders.`}
                </p>
                {activeFilter !== "all" && (
                  <button
                    onClick={() => handleFilterChange("all")}
                    className="mt-6 inline-block bg-[#00a69c] text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-[#008a82]"
                  >
                    View All Orders
                  </button>
                )}
                {activeFilter === "all" && (
                  <Link
                    href="/shop"
                    className="mt-6 inline-block bg-[#00a69c] text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-[#008a82]"
                  >
                    Browse Medicines
                  </Link>
                )}
              </div>
            )}

            {!error && filteredOrders.length > 0 && (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block bg-white dark:bg-background/80 rounded-xl shadow-sm overflow-hidden border border-[#bbc9c7] dark:border-emerald-900">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead >
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-[#6c7a78]">Order ID</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-[#6c7a78]">Date</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-[#6c7a78]">Total</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-[#6c7a78]">Payment</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-[#6c7a78]">Status</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-[#6c7a78]">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {paginatedOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-[#f5fbf9] dark:hover:bg-emerald-950/10 transition-colors">
                            <td className="px-6 py-4 font-semibold text-[#4f6169]">
                              #{order.id.slice(-8)}
                            </td>
                            <td className="px-6 py-4 text-sm text-[#4f6169]">
                              {formatDate(order.createdAt)}
                            </td>
                            <td className="px-6 py-4 font-semibold text-[#4f6169]">
                              BDT {currencyFormatter.format(order.totalAmount)}
                            </td>
                            <td className="px-6 py-4 text-sm text-[#4f6169]">
                              <span className="flex items-center gap-2">
                                {getPaymentIcon(order.paymentMethod)}
                                {order.paymentMethod === "COD" ? "Cash on Delivery" : order.paymentMethod}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyle(order.status)}`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <Link
                                href={`/orders/${order.id}`}
                                className="text-[#006a63] font-semibold text-sm hover:underline"
                              >
                                View →
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-4">
                  {paginatedOrders.map((order) => (
                    <div key={order.id} className="bg-white dark:bg-background/80 rounded-xl p-5 shadow-sm border border-[#bbc9c7] dark:border-emerald-900">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-xs text-[#4f6169] mb-1">Order ID</p>
                          <p className="font-semibold text-[#171d1c]">#{order.id.slice(-8)}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyle(order.status)}`}>
                          {order.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-sm text-[#4f6169] mb-3">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-4 w-4" />
                          {formatDate(order.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          {order.items.map((item) => item.medicine?.name).filter(Boolean).join(", ") || `${order.items.length} item(s)`}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                        <div>
                          <p className="text-xs text-[#4f6169] mb-1">Total</p>
                          <p className="text-xl font-bold text-[#006a63]">
                            BDT {currencyFormatter.format(order.totalAmount)}
                          </p>
                        </div>
                        <Link
                          href={`/orders/${order.id}`}
                          className="text-[#006a63] font-semibold text-sm"
                        >
                          View Details →
                        </Link>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2">
                        <p className="text-sm text-[#4f6169]">
                          Payment: <span className="font-medium text-[#171d1c] dark:text-slate-100">
                            {order.paymentMethod === "COD" ? "Cash on Delivery" : order.paymentMethod}
                          </span>
                        </p>

                        {isCustomerCancelableStatus(order.status) && (
                          <CancelOrderButton
                            orderId={order.id}
                            className="border border-red-500 px-3 py-1 text-xs font-medium text-red-500 hover:bg-red-50 rounded-md"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6">
                    <p className="text-sm text-[#6c7a78]">
                      Showing {((currentPage - 1) * ordersPerPage) + 1} to {Math.min(currentPage * ordersPerPage, filteredOrders.length)} of {filteredOrders.length} orders
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-[#4f6169] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-4 w-4 rotate-180" />
                      </button>
                      
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let pageNum = currentPage;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold ${
                              currentPage === pageNum
                                ? "bg-[#006a63] text-white"
                                : "border border-gray-200 text-[#4f6169] hover:bg-gray-50"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-[#4f6169] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}