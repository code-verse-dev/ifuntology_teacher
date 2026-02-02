import { useEffect } from "react";
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

const roleCards = [
  { key: "admin", label: "Admin", icon: User },
  { key: "teacher", label: "Teacher / Organization", icon: Building2 },
  { key: "parent", label: "Individual User / Parent", icon: Users },
  { key: "student", label: "Student", icon: GraduationCap },
] as const;

export default function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Sign In • iFuntology Teacher";
  }, []);

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

          <div className="mt-6 grid grid-cols-2 gap-3">
            {roleCards.map((r) => {
              const featured = r.key === "teacher";
              return (
              <button
                key={r.key}
                type="button"
                className={
                  "group flex items-center justify-center gap-2 rounded-2xl border border-border/60 px-3 py-4 text-sm font-semibold transition hover:border-border hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                }
                onClick={() => toast.message(`${r.label} selected`)}
              >
                <r.icon className={featured ? "text-primary" : "text-muted-foreground"} />
                <span className={featured ? "text-foreground" : "text-foreground/90"}>{r.label}</span>
              </button>
              );
            })}
          </div>

          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Signed in (demo)");
              navigate("/dashboard");
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Input id="email" type="email" required placeholder="your@email.com" className="h-11 rounded-full" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <PasswordField id="password" required placeholder="••••••••" />
            </div>

            <div className="flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Checkbox id="remember" />
                Remember Me
              </label>
              <Link to="/forgot-password" className="text-sm text-accent hover:underline">
                Forgot Password
              </Link>
            </div>

            <Button type="submit" variant="brand" size="pill" className="w-full">
              Sign In
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
