import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetQuoteByIdQuery } from "@/redux/services/apiSlices/quoteSlice";
import QuoteItemsBreakdown from "@/components/quotes/QuoteItemsBreakdown";
import { serviceTypeLabel } from "@/components/quotes/quoteBreakdownUtils";

const formatDate = (dateVal: string | undefined) => {
  if (!dateVal) return "—";
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return dateVal;
  return d.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
};

const getStatusBadgeClass = (status: string) => {
  const s = (status || "").toLowerCase();
  if (s === "approved") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400";
  if (s === "rejected") return "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400";
  if (s === "pending") return "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400";
  if (s === "revision") return "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400";
  return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
};

export default function QuoteDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetQuoteByIdQuery(id!, { skip: !id });
  const quote = data?.data;

  useEffect(() => {
    document.title = quote
      ? `Quote ${quote.poNumber ?? id} • Quotations Tracking`
      : "Quote Details • iFuntology Teacher";
  }, [id, quote]);

  if (!id) {
    return (
      <DashboardWithSidebarLayout>
        <section className="mx-auto w-full space-y-6">
          <div className="text-muted-foreground">Invalid quote ID.</div>
          <Button variant="outline" onClick={() => navigate("/quotes")}>
            Back to Quotations
          </Button>
        </section>
      </DashboardWithSidebarLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardWithSidebarLayout>
        <section className="mx-auto w-full space-y-6">
          <div className="text-muted-foreground">Loading quote details...</div>
        </section>
      </DashboardWithSidebarLayout>
    );
  }

  if (error || !quote) {
    return (
      <DashboardWithSidebarLayout>
        <section className="mx-auto w-full space-y-6">
          <div className="text-destructive">Failed to load quote details.</div>
          <Button variant="outline" onClick={() => navigate("/quotes")}>
            Back to Quotations
          </Button>
        </section>
      </DashboardWithSidebarLayout>
    );
  }

  const status = (quote.status ?? "").toLowerCase();
  const showReason =
    (status === "rejected" || status === "revision") && quote.reason;

  return (
    <DashboardWithSidebarLayout>
      <section className="mx-auto w-full max-w-4xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={() => navigate("/quotes")}
            >
              ← Back to Quotations
            </button>
            <h1 className="text-2xl font-extrabold mt-2">
              {quote.organizationName ?? "Quote"}
            </h1>
            <div className="mt-1 flex items-center gap-2 flex-wrap">
              {quote.poNumber && (
                <span className="text-sm text-muted-foreground">
                  PO: {quote.poNumber}
                </span>
              )}
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusBadgeClass(
                  quote.status ?? ""
                )}`}
              >
                {quote.status ?? "—"}
              </span>
              {quote.serviceType && (
                <span className="text-sm text-muted-foreground">
                  {serviceTypeLabel[quote.serviceType] ?? quote.serviceType}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Created {formatDate(quote.createdAt)}
              {quote.updatedAt ? ` · Updated ${formatDate(quote.updatedAt)}` : ""}
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/quotes")}>
            Close
          </Button>
        </div>

        {showReason && (
          <Card className="rounded-xl border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-4">
            <div className="text-sm font-medium text-red-800 dark:text-red-300">
              Reason
            </div>
            <p className="mt-2 text-sm text-red-700 dark:text-red-400">
              {quote.reason}
            </p>
          </Card>
        )}

        <QuoteItemsBreakdown quoteData={quote} />
      </section>
    </DashboardWithSidebarLayout>
  );
}
