"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

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

    if (order.status?.toUpperCase() === normalizedStatus) {
      return;
    }

    setUpdatingOrderId(order.id);

    const result = await updateSellerOrderStatus({
      orderId: order.id,
      status: normalizedStatus,
    });

    setUpdatingOrderId("");

    if (!result.success) {
      toast.error(result.message || "Failed to update order status", { position: "top-right" });
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

    toast.success(result.message || "Order status updated", { position: "top-right" });
  };

  return (
    <section className="space-y-6 p-1">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Manage Orders</h1>

        <div className="ml-auto w-48">
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
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-4 text-sm font-medium text-muted-foreground">Order ID</th>
                  <th className="px-4 py-4 text-sm font-medium text-muted-foreground">Customer</th>
                  <th className="px-4 py-4 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-4 text-sm font-medium text-muted-foreground">Items</th>
                  <th className="px-4 py-4 text-sm font-medium text-muted-foreground">Total</th>
                  <th className="px-4 py-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-4 text-right text-sm font-medium text-muted-foreground">Actions</th>
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
                        <td className="px-4 py-4 text-base font-medium">ORD-{String(index + 1).padStart(3, "0")}</td>
                        <td className="px-4 py-4 text-base">{getCustomerName(order)}</td>
                        <td className="px-4 py-4 text-base">{formatDate(order.createdAt)}</td>
                        <td className="max-w-60 truncate px-4 py-4 text-base">{getItemsSummary(order)}</td>
                        <td className="px-4 py-4 text-base font-medium">BDT {currencyFormatter.format(order.totalAmount)}</td>
                        <td className="px-4 py-4">
                          <Badge className={getStatusBadgeClassName(statusValue)}>{formatStatusLabel(statusValue)}</Badge>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Select
                            value={statusValue}
                            onValueChange={(nextStatus) => handleStatusChange(order, nextStatus)}
                            disabled={isUpdating}
                          >
                            <SelectTrigger className="ml-auto w-37.5">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent align="end">
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
