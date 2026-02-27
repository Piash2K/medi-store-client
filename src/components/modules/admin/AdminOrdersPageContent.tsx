"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminOrder } from "@/services/admin";

type AdminOrdersPageContentProps = {
  initialOrders: AdminOrder[];
};

type StatusFilter = "ALL" | "PLACED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

type NormalizedStatus = Exclude<StatusFilter, "ALL">;

const currencyFormatter = new Intl.NumberFormat("en-BD", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatDate = (value?: string) => {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const statusMeta: Record<NormalizedStatus, { label: string; className: string }> = {
  PLACED: {
    label: "Placed",
    className: "bg-secondary text-secondary-foreground hover:bg-secondary",
  },
  PROCESSING: {
    label: "Processing",
    className: "bg-muted text-foreground hover:bg-muted",
  },
  SHIPPED: {
    label: "Shipped",
    className: "bg-emerald-600 text-white hover:bg-emerald-600",
  },
  DELIVERED: {
    label: "Delivered",
    className: "bg-emerald-600 text-white hover:bg-emerald-600",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-red-600 text-white hover:bg-red-600",
  },
};

const getNormalizedStatus = (status?: string): NormalizedStatus => {
  const normalized = status?.toUpperCase() || "PLACED";

  if (normalized === "CANCELLED" || normalized === "CANCELED") {
    return "CANCELLED";
  }

  if (normalized === "DELIVERED" || normalized === "COMPLETED") {
    return "DELIVERED";
  }

  if (normalized === "SHIPPED") {
    return "SHIPPED";
  }

  if (normalized === "PROCESSING") {
    return "PROCESSING";
  }

  return "PLACED";
};

const getCustomerText = (order: AdminOrder) => {
  return order.customer?.name || order.customer?.email || order.customerId || "N/A";
};

const getSellerText = (order: AdminOrder) => {
  const sellerName = order.items?.find((item) => item.medicine?.seller?.name)?.medicine?.seller?.name;

  if (sellerName) {
    return sellerName;
  }

  const sellerEmail = order.items?.find((item) => item.medicine?.seller?.email)?.medicine?.seller?.email;

  if (sellerEmail) {
    return sellerEmail.split("@")[0];
  }

  return "N/A";
};

export default function AdminOrdersPageContent({ initialOrders }: AdminOrdersPageContentProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const filteredOrders = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return initialOrders.filter((order) => {
      const normalizedStatus = getNormalizedStatus(order.status);
      const statusMatched = statusFilter === "ALL" ? true : normalizedStatus === statusFilter;

      if (!statusMatched) {
        return false;
      }

      if (!query) {
        return true;
      }

      const searchableText = [
        order.id,
        order.customerId,
        order.customer?.name,
        order.customer?.email,
        getSellerText(order),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [initialOrders, searchTerm, statusFilter]);

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search orders..."
            className="pl-9"
          />
        </div>

        <div className="w-full sm:ml-auto sm:w-44">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="PLACED">Placed</SelectItem>
              <SelectItem value="PROCESSING">Processing</SelectItem>
              <SelectItem value="SHIPPED">Shipped</SelectItem>
              <SelectItem value="DELIVERED">Delivered</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
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
                  <th className="px-4 py-4 text-sm font-medium text-muted-foreground">Seller</th>
                  <th className="px-4 py-4 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-4 text-sm font-medium text-muted-foreground">Total</th>
                  <th className="px-4 py-4 text-sm font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td className="px-4 py-10 text-sm text-muted-foreground" colSpan={6}>
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order, index) => {
                    const normalizedStatus = getNormalizedStatus(order.status);

                    return (
                      <tr key={order.id} className={index === filteredOrders.length - 1 ? "" : "border-b"}>
                        <td className="px-4 py-4 text-base font-medium">ORD-{String(index + 1).padStart(3, "0")}</td>
                        <td className="px-4 py-4 text-base">{getCustomerText(order)}</td>
                        <td className="px-4 py-4 text-base text-muted-foreground">{getSellerText(order)}</td>
                        <td className="px-4 py-4 text-base text-muted-foreground">{formatDate(order.createdAt)}</td>
                        <td className="px-4 py-4 text-base font-medium">BDT {currencyFormatter.format(order.totalAmount || 0)}</td>
                        <td className="px-4 py-4 text-base">
                          <Badge className={statusMeta[normalizedStatus].className}>{statusMeta[normalizedStatus].label}</Badge>
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
    </>
  );
}
