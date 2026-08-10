"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, ShoppingCart, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { getMyProfile, getUser, logOut } from "@/services/auth";
import { ThemeToggle } from "@/components/shared/theme-toggle";

interface MenuItem {
  title: string;
  url: string;
}

const primaryBaseMenu: MenuItem[] = [
  { title: "Home", url: "/" },
  { title: "Shop", url: "/shop" },
  { title: "About", url: "/about" },
  { title: "Help", url: "/help" },
  { title: "Contact", url: "/contact" },
];

const customerPrimaryMenu: MenuItem[] = [
  { title: "Track Order", url: "/orders" },
];

const utilityMenu: MenuItem[] = [
  { title: "Cart", url: "/cart" },
];

const isCustomerUser = (user: unknown) => {
  const role = (user as { role?: string } | null)?.role;
  return role?.toUpperCase() === "CUSTOMER";
};

const isSellerOrAdminUser = (user: unknown) => {
  const role = (user as { role?: string } | null)?.role?.toUpperCase();
  return role === "SELLER" || role === "ADMIN";
};

const getUserName = (user: unknown) => {
  const userData = user as Record<string, unknown> | null;
  return (userData?.name as string | undefined) || (userData?.email as string | undefined) || "User";
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

function UserMenu({ user, onLogout }: { user: unknown; onLogout: () => void }) {
  const userName = getUserName(user);
  const userImage = getUserImage(user);

  if (!user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full" aria-label="Account menu">
            <User className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem asChild>
            <Link href="/login">Login</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/register">Register</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full p-0" aria-label="User menu">
          <Avatar size="default" className="h-8 w-8 overflow-hidden rounded-full">
            {userImage ? <AvatarImage src={userImage} alt={userName} /> : null}
            <AvatarFallback className="bg-muted-foreground/20 text-foreground ring-border rounded-full text-xs font-semibold ring-1">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="truncate">{userName}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" prefetch={true}>Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard">Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onLogout}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  const primaryMenu = isCustomerUser(user)
    ? [...primaryBaseMenu, ...customerPrimaryMenu]
    : primaryBaseMenu;
  const utilityMenuItems = isSellerOrAdminUser(user) ? [] : utilityMenu;

  const isActivePath = (url: string) => {
    if (url === "/") {
      return pathname === "/";
    }

    return pathname === url || pathname.startsWith(`${url}/`);
  };

  useEffect(() => {
    const getCurrentUser = async () => {
      const [userData, profileResult] = await Promise.all([getUser(), getMyProfile()]);

      if (profileResult.success && profileResult.data) {
        setUser({
          ...(userData as Record<string, unknown> | null),
          profileImage: profileResult.data.profileImage || "",
        } as never);
        return;
      }

      setUser(userData);
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    router.prefetch("/profile");

    if (isCustomerUser(user)) {
      router.prefetch("/orders");
    }
  }, [user, router]);

  const handleLogout = async () => {
    try {
      await logOut();
      setUser(null);
      toast.success("Logged out successfully");
      router.refresh();
    } catch {
      await Swal.fire({
        icon: "error",
        title: "Logout failed",
        text: "Failed to logout. Please try again.",
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md transition-all">
      <div className="home-shell">
        {/* Desktop Navbar */}
        <nav className="hidden h-16 items-center justify-between lg:flex">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight transition-opacity hover:opacity-90">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400 font-bold text-lg">
                💊
              </span>
              <span className="text-foreground">
                Medi<span className="text-teal-600 dark:text-teal-400">Store</span>
              </span>
            </Link>
          </div>

          <div className="flex h-full items-center">
            <NavigationMenu className="h-full">
              <NavigationMenuList className="flex h-full gap-1">
                {primaryMenu.map((item) => (
                  <NavigationMenuItem key={item.title} className="h-full">
                    <NavigationMenuLink asChild>
                      <Link
                        href={item.url}
                        className={`relative flex h-16 items-center px-3.5 text-sm font-medium transition-colors focus-visible:outline-none ${
                          isActivePath(item.url)
                            ? "text-teal-600 font-semibold dark:text-teal-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-teal-600 dark:after:bg-teal-400"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {item.title}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex items-center gap-3">
            {utilityMenuItems.map((item) => (
              <Button
                key={item.title}
                asChild
                variant={isActivePath(item.url) ? "default" : "outline"}
                size="sm"
                className={
                  isActivePath(item.url)
                    ? "h-9 bg-teal-600 text-white hover:bg-teal-700 px-4 shadow-sm"
                    : "h-9 border-teal-500/30 text-teal-700 hover:bg-teal-50 dark:border-teal-500/40 dark:text-teal-300 dark:hover:bg-teal-950/50 px-4"
                }
              >
                <Link href={item.url} className="inline-flex items-center gap-2 font-medium">
                  <ShoppingCart className="h-4 w-4" />
                  {item.title}
                </Link>
              </Button>
            ))}
            <UserMenu user={user} onLogout={handleLogout} />
            <ThemeToggle />
          </div>
        </nav>

        {/* Mobile Navbar */}
        <div className="flex h-16 items-center justify-between lg:hidden">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400">
              💊
            </span>
            <span>
              Medi<span className="text-teal-600 dark:text-teal-400">Store</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <UserMenu user={user} onLogout={handleLogout} />
            <ThemeToggle />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9" aria-label="Open menu">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>
                    <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400">
                        💊
                      </span>
                      <span>
                        Medi<span className="text-teal-600 dark:text-teal-400">Store</span>
                      </span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-6 p-4">
                  <div className="space-y-3">
                    <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                      Main Navigation
                    </p>
                    <div className="flex w-full flex-col gap-2">
                      {primaryMenu.map((item) => (
                        <Link
                          key={item.title}
                          href={item.url}
                          prefetch={true}
                          className={`text-base font-semibold transition-colors py-1 ${
                            isActivePath(item.url)
                              ? "text-teal-600 dark:text-teal-400"
                              : "text-foreground/90"
                          }`}
                        >
                          {item.title}
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                      Quick Access
                    </p>
                    <div className="flex w-full flex-col gap-2">
                      {utilityMenuItems.map((item) => (
                        <Link
                          key={item.title}
                          href={item.url}
                          prefetch={true}
                          className={`inline-flex items-center gap-2 rounded-md px-1 py-1 text-base font-semibold transition-colors ${
                            isActivePath(item.url)
                              ? "text-teal-600 dark:text-teal-400"
                              : "text-foreground/90"
                          }`}
                        >
                          <ShoppingCart className="h-4 w-4" />
                          {item.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
