"use client";

import { useMemo, useState } from "react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Order } from "@/types/order";
import { updateSellerOrderStatus } from "@/services/order";

type SellerOrdersPageContentProps = {
  initialOrders: Order[];
};

type OrderStatus = "PLACED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

type StatusFilter = "ALL" | OrderStatus;

const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: "PLACED", label: "Placed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

const currencyFormatter = new Intl.NumberFormat("en-BD", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatStatusLabel = (status: string) => {
  const normalized = status.toUpperCase();
  const option = statusOptions.find((item) => item.value === normalized);
  return option?.label || status;
};

const getStatusBadgeClassName = (status: string) => {
  const normalized = status.toUpperCase();

  if (normalized === "DELIVERED" || normalized === "SHIPPED") {
    return "bg-emerald-600 text-white hover:bg-emerald-600";
  }

  if (normalized === "CANCELLED") {
    return "bg-red-600 text-white hover:bg-red-600";
  }

  if (normalized === "PLACED") {
    return "bg-muted text-foreground hover:bg-muted";
  }

  return "bg-muted text-foreground hover:bg-muted";
};

const getCustomerName = (order: Order) => {
  return order.customer?.name || order.customer?.email || order.customerId || "Customer";
};

const getItemsSummary = (order: Order) => {
  if (!order.items?.length) {
    return "No items";
  }

  const itemNames = order.items.map((item) => `${item.medicine?.name || "Medicine"} x${item.quantity}`);

  if (itemNames.length <= 1) {
    return itemNames[0];
  }

  return `${itemNames[0]}, ...`;
};

// Allowed transitions for seller
const allowedSellerTransitions: Record<OrderStatus, OrderStatus[]> = {
  PLACED: ["PROCESSING"],
  PROCESSING: ["SHIPPED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export default function SellerOrdersPageContent({ initialOrders }: SellerOrdersPageContentProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [updatingOrderId, setUpdatingOrderId] = useState("");

  const filteredOrders = useMemo(() => {
    if (statusFilter === "ALL") {
      return orders;
    }

    return orders.filter((order) => order.status?.toUpperCase() === statusFilter);
  }, [orders, statusFilter]);

  const handleStatusChange = async (order: Order, nextStatus: string) => {
    const normalizedStatus = nextStatus.toUpperCase() as OrderStatus;
    const currentStatus = (order.status?.toUpperCase() || "PLACED") as OrderStatus;

    if (currentStatus === normalizedStatus) {
      return;
    }

    // Only allow valid transitions for seller
    const allowed = allowedSellerTransitions[currentStatus] || [];
    if (!allowed.includes(normalizedStatus)) {
      await Swal.fire({
        icon: "error",
        title: "Invalid status transition",
        text: `You cannot change status from ${currentStatus} to ${normalizedStatus}.`,
      });
      return;
    }

    setUpdatingOrderId(order.id);

    const result = await updateSellerOrderStatus({
      orderId: order.id,
      status: normalizedStatus,
    });

    setUpdatingOrderId("");

    if (!result.success) {
      await Swal.fire({
        icon: "error",
        title: "Update failed",
        text: result.message || "Failed to update order status",
      });
      return;
    }

    setOrders((previous) =>
      previous.map((item) => {
        if (item.id !== order.id) {
          return item;
        }

        return {
          ...item,
          status: normalizedStatus,
          updatedAt: result.data?.updatedAt || item.updatedAt,
        };
      }),
    );

    toast.success(result.message || "Order status updated");
  };

  return (
    <section className="space-y-5 p-1 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Manage Orders</h1>

        <div className="w-full sm:ml-auto sm:w-48">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Orders" />
            </SelectTrigger>
            <SelectContent align="end" position="popper">
              <SelectItem value="ALL">All Orders</SelectItem>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-190 w-full border-collapse text-left">
              <thead>
                <tr className="border-b">
                  <th className="px-3 py-3 text-xs font-medium whitespace-nowrap text-muted-foreground sm:px-4 sm:py-4 sm:text-sm">Order ID</th>
                  <th className="px-3 py-3 text-xs font-medium whitespace-nowrap text-muted-foreground sm:px-4 sm:py-4 sm:text-sm">Customer</th>
                  <th className="px-3 py-3 text-xs font-medium whitespace-nowrap text-muted-foreground sm:px-4 sm:py-4 sm:text-sm">Date</th>
                  <th className="px-3 py-3 text-xs font-medium whitespace-nowrap text-muted-foreground sm:px-4 sm:py-4 sm:text-sm">Items</th>
                  <th className="px-3 py-3 text-xs font-medium whitespace-nowrap text-muted-foreground sm:px-4 sm:py-4 sm:text-sm">Total</th>
                  <th className="px-3 py-3 text-xs font-medium whitespace-nowrap text-muted-foreground sm:px-4 sm:py-4 sm:text-sm">Status</th>
                  <th className="px-3 py-3 text-right text-xs font-medium whitespace-nowrap text-muted-foreground sm:px-4 sm:py-4 sm:text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-sm text-muted-foreground">
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order, index) => {
                    const statusValue = order.status?.toUpperCase() || "PLACED";
                    const isUpdating = updatingOrderId === order.id;

                    return (
                      <tr key={order.id} className={index === filteredOrders.length - 1 ? "" : "border-b"}>
                        <td className="px-3 py-3 text-sm font-medium whitespace-nowrap sm:px-4 sm:py-4 sm:text-base">ORD-{String(index + 1).padStart(3, "0")}</td>
                        <td className="px-3 py-3 text-sm whitespace-nowrap max-w-40 truncate sm:px-4 sm:py-4 sm:text-base">{getCustomerName(order)}</td>
                        <td className="px-3 py-3 text-sm whitespace-nowrap sm:px-4 sm:py-4 sm:text-base">{formatDate(order.createdAt)}</td>
                        <td className="max-w-60 truncate px-3 py-3 text-sm whitespace-nowrap md:whitespace-normal md:max-w-xs sm:px-4 sm:py-4 sm:text-base">{getItemsSummary(order)}</td>
                        <td className="px-3 py-3 text-sm font-medium whitespace-nowrap sm:px-4 sm:py-4 sm:text-base">BDT {currencyFormatter.format(order.totalAmount)}</td>
                        <td className="px-3 py-3 whitespace-nowrap sm:px-4 sm:py-4">
                          <Badge className={getStatusBadgeClassName(statusValue)}>{formatStatusLabel(statusValue)}</Badge>
                        </td>
                        <td className="px-3 py-3 text-right sm:px-4 sm:py-4">
                          <Select
                            value={statusValue}
                            onValueChange={(nextStatus) => handleStatusChange(order, nextStatus)}
                            disabled={isUpdating}
                          >
                            <SelectTrigger className="ml-auto h-8 w-28 text-xs sm:h-9 sm:w-37.5 sm:text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent align="end" position="popper">
                              {statusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
