import { Card } from "@/components/ui/card";
import {
  formatBillingPeriod,
  formatBool,
  formatKitVariant,
  formatQuoteCurrency,
  formatWtrSubscriberKind,
  getQuoteTotals,
  unitPrice,
} from "./quoteBreakdownUtils";

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
      {children}
    </p>
  );
}

function SectionSubtotal({
  label,
  amount,
}: {
  label: string;
  amount: number | null | undefined;
}) {
  if (amount == null) return null;
  return (
    <div className="flex justify-between border-t border-border/40 pt-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{formatQuoteCurrency(amount)}</span>
    </div>
  );
}

function OrganizationContactBlock({ quoteData }: { quoteData: any }) {
  const rows = [
    { label: "Email", value: quoteData.email },
    { label: "Address", value: quoteData.address },
    { label: "Street address", value: quoteData.streetAddress },
    { label: "City", value: quoteData.city },
    { label: "State", value: quoteData.state },
    { label: "Zip code", value: quoteData.zipCode },
    { label: "Country", value: quoteData.country },
  ];

  return (
    <Card className="rounded-xl border border-border/60 p-4">
      <SectionHeading>Organization &amp; contact details</SectionHeading>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label} className="rounded-lg bg-muted/40 px-3 py-2 text-sm">
            <p className="text-xs text-muted-foreground">{row.label}</p>
            <p className="font-medium">{row.value || "—"}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function LmsCoursesBlock({ quoteData }: { quoteData: any }) {
  const courses = Array.isArray(quoteData.lmsCourses) ? quoteData.lmsCourses : [];

  const renderLineItem = (
    label: string,
    qty: number | undefined,
    lineTotal: number | undefined
  ) => {
    const unit = unitPrice(lineTotal, qty);
    return (
      <div className="rounded-lg bg-muted/30 px-3 py-2 text-sm">
        <p className="font-medium">{label}</p>
        <p className="text-muted-foreground">
          Qty: <span className="font-medium text-foreground">{qty ?? "—"}</span>
          {unit != null && (
            <span> · {formatQuoteCurrency(unit)} each</span>
          )}
        </p>
        <p className="font-semibold">{formatQuoteCurrency(lineTotal)}</p>
      </div>
    );
  };

  if (courses.length > 0) {
    const lmsSectionTotal =
      quoteData.kitsTotal != null || quoteData.subscriptionTotal != null
        ? Number(quoteData.kitsTotal ?? 0) + Number(quoteData.subscriptionTotal ?? 0)
        : courses.reduce((sum: number, c: any) => sum + Number(c.total ?? 0), 0);

    return (
      <div className="space-y-3">
        {courses.map((course: any, i: number) => (
          <div
            key={`${course.courseType}-${i}`}
            className="rounded-xl border border-border/60 p-4 space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{course.courseType ?? "—"}</p>
                <p className="text-xs text-muted-foreground">
                  {formatKitVariant(course.kitVariant)}
                  {course.subscriptionType
                    ? ` · ${formatBillingPeriod(course.subscriptionType)} billing`
                    : ""}
                </p>
              </div>
              <p className="font-semibold whitespace-nowrap">
                {formatQuoteCurrency(course.total)}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {renderLineItem(
                "Interactive digital curriculum",
                course.webSubscriptions,
                course.subscriptionTotal
              )}
              {renderLineItem("Physical kits", course.noOfKits, course.kitsTotal)}
            </div>
          </div>
        ))}
        <SectionSubtotal label="LMS section subtotal" amount={lmsSectionTotal} />
      </div>
    );
  }

  const legacyTotal =
    Number(quoteData.kitsTotal ?? 0) + Number(quoteData.subscriptionTotal ?? 0);

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border/60 p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold">{quoteData.courseType ?? "—"}</p>
            <p className="text-xs text-muted-foreground">
              {formatBillingPeriod(quoteData.subscriptionType) ?? "—"} billing
            </p>
          </div>
          <p className="font-semibold">
            {formatQuoteCurrency(legacyTotal || quoteData.total)}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {renderLineItem(
            "Interactive digital curriculum",
            quoteData.webSubscriptions,
            quoteData.subscriptionTotal
          )}
          {renderLineItem("Physical kits", quoteData.noOfKits, quoteData.kitsTotal)}
        </div>
      </div>
      <SectionSubtotal label="LMS section subtotal" amount={legacyTotal || quoteData.total} />
    </div>
  );
}

function ProductsBlock({ quoteData }: { quoteData: any }) {
  const products = quoteData.products ?? [];
  if (!products.length) return null;

  const productsSubtotal = products.reduce(
    (sum: number, item: any) =>
      sum + Number(item.total ?? (item.price ?? 0) * (item.quantity ?? 0)),
    0
  );

  return (
    <div className="space-y-3">
      <div className="overflow-auto rounded-xl border border-border/60">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
              <th className="px-3 py-2 font-semibold">Product</th>
              <th className="px-3 py-2 text-right font-semibold">Qty</th>
              <th className="px-3 py-2 text-right font-semibold">Unit price</th>
              <th className="px-3 py-2 text-right font-semibold">Line total</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((item: any, i: number) => (
              <tr key={i}>
                <td className="px-3 py-2.5 font-medium">
                  {item.name ?? item.title ?? "—"}
                </td>
                <td className="px-3 py-2.5 text-right">{item.quantity ?? "—"}</td>
                <td className="px-3 py-2.5 text-right">
                  {formatQuoteCurrency(item.price)}
                </td>
                <td className="px-3 py-2.5 text-right font-semibold">
                  {formatQuoteCurrency(item.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {quoteData.couponCode && (
        <p className="text-xs text-emerald-700">
          Coupon applied: <span className="font-semibold">{quoteData.couponCode}</span>
        </p>
      )}
      <SectionSubtotal label="Enrichment section subtotal" amount={productsSubtotal} />
    </div>
  );
}

function WtrBlock({ quoteData }: { quoteData: any }) {
  const isLegacyWtr = quoteData.serviceType === "write_to_read";
  const isShopWtr = Boolean(
    quoteData.wtrSubscriberKind ||
      quoteData.wtrSubscriptionType ||
      quoteData.wtrLineTotal != null ||
      quoteData.wtrNumberOfSeats != null
  );

  if (!isLegacyWtr && !isShopWtr) return null;

  const seats =
    quoteData.wtrNumberOfSeats ??
    quoteData.noOfStudentsInBatch ??
    quoteData.noOfSubscriptions;

  const lineTotal =
    quoteData.wtrLineTotal != null
      ? Number(quoteData.wtrLineTotal)
      : isLegacyWtr && quoteData.total != null
        ? Number(quoteData.total)
        : null;

  return (
    <div className="rounded-xl border border-border/60 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">Write to Read</p>
          <p className="text-xs text-muted-foreground">
            {[formatWtrSubscriberKind(quoteData.wtrSubscriberKind), formatBillingPeriod(quoteData.wtrSubscriptionType) || "Lifetime"]
              .filter(Boolean)
              .join(" · ") || "Subscription"}
          </p>
        </div>
        {lineTotal != null && (
          <p className="font-semibold whitespace-nowrap">
            {formatQuoteCurrency(lineTotal)}
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-sm">
        {seats != null && (
          <div className="rounded-lg bg-muted/30 px-3 py-2">
            <p className="text-xs text-muted-foreground">Student seats</p>
            <p className="font-medium">{seats}</p>
          </div>
        )}
        <div className="rounded-lg bg-muted/30 px-3 py-2">
          <p className="text-xs text-muted-foreground">Book printing requested</p>
          <p className="font-medium">{formatBool(quoteData.bookPrintingRequests)}</p>
        </div>
      </div>
      {lineTotal != null && (
        <SectionSubtotal label="Write to Read section subtotal" amount={lineTotal} />
      )}
    </div>
  );
}

function TotalsBreakdown({ quoteData }: { quoteData: any }) {
  const { lineSubtotal, tax, shipping, grandTotal } = getQuoteTotals(quoteData);

  return (
    <Card className="rounded-xl border border-border/60 p-4">
      <SectionHeading>Order totals</SectionHeading>
      <div className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal (line items)</span>
          <span className="font-medium text-foreground">
            {formatQuoteCurrency(lineSubtotal)}
          </span>
        </div>
        {shipping > 0 && (
          <div className="flex justify-between text-muted-foreground">
            <span>Shipping</span>
            <span className="font-medium text-foreground">
              {formatQuoteCurrency(shipping)}
            </span>
          </div>
        )}
        <div className="flex justify-between text-muted-foreground">
          <span>Tax</span>
          <span className="font-medium text-foreground">{formatQuoteCurrency(tax)}</span>
        </div>
        <div className="flex justify-between border-t border-border/60 pt-2 text-base font-bold">
          <span>Grand total</span>
          <span>{formatQuoteCurrency(grandTotal)}</span>
        </div>
      </div>
    </Card>
  );
}

export default function QuoteItemsBreakdown({ quoteData }: { quoteData: any }) {
  if (!quoteData) {
    return (
      <p className="text-sm text-muted-foreground italic">No item details available.</p>
    );
  }

  if (quoteData.serviceType === "shop_bundle") {
    const hasLms = (quoteData.lmsCourses?.length ?? 0) > 0 || quoteData.courseType;
    const hasProducts = (quoteData.products?.length ?? 0) > 0;
    const hasWtr = Boolean(
      quoteData.wtrSubscriberKind ||
        quoteData.wtrSubscriptionType ||
        quoteData.wtrLineTotal != null ||
        quoteData.wtrNumberOfSeats != null
    );

    return (
      <div className="space-y-4">
        <OrganizationContactBlock quoteData={quoteData} />
        <Card className="rounded-xl border border-border/60 p-4">
          <SectionHeading>Requested bundle</SectionHeading>
          <p className="mt-2 text-sm text-muted-foreground">
            Combined shop request — each included section is listed below.
          </p>
        </Card>

        {hasLms && (
          <Card className="rounded-xl border border-border/60 p-4 space-y-3">
            <SectionHeading>Workforce Readiness (LMS)</SectionHeading>
            <LmsCoursesBlock quoteData={quoteData} />
          </Card>
        )}

        {hasProducts && (
          <Card className="rounded-xl border border-border/60 p-4 space-y-3">
            <SectionHeading>Enrichment Store</SectionHeading>
            <ProductsBlock quoteData={quoteData} />
          </Card>
        )}

        {hasWtr && (
          <Card className="rounded-xl border border-border/60 p-4 space-y-3">
            <SectionHeading>Write to Read</SectionHeading>
            <WtrBlock quoteData={quoteData} />
          </Card>
        )}

        {!hasLms && !hasProducts && !hasWtr && (
          <p className="text-sm text-muted-foreground italic">
            No bundle sections found on this quote.
          </p>
        )}

        <TotalsBreakdown quoteData={quoteData} />

        {quoteData.shopFulfilled && (
          <p className="text-xs text-emerald-700">
            Fulfilled via{" "}
            {quoteData.shopFulfillmentSource?.replace(/_/g, " ") ?? "shop"}
          </p>
        )}
      </div>
    );
  }

  if (quoteData.serviceType === "lms") {
    return (
      <div className="space-y-4">
        <OrganizationContactBlock quoteData={quoteData} />
        <Card className="rounded-xl border border-border/60 p-4 space-y-3">
          <SectionHeading>Workforce Readiness (LMS)</SectionHeading>
          <LmsCoursesBlock quoteData={quoteData} />
        </Card>
        <TotalsBreakdown quoteData={quoteData} />
      </div>
    );
  }

  if (quoteData.serviceType === "enrichment_store") {
    return (
      <div className="space-y-4">
        <OrganizationContactBlock quoteData={quoteData} />
        <Card className="rounded-xl border border-border/60 p-4 space-y-3">
          <SectionHeading>Enrichment Store</SectionHeading>
          <ProductsBlock quoteData={quoteData} />
        </Card>
        <TotalsBreakdown quoteData={quoteData} />
      </div>
    );
  }

  if (quoteData.serviceType === "write_to_read") {
    return (
      <div className="space-y-4">
        <OrganizationContactBlock quoteData={quoteData} />
        <Card className="rounded-xl border border-border/60 p-4 space-y-3">
          <SectionHeading>Write to Read</SectionHeading>
          <WtrBlock quoteData={quoteData} />
        </Card>
        <TotalsBreakdown quoteData={quoteData} />
      </div>
    );
  }

  return (
    <p className="text-sm text-muted-foreground italic">No item details available.</p>
  );
}
