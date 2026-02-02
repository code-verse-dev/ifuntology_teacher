import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import { toast } from "sonner";

import AuthLayout from "@/components/layout/AuthLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgetPasswordMutation } from "@/redux/services/apiSlices/authSlice";

export default function ForgotPasswordPage() {
  const [forgetpassword, { isLoading }] = useForgetPasswordMutation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  useEffect(() => {
    document.title = "Forgot Password • iFuntology Teacher";
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res: any = await forgetpassword({ data: { email , type:"teacher"} }).unwrap();
      if (res?.status) {
        toast.success("Recovery email sent");
        navigate("/verify-otp", { state: { email } });
      }
      else{
        toast.error(res?.message || "Something went wrong");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to send recovery email");
    }
  };

  return (
    <AuthLayout>
      <section className="mx-auto w-full max-w-lg">
        <Card className="surface-glass rounded-3xl border border-border/60 p-6 shadow-elev sm:p-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary">Forgot Password</h1>
          <p className="mt-2 text-sm text-muted-foreground">Enter your email to recover your password.</p>
          <form
            className="mt-6 space-y-5"
            onSubmit={handleSubmit}
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" required placeholder="your@email.com" className="h-11 rounded-full pl-10" value={email} onChange={e => setEmail(e.target.value)} disabled={isLoading} />
              </div>
            </div>
            <Button type="submit" variant="brand" size="pill" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending..." : "Continue"}
            </Button>
            <div className="text-center">
              <Link to="/login" className="text-sm text-accent hover:underline">
                ← Back to Login
              </Link>
            </div>
          </form>
        </Card>
      </section>
    </AuthLayout>
  );
}
