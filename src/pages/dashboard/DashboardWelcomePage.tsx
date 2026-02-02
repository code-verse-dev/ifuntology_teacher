import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function DashboardWelcomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Dashboard • iFuntology Teacher";
  }, []);

  return (
    <DashboardLayout>
      <section className="mx-auto max-w-4xl py-8 sm:py-14">
        <Card className="surface-glass rounded-3xl border border-border/60 p-8 text-center shadow-elev sm:p-12">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Welcome Tom Felix <span className="align-middle">👋</span>
          </h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            To get started, book a session or request a quotation.
          </p>

          <div className="mt-8 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
            <Button variant="brand" size="pill" className="w-full sm:w-auto" onClick={() => navigate("/book-session")}>
              Book a Session
            </Button>
            <Button variant="accent" size="pill" className="w-full sm:w-auto" onClick={() => navigate("/quotes/lms")}>
              Request a Quotation
            </Button>
          </div>
        </Card>
      </section>
    </DashboardLayout>
  );
}
