"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";

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

type AdminRecentUser = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  status?: string;
  createdAt?: string;
};

type AdminRecentUsersTableProps = {
  users: AdminRecentUser[];
};

const PAGE_SIZE = 5;

type RoleFilter = "ALL" | "CUSTOMER" | "SELLER" | "ADMIN";

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
    day: "2-digit",
    year: "numeric",
  });
};

const normalizeText = (value?: string) => {
  if (!value) {
    return "N/A";
  }

  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const getStatusVariant = (status?: string) => {
  const normalizedStatus = status?.toUpperCase();

  if (normalizedStatus === "ACTIVE") {
    return "default" as const;
  }

  if (normalizedStatus === "BANNED" || normalizedStatus === "SUSPENDED") {
    return "destructive" as const;
  }

  return "outline" as const;
};

const getDisplayName = (user: AdminRecentUser) => {
  if (user.name) {
    return user.name;
  }

  if (user.email) {
    return user.email.split("@")[0];
  }

  return "Unknown User";
};

export default function AdminRecentUsersTable({ users }: AdminRecentUsersTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return users.filter((user) => {
      const role = user.role?.toUpperCase() || "";
      const roleMatched = roleFilter === "ALL" ? true : role === roleFilter;

      if (!roleMatched) {
        return false;
      }

      if (!query) {
        return true;
      }

      const haystack = [user.name, user.email, user.role, user.status].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(query);
    });
  }, [users, searchTerm, roleFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, currentPage]);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xl">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-emerald-600 dark:text-emerald-300" />
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search recent users..."
            className="border-emerald-200/80 bg-emerald-50/60 pl-9 text-emerald-900 placeholder:text-emerald-700/70 dark:border-emerald-700/60 dark:bg-emerald-950/40 dark:text-emerald-100 dark:placeholder:text-emerald-300/70"
          />
        </div>

        <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as RoleFilter)}>
          <SelectTrigger className="w-full border-emerald-200/80 bg-emerald-50/60 text-emerald-800 dark:border-emerald-700/60 dark:bg-emerald-950/40 dark:text-emerald-100 sm:w-40">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Roles</SelectItem>
            <SelectItem value="CUSTOMER">Customer</SelectItem>
            <SelectItem value="SELLER">Seller</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-170 w-full border-collapse text-left">
          <thead>
            <tr className="border-b">
              <th className="px-3 py-2 text-xs font-medium whitespace-nowrap text-muted-foreground sm:text-sm">Name</th>
              <th className="px-3 py-2 text-xs font-medium whitespace-nowrap text-muted-foreground sm:text-sm">Email</th>
              <th className="px-3 py-2 text-xs font-medium whitespace-nowrap text-muted-foreground sm:text-sm">Role</th>
              <th className="px-3 py-2 text-xs font-medium whitespace-nowrap text-muted-foreground sm:text-sm">Status</th>
              <th className="px-3 py-2 text-xs font-medium whitespace-nowrap text-muted-foreground sm:text-sm">Joined</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length === 0 ? (
              <tr>
                <td className="px-3 py-8 text-sm text-muted-foreground" colSpan={5}>
                  No users found.
                </td>
              </tr>
            ) : (
              paginatedUsers.map((user, index) => (
                <tr key={`${user.id || user.email || "user"}-${index}`} className="border-b last:border-0">
                  <td className="px-3 py-3 text-sm font-medium whitespace-nowrap sm:text-base">{getDisplayName(user)}</td>
                  <td className="px-3 py-3 text-sm text-muted-foreground whitespace-nowrap sm:text-base">{user.email || "N/A"}</td>
                  <td className="px-3 py-3">
                    <Badge variant="secondary">{normalizeText(user.role)}</Badge>
                  </td>
                  <td className="px-3 py-3">
                    <Badge variant={getStatusVariant(user.status)}>{normalizeText(user.status)}</Badge>
                  </td>
                  <td className="px-3 py-3 text-sm text-muted-foreground whitespace-nowrap sm:text-base">{formatDate(user.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <TablePagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
}
