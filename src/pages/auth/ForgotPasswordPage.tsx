import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import { toast } from "sonner";

import AuthLayout from "@/components/layout/AuthLayout";
import { Card } from "@/components/ui/card";
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
        <Card className="surface-glass rounded-3xl border border-border/60 p-6 shadow-elev sm:p-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary">Forgot Password</h1>
          <p className="mt-2 text-sm text-muted-foreground">Enter your email to recover your password.</p>

          <form
            className="mt-6 space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Recovery email sent (demo)");
              navigate("/recover-password");
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" required placeholder="your@email.com" className="h-11 rounded-full pl-10" />
              </div>
            </div>

            <Button type="submit" variant="brand" size="pill" className="w-full">
              Continue
            </Button>

            <div className="text-center">
              <Link to="/login" className="text-sm text-accent hover:underline">
                 Back to Login
              </Link>
            </div>
          </form>
        </Card>
      </section>
    </AuthLayout>
  );
}
