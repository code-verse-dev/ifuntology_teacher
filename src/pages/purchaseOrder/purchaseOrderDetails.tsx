import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Info, Box, Truck, CheckCircle, MapPin, Download, ExternalLink, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetPurchaseOrderByQuoteIdQuery } from "@/redux/services/apiSlices/purchaseOrderSlice";
import { formatDate } from "@/lib/utils";

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

export default function PurchaseOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    document.title = `${purchaseOrderData?.poNumber ?? "Purchase Order"} • Purchase Order Details`;
  }, [id]);
  const { data: purchaseOrder, isLoading: isLoadingPurchaseOrder } = useGetPurchaseOrderByQuoteIdQuery(id ?? "");
  let purchaseOrderData = purchaseOrder?.data;

  return (
    <DashboardWithSidebarLayout>
      <section className="mx-auto w-full  space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground cursor-pointer" onClick={() => navigate(-1)}>← Back to Purchase Orders</div>
            <h1 className="text-2xl font-extrabold mt-2">{purchaseOrderData?.poNumber ?? "Purchase Order"}</h1>
            <div className="text-sm text-muted-foreground">{purchaseOrderData?.quote?.organizationName ?? "-"}</div>
          </div>

          <div className="flex items-center gap-3">
            {/* <Button variant="accent">Pay Invoice</Button> */}
            <Button variant="ghost">Download</Button>
            <Button variant="ghost">Copy PO</Button>
            <Button variant="outline" onClick={() => navigate(-1)}>Close</Button>
          </div>
        </div>
        {/* Top stats cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Total Amount</div>
            <div className="mt-2 text-2xl font-semibold">${purchaseOrderData?.amount ?? "-"}</div>
          </Card>

          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Paid</div>
            <div className="mt-2 text-2xl font-semibold">${purchaseOrderData?.paidAmount ?? "-"}</div>
          </Card>

          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Balance Due</div>
            <div className="mt-2 text-2xl font-semibold">${purchaseOrderData?.amount - purchaseOrderData?.paidAmount}</div>
          </Card>

          {purchaseOrderData?.quote?.products?.length > 0 && <Card className="p-4">
            <div className="text-sm text-muted-foreground">Items</div>
            <div className="mt-2 text-2xl font-semibold">{purchaseOrderData?.quote?.products?.length ?? "-"}</div>
          </Card>}
        </div>

        {/* Info / CTA box */}
        <div className="rounded-lg border border-emerald-200 p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="text-sm font-semibold">Your PO Number is Ready to Use</div>
                <div className="mt-2 text-sm text-white">Your PO Number ({purchaseOrderData?.poNumber ?? "-"}) can now be used to access the following services:</div>
                <ul className="mt-3 ml-4 list-disc text-sm text-white">
                  {purchaseOrderData?.quote?.serviceType === "lms" && <li>LMS Subscriptions: Use this PO number during checkout for course subscriptions</li>}
                  {purchaseOrderData?.quote?.serviceType === "write_to_read" && <li>Write to Read: Activate student accounts using this PO number</li>}
                  {purchaseOrderData?.quote?.serviceType === "enrichment_store" && <li>E-commerce: Physical kits will be shipped automatically</li>}
                </ul>
                <div className="mt-3 text-sm text-white">IMPORTANT: This PO number is valid only for the exact quantities and items listed in this order. Any changes require a new purchase order.</div>
              </div>
            </div>

            <div className="flex gap-3">
              {purchaseOrderData?.quote?.serviceType === "lms" && <Button variant="outline" className="text-white bg-[#f56e14] hover:text-white">Go to LMS Subscriptions</Button>}
              {purchaseOrderData?.quote?.serviceType === "write_to_read" && <Button variant="outline" className="text-white bg-[#f56e14] hover:text-white">Go to Write to Read</Button>}
              {purchaseOrderData?.quote?.serviceType === "enrichment_store" && <Button variant="outline" className="text-white bg-[#f56e14] hover:text-white">Go to Ecommerce Store</Button>}
            </div>
          </div>
        </div>

        <Card className="rounded-2xl border border-border/60 p-4">
          <div className="flex gap-3">
            {[
              { key: "overview", label: "Overview" },
              { key: "items", label: "Items" },
              // { key: "payment", label: "Payment" },
              // { key: "shipping", label: "Shipping" },
              // { key: "documents", label: "Documents" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`rounded-md px-3 py-2 text-sm ${tab === t.key ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </Card>

        <Card className="rounded-xl border border-border/60 p-6">
          {tab === "overview" && (
            <div>
              <h3 className="text-lg font-semibold">Overview</h3>
              <p className="mt-2 text-sm text-muted-foreground">Summary and order information for {purchaseOrderData?.poNumber ?? "-"}.</p>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-md border border-border/60 p-4">
                  <div className="text-sm font-semibold">Contact Information</div>
                  <div className="mt-3 text-sm text-muted-foreground">{purchaseOrderData?.quote?.organizationName}<br />
                    {purchaseOrderData?.quote?.user?.firstName} {purchaseOrderData?.quote?.user?.lastName}<br />
                    {purchaseOrderData?.quote?.user?.email}<br />
                    {purchaseOrderData?.quote?.user?.phoneNumber}</div>
                </div>

                <div className="rounded-md border border-border/60 p-4">
                  <div className="text-sm font-semibold">Order Information</div>
                  <div className="mt-3 text-sm text-muted-foreground">PO Number: {purchaseOrderData?.poNumber ?? "-"}<br />Quote ID: #{
                    purchaseOrderData?.quote?._id ?? "-"
                  }<br />Created: {formatDate(purchaseOrderData?.quote?.createdAt)}<br />Approved: {formatDate(purchaseOrderData?.createdAt)}</div>
                </div>
              </div>
              {/* Financial Summary */}
              <div className="mt-6">
                <Card className="p-4">
                  <div><h4 className="text-sm font-semibold mb-3">Financial Summary</h4></div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 items-start">
                    <div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between rounded-md bg-muted p-3">
                          <div className="text-sm text-muted-foreground">Subtotal:</div>
                          <div className="text-sm font-medium">${purchaseOrderData?.quote?.total ?? "-"}</div>
                        </div>
                        <div className="flex items-center justify-between rounded-md bg-muted p-3">
                          <div className="text-sm text-muted-foreground">Tax:</div>
                          <div className="text-sm font-medium">${purchaseOrderData?.quote?.taxAmount.toFixed(2) ?? "-"}</div>
                        </div>
                        <div className="flex items-center justify-between rounded-md bg-muted p-3">
                          <div className="text-sm text-muted-foreground">Shipping:</div>
                          <div className="text-sm font-medium">$0</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-lg bg-sky-100 py-1 px-3 text-sky-800">
                        <div className="text-sm">Total Amount:</div>
                        <div className="mt-1 text-lg font-semibold">${purchaseOrderData?.amount ?? "-"}</div>
                      </div>

                      <div className=" flex items-center justify-between rounded-lg bg-emerald-100 py-1 px-3 text-emerald-800">
                        <div className="text-sm">Paid Amount:</div>
                        <div className="mt-1 text-lg font-semibold">${purchaseOrderData?.paidAmount ?? "-"}</div>
                      </div>

                      <div className="flex items-center justify-between rounded-lg bg-orange-100 py-1 px-3 text-orange-800">
                        <div className="text-sm">Balance Due:</div>
                        <div className="mt-1 text-lg font-semibold">${purchaseOrderData?.amount - purchaseOrderData?.paidAmount}</div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {tab === "items" && (
            <div>
              <h3 className="text-lg font-semibold">Order Items</h3>
              {purchaseOrderData?.quote?.serviceType === "lms" ? (
                <div className="mt-4 overflow-auto rounded-lg border border-border/60">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-muted-foreground surface-glass">
                        <th className="px-4 py-3">Item</th>
                        <th className="px-4 py-3">Quantity</th>
                        <th className="px-4 py-3">Unit Price</th>
                        <th className="px-4 py-3">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y bg-card text-card-foreground">
                      {purchaseOrderData?.quote?.subscriptionTotal != null && (
                        <tr>
                          <td className="px-4 py-3">
                            LMS Subscription (
                            {purchaseOrderData.quote.subscriptionType === "yearly"
                              ? "Yearly"
                              : "Monthly"}
                            )
                          </td>
                          <td className="px-4 py-3">
                            {purchaseOrderData.quote.webSubscriptions ??
                              purchaseOrderData.quote.noOfKits ??
                              "—"}
                          </td>
                          <td className="px-4 py-3">
                            {purchaseOrderData.quote.webSubscriptions != null &&
                              purchaseOrderData.quote.subscriptionTotal != null
                              ? formatAmount(
                                purchaseOrderData.quote.subscriptionTotal /
                                purchaseOrderData.quote.webSubscriptions
                              )
                              : "—"}
                          </td>
                          <td className="px-4 py-3">
                            {formatAmount(
                              purchaseOrderData.quote.subscriptionTotal
                            )}
                          </td>
                        </tr>
                      )}
                      {purchaseOrderData?.quote?.kitsTotal != null && (
                        <tr>
                          <td className="px-4 py-3">
                            Course Kits (
                            {purchaseOrderData.quote.courseType ?? "—"})
                          </td>
                          <td className="px-4 py-3">
                            {purchaseOrderData.quote.noOfKits ?? "—"}
                          </td>
                          <td className="px-4 py-3">
                            {purchaseOrderData.quote.noOfKits != null &&
                              purchaseOrderData.quote.kitsTotal != null
                              ? formatAmount(
                                purchaseOrderData.quote.kitsTotal /
                                purchaseOrderData.quote.noOfKits
                              )
                              : "—"}
                          </td>
                          <td className="px-4 py-3">
                            {formatAmount(purchaseOrderData.quote.kitsTotal)}
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="surface-glass">
                        <td className="p-4" colSpan={2} />
                        <td className="px-4 py-3 text-right text-sm font-medium text-card-foreground">
                          Subtotal
                        </td>
                        <td className="px-4 py-3 text-card-foreground font-semibold">
                          {formatAmount(purchaseOrderData?.quote?.subTotal)}
                        </td>
                      </tr>
                      <tr className="surface-glass">
                        <td className="p-4" colSpan={2} />
                        <td className="px-4 py-3 text-right text-sm text-card-foreground">
                          Tax
                        </td>
                        <td className="px-4 py-3 text-card-foreground">
                          {formatAmount(purchaseOrderData?.quote?.taxAmount)}
                        </td>
                      </tr>
                      <tr className="surface-glass">
                        <td className="p-4" colSpan={2} />
                        <td className="px-4 py-3 text-right text-sm font-medium text-card-foreground">
                          Total
                        </td>
                        <td className="px-4 py-3 text-card-foreground font-semibold">
                          {formatAmount(purchaseOrderData?.quote?.total)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : purchaseOrderData?.quote?.serviceType === "write_to_read" ? (
                <div className="mt-4 overflow-auto rounded-lg border border-border/60">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-muted-foreground surface-glass">
                        <th className="px-4 py-3">Item</th>
                        <th className="px-4 py-3">Quantity</th>
                        <th className="px-4 py-3">Unit Price</th>
                        <th className="px-4 py-3">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y bg-card text-card-foreground">
                      {purchaseOrderData?.quote?.subTotal != null &&
                        (purchaseOrderData.quote.noOfSubscriptions != null ||
                          purchaseOrderData.quote.noOfSubscriptions === 0) && (
                        <tr>
                          <td className="px-4 py-3">
                            Write to Read Subscriptions
                          </td>
                          <td className="px-4 py-3">
                            {purchaseOrderData.quote.noOfSubscriptions ?? "—"}
                          </td>
                          <td className="px-4 py-3">
                            {purchaseOrderData.quote.noOfSubscriptions != null &&
                              purchaseOrderData.quote.noOfSubscriptions > 0 &&
                              purchaseOrderData.quote.subTotal != null
                              ? formatAmount(
                                  purchaseOrderData.quote.subTotal /
                                    purchaseOrderData.quote.noOfSubscriptions
                                )
                              : "—"}
                          </td>
                          <td className="px-4 py-3">
                            {formatAmount(purchaseOrderData.quote.subTotal)}
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td className="px-4 py-3">Book Printing Requests</td>
                        <td className="px-4 py-3">
                          {purchaseOrderData?.quote?.bookPrintingRequests ===
                          true
                            ? "Yes"
                            : purchaseOrderData?.quote?.bookPrintingRequests ===
                                false
                              ? "No"
                              : "—"}
                        </td>
                        <td className="px-4 py-3">—</td>
                        <td className="px-4 py-3">—</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr className="surface-glass">
                        <td className="p-4" colSpan={2} />
                        <td className="px-4 py-3 text-right text-sm font-medium text-card-foreground">
                          Subtotal
                        </td>
                        <td className="px-4 py-3 text-card-foreground font-semibold">
                          {formatAmount(purchaseOrderData?.quote?.subTotal)}
                        </td>
                      </tr>
                      <tr className="surface-glass">
                        <td className="p-4" colSpan={2} />
                        <td className="px-4 py-3 text-right text-sm text-card-foreground">
                          Tax
                        </td>
                        <td className="px-4 py-3 text-card-foreground">
                          {formatAmount(purchaseOrderData?.quote?.taxAmount)}
                        </td>
                      </tr>
                      <tr className="surface-glass">
                        <td className="p-4" colSpan={2} />
                        <td className="px-4 py-3 text-right text-sm font-medium text-card-foreground">
                          Total
                        </td>
                        <td className="px-4 py-3 text-card-foreground font-semibold">
                          {formatAmount(purchaseOrderData?.quote?.total)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : purchaseOrderData?.quote?.serviceType === "enrichment_store" &&
                Array.isArray(purchaseOrderData?.quote?.products) &&
                purchaseOrderData.quote.products.length > 0 ? (
                <div className="mt-4 overflow-auto rounded-lg border border-border/60">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-muted-foreground surface-glass">
                        <th className="px-4 py-3">Item</th>
                        <th className="px-4 py-3">Quantity</th>
                        <th className="px-4 py-3">Unit Price</th>
                        <th className="px-4 py-3">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y bg-card text-card-foreground">
                      {purchaseOrderData.quote.products.map(
                        (item: any, idx: number) => (
                          <tr key={item.product ?? idx}>
                            <td className="px-4 py-3">
                              {item.name ?? "—"}
                            </td>
                            <td className="px-4 py-3">
                              {item.quantity ?? "—"}
                            </td>
                            <td className="px-4 py-3">
                              {formatAmount(item.price)}
                            </td>
                            <td className="px-4 py-3">
                              {formatAmount(item.total)}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="surface-glass">
                        <td className="p-4" colSpan={2} />
                        <td className="px-4 py-3 text-right text-sm font-medium text-card-foreground">
                          Subtotal
                        </td>
                        <td className="px-4 py-3 text-card-foreground font-semibold">
                          {formatAmount(purchaseOrderData?.quote?.subTotal)}
                        </td>
                      </tr>
                      <tr className="surface-glass">
                        <td className="p-4" colSpan={2} />
                        <td className="px-4 py-3 text-right text-sm text-card-foreground">
                          Tax
                        </td>
                        <td className="px-4 py-3 text-card-foreground">
                          {formatAmount(purchaseOrderData?.quote?.taxAmount)}
                        </td>
                      </tr>
                      <tr className="surface-glass">
                        <td className="p-4" colSpan={2} />
                        <td className="px-4 py-3 text-right text-sm font-medium text-card-foreground">
                          Total
                        </td>
                        <td className="px-4 py-3 text-card-foreground font-semibold">
                          {formatAmount(purchaseOrderData?.quote?.total)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                  No items to display for this order.
                </p>
              )}
            </div>
          )}

          {/* {tab === "payment" && (
            <div>
              <h3 className="text-lg font-semibold">Payment Information</h3>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card className="p-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center justify-between rounded-md surface-glass p-3">
                      <div className="text-sm text-card-foreground">Payment Method:</div>
                      <div className="text-sm font-medium text-card-foreground">Invoice</div>
                    </div>
                    <div className="flex items-center justify-between rounded-md surface-glass p-3">
                      <div className="text-sm text-card-foreground">Payment Status:</div>
                      <div className="text-sm font-medium text-card-foreground">Partial</div>
                    </div>
                    <div className="flex items-center justify-between rounded-md surface-glass p-3">
                      <div className="text-sm text-card-foreground">Invoice Number:</div>
                      <div className="text-sm font-medium text-card-foreground">INV-2024-001</div>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center justify-between rounded-md surface-glass p-3">
                      <div className="text-sm text-card-foreground">Due Date:</div>
                      <div className="text-sm font-medium text-card-foreground">12/30/2024</div>
                    </div>
                    <div className="rounded-md surface-glass p-3">
                      <div className="text-sm text-card-foreground">Paid Date:</div>
                      <div className="mt-1 text-sm font-medium text-card-foreground">12/20/2024</div>
                    </div>
                    <div className="flex items-center justify-between rounded-md surface-glass p-3">
                      <div className="text-sm text-card-foreground">Paid Amount:</div>
                      <div className="text-sm font-medium text-card-foreground">$4,530</div>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="mt-4 rounded-lg border border-border/60 surface-glass p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">Payment Actions</div>
                    <div className="text-sm text-muted-foreground mt-1">Outstanding balance: <span className="font-semibold text-emerald-800">$4,530</span></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="accent">Make Payment Now</Button>
                    <Button variant="outline">Open Payment Link</Button>
                    <Button variant="ghost"><Download className="mr-2 h-4 w-4 inline" />Download Invoice</Button>
                  </div>
                </div>
              </div>
            </div>
          )} */}

          {tab === "shipping" && (
            <div>
              <h3 className="text-lg font-semibold">Shipping</h3>
              <div className="mt-4 space-y-4">
                <Card className="p-4">
                  <div className="text-sm font-semibold flex items-center gap-2"><MapPin className="h-4 w-4 text-card-foreground" /> <span className="text-card-foreground">Shipping Address</span></div>
                  <div className="mt-3 rounded-md surface-glass p-3 text-sm text-card-foreground">742 Evergreen Terrace, Springfield, IL 62701</div>
                </Card>

                <Card className="p-4">
                  <div className="text-sm font-semibold text-card-foreground">Tracking Information</div>
                  <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="rounded-md surface-glass p-3 text-sm text-card-foreground">Carrier<br /><span className="font-medium">FedEx</span></div>
                    <div className="rounded-md surface-glass p-3 text-sm text-card-foreground">Estimated Delivery<br /><span className="font-medium">12/18/2024</span></div>
                    <div className="rounded-md surface-glass p-3 text-sm text-card-foreground">Tracking Number<br /><span className="font-medium">TRK1234567890</span></div>
                    <div className="rounded-md surface-glass p-3 text-sm text-card-foreground">Actual Delivery<br /><span className="font-medium text-card-foreground">12/17/2024</span></div>
                  </div>
                </Card>

                <div className="rounded-lg surface-glass p-4">
                  <div className="text-sm font-semibold mb-3 text-card-foreground">Delivery Timeline</div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 rounded-md surface-glass p-3">
                      <CheckCircle className="h-5 w-5 text-emerald-400" />
                      <div>
                        <div className="font-medium text-card-foreground">Delivered</div>
                        <div className="text-sm text-muted-foreground">12/17/2024</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-md surface-glass p-3">
                      <Truck className="h-5 w-5 text-orange-400" />
                      <div>
                        <div className="font-medium text-card-foreground">Shipped</div>
                        <div className="text-sm text-muted-foreground">Dec 15, 2024</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-md surface-glass p-3">
                      <Box className="h-5 w-5 text-sky-400" />
                      <div>
                        <div className="font-medium text-card-foreground">Order Approved</div>
                        <div className="text-sm text-muted-foreground">12/10/2024</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* {tab === "documents" && (
            <div>
              <h3 className="text-lg font-semibold">Documents (4)</h3>
              <div className="mt-4 space-y-3">
                {[{
                  name: "Purchase-Order-PO-2024-001.pdf",
                  tag: "Quote",
                  size: "245 KB",
                  date: "12/10/2024"
                }, {
                  name: "Invoice-INV-2024-001.pdf",
                  tag: "Invoice",
                  size: "178 KB",
                  date: "12/10/2024"
                }, {
                  name: "Payment-Receipt-001.pdf",
                  tag: "Receipt",
                  size: "125 KB",
                  date: "12/20/2024"
                }, {
                  name: "Shipping-Label.pdf",
                  tag: "Shipping Label",
                  size: "89 KB",
                  date: "12/15/2024"
                }].map((doc) => (
                  <div key={doc.name} className="flex items-center justify-between rounded-md border border-border/60 bg-card p-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-md bg-orange-100 p-2"><FileText className="h-5 w-5 text-orange-600" /></div>
                      <div>
                        <div className="font-medium text-card-foreground">{doc.name}</div>
                        <div className="text-sm text-muted-foreground">{doc.tag} • {doc.size} • Uploaded {doc.date}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="ghost"><Download className="h-4 w-4" /></Button>
                      <Button variant="ghost"><ExternalLink className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )} */}
        </Card>
        {/* Admin Comments */}
        {purchaseOrderData?.status === "approved" && <div className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-emerald-700 mt-1" />
            <div className="text-sm text-emerald-800">Approved. All items are in stock and ready for processing. LMS access will be activated upon payment confirmation.</div>
          </div>
        </div>}
      </section>
    </DashboardWithSidebarLayout>
  );
}
