import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import QuoteSubmittedDialog from "@/components/quotes/QuoteSubmittedDialog";
import QuoteShell from "@/pages/dashboard/quotes/QuoteShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const schema = z.object({
  serviceType: z.literal("Enrichment Store Products"),
  productCategory: z.string().trim().min(1).max(80),
  quantity: z.coerce.number().int().min(1).max(9999),
  address: z.string().trim().min(1).max(255),
  city: z.string().trim().min(1).max(80),
  state: z.string().trim().min(1).max(80),
  country: z.string().trim().min(1).max(80),
  zipCode: z.string().trim().min(1).max(20),
  organizationName: z.string().trim().min(1).max(120),
  coupon: z.string().trim().max(60).optional(),
});

export default function QuoteEnrichmentStorePage() {
  const navigate = useNavigate();
  const [submittedOpen, setSubmittedOpen] = useState(false);
  const [values, setValues] = useState({
    serviceType: "Enrichment Store Products" as const,
    productCategory: "Category",
    quantity: 2,
    address: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    organizationName: "",
    coupon: "",
  });

  useEffect(() => {
    document.title = "Request a Quote (Enrichment Store) • iFuntology Teacher";
  }, []);

  const summary = useMemo(() => {
    // UI-only demo summary until product pricing is provided.
    return {
      subtotal: 0,
      tax: 0,
      shipping: 0,
      total: 0,
    };
  }, [values.productCategory, values.quantity]);

  return (
    <>
      <QuoteShell title="Request A Quote">
        <form
          className="grid grid-cols-1 gap-6 lg:grid-cols-3"
          onSubmit={(e) => {
            e.preventDefault();
            const parsed = schema.safeParse(values);
            if (!parsed.success) return;
            setSubmittedOpen(true);
          }}
        >
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 gap-5">
              <div className="space-y-2">
                <Label>Service Type *</Label>
                <Select value={values.serviceType} onValueChange={() => {}}>
                  <SelectTrigger className="h-11 rounded-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Enrichment Store Products">Enrichment Store Products</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Product Category *</Label>
                  <Select
                    value={values.productCategory}
                    onValueChange={(v) => setValues((s) => ({ ...s, productCategory: v }))}
                  >
                    <SelectTrigger className="h-11 rounded-full">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Category">Category</SelectItem>
                      <SelectItem value="Product 1">Product 1</SelectItem>
                      <SelectItem value="Product 2">Product 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qty">Quantity *</Label>
                  <Input
                    id="qty"
                    inputMode="numeric"
                    className="h-11 rounded-full"
                    value={String(values.quantity)}
                    onChange={(e) => setValues((s) => ({ ...s, quantity: Number(e.target.value || 1) }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  className="h-11 rounded-full"
                  placeholder="Enter Address"
                  value={values.address}
                  onChange={(e) => setValues((s) => ({ ...s, address: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    className="h-11 rounded-full"
                    placeholder="Enter City"
                    value={values.city}
                    onChange={(e) => setValues((s) => ({ ...s, city: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    className="h-11 rounded-full"
                    placeholder="Enter State"
                    value={values.state}
                    onChange={(e) => setValues((s) => ({ ...s, state: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    className="h-11 rounded-full"
                    placeholder="Enter Country"
                    value={values.country}
                    onChange={(e) => setValues((s) => ({ ...s, country: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">Zip Code *</Label>
                  <Input
                    id="zip"
                    className="h-11 rounded-full"
                    placeholder="Enter Zip Code"
                    value={values.zipCode}
                    onChange={(e) => setValues((s) => ({ ...s, zipCode: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="org">Organization Name *</Label>
                  <Input
                    id="org"
                    className="h-11 rounded-full"
                    placeholder="Enter Name"
                    value={values.organizationName}
                    onChange={(e) => setValues((s) => ({ ...s, organizationName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coupon">Coupon / Discount Code (optional)</Label>
                  <Input
                    id="coupon"
                    className="h-11 rounded-full"
                    placeholder="Enter Coupon / Discount Code"
                    value={values.coupon}
                    onChange={(e) => setValues((s) => ({ ...s, coupon: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button variant="glass" size="pill" type="button" onClick={() => navigate("/dashboard")}
                  className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button variant="brand" size="pill" type="submit" className="w-full sm:w-auto">
                  Submit &amp; Download
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="rounded-3xl border border-border/60 bg-secondary/10 p-5">
              <div className="text-sm font-semibold text-primary">Enrichment Quote – Summary</div>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">${summary.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-border/60 pt-3">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-semibold">${summary.tax.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-border/60 pt-3">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-semibold">${summary.shipping.toFixed(2)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between rounded-2xl bg-secondary/20 px-4 py-3">
                  <span className="font-semibold">Estimated Total:</span>
                  <span className="font-extrabold text-primary">${summary.total.toFixed(2)}</span>
                </div>
              </div>
            </Card>
          </div>
        </form>
      </QuoteShell>

      <QuoteSubmittedDialog
        open={submittedOpen}
        onOpenChange={setSubmittedOpen}
        onDownload={() => {
          setSubmittedOpen(false);
          navigate("/quotation-document");
        }}
      />
    </>
  );
}
