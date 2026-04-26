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

type appSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user: {
    name: string;
    email: string | undefined;
    avatar: string | undefined;
  }
}

export function AppSidebar({user, ...props }: appSidebarProps ) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <NavProjects projects={data.navbar} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
