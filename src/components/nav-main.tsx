"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMemo } from "react"
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
    separatorBefore?: boolean
  }[]
}) {
  const pathname = usePathname()

  const activeUrl = useMemo(() => {
    const exactMatch = items.find((item) => item.url === pathname)
    if (exactMatch) {
      return exactMatch.url
    }

    const prefixMatches = items
      .filter((item) => item.url !== "/" && pathname.startsWith(`${item.url}/`))
      .sort((firstItem, secondItem) => secondItem.url.length - firstItem.url.length)

    if (prefixMatches.length > 0) {
      return prefixMatches[0].url
    }

    return pathname === "/" ? "/" : ""
  }, [items, pathname])

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = item.url === activeUrl

          return (
            <div key={item.title}>
              {item.separatorBefore && <SidebarSeparator className="my-2" />}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isActive}
                  className={
                    isActive
                      ? "bg-sidebar-primary! text-sidebar-primary-foreground! font-semibold! ring-1! ring-sidebar-ring! shadow-sm hover:bg-sidebar-primary! hover:text-sidebar-primary-foreground! active:bg-sidebar-primary! active:text-sidebar-primary-foreground!"
                      : undefined
                  }
                >
                  <Link href={item.url} prefetch={true}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </div>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
