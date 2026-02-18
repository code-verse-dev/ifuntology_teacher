import { useEffect, useState } from "react";

import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useGetMyPuchaseOrdersQuery, useGetMyPurchaseOrderStatsQuery } from "@/redux/services/apiSlices/purchaseOrderSlice";

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

const getPaymentStatusBadgeClass = (paymentStatus: string) => {
  const s = (paymentStatus || "").toLowerCase();
  if (s === "paid") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400";
  if (s === "partial") return "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400";
  if (s === "unpaid" || s === "pending") return "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400";
  return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
};

export default function PurchaseOrder() {
  useEffect(() => {
    document.title = "Purchase Orders • iFuntology Teacher";
  }, []);

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

  const [searchInput, setSearchInput] = useState("");
  const { data, error, isLoading } = useGetMyPuchaseOrdersQuery(queryOptions);
  const res = data?.data;
  const docs = Array.isArray(res?.docs) ? res.docs : [];
  
  const { data: statsData , isLoading: statsLoading } = useGetMyPurchaseOrderStatsQuery();
  const stats = statsData?.data;
  const totalOrders = stats?.totalPos ?? 0;
  const pendingApproval = stats?.pendingCount ?? 0;
  const approvedOrders = stats?.approvedCount ?? 0;
  const totalSpend = stats?.totalValue ?? 0;

  useEffect(() => {
    if (data?.data) {
      setPaginationConfig({
        pageNumber: data?.data?.page,
        limit: data?.data?.limit,
        totalDocs: data?.data?.totalDocs,
        totalPages: data?.data?.totalPages,
      });
    }
  }, [data]);

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
        <h1 className="text-2xl font-extrabold">Purchase Orders</h1>

        <Card className="rounded-2xl border border-border/60 p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3 w-full md:w-1/2">
              <div className="flex-1">
                <Input
                  placeholder="Search by PO number, organization, or service..."
                  value={searchInput}
                  onChange={handleSearch}
                />
              </div>
              {/* <Button variant="outline" onClick={handleSearch}>
                Filter By
              </Button> */}
            </div>
          </div>
        </Card>

        {/* Stats cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Total Orders</div>
            <div className="mt-2 text-2xl font-semibold">{totalOrders}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">
              Pending Approval
            </div>
            <div className="mt-2 text-2xl font-semibold">{pendingApproval}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Approved Orders</div>
            <div className="mt-2 text-2xl font-semibold">{approvedOrders}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Total Spend</div>
            <div className="mt-2 text-2xl font-semibold">
              {formatAmount(totalSpend)}
            </div>
          </Card>
        </div>

        {/* Table list */}
        <Card className="rounded-xl border border-border/60 p-4">
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="pb-2">PO Number</th>
                  <th className="pb-2">Organization</th>
                  <th className="pb-2">Contact</th>
                  <th className="pb-2">Items</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Payment</th>
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              {isLoading ? (
                <tbody>
                  <tr>
                    <td
                      colSpan={9}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Loading purchase orders...
                    </td>
                  </tr>
                </tbody>
              ) : error ? (
                <tbody>
                  <tr>
                    <td
                      colSpan={9}
                      className="py-8 text-center text-destructive"
                    >
                      Failed to load purchase orders. Please try again.
                    </td>
                  </tr>
                </tbody>
              ) : docs.length === 0 ? (
                <tbody>
                  <tr>
                    <td
                      colSpan={9}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No purchase orders to show.
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody className="divide-y">
                  {docs.map((po: any) => {
                    const id = po.poNumber || "-"
                    const organization =
                      po.quote.organizationName ?? po.quote.organizationName ?? "—";
                    const contact =
                      po.quote.email ?? po.quote.contactName ?? po.quote.contact ?? "—";
                    const itemsCount = Array.isArray(po.quote.products)
                      ? po.quote.products.length
                      : Array.isArray(po.quote.items)
                        ? po.quote.items.length
                        : po.items ?? "—";
                    const amountVal = po.quote.subTotal;
                    const amount = formatAmount(amountVal);
                    const status = po.status ?? "—";
                    const payment = po.paymentStatus ?? "—";
                    const date = formatDate(po.createdAt ?? po.date);
                    return (
                      <tr key={id} className="align-top">
                        <td className="py-3">
                          <div className="font-medium">{id}</div>
                        </td>
                        <td className="py-3">{organization}</td>
                     <td className="py-3">{contact}</td>
                           <td className="py-3">{itemsCount}</td>
                        <td className="py-3">{amount}</td>
                        <td className="py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${getStatusBadgeClass(
                              status
                            )}`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${getPaymentStatusBadgeClass(
                              payment
                            )}`}
                          >
                            {payment}
                          </span>
                        </td>
                        <td className="py-3">{date}</td>
                        <td className="py-3">
                          <NavLink
                            to={`/purchase-orders/${po?.quote?._id}`}
                            className="inline-block"
                          >
                            <Button variant="ghost">View</Button>
                          </NavLink>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              )}
            </table>
          </div>
          {/* Pagination */}
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
        </Card>
      </section>
    </DashboardWithSidebarLayout>
  );
}
