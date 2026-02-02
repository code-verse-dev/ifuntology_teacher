import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import AuthLayout from "@/components/layout/AuthLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import PasswordField from "@/components/inputs/PasswordField";

export default function RecoverPasswordPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Recover Password • iFuntology Teacher";
  }, []);

  return (
    <AuthLayout>
      <section className="mx-auto w-full max-w-lg">
        <Card className="surface-glass rounded-3xl border border-border/60 p-6 shadow-elev sm:p-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary">Recover Password</h1>
          <p className="mt-2 text-sm text-muted-foreground">Create a new password for your account.</p>

          <form
            className="mt-6 space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Password updated (demo)");
              navigate("/login");
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <PasswordField id="password" required placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm Password *</Label>
              <PasswordField id="confirm" required placeholder="••••••••" />
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
