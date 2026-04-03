import {  AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { SyncUser } from "@/lib/actions/user"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard | QueryMe",
  description:
    "Access your AI-powered SQL workspace. Query databases using natural language, manage results, and explore data securely.",
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    await SyncUser() // Ensure the clerk user is synced with your database before rendering the dashboard
    return (
      <SidebarProvider>
        <AppSidebar />
  
        <SidebarInset>
          {/* HEADER */}
          <header className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
  
              <Separator orientation="vertical" className="mr-2 h-4" />
  
              {/* You can later make this dynamic */}
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage>Dashboard</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
  
          {/* DYNAMIC CONTENT */}
          <div className="flex flex-1 flex-col p-4 pt-0">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }