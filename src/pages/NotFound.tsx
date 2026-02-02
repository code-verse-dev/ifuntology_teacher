import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

import AuthLayout from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // Keep minimal signal for debugging without spamming the console.
    console.warn("Route not found:", location.pathname);
  }, [location.pathname]);

  return (
    <AuthLayout>
      <section className="mx-auto w-full max-w-xl text-center">
        <div className="surface-glass rounded-2xl border border-border/60 p-8 shadow-elev">
          <h1 className="text-6xl font-extrabold tracking-tight">404</h1>
          <p className="mt-3 text-base text-muted-foreground">Oops! Page not found.</p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild variant="brand" size="pill">
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
            <Button asChild variant="glass" size="pill">
              <Link to="/login">Back to Login</Link>
            </Button>
          </div>
        </div>
      </section>
    </AuthLayout>
  );
};

export default NotFound;
