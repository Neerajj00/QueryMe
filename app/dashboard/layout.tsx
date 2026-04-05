import {  AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { getUser, SyncUser } from "@/lib/actions/user"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard | QueryMe",
  description:
    "Access your AI-powered SQL workspace. Query databases using natural language, manage results, and explore data securely.",
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {

    await SyncUser() // Ensure the clerk user is synced with your database before rendering the dashboard
    const user = await  getUser();
    const sidebarUser = {
      name : user?.name || "User",
      email: user?.email || undefined,
      avatar: user?.image || undefined
    }

    return (
      <SidebarProvider>
        <AppSidebar user={sidebarUser} />
  
        <SidebarInset className="flex flex-col h-screen overflow-hidden">
          {/* HEADER */}
          <header className="flex h-16 shrink-0 items-center gap-2 ">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
  
              <Separator orientation="vertical" className="mr-2 h-4" />
  
            </div>
          </header>
  
          {/* DYNAMIC CONTENT */}
          <div className="flex flex-1 flex-col p-4 pt-0 overflow-hidden">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }