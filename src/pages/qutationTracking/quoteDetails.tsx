import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetQuoteByIdQuery } from "@/redux/services/apiSlices/quoteSlice";

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

const formatAmount = (value: number | string | undefined): string => {
  if (value === undefined || value === null) return "—";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
};

const getStatusBadgeClass = (status: string) => {
  const s = (status || "").toLowerCase();
  if (s === "approved") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400";
  if (s === "rejected") return "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400";
  if (s === "pending") return "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400";
  if (s === "revision") return "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400";
  return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
};

const serviceTypeLabel: Record<string, string> = {
  lms: "Learning Management System",
  write_to_read: "Write to Read",
  enrichment_store: "Enrichment Store",
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
              {quote._id && (
                <span className="text-sm text-muted-foreground">
                  ID: {quote._id}
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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card className="rounded-xl border border-border/60 p-4">
            <div className="text-sm font-semibold text-muted-foreground mb-3">
              Organization &amp; Contact
            </div>
            <div className="space-y-1 text-sm">
              <div>
                <span className="text-muted-foreground">Organization: </span>
                {quote.organizationName ?? "—"}
              </div>
            </div>
          </Card>

          <Card className="rounded-xl border border-border/60 p-4">
            <div className="text-sm font-semibold text-muted-foreground mb-3">
              Dates
            </div>
            <div className="space-y-1 text-sm">
              <div>
                <span className="text-muted-foreground">Created: </span>
                {formatDate(quote.createdAt)}
              </div>
              {quote.updatedAt && (
                <div>
                  <span className="text-muted-foreground">Updated: </span>
                  {formatDate(quote.updatedAt)}
                </div>
              )}
            </div>
          </Card>
        </div>

        {(quote.city || quote.state || quote.country || quote.zipCode) && (
          <Card className="rounded-xl border border-border/60 p-4">
            <div className="text-sm font-semibold text-muted-foreground mb-3">
              Address
            </div>
            <div className="text-sm">
              {[quote.city, quote.state, quote.country, quote.zipCode]
                .filter(Boolean)
                .join(", ") || "—"}
            </div>
          </Card>
        )}

        {Array.isArray(quote.products) && quote.products.length > 0 && (
          <Card className="rounded-xl border border-border/60 p-4">
            <div className="text-sm font-semibold text-muted-foreground mb-3">
              Products / Items
            </div>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground border-b">
                    <th className="pb-2 pr-2">Product</th>
                    <th className="pb-2 pr-2 text-right">Qty</th>
                    <th className="pb-2 text-right">Price / Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {quote.products.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td className="py-2 pr-2">
                        {item.title ?? item.productName ?? item.product ?? "—"}
                      </td>
                      <td className="py-2 pr-2 text-right">
                        {item.quantity ?? "—"}
                      </td>
                      <td className="py-2 text-right">
                        {item.price != null && formatAmount(item.price)}
                        {item.lineTotal != null && (
                          <span className="text-muted-foreground ml-1">
                            → {formatAmount(item.lineTotal)}
                          </span>
                        )}
                        {item.price == null && item.lineTotal == null && "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        <Card className="rounded-xl border border-border/60 p-4">
          <div className="text-sm font-semibold text-muted-foreground mb-3">
            Financial Summary
          </div>
          <div className="space-y-2 text-sm">
            {quote.subTotal != null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatAmount(quote.subTotal)}</span>
              </div>
            )}
            {quote.taxAmount != null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatAmount(quote.taxAmount)}</span>
              </div>
            )}
            {quote.couponCode && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Coupon</span>
                <span>{quote.couponCode}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold pt-2 border-t">
              <span>Total</span>
              <span>{formatAmount(quote.total)}</span>
            </div>
          </div>
        </Card>
      </section>
    </DashboardWithSidebarLayout>
  );
}
