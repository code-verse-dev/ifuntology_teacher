import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Phone, User } from "lucide-react";
import { toast } from "sonner";

import { useRegisterMutation } from "@/redux/services/apiSlices/authSlice";
import AuthLayout from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import PasswordField from "@/components/inputs/PasswordField";
import { Avatar } from "@/components/ui/avatar";

export default function SignUpPage() {
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();

  // State for all fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [org, setOrg] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [agree, setAgree] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [zipCode, setZipCode] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Helper for image preview
  const imageUrl = image ? URL.createObjectURL(image) : null;

  useEffect(() => {
    document.title = "Sign Up • iFuntology Teacher";
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!agree) {
      toast.error("You must agree to the Privacy Policy & Terms");
      return;
    }
    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("organization", org);
    formData.append("country", country);
    formData.append("phoneNumber", phone);
    formData.append("city", city);
    formData.append("state", stateVal);
    formData.append("streetAddress", streetAddress);
    formData.append("zipCode", zipCode);
    if (image) formData.append("image", image);
    formData.append("role", "teacher");
    try {
      const res: any = await register(formData).unwrap();
      if(res?.status) {
        toast.success("Account created successfully");
        navigate("/welcome");
      }
      else{
        toast.error(res?.message || "Failed to create account");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create account");
    }
  };

  return (
    <AuthLayout>
      <section className="mx-auto w-full max-w-4xl">
        {/* Avatar preview at the top */}
        <div className="surface-glass min-h-[560px] rounded-2xl border border-border/60 p-8 shadow-elev backdrop-blur-xl">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary">
            Sign Up
          </h1>
          <p className="mt-2 text-base text-foreground/90">
            Begin Your Funtology Journey Now!
          </p>

          <div className="flex mt-4">
            <div className="flex flex-col items-center mb-2">
              <div className="relative">
                <Avatar className="h-24 w-24 text-3xl">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Profile Preview"
                      className="h-24 w-24 rounded-full object-cover border-2 border-primary"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-secondary text-muted-foreground rounded-full">
                      <User className="h-12 w-12" />
                    </span>
                  )}
                </Avatar>
                <input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  ref={imageInputRef}
                  onChange={handleImageChange}
                  className="absolute bottom-0 right-0 h-8 w-8 opacity-0 cursor-pointer"
                  style={{ zIndex: 2 }}
                  disabled={isLoading}
                />
                <label
                  htmlFor="image"
                  className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1 cursor-pointer"
                  style={{ zIndex: 3 }}
                >
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path
                      d="M12 16v-4m0 0V8m0 4h4m-4 0H8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </label>
              </div>
              {image && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Selected: {image.name}
                </div>
              )}
            </div>
          </div>

          <form
            className="mt-8 space-y-7"
            onSubmit={handleSubmit}
            encType="multipart/form-data"
          >
            <div>
              <div className="text-sm font-medium text-foreground">
                Personal Information
              </div>
              <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
                <div className="space-y-3">
                  <Label
                    htmlFor="first"
                    className="text-sm font-normal text-foreground"
                  >
                    First Name <span className="text-accent">*</span>
                  </Label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="first"
                      required
                      placeholder="Enter Name"
                      className="h-11 rounded-full border-border/80 bg-background/80 pl-10"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label
                    htmlFor="last"
                    className="text-sm font-normal text-foreground"
                  >
                    Last Name <span className="text-accent">*</span>
                  </Label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="last"
                      required
                      placeholder="Enter Name"
                      className="h-11 rounded-full border-border/80 bg-background/80 pl-10"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label
                    htmlFor="email"
                    className="text-sm font-normal text-foreground"
                  >
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="pw">Password *</Label>
                  <PasswordField
                    id="pw"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pw2">Confirm Password *</Label>
                  <PasswordField
                    id="pw2"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold">
                Organization Information
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="org">Organization / School Name *</Label>
                  <Input
                    id="org"
                    required
                    placeholder="Enter Name"
                    className="h-11 rounded-full border-border/80 bg-background/80"
                    value={org}
                    onChange={(e) => setOrg(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    required
                    placeholder="Enter Name"
                    className="h-11 rounded-full border-border/80 bg-background/80"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-3 md:col-span-1">
                  <Label
                    htmlFor="phone"
                    className="text-sm font-normal text-foreground"
                  >
                    Phone Number (optional)
                  </Label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={isLoading}
                      id="phone"
                      placeholder="+1 555 000 0000"
                      className="h-11 rounded-full border-border/80 bg-background/80 pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    required
                    placeholder="Enter City"
                    className="h-11 rounded-full border-border/80 bg-background/80 pl-10"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    required
                    placeholder="Enter State"
                    className="h-11 rounded-full border-border/80 bg-background/80 pl-10"
                    value={stateVal}
                    onChange={(e) => setStateVal(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="streetAddress">Street Address *</Label>
                  <Input
                    id="streetAddress"
                    required
                    placeholder="Enter Street Address"
                    className="h-11 rounded-full border-border/80 bg-background/80 pl-10"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="zipCode">Zip Code *</Label>
                  <Input
                    id="zipCode"
                    required
                    placeholder="Enter Zip Code"
                    className="h-11 rounded-full border-border/80 bg-background/80 pl-10"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox
                required
                checked={agree}
                onCheckedChange={(v) => setAgree(!!v)}
                disabled={isLoading}
              />
              I Agree to the{" "}
              <span className="text-accent hover:underline">
                Privacy Policy
              </span>{" "}
              &amp; <span className="text-accent hover:underline">Terms</span>.
            </label>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="submit"
                variant="brand"
                size="pill"
                className="w-full sm:w-auto"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create Teacher Account"}
              </Button>
              <p className="text-sm text-foreground">
                Already Have An Account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-accent hover:underline"
                >
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
