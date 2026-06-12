import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Check, GraduationCap, PenTool, Store } from "lucide-react";
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
import { useGetCategoriesQuery } from "@/redux/services/apiSlices/categorySlice";
import {
  useGetProductsQuery,
  useLazyGetProductByIdQuery,
  useLazyGetProductsByCategoryQuery,
  useLazyGetProductByCourseTypeQuery,
} from "@/redux/services/apiSlices/productSlice";
import { useGetCharacterCatalogQuery } from "@/redux/services/apiSlices/characterSlice";
import { useCheckCouponMutation } from "@/redux/services/apiSlices/couponSlice";
import { quoteSlice } from "@/redux/services/apiSlices/quoteSlice";
import {
  ShopEligibility,
  useCreateShopQuoteMutation,
  usePreviewShopPricingMutation,
} from "@/redux/services/apiSlices/shopSlice";
import ShopPricingPanel from "./components/ShopPricingPanel";
import ShopSectionPreview, {
  type ShopPreviewItem,
} from "./components/ShopSectionPreview";
import { buildPreviewPayload, buildSubmitPayload } from "./shopPayload";
import { pickRandom, resolveAssetUrl } from "./utils/resolveAssetUrl";
import { UPLOADS_URL } from "@/constants/api";
import { cn } from "@/lib/utils";
import swal from "sweetalert";
import { LMS_COURSE_TYPES } from "@/constants/lmsCourseTypes";

type LmsCourseItem = {
  key: string;
  courseType: string;
  noOfKits: string;
  webSubscriptions: string;
};


const makeLmsCourseItem = (): LmsCourseItem => ({
  key: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  courseType: "Funtology",
  noOfKits: "",
  webSubscriptions: "",
});

export default function ShopPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user.userData);

  useEffect(() => {
    document.title = "Shop • iFuntology Teacher";
  }, []);

  useEffect(() => {
    if (user?.email) {
      setLmsEmail((prev) => prev || user.email);
    }
  }, [user?.email]);

  const [includeLms, setIncludeLms] = useState(true);
  const [includeEnrichment, setIncludeEnrichment] = useState(false);
  const [includeWtr, setIncludeWtr] = useState(false);

  const [orgName, setOrgName] = useState("");

  // LMS
  const [lmsEmail, setLmsEmail] = useState("");
  const [lmsAddress, setLmsAddress] = useState("");
  const [lmsSubscriptionType, setLmsSubscriptionType] = useState("monthly");
  const [lmsCourses, setLmsCourses] = useState<LmsCourseItem[]>([
    makeLmsCourseItem(),
  ]);

  // Enrichment
  const [products, setProducts] = useState([
    { id: "", category: "", product: "", quantity: "" },
  ]);
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [country, setCountry] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [zip, setZip] = useState("");
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  // WTR
  const [wtrSubscriptionType, setWtrSubscriptionType] = useState("yearly");
  const [wtrNumberOfSeats, setWtrNumberOfSeats] = useState("1");
  const [wtrBookPrinting, setWtrBookPrinting] = useState(false);

  const [pricing, setPricing] = useState<any>(null);
  const [eligibility, setEligibility] = useState<ShopEligibility | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);

  const { data: categoriesData } = useGetCategoriesQuery({});
  const [triggerGetProducts] = useLazyGetProductsByCategoryQuery();
  const [triggerGetProductByCourseType] = useLazyGetProductByCourseTypeQuery();
  const [triggerGetProductById] = useLazyGetProductByIdQuery();
  const { data: enrichmentProductsData, isLoading: enrichmentProductsLoading } =
    useGetProductsQuery({ page: 1, limit: 32 });
  const { data: characterCatalog, isLoading: characterCatalogLoading } =
    useGetCharacterCatalogQuery();
  const [checkCoupon, { isLoading: checkingCoupon }] = useCheckCouponMutation();
  const [previewShopPricing, { isLoading: previewLoading }] =
    usePreviewShopPricingMutation();
  const [createShopQuote, { isLoading: quoteLoading }] =
    useCreateShopQuoteMutation();

  const [categoryProducts, setCategoryProducts] = useState<{
    [key: string]: any[];
  }>({});

  const [lmsPreviewItems, setLmsPreviewItems] = useState<ShopPreviewItem[]>([]);
  const [lmsImagesLoading, setLmsImagesLoading] = useState(false);
  const [enrichmentPreviewItems, setEnrichmentPreviewItems] = useState<
    ShopPreviewItem[]
  >([]);
  const [productThumbnails, setProductThumbnails] = useState<
    Record<string, { name: string; image?: string }>
  >({});

  const updateLmsCourseItem = (
    key: string,
    field: "courseType" | "noOfKits" | "webSubscriptions",
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

  const handleProductChange = async (
    index: number,
    field: "category" | "product" | "quantity",
    value: string
  ) => {
    const updated = [...products];
    updated[index] = { ...updated[index], [field]: value };

    if (field === "category") {
      updated[index].product = "";
      updated[index].id = "";
      try {
        const res: any = await triggerGetProducts({
          categoryId: value,
        }).unwrap();
        const list = Array.isArray(res?.data) ? res.data : [];
        setCategoryProducts((prev) => ({
          ...prev,
          [value]: list,
        }));
        const selectedId = updated[index].product;
        if (selectedId) {
          const match = list.find(
            (p: any) => String(p._id) === String(selectedId)
          );
          if (match?.image) {
            setProductThumbnails((prev) => ({
              ...prev,
              [selectedId]: { name: match.name, image: match.image },
            }));
          }
        }
      } catch {
        /* ignore */
      }
    }
    if (field === "product") {
      updated[index].id = value;
      if (value) {
        const fromList = categoryProducts[updated[index].category]?.find(
          (p: any) => String(p._id) === String(value)
        );
        if (fromList?.image) {
          setProductThumbnails((prev) => ({
            ...prev,
            [value]: { name: fromList.name, image: fromList.image },
          }));
        } else {
          triggerGetProductById(value)
            .unwrap()
            .then((res: any) => {
              const prod = res?.data;
              if (prod?._id) {
                setProductThumbnails((prev) => ({
                  ...prev,
                  [String(prod._id)]: {
                    name: prod.name,
                    image: prod.image,
                  },
                }));
              }
            })
            .catch(() => {
              /* ignore */
            });
        }
      }
    }
    setProducts(updated);
  };

  const addProduct = () =>
    setProducts([...products, { id: "", category: "", product: "", quantity: "" }]);

  const removeProduct = (index: number) =>
    setProducts(products.filter((_, i) => i !== index));

  const enrichmentSubtotalForCoupon = useMemo(() => {
    return products
      .filter((p) => p.category && p.product && Number(p.quantity) > 0)
      .reduce((sum, p) => {
        const list = categoryProducts[p.category] || [];
        const prod = list.find((x: any) => x._id === p.product);
        const unit = Number(prod?.price ?? 0);
        return sum + unit * Number(p.quantity);
      }, 0);
  }, [products, categoryProducts]);

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
      includeLms,
      includeEnrichment,
      includeWtr,
      lmsEmail,
      lmsAddress,
      lmsSubscriptionType,
      lmsCourses,
      products,
      city,
      stateVal,
      country,
      streetAddress,
      zip,
      appliedCoupon,
      wtrSubscriptionType,
      wtrNumberOfSeats,
      wtrBookPrinting,
    }),
    [
      orgName,
      includeLms,
      includeEnrichment,
      includeWtr,
      lmsEmail,
      lmsAddress,
      lmsSubscriptionType,
      lmsCourses,
      products,
      city,
      stateVal,
      country,
      streetAddress,
      zip,
      appliedCoupon,
      wtrSubscriptionType,
      wtrNumberOfSeats,
      wtrBookPrinting,
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
  const canSubmit = Boolean(submitPayloadResult.payload);
  const submitBlockReason = submitPayloadResult.error;

  const lmsConflictTypes = useMemo(
    () => new Set(eligibility?.lmsConflicts?.map((c) => c.courseType) ?? []),
    [eligibility]
  );

  const runPreview = useCallback(async () => {
    if (!previewPayload) {
      setPricing(null);
      setEligibility(null);
      setPreviewError(
        "Complete organization name and at least one enabled section to preview pricing."
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
      return;
    }
    const timer = setTimeout(() => {
      runPreview();
    }, 700);
    return () => clearTimeout(timer);
  }, [canPreview, runPreview, previewPayload]);

  useEffect(() => {
    const courseTypes = includeLms
      ? Array.from(new Set(lmsCourses.map((c) => c.courseType).filter(Boolean)))
      : pickRandom([...LMS_COURSE_TYPES], 4);

    let cancelled = false;

    (async () => {
      setLmsImagesLoading(true);
      const items: ShopPreviewItem[] = [];

      for (const courseType of courseTypes) {
        try {
          const res: any = await triggerGetProductByCourseType({
            courseType,
          }).unwrap();
          const product = res?.data;
          const src = resolveAssetUrl(product?.image);
          if (src) {
            items.push({
              src,
              label: courseType,
              alt: product?.name ?? courseType,
            });
          }
        } catch {
          /* no kit image for this course */
        }
      }

      if (!cancelled) {
        setLmsPreviewItems(items.slice(0, 4));
        setLmsImagesLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [includeLms, lmsCourses, triggerGetProductByCourseType]);

  useEffect(() => {
    const docs =
      enrichmentProductsData?.data?.docs?.filter((p: any) => p?.image) ?? [];
    if (!docs.length) {
      setEnrichmentPreviewItems([]);
      return;
    }
    setEnrichmentPreviewItems(
      pickRandom(docs, 4).map((p: any) => ({
        src: UPLOADS_URL + p.image,
        label: p.name,
        alt: p.name,
      }))
    );
  }, [enrichmentProductsData]);

  const wtrPreviewItems = useMemo((): ShopPreviewItem[] => {
    if (!characterCatalog?.length) return [];

    const pool: ShopPreviewItem[] = [];
    for (const category of characterCatalog) {
      const iconSrc = resolveAssetUrl(category.iconPath);
      if (iconSrc) {
        pool.push({
          src: iconSrc,
          label: category.name,
          alt: category.iconTooltip ?? category.name,
        });
      }
      for (const variation of category.variations ?? []) {
        const src = resolveAssetUrl(variation.imagePath);
        if (src) {
          pool.push({
            src,
            label: variation.label || category.name,
            alt: variation.label || category.name,
          });
        }
      }
    }

    return pickRandom(pool, 4);
  }, [characterCatalog]);

  const SectionHeader = ({
    title,
    description,
    icon: Icon,
    enabled,
    onToggle,
  }: {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    enabled: boolean;
    onToggle: (v: boolean) => void;
  }) => (
    <div className="flex items-start justify-between gap-4">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Label htmlFor={`toggle-${title}`} className="text-xs text-muted-foreground">
          Include
        </Label>
        <Switch
          id={`toggle-${title}`}
          checked={enabled}
          onCheckedChange={onToggle}
        />
      </div>
    </div>
  );

  return (
    <DashboardWithSidebarLayout>
      <section className="mx-auto w-full max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold">Shop</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Build a custom bundle from Workforce Readiness Courses, Enrichment
            Store products, and Write to Read. Select any combination and preview
            pricing before checkout or requesting a quote.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Card className="rounded-2xl border border-border/60 p-5">
              <Label className="text-xs font-medium text-muted-foreground">
                Organization name *
              </Label>
              <Input
                className="mt-1"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="School or organization name"
              />
            </Card>

            {/* LMS */}
            <Card
              className={cn(
                "rounded-2xl border border-border/60 p-5 transition-opacity",
                !includeLms && "opacity-60"
              )}
            >
              <SectionHeader
                title="Workforce Readiness Courses"
                description="LMS kits and interactive digital curriculum"
                icon={GraduationCap}
                enabled={includeLms}
                onToggle={setIncludeLms}
              />
              <ShopSectionPreview
                items={lmsPreviewItems}
                loading={lmsImagesLoading}
                className={cn(!includeLms && "opacity-70")}
              />

              {includeLms && (
                <div className="mt-5 space-y-4 border-t border-border/40 pt-5">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Email *
                      </Label>
                      <Input
                        className="mt-1"
                        value={lmsEmail}
                        onChange={(e) => setLmsEmail(e.target.value)}
                        placeholder="Contact email"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Address *
                      </Label>
                      <Input
                        className="mt-1"
                        value={lmsAddress}
                        onChange={(e) => setLmsAddress(e.target.value)}
                        placeholder="Organization address"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Subscription type (all courses)
                    </Label>
                    <select
                      className="mt-1 w-full rounded-md border border-border/60 bg-background p-2 text-sm"
                      value={lmsSubscriptionType}
                      onChange={(e) => setLmsSubscriptionType(e.target.value)}
                    >
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>

                  {lmsCourses.map((row, idx) => (
                    <div
                      key={row.key}
                      className={cn(
                        "rounded-xl border p-4 space-y-3",
                        lmsConflictTypes.has(row.courseType)
                          ? "border-amber-500/50 bg-amber-500/5"
                          : "border-border/50"
                      )}
                    >
                      {lmsConflictTypes.has(row.courseType) && (
                        <p className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Active subscription or duplicate for {row.courseType}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">
                          Course {idx + 1}
                        </span>
                        {lmsCourses.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-8 px-2 text-xs"
                            onClick={() => removeLmsCourseItem(row.key)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Course type
                          </Label>
                          <select
                            className="mt-1 w-full rounded-md border border-border/60 bg-background p-2 text-sm"
                            value={row.courseType}
                            onChange={(e) =>
                              updateLmsCourseItem(
                                row.key,
                                "courseType",
                                e.target.value
                              )
                            }
                          >
                            {LMS_COURSE_TYPES.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Interactive curriculum qty
                          </Label>
                          <input
                            type="number"
                            min={1}
                            className="mt-1 w-full rounded-md border border-border/60 bg-background p-2 text-sm"
                            value={row.webSubscriptions}
                            onChange={(e) =>
                              updateLmsCourseItem(
                                row.key,
                                "webSubscriptions",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Number of kits
                          </Label>
                          <input
                            type="number"
                            min={1}
                            className="mt-1 w-full rounded-md border border-border/60 bg-background p-2 text-sm"
                            value={row.noOfKits}
                            onChange={(e) =>
                              updateLmsCourseItem(
                                row.key,
                                "noOfKits",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addLmsCourseItem}>
                    Add course
                  </Button>
                </div>
              )}
            </Card>

            {/* Enrichment */}
            <Card
              className={cn(
                "rounded-2xl border border-border/60 p-5 transition-opacity",
                !includeEnrichment && "opacity-60"
              )}
            >
              <SectionHeader
                title="Enrichment store"
                description="Physical and digital enrichment products"
                icon={Store}
                enabled={includeEnrichment}
                onToggle={setIncludeEnrichment}
              />
              <ShopSectionPreview
                items={enrichmentPreviewItems}
                loading={enrichmentProductsLoading}
                className={cn(!includeEnrichment && "opacity-70")}
              />

              {includeEnrichment && (
                <div className="mt-5 space-y-4 border-t border-border/40 pt-5">
                  {products.map((item, index) => {
                    const selectedProduct =
                      item.category && item.product
                        ? categoryProducts[item.category]?.find(
                            (p: any) => String(p._id) === String(item.product)
                          )
                        : null;
                    const thumbnailMeta =
                      item.product ? productThumbnails[item.product] : null;
                    const selectedProductName =
                      thumbnailMeta?.name ?? selectedProduct?.name;
                    const selectedProductImage = resolveAssetUrl(
                      thumbnailMeta?.image ?? selectedProduct?.image
                    );

                    return (
                    <div
                      key={index}
                      className="rounded-xl border border-border/50 p-4 space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        {item.product && (
                          <div className="shrink-0">
                            <div className="h-16 w-16 overflow-hidden rounded-lg border border-border/50 bg-muted/30">
                              {selectedProductImage ? (
                                <img
                                  src={selectedProductImage}
                                  alt={selectedProductName ?? "Selected product"}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-[9px] text-muted-foreground">
                                  …
                                </div>
                              )}
                            </div>
                            {selectedProductName && (
                              <p className="mt-1 max-w-16 truncate text-[9px] text-muted-foreground">
                                {selectedProductName}
                              </p>
                            )}
                          </div>
                        )}
                        <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 md:grid-cols-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Category
                          </Label>
                          <select
                            className="mt-1 w-full rounded-md border border-border/60 bg-background p-2 text-sm"
                            value={item.category}
                            onChange={(e) =>
                              handleProductChange(index, "category", e.target.value)
                            }
                          >
                            <option value="">Select category</option>
                            {Array.isArray(categoriesData?.data) &&
                              categoriesData.data
                                .filter(
                                  (cat: any) =>
                                    cat.title !== "Interactive STEM Kits"
                                )
                                .map((cat: any) => (
                                  <option key={cat._id} value={cat._id}>
                                    {cat.title}
                                  </option>
                                ))}
                          </select>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Product
                          </Label>
                          <select
                            className="mt-1 w-full rounded-md border border-border/60 bg-background p-2 text-sm"
                            value={item.product}
                            onChange={(e) =>
                              handleProductChange(index, "product", e.target.value)
                            }
                          >
                            <option value="">Select product</option>
                            {item.category &&
                              categoryProducts[item.category]?.map((prod: any) => (
                                <option key={prod._id} value={prod._id}>
                                  {prod.name}
                                </option>
                              ))}
                          </select>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Quantity
                          </Label>
                          <input
                            type="number"
                            min={1}
                            className="mt-1 w-full rounded-md border border-border/60 bg-background p-2 text-sm"
                            value={item.quantity}
                            onChange={(e) =>
                              handleProductChange(index, "quantity", e.target.value)
                            }
                          />
                        </div>
                        </div>
                      </div>
                      {products.length > 1 && (
                        <div className="text-right">
                          <button
                            type="button"
                            onClick={() => removeProduct(index)}
                            className="text-xs text-red-500 hover:underline"
                          >
                            Remove product
                          </button>
                        </div>
                      )}
                    </div>
                    );
                  })}
                  <Button type="button" variant="outline" onClick={addProduct}>
                    Add product
                  </Button>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Country</Label>
                      <Input
                        className="mt-1"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="For quote / shipping later"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">City</Label>
                      <Input
                        className="mt-1"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">State</Label>
                      <Input
                        className="mt-1"
                        value={stateVal}
                        onChange={(e) => setStateVal(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Zip code</Label>
                      <Input
                        className="mt-1"
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-xs text-muted-foreground">
                        Street address
                      </Label>
                      <Input
                        className="mt-1"
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                      />
                    </div>
                    {/* <div className="md:col-span-2">
                      <Label className="text-xs text-muted-foreground">
                        Coupon (optional)
                      </Label>
                      <div className="mt-1 flex gap-2">
                        <Input
                          value={coupon}
                          onChange={(e) => {
                            setCoupon(e.target.value);
                            setAppliedCoupon(null);
                          }}
                          placeholder="Discount code"
                          className="flex-1"
                        />
                        {coupon.trim() && enrichmentSubtotalForCoupon > 0 && (
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={handleApplyCoupon}
                            disabled={checkingCoupon}
                          >
                            {checkingCoupon ? "…" : "Apply"}
                          </Button>
                        )}
                      </div>
                      {appliedCoupon && (
                        <p className="mt-1 text-xs text-emerald-600">
                          Coupon {appliedCoupon} will be applied to preview
                        </p>
                      )}
                    </div> */}
                  </div>
                </div>
              )}
            </Card>

            {/* WTR */}
            <Card
              className={cn(
                "rounded-2xl border border-border/60 p-5 transition-opacity",
                !includeWtr && "opacity-60"
              )}
            >
              <SectionHeader
                title="Write to Read"
                description="Teacher subscription for student book authoring"
                icon={PenTool}
                enabled={includeWtr}
                onToggle={setIncludeWtr}
              />
              <ShopSectionPreview
                items={wtrPreviewItems}
                loading={characterCatalogLoading}
                className={cn(!includeWtr && "opacity-70")}
              />

              {includeWtr && (
                <div className="mt-5 space-y-4 border-t border-border/40 pt-5">
                  {eligibility?.wtrConflict && (
                    <p className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      You already have an active Write to Read subscription.
                    </p>
                  )}
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Subscription type
                      </Label>
                      <select
                        className="mt-1 w-full rounded-md border border-border/60 bg-background p-2 text-sm"
                        value={wtrSubscriptionType}
                        onChange={(e) => setWtrSubscriptionType(e.target.value)}
                      >
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Number of student seats
                      </Label>
                      <input
                        type="number"
                        min={1}
                        className="mt-1 w-full rounded-md border border-border/60 bg-background p-2 text-sm"
                        value={wtrNumberOfSeats}
                        onChange={(e) => setWtrNumberOfSeats(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      id="wtr-printing"
                      checked={wtrBookPrinting}
                      onCheckedChange={setWtrBookPrinting}
                    />
                    <Label htmlFor="wtr-printing" className="text-sm">
                      Include book printing requests
                    </Label>
                  </div>
                </div>
              )}
            </Card>
          </div>

          <div className="lg:col-span-1">
            <ShopPricingPanel
              pricing={pricing}
              eligibility={eligibility}
              isLoading={previewLoading}
              error={previewError}
              onRefresh={runPreview}
              canPreview={canPreview}
              canSubmit={canSubmit}
              submitBlockReason={submitBlockReason}
              onPayNow={handlePayNow}
              onRequestQuote={handleRequestQuote}
              isQuoteLoading={quoteLoading}
            />
          </div>
        </div>

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
