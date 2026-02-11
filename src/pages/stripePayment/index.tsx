import { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import {
  usePaymentConfigQuery,
  usePaymentIntentMutation,
} from "../../redux/services/apiSlices/paymentSlice";
import { useLocation, useNavigate } from "react-router-dom";
import { Stripe, loadStripe } from "@stripe/stripe-js";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import CheckoutForm from "@/components/checkoutForm";
import { toast } from "sonner";

const Payment = () => {
  const location = useLocation();
  const total = location.state?.total;
  const type = location.state?.type;
  const [stripePromise, setStripePromise] =
    useState<Promise<Stripe | null> | null>(null);
  const [clientSecret, setClientSecret] = useState("");
  const navigate = useNavigate();

  const { data: paymentData } = usePaymentConfigQuery({});

  const [createPaymentIntent, { isLoading }] = usePaymentIntentMutation();
  useEffect(() => {
    if (paymentData?.publishableKey) {
      setStripePromise(loadStripe(paymentData.publishableKey));
    }
  }, [paymentData]);
  useEffect(() => {
    if (!total || Number.isNaN(total)) {
      toast.error("Invalid payment amount");
      navigate("/cart");
      return;
    }

    const createIntent = async () => {
      try {
        const res = await createPaymentIntent({
          amount: Math.round(total * 100), // cents
          currency: "usd",
        }).unwrap();

        setClientSecret(res.clientSecret);
      } catch (err: any) {
        toast.error(err?.data?.message || "Failed to create payment intent");
      }
    };

    createIntent();
  }, [total, createPaymentIntent, navigate]);
  const [isProcessing, setIsProcessing] = useState(false);
  return (
    <DashboardWithSidebarLayout>
      <div
        style={{
          // padding: "20px",
          borderRadius: "8px",
          margin: "40px 0px",
        }}
      >
        <h1>Stripe Payment</h1>
        {clientSecret && stripePromise ? (
          <Elements
            stripe={stripePromise}
            options={{ clientSecret }}
            key={clientSecret}
          >
            <CheckoutForm
              type={type}
              amount={total}
              clientSecret={clientSecret}
              isProcessing={isProcessing}
              setIsProcessing={setIsProcessing}
            />
          </Elements>
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "200px",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
              <div className="loader" style={{ width: 40, height: 40, border: "4px solid #eee", borderTop: "4px solid #666", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
              <p style={{ color: "#666", fontSize: "16px" }}>
                Loading payment form...
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardWithSidebarLayout>
  );
};

export default Payment;
