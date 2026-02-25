"use client";

import Link from "next/link";
import { Menu, ShoppingCart } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
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
  description?: string;
  items?: MenuItem[];
}

const menu: MenuItem[] = [
  { title: "Home", url: "/" },
  {
    title: "Shop",
    url: "/shop",
    items: [
      {
        title: "All Medicines",
        description: "Browse all available OTC medicines",
        url: "/shop",
      },
      {
        title: "Track Orders",
        description: "View order progress and delivery status",
        url: "/orders",
      },
    ],
  },
  { title: "Track Order", url: "/orders" },
];

export function Navbar() {
  const [user, setUser] = useState(null);
  const { totalItems } = useCart();
  console.log(user);

  useEffect(() => {
    const getCurrentUser = async () => {
      const userData = await getUser();
      setUser(userData);
    };
    getCurrentUser();
  }, []);

  const handleLogOut = async () => {
    logOut();
    setUser(null);
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
                {menu.map((item) =>
                  item.items ? (
                    <NavigationMenuItem key={item.title}>
                      <NavigationMenuTrigger>
                        {item.title}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent className="bg-popover text-popover-foreground">
                        <ul className="grid w-[320px] gap-1 p-2">
                          {item.items.map((subItem) => (
                            <li key={subItem.title}>
                              <NavigationMenuLink asChild>
                                <Link
                                  href={subItem.url}
                                  className="block rounded-md p-3 leading-none no-underline transition-colors hover:bg-muted"
                                >
                                  <div className="text-sm font-semibold">
                                    {subItem.title}
                                  </div>
                                  {subItem.description && (
                                    <p className="text-sm leading-snug text-muted-foreground">
                                      {subItem.description}
                                    </p>
                                  )}
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  ) : (
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
                  ),
                )}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <div className="flex items-center gap-2">
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

            {user ? (
              <Button onClick={handleLogOut}>Logout</Button>
            ) : (
              <>
                <Button asChild variant="outline" size="sm">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/register">Register</Link>
                </Button>
              </>
            )}
          </div>
        </nav>

        <div className="flex h-16 items-center justify-between lg:hidden">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              MediStore 💊
            </Link>
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
          </div>

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
                <Accordion
                  type="single"
                  collapsible
                  className="flex w-full flex-col gap-2"
                >
                  {menu.map((item) =>
                    item.items ? (
                      <AccordionItem
                        key={item.title}
                        value={item.title}
                        className="border-b-0"
                      >
                        <AccordionTrigger className="py-2 text-base font-semibold hover:no-underline">
                          {item.title}
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="flex flex-col gap-1">
                            {item.items.map((subItem) => (
                              <Link
                                key={subItem.title}
                                href={subItem.url}
                                className="rounded-md p-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                              >
                                {subItem.title}
                              </Link>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ) : (
                      <Link
                        key={item.title}
                        href={item.url}
                        className="text-base font-semibold"
                      >
                        {item.title}
                      </Link>
                    ),
                  )}
                </Accordion>

                {user ? (
                  <Button onClick={handleLogOut}>Logout</Button>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link
                      href="/login"
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "w-full",
                      )}
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className={cn(buttonVariants(), "w-full")}
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
