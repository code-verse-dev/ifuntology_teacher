import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AuthLayout from "@/components/layout/AuthLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import PasswordField from "@/components/inputs/PasswordField";
import { useResetPasswordMutation } from "@/redux/services/apiSlices/authSlice";

export default function RecoverPasswordPage() {
  const navigate = useNavigate();
  const [resetPassword] = useResetPasswordMutation();
  const location = useLocation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { email, code } = location.state;

  useEffect(() => {
    document.title = "Recover Password • iFuntology Teacher";
  }, []);

  useEffect(() => {
    if(!email || !code) {
      navigate(-1);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      const res: any = await resetPassword({ email, code, password, type: "teacher" }).unwrap();
      if (res?.status) {
        toast.success("Password reset successfully");
        navigate("/login");
      }
    } catch (err) {
      console.log("err", err);
      toast.error("Failed to reset password");
    }
  }

  return (
    <AuthLayout>
      <section className="mx-auto w-full max-w-lg">
        <Card className="surface-glass rounded-3xl border border-border/60 p-6 shadow-elev sm:p-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary">
            Recover Password
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create a new password for your account.
          </p>

          <form
            className="mt-6 space-y-5"
            onSubmit={handleSubmit}
          >
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <PasswordField id="password" required placeholder="••••••••" onChange={
                (e) => setPassword(e.target.value)
              }/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm Password *</Label>
              <PasswordField id="confirm" required placeholder="••••••••" onChange={
                (e) => setConfirmPassword(e.target.value)
              } />
            </div>

            <Button
              type="submit"
              variant="brand"
              size="pill"
              className="w-full"
            >
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
