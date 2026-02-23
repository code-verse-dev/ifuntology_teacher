import React from "react";
import { useStripe, useElements } from "@stripe/react-stripe-js";
import { PaymentElement } from "@stripe/react-stripe-js";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { PaymentIntentResult } from "@stripe/stripe-js";
import { useNavigate } from "react-router";
import { useOrderPaymentMutation, useSubscriptionPaymentMutation } from "../../redux/services/apiSlices/paymentSlice";
import { subscriptionSlice } from "../../redux/services/apiSlices/subscriptionSlice";
import swal from "sweetalert";
import { Button } from "@/components/ui/button";

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
  amount,
  subscriptionType,
  numberOfSeats,
  courseType,
  isProcessing,
  setIsProcessing,
}: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();
  const [message, setMessage] = useState("");
  const [bookOrder] = useOrderPaymentMutation();
  const [bookSubscription] = useSubscriptionPaymentMutation();

  const navigate = useNavigate();
  const savePayment = async (paymentIntent: any) => {
    try {
      if (type === "ORDER") {
        let data: any = {
          paymentIntentId: paymentIntent.id,
          type,
        };
        try {
          const res: any = await bookOrder({
            data: data,
          }).unwrap();
          if (res?.status) {
            swal("Success", "Payment completed successfully", "success");
            navigate("/dashboard");
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
      }
      else if (type === "SUBSCRIPTION") {
        let data: any = {
          paymentIntentId: paymentIntent.id,
          type,
          courseType,
          numberOfSeats,
          subscriptionType,
        };
        try {
          const res: any = await bookSubscription({
            data: data,
          }).unwrap();
          if (res?.status) {
            dispatch(subscriptionSlice.util.invalidateTags(["Subscription"]));
            swal("Success", "Payment completed successfully", "success");
            navigate("/my-courses");
          } else {
            const message =
              res?.data?.error?.message ||
              res?.error?.message ||
              "Something went wrong";
            swal("Error", message, "error");
          }
        } catch (error: any) {
          console.error("Error booking subscription:", error);
          let message = error?.data?.message || error?.message;
          if (message) swal("Error", message, "error");
        }
      }
    } catch (err) {
      console.error(err);
      setMessage("An unexpected error occurred.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsProcessing(true);
    if (!stripe || !elements) {
      setMessage("Stripe has not loaded yet.");
      setIsProcessing(false);
      return;
    }
    try {
      const result: PaymentIntentResult = await stripe?.confirmPayment({
        elements,
        confirmParams: {},
        redirect: "if_required",
      });
      if (result.error) {
        setMessage(result.error.message || "An unexpected error occurred.");
      } else if (
        result.paymentIntent &&
        result.paymentIntent?.status === "requires_capture"
      ) {
        savePayment(result.paymentIntent);
        console.log("Payment succeeded!", result.paymentIntent);
      }

      setIsProcessing(false);
    } catch (error: any) {
      console.log(error, "error");
      setMessage(error.message || "An unexpected error occurred.");
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <form id="payment-form" onSubmit={handleSubmit}>
        <PaymentElement id="payment-element" />
        <Button
          type="submit"
          variant="brand"
          size="pill"
          className="w-full sm:w-auto mt-2"
          id="submit"
          disabled={isProcessing || !stripe || !elements}
        >
          <span id="button-text">
            {isProcessing ? "Processing ... " : "Pay now"}
          </span>
        </Button>
        {/* Show any error or success messages */}
        {message && <div id="payment-message">{message}</div>}
      </form>
    </div>
  );
};

export default CheckoutForm;
