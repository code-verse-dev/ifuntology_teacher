import React, { useState } from "react";
import { useStripe, useElements } from "@stripe/react-stripe-js";
import { PaymentElement } from "@stripe/react-stripe-js";
import { useDispatch } from "react-redux";
import { PaymentIntentResult } from "@stripe/stripe-js";
import { useNavigate } from "react-router";
import {
  useGetSavedPaymentMethodsQuery,
  useOrderPaymentMutation,
  useSubscriptionPaymentMutation,
} from "../../redux/services/apiSlices/paymentSlice";
import { subscriptionSlice } from "../../redux/services/apiSlices/subscriptionSlice";
import swal from "sweetalert";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2, CheckCircle2 } from "lucide-react";

interface CheckoutFormProps {
  type?: string;
  amount?: number;
  clientSecret?: string;
  subscriptionType?: string;
  numberOfSeats?: number;
  courseType?: string;
  isProcessing: boolean;
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
}

const CheckoutForm = ({
  type,
  clientSecret,
  subscriptionType,
  numberOfSeats,
  courseType,
  isProcessing,
  setIsProcessing,
}: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const [bookOrder] = useOrderPaymentMutation();
  const [bookSubscription] = useSubscriptionPaymentMutation();

  const { data: paymentData, isLoading: cardsLoading } =
    useGetSavedPaymentMethodsQuery();
  const savedCards: any[] = paymentData?.data?.data ?? [];

  const selectedCard = savedCards.find((c) => c.id === selectedCardId) ?? null;

  const savePayment = async (paymentIntent: any) => {
    try {
      if (type === "ORDER") {
        const res: any = await bookOrder({
          data: { paymentIntentId: paymentIntent.id, type },
        }).unwrap();
        if (res?.status) {
          swal("Success", "Payment completed successfully", "success");
          navigate("/my-courses");
        } else {
          swal("Error", res?.data?.error?.message || res?.error?.message || "Something went wrong", "error");
        }
      } else if (type === "SUBSCRIPTION") {
        swal("Success", "Payment completed successfully", "success");
        navigate("/my-courses", { state: { from: "/payment" } });
      }
    } catch (err: any) {
      swal("Error", err?.data?.message || err?.message || "An unexpected error occurred.", "error");
    }
  };

  // Pay with a saved card using its payment method ID
  const handleSavedCardPayment = async () => {
    if (!stripe || !clientSecret || !selectedCard) return;
    setIsProcessing(true);
    setMessage("");
    try {
      let result: any;
      if (type === "SUBSCRIPTION") {
        result = await stripe.confirmPayment({
          clientSecret,
          confirmParams: {
            payment_method: selectedCard.id,
          },
          redirect: "if_required",
        });
      }
      else {
        result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: selectedCard.id,
        });
      }
      if (result.error) {
        setMessage(result.error.message || "Payment failed.");
      } else if (result.paymentIntent) {
        await savePayment(result.paymentIntent);
      }
    } catch (err: any) {
      setMessage(err?.message || "An unexpected error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Pay with the new card form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setMessage("");
    if (!stripe || !elements) {
      setMessage("Stripe has not loaded yet.");
      setIsProcessing(false);
      return;
    }
    try {
      const result: PaymentIntentResult = await stripe.confirmPayment({
        elements,
        confirmParams: {},
        redirect: "if_required",
      });
      // if (result.error) {
      //   setMessage(result.error.message || "An unexpected error occurred.");
      // } else if (result.paymentIntent && result.paymentIntent.status === "requires_capture") {
      //   await savePayment(result.paymentIntent);
      // }
      if (result.paymentIntent) {
        await savePayment(result.paymentIntent);
      }
    } catch (error: any) {
      setMessage(error.message || "An unexpected error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative space-y-6">

      {/* Processing overlay */}
      {isProcessing && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-lime-600" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Processing payment…</p>
        </div>
      )}

      {/* Saved cards */}
      {cardsLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading saved cards…
        </div>
      ) : savedCards.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Saved Cards</p>
          <div className="space-y-2">
            {savedCards.map((pm: any) => {
              const brand = pm?.card?.brand ?? "card";
              const last4 = pm?.card?.last4 ?? "****";
              const expMonth = String(pm?.card?.exp_month ?? "").padStart(2, "0");
              const expYear = String(pm?.card?.exp_year ?? "").slice(-2);
              const isSelected = selectedCardId === pm.id;

              return (
                <button
                  key={pm.id}
                  type="button"
                  onClick={() => setSelectedCardId(isSelected ? null : pm.id)}
                  className={`w-full flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all ${isSelected
                      ? "border-lime-500 bg-lime-50 dark:bg-lime-900/20"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                        {brand} ****{last4}
                      </p>
                      <p className="text-xs text-slate-500">
                        Expires {expMonth}/{expYear}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="h-5 w-5 text-lime-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Pay with selected saved card */}
          {selectedCard && (
            <Button
              type="button"
              variant="brand"
              size="pill"
              className="w-full mt-2"
              disabled={isProcessing}
              onClick={handleSavedCardPayment}
            >
              Pay with saved card
            </Button>
          )}

          {savedCards.length > 0 && (
            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                or use a new card
              </span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            </div>
          )}
        </div>
      )}

      {/* New card form — hidden when a saved card is selected */}
      {!selectedCard && (
        <form id="payment-form" onSubmit={handleSubmit} className="space-y-4">
          <PaymentElement id="payment-element" />
          <Button
            type="submit"
            variant="brand"
            size="pill"
            className="w-full sm:w-auto"
            id="submit"
            disabled={isProcessing || !stripe || !elements}
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing…
              </span>
            ) : "Pay now"}
          </Button>
          {message && (
            <p className="text-sm text-red-500 font-medium">{message}</p>
          )}
        </form>
      )}
    </div>
  );
};

export default CheckoutForm;
