"use client"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Separator } from '@/components/ui/separator';
import Link from "next/link";

export function NavProjects({
  projects,
}: {
  projects: {
    name: string
    url: string
    icon: React.ReactNode
  }[]
}) {

  return (
    <SidebarGroup>
      <SidebarGroupLabel><span>&gt;</span>_ QueryMe</SidebarGroupLabel>
      <Separator orientation="horizontal"  className="mb-4"/>
      <SidebarMenu>
        {projects.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild tooltip={item.name}>
              <Link href={item.url}>
                {item.icon}
                {/* 👇 THIS LINE HANDLES COLLAPSE MAGIC */}
                <span className="group-data-[collapsible=icon]:hidden truncate">
                  {item.name}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
