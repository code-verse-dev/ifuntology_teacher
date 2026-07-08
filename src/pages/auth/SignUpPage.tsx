import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { City, Country, State } from "country-state-city";
// import type { ICity, ICountry, IState } from "country-state-city";
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
import {
  getPasswordValidationError,
  PASSWORD_POLICY_HINT,
} from "@/utils/passwordValidation";

const locationSelectClassName =
  "h-11 w-full rounded-full border border-border/80 bg-background/80 px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

export default function SignUpPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get("ref")?.trim();
  const [register, { isLoading }] = useRegisterMutation();
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
  // const [countries] = useState<ICountry[]>(() => Country.getAllCountries());
  // const [states, setStates] = useState<IState[]>([]);
  // const [cities, setCities] = useState<ICity[]>([]);
  const [countryIso, setCountryIso] = useState("");
  const [stateIso, setStateIso] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);

  const imageUrl = image ? URL.createObjectURL(image) : null;

  useEffect(() => {
    document.title = "Sign Up • iFuntology Teacher";
  }, []);

  useEffect(() => {
    if (!referralCode) return;

    const { hostname, origin } = window.location;
    let affiliateBase = "http://localhost:8081";

    if (hostname.includes("react.customdev.solutions")) {
      affiliateBase = "https://react.customdev.solutions/ifuntology/affiliate";
    } else if (hostname.includes("teacher-erp.ifuntology.com")) {
      affiliateBase = "https://affiliate-erp.ifuntology.com";
    } else if (hostname === "localhost") {
      affiliateBase = "http://localhost:8081";
    } else {
      affiliateBase = origin.replace("teacher", "affiliate");
    }

    window.location.replace(
      `${affiliateBase.replace(/\/$/, "")}/sign-up?ref=${encodeURIComponent(referralCode)}`,
    );
  }, [referralCode]);

  if (referralCode) {
    return null;
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  // const handleCountryChange = (isoCode: string) => {
  //   const selected = countries.find((item) => item.isoCode === isoCode);
  //   const countryStates = isoCode ? State.getStatesOfCountry(isoCode) : [];

  //   setCountryIso(isoCode);
  //   setStateIso("");
  //   setStates(countryStates);
  //   setCities(
  //     isoCode && countryStates.length === 0
  //       ? City.getCitiesOfCountry(isoCode) ?? []
  //       : [],
  //   );
  //   setCountry(selected?.name ?? "");
  //   setStateVal("");
  //   setCity("");
  // };

  // const handleStateChange = (isoCode: string) => {
  //   const selected = states.find((item) => item.isoCode === isoCode);

  //   setStateIso(isoCode);
  //   setCities(
  //     countryIso && isoCode
  //       ? City.getCitiesOfState(countryIso, isoCode) ?? []
  //       : [],
  //   );
  //   setStateVal(selected?.name ?? "");
  //   setCity("");
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const passwordError = getPasswordValidationError(password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }
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
      if (res?.status) {
        toast.success("Account created successfully");
        navigate("/login");
      } else {
        toast.error(res?.message || "Failed to create account");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create account");
    }
  };

  return (
    <AuthLayout>
      <section className="mx-auto w-full max-w-4xl">
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
                  <Label htmlFor="first">
                    First Name <span className="text-accent">*</span>
                  </Label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="first"
                      required
                      placeholder="Jane"
                      className="h-11 rounded-full border-border/80 bg-background/80 pl-10"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="last">
                    Last Name <span className="text-accent">*</span>
                  </Label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="last"
                      required
                      placeholder="Doe"
                      className="h-11 rounded-full border-border/80 bg-background/80 pl-10"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="email">
                    Email Address <span className="text-accent">*</span>
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
                  {getPasswordValidationError(password) ? (
                    <p className="text-xs text-rose-600">
                      {getPasswordValidationError(password)}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">{PASSWORD_POLICY_HINT}</p>
                  )}
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
              <div className="text-sm font-semibold">Organization Information</div>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="org">Organization / School Name *</Label>
                  <Input
                    id="org"
                    required
                    placeholder="Springfield High School"
                    className="h-11 rounded-full border-border/80 bg-background/80"
                    value={org}
                    onChange={(e) => setOrg(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                {/* <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="signup-country">
                    Country <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="signup-country"
                    required
                    value={countryIso}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className={locationSelectClassName}
                    disabled={isLoading}
                  >
                    <option value="">Select country</option>
                    {countries.map((item) => (
                      <option key={item.isoCode} value={item.isoCode}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div> */}
                <div className="space-y-3 md:col-span-1">
                  <Label htmlFor="phone">Phone Number (optional)</Label>
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
                {/* <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="signup-state">
                    State <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="signup-state"
                    required={states.length > 0}
                    value={stateIso}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className={locationSelectClassName}
                    disabled={isLoading || !countryIso || states.length === 0}
                  >
                    <option value="">
                      {!countryIso
                        ? "Select country first"
                        : states.length === 0
                          ? "No states available"
                          : "Select state"}
                    </option>
                    {states.map((item) => (
                      <option key={item.isoCode} value={item.isoCode}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="signup-city">
                    City <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="signup-city"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={locationSelectClassName}
                    disabled={
                      isLoading ||
                      !countryIso ||
                      cities.length === 0 ||
                      (states.length > 0 && !stateIso)
                    }
                  >
                    <option value="">
                      {!countryIso
                        ? "Select country first"
                        : states.length > 0 && !stateIso
                          ? "Select state first"
                          : cities.length === 0
                            ? "No cities available"
                            : "Select city"}
                    </option>
                    {cities.map((item) => (
                      <option
                        key={`${item.name}-${item.latitude}-${item.longitude}`}
                        value={item.name}
                      >
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div> */}
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="streetAddress">Street Address *</Label>
                  <Input
                    id="streetAddress"
                    required
                    placeholder="142 W 34th Ave"
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
                    placeholder="99503"
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
              <a
                href="https://erp.ifuntology.com/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Privacy Policy
              </a>{" "}
              &amp; <a
                href="https://erp.ifuntology.com/terms-and-conditions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >Terms</a>.
            </label>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button type="submit" variant="brand" size="pill" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Teacher Account"}
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
