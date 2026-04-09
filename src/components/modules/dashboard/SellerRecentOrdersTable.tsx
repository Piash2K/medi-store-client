"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TablePagination from "@/components/shared/table-pagination";

type RecentOrder = {
  id: string;
  createdAt: string;
  totalAmount: number;
  status: string;
  customer?: {
    id?: string;
    name?: string;
    email?: string;
  };
  customerId?: string;
  items?: Array<{
    medicine?: {
      name?: string;
    };
    quantity: number;
  }>;
};

type SellerRecentOrdersTableProps = {
  orders: RecentOrder[];
};

type StatusFilter = "ALL" | "PLACED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

const PAGE_SIZE = 5;

const currencyFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const getStatusVariant = (status?: string) => {
  const normalized = status?.toUpperCase() || "PLACED";

  if (normalized === "DELIVERED" || normalized === "SHIPPED") {
    return "default" as const;
  }

  if (normalized === "PLACED") {
    return "secondary" as const;
  }

  return "outline" as const;
};

const getCustomerName = (order: RecentOrder) => {
  return order.customer?.name || order.customer?.email || order.customerId || "Customer";
};

const getOrderItemsLabel = (order: RecentOrder) => {
  if (!order.items?.length) {
    return "No items";
  }

  return order.items.map((item) => `${item.medicine?.name || "Medicine"} x${item.quantity}`).join(", ");
};

export default function SellerRecentOrdersTable({ orders }: SellerRecentOrdersTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredOrders = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return orders.filter((order) => {
      const status = order.status?.toUpperCase() || "PLACED";
      const statusMatched = statusFilter === "ALL" ? true : status === statusFilter;

      if (!statusMatched) {
        return false;
      }

      if (!query) {
        return true;
      }

      const haystack = [order.id, order.customer?.name, order.customer?.email, getOrderItemsLabel(order)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [orders, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedOrders = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredOrders.slice(start, start + PAGE_SIZE);
  }, [filteredOrders, safeCurrentPage]);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="w-full sm:max-w-xl">
          <Input
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search recent orders..."
            className="border-emerald-200/80 bg-emerald-50/60 text-emerald-900 placeholder:text-emerald-700/70 dark:border-emerald-700/60 dark:bg-emerald-950/40 dark:text-emerald-100 dark:placeholder:text-emerald-300/70"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value as StatusFilter);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-full border-emerald-200/80 bg-emerald-50/60 text-emerald-800 dark:border-emerald-700/60 dark:bg-emerald-950/40 dark:text-emerald-100 sm:w-44">
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

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b">
              <th className="px-3 py-2 text-sm font-medium text-muted-foreground">Order ID</th>
              <th className="px-3 py-2 text-sm font-medium text-muted-foreground">Customer</th>
              <th className="px-3 py-2 text-sm font-medium text-muted-foreground">Items</th>
              <th className="px-3 py-2 text-sm font-medium text-muted-foreground">Total</th>
              <th className="px-3 py-2 text-sm font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-sm text-muted-foreground">
                  No recent orders available.
                </td>
              </tr>
            ) : (
              paginatedOrders.map((order, index) => (
                <tr key={order.id} className={index === paginatedOrders.length - 1 ? "" : "border-b"}>
                  <td className="px-3 py-3 text-base font-medium whitespace-nowrap">ORD-{String(index + 1).padStart(3, "0")}</td>
                  <td className="px-3 py-3 text-base whitespace-nowrap max-w-40 truncate">{getCustomerName(order)}</td>
                  <td className="px-3 py-3 text-base max-w-56 truncate whitespace-nowrap md:whitespace-normal md:max-w-xs">{getOrderItemsLabel(order)}</td>
                  <td className="px-3 py-3 text-base font-medium whitespace-nowrap">BDT {currencyFormatter.format(order.totalAmount)}</td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <TablePagination currentPage={safeCurrentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
}
