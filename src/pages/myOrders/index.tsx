import { useEffect, useState } from "react";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGetOrdersQuery } from "@/redux/services/apiSlices/orderSlice";

interface Query {
  limit: number;
  page: number;
  keyword?: string;
}

const getStatusColor = (
  status: "processing" | "shipped" | "completed" | "cancelled"
) => {
  switch (status) {
    case "processing":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400";
    case "completed":
      return "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400";
    case "shipped":
      return "bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400";
    case "cancelled":
      return "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-400";
  }
};

export default function MyOrdersPage() {
  const navigate = useNavigate();
  const [paginationConfig, setPaginationConfig] = useState({
    pageNumber: 1,
    limit: 10,
    totalDocs: 0,
    totalPages: 0,
  });
  const [queryOptions, setQueryOptions] = useState<Query>({
    page: 1,
    limit: 10,
  });
  const { data, error, isLoading } = useGetOrdersQuery(queryOptions);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (data?.data) {
      setPaginationConfig({
        pageNumber: data?.data?.page,
        limit: data?.data?.limit,
        totalDocs: data?.data?.total,
        totalPages: data?.data?.totalPages,
      });
    }
  }, [data]);

  useEffect(() => {
    document.title = "My Orders • iFuntology Teacher";
    if (data) {
      console.log("Orders response:", data);
    }
  }, [data]);

  const handleViewOrder = (orderNumber: string) => {
    // Navigate to order details page (to be created later)
    navigate(`/my-orders/${orderNumber}`);
  };

  const handlePayInvoice = (orderNumber: string) => {
    // Navigate to pay invoice page (to be created later)
    navigate(`/my-orders/${orderNumber}/pay-invoice`);
  };

  const handleViewReceipt = (orderNumber: string) => {
    // Navigate to receipt page (to be created later)
    navigate(`/my-orders/${orderNumber}/receipt`);
  };

  useEffect(() => {
    setQueryOptions((prev) => ({
      ...prev,
      keyword: search || undefined,
      page: 1, // reset to first page on filter change
    }));
  }, [search]);

  return (
    <DashboardWithSidebarLayout>
      <section className="mx-auto w-full  space-y-6">
        <h1 className="text-2xl font-extrabold">My Orders</h1>

        {/* Search and Filter */}
        <Card className="rounded-2xl border border-border/60 p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3 w-full md:w-1/2">
              <div className="flex-1">
                <Input
                  placeholder="Search Order#"
                  onChange={(e) => setSearch(e.target.value)}
                  value={search}
                />
              </div>
              <Button
                variant="outline"
                className="bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
              >
                Filter By
              </Button>
            </div>
          </div>
        </Card>

        {/* Orders Table */}
        <Card className="rounded-xl border border-border/60 p-4">
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="pb-2">Order Number</th>
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Qty</th>
                  <th className="pb-2">Total Price</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              {isLoading ? (
                <tbody>
                  <tr>
                    <td
                      colSpan={6}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Loading orders...
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody className="divide-y">
                  {Array.isArray(data.data.docs) &&
                    data.data.docs.map((order: any, index: number) => (
                      <tr key={`${order._id}-${index}`} className="align-top">
                        <td className="py-3">
                          <div className="font-medium">
                            #{order._id}
                          </div>
                        </td>
                        <td className="py-3">
                          {(() => {
                            const d = new Date(order.createdAt);
                            if (isNaN(d.getTime())) return order.createdAt;
                            const day = String(d.getDate()).padStart(2, "0");
                            const month = d
                              .toLocaleString("en-GB", { month: "short" })
                              .toLowerCase();
                            const year = d.getFullYear();
                            return `${day} ${month}, ${year}`;
                          })()}
                        </td>
                        <td className="py-3">
                          {(order?.cart?.items ?? []).reduce(
                            (total: number, item: any) =>
                              total + Number(item.quantity ?? 0),
                            0
                          )}
                        </td>
                        <td className="py-3">
                          {order?.cart?.coupon ? (
                            <div>
                              <span className="line-through text-gray-400 mr-2">
                                ${order?.cart?.subtotal.toFixed(2)}
                              </span>
                              <span className="text-green-600 font-semibold">
                                ${order?.cart?.total.toFixed(2)}
                              </span>
                              <span className="ml-1 text-xs text-green-700">
                                (Discount applied)
                              </span>
                            </div>
                          ) : (
                            <>${order?.cart?.total.toFixed(2)}</>
                          )}
                        </td>
                        <td className="py-3">
                          <Badge
                            className={`${getStatusColor(
                              order.status
                            )} border-0`}
                          >
                            {order.status}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleViewOrder(order._id)
                                  }
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </DropdownMenuItem>
                                {/* <DropdownMenuItem
                                  onClick={() => handlePayInvoice(order._id)}
                                >
                                  <CreditCard className="h-4 w-4 mr-2" />
                                  Pay Invoice
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleViewReceipt(order._id)}
                                >
                                  <FileText className="h-4 w-4 mr-2" />
                                  Receipt
                                </DropdownMenuItem> */}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              )}
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <div>
              {paginationConfig.totalDocs > 0
                ? `Showing ${
                    (paginationConfig.pageNumber - 1) * paginationConfig.limit +
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
