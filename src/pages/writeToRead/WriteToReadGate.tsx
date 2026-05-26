import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { useGetMyWtrSubscriptionQuery } from "@/redux/services/apiSlices/paymentSlice";
import WriteToRead from "./index";

type LocationState = { fromWtrPayment?: boolean };

export default function WriteToReadGate() {
  const location = useLocation();
  const navigate = useNavigate();
  const fromWtrPayment = (location.state as LocationState | null)?.fromWtrPayment === true;

  const { data, isLoading, isFetching, isError, refetch } = useGetMyWtrSubscriptionQuery(
    undefined,
    { refetchOnMountOrArgChange: true }
  );

  const hasActive = !isError && Boolean(data?.status && data?.data);
  const [activationPollExhausted, setActivationPollExhausted] = useState(false);

  useEffect(() => {
    if (hasActive && fromWtrPayment) {
      navigate("/write-to-read", { replace: true, state: {} });
    }
  }, [hasActive, fromWtrPayment, navigate]);

  useEffect(() => {
    if (!fromWtrPayment || hasActive) return;

    let cancelled = false;

    (async () => {
      for (let i = 0; i < 45 && !cancelled; i++) {
        const result = await refetch();
        if (cancelled) return;
        if (result.data?.status && result.data?.data) {
          return;
        }
        await new Promise((r) => setTimeout(r, 700));
      }
      if (!cancelled) {
        setActivationPollExhausted(true);
        toast.message(
          "Your payment succeeded. If the app still asks you to subscribe, refresh the page in a few seconds."
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fromWtrPayment, hasActive, refetch, navigate]);

  const waitingOnWebhook =
    fromWtrPayment && !hasActive && !activationPollExhausted;

  if (isLoading || isFetching || waitingOnWebhook) {
    return (
      <DashboardWithSidebarLayout>
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-slate-600 dark:text-slate-400">
          <Loader2 className="h-10 w-10 animate-spin text-lime-600" />
          <p className="text-sm font-medium">
            {waitingOnWebhook
              ? "Activating your Write to Read subscription…"
              : "Checking your Write to Read subscription…"}
          </p>
        </div>
      </DashboardWithSidebarLayout>
    );
  }

  if (!hasActive) {
    return <Navigate to="/write-to-read/subscribe" replace />;
  }

  return <WriteToRead />;
}
