"use client";

import { useEffect, useMemo, useState } from "react";
import { Ban, CheckCircle2, Search } from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TablePagination from "@/components/shared/table-pagination";
import { AdminUser, updateAdminUserStatus } from "@/services/admin";

type AdminUsersPageContentProps = {
  initialUsers: (AdminUser & { ordersCount: number })[];
};

type RoleFilter = "ALL" | "CUSTOMER" | "SELLER";

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

  if (normalizedStatus === "ACTIVE" || normalizedStatus === "UNBAN") {
    return "default" as const;
  }

  if (normalizedStatus === "BANNED" || normalizedStatus === "BAN" || normalizedStatus === "SUSPENDED") {
    return "destructive" as const;
  }

  return "outline" as const;
};

const isUserBanned = (status?: string) => {
  const normalizedStatus = status?.toUpperCase();
  return normalizedStatus === "BANNED" || normalizedStatus === "BAN" || normalizedStatus === "SUSPENDED";
};

const getStatusLabel = (status?: string) => {
  return isUserBanned(status) ? "Banned" : "Active";
};

const getDisplayName = (user: AdminUser) => {
  if (user.name?.trim()) {
    return user.name;
  }

  if (user.email) {
    return user.email.split("@")[0];
  }

  return "Unknown User";
};

export default function AdminUsersPageContent({ initialUsers }: AdminUsersPageContentProps) {
  const PAGE_SIZE = 8;
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [updatingUserId, setUpdatingUserId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return users.filter((user) => {
      const normalizedRole = user.role?.toUpperCase() || "";
      const roleMatched = roleFilter === "ALL" ? true : normalizedRole === roleFilter;

      if (!roleMatched) {
        return false;
      }

      if (!query) {
        return true;
      }

      const haystack = `${user.name || ""} ${user.email || ""}`.toLowerCase();
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
  }, [filteredUsers, currentPage, PAGE_SIZE]);

  const handleToggleUserStatus = async (user: AdminUser & { ordersCount: number }) => {
    if (!user.id) {
      await Swal.fire({
        icon: "error",
        title: "Invalid user",
        text: "Invalid user id",
      });
      return;
    }

    const nextStatus: "BAN" | "UNBAN" = isUserBanned(user.status) ? "UNBAN" : "BAN";

    const confirmation = await Swal.fire({
      title: nextStatus === "BAN" ? "Ban user?" : "Unban user?",
      text:
        nextStatus === "BAN"
          ? `This will restrict ${getDisplayName(user)} from using the platform.`
          : `This will restore ${getDisplayName(user)} access to the platform.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: nextStatus === "BAN" ? "Yes, ban" : "Yes, unban",
      cancelButtonText: "Cancel",
      focusCancel: true,
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    setUpdatingUserId(user.id);

    const result = await updateAdminUserStatus(user.id, nextStatus);

    setUpdatingUserId("");

    if (!result.success) {
      await Swal.fire({
        icon: "error",
        title: "Update failed",
        text: result.message || "Failed to update user status",
      });
      return;
    }

    setUsers((previous) =>
      previous.map((item) => {
        if (item.id !== user.id) {
          return item;
        }

        return {
          ...item,
          status: result.data?.status || (nextStatus === "BAN" ? "BANNED" : "ACTIVE"),
          updatedAt: result.data?.updatedAt || item.updatedAt,
        };
      }),
    );

    toast.success(result.message || "User status updated");
  };

  return (
    <section className="space-y-6 rounded-xl bg-linear-to-b from-emerald-50/25 to-background p-1 dark:from-emerald-950/10">
      <h1 className="text-3xl font-semibold tracking-tight text-emerald-700 dark:text-emerald-300">Manage Users</h1>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative w-full sm:max-w-xl">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-emerald-600 dark:text-emerald-300" />
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search users..."
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
          </SelectContent>
        </Select>
      </div>

      <Card className="border border-border/70 bg-card shadow-sm">
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <table className="min-w-175 w-full border-collapse text-left text-sm sm:text-base">
              <thead>
                <tr className="border-b bg-emerald-50/60 dark:bg-emerald-950/20">
                  <th className="px-4 py-4 font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-4 font-medium text-muted-foreground">Email</th>
                  <th className="px-4 py-4 font-medium text-muted-foreground">Role</th>
                  <th className="px-4 py-4 font-medium text-muted-foreground">Orders</th>
                  <th className="px-4 py-4 font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-4 font-medium text-muted-foreground">Joined</th>
                  <th className="px-4 py-4 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td className="px-4 py-10 text-sm text-muted-foreground" colSpan={7}>
                      No users found.
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => {
                    const isBanned = isUserBanned(user.status);
                    const isUpdating = updatingUserId === user.id;

                    return (
                      <tr key={user.id || user.email} className="border-b last:border-0 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/10">
                        <td className="px-4 py-4 font-medium break-all max-w-40">{getDisplayName(user)}</td>
                        <td className="px-4 py-4 text-muted-foreground break-all max-w-50">{user.email || "N/A"}</td>
                        <td className="px-4 py-4">
                          <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100 dark:bg-slate-500/25 dark:text-slate-200 dark:hover:bg-slate-500/25">{normalizeText(user.role)}</Badge>
                        </td>
                        <td className="px-4 py-4">{user.ordersCount || 0}</td>
                        <td className="px-4 py-4">
                          <Badge variant={getStatusVariant(user.status)}>{getStatusLabel(user.status)}</Badge>
                        </td>
                        <td className="px-4 py-4 text-muted-foreground">{formatDate(user.createdAt)}</td>
                        <td className="px-4 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={
                              isBanned
                                ? "text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/40 dark:hover:text-emerald-200"
                                : "text-rose-700 hover:bg-rose-100 hover:text-rose-800 dark:text-rose-300 dark:hover:bg-rose-900/35 dark:hover:text-rose-200"
                            }
                            onClick={() => handleToggleUserStatus(user)}
                            disabled={isUpdating || !user.id}
                          >
                            {isBanned ? (
                              <>
                                <CheckCircle2 className="h-4 w-4" />
                                <span className="hidden xs:inline">Unban</span>
                              </>
                            ) : (
                              <>
                                <Ban className="h-4 w-4" />
                                <span className="hidden xs:inline">Ban</span>
                              </>
                            )}
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <TablePagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </CardContent>
      </Card>
    </section>
  );
}
