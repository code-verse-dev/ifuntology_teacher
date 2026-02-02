import * as React from "react";
import SpotlightBackground from "@/components/layout/SpotlightBackground";
import Topbar from "@/components/layout/Topbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SpotlightBackground>
      <div className="min-h-screen">
        <Topbar />
        <div className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6">
          <main className="w-full py-8">{children}</main>
        </div>
      </div>
    </SpotlightBackground>
  );
}
