"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronsUpDown, LogOut, User } from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getMyProfile, getUser, logOut } from "@/services/auth";

const getUserName = (user: unknown) => {
  const userData = user as Record<string, unknown> | null;
  return (userData?.name as string | undefined) || (userData?.email as string | undefined) || "User";
};

const getUserEmail = (user: unknown) => {
  const userData = user as Record<string, unknown> | null;
  return (userData?.email as string | undefined) || "";
};

const getUserImage = (user: unknown) => {
  const userData = user as Record<string, unknown> | null;

  return (
    (userData?.image as string | undefined) ||
    (userData?.profileImage as string | undefined) ||
    (userData?.avatar as string | undefined) ||
    (userData?.photoURL as string | undefined) ||
    ""
  );
};

const getInitials = (name: string) => {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) {
    return "U";
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
};

export function DashboardUserMenu() {
  const router = useRouter();
  const [user, setUser] = useState<unknown>(null);

  useEffect(() => {
    const loadCurrentUser = async () => {
      const [userData, profileResult] = await Promise.all([getUser(), getMyProfile()]);

      if (profileResult.success && profileResult.data) {
        setUser({
          ...(userData as Record<string, unknown> | null),
          profileImage: profileResult.data.profileImage || "",
        });
        return;
      }

      setUser(userData);
    };

    loadCurrentUser();
  }, []);

  const handleLogout = async () => {
    try {
      await logOut();
      toast.success("Logged out successfully");
      router.push("/login");
      router.refresh();
    } catch {
      await Swal.fire({
        icon: "error",
        title: "Logout failed",
        text: "Failed to logout. Please try again.",
      });
    }
  };

  if (!user) {
    return (
      <Button asChild variant="outline" size="sm">
        <Link href="/login">Login</Link>
      </Button>
    );
  }

  const userName = getUserName(user);
  const userEmail = getUserEmail(user);
  const userImage = getUserImage(user);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-10 gap-2 rounded-full border border-transparent px-2.5 hover:border-border hover:bg-muted/60"
          aria-label="Open profile menu"
        >
          <Avatar className="h-8 w-8 rounded-full">
            {userImage ? <AvatarImage src={userImage} alt={userName} /> : null}
            <AvatarFallback className="bg-muted text-foreground rounded-full text-xs font-semibold">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden min-w-0 text-left sm:block">
            <p className="truncate text-sm font-medium leading-tight">{userName}</p>
            <p className="text-muted-foreground truncate text-xs leading-tight">Account</p>
          </div>
          <ChevronsUpDown className="text-muted-foreground hidden h-4 w-4 sm:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 rounded-xl p-1.5">
        <DropdownMenuLabel className="rounded-lg bg-muted/50 p-2.5">
          <p className="truncate text-sm font-medium">{userName}</p>
          {userEmail ? <p className="text-muted-foreground truncate text-xs">{userEmail}</p> : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer rounded-md">
          <Link href="/profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleLogout} className="cursor-pointer rounded-md text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
