"use client"

import * as React from "react"

import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Database, MapIcon, Plus, Settings } from "lucide-react"


const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navbar: [
    {
      name: "New Chat",
      url: "/dashboard",
      icon: (
        <Plus
        />
      ),
    },
    {
      name: "Databases",
      url: "/dashboard/databases",
      icon: (
        <Database
        />
      ),
    },
    {
      name: "History",
      url: "/dashboard/history",
      icon: (
        <MapIcon
        />
      ),
    },
    {
      name: "Settings",
      url: "/dashboard/settings",
      icon: (
        <Settings
        />
      ),
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  
  return (
    <Sidebar collapsible="icon" {...props}>
      
      <SidebarContent>
        <NavProjects projects={data.navbar} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
