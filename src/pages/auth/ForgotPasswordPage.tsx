import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import { toast } from "sonner";

import AuthLayout from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Forgot Password • iFuntology Teacher";
  }, []);

  return (
    <AuthLayout>
      <section className="mx-auto w-full max-w-lg">
        <div className="surface-glass flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-border/60 px-6 py-8 shadow-elev backdrop-blur-xl sm:px-8 sm:py-10">
          <div className="w-full max-w-sm">
            <h1 className="text-center text-3xl font-medium tracking-tight text-gradient-count-down sm:text-4xl">
              Forgot Password
            </h1>
            <p className="mt-3 text-center text-sm text-muted-foreground">
              Enter your email to recover your password.
            </p>

            <form
              className="mt-6 space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                toast.success("Recovery email sent (demo)");
                navigate("/recover-password");
              }}
            >
              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-normal text-foreground">
                  Email Address *
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="your@email.com"
                    className="h-11 rounded-full border-border/80 bg-background/80 pl-10"
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="pill"
                className="w-full bg-gradient-count-down text-white shadow-elev hover:opacity-95"
              >
                Continue
              </Button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </section>
    </AuthLayout>
  );
}
