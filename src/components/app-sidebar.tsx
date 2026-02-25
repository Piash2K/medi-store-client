"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Pill,
  ShoppingBag,
  ShoppingCart,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarRail,
} from "@/components/ui/sidebar"

type NavMainItems = React.ComponentProps<typeof NavMain>["items"]

const adminNavMain: NavMainItems = [
  {
    title: "Admin Panel",
    url: "/admin",
    icon: LayoutDashboard,
    isActive: true,
    items: [
      {
        title: "Dashboard",
        url: "/admin",
      },
      {
        title: "Users",
        url: "/admin/users",
      },
      {
        title: "Orders",
        url: "/admin/orders",
      },
      {
        title: "Categories",
        url: "/admin/categories",
      },
    ],
  },
]

const sellerNavMain: NavMainItems = [
  {
    title: "Seller Panel",
    url: "/seller/dashboard",
    icon: ShoppingBag,
    isActive: true,
    items: [
      {
        title: "Dashboard",
        url: "/seller/dashboard",
      },
      {
        title: "Medicines",
        url: "/seller/medicines",
      },
      {
        title: "Orders",
        url: "/seller/orders",
      },
      {
        title: "Stock",
        url: "/seller/medicines",
      },
    ],
  },
]

const customerNavMain: NavMainItems = [
  {
    title: "Customer",
    url: "/shop",
    icon: Pill,
    isActive: true,
    items: [
      {
        title: "Shop",
        url: "/shop",
      },
      {
        title: "Cart",
        url: "/cart",
      },
      {
        title: "Checkout",
        url: "/checkout",
      },
      {
        title: "My Orders",
        url: "/orders",
      },
      {
        title: "Profile",
        url: "/profile",
      },
    ],
  },
  {
    title: "Quick Access",
    url: "/",
    icon: ShoppingCart,
    items: [
      {
        title: "Home",
        url: "/",
      },
      {
        title: "Shop",
        url: "/shop",
      },
    ],
  },
]

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  UserRole: "ADMIN" | "SELLER" | "CUSTOMER"
}

export function AppSidebar({ UserRole, ...props }: AppSidebarProps) {
  const navItemsByRole: Record<AppSidebarProps["UserRole"], NavMainItems> = {
    ADMIN: adminNavMain,
    SELLER: sellerNavMain,
    CUSTOMER: customerNavMain,
  }

  const navItems = navItemsByRole[UserRole]

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
