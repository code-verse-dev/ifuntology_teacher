import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RequestQuotation() {
  useEffect(() => {
    document.title = "Request Quotation • iFuntology Teacher";
  }, []);

  const navigate = useNavigate();
  const [serviceType, setServiceType] = useState<string>("LMS");

  // LMS fields
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [kits, setKits] = useState<number>(0);
  const [students, setStudents] = useState<number>(0);
  const [webSubs, setWebSubs] = useState<number>(0);

  // Write to Read fields
  const [bookPrinting, setBookPrinting] = useState<string>("Yes");
  const [subscriptions, setSubscriptions] = useState<number>(0);
  const [batchStudents, setBatchStudents] = useState<number>(0);

  // Enrichment store fields
  const [productCategory, setProductCategory] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(0);
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [country, setCountry] = useState("");
  const [zip, setZip] = useState("");
  const [coupon, setCoupon] = useState("");

  // price calc (very simple placeholder)
  const subtotal = (() => {
    if (serviceType === "LMS") return kits * 49.99 + webSubs * 9.99;
    if (serviceType === "WRITE") return subscriptions * 29.99 * batchStudents;
    if (serviceType === "STORE") return quantity * 50;
    return 0;
  })();
  const tax = +(subtotal * 0.08).toFixed(2);
  const total = +(subtotal + tax).toFixed(2);
  const [submitOpen, setSubmitOpen] = useState(false);

  return (
    <DashboardWithSidebarLayout>
      <section className="mx-auto w-full max-w-6xl space-y-6">
        <h1 className="text-2xl font-extrabold">Request Quotation</h1>

        <Card className="rounded-2xl border border-border/60 p-6">
          {/* Increase field area: use 3-column grid on md and let the form span 2 columns */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <div className="mb-3">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Service Type *</label>
                <select className="w-full rounded-md border border-border/60 bg-background p-2 text-sm" value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
                  <option value="LMS">Learning Management System</option>
                  <option value="WRITE">Write to Read</option>
                  <option value="STORE">Enrichment Store Products</option>
                </select>
              </div>

              {/* Conditional fields */}
              {serviceType === "LMS" && (
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Organization Name *</label>
                    <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Enter Name" />
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Email *</label>
                      <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter Email" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Address *</label>
                      <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter Address" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Number of kits *</label>
                      <input type="number" className="w-full rounded-md border border-border/60 bg-background p-2 text-sm" value={kits} onChange={(e) => setKits(Number(e.target.value))} min={0} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Number of Students *</label>
                      <input type="number" className="w-full rounded-md border border-border/60 bg-background p-2 text-sm" value={students} onChange={(e) => setStudents(Number(e.target.value))} min={0} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Web Subscriptions *</label>
                      <input type="number" className="w-full rounded-md border border-border/60 bg-background p-2 text-sm" value={webSubs} onChange={(e) => setWebSubs(Number(e.target.value))} min={0} />
                    </div>
                  </div>
                </div>
              )}

              {serviceType === "WRITE" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Organization Name *</label>
                      <Input placeholder="Enter Name" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Book Printing Requests *</label>
                      <select className="w-full rounded-md border border-border/60 bg-background p-2 text-sm" value={bookPrinting} onChange={(e) => setBookPrinting(e.target.value)}>
                        <option>Yes</option>
                        <option>No</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Number of Subscriptions *</label>
                      <input type="number" className="w-full rounded-md border border-border/60 bg-background p-2 text-sm" value={subscriptions} onChange={(e) => setSubscriptions(Number(e.target.value))} min={0} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Number of Students in Batch *</label>
                      <input type="number" className="w-full rounded-md border border-border/60 bg-background p-2 text-sm" value={batchStudents} onChange={(e) => setBatchStudents(Number(e.target.value))} min={0} />
                    </div>
                  </div>
                </div>
              )}

              {serviceType === "STORE" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Product Category *</label>
                      <select className="w-full rounded-md border border-border/60 bg-background p-2 text-sm" value={productCategory} onChange={(e) => setProductCategory(e.target.value)}>
                        <option value="">Category</option>
                        <option>Product 1</option>
                        <option>Product 2</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Quantity *</label>
                      <input type="number" className="w-full rounded-md border border-border/60 bg-background p-2 text-sm" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} min={0} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">City *</label>
                      <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Enter City" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">State *</label>
                      <Input value={stateVal} onChange={(e) => setStateVal(e.target.value)} placeholder="Enter State" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Country *</label>
                      <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Enter Country" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Zip Code *</label>
                      <Input value={zip} onChange={(e) => setZip(e.target.value)} placeholder="Enter Zip Code" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Coupon / Discount Code (optional)</label>
                      <Input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Enter Coupon / Discount Code" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right column intentionally left minimal — payment should be below per request */}
            <div />
          </div>

          {/* Payment block below fields */}
          <div className="mt-6 rounded-md border border-border/60 bg-card/30 p-4">
            <div className="text-sm font-semibold">Live Price Calculator</div>
            <div className="mt-2 text-sm text-muted-foreground">Subtotal: ${subtotal.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground mt-1">Tax (8%): ${tax.toFixed(2)}</div>
            <div className="mt-3 text-lg font-semibold">Estimated Total: ${total.toFixed(2)}</div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            <Button
              variant="brand"
              onClick={() => {
                // show confirmation modal on submit
                setSubmitOpen(true);
              }}
            >
              Submit & Download
            </Button>
          </div>
        </Card>

        {/* Submission confirmation dialog */}
        <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
          <DialogContent>
            <div className="mx-auto w-[420px]">
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-green-500/10 p-4">
                  <Check className="h-8 w-8 text-green-500" />
                </div>
                <DialogTitle>System Alert</DialogTitle>
                <DialogDescription>Your quote request has been submitted!</DialogDescription>

                <div className="w-full text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 py-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                    <div className="text-sm">Status</div>
                    <div className="ml-2 text-amber-600 font-medium">Pending</div>
                  </div>
                  <div className="mt-2 text-sm text-red-600">You will be notified once the admin reviews it.</div>
                </div>

                <div className="w-full">
                  <Button
                    className="w-full"
                    onClick={() => {
                      setSubmitOpen(false);
                      navigate("/quotes");
                    }}
                  >
                    Download Quote
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </section>
    </DashboardWithSidebarLayout>
  );
}
