import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  GraduationCap,
  Mail,
  PenLine,
  School,
  Shield,
  ShoppingCart,
  User,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import IfuntologyMark from "@/components/branding/IfuntologyMark";
import AuthLayout from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import PasswordField from "@/components/inputs/PasswordField";
import { useForgetPasswordMutation, useLoginMutation } from "@/redux/services/apiSlices/authSlice";
import { useDispatch } from "react-redux";
import { addUser } from "@/redux/services/Slices/userSlice";

const roleCards = [
  { key: "admin", label: "Admin", icon: User },
  { key: "teacher", label: "Teacher / Organization", icon: GraduationCap },
  { key: "parent", label: "Individual User / Parent", icon: Users },
  { key: "student", label: "Student", icon: School },
] as const;

const features = [
  { label: "Learning Management System", icon: BookOpen },
  { label: "E-commerce Store", icon: ShoppingCart },
  { label: "Write to Read Publishing", icon: PenLine },
  { label: "Booking & Quotations", icon: Calendar },
  { label: "Affiliate Partnerships", icon: Shield },
] as const;

const stats = [
  { value: "10K+", label: "Users" },
  { value: "30+", label: "Courses" },
  { value: "98%", label: "Satisfaction" },
] as const;

export default function LoginPage() {
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<typeof roleCards[number]["key"]>("teacher");

  useEffect(() => {
    document.title = "Sign In • iFuntology Teacher";
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res: any = await login({ identifier: email, password, role: "teacher" }).unwrap();
      if (res?.status) {
        toast.success("Signed in successfully");
        dispatch(addUser({ user: res?.data?.user }));
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
      <section className="grid w-full max-w-6xl grid-cols-1 items-stretch gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        {/* Left panel — logo & welcome outside box; All-in-One card; count boxes below */}
        <div className="flex flex-col gap-6">
          {/* Logo and Welcome Back — outside the box */}
          <div>
            <IfuntologyMark logoOnly size="large" />
            <h1 className="mt-5 text-xl font-extrabold leading-tight tracking-tight text-foreground sm:text-2xl">
              Welcome Back!
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Your complete education &amp; enrichment platform
            </p>
          </div>

          <div className="flex flex-col surface-glass rounded-2xl border border-border/60 px-5 py-6 shadow-elev lg:px-6 lg:py-8">
            <h2 className="text-xl font-bold text-foreground">All-in-One Platform</h2>
            <ul className="mt-4 space-y-3.5 text-base text-muted-foreground">
              {features.map((f) => (
                <li key={f.label} className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-secondary/40 ring-1 ring-border/40">
                    <f.icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                  </span>
                  {f.label}
                </li>
              ))}
            </ul>
          </div>

          {/* Count boxes — outside main card */}
          <div className="grid grid-cols-3 gap-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-border/50 bg-secondary/40 p-5 text-center ring-1 ring-border/40 surface-glass"
              >
                <div className="text-2xl font-extrabold text-gradient-count sm:text-3xl">{s.value}</div>
                <div className="mt-1 text-xs font-medium text-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel — login form */}
        <div className="surface-glass flex flex-col rounded-2xl border border-border/60 px-5 py-6 shadow-elev sm:px-6 sm:py-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
            Sign In
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Access your personalized dashboard.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4">
            {roleCards.map((r) => {
              const selected = r.key === selectedRole;
              return (
                <button
                  key={r.key}
                  type="button"
                  className={
                    selected
                      ? "flex flex-col items-center justify-center gap-2 rounded-2xl border border-cyan-400/50 bg-cyan-500/30 px-3 py-4 text-sm font-semibold text-white shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      : "flex flex-col items-center justify-center gap-2 rounded-2xl border border-border/60 bg-secondary/40 px-3 py-4 text-sm font-semibold text-muted-foreground transition hover:border-border hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  }
                  onClick={() => {
                    setSelectedRole(r.key);
                    // toast.message(`${r.label} selected`);
                  }}
                >
                  <span
                    className={
                      selected
                        ? "flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-400/50"
                        : "flex h-12 w-12 items-center justify-center"
                    }
                  >
                    <r.icon className="h-8 w-8 shrink-0" strokeWidth={1.5} />
                  </span>
                  <span className="text-center">{r.label}</span>
                </button>
              );
            })}
          </div>

          <form
            className="mt-6 space-y-4"
            onSubmit={handleSubmit}
          >
            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-normal text-foreground">
                Email Address *
              </Label>
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
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-accent hover:underline"
              >
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
        </div>
      </section>
    </AuthLayout>
  );
}
