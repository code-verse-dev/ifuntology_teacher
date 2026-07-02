import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { ShopEligibility } from "@/redux/services/apiSlices/shopSlice";

type PricingData = {
  lms?: {
    lmsCourses?: {
      courseType: string;
      kitVariant?: string;
      kitsTotal: number;
      subscriptionTotal: number;
      total: number;
    }[];
    kitsTotal?: number;
    subscriptionTotal?: number;
    total?: number;
  };
  enrichment?: {
    products?: { name: string; quantity: number; price: number; total: number }[];
    subtotal?: number;
    total?: number;
  };
  wtr?: {
    lineTotal?: number;
    subscriberKind?: string;
    subscriptionType?: string;
    numberOfSeats?: number;
    noOfSubscriptions?: number;
  };
  bundledWtr?: {
    numberOfSeats: number;
    subscriptionType: "lifetime";
    lineTotal: 0;
  };
  subtotalBeforeTax?: number;
  shippingAmount?: number;
  taxAmount?: number;
  taxExempt?: boolean;
  taxRatePercent?: number;
  grandTotal?: number;
  eligibility?: ShopEligibility;
};

type Props = {
  pricing: PricingData | null;
  eligibility: ShopEligibility | null;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  canPreview: boolean;
  canSubmit: boolean;
  submitBlockReason?: string | null;
  taxExempt: boolean;
  onTaxExemptChange: (value: boolean) => void;
  onPayNow: () => void;
  onRequestQuote: () => void;
  isQuoteLoading: boolean;
};

const fmt = (n: number | undefined) =>
  typeof n === "number" && !Number.isNaN(n) ? `$${n.toFixed(2)}` : "—";

export default function ShopPricingPanel({
  pricing,
  eligibility,
  isLoading,
  error,
  onRefresh,
  canPreview,
  canSubmit,
  submitBlockReason,
  taxExempt,
  onTaxExemptChange,
  onPayNow,
  onRequestQuote,
  isQuoteLoading,
}: Props) {
  const resolvedEligibility = eligibility ?? pricing?.eligibility ?? null;
  // Only block when eligibility explicitly failed; preview may still be refreshing.
  const canProceed =
    resolvedEligibility == null ? true : resolvedEligibility.canProceed;
  const hasTotal =
    typeof pricing?.grandTotal === "number" && pricing.grandTotal > 0;
  const actionsDisabled = !canSubmit || !canProceed || !hasTotal;

  return (
    <Card className="sticky top-6 rounded-2xl border border-border/40 bg-white p-6 shadow-sm dark:bg-card">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-foreground">Pricing preview</h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 rounded-full px-3 text-xs font-semibold text-muted-foreground hover:text-foreground"
          onClick={onRefresh}
          disabled={!canPreview || isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          Update
        </Button>
      </div>

      <p className="mt-1 text-sm text-muted-foreground">
        Server-calculated totals based on your current selections.
      </p>

      {resolvedEligibility && !resolvedEligibility.canProceed && (
        <div className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-3 text-sm text-amber-800 dark:text-amber-200">
          <div className="flex gap-2 font-medium">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Cannot proceed with current selection</span>
          </div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
            {resolvedEligibility.messages.map((msg) => (
              <li key={msg}>{msg}</li>
            ))}
          </ul>
          <p className="mt-2 text-xs opacity-90">
            Remove conflicting sections or change course selections, then update
            pricing.
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {!pricing && !error && !isLoading && (
        <div className="mt-6 rounded-xl border border-sky-100 bg-sky-50 px-4 py-5 text-center text-sm leading-relaxed text-sky-900/80 dark:border-sky-900/30 dark:bg-sky-950/20 dark:text-sky-100/80">
          Enable at least one section and fill in the required fields, then
          update pricing to see your estimate.
        </div>
      )}

      {isLoading && !pricing && (
        <div className="mt-6 flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Calculating…
        </div>
      )}

      {pricing && (
        <div className="mt-5 space-y-4">
          {pricing.lms && (
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Workforce Readiness Courses
              </div>
              {(pricing.lms.lmsCourses ?? []).map((course, idx) => (
                <div
                  key={`${course.courseType}-${idx}`}
                  className="text-sm text-muted-foreground"
                >
                  {course.courseType}
{course.kitVariant === "BUNDLE_4_IN_1"
  ? " · Bundle Kit (4 in 1)"
  : course.kitVariant
    ? " · Standard Kits"
    : ""}
: kits {fmt(course.kitsTotal)}
                </div>
              ))}
              <div className="text-sm font-medium">
                LMS subtotal: {fmt(pricing.lms.total)}
              </div>
              {pricing.bundledWtr && pricing.bundledWtr.numberOfSeats > 0 && (
                <div className="rounded-lg border border-lime-200/80 bg-lime-50/80 px-3 py-2 text-sm text-lime-900 dark:border-lime-900/40 dark:bg-lime-950/30 dark:text-lime-100">
                  <div className="font-medium">Write to Read included</div>
                  <p className="mt-0.5 text-xs leading-relaxed opacity-90">
                    {pricing.bundledWtr.numberOfSeats} lifetime student seat
                    {pricing.bundledWtr.numberOfSeats === 1 ? "" : "s"} granted
                    with your LMS purchase — no additional charge.
                  </p>
                </div>
              )}
            </div>
          )}

          {pricing.enrichment && (
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Enrichment store
              </div>
              {(pricing.enrichment.products ?? []).map((item, idx) => (
                <div key={idx} className="text-sm text-muted-foreground">
                  {item.name}: {item.quantity} × {fmt(item.price)} ={" "}
                  {fmt(item.total)}
                </div>
              ))}
              <div className="text-sm font-medium">
                Enrichment subtotal: {fmt(pricing.enrichment.total)}
              </div>
            </div>
          )}

          {pricing.wtr && (
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Write to Read
                {pricing.bundledWtr && pricing.bundledWtr.numberOfSeats > 0
                  ? " (additional seats)"
                  : ""}
              </div>
              <div className="text-sm text-muted-foreground">
                {pricing.wtr.subscriberKind}
                {pricing.wtr.subscriptionType
                  ? ` · ${pricing.wtr.subscriptionType}`
                  : " · lifetime"}
                {pricing.wtr.numberOfSeats
                  ? ` · ${pricing.wtr.numberOfSeats} seats`
                  : pricing.wtr.noOfSubscriptions
                    ? ` · ${pricing.wtr.noOfSubscriptions} subscription(s)`
                    : ""}
              </div>
              <div className="text-sm font-medium">
                WTR subtotal: {fmt(pricing.wtr.lineTotal)}
              </div>
            </div>
          )}

          <div className="space-y-1 border-t border-border/60 pt-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>{fmt(pricing.subtotalBeforeTax)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Shipping</span>
              <span>{fmt(pricing.shippingAmount)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                Tax
                {pricing.taxExempt
                  ? " (exempt)"
                  : typeof pricing.taxRatePercent === "number"
                    ? ` (${pricing.taxRatePercent}%)`
                    : ""}
              </span>
              <span>{fmt(pricing.taxAmount)}</span>
            </div>
            <div className="flex justify-between pt-1 text-lg font-bold">
              <span>Estimated total</span>
              <span>{fmt(pricing.grandTotal)}</span>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/20 px-3 py-3">
            <Checkbox
              id="shop-tax-exempt"
              checked={taxExempt}
              onCheckedChange={(checked) => onTaxExemptChange(checked === true)}
            />
            <div className="space-y-1">
              <Label htmlFor="shop-tax-exempt" className="cursor-pointer text-sm font-medium">
                Tax exempt
              </Label>
              <p className="text-xs text-muted-foreground">
                Check this box if this order qualifies for tax exemption. Tax will
                not be charged when selected.
              </p>
            </div>
          </div>

          <div className="space-y-2 border-t border-border/60 pt-4">
            <Button
              type="button"
              variant="brand"
              className="w-full"
              disabled={actionsDisabled}
              onClick={onPayNow}
            >
              Pay Electronically
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={actionsDisabled || isQuoteLoading}
              onClick={onRequestQuote}
            >
              {isQuoteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting quote…
                </>
              ) : (
                "Request quote / Purchase Order"
              )}
            </Button>
            {!canSubmit && submitBlockReason && (
              <p className="text-center text-xs text-muted-foreground">
                {submitBlockReason}
              </p>
            )}
            {!canSubmit && !submitBlockReason && (
              <p className="text-center text-xs text-muted-foreground">
                Complete all required fields for enabled sections to pay or
                request a quote.
              </p>
            )}
            {canSubmit && !canProceed && (
              <p className="text-center text-xs text-amber-600">
                Resolve eligibility issues above before continuing.
              </p>
            )}
            {canSubmit && canProceed && !hasTotal && (
              <p className="text-center text-xs text-muted-foreground">
                Update pricing to see your total before continuing.
              </p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
