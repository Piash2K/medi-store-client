"use client"

import * as React from "react"
import {
  House,
  LayoutDashboard,
  Package,
  Tags,
  Pill,
  Users,
  ShoppingBag,
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
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    url: "/users",
    icon: Users,
  },
  {
    title: "Orders",
    url: "/admin/orders",
    icon: Package,
  },
  {
    title: "Categories",
    url: "/admin/categories",
    icon: Tags,
  },
  {
    title: "Medicines",
    url: "/admin/medicines",
    icon: Pill,
  },
  {
    title: "Home",
    url: "/",
    icon: House,
    separatorBefore: true,
  },
]

const sellerNavMain: NavMainItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: ShoppingBag,
  },
  {
    title: "Medicines",
    url: "/medicines",
    icon: Pill,
  },
  {
    title: "Orders",
    url: "/seller/orders",
    icon: Package,
  },
  {
    title: "Home",
    url: "/",
    icon: House,
    separatorBefore: true,
  },
]

const customerNavMain: NavMainItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Order Status",
    url: "/orders-status",
    icon: Package,
  },
  {
    title: "Home",
    url: "/",
    icon: House,
    separatorBefore: true,
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
  const panelLabelByRole: Record<AppSidebarProps["UserRole"], string> = {
    ADMIN: "ADMIN PANEL",
    SELLER: "SELLER PANEL",
    CUSTOMER: "CUSTOMER PANEL",
  }

  const navItems = navItemsByRole[UserRole]
  const panelLabel = panelLabelByRole[UserRole]

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <div className="text-muted-foreground px-4 pb-2 pt-4 text-xs font-semibold tracking-wider">
          {panelLabel}
        </div>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
