import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Loader2 } from "lucide-react";
import { toast } from "sonner";

import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  useGetMyWtrSubscriptionQuery,
  useGetWtrPricingByPlanQuery,
} from "@/redux/services/apiSlices/paymentSlice";
import { cn } from "@/lib/utils";

export default function WriteToReadSubscribePage() {
  const navigate = useNavigate();
  const { data, isLoading, isFetching, isError } = useGetMyWtrSubscriptionQuery(
    undefined,
    { refetchOnMountOrArgChange: true }
  );

  const [subscriptionType, setSubscriptionType] = useState<"MONTHLY" | "YEARLY">("YEARLY");
  const [numberOfSeats, setNumberOfSeats] = useState<string>("1");
  const seats = Math.max(1, parseInt(numberOfSeats, 10) || 0);

  const {
    data: monthlyPricingRes,
    isLoading: isMonthlyPricingLoading,
    isFetching: isMonthlyPricingFetching,
    isError: isMonthlyPricingError,
  } = useGetWtrPricingByPlanQuery({
    subscriberKind: "TEACHER",
    billing: "MONTHLY",
  });
  const {
    data: yearlyPricingRes,
    isLoading: isYearlyPricingLoading,
    isFetching: isYearlyPricingFetching,
    isError: isYearlyPricingError,
  } = useGetWtrPricingByPlanQuery({
    subscriberKind: "TEACHER",
    billing: "YEARLY",
  });

  const monthlyUnitAmount = Number(monthlyPricingRes?.data?.amount ?? 0);
  const yearlyUnitAmount = Number(yearlyPricingRes?.data?.amount ?? 0);
  const selectedUnitAmount =
    subscriptionType === "MONTHLY" ? monthlyUnitAmount : yearlyUnitAmount;
  const computedTotal = selectedUnitAmount * seats;

  const isPricingLoading =
    isMonthlyPricingLoading ||
    isMonthlyPricingFetching ||
    isYearlyPricingLoading ||
    isYearlyPricingFetching;
  const hasPricingError =
    isMonthlyPricingError ||
    isYearlyPricingError ||
    monthlyUnitAmount <= 0 ||
    yearlyUnitAmount <= 0;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

  useEffect(() => {
    document.title = "Subscribe • Write to Read • iFuntology Teacher";
  }, []);

  const hasActive = !isError && Boolean(data?.status && data?.data);

  useEffect(() => {
    if (!isLoading && !isFetching && hasActive) {
      navigate("/write-to-read", { replace: true });
    }
  }, [hasActive, isLoading, isFetching, navigate]);

  const handleContinueToPayment = () => {
    if (!Number.isFinite(seats) || seats < 1) {
      toast.error("Enter a valid seat count (at least 1).");
      return;
    }
    if (hasPricingError || selectedUnitAmount <= 0) {
      toast.error("Write to Read pricing is not available right now.");
      return;
    }
    navigate("/payment", {
      state: {
        total: computedTotal,
        type: "WTR_SUBSCRIPTION",
        subscriptionType,
        subscriberKind: "TEACHER",
        pricingModel: "PER_SEAT",
        numberOfSeats: seats,
      },
    });
  };

  if (isLoading || isFetching || isPricingLoading) {
    return (
      <DashboardWithSidebarLayout>
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-lime-600" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </DashboardWithSidebarLayout>
    );
  }

  if (hasActive) {
    return null;
  }

  return (
    <DashboardWithSidebarLayout>
      <div className="mx-auto w-full max-w-xl space-y-6 pb-12">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-400">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Write to Read subscription
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Choose billing and number of students. Payment is processed securely with Stripe; your plan
              renews automatically until you turn off auto-renew in your account.
            </p>
          </div>
        </div>

        <Card className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-8">
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-base font-semibold">Pricing model</Label>
              <div className="rounded-xl border border-lime-200 bg-lime-50/40 px-4 py-3 dark:border-lime-900 dark:bg-lime-950/20">
                <p className="font-semibold text-slate-900 dark:text-white">Per student</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Admin-managed price per student. Total is auto-calculated from billing cycle and student count.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold">Billing</Label>
              <RadioGroup
                value={subscriptionType}
                onValueChange={(v) => setSubscriptionType(v as "MONTHLY" | "YEARLY")}
                className="grid gap-3 sm:grid-cols-2"
              >
                <label
                  className={cn(
                    "flex cursor-pointer flex-col gap-1 rounded-xl border px-4 py-3 transition-colors sm:flex-row sm:items-center sm:gap-3",
                    subscriptionType === "MONTHLY"
                      ? "border-lime-500 bg-lime-50 dark:bg-lime-950/30"
                      : "border-slate-200 dark:border-slate-700"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="MONTHLY" id="wtr-bill-monthly" />
                    <span className="font-medium text-slate-900 dark:text-white">Monthly</span>
                  </div>
                  <span
                    className={cn(
                      "pl-7 text-sm sm:pl-0 sm:ml-auto",
                      subscriptionType === "MONTHLY"
                        ? "font-bold text-lime-700 dark:text-lime-400"
                        : "text-slate-500 dark:text-slate-400"
                    )}
                  >
                    {monthlyUnitAmount > 0 ? formatCurrency(monthlyUnitAmount) : "—"}/mo
                  </span>
                </label>
                <label
                  className={cn(
                    "flex cursor-pointer flex-col gap-1 rounded-xl border px-4 py-3 transition-colors sm:flex-row sm:items-center sm:gap-3",
                    subscriptionType === "YEARLY"
                      ? "border-lime-500 bg-lime-50 dark:bg-lime-950/30"
                      : "border-slate-200 dark:border-slate-700"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="YEARLY" id="wtr-bill-yearly" />
                    <span className="font-medium text-slate-900 dark:text-white">Yearly</span>
                  </div>
                  <span
                    className={cn(
                      "pl-7 text-sm sm:pl-0 sm:ml-auto",
                      subscriptionType === "YEARLY"
                        ? "font-bold text-lime-700 dark:text-lime-400"
                        : "text-slate-500 dark:text-slate-400"
                    )}
                  >
                    {yearlyUnitAmount > 0 ? formatCurrency(yearlyUnitAmount) : "—"}/yr
                  </span>
                </label>
              </RadioGroup>

              <div
                className={cn(
                  "rounded-xl border px-4 py-3 text-sm",
                  "border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-800/40"
                )}
              >
                {subscriptionType === "MONTHLY" ? (
                  <p className="text-slate-700 dark:text-slate-200">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {monthlyUnitAmount > 0 ? formatCurrency(monthlyUnitAmount) : "—"}
                    </span>{" "}
                    per student/month. Yearly option:{" "}
                    <span className="font-medium text-slate-900 dark:text-white">
                      {yearlyUnitAmount > 0 ? formatCurrency(yearlyUnitAmount) : "—"}
                    </span>
                    /student/year.
                  </p>
                ) : (
                  <p className="text-slate-700 dark:text-slate-200">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {yearlyUnitAmount > 0 ? formatCurrency(yearlyUnitAmount) : "—"}
                    </span>{" "}
                    per student/year. Monthly option:{" "}
                    <span className="font-medium text-slate-900 dark:text-white">
                      {monthlyUnitAmount > 0 ? formatCurrency(monthlyUnitAmount) : "—"}
                    </span>
                    /student/month.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="wtr-seats">Number of students</Label>
              <Input
                id="wtr-seats"
                type="number"
                min={1}
                inputMode="numeric"
                value={numberOfSeats}
                onChange={(e) => setNumberOfSeats(e.target.value)}
                className="max-w-xs rounded-xl"
              />
              <p className="text-xs text-muted-foreground">
                Enter number of students (minimum 1). Total = selected plan price x students.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800/40">
              <p className="text-slate-700 dark:text-slate-200">
                Total due now:{" "}
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatCurrency(computedTotal)}
                </span>
              </p>
            </div>

            {hasPricingError && (
              <p className="text-sm text-red-600 dark:text-red-400">
                Could not load active Write to Read pricing. Please try again or contact admin.
              </p>
            )}

            <Button
              type="button"
              variant="brand"
              size="pill"
              className="w-full sm:w-auto"
              onClick={handleContinueToPayment}
              disabled={hasPricingError || isPricingLoading}
            >
              Continue to payment
            </Button>
          </div>
        </Card>
      </div>
    </DashboardWithSidebarLayout>
  );
}
