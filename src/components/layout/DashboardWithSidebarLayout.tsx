import * as React from "react";
import SpotlightBackground from "@/components/layout/SpotlightBackground";
import Topbar from "@/components/layout/Topbar";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  /** Use full viewport for embedded tools (e.g. book builder). */
  fullWidth?: boolean;
};

export default function DashboardWithSidebarLayout({
  children,
  fullWidth = false,
}: Props) {
  return (
    <SpotlightBackground>
      <SidebarProvider defaultOpen>
        <div
          className={cn(
            "w-full",
            fullWidth
              ? "flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden"
              : "min-h-screen"
          )}
        >
          <DashboardSidebar />
          <SidebarInset
            className={cn(fullWidth && "flex min-h-0 flex-1 flex-col overflow-hidden")}
          >
            <Topbar />
            <div
              className={cn(
                "w-full bg-background",
                fullWidth
                  ? "flex min-h-0 flex-1 flex-col px-0 pb-0"
                  : "min-h-[calc(100vh-3.5rem)] px-4 pb-10 sm:px-6"
              )}
            >
              <main
                className={cn(
                  "w-full",
                  fullWidth ? "flex min-h-0 flex-1 flex-col py-0" : "py-8"
                )}
              >
                {children}
              </main>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </SpotlightBackground>
  );
}
