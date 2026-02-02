import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Info, Box, Truck, CheckCircle, MapPin, Download, ExternalLink, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PurchaseOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    document.title = `${id ?? "Purchase Order"} • Purchase Order Details`;
  }, [id]);

  return (
    <DashboardWithSidebarLayout>
      <section className="mx-auto w-full max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground cursor-pointer"  onClick={() => navigate(-1)}>← Back to Purchase Orders</div>
            <h1 className="text-2xl font-extrabold mt-2">{id ?? "Purchase Order"}</h1>
            <div className="text-sm text-muted-foreground">Springfield Elementary School</div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="accent">Pay Invoice</Button>
            <Button variant="ghost">Download</Button>
            <Button variant="ghost">Copy PO</Button>
            <Button variant="outline" onClick={() => navigate(-1)}>Close</Button>
          </div>
        </div>
        {/* Top stats cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Total Amount</div>
            <div className="mt-2 text-2xl font-semibold">$9,060</div>
          </Card>

          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Paid</div>
            <div className="mt-2 text-2xl font-semibold">4,530</div>
          </Card>

          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Balance Due</div>
            <div className="mt-2 text-2xl font-semibold">$4,530</div>
          </Card>

          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Items</div>
            <div className="mt-2 text-2xl font-semibold">3</div>
          </Card>
        </div>

        {/* Info / CTA box */}
        <div className="rounded-lg border border-emerald-200 p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="text-sm font-semibold">Your PO Number is Ready to Use</div>
                <div className="mt-2 text-sm text-white">Your PO Number ({id}) can now be used to access the following services:</div>
                <ul className="mt-3 ml-4 list-disc text-sm text-white">
                  <li>LMS Subscriptions: Use this PO number during checkout for course subscriptions</li>
                  <li>Write to Read: Activate student accounts using this PO number</li>
                  <li>E-commerce: Physical kits will be shipped automatically</li>
                </ul>
                <div className="mt-3 text-sm text-white">IMPORTANT: This PO number is valid only for the exact quantities and items listed in this order. Any changes require a new purchase order.</div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline">Go to LMS Subscriptions</Button>
              <Button variant="accent">Go to Write to Read</Button>
            </div>
          </div>
        </div>

        <Card className="rounded-2xl border border-border/60 p-4">
          <div className="flex gap-3">
            {[
              { key: "overview", label: "Overview" },
              { key: "items", label: "Items" },
              { key: "payment", label: "Payment" },
              { key: "shipping", label: "Shipping" },
              { key: "documents", label: "Documents" },
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
              <p className="mt-2 text-sm text-muted-foreground">Summary and order information for {id}.</p>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-md border border-border/60 p-4">
                  <div className="text-sm font-semibold">Contact Information</div>
                  <div className="mt-3 text-sm text-muted-foreground">Springfield Elementary School<br/>John Smith<br/>john@springfield.edu<br/>(555) 123-4567</div>
                </div>

                <div className="rounded-md border border-border/60 p-4">
                  <div className="text-sm font-semibold">Order Information</div>
                  <div className="mt-3 text-sm text-muted-foreground">PO Number: {id}<br/>Quote ID: QT-2024-001<br/>Created: 12/8/2024<br/>Approved: 12/10/2024</div>
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
                          <div className="text-sm font-medium">$8,250</div>
                        </div>
                        <div className="flex items-center justify-between rounded-md bg-muted p-3">
                          <div className="text-sm text-muted-foreground">Tax (8%):</div>
                          <div className="text-sm font-medium">$660</div>
                        </div>
                        <div className="flex items-center justify-between rounded-md bg-muted p-3">
                          <div className="text-sm text-muted-foreground">Shipping:</div>
                          <div className="text-sm font-medium">$150</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-lg bg-sky-100 py-1 px-3 text-sky-800">
                        <div className="text-sm">Total Amount:</div>
                        <div className="mt-1 text-lg font-semibold">$9,060</div>
                      </div>

                      <div className=" flex items-center justify-between rounded-lg bg-emerald-100 py-1 px-3 text-emerald-800">
                        <div className="text-sm">Paid Amount:</div>
                        <div className="mt-1 text-lg font-semibold">$4,530</div>
                      </div>

                      <div className="flex items-center justify-between rounded-lg bg-orange-100 py-1 px-3 text-orange-800">
                        <div className="text-sm">Balance Due:</div>
                        <div className="mt-1 text-lg font-semibold">$4,530</div>
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
                    <tr>
                      <td className="px-4 py-3">LMS Course Subscription - Monthly</td>
                      <td className="px-4 py-3">25</td>
                      <td className="px-4 py-3">$50</td>
                      <td className="px-4 py-3">$1,250</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">Science Enrichment Kit</td>
                      <td className="px-4 py-3">30</td>
                      <td className="px-4 py-3">$150</td>
                      <td className="px-4 py-3">$4,500</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">Write to Read Package</td>
                      <td className="px-4 py-3">20</td>
                      <td className="px-4 py-3">$80</td>
                      <td className="px-4 py-3">$1,600</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="surface-glass">
                      <td className="p-4" />
                      <td />
                      <td className="px-4 py-3 text-right text-sm font-medium text-card-foreground">Subtotal</td>
                      <td className="px-4 py-3 text-card-foreground font-semibold">$7,350</td>
                    </tr>
                    <tr className="surface-glass">
                      <td className="p-4" />
                      <td />
                      <td className="px-4 py-3 text-right text-sm text-card-foreground">Tax</td>
                      <td className="px-4 py-3 text-card-foreground">$588</td>
                    </tr>
                    <tr className="surface-glass">
                      <td className="p-4" />
                      <td />
                      <td className="px-4 py-3 text-right text-sm text-card-foreground">Shipping</td>
                      <td className="px-4 py-3 text-card-foreground">$150</td>
                    </tr>
                    <tr className="surface-glass">
                      <td className="p-4" />
                      <td />
                      <td className="px-4 py-3 text-right text-sm font-medium text-card-foreground">Total</td>
                      <td className="px-4 py-3 text-card-foreground font-semibold">$8,088</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {tab === "payment" && (
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
          )}

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
                    <div className="rounded-md surface-glass p-3 text-sm text-card-foreground">Carrier<br/><span className="font-medium">FedEx</span></div>
                    <div className="rounded-md surface-glass p-3 text-sm text-card-foreground">Estimated Delivery<br/><span className="font-medium">12/18/2024</span></div>
                    <div className="rounded-md surface-glass p-3 text-sm text-card-foreground">Tracking Number<br/><span className="font-medium">TRK1234567890</span></div>
                    <div className="rounded-md surface-glass p-3 text-sm text-card-foreground">Actual Delivery<br/><span className="font-medium text-card-foreground">12/17/2024</span></div>
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

          {tab === "documents" && (
            <div>
              <h3 className="text-lg font-semibold">Documents (4)</h3>
              <div className="mt-4 space-y-3">
                {[{
                  name: "Purchase-Order-PO-2024-001.pdf",
                  tag: "Quote",
                  size: "245 KB",
                  date: "12/10/2024"
                },{
                  name: "Invoice-INV-2024-001.pdf",
                  tag: "Invoice",
                  size: "178 KB",
                  date: "12/10/2024"
                },{
                  name: "Payment-Receipt-001.pdf",
                  tag: "Receipt",
                  size: "125 KB",
                  date: "12/20/2024"
                },{
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
          )}
        </Card>
        {/* Admin Comments */}
        <div className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-emerald-700 mt-1" />
            <div className="text-sm text-emerald-800">Approved. All items are in stock and ready for processing. LMS access will be activated upon payment confirmation.</div>
          </div>
        </div>
      </section>
    </DashboardWithSidebarLayout>
  );
}
