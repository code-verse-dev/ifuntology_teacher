import * as React from "react";

import SpotlightBackground from "@/components/layout/SpotlightBackground";
import Topbar from "@/components/layout/Topbar";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardWithSidebarLayout({ children }: { children: React.ReactNode }) {
  return (
    <SpotlightBackground>
      <SidebarProvider defaultOpen>
        <div className="min-h-screen w-full">
          <DashboardSidebar />
    <SidebarInset>
              <Topbar />
              <div className="min-h-[calc(100vh-3.5rem)] w-full bg-[#f4f3e2] px-4 pb-10 sm:px-6">
                <main className="w-full py-8">{children}</main>
              </div>
            </SidebarInset>
        </div>
      </SidebarProvider>
    </SpotlightBackground>
  );
}
