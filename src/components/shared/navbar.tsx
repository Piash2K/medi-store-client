"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useEffect, useState } from "react";
import { getUser, logOut } from "@/services/auth";
import { useCart } from "@/providers/cart-provider";

interface MenuItem {
  title: string;
  url: string;
}

const baseMenu: MenuItem[] = [
  { title: "Home", url: "/" },
  { title: "Shop", url: "/shop" },
];

const isCustomerUser = (user: unknown) => {
  const role = (user as { role?: string } | null)?.role;
  return role?.toUpperCase() === "CUSTOMER";
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
          <Link href="/profile">Profile</Link>
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
  const [user, setUser] = useState(null);
  const { totalItems } = useCart();
  const canShowCart = !user || isCustomerUser(user);

  const menu = isCustomerUser(user)
    ? [...baseMenu, { title: "Track Order", url: "/orders" }]
    : baseMenu;

  useEffect(() => {
    const getCurrentUser = async () => {
      const userData = await getUser();
      setUser(userData);
    };
    getCurrentUser();
  }, []);

  const handleLogout = async () => {
    await logOut();
    setUser(null);
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto w-full  px-4 sm:px-6 lg:px-8">
        <nav className="hidden h-16 items-center justify-between lg:flex">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              MediStore 💊
            </Link>
          </div>
          <div>
            <NavigationMenu>
              <NavigationMenuList>
                {menu.map((item) => (
                  <NavigationMenuItem key={item.title}>
                    <NavigationMenuLink asChild>
                      <Link
                        href={item.url}
                        className={navigationMenuTriggerStyle()}
                      >
                        {item.title}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <div className="flex items-center gap-2">
            {canShowCart ? (
              <Button asChild variant="ghost" size="icon" className="relative" aria-label="Cart">
                <Link href="/cart">
                  <ShoppingCart className="size-5" />
                  {totalItems > 0 && (
                    <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-semibold">
                      {totalItems}
                    </span>
                  )}
                </Link>
              </Button>
            ) : null}
            <UserMenu user={user} onLogout={handleLogout} />
          </div>
        </nav>

        <div className="flex h-16 items-center justify-between lg:hidden">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              MediStore 💊
            </Link>
            {canShowCart ? (
              <Button asChild variant="ghost" size="icon" className="relative" aria-label="Cart">
                <Link href="/cart">
                  <ShoppingCart className="size-5" />
                  {totalItems > 0 && (
                    <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-semibold">
                      {totalItems}
                    </span>
                  )}
                </Link>
              </Button>
            ) : null}
          </div>

          <div className="flex items-center gap-1">
            <UserMenu user={user} onLogout={handleLogout} />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Open menu">
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
              <SheetHeader>
                <SheetTitle>
                  <Link
                    href="/"
                    className="text-lg font-semibold tracking-tight"
                  >
                    MediStore 💊
                  </Link>
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col gap-6 p-4">
                <div className="flex w-full flex-col gap-2">
                  {menu.map((item) => (
                    <Link
                      key={item.title}
                      href={item.url}
                      className="text-base font-semibold"
                    >
                      {item.title}
                    </Link>
                  ))}
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
