import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  GraduationCap,
  Mail,
  PenLine,
  Shield,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import IfuntologyMark from "@/components/branding/IfuntologyMark";
import AuthLayout from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import PasswordField from "@/components/inputs/PasswordField";
import { useLoginMutation } from "@/redux/services/apiSlices/authSlice";
import { useDispatch } from "react-redux";
import { addUser } from "@/redux/services/Slices/userSlice";
import { setActorPortalSession } from "@/utils/actorPortalSession";

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

  useEffect(() => {
    document.title = "Sign In • iFuntology Teacher";

    const isMobile = window.matchMedia("(max-width: 1023px)").matches;
    if (!isMobile) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    }, 150);

    return () => window.clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res: any = await login({ identifier: email, password, role: "teacher" }).unwrap();
      if (res?.status) {
        toast.success("Signed in successfully");
        dispatch(addUser({ user: res?.data?.user }));
        setActorPortalSession(res?.data?.user);
        navigate("/dashboard");
      } else {
        toast.error(res?.message || "Something went wrong");
      }
    } catch (err: any) {
      console.log("error----", err);
      const message = err?.data?.message || err?.message;
      toast.error(message || "Login failed");
    }
  };

  return (
    <AuthLayout>
      <section className="grid w-full max-w-6xl grid-cols-1 items-stretch gap-8 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
        {/* Left panel */}
        <div className="flex flex-col gap-6">
          <div>
            <a
              href="https://ifuntology.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block cursor-pointer"
              aria-label="Open iFuntology ERP"
            >
              <IfuntologyMark logoOnly size="large" />
            </a>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Educator Workspace
            </div>
            <h1 className="mt-4 text-2xl font-extrabold leading-tight tracking-tight text-foreground sm:text-3xl">
              Welcome back,{" "}
              <span className="text-gradient-count">Teacher</span>
            </h1>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              Run your organization, courses, store, and bookings from one powerful dashboard.
            </p>
          </div>

          <div className="relative overflow-hidden surface-glass rounded-2xl border border-border/60 px-5 py-6 shadow-elev lg:px-6 lg:py-8">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-count"
            />
            <h2 className="text-xl font-bold text-foreground">Built for Educators</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Everything you need to teach, sell, and grow.
            </p>
            <ul className="mt-5 space-y-3.5 text-sm text-muted-foreground sm:text-base">
              {features.map((f) => (
                <li key={f.label} className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-secondary/50 ring-1 ring-border/40">
                    <f.icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                  </span>
                  {f.label}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-border/50 bg-secondary/40 p-4 text-center ring-1 ring-border/40 surface-glass sm:p-5"
              >
                <div className="text-2xl font-extrabold text-gradient-count sm:text-3xl">{s.value}</div>
                <div className="mt-1 text-xs font-medium text-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel — login form */}
        <div className="relative overflow-hidden surface-glass rounded-2xl border border-border/60 px-5 py-7 shadow-elev sm:px-7 sm:py-9">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/15 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl"
          />

          <div className="relative my-14">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/30 bg-gradient-count text-white shadow-elev">
                <GraduationCap className="h-6 w-6" strokeWidth={1.75} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Teacher Portal
                </p>
                <h2 className="text-2xl font-extrabold tracking-tight text-gradient-count-down sm:text-3xl">
                  Sign In
                </h2>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base mb-8">
              Access your personalized dashboard to manage classes, content, and organization tools.
            </p>

          

            <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email Address *
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="teacher@school.edu"
                    className="h-11 rounded-full border-border/80 bg-background/80 pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password *
                </Label>
                <PasswordField
                  id="password"
                  required
                  placeholder="••••••••"
                  className="[&_input]:border-border/80 [&_input]:bg-background/80"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
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

              <Button
                type="submit"
                size="pill"
                className="w-full bg-gradient-count-down text-white shadow-elev hover:opacity-95"
                disabled={isLoading}
              >
                {isLoading ? "Signing In..." : "Sign In to Dashboard"}
              </Button>

              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center" aria-hidden>
                  <div className="w-full border-t border-border/60" />
                </div>
                <p className="relative mx-auto w-fit bg-card/80 px-3 text-xs text-muted-foreground backdrop-blur-sm">
                  New to iFuntology?
                </p>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link to="/sign-up" className="font-medium text-accent hover:underline">
                  Register as Teacher
                </Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </AuthLayout>
  );
}
