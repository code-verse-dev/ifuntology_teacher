import { getQuoteTotals } from "@/components/quotes/quoteBreakdownUtils";
import type { QuotationLineItem, QuotationReportData } from "./types";

const formatReportDate = (dateVal: string | Date | undefined): string => {
  if (!dateVal) return "—";
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
};

const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const unitFromTotal = (
  total: number | null | undefined,
  qty: number | null | undefined
): number | null => {
  if (total == null || qty == null || qty <= 0) return null;
  return total / qty;
};

function buildLmsLines(quote: any): QuotationLineItem[] {
  const lines: QuotationLineItem[] = [];

  if (Array.isArray(quote?.lmsCourses) && quote.lmsCourses.length > 0) {
    for (const course of quote.lmsCourses) {
      const plan =
        course.subscriptionType === "yearly" ? "Yearly" : "Monthly";
      const courseType = course.courseType ?? "LMS Course";

      if (course.kitsTotal != null && Number(course.noOfKits) > 0) {
        lines.push({
          qty: course.noOfKits,
          title: courseType,
          subtitle: `${courseType} Student Kits`,
          unitPrice: unitFromTotal(course.kitsTotal, course.noOfKits),
          lineTotal: course.kitsTotal,
        });
      }

      if (course.subscriptionTotal != null && Number(course.webSubscriptions) > 0) {
        lines.push({
          qty: course.webSubscriptions,
          title: `${courseType} LMS Subscription`,
          subtitle: `${plan} web subscription${Number(course.webSubscriptions) === 1 ? "" : "s"}`,
          unitPrice: unitFromTotal(
            course.subscriptionTotal,
            course.webSubscriptions
          ),
          lineTotal: course.subscriptionTotal,
        });
      }
    }
    return lines;
  }

  if (quote?.subscriptionTotal != null) {
    const qty =
      quote.webSubscriptions ?? quote.noOfKits ?? quote.noOfStudents ?? 1;
    const plan = quote.subscriptionType === "yearly" ? "Yearly" : "Monthly";
    lines.push({
      qty,
      title: "LMS Subscription",
      subtitle: `${plan} subscription`,
      unitPrice: unitFromTotal(quote.subscriptionTotal, qty),
      lineTotal: quote.subscriptionTotal,
    });
  }

  if (quote?.kitsTotal != null && Number(quote.noOfKits) > 0) {
    lines.push({
      qty: quote.noOfKits,
      title: quote.courseType ?? "Course Kits",
      subtitle: `${quote.courseType ?? "Course"} Student Kits`,
      unitPrice: unitFromTotal(quote.kitsTotal, quote.noOfKits),
      lineTotal: quote.kitsTotal,
    });
  }

  return lines;
}

function buildWtrLines(quote: any): QuotationLineItem[] {
  const lines: QuotationLineItem[] = [];
  const seats =
    quote.wtrNumberOfSeats ??
    quote.noOfSubscriptions ??
    quote.noOfStudentsInBatch;
  const lineTotal =
    quote.wtrLineTotal != null ? quote.wtrLineTotal : quote.subTotal;
  const planRaw = String(quote.wtrSubscriptionType ?? "yearly").toLowerCase();
  const plan = planRaw === "yearly" ? "Yearly" : "Monthly";

  if (seats != null && lineTotal != null) {
    lines.push({
      qty: seats,
      title: "Write to Read",
      subtitle: `${plan} subscription — ${quote.wtrSubscriberKind === "INDIVIDUAL" ? "Individual" : "Teacher classroom"} seats`,
      unitPrice: unitFromTotal(lineTotal, Number(seats)),
      lineTotal: Number(lineTotal),
    });
  }

  if (quote.bookPrintingRequests === true) {
    lines.push({
      qty: "—",
      title: "Book Printing",
      subtitle: "Book printing requested",
      unitPrice: null,
      lineTotal: null,
    });
  }

  return lines;
}

function buildEnrichmentLines(quote: any): QuotationLineItem[] {
  if (!Array.isArray(quote?.products)) return [];
  return quote.products.map((item: any) => ({
    qty: item.quantity ?? "—",
    title: item.name ?? "Product",
    subtitle: "Enrichment store item",
    unitPrice: item.price ?? null,
    lineTotal: item.total ?? null,
  }));
}

function buildShopBundleLines(quote: any): QuotationLineItem[] {
  const lines: QuotationLineItem[] = [];
  lines.push(...buildLmsLines(quote));
  lines.push(...buildEnrichmentLines(quote));
  lines.push(...buildWtrLines(quote));
  return lines;
}

function buildLineItems(quote: any): QuotationLineItem[] {
  if (!quote) return [];

  switch (quote.serviceType) {
    case "lms":
      return buildLmsLines(quote);
    case "write_to_read":
      return buildWtrLines(quote);
    case "enrichment_store":
      return buildEnrichmentLines(quote);
    case "shop_bundle":
      return buildShopBundleLines(quote);
    default:
      return [];
  }
}

function buildRecipientAddress(quote: any): string[] {
  const lines: string[] = [];
  if (quote?.streetAddress) {
    const cityLine = [quote.city, quote.state, quote.zipCode]
      .filter(Boolean)
      .join(", ");
    lines.push(quote.streetAddress);
    if (cityLine) lines.push(cityLine);
    if (quote.country) lines.push(quote.country);
    return lines;
  }
  if (quote?.address) {
    lines.push(quote.address);
  }
  return lines;
}

export function buildQuotationReportData(
  purchaseOrder: any
): QuotationReportData | null {
  if (!purchaseOrder?.quote) return null;

  const quote = purchaseOrder.quote;
  const lineItems = buildLineItems(quote);
  const { lineSubtotal, tax, shipping, grandTotal } = getQuoteTotals(quote);
  const subtotal = lineSubtotal;
  const total = Number(purchaseOrder.amount ?? grandTotal);

  return {
    date: formatReportDate(purchaseOrder.createdAt ?? quote.createdAt),
    invoiceNumber: purchaseOrder.invoiceNumber ?? "—",
    quoteExpires: formatReportDate(purchaseOrder.dueDate),
    poNumber: purchaseOrder.poNumber?.trim() || "Please Email",
    recipient: {
      organizationName: quote.organizationName ?? "—",
      addressLines: buildRecipientAddress(quote),
      email: quote.email ?? quote.user?.email ?? "—",
      phone: quote.user?.phoneNumber ?? "—",
    },
    lineItems,
    subtotal,
    shipping,
    tax,
    total,
  };
}

export { formatCurrency };
