"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { type LucideIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    separatorBefore?: boolean
  }[]
}) {
  const pathname = usePathname()

  const isItemActive = (url: string, fallbackActive?: boolean) => {
    if (url === "/") {
      return pathname === "/"
    }

    if (pathname === url || pathname.startsWith(`${url}/`)) {
      return true
    }

    return Boolean(fallbackActive)
  }

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          <div key={item.title}>
            {item.separatorBefore && <SidebarSeparator className="my-2" />}
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={item.title} isActive={isItemActive(item.url, item.isActive)}>
                <Link href={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </div>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
