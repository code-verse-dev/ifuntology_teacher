import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetAllSettingsQuery } from "@/redux/services/apiSlices/settingSlice";
import { useGetCategoriesQuery } from "@/redux/services/apiSlices/categorySlice";
import {
  useLazyGetProductsByCategoryQuery,
  useGetProductByCourseTypeQuery,
} from "@/redux/services/apiSlices/productSlice";
import { useRequestQuoteMutation } from "@/redux/services/apiSlices/quoteSlice";
import swal from "sweetalert";

export default function RequestQuotation() {
  const [requestQuote] = useRequestQuoteMutation();
  useEffect(() => {
    document.title = "Request Quotation • iFuntology Teacher";
  }, []);
  const [triggerGetProducts] = useLazyGetProductsByCategoryQuery();
  const { data: settingData } = useGetAllSettingsQuery({});
  const { data: categoriesData } = useGetCategoriesQuery({});
  const navigate = useNavigate();
  const [serviceType, setServiceType] = useState<string>("lms");
  const [courseType, setCourseType] = useState<string>("Funtology");
  const { data: productByCourse } = useGetProductByCourseTypeQuery({
    courseType,
  });
  useEffect(() => {
    if (settingData && Array.isArray(settingData.data)) {
      const taxSetting = settingData.data.find(
        (item: any) => item.type === "tax"
      );
      if (
        taxSetting &&
        taxSetting.data &&
        typeof taxSetting.data.percentage === "number"
      ) {
        setTaxPercent(taxSetting.data.percentage);
      }
      const lmsSetting = settingData.data.find(
        (item: any) => item.type === "lms"
      );
      if (lmsSetting && lmsSetting.data) {
        if (typeof lmsSetting.data.monthlySubscriptionFee === "number")
          setMonthlyFee(lmsSetting.data.monthlySubscriptionFee);
        if (typeof lmsSetting.data.yearlySubscriptionFee === "number")
          setYearlyFee(lmsSetting.data.yearlySubscriptionFee);
      }
    }
  }, [settingData]);
  // LMS fields
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [kitsSub, setKitsSub] = useState("");
  const [subscriptionType, setSubscriptionType] = useState<string>("monthly");

  // Write to Read fields
  const [bookPrinting, setBookPrinting] = useState<string>("Yes");
  const [subscriptions, setSubscriptions] = useState<number>(0);
  const [batchStudents, setBatchStudents] = useState<number>(0);

  // Enrichment store fields
  const [products, setProducts] = useState([
    {
      category: "",
      product: "",
      quantity: "",
    },
  ]);
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [country, setCountry] = useState("");
  const [zip, setZip] = useState("");
  const [coupon, setCoupon] = useState("");

  const [taxPercent, setTaxPercent] = useState<number>(0);
  const [monthlyFee, setMonthlyFee] = useState<number>(0);
  const [yearlyFee, setYearlyFee] = useState<number>(0);

  // price calc
  const lmsUnitPrice = subscriptionType === "yearly" ? yearlyFee : monthlyFee;
  const lmsUnitLabel = subscriptionType === "yearly" ? "Yearly" : "Monthly";
  const lmsQty = Number(kitsSub) || 0;
  const lmsSubtotal =
    lmsQty * lmsUnitPrice + lmsQty * productByCourse?.data?.price;

  const lmsTax = lmsSubtotal * (taxPercent / 100);
  const lmsTotal = lmsSubtotal + lmsTax;
  const [submitOpen, setSubmitOpen] = useState(false);

  const [categoryProducts, setCategoryProducts] = useState<{
    [key: string]: any[];
  }>({});

  const handleProductChange = async (
    index: number,
    field: "category" | "product" | "quantity",
    value: any
  ) => {
    const updatedProducts: any = [...products];
    updatedProducts[index][field] = value;

    if (field === "category") {
      updatedProducts[index].product = ""; // reset product

      // If products not already cached
      if (!categoryProducts[value]) {
        try {
          const res: any = await triggerGetProducts({
            categoryId: value,
          }).unwrap();

          setCategoryProducts((prev) => ({
            ...prev,
            [value]: res.data,
          }));
        } catch (error) {
          console.log("Failed to fetch products", error);
        }
      }
    }

    setProducts(updatedProducts);
  };
  const addProduct = () => {
    setProducts([...products, { category: "", product: "", quantity: "" }]);
  };
  const removeProduct = (index: number) => {
    const updatedProducts = products.filter((_, i) => i !== index);
    setProducts(updatedProducts);
  };

  const handleSubmitQuote = async () => {
    const validate = () => {
      if (!orgName || !orgName.toString().trim())
        return "Organization Name is required";

      if (serviceType === "lms") {
        if (!email || !email.toString().trim()) return "Email is required";
        // simple email regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email))
          return "Please enter a valid email address";
        if (!address || !address.toString().trim())
          return "Address is required";
        const kitsNum = Number(kitsSub);
        if (isNaN(kitsNum) || kitsNum <= 0)
          return "Number of kits must be greater than 0";
        if (!subscriptionType) return "Subscription type is required";
      }

      // if (serviceType === "write_to_read") {
      //   if (subscriptions === null || subscriptions === undefined || Number(subscriptions) <= 0)
      //     return "Number of Subscriptions must be greater than 0";
      //   if (batchStudents === null || batchStudents === undefined || Number(batchStudents) <= 0)
      //     return "Number of Students in Batch must be greater than 0";
      // }

      // if (serviceType === "enrichment_store") {
      //   if (!products || products.length === 0) return "At least one product is required";
      //   for (let i = 0; i < products.length; i++) {
      //     const p = products[i];
      //     if (!p.category || !p.category.toString().trim())
      //       return `Category is required for product #${i + 1}`;
      //     if (!p.product || !p.product.toString().trim())
      //       return `Product is required for product #${i + 1}`;
      //     const q = Number(p.quantity);
      //     if (isNaN(q) || q <= 0) return `Quantity must be greater than 0 for product #${i + 1}`;
      //   }
      //   if (!city || !city.toString().trim()) return "City is required";
      //   if (!stateVal || !stateVal.toString().trim()) return "State is required";
      //   if (!country || !country.toString().trim()) return "Country is required";
      //   if (!zip || !zip.toString().trim()) return "Zip Code is required";
      // }

      return null;
    };

    const validationError = validate();
    if (validationError) {
      swal("Error", validationError, "error");
      return;
    }

    let data: any = {
      serviceType,
      organizationName: orgName,
    };

    if (serviceType === "lms") {
      data = {
        ...data,
        email,
        address,
        noOfKits: kitsSub,
        webSubscriptions: kitsSub,
        subscriptionType,
        courseType,
      };
    } else if (serviceType === "write_to_read") {
      data = {
        ...data,
        bookPrinting,
        subscriptions: Number(subscriptions),
        batchStudents: Number(batchStudents),
      };
    } else if (serviceType === "enrichment_store") {
      // map products to expected payload (product id and quantity)
      data = {
        ...data,
        products: products.map((p: any) => ({
          category: p.category,
          product: p.product,
          quantity: Number(p.quantity),
        })),
        city,
        state: stateVal,
        country,
        zip,
        coupon: coupon || undefined,
      };
    }

    try {
      const res: any = await requestQuote({
        data,
      }).unwrap();
      console.log("Quote request response:", res);
      if (res?.status) {
        setSubmitOpen(true);
      } else {
        const message =
          res?.data?.error?.message ||
          res?.error?.message ||
          "Something went wrong";
        swal("Error", message, "error");
      }
    } catch (error: any) {
      console.error("Error updating business status:", error);
      let message = error?.data?.message || error?.message;
      if (message) swal("Error", message, "error");
    }
  };

  const resetFormFields = () => {
    if (serviceType === "lms") {
      setOrgName("");
      setEmail("");
      setAddress("");
      setKitsSub("");
      setSubscriptionType("monthly");
      setCourseType("Funtology");
    } else if (serviceType === "write_to_read") {
      setBookPrinting("Yes");
      setSubscriptions(0);
      setBatchStudents(0);
    } else if (serviceType === "enrichment_store") {
      setOrgName("");
      setProducts([{ category: "", product: "", quantity: "" }]);
      setCity("");
      setStateVal("");
      setCountry("");
      setZip("");
      setCoupon("");
    }
  };

  return (
    <DashboardWithSidebarLayout>
      <section className="mx-auto w-full max-w-6xl space-y-6">
        <h1 className="text-2xl font-extrabold">Request Quotation</h1>

        <Card className="rounded-2xl border border-border/60 p-6">
          {/* Increase field area: use 3-column grid on md and let the form span 2 columns */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <div className="mb-3">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Service Type *
                </label>
                <select
                  className="w-full rounded-md border border-border/60 bg-background p-2 text-sm"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                >
                  <option value="lms">Learning Management System</option>
                  <option value="write_to_read">Write to Read</option>
                  <option value="enrichment_store">
                    Enrichment Store Products
                  </option>
                </select>
              </div>

              {/* Conditional fields */}
              {serviceType === "lms" && (
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      Organization Name *
                    </label>
                    <Input
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="Enter Name"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Email *
                      </label>
                      <Input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter Email"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Address *
                      </label>
                      <Input
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter Address"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Number of kits *
                      </label>
                      <input
                        type="number"
                        className="w-full rounded-md border border-border/60 bg-background p-2 text-sm"
                        value={kitsSub}
                        onChange={(e) => {
                          const val = e.target.value;
                          setKitsSub(val);
                        }}
                        min={0}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Web Subscriptions *
                      </label>
                      <input
                        type="number"
                        className="w-full rounded-md border border-border/60 bg-background p-2 text-sm"
                        value={kitsSub}
                        onChange={(e) => {
                          const val = e.target.value;
                          setKitsSub(val);
                        }}
                        min={0}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Subscription Type *
                      </label>
                      <select
                        className="w-full rounded-md border border-border/60 bg-background p-2 text-sm"
                        value={subscriptionType}
                        onChange={(e) => setSubscriptionType(e.target.value)}
                      >
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Course Type *
                      </label>
                      <select
                        className="w-full rounded-md border border-border/60 bg-background p-2 text-sm"
                        value={courseType}
                        onChange={(e) => setCourseType(e.target.value)}
                      >
                        <option value="Funtology">Funtology</option>
                        <option value="Skintology">Skintology</option>
                        <option value="Barbertology">Barbertology</option>
                        <option value="Nailtology">Nailtology</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {serviceType === "write_to_read" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Organization Name *
                      </label>
                      <Input placeholder="Enter Name" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Book Printing Requests *
                      </label>
                      <select
                        className="w-full rounded-md border border-border/60 bg-background p-2 text-sm"
                        value={bookPrinting}
                        onChange={(e) => setBookPrinting(e.target.value)}
                      >
                        <option>Yes</option>
                        <option>No</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Number of Subscriptions *
                      </label>
                      <input
                        type="number"
                        className="w-full rounded-md border border-border/60 bg-background p-2 text-sm"
                        value={subscriptions}
                        onChange={(e) =>
                          setSubscriptions(Number(e.target.value))
                        }
                        min={0}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Number of Students in Batch *
                      </label>
                      <input
                        type="number"
                        className="w-full rounded-md border border-border/60 bg-background p-2 text-sm"
                        value={batchStudents}
                        onChange={(e) =>
                          setBatchStudents(Number(e.target.value))
                        }
                        min={0}
                      />
                    </div>
                  </div>
                </div>
              )}

              {serviceType === "enrichment_store" && (
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      Organization Name *
                    </label>
                    <Input
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="Enter Name"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-1">
                    <div className="space-y-4">
                      {products.map((item, index) => (
                        <div
                          key={index}
                          className="rounded-md border border-border/50 p-4 space-y-3"
                        >
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                            {/* Category */}
                            <div>
                              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                Category *
                              </label>
                              <select
                                className="w-full rounded-md border border-border/60 bg-background p-2 text-sm"
                                value={item.category}
                                onChange={(e) =>
                                  handleProductChange(
                                    index,
                                    "category",
                                    e.target.value
                                  )
                                }
                              >
                                <option value="">Category</option>
                                {Array.isArray(categoriesData?.data) &&
                                  categoriesData.data
                                    .filter(
                                      (cat: any) =>
                                        cat.title !==
                                        "Interactive Classroom Kits"
                                    )
                                    .map((cat: any) => (
                                      <option key={cat._id} value={cat._id}>
                                        {cat.title}
                                      </option>
                                    ))}
                              </select>
                            </div>

                            {/* Product */}
                            <div>
                              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                Product *
                              </label>
                              <select
                                className="w-full rounded-md border border-border/60 bg-background p-2 text-sm"
                                value={item.product}
                                onChange={(e) =>
                                  handleProductChange(
                                    index,
                                    "product",
                                    e.target.value
                                  )
                                }
                              >
                                <option value="">Select Product</option>

                                {item?.category &&
                                  categoryProducts[item.category]?.map(
                                    (prod: any) => (
                                      <option key={prod._id} value={prod._id}>
                                        {prod.name}
                                      </option>
                                    )
                                  )}
                              </select>
                            </div>

                            {/* Quantity */}
                            <div>
                              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                Quantity *
                              </label>
                              <input
                                type="number"
                                min={0}
                                className="w-full rounded-md border border-border/60 bg-background p-2 text-sm"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleProductChange(
                                    index,
                                    "quantity",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>

                          {/* Delete Button */}
                          {products.length > 1 && (
                            <div className="text-right">
                              <button
                                type="button"
                                onClick={() => removeProduct(index)}
                                className="text-sm text-red-500 hover:underline"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Add Button */}
                      <button
                        type="button"
                        onClick={addProduct}
                        className="rounded-md bg-primary px-4 py-2 text-sm text-white"
                      >
                        + Add Another Product
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        City *
                      </label>
                      <Input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Enter City"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        State *
                      </label>
                      <Input
                        value={stateVal}
                        onChange={(e) => setStateVal(e.target.value)}
                        placeholder="Enter State"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Country *
                      </label>
                      <Input
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="Enter Country"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Zip Code *
                      </label>
                      <Input
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        placeholder="Enter Zip Code"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Coupon / Discount Code (optional)
                      </label>
                      <Input
                        value={coupon}
                        onChange={(e) => setCoupon(e.target.value)}
                        placeholder="Enter Coupon / Discount Code"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right column intentionally left minimal — payment should be below per request */}
            <div />
          </div>

          {/* Payment block below fields */}
          {serviceType === "lms" && (
            <div className="mt-6 rounded-md border border-border/60 bg-card/30 p-4">
              <div className="text-sm font-semibold">Live Price Calculator</div>
              <div className="mt-2 text-sm text-muted-foreground">
                {lmsUnitLabel} Subscriptions: ({lmsQty} x $
                {lmsUnitPrice.toFixed(2)})
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {courseType} Kits: ({lmsQty} x $
                {productByCourse?.data?.price.toFixed(2)})
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Tax ({taxPercent}%): ${lmsTax.toFixed(2)}
              </div>
              <div className="mt-3 text-lg font-semibold">
                Estimated Total: ${lmsTotal.toFixed(2)}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button variant="brand" onClick={handleSubmitQuote}>
              {/* Submit & Download */}
              Submit
            </Button>
          </div>
        </Card>

        {/* Submission confirmation dialog */}
        <Dialog
          open={submitOpen}
          onOpenChange={(open) => {
            setSubmitOpen(open);
            if (!open) resetFormFields(); // Reset fields when modal closes
          }}
        >
          <DialogContent>
            <div className="mx-auto w-[420px]">
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-green-500/10 p-4">
                  <Check className="h-8 w-8 text-green-500" />
                </div>
                <DialogTitle>System Alert</DialogTitle>
                <DialogDescription>
                  Your quote request has been submitted!
                </DialogDescription>

                <div className="w-full text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 py-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                    <div className="text-sm">Status</div>
                    <div className="ml-2 text-amber-600 font-medium">
                      Pending
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-red-600">
                    You will be notified once the admin reviews it.
                  </div>
                </div>

                <div className="w-full">
                  <Button
                    className="w-full"
                    onClick={() => {
                      setSubmitOpen(false);
                      navigate("/quotes");
                    }}
                  >
                    {/* Download Quote */}
                    View Quotes
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </section>
    </DashboardWithSidebarLayout>
  );
}
