import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Loader2, ShoppingBag } from "lucide-react";

import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useGetMyWtrSubscriptionQuery } from "@/redux/services/apiSlices/paymentSlice";

export default function WriteToReadSubscribePage() {
  const navigate = useNavigate();
  const { data, isLoading, isFetching, isError } = useGetMyWtrSubscriptionQuery(
    undefined,
    { refetchOnMountOrArgChange: true }
  );

  useEffect(() => {
    document.title = "Write to Read • iFuntology Teacher";
  }, []);

  const hasActive = !isError && Boolean(data?.status && data?.data);

  useEffect(() => {
    if (!isLoading && !isFetching && hasActive) {
      navigate("/write-to-read", { replace: true });
    }
  }, [hasActive, isLoading, isFetching, navigate]);

  const handleEnrollNow = () => {
    navigate("/shop", { state: { prefillWtr: true } });
  };

  if (isLoading || isFetching) {
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
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Write to Read
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Unlock student publishing, grade books, and print orders for your classroom.
            </p>
          </div>
        </div>

        <Card className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-8">
          <div className="space-y-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400">
              <ShoppingBag className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Get started with Write to Read
              </h2>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Add Write to Read to your organization through the Shop. Choose seats,
                preview pricing, and complete checkout in one place — including any
                bundled options with your LMS purchase.
              </p>
            </div>
            <Button
              type="button"
              variant="brand"
              size="pill"
              className="w-full sm:w-auto"
              onClick={handleEnrollNow}
            >
              Enroll now
            </Button>
          </div>
        </Card>
      </div>
    </DashboardWithSidebarLayout>
  );
}
