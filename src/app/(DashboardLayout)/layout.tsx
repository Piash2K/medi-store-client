import { Suspense } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
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
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <p className="text-sm font-medium">Dashboard</p>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Suspense
            fallback={
              <div className="flex min-h-[45vh] items-center justify-center">
                <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span className="text-sm text-muted-foreground">Loading dashboard data...</span>
                </div>
              </div>
            }
          >
            {dashboardContent}
          </Suspense>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
