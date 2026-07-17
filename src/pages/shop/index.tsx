import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AlertTriangle, Check, ChevronDown, GraduationCap, PenTool, Store } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useGetCategoriesQuery } from "@/redux/services/apiSlices/categorySlice";
import { useCheckCouponMutation } from "@/redux/services/apiSlices/couponSlice";
import { quoteSlice } from "@/redux/services/apiSlices/quoteSlice";
import {
  ShopEligibility,
  useCreateShopQuoteMutation,
  usePreviewShopPricingMutation,
} from "@/redux/services/apiSlices/shopSlice";
import ShopPricingPanel from "./components/ShopPricingPanel";
import EnrichmentProductPickerDialog from "./components/EnrichmentProductPickerDialog";
import ShopSectionCard, {
  shopFieldInput,
  shopFieldLabel,
  shopFieldSelect,
} from "./components/ShopSectionCard";
import ShopAddButton from "./components/ShopAddButton";
import LmsKitVariantSelect from "./components/LmsKitVariantSelect";
import {
  lmsCourseCard,
  lmsCourseCardLabel,
  lmsCourseFieldInput,
  lmsCourseFieldSelect,
  lmsCourseFieldSelectIcon,
  lmsCourseFieldSelectWrap,
  lmsCoursePills,
} from "./components/shopLmsStyles";
import { IFUNTOLOGY_FROM_SHOP_KEY } from "@/pages/ifuntology/constants/navItems";
import { buildPreviewPayload, buildSubmitPayload } from "./shopPayload";
import type { CatalogSelectedProduct } from "./shopPayload";
import { getLmsKitQuantityError } from "./utils/lmsKitQuantity";
import {
  getShopContactDetailsError,
  isShopContactDetailsComplete,
} from "./utils/shopContactDetails";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import swal from "sweetalert";
import { LMS_COURSE_TYPES } from "@/constants/lmsCourseTypes";
import {
  DEFAULT_LMS_KIT_VARIANT,
  type LmsKitVariant,
} from "@/constants/lmsKitVariants";
import { ImageUrl } from "@/utils/Functions";
import CountryStateCityFields from "@/components/inputs/CountryStateCityFields";

type LmsCourseItem = {
  key: string;
  courseType: string;
  kitVariant: LmsKitVariant;
  noOfKits: string;
  webSubscriptions: string;
};

const makeLmsCourseItem = (): LmsCourseItem => ({
  key: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  courseType: "Funtology",
  kitVariant: DEFAULT_LMS_KIT_VARIANT,
  noOfKits: "",
  webSubscriptions: "",
});

export default function ShopPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user.userData);

  useEffect(() => {
    document.title = "Shop • iFuntology Teacher";
  }, []);

  const [includeLms, setIncludeLms] = useState(true);
  const [includeEnrichment, setIncludeEnrichment] = useState(false);
  const [includeWtr, setIncludeWtr] = useState(false);

  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [shippingSameAsBilling, setShippingSameAsBilling] = useState(false);
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCountry, setShippingCountry] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingState, setShippingState] = useState("");
  const [shippingZip, setShippingZip] = useState("");

  const [lmsCourses, setLmsCourses] = useState<LmsCourseItem[]>([
    makeLmsCourseItem(),
  ]);

  // Enrichment
  const [catalogSelectedProducts, setCatalogSelectedProducts] = useState<
    Record<string, CatalogSelectedProduct>
  >({});
  const [catalogPickerOpen, setCatalogPickerOpen] = useState(false);
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [country, setCountry] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [zip, setZip] = useState("");
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  // WTR
  const [wtrNumberOfSeats, setWtrNumberOfSeats] = useState("0");
  const [wtrBookPrinting, setWtrBookPrinting] = useState(false);
  const [taxExempt, setTaxExempt] = useState(false);

  useEffect(() => {
    sessionStorage.removeItem(IFUNTOLOGY_FROM_SHOP_KEY);
  }, []);

  useEffect(() => {
    if (user?.email) {
      setEmail((prev) => prev || user.email);
    }
  }, [user?.email]);

  const contactFields = useMemo(
    () => ({
      organizationName: orgName,
      email,
      address,
      country,
      city,
      stateVal,
      streetAddress,
      zip,
      shippingAddress,
      shippingCountry,
      shippingCity,
      shippingState,
      shippingZip,
      shippingSameAsBilling,
    }),
    [
      orgName,
      email,
      address,
      country,
      city,
      stateVal,
      streetAddress,
      zip,
      shippingAddress,
      shippingCountry,
      shippingCity,
      shippingState,
      shippingZip,
      shippingSameAsBilling,
    ]
  );

  const contactDetailsComplete = useMemo(
    () => isShopContactDetailsComplete(contactFields),
    [contactFields]
  );

  const contactDetailsError = useMemo(
    () => getShopContactDetailsError(contactFields),
    [contactFields]
  );

  const guardSectionToggle = (
    value: boolean,
    setter: (next: boolean) => void
  ) => {
    setter(value);
  };

  useEffect(() => {
    const prefillCourseType = (location.state as { prefillLmsCourseType?: string })
      ?.prefillLmsCourseType;
    if (!prefillCourseType) return;

    setLmsCourses([
      {
        key: `${Date.now()}-prefill`,
        courseType: prefillCourseType,
        kitVariant: DEFAULT_LMS_KIT_VARIANT,
        noOfKits: "12",
        webSubscriptions: "12",
      },
    ]);
  }, [location.state]);

  useEffect(() => {
    const prefillCourseType = (location.state as { prefillLmsCourseType?: string })
      ?.prefillLmsCourseType;
    if (prefillCourseType) {
      setIncludeLms(true);
    }
  }, [location.state]);

  useEffect(() => {
    const prefillWtr = (location.state as { prefillWtr?: boolean })?.prefillWtr;
    if (!prefillWtr) return;

    setIncludeLms(false);
    setIncludeEnrichment(false);
    setIncludeWtr(true);
  }, [location.state]);

  const [pricing, setPricing] = useState<any>(null);
  const [eligibility, setEligibility] = useState<ShopEligibility | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);

  const { data: categoriesData } = useGetCategoriesQuery({});
  const [checkCoupon, { isLoading: checkingCoupon }] = useCheckCouponMutation();
  const [previewShopPricing, { isLoading: previewLoading }] =
    usePreviewShopPricingMutation();
  const [createShopQuote, { isLoading: quoteLoading }] =
    useCreateShopQuoteMutation();

  const updateLmsCourseItem = (
    key: string,
    field: "courseType" | "kitVariant" | "noOfKits" | "webSubscriptions",
    value: string
  ) => {
    setLmsCourses((rows) =>
      rows.map((r) => {
        if (r.key !== key) return r;
        if (field === "noOfKits") {
          return { ...r, noOfKits: value, webSubscriptions: value };
        }
        if (field === "webSubscriptions") {
          return { ...r, webSubscriptions: value, noOfKits: value };
        }
        return { ...r, [field]: value };
      })
    );
  };

  const addLmsCourseItem = () =>
    setLmsCourses((rows) => [...rows, makeLmsCourseItem()]);
  const removeLmsCourseItem = (key: string) =>
    setLmsCourses((rows) =>
      rows.length <= 1 ? rows : rows.filter((r) => r.key !== key)
    );

  const handleCatalogProductUpdate = (
    productId: string,
    product: CatalogSelectedProduct | null
  ) => {
    setCatalogSelectedProducts((prev) => {
      if (!product) {
        const next = { ...prev };
        delete next[productId];
        return next;
      }
      return { ...prev, [productId]: product };
    });
    if (product) {
      setIncludeEnrichment(true);
    }
  };

  const enrichmentSubtotalForCoupon = useMemo(() => {
    return Object.values(catalogSelectedProducts).reduce((sum, item) => {
      const qty = Number(item.quantity);
      if (qty <= 0) return sum;
      return sum + item.price * qty;
    }, 0);
  }, [catalogSelectedProducts]);

  const handleApplyCoupon = async () => {
    const code = coupon?.trim();
    if (!code) return;
    try {
      const res: any = await checkCoupon({
        code,
        amount: enrichmentSubtotalForCoupon.toFixed(2),
      }).unwrap();
      if (res?.status && res?.data) {
        setAppliedCoupon(code.toUpperCase());
      } else {
        setAppliedCoupon(null);
        setPreviewError(res?.message || "Invalid coupon code");
      }
    } catch (err: any) {
      setAppliedCoupon(null);
      setPreviewError(
        err?.data?.message || err?.message || "Invalid or expired coupon"
      );
    }
  };

  const formState = useMemo(
    () => ({
      organizationName: orgName,
      email,
      address,
      shippingAddress,
      shippingCountry,
      shippingCity,
      shippingState,
      shippingZip,
      shippingSameAsBilling,
      includeLms,
      includeEnrichment,
      includeWtr,
      lmsCourses,
      products: [] as { id: string; quantity: string }[],
      catalogSelectedProducts,
      city,
      stateVal,
      country,
      streetAddress,
      zip,
      appliedCoupon,
      wtrNumberOfSeats,
      wtrBookPrinting,
      taxExempt,
    }),
    [
      orgName,
      email,
      address,
      shippingAddress,
      shippingCountry,
      shippingCity,
      shippingState,
      shippingZip,
      shippingSameAsBilling,
      includeLms,
      includeEnrichment,
      includeWtr,
      lmsCourses,
      catalogSelectedProducts,
      city,
      stateVal,
      country,
      streetAddress,
      zip,
      appliedCoupon,
      wtrNumberOfSeats,
      wtrBookPrinting,
      taxExempt,
    ]
  );

  const previewPayload = useMemo(
    () => buildPreviewPayload(formState),
    [formState]
  );
  const submitPayloadResult = useMemo(
    () => buildSubmitPayload(formState),
    [formState]
  );

  const canPreview = Boolean(previewPayload);
  const canSubmit = contactDetailsComplete && Boolean(submitPayloadResult.payload);
  const submitBlockReason = !contactDetailsComplete
    ? "Complete organization and contact details before you can pay or request a quote."
    : submitPayloadResult.error;
  const contactPreviewError = contactDetailsError;
  const pricingPanelError = previewError;

  const lmsConflictTypes = useMemo(
    () => new Set(eligibility?.lmsConflicts?.map((c) => c.courseType) ?? []),
    [eligibility]
  );

  const runPreview = useCallback(async () => {
    if (!previewPayload) {
      setPricing(null);
      setEligibility(null);
      setPreviewError(
        "Enable at least one section with valid selections to preview pricing."
      );
      return;
    }

    setPreviewError(null);
    try {
      const res: any = await previewShopPricing(previewPayload).unwrap();
      if (res?.status && res?.data) {
        const { eligibility: elig, ...pricingData } = res.data;
        setPricing(pricingData);
        setEligibility(elig ?? null);
      } else {
        setPricing(null);
        setEligibility(null);
        setPreviewError(res?.message || "Could not calculate pricing");
      }
    } catch (err: any) {
      setPricing(null);
      setEligibility(null);
      setPreviewError(
        err?.data?.message || err?.message || "Failed to fetch pricing preview"
      );
    }
  }, [previewPayload, previewShopPricing]);

  const handlePayNow = () => {
    const { payload, error } = submitPayloadResult;
    if (error || !payload) {
      swal("Error", error || "Complete all required fields", "error");
      return;
    }
    if (!eligibility?.canProceed) {
      swal(
        "Not eligible",
        eligibility?.messages?.join("\n") ||
        "You cannot purchase the selected bundle",
        "error"
      );
      return;
    }
    if (!pricing?.grandTotal) {
      swal("Error", "Update pricing before paying", "error");
      return;
    }
    navigate("/shop/payment", {
      state: { selection: payload, total: pricing.grandTotal },
    });
  };

  const handleRequestQuote = async () => {
    const { payload, error } = submitPayloadResult;
    if (error || !payload) {
      swal("Error", error || "Complete all required fields", "error");
      return;
    }
    if (!eligibility?.canProceed) {
      swal(
        "Not eligible",
        eligibility?.messages?.join("\n") ||
        "You cannot request a quote for the selected bundle",
        "error"
      );
      return;
    }
    try {
      const res: any = await createShopQuote(payload).unwrap();
      if (res?.status) {
        dispatch(quoteSlice.util.invalidateTags(["Quotes"]));
        setQuoteDialogOpen(true);
      } else {
        swal("Error", res?.message || "Failed to submit quote", "error");
      }
    } catch (err: any) {
      swal(
        "Error",
        err?.data?.message || err?.message || "Failed to submit quote",
        "error"
      );
    }
  };

  useEffect(() => {
    if (!canPreview) {
      setPricing(null);
      setEligibility(null);
      if (!previewPayload) {
        setPreviewError(null);
      }
      return;
    }
    const timer = setTimeout(() => {
      runPreview();
    }, 700);
    return () => clearTimeout(timer);
  }, [canPreview, runPreview, previewPayload]);

  return (
    <DashboardWithSidebarLayout>
      <section className="mx-auto w-full max-w-[1500px] space-y-6 px-1 pb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Shop
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Build a custom bundle from workforce readiness courses, enrichment
            store products, &amp; write to read. Select any combination and preview
            pricing before checkout or requesting a quote.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <Card className="rounded-2xl border border-border/40 bg-white p-6 shadow-sm dark:bg-card">
              <div className="space-y-5">
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    Organization &amp; contact details
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Required for checkout and quotes. You can preview pricing while filling these in.
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-foreground" htmlFor="shop-org-name">
                    Organization Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="shop-org-name"
                    className={cn(
                      "mt-2 h-12 rounded-xl border-0 bg-muted/50 px-4 text-sm shadow-none",
                      contactPreviewError && !orgName.trim() && "ring-2 ring-rose-400"
                    )}
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="School or Organization Name..."
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium text-foreground" htmlFor="shop-email">
                      Email Address <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="shop-email"
                      type="email"
                      className="mt-2 h-12 rounded-xl border-0 bg-muted/50 px-4 text-sm shadow-none"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="teacher@school.edu"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-foreground" htmlFor="shop-address">
                      Organization Address <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="shop-address"
                      className="mt-2 h-12 rounded-xl border-0 bg-muted/50 px-4 text-sm shadow-none"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Organization address"
                    />
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground">Organization location</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Billing and organization contact location.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <CountryStateCityFields
                    idPrefix="shop-billing"
                    country={country}
                    state={stateVal}
                    city={city}
                    onCountryChange={setCountry}
                    onStateChange={setStateVal}
                    onCityChange={setCity}
                    required
                    variant="shop"
                    fieldClassName="space-y-0"
                    labelClassName="text-sm font-medium text-foreground"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium text-foreground" htmlFor="shop-zip">
                      Zip Code <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="shop-zip"
                      className="mt-2 h-12 rounded-xl border-0 bg-muted/50 px-4 text-sm shadow-none"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      placeholder="99503"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-foreground" htmlFor="shop-street">
                      Street Address <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="shop-street"
                      className="mt-2 h-12 rounded-xl border-0 bg-muted/50 px-4 text-sm shadow-none"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      placeholder="142 W 34th Ave"
                    />
                  </div>
                </div>

                {contactPreviewError && (
                  <p className="text-xs font-medium text-rose-600">{contactPreviewError}</p>
                )}
              </div>
            </Card>

            <Card className="rounded-2xl border border-border/40 bg-white p-6 shadow-sm dark:bg-card">
              <div className="space-y-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-foreground">
                      Shipping address
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Where physical kits and enrichment products should be delivered.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-muted/40 px-4 py-3">
                    <Switch
                      id="shop-shipping-same-as-billing"
                      checked={shippingSameAsBilling}
                      onCheckedChange={setShippingSameAsBilling}
                    />
                    <Label
                      htmlFor="shop-shipping-same-as-billing"
                      className="text-sm font-medium text-foreground"
                    >
                      Same as billing address
                    </Label>
                  </div>
                </div>

                {shippingSameAsBilling ? (
                  <p className="rounded-xl bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                    Shipping will use your organization billing address above.
                  </p>
                ) : (
                  <>
                    <div>
                      <Label
                        className="text-sm font-medium text-foreground"
                        htmlFor="shop-shipping-address"
                      >
                        Address <span className="text-rose-500">*</span>
                      </Label>
                      <Textarea
                        id="shop-shipping-address"
                        className="mt-2 min-h-[96px] rounded-xl border-0 bg-muted/50 px-4 py-3 text-sm shadow-none"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        placeholder="Building, suite, or delivery instructions"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <CountryStateCityFields
                        idPrefix="shop-shipping"
                        country={shippingCountry}
                        state={shippingState}
                        city={shippingCity}
                        onCountryChange={setShippingCountry}
                        onStateChange={setShippingState}
                        onCityChange={setShippingCity}
                        required
                        variant="shop"
                        fieldClassName="space-y-0"
                        labelClassName="text-sm font-medium text-foreground"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <Label className="text-sm font-medium text-foreground" htmlFor="shop-shipping-zip">
                          Zip Code <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                          id="shop-shipping-zip"
                          className="mt-2 h-12 rounded-xl border-0 bg-muted/50 px-4 text-sm shadow-none"
                          value={shippingZip}
                          onChange={(e) => setShippingZip(e.target.value)}
                          placeholder="99503"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>

            <ShopSectionCard
              variant="lms"
              title="Workforce Readiness Courses"
              description="Learning Management System kits and interactive digital curriculum"
              icon={GraduationCap}
              enabled={includeLms}
              onToggle={(value) => guardSectionToggle(value, setIncludeLms)}
              imageSrc={ImageUrl("shop-section-1.png")}
              backgroundVectorSrc={ImageUrl("vector-section-1.png")}
              tagline="Discover More. Learn More. Become More."
              footer={
                <div className="mt-6 grid max-w-[360px] grid-cols-2 gap-3">
                  {lmsCoursePills.map((pill) => (
                    <Link
                      key={pill.label}
                      to={pill.link}
                      onClick={() => sessionStorage.setItem(IFUNTOLOGY_FROM_SHOP_KEY, "1")}
                      className={cn(
                        "rounded-md px-3 py-3 text-center text-sm font-bold tracking-wide text-white font-serif transition-opacity hover:opacity-90",
                        pill.className
                      )}
                    >
                      {pill.label}
                    </Link>
                  ))}
                </div>
              }
            >
              {lmsCourses.map((row, idx) => {
                const qtyError = getLmsKitQuantityError(row.noOfKits);
                return (
                  <div
                    key={row.key}
                    className={cn(
                      lmsCourseCard,
                      lmsConflictTypes.has(row.courseType) && "ring-2 ring-amber-400"
                    )}
                  >
                    {lmsConflictTypes.has(row.courseType) && (
                      <p className="mb-3 flex items-center gap-1.5 text-xs text-amber-800">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Active subscription or duplicate for {row.courseType}
                      </p>
                    )}
                    <div className="mb-5 flex items-center justify-between">
                      <span className={lmsCourseCardLabel}>Course {idx + 1}</span>
                      {lmsCourses.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLmsCourseItem(row.key)}
                          className="text-xs font-semibold text-rose-600 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div className="min-w-0">
                        <label className={lmsCourseCardLabel}>Course Type</label>
                        <div className={lmsCourseFieldSelectWrap}>
                          <select
                            className={lmsCourseFieldSelect}
                            value={row.courseType}
                            onChange={(e) =>
                              updateLmsCourseItem(row.key, "courseType", e.target.value)
                            }
                          >
                            {LMS_COURSE_TYPES.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className={lmsCourseFieldSelectIcon} aria-hidden />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <label className={lmsCourseCardLabel}>Kit type</label>
                        <LmsKitVariantSelect
                          value={row.kitVariant}
                          onChange={(kitVariant) =>
                            updateLmsCourseItem(row.key, "kitVariant", kitVariant)
                          }
                        />
                      </div>
                      <div className="min-w-0">
                        <label className={lmsCourseCardLabel}>Number of kits</label>
                        <input
                          type="number"
                          min={1}
                          className={cn(
                            lmsCourseFieldInput,
                            qtyError && "ring-2 ring-rose-400"
                          )}
                          value={row.noOfKits}
                          onChange={(e) =>
                            updateLmsCourseItem(row.key, "noOfKits", e.target.value)
                          }
                          placeholder="12, 24, 15, 30…"
                        />
                      </div>
                      <div className="min-w-0">
                        <label className={lmsCourseCardLabel}>Interactive Qty</label>
                        <input
                          type="number"
                          min={1}
                          className={cn(
                            lmsCourseFieldInput,
                            qtyError && "ring-2 ring-rose-400"
                          )}
                          value={row.webSubscriptions}
                          onChange={(e) =>
                            updateLmsCourseItem(
                              row.key,
                              "webSubscriptions",
                              e.target.value
                            )
                          }
                          placeholder="12, 24, 15, 30…"
                        />
                      </div>
                      {qtyError && (
                        <p className="text-xs font-medium text-rose-600 sm:col-span-2">
                          {qtyError}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}

              <div className="flex justify-end pt-2">
                <ShopAddButton label="Add Course" onClick={addLmsCourseItem} />
              </div>
            </ShopSectionCard>

            <ShopSectionCard
              variant="enrichment"
              title="Shop On Enrichment Store"
              description=""
              icon={Store}
              enabled={includeEnrichment}
              onToggle={(value) => guardSectionToggle(value, setIncludeEnrichment)}
              imageSrc={ImageUrl("shop-section-2.png")}
              backgroundVectorSrc={ImageUrl("vector-section-1.png")}
              tagline="Kits Related Resources"
              onTaglineClick={() => setCatalogPickerOpen(true)}
            >
              <div className="flex justify-end">
                <ShopAddButton
                  label="Add Product"
                  onClick={() => setCatalogPickerOpen(true)}
                />
              </div>
            </ShopSectionCard>

            <ShopSectionCard
              variant="wtr"
              title="Write to Read"
              description="Teacher subscription for student book authoring"
              icon={PenTool}
              enabled={includeWtr}
              onToggle={(value) => guardSectionToggle(value, setIncludeWtr)}
              imageSrc={ImageUrl("shop-section-3.png")}
              tagline="Everything You Need to Learn Beyond Limits"
            >
              <p className="rounded-lg bg-white/90 px-3 py-2 text-xs text-slate-700">
                Write to Read is an interactive literacy platform that brings story-building, creative writing, reading comprehension, and imagination together in one engaging learning experience.
                Students participate in virtual classrooms, connect through teacher-to-class-chats, create and print their own books, and develop
                lifelong literacy skills with exciting educational tools and activites. Available for just $4.99 per student, per month.
              </p>
              <div>
                <label className={shopFieldLabel}>No of Student Seats</label>
                <input
                  type="number"
                  min={1}
                  className={shopFieldInput}
                  placeholder="e.g. 24"
                  value={wtrNumberOfSeats}
                  onChange={(e) => setWtrNumberOfSeats(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-white/15 px-4 py-3">
                <Switch
                  id="wtr-printing"
                  checked={wtrBookPrinting}
                  onCheckedChange={setWtrBookPrinting}
                  className="data-[state=checked]:bg-[#84cc16] data-[state=unchecked]:bg-white/40"
                />
                <Label htmlFor="wtr-printing" className="text-sm font-medium text-white">
                  Include book printing requests
                </Label>
              </div>
            </ShopSectionCard>
          </div>

          <div className="xl:col-span-1">
            <ShopPricingPanel
              pricing={pricing}
              eligibility={eligibility}
              isLoading={previewLoading}
              error={pricingPanelError}
              onRefresh={runPreview}
              canPreview={canPreview}
              canSubmit={canSubmit}
              submitBlockReason={submitBlockReason}
              taxExempt={taxExempt}
              onTaxExemptChange={setTaxExempt}
              onPayNow={handlePayNow}
              onRequestQuote={handleRequestQuote}
              isQuoteLoading={quoteLoading}
            />
          </div>
        </div>

        <EnrichmentProductPickerDialog
          open={catalogPickerOpen}
          onOpenChange={setCatalogPickerOpen}
          categories={
            Array.isArray(categoriesData?.data) ? categoriesData.data : []
          }
          selectedProducts={catalogSelectedProducts}
          onUpdateProduct={handleCatalogProductUpdate}
        />

        <Dialog open={quoteDialogOpen} onOpenChange={setQuoteDialogOpen}>
          <DialogContent>
            <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4">
              <div className="rounded-full bg-green-500/10 p-4">
                <Check className="h-8 w-8 text-green-500" />
              </div>
              <DialogTitle>Quote submitted</DialogTitle>
              <DialogDescription className="text-center">
                Your combined shop quote has been submitted. An admin will review
                it and you will be notified when it is approved.
              </DialogDescription>
              <Button
                className="w-full"
                onClick={() => {
                  setQuoteDialogOpen(false);
                  navigate("/quotes");
                }}
              >
                View quotes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </section>
    </DashboardWithSidebarLayout>
  );
}
