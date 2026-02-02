import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, GraduationCap, User, Users } from "lucide-react";
import { toast } from "sonner";
import AuthLayout from "@/components/layout/AuthLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import PasswordField from "@/components/inputs/PasswordField";
import { useLoginMutation } from "@/redux/services/apiSlices/authSlice";
import { useDispatch } from "react-redux";
import { addUser } from "@/redux/services/Slices/userSlice";

const roleCards = [
  { key: "admin", label: "Admin", icon: User },
  { key: "teacher", label: "Teacher / Organization", icon: Building2 },
  { key: "parent", label: "Individual User / Parent", icon: Users },
  { key: "student", label: "Student", icon: GraduationCap },
] as const;

export default function LoginPage() {
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();

  // Add state for email and password only
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    document.title = "Sign In • iFuntology Teacher";
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res: any = await login({ email, password, role: "teacher" }).unwrap();
      if (res?.status) {
        toast.success("Signed in successfully");
        dispatch(addUser({ user: res?.data?.user, token: res?.data?.accessToken }));
        navigate("/dashboard");
      }
      else {
        toast.error(res?.message || "Something went wrong");
      }
    } catch (err: any) {
      console.log("error----", err);
      let message = err?.data?.message || err?.message;
      toast.error(message || "Login failed");
    }
  };

  return (
    <AuthLayout>
      <section className="grid w-full grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-10">
        <div className="hidden lg:block">
          <h1 className="text-5xl font-extrabold leading-tight tracking-tight">Welcome Back!</h1>
          <p className="mt-4 max-w-lg text-lg text-muted-foreground">
            Your complete education &amp; enrichment platform—plan sessions, manage bookings, and keep everything in one
            place.
          </p>

          <div className="mt-8 surface-glass rounded-2xl border border-border/60 p-6 shadow-elev">
            <div className="text-xl font-bold">All‑in‑One Platform</div>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-primary" /> Learning Management System
              </li>
              <li className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-primary" /> E‑commerce Store
              </li>
              <li className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-primary" /> Write to Read Publishing
              </li>
              <li className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-primary" /> Booking &amp; Quotations
              </li>
              <li className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-primary" /> Affiliate Partnerships
              </li>
            </ul>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {[{ v: "10K+", t: "Users" }, { v: "30+", t: "Courses" }, { v: "98%", t: "Satisfaction" }].map((s) => (
                <div key={s.t} className="rounded-xl bg-secondary/40 p-4 text-center ring-1 ring-border/50">
                  <div className="text-2xl font-extrabold text-primary">{s.v}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{s.t}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Card className="surface-glass w-full rounded-3xl border border-border/60 p-6 shadow-elev sm:p-8">
          <h2 className="text-4xl font-extrabold tracking-tight text-primary">Sign In</h2>
          <p className="mt-2 text-sm text-muted-foreground">Access your personalized dashboard.</p>
          <form
            className="mt-6 space-y-4"
            onSubmit={handleSubmit}
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Input id="email" type="email" required placeholder="your@email.com" className="h-11 rounded-full" value={email} onChange={e => setEmail(e.target.value)} disabled={isLoading} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <PasswordField id="password" required placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} disabled={isLoading} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Checkbox id="remember" disabled={isLoading} />
                Remember Me
              </label>
              <Link to="/forgot-password" className="text-sm text-accent hover:underline">
                Forgot Password
              </Link>
            </div>
            <Button type="submit" variant="brand" size="pill" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Don’t have an account?{" "}
              <Link to="/sign-up" className="text-accent hover:underline">
                Register Now
              </Link>
            </p>
          </form>
        </Card>
      </section>
    </AuthLayout>
  );
}
