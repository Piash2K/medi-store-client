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
                      ? "bg-[#006a63]! text-white! font-bold! transition-colors hover:bg-[#5bdacf]! hover:text-[#00201d]! dark:bg-teal-600! dark:text-white! dark:hover:bg-teal-700! dark:hover:text-white!"
                      : "text-[#3c4947] font-semibold transition-colors hover:bg-[#006a63]/5 hover:text-[#006a63] dark:text-slate-400 dark:hover:bg-teal-950/30 dark:hover:text-teal-300"
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
