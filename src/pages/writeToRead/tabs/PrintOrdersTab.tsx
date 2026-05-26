import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useApprovePrintOrderMutation,
  useGetTeacherPrintOrdersQuery,
} from "@/redux/services/apiSlices/printOrderSlice";

type ShippingAddress = {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
};

type BookDetails = {
  _id?: string;
  title?: string;
  wordCount?: number;
  pageCount?: number;
};

type IsbnDetails = {
  _id?: string;
  value?: string;
};

type TeacherPrintOrderDoc = {
  _id: string;
  status: string;
  quantity: number;
  format: string;
  pageCountSnapshot: number;
  totalAmount?: number;
  shippingAddress?: ShippingAddress;
  createdAt?: string;
  bookDetails?: BookDetails;
  assignedIsbnDetails?: IsbnDetails | null;
};

const PAGE_SIZE = 10;

function formatShippingLines(addr?: ShippingAddress): string {
  if (!addr) return "—";
  const parts = [
    [addr.line1, addr.line2].filter(Boolean).join(", "),
    [addr.city, addr.state, addr.postalCode].filter(Boolean).join(", "),
    addr.country,
    addr.phone,
  ].filter((p) => p && String(p).trim());
  return parts.length ? parts.join(" • ") : "—";
}

function formatOrderDate(createdAt?: string): string {
  if (!createdAt) return "—";
  try {
    const d =
      typeof createdAt === "string"
        ? parseISO(createdAt)
        : new Date(createdAt);
    return format(d, "MMM d, yyyy");
  } catch {
    return "—";
  }
}

function formatLabel(raw: string): string {
  return raw
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case "REQUESTED":
      return "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400";
    case "AWAITING_PAYMENT":
      return "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300";
    case "PAID":
      return "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300";
    case "APPROVED":
      return "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400";
    case "FULFILLED":
      return "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200";
    case "CANCELED":
      return "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400";
    default:
      return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
  }
}

export function PrintOrdersTab() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { data: printOrdersRes, isLoading, isError, refetch } =
    useGetTeacherPrintOrdersQuery({ page, limit: PAGE_SIZE });
  const [approvePrintOrder] = useApprovePrintOrderMutation();
  const [approvingOrderId, setApprovingOrderId] = useState<string | null>(null);

  const listData = printOrdersRes?.data;
  const orders: TeacherPrintOrderDoc[] = useMemo(
    () => listData?.docs ?? [],
    [listData?.docs]
  );
  const totalPages = Math.max(1, Number(listData?.totalPages) || 1);
  const totalDocs =
    listData?.totalDocs != null ? Number(listData.totalDocs) : orders.length;

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const handleApprove = async (orderId: string) => {
    setApprovingOrderId(orderId);
    try {
      await approvePrintOrder({ id: orderId }).unwrap();
      toast.success("Print order approved. Awaiting payment.");
    } catch (e: any) {
      const msg =
        e?.data?.message ??
        e?.data?.response?.message ??
        "Could not approve this order.";
      toast.error(typeof msg === "string" ? msg : "Could not approve this order.");
    } finally {
      setApprovingOrderId(null);
    }
  };

  const goToPrintPayment = (order: TeacherPrintOrderDoc) => {
    navigate("/payment", {
      state: {
        type: "WTR_PRINT",
        printOrderId: order._id,
        total: Number(order.totalAmount ?? 0),
      },
    });
  };

  return (
    <TabsContent
      value="print"
      className="space-y-6 mt-0 outline-none text-left"
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 px-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
          Book print orders
        </h3>
        {totalDocs > 0 ? (
          <p className="text-xs font-medium text-slate-500">
            {totalDocs} order{totalDocs === 1 ? "" : "s"} • page {page} of{" "}
            {totalPages}
          </p>
        ) : null}
      </div>

      {isLoading && (
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 px-4">
          Loading print orders…
        </p>
      )}

      {isError && (
        <Card className="rounded-[2rem] border-none bg-white dark:bg-slate-900 p-8 shadow-sm mx-4">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Could not load print orders.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4 rounded-full"
            onClick={() => refetch()}
          >
            Retry
          </Button>
        </Card>
      )}

      {!isLoading && !isError && orders.length === 0 && (
        <Card className="rounded-[2rem] border-none bg-white dark:bg-slate-900 p-8 shadow-sm mx-4">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            No print orders yet.
          </p>
        </Card>
      )}

      {!isLoading &&
        !isError &&
        orders.map((order) => {
          const book = order.bookDetails;
          const title = book?.title ?? "Untitled book";
          const isbnValue = order.assignedIsbnDetails?.value;

          return (
            <Card
              key={order._id}
              className="rounded-[2rem] border-none bg-white dark:bg-slate-900 p-8 shadow-sm space-y-6"
            >
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-lime-50 dark:bg-lime-500/10 flex items-center justify-center text-lime-500 shrink-0">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight flex flex-wrap items-center gap-2">
                      {title}
                      <Badge
                        className={cn(
                          "rounded-lg px-2 text-[10px] font-bold uppercase tracking-wide border-none",
                          statusBadgeClass(order.status)
                        )}
                      >
                        {formatLabel(order.status)}
                      </Badge>
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">
                      Order date: {formatOrderDate(order.createdAt)}
                    </p>
                  </div>
                </div>
                <p className="text-2xl font-black text-lime-600">
                  ${Number(order.totalAmount ?? 0).toFixed(2)}{" "}
                  <span className="text-[10px] text-slate-400 block text-right font-bold uppercase tracking-widest">
                    Total
                  </span>
                </p>
              </div>

              {order.status === "PAID" && (
                <div className="rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 px-5 py-4 space-y-1">
                  <p className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-widest">
                    Processing
                  </p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Payment done — your order is being processed for print.
                  </p>
                </div>
              )}

              {order.status === "APPROVED" && (
                <div className="rounded-2xl border border-green-100 dark:border-green-900/40 bg-green-50/50 dark:bg-green-950/20 px-5 py-4 space-y-2">
                  <p className="text-xs font-bold text-green-700 dark:text-green-300 uppercase tracking-widest">
                    Approved for print
                  </p>
                  {isbnValue ? (
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      ISBN: <span className="font-mono">{isbnValue}</span>
                    </p>
                  ) : (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      ISBN will appear here once assigned to this order.
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <Badge className="bg-orange-500 text-white rounded-full px-4 h-8 font-bold text-xs border-none">
                  {order.pageCountSnapshot ?? book?.pageCount ?? 0} pages
                </Badge>
                <Badge className="bg-orange-600 text-white rounded-full px-4 h-8 font-bold text-xs border-none">
                  {book?.wordCount ?? 0} words
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Quantity", value: String(order.quantity) },
                  {
                    label: "Format",
                    value: order.format
                      ? formatLabel(order.format)
                      : "—",
                  },
                  {
                    label: "Pages (snapshot)",
                    value: String(order.pageCountSnapshot ?? "—"),
                  },
                  {
                    label: "ISBN",
                    value:
                      order.status === "APPROVED" && isbnValue
                        ? isbnValue
                        : "—",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 text-left border border-slate-100 dark:border-slate-800/50"
                  >
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {item.label}
                    </p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight break-all">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="bg-orange-50/30 dark:bg-orange-500/5 rounded-2xl p-5 flex items-center justify-between border border-orange-100/50 dark:border-orange-500/10">
                <div className="flex items-center gap-4 text-left min-w-0">
                  <div className="h-5 w-5 text-orange-500 shrink-0">
                    <TrendingUp className="h-5 w-5 rotate-45" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">
                      Shipping address
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium break-words">
                      {formatShippingLines(order.shippingAddress)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {order.status === "REQUESTED" && (
                  <Button
                    type="button"
                    className="rounded-full bg-lime-600 hover:bg-lime-700 text-white h-11 px-8 font-bold border-none"
                    disabled={approvingOrderId === order._id}
                    onClick={() => handleApprove(order._id)}
                  >
                    Approve order
                  </Button>
                )}
                {order.status === "AWAITING_PAYMENT" && (
                  <Button
                    type="button"
                    className="rounded-full bg-lime-600 hover:bg-lime-700 text-white h-11 px-8 font-bold border-none"
                    onClick={() => goToPrintPayment(order)}
                  >
                    Pay now
                  </Button>
                )}
              </div>
            </Card>
          );
        })}

      {!isLoading && !isError && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full gap-1"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-xs font-bold text-slate-500 tabular-nums">
            {page} / {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full gap-1"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </TabsContent>
  );
}
