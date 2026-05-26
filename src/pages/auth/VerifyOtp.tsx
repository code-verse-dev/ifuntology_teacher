import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AuthLayout from "@/components/layout/AuthLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import PasswordField from "@/components/inputs/PasswordField";
import { useVerifyOtpMutation } from "@/redux/services/apiSlices/authSlice";

export default function RecoverPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const [code, setCode] = useState("");
  const [verifyOtp] = useVerifyOtpMutation();

  useEffect(() => {
    document.title = "Recover Password • iFuntology Teacher";
  }, []);

  useEffect(() => {
    if (!email) {
      navigate(-1);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      const res: any = await verifyOtp({ email: email, code }).unwrap();
      if (res?.status) {
        toast.success("verification successful");
        navigate("/recover-password", { state: { email, code } });
      } else {
        toast.error(res?.message || "Something went wrong");
      }
    } catch (err) {
      console.log("err", err);
      toast.error(err?.data?.message || "Failed to verify otp");
    }
  };

  return (
    <AuthLayout>
      <section className="mx-auto w-full max-w-lg">
        <Card className="surface-glass rounded-3xl border border-border/60 p-6 shadow-elev sm:p-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary">
            Recover Password
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter the 4-digit OTP sent to your email.
          </p>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="otp">OTP *</Label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                // pattern="\\d{4}"
                maxLength={4}
                minLength={4}
                required
                className="h-11 w-full !text-black rounded-full border px-4 text-center text-lg tracking-widest"
                placeholder="0000"
                value={code}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 4);
                  setCode(val);
                }}
              />
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
                ← Back to Login
              </Link>
            </div>
          </form>
        </Card>
      </section>
    </AuthLayout>
  );
}
