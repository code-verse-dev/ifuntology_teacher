import { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import {
  useCreateClassroomSessionIntentMutation,
  useCreateSubscriptionMutation,
  useCreateWtrSubscriptionMutation,
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
  const printOrderId = location.state?.printOrderId as string | undefined;
  const courseType = location.state?.courseType;
  const numberOfSeats = location.state?.numberOfSeats;
  const subscriptionType = location.state?.subscriptionType;
  const subscriberKind = location.state?.subscriberKind;
  const pricingModel = location.state?.pricingModel;
  const wtrNumberOfSeats = location.state?.numberOfSeats;
  const [stripePromise, setStripePromise] =
    useState<Promise<Stripe | null> | null>(null);
  const [clientSecret, setClientSecret] = useState("");
  const navigate = useNavigate();

  const { data: paymentData } = usePaymentConfigQuery({});

  const [createPaymentIntent, { isLoading }] = usePaymentIntentMutation();
  const [createClassroomSessionIntent] =
    useCreateClassroomSessionIntentMutation();
  const [createSubscription] = useCreateSubscriptionMutation();
  const [createWtrSubscription] = useCreateWtrSubscriptionMutation();
  useEffect(() => {
    if (paymentData?.publishableKey) {
      setStripePromise(loadStripe(paymentData.publishableKey));
    }
  }, [paymentData]);
  // useEffect(() => {
  //   if (!total || Number.isNaN(total)) {
  //     toast.error("Invalid payment amount");
  //     navigate("/cart");
  //     return;
  //   }

  //   const createIntent = async () => {
  //     try {
  //       const res = await createPaymentIntent({
  //         amount: Math.round(total * 100), // cents
  //         currency: "usd",
  //       }).unwrap();

  //       setClientSecret(res.clientSecret);
  //     } catch (err: any) {
  //       toast.error(err?.data?.message || "Failed to create payment intent");
  //     }
  //   };

  //   createIntent();
  // }, [total, createPaymentIntent, navigate]);

  useEffect(() => {
    const needsAmount =
      type !== "SUBSCRIPTION" &&
      type !== "WTR_SUBSCRIPTION" &&
      type !== "WTR_PRINT" &&
      type !== "CLASSROOM_SESSION";
    if (needsAmount && (!total || Number.isNaN(total))) {
      toast.error("Invalid payment amount");
      navigate(-1);
      return;
    }
    if (type === "SUBSCRIPTION") {
      const createSub = async () => {
        try {
          const res = await createSubscription({
            courseType,
            subscriptionType,
            numberOfSeats,
          }).unwrap();
          if(res.status){
            setClientSecret(res.data.clientSecret);
          }
  
        } catch (err: any) {
          toast.error(err?.data?.message || "Failed to create subscription");
        }
      };
  
      createSub();
    } else if (type === "WTR_SUBSCRIPTION") {
      const run = async () => {
        try {
          const res = await createWtrSubscription({
            subscriptionType,
            subscriberKind: subscriberKind ?? "TEACHER",
            pricingModel: pricingModel ?? "PER_SEAT",
            numberOfSeats: Number(wtrNumberOfSeats) || 1,
          }).unwrap();
          if (res?.status) {
            setClientSecret(res.data.clientSecret);
          }
        } catch (err: any) {
          toast.error(err?.data?.message || "Failed to start Write to Read checkout");
          navigate("/write-to-read/subscribe", { replace: true });
        }
      };
      run();
    } else if (type === "WTR_PRINT") {
      if (!printOrderId) {
        toast.error("Missing print order.");
        navigate("/write-to-read", {
          replace: true,
          state: { wtrActiveTab: "print" },
        });
        return;
      }
      const runPrint = async () => {
        try {
          const res = await createPaymentIntent({
            type: "WTR_PRINT",
            printOrderId,
          }).unwrap();
          if (res?.clientSecret) {
            setClientSecret(res.clientSecret);
          } else {
            toast.error("Could not start print payment.");
            navigate("/write-to-read", {
              replace: true,
              state: { wtrActiveTab: "print" },
            });
          }
        } catch (err: any) {
          toast.error(
            err?.data?.message || "Failed to create print payment intent"
          );
          navigate("/write-to-read", {
            replace: true,
            state: { wtrActiveTab: "print" },
          });
        }
      };
      runPrint();
    } else if (type === "CLASSROOM_SESSION") {
      const runClassroom = async () => {
        try {
          const res: any = await createClassroomSessionIntent().unwrap();
          if (res?.status && res?.data?.clientSecret) {
            setClientSecret(res.data.clientSecret);
          } else {
            toast.error(res?.message || "Could not start classroom session payment.");
            navigate("/book-a-session/classroom", { replace: true });
          }
        } catch (err: any) {
          toast.error(
            err?.data?.message || "Failed to create classroom session payment"
          );
          navigate("/book-a-session/classroom", { replace: true });
        }
      };
      runClassroom();
    } else {
      const createIntent = async () => {
        try {
          const res = await createPaymentIntent({
            amount: total,
            currency: "usd",
          }).unwrap();
  
          setClientSecret(res.clientSecret);
        } catch (err: any) {
          toast.error(err?.data?.message || "Failed to create payment intent");
        }
      };
  
      createIntent();
    }
    // Intentionally depend on `type` only (same as legacy flow) so we do not recreate intents on unrelated renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);
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
        <h1>
          {type === "CLASSROOM_SESSION"
            ? "Classroom Sessions — access payment"
            : type === "WTR_SUBSCRIPTION"
            ? "Write to Read — payment"
            : type === "WTR_PRINT"
              ? "Write to Read — print order payment"
              : "Stripe Payment"}
        </h1>
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
              printOrderId={printOrderId}
              isProcessing={isProcessing}
              setIsProcessing={setIsProcessing}
              courseType={courseType}
              numberOfSeats={numberOfSeats}
              subscriptionType={subscriptionType}
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
