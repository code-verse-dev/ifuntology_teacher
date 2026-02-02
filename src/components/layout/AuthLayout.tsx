import * as React from "react";
import SpotlightBackground from "@/components/layout/SpotlightBackground";
import IfuntologyMark from "@/components/branding/IfuntologyMark";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <SpotlightBackground>
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6">
        <header className="flex items-center justify-between">
          <IfuntologyMark />
          <div className="hidden text-sm text-muted-foreground sm:block">One place. One stop. Endless possibilities.</div>
        </header>

        <main className="flex flex-1 items-center py-10">{children}</main>
      </div>
    </SpotlightBackground>
  );
}
