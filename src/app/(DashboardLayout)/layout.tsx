import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { DashboardUserMenu } from "@/components/dashboard-user-menu";
import { getUser } from "@/services/auth";

export const dynamic = "force-dynamic";

export default async function Page({
  admin,
  seller,
  customer,
}: {
  admin: React.ReactNode;
  seller: React.ReactNode;
  customer: React.ReactNode;
}) {
  const user = await getUser();
  const dashboardContent =
    user.role === "ADMIN" ? admin : user.role === "SELLER" ? seller : customer;

  return (
    <SidebarProvider>
      <AppSidebar UserRole={user.role} />
      <SidebarInset>
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b bg-background/95 px-3 backdrop-blur supports-backdrop-filter:bg-background/80 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 sm:px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-1 data-[orientation=vertical]:h-5"
            />
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight">Dashboard</p>
              <p className="text-muted-foreground hidden text-xs sm:block">Manage your account and activities</p>
            </div>
          </div>
          <div>
            <DashboardUserMenu />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {dashboardContent}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
