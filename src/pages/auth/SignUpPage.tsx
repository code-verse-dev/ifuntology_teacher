import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Phone, User } from "lucide-react";
import { toast } from "sonner";

import AuthLayout from "@/components/layout/AuthLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import PasswordField from "@/components/inputs/PasswordField";

export default function SignUpPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Sign Up • iFuntology Teacher";
  }, []);

  return (
    <AuthLayout>
      <section className="mx-auto w-full max-w-4xl">
        <Card className="surface-glass rounded-3xl border border-border/60 p-6 shadow-elev sm:p-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary">Sign Up</h1>
          <p className="mt-2 text-base text-foreground/90">Begin Your Funtology Journey Now!</p>

          <form
            className="mt-8 space-y-7"
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Account created (demo)");
              navigate("/welcome");
            }}
          >
            <div>
              <div className="text-sm font-semibold">Personal Information</div>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="first">First Name *</Label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="first" required placeholder="Enter Name" className="h-11 rounded-full pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last">Last Name *</Label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="last" required placeholder="Enter Name" className="h-11 rounded-full pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="email" type="email" required placeholder="your@email.com" className="h-11 rounded-full pl-10" />
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="pw">Password *</Label>
                  <PasswordField id="pw" required placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pw2">Confirm Password *</Label>
                  <PasswordField id="pw2" required placeholder="••••••••" />
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold">Organization Information</div>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="org">Organization / School Name *</Label>
                  <Input id="org" required placeholder="Enter Name" className="h-11 rounded-full" />
                </div>
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="country">Country *</Label>
                  <Input id="country" required placeholder="Enter Name" className="h-11 rounded-full" />
                </div>
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="phone">Phone Number (optional)</Label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="phone" placeholder="+1 555 000 0000" className="h-11 rounded-full pl-10" />
                  </div>
                </div>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox required />
              I Agree to the <span className="text-accent">Privacy Policy</span> &amp; <span className="text-accent">Terms</span>.
            </label>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button type="submit" variant="brand" size="pill" className="w-full sm:w-auto">
                Create Teacher Account
              </Button>
              <div className="text-sm text-muted-foreground">
                Already Have An Account?{" "}
                <Link to="/login" className="text-accent hover:underline">
                  Login
                </Link>
              </div>
            </div>
          </form>
        </Card>
      </section>
    </AuthLayout>
  );
}
