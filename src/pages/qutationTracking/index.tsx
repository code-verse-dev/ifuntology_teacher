import { useEffect, useState } from "react";
import { NavLink } from "@/components/NavLink";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetMyQuotesQuery } from "@/redux/services/apiSlices/quoteSlice";

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

export default function QutationTracking() {
  const [searchInput, setSearchInput] = useState("");
  const [paginationConfig, setPaginationConfig] = useState({
    pageNumber: 1,
    limit: 10,
    totalDocs: 0,
    totalPages: 0,
  });
  const [queryOptions, setQueryOptions] = useState<{
    page: number;
    limit: number;
    keyword: string;
  }>({
    page: 1,
    limit: 10,
    keyword: "",
  });
  useEffect(() => {
    document.title = "Quotations Tracking • iFuntology Teacher";
  }, []);
  const { data, error, isLoading } = useGetMyQuotesQuery(queryOptions);
  const res = data?.data;
  const docs = Array.isArray(res?.docs) ? res.docs : [];
  const totalDocs = typeof res?.total === "number" ? res.total : res?.totalDocs ?? 0;
  const totalPages = typeof res?.totalPages === "number" ? res.totalPages : 0;
  const page = typeof res?.page === "number" ? res.page : 1;
  const limit = typeof res?.limit === "number" ? res.limit : 10;

  useEffect(() => {
    setPaginationConfig({
      pageNumber: page,
      limit,
      totalDocs,
      totalPages,
    });
  }, [page, limit, totalDocs, totalPages]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    setQueryOptions((prev) => ({
      ...prev,
      keyword: e.target.value.trim() || undefined,
      page: 1,
    }));
  };

  return (
    <DashboardWithSidebarLayout>
      <section className="mx-auto w-full  space-y-6">
        <h1 className="text-2xl font-extrabold">Quotations Tracking</h1>

        <Card className="rounded-2xl border border-border/60 p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3 w-full md:w-1/2">
              <div className="flex-1">
                <Input placeholder="Search quotations..." value={searchInput} onChange={handleSearch} />
              </div>
              {/* <Button variant="outline">Filter By</Button> */}
            </div>

            <div className="flex items-center gap-3 justify-end">
              <NavLink to="/quotes/request" className="w-max">
                <Button variant="brand">+ Request Quotation</Button>
              </NavLink>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          {isLoading ? (
            <div className="rounded-xl border border-border/60 p-8 text-center text-muted-foreground">
              Loading quotations...
            </div>
          ) : error ? (
            <div className="rounded-xl border border-border/60 p-8 text-center text-destructive">
              Failed to load quotations. Please try again.
            </div>
          ) : docs.length === 0 ? (
            <div className="rounded-xl border border-border/60 p-8 text-center text-muted-foreground">
              No quotations to show.
            </div>
          ) : (
            docs.map((q: any) => {
              const status = (q?.status ?? "").toLowerCase();
              const showReason =
                (status === "rejected" || status === "revision") && q?.reason;
              return (
                <Card
                  key={q._id}
                  className="rounded-xl border border-border/60 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="text-sm font-semibold">
                          {q.organizationName ?? "—"}
                        </div>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusBadgeClass(
                            q.status ?? ""
                          )}`}
                        >
                          {q.status ?? "—"}
                        </span>
                        {q.serviceType && (
                          <span className="text-xs text-muted-foreground">
                            {serviceTypeLabel[q.serviceType] ?? q.serviceType}
                          </span>
                        )}
                      </div>

                      <div className="mt-2 text-xs text-muted-foreground">
                        {q.poNumber && (
                          <span className="mr-2">PO: {q.poNumber}</span>
                        )}
                        {q._id && (
                          <span className="mr-2">ID: {q._id}</span>
                        )}
                        <span>Created: {formatDate(q.createdAt)}</span>
                      </div>

                      {showReason && (
                        <div className="mt-3 rounded-md border border-red-100 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30 p-2 text-sm text-red-700 dark:text-red-400">
                          {q.reason}
                        </div>
                      )}
                    </div>

                    <div className="ml-4 flex w-40 flex-col items-end justify-between">
                      <div className="text-lg font-semibold">
                        {formatAmount(q.subTotal)}
                      </div>
                      {(q.subTotal != null || q.taxAmount != null) && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {q.subTotal != null && (
                            <span>Subtotal: {formatAmount(q.total)}</span>
                          )}
                          {q.taxAmount != null && (
                            <span className="ml-2">
                              Tax: {formatAmount(q.taxAmount)}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="mt-3 flex gap-2">
                        <NavLink
                          to={
                            (q.status ?? "").toLowerCase() === "approved"
                              ? `/purchase-orders/${q._id}`
                              : `/quotes/${q._id}`
                          }
                        >
                          <Button variant="outline">View Details</Button>
                        </NavLink>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <div>
              {paginationConfig.totalDocs > 0
                ? `Showing ${(paginationConfig.pageNumber - 1) * paginationConfig.limit +
                1
                }-${Math.min(
                  paginationConfig.pageNumber * paginationConfig.limit,
                  paginationConfig.totalDocs
                )} of ${paginationConfig.totalDocs} item(s)`
                : "No items to show"}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={paginationConfig.pageNumber === 1}
                onClick={() =>
                  setQueryOptions((prev) => ({
                    ...prev,
                    page: Math.max(1, prev.page - 1),
                  }))
                }
              >
                Previous
              </Button>
              {Array.from({ length: paginationConfig.totalPages }, (_, i) => (
                <Button
                  key={i + 1}
                  variant={
                    paginationConfig.pageNumber === i + 1 ? "default" : "ghost"
                  }
                  size="sm"
                  className={
                    paginationConfig.pageNumber === i + 1
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : undefined
                  }
                  onClick={() =>
                    setQueryOptions((prev) => ({ ...prev, page: i + 1 }))
                  }
                >
                  {String(i + 1).padStart(2, "0")}
                </Button>
              ))}
              <Button
                variant="ghost"
                size="sm"
                disabled={
                  paginationConfig.pageNumber === paginationConfig.totalPages
                }
                onClick={() =>
                  setQueryOptions((prev) => ({
                    ...prev,
                    page: Math.min(paginationConfig.totalPages, prev.page + 1),
                  }))
                }
              >
                Next
              </Button>
            </div>
          </div>
      </section>
    </DashboardWithSidebarLayout>
  );
}
