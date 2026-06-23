import { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import CheckoutForm from "@/components/checkoutForm";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePaymentConfigQuery } from "@/redux/services/apiSlices/paymentSlice";
import {
  ShopPreviewPayload,
  useShopCheckoutMutation,
} from "@/redux/services/apiSlices/shopSlice";

export default function ShopPaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const selection = location.state?.selection as ShopPreviewPayload | undefined;
  const total = location.state?.total as number | undefined;

  const [stripePromise, setStripePromise] =
    useState<Promise<Stripe | null> | null>(null);
  const [clientSecret, setClientSecret] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: paymentData } = usePaymentConfigQuery({});
  const [shopCheckout, { isLoading: checkoutLoading }] =
    useShopCheckoutMutation();

  useEffect(() => {
    document.title = "Shop payment • iFuntology Teacher";
  }, []);

  useEffect(() => {
    if (paymentData?.publishableKey) {
      setStripePromise(loadStripe(paymentData.publishableKey));
    }
  }, [paymentData]);

  useEffect(() => {
    if (!selection || !total || Number.isNaN(total)) {
      toast.error("Missing shop checkout details");
      navigate("/shop", { replace: true });
      return;
    }

    const run = async () => {
      try {
        const res: any = await shopCheckout(selection).unwrap();
        if (res?.status && res?.data?.clientSecret) {
          setClientSecret(res.data.clientSecret);
        } else {
          toast.error(res?.message || "Could not start shop checkout");
          navigate("/shop", { replace: true });
        }
      } catch (err: any) {
        toast.error(
          err?.data?.message || err?.message || "Failed to create payment intent"
        );
        navigate("/shop", { replace: true });
      }
    };

    run();
  }, [selection, total, shopCheckout, navigate]);

  return (
    <DashboardWithSidebarLayout>
      <section className="mx-auto w-full max-w-3xl space-y-6">
        <Link to="/shop" className="text-sm text-muted-foreground">
          &lt; Back to Shop
        </Link>

        <div>
          <h1 className="text-2xl font-extrabold">Shop payment</h1>
          {total != null && (
            <p className="mt-1 text-sm text-muted-foreground">
              Total due:{" "}
              <span className="font-semibold text-foreground">
                ${total.toFixed(2)}
              </span>
            </p>
          )}
        </div>

        <Card className="rounded-2xl border border-border/60 p-6">
          {clientSecret && stripePromise ? (
            <Elements
              stripe={stripePromise}
              options={{ clientSecret }}
              key={clientSecret}
            >
              <CheckoutForm
                type="SHOP_BUNDLE"
                amount={total}
                clientSecret={clientSecret}
                shopSelection={selection}
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
              />
            </Elements>
          ) : (
            <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
              {checkoutLoading ? "Preparing checkout…" : "Loading payment form…"}
            </div>
          )}

          <div className="mt-6">
            <Button variant="outline" onClick={() => navigate("/shop")}>
              Cancel
            </Button>
          </div>
        </Card>
      </section>
    </DashboardWithSidebarLayout>
  );
}
