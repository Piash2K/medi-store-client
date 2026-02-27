"use client";

import { useMemo, useState } from "react";
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
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [updatingUserId, setUpdatingUserId] = useState("");

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
    <section className="space-y-6 p-1">
      <h1 className="text-3xl font-semibold tracking-tight">Manage Users</h1>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xl">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search users..."
            className="pl-9"
          />
        </div>

        <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as RoleFilter)}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Roles</SelectItem>
            <SelectItem value="CUSTOMER">Customer</SelectItem>
            <SelectItem value="SELLER">Seller</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-4 text-sm font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-4 text-sm font-medium text-muted-foreground">Email</th>
                  <th className="px-4 py-4 text-sm font-medium text-muted-foreground">Role</th>
                  <th className="px-4 py-4 text-sm font-medium text-muted-foreground">Orders</th>
                  <th className="px-4 py-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-4 text-sm font-medium text-muted-foreground">Joined</th>
                  <th className="px-4 py-4 text-right text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td className="px-4 py-10 text-sm text-muted-foreground" colSpan={7}>
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const isBanned = isUserBanned(user.status);
                    const isUpdating = updatingUserId === user.id;

                    return (
                      <tr key={user.id || user.email} className="border-b last:border-0">
                        <td className="px-4 py-4 text-base font-medium">{getDisplayName(user)}</td>
                        <td className="px-4 py-4 text-base text-muted-foreground">{user.email || "N/A"}</td>
                        <td className="px-4 py-4">
                          <Badge variant="secondary">{normalizeText(user.role)}</Badge>
                        </td>
                        <td className="px-4 py-4 text-base">{user.ordersCount || 0}</td>
                        <td className="px-4 py-4">
                          <Badge variant={getStatusVariant(user.status)}>{getStatusLabel(user.status)}</Badge>
                        </td>
                        <td className="px-4 py-4 text-base text-muted-foreground">{formatDate(user.createdAt)}</td>
                        <td className="px-4 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={isBanned ? "text-emerald-600 hover:text-emerald-700" : "text-red-600 hover:text-red-700"}
                            onClick={() => handleToggleUserStatus(user)}
                            disabled={isUpdating || !user.id}
                          >
                            {isBanned ? (
                              <>
                                <CheckCircle2 className="h-4 w-4" />
                                Unban
                              </>
                            ) : (
                              <>
                                <Ban className="h-4 w-4" />
                                Ban
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
        </CardContent>
      </Card>
    </section>
  );
}
