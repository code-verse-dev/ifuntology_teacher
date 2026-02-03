import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "next-themes";
import IfuntologyMark from "@/components/branding/IfuntologyMark";
import SpotlightBackground from "@/components/layout/SpotlightBackground";
import { Button } from "@/components/ui/button";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <SpotlightBackground>
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-3 py-6 sm:px-4">
        <header className="flex items-center justify-between">
          {!isLoginPage ? (
            <Link to="/" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg">
              <IfuntologyMark logoOnly size="large" />
            </Link>
          ) : (
            <div />
          )}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label={(theme ?? "dark") === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            onClick={() => setTheme((theme ?? "dark") === "dark" ? "light" : "dark")}
          >
            {(theme ?? "dark") === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </header>

        <main className="flex flex-1 items-center py-10">{children}</main>
      </div>
    </SpotlightBackground>
  );
}
