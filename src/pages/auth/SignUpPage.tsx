import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Phone, User } from "lucide-react";
import { toast } from "sonner";

import AuthLayout from "@/components/layout/AuthLayout";
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
        <div className="surface-glass min-h-[560px] rounded-2xl border border-border/60 p-8 shadow-elev backdrop-blur-xl">
          <h1 className="text-3xl font-medium tracking-tight text-gradient-count-down sm:text-4xl">
            Sign Up
          </h1>
          <p className="mt-3 text-sm text-foreground">
            Begin Your Funtology Journey Now!
          </p>

          <form
            className="mx-auto mt-8  space-y-8"
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Account created (demo)");
              navigate("/welcome");
            }}
          >
            <div>
              <div className="text-sm font-medium text-foreground">Personal Information</div>
              <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
                <div className="space-y-3">
                  <Label htmlFor="first" className="text-sm font-normal text-foreground">
                    First Name <span className="text-accent">*</span>
                  </Label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="first"
                      required
                      placeholder="Enter Name"
                      className="h-11 rounded-full border-border/80 bg-background/80 pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="last" className="text-sm font-normal text-foreground">
                    Last Name <span className="text-accent">*</span>
                  </Label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="last"
                      required
                      placeholder="Enter Name"
                      className="h-11 rounded-full border-border/80 bg-background/80 pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-normal text-foreground">
                    Email Address <span className="text-accent">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      required
                      placeholder="your@email.com"
                      className="h-11 rounded-full border-border/80 bg-background/80 pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-3">
                  <Label htmlFor="pw" className="text-sm font-normal text-foreground">
                    Password <span className="text-accent">*</span>
                  </Label>
                  <PasswordField id="pw" required placeholder="••••••••" />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="pw2" className="text-sm font-normal text-foreground">
                    Confirm Password <span className="text-accent">*</span>
                  </Label>
                  <PasswordField id="pw2" required placeholder="••••••••" />
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-foreground">Organization Information</div>
              <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
                <div className="space-y-3 md:col-span-1">
                  <Label htmlFor="org" className="text-sm font-normal text-foreground">
                    Organization / School Name <span className="text-accent">*</span>
                  </Label>
                  <Input
                    id="org"
                    required
                    placeholder="Enter Name"
                    className="h-11 rounded-full border-border/80 bg-background/80"
                  />
                </div>
                <div className="space-y-3 md:col-span-1">
                  <Label htmlFor="country" className="text-sm font-normal text-foreground">
                    Country <span className="text-accent">*</span>
                  </Label>
                  <Input
                    id="country"
                    required
                    placeholder="Enter Name"
                    className="h-11 rounded-full border-border/80 bg-background/80"
                  />
                </div>
                <div className="space-y-3 md:col-span-1">
                  <Label htmlFor="phone" className="text-sm font-normal text-foreground">
                    Phone Number (optional)
                  </Label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="phone"
                      placeholder="+1 555 000 0000"
                      className="h-11 rounded-full border-border/80 bg-background/80 pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
              <Checkbox required />
              I Agree to the <Link to="#" className="font-medium text-accent hover:underline">Privacy Policy</Link> &amp;{" "}
              <Link to="#" className="font-medium text-accent hover:underline">Terms &amp; Conditions</Link>.
            </label>

            <div className="flex flex-col items-start gap-4 pt-2">
              <Button
                type="submit"
                size="pill"
                className="bg-gradient-count-down text-white shadow-elev hover:opacity-95"
              >
                Create Teacher Account
              </Button>
              <p className="text-sm text-foreground">
                Already Have An Account?{" "}
                <Link to="/login" className="font-medium text-accent hover:underline">
                  Login
                </Link>
              </p>
            </div>
          </form>
        </div>
      </section>
    </AuthLayout>
  );
}
